# RoadSense Backend (Express)

Isolated Node.js and Express REST API backend service for the RoadSense platform.

## Overview

This service forms the backend foundation for the RoadSense target architecture (Option B). It provides:
- Core Express application structure with JSON body parsing and standardized 404/500 handlers.
- Health monitoring endpoint (`GET /api/health`).
- Mongoose MongoDB Atlas connection module (`src/config/db.js`) with fail-fast timeouts and sanitized logging.
- GeoJSON `Damage` model (`src/models/Damage.js`) with `2dsphere` spatial indexing.

## Requirements

- Node.js >= 18.0.0 (tested on Node v24.16.0)
- npm >= 9.0.0 (tested on npm 12.2.0)

## Setup & Installation

Navigate to the `backend-express` directory and install dependencies:

```bash
cd backend-express
npm install
```

Copy the example environment configuration:

```bash
cp .env.example .env
```

### MongoDB Atlas Configuration

In your local `.env` file, configure `MONGO_URI` with your MongoDB Atlas connection string. The expected format is:

```env
MONGO_URI=mongodb+srv://<username>:<password>@<cluster-hostname>/<database-name>?retryWrites=true&w=majority
```

> **Security Note:** Never commit your `.env` file or hardcode credentials into source files. The `.env` file is excluded from Git tracking via `.gitignore`.

## Running the Service

### Production Mode
```bash
npm start
```
Starts `src/server.js` directly with Node.js on port `5000` (or `PORT` defined in `.env`).

### Development Mode
```bash
npm run dev
```
Starts `src/server.js` using `nodemon` for automatic reload upon code changes.

### Running Tests
```bash
npm test
```
Runs the offline test suite using Node's built-in test runner (`node --test`). These tests validate schema constraints, GeoJSON coordinates, score bounds, and database connection error handling **offline without requiring Atlas credentials or a live database**.

## Available Endpoints

### 1. Health Check
- **URL:** `GET /api/health`
- **Status:** `200 OK`
- **Response Format:**
  ```json
  {
    "status": "ok",
    "service": "roadsense-backend",
    "timestamp": "2026-10-23T15:58:00.000Z"
  }
  ```

### 2. Unknown Routes (404)
- **URL:** Any undefined route
- **Status:** `404 Not Found`
- **Response Format:**
  ```json
  {
    "error": "Not found"
  }
  ```

### 3. Error Handling (500)
- **Status:** `500 Internal Server Error`
- **Response Format:**
  ```json
  {
    "error": "Internal server error"
  }
  ```
  *(Stack traces and internal exceptions are suppressed to prevent credential/information leakage).*

## GeoJSON Spatial Model & Validation

The `Damage` model (`src/models/Damage.js`) adheres to the GeoJSON format standard:
- `location.type`: Must be `"Point"`.
- `location.coordinates`: Array of two finite numbers in **`[longitude, latitude]`** order.
- Indexing: A `2dsphere` compound index is registered on `location` for proximity and geospatial queries.

### Coordinate Validation Limitation
Numeric boundary validation verifies that:
- Longitude falls between `-180` and `180`.
- Latitude falls between `-90` and `90`.

**Limitation:** If a client accidentally supplies coordinates inverted as `[latitude, longitude]` where *both* numbers happen to fall within the overlapping `[-90, 90]` range (for example `[12.9716, 77.5946]` instead of `[77.5946, 12.9716]`), numeric range validation cannot mathematically distinguish longitude from latitude. Applications should use explicit field names (`longitude`, `latitude`) in client-side forms prior to assembling the GeoJSON array.

## Current Scope & Limitations (Stage C)

- **Database:** Mongoose connection module and models are established; server listener does not force database connection on startup to permit isolated component development.
- **APIs:** Damage CRUD routes, spatial querying (`/api/damages`), and contractor routes are scheduled for Stage D.
- **Authentication:** JWT and user authentication middleware are scheduled for subsequent stages.
- **ML & Weather:** Integrations with the scikit-learn microservice and Open-Meteo are scheduled for subsequent stages.
