# RoadLife AI — Project Instructions for Claude Code

## Project Overview

RoadLife AI is an intelligent civil infrastructure platform for public road lifecycle monitoring, AI road damage detection (potholes, fatigue cracking, surface distress), construction material visual verification (aggregates, bitumen, concrete, soil), smart repair planning (IRC standards & budget estimation), and contractor performance governance.

---

## Architectural Topology

| Service | Directory | Port | Tech Stack | Notes |
|---|---|---|---|---|
| **Authoritative Backend** | `backend/express-api/` | `5000` | Node.js 18+, Express, Mongoose, JWT, bcryptjs | Primary REST API. Connects to MongoDB Atlas or runs in resilient in-memory fallback mode. |
| **AI Vision Microservice** | `backend/ai-service/` | `8001` | Python 3.10+, FastAPI, Ultralytics YOLOv8, PyTorch, OpenCV | Computer vision service for defect detection and material assessment. |
| **Frontend Web Portal** | `frontend/` | `5173` | React 18, Vite 5, TypeScript 5, Tailwind CSS, Leaflet | Role-based portals: Citizen Observer, Contractor Operations, Municipal Authority. |
| **ML Training & Research**| `ml/` | — | PyTorch, Ultralytics, Jupyter | Offline model training pipelines for pavement distress and material quality. |

---

## Common Development Commands

### Monorepo Root
- **Start All Services**: `npm run dev` (Runs Express backend & Vite frontend concurrently via `scripts/dev.js`).
- **Run Full Test Suite**: `npm test` (Runs 44 Express tests + compiles Vite frontend).

### Backend (`backend/express-api/`)
- **Run Tests**: `npm test` (Executes 44 offline test suites with Node native test runner `node --test`).
- **Start Dev Server**: `npm run dev` (Runs with `nodemon` on port 5000).
- **Start Production**: `npm start` (Runs `node src/server.js`).

### Frontend (`frontend/`)
- **Start Dev Server**: `npm run dev` (Runs Vite on port 5173; proxies `/api/*` to `http://localhost:5000`).
- **Type-Check & Build**: `npm run build` (Runs `tsc && vite build`).

### AI Microservice (`backend/ai-service/`)
- **Run PyTest**: `python -m pytest tests` (Executes 18 automated inference & schema tests).
- **Start Service**: `uvicorn app.main:app --host 0.0.0.0 --port 8001 --reload`

---

## Critical Architecture & Coding Rules

1. **Database Resilience**:
   - The Express backend **must never crash** when MongoDB is disconnected or when `MONGO_URI` is omitted.
   - All Mongoose operations in routes/services check `mongoose.connection.readyState === 1` and seamlessly use in-memory collections when MongoDB is offline.
2. **Offline-Safe Tests**:
   - Automated tests in `backend/express-api/tests/` and `backend/ai-service/tests/` must execute **100% offline** without live cloud databases, external APIs, or GPU hardware.
3. **API Proxying**:
   - Frontend components never call `http://localhost:5000` or `http://localhost:8001` directly in client code; they use the relative path `/api/*`, which Vite proxies to Express.
   - Express proxies AI requests (`/api/damages/ai-detect`, `/api/materials/material-verify`) to the FastAPI microservice on port 8001.
4. **Security & Secrets**:
   - Never log connection strings, database URIs, passwords, or JWT secrets in application logs.
   - Never commit `.env` files or binary model weights (`.pt`) to Git.
5. **UI Design System**:
   - Follow the **Civic Field Notes** editorial design tokens: Warm Paper (`#F5F3EC`), Ledger Card (`#FFFEFA`), Primary Ink (`#252A24`), Municipal Forest Green (`#355844`).
