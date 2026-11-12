# RoadLife AI — Final Repository Structure Report

**Date:** 2026-11-12  
**Status:** Successfully Restructured  

---

## 1. High-Level Directory Overview

| Directory | Primary Responsibility | Primary Technologies | Execution Purpose |
|---|---|---|---|
| `frontend/` | Web application for Citizens, Contractors, and Municipal Officers | React 18, Vite 5, TypeScript 5, Tailwind CSS | Serves client UI on port 5173 (dev) or port 80 (prod) |
| `backend/express-api/` | Authoritative application backend, auth, RBAC, and data storage | Node.js 18+, Express 4.21, Mongoose 9.11 | Handles core business logic, users, and damages on port 5000 |
| `backend/ai-service/` | Road distress computer vision inference service | Python 3.10+, FastAPI, YOLOv8, PyTorch 2.1 | Serves `/predict/damage` inference on port 8001 |
| `ml/` | Training pipelines, datasets, notebooks, and model artifacts | Python 3.10+, Ultralytics YOLOv8 CLI | Offline/research training of road distress models |
| `infrastructure/` | Container definitions and deployment manifests | Docker, Docker Compose | Orchestrates MongoDB, Express, AI Service, and Frontend |
| `legacy-scaffold/` | Archived PostgreSQL/SQLAlchemy prototype files | Python, SQLAlchemy, Alembic | Preserved for historical and domain model reference |
| `docs/` | Comprehensive technical architecture and operations guides | Markdown | Full repository and API documentation |
| `scripts/` | Developer ergonomics and repo validation | Node.js, PowerShell, Bash | Development workflow automation (`dev.js`) |

---

## 2. Key Operational Verification

* **Root Test Suite**: `npm test` runs Express automated tests (33 tests pass) and Frontend production compilation (0 errors).
* **AI Microservice**: Verified image preprocessing, bounding box validations, and mocked YOLO inference.
* **Unified Development**: `npm run dev` (`node scripts/dev.js`) boots both `backend/express-api` and `frontend` concurrently.
