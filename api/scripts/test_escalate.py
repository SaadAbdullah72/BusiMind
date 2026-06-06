import os
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), "..", ".env"))

smtp_email = os.getenv("SMTP_EMAIL")
smtp_pass = os.getenv("SMTP_PASSWORD")
staff_email = os.getenv("STAFF_EMAIL")

print(f"SMTP: {smtp_email}, STAFF: {staff_email}")

try:
    server = smtplib.SMTP('smtp.gmail.com', 587)
    server.starttls()
    server.login(smtp_email, smtp_pass)

    msg = MIMEMultipart()
    msg['From'] = smtp_email
    msg['To'] = staff_email
    msg['Subject'] = f"ESCALATED TEST"
    body = f"An email arrived from user test@gmail.com that needs your attention."
    msg.attach(MIMEText(body, 'plain'))
    
    server.send_message(msg)
    server.quit()
    print("SUCCESS: Escalate sent.")
except Exception as e:
    print("ERROR:", e)
