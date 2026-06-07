# ══════════════════════════════════════════════════════════════════════════════
# RetailMind AI — Unified Vercel Serverless API
# All code in one file to avoid Vercel module isolation issues
# ══════════════════════════════════════════════════════════════════════════════
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse, JSONResponse
from pydantic import BaseModel
import os
import json
import io
import csv
import time
import tempfile
import traceback
import random
import string
import smtplib
from email.message import EmailMessage
from datetime import datetime
from dotenv import load_dotenv
from pymongo import MongoClient
from passlib.context import CryptContext
import uuid
from bson import ObjectId

load_dotenv()

import certifi

MONGO_URI = os.getenv("MONGO_URI")
if MONGO_URI:
    mongo_client = MongoClient(MONGO_URI, tlsCAFile=certifi.where())
    db = mongo_client["RetailMind"]
    users_collection = db["users"]
    otps_collection = db["otps"]
    inventory_collection = db["inventory"]
    competitors_collection = db["competitors"]
    pos_collection = db["pos_logs"]
    emails_collection = db["customer_emails"]
    policies_collection = db["business_policies"]
    settings_collection = db["business_settings"]
else:
    mongo_client = None
    users_collection = None
    otps_collection = None
    inventory_collection = None
    competitors_collection = None
    pos_collection = None
    emails_collection = None
    policies_collection = None
    settings_collection = None

from fastapi import File, UploadFile, Form
import PyPDF2

import imaplib
import email as email_lib
from email.header import decode_header
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

import bcrypt

SMTP_EMAIL = os.getenv("SMTP_EMAIL")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD")

def verify_password(plain_password, hashed_password):
    """
    Verifies a plain text password against a bcrypt hashed password.
    Truncates the plain password to 72 bytes to comply with bcrypt limits.
    """
    try:
        pwd_bytes = plain_password.encode('utf-8')[:72]
        hash_bytes = hashed_password.encode('utf-8')
        return bcrypt.checkpw(pwd_bytes, hash_bytes)
    except Exception:
        return False

def get_password_hash(password):
    """
    Generates a bcrypt hash for a given password.
    Truncates the password to 72 bytes to comply with bcrypt limits.
    """
    pwd_bytes = password.encode("utf-8")[:72]
    hashed = bcrypt.hashpw(pwd_bytes, bcrypt.gensalt())
    return hashed.decode("utf-8")

def send_otp_email(to_email: str, otp: str):
    """
    Sends an OTP (One-Time Password) to the specified email address via SMTP.
    Used primarily for password reset functionalities.
    """
    if not SMTP_EMAIL or not SMTP_PASSWORD:
        raise Exception("SMTP_EMAIL or SMTP_PASSWORD not set in backend.")
    
    msg = EmailMessage()
    msg.set_content(f"Your RetailMind AI Password Reset OTP is: {otp}\n\nIt will expire in 10 minutes.")
    msg['Subject'] = "RetailMind AI - Password Reset OTP"
    msg['From'] = SMTP_EMAIL
    msg['To'] = to_email

    server = smtplib.SMTP_SSL('smtp.gmail.com', 465)
    server.login(SMTP_EMAIL, SMTP_PASSWORD)
    server.send_message(msg)
    server.quit()

def safe_object_id(val: str):
    """
    Safely converts a string to a MongoDB ObjectId.
    Returns None if the conversion fails.
    """
    try:
        return ObjectId(val)
    except Exception:
        return None

