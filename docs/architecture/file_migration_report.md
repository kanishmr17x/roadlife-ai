# RoadLife AI — File Migration Report

**Date:** 2026-11-12  
**Migration Branch:** `refactor/repository-restructure`  
**Execution Method:** Atomic `git mv` (preserving 100% git history)  

---

## 1. Relocated Files & Directories

### 1.1 Authoritative Backend
| Original Path | New Path | Reason |
|---|---|---|
| `backend-express/` | `backend/express-api/` | Standardized modular backend structure under `backend/` |
| `backend-express/package.json` | `backend/express-api/package.json` | Updated workspace pointer in root `package.json` |
| `backend-express/src/**/*` | `backend/express-api/src/**/*` | Preserved all controller, model, route, middleware, and service logic |
| `backend-express/tests/**/*` | `backend/express-api/tests/**/*` | Preserved 33 passing automated tests |

### 1.2 Machine Learning & AI Microservices
| Original Path | New Path | Reason |
|---|---|---|
| `ml-service/app/` | `backend/ai-service/app/` | Groups active HTTP microservices under `backend/` |
| `ml-service/tests/` | `backend/ai-service/tests/` | Colocates test suites with inference microservice |
| `ml-service/Dockerfile` | `backend/ai-service/Dockerfile` | Self-contained microservice container definition |
| `ml-service/requirements.txt` | `backend/ai-service/requirements.txt` | Microservice dependency manifest |
| `ml-service/training/` | `ml/training/` | Separates training pipelines from inference service |
| `ml-service/datasets/` | `ml/datasets/` | Separates training data manifests from inference service |
| `ml-service/notebooks/` | `ml/notebooks/` | Separates research notebooks from production code |

### 1.3 Infrastructure & Docker
| Original Path | New Path | Reason |
|---|---|---|
| `docker/` | `infrastructure/docker/` | Consolidates container infrastructure under `infrastructure/` |
| `docker/Dockerfile.backend` | `infrastructure/docker/Dockerfile.backend` | Preserved legacy container definition |
| `docker/Dockerfile.frontend` | `infrastructure/docker/Dockerfile.frontend` | Production frontend container definition |
| `docker/Dockerfile.ml` | `infrastructure/docker/Dockerfile.ml` | Production ML container definition |
| `[New File]` | `infrastructure/docker/Dockerfile.express` | Production Express container definition |

### 1.4 Legacy Prototype Quarantine
| Original Path | New Path | Reason |
|---|---|---|
| `backend/` (FastAPI/SQLAlchemy) | `legacy-scaffold/` | Quarantines 50+ empty 1-line placeholder stubs from active runtime |
| `database/schema.sql` | `legacy-scaffold/database/schema.sql` | Archives PostgreSQL DDL schema |
| `tests/integration/test_system_flow.py` | `legacy-scaffold/root-tests/integration/test_system_flow.py` | Archives 5-line placeholder test |
| `scripts/seed_db.py` | `legacy-scaffold/scripts/seed_db.py` | Archives 8-line placeholder seed script |
| `scripts/setup_dev.sh` | `legacy-scaffold/scripts/setup_dev.sh` | Archives 5-line placeholder setup script |

---

## 2. Updated Configuration Files

1. **`package.json` (Root)**:
   - Updated `workspaces` from `["frontend", "backend-express"]` to `["frontend", "backend/express-api"]`.
   - Updated scripts: `dev:backend`, `backend:dev`, `backend:start`, `backend:test`.
   - Added root `test` script running both Express tests and frontend build.
2. **`scripts/dev.js`**:
   - Updated backend path resolution from `'backend-express'` to `path.join('backend', 'express-api')`.
3. **`docker-compose.yml`**:
   - Replaced unused `postgres` service with `mongodb` (`mongo:7.0`).
   - Wired `express-api` on port 5000 connected to MongoDB.
   - Wired `ai-service` on port 8001.
   - Wired `frontend` on port 5173.
