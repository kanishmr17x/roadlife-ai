# RoadLife AI — Architecture Decision Records (ADRs)

---

## ADR 001: Selection of Express.js & MongoDB as the Authoritative Backend

* **Date**: 2026-11-12
* **Status**: Accepted
* **Context**: The repository originally contained two backend implementations: an unfinished Python FastAPI/PostgreSQL scaffold in `backend/` and a feature-complete Node.js Express/MongoDB implementation in `backend-express/`.
* **Decision**: Establish `backend/express-api/` as the sole authoritative application backend for RoadLife AI.
* **Consequences**:
  - Eliminates duplicate authentication and data persistence schemas.
  - Leverages MongoDB Mongoose 2dsphere indexing for high-performance geospatial queries.
  - Retains all 33 passing automated test suites without regressions.
  - Reserves Python and FastAPI strictly for the AI / Computer Vision inference microservice (`backend/ai-service/`).

---

## ADR 002: Modular Multi-Service Architecture

* **Date**: 2026-11-12
* **Status**: Accepted
* **Context**: RoadLife AI requires both web application serving, business logic processing, geospatial queries, and heavy computer vision deep learning inference.
* **Decision**: Adopt a multi-tier microservice architecture:
  - `frontend/`: React 18 + Vite 5 single-page application.
  - `backend/express-api/`: Authoritative business logic, auth, RBAC, and data storage.
  - `backend/ai-service/`: Asynchronous FastAPI service running Ultralytics YOLOv8 for road damage inference.
  - `ml/`: Dedicated workspace for offline research, dataset management, and model training.
* **Consequences**:
  - Clear separation of concerns between CPU/GPU-intensive AI inference and high-concurrency web API operations.
  - Distinct dependency boundaries (`npm` for web/api, `pip`/`conda` for deep learning).

---

## ADR 003: Safe Quarantine of Legacy Scaffolding

* **Date**: 2026-11-12
* **Status**: Accepted
* **Context**: Over 50 empty placeholder files existed in the original `backend/` scaffold. Permanently deleting them could risk losing domain model specifications or author intentions.
* **Decision**: Move the entire legacy scaffold to `legacy-scaffold/` with complete provenance notes instead of deleting it.
* **Consequences**:
  - Zero accidental data loss.
  - Clean, unpolluted production tree under `backend/`.
  - Fully reversible via Git history.
