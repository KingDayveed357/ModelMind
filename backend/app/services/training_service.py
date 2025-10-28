# app/services/training_service.py
import numpy as np
import pandas as pd
import joblib, os, io, time, tempfile
from datetime import datetime
from typing import Dict, Any, Optional, List

from sklearn.utils.validation import check_is_fitted
from sklearn.exceptions import NotFittedError

from sklearn.exceptions import UndefinedMetricWarning
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import PolynomialFeatures, LabelEncoder
from sklearn.metrics import r2_score, mean_squared_error, mean_absolute_error

from app.db.supabase_client import supabase
from app.services.data_preprocessing import preprocess_dataset, DataPreprocessingError
from app.core.model_registry import get_model
from app.core.model_selector import AutoModelSelector
import warnings
warnings.filterwarnings("ignore", category=UserWarning)
warnings.filterwarnings("ignore", category=RuntimeWarning)
warnings.filterwarnings("ignore", category=UndefinedMetricWarning)


class ModelTrainingError(Exception):
    pass


class ModelTrainer:
    """Encapsulates model initialization, training, and metrics computation."""

    def __init__(self, model=None, model_type=None, problem_type=None):
        self.model = model
        self.model_type = model_type
        self.problem_type = problem_type
        self.label_encoder = None

    def initialize_model(
            self,
            model_type: str,
            problem_type: str,
            use_polynomial: bool = False,
            polynomial_degree: int = 2,
            model_params: Optional[Dict[str, Any]] = None
    ):
        """Initializes model from registry with optional polynomial features."""
        self.model_type = model_type
        self.problem_type = problem_type

        ModelClass = get_model(problem_type, model_type)
        params = model_params or self._get_default_params(model_type)
        base_model = ModelClass(**params)

        if use_polynomial and problem_type == "regression":
            self.model = Pipeline([
                ('poly', PolynomialFeatures(degree=polynomial_degree, include_bias=False)),
                ('model', base_model)
            ])
        else:
            self.model = base_model

        return self.model

    def _get_default_params(self, model_type: str):
        """Default hyperparameters for common models."""
        defaults = {
            "random_forest": {"n_estimators": 100, "max_depth": 10, "random_state": 42, "n_jobs": -1},
            "ridge": {"alpha": 1.0, "random_state": 42},
            "lasso": {"alpha": 1.0, "random_state": 42},
            "svr": {"kernel": "rbf", "C": 1.0},
            "svc": {"kernel": "rbf", "C": 1.0, "probability": True, "random_state": 42},
            "logistic_regression": {"max_iter": 1000, "random_state": 42},
            "gradient_boosting": {"n_estimators": 100, "random_state": 42},
            "decision_tree": {"max_depth": 10, "random_state": 42},
            "knn": {"n_neighbors": 5},
        }
        return defaults.get(model_type, {})

    def _infer_problem_type(self, y):
        """Automatically detect if target is classification or regression."""
        y_array = np.asarray(y).ravel()
        n_unique = len(np.unique(y_array))
        n_samples = len(y_array)

        # Check if target is numeric
        try:
            y_numeric = pd.to_numeric(y_array, errors='coerce')
            has_floats = not np.allclose(y_numeric, y_numeric.astype(int), equal_nan=True)
        except:
            has_floats = False

        # Classification if:
        # - Less than 20 unique values AND less than 5% of total samples
        # - OR dtype is object/string
        # - AND no continuous float values
        if y_array.dtype == object or y_array.dtype.name.startswith('str'):
            return "classification"
        elif n_unique < 20 and n_unique < (0.05 * n_samples) and not has_floats:
            return "classification"
        else:
            return "regression"

    def _encode_labels(self, y_train, y_test):
        """Encode classification labels to integers starting from 0."""
        self.label_encoder = LabelEncoder()

        # Convert to numpy arrays first
        y_train = np.asarray(y_train).ravel()
        y_test = np.asarray(y_test).ravel()

        y_train_encoded = self.label_encoder.fit_transform(y_train)
        y_test_encoded = self.label_encoder.transform(y_test)

        return y_train_encoded, y_test_encoded

    def train(self, X_train, y_train, X_test, y_test):
        """Fits model and returns metrics + training details."""
        if self.model is None:
            raise ModelTrainingError("Model not initialized")

        # Handle labels based on problem type
        if self.problem_type == "classification":
            # Verify this is actually a classification problem
            detected_type = self._infer_problem_type(y_train)
            if detected_type == "regression":
                raise ModelTrainingError(
                    f"Classification model selected but target appears to be continuous. "
                    f"Found {len(np.unique(y_train))} unique values. "
                    f"Sample values: {np.unique(y_train)[:10]}. "
                    f"Please use regression models or verify your target column."
                )

            # Encode labels for classification
            y_train_processed, y_test_processed = self._encode_labels(y_train, y_test)

            print(f"Original labels - train: {np.unique(y_train)[:10]}, test: {np.unique(y_test)[:10]}")
            print(f"Encoded labels - train: {np.unique(y_train_processed)}, test: {np.unique(y_test_processed)}")
            print(f"Number of classes: {len(self.label_encoder.classes_)}")
        else:
            # For regression, convert to float
            y_train_processed = pd.Series(y_train).astype(float).to_numpy()
            y_test_processed = pd.Series(y_test).astype(float).to_numpy()

        print("X_train shape:", X_train.shape)
        print("y_train shape:", y_train_processed.shape)

        # Train model
        try:
            start = time.time()
            self.model.fit(X_train, y_train_processed)
            train_time = time.time() - start
        except Exception as e:
            raise ModelTrainingError(f"Model fitting failed: {str(e)}")

        # Make predictions
        try:
            y_pred = self.model.predict(X_test)
        except Exception as e:
            raise ModelTrainingError(f"Prediction failed: {str(e)}")

        # Calculate metrics
        try:
            metrics = (
                self._regression_metrics(y_test_processed, y_pred)
                if self.problem_type == "regression"
                else self._classification_metrics(y_test_processed, y_pred)
            )
        except Exception as e:
            raise ModelTrainingError(f"Metric calculation failed: {str(e)}")

        return {
            "training_time": train_time,
            "metrics": metrics,
            "predictions": y_pred.tolist()[:100],
            "label_mapping": (
                {str(label): int(idx) for idx, label in enumerate(self.label_encoder.classes_)}
                if self.label_encoder else None
            ),
            **self._extract_model_details()
        }

    def _regression_metrics(self, y_true, y_pred):
        return {
            "r2_score": float(r2_score(y_true, y_pred)),
            "mse": float(mean_squared_error(y_true, y_pred)),
            "mae": float(mean_absolute_error(y_true, y_pred)),
            "rmse": float(np.sqrt(mean_squared_error(y_true, y_pred))),
        }

    def _classification_metrics(self, y_true, y_pred):
        from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score

        # Ensure arrays are 1D numpy arrays with integer dtype
        y_true = np.asarray(y_true).ravel().astype(int)
        y_pred = np.asarray(y_pred).ravel().astype(int)

        # Get unique classes
        unique_classes = np.unique(y_true)
        n_classes = len(unique_classes)

        print(f"Computing metrics for {n_classes} classes: {unique_classes}")

        # Calculate accuracy (always works)
        accuracy = float(accuracy_score(y_true, y_pred))

        # Handle edge cases
        if n_classes == 1:
            return {
                "accuracy": accuracy,
                "precision": 1.0,
                "recall": 1.0,
                "f1_score": 1.0,
            }

        # Determine averaging method
        average = "binary" if n_classes == 2 else "weighted"

        try:
            precision = float(precision_score(y_true, y_pred, average=average, zero_division=0))
            recall = float(recall_score(y_true, y_pred, average=average, zero_division=0))
            f1 = float(f1_score(y_true, y_pred, average=average, zero_division=0))

            return {
                "accuracy": accuracy,
                "precision": precision,
                "recall": recall,
                "f1_score": f1,
            }
        except Exception as e:
            print(f"Metric calculation warning: {e}")
            return {
                "accuracy": accuracy,
                "precision": accuracy,
                "recall": accuracy,
                "f1_score": accuracy,
            }

    def _extract_model_details(self):
        """Extracts coefficients or feature importances."""
        from sklearn.pipeline import Pipeline

        details = {}
        model = self.model.named_steps["model"] if isinstance(self.model, Pipeline) else self.model

        try:
            check_is_fitted(model)
        except NotFittedError:
            print("Warning: Model not fitted yet, skipping detail extraction.")
            return details
        except AttributeError as e:
            print(f"Warning: Model missing fitted attributes ({e}), skipping detail extraction.")
            return details

        if hasattr(model, "coef_"):
            details["coefficients"] = model.coef_.ravel().tolist()[:100]
        if hasattr(model, "intercept_"):
            details["intercept"] = float(np.ravel(model.intercept_)[0])
        if hasattr(model, "feature_importances_"):
            details["feature_importances"] = model.feature_importances_.tolist()[:100]

        return details


    def save_model(self, path, preprocessor=None):
        bundle = {
            "model": self.model,
            "preprocessor": preprocessor,
            "label_encoder": self.label_encoder,
            "model_type": self.model_type,
            "problem_type": self.problem_type,
        }
        joblib.dump(bundle, path)


