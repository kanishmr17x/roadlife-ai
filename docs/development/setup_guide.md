# RoadLife AI — Development Setup Guide

## Prerequisites
* **Node.js**: v18.0.0 or higher
* **npm**: v9.0.0 or higher
* **Python**: v3.10.x (recommended for AI service)
* **MongoDB**: v6.0 or higher (or a free MongoDB Atlas cluster)

---

## 1. Quick Start (Recommended)

1. **Clone & Install Dependencies**:
   ```bash
   cd roadlife-ai
   npm install
   ```

2. **Configure Environment Variables**:
   In `backend/express-api/.env`:
   ```env
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/roadlife_db
   JWT_SECRET=your-secure-jwt-secret-key-2026
   NODE_ENV=development
   ```

3. **Launch Full Stack Concurrently**:
   ```bash
   npm run dev
   ```
   * Express API will start on: `http://localhost:5000`
   * Vite Web App will start on: `http://localhost:5173`

---

## 2. Seeded Development Accounts

The Express backend automatically provisions 3 development accounts when running in non-production mode:

| Portal | Email | Password | Role |
|---|---|---|---|
| **Citizen Portal** | `kanish1@gmail.com` | `1234` | `CITIZEN` |
| **Contractor Portal** | `kanish2@gmail.com` | `1234` | `CONTRACTOR` |
| **Municipal Portal** | `kanish3@gmail.com` | `1234` | `MUNICIPAL_AUTHORITY` |

You can also log in using the standard test accounts:
* `citizen@roadsense.local` / `CitizenPass123!`
* `contractor@buildinfra.in` / `ContractorPass123!`
* `officer@pwd.gov.in` / `GovOfficerPass123!`

---

## 3. Provisioning a Custom Municipal Administrator

Run the safe provisioning CLI script:
```bash
node backend/express-api/src/scripts/provisionAdmin.js \
  --email=admin@pwd.gov.in \
  --password=StrongAdminPassword123! \
  --name="Executive Engineer" \
  --dept="Public Works Department"
```

---

## 4. Running the AI Computer Vision Service

1. Create a Python virtual environment:
   ```bash
   cd backend/ai-service
   python -m venv .venv
   .\.venv\Scripts\activate
   pip install -r requirements.txt
   ```
2. Start the FastAPI microservice:
   ```bash
   uvicorn app.main:app --reload --port 8001
   ```
   The service will be reachable at `http://localhost:8001`.
