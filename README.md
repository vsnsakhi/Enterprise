# 🏦 Enterprise Trade Lifecycle & Reconciliation Platform

<div align="center">

![Platform Banner](https://img.shields.io/badge/Enterprise-Trade%20Platform-0ea5e9?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCI+PHBhdGggZmlsbD0id2hpdGUiIGQ9Ik0xMiAyTDIgN2wxMCA1IDEwLTV6TTIgMTdsOCA0IDgtNE0yIDEybDggNCA4LTQiLz48L3N2Zz4=)

[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=flat-square&logo=node.js&logoColor=white)](https://nodejs.org)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=black)](https://reactjs.org)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=flat-square&logo=mongodb&logoColor=white)](https://mongodb.com)
[![Express](https://img.shields.io/badge/Express-4.x-000000?style=flat-square&logo=express&logoColor=white)](https://expressjs.com)
[![JWT](https://img.shields.io/badge/Auth-JWT-FB015B?style=flat-square&logo=jsonwebtokens&logoColor=white)](https://jwt.io)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)

**A production-quality, enterprise-grade full-stack web application simulating real-world trade operations at a global investment bank.**

[Features](#-features) • [Modules](#-modules) • [Quick Start](#-quick-start) • [API Docs](#-api-endpoints) • [Screenshots](#-ui-highlights) • [Architecture](#-architecture)

</div>

---

## 📌 Overview

The **Enterprise Trade Lifecycle & Reconciliation Platform** is a comprehensive simulation of post-trade operations used by global investment banks. It covers the complete trade lifecycle — from capture and validation through matching, settlement, exception management, and regulatory audit — all within a professional, responsive UI.

> Built to demonstrate: Trade Operations · Post-Trade Processing · Financial Reconciliation · Operational Risk Control · Workflow Automation · Exception Management · Dashboard Analytics

---

## ✨ Features

| Category | Features |
|----------|----------|
| 🔐 **Auth** | JWT login, registration, bcrypt encryption, role-based dashboards |
| 📈 **Trade Capture** | Auto-generated Trade IDs, full asset/counterparty/broker details |
| ✅ **Validation Engine** | Auto-validates missing fields, duplicates, negative prices, invalid dates |
| 🔄 **Matching Engine** | FO/MO/SS reconciliation — detects price, quantity, ID mismatches |
| 💰 **Settlement Engine** | Full workflow: Pending → Validated → Matched → Settled / Rejected |
| ⚠️ **Exception Management** | Auto-create, assign, escalate, resolve with full history |
| 🛡️ **Audit Trail** | Immutable logs — who, when, what changed, IP address |
| 📊 **Dashboard** | Live KPIs, Chart.js charts, settlement rates, exception counts |
| 📄 **Reporting** | Daily/Weekly/Monthly reports with JSON export |
| 🔍 **Search & Filters** | Multi-filter search, sorting, pagination across all modules |
| 🔔 **Notifications** | Real-time alerts for settlements, failures, escalations |
| 📉 **Analytics** | Volume trends, settlement performance, failure analysis |
| 🔒 **Security** | Rate limiting, Helmet.js, mongo-sanitize, CORS, RBAC |
| 🌙 **Dark Mode** | Full dark/light theme toggle with persistence |

---

## 🧩 Modules

```
Module 01 — Authentication & RBAC
Module 02 — Trade Capture
Module 03 — Trade Validation Engine
Module 04 — Trade Matching Engine (FO / MO / SS)
Module 05 — Settlement Engine & Workflow
Module 06 — Exception Management
Module 07 — Operational Audit Trail
Module 08 — Operations Dashboard
Module 09 — Reporting (Daily / Weekly / Monthly)
Module 10 — Advanced Search & Filters
Module 11 — Real-Time Notifications
Module 12 — Analytics & Charts
Module 13 — Security Layer
```

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** v18+
- **MongoDB** (local) or **MongoDB Atlas** (cloud)
- **npm** v8+

### 1. Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/enterprise-trade-platform.git
cd enterprise-trade-platform
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in `/backend`:

```env
PORT=5001
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRE=7d
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

```bash
npm run seed    # Load 150 demo trades, 40 exceptions, 5 users
npm run dev     # Start backend on http://localhost:5001
```

### 3. Frontend Setup

```bash
cd frontend
npm install
npm start       # Start frontend on http://localhost:3000
```

---

## 🔐 Demo Credentials

| Role | Email | Password | Access |
|------|-------|----------|--------|
| 👑 Administrator | admin@enterprise.com | Admin@123 | Full access + User Management |
| 👔 Team Lead | sarah.mitchell@enterprise.com | Lead@123 | Settle, Reject, Escalate |
| 👤 Analyst | james.chen@enterprise.com | Analyst@123 | View, Validate, Assign |

> Demo accounts are loaded automatically by `npm run seed`

---

## 🏗️ Architecture

```
enterpriserisk/
│
├── backend/                          # Node.js + Express + MongoDB
│   └── src/
│       ├── config/
│       │   └── db.js                 # MongoDB Atlas connection
│       ├── controllers/              # MVC business logic
│       │   ├── authController.js     # Login, register, profile
│       │   ├── tradeController.js    # Full trade lifecycle
│       │   ├── exceptionController.js
│       │   ├── auditController.js
│       │   ├── notificationController.js
│       │   └── reportController.js
│       ├── middleware/
│       │   ├── auth.js               # JWT protect + authorize
│       │   ├── audit.js              # Auto audit logging
│       │   └── errorHandler.js
│       ├── models/                   # Mongoose schemas
│       │   ├── User.js
│       │   ├── Trade.js
│       │   ├── Exception.js
│       │   ├── Audit.js
│       │   ├── Notification.js
│       │   └── Report.js
│       ├── routes/                   # Express routers
│       ├── utils/
│       │   └── seeder.js             # Demo data generator
│       └── server.js                 # App entry point
│
└── frontend/                         # React.js SPA
    └── src/
        ├── api/
        │   ├── axios.js              # Axios instance + interceptors
        │   └── index.js              # All API calls
        ├── components/
        │   ├── common/               # Badge, Modal, Pagination, KpiCard
        │   └── layout/               # Sidebar, Topbar, AppLayout
        ├── context/
        │   ├── AuthContext.js        # Global auth state
        │   └── ThemeContext.js       # Dark/light mode
        ├── pages/
        │   ├── Dashboard.js
        │   ├── trades/               # List, Form, Detail
        │   ├── exceptions/
        │   ├── audit/
        │   ├── reports/
        │   ├── analytics/
        │   ├── notifications/
        │   └── auth/                 # Login, Register, Profile, Users
        └── App.js                    # Routes + providers
```

---

## 🔌 API Endpoints

### Authentication
```
POST   /api/auth/register
POST   /api/auth/login
GET    /api/auth/me
PUT    /api/auth/me
PUT    /api/auth/password
POST   /api/auth/logout
GET    /api/auth/users              🔒 team_lead, administrator
PUT    /api/auth/users/:id          🔒 administrator
```

### Trades
```
GET    /api/trades                  ?status=&assetType=&search=&page=&limit=
POST   /api/trades
GET    /api/trades/stats
GET    /api/trades/:id
PUT    /api/trades/:id
POST   /api/trades/:id/validate
POST   /api/trades/:id/match
POST   /api/trades/:id/settle       🔒 team_lead, administrator
POST   /api/trades/:id/reject       🔒 team_lead, administrator
```

### Exceptions
```
GET    /api/exceptions              ?status=&priority=&type=
GET    /api/exceptions/stats
GET    /api/exceptions/:id
PUT    /api/exceptions/:id/assign
PUT    /api/exceptions/:id/resolve
PUT    /api/exceptions/:id/escalate 🔒 team_lead, administrator
PUT    /api/exceptions/:id/close    🔒 team_lead, administrator
```

### Audit
```
GET    /api/audit                   🔒 team_lead, administrator
GET    /api/audit/:entityId
```

### Reports & Analytics
```
GET    /api/reports
POST   /api/reports
GET    /api/reports/analytics
GET    /api/reports/:id
```

### Notifications
```
GET    /api/notifications
PUT    /api/notifications/read-all
PUT    /api/notifications/:id/read
DELETE /api/notifications/:id
```

---

## 🗄️ Data Models

### Trade
```
tradeId (auto)  buyer           seller          assetType
assetSymbol     assetName       price           quantity
totalValue      currency        tradeDate       settlementDate
broker          counterparty    status          validationStatus
matchStatus     riskLevel       settlementDetails  validationErrors[]
```

### Exception
```
exceptionId     trade (ref)     tradeId         type
priority        status          title           description
assignedTo      resolvedBy      escalatedTo     history[]
resolutionNotes escalationReason  dueDate       slaBreached
```

### Audit (Immutable)
```
auditId         entityType      entityId        action
performedBy     performedByName performedByRole ipAddress
userAgent       oldValue        newValue        changes[]
description     module          severity        timestamp
```

### Notification
```
recipient       type            title           message
entityType      entityId        priority        isRead
readAt          link
```

---

## 📊 ER Diagram

```
┌─────────────┐         ┌─────────────────┐
│    User     │────────▶│     Trade        │
│─────────────│ creates │─────────────────│
│ firstName   │         │ tradeId (auto)   │
│ lastName    │         │ buyer / seller   │
│ email       │         │ assetType        │
│ role        │         │ price / quantity │
│ department  │         │ status           │
└─────────────┘         │ validationErrors │
       │                └────────┬────────┘
       │                         │ trade ref
       │                         ▼
       │                ┌─────────────────┐
       │────────────────│   Exception      │
       │  assignedTo    │─────────────────│
       │                │ exceptionId      │
       │                │ type / priority  │
       │                │ status           │
       │                │ history[]        │
       │                └─────────────────┘
       │
       ▼
┌─────────────────┐     ┌─────────────────┐
│     Audit        │     │  Notification   │
│─────────────────│     │─────────────────│
│ entityType       │     │ recipient (ref) │
│ entityId         │     │ type / title    │
│ action           │     │ message         │
│ performedBy      │     │ priority        │
│ ipAddress        │     │ isRead          │
│ changes[]        │     └─────────────────┘
│ IMMUTABLE        │
└─────────────────┘
```

---

## 🛡️ Security

| Feature | Implementation |
|---------|---------------|
| Authentication | JWT Bearer tokens (7-day expiry) |
| Password Hashing | bcrypt with 12 salt rounds |
| Authorization | Role-Based Access Control (RBAC) |
| NoSQL Injection | express-mongo-sanitize |
| Rate Limiting | 500 req/15min global, 20 req/15min on login |
| Security Headers | Helmet.js |
| CORS | Configured for frontend origin only |
| Input Validation | express-validator on all routes |

---

## 🎨 UI Highlights

- **Glassmorphism** login/register pages with animated background
- **Dark / Light mode** toggle with localStorage persistence
- **Animated KPI cards** with color-coded status indicators
- **Interactive Chart.js** — Line, Bar, Doughnut charts
- **Settlement progress timeline** with step indicators
- **Immutable audit trail** with expandable change diffs
- **Toast notifications** for all user actions
- **Loading skeletons** during data fetch
- **Responsive design** for all screen sizes
- **Collapsible sidebar** with role-filtered navigation

---

## 🧪 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, React Router v6, Chart.js, react-chartjs-2 |
| Styling | Custom CSS3 (design system), CSS variables, dark mode |
| HTTP Client | Axios with interceptors |
| Backend | Node.js, Express.js 4 |
| Database | MongoDB Atlas, Mongoose ODM |
| Auth | JSON Web Tokens (JWT), bcryptjs |
| Security | Helmet, express-rate-limit, express-mongo-sanitize |
| Dev Tools | Nodemon, Morgan |

---

## 📁 Seeded Demo Data

Running `npm run seed` loads:

- **5 Users** across all roles (Administrator, Team Lead, Analyst)
- **150 Trades** spanning 60 days with all statuses and asset types
- **40 Exceptions** with various priorities and statuses
- All trades include realistic counterparties, brokers, and financial data

---

## 📜 License

This project is licensed under the **MIT License**.

---

<div align="center">

Built with ❤️ as an enterprise-grade simulation of global investment bank operations.

⭐ **Star this repo if you found it useful!**

</div>
