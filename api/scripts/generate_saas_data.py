import os
import csv
import random
from datetime import datetime, timedelta
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, PageBreak
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle

def generate_pdf(filename="comprehensive_store_policies.pdf"):
    doc = SimpleDocTemplate(filename, pagesize=letter,
                            rightMargin=72, leftMargin=72,
                            topMargin=72, bottomMargin=72)
    styles = getSampleStyleSheet()
    
    # Custom Styles
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Heading1'],
        fontSize=24,
        leading=28,
        spaceAfter=20,
        textColor='#D97706' # Amber color
    )
    h2_style = ParagraphStyle(
        'DocH2',
        parent=styles['Heading2'],
        fontSize=16,
        leading=20,
        spaceBefore=15,
        spaceAfter=10,
        textColor='#1E3A8A' # Deep Blue color
    )
    body_style = ParagraphStyle(
        'DocBody',
        parent=styles['BodyText'],
        fontSize=10,
        leading=14,
        spaceAfter=8
    )

    story = []

    # Title Page
    story.append(Spacer(1, 100))
    story.append(Paragraph("RETAILMIND SUPERMARKET INC.", title_style))
    story.append(Paragraph("<b>COMPREHENSIVE OPERATIONS & POLICY MANUAL</b>", title_style))
    story.append(Spacer(1, 50))
    story.append(Paragraph("Version 4.2 - SaaS Corporate Edition", body_style))
    story.append(Paragraph(f"Effective Date: {datetime.now().strftime('%Y-%m-%d')}", body_style))
    story.append(Paragraph("Authorized by: Board of Directors & Operations Audit Committee", body_style))
    story.append(Spacer(1, 150))
    story.append(Paragraph("<i>This document outlines the strict guidelines, customer policies, employee code of conduct, supplier level agreements (SLAs), and shelf layout principles. Compliance with all sections is mandatory.</i>", body_style))
    story.append(PageBreak())

    # Page 2: Customer Returns, Refunds & Exchanges
    story.append(Paragraph("SECTION 1: CUSTOMER RETURN & EXCHANGE POLICY", h2_style))
    story.append(Paragraph(
        "At RetailMind Supermarket, we prioritize customer satisfaction while maintaining strict control over product returns to prevent fraud. "
        "Customers are entitled to exchange or refund items within 14 days of purchase, subject to the conditions listed below:", body_style))
    story.append(Paragraph("<b>1.1 Perishable Items & Dairy:</b> "
        "Perishable items, including fresh fruits, vegetables, meat, and dairy products (such as Nestle Milkpak, yogurts, and butter) can only be returned or exchanged "
        "within 24 hours of purchase. The customer must present the original printed POS receipt showing the purchase transaction. "
        "Under no circumstances will dairy products showing signs of temperature abuse (e.g. curdled milk or melted butter) be accepted for refund.", body_style))
    story.append(Paragraph("<b>1.2 Packaged Grocery & Household Goods:</b> "
        "Packaged groceries (like Dalda Cooking Oil, Lipton Tea, and spices) and household cleaning goods (like Surf Excel and Ariel Detergent) may be returned within 14 days. "
        "The outer packaging must be unopened, undamaged, and in resealable condition with all original seals intact. "
        "Opened packets can only be returned if there is a verified manufacturing defect (e.g., package puncture or contamination).", body_style))
    story.append(Paragraph("<b>1.3 Refund Payment Methods:</b> "
        "Cash purchases will be refunded in cash up to 5,000 PKR. Refunds exceeding 5,000 PKR will be issued via mobile wallet transfer or bank transfer within 3 business days. "
        "Card payments must be refunded back to the original debit/credit card used during the POS checkout. Cash refunds for card transactions are strictly prohibited.", body_style))
    story.append(PageBreak())

    # Page 3: Pricing Strategy & Price Matching Rules
    story.append(Paragraph("SECTION 2: COMPETITOR PRICING & PRICE MATCH GUARANTEE", h2_style))
    story.append(Paragraph(
        "To maintain our 'Lowest Price Promise' in the local retail market, we perform weekly audits against key supermarket chains, including Metro Cash & Carry, Carrefour, and Imtiaz Super Market.", body_style))
    story.append(Paragraph("<b>2.1 Price Matching Protocol:</b> "
        "If a customer provides proof of a lower printed price for an identical barcode item at Metro or Imtiaz, the checkout cashier is authorized to match the price, "
        "provided the resulting retail price remains above our internal Cost Price + 2% safety margin. "
        "For example, if Dalda Cooking Oil 5L has a store retail price of 2,250 PKR and our cost price is 1,850 PKR, the cashier can match Metro's price down to 2,130 PKR, "
        "as it remains highly profitable. However, if matching drops the price below cost, the request must be escalated to the Store Manager.", body_style))
    story.append(Paragraph("<b>2.2 Price Audit Frequency:</b> "
        "Pricing auditors must update the competitor database every Monday by 09:00 AM. Any deviations exceeding 5% must be updated in the POS pricing controller. "
        "Special focus must be maintained on Pantry and Dairy categories (specifically Dalda Cooking Oil, Lipton Tea, and Nestle Milkpak) where local competition is aggressive.", body_style))
    story.append(PageBreak())

    # Page 4: Inventory Expiry & Markdown Policies
    story.append(Paragraph("SECTION 3: INVENTORY RISK & EXPIRES MANAGEMENT", h2_style))
    story.append(Paragraph(
        "Product wastage due to shelf expiry represents a direct loss. We implement a strict 'First-In, First-Out' (FIFO) shelf stocking rule and a dynamic markdown schedule to clear stock nearing expiry:", body_style))
    story.append(Paragraph("<b>3.1 Expiry Warning Thresholds:</b> "
        "Perishable dairy products (e.g., yogurt, milk, cheese) must be checked daily. Dry pantry products (e.g., cooking oil, tea) must be audited weekly. "
        "Any item with less than 10 days of shelf life remaining is classified as a 'High Expiry Risk'.", body_style))
    story.append(Paragraph("<b>3.2 Dynamic Discount Campaigns:</b> "
        "Products with remaining shelf life between 6 to 10 days must be discounted by 15%. "
        "Products with remaining shelf life between 3 to 5 days must be marked down by 30% or placed in a 'Buy One Get One Free' (BOGO) bundle. "
        "Perishable items with 1 day remaining must be marked down by 50% for immediate clearance.", body_style))
    story.append(Paragraph("<b>3.3 Waste Log Registrations:</b> "
        "Once a product reaches its official expiration date, it must be removed from the shelf immediately. It is illegal to sell expired goods. "
        "The inventory clerk must log the expired quantity into the MongoDB 'wastage_logs' database under the correct SKU and user email to claim tax deductions.", body_style))
    story.append(PageBreak())

    # Page 5: Supplier Delivery & SLA Agreements
    story.append(Paragraph("SECTION 4: SUPPLIER SERVICE LEVEL AGREEMENTS (SLAs)", h2_style))
    story.append(Paragraph(
        "Supermarket supply chains depend on prompt deliveries. We maintain strict SLAs with our primary suppliers to ensure optimal stock availability:", body_style))
    story.append(Paragraph("<b>4.1 Unilever Pakistan SLA:</b> "
        "Unilever supplies Surf Excel, Lipton Tea, and Lux soap. Delivery lead time is strictly 3 business days from purchase order (PO) release. "
        "To waive the standard 500 PKR delivery shipping fee, each Unilever PO must meet a minimum order value of 10,000 PKR. "
        "If a PO is below 10,000 PKR, the system should automatically suggest adding high-demand Unilever items (like Lipton Tea) to clear the limit.", body_style))
    story.append(Paragraph("<b>4.2 Dalda Foods Ltd SLA:</b> "
        "Dalda supplies cooking oil and ghee. Deliveries are made twice weekly: on Tuesday and Friday mornings. "
        "The PO must be submitted at least 24 hours prior to the delivery window. Dalda Foods does not enforce a minimum order value, "
        "but orders exceeding 50,000 PKR receive a 1.5% bulk wholesale discount.", body_style))
    story.append(Paragraph("<b>4.3 Nestle Pakistan SLA:</b> "
        "Nestle supplies Milkpak 1L, yogurts, and juices. Due to the high sales velocity of dairy, Nestle delivers daily. "
        "Orders placed before 06:00 PM are delivered the next morning by 08:00 AM. Minimum order value is 5,000 PKR.", body_style))
    story.append(PageBreak())

    # Page 6: Employee Conduct & Cash Drawer Security
    story.append(Paragraph("SECTION 5: CASHIER CODE OF CONDUCT & DRAWER POLICIES", h2_style))
    story.append(Paragraph(
        "To prevent internal fraud and price manipulation, all POS operators must adhere to these security rules:", body_style))
    story.append(Paragraph("<b>5.1 Drawer Accountability:</b> "
        "Each cashier is assigned a unique Cashier ID and a designated cash drawer containing a starting float of 10,000 PKR. "
        "No cashier is permitted to operate under another employee's login session. All drawer cash-outs must be dual-verified by the supervisor.", body_style))
    story.append(Paragraph("<b>5.2 Manual Price Override Limits:</b> "
        "Cashiers are strictly forbidden from manually editing item prices at checkouts. "
        "If an item price does not match the shelf label, the cashier must call a manager. "
        "Unauthorized manual price discounts will trigger an automatic alert in our AI Auditing tool and are subject to disciplinary action.", body_style))
    story.append(Paragraph("<b>5.3 Void Transaction Protocols:</b> "
        "Any voided transaction exceeding 1,000 PKR requires manager approval via swipe card or physical key entry. "
        "A cashier with more than 3 unapproved voids in a single shift will be flagged for retraining.", body_style))
    story.append(PageBreak())

    # Page 7: Store Shelf Layout & Visual Merchandising
    story.append(Paragraph("SECTION 6: SHELF PLACEMENT & STORE LAYOUT DESIGN", h2_style))
    story.append(Paragraph(
        "Optimizing the physical location of products increases cross-selling and overall basket value. We follow data-driven merchandising rules:", body_style))
    story.append(Paragraph("<b>6.1 Product Co-occurrence Rules:</b> "
        "Data indicates certain products are frequently purchased in pairs (e.g. Cooking Oil + Tea, Detergent + Dishwash Bar). "
        "Merchandisers must place these corresponding items in adjacent aisles or create a unified display endcap. "
        "For example, Lipton Tea boxes should be displayed on the endcap of Aisle 4, directly facing the Dalda Cooking Oil shelves.", body_style))
    story.append(Paragraph("<b>6.2 Eye-Level Placement Rule:</b> "
        "High-margin house brands and bestseller items (such as Dalda Cooking Oil 5L) must be placed on middle shelves (between 4 to 5 feet from the ground), "
        "which is direct eye-level for the average adult customer. Lower-margin bulk items must be placed on the bottom shelf.", body_style))
    story.append(Paragraph("<b>6.3 Impulse Buying Zone:</b> "
        "The checkout counter area (Aisle 10) is designated for high-margin impulse items, including chocolates, gum, and travel-sized hand sanitizers. "
        "No pantry staples are allowed in the checkout lanes.", body_style))
    story.append(PageBreak())

    # Page 8: Customer Loyalty Point System
    story.append(Paragraph("SECTION 7: CUSTOMER LOYALTY & REWARD MATRIX", h2_style))
    story.append(Paragraph(
        "Our customer loyalty program operates in tiers based on monthly spending registered under the customer's phone number (CustomerLoyaltyId):", body_style))
    story.append(Paragraph("<b>7.1 Loyalty Member Tiers:</b> "
        "1. Silver Tier: Spending up to 10,000 PKR/month. Earns 1 point per 100 PKR spent.\n"
        "2. Gold Tier: Spending between 10,001 and 25,000 PKR/month. Earns 2 points per 100 PKR spent.\n"
        "3. Platinum Tier: Spending above 25,000 PKR/month. Earns 3.5 points per 100 PKR spent.", body_style))
    story.append(Paragraph("<b>7.2 Reward Redemptions:</b> "
        "Points can be redeemed at checkout to pay for purchases at a conversion rate of 1 point = 1 PKR. "
        "To encourage loyalty redemption, the system automatically prints a 10% coupon for the customer's most purchased category "
        "whenever they cross 500 accumulated points.", body_style))
    story.append(PageBreak())

    # Page 9: Operational Hygiene, Safety & Standards
    story.append(Paragraph("SECTION 8: Operational Hygiene & Safety Standards", h2_style))
    story.append(Paragraph(
        "Supermarket hygiene is critical for food safety and brand image. The store manager must ensure these daily cleaning protocols are followed:", body_style))
    story.append(Paragraph("<b>8.1 Cold Chain Temperature Control:</b> "
        "The dairy chillers (Aisle 1) must be maintained at a constant temperature between 2°C to 4°C. "
        "Ice cream freezers must be kept at -18°C or lower. Any temperature deviation lasting more than 30 minutes must be reported immediately "
        "to prevent bacterial growth and stock spoilage.", body_style))
    story.append(Paragraph("<b>8.2 Spillage Cleanup Protocol:</b> "
        "In the event of a spillage (e.g. broken bottle of cooking oil or liquid detergent), cashiers must immediately notify janitorial staff. "
        "A yellow slip-hazard sign must be placed at both ends of the affected aisle within 2 minutes. "
        "Failure to mark a wet floor will result in immediate warning slips for the duty floor supervisor.", body_style))
    story.append(PageBreak())

    # Page 10: Store Audits, Reports & AI Integration
    story.append(Paragraph("SECTION 9: COMPLIANCE AUDITS & AI ENGINE REPORTING", h2_style))
    story.append(Paragraph(
        "To automate supermarket operations, we leverage the RetailMind AI Operations Engine. Managers must upload weekly POS logs and Inventory stock counts:", body_style))
    story.append(Paragraph("<b>9.1 Audit Report Frequency:</b> "
        "Every Sunday night, the store manager must run the RetailMind AI Diagnostic Scan. "
        "The scan outputs SWOT matrices, pricing deviations, expiry warnings, and auto-drafts supplier purchase orders. "
        "Any compliance violations flagged by the AI (such as below-cost sales or expired stock) must be investigated and resolved "
        "prior to Monday morning store opening.", body_style))
    story.append(Paragraph("<b>9.2 Manual Override Audits:</b> "
        "The AI Engine flags price discrepancies where checkout prices differ from official inventory rates. "
        "A monthly audit report summarizing all price discrepancies and unauthorized cashier discounts must be submitted to the corporate finance office.", body_style))
    story.append(Spacer(1, 40))
    story.append(Paragraph("<b>--- END OF MANUAL ---</b>", body_style))

    doc.build(story)
    print(f"Generated PDF: {filename} (10 Pages)")

