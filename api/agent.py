import os
import json
import io
import csv
import time
from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate
from dotenv import load_dotenv

from tools import (
    get_llm,
    analyze_expiry_risk,
    audit_competitor_pricing,
    generate_purchase_order,
    check_inventory_supplies,
    load_inventory
)

load_dotenv()

# Lazy LLM initialization - avoids crash if GROQ_API_KEY is missing at import time
_llm = None
def _get_llm():
    global _llm
    if _llm is None:
        _llm = get_llm()
    return _llm

# Define tools for standard conversational agent
tools = [analyze_expiry_risk, audit_competitor_pricing, generate_purchase_order]

def process_query(query: str) -> dict:
    try:
        # Bind tools to the LLM
        llm_with_tools = _get_llm().bind_tools(tools)
        ai_msg = llm_with_tools.invoke(query)
        
        # Check if the model wants to call a tool
        if ai_msg.tool_calls:
            tool_call = ai_msg.tool_calls[0]
            tool_name = tool_call["name"]
            args = tool_call["args"]
            
            # Execute the correct tool
            if tool_name == "analyze_expiry_risk":
                # Ensure current_date is passed
                if "current_date" not in args:
                    args["current_date"] = "2026-06-05"
                result = analyze_expiry_risk.invoke(args)
            elif tool_name == "audit_competitor_pricing":
                result = audit_competitor_pricing.invoke(args)
            elif tool_name == "generate_purchase_order":
                result = generate_purchase_order.invoke(args)
            else:
                result = "Tool not found."
                
            # Synthesize final response
            synthesis_prompt = (
                f"You are the RetailMind AI Supermarket Co-Pilot.\n"
                f"The user asked: '{query}'\n"
                f"We ran the tool '{tool_name}' and got this result:\n"
                f"'{result}'\n\n"
                f"Please synthesize this into a polite, professional, and helpful reply for the user in Markdown format."
            )
            final_res = _get_llm().invoke(synthesis_prompt)
            return {
                "response": final_res.content.strip(),
                "sources": []
            }
        
        # No tool called, return directly
        return {
            "response": ai_msg.content.strip(),
            "sources": []
        }
    except Exception as e:
        return {
            "response": f"An error occurred while processing: {str(e)}",
            "sources": []
        }

