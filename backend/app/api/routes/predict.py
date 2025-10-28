from typing import Any, Dict

from fastapi import APIRouter, Depends

from app.api.deps import get_current_user_id

router = APIRouter()


@router.post("/predict")
async def predict(payload: Dict[str, Any], user_id: str = Depends(get_current_user_id)):
    return {"predictions": [], "user_id": user_id}


