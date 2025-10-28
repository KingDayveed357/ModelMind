# app/services/predict_service.py
import joblib
import numpy as np
import pandas as pd
from typing import Dict, Any, List, Union
from datetime import datetime
import io
from app.db.supabase_client import supabase


class PredictionError(Exception):
    """Custom exception for prediction errors"""
    pass


class ModelStore:
    """Handles model loading and caching"""

    def __init__(self):
        self._cache = {}
        self._cache_limit = 10  # Maximum models to keep in memory

    def load_model(self, model_url: str, model_id: int) -> Dict[str, Any]:
        """
        Load model from storage with caching

        Args:
            model_url: URL of model in storage
            model_id: Model identifier for caching

        Returns:
            Dict containing model, preprocessor, and metadata
        """
        # Check cache first
        if model_id in self._cache:
            return self._cache[model_id]

        try:
            # Extract file path from URL
            file_path = model_url.split('/')[-2:]
            file_path = '/'.join(file_path)

            # Download from Supabase storage
            model_bytes = supabase.storage.from_('models').download(file_path)

            # Load model bundle
            model_bundle = joblib.load(io.BytesIO(model_bytes))

            # Cache the model
            self._cache[model_id] = model_bundle

            # Implement simple LRU cache by removing oldest if limit exceeded
            if len(self._cache) > self._cache_limit:
                oldest_key = next(iter(self._cache))
                del self._cache[oldest_key]

            return model_bundle

        except Exception as e:
            raise PredictionError(f"Failed to load model: {str(e)}")

    def clear_cache(self):
        """Clear all cached models"""
        self._cache.clear()

    def remove_from_cache(self, model_id: int):
        """Remove specific model from cache"""
        if model_id in self._cache:
            del self._cache[model_id]


# Global model store instance
model_store = ModelStore()


class PredictionService:
    """Handles predictions with preprocessing"""

    def __init__(self, model_bundle: Dict[str, Any]):
        self.model = model_bundle.get('model')
        self.preprocessor = model_bundle.get('preprocessor')
        self.model_type = model_bundle.get('model_type')
        self.problem_type = model_bundle.get('problem_type')

        if self.model is None:
            raise PredictionError("Model not found in bundle")

    def predict(
            self,
            input_data: Union[pd.DataFrame, Dict[str, Any], List[Dict[str, Any]]],
            return_probabilities: bool = False
    ) -> Dict[str, Any]:
        """
        Make predictions on input data

        Args:
            input_data: Input features (DataFrame, dict, or list of dicts)
            return_probabilities: Return class probabilities for classification

        Returns:
            Dict containing predictions and metadata
        """
        try:
            # Convert input to DataFrame
            if isinstance(input_data, dict):
                df = pd.DataFrame([input_data])
            elif isinstance(input_data, list):
                df = pd.DataFrame(input_data)
            elif isinstance(input_data, pd.DataFrame):
                df = input_data.copy()
            else:
                raise PredictionError("Invalid input format. Expected DataFrame, dict, or list of dicts")

            # Preprocess input
            if self.preprocessor is not None:
                X_processed = self.preprocessor.transform(df)
            else:
                X_processed = df.values

            # Make predictions
            predictions = self.model.predict(X_processed)

            # Get probabilities for classification
            probabilities = None
            if self.problem_type == "classification" and return_probabilities:
                if hasattr(self.model, 'predict_proba'):
                    probabilities = self.model.predict_proba(X_processed)
                elif hasattr(self.model, 'decision_function'):
                    # For SVM without probability=True
                    probabilities = self.model.decision_function(X_processed)

            # Format results
            result = {
                "predictions": predictions.tolist(),
                "n_samples": len(predictions),
                "model_type": self.model_type,
                "problem_type": self.problem_type
            }

            if probabilities is not None:
                result["probabilities"] = probabilities.tolist()

                # Add predicted classes with confidence
                if self.problem_type == "classification":
                    result["predictions_with_confidence"] = [
                        {
                            "prediction": int(pred) if isinstance(pred, (np.integer, int)) else pred,
                            "confidence": float(max(probs)),
                            "all_probabilities": dict(enumerate(probs.tolist()))
                        }
                        for pred, probs in zip(predictions, probabilities)
                    ]

            return result

        except Exception as e:
            raise PredictionError(f"Prediction failed: {str(e)}")

    def batch_predict(
            self,
            input_data: pd.DataFrame,
            batch_size: int = 1000,
            return_probabilities: bool = False
    ) -> Dict[str, Any]:
        """
        Make predictions in batches for large datasets

        Args:
            input_data: Input DataFrame
            batch_size: Number of samples per batch
            return_probabilities: Return probabilities for classification

        Returns:
            Dict containing all predictions
        """
        try:
            all_predictions = []
            all_probabilities = [] if return_probabilities else None

            n_samples = len(input_data)
            n_batches = (n_samples + batch_size - 1) // batch_size

            for i in range(n_batches):
                start_idx = i * batch_size
                end_idx = min((i + 1) * batch_size, n_samples)
                batch_df = input_data.iloc[start_idx:end_idx]

                # Process batch
                result = self.predict(batch_df, return_probabilities=return_probabilities)
                all_predictions.extend(result['predictions'])

                if return_probabilities and 'probabilities' in result:
                    all_probabilities.extend(result['probabilities'])

            result = {
                "predictions": all_predictions,
                "n_samples": n_samples,
                "n_batches": n_batches,
                "model_type": self.model_type,
                "problem_type": self.problem_type
            }

            if all_probabilities:
                result["probabilities"] = all_probabilities

            return result

        except Exception as e:
            raise PredictionError(f"Batch prediction failed: {str(e)}")


