import imaplib
import email as email_lib
from email.header import decode_header
import os
from dotenv import load_dotenv

load_dotenv()

smtp_email = os.getenv("SMTP_EMAIL")
smtp_pass = os.getenv("SMTP_PASSWORD")
print("Email:", smtp_email)

try:
    mail = imaplib.IMAP4_SSL("imap.gmail.com")
    mail.login(smtp_email, smtp_pass)
    mail.select("inbox")
    
    status, messages = mail.search(None, '(ALL)')
    email_ids = messages[0].split()
    
    results = []
    for e_id in email_ids[-50:]:
        status, msg_data = mail.fetch(e_id, '(RFC822)')
        for response_part in msg_data:
            if isinstance(response_part, tuple):
                msg = email_lib.message_from_bytes(response_part[1])
                subject, encoding = decode_header(msg["Subject"])[0]
                if isinstance(subject, bytes):
                    try:
                        subject = subject.decode(encoding or "utf-8")
                    except:
                        subject = subject.decode("utf-8", errors="ignore")
                
                if "bueiness queirues" not in subject.lower() and "business queries" not in subject.lower():
                    continue
                
                print(f"Matched Email ID: {e_id}")
                results.append(subject)
    
    print(f"Total matching emails found: {len(results)}")
        
except Exception as e:
    print("IMAP Error:", e)
