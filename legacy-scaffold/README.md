# RoadLife AI — Legacy Scaffold & Prototype Archive

## Archive Notice & Provenance

This directory contains the initial prototype scaffolding of RoadLife AI based on Python (FastAPI), SQLAlchemy, and PostgreSQL.

### Why this is quarantined:
1. **Authoritative Backend Migration**: During development, the primary application backend was transitioned to Node.js / Express with MongoDB Mongoose (`backend/express-api`), which contains the active data models, JWT authentication, RBAC middleware, and 33 passing automated test suites.
2. **Scaffold State**: 13 of 14 API routers and 15 services in this prototype were 1-line placeholder stubs returning `{"message": "Router placeholder for ..."}` or `class XService: pass`.
3. **Preservation**: In accordance with repository safety guidelines, this prototype is preserved for historical reference and to retain any domain schema definitions, rather than being deleted.
