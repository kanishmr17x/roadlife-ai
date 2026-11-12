# RoadSense Backend (Express)

Node.js and Express REST API backend service for the RoadSense / RoadLife AI platform.

## Overview

This service forms the authoritative application backend for RoadLife AI. It provides:
- Core Express application structure with JSON body parsing, CORS, and standardized 404/500 error handlers.
- Health monitoring endpoint (`GET /api/health`) reporting service and MongoDB connection state.
- Resilient Mongoose MongoDB connection module (`src/config/db.js`) with fail-fast 5s connection timeouts and automatic in-memory fallback.
- Role-Based Access Control (RBAC) & JWT authentication (`/api/auth/*`) with support for Citizen, Contractor, and Municipal Authority roles.
- GeoJSON `Damage` model (`src/models/Damage.js`) with `2dsphere` spatial indexing.
- Geospatial queries (`GET /api/damages/nearby`) and CRUD operations.
- Computer Vision AI proxy endpoints (`POST /api/damages/ai-detect` and `POST /api/materials/material-verify`) with resilient fallback.

## Requirements

- Node.js >= 18.0.0 (tested on Node v24.16.0)
- npm >= 9.0.0 (tested on npm 12.2.0)
- MongoDB Atlas cluster OR local MongoDB instance (optional; operates seamlessly in in-memory fallback mode)

## Setup & Installation

Navigate to the `backend/express-api` directory and install dependencies:

```bash
cd backend/express-api
npm install
```

Copy the example environment configuration:

```bash
cp .env.example .env
```

### MongoDB Configuration

In your `.env` file, configure `MONGO_URI` with your MongoDB Atlas or local connection string:

```env
# MongoDB Atlas
MONGO_URI=mongodb+srv://<username>:<password>@<cluster-hostname>/<database-name>?retryWrites=true&w=majority

# Local Docker MongoDB
# MONGO_URI=mongodb://localhost:27017/roadlife_db
```

> **Note on Resilient Fallback:** If `MONGO_URI` is omitted or unavailable, the backend gracefully falls back to an in-memory storage map with zero crashes. All API routes remain fully operational for development and local testing.

## Running the Service

### Production Mode
```bash
npm start
```
Starts `src/server.js` directly on port `5000` (or `PORT` defined in `.env`).

### Development Mode
```bash
npm run dev
```
Starts `src/server.js` using `nodemon` for automatic reload on code changes.

### Running Tests
```bash
npm test
```
Runs the 44-test offline test suite using Node's native test runner (`node --test`). These tests validate schema constraints, GeoJSON coordinates, score bounds, RBAC permissions, and database connection handling **offline without requiring network access or live credentials**.

## API Endpoints

### 1. Health Monitoring
- **`GET /api/health`**
  - Status: `200 OK`
  - Response:
    ```json
    {
      "status": "ok",
      "service": "roadsense-backend",
      "database": "connected" | "in_memory_fallback",
      "timestamp": "2026-11-12T16:58:00.000Z"
    }
    ```

### 2. Authentication & RBAC (`/api/auth`)
- **`POST /api/auth/login`**: Authenticate with email, password, and optional target portal role.
- **`POST /api/auth/register`**: Register a new Citizen account.
- **`POST /api/auth/contractor/apply`**: Submit contractor registration and onboarding credentials (enters `PENDING_APPROVAL`).
- **`GET /api/auth/me`**: Retrieve current user profile from JWT Bearer token.

### 3. Damage Reports & Geospatial API (`/api/damages`)
- **`GET /api/damages`**: Retrieve list of all damage reports.
- **`POST /api/damages`**: Submit a new road defect report with GeoJSON `Point` coordinates.
- **`GET /api/damages/:id`**: Retrieve single report by ID.
- **`GET /api/damages/nearby?lng=...&lat=...&maxDistance=...`**: Geospatial radius query.
- **`POST /api/damages/ai-detect`**: Run automated YOLOv8 / OpenCV distress detection on base64 image.

### 4. Material Quality Verification (`/api/materials`)
- **`POST /api/materials/material-verify`**: Assess road construction material quality (aggregates, bitumen, concrete, soil) against MoRTH/IRC specifications.