# ---------------- Main training service ----------------
# app/services/training_service.py

async def train_model(
        dataset_id: str,
        user_id: str,
        target_col: str,
        model_type: str = "auto",
        problem_type: str = "auto",
        test_size: float = 0.2,
        use_polynomial: bool = False,
        polynomial_degree: int = 2,
        use_target_encoder: bool = False,
        model_params: Optional[Dict[str, Any]] = None
):
    """End-to-end training service."""
    try:
        print(f"[Training] Starting training for dataset {dataset_id}")

        # Step 1: preprocess data
        print("[Training] Step 1/4: Preprocessing data...")
        preprocess_result = await preprocess_dataset(
            dataset_id=dataset_id,
            user_id=user_id,
            target_col=target_col,
            test_size=test_size,
            use_target_encoder=use_target_encoder
        )

        X_train, X_test = preprocess_result["X_train"], preprocess_result["X_test"]
        y_train, y_test = preprocess_result["y_train"], preprocess_result["y_test"]
        preprocessor = preprocess_result["preprocessor"]
        metadata = preprocess_result["preprocessing_result"]["metadata"]

        # Create trainer instance for problem type detection
        temp_trainer = ModelTrainer()

        # Determine problem type
        if problem_type == "auto":
            detected_type = temp_trainer._infer_problem_type(y_train)
            problem_type = detected_type
            print(f"[Training] Auto-detected problem type: {problem_type}")
            print(f"[Training] Target has {len(np.unique(y_train))} unique values")
            print(f"[Training] Sample target values: {np.unique(y_train)[:10]}")
        else:
            detected_type = temp_trainer._infer_problem_type(y_train)
            if detected_type != problem_type:
                print(f"[Training] WARNING: Specified '{problem_type}' but data suggests '{detected_type}'")
                print(f"[Training] Target has {len(np.unique(y_train))} unique values")
                print(f"[Training] Proceeding with user-specified: {problem_type}")

        # Initialize trainer with problem type
        trainer = ModelTrainer(problem_type=problem_type)

        # Step 2: Model selection or initialization
        print("[Training] Step 2/4: Initializing model...")

        if model_type == "auto":
            # import time
            start_time = time.time()

            # Encode labels BEFORE passing to AutoML
            if problem_type == "classification":
                label_encoder = LabelEncoder()
                y_train_encoded = label_encoder.fit_transform(np.asarray(y_train).ravel())
                y_test_encoded = label_encoder.transform(np.asarray(y_test).ravel())
                trainer.label_encoder = label_encoder
            else:
                y_train_encoded = pd.Series(y_train).astype(float).to_numpy()
                y_test_encoded = pd.Series(y_test).astype(float).to_numpy()

            # Use correct FLAML task name
            flaml_task = "classification" if problem_type == "classification" else "regression"
            selector = AutoModelSelector(
                task=flaml_task,
                time_budget=60,
                n_jobs=-1,
                estimator_list=["lgbm", "xgboost", "rf"],
                metric="r2" if flaml_task == "regression" else "accuracy",
                verbose=1
            )
            best_model, info = selector.select_best_model(X_train, y_train_encoded)

            # CRITICAL: Set the FITTED model to trainer
            trainer.model = best_model
            trainer.model_type = info["best_model"]

            training_time = time.time() - start_time
            print(f"[Training] AutoML selected: {trainer.model_type} in {training_time:.2f}s")

            # Evaluate the trained model
            try:
                y_pred = best_model.predict(X_test)

                if problem_type == "classification":
                    metrics = trainer._classification_metrics(y_test_encoded, y_pred)
                else:
                    metrics = trainer._regression_metrics(y_test_encoded, y_pred)

                # NOW extract model details AFTER model is confirmed fitted
                model_details = trainer._extract_model_details()

                results = {
                    "training_time": training_time,
                    "metrics": metrics,
                    "predictions": y_pred.tolist()[:100],
                    "label_mapping": (
                        {str(label): int(idx) for idx, label in enumerate(trainer.label_encoder.classes_)}
                        if trainer.label_encoder else None
                    ),
                    **model_details  # Add model details here
                }
            except Exception as e:
                raise ModelTrainingError(f"AutoML model evaluation failed: {str(e)}")
        else:
            # Manual model selection
            trainer.initialize_model(
                model_type=model_type,
                problem_type=problem_type,
                use_polynomial=use_polynomial,
                polynomial_degree=polynomial_degree,
                model_params=model_params,
            )

            print("[Training] Step 3/4: Training model...")
            results = trainer.train(X_train, y_train, X_test, y_test)

        # Step 4: save model
        print("[Training] Step 4/4: Saving model...")
        tmp_path = os.path.join(tempfile.gettempdir(), f"model_{dataset_id}.pkl")
        trainer.save_model(tmp_path, preprocessor)

        with open(tmp_path, "rb") as f:
            model_bytes = f.read()

        filename = f"{user_id}/models/model_{dataset_id}_{int(time.time())}.pkl"
        supabase.storage.from_("models").upload(filename, model_bytes, {"upsert": "true"})
        model_url = supabase.storage.from_("models").get_public_url(filename)

        # Store metadata
        db_data = {
            "user_id": user_id,
            "dataset_id": dataset_id,
            "model_type": trainer.model_type,
            "problem_type": problem_type,
            "model_url": model_url,
            "target_column": target_col,
            "metrics": results["metrics"],
            "training_time": results["training_time"],
            "created_at": datetime.utcnow().isoformat(),
        }

        db_res = supabase.table("models").insert(db_data).execute()
        model_id = db_res.data[0]["id"]

        print(f"[Training] Complete! Model ID: {model_id}")

        return {
            "id": model_id,
            "message": "Model trained successfully",
            **results,
            "preprocessing_metadata": metadata
        }

    except DataPreprocessingError as e:
        raise ModelTrainingError(f"Preprocessing failed: {str(e)}")
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise ModelTrainingError(f"Training failed: {str(e)}")

