import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from dotenv import load_dotenv
import time

load_dotenv()

smtp_email = os.getenv("SMTP_EMAIL")
smtp_pass = os.getenv("SMTP_PASSWORD")

if not smtp_email or not smtp_pass:
    print("Error: Credentials not found in .env")
    exit()

queries = [
    "Do you ship internationally to Dubai? I want to buy in bulk.",
    "What is your return policy? I bought something yesterday.",
    "How long does standard delivery take for metropolitan areas?",
    "I want to cancel my order that I placed 5 hours ago. Please cancel it.",
    "Can I get a refund for an item I bought on a 30% discount sale?",
    "My product arrived completely broken and shattered! I am extremely angry and want to talk to a manager immediately!",
    "Do your electronic products come with a warranty?",
    "How long do refunds take to reflect in my bank account after processing?",
    "Can I get express shipping? And how much does it cost for next day delivery?",
    "I placed an order but you guys are completely useless and late! I want a full refund and I am complaining to the consumer court right now!"
]

try:
    server = smtplib.SMTP('smtp.gmail.com', 587)
    server.starttls()
    server.login(smtp_email, smtp_pass)
    
    for i, query in enumerate(queries):
        msg = MIMEMultipart()
        msg['From'] = smtp_email
        msg['To'] = smtp_email
        msg['Subject'] = f"Business Queries: Test Customer Question #{i+1}"
        
        msg.attach(MIMEText(query, 'plain'))
        server.send_message(msg)
        print(f"Sent email {i+1}/10")
        time.sleep(1) # Prevent rate limiting
        
    server.quit()
    print("Successfully sent 10 mock emails.")
except Exception as e:
    print("Failed to send emails:", str(e))
