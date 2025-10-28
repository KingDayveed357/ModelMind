# backend/config/settings.py
from functools import lru_cache
from typing import List, Optional
from pydantic import Field
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    app_name: str = "RegressLab API"
    environment: str = Field(default="development")
    cors_origins: List[str] = Field(default_factory=lambda: ["http://localhost:3000"])

    # Database & Supabase
    database_url: Optional[str] = None
    supabase_url: str
    supabase_anon_key: str
    supabase_service_role_key: Optional[str] = None
    supabase_jwks_url: Optional[str] = None

    # Other integrations
    openai_api_key: Optional[str] = None

    class Config:
        env_file = ".env"


@lru_cache
def get_settings() -> Settings:
    return Settings()
