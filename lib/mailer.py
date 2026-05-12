import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from lib.config import SMTP_HOST, SMTP_PORT, FROM_EMAIL

def send_email(to: str, subject: str, html: str) -> None:
    msg = MIMEMultipart("alternative")
    msg["From"] = FROM_EMAIL
    msg["To"] = to
    msg["Subject"] = subject
    msg.attach(MIMEText(html, "html"))

    with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as smtp:
        smtp.sendmail(FROM_EMAIL, to, msg.as_string())
