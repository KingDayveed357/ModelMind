"""
User management endpoints
File: app/api/routes/users.py
"""
import logging
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from supabase import create_client, Client
from app.core.security import verify_supabase_token
from app.core.config import get_settings

logger = logging.getLogger(__name__)
router = APIRouter()
settings = get_settings()


def get_supabase_admin() -> Client:
    """
    Get Supabase client with service role (admin) privileges
    Required for deleting users from auth
    """
    return create_client(
        settings.supabase_url,
        settings.supabase_service_role_key or settings.supabase_anon_key
    )


@router.delete("/users/delete-account", status_code=status.HTTP_200_OK)
async def delete_user_account(token_data: dict = Depends(verify_supabase_token)):
    """
    Delete the authenticated user's account and all associated data.

    This endpoint:
    - Validates the user's authentication
    - Deletes all user data from the database (cascading deletes)
    - Deletes the user from Supabase Auth

    The database schema handles cascading deletes automatically:
    - Deleting user → deletes datasets, models, training_history

    Returns:
        dict: Success message with deleted user ID and timestamp
    """
    user_id = token_data.get("sub")

    if not user_id:
        logger.error("Token missing 'sub' claim")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token: user ID not found"
        )

    supabase = get_supabase_admin()

    try:
        logger.info(f"Starting account deletion for user: {user_id}")

        # Step 1: Verify user exists in database
        user_check = supabase.table("users").select("id").eq("id", user_id).execute()

        if not user_check.data:
            logger.warning(f"User {user_id} not found in database")
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )

        # Step 2: Delete from users table
        # This will cascade delete all related records:
        # - datasets (on delete cascade)
        # - models (on delete cascade)
        # - training_history (via models cascade)
        logger.info(f"Deleting user data from database for user: {user_id}")

        delete_result = supabase.table("users").delete().eq("id", user_id).execute()

        if not delete_result:
            logger.error(f"Failed to delete user {user_id} from database")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to delete user data from database"
            )

        logger.info(f"Successfully deleted database records for user: {user_id}")

        # Step 3: Delete from Supabase Auth
        # Note: This requires service_role_key with admin privileges
        if settings.supabase_service_role_key:
            logger.info(f"Deleting user from Supabase Auth: {user_id}")

            try:
                # Using admin API to delete user from auth
                supabase.auth.admin.delete_user(user_id)
                logger.info(f"Successfully deleted auth user: {user_id}")
            except Exception as auth_error:
                # Log but don't fail if auth deletion fails
                # Database records are already deleted
                logger.error(f"Failed to delete auth user {user_id}: {str(auth_error)}")
                logger.warning("Database records deleted but auth user may still exist")
        else:
            logger.warning("Service role key not configured - skipping auth deletion")

        return {
            "message": "Account successfully deleted",
            "user_id": user_id,
            "deleted_at": datetime.utcnow().isoformat()
        }

    except HTTPException:
        # Re-raise HTTP exceptions as-is
        raise
    except Exception as e:
        logger.error(f"Error deleting user account {user_id}: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete account: {str(e)}"
        )


@router.get("/users/stats", status_code=status.HTTP_200_OK)
async def get_user_stats(token_data: dict = Depends(verify_supabase_token)):
    """
    Get statistics about user's data (useful for showing before deletion)

    Returns:
        dict: Counts of user's datasets, models, etc.
    """
    user_id = token_data.get("sub")

    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token: user ID not found"
        )

    supabase = get_supabase_admin()

    try:
        # Count datasets
        datasets = supabase.table("datasets")\
            .select("id", count="exact")\
            .eq("user_id", user_id)\
            .execute()

        # Count models
        models = supabase.table("models")\
            .select("id", count="exact")\
            .eq("user_id", user_id)\
            .execute()

        return {
            "user_id": user_id,
            "datasets_count": datasets.count or 0,
            "models_count": models.count or 0
        }

    except Exception as e:
        logger.error(f"Error fetching user stats for {user_id}: {str(e)}")
        # Return zeros instead of failing
        return {
            "user_id": user_id,
            "datasets_count": 0,
            "models_count": 0
        }