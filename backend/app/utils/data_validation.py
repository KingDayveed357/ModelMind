# app/utils/data_validation.py
"""
Defensive data validation and schema inference layer.
Handles all edge cases before preprocessing begins.
"""
import pandas as pd
import numpy as np
from typing import Dict, List, Tuple, Any, Optional
import warnings
from dataclasses import dataclass, asdict


@dataclass
class ColumnHealth:
    """Health report for a single column"""
    name: str
    original_dtype: str
    inferred_type: str  # 'numeric', 'categorical', 'datetime', 'text', 'invalid'
    null_count: int
    null_percentage: float
    unique_count: int
    cardinality_ratio: float
    has_mixed_types: bool
    sample_values: List[Any]
    issues: List[str]
    recommended_action: str  # 'keep', 'drop', 'coerce', 'encode'
    coerce_to_dtype: Optional[str]


@dataclass
class DatasetHealthReport:
    """Complete health report for dataset"""
    total_rows: int
    total_columns: int
    valid_columns: List[str]
    dropped_columns: List[str]
    coerced_columns: List[str]
    column_reports: Dict[str, ColumnHealth]
    target_column_health: Optional[ColumnHealth]
    overall_issues: List[str]
    is_valid: bool
    recommended_problem_type: Optional[str]


class DataValidator:
    """
    Comprehensive data validation and cleaning system.
    Handles all possible edge cases before preprocessing.
    """

    def __init__(
            self,
            max_cardinality_ratio: float = 0.95,
            min_valid_rows_ratio: float = 0.1,
            max_null_ratio: float = 0.95,
            min_unique_for_regression: int = 10
    ):
        self.max_cardinality_ratio = max_cardinality_ratio
        self.min_valid_rows_ratio = min_valid_rows_ratio
        self.max_null_ratio = max_null_ratio
        self.min_unique_for_regression = min_unique_for_regression

    def validate_and_clean(
            self,
            df: pd.DataFrame,
            target_col: Optional[str] = None
    ) -> Tuple[pd.DataFrame, DatasetHealthReport]:
        """
        Main entry point: validates, cleans, and returns health report.

        Returns:
            Tuple of (cleaned_df, health_report)
        """
        print("\n" + "=" * 60)
        print("🔍 STARTING DEFENSIVE DATA VALIDATION")
        print("=" * 60)

        if df is None or df.empty:
            raise ValueError("Dataset is empty or None")

        original_shape = df.shape
        print(f"📊 Original dataset: {original_shape[0]} rows × {original_shape[1]} columns")

        # Step 1: Infer schema for all columns
        print("\n1️⃣  Inferring column schemas...")
        column_reports = {}
        for col in df.columns:
            column_reports[col] = self._analyze_column(df[col], col)

        # Step 2: Analyze target column (if specified)
        target_health = None
        recommended_problem_type = None
        if target_col:
            if target_col not in df.columns:
                raise ValueError(f"Target column '{target_col}' not found in dataset")

            print(f"\n2️⃣  Analyzing target column: '{target_col}'")
            target_health = column_reports[target_col]
            recommended_problem_type = self._infer_problem_type(df[target_col], target_health)
            print(f"   ✓ Recommended problem type: {recommended_problem_type}")
            print(f"   ✓ Target type: {target_health.inferred_type}")
            print(f"   ✓ Unique values: {target_health.unique_count}")

        # Step 3: Clean and coerce columns
        print("\n3️⃣  Cleaning and coercing columns...")
        cleaned_df = df.copy()
        dropped_cols = []
        coerced_cols = []

        for col_name, health in column_reports.items():
            # Skip target column from cleaning (handle separately)
            if col_name == target_col:
                continue

            if health.recommended_action == 'drop':
                print(f"   ❌ Dropping '{col_name}': {', '.join(health.issues)}")
                cleaned_df = cleaned_df.drop(columns=[col_name])
                dropped_cols.append(col_name)

            elif health.recommended_action == 'coerce':
                print(f"   🔄 Coercing '{col_name}' to {health.coerce_to_dtype}")
                cleaned_df[col_name] = self._coerce_column(
                    cleaned_df[col_name],
                    health.coerce_to_dtype
                )
                coerced_cols.append(col_name)

        # Step 4: Handle target column
        if target_col and target_col in cleaned_df.columns:
            print(f"\n4️⃣  Cleaning target column: '{target_col}'")
            cleaned_df, target_health = self._clean_target_column(
                cleaned_df,
                target_col,
                target_health,
                recommended_problem_type
            )
            column_reports[target_col] = target_health

        # Step 5: Remove rows with null targets
        if target_col:
            null_target_mask = cleaned_df[target_col].isna()
            if null_target_mask.any():
                n_null = null_target_mask.sum()
                print(f"\n5️⃣  Removing {n_null} rows with null target values")
                cleaned_df = cleaned_df[~null_target_mask].reset_index(drop=True)

        # Step 6: Final validation
        print(f"\n6️⃣  Final validation...")
        valid_columns = [c for c in cleaned_df.columns if c != target_col]

        if len(valid_columns) == 0:
            raise ValueError("No valid feature columns remain after cleaning")

        if target_col and len(cleaned_df) < 10:
            raise ValueError(f"Only {len(cleaned_df)} valid rows remain - insufficient for training")

        # Step 7: Build health report
        overall_issues = []
        if len(dropped_cols) > len(df.columns) * 0.5:
            overall_issues.append(f"Warning: {len(dropped_cols)} columns dropped (>{50}% of original)")

        if len(cleaned_df) < len(df) * 0.5:
            overall_issues.append(f"Warning: {len(df) - len(cleaned_df)} rows removed (>{50}% of original)")

        health_report = DatasetHealthReport(
            total_rows=len(cleaned_df),
            total_columns=len(cleaned_df.columns),
            valid_columns=valid_columns,
            dropped_columns=dropped_cols,
            coerced_columns=coerced_cols,
            column_reports=column_reports,
            target_column_health=target_health,
            overall_issues=overall_issues,
            is_valid=True,
            recommended_problem_type=recommended_problem_type
        )

        print("\n" + "=" * 60)
        print("✅ VALIDATION COMPLETE")
        print("=" * 60)
        print(f"📊 Final dataset: {cleaned_df.shape[0]} rows × {cleaned_df.shape[1]} columns")
        print(f"✓ Valid features: {len(valid_columns)}")
        print(f"❌ Dropped columns: {len(dropped_cols)}")
        print(f"🔄 Coerced columns: {len(coerced_cols)}")
        if overall_issues:
            print(f"⚠️  Warnings: {len(overall_issues)}")
        print("=" * 60 + "\n")

        return cleaned_df, health_report

    def _analyze_column(self, series: pd.Series, col_name: str) -> ColumnHealth:
        """Analyze a single column and return health report"""
        n_total = len(series)
        null_count = series.isna().sum()
        null_pct = (null_count / n_total) * 100 if n_total > 0 else 100

        # Get non-null values for analysis
        non_null = series.dropna()
        unique_count = non_null.nunique() if len(non_null) > 0 else 0
        cardinality_ratio = unique_count / len(non_null) if len(non_null) > 0 else 0

        # Sample values
        sample_values = non_null.head(5).tolist() if len(non_null) > 0 else []

        issues = []

        # Check for completely null column
        if null_pct >= self.max_null_ratio * 100:
            issues.append(f"{null_pct:.1f}% null values")
            return ColumnHealth(
                name=col_name,
                original_dtype=str(series.dtype),
                inferred_type='invalid',
                null_count=null_count,
                null_percentage=null_pct,
                unique_count=unique_count,
                cardinality_ratio=cardinality_ratio,
                has_mixed_types=False,
                sample_values=sample_values,
                issues=issues,
                recommended_action='drop',
                coerce_to_dtype=None
            )

        # Infer actual type
        inferred_type, has_mixed, coerce_to = self._infer_column_type(non_null)

        # Check for single unique value
        if unique_count <= 1 and len(non_null) > 0:
            issues.append(f"Only {unique_count} unique value (zero variance)")

        # Check for extreme cardinality
        if inferred_type == 'categorical' and cardinality_ratio > self.max_cardinality_ratio:
            issues.append(f"Very high cardinality ({unique_count} unique values)")

        # Check for mixed types
        if has_mixed:
            issues.append("Contains mixed types")

        # Determine action
        if null_pct >= self.max_null_ratio * 100 or unique_count <= 1:
            recommended_action = 'drop'
        elif coerce_to and coerce_to != str(series.dtype):
            recommended_action = 'coerce'
        else:
            recommended_action = 'keep'

        return ColumnHealth(
            name=col_name,
            original_dtype=str(series.dtype),
            inferred_type=inferred_type,
            null_count=null_count,
            null_percentage=null_pct,
            unique_count=unique_count,
            cardinality_ratio=cardinality_ratio,
            has_mixed_types=has_mixed,
            sample_values=sample_values,
            issues=issues,
            recommended_action=recommended_action,
            coerce_to_dtype=coerce_to
        )

    def _infer_column_type(self, series: pd.Series) -> Tuple[str, bool, Optional[str]]:
        """
        Infer actual column type from data.

        Returns:
            (inferred_type, has_mixed_types, coerce_to_dtype)
        """
        if len(series) == 0:
            return 'invalid', False, None

        original_dtype = series.dtype

        # Try numeric conversion
        try:
            numeric_series = pd.to_numeric(series, errors='coerce')
            non_null_numeric = numeric_series.dropna()

            # If >80% can be converted to numeric, treat as numeric
            conversion_rate = len(non_null_numeric) / len(series)
            if conversion_rate > 0.8:
                has_mixed = conversion_rate < 1.0

                # Check if all are integers
                if np.allclose(non_null_numeric, non_null_numeric.astype(int)):
                    return 'numeric', has_mixed, 'int64'
                else:
                    return 'numeric', has_mixed, 'float64'
        except:
            pass

        # Try datetime
        try:
            pd.to_datetime(series, errors='raise')
            return 'datetime', False, 'datetime64[ns]'
        except:
            pass

        # Check if it's categorical
        unique_ratio = series.nunique() / len(series)

        if unique_ratio < 0.5 or series.nunique() < 50:
            return 'categorical', False, 'object'

        # Default to text
        return 'text', False, 'object'

    def _coerce_column(self, series: pd.Series, target_dtype: str) -> pd.Series:
        """Safely coerce column to target dtype"""
        try:
            if target_dtype in ['int64', 'float64']:
                return pd.to_numeric(series, errors='coerce')
            elif target_dtype == 'datetime64[ns]':
                return pd.to_datetime(series, errors='coerce')
            elif target_dtype == 'object':
                return series.astype(str)
            else:
                return series
        except Exception as e:
            print(f"   ⚠️  Coercion failed: {e}, keeping original")
            return series

    def _clean_target_column(
            self,
            df: pd.DataFrame,
            target_col: str,
            target_health: ColumnHealth,
            problem_type: str
    ) -> Tuple[pd.DataFrame, ColumnHealth]:
        """Clean and validate target column based on problem type"""

        if problem_type == 'regression':
            # Ensure target is numeric
            if target_health.inferred_type != 'numeric':
                print(f"   🔄 Coercing target to numeric for regression")
                df[target_col] = pd.to_numeric(df[target_col], errors='coerce')
                target_health.coerce_to_dtype = 'float64'
                target_health.inferred_type = 'numeric'

        elif problem_type == 'classification':
            # Keep as categorical
            if target_health.inferred_type == 'numeric':
                # Check if it's actually discrete
                unique_count = df[target_col].nunique()
                if unique_count < 20:
                    print(f"   ℹ️  Target is numeric but has {unique_count} unique values - treating as categorical")
                    df[target_col] = df[target_col].astype(str)
                    target_health.inferred_type = 'categorical'

        return df, target_health

    def _infer_problem_type(self, series: pd.Series, health: ColumnHealth) -> str:
        """Infer whether target suggests classification or regression"""

        non_null = series.dropna()
        if len(non_null) == 0:
            return 'classification'  # Default

        unique_count = health.unique_count
        n_samples = len(non_null)

        # If categorical or text, must be classification
        if health.inferred_type in ['categorical', 'text']:
            print(f"   ℹ️  Target is {health.inferred_type} → classification")
            return 'classification'

        # If numeric, check cardinality
        if health.inferred_type == 'numeric':
            try:
                numeric_vals = pd.to_numeric(non_null, errors='coerce').dropna()

                # Check if all integers
                is_all_integers = np.allclose(numeric_vals, numeric_vals.astype(int))

                # Classification if: few unique values AND integers
                if unique_count < self.min_unique_for_regression and is_all_integers:
                    print(f"   ℹ️  Target has {unique_count} discrete values → classification")
                    return 'classification'

                # Classification if very low cardinality ratio
                cardinality_ratio = unique_count / n_samples
                if cardinality_ratio < 0.05:
                    print(f"   ℹ️  Target has low cardinality ({cardinality_ratio:.2%}) → classification")
                    return 'classification'

                print(f"   ℹ️  Target is continuous ({unique_count} unique values) → regression")
                return 'regression'
            except Exception as e:
                print(f"   ⚠️  Error inferring problem type: {e}, defaulting to classification")
                return 'classification'

        return 'classification'