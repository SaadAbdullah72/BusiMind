import requests
import json

payload = {
    "message_id": "test_id",
    "message": "Do you ship internationally to Dubai?",
    "sender": "saad489254@gmail.com",
    "subject": "Test Question"
}

try:
    res = requests.post("http://127.0.0.1:8000/api/support/resolve-live", json=payload)
    print("Status:", res.status_code)
    print("Response:", res.text)
except Exception as e:
    print("Error connecting:", e)
