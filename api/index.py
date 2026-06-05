from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
import os
import json
from dotenv import load_dotenv

load_dotenv()

from models import QueryRequest, QueryResponse, SimulationRequest
from agent import process_query, run_diagnostics_stream
from tools import load_inventory, save_inventory, get_llm
from mock_data import APPOINTMENTS_MOCK_CSV, INITIAL_INVENTORY

app = FastAPI(title="CareSync AI Clinic Co-Pilot API")

# Setup CORS for Vite React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global in-memory storage for the active CSV dataset
# Defaults to the mock dataset on startup
active_csv_content = APPOINTMENTS_MOCK_CSV

@app.get("/")
def read_root():
    return {"message": "Welcome to CareSync AI Clinic Co-Pilot API"}

@app.post("/api/query", response_model=QueryResponse)
def handle_query(request: QueryRequest):
    result = process_query(request.query)
    return QueryResponse(response=result["response"], sources=result.get("sources", []))



class UploadRequest(BaseModel):
    filename: str
    content: str

@app.post("/api/upload")
def handle_upload(request: UploadRequest):
    global active_csv_content
    try:
        active_csv_content = request.content
        return {"status": "success", "message": f"Successfully loaded {request.filename}."}
    except Exception as e:
        return {"status": "error", "message": f"Failed to parse file: {str(e)}"}

@app.get("/api/stream")
def stream_diagnostics():
    global active_csv_content
    return StreamingResponse(
        run_diagnostics_stream(active_csv_content),
        media_type="text/event-stream"
    )

@app.get("/api/inventory")
def get_inventory():
    return load_inventory()

@app.post("/api/inventory/reset")
def reset_inventory():
    save_inventory(INITIAL_INVENTORY)
    return INITIAL_INVENTORY

class ConsumeRequest(BaseModel):
    treatments: str

@app.post("/api/inventory/consume")
def consume_inventory(request: ConsumeRequest):
    from tools import check_inventory_supplies
    result_str = check_inventory_supplies.invoke({"treatments_performed": request.treatments})
    return json.loads(result_str)


@app.post("/api/simulate")
def handle_simulation(request: SimulationRequest):
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
        f"1. 'feasibility_score': Integer from 0 to 100 (probability of success)\n"
        f"2. 'wait_time_impact': String describing projected checkout wait time change (e.g. 'Reduced by 12 min')\n"
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
    except Exception as e:
        data = {
            "feasibility_score": 50,
            "wait_time_impact": "Unknown",
            "revenue_impact": "Undetermined",
            "pros": ["Direct action taken."],
            "cons": ["Potential overhead expense."],
            "implementation_steps": ["Review with medical director.", "Audit clinic budget."]
        }
    return data

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
