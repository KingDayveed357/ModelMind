#app/api/routes/predict.py
from fastapi import APIRouter, Depends, File, UploadFile, HTTPException, Query, Body
from typing import Dict, Any, List, Optional
from app.api.deps import get_current_user_id
from app.services.predict_service import predict, predict_from_file, PredictionError
import pandas as pd

router = APIRouter()


@router.post("/{model_id}/single")
async def make_single_prediction(
        model_id: str,
        input_data: Dict[str, Any] = Body(...),
        user_id: str = Depends(get_current_user_id)
):
    """Make a single prediction with input features."""
    try:
        result = await predict(
            model_id=model_id,
            user_id=user_id,
            input_data=input_data,
            return_probabilities=True,
            save_predictions=True
        )
        return {"status": "success", "data": result}
    except PredictionError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")


@router.post("/{model_id}/batch")
async def make_batch_prediction(
        model_id: str,
        file: UploadFile = File(...),
        user_id: str = Depends(get_current_user_id)
):
    """Make predictions on uploaded CSV file."""
    try:
        if not file.filename.endswith('.csv'):
            raise HTTPException(status_code=400, detail="Only CSV files are supported")

        result = await predict_from_file(
            model_id=model_id,
            user_id=user_id,
            file=file,
            return_probabilities=True,
            batch_size=1000
        )
        return {"status": "success", "data": result}
    except PredictionError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Batch prediction failed: {str(e)}")


@router.get("/models/{model_id}/for-prediction")
async def get_model_for_prediction(
        model_id: str,
        user_id: str = Depends(get_current_user_id)
):
    """Get model details needed for prediction UI."""
    from app.db.supabase_client import supabase

    result = supabase.table("models").select(
        "id, model_name, model_type, problem_type, target_column, feature_columns, metrics"
    ).eq("id", model_id).eq("user_id", user_id).single().execute()

    if not result.data:
        raise HTTPException(status_code=404, detail="Model not found")

    return {"status": "success", "data": result.data}