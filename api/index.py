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
else:
    mongo_client = None
    users_collection = None
    otps_collection = None
    inventory_collection = None
    competitors_collection = None
    pos_collection = None
    emails_collection = None

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
    try:
        pwd_bytes = plain_password.encode('utf-8')[:72]
        hash_bytes = hashed_password.encode('utf-8')
        return bcrypt.checkpw(pwd_bytes, hash_bytes)
    except Exception:
        return False

def get_password_hash(password):
    pwd_bytes = password.encode("utf-8")[:72]
    hashed = bcrypt.hashpw(pwd_bytes, bcrypt.gensalt())
    return hashed.decode("utf-8")

def send_otp_email(to_email: str, otp: str):
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
def load_inventory(email: str):
    if inventory_collection is None:
        return {}
    record = inventory_collection.find_one({"email": email})
    if not record or "data" not in record:
        return {}
    inv = {}
    for row in record["data"]:
        key = row.get("ItemName", "").strip().lower()
        if key:
            inv[key] = {
                "name": row.get("ItemName", ""),
                "category": row.get("Category", "General"),
                "stock": int(float(row.get("Stock", 0))),
                "unit": row.get("Unit", "units"),
                "cost_price": float(row.get("CostPrice", 0)),
                "retail_price": float(row.get("RetailPrice", 0)),
                "expiry_date": row.get("ExpiryDate", ""),
                "low_threshold": int(float(row.get("LowThreshold", 10))),
                "sales_velocity_daily": int(float(row.get("SalesVelocityDaily", 1))),
                "supplier": row.get("Supplier", "Unknown"),
                "supplier_lead_days": int(float(row.get("SupplierLeadDays", 3)))
            }
    return inv

def save_inventory(email: str, inv: dict):
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
    inventory_collection.update_one(
        {"email": email},
        {"$set": {"data": data, "updated_at": datetime.utcnow()}},
        upsert=True
    )

def load_competitors(email: str):
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
                "competitor_price": float(row.get("CompetitorPrice", 0)),
                "competitor_name": row.get("CompetitorName", "Competitor")
            }
    return comp

# ══════════════════════════════════════════════════════════════════════════════
# TOOLS (from tools.py) — LLM & Inventory helpers
# ══════════════════════════════════════════════════════════════════════════════
INVENTORY_FILE = os.path.join(tempfile.gettempdir(), "retailmind_inventory.json")

def get_llm():
    from langchain_groq import ChatGroq
    return ChatGroq(
        temperature=0.2,
        model_name="llama3-70b-8192",
        api_key=os.getenv("GROQ_API_KEY")
    )

_llm_instance = None
def _get_llm():
    global _llm_instance
    if _llm_instance is None:
        _llm_instance = get_llm()
    return _llm_instance



# ── Tool Functions ────────────────────────────────────────────────────────────
def analyze_expiry_risk(email: str, current_date: str) -> dict:
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
    llm = _get_llm()
    prompt = (
        f"You are the Creative Marketing Manager at RetailMind Supermarket.\n"
        f"We have the following items nearing expiry that will be wasted unless sold:\n"
        f"{json.dumps(risky_items, indent=2)}\n\n"
        f"Draft a short, catchy, and professional dynamic discount promo message or Buy One Get One (BOGO) bundle "
        f"advertisement to clear these products before they expire. Keep it under 180 characters."
    )
    try:
        response = llm.invoke(prompt)
        promo_text = response.content.strip()
    except Exception:
        promo_text = "Special Clearing Discount: 30% Off on dairy and fresh essentials today only!"
    return {"evaluation_date": current_date, "items_at_risk": risky_items, "suggested_promotional_ad": promo_text}

def audit_competitor_pricing(email: str) -> dict:
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
    llm = _get_llm()
    prompt = (
        f"You are the Pricing Strategist at RetailMind Supermarket.\n"
        f"We found the following price mismatches where competitors are cheaper:\n"
        f"{json.dumps(price_deviations, indent=2)}\n\n"
        f"Provide a brief, professional summary of our pricing strategy regarding these items."
    )
    try:
        response = llm.invoke(prompt)
        pricing_notes = response.content.strip()
    except Exception:
        pricing_notes = "Maintain price match where cost margin allows."
    return {"deviations": price_deviations, "pricing_strategy_summary": pricing_notes}