async def predict(
        model_id: int,
        user_id: str,
        input_data: Union[pd.DataFrame, Dict[str, Any], List[Dict[str, Any]]],
        return_probabilities: bool = False,
        save_predictions: bool = True
) -> Dict[str, Any]:
    """
    Main service function for making predictions

    Args:
        model_id: ID of model to use
        user_id: User identifier
        input_data: Input features for prediction
        return_probabilities: Return class probabilities
        save_predictions: Save predictions to database

    Returns:
        Dict containing predictions and metadata
    """
    try:
        # Fetch model metadata
        model_info = supabase.table('models').select("*").eq("id", model_id).eq("user_id", user_id).execute()

        if not model_info.data:
            raise PredictionError("Model not found or access denied")

        model_data = model_info.data[0]

        # Check model status
        if model_data.get('status') not in ['trained', 'evaluated']:
            raise PredictionError(f"Model not ready for predictions. Status: {model_data.get('status')}")

        # Load model
        model_bundle = model_store.load_model(model_data['model_url'], model_id)

        # Initialize prediction service
        predictor = PredictionService(model_bundle)

        # Make predictions
        result = predictor.predict(input_data, return_probabilities=return_probabilities)

        # Save predictions if requested
        if save_predictions:
            prediction_data = {
                "model_id": model_id,
                "user_id": user_id,
                "predictions": result['predictions'],
                "n_samples": result['n_samples'],
                "predicted_at": datetime.utcnow().isoformat()
            }

            if 'probabilities' in result:
                prediction_data['probabilities'] = result['probabilities']

            supabase.table("predictions").insert(prediction_data).execute()

            # Update model last_used timestamp
            supabase.table("models").update({
                "last_used_at": datetime.utcnow().isoformat()
            }).eq("id", model_id).execute()

        return {
            "message": "Predictions generated successfully",
            "model_id": model_id,
            "model_type": model_data.get('model_type'),
            **result
        }

    except Exception as e:
        raise PredictionError(f"Prediction service failed: {str(e)}")


async def predict_from_file(
        model_id: int,
        user_id: str,
        file,
        return_probabilities: bool = False,
        batch_size: int = 1000
) -> Dict[str, Any]:
    """
    Make predictions on uploaded CSV file

    Args:
        model_id: ID of model to use
        user_id: User identifier
        file: Uploaded CSV file
        return_probabilities: Return class probabilities
        batch_size: Batch size for processing

    Returns:
        Dict containing predictions
    """
    try:
        # Read CSV file
        content = file.read()
        df = pd.read_csv(io.BytesIO(content))

        if df.empty:
            raise PredictionError("Uploaded file is empty")

        # Fetch model metadata
        model_info = supabase.table('models').select("*").eq("id", model_id).eq("user_id", user_id).execute()

        if not model_info.data:
            raise PredictionError("Model not found or access denied")

        model_data = model_info.data[0]

        # Remove target column if present
        target_col = model_data.get('target_column')
        if target_col and target_col in df.columns:
            df = df.drop(columns=[target_col])

        # Load model
        model_bundle = model_store.load_model(model_data['model_url'], model_id)

        # Initialize prediction service
        predictor = PredictionService(model_bundle)

        # Make batch predictions
        result = predictor.batch_predict(df, batch_size=batch_size, return_probabilities=return_probabilities)

        # Save summary to database
        prediction_data = {
            "model_id": model_id,
            "user_id": user_id,
            "n_samples": result['n_samples'],
            "predicted_at": datetime.utcnow().isoformat(),
            "source_file": file.filename
        }

        supabase.table("predictions").insert(prediction_data).execute()

        return {
            "message": "Batch predictions completed successfully",
            "model_id": model_id,
            "source_file": file.filename,
            **result
        }

    except Exception as e:
        raise PredictionError(f"File prediction failed: {str(e)}")


async def get_prediction_history(
        model_id: int,
        user_id: str,
        limit: int = 50
) -> List[Dict[str, Any]]:
    """Get prediction history for a model"""
    try:
        res = supabase.table('predictions').select("*").eq("model_id", model_id).eq("user_id", user_id).order(
            'predicted_at', desc=True).limit(limit).execute()
        return res.data
    except Exception as e:
        raise PredictionError(f"Failed to fetch prediction history: {str(e)}")