import os
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), "..", ".env"))

import sys
sys.path.append(os.path.join(os.path.dirname(__file__), ".."))

from index import resolve_live_email, LiveResolveRequest

req = LiveResolveRequest(
    message_id="test1",
    message="Do you ship to Dubai?",
    sender="saad489254@gmail.com",
    subject="International Shipping"
)

try:
    print("Running resolve_live_email...")
    res = resolve_live_email(req)
    print("Result:", res)
except Exception as e:
    print("Error:", e)
    import traceback
    traceback.print_exc()
