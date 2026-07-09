import smtplib
import os
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from app.config import settings
import logging

logger = logging.getLogger(__name__)

def send_email(to_email: str, subject: str, body: str):
    username = settings.smtp_username or os.getenv("gmail_user_id") or os.getenv("GMAIL_USER_ID")
    password = settings.smtp_password or os.getenv("gmail_password") or os.getenv("GMAIL_PASSWORD")

    if not username or not password:
        logger.warning(f"SMTP credentials not configured. Skipping email to {to_email}")
        return False

    msg = MIMEMultipart()
    msg['From'] = username
    msg['To'] = to_email
    msg['Subject'] = subject

    msg.attach(MIMEText(body, 'html'))

    try:
        server = smtplib.SMTP('smtp.gmail.com', 587)
        server.starttls()
        server.login(username, password)
        server.send_message(msg)
        server.quit()
        logger.info(f"Email sent successfully to {to_email}")
        return True
    except Exception as e:
        logger.error(f"Failed to send email to {to_email}: {str(e)}")
        return False
