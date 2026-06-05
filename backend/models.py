from pydantic import BaseModel
from typing import List, Optional

class QueryRequest(BaseModel):
    query: str

class QueryResponse(BaseModel):
    response: str
    sources: Optional[List[str]] = []

class FAQRequest(BaseModel):
    query: str

class ChartingRequest(BaseModel):
    notes: str

class SimulationRequest(BaseModel):
    decision: str
    budget: float
    shift_hours: float
    staff_increase: int
