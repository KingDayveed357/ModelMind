# app/api/routes/evaluate.py
from fastapi import APIRouter, HTTPException
from app.services.evaluate_service import evaluate_model

router = APIRouter(prefix="/evaluate")

@router.post("/{model_id}")
async def evaluate_route(model_id: str):
    try:
        result = await evaluate_model(model_id)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Evaluation failed: {e}")
