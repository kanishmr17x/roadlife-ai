# RoadLife AI — Deployment Guide

## 1. Containerized Production Deployment with Docker Compose

RoadLife AI includes production Docker configurations in `infrastructure/docker/` and a top-level `docker-compose.yml`.

### Architecture Services:
1. **`mongodb`**: MongoDB 7.0 database engine.
2. **`express-api`**: Node.js production service on port 5000.
3. **`ai-service`**: FastAPI Python / PyTorch computer vision microservice on port 8001.
4. **`frontend`**: Nginx web server serving compiled React application on port 5173 / 80.

### Starting Production Containers:
```bash
docker compose up -d --build
```

### Checking Container Health:
```bash
docker compose ps
docker compose logs -f express-api
```

---

## 2. Cloud Native Deployment Recommendations

### 2.1 Backend (Express API)
* Deploy to any Node.js container runner (AWS ECS, Google Cloud Run, Azure Container Apps, or Render).
* Set environment variables:
  - `MONGO_URI`: MongoDB Atlas connection string.
  - `JWT_SECRET`: High-entropy secret key.
  - `PORT`: 5000.
  - `NODE_ENV`: `production`.

### 2.2 AI Computer Vision Microservice (FastAPI)
* Deploy to a GPU-enabled container instance (e.g., AWS EC2 G4dn/G5, Google Cloud Run GPU, or RunPod).
* Ensure weights file `best.pt` is deployed in `app/models/road_damage/weights/best.pt` or downloaded from S3/GCS bucket during container entrypoint.

### 2.3 Frontend Application (React/Vite)
* Deploy static build output (`frontend/dist`) to a Global CDN (Vercel, Cloudflare Pages, Netlify, or AWS S3 + CloudFront).
* Set environment variable:
  - `VITE_API_BASE_URL`: URL of the deployed Express API (or configure reverse proxy to route `/api/*` to the Express backend).
