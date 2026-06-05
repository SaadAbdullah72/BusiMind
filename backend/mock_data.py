import io
import csv

# Mock POS Transactions for the day's sales diagnostics
APPOINTMENTS_MOCK_CSV = """TransactionId,Timestamp,ItemName,Quantity,PricePaid,PaymentMethod,CustomerLoyaltyId
T1001,14:02,Dalda Cooking Oil 5L,2,4500,Card,L9281
T1002,14:15,Nestle Milkpak 1L,6,1800,Cash,L1203
T1003,14:30,Surf Excel 1kg,1,460,Cash,None
T1004,15:10,Yogurt Pack 1kg,4,1200,Card,L8491
T1005,15:45,Nestle Everyday 1kg,1,1490,Card,None
T1006,16:20,Tapal Danedar 900g,3,4050,Cash,L3921
T1007,17:05,Dalda Cooking Oil 5L,1,2250,Card,L4820
T1008,17:40,Yogurt Pack 1kg,5,1500,Cash,L1203
"""

# Initial supermarket inventory
INITIAL_INVENTORY = {
    "dalda_oil": {
        "name": "Dalda Cooking Oil 5L",
        "category": "Pantry",
        "stock": 45,
        "unit": "tins",
        "cost_price": 1850,
        "retail_price": 2250,
        "expiry_date": "2027-02-15",
        "low_threshold": 15,
        "sales_velocity_daily": 8,
        "supplier": "Dalda Foods Ltd",
        "supplier_lead_days": 3
    },
    "surf_excel": {
        "name": "Surf Excel 1kg",
        "category": "Household",
        "stock": 35,
        "unit": "packs",
        "cost_price": 340,
        "retail_price": 460,
        "expiry_date": "2028-05-10",
        "low_threshold": 10,
        "sales_velocity_daily": 5,
        "supplier": "Unilever Pakistan",
        "supplier_lead_days": 4
    },
    "nestle_milkpak": {
        "name": "Nestle Milkpak 1L",
        "category": "Dairy",
        "stock": 8,  # Low stock!
        "unit": "cartons",
        "cost_price": 240,
        "retail_price": 300,
        "expiry_date": "2026-06-12",  # Expiring soon!
        "low_threshold": 25,
        "sales_velocity_daily": 15,
        "supplier": "Nestle Pakistan Ltd",
        "supplier_lead_days": 2
    },
    "yogurt_pack": {
        "name": "Yogurt Pack 1kg",
        "category": "Dairy",
        "stock": 38,
        "unit": "cups",
        "cost_price": 200,
        "retail_price": 300,
        "expiry_date": "2026-06-09",  # Expiring in 4 days!
        "low_threshold": 10,
        "sales_velocity_daily": 6,
        "supplier": "Nestle Pakistan Ltd",
        "supplier_lead_days": 1
    },
    "tapal_danedar": {
        "name": "Tapal Danedar 900g",
        "category": "Beverages",
        "stock": 4,  # Critically low stock!
        "unit": "boxes",
        "cost_price": 1100,
        "retail_price": 1350,
        "expiry_date": "2027-11-20",
        "low_threshold": 15,
        "sales_velocity_daily": 7,
        "supplier": "Tapal Tea Ltd",
        "supplier_lead_days": 3
    }
}

# Competitor pricing indexes
COMPETITOR_PRICES = {
    "dalda_oil": {"our_price": 2250, "competitor_price": 2130, "competitor_name": "Metro Cash & Carry", "cost_price": 1850},
    "surf_excel": {"our_price": 460, "competitor_price": 425, "competitor_name": "Carrefour Supermarket", "cost_price": 340},
    "nestle_milkpak": {"our_price": 300, "competitor_price": 300, "competitor_name": "Metro Cash & Carry", "cost_price": 240},
    "yogurt_pack": {"our_price": 300, "competitor_price": 310, "competitor_name": "Chase Up Grocery", "cost_price": 200},
    "tapal_danedar": {"our_price": 1350, "competitor_price": 1320, "competitor_name": "Metro Cash & Carry", "cost_price": 1100}
}