async def analyze_target_column(
            dataset_id: str,
            user_id: str,
            target_col: str
    ) -> Dict[str, Any]:
        """
        Analyze target column and provide recommendations.
        Returns problem type suggestion, warnings, and statistics.
        """
        try:
            # Fetch dataset
            dataset = supabase.table("datasets").select("*").eq("id", dataset_id).execute()
            if not dataset.data:
                raise ValueError("Dataset not found")

            # Download and load CSV
            file_url = dataset.data[0]["file_url"]
            response = supabase.storage.from_("datasets").download(file_url.split("/datasets/")[-1])
            df = pd.read_csv(io.BytesIO(response))

            if target_col not in df.columns:
                raise ValueError(f"Target column '{target_col}' not found in dataset")

            y = df[target_col].dropna()

            # Detect problem type
            trainer = ModelTrainer()
            detected_type = trainer._infer_problem_type(y)

            # Gather statistics
            n_unique = len(np.unique(y))
            n_samples = len(y)
            unique_ratio = n_unique / n_samples

            # Check for continuous values
            try:
                y_numeric = pd.to_numeric(y, errors='coerce')
                has_floats = not np.allclose(y_numeric, y_numeric.astype(int), equal_nan=True)
                is_numeric = y.dtype in ['int64', 'float64'] or not y_numeric.isna().all()
            except:
                has_floats = False
                is_numeric = False

            # Get sample values
            sample_values = np.unique(y)[:10].tolist()

            # Generate warnings
            warnings = []
            if detected_type == "regression" and n_unique < 10:
                warnings.append({
                    "type": "info",
                    "message": f"Only {n_unique} unique values detected. Consider using classification if these are discrete categories."
                })

            if detected_type == "classification" and n_unique > 50:
                warnings.append({
                    "type": "warning",
                    "message": f"High number of classes ({n_unique}). Classification might be challenging. Consider regression or grouping categories."
                })

            if detected_type == "regression" and not is_numeric:
                warnings.append({
                    "type": "error",
                    "message": "Target contains non-numeric values. Please use classification or clean your data."
                })

            if has_floats and detected_type == "classification":
                warnings.append({
                    "type": "warning",
                    "message": "Target contains continuous float values. Regression is recommended."
                })

            return {
                "target_column": target_col,
                "recommended_problem_type": detected_type,
                "statistics": {
                    "n_samples": int(n_samples),
                    "n_unique": int(n_unique),
                    "unique_ratio": float(unique_ratio),
                    "is_numeric": bool(is_numeric),
                    "has_floats": bool(has_floats),
                    "dtype": str(y.dtype),
                    "sample_values": sample_values,
                },
                "warnings": warnings,
                "recommendations": {
                    "regression": detected_type == "regression",
                    "classification": detected_type == "classification",
                    "message": (
                        f"Based on {n_unique} unique values in {n_samples} samples, "
                        f"{detected_type} is recommended."
                    )
                }
            }

        except Exception as e:
            raise ValueError(f"Failed to analyze target column: {str(e)}")