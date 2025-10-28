# app/services/dataset_service.py
import pandas as pd
import io
from typing import Dict, Any
from datetime import datetime
from app.db.supabase_client import supabase


class DatasetValidationError(Exception):
    """Custom exception for dataset validation errors"""
    pass

def get_upload_error(res):
    if isinstance(res, dict):
        return res.get("error")
    if hasattr(res, "error"):
        return res.error
    return None

async def upload_dataset(file, user_id: str) -> Dict[str, Any]:
    """
    Upload and validate dataset with comprehensive checks.

    Args:
        file: Uploaded file object
        user_id: User identifier

    Returns:
        Dict containing upload status and dataset summary

    Raises:
        DatasetValidationError: If dataset fails validation
    """
    try:
        # Read file content
        content = await file.read()

        # Validate file is not empty
        if len(content) == 0:
            raise DatasetValidationError("Uploaded file is empty")

        # Parse CSV with error handling
        try:
            df = pd.read_csv(io.BytesIO(content))
        except pd.errors.EmptyDataError:
            raise DatasetValidationError("CSV file contains no data")
        except pd.errors.ParserError as e:
            raise DatasetValidationError(f"CSV parsing error: {str(e)}")

        # Validate dataset has rows and columns
        if df.empty:
            raise DatasetValidationError("Dataset contains no rows")

        if len(df.columns) == 0:
            raise DatasetValidationError("Dataset contains no columns")

        # Check for minimum number of rows (at least 10 for meaningful ML)
        if len(df) < 10:
            raise DatasetValidationError(
                f"Dataset has only {len(df)} rows. Minimum 10 rows required for training."
            )

        # Check for duplicate column names
        if df.columns.duplicated().any():
            duplicates = df.columns[df.columns.duplicated()].tolist()
            raise DatasetValidationError(
                f"Dataset contains duplicate column names: {duplicates}"
            )

        # Perform comprehensive dataset analysis
        summary = analyze_dataset(df)

        # Upload to Supabase storage
        filename = f"{user_id}/{file.filename}"
        storage_res = supabase.storage.from_("datasets").upload(filename, content)

        # Check for upload errors
        error = get_upload_error(storage_res)
        if error:
            raise Exception(f"Failed to upload dataset to storage: {error}")

        # Get public URL
        public_url = supabase.storage.from_('datasets').get_public_url(filename)

        # Insert metadata into datasets table
        data = {
            "user_id": user_id,
            "name": file.filename,
            "file_url": public_url,
            "uploaded_at": datetime.utcnow().isoformat(),
            "rows": len(df),
            "columns": len(df.columns),
            "has_missing": bool(df.isnull().values.any()),
            "metadata": summary  # Store rich metadata for later use
        }

        db_res = supabase.table("datasets").insert(data).execute()

        if not db_res.data:
            raise Exception("Failed to insert dataset metadata into database")

        return {
            "message": "Dataset uploaded successfully",
            "dataset_id": db_res.data[0].get("id"),
            "summary": summary,
        }

    except DatasetValidationError:
        raise
    except Exception as e:
        raise Exception(f"Dataset upload failed: {str(e)}")





def analyze_dataset(df: pd.DataFrame) -> Dict[str, Any]:
    """
    Perform comprehensive dataset analysis.

    Args:
        df: Input DataFrame

    Returns:
        Dict containing dataset statistics and warnings
    """
    numeric_cols = df.select_dtypes(include=["int64", "float64"]).columns.tolist()
    categorical_cols = df.select_dtypes(include=["object", "category"]).columns.tolist()

    # Analyze categorical cardinality
    high_cardinality_cols = []
    cardinality_info = {}

    for col in categorical_cols:
        n_unique = df[col].nunique()
        cardinality_info[col] = n_unique

        # Flag if cardinality > 50 or > 50% of rows
        if n_unique > 50 or n_unique > len(df) * 0.5:
            high_cardinality_cols.append({
                "column": col,
                "unique_values": n_unique,
                "percentage": round(n_unique / len(df) * 100, 2)
            })

    # Analyze zero variance columns
    zero_variance_cols = []
    for col in numeric_cols:
        if df[col].nunique() == 1:
            zero_variance_cols.append(col)

    # Calculate missing value percentages
    missing_percentages = {}
    for col in df.columns:
        missing_pct = (df[col].isnull().sum() / len(df)) * 100
        if missing_pct > 0:
            missing_percentages[col] = round(missing_pct, 2)

    # Memory usage estimate
    memory_mb = df.memory_usage(deep=True).sum() / (1024 ** 2)

    # Generate warnings
    warnings = []

    if high_cardinality_cols:
        warnings.append({
            "type": "high_cardinality",
            "message": "High cardinality categorical columns detected. Consider using TargetEncoder or hashing.",
            "columns": high_cardinality_cols
        })

    if zero_variance_cols:
        warnings.append({
            "type": "zero_variance",
            "message": "Constant columns detected. These will be removed during preprocessing.",
            "columns": zero_variance_cols
        })

    if memory_mb > 500:
        warnings.append({
            "type": "large_dataset",
            "message": f"Large dataset detected ({memory_mb:.2f} MB). Consider using incremental learning or sampling.",
            "memory_mb": round(memory_mb, 2)
        })

    if len(df.columns) > 100:
        warnings.append({
            "type": "high_dimensionality",
            "message": f"High number of features ({len(df.columns)}). Consider feature selection.",
            "n_features": len(df.columns)
        })

    return {
        "rows": len(df),
        "columns": len(df.columns),
        "feature_names": df.columns.tolist(),
        "numeric_features": numeric_cols,
        "categorical_features": categorical_cols,
        "has_missing": bool(df.isnull().values.any()),
        "missing_percentages": missing_percentages,
        "cardinality_info": cardinality_info,
        "zero_variance_columns": zero_variance_cols,
        "memory_mb": round(memory_mb, 2),
        "warnings": warnings
    }


async def list_user_datasets(user_id: str):
    """Retrieve all datasets for a user"""
    res = supabase.table('datasets').select("*").eq("user_id", user_id).execute()
    return res.data