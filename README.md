# MedStock — Primary Health Centre Medicine Stock & Expiry Register

**SIH 2026 Internal Practical Assessment | Harish Raghavendran V | CSE PSVPEC | Year IV**

A digital stock register that maintains an accurate running balance for every medicine, warns the pharmacist about low stock and approaching expiry, and replaces the error-prone paper notebook.

---

## Problem Statement

A primary health centre holds medicines managed by a paper notebook. Two failures occur repeatedly: medicines run out without warning, and stock quietly passes its expiry date. This application solves both with a running balance and expiry alert system.

---

## How to Run

### Prerequisites
- Node.js (v18+)
- MongoDB (running locally on port 27017, or supply a cloud URI in `.env`)

### 1. Clone the Repository
```bash
git clone https://github.com/Harish716/medicine-stock-management.git
cd medicine-stock-management
```

### 2. Backend Setup
```bash
# Install dependencies
npm install

# Create .env file (already included as .env.example)
# Edit MONGO_URI if needed
cp .env.example .env

# Seed the database with 20 sample records
node seed/seedData.js

# Start the backend server
npm run dev
# → Running on http://localhost:5000
```

### 3. Frontend Setup (in a new terminal)
```bash
cd frontend
npm install
npm run dev
# → Running on http://localhost:5173
```

### 4. Open the App
Navigate to **http://localhost:5173** in your browser.

---

## Field Definitions

| Field | Description | Example |
|---|---|---|
| `entry_id` | Unique identifier for each stock entry | MED-001 |
| `medicine_name` | Name and strength of the medicine | Paracetamol 500mg |
| `batch_no` | Manufacturer batch/lot number (can be null) | BATCH-PC-2024-01 |
| `quantity_in` | Units received into stock | 500 |
| `quantity_out` | Units dispensed or issued | 120 |
| `balance` | **Auto-calculated**: units currently in stock | 380 |
| `expiry_date` | The date this batch expires | 2025-07-01 |
| `date` | Date this entry was recorded | 2024-01-10 |
| `reorder_level` | Minimum safe stock; triggers Low Stock alert (default: 10) | 50 |
| `days_to_expiry` | **Auto-calculated**: days from today to expiry date | 120 |
| `status` | **Auto-calculated**: OK / Low Stock / Expiring Soon / Expired | OK |

---

## How Derived Values Are Calculated

These three fields are **never entered manually**. The server recomputes them on every save and update:

```
balance        = quantity_in − quantity_out

days_to_expiry = ceil((expiry_date − today) / 86400000)

status = "Expired"       if days_to_expiry ≤ 0
       = "Expiring Soon" if days_to_expiry ≤ 30
       = "Low Stock"     if balance ≤ reorder_level
       = "OK"            otherwise
```

---

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/medicines` | List all (supports `?search=`, `?status=`, `?sort=`, `?order=`) |
| GET | `/api/medicines/alerts` | Only Low Stock + Expiring Soon + Expired records |
| GET | `/api/medicines/:id` | Single record |
| POST | `/api/medicines` | Create new record |
| PUT | `/api/medicines/:id` | Update record (derived values recalculated) |
| DELETE | `/api/medicines/:id` | Delete record |

---

## Edge Cases in Seed Data

| Entry | Edge Case |
|---|---|
| MED-009 | `quantity_out = 0` — new stock, never dispensed |
| MED-010 | `batch_no = null` — missing batch number |
| MED-011 | Balance below reorder level → **Low Stock** |
| MED-012 | Expiry in 15 days → **Expiring Soon** |
| MED-013 | Already expired → **Expired** |
| MED-014 | Duplicate name: Paracetamol 500mg (different batch) |
| MED-015 | Entry date from 2020 — unusually old |
| MED-016 | Duplicate name: Amoxicillin 250mg (different batch) |

---

## What Is Not Finished

- User authentication / login (not required per assessment scope)
- PDF/Excel export
- Production deployment (app runs locally only)

---

## Tech Stack

- **Frontend**: React 18 + Vite, Vanilla CSS, React Router, Axios, Lucide React
- **Backend**: Node.js, Express, Mongoose
- **Database**: MongoDB

---

*SIH 2026 | PSVPEC | CSE*
