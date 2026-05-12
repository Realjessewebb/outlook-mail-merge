import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from lib.config import SMTP_HOST, SMTP_PORT, FROM_EMAIL

def send_email(to: str, subject: str, html: str, cc: list[str] | None = None) -> None:
    msg = MIMEMultipart("alternative")
    msg["From"] = FROM_EMAIL
    msg["To"] = to
    msg["Subject"] = subject
    if cc:
        msg["Cc"] = ", ".join(cc)
    msg.attach(MIMEText(html, "html"))

    recipients = [to] + (cc or [])
    with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as smtp:
        smtp.sendmail(FROM_EMAIL, recipients, msg.as_string())
