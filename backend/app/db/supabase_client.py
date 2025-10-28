# backend/app/db/supabase_client.py
from supabase import create_client
from app.core.config import get_settings

settings = get_settings()
supabase = create_client(settings.supabase_url, settings.supabase_service_role_key)
print(supabase)
