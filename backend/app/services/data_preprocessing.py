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
import traceback
from app.db.supabase_client import supabase
from app.utils.data_validation import DataValidator, DatasetHealthReport


class DataPreprocessingError(Exception):
    """Custom exception for preprocessing errors"""
    pass


class DataPreprocessing:
    def __init__(self):
        self.preprocessor = None
        self.feature_names = None
        self.removed_features = []
        self.validator = DataValidator()

    def build_pipeline(
            self,
            X: pd.DataFrame,
            use_target_encoder: bool = False,
            variance_threshold: float = 0.0
    ):
        """
        Builds preprocessing pipeline dynamically with robust type detection.
        """
        print(f"\n[Preprocessing] Building pipeline for {X.shape[1]} features...")

        # DEFENSE: Ensure all column names are strings
        X.columns = X.columns.astype(str)

        # DEFENSE: Identify feature types robustly
        numeric_features = []
        categorical_features = []

        for col in X.columns:
            col_data = X[col].dropna()

            if len(col_data) == 0:
                print(f"  ⚠️  Column '{col}' is all null, skipping")
                self.removed_features.append(col)
                continue

            # Try numeric conversion
            try:
                numeric_converted = pd.to_numeric(col_data, errors='coerce')
                conversion_rate = numeric_converted.notna().sum() / len(col_data)

                # If >80% can be numeric, treat as numeric
                if conversion_rate > 0.8:
                    numeric_features.append(col)
                    continue
            except:
                pass

            # Otherwise categorical
            categorical_features.append(col)

        print(f"  ✓ Identified: {len(numeric_features)} numeric, {len(categorical_features)} categorical")

        # DEFENSE: Remove zero-variance columns
        if variance_threshold > 0 and numeric_features:
            try:
                numeric_data = X[numeric_features].apply(pd.to_numeric, errors='coerce')
                numeric_variances = numeric_data.var()
                low_variance_cols = numeric_variances[numeric_variances <= variance_threshold].index.tolist()

                if low_variance_cols:
                    print(f"  ⚠️  Removing {len(low_variance_cols)} low-variance numeric features")
                    numeric_features = [col for col in numeric_features if col not in low_variance_cols]
                    self.removed_features.extend(low_variance_cols)
            except Exception as e:
                print(f"  ⚠️  Variance threshold check failed: {e}")

        # DEFENSE: Separate high/low cardinality categoricals
        high_cardinality_cats = []
        low_cardinality_cats = []

        for col in categorical_features:
            try:
                n_unique = X[col].nunique()
                n_samples = len(X[col].dropna())

                # DEFENSE: Drop if too many unique values (likely ID column)
                if n_unique > 1000 or n_unique == n_samples:
                    print(f"  ⚠️  Dropping '{col}': too many unique values ({n_unique})")
                    self.removed_features.append(col)
                    continue

                if n_unique > 50 or (n_unique / n_samples) > 0.5:
                    high_cardinality_cats.append(col)
                else:
                    low_cardinality_cats.append(col)
            except Exception as e:
                print(f"  ⚠️  Error analyzing '{col}': {e}, dropping")
                self.removed_features.append(col)

        transformers = []

        # Numeric pipeline with robust imputation
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
                ("encoder", OneHotEncoder(handle_unknown="ignore", sparse_output=False, max_categories=100))
            ])
            transformers.append(("cat_low", categorical_transformer, low_cardinality_cats))

        # High cardinality categorical pipeline with safety limits
        if high_cardinality_cats:
            if use_target_encoder:
                high_card_transformer = Pipeline(steps=[
                    ("imputer", SimpleImputer(strategy="constant", fill_value="missing")),
                    ("encoder", TargetEncoder(target_type='auto', smooth='auto'))
                ])
            else:
                # DEFENSE: Limit to top 50 categories to prevent memory issues
                high_card_transformer = Pipeline(steps=[
                    ("imputer", SimpleImputer(strategy="constant", fill_value="missing")),
                    ("encoder", OneHotEncoder(
                        handle_unknown="ignore",
                        max_categories=50,
                        sparse_output=False
                    ))
                ])
            transformers.append(("cat_high", high_card_transformer, high_cardinality_cats))

        if not transformers:
            raise DataPreprocessingError(
                f"No valid features found for preprocessing. "
                f"Removed features: {self.removed_features}"
            )

        # Build preprocessor
        self.preprocessor = ColumnTransformer(
            transformers=transformers,
            remainder='drop',
            verbose_feature_names_out=False
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
        ROBUST preprocessing with comprehensive validation and error handling.
        """
        try:
            print("\n" + "=" * 60)
            print("🛡️  STARTING ROBUST PREPROCESSING")
            print("=" * 60)

            # STEP 1: Validate and clean dataset
            print("\n📋 Step 1: Dataset Validation & Cleaning")
            cleaned_df, health_report = self.validator.validate_and_clean(df, target_col)

            # DEFENSE: Check if target column survived cleaning
            if target_col not in cleaned_df.columns:
                raise DataPreprocessingError(
                    f"Target column '{target_col}' was dropped during validation. "
                    f"Issues: {health_report.target_column_health.issues if health_report.target_column_health else 'Unknown'}"
                )

            # STEP 2: Separate features and target
            print(f"\n📋 Step 2: Separating features and target")
            X = cleaned_df.drop(columns=[target_col])
            y = cleaned_df[target_col]

            print(f"  ✓ Features shape: {X.shape}")
            print(f"  ✓ Target shape: {y.shape}")
            print(f"  ✓ Target dtype: {y.dtype}")

            # DEFENSE: Final target validation
            if y.isnull().all():
                raise DataPreprocessingError("Target column contains only null values")

            # Remove remaining null targets
            if y.isnull().any():
                null_count = y.isnull().sum()
                valid_mask = ~y.isnull()
                X = X[valid_mask].reset_index(drop=True)
                y = y[valid_mask].reset_index(drop=True)
                print(f"  ⚠️  Removed {null_count} rows with null targets")

            # DEFENSE: Check minimum samples
            if len(X) < 10:
                raise DataPreprocessingError(
                    f"Only {len(X)} samples remain - insufficient for training (minimum: 10)"
                )

            # STEP 3: Detect problem type
            print(f"\n📋 Step 3: Problem Type Detection")
            problem_type = health_report.recommended_problem_type or self._detect_problem_type(y)
            print(f"  ✓ Detected problem type: {problem_type}")

            # STEP 4: Split dataset
            print(f"\n📋 Step 4: Train/Test Split ({test_size * 100:.0f}% test)")

            # DEFENSE: Adjust test_size if dataset is small
            min_test_samples = 5
            if len(X) * test_size < min_test_samples:
                old_test_size = test_size
                test_size = max(min_test_samples / len(X), 0.1)
                print(f"  ⚠️  Adjusted test_size from {old_test_size} to {test_size} (small dataset)")

            # DEFENSE: Stratification for classification
            stratify = None
            if problem_type == "classification":
                try:
                    unique_classes = y.nunique()
                    if unique_classes < 20:
                        stratify = y
                        print(f"  ✓ Using stratification ({unique_classes} classes)")
                except Exception as e:
                    print(f"  ⚠️  Stratification not possible: {e}")

            try:
                X_train, X_test, y_train, y_test = train_test_split(
                    X, y,
                    test_size=test_size,
                    random_state=random_state,
                    stratify=stratify
                )
            except ValueError as e:
                # Fallback without stratification
                print(f"  ⚠️  Split with stratification failed: {e}")
                print(f"  🔄 Retrying without stratification")
                X_train, X_test, y_train, y_test = train_test_split(
                    X, y,
                    test_size=test_size,
                    random_state=random_state
                )

            print(f"  ✓ Train: {len(X_train)} samples, Test: {len(X_test)} samples")

            # STEP 5: Build preprocessing pipeline
            print(f"\n📋 Step 5: Building Preprocessing Pipeline")
            preprocessor = self.build_pipeline(
                X_train,
                use_target_encoder=use_target_encoder,
                variance_threshold=variance_threshold
            )

            # STEP 6: Fit and transform with error handling
            print(f"\n📋 Step 6: Fitting and Transforming Data")

            try:
                print(f"  🔄 Fitting preprocessor on training data...")
                X_train_processed = preprocessor.fit_transform(X_train, y_train)
                print(f"  ✓ Training data transformed: {X_train_processed.shape}")
            except Exception as e:
                print(f"  ❌ Fit/transform failed: {e}")
                traceback.print_exc()
                raise DataPreprocessingError(f"Preprocessing fit failed: {str(e)}")

            try:
                print(f"  🔄 Transforming test data...")
                X_test_processed = preprocessor.transform(X_test)
                print(f"  ✓ Test data transformed: {X_test_processed.shape}")
            except Exception as e:
                print(f"  ❌ Test transform failed: {e}")
                traceback.print_exc()
                raise DataPreprocessingError(f"Test data transform failed: {str(e)}")

            # STEP 7: Extract feature names
            print(f"\n📋 Step 7: Extracting Feature Names")
            self.feature_names = self._get_feature_names(preprocessor, X_train)
            print(f"  ✓ Generated {len(self.feature_names)} feature names")

            # STEP 8: Generate metadata
            metadata = {
                "original_features": list(df.drop(columns=[target_col]).columns),
                "n_original_features": len(df.columns) - 1,
                "n_processed_features": X_train_processed.shape[1],
                "removed_features": self.removed_features,
                "train_samples": len(X_train),
                "test_samples": len(X_test),
                "problem_type": problem_type,
                "target_column": target_col,
                "test_size": test_size,
                "validation_report": {
                    "dropped_columns": health_report.dropped_columns,
                    "coerced_columns": health_report.coerced_columns,
                    "overall_issues": health_report.overall_issues
                }
            }

            print("\n" + "=" * 60)
            print("✅ PREPROCESSING COMPLETE")
            print("=" * 60)
            print(f"✓ Input: {df.shape[0]} rows × {df.shape[1]} columns")
            print(f"✓ Output: {X_train_processed.shape[0]} train + {X_test_processed.shape[0]} test")
            print(f"✓ Features: {X_train_processed.shape[1]} (from {len(X.columns)} original)")
            print(f"✓ Removed: {len(self.removed_features)} features")
            print("=" * 60 + "\n")

            return X_train_processed, X_test_processed, y_train, y_test, preprocessor, metadata

        except DataPreprocessingError:
            raise
        except Exception as e:
            print(f"\n❌ PREPROCESSING FAILED")
            print(f"Error: {str(e)}")
            traceback.print_exc()
            raise DataPreprocessingError(f"Preprocessing failed: {str(e)}")

    def _detect_problem_type(self, y: pd.Series) -> str:
        """Robust problem type detection"""
        try:
            y_clean = y.dropna()
            if len(y_clean) == 0:
                return "classification"

            # Try numeric conversion
            try:
                y_numeric = pd.to_numeric(y_clean, errors='coerce')
                numeric_ratio = y_numeric.notna().sum() / len(y_clean)

                if numeric_ratio < 0.8:
                    return "classification"

                n_unique = y_numeric.nunique()
                is_integer = np.allclose(y_numeric.dropna(), y_numeric.dropna().astype(int))

                # Classification if: integers and few unique values
                if is_integer and n_unique < 20:
                    return "classification"

                # Classification if very low cardinality
                if (n_unique / len(y_clean)) < 0.05:
                    return "classification"

                return "regression"
            except:
                return "classification"

        except Exception as e:
            print(f"  ⚠️  Problem type detection error: {e}, defaulting to classification")
            return "classification"

    def _get_feature_names(self, preprocessor: ColumnTransformer, X: pd.DataFrame) -> list:
        """Extract feature names with error handling"""
        try:
            return preprocessor.get_feature_names_out().tolist()
        except:
            # Fallback: use original column names
            feature_names = []
            for name, transformer, columns in preprocessor.transformers_:
                if name == 'remainder':
                    continue
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
    Main service function with full error handling.
    """
    try:
        print(f"\n[Service] Preprocessing dataset {dataset_id} for user {user_id}")

        # Fetch dataset metadata
        dataset = supabase.table("datasets").select("*").eq("id", dataset_id).eq("user_id", user_id).execute()

        if not dataset.data:
            raise DataPreprocessingError(f"Dataset {dataset_id} not found for user {user_id}")

        dataset_info = dataset.data[0]

        # Download dataset from storage
        file_path = dataset_info['file_url'].split('/')[-2:]
        file_path = '/'.join(file_path)

        print(f"[Service] Downloading file: {file_path}")
        file_data = supabase.storage.from_('datasets').download(file_path)

        # Load into DataFrame with robust parsing
        try:
            df = pd.read_csv(io.BytesIO(file_data), encoding='utf-8')
        except UnicodeDecodeError:
            try:
                df = pd.read_csv(io.BytesIO(file_data), encoding='latin-1')
            except:
                df = pd.read_csv(io.BytesIO(file_data), encoding='iso-8859-1')

        print(f"[Service] Loaded dataset: {df.shape[0]} rows × {df.shape[1]} columns")

        # Preprocess
        preprocessor = DataPreprocessing()
        X_train, X_test, y_train, y_test, fitted_preprocessor, metadata = preprocessor.preprocess_data(
            df,
            target_col=target_col,
            test_size=test_size,
            use_target_encoder=use_target_encoder
        )

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

    except DataPreprocessingError:
        raise
    except Exception as e:
        print(f"[Service] Preprocessing service failed: {e}")
        traceback.print_exc()
        raise DataPreprocessingError(f"Preprocessing service failed: {str(e)}")