def run_diagnostics_stream(csv_content: str):
    """
    Executes a structured Multi-Agent Supermarket Diagnostic pipeline, yielding progress updates
    and ending with a complete dashboard state.
    """
    yield f"data: {json.dumps({'agent': 'Operations Analyst', 'status': 'Parsing uploaded daily POS transaction logs...'})}\n\n"
    time.sleep(1)
    
    # Parse CSV
    f = io.StringIO(csv_content.strip())
    reader = csv.DictReader(f)
    transactions = list(reader)
    
    total_transactions = len(transactions)
    total_revenue = 0
    item_sales = {}
    
    for row in transactions:
        qty = int(row.get("Quantity", 1))
        price = int(row.get("PricePaid", 0))
        item = row.get("ItemName", "").strip()
        
        total_revenue += price
        item_sales[item] = item_sales.get(item, 0) + qty
        
    # Find most sold item
    most_sold_item = "None"
    most_sold_qty = 0
    for it, q in item_sales.items():
        if q > most_sold_qty:
            most_sold_qty = q
            most_sold_item = it
            
    yield f"data: {json.dumps({'agent': 'Operations Analyst', 'status': f'POS Audited. Found {total_transactions} transactions. Total Sales Revenue: {total_revenue} PKR. Bestseller: {most_sold_item}.'})}\n\n"
    time.sleep(1)
    
    # Run Expiry & Waste Optimizer Agent
    yield f"data: {json.dumps({'agent': 'Expiry Optimizer', 'status': 'Scanning shelf inventory for upcoming product expiry dates...'})}\n\n"
    time.sleep(1.2)
    
    expiry_res_str = analyze_expiry_risk.invoke({"current_date": "2026-06-05"})
    expiry_data = json.loads(expiry_res_str)
    
    
    num_items = len(expiry_data['items_at_risk'])
    yield f"data: {json.dumps({'agent': 'Expiry Optimizer', 'status': f'Scan complete. Found {num_items} categories nearing expiry. Dynamic discount campaign drafted.'})}\n\n"
    time.sleep(1)
    
    # Run Pricing Guard Agent
    yield f"data: {json.dumps({'agent': 'Pricing Auditor', 'status': 'Comparing store pricing sheets against competitor databases (Metro/Carrefour)...'})}\n\n"
    time.sleep(1.2)
    
    pricing_res_str = audit_competitor_pricing.invoke({})
    pricing_data = json.loads(pricing_res_str)
    
    num_gaps = len(pricing_data['deviations'])
    yield f"data: {json.dumps({'agent': 'Pricing Auditor', 'status': f'Found {num_gaps} price gaps where competitors are cheaper. Match recommendations calculated.'})}\n\n"
    time.sleep(1)
    
    # Deduct stock based on today's transaction sales
    yield f"data: {json.dumps({'agent': 'Inventory Watchdog', 'status': 'Updating current stock levels in warehouse databases...'})}\n\n"
    time.sleep(1)
    
    sales_list = []
    # Map item names to key identifiers
    key_mapping = {
        "dalda cooking oil 5l": "dalda_oil",
        "surf excel 1kg": "surf_excel",
        "nestle milkpak 1l": "nestle_milkpak",
        "yogurt pack 1kg": "yogurt_pack",
        "tapal danedar 900g": "tapal_danedar"
    }
    for row in transactions:
        item = row.get("ItemName", "").strip().lower()
        key = key_mapping.get(item)
        if key:
            sales_list.append(key)
            
    sales_str = ", ".join(sales_list)
    inv_res_str = check_inventory_supplies.invoke({"treatments_performed": sales_str})
    inv_res = json.loads(inv_res_str)
    
    num_alerts = len(inv_res['alerts'])
    yield f"data: {json.dumps({'agent': 'Inventory Watchdog', 'status': f'Inventory updated. Alerts triggered for low stock: {num_alerts}.'})}\n\n"
    time.sleep(1)
    
    # Run Procurement Planner Agent
    yield f"data: {json.dumps({'agent': 'Procurement Planner', 'status': 'Generating restock purchase orders for low-stock items...'})}\n\n"
    time.sleep(1)
    
    reorder_pos = []
    # Auto-procure items that triggered alerts
    for alert in inv_res["alerts"]:
        for key in ["nestle_milkpak", "tapal_danedar"]:
            if key in alert:
                po_str = generate_purchase_order.invoke({"product_key": key, "order_quantity": 30})
                reorder_pos.append(json.loads(po_str))
                
    yield f"data: {json.dumps({'agent': 'Procurement Planner', 'status': f'Auto-drafted {len(reorder_pos)} Purchase Orders for restocking safety levels.'})}\n\n"
    time.sleep(1)
    
    # Run Strategy Advisor
    yield f"data: {json.dumps({'agent': 'Retail Advisor', 'status': 'Synthesizing SWOT matrix and strategic operations actions...'})}\n\n"
    time.sleep(1.5)
    
    swot_prompt = (
        f"You are the Lead Retail Operations Advisor at RetailMind AI.\n"
        f"Review today's supermarket daily diagnostic report:\n"
        f"- Total Sales Revenue: {total_revenue} PKR\n"
        f"- Expiring Items: {json.dumps(expiry_data['items_at_risk'], indent=2)}\n"
        f"- Price Deviations: {json.dumps(pricing_data['deviations'], indent=2)}\n"
        f"- Inventory Warnings: {json.dumps(inv_res['alerts'], indent=2)}\n"
        f"- Auto Procurement Orders drafted: {json.dumps(reorder_pos, indent=2)}\n\n"
        f"Generate a customized, professional SWOT analysis for our supermarket branch operations and suggest 3 high-priority action steps.\n"
        f"Please return your response in a structured JSON string with the following keys:\n"
        f"1. 'strengths': List of strings (what went well today)\n"
        f"2. 'weaknesses': List of strings (bottlenecks, pricing gaps, stockouts, waste)\n"
        f"3. 'opportunities': List of strings (suggestions to improve margin/loyalty/disc)\n"
        f"4. 'threats': List of strings (risks from inventory exipry, competitor match margin pressure)\n"
        f"5. 'action_steps': List of strings (prioritized tasks for the supermarket manager)\n\n"
        f"Return ONLY valid JSON. No markdown wrappers, no extra notes."
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
            "total_revenue": f"{total_revenue.toLocaleString()} PKR" if hasattr(total_revenue, "toLocaleString") else f"{total_revenue} PKR",
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
