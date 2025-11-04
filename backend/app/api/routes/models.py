# app/api/routes/models.py
from fastapi import APIRouter, HTTPException, Query, Response
from fastapi.responses import FileResponse, JSONResponse, StreamingResponse
from typing import Optional, List, Dict, Any
from pydantic import BaseModel
from datetime import datetime
import joblib
import os
import tempfile
import json
import pandas as pd
import io
from app.db.supabase_client import supabase
import numpy as np
from scipy import stats
from sklearn.metrics import precision_recall_fscore_support
import traceback
from sklearn.metrics import confusion_matrix, classification_report

router = APIRouter()


class ModelUpdateRequest(BaseModel):
    model_name: Optional[str] = None
    description: Optional[str] = None


class ModelSummary(BaseModel):
    total_models: int
    avg_r2: Optional[float] = None
    avg_accuracy: Optional[float] = None
    most_used_dataset: Optional[str] = None
    best_performing_model: Optional[Dict[str, Any]] = None
    regression_count: int
    classification_count: int

class NumpyEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, (np.bool_, np.bool8)):
            return bool(obj)
        elif isinstance(obj, (np.integer, np.int8, np.int16, np.int32, np.int64,
                            np.uint8, np.uint16, np.uint32, np.uint64)):
            return int(obj)
        elif isinstance(obj, (np.floating, np.float16, np.float32, np.float64)):
            return float(obj)
        elif isinstance(obj, (np.ndarray,)):
            return obj.tolist()
        elif hasattr(obj, '__dict__'):
            try:
                return vars(obj)
            except TypeError:
                return str(obj)
        return super().default(obj)