def generate_purchase_order(email: str, product_key: str, order_quantity: int) -> dict:
    inv = load_inventory(email)
    item = inv.get(product_key)
    if not item:
        return {"error": f"Product key '{product_key}' not found in inventory."}
    cost_price = item["cost_price"]
    total_cost = cost_price * order_quantity
    llm = _get_llm()
    prompt = (
        f"You are the Procurement Director at RetailMind Supermarket.\n"
        f"Write a formal purchase order email to our supplier rep for {item['supplier']}.\n"
        f"Order details:\n- Product: {item['name']}\n- Quantity: {order_quantity} {item['unit']}\n"
        f"- Cost Price per unit: {cost_price} PKR\n- Total Cost: {total_cost} PKR\n"
        f"- Lead Delivery Time expected: {item['supplier_lead_days']} days\n\n"
        f"Keep the email short, professional, and clear."
    )
    try:
        response = llm.invoke(prompt)
        email_draft = response.content.strip()
    except Exception:
        email_draft = f"Subject: Purchase Order for {item['name']}\n\nDear Sales Rep,\n\nPlease process our order for {order_quantity} units of {item['name']}.\n\nBest regards,\nProcurement Dept."
    po_number = f"PO-2026-{datetime.now().strftime('%M%S')}"
    return {
        "po_number": po_number, "supplier": item["supplier"], "product_name": item["name"],
        "order_quantity": order_quantity, "unit": item["unit"], "cost_per_unit": cost_price,
        "total_cost_pkr": total_cost, "lead_delivery_days": item["supplier_lead_days"],
        "supplier_email_draft": email_draft
    }

