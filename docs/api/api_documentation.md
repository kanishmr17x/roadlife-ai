# RoadLife AI — REST API Documentation

## Base URLs
* **Application Backend (Express)**: `http://localhost:5000/api`
* **AI Computer Vision Service (FastAPI)**: `http://localhost:8001`

---

## 1. Application Backend Endpoints (`backend/express-api`)

### 1.1 Health & Status
* **`GET /api/health`**
  - **Description**: Verifies backend service status.
  - **Response (200 OK)**:
    ```json
    {
      "status": "ok",
      "service": "roadsense-backend",
      "timestamp": "2026-11-12T14:45:00.000Z"
    }
    ```

### 1.2 Authentication Endpoints
* **`POST /api/auth/login`**
  - **Description**: Authenticates user credentials with role/portal verification.
  - **Request Body**:
    ```json
    {
      "email": "citizen@roadsense.local",
      "password": "CitizenPass123!",
      "portalRole": "CITIZEN"
    }
    ```
  - **Response (200 OK)**:
    ```json
    {
      "message": "Authentication successful",
      "token": "eyJhbGciOiJIUzI1NiIsIn...",
      "user": {
        "id": "usr-cit-101",
        "email": "citizen@roadsense.local",
        "fullName": "Priya Sharma (Citizen Inspector)",
        "role": "CITIZEN",
        "status": "ACTIVE"
      }
    }
    ```
  - **Error Responses**:
    - `400 Bad Request`: Missing email or password.
    - `401 Unauthorized`: Invalid credentials.
    - `403 Forbidden`: Account pending approval, suspended, or portal role mismatch.

* **`POST /api/auth/register`**
  - **Description**: Public registration for Citizens; onboarding application for Contractors.
  - **Request Body (Citizen)**:
    ```json
    {
      "email": "new.citizen@example.com",
      "password": "SecurePassword123!",
      "fullName": "New Citizen",
      "role": "CITIZEN",
      "phone": "+91 91234 56789"
    }
    ```
  - **Request Body (Contractor)**:
    ```json
    {
      "email": "contact@infra.com",
      "password": "SecurePassword123!",
      "fullName": "Director Infra",
      "role": "CONTRACTOR",
      "companyName": "Infra Build Ltd.",
      "licenseNumber": "LIC-2026-990",
      "phone": "+91 91234 56780"
    }
    ```

* **`GET /api/auth/me`**
  - **Headers**: `Authorization: Bearer <token>`
  - **Response (200 OK)**: Returns the authenticated user session profile.

* **`POST /api/auth/logout`**
  - **Response (200 OK)**: `{ "message": "Session closed successfully" }`

### 1.3 Role-Protected Resource Endpoints
* **`GET /api/citizen/reports`**
  - **Access**: `CITIZEN`, `MUNICIPAL_AUTHORITY`, `ADMIN`
* **`GET /api/contractor/projects`**
  - **Access**: `CONTRACTOR`, `MUNICIPAL_AUTHORITY`, `ADMIN`
* **`GET /api/government/audit-logs`**
  - **Access**: `MUNICIPAL_AUTHORITY`, `ADMIN` strictly

---

## 2. AI Inference Endpoints (`backend/ai-service`)

### 2.1 Readiness
* **`GET /`**
  - **Response (200 OK)**:
    ```json
    {
      "service": "RoadLife AI - ML Microservice",
      "status": "ready",
      "model_ready": true,
      "device": "cuda:0"
    }
    ```
  - *(Returns `"status": "degraded"` and `"model_ready": false` if weights are missing)*

### 2.2 Damage Detection
* **`POST /predict/damage`**
  - **Content-Type**: `multipart/form-data` (file) or raw binary image.
  - **Response (200 OK)**:
    ```json
    {
      "status": "success",
      "model_name": "best.pt",
      "device_used": "cuda:0",
      "inference_time_ms": 14.2,
      "image_width": 1920,
      "image_height": 1080,
      "total_detections": 1,
      "detections": [
        {
          "class_id": 0,
          "class_name": "pothole",
          "confidence": 0.92,
          "bbox": {
            "x_min": 450.0,
            "y_min": 620.0,
            "x_max": 680.0,
            "y_max": 810.0,
            "width": 230.0,
            "height": 190.0,
            "x_min_norm": 0.2344,
            "y_min_norm": 0.5741,
            "x_max_norm": 0.3542,
            "y_max_norm": 0.7500
          },
          "severity": "HIGH"
        }
      ]
    }
    ```
