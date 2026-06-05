from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse, JSONResponse
from pydantic import BaseModel
import os
import json
import traceback
from dotenv import load_dotenv

load_dotenv()

# ── App Setup ──────────────────────────────────────────────
app = FastAPI(title="RetailMind AI API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Mock default CSV (small) ──────────────────────────────
DEFAULT_CSV = """TransactionId,Timestamp,ItemName,Quantity,PricePaid,PaymentMethod,CustomerLoyaltyId
T1001,14:02,Dalda Cooking Oil 5L,2,4500,Card,L9281
T1002,14:15,Nestle Milkpak 1L,6,1800,Cash,L1203
T1003,14:30,Surf Excel 1kg,1,460,Cash,None
T1004,15:10,Yogurt Pack 1kg,4,1200,Card,L8491
T1005,15:45,Nestle Everyday 1kg,1,1490,Card,None
T1006,16:20,Tapal Danedar 900g,3,4050,Cash,L3921
T1007,17:05,Dalda Cooking Oil 5L,1,2250,Card,L4820
T1008,17:40,Yogurt Pack 1kg,5,1500,Cash,L1203
"""

active_csv_content = DEFAULT_CSV

# ── Pydantic Models (inline to avoid import issues) ──────
class UploadRequest(BaseModel):
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

# ── Health Check ──────────────────────────────────────────
@app.get("/")
def read_root():
    return {"message": "RetailMind AI API is running"}

@app.get("/api/health")
def health_check():
    """Debug endpoint to check if imports work"""
    status = {"app": "ok", "imports": {}}
    try:
        from tools import get_llm, load_inventory
        status["imports"]["tools"] = "ok"
    except Exception as e:
        status["imports"]["tools"] = str(e)
    try:
        from agent import process_query, run_diagnostics_stream
        status["imports"]["agent"] = "ok"
    except Exception as e:
        status["imports"]["agent"] = str(e)
    status["groq_key_set"] = bool(os.getenv("GROQ_API_KEY"))
    return status

# ── Upload (zero heavy imports needed) ───────────────────
@app.post("/api/upload")
def handle_upload(request: UploadRequest):
    global active_csv_content
    try:
        active_csv_content = request.content
        return {"status": "success", "message": f"Successfully loaded {request.filename}."}
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"status": "error", "message": str(e), "trace": traceback.format_exc()}
        )

# ── Stream Diagnostics (lazy import) ─────────────────────
@app.get("/api/stream")
def stream_diagnostics():
    global active_csv_content
    from agent import run_diagnostics_stream
    return StreamingResponse(
        run_diagnostics_stream(active_csv_content),
        media_type="text/event-stream"
    )

# ── Query (lazy import) ──────────────────────────────────
@app.post("/api/query", response_model=QueryResponse)
def handle_query(request: QueryRequest):
    from agent import process_query
    result = process_query(request.query)
    return QueryResponse(response=result["response"], sources=result.get("sources", []))

# ── Inventory (lazy import) ──────────────────────────────
@app.get("/api/inventory")
def get_inventory():
    from tools import load_inventory
    return load_inventory()

@app.post("/api/inventory/reset")
def reset_inventory():
    from tools import load_inventory, save_inventory
    from mock_data import INITIAL_INVENTORY
    save_inventory(INITIAL_INVENTORY)
    return INITIAL_INVENTORY

@app.post("/api/inventory/consume")
def consume_inventory(request: dict):
    from tools import check_inventory_supplies
    result_str = check_inventory_supplies.invoke({"treatments_performed": request.get("treatments", "")})
    return json.loads(result_str)

# ── Simulate (lazy import) ───────────────────────────────
@app.post("/api/simulate")
def handle_simulation(request: SimulationRequest):
    from tools import get_llm
    llm = get_llm()
    prompt = (
        f"You are the Operations Analyst at RetailMind Supermarket.\n"
        f"Simulate the following operational decision:\n"
        f"Decision: '{request.decision}'\n"
        f"Budget Allocation: {request.budget} PKR\n"
        f"Hours added/shifted: {request.shift_hours} hours\n"
        f"Staff hired/allocated: {request.staff_increase} people\n\n"
        f"Forecast the impact of this change on supermarket operations and customer throughput.\n"
        f"Please return your response in a structured JSON string with the following keys:\n"
        f"1. 'feasibility_score': Integer from 0 to 100\n"
        f"2. 'wait_time_impact': String describing projected checkout wait time change\n"
        f"3. 'revenue_impact': String describing weekly financial ROI projection\n"
        f"4. 'pros': List of strings outlining advantages\n"
        f"5. 'cons': List of strings outlining risks/downsides\n"
        f"6. 'implementation_steps': List of strings outlining step-by-step rollout plan\n\n"
        f"Return ONLY valid JSON. No markdown wrapper, no extra text."
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
            "feasibility_score": 50,
            "wait_time_impact": "Unknown",
            "revenue_impact": "Undetermined",
            "pros": ["Direct action taken."],
            "cons": ["Potential overhead expense."],
            "implementation_steps": ["Review strategy.", "Audit budget."]
        }
    return data
