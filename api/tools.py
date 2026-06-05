import os
import json
from datetime import datetime
from langchain.tools import tool
from langchain_groq import ChatGroq
from dotenv import load_dotenv
from mock_data import INITIAL_INVENTORY, COMPETITOR_PRICES

load_dotenv()

# Setup local LLM helper to avoid circular imports
def get_llm():
    return ChatGroq(
        temperature=0.2,
        model_name="llama3-70b-8192", 
        api_key=os.getenv("GROQ_API_KEY")
    )

INVENTORY_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "inventory.json")

# Helpers for inventory persistence
def load_inventory():
    if not os.path.exists(INVENTORY_FILE):
        with open(INVENTORY_FILE, "w") as f:
            json.dump(INITIAL_INVENTORY, f, indent=4)
        return INITIAL_INVENTORY
    try:
        with open(INVENTORY_FILE, "r") as f:
            return json.load(f)
    except Exception:
        return INITIAL_INVENTORY

def save_inventory(inv):
    with open(INVENTORY_FILE, "w") as f:
        json.dump(inv, f, indent=4)

# Load initial state
load_inventory()

# 1. Expiry Risk Analyzer Tool
@tool
def analyze_expiry_risk(current_date: str) -> str:
    """
    Scans the inventory, identifies products near expiry, calculates the estimated wasted stock 
    based on sales velocities, and drafts promotional offers (Discounts/BOGO) to clear them.
    Input should be the current date in YYYY-MM-DD format (e.g. '2026-06-05').
    """
    inv = load_inventory()
    curr_dt = datetime.strptime(current_date, "%Y-%m-%d")
    
    risky_items = []
    for key, item in inv.items():
        exp_dt = datetime.strptime(item["expiry_date"], "%Y-%m-%d")
        days_left = (exp_dt - curr_dt).days
        
        # Flag if expiring within 10 days
        if 0 <= days_left <= 10:
            expected_sales = item["sales_velocity_daily"] * days_left
            waste_volume = max(0, item["stock"] - expected_sales)
            potential_loss = waste_volume * item["cost_price"]
            
            if waste_volume > 0:
                risky_items.append({
                    "key": key,
                    "name": item["name"],
                    "stock": item["stock"],
                    "days_left": days_left,
                    "waste_units": waste_volume,
                    "potential_loss": potential_loss,
                    "expiry_date": item["expiry_date"]
                })
                
    # Use LLM to draft promotion campaigns
    llm = get_llm()
    prompt = (
        f"You are the Creative Marketing Manager at RetailMind Supermarket.\n"
        f"We have the following items nearing expiry that will be wasted unless sold:\n"
        f"{json.dumps(risky_items, indent=2)}\n\n"
        f"Draft a short, catchy, and professional dynamic discount promo message or Buy One Get One (BOGO) bundle "
        f"advertisement to clear these products before they expire. Keep it under 180 characters, highly appealing, and ready to post on the supermarket announcement board."
    )
    
    try:
        response = llm.invoke(prompt)
        promo_text = response.content.strip()
    except Exception:
        promo_text = "Special Clearing Discount: 30% Off on dairy and fresh essentials today only! Grab them at the nearest aisle."

    result = {
        "evaluation_date": current_date,
        "items_at_risk": risky_items,
        "suggested_promotional_ad": promo_text
    }
    return json.dumps(result, indent=2)

