import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import random
import uuid
import time

SENDER_EMAIL = "saad489254@gmail.com"
SENDER_PASSWORD = "zwchnmjmppazdfym"
RECEIVER_EMAIL = "cursorthee@gmail.com"

templates = [
    ("order_status", "Mera order {id} abhi tak nahi aya, kab milega?"),
    ("order_status", "Please track my order {id}, status update chahiye."),
    ("order_status", "Order {id} dispatch ho gaya hai ya nahi?"),
    ("faq", "Delivery charges kitne hain Karachi ke liye?"),
    ("faq", "Kya credit card accept karte hain delivery pe?"),
    ("faq", "Shop ki timings kya hain?"),
    ("complaint", "Mera saman toota hua nikla hai, main case karunga! Please refund."),
    ("complaint", "Rude rider behaviour, I want a replacement for my defective item."),
    ("complaint", "Ghalat item bhej diya hai, defective hai, wapis le jao isko."),
]
ids = ["T1001", "T1002", "T1003", "T1004", "T1005", "T1006", "T1007", "T1008"]

def send_test_emails():
    print(f"Connecting to SMTP server for {SENDER_EMAIL}...")
    try:
        server = smtplib.SMTP('smtp.gmail.com', 587)
        server.starttls()
        server.login(SENDER_EMAIL, SENDER_PASSWORD)
    except Exception as e:
        print("Failed to login to SMTP:", e)
        return

    print("Successfully logged in. Sending 20 emails...")

    for i in range(20):
        cat, tmpl = random.choice(templates)
        msg_body = tmpl.replace("{id}", random.choice(ids))
        
        msg = MIMEMultipart()
        msg['From'] = SENDER_EMAIL
        msg['To'] = RECEIVER_EMAIL
        # The user requested 'bueiness queirues' (business queries) in subject
        msg['Subject'] = f"bueiness queirues - #{random.randint(1000, 9999)} [{uuid.uuid4().hex[:6]}]"

        msg.attach(MIMEText(msg_body, 'plain'))

        try:
            server.send_message(msg)
            print(f"[{i+1}/20] Sent email: {msg['Subject']}")
            time.sleep(1) # Prevent rapid spam blocking
        except Exception as e:
            print(f"Failed to send email {i+1}:", e)

    server.quit()
    print("Done sending test emails.")

if __name__ == "__main__":
    send_test_emails()