def check_inventory_supplies(email: str, treatments_performed: str) -> dict:
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
def run_diagnostics_stream(email: str):
    yield f"data: {json.dumps({'agent': 'Operations Analyst', 'status': 'Fetching POS transactions from database...'})}\n\n"
    time.sleep(0.5)

    record = pos_collection.find_one({"email": email}) if pos_collection else None
    transactions = record.get("data", []) if record else []
    
    if not transactions:
        yield f"data: {json.dumps({'agent': 'Error', 'status': 'No POS data uploaded. Please upload files in Data Sync Hub.'})}\n\n"
        return

    total_transactions = len(transactions)
    total_revenue = 0
    item_sales = {}
    for row in transactions:
        qty = int(row.get("Quantity", 1))
        price = int(row.get("PricePaid", 0))
        item = row.get("ItemName", "").strip()
        total_revenue += price
        item_sales[item] = item_sales.get(item, 0) + qty

    most_sold_item = max(item_sales, key=item_sales.get) if item_sales else "None"

    yield f"data: {json.dumps({'agent': 'Operations Analyst', 'status': f'POS Audited. {total_transactions} transactions. Revenue: {total_revenue} PKR. Bestseller: {most_sold_item}.'})}\n\n"
    time.sleep(0.5)

    # Expiry Risk
    yield f"data: {json.dumps({'agent': 'Expiry Optimizer', 'status': 'Scanning shelf inventory for upcoming product expiry dates...'})}\n\n"
    expiry_data = analyze_expiry_risk(email, "2026-06-05")
    num_items = len(expiry_data['items_at_risk'])
    yield f"data: {json.dumps({'agent': 'Expiry Optimizer', 'status': f'Found {num_items} categories nearing expiry. Discount campaign drafted.'})}\n\n"

    # Pricing Guard
    yield f"data: {json.dumps({'agent': 'Pricing Auditor', 'status': 'Comparing pricing against competitor databases...'})}\n\n"
    pricing_data = audit_competitor_pricing(email)
    num_gaps = len(pricing_data['deviations'])
    yield f"data: {json.dumps({'agent': 'Pricing Auditor', 'status': f'Found {num_gaps} price gaps. Match recommendations calculated.'})}\n\n"

    # Inventory update
    yield f"data: {json.dumps({'agent': 'Inventory Watchdog', 'status': 'Updating current stock levels...'})}\n\n"
    sales_list = []
    for row in transactions:
        item = row.get("ItemName", "").strip().lower()
        sales_list.append(item)
    inv_res = check_inventory_supplies(email, ", ".join(sales_list))
    num_alerts = len(inv_res['alerts'])
    yield f"data: {json.dumps({'agent': 'Inventory Watchdog', 'status': f'Inventory updated. Low stock alerts: {num_alerts}.'})}\n\n"

    # Procurement
    yield f"data: {json.dumps({'agent': 'Procurement Planner', 'status': 'Generating restock purchase orders...'})}\n\n"
    reorder_pos = []
    for alert in inv_res["alerts"]:
        # Find item in alert text to trigger PO
        for key, item in load_inventory(email).items():
            if item["name"] in alert:
                po = generate_purchase_order(email, key, 30)
                reorder_pos.append(po)
    yield f"data: {json.dumps({'agent': 'Procurement Planner', 'status': f'Auto-drafted {len(reorder_pos)} Purchase Orders.'})}\n\n"

    # SWOT
    yield f"data: {json.dumps({'agent': 'Retail Advisor', 'status': 'Synthesizing SWOT matrix and strategic actions...'})}\n\n"
    swot_prompt = (
        f"You are the Lead Retail Operations Advisor at RetailMind AI.\n"
        f"Review today's supermarket daily diagnostic report:\n"
        f"- Total Sales Revenue: {total_revenue} PKR\n"
        f"- Expiring Items: {json.dumps(expiry_data['items_at_risk'], indent=2)}\n"
        f"- Price Deviations: {json.dumps(pricing_data['deviations'], indent=2)}\n"
        f"- Inventory Warnings: {json.dumps(inv_res['alerts'], indent=2)}\n"
        f"- Auto Procurement Orders drafted: {json.dumps(reorder_pos, indent=2)}\n\n"
        f"Generate a SWOT analysis and suggest 3 high-priority action steps.\n"
        f"Return ONLY valid JSON with keys: strengths, weaknesses, opportunities, threats, action_steps (all lists of strings).\n"
        f"No markdown wrappers."
    )
    try:
        response = _get_llm().invoke(swot_prompt)
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

    final_payload = {
        "kpis": {
            "total_revenue": f"{total_revenue} PKR",
            "total_transactions": total_transactions,
            "bestseller": most_sold_item,
            "waste_risk_cost": f"{sum(item['potential_loss'] for item in expiry_data['items_at_risk'])} PKR",
            "low_stock_count": len(inv_res["alerts"]),
            "average_basket_value": f"{round(total_revenue / total_transactions)} PKR" if total_transactions > 0 else "0 PKR"
        },
        "expiry": expiry_data,
        "pricing": pricing_data,
        "inventory": inv_res,
        "procurement": reorder_pos,
        "swot": swot_data
    }
    yield f"data: {json.dumps({'agent': 'Orchestrator', 'status': 'complete', 'result': final_payload})}\n\n"

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

