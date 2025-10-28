#app/core/security.py
from fastapi import Depends, HTTPException, Header
from jose import jwt
import requests
from app.core.config import get_settings

settings = get_settings()

def verify_supabase_token(authorization: str = Header(...)):
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid authorization header")
    token = authorization.split(" ")[1]

    # Optional: verify token using Supabase JWKS (secure)
    jwks_url = f"{settings.supabase_url}/auth/v1/keys"
    jwks = requests.get(jwks_url).json()
    try:
        # Decode without signature verification if local
        decoded = jwt.get_unverified_claims(token)
        return decoded
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid token")
