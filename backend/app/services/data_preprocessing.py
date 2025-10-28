# app/services/data_preprocessing.py
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, OneHotEncoder, TargetEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.impute import SimpleImputer
from sklearn.feature_selection import VarianceThreshold
from typing import Tuple, Dict, Any
import io
from app.db.supabase_client import supabase


class DataPreprocessingError(Exception):
    """Custom exception for preprocessing errors"""
    pass


class DataPreprocessing:
    def __init__(self):
        self.preprocessor = None
        self.feature_names = None
        self.removed_features = []

    def build_pipeline(
            self,
            X: pd.DataFrame,
            use_target_encoder: bool = False,
            variance_threshold: float = 0.0
    ):
        """
        Builds preprocessing pipeline dynamically based on column types

        Args:
            X: Input features DataFrame
            use_target_encoder: Use TargetEncoder for high-cardinality categoricals
            variance_threshold: Remove features with variance below this threshold
        """
        # Identify feature types
        numeric_features = X.select_dtypes(include=["int64", "float64"]).columns.tolist()
        categorical_features = X.select_dtypes(include=["object", "category"]).columns.tolist()

        # Remove zero-variance columns
        if variance_threshold > 0:
            selector = VarianceThreshold(threshold=variance_threshold)
            numeric_variances = X[numeric_features].var()
            low_variance_cols = numeric_variances[numeric_variances <= variance_threshold].index.tolist()
            numeric_features = [col for col in numeric_features if col not in low_variance_cols]
            self.removed_features.extend(low_variance_cols)

        # Check for high cardinality categoricals
        high_cardinality_cats = []
        low_cardinality_cats = []

        for col in categorical_features:
            n_unique = X[col].nunique()
            if n_unique > 50 or n_unique > len(X) * 0.5:
                high_cardinality_cats.append(col)
            else:
                low_cardinality_cats.append(col)

        transformers = []

        # Numeric pipeline
        if numeric_features:
            numeric_transformer = Pipeline(steps=[
                ("imputer", SimpleImputer(strategy="median")),
                ("scaler", StandardScaler())
            ])
            transformers.append(("num", numeric_transformer, numeric_features))

        # Low cardinality categorical pipeline
        if low_cardinality_cats:
            categorical_transformer = Pipeline(steps=[
                ("imputer", SimpleImputer(strategy="constant", fill_value="missing")),
                ("encoder", OneHotEncoder(handle_unknown="ignore", sparse_output=False))
            ])
            transformers.append(("cat_low", categorical_transformer, low_cardinality_cats))

        # High cardinality categorical pipeline
        if high_cardinality_cats:
            if use_target_encoder:
                # TargetEncoder requires target, will be fit in preprocess_data
                high_card_transformer = Pipeline(steps=[
                    ("imputer", SimpleImputer(strategy="constant", fill_value="missing")),
                    ("encoder", TargetEncoder(target_type='continuous'))
                ])
            else:
                # Fallback to OneHot with max_categories limit
                high_card_transformer = Pipeline(steps=[
                    ("imputer", SimpleImputer(strategy="constant", fill_value="missing")),
                    ("encoder", OneHotEncoder(handle_unknown="ignore", max_categories=50, sparse_output=False))
                ])
            transformers.append(("cat_high", high_card_transformer, high_cardinality_cats))

        if not transformers:
            raise DataPreprocessingError("No valid features found for preprocessing")

        # Combine all transformers
        self.preprocessor = ColumnTransformer(
            transformers=transformers,
            remainder='drop'
        )

        return self.preprocessor

    def preprocess_data(
            self,
            df: pd.DataFrame,
            target_col: str,
            test_size: float = 0.2,
            use_target_encoder: bool = False,
            variance_threshold: float = 0.0,
            random_state: int = 42
    ) -> Tuple[np.ndarray, np.ndarray, pd.Series, pd.Series, ColumnTransformer, Dict[str, Any]]:
        """
        Splits and preprocesses dataset with comprehensive handling

        Args:
            df: Input DataFrame
            target_col: Name of target column
            test_size: Proportion of test set
            use_target_encoder: Use TargetEncoder for high-cardinality features
            variance_threshold: Threshold for removing low-variance features
            random_state: Random seed for reproducibility

        Returns:
            Tuple of (X_train, X_test, y_train, y_test, preprocessor, metadata)
        """
        # Validate target column
        if target_col not in df.columns:
            raise DataPreprocessingError(f"Target column '{target_col}' not found in dataset")

        # Check for sufficient samples
        if len(df) < 10:
            raise DataPreprocessingError("Dataset too small for train/test split")

        # Separate features and target
        X = df.drop(columns=[target_col])
        y = df[target_col]

        # Validate target column
        if y.isnull().all():
            raise DataPreprocessingError("Target column contains only null values")

        # Remove rows with null target values
        if y.isnull().any():
            null_count = y.isnull().sum()
            X = X[~y.isnull()]
            y = y[~y.isnull()]
            print(f"Removed {null_count} rows with null target values")

        # Detect problem type
        problem_type = self._detect_problem_type(y)

        # Adjust test_size if dataset is small
        min_test_samples = 5
        if len(df) * test_size < min_test_samples:
            test_size = min_test_samples / len(df)

        # Split dataset with stratification for classification
        stratify = y if problem_type == "classification" and len(y.unique()) < 20 else None

        try:
            X_train, X_test, y_train, y_test = train_test_split(
                X, y,
                test_size=test_size,
                random_state=random_state,
                stratify=stratify
            )
        except ValueError as e:
            # Fallback without stratification
            X_train, X_test, y_train, y_test = train_test_split(
                X, y,
                test_size=test_size,
                random_state=random_state
            )

        # Build and fit preprocessing pipeline
        preprocessor = self.build_pipeline(
            X_train,
            use_target_encoder=use_target_encoder,
            variance_threshold=variance_threshold
        )

        # Fit and transform
        X_train_processed = preprocessor.fit_transform(X_train, y_train)
        X_test_processed = preprocessor.transform(X_test)

        # Store feature names for later reference
        self.feature_names = self._get_feature_names(preprocessor, X_train)

        # Generate metadata
        metadata = {
            "original_features": X.columns.tolist(),
            "n_original_features": len(X.columns),
            "n_processed_features": X_train_processed.shape[1],
            "removed_features": self.removed_features,
            "train_samples": len(X_train),
            "test_samples": len(X_test),
            "problem_type": problem_type,
            "target_column": target_col,
            "test_size": test_size,
            "null_target_removed": int((y.isnull().sum() if 'null_count' in locals() else 0))
        }

        return X_train_processed, X_test_processed, y_train, y_test, preprocessor, metadata

    def _detect_problem_type(self, y: pd.Series) -> str:
        """Detect if problem is classification or regression"""
        if y.dtype in ['object', 'category', 'bool']:
            return "classification"

        n_unique = y.nunique()
        n_samples = len(y)

        # If fewer than 20 unique values or less than 5% unique, likely classification
        if n_unique < 20 or (n_unique / n_samples) < 0.05:
            return "classification"

        return "regression"

    def _get_feature_names(self, preprocessor: ColumnTransformer, X: pd.DataFrame) -> list:
        """Extract feature names after preprocessing"""
        feature_names = []

        for name, transformer, columns in preprocessor.transformers_:
            if name == 'remainder':
                continue

            if hasattr(transformer, 'get_feature_names_out'):
                try:
                    names = transformer.get_feature_names_out(columns)
                    feature_names.extend(names)
                except:
                    feature_names.extend(columns)
            else:
                feature_names.extend(columns)

        return feature_names


