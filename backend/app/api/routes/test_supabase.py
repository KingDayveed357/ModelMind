from fastapi import APIRouter
from app.db.supabase_client import supabase

router = APIRouter(prefix="/api/test", tags=["Test"])

@router.get("/ping")
def ping_supabase():
    try:
        response = supabase.table("users").select("*").limit(1).execute()
        return {
            "status": "ok",
            "message": "Supabase connected successfully!",
            "data": response.data
        }
    except Exception as e:
        return {"status": "error", "message": str(e)}