@router.get("/models")
async def list_models(
        user_id: str = Query(..., description="User ID"),
        search: Optional[str] = None,
        dataset_id: Optional[str] = None,
        model_type: Optional[str] = None,
        problem_type: Optional[str] = None,
        min_r2: Optional[float] = None,
        max_mae: Optional[float] = None,
        min_accuracy: Optional[float] = None,
        date_from: Optional[str] = None,
        date_to: Optional[str] = None,
        sort_by: str = "created_at",
        sort_order: str = "desc",
        page: int = 1,
        page_size: int = 20,
):
    """List all models for a user with filtering, searching, and pagination."""
    try:
        query = supabase.table("models").select("*, datasets(name)", count="exact").eq("user_id", user_id)

        if search:
            query = query.or_(f"model_name.ilike.%{search}%,description.ilike.%{search}%")

        if dataset_id:
            query = query.eq("dataset_id", dataset_id)

        if model_type:
            query = query.eq("model_type", model_type)

        if problem_type:
            query = query.eq("problem_type", problem_type)

        if date_from:
            query = query.gte("created_at", date_from)

        if date_to:
            query = query.lte("created_at", date_to)

        if min_r2 is not None:
            query = query.gte("metrics->>r2_score", str(min_r2))

        if max_mae is not None:
            query = query.lte("metrics->>mae", str(max_mae))

        if min_accuracy is not None:
            query = query.gte("metrics->>accuracy", str(min_accuracy))

        desc = sort_order == "desc"
        if sort_by.startswith("metrics."):
            metric_key = sort_by.split(".")[1]
            query = query.order(f"metrics->{metric_key}", desc=desc)
        else:
            query = query.order(sort_by, desc=desc)

        start = (page - 1) * page_size
        end = start + page_size - 1
        query = query.range(start, end)

        result = query.execute()
        models = result.data
        total = result.count or 0

        for model in models:
            if model.get("datasets"):
                model["dataset_name"] = model["datasets"].get("name", "Unknown")
                del model["datasets"]

        summary = await calculate_model_summary(user_id)

        return {
            "status": "success",
            "data": {
                "models": models,
                "total": total,
                "page": page,
                "page_size": page_size,
                "summary": summary,
            }
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch models: {str(e)}")


@router.get("/models/summary")
async def get_model_summary(user_id: str = Query(...)):
    """Get summary statistics for user's models."""
    try:
        summary = await calculate_model_summary(user_id)
        return {"status": "success", "data": summary}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get summary: {str(e)}")


@router.get("/models/{model_id}")
async def get_model_details(model_id: str, user_id: str = Query(...)):
    """Get detailed information about a specific model."""
    try:
        result = supabase.table("models").select(
            "*, datasets(name, rows, columns)"
        ).eq("id", model_id).eq("user_id", user_id).single().execute()

        if not result.data:
            raise HTTPException(status_code=404, detail="Model not found")

        model = result.data
        dataset_id = model.get("dataset_id")

        dataset_info = {}
        if dataset_id:
            try:
                dataset_result = supabase.table("datasets").select(
                    "name, rows, columns, file_size, file_url, uploaded_at, has_missing, metadata"
                ).eq("id", dataset_id).single().execute()

                if dataset_result.data:
                    dataset_data = dataset_result.data
                    dataset_info = {
                        "name": dataset_data.get("name", "Unknown"),
                        "rows": dataset_data.get("rows", 0),
                        "columns": dataset_data.get("columns", 0),
                        "file_size": dataset_data.get("file_size", 0),
                        "file_url": dataset_data.get("file_url", ""),
                        "uploaded_at": dataset_data.get("uploaded_at", ""),
                        "has_missing": dataset_data.get("has_missing", False),
                        "metadata": dataset_data.get("metadata", {})
                    }
            except Exception as dataset_error:
                print(f"Error fetching dataset: {dataset_error}")

        model["dataset_info"] = dataset_info

        pred_result = supabase.table("predictions").select(
            "id", count="exact"
        ).eq("model_id", model_id).execute()
        model["prediction_count"] = pred_result.count or 0

        return {"status": "success", "data": model}

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch model: {str(e)}")


@router.patch("/models/{model_id}")
async def update_model(
        model_id: str,
        updates: ModelUpdateRequest,
        user_id: str = Query(...)
):
    """Update model metadata (name, description)."""
    try:
        existing = supabase.table("models").select("id").eq(
            "id", model_id
        ).eq("user_id", user_id).execute()

        if not existing.data:
            raise HTTPException(status_code=404, detail="Model not found")

        update_data = {}
        if updates.model_name:
            name_check = supabase.table("models").select("id").eq(
                "user_id", user_id
            ).eq("model_name", updates.model_name).neq("id", model_id).execute()

            if name_check.data:
                raise HTTPException(status_code=400, detail="Model name already exists")

            update_data["model_name"] = updates.model_name

        if updates.description is not None:
            update_data["description"] = updates.description

        if not update_data:
            raise HTTPException(status_code=400, detail="No updates provided")

        update_data["updated_at"] = datetime.utcnow().isoformat()

        result = supabase.table("models").update(update_data).eq(
            "id", model_id
        ).execute()

        return {"status": "success", "data": result.data[0]}

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update model: {str(e)}")


@router.delete("/models/{model_id}")
async def delete_model(model_id: str, user_id: str = Query(...)):
    """Delete a model and its associated files."""
    try:
        result = supabase.table("models").select("*").eq(
            "id", model_id
        ).eq("user_id", user_id).single().execute()

        if not result.data:
            raise HTTPException(status_code=404, detail="Model not found")

        model = result.data

        if model.get("model_url"):
            try:
                file_path = model["model_url"].split("/models/")[-1]
                supabase.storage.from_("models").remove([file_path])
            except Exception as e:
                print(f"Warning: Failed to delete model file: {e}")

        if model.get("predictions_url"):
            try:
                pred_path = model["predictions_url"].split("/models/")[-1]
                supabase.storage.from_("models").remove([pred_path])
            except Exception as e:
                print(f"Warning: Failed to delete predictions file: {e}")

        supabase.table("predictions").delete().eq("model_id", model_id).execute()
        supabase.table("models").delete().eq("id", model_id).execute()

        return {"status": "success", "message": "Model deleted successfully"}

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete model: {str(e)}")


@router.get("/models/{model_id}/export")
# async def export_model(model_id: str, user_id: str = Query(...)):
#     """Export model as JSON with all metadata."""
#     try:
#         result = supabase.table("models").select("*").eq(
#             "id", model_id
#         ).eq("user_id", user_id).single().execute()
#
#         if not result.data:
#             raise HTTPException(status_code=404, detail="Model not found")
#
#         model_data = result.data
#         model_name = model_data["model_name"]
#
#         # Create comprehensive JSON export
#         export_data = {
#             "model_info": {
#                 "id": model_data["id"],
#                 "name": model_data["model_name"],
#                 "type": model_data["model_type"],
#                 "problem_type": model_data["problem_type"],
#                 "target_column": model_data["target_column"],
#                 "feature_columns": model_data.get("feature_columns", []),
#                 "created_at": model_data["created_at"],
#                 "description": model_data.get("description", ""),
#             },
#             "performance": {
#                 "metrics": model_data["metrics"],
#                 "training_time": model_data["training_time"],
#             },
#             "configuration": {
#                 "parameters": model_data.get("parameters", {}),
#             },
#             "metadata": {
#                 "status": model_data.get("status", "completed"),
#                 "dataset_id": model_data.get("dataset_id"),
#             }
#         }
#
#         # Save to temp file
#         temp_path = os.path.join(tempfile.gettempdir(), f"{model_name}_export.json")
#         with open(temp_path, "w") as f:
#             json.dump(export_data, f, indent=2)
#
#         return FileResponse(
#             temp_path,
#             media_type="application/json",
#             filename=f"{model_name}_export.json"
#         )
#
#     except HTTPException:
#         raise
#     except Exception as e:
#         raise HTTPException(status_code=500, detail=f"Failed to export model: {str(e)}")
@router.get("/models/{model_id}/export")
async def export_model(
        model_id: str,
        user_id: str = Query(...),
        format: str = Query("json", description="Export format: 'pkl' or 'json'")
):
    """
    Export model in specified format.

    - **pkl**: Full model bundle (for deployment)
    - **json**: Metadata and metrics only (for documentation)
    """
    try:
        result = supabase.table("models").select("*").eq(
            "id", model_id
        ).eq("user_id", user_id).single().execute()

        if not result.data:
            raise HTTPException(status_code=404, detail="Model not found")

        model_data = result.data
        model_name = model_data["model_name"]

        if format == "json":
            # Export as JSON (metadata only)
            export_data = {
                "model_info": {
                    "id": model_data["id"],
                    "name": model_data["model_name"],
                    "type": model_data["model_type"],
                    "problem_type": model_data["problem_type"],
                    "target_column": model_data["target_column"],
                    "feature_columns": model_data.get("feature_columns", []),
                    "created_at": model_data["created_at"],
                    "description": model_data.get("description", ""),
                },
                "performance": {
                    "metrics": model_data["metrics"],
                    "training_time": model_data["training_time"],
                },
                "configuration": {
                    "parameters": model_data.get("parameters", {}),
                },
                "usage": {
                    "prediction_count": model_data.get("prediction_count", 0),
                    "last_used_at": model_data.get("last_used_at"),
                    "status": model_data.get("status", "completed"),
                },
                "instructions": {
                    "prediction_format": {
                        "description": "Use original feature names in your input",
                        "example": {
                            feature: "value"
                            for feature in model_data.get("feature_columns", [])[:5]
                        }
                    },
                    "api_usage": {
                        "endpoint": f"/predict/{model_id}/single",
                        "method": "POST",
                        "body": "JSON object with feature names as keys"
                    }
                }
            }

            json_str = json.dumps(export_data, indent=2)

            return StreamingResponse(
                io.BytesIO(json_str.encode()),
                media_type="application/json",
                headers={
                    "Content-Disposition": f"attachment; filename={model_name}_metadata.json"
                }
            )

        elif format == "pkl":
            # Export full model bundle
            model_url = model_data.get("model_url")
            if not model_url:
                raise HTTPException(status_code=404, detail="Model file not found")

            # Extract file path correctly
            # URL format: https://.../storage/v1/object/public/models/USER_ID/models/MODEL_FILE.pkl
            # We need: USER_ID/models/MODEL_FILE.pkl

            # Method 1: Split by '/models/' and take the part after it
            if "/object/public/models/" in model_url:
                file_path = model_url.split("/object/public/models/")[1]
                # Remove query parameters if any
                file_path = file_path.split("?")[0]
            else:
                # Fallback: try the old method
                file_path = model_url.split("/models/")[-1].split("?")[0]

            print(f"Attempting to download from path: {file_path}")

            try:
                # Download model from storage
                model_bytes = supabase.storage.from_("models").download(file_path)
            except Exception as storage_error:
                print(f"Storage error: {storage_error}")
                raise HTTPException(
                    status_code=404,
                    detail=f"Model file not found in storage. Path attempted: {file_path}"
                )

            # Save to temp file
            temp_path = os.path.join(tempfile.gettempdir(), f"{model_name}.pkl")
            with open(temp_path, "wb") as f:
                f.write(model_bytes)

            return FileResponse(
                temp_path,
                media_type="application/octet-stream",
                filename=f"{model_name}.pkl",
                headers={
                    "Content-Description": "ML Model Bundle (Requires joblib to load)"
                }
            )

        else:
            raise HTTPException(
                status_code=400,
                detail="Invalid format. Use 'json' or 'pkl'"
            )

    except HTTPException:
        raise
    except Exception as e:
        print(f"Export error: {str(e)}")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Failed to export model: {str(e)}")


@router.get("/models/{model_id}/download-predictions")
async def download_predictions(model_id: str, user_id: str = Query(...)):
    """Download prediction history as CSV"""
    try:
        # Fetch recent predictions
        predictions = supabase.table("predictions").select(
            "*"
        ).eq("model_id", model_id).eq(
            "user_id", user_id
        ).order("predicted_at", desc=True).limit(1000).execute()

        if not predictions.data or len(predictions.data) == 0:
            raise HTTPException(status_code=404, detail="No predictions found")

        # Create CSV
        import pandas as pd

        rows = []
        for pred in predictions.data:
            pred_data = pred.get("predictions", [])
            probs = pred.get("probabilities", [])

            for i, p in enumerate(pred_data):
                row = {
                    "prediction_id": pred["id"],
                    "predicted_at": pred["predicted_at"],
                    "prediction": p
                }
                if probs and i < len(probs):
                    row["confidence"] = max(probs[i]) if isinstance(probs[i], list) else probs[i]
                rows.append(row)

        df = pd.DataFrame(rows)
        csv_buffer = io.StringIO()
        df.to_csv(csv_buffer, index=False)
        csv_buffer.seek(0)

        return StreamingResponse(
            io.BytesIO(csv_buffer.getvalue().encode()),
            media_type="text/csv",
            headers={
                "Content-Disposition": f"attachment; filename=predictions_{model_id}.csv"
            }
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to download predictions: {str(e)}")

@router.get("/models/{model_id}/predictions-data")
async def get_predictions_data(model_id: str, user_id: str = Query(...)):
    """Get actual vs predicted data for visualizations."""
    try:
        result = supabase.table("models").select(
            "predictions_url"
        ).eq("id", model_id).eq("user_id", user_id).single().execute()

        if not result.data:
            raise HTTPException(status_code=404, detail="Model not found")

        predictions_url = result.data.get("predictions_url")

        if not predictions_url:
            return {"status": "success", "data": {"actual": [], "predicted": [], "residuals": []}}

        # Download predictions file
        file_path = predictions_url.split("/models/")[-1]
        predictions_bytes = supabase.storage.from_("models").download(file_path)
        predictions_data = json.loads(predictions_bytes.decode())

        return {"status": "success", "data": predictions_data}

    except HTTPException:
        raise
    except Exception as e:
        print(f"Error loading predictions: {e}")
        return {"status": "success", "data": {"actual": [], "predicted": [], "residuals": []}}


@router.get("/models/{model_id}/dataset-preview")
async def get_dataset_preview(
        model_id: str,
        user_id: str = Query(...),
        rows: int = Query(10, description="Number of rows to preview")
):
    """Get original dataset preview (before preprocessing)."""
    try:
        # Get model to find dataset
        model_result = supabase.table("models").select(
            "dataset_id"
        ).eq("id", model_id).eq("user_id", user_id).single().execute()

        if not model_result.data:
            raise HTTPException(status_code=404, detail="Model not found")

        dataset_id = model_result.data.get("dataset_id")
        if not dataset_id:
            raise HTTPException(status_code=404, detail="Dataset not found for this model")

        # Get dataset file URL
        dataset_result = supabase.table("datasets").select(
            "file_url, name"
        ).eq("id", dataset_id).execute()

        if not dataset_result.data:
            raise HTTPException(status_code=404, detail="Dataset not found")

        file_url = dataset_result.data[0]["file_url"]
        file_path = file_url.split("/datasets/")[-1]

        # Download and read original CSV
        file_bytes = supabase.storage.from_("datasets").download(file_path)
        df = pd.read_csv(io.BytesIO(file_bytes))

        # Get preview
        preview_df = df.head(rows)

        return {
            "status": "success",
            "data": {
                "headers": preview_df.columns.tolist(),
                "rows": preview_df.values.tolist(),
                "total_rows": len(df),
                "total_columns": len(df.columns),
                "name": dataset_result.data[0]["name"]
            }
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to load dataset preview: {str(e)}")


@router.get("/models/{model_id}/feature-importance")
async def get_feature_importance(model_id: str, user_id: str = Query(...)):
    """Get feature importance for the model."""
    try:
        result = supabase.table("models").select(
            "model_url, feature_columns"
        ).eq("id", model_id).eq("user_id", user_id).single().execute()

        if not result.data:
            raise HTTPException(status_code=404, detail="Model not found")

        model_url = result.data["model_url"]
        feature_columns = result.data.get("feature_columns", [])

        file_path = model_url.split("/models/")[-1]
        model_bytes = supabase.storage.from_("models").download(file_path)

        temp_path = os.path.join(tempfile.gettempdir(), f"temp_{model_id}.pkl")
        with open(temp_path, "wb") as f:
            f.write(model_bytes)

        bundle = joblib.load(temp_path)
        os.remove(temp_path)

        model = bundle.get("model")

        importance = []

        if hasattr(model, "named_steps"):
            actual_model = model.named_steps.get("model", model)
        else:
            actual_model = model

        if hasattr(actual_model, "feature_importances_"):
            importance = actual_model.feature_importances_.tolist()
        elif hasattr(actual_model, "coef_"):
            coef = actual_model.coef_
            if len(coef.shape) > 1:
                importance = [abs(c) for c in coef[0]]
            else:
                importance = [abs(c) for c in coef]

        return {
            "status": "success",
            "data": {
                "features": feature_columns,
                "importance": importance
            }
        }

    except HTTPException:
        raise
    except Exception as e:
        return {
            "status": "success",
            "data": {"features": [], "importance": []}
        }


@router.get("/models/{model_id}/predictions")
async def get_prediction_history(
        model_id: str,
        user_id: str = Query(...),
        limit: int = 50
):
    """Get prediction history for a model."""
    try:
        model_check = supabase.table("models").select("id").eq(
            "id", model_id
        ).eq("user_id", user_id).execute()

        if not model_check.data:
            raise HTTPException(status_code=404, detail="Model not found")

        result = supabase.table("predictions").select(
            "id, predicted_at, n_samples, source_file"
        ).eq("model_id", model_id).order(
            "predicted_at", desc=True
        ).limit(limit).execute()

        predictions = []
        for pred in result.data:
            predictions.append({
                "id": pred["id"],
                "predicted_at": pred["predicted_at"],
                "n_samples": pred.get("n_samples", 1),
                "source_file": pred.get("source_file")
            })

        return {"status": "success", "data": predictions}

    except HTTPException:
        raise
    except Exception as e:
        print(f"Error fetching prediction history: {e}")
        return {"status": "success", "data": []}


async def calculate_model_summary(user_id: str) -> Dict[str, Any]:
    """Calculate summary statistics for user's models."""
    try:
        result = supabase.table("models").select("*").eq("user_id", user_id).execute()
        models = result.data

        if not models:
            return {
                "total_models": 0,
                "avg_r2": None,
                "avg_accuracy": None,
                "most_used_dataset": None,
                "best_performing_model": None,
                "regression_count": 0,
                "classification_count": 0,
            }

        total = len(models)
        regression_models = [m for m in models if m["problem_type"] == "regression"]
        classification_models = [m for m in models if m["problem_type"] == "classification"]

        avg_r2 = None
        if regression_models:
            r2_scores = [m["metrics"].get("r2_score", 0) for m in regression_models if m["metrics"].get("r2_score")]
            avg_r2 = sum(r2_scores) / len(r2_scores) if r2_scores else None

        avg_accuracy = None
        if classification_models:
            accuracies = [m["metrics"].get("accuracy", 0) for m in classification_models if
                          m["metrics"].get("accuracy")]
            avg_accuracy = sum(accuracies) / len(accuracies) if accuracies else None

        dataset_counts = {}
        for model in models:
            dataset_id = model.get("dataset_id")
            if dataset_id:
                dataset_counts[dataset_id] = dataset_counts.get(dataset_id, 0) + 1

        most_used_dataset = None
        if dataset_counts:
            most_used_id = max(dataset_counts, key=dataset_counts.get)
            dataset_result = supabase.table("datasets").select("name").eq("id", most_used_id).single().execute()
            most_used_dataset = dataset_result.data.get("name") if dataset_result.data else None

        best_model = None
        if regression_models:
            best_model = max(regression_models, key=lambda m: m["metrics"].get("r2_score", -999))
        elif classification_models:
            best_model = max(classification_models, key=lambda m: m["metrics"].get("accuracy", -999))

        return {
            "total_models": total,
            "avg_r2": avg_r2,
            "avg_accuracy": avg_accuracy,
            "most_used_dataset": most_used_dataset,
            "best_performing_model": best_model,
            "regression_count": len(regression_models),
            "classification_count": len(classification_models),
        }

    except Exception as e:
        print(f"Error calculating summary: {e}")
        return {
            "total_models": 0,
            "avg_r2": None,
            "avg_accuracy": None,
            "most_used_dataset": None,
            "best_performing_model": None,
            "regression_count": 0,
            "classification_count": 0,
        }


@router.get("/models/{model_id}/analytics")
async def get_model_analytics(
        model_id: str,
        user_id: str = Query(...),
        sample_size: Optional[int] = Query(None, description="Sample size for large datasets (default: auto)")
):
    """
    Get comprehensive analytics data for model visualization.

    Returns:
        - Actual vs Predicted data (sampled if needed)
        - Residual analysis
        - Statistical metrics
        - Distribution statistics
    """
    try:
        # Fetch model metadata
        model_result = supabase.table("models").select(
            "problem_type, metrics, predictions_url, target_column"
        ).eq("id", model_id).eq("user_id", user_id).single().execute()

        if not model_result.data:
            raise HTTPException(status_code=404, detail="Model not found")

        model_data = model_result.data
        problem_type = model_data.get("problem_type")

        if problem_type != "regression":
            raise HTTPException(
                status_code=400,
                detail="Analytics endpoint only supports regression models"
            )

        predictions_url = model_data.get("predictions_url")

        if not predictions_url:
            return {
                "status": "success",
                "data": {
                    "has_data": False,
                    "message": "No predictions data available"
                }
            }

        # Load predictions data
        file_path = predictions_url.split("/models/")[-1]
        predictions_bytes = supabase.storage.from_("models").download(file_path)
        predictions_data = json.loads(predictions_bytes.decode())

        actual = np.array(predictions_data["actual"])
        predicted = np.array(predictions_data["predicted"])
        residuals = np.array(predictions_data.get("residuals", actual - predicted))

        n_samples = len(actual)

        # Smart sampling for large datasets
        if sample_size is None:
            # Auto-determine sample size based on data size
            if n_samples > 1000:
                sample_size = min(500, n_samples)
            else:
                sample_size = n_samples

        # Stratified sampling to preserve distribution
        if n_samples > sample_size:
            # Sample indices evenly across the range
            indices = np.linspace(0, n_samples - 1, sample_size, dtype=int)
            actual_sample = actual[indices]
            predicted_sample = predicted[indices]
            residuals_sample = residuals[indices]
        else:
            actual_sample = actual
            predicted_sample = predicted
            residuals_sample = residuals

        # Calculate comprehensive statistics

        # Basic metrics
        mae = float(np.mean(np.abs(residuals)))
        rmse = float(np.sqrt(np.mean(residuals ** 2)))
        r2 = float(model_data["metrics"].get("r2_score", 0))

        # Residual statistics
        residual_mean = float(np.mean(residuals))
        residual_std = float(np.std(residuals))
        residual_skewness = float(stats.skew(residuals))
        residual_kurtosis = float(stats.kurtosis(residuals))

        # Normality test (Shapiro-Wilk for small samples, Anderson-Darling for larger)
        normality_p_value = 0.0
        try:
            if len(residuals) < 5000:
                _, normality_p_value = stats.shapiro(residuals[:5000])
                normality_p_value = float(normality_p_value)
            else:
                result = stats.anderson(residuals)
                normality_p_value = 1.0 if result.statistic < result.critical_values[2] else 0.0
        except:
            normality_p_value = 0.0

        # Calculate prediction intervals (95% confidence)
        prediction_std = np.std(residuals)
        margin = float(1.96 * prediction_std)

        # Domain range for perfect prediction line
        min_val = float(min(actual.min(), predicted.min()))
        max_val = float(max(actual.max(), predicted.max()))
        padding = (max_val - min_val) * 0.05

        # Identify outliers (beyond 3 standard deviations)
        outlier_threshold = 3 * residual_std
        outlier_indices = np.where(np.abs(residuals) > outlier_threshold)[0]

        # Prepare chart data - ensure all values are native Python types
        scatter_data = [
            {
                "actual": float(a),
                "predicted": float(p),
                "residual": float(r),
                "is_outlier": bool(i in outlier_indices)
            }
            for i, (a, p, r) in enumerate(zip(actual_sample, predicted_sample, residuals_sample))
        ]

        # Residual distribution bins (for histogram overlay)
        hist, bin_edges = np.histogram(residuals, bins=30, density=True)
        residual_distribution = [
            {"bin_center": float((bin_edges[i] + bin_edges[i + 1]) / 2), "density": float(hist[i])}
            for i in range(len(hist))
        ]

        # Performance interpretation
        interpretation = _interpret_regression_performance(r2, mae, rmse, residual_mean, normality_p_value)

        return {
            "status": "success",
            "data": {
                "has_data": True,
                "sample_info": {
                    "total_samples": int(n_samples),
                    "displayed_samples": int(len(scatter_data)),
                    "is_sampled": n_samples > len(scatter_data)
                },
                "scatter_data": scatter_data,
                "residual_distribution": residual_distribution,
                "domain": {
                    "min": float(min_val - padding),
                    "max": float(max_val + padding)
                },
                "statistics": {
                    "r2_score": r2,
                    "mae": mae,
                    "rmse": rmse,
                    "residual_mean": residual_mean,
                    "residual_std": residual_std,
                    "residual_skewness": residual_skewness,
                    "residual_kurtosis": residual_kurtosis,
                    "normality_p_value": normality_p_value,
                    "prediction_margin": margin,
                    "outlier_count": int(len(outlier_indices)),
                    "outlier_percentage": float(len(outlier_indices) / n_samples * 100)
                },
                "interpretation": interpretation
            }
        }

    except HTTPException:
        raise
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Failed to load analytics: {str(e)}")


def _interpret_regression_performance(
        r2: float,
        mae: float,
        rmse: float,
        residual_mean: float,
        normality_p: float
) -> Dict[str, Any]:
    """Generate human-readable interpretation of model performance."""

    # R² interpretation
    if r2 > 0.9:
        r2_quality = "excellent"
        r2_message = "explains over 90% of variance"
    elif r2 > 0.7:
        r2_quality = "strong"
        r2_message = "captures most patterns effectively"
    elif r2 > 0.5:
        r2_quality = "moderate"
        r2_message = "identifies significant patterns"
    elif r2 > 0.3:
        r2_quality = "weak"
        r2_message = "provides limited predictive value"
    else:
        r2_quality = "poor"
        r2_message = "struggles to capture patterns"

    # Bias check
    bias_threshold = rmse * 0.1
    has_bias = abs(residual_mean) > bias_threshold
    bias_direction = "overestimates" if residual_mean > 0 else "underestimates"

    # Residual normality
    is_normal = normality_p > 0.05

    # Overall assessment
    issues = []
    if r2 < 0.5:
        issues.append("Low R² indicates room for improvement")
    if has_bias:
        issues.append(f"Model systematically {bias_direction} (bias detected)")
    if not is_normal:
        issues.append("Residuals not normally distributed (check for patterns)")
    if mae > rmse * 0.8:
        issues.append("Large errors present (check for outliers)")

    return {
        "r2_quality": r2_quality,
        "r2_message": r2_message,
        "has_bias": bool(has_bias),
        "bias_direction": bias_direction if has_bias else None,
        "residuals_normal": bool(is_normal),
        "issues": issues,
        "recommendations": _generate_recommendations(r2, has_bias, is_normal)
    }


def _generate_recommendations(r2: float, has_bias: bool, is_normal: bool) -> List[str]:
    """Generate actionable recommendations based on performance."""
    recommendations = []

    if r2 < 0.7:
        recommendations.append("Consider feature engineering or trying different algorithms")

    if has_bias:
        recommendations.append("Investigate systematic prediction bias - check for missing features")

    if not is_normal:
        recommendations.append("Non-normal residuals suggest non-linear patterns - try polynomial features")

    if r2 > 0.8:
        recommendations.append("Model performs well - ready for production use")

    return recommendations


@router.get("/models/{model_id}/classification-analytics")
async def get_classification_analytics(
        model_id: str,
        user_id: str = Query(..., description="User ID")
):
    """
    Get comprehensive classification analytics including confusion matrix.

    Returns:
        - Confusion matrix data
        - Per-class metrics (precision, recall, f1)
        - Overall performance metrics
        - Class distribution
    """
    try:
        # Fetch model metadata
        model_result = supabase.table("models").select(
            "problem_type, metrics, predictions_url, target_column"
        ).eq("id", model_id).eq("user_id", user_id).single().execute()

        if not model_result.data:
            raise HTTPException(status_code=404, detail="Model not found")

        model_data = model_result.data
        problem_type = model_data.get("problem_type")

        if problem_type != "classification":
            raise HTTPException(
                status_code=400,
                detail="Analytics endpoint only supports classification models"
            )

        predictions_url = model_data.get("predictions_url")

        if not predictions_url:
            return {
                "status": "success",
                "data": {
                    "has_data": False,
                    "message": "No predictions data available"
                }
            }

        # Load predictions data
        file_path = predictions_url.split("/models/")[-1]
        predictions_bytes = supabase.storage.from_("models").download(file_path)
        predictions_data = json.loads(predictions_bytes.decode())

        y_true = np.array(predictions_data["actual"])
        y_pred = np.array(predictions_data["predicted"])

        # Get unique classes
        classes = np.unique(np.concatenate([y_true, y_pred]))
        n_classes = len(classes)

        # Calculate confusion matrix
        cm = confusion_matrix(y_true, y_pred, labels=classes)

        # Build confusion matrix data for frontend
        confusion_matrix_data = []
        for i, actual_class in enumerate(classes):
            for j, predicted_class in enumerate(classes):
                confusion_matrix_data.append({
                    "actual": str(actual_class),
                    "predicted": str(predicted_class),
                    "count": int(cm[i][j]),
                    "is_correct": bool(i == j)
                })

        # Calculate per-class metrics
        precision, recall, f1, support = precision_recall_fscore_support(
            y_true, y_pred, labels=classes, zero_division=0
        )

        class_metrics = []
        for i, class_label in enumerate(classes):
            class_metrics.append({
                "class": str(class_label),
                "precision": float(precision[i]),
                "recall": float(recall[i]),
                "f1_score": float(f1[i]),
                "support": int(support[i])
            })

        # Overall metrics
        overall_metrics = model_data["metrics"]

        # Calculate additional insights
        total_predictions = len(y_true)
        correct_predictions = int(np.sum(y_true == y_pred))
        accuracy = float(correct_predictions / total_predictions)

        # Find most confused pairs
        confusion_pairs = []
        for i, actual_class in enumerate(classes):
            for j, predicted_class in enumerate(classes):
                if i != j and cm[i][j] > 0:
                    confusion_pairs.append({
                        "actual": str(actual_class),
                        "predicted": str(predicted_class),
                        "count": int(cm[i][j]),
                        "percentage": float(cm[i][j] / np.sum(cm[i]) * 100)
                    })

        # Sort by count and get top 5
        confusion_pairs.sort(key=lambda x: x["count"], reverse=True)
        top_confusions = confusion_pairs[:5]

        # Class distribution
        class_distribution = []
        for i, class_label in enumerate(classes):
            class_count = int(support[i])
            class_distribution.append({
                "class": str(class_label),
                "count": class_count,
                "percentage": float(class_count / total_predictions * 100)
            })

        # Performance interpretation
        interpretation = _interpret_classification_performance(
            overall_metrics.get("accuracy", 0),
            overall_metrics.get("f1_score", 0),
            n_classes,
            class_metrics
        )

        return {
            "status": "success",
            "data": {
                "has_data": True,
                "confusion_matrix": confusion_matrix_data,
                "class_metrics": class_metrics,
                "overall_metrics": {
                    "accuracy": accuracy,
                    "precision": float(overall_metrics.get("precision", 0)),
                    "recall": float(overall_metrics.get("recall", 0)),
                    "f1_score": float(overall_metrics.get("f1_score", 0)),
                    "total_predictions": total_predictions,
                    "correct_predictions": correct_predictions,
                    "n_classes": n_classes
                },
                "class_distribution": class_distribution,
                "top_confusions": top_confusions,
                "interpretation": interpretation
            }
        }

    except HTTPException:
        raise
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Failed to load analytics: {str(e)}")


def _interpret_classification_performance(
        accuracy: float,
        f1_score: float,
        n_classes: int,
        class_metrics: List[Dict]
) -> Dict[str, Any]:
    """Generate human-readable interpretation of classification performance."""

    # Overall quality assessment
    if accuracy > 0.95 and f1_score > 0.95:
        quality = "excellent"
        quality_message = "achieves exceptional performance across all classes"
    elif accuracy > 0.85 and f1_score > 0.85:
        quality = "strong"
        quality_message = "performs very well with good balance"
    elif accuracy > 0.75:
        quality = "good"
        quality_message = "shows solid performance"
    elif accuracy > 0.6:
        quality = "moderate"
        quality_message = "provides reasonable classification"
    else:
        quality = "weak"
        quality_message = "struggles with classification accuracy"

    # Check for class imbalance issues
    precisions = [m["precision"] for m in class_metrics]
    recalls = [m["recall"] for m in class_metrics]
    f1_scores = [m["f1_score"] for m in class_metrics]

    precision_std = float(np.std(precisions))
    recall_std = float(np.std(recalls))
    f1_std = float(np.std(f1_scores))

    has_imbalance = precision_std > 0.2 or recall_std > 0.2

    # Find worst performing class
    worst_class = min(class_metrics, key=lambda x: x["f1_score"])
    best_class = max(class_metrics, key=lambda x: x["f1_score"])

    # Generate issues
    issues = []
    if accuracy < 0.8:
        issues.append(f"Overall accuracy of {accuracy * 100:.1f}% suggests room for improvement")

    if has_imbalance:
        issues.append(f"Significant performance variance across classes (std: {f1_std:.2f})")
        issues.append(
            f"Class '{worst_class['class']}' has notably lower performance (F1: {worst_class['f1_score']:.2f})")

    if f1_score < 0.7:
        issues.append("F1-score indicates imbalance between precision and recall")

    # Generate recommendations
    recommendations = []

    if has_imbalance:
        recommendations.append(
            f"Focus on improving '{worst_class['class']}' class - consider oversampling or class weights")

    if accuracy < 0.8:
        recommendations.append("Try ensemble methods or feature engineering to boost performance")

    if recall_std > 0.2:
        recommendations.append(
            "High recall variance suggests some classes are harder to detect - review training data balance")

    if not recommendations:
        recommendations.append("Model performs well - monitor performance on new data")

    return {
        "quality": quality,
        "quality_message": quality_message,
        "has_imbalance": bool(has_imbalance),
        "worst_class": worst_class["class"],
        "best_class": best_class["class"],
        "issues": issues,
        "recommendations": recommendations,
        "balance_score": float(1 - f1_std)  # Higher is better (0-1)
    }