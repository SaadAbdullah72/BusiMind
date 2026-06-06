from fpdf import FPDF

class PDF(FPDF):
    def header(self):
        self.set_font('Arial', 'B', 15)
        self.cell(80)
        self.cell(30, 10, 'BusiMind Solutions - Official Business Policy', 0, 0, 'C')
        self.ln(20)

    def footer(self):
        self.set_y(-15)
        self.set_font('Arial', 'I', 8)
        self.cell(0, 10, 'Page ' + str(self.page_no()) + '/{nb}', 0, 0, 'C')

pdf = PDF()
pdf.alias_nb_pages()
pdf.add_page()
pdf.set_font('Arial', '', 12)

content = """
Welcome to BusiMind Solutions. The following document contains all official policies regarding shipping, returns, order cancellations, and product warranties. Customer Support Agents MUST follow these rules strictly.

1. Shipping & Delivery
- Standard delivery takes 3 to 5 business days for all metropolitan areas.
- For rural areas, delivery might take up to 7 business days.
- Express shipping is available for an extra $15 and guarantees next-day delivery if ordered before 2 PM.
- We do NOT ship internationally at the moment. All orders are strictly domestic.

2. Returns & Refunds
- Customers can return any unopened and unused product within 14 days of delivery for a full refund.
- If the product is defective upon arrival, the customer must notify us within 48 hours with photographic proof. We will issue a free replacement or a full refund immediately.
- Refunds are processed back to the original payment method and take 5 to 10 business days to reflect in the bank account.
- Sale items or items purchased with a discount code greater than 20% are final sale and non-refundable.

3. Order Cancellations
- Orders can be cancelled free of charge within 2 hours of placement.
- Once an order has been shipped, it cannot be cancelled. The customer must receive the order and process a standard return.

4. Warranty Policy
- All electronic products come with a standard 1-year manufacturer warranty covering internal defects.
- Physical damage, water damage, or damage caused by improper usage voids the warranty entirely.
- To claim a warranty, the customer must provide the original Transaction ID.

5. General Support Etiquette
- If a customer is angry or complaining about a delayed delivery, apologize sincerely and offer a 5% discount code (DELAY5) for their next purchase.
- Do NOT make up answers. If the policy does not explicitly cover a scenario, escalate the ticket to the management team.
"""

pdf.multi_cell(0, 10, content)
pdf.output('mock_business_policy.pdf', 'F')
print("Successfully generated mock_business_policy.pdf")
