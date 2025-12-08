from datetime import datetime, timezone
from typing import Optional, Literal
import logging
import asyncio

from fastapi import APIRouter, HTTPException, BackgroundTasks
from pydantic import BaseModel, EmailStr, Field
from app.db.supabase_client import supabase
from app.services.email_service import EmailService

router = APIRouter()
logger = logging.getLogger(__name__)


# ===============================
# 🔹 Pydantic Models
# ===============================

class WaitlistRequest(BaseModel):
    email: EmailStr
    user_id: Optional[str] = None


class FeedbackRequest(BaseModel):
    email: Optional[EmailStr] = None
    name: Optional[str] = Field(None, max_length=100)
    feedback_type: Literal["suggestion", "bug", "feature", "other"]
    subject: str = Field(..., min_length=3, max_length=200)
    message: str = Field(..., min_length=10, max_length=2000)
    user_id: Optional[str] = None


class LaunchConfigResponse(BaseModel):
    launch_date: datetime
    days_remaining: int
    hours_remaining: int
    minutes_remaining: int
    seconds_remaining: int


# ===============================
# 🔹 Launch Config Endpoint
# ===============================

@router.get("/launch-config", response_model=LaunchConfigResponse)
async def get_launch_config():
    """Get the launch date and countdown information"""
    logger.info("📊 GET /launch-config - Fetching launch configuration")

    try:
        result = supabase.table("launch_config").select("*").limit(1).execute()

        if not result.data:
            logger.error("❌ Launch config not found in database!")
            raise HTTPException(status_code=404, detail="Launch config not found")

        launch_date = datetime.fromisoformat(
            result.data[0]["launch_date"].replace("Z", "+00:00")
        )
        now = datetime.now(timezone.utc)

        total_seconds = max(0, int((launch_date - now).total_seconds()))
        days, rem = divmod(total_seconds, 86400)
        hours, rem = divmod(rem, 3600)
        minutes, seconds = divmod(rem, 60)

        logger.info(f"✅ Launch in {days}d {hours}h {minutes}m {seconds}s")

        return LaunchConfigResponse(
            launch_date=launch_date,
            days_remaining=days,
            hours_remaining=hours,
            minutes_remaining=minutes,
            seconds_remaining=seconds,
        )

    except Exception as e:
        logger.exception("❌ Error fetching launch config")
        raise HTTPException(status_code=500, detail=str(e))


# ===============================
# 🔹 Waitlist Endpoint
# ===============================

@router.post("/waitlist")
async def join_waitlist(request: WaitlistRequest, background_tasks: BackgroundTasks):
    """Add email to waitlist for launch notifications"""
    logger.info(f"📝 POST /waitlist - New signup: {request.email}")

    try:
        # Check if email already exists
        existing = supabase.table("waitlist").select("email").eq("email", request.email).execute()
        if existing.data:
            logger.info(f"ℹ️ Email already on waitlist: {request.email}")
            return {"message": "You're already on the waitlist!", "already_subscribed": True}

        # Insert new entry
        data = {"email": request.email, "user_id": request.user_id}
        result = supabase.table("waitlist").insert(data).execute()

        if not result.data:
            logger.error("❌ Supabase insert returned no data")
            raise HTTPException(status_code=500, detail="Failed to save waitlist entry")

        logger.info(f"✅ Waitlist entry saved for {request.email}")

        # Background email task — wrapped to ensure async runs
        async def send_waitlist_email():
            await EmailService.send_waitlist_confirmation(request.email)

        background_tasks.add_task(asyncio.run, send_waitlist_email())

        return {"message": "Successfully joined the waitlist!", "already_subscribed": False}

    except Exception as e:
        logger.exception("❌ Error joining waitlist")
        raise HTTPException(status_code=500, detail=str(e))


# ===============================
# 🔹 Feedback Endpoint
# ===============================

@router.post("/feedback")
async def submit_feedback(request: FeedbackRequest, background_tasks: BackgroundTasks):
    """Submit feedback, suggestions, or bug reports"""
    logger.info("=" * 80)
    logger.info(f"💬 POST /feedback - New submission")
    logger.info(f"Type: {request.feedback_type} | From: {request.name or 'Anonymous'} ({request.email or 'No email'})")
    logger.info(f"Subject: {request.subject}")
    logger.info("=" * 80)

    try:
        # Prepare sanitized data
        data = {
            "email": request.email,
            "name": request.name.strip() if request.name else None,
            "feedback_type": request.feedback_type,
            "subject": request.subject.strip(),
            "message": request.message.strip(),
            "user_id": request.user_id,
            "status": "open",
            "priority": "high" if request.feedback_type == "bug" else "medium",
        }

        # Insert into Supabase
        result = supabase.table("feedback").insert(data).execute()
        if not result.data:
            logger.error("❌ Feedback insert failed (empty response)")
            raise HTTPException(status_code=500, detail="Feedback not saved")

        feedback_id = result.data[0].get("id")
        logger.info(f"✅ Feedback saved (ID: {feedback_id})")

        # Define async email wrappers to run safely in background
        async def send_user_confirmation():
            await EmailService.send_feedback_confirmation(
                request.email,
                request.feedback_type,
                request.subject
            )

        async def send_admin_notification():
            await EmailService.send_feedback_notification_to_team(
                request.feedback_type,
                request.subject,
                request.message,
                request.name,
                request.email
            )

        # Queue background tasks
        if request.email:
            logger.info(f"📧 Queueing confirmation email → {request.email}")
            background_tasks.add_task(asyncio.run, send_user_confirmation())
        else:
            logger.info("ℹ️ Skipping user confirmation (no email provided)")

        logger.info("📧 Queueing admin notification → modelmind.team@gmail.com")
        background_tasks.add_task(asyncio.run, send_admin_notification())

        return {"message": "Feedback submitted successfully!", "feedback_id": feedback_id}

    except Exception as e:
        logger.exception("❌ Error submitting feedback")
        raise HTTPException(status_code=500, detail=str(e))


# ===============================
# 🔹 Fetch Feedback (User Filtered)
# ===============================

@router.get("/feedback")
async def get_feedback(user_id: Optional[str] = None, email: Optional[str] = None):
    """Get feedback submissions (filtered by user_id or email)"""
    logger.info(f"📊 GET /feedback - Fetching feedback (user_id={user_id}, email={email})")

    if not user_id and not email:
        logger.error("❌ Missing required query param: user_id or email")
        raise HTTPException(status_code=400, detail="user_id or email required")

    try:
        query = supabase.table("feedback").select("*")
        if user_id:
            query = query.eq("user_id", user_id)
        elif email:
            query = query.eq("email", email)

        result = query.order("created_at", desc=True).execute()
        logger.info(f"✅ Retrieved {len(result.data)} feedback entries")

        return {"feedback": result.data}

    except Exception as e:
        logger.exception("❌ Error fetching feedback")
        raise HTTPException(status_code=500, detail=str(e))
