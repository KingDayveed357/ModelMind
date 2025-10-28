from typing import Any, Dict

from app.core.config import get_settings


def get_cors_kwargs() -> Dict[str, Any]:
    settings = get_settings()
    return {
        "allow_origins": settings.cors_origins,
        "allow_credentials": True,
        "allow_methods": ["*"],
        "allow_headers": ["*"]
    }


