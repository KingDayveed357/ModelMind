# app/api/deps.py
from typing import Optional
from fastapi import Depends, Header, HTTPException, status
from app.core.security import verify_supabase_token

def get_current_user_id(authorization: Optional[str] = Header(default=None)) -> str:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing bearer token")

    decoded = verify_supabase_token(authorization)
    user_id = decoded.get("sub")  # Supabase stores user id in the "sub" claim

    if not user_id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")

    return user_id
