# app/services/training_service.py
import numpy as np
import pandas as pd
import joblib, os, io, time, tempfile, json
from datetime import datetime
from typing import Dict, Any, Optional, List

from sklearn.utils.validation import check_is_fitted
from sklearn.exceptions import NotFittedError
from sklearn.exceptions import UndefinedMetricWarning
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import PolynomialFeatures
from sklearn.metrics import r2_score, mean_squared_error, mean_absolute_error

from app.db.supabase_client import supabase
from app.services.data_preprocessing import preprocess_dataset, DataPreprocessingError
from app.core.model_registry import get_model
from app.core.model_selector import AutoModelSelector
from app.utils.safe_label_encoding import SafeLabelEncoder, safe_encode_labels, validate_label_distribution
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
        self.label_encoder = None  # Will be SafeLabelEncoder for classification
        self.y_test_actual = None
        self.y_test_predicted = None
        self.feature_names = None
        self.label_encoding_stats = None  # Store encoding statistics

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
        n_unique = len(np.unique(y_array[~pd.isna(y_array)]))
        n_samples = len(y_array)

        try:
            y_numeric = pd.to_numeric(y_array, errors='coerce')
            has_floats = not np.allclose(y_numeric[~np.isnan(y_numeric)],
                                         y_numeric[~np.isnan(y_numeric)].astype(int),
                                         equal_nan=True)
        except:
            has_floats = False

        if y_array.dtype == object or y_array.dtype.name.startswith('str'):
            return "classification"
        elif n_unique < 20 and n_unique < (0.05 * n_samples) and not has_floats:
            return "classification"
        else:
            return "regression"

    def _encode_labels_safe(self, y_train, y_test):
        """
        FIX: Safely encode classification labels with unseen label handling.

        Uses SafeLabelEncoder to gracefully handle labels in test set
        that weren't seen during training.
        """
        print("[ModelTrainer] Starting safe label encoding...")

        # FIX: Validate label distribution before encoding
        validation = validate_label_distribution(y_train, y_test, min_samples_per_class=1)

        if not validation['valid']:
            error_issues = [i for i in validation['issues'] if i['severity'] == 'error']
            if error_issues:
                print(f"[ModelTrainer] ⚠️  Label validation warnings:")
                for issue in error_issues:
                    print(f"  - {issue['message']}")

        # FIX: Use safe encoding with mode fallback for unseen labels
        y_train_encoded, y_test_encoded, encoder, stats = safe_encode_labels(
            y_train,
            y_test,
            handle_unknown='use_mode'  # Map unseen labels to most common class
        )

        self.label_encoder = encoder
        self.label_encoding_stats = stats

        return y_train_encoded, y_test_encoded

    def train(self, X_train, y_train, X_test, y_test, feature_names_from_db=None):
        """Fits model and returns metrics + training details."""
        if self.model is None:
            raise ModelTrainingError("Model not initialized")

        # Store feature names
        if feature_names_from_db:
            self.feature_names = feature_names_from_db
            print(f"[Trainer] Using DB feature names: {self.feature_names[:5]}...")
        elif hasattr(X_train, 'columns'):
            self.feature_names = list(X_train.columns)
            print(f"[Trainer] Using X_train columns: {self.feature_names[:5]}...")
        elif hasattr(X_train, 'shape'):
            self.feature_names = [f"feature_{i}" for i in range(X_train.shape[1])]
            print(f"[Trainer] Generated feature names: {self.feature_names[:5]}...")
        else:
            raise ModelTrainingError("Could not determine feature names")

        # FIX: Handle labels based on problem type with safe encoding
        if self.problem_type == "classification":
            detected_type = self._infer_problem_type(y_train)
            if detected_type == "regression":
                raise ModelTrainingError(
                    f"Classification model selected but target appears to be continuous. "
                    f"Found {len(np.unique(y_train))} unique values. "
                    f"Please use regression models or verify your target column."
                )

            # FIX: Use safe label encoding
            y_train_processed, y_test_processed = self._encode_labels_safe(y_train, y_test)

        else:
            # Regression - convert to float
            y_train_processed = pd.Series(y_train).astype(float).to_numpy()
            y_test_processed = pd.Series(y_test).astype(float).to_numpy()

        # Train model
        try:
            start = time.time()
            self.model.fit(X_train, y_train_processed)
            train_time = time.time() - start
            print(f"[Trainer] Model training completed in {train_time:.2f}s")
        except Exception as e:
            raise ModelTrainingError(f"Model fitting failed: {str(e)}")

        # Make predictions
        try:
            y_pred = self.model.predict(X_test)

            # Store actual vs predicted for visualizations
            self.y_test_actual = y_test_processed
            self.y_test_predicted = y_pred

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

        # Build result dictionary
        result = {
            "training_time": train_time,
            "metrics": metrics,
            "predictions": {
                "actual": y_test_processed.tolist(),
                "predicted": y_pred.tolist()
            },
            **self._extract_model_details()
        }

        # FIX: Add label mapping and encoding stats for classification
        if self.problem_type == "classification" and self.label_encoder:
            result["label_mapping"] = {
                str(label): int(idx)
                for idx, label in enumerate(self.label_encoder.classes_)
            }
            result["label_encoding_stats"] = self.label_encoding_stats

        return result

    def _regression_metrics(self, y_true, y_pred):
        return {
            "r2_score": float(r2_score(y_true, y_pred)),
            "mse": float(mean_squared_error(y_true, y_pred)),
            "mae": float(mean_absolute_error(y_true, y_pred)),
            "rmse": float(np.sqrt(mean_squared_error(y_true, y_pred))),
        }

    def _classification_metrics(self, y_true, y_pred):
        from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score

        y_true = np.asarray(y_true).ravel().astype(int)
        y_pred = np.asarray(y_pred).ravel().astype(int)

        # FIX: Handle edge cases in metric calculation
        unique_classes = np.unique(y_true)
        n_classes = len(unique_classes)

        accuracy = float(accuracy_score(y_true, y_pred))

        if n_classes == 1:
            return {
                "accuracy": accuracy,
                "precision": 1.0,
                "recall": 1.0,
                "f1_score": 1.0,
            }

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
            print(f"[Trainer] Metric calculation warning: {e}")
            return {
                "accuracy": accuracy,
                "precision": accuracy,
                "recall": accuracy,
                "f1_score": accuracy,
            }

    def _extract_model_details(self):
        """Extracts coefficients or feature importances."""
        details = {}
        model = self.model.named_steps["model"] if isinstance(self.model, Pipeline) else self.model

        try:
            check_is_fitted(model)
        except (NotFittedError, AttributeError) as e:
            print(f"[Trainer] Model not fitted, skipping detail extraction: {e}")
            return details

        if hasattr(model, "coef_"):
            details["coefficients"] = model.coef_.ravel().tolist()[:100]
        if hasattr(model, "intercept_"):
            details["intercept"] = float(np.ravel(model.intercept_)[0])
        if hasattr(model, "feature_importances_"):
            details["feature_importances"] = model.feature_importances_.tolist()[:100]

        return details

    def save_model(self, path, preprocessor=None):
        """Save model bundle with all necessary components."""
        bundle = {
            "model": self.model,
            "preprocessor": preprocessor,
            "label_encoder": self.label_encoder,  # SafeLabelEncoder instance
            "model_type": self.model_type,
            "problem_type": self.problem_type,
            "feature_names": self.feature_names,
            "label_encoding_stats": self.label_encoding_stats  # FIX: Save encoding stats
        }
        joblib.dump(bundle, path)


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
        model_params: Optional[Dict[str, Any]] = None,
        user_input_name: Optional[str] = None,
        auto_generate_name: bool = False,
):
    """End-to-end training service with robust label encoding."""
    try:
        print(f"[Training] Starting training for dataset {dataset_id}")

        # STEP 1: Fetch dataset metadata
        print("[Training] Step 1/5: Fetching dataset metadata...")
        dataset_result = supabase.table("datasets").select("metadata, file_url").eq(
            "id", dataset_id
        ).eq("user_id", user_id).execute()

        if not dataset_result.data:
            raise ModelTrainingError(f"Dataset {dataset_id} not found for user {user_id}")

        dataset_metadata = dataset_result.data[0]["metadata"]
        all_columns = dataset_metadata.get("feature_names", [])
        feature_names_without_target = [col for col in all_columns if col != target_col]

        print(f"[Training] Columns: {len(all_columns)} total, {len(feature_names_without_target)} features")

        # STEP 2: Preprocess data
        print("[Training] Step 2/5: Preprocessing data...")
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

        # STEP 3: Determine problem type
        temp_trainer = ModelTrainer()
        if problem_type == "auto":
            detected_type = temp_trainer._infer_problem_type(y_train)
            problem_type = detected_type
            print(f"[Training] Auto-detected problem type: {problem_type}")
        else:
            detected_type = temp_trainer._infer_problem_type(y_train)
            if detected_type != problem_type:
                print(f"[Training] WARNING: Specified '{problem_type}' but data suggests '{detected_type}'")

        trainer = ModelTrainer(problem_type=problem_type)

        # STEP 4: Model selection or initialization
        print("[Training] Step 3/5: Initializing model...")

        if model_type == "auto":
            start_time = time.time()

            # FIX: Safe label encoding for classification BEFORE AutoML
            if problem_type == "classification":
                print("[Training] Encoding labels for AutoML...")
                y_train_encoded, y_test_encoded = trainer._encode_labels_safe(y_train, y_test)

                # Store encoder for later
                label_encoder_backup = trainer.label_encoder

            else:
                y_train_encoded = pd.Series(y_train).astype(float).to_numpy()
                y_test_encoded = pd.Series(y_test).astype(float).to_numpy()
                label_encoder_backup = None

            # FIX: AutoML with properly encoded labels
            flaml_task = "classification" if problem_type == "classification" else "regression"
            selector = AutoModelSelector(
                task=flaml_task,
                time_budget=60,
                n_jobs=-1,
                estimator_list=["lgbm", "xgboost", "rf"],
                metric="r2" if flaml_task == "regression" else "accuracy",
                verbose=1
            )

            print(f"[Training] Running AutoML with {X_train.shape[0]} samples...")
            best_model, info = selector.select_best_model(X_train, y_train_encoded)

            trainer.model = best_model
            trainer.model_type = info["best_model"]
            trainer.label_encoder = label_encoder_backup  # Restore encoder
            trainer.feature_names = feature_names_without_target

            training_time = time.time() - start_time
            print(f"[Training] AutoML selected: {trainer.model_type} in {training_time:.2f}s")

            # Predict
            y_pred = best_model.predict(X_test)

            # Store for visualizations
            trainer.y_test_actual = y_test_encoded
            trainer.y_test_predicted = y_pred

            # Calculate metrics
            if problem_type == "classification":
                metrics = trainer._classification_metrics(y_test_encoded, y_pred)
            else:
                metrics = trainer._regression_metrics(y_test_encoded, y_pred)

            model_details = trainer._extract_model_details()

            results = {
                "training_time": training_time,
                "metrics": metrics,
                "predictions": {
                    "actual": y_test_encoded.tolist(),
                    "predicted": y_pred.tolist()
                },
                **model_details
            }

            # FIX: Add label mapping for classification
            if problem_type == "classification" and trainer.label_encoder:
                results["label_mapping"] = {
                    str(label): int(idx)
                    for idx, label in enumerate(trainer.label_encoder.classes_)
                }
                results["label_encoding_stats"] = trainer.label_encoding_stats

        else:
            # Manual model selection
            trainer.initialize_model(
                model_type=model_type,
                problem_type=problem_type,
                use_polynomial=use_polynomial,
                polynomial_degree=polynomial_degree,
                model_params=model_params,
            )

            print("[Training] Step 4/5: Training model...")
            results = trainer.train(
                X_train, y_train, X_test, y_test,
                feature_names_from_db=feature_names_without_target
            )

        # Ensure feature_names are set
        if not trainer.feature_names:
            trainer.feature_names = feature_names_without_target

        # STEP 5: Save model and results
        print("[Training] Step 5/5: Saving model and predictions...")

        # Generate model name
        if auto_generate_name or not user_input_name:
            model_name = await generate_unique_model_name(
                user_id=user_id,
                base_name=user_input_name or "",
                model_type=trainer.model_type,
                target_col=target_col
            )
        else:
            if await check_model_name_exists(user_id, user_input_name):
                raise ModelTrainingError(f"Model name '{user_input_name}' already exists")
            model_name = user_input_name

        # Save model bundle
        tmp_path = os.path.join(tempfile.gettempdir(), f"model_{dataset_id}.pkl")
        trainer.save_model(tmp_path, preprocessor)

        with open(tmp_path, "rb") as f:
            model_bytes = f.read()

        filename = f"{user_id}/models/model_{dataset_id}_{int(time.time())}.pkl"
        supabase.storage.from_("models").upload(filename, model_bytes, {"upsert": "true"})
        model_url = supabase.storage.from_("models").get_public_url(filename)

        # Save predictions
        predictions_filename = f"{user_id}/predictions/pred_{dataset_id}_{int(time.time())}.json"
        predictions_data = {
            "actual": (trainer.y_test_actual.tolist() if trainer.y_test_actual is not None
                       else results["predictions"]["actual"]),
            "predicted": (trainer.y_test_predicted.tolist() if trainer.y_test_predicted is not None
                          else results["predictions"]["predicted"]),
            "residuals": ((trainer.y_test_actual - trainer.y_test_predicted).tolist()
                          if trainer.y_test_actual is not None else None)
        }
        predictions_json = json.dumps(predictions_data)
        supabase.storage.from_("models").upload(predictions_filename, predictions_json.encode(),
                                                {"upsert": "true"})
        predictions_url = supabase.storage.from_("models").get_public_url(predictions_filename)

        # Store in database
        db_data = {
            "user_id": user_id,
            "dataset_id": dataset_id,
            "model_name": model_name,
            "model_type": trainer.model_type,
            "problem_type": problem_type,
            "model_url": model_url,
            "predictions_url": predictions_url,
            "target_column": target_col,
            "metrics": results["metrics"],
            "training_time": results["training_time"],
            "feature_columns": trainer.feature_names,
            "parameters": model_params or trainer._get_default_params(trainer.model_type),
            "status": "completed",
            "description": f"Trained {trainer.model_type} model on {target_col}",
            "created_at": datetime.utcnow().isoformat(),
        }

        db_res = supabase.table("models").insert(db_data).execute()
        model_id = db_res.data[0]["id"]

        print(f"[Training] ✅ Complete! Model ID: {model_id}")
        print(f"[Training] Model: {trainer.model_type}")
        print(f"[Training] Features: {len(trainer.feature_names)}")

        return {
            "id": model_id,
            "model_name": model_name,
            "model_type": trainer.model_type,
            "message": "Model trained successfully",
            **results,
            "preprocessing_metadata": metadata,
            "feature_source": "database"
        }

    except DataPreprocessingError as e:
        raise ModelTrainingError(f"Preprocessing failed: {str(e)}")
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise ModelTrainingError(f"Training failed: {str(e)}")


