-- RoadLife AI PostGIS PostgreSQL Spatial Database Schema

CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT
);

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    role_id UUID REFERENCES roles(id),
    email VARCHAR(255) UNIQUE NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    phone_number VARCHAR(20),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE contractors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    company_name VARCHAR(150) NOT NULL,
    license_number VARCHAR(100) UNIQUE NOT NULL,
    contact_email VARCHAR(255),
    contact_phone VARCHAR(20),
    overall_performance_index NUMERIC(5,2) DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE roads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    road_code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(150) NOT NULL,
    district VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    lifecycle_stage VARCHAR(50) NOT NULL,
    path_geometry GEOMETRY(LineString, 4326),
    geofence_polygon GEOMETRY(Polygon, 4326),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE road_specifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    road_id UUID REFERENCES roads(id) ON DELETE CASCADE,
    length_km NUMERIC(8,2) NOT NULL,
    width_meters NUMERIC(5,2) NOT NULL,
    lanes INT DEFAULT 2,
    surface_type VARCHAR(50) NOT NULL,
    target_material_spec TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE construction_projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    road_id UUID REFERENCES roads(id),
    contractor_id UUID REFERENCES contractors(id),
    status VARCHAR(50) NOT NULL,
    start_date DATE,
    expected_completion_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE construction_stages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES construction_projects(id) ON DELETE CASCADE,
    stage_name VARCHAR(100) NOT NULL,
    sequence_order INT NOT NULL,
    status VARCHAR(50) NOT NULL
);

CREATE TABLE material_evidence (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    stage_id UUID REFERENCES construction_stages(id),
    photo_url TEXT NOT NULL,
    gps_location GEOMETRY(Point, 4326) NOT NULL,
    captured_at TIMESTAMP WITH TIME ZONE NOT NULL,
    ai_assessment_status VARCHAR(50) NOT NULL, -- MATCH | FLAG_FOR_INSPECTION
    ai_confidence NUMERIC(5,4),
    government_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE citizen_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    road_id UUID REFERENCES roads(id),
    citizen_id UUID REFERENCES users(id),
    description TEXT,
    photo_url TEXT NOT NULL,
    gps_location GEOMETRY(Point, 4326) NOT NULL,
    captured_at TIMESTAMP WITH TIME ZONE NOT NULL,
    status VARCHAR(50) DEFAULT 'SUBMITTED',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE damage_cases (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    report_id UUID REFERENCES citizen_reports(id),
    road_id UUID REFERENCES roads(id),
    status VARCHAR(50) DEFAULT 'OPEN',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE ai_damage_analysis (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    damage_case_id UUID REFERENCES damage_cases(id),
    detected_damage_type VARCHAR(50) NOT NULL,
    severity VARCHAR(20) NOT NULL,
    affected_area_sqm NUMERIC(8,2),
    confidence_score NUMERIC(5,4) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE repair_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    damage_case_id UUID REFERENCES damage_cases(id),
    estimated_material_kg NUMERIC(10,2) NOT NULL,
    estimated_workers INT NOT NULL,
    estimated_duration_hours NUMERIC(6,2) NOT NULL,
    recommended_start_date DATE,
    weather_safe BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE weather_forecasts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    location GEOMETRY(Point, 4326) NOT NULL,
    forecast_date DATE NOT NULL,
    precipitation_probability NUMERIC(5,2),
    temperature_celsius NUMERIC(5,2),
    is_construction_safe BOOLEAN DEFAULT TRUE
);

CREATE TABLE repair_tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    repair_plan_id UUID REFERENCES repair_plans(id),
    contractor_id UUID REFERENCES contractors(id),
    status VARCHAR(50) NOT NULL,
    scheduled_start TIMESTAMP WITH TIME ZONE,
    actual_completion TIMESTAMP WITH TIME ZONE
);

CREATE TABLE repair_completion (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    repair_task_id UUID REFERENCES repair_tasks(id),
    completion_photo_url TEXT NOT NULL,
    gps_location GEOMETRY(Point, 4326) NOT NULL,
    verified_by_government BOOLEAN DEFAULT FALSE,
    government_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE contractor_performance (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    contractor_id UUID REFERENCES contractors(id),
    overall_score NUMERIC(5,2) NOT NULL,
    material_quality_score NUMERIC(5,2) NOT NULL,
    ontime_repair_score NUMERIC(5,2) NOT NULL,
    durability_score NUMERIC(5,2) NOT NULL,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    title VARCHAR(150) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    action VARCHAR(100) NOT NULL,
    entity_name VARCHAR(100) NOT NULL,
    entity_id UUID,
    details JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
