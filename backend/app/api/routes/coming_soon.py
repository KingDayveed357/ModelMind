# backend/app/api/routes/coming_soon.py
from datetime import datetime
from typing import Optional, Literal
import logging

from fastapi import APIRouter, HTTPException, BackgroundTasks
from pydantic import BaseModel, EmailStr, Field

from app.db.supabase_client import supabase
from app.services.email_service import EmailService

router = APIRouter()
logger = logging.getLogger(__name__)


# Pydantic Models
class WaitlistRequest(BaseModel):
    email: EmailStr
    user_id: Optional[str] = None


class FeedbackRequest(BaseModel):
    email: Optional[EmailStr] = None
    name: Optional[str] = None
    feedback_type: Literal['suggestion', 'bug', 'feature', 'other']
    subject: str = Field(..., min_length=3, max_length=200)
    message: str = Field(..., min_length=10, max_length=2000)
    user_id: Optional[str] = None


class LaunchConfigResponse(BaseModel):
    launch_date: datetime
    days_remaining: int
    hours_remaining: int
    minutes_remaining: int
    seconds_remaining: int


@router.get("/launch-config", response_model=LaunchConfigResponse)
async def get_launch_config():
    """Get the launch date and countdown information"""
    logger.info("📊 GET /launch-config - Fetching launch configuration")

    try:
        result = supabase.table("launch_config").select("*").limit(1).execute()

        if not result.data:
            logger.error("❌ Launch config not found in database!")
            raise HTTPException(status_code=404, detail="Launch config not found")

        launch_date = datetime.fromisoformat(result.data[0]["launch_date"].replace('Z', '+00:00'))
        now = datetime.now(launch_date.tzinfo)

        time_diff = launch_date - now
        total_seconds = int(time_diff.total_seconds())

        if total_seconds < 0:
            total_seconds = 0

        days = total_seconds // (24 * 3600)
        hours = (total_seconds % (24 * 3600)) // 3600
        minutes = (total_seconds % 3600) // 60
        seconds = total_seconds % 60

        logger.info(f"✅ Launch config fetched: {days}d {hours}h {minutes}m {seconds}s remaining")

        return LaunchConfigResponse(
            launch_date=launch_date,
            days_remaining=days,
            hours_remaining=hours,
            minutes_remaining=minutes,
            seconds_remaining=seconds
        )

    except Exception as e:
        logger.error(f"❌ Error fetching launch config: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error fetching launch config: {str(e)}")


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

        # Insert new waitlist entry
        data = {
            "email": request.email,
            "user_id": request.user_id if request.user_id else None
        }

        result = supabase.table("waitlist").insert(data).execute()
        logger.info(f"✅ Email added to database: {request.email}")

        # Send confirmation email in background
        logger.info(f"📧 Queueing confirmation email to: {request.email}")
        background_tasks.add_task(
            EmailService.send_waitlist_confirmation,
            request.email
        )

        return {"message": "Successfully joined the waitlist!", "already_subscribed": False}

    except Exception as e:
        logger.error(f"❌ Error joining waitlist: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error joining waitlist: {str(e)}")


@router.post("/feedback")
async def submit_feedback(request: FeedbackRequest, background_tasks: BackgroundTasks):
    """Submit feedback, suggestions, or bug reports"""
    logger.info("=" * 80)
    logger.info(f"💬 POST /feedback - New feedback submission")
    logger.info(f"Type: {request.feedback_type}")
    logger.info(f"From: {request.name or 'Anonymous'} ({request.email or 'No email'})")
    logger.info(f"Subject: {request.subject}")
    logger.info("=" * 80)

    try:
        # Validate and sanitize input
        data = {
            "email": request.email,
            "name": request.name,
            "feedback_type": request.feedback_type,
            "subject": request.subject.strip(),
            "message": request.message.strip(),
            "user_id": request.user_id if request.user_id else None,
            "status": "open",
            "priority": "medium"
        }

        # Auto-prioritize bugs as high priority
        if request.feedback_type == "bug":
            data["priority"] = "high"
            logger.info("🐛 Bug report - Set priority to HIGH")

        result = supabase.table("feedback").insert(data).execute()
        logger.info(f"✅ Feedback saved to database with ID: {result.data[0]['id']}")

        # Send confirmation to user (if email provided)
        if request.email:
            logger.info(f"📧 Queueing user confirmation email to: {request.email}")
            background_tasks.add_task(
                EmailService.send_feedback_confirmation,
                request.email,
                request.feedback_type,
                request.subject
            )
        else:
            logger.info("ℹ️ No email provided - skipping user confirmation")

        # IMPORTANT: Always notify team about feedback
        logger.info(f"📧 Queueing admin notification to: modelmind.team@gmail.com")
        background_tasks.add_task(
            EmailService.send_feedback_notification_to_team,
            request.feedback_type,
            request.subject,
            request.message,
            request.name,
            request.email
        )

        return {
            "message": "Feedback submitted successfully!",
            "feedback_id": result.data[0]["id"]
        }

    except Exception as e:
        logger.error(f"❌ Error submitting feedback: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error submitting feedback: {str(e)}")


@router.get("/feedback")
async def get_feedback(user_id: Optional[str] = None, email: Optional[str] = None):
    """Get feedback submissions (filtered by user_id or email)"""
    logger.info(f"📊 GET /feedback - Fetching feedback (user_id={user_id}, email={email})")

    try:
        query = supabase.table("feedback").select("*")

        if user_id:
            query = query.eq("user_id", user_id)
        elif email:
            query = query.eq("email", email)
        else:
            logger.error("❌ No filter provided (user_id or email required)")
            raise HTTPException(status_code=400, detail="user_id or email required")

        result = query.order("created_at", desc=True).execute()
        logger.info(f"✅ Found {len(result.data)} feedback entries")

        return {"feedback": result.data}

    except Exception as e:
        logger.error(f"❌ Error fetching feedback: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error fetching feedback: {str(e)}")