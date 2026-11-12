# RoadLife AI

> **AI-Driven GPS-Based Road Lifecycle, Construction Material Visual Verification, Road Damage Detection, Smart Repair Planning and Contractor Performance Management System**

---

## 📌 Project Overview

**RoadLife AI** is an end-to-end intelligent platform for monitoring public road infrastructure throughout its entire lifecycle. The system provides a digital, GPS-linked evidence chain connecting citizen defect observations, computer-vision damage detection, contractor repair operations, and municipal governance.

### Core Capabilities:
- **Crowdsourced Citizen Damage Reporting**: GPS-tagged photo reporting with automated location geofencing.
- **Computer Vision Damage Detection**: Automated localization of potholes, alligator cracks, and linear fractures via Ultralytics YOLOv8.
- **Damage Severity Assessment**: Heuristic rules calculating defect severity (`LOW`, `MEDIUM`, `HIGH`, `CRITICAL`) from visual footprint.
- **Contractor Work Order Lifecycle**: Work order assignment, material capture, and repair completion verification.
- **Municipal Authority Oversight**: Comprehensive audit logging, contractor performance tracking, and analytics dashboards.

---

## 🛠️ Technology Stack

| Component | Technologies |
|---|---|
| **Frontend Web App** | React 18, Vite 5, TypeScript 5, Tailwind CSS 3, Leaflet, Recharts, Lucide Icons |
| **Authoritative Backend** | Node.js 18+, Express 4.21, Mongoose 9.11, MongoDB Atlas, bcryptjs, JWT |
| **Computer Vision Microservice** | Python 3.10+, FastAPI, Ultralytics YOLOv8, PyTorch 2.1, OpenCV Headless |
| **ML Training & Research** | Python 3.10+, YOLOv8 CLI, Jupyter Notebooks |
| **Infrastructure & DevOps** | Docker, Docker Compose, GitHub Actions CI |

---

## 📂 Repository Structure

```text
ROADLIFE-AI/
├── frontend/                       # React 18 + Vite + TypeScript Frontend
│   ├── src/
│   │   ├── components/             # Reusable UI component library (cards, maps, tables)
│   │   ├── pages/                  # Role-based portals (Citizen, Contractor, Municipal)
│   │   ├── routes/                 # AppRoutes & RoleRoute RBAC route guards
│   │   ├── services/               # API clients (apiClient, authService, damageService)
│   │   ├── context/                # AuthContext & NotificationContext
│   │   └── types/                  # TypeScript domain models & interfaces
│   └── vite.config.ts              # Vite proxy configuration (/api -> :5000)
│
├── backend/                        # Backend Services
│   ├── express-api/                # Authoritative Express & MongoDB API (Port 5000)
│   │   ├── src/config/             # Database connection & events
│   │   ├── src/middleware/         # JWT authentication & requireRole RBAC
│   │   ├── src/models/             # Mongoose User and Damage (GeoJSON 2dsphere) schemas
│   │   ├── src/routes/             # authRoutes (/login, /register, /me) & resourceRoutes
│   │   ├── src/services/           # User service with in-memory fallback
│   │   └── tests/                  # 33 passing automated test suites (node:test)
│   │
│   └── ai-service/                 # FastAPI Computer Vision Microservice (Port 8001)
│       ├── app/inference/          # YOLOv8 DamageDetector & severity heuristics
│       ├── app/preprocessing/      # OpenCV binary image decoding
│       ├── app/schemas/            # Pydantic contracts (BoundingBox, Severity)
│       └── tests/                  # ML unit & mock inference tests
│
├── ml/                             # Machine Learning Research & Training
│   ├── datasets/                   # YOLO dataset manifests
│   ├── training/                   # Ultralytics training pipeline CLI
│   └── notebooks/                  # Exploratory notebooks
│
├── infrastructure/                 # Containerization & Deployment
│   ├── docker/                     # Dockerfile.express, Dockerfile.frontend, Dockerfile.ml
│   └── docker-compose.yml          # Compose orchestration (MongoDB + Express + AI + Web)
│
├── legacy-scaffold/                # Archived early PostgreSQL/FastAPI prototype
├── docs/                           # Comprehensive technical documentation
│   ├── architecture/               # System architecture, audit, and ADRs
│   ├── api/                        # REST API endpoint documentation
│   ├── development/                # Setup & configuration guide
│   ├── testing/                    # Test suites & post-restructure validation report
│   └── deployment/                 # Cloud deployment instructions
│
├── scripts/                        # Repository Automation
│   └── dev.js                      # Unified concurrent dev server runner
│
├── package.json                    # Monorepo workspaces definition
└── README.md
```

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
In `backend/express-api/.env`:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/roadlife_db
JWT_SECRET=roadlife-ai-development-secret-jwt-key-2026
NODE_ENV=development
```

### 3. Launch Development Environment
```bash
npm run dev
```
* **Express Backend**: `http://localhost:5000`
* **Vite Frontend**: `http://localhost:5173`

---

## 🧪 Automated Testing

Run the full monorepo test suite (Express backend tests + Frontend TypeScript build):
```bash
npm test
```

### Development Test Accounts:
| Role | Email | Password |
|---|---|---|
| **Citizen** | `kanish1@gmail.com` | `1234` |
| **Contractor** | `kanish2@gmail.com` | `1234` |
| **Municipal Authority** | `kanish3@gmail.com` | `1234` |

---

## 📚 Documentation Links
* [System Architecture](docs/architecture/system_architecture.md)
* [Repository Audit Report](docs/architecture/repository_structure_audit.md)
* [Architecture Decision Records (ADRs)](docs/architecture/architecture_decisions.md)
* [REST API Documentation](docs/api/api_documentation.md)
* [Development Setup Guide](docs/development/setup_guide.md)
* [Testing Guide](docs/testing/testing_guide.md)
* [Post-Restructure Validation](docs/testing/post_restructure_validation.md)
