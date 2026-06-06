# BusiMind AI - Next-Generation Retail Operations Management

![BusiMind AI](public/bg-corporate.png)

BusiMind AI is a state-of-the-art, enterprise-grade retail operations management platform. Built to integrate physical retail operations with advanced artificial intelligence, this application acts as the digital nervous system for your business. It streamlines inventory management, human resources, data synchronization, business configurations, and customer support into a single, cohesive, premium dashboard.

The application leverages bleeding-edge frontend technologies (React, Vite, Tailwind CSS) alongside a robust Python (Flask) backend to deliver real-time data analysis, predictive insights, and AI-driven automation using LangChain and LLMs (Large Language Models).

---

## 🌟 Key Features

### 1. **Retail Analytics & Overview Dashboard (`RetailOverview.tsx`)**
A centralized command center providing real-time visibility into your store's performance.
- **Key Performance Indicators (KPIs):** Track daily revenue, total active inventory items, pending actions (e.g., low stock alerts), and active staff members.
- **Predictive SWOT Analysis:** AI-powered Strengths, Weaknesses, Opportunities, and Threats breakdown based on current inventory velocities and sales logs.
- **Sales Trend Forecasting:** Visual data representations of weekly sales trajectories comparing historical data to predictive AI models.
- **Critical Alerts System:** Proactive notifications for stock depletion, expiring goods, and shift coverage gaps.

### 2. **AI Support Engine (`SupportEngine.tsx`)**
A fully automated, intelligent customer service hub that processes incoming emails and tickets without human intervention.
- **Live Inbox Integration:** Fetches and reads customer emails directly from a live queue.
- **Intent Classification Pipeline:** The AI automatically categorizes emails into Standard Inquiries, Refunds, or Complaints.
- **Contextual Database Lookups:** Integrates with MongoDB to verify order IDs, POS transactions, and receipt data mentioned in customer emails.
- **Automated Drafting & Escalation:** Generates natural language auto-replies based on business policies, and smartly escalates high-priority complaints to human managers.

### 3. **Operations Chatbot (`OperationsChatbot.tsx`)**
Your personal AI store assistant. Designed to function as a Retrieval-Augmented Generation (RAG) copilot.
- **Conversational Interface:** Ask plain-English questions about your sales, stock status, or internal business policies.
- **Context-Aware Responses:** The bot queries your uploaded documents and live POS data to give you accurate, data-backed operational insights.
- **Session Management:** Stores and manages chat history locally, allowing you to seamlessly continue past analytical sessions.

### 4. **Human Resources Dashboard (`HRDashboard.tsx`)**
A complete staff management and payroll module with a sleek, corporate design.
- **Staff Roster:** Maintain a detailed database of employees, their departments, roles, and shift assignments.
- **Attendance Tracking:** Visual indicators of staff attendance rates and weekly presence, ensuring operational capacity is met.
- **Payroll Ledger:** Automated monthly payroll calculations broken down by department and individual employees.
- **Employee Profiles:** Deep-dive cards showing individual performance, attendance histories, and contact information.

### 5. **Data Sync Hub (`DataSyncHub.tsx`)**
The ingestion engine for your AI models. Keep your business intelligence up to date by syncing raw data.
- **Inventory Sync:** Upload your current stock levels, expiry dates, and costs via CSV.
- **POS Log Uploads:** Feed the AI your daily transaction logs to improve its predictive accuracy and sales forecasting.
- **Policy Management:** Upload PDF documents of your business rules, return policies, and SOPs. The AI extracts this text to understand your business boundaries when interacting with customers or answering operational queries.

### 6. **Business Control Center (`BusinessSettings.tsx`)**
Securely manage the underlying configurations of your digital infrastructure.
- **System Credentials:** Manage SMTP/IMAP settings for the AI Support Engine, enabling it to read and send emails on behalf of the business.
- **Escalation Routing:** Configure which human staff members receive escalated complaints or critical alerts.
- **Dynamic Floor Planner:** Define your physical store layout (aisles, shelving capacity) so the AI can automatically calculate optimal product placements based on sales velocity and category volume.

---

## 🎨 UI/UX & Design Philosophy

BusiMind AI underwent a comprehensive UI/UX overhaul to align with enterprise standards. The design philosophy emphasizes:
- **Corporate Minimalism:** A shift away from playful gradients and oversized emojis toward clean, solid color palettes (Slate, White, Black) and refined typography.
- **High Data Density:** Interfaces are optimized to display maximum operational data without feeling cluttered. Tables, ledgers, and logs are built for rapid scanning.
- **Responsive Architecture:** Fully mobile-responsive. Layouts dynamically collapse from complex multi-column grids on desktop to streamlined, stacked views on smartphones and tablets, ensuring store managers can run the business on the go.
- **Terminal Aesthetics:** Certain AI interfaces (like the Support Engine and Chatbot) utilize a sleek, developer-inspired dark mode that emphasizes text clarity and data processing states.

---

## 🚀 Technology Stack

### Frontend
- **React 18:** Component-based UI rendering.
- **Vite:** Next-generation frontend tooling for ultra-fast Hot Module Replacement (HMR) and optimized builds.
- **Tailwind CSS:** Utility-first CSS framework used for rapid, consistent, and highly responsive styling.
- **TypeScript:** Strict typing to ensure robust code quality and fewer runtime errors.

### Backend (API Layer)
- **Python / Flask:** Lightweight, highly performant backend routing.
- **LangChain & LLMs:** Powers the RAG (Retrieval-Augmented Generation) pipelines, intent classification, and conversational logic.
- **MongoDB:** NoSQL database for flexible storage of transaction logs, inventory states, and chat histories.
- **Pandas / NumPy:** For high-speed CSV parsing, data aggregation, and analytical computations.

---

## 💻 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- Python (3.10 or higher)
- MongoDB instance (local or Atlas)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/SaadAbdullah72/BusiMind.git
   cd BusiMind
   ```

2. **Install Frontend Dependencies:**
   ```bash
   npm install
   ```

3. **Install Backend Dependencies:**
   Navigate to the `server` directory and install the Python requirements:
   ```bash
   cd server
   pip install -r requirements.txt
   ```

4. **Environment Variables:**
   Create a `.env` file in the `server` directory and configure your API keys (e.g., Groq API key, MongoDB URI, Email Credentials).

5. **Run the Application:**
   Start the frontend development server:
   ```bash
   npm run dev
   ```
   Start the backend Flask server (in a separate terminal):
   ```bash
   python server/app.py
   ```

---

## 🤝 Contribution Guidelines

This project maintains a high standard of code quality. When contributing:
- Ensure all new UI components adhere to the established Tailwind CSS corporate design system (use `slate` color palettes, avoid unnecessary SVGs/gradients).
- Update TypeScript interfaces for any new data models.
- Run mobile responsiveness checks before submitting a PR.

---

*BusiMind AI — Turning raw retail data into intelligent business actions.*
