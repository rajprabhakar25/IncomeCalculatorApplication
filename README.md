# Income Assessment Application

## Overview

Full-stack web application for loan officers to evaluate loan eligibility for small businesses in India's informal sector. Digitises the Excel-based income calculation workflow for 5 business types: **Grocery/Kirana, Dairy, Tea Shop, Hotel/Restaurant, and Tailoring**.

## Tech Stack

- **Frontend:** React 18, React Router v6, Axios
- **Backend:** Node.js, Express.js
- **Database:** MongoDB with Mongoose ODM

## Prerequisites

- Node.js v18+ — https://nodejs.org
- MongoDB v6+ (local) — https://www.mongodb.com/try/download/community
  - *Or* MongoDB Atlas free tier (cloud DB)
- Git

## Getting Started

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd income-assessment-app
```

### 2. Set up environment variables

```bash
cp .env.example .env
# Edit .env if needed (MongoDB URI and port)
```

### 3. Install dependencies & run

**Terminal 1 — Start MongoDB (if using local)**
```bash
mongod
```

**Terminal 2 — Start backend**
```bash
cd server
npm install
npm run dev
```

**Terminal 3 — Start frontend**
```bash
cd client
npm install
npm start
```

### 4. Open the application

Navigate to **http://localhost:3000**

Backend API runs at **http://localhost:5000**

## Environment Variables

| Variable   | Description                     | Default                                        |
|------------|---------------------------------|------------------------------------------------|
| MONGO_URI  | MongoDB connection string        | mongodb://localhost:27017/income-assessment    |
| PORT       | Backend server port              | 5000                                           |

## Features

- Create and manage income assessment cases
- Support for 5 business types, each with a unique turnover entry structure
- Real-time auto-calculation of turnover, P&L, and loan eligibility as you type
- IIR (Income to Instalment Ratio) threshold warnings (red highlight when > 50%)
- Printable single-page summary reports with Indian Rupee (₹) formatting
- Search and filter cases by customer name, business name, type, and status
- Status lifecycle: Draft → In-Progress → Completed

## Business Types & Default Gross Margins

| Business Type       | Turnover Method             | Default Gross Margin | Days/Month |
|---------------------|-----------------------------|---------------------|------------|
| Grocery/Kirana      | Item-wise (daily × 25)      | 25%                 | 25         |
| Dairy               | Session-wise (daily × 30)   | 70%                 | 30         |
| Tea Shop            | Product-wise (daily × 30)   | 50%                 | 30         |
| Hotel/Restaurant    | Session + Item-wise (× 25)  | 50%                 | 25         |
| Tailoring           | Order-note (monthly direct) | 85%                 | —          |

## Validation Test Data

| Business Type | Turnover    | Margin | Gross Profit | Expenses    | Net Income |
|---------------|-------------|--------|-------------|-------------|------------|
| Grocery       | ₹2,11,000   | 25%    | ₹52,750     | ₹15,000     | ₹37,750    |
| Dairy         | ₹73,500     | 70%    | ₹51,450     | ₹7,500      | ₹43,950    |
| Tea Shop      | ₹1,98,000   | 50%    | ₹99,000     | ₹45,500     | ₹53,500    |
| Hotel         | ₹4,08,000   | 50%    | ₹2,04,000   | ₹1,41,000   | ₹63,000    |
| Tailoring     | ₹73,000     | 85%    | ₹62,050     | ₹30,000     | ₹32,050    |

## Loan Eligibility Formula

```
EMI per Lakh  = PMT(ROI%/12, TenureMonths, -1,00,000)
Loan Eligible = (Net Income × IIR%) / EMI per Lakh  (in lakhs)
IIR Current   = Final EMI / Net Income × 100
IIR Combined  = (Final EMI + Existing EMI) / Net Income × 100
```

- EMI per lakh at 16.5% for 10 years = ₹1,706.42
- EMI per lakh at 21% for 10 years = ₹1,999.32

## Project Structure

```
income-assessment-app/
├── .env.example
├── .gitignore
├── README.md
├── client/                         # React frontend
│   ├── package.json
│   ├── public/index.html
│   └── src/
│       ├── App.js
│       ├── index.js
│       ├── api/caseApi.js
│       ├── components/
│       │   ├── cases/              # CaseList, CaseForm, CaseDetail
│       │   ├── common/             # Navbar, INRFormat, WarningBadge
│       │   ├── eligibility/        # EligibilityModule
│       │   ├── pnl/                # PnLModule
│       │   ├── summary/            # SummaryReport
│       │   └── turnover/           # TurnoverModule + 5 business-type forms
│       ├── constants/businessConfig.js
│       ├── styles/App.css
│       └── utils/
│           ├── calculations.js
│           └── formatCurrency.js
└── server/                         # Express backend
    ├── package.json
    ├── server.js
    ├── config/db.js
    ├── controllers/caseController.js
    ├── models/Case.js
    └── routes/caseRoutes.js
```

## AI Tools Used

This project was built with the assistance of **Claude (Anthropic)** — used for architecture planning, code generation, business logic implementation based on Excel calculation sheets, and debugging. All code was reviewed and tested before submission.
