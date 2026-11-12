# RoadLife AI — System Architecture

**Document Version:** 2.0.0  
**Date:** 2026-11-12  
**Status:** Approved & Active Architecture  

---

## 1. System Overview

RoadLife AI is an end-to-end multi-tier intelligent infrastructure lifecycle management system designed for public road quality observation, automated computer vision distress analysis, contractor work order assignment, and municipal oversight.

```
+-------------------------------------------------------------------------+
|                              USER CLIENTS                               |
|   +-------------------+  +--------------------+  +------------------+   |
|   |  Citizen Portal   |  | Contractor Portal  |  | Municipal Portal |   |
|   +---------+---------+  +---------+----------+  +--------+---------+   |
|             |                      |                      |             |
|             +----------------------+----------------------+             |
|                                    |                                    |
|                       Vite Web Single Page App                          |
|                       React 18 / TypeScript 5                           |
|                       Port 5173 (Dev) / Port 80 (Prod)                  |
+------------------------------------+------------------------------------+
                                     |
                                     | HTTP REST (Bearer JWT Auth)
                                     v
+-------------------------------------------------------------------------+
|                   APPLICATION BACKEND (Authoritative)                   |
|                   Express.js REST API (Port 5000)                       |
|                                                                         |
|   +--------------------+  +--------------------+  +-----------------+   |
|   | Auth & RBAC Engine |  | Geospatial Damage  |  | Role Gateways   |   |
|   | bcryptjs / JWT     |  | 2dsphere GeoJSON   |  | Citizen/Con/Gov |   |
|   +---------+----------+  +---------+----------+  +--------+--------+   |
|             |                       |                      |            |
|             v                       v                      v            |
|   +-----------------------------------------------------------------+   |
|   |                   Mongoose ODM Data Layer                       |   |
|   +---------------------------------+-------------------------------+   |
+-------------------------------------+-----------------------------------+
                                      |
                   +------------------+------------------+
                   |                                     |
                   v                                     v
+------------------------------------+ +----------------------------------+
|           DATA STORAGE             | |       AI / ML MICROSERVICE       |
|           MongoDB Atlas            | |     FastAPI Engine (Port 8001)   |
|   - Users & Credentials            | |                                  |
|   - Damages & GeoJSON 2dsphere     | |   - YOLOv8 Object Detection      |
|   - In-Memory Test Store Fallback  | |   - Damage Severity Heuristics   |
|                                    | |   - OpenCV Preprocessing         |
+------------------------------------+ +----------------------------------+
```

---

## 2. Key Architecture Pillars

### 2.1 Authoritative Backend (`backend/express-api`)
* **Framework**: Node.js 18+ with Express 4.21.
* **Database**: MongoDB (Mongoose 9.11) storing users, roles, damage incidents, geospatial coordinates, and audit entries.
* **Authentication & Authorization**:
  - Stateless JSON Web Tokens (24h validity).
  - Bcrypt password hashing (10 salt rounds).
  - Strict role-based access control (RBAC) supporting `CITIZEN`, `CONTRACTOR`, `MUNICIPAL_AUTHORITY`, `GOVERNMENT`, and `ADMIN`.
* **Geospatial Processing**:
  - Standard GeoJSON `Point` coordinate representation (`[longitude, latitude]`).
  - High-performance `2dsphere` spatial indexing for proximity queries and geofencing.

### 2.2 Frontend Client (`frontend`)
* **Framework**: React 18 with Vite 5 and TypeScript 5.
* **UI/UX**: Tailwind CSS 3, Lucide React icons, Leaflet interactive mapping, and Recharts analytics.
* **Network & Proxying**:
  - `vite.config.ts` proxies `/api` to `http://localhost:5000`.
  - Seamless fallback architecture: if the backend is temporarily offline during transit, damage reporting falls back to local storage and demo fixtures without UI disruption.

### 2.3 AI / Computer Vision Microservice (`backend/ai-service`)
* **Framework**: Python 3.10+ with FastAPI.
* **Computer Vision Engine**: Ultralytics YOLOv8 object detection with PyTorch 2.1.
* **Capabilities**: Detects road distresses (potholes, longitudinal cracking, transverse cracking, alligator cracking), returns pixel & normalized bounding boxes, category confidences, and heuristic severity classifications (`LOW`, `MEDIUM`, `HIGH`, `CRITICAL`).

### 2.4 ML Training & Research (`ml`)
* **Pipelines**: Ultralytics YOLOv8 training CLI (`ml/training/road_damage/train.py`).
* **Datasets**: YOLO-formatted dataset manifests (`ml/datasets/road_damage/`).