# ── FastAPI App ───────────────────────────────────────────────────────────────
app = FastAPI(title="RetailMind AI API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ══════════════════════════════════════════════════════════════════════════════
# DATA LOADERS (MongoDB)
# ══════════════════════════════════════════════════════════════════════════════
def safe_int(val, default=0):
    """
    Safely converts a value to an integer.
    Handles None and string representations of floats.
    """
    try:
        if val is None:
            return default
        return int(float(str(val).strip()))
    except (ValueError, TypeError):
        return default

def safe_float(val, default=0.0):
    """
    Safely converts a value to a float.
    Returns the default value if conversion fails.
    """
    try:
        if val is None:
            return default
        return float(str(val).strip())
    except (ValueError, TypeError):
        return default

def load_inventory(email: str):
    """
    Retrieves the inventory items for a specific user from MongoDB.
    Normalizes keys and ensures data types are correct for computation.
    """
    if inventory_collection is None:
        return {}
    records = list(inventory_collection.find({"email": email}))
    if not records:
        return {}
    inv = {}
    for record in records:
        if "data" not in record:
            continue
        for row in record["data"]:
            key = row.get("ItemName", "").strip().lower()
            if key:
                inv[key] = {
                    "name": row.get("ItemName", ""),
                    "category": row.get("Category", "General"),
                    "stock": safe_int(row.get("Stock"), 0),
                    "unit": row.get("Unit", "units"),
                    "cost_price": safe_float(row.get("CostPrice"), 0.0),
                    "retail_price": safe_float(row.get("RetailPrice"), 0.0),
                    "expiry_date": row.get("ExpiryDate", ""),
                    "low_threshold": safe_int(row.get("LowThreshold"), 10),
                    "sales_velocity_daily": safe_int(row.get("SalesVelocityDaily"), 1),
                    "supplier": row.get("Supplier", "Unknown"),
                    "supplier_lead_days": safe_int(row.get("SupplierLeadDays"), 3)
                }
    return inv

def save_inventory(email: str, inv: dict):
    """
    Saves or updates the inventory dictionary for a specific user in MongoDB.
    Creates an aggregated state document to track temporary deductions.
    """
    if inventory_collection is None:
        return
    data = []
    for key, item in inv.items():
        data.append({
            "ItemName": item["name"],
            "Category": item["category"],
            "Stock": str(item["stock"]),
            "Unit": item["unit"],
            "CostPrice": str(item["cost_price"]),
            "RetailPrice": str(item["retail_price"]),
            "ExpiryDate": item["expiry_date"],
            "LowThreshold": str(item["low_threshold"]),
            "SalesVelocityDaily": str(item["sales_velocity_daily"]),
            "Supplier": item["supplier"],
            "SupplierLeadDays": str(item["supplier_lead_days"])
        })
    # For save_inventory (used by deduct stock), we just update the first matching document or a default one.
    # A robust approach would be to update the specific docs, but for simplicity we'll just upsert a main state doc
    # or better yet, since we only deduct temporarily in memory and overwrite, we can just save it as an "Aggregated" doc
    inventory_collection.update_one(
        {"email": email, "filename": "Aggregated_Stock"},
        {"$set": {"data": data, "updated_at": datetime.utcnow()}},
        upsert=True
    )

def load_competitors(email: str):
    """
    Retrieves competitor pricing data for a specific user from MongoDB.
    Returns a dictionary mapping item names (lowercase) to competitor details.
    """
    if competitors_collection is None:
        return {}
    record = competitors_collection.find_one({"email": email})
    if not record or "data" not in record:
        return {}
    comp = {}
    for row in record["data"]:
        key = row.get("ItemName", "").strip().lower()
        if key:
            comp[key] = {
                "competitor_price": safe_float(row.get("CompetitorPrice"), 0.0),
                "competitor_name": row.get("CompetitorName", "Competitor")
            }
    return comp

# ══════════════════════════════════════════════════════════════════════════════
# TOOLS (from tools.py) — LLM & Inventory helpers
# ══════════════════════════════════════════════════════════════════════════════
INVENTORY_FILE = os.path.join(tempfile.gettempdir(), "retailmind_inventory.json")

def get_llm(key_env="GROQ_API_KEY"):
    from langchain_groq import ChatGroq
    api_key = os.getenv(key_env)
    if not api_key:
        api_key = os.getenv("GROQ_API_KEY")
    return ChatGroq(
        temperature=0.2,
        model_name="llama-3.1-8b-instant",
        api_key=api_key,
        max_retries=1
    )

def safe_llm_invoke(prompt):
    """Invokes LLM with automatic fallback to secondary API key on failure."""
    try:
        llm1 = get_llm("GROQ_API_KEY")
        return llm1.invoke(prompt)
    except Exception as e:
        print(f"Primary API Key Failed: {e}. Trying Fallback GROQ_API_KEY_2...")
        try:
            llm2 = get_llm("GROQ_API_KEY_2")
            return llm2.invoke(prompt)
        except Exception as e2:
            print(f"Secondary API Key also Failed: {e2}")
            raise e2

def _get_llm():
    return get_llm("GROQ_API_KEY")



# ── Tool Functions ────────────────────────────────────────────────────────────
def analyze_expiry_risk(email: str, current_date: str) -> dict:
    """
    Scans inventory to find items nearing expiration within a 10-day window.
    Calculates potential financial loss and suggests promotional clearance campaigns.
    """
    inv = load_inventory(email)
    curr_dt = datetime.strptime(current_date, "%Y-%m-%d")
    risky_items = []
    for key, item in inv.items():
        exp_dt = datetime.strptime(item["expiry_date"], "%Y-%m-%d")
        days_left = (exp_dt - curr_dt).days
        if 0 <= days_left <= 10:
            expected_sales = item["sales_velocity_daily"] * days_left
            waste_volume = max(0, item["stock"] - expected_sales)
            potential_loss = waste_volume * item["cost_price"]
            if waste_volume > 0:
                risky_items.append({
                    "key": key, "name": item["name"], "stock": item["stock"],
                    "days_left": days_left, "waste_units": waste_volume,
                    "potential_loss": potential_loss, "expiry_date": item["expiry_date"]
                })
    promo_text = "Special Clearing Discount: 30% Off on items nearing expiry!"
    if len(risky_items) > 0:
        names = [i["name"] for i in risky_items[:2]]
        promo_text = f"Clearance Alert: Buy One Get One Free on {', '.join(names)} and more!"
        
    return {"evaluation_date": current_date, "items_at_risk": risky_items, "suggested_promotional_ad": promo_text}

def audit_competitor_pricing(email: str) -> dict:
    """
    Compares internal inventory prices against recorded competitor pricing.
    Identifies profitable price-matching opportunities to stay competitive without losing margin.
    """
    inv = load_inventory(email)
    comp_prices = load_competitors(email)
    price_deviations = []
    for key, comp_data in comp_prices.items():
        item = inv.get(key)
        if not item:
            continue
        our_price = item["retail_price"]
        comp_price = comp_data["competitor_price"]
        cost_price = item["cost_price"]
        if our_price > comp_price:
            difference = our_price - comp_price
            margin_after = comp_price - cost_price
            is_profitable = margin_after > 0
            price_deviations.append({
                "key": key, "name": item["name"], "our_price": our_price,
                "competitor_price": comp_price, "competitor_name": comp_data["competitor_name"],
                "difference": difference, "cost_price": cost_price,
                "new_recommended_price": comp_price if is_profitable else our_price,
                "margin_reducton": difference if is_profitable else 0,
                "status": "Price Match Profitable" if is_profitable else "Price Match Unprofitable"
            })
    pricing_notes = "Maintain price match where cost margin allows."
    if price_deviations:
        profitable_matches = sum(1 for d in price_deviations if d["status"] == "Price Match Profitable")
        pricing_notes = f"We recommend matching prices for {profitable_matches} out of {len(price_deviations)} items where margin remains profitable."
        
    return {"deviations": price_deviations, "pricing_strategy_summary": pricing_notes}

def generate_purchase_order(email: str, product_key: str, order_quantity: int) -> dict:
    """
    Generates a formal purchase order (PO) for a specific product.
    Calculates total costs and drafts an email template for the supplier.
    """
    inv = load_inventory(email)
    item = inv.get(product_key)
    if not item:
        return {"error": f"Product key '{product_key}' not found in inventory."}
    cost_price = item["cost_price"]
    total_cost = cost_price * order_quantity
    email_draft = f"Subject: Urgent Purchase Order for {item['name']}\n\nDear Sales Rep,\n\nPlease process our formal purchase order for {order_quantity} {item['unit']} of {item['name']} at a cost of {cost_price} PKR per unit. The total order value is {total_cost} PKR.\n\nWe expect delivery within the standard {item['supplier_lead_days']} days.\n\nBest regards,\nRetailMind Procurement Automations"
    po_number = f"PO-2026-{datetime.now().strftime('%M%S')}"
    return {
        "po_number": po_number, "supplier": item["supplier"], "product_name": item["name"],
        "order_quantity": order_quantity, "unit": item["unit"], "cost_per_unit": cost_price,
        "total_cost_pkr": total_cost, "lead_delivery_days": item["supplier_lead_days"],
        "supplier_email_draft": email_draft
    }

def check_inventory_supplies(email: str, treatments_performed: str) -> dict:
    """
    Deducts items from inventory based on processed POS sales.
    Generates low-stock alerts if item quantities fall below their predefined safety threshold.
    """
    inv = load_inventory(email)
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
    save_inventory(email, updated_inv)
    return {"sales_processed": sales_list, "deductions_applied": deductions, "current_stock": updated_inv, "alerts": alerts}

# ══════════════════════════════════════════════════════════════════════════════
# AGENT (from agent.py) — Diagnostic pipeline
# ══════════════════════════════════════════════════════════════════════════════

def build_fitted_layout(email: str, transactions: list, inventory_items: dict):
    """
    Analyzes transaction histories to compute item category co-occurrences.
    Maps categories to physical store shelf layouts (aisles/slots) prioritizing cross-selling metrics.
    """
    # 1. Map item names to categories
    item_to_category = {}
    for key, inv_item in inventory_items.items():
        if inv_item.get("name") and inv_item.get("category"):
            item_to_category[inv_item["name"].lower().strip()] = inv_item["category"]

    # 2. Extract transaction baskets in terms of categories
    baskets = {}
    for row in transactions:
        tx_id = row.get("TransactionId")
        item_name = row.get("ItemName", "").strip().lower()
        if tx_id and item_name:
            category = item_to_category.get(item_name)
            if not category:
                # Fallback for common items if category is not found in inventory
                if "oil" in item_name or "dalda" in item_name:
                    category = "Cooking Oil"
                elif "tea" in item_name or "lipton" in item_name:
                    category = "Tea"
                elif "milk" in item_name or "nestle" in item_name:
                    category = "Milk"
                elif "soap" in item_name or "lux" in item_name:
                    category = "Soap"
                elif "detergent" in item_name or "surf" in item_name:
                    category = "Detergent"
                elif "yogurt" in item_name:
                    category = "Yogurt"
                elif "flour" in item_name:
                    category = "Flour"
                elif "sugar" in item_name:
                    category = "Sugar"
                else:
                    category = "General"
            
            if tx_id not in baskets:
                baskets[tx_id] = set()
            baskets[tx_id].add(category)

    # 3. Compute category pair co-occurrence frequencies
    category_co_occurrences = {}
    for categories_set in baskets.values():
        cat_list = list(categories_set)
        for i in range(len(cat_list)):
            for j in range(i + 1, len(cat_list)):
                pair = tuple(sorted([cat_list[i], cat_list[j]]))
                category_co_occurrences[pair] = category_co_occurrences.get(pair, 0) + 1

    # 4. Calculate sales frequency per category
    category_sales = {}
    for row in transactions:
        item_name = row.get("ItemName", "").strip().lower()
        item_cat = item_to_category.get(item_name)
        if not item_cat:
            if "oil" in item_name or "dalda" in item_name:
                item_cat = "Cooking Oil"
            elif "tea" in item_name or "lipton" in item_name:
                item_cat = "Tea"
            elif "milk" in item_name or "nestle" in item_name:
                item_cat = "Milk"
            elif "soap" in item_name or "lux" in item_name:
                item_cat = "Soap"
            elif "detergent" in item_name or "surf" in item_name:
                item_cat = "Detergent"
            elif "yogurt" in item_name:
                item_cat = "Yogurt"
            elif "flour" in item_name:
                item_cat = "Flour"
            elif "sugar" in item_name:
                item_cat = "Sugar"
            else:
                item_cat = "General"
        qty = safe_int(row.get("Quantity"), 1)
        category_sales[item_cat] = category_sales.get(item_cat, 0) + qty

    # Sort categories by sales volume, fallback to alphabetical
    categories = list(set([item.get("category", "General") for item in inventory_items.values() if item.get("category")]))
    if not categories:
        categories = ["Cooking Oil", "Tea", "Flour", "Sugar", "Milk", "Yogurt", "Soap", "Detergent", "Soft Drinks", "Snacks"]

    # Fill in any missing known categories from sales
    for cat in category_sales.keys():
        if cat not in categories:
            categories.append(cat)

    categories.sort(key=lambda c: category_sales.get(c, 0), reverse=True)

    # Retrieve layout config (Aisles count & Slots per aisle)
    aisles_count = 3
    slots_per_aisle = 4
    if settings_collection is not None:
        settings = settings_collection.find_one({"email": email})
        if settings:
            layout_data = settings.get("layout_config", {})
            if isinstance(layout_data, dict):
                aisles_count = int(layout_data.get("aisles_count", 3))
                slots_per_aisle = int(layout_data.get("slots_per_aisle", 4))

    total_capacity = aisles_count * slots_per_aisle
    fitted_categories = categories[:total_capacity]
    overflow_categories = categories[total_capacity:]

    import math
    extra_lines_needed = math.ceil(len(overflow_categories) / slots_per_aisle) if overflow_categories and slots_per_aisle > 0 else 0

    # 5. Greedy layout placement: place co-occurring items next to each other
    placed = set()
    grid = [[None for _ in range(slots_per_aisle)] for _ in range(aisles_count)]

    for i in range(aisles_count):
        for j in range(slots_per_aisle):
            best_cand = None
            if j == 0:
                # First slot: pick highest sales volume unplaced category
                for cat in fitted_categories:
                    if cat not in placed:
                        best_cand = cat
                        break
            else:
                # Subsequent slot: pick unplaced category with highest co-occurrence with previous slot
                prev_cat = grid[i][j-1]
                best_score = -1
                for cat in fitted_categories:
                    if cat not in placed:
                        pair = tuple(sorted([prev_cat, cat]))
                        score = category_co_occurrences.get(pair, 0)
                        if score > best_score:
                            best_score = score
                            best_cand = cat
                
                # If no co-occurrence info or best score is 0, fallback to highest sales volume
                if best_score <= 0 or best_cand is None:
                    for cat in fitted_categories:
                        if cat not in placed:
                            best_cand = cat
                            break
            
            if best_cand:
                grid[i][j] = best_cand
                placed.add(best_cand)

    fitted_layout = []
    for i in range(aisles_count):
        aisle_slots = []
        for j in range(slots_per_aisle):
            aisle_slots.append(grid[i][j] if grid[i][j] else "")
        fitted_layout.append({
            "id": str(i + 1),
            "name": f"Line {i + 1}",
            "slots": aisle_slots
        })

    return {
        "fitted_layout": fitted_layout,
        "overflow_categories": overflow_categories,
        "extra_lines_needed": extra_lines_needed,
        "aisles_count": aisles_count,
        "slots_per_aisle": slots_per_aisle
    }

def analyze_purchase_patterns(email: str) -> list:
    """
    Identifies high-frequency item pairs bought together using point-of-sale data.
    Utilizes an LLM to generate strategic shelf-rearrangement recommendations to optimize physical layout.
    """
    if pos_collection is None:
        return []
    records = list(pos_collection.find({"email": email}))
    transactions = []
    for r in records:
        transactions.extend(r.get("data", []))
        
    baskets = {}
    for row in transactions:
        tx_id = row.get("TransactionId")
        item = row.get("ItemName", "").strip()
        if tx_id and item:
            if tx_id not in baskets:
                baskets[tx_id] = set()
            baskets[tx_id].add(item)
            
    pair_counts = {}
    for tx_id, items_set in baskets.items():
        items_list = list(items_set)
        for i in range(len(items_list)):
            for j in range(i + 1, len(items_list)):
                pair = tuple(sorted([items_list[i], items_list[j]]))
                pair_counts[pair] = pair_counts.get(pair, 0) + 1
                
    sorted_pairs = sorted(pair_counts.items(), key=lambda x: x[1], reverse=True)
    top_pairs = sorted_pairs[:5]
    
    # Load user layout settings & fit them
    inventory_items = load_inventory(email)
    layout_info = build_fitted_layout(email, transactions, inventory_items)
    layout_config = layout_info["fitted_layout"]

    layout_desc = "Current Supermarket Layout Configuration:\n"
    for aisle in layout_config:
        slots_str = ", ".join([s if s else "Empty" for s in aisle.get("slots", [])])
        layout_desc += f"- Aisle ID '{aisle.get('id')}': Named '{aisle.get('name')}', holding slots: [{slots_str}]\n"
    
    recommendations = []
    if top_pairs:
        pairs_desc = ""
        for pair, count in top_pairs:
            pairs_desc += f"- {pair[0]} & {pair[1]} bought together {count} times.\n"
            
        prompt = (
            f"You are a Retail Merchandising Expert at RetailMind AI.\n"
            f"Based on POS transaction logs, here are the top items purchased together in the supermarket:\n"
            f"{pairs_desc}\n"
            f"Here is the user's current physical store aisle layout configuration:\n"
            f"{layout_desc}\n"
            f"Suggest 3 high-impact store shelf rearrangement recommendations. "
            f"Analyze their current positions in the layout and identify if they are placed in different lines. "
            f"Recommend moving them closer (e.g. adjacent slots or same line) to increase cross-selling. "
            f"Return ONLY valid JSON as a list of dicts. Each dict must contain keys: "
            f"'title', 'reason', 'placement_tip', 'source_aisle_id', 'target_aisle_id', 'item_a', 'item_b'. "
            f"For 'source_aisle_id' and 'target_aisle_id', search the layout config to see if the items fit any slot. "
            f"For example, if you suggest moving item B (e.g., Lipton Tea, currently in Aisle '2') to item A's Aisle (e.g., Cooking Oil, in Aisle '1'), "
            f"set 'source_aisle_id' to '2', and 'target_aisle_id' to '1'. "
            f"If the items are not configured in the layout or the layout is empty, use null (None) for 'source_aisle_id' and 'target_aisle_id'.\n"
            f"Return NO markdown wrappers."
        )
        try:
            response = safe_llm_invoke(prompt)
            content = response.content.strip()
            if content.startswith("```json"):
                content = content[7:]
            if content.endswith("```"):
                content = content[:-3]
            recommendations = json.loads(content.strip())
        except Exception:
            pass
            
    if not recommendations:
        recommendations = [
            {
                "title": "Dalda Oil & Lipton Tea Endcap Display",
                "reason": "These items have strong breakfast/grocery co-occurrence.",
                "placement_tip": "Position Lipton Tea boxes on the endcap of Aisle 4 directly facing the Cooking Oil section.",
                "source_aisle_id": None,
                "target_aisle_id": None,
                "item_a": "Dalda Cooking Oil",
                "item_b": "Lipton Tea"
            },
            {
                "title": "Laundry Detergent & Lux Soap Cross-Merchandising",
                "reason": "Surf Excel and Ariel detergent purchases frequently co-occur with personal care items.",
                "placement_tip": "Place Lux soap bars on the checkout impulse racks and beside the detergent displays.",
                "source_aisle_id": None,
                "target_aisle_id": None,
                "item_a": "Surf Excel",
                "item_b": "Lux Soap"
            },
            {
                "title": "Breakfast Bundle Promotion",
                "reason": "Nestle Milkpak shows strong daily purchase volume across all segments.",
                "placement_tip": "Create a 'Breakfast Bundle' display near the entrance featuring Nestle Milkpak 1L alongside tea.",
                "source_aisle_id": None,
                "target_aisle_id": None,
                "item_a": "Nestle Milkpak",
                "item_b": "Lipton Tea"
            }
        ]

    def find_aisle_id_for_item(item_name: str):
        if not item_name:
            return None
        item_lower = item_name.lower()
        
        # Step 1: Find category of the item from inventory
        item_cat = None
        for key, inv_item in inventory_items.items():
            if inv_item.get("name") and inv_item["name"].lower() == item_lower:
                item_cat = inv_item.get("category")
                break
        
        if not item_cat:
            # Try substring search in inventory names
            for key, inv_item in inventory_items.items():
                if inv_item.get("name") and (item_lower in inv_item["name"].lower() or inv_item["name"].lower() in item_lower):
                    item_cat = inv_item.get("category")
                    break
                    
        if not item_cat:
            # Fallback for common items if category is not found in inventory
            if "oil" in item_lower or "dalda" in item_lower:
                item_cat = "Cooking Oil"
            elif "tea" in item_lower or "lipton" in item_lower:
                item_cat = "Tea"
            elif "milk" in item_lower or "nestle" in item_lower:
                item_cat = "Milk"
            elif "soap" in item_lower or "lux" in item_lower:
                item_cat = "Soap"
            elif "detergent" in item_lower or "surf" in item_lower:
                item_cat = "Detergent"
            elif "yogurt" in item_lower:
                item_cat = "Yogurt"
            elif "flour" in item_lower:
                item_cat = "Flour"
            elif "sugar" in item_lower:
                item_cat = "Sugar"

        if not item_cat:
            return None
            
        # Step 2: Find which aisle contains this category
        for aisle in layout_config:
            slots = aisle.get("slots", [])
            for slot in slots:
                if slot and slot.lower() == item_cat.lower():
                    return aisle.get("id")
        return None

    # Map aisle IDs programmatically to guarantee matches
    for rec in recommendations:
        rec["source_aisle_id"] = find_aisle_id_for_item(rec.get("item_b"))
        rec["target_aisle_id"] = find_aisle_id_for_item(rec.get("item_a"))

    return recommendations

def run_diagnostics_stream(email: str):
    """
    Main orchestrator generator function that runs the diagnostic pipeline via Server-Sent Events (SSE).
    Sequentially activates multiple agents (Expiry, Pricing, Inventory, SWOT) and streams their status to the client.
    """
    try:
        yield f"data: {json.dumps({'agent': 'Operations Analyst', 'status': 'Fetching POS transactions from database...'})}\n\n"
        time.sleep(0.5)

        if pos_collection is None:
            yield f"data: {json.dumps({'agent': 'Error', 'status': 'Database not connected.'})}\n\n"
            return

        records = list(pos_collection.find({"email": email}))
        transactions = []
        for r in records:
            transactions.extend(r.get("data", []))
        
        if not transactions:
            yield f"data: {json.dumps({'agent': 'Error', 'status': 'No POS data uploaded. Please upload files in Data Sync Hub.'})}\n\n"
            return

        total_transactions = len(transactions)
        total_revenue = 0
        item_sales = {}
        for row in transactions:
            qty = safe_int(row.get("Quantity"), 1)
            price = safe_int(row.get("PricePaid"), 0)
            item = row.get("ItemName", "").strip()
            total_revenue += price
            if item:
                item_sales[item] = item_sales.get(item, 0) + qty

        most_sold_item = max(item_sales, key=item_sales.get) if item_sales else "None"

        yield f"data: {json.dumps({'agent': 'Operations Analyst', 'status': f'POS Audited. {total_transactions} transactions. Revenue: {total_revenue} PKR. Bestseller: {most_sold_item}.'})}\n\n"
        time.sleep(0.5)

        # Expiry Risk
        yield f"data: {json.dumps({'agent': 'Expiry Optimizer', 'status': 'Scanning shelf inventory for upcoming product expiry dates...'})}\n\n"
        expiry_data = analyze_expiry_risk(email, "2026-06-05")
        num_items = len(expiry_data.get('items_at_risk', []))
        yield f"data: {json.dumps({'agent': 'Expiry Optimizer', 'status': f'Found {num_items} categories nearing expiry. Discount campaign drafted.'})}\n\n"

        # Pricing Guard
        yield f"data: {json.dumps({'agent': 'Pricing Auditor', 'status': 'Comparing pricing against competitor databases...'})}\n\n"
        pricing_data = audit_competitor_pricing(email)
        num_gaps = len(pricing_data.get('deviations', []))
        yield f"data: {json.dumps({'agent': 'Pricing Auditor', 'status': f'Found {num_gaps} price gaps. Match recommendations calculated.'})}\n\n"

        # Inventory update
        yield f"data: {json.dumps({'agent': 'Inventory Watchdog', 'status': 'Updating current stock levels...'})}\n\n"
        sales_list = []
        for row in transactions:
            item = row.get("ItemName", "").strip().lower()
            if item:
                sales_list.append(item)
        inv_res = check_inventory_supplies(email, ", ".join(sales_list))
        num_alerts = len(inv_res.get('alerts', []))
        yield f"data: {json.dumps({'agent': 'Inventory Watchdog', 'status': f'Inventory updated. Low stock alerts: {num_alerts}.'})}\n\n"

        # Procurement
        yield f"data: {json.dumps({'agent': 'Procurement Planner', 'status': 'Generating restock purchase orders...'})}\n\n"
        reorder_pos = []
        alerts_list = inv_res.get("alerts", [])
        inventory_items = load_inventory(email)
        for alert in alerts_list:
            # Find item in alert text to trigger PO
            for key, item in inventory_items.items():
                if item.get("name") and item["name"] in alert:
                    po = generate_purchase_order(email, key, 30)
                    if "error" not in po:
                        reorder_pos.append(po)
        yield f"data: {json.dumps({'agent': 'Procurement Planner', 'status': f'Auto-drafted {len(reorder_pos)} Purchase Orders.'})}\n\n"

        # SWOT
        yield f"data: {json.dumps({'agent': 'Retail Advisor', 'status': 'Synthesizing SWOT matrix and strategic actions...'})}\n\n"
        swot_prompt = (
            f"You are the Lead Retail Operations Advisor at RetailMind AI.\n"
            f"Review today's supermarket daily diagnostic report:\n"
            f"- Total Sales Revenue: {total_revenue} PKR\n"
            f"- Expiring Items: {json.dumps(expiry_data.get('items_at_risk', []), indent=2)}\n"
            f"- Price Deviations: {json.dumps(pricing_data.get('deviations', []), indent=2)}\n"
            f"- Inventory Warnings: {json.dumps(inv_res.get('alerts', []), indent=2)}\n"
            f"- Auto Procurement Orders drafted: {json.dumps(reorder_pos, indent=2)}\n\n"
            f"Generate a SWOT analysis and suggest 3 high-priority action steps.\n"
            f"Return ONLY valid JSON with keys: strengths, weaknesses, opportunities, threats, action_steps (all lists of strings).\n"
            f"No markdown wrappers."
        )
        try:
            response = safe_llm_invoke(swot_prompt)
            swot_content = response.content.strip()
            if swot_content.startswith("```json"):
                swot_content = swot_content[7:]
            if swot_content.endswith("```"):
                swot_content = swot_content[:-3]
            swot_data = json.loads(swot_content.strip())
        except Exception:
            swot_data = {
                "strengths": ["Healthy daily sales revenue.", "Bestsellers moving fast."],
                "weaknesses": ["Price matching pressure on Cooking Oil.", "Nestle Milkpak stocks below safety levels."],
                "opportunities": ["Run dynamic discount BOGO campaign on expiring Yogurt cups.", "Reduce Dalda Oil price to match Metro."],
                "threats": ["Inventory expiry write-offs if Yogurt packs are unsold.", "Supply delays for tea products."],
                "action_steps": ["Deploy dynamic Yogurt discounts", "Confirm Dalda price match at POS", "Approve Nestlé purchase orders"]
            }

        # Dynamic stock depletion (velocity vs supplier lead time)
        depletion_risks = []
        for key, item in inventory_items.items():
            velocity = item.get("sales_velocity_daily", 1)
            stock = item.get("stock", 0)
            lead_days = item.get("supplier_lead_days", 3)
            if velocity > 0:
                days_left = round(stock / velocity, 1)
            else:
                days_left = 999.0
            
            # If stock runs out within supplier lead time, or within 3 days, flag it
            if days_left <= max(lead_days, 3):
                depletion_risks.append({
                    "key": key,
                    "name": item["name"],
                    "stock": stock,
                    "sales_velocity_daily": velocity,
                    "supplier_lead_days": lead_days,
                    "days_left": days_left,
                    "status": "Critical" if days_left <= lead_days else "Warning"
                })

        # Co-occurrence Layout Recommendations
        layout_recs = analyze_purchase_patterns(email)

        # Load user layout settings & fit layout dynamically
        layout_items = load_inventory(email)
        layout_info = build_fitted_layout(email, transactions, layout_items)

        final_payload = {
            "kpis": {
                "total_revenue": f"{total_revenue} PKR",
                "total_transactions": total_transactions,
                "bestseller": most_sold_item,
                "waste_risk_cost": f"{sum(item.get('potential_loss', 0) for item in expiry_data.get('items_at_risk', []))} PKR",
                "low_stock_count": len(inv_res.get("alerts", [])),
                "average_basket_value": f"{round(total_revenue / total_transactions)} PKR" if total_transactions > 0 else "0 PKR"
            },
            "expiry": expiry_data,
            "pricing": pricing_data,
            "inventory": inv_res,
            "procurement": reorder_pos,
            "swot": swot_data,
            "depletion_risks": depletion_risks,
            "layout_recommendations": layout_recs,
            "layout_config": layout_info["fitted_layout"],
            "overflow_categories": layout_info["overflow_categories"],
            "extra_lines_needed": layout_info["extra_lines_needed"]
        }
        yield f"data: {json.dumps({'agent': 'Orchestrator', 'status': 'complete', 'result': final_payload})}\n\n"
    except Exception as e:
        import traceback
        traceback.print_exc()
        yield f"data: {json.dumps({'agent': 'Error', 'status': f'Server Error: {str(e)}'})}\n\n"

# ══════════════════════════════════════════════════════════════════════════════


# ══════════════════════════════════════════════════════════════════════════════
# API ROUTES
# ══════════════════════════════════════════════════════════════════════════════
class UploadRequest(BaseModel):
    email: str
    filename: str
    content: str

class SimulationRequest(BaseModel):
    decision: str
    budget: float
    shift_hours: float
    staff_increase: int

class QueryRequest(BaseModel):
    query: str

class QueryResponse(BaseModel):
    response: str
    sources: list = []

@app.get("/")
def read_root():
    return {"message": "RetailMind AI API is running"}

@app.get("/api/health")
def health_check():
    status = {"app": "ok", "groq_key_set": bool(os.getenv("GROQ_API_KEY"))}
    try:
        from langchain_groq import ChatGroq
        status["langchain_groq"] = "ok"
    except Exception as e:
        status["langchain_groq"] = str(e)
    return status

import hashlib

def compute_hash(content: str) -> str:
    return hashlib.sha256(content.encode('utf-8')).hexdigest()

@app.post("/api/upload/inventory")
def upload_inventory(payload: UploadRequest):
    if inventory_collection is None:
        return JSONResponse(status_code=500, content={"status": "error", "message": "Database not configured"})
    try:
        f = io.StringIO(payload.content.strip())
        reader = csv.DictReader(f)
        records = list(reader)
        content_hash = compute_hash(payload.content.strip())
        # Check for duplicate by hash
        existing = inventory_collection.find_one({"email": payload.email, "hash": content_hash})
        if existing:
            return JSONResponse(status_code=400, content={"status": "error", "message": "Duplicate inventory file detected."})
        doc_id = str(uuid.uuid4())
        inventory_collection.insert_one({
            "email": payload.email,
            "doc_id": doc_id,
            "filename": payload.filename,
            "data": records,
            "hash": content_hash,
            "updated_at": datetime.utcnow()
        })
        return {"status": "success", "message": f"Successfully loaded {len(records)} inventory items."}
    except Exception as e:
        return JSONResponse(status_code=500, content={"status": "error", "message": str(e)})

@app.post("/api/upload/competitors")
def upload_competitors(payload: UploadRequest):
    if competitors_collection is None:
        return JSONResponse(status_code=500, content={"status": "error", "message": "Database not configured"})
    try:
        f = io.StringIO(payload.content.strip())
        reader = csv.DictReader(f)
        records = list(reader)
        competitors_collection.update_one(
            {"email": payload.email},
            {"$set": {"data": records, "updated_at": datetime.utcnow()}},
            upsert=True
        )
        return {"status": "success", "message": f"Successfully loaded {len(records)} competitor records."}
    except Exception as e:
        return JSONResponse(status_code=500, content={"status": "error", "message": str(e)})

@app.post("/api/upload/pos")
def upload_pos(payload: UploadRequest):
    if pos_collection is None:
        return JSONResponse(status_code=500, content={"status": "error", "message": "Database not configured"})
    try:
        f = io.StringIO(payload.content.strip())
        reader = csv.DictReader(f)
        records = list(reader)
        content_hash = compute_hash(payload.content.strip())
        # Check for duplicate by hash
        existing = pos_collection.find_one({"email": payload.email, "hash": content_hash})
        if existing:
            return JSONResponse(status_code=400, content={"status": "error", "message": "Duplicate POS file detected."})
        doc_id = str(uuid.uuid4())
        pos_collection.insert_one({
            "email": payload.email,
            "doc_id": doc_id,
            "filename": payload.filename,
            "data": records,
            "hash": content_hash,
            "updated_at": datetime.utcnow()
        })
        return {"status": "success", "message": f"Successfully loaded {len(records)} POS transactions."}
    except Exception as e:
        return JSONResponse(status_code=500, content={"status": "error", "message": str(e)})

@app.get("/api/inventory")
def get_inventory_files(email: str):
    if inventory_collection is None:
        return []
    records = []
    for doc in inventory_collection.find({"email": email}, {"doc_id": 1, "filename": 1, "_id": 1}):
        records.append({
            "doc_id": str(doc.get("doc_id") or doc["_id"]),
            "filename": doc.get("filename") or "Inventory CSV"
        })
    return records

@app.delete("/api/inventory/{doc_id}")
def delete_inventory(doc_id: str, email: str):
    if inventory_collection is None:
        return JSONResponse(status_code=500, content={"status": "error"})
    query = {"email": email}
    obj_id = safe_object_id(doc_id)
    if obj_id:
        query["$or"] = [{"doc_id": doc_id}, {"_id": obj_id}]
    else:
        query["doc_id"] = doc_id
    inventory_collection.delete_one(query)
    return {"status": "success"}

@app.get("/api/pos")
def get_pos_files(email: str):
    if pos_collection is None:
        return []
    records = []
    for doc in pos_collection.find({"email": email}, {"doc_id": 1, "filename": 1, "_id": 1}):
        records.append({
            "doc_id": str(doc.get("doc_id") or doc["_id"]),
            "filename": doc.get("filename") or "POS Sales CSV"
        })
    return records

@app.delete("/api/pos/{doc_id}")
def delete_pos(doc_id: str, email: str):
    if pos_collection is None:
        return JSONResponse(status_code=500, content={"status": "error"})
    query = {"email": email}
    obj_id = safe_object_id(doc_id)
    if obj_id:
        query["$or"] = [{"doc_id": doc_id}, {"_id": obj_id}]
    else:
        query["doc_id"] = doc_id
    pos_collection.delete_one(query)
    return {"status": "success"}

@app.post("/api/upload/policy")
async def upload_policy(email: str = Form(...), file: UploadFile = File(...)):
    if policies_collection is None:
        return JSONResponse(status_code=500, content={"status": "error", "message": "Database not configured"})
    try:
        pdf_bytes = await file.read()
        # Compute hash of PDF content for duplicate detection
        content_hash = hashlib.sha256(pdf_bytes).hexdigest()
        existing = policies_collection.find_one({"email": email, "hash": content_hash})
        if existing:
            return JSONResponse(status_code=400, content={"status": "error", "message": "Duplicate policy PDF detected."})
        
        reader = PyPDF2.PdfReader(io.BytesIO(pdf_bytes))
        policy_text = ""
        for page in reader.pages:
            policy_text += page.extract_text() + "\n"

        doc_id = str(uuid.uuid4())
        policies_collection.insert_one({
            "email": email,
            "doc_id": doc_id,
            "filename": file.filename,
            "policy_text": policy_text.strip(),
            "hash": content_hash,
            "uploaded_at": datetime.utcnow()
        })
        return {"status": "success", "message": "Business Policy PDF uploaded and extracted successfully."}
    except Exception as e:
        return JSONResponse(status_code=500, content={"status": "error", "message": str(e)})

@app.get("/api/policies")
def get_policies(email: str = None):
    if not email or policies_collection is None:
        return []
    records = []
    for doc in policies_collection.find({"email": email}, {"policy_text": 0}):
        records.append({
            "doc_id": str(doc.get("doc_id") or doc["_id"]),
            "filename": doc.get("filename") or "Business Policy Document"
        })
    return records

@app.delete("/api/policies/{doc_id}")
def delete_policy(doc_id: str, email: str):
    if policies_collection is None:
        return JSONResponse(status_code=500, content={"status": "error", "message": "Database not configured"})
    query = {"email": email}
    obj_id = safe_object_id(doc_id)
    if obj_id:
        query["$or"] = [{"doc_id": doc_id}, {"_id": obj_id}]
    else:
        query["doc_id"] = doc_id
    policies_collection.delete_one(query)
    return {"status": "success", "message": "Document deleted."}

class SettingsPayload(BaseModel):
    email: str
    smtp_email: str
    smtp_password: str
    customer_email: str
    customer_password: str
    staff_email: str
    layout_config: dict = {}

@app.post("/api/settings")
def save_settings(payload: SettingsPayload):
    if settings_collection is None:
        return JSONResponse(status_code=500, content={"status": "error", "message": "Database not configured"})
    
    settings_collection.update_one(
        {"email": payload.email},
        {"$set": {
            "smtp_email": payload.smtp_email,
            "smtp_password": payload.smtp_password,
            "customer_email": payload.customer_email,
            "customer_password": payload.customer_password,
            "staff_email": payload.staff_email,
            "layout_config": payload.layout_config,
            "updated_at": datetime.utcnow()
        }},
        upsert=True
    )
    return {"status": "success", "message": "Settings saved successfully."}

@app.get("/api/settings")
def get_settings(email: str):
    if settings_collection is None:
        return {}
    record = settings_collection.find_one({"email": email}, {"_id": 0})
    return record or {}

class SupportRequest(BaseModel):
    email: str
    message: str
    message_id: str = None

@app.post("/api/support/seed")
def seed_dummy_emails(payload: dict):
    user_email = payload.get("email")
    if not user_email or emails_collection is None:
        return {"status": "error", "message": "Missing email or DB."}
    
    dummy_emails = []
    templates = [
        ("order_status", "Mera order {id} abhi tak nahi aya, kab milega?"),
        ("order_status", "Please track my order {id}, status update chahiye."),
        ("order_status", "Order {id} dispatch ho gaya hai ya nahi?"),
        ("faq", "Delivery charges kitne hain Karachi ke liye?"),
        ("faq", "Kya credit card accept karte hain delivery pe?"),
        ("faq", "Shop ki timings kya hain?"),
        ("complaint", "Mera saman toota hua nikla hai, main case karunga!"),
        ("complaint", "Rude rider behaviour, I want a refund now."),
        ("complaint", "Ghalat item bhej diya hai, wapis le jao isko."),
    ]
    ids = ["T1001", "T1002", "T1003", "T1004", "T1005", "T1006", "T1007", "T1008"]
    
    import uuid
    for i in range(100):
        cat, tmpl = random.choice(templates)
        msg = tmpl.replace("{id}", random.choice(ids))
        dummy_emails.append({
            "message_id": str(uuid.uuid4()),
            "user_email": user_email,
            "subject": f"Customer Inquiry #{random.randint(1000, 9999)}",
            "body": msg,
            "status": "unread", # unread, replied, escalated
            "created_at": datetime.utcnow()
        })
    
    emails_collection.delete_many({"user_email": user_email})
    emails_collection.insert_many(dummy_emails)
    return {"status": "success", "message": "100 dummy emails seeded."}

class MockEmailPayload(BaseModel):
    email: str

@app.post("/api/support/send-mock-emails")
def send_mock_live_emails(payload: MockEmailPayload):
    if settings_collection is None:
        return JSONResponse(status_code=500, content={"status": "error", "message": "Database not configured"})
        
    settings = settings_collection.find_one({"email": payload.email})
    if not settings:
        return JSONResponse(status_code=400, content={"status": "error", "message": "Business settings not configured. Please setup your credentials in Settings."})

    customer_email = settings.get("customer_email")
    customer_pass = settings.get("customer_password")
    smtp_email = settings.get("smtp_email")

    if not customer_email or not customer_pass or not smtp_email:
        return JSONResponse(status_code=400, content={"status": "error", "message": "Customer or SMTP Credentials not found in Business Settings."})

    queries = [
        # Solvable by PDF
        "How long does standard delivery take for metropolitan areas?",
        "What is your return policy? I bought an item 2 days ago.",
        "Can I get express shipping and how much is it?",
        "Do electronic products come with a warranty?",
        "Can I get a refund for a sale item I bought at 30% discount?",
        # Unsolvable / Escalations (Go to Staff)
        "I want to collaborate with your brand for a marketing campaign. Who should I contact?",
        "I received the completely wrong item. The rider was very rude. I want my money back NOW!",
        "Can I change my delivery address? I moved to a different city yesterday.",
        "Do you offer wholesale or B2B discounts for bulk purchasing?",
        "My credit card was charged twice for the same order! Please refund the extra charge!"
    ]

    try:
        server = smtplib.SMTP('smtp.gmail.com', 587)
        server.starttls()
        server.login(customer_email, customer_pass)
        
        for i, query in enumerate(queries):
            msg = MIMEMultipart()
            msg['From'] = customer_email
            msg['To'] = smtp_email
            msg['Subject'] = f"Business Queries: Test Customer Question #{i+1}"
            
            msg.attach(MIMEText(query, 'plain'))
            server.send_message(msg)
            time.sleep(0.5) # Prevent rate limiting
            
        server.quit()
        return {"status": "success", "message": "10 test emails sent to live inbox successfully!"}
    except Exception as e:
        return JSONResponse(status_code=500, content={"status": "error", "message": f"Failed to send emails: {str(e)}"})

@app.get("/api/support/inbox")
def get_inbox(email: str = None):
    if not email or emails_collection is None:
        return []
    records = list(emails_collection.find({"user_email": email}, {"_id": 0}))
    return records

@app.post("/api/support/resolve")
def resolve_customer_support(request: SupportRequest):
    llm = _get_llm()
    # Step 1: Classifier & Extraction
    classify_prompt = (
        f"Analyze the following customer email/message: '{request.message}'.\n"
        f"1. Classify the intent into EXACTLY ONE of these categories: 'order_status', 'faq', or 'complaint'.\n"
        f"2. Extract any mentioned Order/Transaction ID (e.g., T1001, etc). If none, output 'none'.\n"
        f"Return ONLY valid JSON: {{\"intent\": \"category\", \"extracted_id\": \"id\"}}"
    )
    try:
        res = llm.invoke(classify_prompt).content.strip()
        import re
        json_match = re.search(r'\{.*\}', res, re.DOTALL)
        if json_match:
            res = json_match.group(0)
        classification = json.loads(res.strip())
        intent = classification.get("intent", "faq")
        extracted_id = classification.get("extracted_id", "none")
    except:
        intent, extracted_id = "faq", "none"

    db_context = "No specific database context needed."
    
    # Step 2 & 3: Database Lookup & Reply Generation
    if intent == "order_status":
        order_details = "Not Found"
        if extracted_id.lower() != "none" and pos_collection is not None:
            record = pos_collection.find_one({"email": request.email})
            if record and "data" in record:
                for row in record["data"]:
                    if row.get("TransactionId", "").strip().lower() == extracted_id.lower():
                        order_details = str(row)
                        break
        db_context = f"Found Order Data: {order_details}"
        reply_prompt = (
            f"Customer Message: '{request.message}'\n"
            f"Database Lookup Result: {db_context}\n"
            f"Write a friendly, professional email reply to the customer in Roman Urdu.\n"
            f"If order found, confirm the item and state it's being shipped. If not found, ask for the correct ID."
        )
    elif intent == "complaint":
        reply_prompt = (
            f"Customer Message: '{request.message}'\n"
            f"Write a highly apologetic email reply in Roman Urdu assuring them that the issue has been escalated to management and they will be contacted shortly."
        )
    else:
        reply_prompt = (
            f"Customer Message: '{request.message}'\n"
            f"Write a friendly FAQ reply in Roman Urdu addressing their general query."
        )

    try:
        print("DRAFTING AUTOMATED REPLY...")
        auto_reply = safe_llm_invoke(reply_prompt).content.strip()
        print(f"GENERATED REPLY:\n{auto_reply}\n")
    except Exception as e:
        auto_reply = f"System Error generating reply: {str(e)}"

    return {
        "intent": intent.upper(),
        "extracted_id": extracted_id,
        "database_context": db_context,
        "auto_reply": auto_reply,
        "action_taken": "Forwarded to Staff (WhatsApp/Slack)" if intent == "complaint" else "Auto-Reply Sent via Email Node"
    }

@app.get("/api/support/live-inbox")
def get_live_inbox(email: str = None):
    if not email or settings_collection is None:
        return []
        
    settings = settings_collection.find_one({"email": email})
    if not settings:
        return []

    smtp_email = settings.get("smtp_email")
    smtp_pass = settings.get("smtp_password")
    if not smtp_email or not smtp_pass:
        return []
    
    try:
        mail = imaplib.IMAP4_SSL("imap.gmail.com")
        mail.login(smtp_email, smtp_pass)
        mail.select("inbox")
        
        # Search for unread emails, filter in python to avoid IMAP search string bugs
        status, messages = mail.search(None, '(UNSEEN)')
        email_ids = messages[0].split()
        
        results = []
        # Get latest 50 unseen to process
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
                    
                    # Filter by subject in Python
                    if "business queries" not in subject.lower():
                        continue
                            
                    sender = msg.get("From")
                    body = ""
                    if msg.is_multipart():
                        for part in msg.walk():
                            content_type = part.get_content_type()
                            content_disposition = str(part.get("Content-Disposition"))
                            if content_type == "text/plain" and "attachment" not in content_disposition:
                                try:
                                    body = part.get_payload(decode=True).decode()
                                    break
                                except:
                                    pass
                    else:
                        try:
                            body = msg.get_payload(decode=True).decode()
                        except:
                            pass
                    
                    results.append({
                        "message_id": e_id.decode(),
                        "subject": subject,
                        "body": body.strip(),
                        "sender": sender,
                        "status": "unread"
                    })
        mail.close()
        mail.logout()
        # Reverse to show newest first
        return results[::-1]
    except Exception as e:
        print("IMAP Error:", e)
        return []

class LiveResolveRequest(BaseModel):
    message_id: str
    message: str
    sender: str
    subject: str
    email: str

@app.post("/api/support/resolve-live")
def resolve_live_email(req: LiveResolveRequest):
    # 1. Fetch Policy Document & Chunk
    policy_chunks = []
    if policies_collection is not None:
        records = list(policies_collection.find({"email": req.email}))
        for doc in records:
            fname = doc.get("filename", "Business Policy Document")
            text = doc.get("policy_text", "")
            paragraphs = [p.strip() for p in text.split("\n\n") if p.strip()]
            for p in paragraphs:
                if len(p) > 1000:
                    words = p.split()
                    current_chunk = []
                    current_len = 0
                    for word in words:
                        current_chunk.append(word)
                        current_len += len(word) + 1
                        if current_len > 800:
                            policy_chunks.append({
                                "text": " ".join(current_chunk),
                                "source": fname
                            })
                            current_chunk = []
                            current_len = 0
                    if current_chunk:
                        policy_chunks.append({
                            "text": " ".join(current_chunk),
                            "source": fname
                        })
                else:
                    policy_chunks.append({
                        "text": p,
                        "source": fname
                    })

    # 2. Search Policy Chunks via BM25
    relevant_policy = ""
    if policy_chunks:
        bm25 = SimpleBM25(policy_chunks)
        matched = bm25.search(req.message, top_n=3)
        if matched:
            relevant_policy = "Relevant Store Policies:\n"
            for chunk in matched:
                relevant_policy += f"Source: {chunk['source']}\nContent:\n{chunk['text']}\n---\n"

    # 3. Classifier, RAG Verification & Reply Generation Prompt
    classify_prompt = (
        f"Analyze this customer email message: '{req.message}'.\n\n"
        f"=== RELEVANT BUSINESS POLICY CONTEXT ===\n"
        f"{relevant_policy if relevant_policy else 'No matching policy details found in store memory.'}\n\n"
        f"CRITICAL INSTRUCTIONS:\n"
        f"1. Check if the customer query is answered DIRECTLY and CLEARLY by the store policy context above.\n"
        f"2. If yes, classify intent as 'faq' and generate a highly professional email reply in Roman Urdu answering their query strictly using the policy details.\n"
        f"3. If the query is NOT answered by the policies, or if the customer is complaining about a bad experience, or demands a refund/human contact, classify intent as 'complaint' and generate a short internal escalation memo summarizing the customer's issue.\n"
        f"4. Extract any Transaction/Order ID (e.g. T1001) if present. If none, output 'none'.\n\n"
        f"Return ONLY valid JSON format matching this schema:\n"
        f"{{\n"
        f"  \"intent\": \"faq\" or \"complaint\",\n"
        f"  \"extracted_id\": \"id\",\n"
        f"  \"reply\": \"Your generated Urdu reply or internal staff memo here\"\n"
        f"}}"
    )

    try:
        print(f"LLM CLASSIFICATION PROMPT:\n{classify_prompt}\n")
        
        res = safe_llm_invoke(classify_prompt).content.strip()
        print(f"LLM RAW RESPONSE:\n{res}\n")
        json_match = re.search(r'\{.*\}', res, re.DOTALL)
        if json_match:
            res = json_match.group(0)
        classification = json.loads(res.strip())
        intent = classification.get("intent", "faq")
        extracted_id = classification.get("extracted_id", "none")
        auto_reply = classification.get("reply", "We have received your email. Our human support team will get back to you shortly.")
    except Exception as e:
        print("LLM Classification Error:", e)
        intent, extracted_id = "complaint", "none"
        auto_reply = "We have received your email. Our human support team will get back to you shortly."

    # Look up database context if order ID is present
    db_context = "No specific database context needed."
    if extracted_id.lower() != "none" and pos_collection is not None:
        record = pos_collection.find_one({"email": req.email})
        if record and "data" in record:
            for row in record["data"]:
                if row.get("TransactionId", "").strip().lower() == extracted_id.lower():
                    db_context = f"Found Order Data: {row}"
                    break

    # Email Action via SMTP
    if settings_collection is None:
        return {"action_taken": "Error: DB not configured"}
        
    settings = settings_collection.find_one({"email": req.email})
    if not settings:
        return {"action_taken": "Error: Settings not configured"}

    smtp_email = settings.get("smtp_email")
    smtp_pass = settings.get("smtp_password")
    
    staff_email = settings.get("staff_email")
    if not staff_email or str(staff_email).strip() == "":
        return {"action_taken": "Error: Staff Email not configured in Settings"}
    action_taken = "Auto-Reply Sent"

    try:
        server = smtplib.SMTP('smtp.gmail.com', 587)
        server.starttls()
        server.login(smtp_email, smtp_pass)

        if intent == "complaint":
            # Forward ONLY to staff
            msg = MIMEMultipart()
            msg['From'] = smtp_email
            msg['To'] = staff_email
            msg['Subject'] = f"ESCALATED: {req.subject}"
            body = f"An email arrived from user {req.sender} that needs your attention.\n\nCustomer Message:\n{req.message}\n\nAI Escalation Memo:\n{auto_reply}"
            msg.attach(MIMEText(body, 'plain'))
            server.send_message(msg)
            action_taken = f"Forwarded to Staff ({staff_email})"
        else:
            # Send reply ONLY back to customer
            reply_msg = MIMEMultipart()
            reply_msg['From'] = smtp_email
            reply_msg['To'] = req.sender
            reply_msg['Subject'] = f"Re: {req.subject}"
            reply_msg.attach(MIMEText(auto_reply, 'plain'))
            server.send_message(reply_msg)
            action_taken = f"Auto-Reply Sent to Customer ({req.sender})"
        
        server.quit()

        # Mark as read in IMAP
        try:
            mail = imaplib.IMAP4_SSL("imap.gmail.com")
            mail.login(smtp_email, smtp_pass)
            mail.select("inbox")
            mail.store(req.message_id, '+FLAGS', '\\Seen')
            mail.logout()
        except Exception as e:
            print("Failed to mark as read:", e)

    except Exception as e:
        action_taken = f"SMTP Error: {e}"

    return {
        "intent": intent.upper(),
        "extracted_id": extracted_id,
        "database_context": db_context,
        "auto_reply": auto_reply,
        "action_taken": action_taken
    }

@app.get("/api/stream")
def stream_diagnostics(email: str = None):
    if not email:
        return JSONResponse(status_code=400, content={"error": "email is required"})
    return StreamingResponse(
        run_diagnostics_stream(email),
        media_type="text/event-stream"
    )

@app.get("/api/inventory")
def get_inventory_route(email: str = None):
    if not email:
        return {}
    return load_inventory(email)

@app.post("/api/inventory/reset")
def reset_inventory():
    return {"message": "Reset disabled in dynamic mode."}

@app.post("/api/simulate")
def handle_simulation(request: SimulationRequest):
    prompt = (
        f"You are the Operations Analyst at RetailMind Supermarket.\n"
        f"Simulate the following operational decision:\n"
        f"Decision: '{request.decision}'\n"
        f"Budget Allocation: {request.budget} PKR\n"
        f"Hours added/shifted: {request.shift_hours} hours\n"
        f"Staff hired/allocated: {request.staff_increase} people\n\n"
        f"Forecast the impact on operations and customer throughput.\n"
        f"Return ONLY valid JSON with keys: feasibility_score (int 0-100), wait_time_impact (string), "
        f"revenue_impact (string), pros (list), cons (list), implementation_steps (list).\n"
        f"No markdown wrapper."
    )
    try:
        # Call LLM
        response = safe_llm_invoke(prompt)
        content = response.content.strip()
        if content.startswith("```json"):
            content = content[7:]
        if content.endswith("```"):
            content = content[:-3]
        data = json.loads(content.strip())
    except Exception:
        data = {
            "feasibility_score": 50, "wait_time_impact": "Unknown",
            "revenue_impact": "Undetermined", "pros": ["Direct action taken."],
            "cons": ["Potential overhead expense."],
            "implementation_steps": ["Review strategy.", "Audit budget."]
        }
    return data

class GoogleLoginRequest(BaseModel):
    token: str

class RegisterRequest(BaseModel):
    name: str
    email: str
    password: str

class LoginRequest(BaseModel):
    email: str
    password: str

class ForgotPasswordRequest(BaseModel):
    email: str

class ResetPasswordRequest(BaseModel):
    email: str
    otp: str
    new_password: str

@app.get("/api/config")
def get_config():
    return {"google_client_id": os.getenv("VITE_GOOGLE_CLIENT_ID")}

@app.post("/api/auth/register")
def register_user(payload: RegisterRequest):
    if users_collection is None:
        return JSONResponse(status_code=500, content={"status": "error", "message": "Database not configured"})
    if users_collection.find_one({"email": payload.email}):
        return JSONResponse(status_code=400, content={"status": "error", "message": "Email already registered."})
    users_collection.insert_one({
        "name": payload.name,
        "email": payload.email,
        "password": get_password_hash(payload.password),
        "auth_provider": "local",
        "created_at": datetime.utcnow()
    })
    return {"status": "success", "message": "User registered successfully."}

@app.post("/api/auth/login")
def credentials_login(payload: LoginRequest):
    if users_collection is None:
        return JSONResponse(status_code=500, content={"status": "error", "message": "Database not configured"})
    user = users_collection.find_one({"email": payload.email})
    if not user or "password" not in user:
        return JSONResponse(status_code=401, content={"status": "error", "message": "Invalid email or password."})
    if not verify_password(payload.password, user["password"]):
        return JSONResponse(status_code=401, content={"status": "error", "message": "Invalid email or password."})
    
    return {"status": "success", "email": user["email"], "name": user.get("name", "")}

@app.post("/api/auth/google")
def google_auth(payload: GoogleLoginRequest):
    client_id = os.getenv("VITE_GOOGLE_CLIENT_ID")
    if not client_id:
        return JSONResponse(status_code=400, content={"status": "error", "message": "Google Client ID not configured on backend."})
    try:
        from google.oauth2 import id_token
        from google.auth.transport import requests as google_requests
        idinfo = id_token.verify_oauth2_token(payload.token, google_requests.Request(), client_id)
        email = idinfo.get("email")
        name = idinfo.get("name")
        
        if users_collection is not None:
            user = users_collection.find_one({"email": email})
            if not user:
                users_collection.insert_one({
                    "name": name,
                    "email": email,
                    "auth_provider": "google",
                    "created_at": datetime.utcnow()
                })
        
        return {"status": "success", "email": email, "name": name}
    except Exception as e:
        return JSONResponse(status_code=400, content={"status": "error", "message": f"Token verification failed: {str(e)}"})

@app.post("/api/auth/forgot-password")
def forgot_password(payload: ForgotPasswordRequest):
    if users_collection is None or otps_collection is None:
        return JSONResponse(status_code=500, content={"status": "error", "message": "Database not configured"})
    user = users_collection.find_one({"email": payload.email})
    if not user:
        return JSONResponse(status_code=404, content={"status": "error", "message": "Email address not found."})
        
    otp = "".join(random.choices(string.digits, k=6))
    
    try:
        send_otp_email(payload.email, otp)
    except Exception as e:
        return JSONResponse(status_code=500, content={"status": "error", "message": f"Failed to send email: {str(e)}"})
        
    otps_collection.update_one(
        {"email": payload.email},
        {"$set": {"otp": otp, "created_at": datetime.utcnow()}},
        upsert=True
    )
    
    return {"status": "success", "message": "OTP sent successfully."}

@app.post("/api/auth/reset-password")
def reset_password(payload: ResetPasswordRequest):
    try:
        if otps_collection is None or users_collection is None:
            return JSONResponse(status_code=500, content={"status": "error", "message": "Database not configured"})
        record = otps_collection.find_one({"email": payload.email, "otp": payload.otp})
        if not record:
            return JSONResponse(status_code=400, content={"status": "error", "message": "Invalid or expired OTP."})
            
        time_diff = (datetime.utcnow() - record["created_at"]).total_seconds()
        if time_diff > 600:
            return JSONResponse(status_code=400, content={"status": "error", "message": "OTP expired."})
            
        hashed_pwd = get_password_hash(payload.new_password)
        users_collection.update_one({"email": payload.email}, {"$set": {"password": hashed_pwd}})
        otps_collection.delete_one({"_id": record["_id"]})
        
        return {"status": "success", "message": "Password reset successfully."}
    except Exception as e:
        return JSONResponse(status_code=500, content={"status": "error", "message": f"Server crash V4: {traceback.format_exc()}"})

# ══════════════════════════════════════════════════════════════════════════════
# ADVANCED RAG & BUSINESS INTELLIGENCE ENGINE FOR CHATBOT
# ══════════════════════════════════════════════════════════════════════════════
import re
import math
from collections import Counter

def tokenize(text):
    """Tokenize text for BM25 indexing/searching."""
    return re.findall(r'\b\w+\b', text.lower())

class SimpleBM25:
    """Pure-Python implementation of BM25 Search Algorithm for serverless environments."""
    def __init__(self, corpus):
        self.corpus = corpus
        self.corpus_size = len(corpus)
        self.doc_len = [len(tokenize(d.get("text", ""))) for d in corpus]
        self.avg_doc_len = sum(self.doc_len) / self.corpus_size if self.corpus_size > 0 else 0
        self.doc_freqs = []
        self.idf = {}
        self.k1 = 1.5
        self.b = 0.75
        
        nd = {}
        for d in corpus:
            tokens = tokenize(d.get("text", ""))
            self.doc_freqs.append(Counter(tokens))
            for t in set(tokens):
                nd[t] = nd.get(t, 0) + 1
                
        for t, freq in nd.items():
            self.idf[t] = math.log((self.corpus_size - freq + 0.5) / (freq + 0.5) + 1.0)
            
    def search(self, query, top_n=3):
        query_tokens = tokenize(query)
        scores = []
        for idx, doc in enumerate(self.corpus):
            score = 0.0
            d_len = self.doc_len[idx]
            freqs = self.doc_freqs[idx]
            for token in query_tokens:
                if token in freqs:
                    f = freqs[token]
                    idf = self.idf.get(token, 0.0)
                    numerator = f * (self.k1 + 1)
                    denominator = f + self.k1 * (1 - self.b + self.b * (d_len / self.avg_doc_len))
                    score += idf * (numerator / denominator)
            scores.append((score, doc))
        
        scores.sort(key=lambda x: x[0], reverse=True)
        return [doc for score, doc in scores if score > 0.0][:top_n]

def compute_pos_analytics(transactions, inventory_items):
    """
    Computes accurate, exhaustive sales analytics from POS transaction database.
    Solves LLM calculation hallucinations and truncations.
    """
    item_categories = {}
    item_retail_prices = {}
    for key, item in inventory_items.items():
        name_lower = item["name"].strip().lower()
        item_categories[name_lower] = item["category"]
        item_retail_prices[name_lower] = item["retail_price"]

    total_revenue = 0
    total_transactions = len(transactions)
    unique_txs = set()
    item_sales_qty = {}
    item_revenue = {}
    category_sales_qty = {}
    category_revenue = {}

    for tx in transactions:
        tx_id = tx.get("TransactionId")
        if tx_id:
            unique_txs.add(tx_id)
        
        item_name = tx.get("ItemName", "").strip()
        item_name_lower = item_name.lower()
        qty = safe_int(tx.get("Quantity"), 1)
        price_paid = safe_float(tx.get("PricePaid"), 0.0)
        
        # Estimate price if missing/zero and available in inventory
        if price_paid == 0.0 and item_name_lower in item_retail_prices:
            price_paid = item_retail_prices[item_name_lower] * qty
            
        total_revenue += price_paid
        
        if item_name:
            item_sales_qty[item_name] = item_sales_qty.get(item_name, 0) + qty
            item_revenue[item_name] = item_revenue.get(item_name, 0.0) + price_paid
            
            cat = item_categories.get(item_name_lower, "General")
            category_sales_qty[cat] = category_sales_qty.get(cat, 0) + qty
            category_revenue[cat] = category_revenue.get(cat, 0.0) + price_paid

    # Supplement zero sales for inventory items not present in POS logs
    for item in inventory_items.values():
        name = item["name"]
        if name not in item_sales_qty:
            item_sales_qty[name] = 0
            item_revenue[name] = 0.0

    sorted_items_qty = sorted(item_sales_qty.items(), key=lambda x: x[1], reverse=True)
    sorted_items_rev = sorted(item_revenue.items(), key=lambda x: x[1], reverse=True)
    sorted_items_lowest = sorted(item_sales_qty.items(), key=lambda x: x[1])

    summary = f"POS Sales Business Intelligence Report:\n"
    summary += f"- Total Revenue: {total_revenue:,.2f} PKR\n"
    summary += f"- Total Sales Items (Qty): {sum(item_sales_qty.values())} units\n"
    summary += f"- Total Transaction Logs: {total_transactions}\n"
    summary += f"- Unique Invoice Count: {len(unique_txs)}\n"
    
    if len(unique_txs) > 0:
        summary += f"- Average Invoice Value: {(total_revenue / len(unique_txs)):,.2f} PKR\n"

    summary += "\n--- TOP SELLING PRODUCTS (by Volume) ---\n"
    for name, qty in sorted_items_qty[:10]:
        rev = item_revenue.get(name, 0.0)
        summary += f"- {name}: {qty} units sold (Revenue: {rev:,.2f} PKR)\n"

    summary += "\n--- TOP SELLING PRODUCTS (by Revenue) ---\n"
    for name, rev in sorted_items_rev[:10]:
        qty = item_sales_qty.get(name, 0)
        summary += f"- {name}: {rev:,.2f} PKR generated ({qty} units sold)\n"

    summary += "\n--- LOWEST SELLING PRODUCTS (Bottom Performers) ---\n"
    for name, qty in sorted_items_lowest[:10]:
        rev = item_revenue.get(name, 0.0)
        summary += f"- {name}: {qty} units sold (Revenue: {rev:,.2f} PKR)\n"

    summary += "\n--- SALES BY CATEGORY ---\n"
    sorted_cats = sorted(category_sales_qty.items(), key=lambda x: x[1], reverse=True)
    for cat, qty in sorted_cats:
        rev = category_revenue.get(cat, 0.0)
        summary += f"- {cat}: {qty} units sold (Revenue: {rev:,.2f} PKR)\n"

    return summary

def get_smart_inventory_context(query, inventory_items):
    """
    Dynamically filters inventory items based on query keywords or matches.
    Prevents prompt cluttering by only showing relevant stock details + high-level stats.
    """
    q_lower = query.lower()
    q_tokens = tokenize(q_lower)
    
    matched_items = []
    for key, item in inventory_items.items():
        name = item["name"].lower()
        cat = item["category"].lower()
        supplier = item["supplier"].lower()
        if any(token in name or token in cat or token in supplier for token in q_tokens) or name in q_lower:
            matched_items.append(item)

    context = ""
    if matched_items:
        context += f"Matching Inventory Details (Found {len(matched_items)} relevant items):\n"
        for item in matched_items[:20]:
            context += f"- Name: {item['name']}\n"
            context += f"  Category: {item['category']}\n"
            context += f"  Current Stock: {item['stock']} {item['unit']}\n"
            context += f"  Retail Price: {item['retail_price']} PKR\n"
            context += f"  Cost Price: {item['cost_price']} PKR\n"
            context += f"  Safety Threshold (Low Stock): {item['low_threshold']} {item['unit']}\n"
            context += f"  Sales Velocity: {item['sales_velocity_daily']} units/day\n"
            context += f"  Supplier: {item['supplier']} (Lead Time: {item['supplier_lead_days']} days)\n"
            context += f"  Expiry Date: {item['expiry_date']}\n\n"
    
    total_items = len(inventory_items)
    total_stock_value = sum(item["stock"] * item["retail_price"] for item in inventory_items.values())
    total_cost_value = sum(item["stock"] * item["cost_price"] for item in inventory_items.values())
    low_stock_items = [item["name"] for item in inventory_items.values() if item["stock"] <= item["low_threshold"]]
    
    context += "General Inventory Health Summary:\n"
    context += f"- Total unique products: {total_items}\n"
    context += f"- Total Retail Value: {total_stock_value:,.2f} PKR\n"
    context += f"- Total Cost Value: {total_cost_value:,.2f} PKR\n"
    context += f"- Total Potential Profit: {(total_stock_value - total_cost_value):,.2f} PKR\n"
    context += f"- Low Stock Items: {len(low_stock_items)} items\n"
    if low_stock_items:
        context += f"  Items below safety limit: {', '.join(low_stock_items[:10])}\n"
        
    return context

class ChatbotRequest(BaseModel):
    email: str
    query: str

@app.post("/api/chatbot")
def store_chatbot(req: ChatbotRequest):
    try:
        email = req.email
        query = req.query
        
        # 1. Load Inventory & Get Smart Context
        inv = load_inventory(email)
        if inv:
            inventory_context = get_smart_inventory_context(query, inv)
        else:
            inventory_context = "Inventory is currently empty.\n"
            
        # 2. Load POS Logs & Compute Business Intelligence
        records = list(pos_collection.find({"email": email})) if pos_collection is not None else []
        transactions = []
        for r in records:
            transactions.extend(r.get("data", []))
            
        if transactions:
            pos_context = compute_pos_analytics(transactions, inv)
        else:
            pos_context = "No POS transactions recorded.\n"
            
        # 3. Load & Paragraph-Chunk Policy PDFs
        policy_chunks = []
        if policies_collection is not None:
            policy_records = list(policies_collection.find({"email": email}))
            for doc in policy_records:
                fname = doc.get("filename", "Business Policy Document")
                text = doc.get("policy_text", "")
                
                # Split text into paragraphs (double newline)
                paragraphs = [p.strip() for p in text.split("\n\n") if p.strip()]
                for p in paragraphs:
                    if len(p) > 1000:
                        words = p.split()
                        current_chunk = []
                        current_len = 0
                        for word in words:
                            current_chunk.append(word)
                            current_len += len(word) + 1
                            if current_len > 800:
                                policy_chunks.append({
                                    "text": " ".join(current_chunk),
                                    "source": fname
                                })
                                current_chunk = []
                                current_len = 0
                        if current_chunk:
                            policy_chunks.append({
                                "text": " ".join(current_chunk),
                                "source": fname
                            })
                    else:
                        policy_chunks.append({
                            "text": p,
                            "source": fname
                        })

        # 4. Search Policy Chunks via BM25 Search Engine
        policy_context = ""
        if policy_chunks:
            bm25 = SimpleBM25(policy_chunks)
            matched_chunks = bm25.search(query, top_n=4)
            if matched_chunks:
                policy_context = "Relevant Business Policies & Rules:\n"
                for chunk in matched_chunks:
                    policy_context += f"Source: {chunk['source']}\nContent:\n{chunk['text']}\n---\n"
            else:
                policy_context = "No relevant policy documents matching this query were found in user memory.\n"
        else:
            policy_context = "No business policy documents uploaded.\n"
            
        # 5. Construct Chatbot System Prompt
        chatbot_prompt = (
            f"You are the RetailMind AI Store Manager. You are an exceptionally smart, natural, and conversational AI assistant.\n"
            f"Below is your innate store memory compiled through RAG search and business intelligence analytics (Inventory, POS, Policies):\n\n"
            f"=== YOUR INVENTORY DATA ===\n{inventory_context}\n"
            f"=== YOUR POS SALES BUSINESS INTELLIGENCE ===\n{pos_context}\n"
            f"=== YOUR RELEVANT POLICY DOCUMENTS ===\n{policy_context}\n"
            f"=== STORE OWNER'S QUERY ===\n{query}\n\n"
            f"CRITICAL RULES FOR YOUR RESPONSE:\n"
            f"1. You MUST answer the STORE OWNER'S QUERY directly, accurately, and intelligently based on the context.\n"
            f"2. For mathematical calculations (e.g., total sales, lowest seller, bestseller, average basket size), refer STRICTLY to the POS SALES BUSINESS INTELLIGENCE report above. Do NOT make up numbers.\n"
            f"3. NEVER use phrases like 'Based on the provided data', 'According to the uploaded files', or 'The text contains'. This breaks the illusion of memory. Respond naturally, as if these figures are your own knowledge.\n"
            f"4. ONLY if the user's query is literally just 'hi', 'hello', or completely blank, you should greet them. Otherwise, give the answer to their question directly.\n"
            f"5. Answer strictly in elegant, professional business English. Keep answers crisp, direct, and structured.\n"
        )
        
        response = safe_llm_invoke(chatbot_prompt)
        return {"response": response.content.strip()}
        
    except Exception as e:
        import traceback
        traceback.print_exc()
        return JSONResponse(status_code=500, content={"error": str(e)})


