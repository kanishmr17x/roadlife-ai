# RoadLife AI

> **AI-Driven GPS-Based Road Lifecycle, Construction Material Visual Verification, Road Damage Detection, Smart Repair Planning and Contractor Performance Management System**

---

## 📌 Project Overview

**RoadLife AI** is an end-to-end platform for monitoring the entire lifecycle of public road infrastructure. Rather than acting as a standard pothole reporting tool, **RoadLife AI** creates a **GPS-linked digital lifecycle and immutable evidence chain** for every registered road.

It connects:
- Pre-construction GPS road registration & specifications
- Construction stage material photo verification with GPS/geofence validation
- ML-based visual material assessment (**MATCH** / **FLAG_FOR_INSPECTION**)
- Crowdsourced citizen road damage reporting
- ML road damage detection (YOLO)
- AI-assisted repair planning (material, worker, duration estimation)
- Weather-aware repair scheduling
- Repair completion evidence verification
- Evidence-Based Contractor Performance Index
- Government oversight & analytics

---

## 🛠️ Technology Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend** | React, Vite, TypeScript, Tailwind CSS, React Router, Axios, Leaflet, OpenStreetMap, Recharts |
| **Backend** | Python, FastAPI, SQLAlchemy ORM, Pydantic, PostgreSQL + PostGIS, JWT Security |
| **AI / ML Service** | Python, PyTorch, YOLO, OpenCV, FastAPI Microservice |
| **Storage & Spatial** | PostGIS Spatial Database, Cloudinary / S3-compatible object storage |
| **External APIs** | OpenStreetMap API, Geolocation API, OpenWeatherMap API |
| **DevOps & Deployment** | Docker, Docker Compose, GitHub Actions CI |

---

## 📂 Project Structure Overview

```
roadlife-ai/
├── frontend/               # React + Vite + TypeScript Frontend App
├── backend/                # FastAPI Python Backend Service
├── ml-service/             # PyTorch/YOLO ML Inference Microservice
├── database/               # PostGIS Spatial Database DDL & Schema
├── docs/                   # Complete Architecture & System Docs
├── tests/                  # Monorepo Integration Test Suite
├── scripts/                # Utility & Database Seed Scripts
├── docker/                 # Service Dockerfiles
├── .github/                # CI Workflows
├── docker-compose.yml      # Orchestration Config
└── README.md
```

---

## 📄 License

MIT License.
