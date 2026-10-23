# RoadSense Backend (Express)

Isolated Node.js and Express REST API backend service for the RoadSense platform.

## Overview

This service forms the Stage B foundation for the RoadSense target architecture (Option B). It provides the core Express application structure, health monitoring endpoint, standardized JSON 404 responses, and safe error handling.

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

## Current Scope & Limitations (Stage B)

- **Database:** MongoDB / Mongoose connection is not yet active (scheduled for Stage C).
- **APIs:** Damage reporting, road management, and contractor routes are not yet implemented (scheduled for Stage D).
- **Authentication:** JWT and user authentication middleware are omitted in this baseline stage.
- **ML & Weather:** Integrations with the scikit-learn microservice and Open-Meteo are scheduled for subsequent stages.