# 2. Competitor Pricing Guard Tool
@tool
def audit_competitor_pricing() -> str:
    """
    Compares our supermarket retail prices against competitor indexes (Metro/Carrefour).
    Identifies if our prices are higher and recommends profitable price matches.
    """
    inv = load_inventory()
    price_deviations = []
    
    for key, comp_data in COMPETITOR_PRICES.items():
        item = inv.get(key)
        if not item:
            continue
        
        our_price = item["retail_price"]
        comp_price = comp_data["competitor_price"]
        cost_price = item["cost_price"]
        
        if our_price > comp_price:
            difference = our_price - comp_price
            margin_before = our_price - cost_price
            margin_after = comp_price - cost_price
            
            is_profitable = margin_after > 0
            
            price_deviations.append({
                "key": key,
                "name": item["name"],
                "our_price": our_price,
                "competitor_price": comp_price,
                "competitor_name": comp_data["competitor_name"],
                "difference": difference,
                "cost_price": cost_price,
                "new_recommended_price": comp_price if is_profitable else our_price,
                "margin_reducton": difference if is_profitable else 0,
                "status": "Price Match Profitable" if is_profitable else "Price Match Unprofitable (Below Cost)"
            })
            
    llm = get_llm()
    prompt = (
        f"You are the Pricing Strategist at RetailMind Supermarket.\n"
        f"We found the following price mismatches where competitors are cheaper:\n"
        f"{json.dumps(price_deviations, indent=2)}\n\n"
        f"Provide a brief, professional summary of our pricing strategy regarding these items, "
        f"highlighting if we should price-match or hold prices to protect our margins."
    )
    
    try:
        response = llm.invoke(prompt)
        pricing_notes = response.content.strip()
    except Exception:
        pricing_notes = "Maintain price match where cost margin allows. Hold Dalda Cooking Oil at current price unless supplier discounts are negotiated."

    result = {
        "deviations": price_deviations,
        "pricing_strategy_summary": pricing_notes
    }
    return json.dumps(result, indent=2)

# 3. Auto-Procurement & Purchase Order Tool
@tool
def generate_purchase_order(product_key: str, order_quantity: int) -> str:
    """
    Auto-generates a structured Purchase Order (PO) invoice for a product key and drafts 
    a formal order email to the manufacturer's sales representative.
    Inputs must be: product_key, order_quantity.
    """
    inv = load_inventory()
    item = inv.get(product_key)
    
    if not item:
        return json.dumps({"error": f"Product key '{product_key}' not found in inventory."})
        
    cost_price = item["cost_price"]
    total_cost = cost_price * order_quantity
    
    # Generate formal order email
    llm = get_llm()
    prompt = (
        f"You are the Procurement Director at RetailMind Supermarket.\n"
        f"Write a formal purchase order email to our supplier rep for {item['supplier']}.\n"
        f"Order details:\n"
        f"- Product: {item['name']}\n"
        f"- Quantity: {order_quantity} {item['unit']}\n"
        f"- Cost Price per unit: {cost_price} PKR\n"
        f"- Total Cost: {total_cost} PKR\n"
        f"- Lead Delivery Time expected: {item['supplier_lead_days']} days\n\n"
        f"Keep the email short, professional, and clear. Place placeholders for signatures."
    )
    
    try:
        response = llm.invoke(prompt)
        email_draft = response.content.strip()
    except Exception:
        email_draft = f"Subject: Purchase Order for {item['name']}\n\nDear Sales Rep,\n\nPlease process our order for {order_quantity} units of {item['name']}. Deliver in {item['supplier_lead_days']} days.\n\nBest regards,\nProcurement Dept."

    po_number = f"PO-2026-{datetime.now().strftime('%M%S')}"
    
    result = {
        "po_number": po_number,
        "supplier": item["supplier"],
        "product_name": item["name"],
        "order_quantity": order_quantity,
        "unit": item["unit"],
        "cost_per_unit": cost_price,
        "total_cost_pkr": total_cost,
        "lead_delivery_days": item["supplier_lead_days"],
        "supplier_email_draft": email_draft
    }
    return json.dumps(result, indent=2)

# 4. Inventory Watchdog Helper Tool
@tool
def check_inventory_supplies(treatments_performed: str) -> str:
    """
    Deducts product units from the supermarket inventory based on sales.
    Input should be a comma-separated list of items sold, e.g. 'dalda_oil, surf_excel, nestle_milkpak'.
    """
    inv = load_inventory()
    sales_list = [s.strip().lower() for s in treatments_performed.split(",") if s.strip()]
    
    deductions = {}
    for s in sales_list:
        deductions[s] = deductions.get(s, 0) + 1
        
    alerts = []
    updated_inv = {}
    
    for key, item in inv.items():
        dec = deductions.get(key, 0)
        new_stock = max(0, item["stock"] - dec)
        item["stock"] = new_stock
        updated_inv[key] = item
        
        if new_stock <= item["low_threshold"]:
            alerts.append(f"Low Stock Alert: {item['name']} is at {new_stock} {item['unit']} (Safety Limit: {item['low_threshold']})")
            
    save_inventory(updated_inv)
    
    result = {
        "sales_processed": sales_list,
        "deductions_applied": deductions,
        "current_stock": updated_inv,
        "alerts": alerts
    }
    return json.dumps(result, indent=2)