# Keep existing helper functions
async def check_model_name_exists(user_id: str, model_name: str) -> bool:
    """Check if a model name already exists for a user."""
    try:
        result = (
            supabase.table("models")
            .select("id")
            .eq("user_id", user_id)
            .eq("model_name", model_name)
            .execute()
        )
        return len(result.data) > 0
    except Exception as e:
        print(f"Error checking model name: {e}")
        return False


async def generate_unique_model_name(
        user_id: str,
        base_name: str,
        model_type: str,
        target_col: str
) -> str:
    """Generate a unique model name for the user."""
    from datetime import datetime

    if not base_name:
        base_name = f"{model_type}_{target_col}"

    base_name = "".join(c if c.isalnum() or c in ['_', '-'] else '_' for c in base_name)

    if not await check_model_name_exists(user_id, base_name):
        return base_name

    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    name_with_timestamp = f"{base_name}_{timestamp}"

    if not await check_model_name_exists(user_id, name_with_timestamp):
        return name_with_timestamp

    counter = 1
    while True:
        unique_name = f"{base_name}_{timestamp}_{counter}"
        if not await check_model_name_exists(user_id, unique_name):
            return unique_name
        counter += 1
        if counter > 100:
            raise ModelTrainingError("Unable to generate unique model name")


async def analyze_target_column(
        dataset_id: str,
        user_id: str,
        target_col: str
) -> Dict[str, Any]:
    """Analyze target column and provide recommendations."""
    try:
        dataset = supabase.table("datasets").select("*").eq("id", dataset_id).execute()
        if not dataset.data:
            raise ValueError("Dataset not found")

        file_url = dataset.data[0]["file_url"]
        response = supabase.storage.from_("datasets").download(file_url.split("/datasets/")[-1])
        df = pd.read_csv(io.BytesIO(response))

        if target_col not in df.columns:
            raise ValueError(f"Target column '{target_col}' not found in dataset")

        y = df[target_col].dropna()
        trainer = ModelTrainer()
        detected_type = trainer._infer_problem_type(y)

        n_unique = len(np.unique(y))
        n_samples = len(y)
        unique_ratio = n_unique / n_samples

        try:
            y_numeric = pd.to_numeric(y, errors='coerce')
            has_floats = not np.allclose(y_numeric[~np.isnan(y_numeric)],
                                         y_numeric[~np.isnan(y_numeric)].astype(int))
            is_numeric = y.dtype in ['int64', 'float64'] or not y_numeric.isna().all()
        except:
            has_floats = False
            is_numeric = False

        sample_values = np.unique(y)[:10].tolist()
        warnings_list = []

        if detected_type == "regression" and n_unique < 10:
            warnings_list.append({
                "type": "info",
                "message": f"Only {n_unique} unique values. Consider classification for discrete categories."
            })

        if detected_type == "classification" and n_unique > 50:
            warnings_list.append({
                "type": "warning",
                "message": f"High number of classes ({n_unique}). Classification may be challenging."
            })

        if detected_type == "regression" and not is_numeric:
            warnings_list.append({
                "type": "error",
                "message": "Target contains non-numeric values. Use classification or clean data."
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
            "warnings": warnings_list,
            "recommendations": {
                "regression": detected_type == "regression",
                "classification": detected_type == "classification",
                "message": f"Based on {n_unique} unique values in {n_samples} samples, {detected_type} is recommended."
            }
        }

    except Exception as e:
        raise ValueError(f"Failed to analyze target column: {str(e)}")