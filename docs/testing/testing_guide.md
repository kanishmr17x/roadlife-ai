# RoadLife AI — Testing Guide

RoadLife AI includes automated test suites covering backend API logic, schema validation, geospatial operations, frontend compilation, and computer vision preprocessing.

---

## 1. Running Backend Tests

The Express backend uses Node.js's native test runner (`node:test`) for zero-dependency, ultra-fast test execution.

From the repository root:
```bash
npm run backend:test
```
Or directly from `backend/express-api`:
```bash
cd backend/express-api
npm test
```

### Test Suites Included:
1. **`tests/auth.test.js`** (21 tests):
   - Valid credential verification for Citizen, Contractor, and Municipal Authority.
   - Portal role mismatch rejection with HTTP 403.
   - Prevention of self-assigned Municipal Authority / Admin roles on registration.
   - Contractor onboarding status gating (`PENDING_APPROVAL`).
   - Generic 401 response prevention of user enumeration attacks.
   - RBAC route protection across portals.
   - Development account authentication (`kanish1`, `kanish2`, `kanish3`).
2. **`tests/damageModel.test.js`** (9 tests):
   - Strict GeoJSON Point validation (`[longitude, latitude]`).
   - Boundary checks (longitude -180..180, latitude -90..90).
   - Validation of non-finite or malformed coordinate arrays.
   - `2dsphere` geospatial index verification.
   - Optional ML assessment and weather snapshot subschema tests.
3. **`tests/dbConfig.test.js`** (3 tests):
   - Connection module exports and lazy initialization.
   - Explicit error throwing when `MONGO_URI` is missing or whitespace.

---

## 2. Running Frontend Build & Type Validation

From the repository root:
```bash
npm run frontend:build
```
Or directly from `frontend`:
```bash
cd frontend
npm run build
```
This runs `tsc` (TypeScript compiler) and `vite build` to guarantee zero type errors and asset resolution.

---

## 3. Running All Tests Combined

From the repository root:
```bash
npm test
```
This sequentially executes the Express backend test suite followed by the Frontend production compilation.

---

## 4. Running AI Microservice Unit Tests

```bash
cd backend/ai-service
python -m pytest tests/test_inference.py -k "not test_api_predict_damage"
```
Validates:
* OpenCV image byte decoding and corruption handling.
* BoundingBox normalized and pixel coordinate constraints.
* Confidence range validation [0.0, 1.0].
* Heuristic severity mapping (pothole, alligator cracking, longitudinal cracking).
* Degraded status reporting when model weights are not loaded.
* YOLOv8 mocked inference pipeline with simulated tensor results.
