# RoadLife AI — Agent Guidelines & Architecture Rules

## System Overview

RoadLife AI is a modular intelligent civil infrastructure management platform:
- **Express Backend** (`backend/express-api/`): Port 5000, Mongoose MongoDB Atlas with resilient in-memory fallback, JWT auth, RBAC (Citizen, Contractor, Municipal Authority).
- **FastAPI AI Microservice** (`backend/ai-service/`): Port 8001, Ultralytics YOLOv8 object detection, OpenCV edge/cavity tracing, MoRTH/IRC material assessor.
- **React Frontend** (`frontend/`): Port 5173, React 18, Vite 5, TypeScript 5, Tailwind CSS, Leaflet GIS.

## Core Rules

1. **Keep Database Resilient**: The Express backend must gracefully operate in in-memory fallback mode if `MONGO_URI` is unset.
2. **Keep Tests Passing**: Monorepo tests (`npm test` and `pytest backend/ai-service/tests`) must remain 100% green without requiring live external network access.
3. **No Breaking Changes**: Never delete or rename active application components, routes, or services without verifying all dependents.
4. **Clean Commits**: Keep Git history atomic and avoid committing `.env` files, logs, or large model weight files (`.pt`).
