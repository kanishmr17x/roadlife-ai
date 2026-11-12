# RoadLife AI — Repository Structure Guide

```text
ROADLIFE-AI/
├── frontend/                               # React 18 + Vite + TypeScript Frontend Application
│   ├── public/                             # Static public assets (favicons, icons)
│   ├── src/                                # Application source code
│   │   ├── components/                     # Reusable UI component library
│   │   │   ├── charts/                     # DamageAnalyticsChart, PerformanceChart
│   │   │   ├── common/                     # Button, Card, Modal, Input, Badge, StatCard
│   │   │   ├── complaints/                 # ComplaintCard, ComplaintStatusBadge
│   │   │   ├── construction/               # EvidenceGallery, StageTracker
│   │   │   ├── damage/                     # DamageReportsList
│   │   │   ├── forms/                      # DamageReportForm, MaterialEvidenceForm, RoadForm
│   │   │   ├── layout/                     # Navbar, Sidebar, Footer, PortalModuleView
│   │   │   ├── map/                        # MapView, DamageMarkerMap, RoadGeofenceMap
│   │   │   ├── notifications/              # NotificationBadge, NotificationList
│   │   │   ├── performance/                # ContractorRatingCard, PerformanceIndexScore
│   │   │   ├── repair/                     # DamageDetailsModal, RepairTaskCard
│   │   │   └── tables/                     # DataTable, RoadsTable, ContractorsTable
│   │   ├── config/                         # Environment & theme configuration (env.ts, theme.ts)
│   │   ├── constants/                      # Enums & constants (roles.ts, routes.ts, status.ts)
│   │   ├── context/                        # React Context providers (AuthContext, NotificationContext)
│   │   ├── hooks/                          # Custom React hooks (useAuth, useGeolocation, useNotifications)
│   │   ├── layouts/                        # Base layouts (MainLayout, AuthLayout)
│   │   ├── mocks/                          # Local seed & demo fixtures (seedData.ts)
│   │   ├── pages/                          # Role-based route view pages
│   │   │   ├── auth/                       # LoginPage, RegisterPage, UnauthorizedPage
│   │   │   ├── citizen/                    # Citizen portal pages (Dashboard, Report, MyReports, etc.)
│   │   │   ├── contractor/                 # Contractor portal pages (Dashboard, Roads, Evidence, etc.)
│   │   │   └── government/                 # Municipal Authority pages (Dashboard, Monitoring, etc.)
│   │   ├── routes/                         # Route engine (AppRoutes, ProtectedRoute, RoleRoute)
│   │   ├── services/                       # API integration layer (apiClient, authService, damageService, etc.)
│   │   ├── styles/                         # Styling & Tailwind directives (globals.css)
│   │   ├── types/                          # TypeScript type definitions (user, damage, road, etc.)
│   │   ├── utils/                          # Utility helpers (formatters.ts, geo.ts)
│   │   ├── validations/                    # Input validations (authValidation, reportValidation, roadValidation)
│   │   ├── App.tsx                         # App component root
│   │   └── main.tsx                        # DOM entry point
│   ├── package.json                        # Frontend dependencies & build scripts
│   ├── tailwind.config.ts                  # Tailwind configuration
│   ├── tsconfig.json                       # TypeScript compiler configuration
│   └── vite.config.ts                      # Vite build & proxy configuration (/api -> :5000)
│
├── backend/                                # Backend Services
│   ├── express-api/                        # Production Express & Mongoose API
│   │   ├── src/
│   │   │   ├── config/db.js                # MongoDB connection management & event binding
│   │   │   ├── middleware/auth.js          # JWT authentication & RBAC middleware
│   │   │   ├── models/User.js              # User schema, password hashing, dev accounts
│   │   │   ├── models/Damage.js            # Damage schema, GeoJSON 2dsphere, ML/weather
│   │   │   ├── routes/authRoutes.js        # /api/auth/login, register, me, logout
│   │   │   ├── routes/resourceRoutes.js    # Role-gated endpoints for Citizen, Contractor, Government
│   │   │   ├── scripts/provisionAdmin.js   # CLI utility to provision Municipal Authority accounts
│   │   │   ├── services/userService.js     # User data service with in-memory test fallback
│   │   │   ├── app.js                      # Express application setup
│   │   │   └── server.js                   # HTTP server entry point (:5000)
│   │   ├── tests/                          # 33 passing automated tests (node:test)
│   │   │   ├── auth.test.js                # 21 authentication & RBAC tests
│   │   │   ├── damageModel.test.js         # 9 GeoJSON & validation tests
│   │   │   └── dbConfig.test.js            # 3 database configuration tests
│   │   ├── .env.example                    # Sample environment file
│   │   └── package.json                    # Backend dependencies & test scripts
│   │
│   └── ai-service/                         # FastAPI AI Computer Vision Inference Microservice
│       ├── app/
│       │   ├── config.py                   # Service configuration & device resolution
│       │   ├── inference/damage_inference.py # YOLOv8 DamageDetector & severity heuristics
│       │   ├── preprocessing/image_preprocessing.py # OpenCV binary image decoding
│       │   ├── schemas/damage.py           # Pydantic schemas (BoundingBox, Severity, Response)
│       │   └── main.py                     # FastAPI application endpoints (:8001)
│       ├── tests/                          # ML unit & inference test suite
│       ├── requirements.txt                # Python dependencies (PyTorch, Ultralytics, OpenCV)
│       ├── Dockerfile                      # Container definition
│       └── README.md                       # Microservice documentation
│
├── ml/                                     # Machine Learning Research, Training & Datasets
│   ├── datasets/                           # YOLO datasets (git-ignored manifests)
│   ├── notebooks/                          # Exploratory Jupyter notebooks
│   ├── training/                           # Training CLI scripts (road_damage/train.py)
│   └── README.md                           # ML workflows documentation
│
├── infrastructure/                         # Deployment & Container Infrastructure
│   ├── docker/                             # Dockerfiles
│   │   ├── Dockerfile.express              # Node.js production image
│   │   ├── Dockerfile.frontend             # Nginx static production image
│   │   ├── Dockerfile.ml                   # Python/CUDA ML microservice image
│   │   └── Dockerfile.backend              # Legacy backend container
│   ├── deployment/                         # Cloud deployment manifests
│   └── docker-compose.yml                  # Root Compose orchestration
│
├── legacy-scaffold/                        # [QUARANTINE] Archived Python/Postgres Prototype
│   ├── alembic/                            # Alembic migration configuration
│   ├── app/                                # 50+ stub models, routers, schemas
│   ├── database/schema.sql                 # PostgreSQL DDL schema
│   ├── root-tests/                         # Placeholder root integration test
│   ├── scripts/                            # Placeholder seed/setup scripts
│   └── README.md                           # Documentation on migration to Express/MongoDB
│
├── docs/                                   # Complete Technical Documentation
│   ├── architecture/                       # System, repository, audit, and decision docs
│   ├── api/                                # API documentation
│   ├── development/                        # Setup guides
│   ├── testing/                            # Testing guides & validation reports
│   └── deployment/                         # Deployment guides
│
├── scripts/                                # Repository Automation
│   ├── dev.js                              # Unified development server launcher (Express + Vite)
│   └── validate-*.ps1 / .sh                # Validation scripts
│
├── .gitignore                              # Git exclusion rules
├── .env.example                            # Sample root environment file
├── package.json                            # Root workspace definition
└── README.md                               # Project entry documentation
```
