<div align="center">
  <img src="public/favicon.svg" alt="Retail AI Logo" width="120" />

  # Retail AI
  **Next-Generation Enterprise Retail Operations & AI Management Platform**

  [![React](https://img.shields.io/badge/React-18.x-blue?style=for-the-badge&logo=react)](https://reactjs.org/)
  [![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-009688?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com/)
  [![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.x-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
  [![Vercel](https://img.shields.io/badge/Vercel-Serverless-black?style=for-the-badge&logo=vercel)](https://vercel.com/)
  [![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=for-the-badge&logo=mongodb)](https://mongodb.com/)
</div>

<br />

![Retail AI Dashboard](public/premium_bg.png)

**Retail AI** is a state-of-the-art, enterprise-grade retail operations management platform. Built to seamlessly integrate physical retail operations with advanced artificial intelligence, this application acts as the digital nervous system for your business. It centralizes inventory management, human resources, data synchronization, dynamic business configurations, and automated customer support into a single, cohesive, premium dashboard.

Leveraging bleeding-edge frontend technologies (React, Vite, Tailwind CSS) alongside a highly robust **FastAPI Serverless Backend**, Retail AI delivers real-time data analysis, predictive insights, and AI-driven workflow automation powered by **Large Language Models (LLMs)**.

---

## 🌟 Core Modules & Features

### 1. 📊 Retail Analytics & Command Center (`RetailOverview.tsx`)
A centralized command center providing real-time, high-density visibility into your store's performance.
- **Dynamic KPIs:** Live tracking of daily revenue, active inventory stock, pending operational actions, and active floor staff.
- **Predictive SWOT Analysis:** AI-powered Strengths, Weaknesses, Opportunities, and Threats generation based on live inventory velocities and POS logs.
- **Sales Trend Forecasting:** Visual representations of weekly sales trajectories comparing historical POS data to predictive models.
- **Critical Alerting:** Proactive notifications for stock depletion, expiring perishable goods, and shift coverage gaps.

### 2. 🤖 Automated AI Support Engine (`SupportEngine.tsx`)
A fully autonomous, intelligent customer service hub that reads, analyzes, and replies to incoming customer emails without human intervention.
- **Live IMAP Email Integration:** Fetches and reads customer emails directly from a live inbox queue in real-time.
- **Intent Classification Pipeline:** The LLM automatically categorizes emails into Inquiries, Refunds, or Escalations based on context.
- **RAG Policy Lookups:** Uses uploaded PDF business rules (Return Policies, SOPs) to accurately answer queries.
- **Smart Escalation:** Automatically drafts professional replies, but smartly forwards high-priority or unanswerable complaints directly to Human Managers.

### 3. 💬 Operations AI Copilot (`OperationsChatbot.tsx`)
Your personal AI store manager, functioning as an advanced Retrieval-Augmented Generation (RAG) assistant.
- **Conversational Interface:** Ask plain-English questions about sales anomalies, stock depletion, or HR policies.
- **Context-Aware Responses:** The bot queries your uploaded documents, inventory database, and live POS data to give accurate, data-backed operational insights.
- **Persistent Sessions:** Stores chat history securely in MongoDB, allowing seamless continuation of past analytical sessions.

### 4. 👥 Human Resources Dashboard (`HRDashboard.tsx`)
A complete staff management and payroll module wrapped in a sleek corporate UI.
- **Staff Roster:** Maintain a detailed ledger of employees, departments, roles, and shift assignments.
- **Attendance & Payroll Tracking:** Automated monthly payroll calculations broken down by department and individual performance metrics.
- **Employee Profiles:** Deep-dive analytical cards showing individual attendance histories and contact data.

### 5. 🔄 Data Sync Hub (`DataSyncHub.tsx`)
The primary ingestion engine for the AI. Keep your business intelligence strictly up to date.
- **Inventory Sync:** Upload current stock levels, expiry dates, and costs via CSV.
- **POS Log Uploads:** Feed the AI daily transaction logs to dramatically improve its predictive accuracy.
- **Business Policy PDFs:** Upload your SOPs and rules. The AI extracts this text to securely enforce your business boundaries when interacting with customers.

### 6. ⚙️ Business Control Center (`BusinessSettings.tsx`)
Securely manage the underlying configurations of your digital infrastructure. 
> **Security Note:** All credentials, SMTP/IMAP emails, and App Passwords are strictly stored in MongoDB and fetched dynamically by the backend. **Zero hardcoding.**
- **System Credentials:** Manage dynamic SMTP/IMAP settings allowing the AI Support Engine to operate autonomously.
- **Staff Escalation Routing:** Configure which human staff members receive escalated complaints.
- **Floor Mapping:** Define physical store layouts (aisles, capacity) for spatial AI optimization.

---

## 🎨 UI/UX & Premium Design Philosophy

Retail AI underwent a comprehensive UI/UX overhaul to align with high-end enterprise standards:
- **Corporate Glassmorphism:** A clean shift away from playful colors toward a deeply immersive, ultra-premium dark mode (Slate, Obsidian, Ambient Amber) using subtle blur effects.
- **High Data Density:** Interfaces are structurally optimized to display maximum operational data (tables, ledgers, logs) without feeling cluttered.
- **Responsive Architecture:** Fully mobile-responsive. Layouts dynamically collapse from complex multi-column dashboard grids on desktop to streamlined, stacked views on smartphones.
- **Micro-Animations:** Fluid transitions, 3D rotating brand assets, and smooth loading states ensure the platform feels alive and highly responsive.

---

## 🚀 Technology Stack

### Frontend Architecture
- **React 18:** Component-based UI rendering.
- **Vite:** Next-generation frontend tooling for ultra-fast Hot Module Replacement (HMR).
- **Tailwind CSS:** Utility-first framework for rapid, consistent, and highly responsive styling.
- **Lucide React:** Beautiful, consistent iconography.

### Backend & AI Infrastructure
- **FastAPI (Python):** High-performance backend API layer engineered for Vercel Serverless deployment.
- **LangChain & Groq (Llama 3):** Powers the core RAG pipelines, intelligent intent classification, and rapid text generation.
- **MongoDB Atlas:** Highly scalable NoSQL database for flexible storage of transaction logs, inventory states, settings, and chat histories.
- **PyPDF2 & Pandas:** For real-time document extraction and high-speed CSV parsing/aggregation.

---

## 💻 Getting Started (Local Development)

### Prerequisites
- Node.js (v18+)
- Python (3.10+)
- MongoDB instance (Atlas or Local)

### 1. Clone & Install Frontend
```bash
git clone https://github.com/SaadAbdullah72/BusiMind.git
cd BusiMind
npm install
```

### 2. Configure Environment Variables
Create a `.env` file in the root directory and add your credentials:
```env
MONGO_URI=your_mongodb_connection_string
GROQ_API_KEY=your_groq_api_key
```

### 3. Start the Development Servers
Retail AI uses Vite for the frontend and FastAPI for the backend.

Start the frontend server:
```bash
npm run dev
```

Start the FastAPI backend (in a separate terminal):
```bash
cd api
pip install -r requirements.txt
uvicorn index:app --reload --port 8000
```

---

## 🔒 Security Architecture
- **Dynamic Credentialing:** The application relies 100% on MongoDB for SMTP, IMAP, and Escalation emails configured via the Business Settings UI. No raw emails are hardcoded in the deployment pipeline.
- **Stateless Authentication:** Secure OTP-based authentication flows and bcrypt password hashing.
- **Serverless Execution:** Backend operations execute in isolated, ephemeral Vercel Edge/Serverless environments.

<br />

<div align="center">
  <i>Retail AI — Turning raw retail data into intelligent, autonomous business actions.</i>
</div>
