from fastapi import APIRouter, Depends

from app.api.deps import get_current_user_id

router = APIRouter()


@router.get("/history")
async def get_history(user_id: str = Depends(get_current_user_id)):
    return {"items": [], "user_id": user_id}