@app.post("/api/upload/inventory")
def upload_inventory(payload: UploadRequest):
    if inventory_collection is None:
        return JSONResponse(status_code=500, content={"status": "error", "message": "Database not configured"})
    try:
        f = io.StringIO(payload.content.strip())
        reader = csv.DictReader(f)
        records = list(reader)
        inventory_collection.update_one(
            {"email": payload.email},
            {"$set": {"data": records, "updated_at": datetime.utcnow()}},
            upsert=True
        )
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
        pos_collection.update_one(
            {"email": payload.email},
            {"$set": {"data": records, "updated_at": datetime.utcnow()}},
            upsert=True
        )
        return {"status": "success", "message": f"Successfully loaded {len(records)} POS transactions."}
    except Exception as e:
        return JSONResponse(status_code=500, content={"status": "error", "message": str(e)})

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
        if res.startswith("```json"): res = res[7:]
        if res.endswith("```"): res = res[:-3]
        classification = json.loads(res.strip())
        intent = classification.get("intent", "faq")
        extracted_id = classification.get("extracted_id", "none")
    except:
        intent, extracted_id = "faq", "none"

    db_context = "No specific database context needed."
    
    # Step 2 & 3: Database Lookup & Reply Generation
    if intent == "order_status":
        order_details = "Not Found"
        if extracted_id.lower() != "none" and pos_collection:
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
        auto_reply = llm.invoke(reply_prompt).content.strip()
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
def get_live_inbox():
    smtp_email = os.getenv("SMTP_EMAIL")
    smtp_pass = os.getenv("SMTP_PASSWORD")
    if not smtp_email or not smtp_pass:
        return []
    
    try:
        mail = imaplib.IMAP4_SSL("imap.gmail.com")
        mail.login(smtp_email, smtp_pass)
        mail.select("inbox")
        
        # Search for all unread emails, filter in python to avoid IMAP search string bugs
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
                    if "bueiness queirues" not in subject.lower() and "business queries" not in subject.lower():
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

@app.post("/api/support/resolve-live")
def resolve_live_email(req: LiveResolveRequest):
    llm = _get_llm()
    # Step 1: Classifier
    classify_prompt = (
        f"Analyze this email: '{req.message}'.\n"
        f"Classify strictly into 'order_status', 'faq', or 'complaint'.\n"
        f"Extract Transaction ID (TXXXX). If none, output 'none'.\n"
        f"Return ONLY JSON: {{\"intent\": \"category\", \"extracted_id\": \"id\"}}"
    )
    try:
        res = llm.invoke(classify_prompt).content.strip()
        if res.startswith("```json"): res = res[7:]
        if res.endswith("```"): res = res[:-3]
        classification = json.loads(res.strip())
        intent = classification.get("intent", "faq")
        extracted_id = classification.get("extracted_id", "none")
    except:
        intent, extracted_id = "faq", "none"

    db_context = "No specific DB context."
    if intent == "order_status" and extracted_id != "none" and pos_collection:
        # Search all users for this transaction ID just in case
        records = pos_collection.find({})
        for r in records:
            if "data" in r:
                for row in r["data"]:
                    if row.get("TransactionId", "").strip().lower() == extracted_id.lower():
                        db_context = f"Found Order Data: {row}"
                        break
    
    reply_prompt = (
        f"Customer says: '{req.message}'\n"
        f"DB Data: {db_context}\n"
        f"Write a professional email reply in Roman Urdu.\n"
        f"If 'complaint' category, tell them it's forwarded to trustvault3.help@gmail.com and we will fix it ASAP."
    )
    try:
        auto_reply = llm.invoke(reply_prompt).content.strip()
    except:
        auto_reply = "We have received your query and will reply shortly."

    # Email Action via SMTP
    smtp_email = os.getenv("SMTP_EMAIL")
    smtp_pass = os.getenv("SMTP_PASSWORD")
    action_taken = "Auto-Reply Sent"

    try:
        server = smtplib.SMTP('smtp.gmail.com', 587)
        server.starttls()
        server.login(smtp_email, smtp_pass)

        if intent == "complaint":
            # Forward to staff
            msg = MIMEMultipart()
            msg['From'] = smtp_email
            msg['To'] = "trustvault3.help@gmail.com"
            msg['Subject'] = f"ESCALATED: {req.subject}"
            body = f"Customer Email: {req.sender}\nCustomer Message:\n{req.message}\n\nAI Drafted Reply sent to user:\n{auto_reply}"
            msg.attach(MIMEText(body, 'plain'))
            server.send_message(msg)
            action_taken = "Forwarded to Staff (trustvault3.help@gmail.com)"

        # Send reply back to customer
        reply_msg = MIMEMultipart()
        reply_msg['From'] = smtp_email
        reply_msg['To'] = req.sender
        reply_msg['Subject'] = f"Re: {req.subject}"
        reply_msg.attach(MIMEText(auto_reply, 'plain'))
        server.send_message(reply_msg)
        
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
    llm = _get_llm()
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
        response = llm.invoke(prompt)
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

