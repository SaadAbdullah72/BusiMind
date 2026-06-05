import csv
import random
from datetime import datetime, timedelta

items = [
    {"name": "Dalda Cooking Oil 5L", "price": 2250},
    {"name": "Nestle Milkpak 1L", "price": 300},
    {"name": "Surf Excel 1kg", "price": 460},
    {"name": "Yogurt Pack 1kg", "price": 300},
    {"name": "Tapal Danedar 900g", "price": 1350}
]

payment_methods = ["Cash", "Card", "Wallet"]
loyalty_ids = ["L" + str(random.randint(1000, 9999)) for _ in range(20)] + ["None"] * 30

def generate_transactions(num_rows=15000):
    start_time = datetime.strptime("08:00", "%H:%M")
    
    with open("mock_transactions.csv", "w", newline='') as f:
        writer = csv.writer(f)
        writer.writerow(["TransactionId", "Timestamp", "ItemName", "Quantity", "PricePaid", "PaymentMethod", "CustomerLoyaltyId"])
        
        for i in range(num_rows):
            tid = f"T{2000 + i}"
            
            # Increment time randomly by 1 to 5 minutes
            start_time += timedelta(minutes=random.randint(1, 3))
            ts = start_time.strftime("%H:%M")
            
            # Restart the day if it goes past 11 PM
            if start_time.hour >= 23:
                start_time = datetime.strptime("08:00", "%H:%M")
                
            item = random.choice(items)
            qty = random.randint(1, 10)
            
            # Some items usually sell in smaller quantities
            if "Dalda" in item["name"] or "Tapal" in item["name"]:
                qty = random.randint(1, 3)
            elif "Milkpak" in item["name"] or "Yogurt" in item["name"]:
                qty = random.randint(3, 12)
                
            price_paid = item["price"] * qty
            payment = random.choice(payment_methods)
            loyalty = random.choice(loyalty_ids)
            
            writer.writerow([tid, ts, item["name"], qty, price_paid, payment, loyalty])

if __name__ == "__main__":
    generate_transactions()
    print("Large CSV generated successfully.")
