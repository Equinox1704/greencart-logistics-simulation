# GreenCart Logistics – Delivery Simulation & KPI Dashboard

## 📌 Project Overview
GreenCart Logistics is an internal tool for managers to simulate eco‑friendly urban delivery operations, apply custom company rules, and view key performance indicators (KPIs) in real-time.  
This app allows managers to:
- Experiment with the number of drivers, start times, and work hours.
- Automatically allocate orders to drivers and calculate:
  - **Total Profit**
  - **Efficiency Score**
  - **On‑Time / Late Deliveries**
  - **Fuel Cost Breakdown**
- View past simulation histories.
- Manage company resources (Drivers, Routes, Orders) via CRUD pages.

---

## 🛠 Tech Stack
**Frontend:** React (Vite) + Hooks, Recharts, TailwindCSS  
**Backend:** Node.js (Express 4.21), MongoDB (Atlas), JWT Auth, Zod Validation, Swagger (OpenAPI)  
**Database:** MongoDB Atlas (Cloud-hosted)  
**Authentication:** JWT with bcrypt password hashing  
**Deployment:**  
- **Frontend:** Vercel  
- **Backend:** Render  
- **Database:** MongoDB Atlas  

---

## 📂 Project Structure
```

/frontend     → React app (Vite)
/backend      → Node.js + Express API
/routes     → API route handlers
/models     → Mongoose models
/middlewares
/config

````

---

## 🚀 Live Links
- **Frontend:** https://greencart-logistics-simulation.vercel.app  
- **Backend API:** https://greencart-logistics-simulation.onrender.com  
- **API Docs (Swagger):** https://greencart-logistics-simulation.onrender.com/docs  

---

## ⚡ Features
- Secure **Manager Login** with JWT.
- CRUD for **Drivers**, **Routes**, **Orders**.
- **Run Simulation** with:
  - Number of available drivers
  - Start time
  - Max hours per driver/day
- Apply **business rules**:
  1. Late Delivery Penalty (₹50)
  2. Fatigue: >8h previous day → 30% slower next day
  3. High-value bonus: >₹1000 & on-time → +10% profit
  4. Fuel cost: ₹5/km (+₹2/km for High traffic)
- KPI Dashboard:
  - Profit, Efficiency %
  - On-time vs. Late chart
  - Fuel Cost Breakdown chart
- View **Simulation History**.

---

## 🖥 Local Setup Instructions

### Prerequisites
- Node.js >= 18
- npm or yarn
- MongoDB Atlas account

### 1️⃣ Clone the repository
```bash
git clone https://github.com/<your-username>/greencart-logistics-simulation.git
cd greencart-logistics-simulation
````

### 2️⃣ Backend Setup

```bash
cd backend
cp .env.example .env   # create and fill env values
npm install
npm run dev            # starts backend on PORT
```

**`.env` variables (Backend):**

```
MONGODB_URI=
JWT_SECRET=
CORS_ORIGIN=http://localhost:5173
CORS_ORIGIN_PROD=https://greencart-logistics-simulation.vercel.app
PORT=4000
NODE_ENV=development
API_BASE_URL=https://greencart-logistics-simulation.onrender.com
```

### 3️⃣ Frontend Setup

```bash
cd ../frontend
cp .env.example .env   # create & fill env values
npm install
npm run dev            # starts Vite dev server
```

**`.env` variables (Frontend):**

```
VITE_API_BASE_URL=http://localhost:4000
```

---

## 🌐 Deployment Instructions

### Backend (Render)

1. Push code to GitHub.
2. Create a new Web Service on Render.
3. Root Directory: `backend`
4. Build Command: `npm install`
5. Start Command: `npm start`
6. Add Environment Variables (same as local `.env`, but with production values).
7. Deploy.

### Frontend (Vercel)

1. Import repository.
2. Root Directory: `frontend`
3. Framework Preset: Vite
4. Build Command: `npm run build`
5. Output Dir: `dist`
6. Add `VITE_API_BASE_URL` = Render backend URL in Environment Variables.
7. Deploy.

---

## 📜 API Documentation

API is documented at `/docs` using Swagger.
Example:

```
POST /simulate
Body:
{
  "driversAvailable": 5,
  "startTime": "09:00",
  "maxHoursPerDriver": 8
}
```

Response:

```
{
  "kpis": {
    "totalProfit": 5000,
    "efficiency": 85,
    "onTime": 17,
    "late": 3,
    "fuelCostBreakdown": {
      "baseFuel": 1200,
      "highTrafficSurcharge": 300
    }
  },
  "assignments": [ ... ]
}
```

---

## 🧪 Testing

Backend tests cover:

* Late delivery penalty
* Fatigue slowdown
* High-value bonus
* Fuel cost calc
* Efficiency formula

Run tests:

```bash
cd backend
npm test
```

---


## 📌 Author & License

Developed by Mayank Negi for Purple Merit Technologies Assessment (August 2025).
License: MIT