async def preprocess_dataset(
        dataset_id: int,
        user_id: str,
        target_col: str,
        test_size: float = 0.2,
        use_target_encoder: bool = False
) -> Dict[str, Any]:
    """
    Main service function to preprocess a dataset

    Args:
        dataset_id: ID of dataset in Supabase
        user_id: User identifier
        target_col: Target column name
        test_size: Test set proportion
        use_target_encoder: Use target encoding for high cardinality

    Returns:
        Dict with preprocessing results and metadata
    """
    try:
        # Fetch dataset metadata
        dataset = supabase.table("datasets").select("*").eq("id", dataset_id).eq("user_id", user_id).execute()

        if not dataset.data:
            raise DataPreprocessingError("Dataset not found")

        dataset_info = dataset.data[0]

        # Download dataset from storage
        file_path = dataset_info['file_url'].split('/')[-2:]
        file_path = '/'.join(file_path)

        file_data = supabase.storage.from_('datasets').download(file_path)

        # Load into DataFrame
        df = pd.read_csv(io.BytesIO(file_data))

        # Preprocess
        preprocessor = DataPreprocessing()
        X_train, X_test, y_train, y_test, fitted_preprocessor, metadata = preprocessor.preprocess_data(
            df,
            target_col=target_col,
            test_size=test_size,
            use_target_encoder=use_target_encoder
        )

        # Store preprocessor and data (you might want to save these to storage)
        preprocessing_result = {
            "dataset_id": dataset_id,
            "target_column": target_col,
            "metadata": metadata,
            "status": "success"
        }

        return {
            "preprocessing_result": preprocessing_result,
            "X_train": X_train,
            "X_test": X_test,
            "y_train": y_train,
            "y_test": y_test,
            "preprocessor": fitted_preprocessor
        }

    except Exception as e:
        raise DataPreprocessingError(f"Preprocessing failed: {str(e)}")