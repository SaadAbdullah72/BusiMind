import os
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), "..", ".env"))

import sys
sys.path.append(os.path.join(os.path.dirname(__file__), ".."))

from index import store_chatbot, ChatbotRequest, pos_collection, inventory_collection

def run_test():
    # Find a user with POS/Inventory data
    email = "saad489254@gmail.com" # default fallback
    
    if pos_collection is not None:
        sample_pos = pos_collection.find_one()
        if sample_pos:
            email = sample_pos.get("email", email)
            print(f"Using email from database: {email}")
    
    # Test queries
    queries = [
        "who is the lowest seller of today",
        "tell me about Nestle Milkpak 1L stock and category",
        "What is the return policy for sale items?"
    ]
    
    for query in queries:
        req = ChatbotRequest(email=email, query=query)
        print(f"\n=======================================================")
        print(f"QUERY: '{query}'")
        print(f"=======================================================")
        try:
            res = store_chatbot(req)
            print("RESPONSE:\n", res.get("response"))
        except Exception as e:
            print("ERROR:", e)

if __name__ == "__main__":
    run_test()