def generate_pos_csv(filename="large_pos_transactions.csv", num_rows=2500):
    # Setup items and prices
    # We will build realistic co-occurrence patterns:
    # Pattern 1: Dalda Cooking Oil 5L (2250 PKR) and Lipton Yellow Label 380g (680 PKR) are bought together in ~40% of baskets.
    # Pattern 2: Surf Excel 1kg (460 PKR) and Ariel Detergent 2kg (950 PKR) are bought together in ~15% of baskets.
    # Pattern 3: Nestle Milkpak 1L (260 PKR) is a high-volume daily item bought frequently with random items.
    
    items = {
        "Dalda Cooking Oil 5L": 2250,
        "Lipton Yellow Label 380g": 680,
        "Surf Excel 1kg": 460,
        "Ariel Detergent 2kg": 950,
        "Nestle Milkpak 1L": 260,
        "Lux Soap 150g": 130,
        "Coca Cola 1.5L": 150,
        "National Chilli Powder 200g": 210,
        "Shan Biryani Masala 50g": 90,
        "Olper's Cream 200ml": 180
    }
    
    payment_methods = ["Cash", "Card", "Mobile Wallet"]
    loyalty_ids = [f"L{random.randint(1000, 9999)}" for _ in range(100)] + ["None"] * 50
    
    start_time = datetime.now() - timedelta(days=7)
    
    rows = []
    tx_id_counter = 10000
    
    while len(rows) < num_rows:
        tx_id = f"T{tx_id_counter}"
        tx_id_counter += 1
        
        timestamp = (start_time + timedelta(minutes=random.randint(1, 10080))).strftime("%H:%M")
        pay_method = random.choice(payment_methods)
        loyalty_id = random.choice(loyalty_ids)
        
        # Decide which pattern this transaction falls into
        rand = random.random()
        basket = []
        
        if rand < 0.40:
            # Pattern 1: Oil + Tea
            basket.append(("Dalda Cooking Oil 5L", random.choice([1, 2])))
            basket.append(("Lipton Yellow Label 380g", random.choice([1, 2])))
            # Add maybe a random item
            if random.random() < 0.3:
                item = random.choice(list(items.keys()))
                if item not in ["Dalda Cooking Oil 5L", "Lipton Yellow Label 380g"]:
                    basket.append((item, 1))
        elif rand < 0.55:
            # Pattern 2: Surf Excel + Ariel Detergent (Heavy laundry shopping)
            basket.append(("Surf Excel 1kg", random.choice([1, 2])))
            basket.append(("Ariel Detergent 2kg", 1))
            if random.random() < 0.3:
                basket.append(("Lux Soap 150g", random.choice([1, 2, 3])))
        elif rand < 0.80:
            # Pattern 3: Milk + high volume randoms
            basket.append(("Nestle Milkpak 1L", random.randint(1, 6)))
            # Add another grocery item
            grocery = random.choice(list(items.keys()))
            if grocery != "Nestle Milkpak 1L":
                basket.append((grocery, random.randint(1, 2)))
        else:
            # Random individual items
            num_items = random.randint(1, 3)
            selected = random.sample(list(items.keys()), num_items)
            for item in selected:
                basket.append((item, random.randint(1, 2)))
                
        # Write rows for this transaction
        for item_name, qty in basket:
            price_each = items[item_name]
            price_paid = price_each * qty
            rows.append({
                "TransactionId": tx_id,
                "Timestamp": timestamp,
                "ItemName": item_name,
                "Quantity": str(qty),
                "PricePaid": str(price_paid),
                "PaymentMethod": pay_method,
                "CustomerLoyaltyId": loyalty_id
            })
            
            # Stop if we hit target rows
            if len(rows) >= num_rows:
                break
                
    # Save CSV
    with open(filename, 'w', newline='', encoding='utf-8') as f:
        writer = csv.DictWriter(f, fieldnames=["TransactionId", "Timestamp", "ItemName", "Quantity", "PricePaid", "PaymentMethod", "CustomerLoyaltyId"])
        writer.writeheader()
        writer.writerows(rows[:num_rows])
        
    print(f"Generated CSV: {filename} with {num_rows} transactions")

if __name__ == "__main__":
    generate_pdf("comprehensive_store_policies.pdf")
    generate_pos_csv("large_pos_transactions.csv", num_rows=2500)
