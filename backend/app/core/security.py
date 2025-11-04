# #app/core/security.py
# from fastapi import Depends, HTTPException, Header
# from jose import jwt
# import requests
# from app.core.config import get_settings
#
# settings = get_settings()
#
# def verify_supabase_token(authorization: str = Header(...)):
#     if not authorization.startswith("Bearer "):
#         raise HTTPException(status_code=401, detail="Invalid authorization header")
#     token = authorization.split(" ")[1]
#
#     # Optional: verify token using Supabase JWKS (secure)
#     jwks_url = f"{settings.supabase_url}/auth/v1/keys"
#     jwks = requests.get(jwks_url).json()
#     try:
#         # Decode without signature verification if local
#         decoded = jwt.get_unverified_claims(token)
#         return decoded
#     except Exception:
#         raise HTTPException(status_code=401, detail="Invalid token")

"""
Security utilities for JWT verification and authentication
File: app/core/security.py
"""
from fastapi import Depends, HTTPException, Header, status
from jose import jwt, JWTError
import requests
from functools import lru_cache
from typing import Dict, Optional
import logging
from app.core.config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()


@lru_cache(maxsize=1)
def get_supabase_jwks() -> Dict:
    """
    Fetch and cache Supabase JWKS (JSON Web Key Set)
    This is used to verify JWT signatures
    """
    try:
        jwks_url = f"{settings.supabase_url}/auth/v1/keys"
        response = requests.get(jwks_url, timeout=5)
        response.raise_for_status()
        return response.json()
    except Exception as e:
        logger.error(f"Failed to fetch JWKS: {str(e)}")
        return {}


def verify_supabase_token(authorization: str = Header(...)) -> Dict:
    """
    Verify Supabase JWT token from Authorization header

    Args:
        authorization: Bearer token from Authorization header

    Returns:
        Dict containing decoded token claims (includes 'sub' for user_id)

    Raises:
        HTTPException: If token is invalid or missing
    """
    # Check authorization header format
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authorization header format. Expected 'Bearer <token>'",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Extract token
    token = authorization.split(" ", 1)[1]

    try:
        # For production: verify signature using JWKS
        if settings.environment == "production":
            jwks = get_supabase_jwks()

            # Decode and verify token
            decoded = jwt.decode(
                token,
                jwks,
                algorithms=["RS256"],
                audience="authenticated",
                options={
                    "verify_signature": True,
                    "verify_aud": True,
                    "verify_exp": True,
                }
            )
        else:
            # For development: decode without verification
            # WARNING: Only use this in development!
            decoded = jwt.get_unverified_claims(token)

            # Basic validation even in development
            if not decoded.get("sub"):
                raise JWTError("Token missing 'sub' claim")

        # Additional validation
        if not decoded.get("sub"):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token: missing user ID",
            )

        logger.info(f"Token verified for user: {decoded.get('sub')}")
        return decoded

    except JWTError as e:
        logger.error(f"JWT validation error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid token: {str(e)}",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except Exception as e:
        logger.error(f"Token verification error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token verification failed",
            headers={"WWW-Authenticate": "Bearer"},
        )


def get_current_user_id(token_data: Dict = Depends(verify_supabase_token)) -> str:
    """
    Extract user ID from verified token

    Args:
        token_data: Decoded token data from verify_supabase_token

    Returns:
        User ID (UUID string)
    """
    user_id = token_data.get("sub")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User ID not found in token"
        )
    return user_id