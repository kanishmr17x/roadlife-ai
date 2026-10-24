# RoadSense Frontend (RoadLife AI)

Production-ready, responsive road infrastructure intelligence and road damage monitoring platform built with React 18, Vite 5, TypeScript, Tailwind CSS, and Leaflet.

---

## 📌 Architectural Overview

RoadSense is an end-to-end platform for monitoring public road infrastructure lifecycle, crowdsourced citizen damage reporting, smart repair planning, and evidence-based contractor performance management.

### Key Functional Areas
1. **Damage Monitoring Dashboard (`/citizen/dashboard` or `/`)**:
   - Executive KPIs (Total Incidents, Critical Defects, Active Repairs, Estimated Budget).
   - Interactive GIS Leaflet map with OpenStreetMap tiles and custom SVG severity pins.
   - Severity & distress breakdown charts with AI repair budget calculations.
   - Comprehensive audit list with search, filter, and dossier inspection.
2. **Interactive Damage Map (`/government/roads/map`)**:
   - Multi-marker GIS layer plotting GeoJSON Point coordinates `[longitude, latitude]`.
   - Severity filtering (Critical, High, Medium, Low).
   - Rich popups with distress type, coordinates, and detail inspection modals.
3. **Validated Damage Reporting Form (`/citizen/report`)**:
   - Field-level validation for title, description, category, and severity.
   - GPS coordinate boundary validation (-90° to 90° latitude, -180° to 180° longitude).
   - Browser Geolocation API ("Use My Location") and interactive map click-to-pin coordinate picker.
   - Optional photographic evidence preview.
4. **Contractor Operations Portal (`/contractor/dashboard`)**:
   - Dispatched repair work orders.
   - Microclimate weather advisory widget (precipitation risk & asphalt paving window).
   - Post-compaction completion evidence submission with geofence verification.
   - Evidence-Based Contractor Performance Index (CPI) score.
5. **Government Oversight Portal (`/government/dashboard`)**:
   - Infrastructure asset registry and corridor lifecycle management.
   - Contractor compliance audits and statutory RTI change log trail.

---

## 🎨 Visual Identity & Design Tokens: "Civic Field Notes"

The RoadSense frontend utilizes the **Civic Field Notes** editorial design language: a tactile, physical municipal ledger aesthetic inspired by survey notebooks, public works records, and civil engineering specifications.

- **Brand Name**: RoadSense
- **Supporting Label**: Civic Field Notes • Infrastructure Lifecycle
- **Surface Palette**:
  - Warm Paper background: `#F5F3EC`
  - Crisp Surface card: `#FFFEFA`
  - Primary Ink text: `#252A24`
  - Secondary Ink text: `#6F726A`
  - Stone Grey borders: `#D8D7CE`
- **Municipal Accents**:
  - Forest Green (Primary CTA & verified states): `#355844`
  - Muted Olive & Soft Sage (Tags & subtle badges): `#78846A`, `#E5EADF`
  - Terracotta (Contractor & Work orders): `#B9684D`
- **Distress & Severity System**:
  - `CRITICAL`: Dark Crimson (`#A9423B`)
  - `HIGH`: Terracotta (`#B9684D`)
  - `MEDIUM`: Restrained Amber (`#C48B32`)
  - `LOW`: Forest Green (`#355844`)
- **Typography**:
  - Serif: `Georgia, Cambria, serif` (Headings & editorial titles)
  - Sans: `Inter, system-ui, sans-serif` (Body & controls)
  - Mono: `ui-monospace, monospace` (Tabular numbers, GPS coordinates, Tender codes)

---

## 🔌 API Integration Boundary & Target Architecture

The frontend is aligned with the **RoadSense Target Architecture (Option B / Express Backend)**:

- **Express Server Port**: `http://localhost:5000`
- **Frontend Port**: `http://localhost:5173`
- **Proxy Configuration**: `vite.config.ts` transparently proxies `/api/*` to `http://localhost:5000` to avoid browser CORS restrictions.
- **Live Health Endpoint**: The frontend continuously monitors `GET /api/health` via `<HealthStatusPill />`. When the Express service is running, the green "Express API: Active" indicator illuminates.
- **Stage C / Stage D Endpoint Alignment**:
  - `GET /api/health`: **Operational** (Express Stage C baseline).
  - `GET /api/damages` & `POST /api/damages`: **Scheduled for Stage D**. When these routes return `404` or the backend is offline, the frontend automatically and seamlessly falls back to the typed local development store (`src/mocks/seedData.ts` & browser `localStorage`) with an explicit **Demo Data** / **Offline Mode** indicator.
  - Zero invented data is falsely claimed to be live or verified.

---

## 🚀 Running and Building

### Development Server
```bash
npm run dev
```
Accessible at [http://localhost:5173](http://localhost:5173).

### Production Build
```bash
npm run build
```
Executes TypeScript type checking (`tsc`) followed by Vite production bundling into `dist/`.

### Run Preview
```bash
npm run preview
```

---

## 🛡️ Safety & Backup Reference

Verified, recoverable backups were created outside the project root prior to implementation:
- **Baseline Backup**: `E:\project\road\roadlife-ai-frontend-pre-ui-backup` (130 files)
- **Pre-Civic Redesign Backup**: `E:\project\road\roadlife-ai-frontend-pre-civic-backup` (142 files)
