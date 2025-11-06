# backend/app/services/email_service.py
import sib_api_v3_sdk
from sib_api_v3_sdk.rest import ApiException
from app.core.config import get_settings
from typing import Optional
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

settings = get_settings()

# Configure Brevo API
configuration = sib_api_v3_sdk.Configuration()
configuration.api_key['api-key'] = settings.brevo_api_key

# Log configuration on startup
logger.info("=" * 60)
logger.info("📧 EMAIL SERVICE INITIALIZED")
logger.info(f"Brevo API Key: {'*' * 20}{settings.brevo_api_key[-8:] if len(settings.brevo_api_key) > 8 else '***'}")
logger.info(f"Sender Email: {settings.brevo_sender_email}")
logger.info(f"Admin Email: modelmind.team@gmail.com")
logger.info("=" * 60)


class EmailService:
    """Service for sending emails via Brevo (formerly Sendinblue)"""

    @staticmethod
    async def send_email(
            to: str,
            subject: str,
            html_content: str,
            from_email: Optional[str] = None,
            from_name: Optional[str] = None
    ) -> bool:
        """
        Send an email using Brevo

        Args:
            to: Recipient email address
            subject: Email subject
            html_content: HTML email body
            from_email: Sender email (default from settings)
            from_name: Sender name (default: ModelMind)

        Returns:
            bool: True if sent successfully, False otherwise
        """
        logger.info("=" * 60)
        logger.info(f"📤 ATTEMPTING TO SEND EMAIL")
        logger.info(f"To: {to}")
        logger.info(f"Subject: {subject}")

        try:
            api_instance = sib_api_v3_sdk.TransactionalEmailsApi(
                sib_api_v3_sdk.ApiClient(configuration)
            )

            # Use default sender email from settings
            if not from_email:
                from_email = settings.brevo_sender_email
            if not from_name:
                from_name = "ModelMind"

            logger.info(f"From: {from_name} <{from_email}>")

            # Create email
            send_smtp_email = sib_api_v3_sdk.SendSmtpEmail(
                to=[{"email": to}],
                sender={"email": from_email, "name": from_name},
                subject=subject,
                html_content=html_content
            )

            logger.info("Calling Brevo API...")

            # Send email
            api_response = api_instance.send_transac_email(send_smtp_email)

            logger.info(f"✅ EMAIL SENT SUCCESSFULLY!")
            logger.info(f"Message ID: {api_response.message_id}")
            logger.info("=" * 60)
            return True

        except ApiException as e:
            logger.error("=" * 60)
            logger.error(f"❌ BREVO API ERROR!")
            logger.error(f"Status Code: {e.status}")
            logger.error(f"Reason: {e.reason}")
            logger.error(f"Body: {e.body}")
            logger.error(f"To: {to}")
            logger.error("=" * 60)
            return False
        except Exception as e:
            logger.error("=" * 60)
            logger.error(f"❌ GENERAL ERROR SENDING EMAIL!")
            logger.error(f"Error Type: {type(e).__name__}")
            logger.error(f"Error Message: {str(e)}")
            logger.error(f"To: {to}")
            logger.error("=" * 60)
            return False

    @staticmethod
    async def send_waitlist_confirmation(email: str) -> bool:
        """Send confirmation email for waitlist signup"""
        logger.info(f"🎯 Preparing WAITLIST CONFIRMATION email for {email}")

        subject = "Welcome to ModelMind Dashboard AI Waitlist!"
        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
                body {{ 
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; 
                    line-height: 1.6; 
                    color: #333;
                    margin: 0;
                    padding: 0;
                    background-color: #f5f5f5;
                }}
                .container {{ 
                    max-width: 600px; 
                    margin: 20px auto; 
                    background: white;
                    border-radius: 12px;
                    overflow: hidden;
                    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                }}
                .header {{ 
                    background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%); 
                    padding: 40px 30px; 
                    text-align: center;
                }}
                .header h1 {{ 
                    color: white; 
                    margin: 0; 
                    font-size: 28px;
                    font-weight: 600;
                }}
                .content {{ 
                    padding: 40px 30px;
                }}
                .content h2 {{
                    color: #1f2937;
                    margin-top: 0;
                }}
                .features {{
                    background: #f9fafb;
                    padding: 20px;
                    border-radius: 8px;
                    margin: 20px 0;
                }}
                .features ul {{
                    margin: 10px 0;
                    padding-left: 20px;
                }}
                .features li {{
                    margin: 8px 0;
                    color: #4b5563;
                }}
                .button {{ 
                    display: inline-block; 
                    background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
                    color: white !important; 
                    padding: 14px 32px; 
                    text-decoration: none; 
                    border-radius: 8px; 
                    margin: 20px 0;
                    font-weight: 600;
                    text-align: center;
                }}
                .footer {{ 
                    text-align: center; 
                    padding: 30px; 
                    background: #f9fafb;
                    color: #6b7280; 
                    font-size: 14px;
                    border-top: 1px solid #e5e7eb;
                }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>🚀 You're on the List!</h1>
                </div>
                <div class="content">
                    <h2>Thanks for joining the waitlist!</h2>
                    <p>We're thrilled to have you as an early supporter of the Dashboard AI Assistant.</p>

                    <div class="features">
                        <p><strong>Here's what happens next:</strong></p>
                        <ul>
                            <li>✨ We'll notify you the moment we launch</li>
                            <li>🎁 Get early access to exclusive features</li>
                            <li>💡 Receive updates on our progress</li>
                            <li>🚀 Be among the first to experience AI-powered analytics</li>
                        </ul>
                    </div>

                    <p>Get ready to supercharge your analytics workflow!</p>

                    <div style="text-align: center;">
                        <a href="https://modelmind.ai" class="button">Visit ModelMind</a>
                    </div>
                </div>
                <div class="footer">
                    <p>© 2025 ModelMind. All rights reserved.</p>
                    <p>Powered by ModelMind Intelligence</p>
                </div>
            </div>
        </body>
        </html>
        """
        result = await EmailService.send_email(email, subject, html_content)

        if result:
            logger.info(f"✅ Waitlist confirmation sent to {email}")
        else:
            logger.error(f"❌ Failed to send waitlist confirmation to {email}")

        return result

    @staticmethod
    async def send_feedback_confirmation(email: str, feedback_type: str, subject: str) -> bool:
        """Send confirmation email for feedback submission"""
        logger.info(f"🎯 Preparing FEEDBACK CONFIRMATION email for {email}")

        email_subject = f"We received your {feedback_type}"

        # Emoji mapping
        emoji_map = {
            'suggestion': '💡',
            'bug': '🐛',
            'feature': '✨',
            'other': '💬'
        }
        emoji = emoji_map.get(feedback_type, '💬')

        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
                body {{ 
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; 
                    line-height: 1.6; 
                    color: #333;
                    margin: 0;
                    padding: 0;
                    background-color: #f5f5f5;
                }}
                .container {{ 
                    max-width: 600px; 
                    margin: 20px auto; 
                    background: white;
                    border-radius: 12px;
                    overflow: hidden;
                    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                }}
                .header {{ 
                    background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%); 
                    padding: 40px 30px; 
                    text-align: center;
                }}
                .header h1 {{ 
                    color: white; 
                    margin: 0; 
                    font-size: 28px;
                    font-weight: 600;
                }}
                .content {{ 
                    padding: 40px 30px;
                }}
                .info-box {{
                    background: #f9fafb;
                    padding: 20px;
                    border-radius: 8px;
                    margin: 20px 0;
                    border-left: 4px solid #3b82f6;
                }}
                .footer {{ 
                    text-align: center; 
                    padding: 30px; 
                    background: #f9fafb;
                    color: #6b7280; 
                    font-size: 14px;
                    border-top: 1px solid #e5e7eb;
                }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>{emoji} Thanks for Your Feedback!</h1>
                </div>
                <div class="content">
                    <h2>We've received your {feedback_type}</h2>
                    <div class="info-box">
                        <p><strong>Subject:</strong> {subject}</p>
                    </div>
                    <p>Our team will review it and get back to you if needed.</p>
                    <p>Your input helps us build a better product for everyone. Thank you! 🙏</p>
                </div>
                <div class="footer">
                    <p><strong>- The ModelMind Team</strong></p>
                </div>
            </div>
        </body>
        </html>
        """
        result = await EmailService.send_email(email, email_subject, html_content)

        if result:
            logger.info(f"✅ Feedback confirmation sent to {email}")
        else:
            logger.error(f"❌ Failed to send feedback confirmation to {email}")

        return result

    @staticmethod
    async def send_feedback_notification_to_team(
            feedback_type: str,
            subject: str,
            message: str,
            name: Optional[str] = None,
            email: Optional[str] = None
    ) -> bool:
        """Send feedback notification to ModelMind team"""
        team_email = "modelmind.team@gmail.com"

        logger.info(f"🎯 Preparing ADMIN NOTIFICATION email for {team_email}")
        logger.info(f"Feedback Type: {feedback_type}")
        logger.info(f"Subject: {subject}")
        logger.info(f"From User: {name or 'Anonymous'} ({email or 'No email'})")

        email_subject = f"🔔 New {feedback_type.upper()}: {subject}"

        # Priority styling
        priority_color = "#ef4444" if feedback_type == "bug" else "#3b82f6"

        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
                body {{ 
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; 
                    line-height: 1.6; 
                    color: #333;
                    margin: 0;
                    padding: 0;
                    background-color: #f5f5f5;
                }}
                .container {{ 
                    max-width: 600px; 
                    margin: 20px auto; 
                    background: white;
                    border-radius: 12px;
                    overflow: hidden;
                    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                }}
                .header {{ 
                    background: #1f2937; 
                    padding: 30px; 
                }}
                .header h1 {{ 
                    color: white; 
                    margin: 0; 
                    font-size: 22px;
                    font-weight: 600;
                }}
                .content {{ 
                    padding: 30px;
                }}
                .info-box {{ 
                    background: #f9fafb; 
                    padding: 20px; 
                    border-radius: 8px; 
                    margin: 15px 0; 
                    border-left: 4px solid {priority_color};
                }}
                .info-box p {{
                    margin: 8px 0;
                }}
                .message-box {{
                    background: white;
                    border: 1px solid #e5e7eb;
                    padding: 20px;
                    border-radius: 8px;
                    margin: 15px 0;
                }}
                .badge {{
                    display: inline-block;
                    padding: 4px 12px;
                    border-radius: 12px;
                    font-size: 12px;
                    font-weight: 600;
                    text-transform: uppercase;
                    background: {priority_color};
                    color: white;
                }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>📬 New Feedback Received</h1>
                </div>
                <div class="content">
                    <div class="info-box">
                        <p><span class="badge">{feedback_type}</span></p>
                        <p><strong>From:</strong> {name or 'Anonymous'}</p>
                        <p><strong>Email:</strong> {email or 'Not provided'}</p>
                        <p><strong>Subject:</strong> {subject}</p>
                    </div>
                    <div class="message-box">
                        <p><strong>Message:</strong></p>
                        <p>{message}</p>
                    </div>
                    <p style="color: #6b7280; font-size: 14px; margin-top: 20px;">
                        <em>View all feedback in your Supabase dashboard</em>
                    </p>
                </div>
            </div>
        </body>
        </html>
        """
        result = await EmailService.send_email(team_email, email_subject, html_content)

        if result:
            logger.info(f"✅ Admin notification sent to {team_email}")
        else:
            logger.error(f"❌ Failed to send admin notification to {team_email}")

        return result

    @staticmethod
    async def send_launch_reminder_to_dev(days_remaining: int, launch_date: str) -> bool:
        """Send 15-day launch reminder to developer"""
        admin_email = "davidaniago@gmail.com"

        logger.info(f"🎯 Preparing 15-DAY LAUNCH REMINDER for {admin_email}")
        logger.info(f"Days Remaining: {days_remaining}")
        logger.info(f"Launch Date: {launch_date}")

        subject = f"🚨 {days_remaining} Days Until Dashboard AI Launch!"

        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
                body {{ 
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; 
                    line-height: 1.6; 
                    color: #333;
                    margin: 0;
                    padding: 0;
                    background-color: #f5f5f5;
                }}
                .container {{ 
                    max-width: 600px; 
                    margin: 20px auto; 
                    background: white;
                    border-radius: 12px;
                    overflow: hidden;
                    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                }}
                .header {{ 
                    background: linear-gradient(135deg, #ef4444 0%, #f97316 100%); 
                    padding: 40px 30px; 
                    text-align: center;
                }}
                .header h1 {{ 
                    color: white; 
                    margin: 0; 
                    font-size: 28px;
                    font-weight: 600;
                }}
                .content {{ 
                    padding: 40px 30px;
                }}
                .countdown {{ 
                    background: #fef2f2; 
                    padding: 30px; 
                    border-radius: 12px; 
                    text-align: center; 
                    margin: 20px 0; 
                    border: 3px solid #ef4444;
                }}
                .countdown h2 {{ 
                    color: #ef4444; 
                    font-size: 56px; 
                    margin: 0;
                    font-weight: 700;
                }}
                .countdown p {{
                    color: #991b1b;
                    font-size: 18px;
                    font-weight: 600;
                    margin: 10px 0 0 0;
                }}
                .checklist {{ 
                    background: #f9fafb; 
                    padding: 25px; 
                    border-radius: 12px; 
                    margin: 20px 0;
                }}
                .checklist h3 {{
                    margin-top: 0;
                    color: #1f2937;
                }}
                .checklist ul {{
                    list-style: none;
                    padding: 0;
                }}
                .checklist li {{ 
                    padding: 10px 0;
                    border-bottom: 1px solid #e5e7eb;
                }}
                .checklist li:last-child {{
                    border-bottom: none;
                }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>⏰ Launch Reminder</h1>
                </div>
                <div class="content">
                    <h2>Hey David! 👋</h2>
                    <p>Just a heads up - the Dashboard AI Assistant launches in:</p>

                    <div class="countdown">
                        <h2>{days_remaining}</h2>
                        <p>DAYS</p>
                    </div>

                    <p><strong>🗓️ Launch Date:</strong> {launch_date}</p>

                    <div class="checklist">
                        <h3>📋 Pre-Launch Checklist</h3>
                        <ul>
                            <li>✅ Final testing and QA</li>
                            <li>✅ Documentation updates</li>
                            <li>✅ Marketing materials ready</li>
                            <li>✅ Email templates for launch day</li>
                            <li>✅ Server capacity check</li>
                            <li>✅ Backup systems tested</li>
                            <li>✅ Analytics tracking setup</li>
                            <li>✅ Customer support ready</li>
                        </ul>
                    </div>

                    <p style="font-size: 18px; text-align: center; margin-top: 30px;">
                        <strong>You've got this! 💪🚀</strong>
                    </p>
                </div>
            </div>
        </body>
        </html>
        """
        result = await EmailService.send_email(admin_email, subject, html_content)

        if result:
            logger.info(f"✅ Launch reminder sent to {admin_email}")
        else:
            logger.error(f"❌ Failed to send launch reminder to {admin_email}")

        return result

    @staticmethod
    async def send_launch_notification(email: str) -> bool:
        """Send launch day notification to waitlist subscribers"""
        logger.info(f"🎯 Preparing LAUNCH NOTIFICATION for {email}")

        subject = "🎉 Dashboard AI Assistant is Live!"
        html_content = """
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
                body { 
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; 
                    line-height: 1.6; 
                    color: #333;
                    margin: 0;
                    padding: 0;
                    background-color: #f5f5f5;
                }
                .container { 
                    max-width: 600px; 
                    margin: 20px auto; 
                    background: white;
                    border-radius: 12px;
                    overflow: hidden;
                    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                }
                .header { 
                    background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%); 
                    padding: 50px 30px; 
                    text-align: center;
                }
                .header h1 { 
                    color: white; 
                    margin: 0; 
                    font-size: 36px;
                    font-weight: 700;
                }
                .content { 
                    padding: 40px 30px;
                }
                .features { 
                    background: #f9fafb; 
                    padding: 25px; 
                    border-radius: 12px; 
                    margin: 25px 0;
                }
                .features h3 {
                    margin-top: 0;
                    color: #1f2937;
                }
                .features ul {
                    list-style: none;
                    padding: 0;
                }
                .features li { 
                    padding: 10px 0;
                    color: #4b5563;
                }
                .button { 
                    display: inline-block; 
                    background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
                    color: white !important; 
                    padding: 16px 48px; 
                    text-decoration: none; 
                    border-radius: 10px; 
                    margin: 20px 0;
                    font-weight: 700;
                    font-size: 18px;
                    text-align: center;
                }
                .footer {
                    text-align: center;
                    padding: 30px;
                    background: #f9fafb;
                    color: #6b7280;
                    font-size: 14px;
                    border-top: 1px solid #e5e7eb;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>🚀 We're Live!</h1>
                </div>
                <div class="content">
                    <h2>The wait is over!</h2>
                    <p>The Dashboard AI Assistant is now available and ready to supercharge your analytics workflow.</p>

                    <div class="features">
                        <h3>What you can do today:</h3>
                        <ul>
                            <li>💬 Interact with your data using natural language</li>
                            <li>📊 Get instant insights and visualizations</li>
                            <li>🤖 Leverage AI-powered analytics</li>
                            <li>⚡ Streamline your workflow</li>
                            <li>🎯 Make data-driven decisions faster</li>
                        </ul>
                    </div>

                    <p style="text-align: center;">
                        <a href="https://modelmind.ai/dashboard-ai" class="button">
                            Get Started Now →
                        </a>
                    </p>

                    <p style="margin-top: 30px;">Thank you for being an early supporter! We can't wait to see what you build.</p>
                    <p><strong>- The ModelMind Team</strong></p>
                </div>
                <div class="footer">
                    <p>© 2025 ModelMind. All rights reserved.</p>
                </div>
            </div>
        </body>
        </html>
        """
        result = await EmailService.send_email(email, subject, html_content)

        if result:
            logger.info(f"✅ Launch notification sent to {email}")
        else:
            logger.error(f"❌ Failed to send launch notification to {email}")

        return result