export interface ColumnDef {
  name: string;
  type: string;
  constraints: string;
  description: string;
}

export interface TableDef {
  id: string;
  name: string;
  description: string;
  category: "core" | "recruitment" | "operations" | "security" | "telemetry" | "clinical";
  columns: ColumnDef[];
}

export interface ApiEndpointItem {
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  path: string;
  summary: string;
  auth: string;
  category: string;
  requestBody?: string;
  responseBody: string;
  curlExample: string;
}

export interface DatabaseBlueprint {
  domainId: string;
  domainTitle: string;
  tables: TableDef[];
  erdDiagram: string;
  ddlSchema: string;
  apiCategories: string[];
  apiSpecifications: ApiEndpointItem[];
  apiEndpoints?: ApiEndpointItem[];
  metrics: {
    tableCount: string;
    apiCount: string;
    multiTenancy: string;
    compliance: string;
  };
}

import { isHealthcareDomain, isProjectManagementDomain } from "./domain-classifier";

// ─────────────────────────────────────────────────────────────────────────────
// 1. HR & RECRUITMENT SERVICES (TalentCraft Default)
// ─────────────────────────────────────────────────────────────────────────────
export const HR_DATABASE_TABLES: TableDef[] = [
  {
    id: "organizations",
    name: "organizations",
    description: "Multi-tenant company accounts with subscription tiers and domain isolation.",
    category: "core",
    columns: [
      { name: "id", type: "UUID", constraints: "PRIMARY KEY DEFAULT gen_random_uuid()", description: "Unique tenant identifier" },
      { name: "name", type: "VARCHAR(255)", constraints: "NOT NULL", description: "Organization legal name" },
      { name: "slug", type: "VARCHAR(64)", constraints: "UNIQUE NOT NULL", description: "URL slug and subdomain prefix" },
      { name: "plan", type: "VARCHAR(32)", constraints: "DEFAULT 'enterprise'", description: "Subscription tier (starter, pro, enterprise)" },
      { name: "settings", type: "JSONB", constraints: "DEFAULT '{}'", description: "Tenant-level workspace customization settings" },
      { name: "created_at", type: "TIMESTAMPTZ", constraints: "DEFAULT NOW()", description: "Record creation timestamp" },
    ],
  },
  {
    id: "candidates",
    name: "candidates",
    description: "Candidate profiles extracted from resumes, enriched with AI match scores and status.",
    category: "recruitment",
    columns: [
      { name: "id", type: "UUID", constraints: "PRIMARY KEY DEFAULT gen_random_uuid()", description: "Unique candidate ID" },
      { name: "org_id", type: "UUID", constraints: "REFERENCES organizations(id) ON DELETE CASCADE", description: "Tenant isolation foreign key" },
      { name: "full_name", type: "VARCHAR(255)", constraints: "NOT NULL", description: "Candidate display name" },
      { name: "email", type: "VARCHAR(255)", constraints: "NOT NULL", description: "Contact email address" },
      { name: "phone", type: "VARCHAR(50)", constraints: "NULL", description: "Phone number with country code" },
      { name: "role", type: "VARCHAR(128)", constraints: "NOT NULL", description: "Current or applied job title" },
      { name: "experience_years", type: "NUMERIC(4,1)", constraints: "DEFAULT 0", description: "Total professional experience in years" },
      { name: "skills", type: "TEXT[]", constraints: "DEFAULT '{}'", description: "Array of extracted and validated technical skills" },
      { name: "current_ctc", type: "VARCHAR(64)", constraints: "NULL", description: "Current Compensation per Annum" },
      { name: "expected_ctc", type: "VARCHAR(64)", constraints: "NULL", description: "Expected Compensation per Annum" },
      { name: "notice_period", type: "VARCHAR(64)", constraints: "DEFAULT 'Immediate'", description: "Notice duration (Immediate, 15d, 30d, 60d)" },
      { name: "ai_score", type: "NUMERIC(3,2)", constraints: "CHECK (ai_score BETWEEN 0 AND 5)", description: "AI qualification rating from 1.00 to 5.00" },
      { name: "pipeline_stage", type: "VARCHAR(32)", constraints: "DEFAULT 'Applied'", description: "Stage: Applied, Screening, Interview, Offered, Hired" },
      { name: "status", type: "VARCHAR(32)", constraints: "DEFAULT 'Active'", description: "Active or Archived" },
      { name: "created_at", type: "TIMESTAMPTZ", constraints: "DEFAULT NOW()", description: "Application submission timestamp" },
    ],
  },
  {
    id: "candidate_custom_fields",
    name: "candidate_custom_fields",
    description: "Dynamic attributes configured inside Solution Studio Customizer.",
    category: "recruitment",
    columns: [
      { name: "id", type: "UUID", constraints: "PRIMARY KEY DEFAULT gen_random_uuid()", description: "Custom field value ID" },
      { name: "candidate_id", type: "UUID", constraints: "REFERENCES candidates(id) ON DELETE CASCADE", description: "Parent candidate reference" },
      { name: "field_key", type: "VARCHAR(64)", constraints: "NOT NULL", description: "Machine identifier for the attribute" },
      { name: "field_label", type: "VARCHAR(128)", constraints: "NOT NULL", description: "User-facing label (e.g., Security Clearance)" },
      { name: "field_type", type: "VARCHAR(32)", constraints: "NOT NULL", description: "Data type (text, number, boolean, select)" },
      { name: "field_value", type: "TEXT", constraints: "NULL", description: "Stored attribute value" },
      { name: "updated_at", type: "TIMESTAMPTZ", constraints: "DEFAULT NOW()", description: "Last modified timestamp" },
    ],
  },
  {
    id: "clients",
    name: "clients",
    description: "Corporate hiring partners with portal permissions, SLAs, and dedicated contacts.",
    category: "operations",
    columns: [
      { name: "id", type: "UUID", constraints: "PRIMARY KEY DEFAULT gen_random_uuid()", description: "Client organization ID" },
      { name: "org_id", type: "UUID", constraints: "REFERENCES organizations(id) ON DELETE CASCADE", description: "Tenant foreign key" },
      { name: "company_name", type: "VARCHAR(255)", constraints: "NOT NULL", description: "Client business name" },
      { name: "contact_person", type: "VARCHAR(128)", constraints: "NOT NULL", description: "Primary HR or department manager" },
      { name: "contact_email", type: "VARCHAR(255)", constraints: "NOT NULL", description: "Notification and portal login email" },
      { name: "billing_rate_hourly", type: "NUMERIC(10,2)", constraints: "DEFAULT 0.00", description: "Agreed hourly billing rate" },
      { name: "portal_access_enabled", type: "BOOLEAN", constraints: "DEFAULT TRUE", description: "Whether client can access candidate shortlists" },
      { name: "created_at", type: "TIMESTAMPTZ", constraints: "DEFAULT NOW()", description: "Client onboarding timestamp" },
    ],
  },
  {
    id: "attendance_punches",
    name: "attendance_punches",
    description: "Cryptographic check-in/out logs powering consultant timesheets and invoicing.",
    category: "operations",
    columns: [
      { name: "id", type: "UUID", constraints: "PRIMARY KEY DEFAULT gen_random_uuid()", description: "Unique punch event ID" },
      { name: "org_id", type: "UUID", constraints: "REFERENCES organizations(id) ON DELETE CASCADE", description: "Tenant foreign key" },
      { name: "candidate_id", type: "UUID", constraints: "REFERENCES candidates(id) ON DELETE CASCADE", description: "Consultant employee ID" },
      { name: "client_id", type: "UUID", constraints: "REFERENCES clients(id) ON DELETE SET NULL", description: "Assigned client placement" },
      { name: "punch_in", type: "TIMESTAMPTZ", constraints: "NOT NULL", description: "Timestamp consultant started work" },
      { name: "punch_out", type: "TIMESTAMPTZ", constraints: "NULL", description: "Timestamp consultant concluded work" },
      { name: "billable_hours", type: "NUMERIC(6,2)", constraints: "DEFAULT 0.00", description: "Calculated elapsed billable hours" },
      { name: "geo_latitude", type: "NUMERIC(9,6)", constraints: "NULL", description: "GPS verification latitude" },
      { name: "geo_longitude", type: "NUMERIC(9,6)", constraints: "NULL", description: "GPS verification longitude" },
      { name: "is_verified", type: "BOOLEAN", constraints: "DEFAULT TRUE", description: "Anti-fraud validation check" },
    ],
  },
  {
    id: "audit_logs",
    name: "audit_logs",
    description: "Immutable security ledger for GDPR, DPDP compliance, and SOC 2 audits.",
    category: "security",
    columns: [
      { name: "id", type: "BIGSERIAL", constraints: "PRIMARY KEY", description: "Monotonically increasing sequence ID" },
      { name: "org_id", type: "UUID", constraints: "NOT NULL", description: "Tenant reference" },
      { name: "actor_id", type: "UUID", constraints: "NOT NULL", description: "User or API key triggering the action" },
      { name: "action", type: "VARCHAR(64)", constraints: "NOT NULL", description: "Action name: CANDIDATE_PROMOTED, PUNCH_IN, EXPORT_CSV" },
      { name: "entity_type", type: "VARCHAR(64)", constraints: "NOT NULL", description: "Target entity table" },
      { name: "entity_id", type: "UUID", constraints: "NULL", description: "Target entity ID" },
      { name: "ip_address", type: "INET", constraints: "NULL", description: "Client network address" },
      { name: "payload_diff", type: "JSONB", constraints: "DEFAULT '{}'", description: "Before-and-after change diff" },
      { name: "created_at", type: "TIMESTAMPTZ", constraints: "DEFAULT NOW()", description: "Audit event timestamp" },
    ],
  },
];

export const HR_DDL_SCHEMA = `-- ==========================================================
-- BizzMitra-AI Multi-Tenant Enterprise PostgreSQL Schema
-- Target: PostgreSQL 16+ with Row-Level Security (RLS)
-- ==========================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "btree_gist";

-- 1. Organizations / Tenants
CREATE TABLE IF NOT EXISTS organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(64) UNIQUE NOT NULL,
    plan VARCHAR(32) NOT NULL DEFAULT 'enterprise',
    settings JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Candidates
CREATE TABLE IF NOT EXISTS candidates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    role VARCHAR(128) NOT NULL,
    experience_years NUMERIC(4, 1) NOT NULL DEFAULT 0.0,
    skills TEXT[] NOT NULL DEFAULT '{}',
    current_ctc VARCHAR(64),
    expected_ctc VARCHAR(64),
    notice_period VARCHAR(64) NOT NULL DEFAULT 'Immediate',
    ai_score NUMERIC(3, 2) CHECK (ai_score >= 0.0 AND ai_score <= 5.0),
    pipeline_stage VARCHAR(32) NOT NULL DEFAULT 'Applied',
    status VARCHAR(32) NOT NULL DEFAULT 'Active',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Solution Studio Custom Attributes
CREATE TABLE IF NOT EXISTS candidate_custom_fields (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    candidate_id UUID NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
    field_key VARCHAR(64) NOT NULL,
    field_label VARCHAR(128) NOT NULL,
    field_type VARCHAR(32) NOT NULL,
    field_value TEXT,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(candidate_id, field_key)
);

-- 4. Corporate Clients
CREATE TABLE IF NOT EXISTS clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    company_name VARCHAR(255) NOT NULL,
    contact_person VARCHAR(128) NOT NULL,
    contact_email VARCHAR(255) NOT NULL,
    billing_rate_hourly NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    portal_access_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Smart Attendance Punch Clock
CREATE TABLE IF NOT EXISTS attendance_punches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    candidate_id UUID NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
    client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
    punch_in TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    punch_out TIMESTAMPTZ,
    billable_hours NUMERIC(6, 2) NOT NULL DEFAULT 0.00,
    geo_latitude NUMERIC(9, 6),
    geo_longitude NUMERIC(9, 6),
    is_verified BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. Tamper-evident Audit Ledger
CREATE TABLE IF NOT EXISTS audit_logs (
    id BIGSERIAL PRIMARY KEY,
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    actor_id UUID NOT NULL,
    action VARCHAR(64) NOT NULL,
    entity_type VARCHAR(64) NOT NULL,
    entity_id UUID,
    ip_address INET,
    payload_diff JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Performance Indexes
CREATE INDEX IF NOT EXISTS idx_candidates_org_stage ON candidates(org_id, pipeline_stage);
CREATE INDEX IF NOT EXISTS idx_candidates_ai_score ON candidates(ai_score DESC);
CREATE INDEX IF NOT EXISTS idx_attendance_candidate ON attendance_punches(candidate_id, punch_in DESC);
CREATE INDEX IF NOT EXISTS idx_audit_org_created ON audit_logs(org_id, created_at DESC);

-- Multi-Tenant Row Level Security (RLS)
ALTER TABLE candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidate_custom_fields ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance_punches ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation_candidates ON candidates
    FOR ALL USING (org_id = current_setting('app.current_org_id')::UUID);

CREATE POLICY tenant_isolation_attendance ON attendance_punches
    FOR ALL USING (org_id = current_setting('app.current_org_id')::UUID);
`;

export const HR_ERD_DIAGRAM = `erDiagram
    ORGANIZATIONS ||--o{ CANDIDATES : "has many"
    ORGANIZATIONS ||--o{ CLIENTS : "onboards"
    ORGANIZATIONS ||--o{ ATTENDANCE_PUNCHES : "tracks"
    ORGANIZATIONS ||--o{ AUDIT_LOGS : "audits"

    CANDIDATES ||--o{ CANDIDATE_CUSTOM_FIELDS : "extended by"
    CANDIDATES ||--o{ ATTENDANCE_PUNCHES : "logs"

    CLIENTS ||--o{ ATTENDANCE_PUNCHES : "billed for"

    ORGANIZATIONS {
        uuid id PK
        string name
        string slug UK
        string plan
        jsonb settings
        timestamptz created_at
    }

    CANDIDATES {
        uuid id PK
        uuid org_id FK
        string full_name
        string email
        string role
        numeric experience_years
        numeric ai_score
        string pipeline_stage
        string status
    }

    CANDIDATE_CUSTOM_FIELDS {
        uuid id PK
        uuid candidate_id FK
        string field_key
        string field_label
        string field_type
        text field_value
    }

    CLIENTS {
        uuid id PK
        uuid org_id FK
        string company_name
        string contact_person
        string contact_email
        numeric billing_rate_hourly
        boolean portal_access_enabled
    }

    ATTENDANCE_PUNCHES {
        uuid id PK
        uuid org_id FK
        uuid candidate_id FK
        uuid client_id FK
        timestamptz punch_in
        timestamptz punch_out
        numeric billable_hours
        boolean is_verified
    }

    AUDIT_LOGS {
        bigserial id PK
        uuid org_id FK
        uuid actor_id
        string action
        string entity_type
        uuid entity_id
        timestamptz created_at
    }
`;

export const HR_API_SPECIFICATIONS: ApiEndpointItem[] = [
  {
    method: "GET",
    path: "/api/v1/candidates",
    summary: "Retrieve filtered list of candidate profiles with AI scores and stages",
    auth: "Bearer JWT",
    category: "Recruitment",
    responseBody: `{\n  "data": [\n    {\n      "id": "cnd_01j78ab",\n      "fullName": "Priya Sharma",\n      "role": "Senior React Engineer",\n      "aiScore": 4.8,\n      "pipelineStage": "Interview",\n      "skills": ["React", "TypeScript", "Node.js"]\n    }\n  ],\n  "total": 48,\n  "page": 1\n}`,
    curlExample: `curl -X GET "https://api.bizzmitra.ai/v1/candidates?stage=Interview" \\\n  -H "Authorization: Bearer YOUR_API_KEY"`,
  },
  {
    method: "POST",
    path: "/api/v1/candidates",
    summary: "Create and score candidate profile with automatic resume parsing",
    auth: "Bearer JWT",
    category: "Recruitment",
    requestBody: `{\n  "fullName": "Amit Verma",\n  "email": "amit.v@example.com",\n  "role": "Full Stack Developer",\n  "skills": ["React", "Go", "PostgreSQL"],\n  "expectedCtc": "22 LPA",\n  "noticePeriod": "30 Days"\n}`,
    responseBody: `{\n  "success": true,\n  "candidate": {\n    "id": "cnd_02k91zx",\n    "aiScore": 4.6,\n    "pipelineStage": "Screening",\n    "status": "Active"\n  }\n}`,
    curlExample: `curl -X POST "https://api.bizzmitra.ai/v1/candidates" \\\n  -H "Authorization: Bearer YOUR_API_KEY" \\\n  -H "Content-Type: application/json" \\\n  -d '{"fullName":"Amit Verma","email":"amit@example.com","role":"Full Stack Developer"}'`,
  },
  {
    method: "PUT",
    path: "/api/v1/candidates/{id}/stage",
    summary: "Transition candidate between Kanban pipeline stages with automated triggers",
    auth: "Bearer JWT",
    category: "Recruitment",
    requestBody: `{\n  "pipelineStage": "Client Review",\n  "note": "AI match score 4.8 exceeds client threshold"\n}`,
    responseBody: `{\n  "success": true,\n  "candidateId": "cnd_01j78ab",\n  "newStage": "Client Review",\n  "notificationSent": true\n}`,
    curlExample: `curl -X PUT "https://api.bizzmitra.ai/v1/candidates/cnd_01j78ab/stage" \\\n  -H "Authorization: Bearer YOUR_API_KEY" \\\n  -H "Content-Type: application/json" \\\n  -d '{"pipelineStage":"Client Review"}'`,
  },
  {
    method: "POST",
    path: "/api/v1/attendance/punch",
    summary: "Log real-time consultant punch in/out with geolocation and timestamp verification",
    auth: "Bearer JWT",
    category: "Operations",
    requestBody: `{\n  "candidateId": "cnd_01j78ab",\n  "action": "punch_in",\n  "latitude": 28.6139,\n  "longitude": 77.2090\n}`,
    responseBody: `{\n  "status": "active",\n  "punchInTime": "2026-09-12T09:00:00Z",\n  "verified": true\n}`,
    curlExample: `curl -X POST "https://api.bizzmitra.ai/v1/attendance/punch" \\\n  -H "Authorization: Bearer YOUR_API_KEY" \\\n  -H "Content-Type: application/json" \\\n  -d '{"candidateId":"cnd_01j78ab","action":"punch_in"}'`,
  },
  {
    method: "GET",
    path: "/api/v1/attendance/timesheets/export",
    summary: "Generate and export billing timesheet CSV for corporate client reconciliation",
    auth: "Bearer JWT",
    category: "Operations",
    responseBody: `[CSV attachment streamed with headers candidate_id, hours, date, client]`,
    curlExample: `curl -X GET "https://api.bizzmitra.ai/v1/attendance/timesheets/export?month=2026-09" \\\n  -H "Authorization: Bearer YOUR_API_KEY" \\\n  --output timesheets-sept-2026.csv`,
  },
  {
    method: "GET",
    path: "/api/v1/client-portal/shortlists",
    summary: "External client API to view shortlisted candidates ready for interview approval",
    auth: "Client Token",
    category: "Client Portal",
    responseBody: `{\n  "client": "Nexus Enterprises",\n  "shortlists": [\n    {\n      "candidateId": "cnd_01j78ab",\n      "fullName": "Priya Sharma",\n      "role": "Senior React Engineer",\n      "aiScore": 4.8,\n      "interviewStatus": "Awaiting Approval"\n    }\n  ]\n}`,
    curlExample: `curl -X GET "https://api.bizzmitra.ai/v1/client-portal/shortlists" \\\n  -H "X-Client-Token: client_live_8912739"`,
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// 2. CLEAN TECH & SOLAR ENERGY
// ─────────────────────────────────────────────────────────────────────────────
export const SOLAR_DATABASE_TABLES: TableDef[] = [
  {
    id: "solar_plants",
    name: "solar_plants",
    description: "Utility and commercial solar installations with grid interconnect metadata.",
    category: "core",
    columns: [
      { name: "id", type: "UUID", constraints: "PRIMARY KEY DEFAULT gen_random_uuid()", description: "Plant unique identifier" },
      { name: "name", type: "VARCHAR(255)", constraints: "NOT NULL", description: "Facility legal name (e.g. Thar Desert Solar 1)" },
      { name: "capacity_mw", type: "NUMERIC(8,2)", constraints: "NOT NULL", description: "Rated peak generation capacity in Megawatts" },
      { name: "grid_operator", type: "VARCHAR(64)", constraints: "NOT NULL", description: "Regional grid interconnect entity (PJM, ISO-NE, etc.)" },
      { name: "geo_latitude", type: "NUMERIC(9,6)", constraints: "NOT NULL", description: "Plant centroid latitude" },
      { name: "geo_longitude", type: "NUMERIC(9,6)", constraints: "NOT NULL", description: "Plant centroid longitude" },
      { name: "created_at", type: "TIMESTAMPTZ", constraints: "DEFAULT NOW()", description: "Commissioning date" },
    ],
  },
  {
    id: "solar_inverters",
    name: "solar_inverters",
    description: "Inverter hardware assets tracking string voltage, rated KW, and firmware status.",
    category: "telemetry",
    columns: [
      { name: "id", type: "UUID", constraints: "PRIMARY KEY DEFAULT gen_random_uuid()", description: "Inverter unique hardware ID" },
      { name: "plant_id", type: "UUID", constraints: "REFERENCES solar_plants(id) ON DELETE CASCADE", description: "Associated solar facility" },
      { name: "serial_number", type: "VARCHAR(64)", constraints: "UNIQUE NOT NULL", description: "Hardware manufacturer serial number" },
      { name: "rated_kw", type: "NUMERIC(6,2)", constraints: "NOT NULL", description: "Rated inverter capacity in KW" },
      { name: "status", type: "VARCHAR(32)", constraints: "DEFAULT 'Online'", description: "Status: Online, Warning, Tripped, Maintenance" },
      { name: "firmware_version", type: "VARCHAR(32)", constraints: "NOT NULL", description: "Active firmware build with IEEE 1547 profile" },
      { name: "last_ping_at", type: "TIMESTAMPTZ", constraints: "DEFAULT NOW()", description: "Latest MQTT telemetry timestamp" },
    ],
  },
  {
    id: "inverter_telemetry",
    name: "inverter_telemetry",
    description: "High-frequency sub-second time-series hypertable tracking voltage, amps, and temp.",
    category: "telemetry",
    columns: [
      { name: "time", type: "TIMESTAMPTZ", constraints: "NOT NULL", description: "Timestamp of reading (TimescaleDB partition key)" },
      { name: "inverter_id", type: "UUID", constraints: "REFERENCES solar_inverters(id) ON DELETE CASCADE", description: "Source inverter" },
      { name: "dc_voltage", type: "NUMERIC(6,2)", constraints: "NOT NULL", description: "Input direct current voltage" },
      { name: "dc_amperage", type: "NUMERIC(6,2)", constraints: "NOT NULL", description: "Input direct current amperage" },
      { name: "ac_power_kw", type: "NUMERIC(6,2)", constraints: "NOT NULL", description: "Output active grid power in KW" },
      { name: "temp_celsius", type: "NUMERIC(5,2)", constraints: "NOT NULL", description: "Internal heatsink temperature" },
      { name: "efficiency_pct", type: "NUMERIC(4,2)", constraints: "NOT NULL", description: "DC to AC conversion efficiency ratio" },
    ],
  },
  {
    id: "arc_fault_incidents",
    name: "arc_fault_incidents",
    description: "AI-tripped thermal and micro-arc safety incidents requiring field intervention.",
    category: "operations",
    columns: [
      { name: "id", type: "UUID", constraints: "PRIMARY KEY DEFAULT gen_random_uuid()", description: "Incident tracking ID" },
      { name: "inverter_id", type: "UUID", constraints: "REFERENCES solar_inverters(id) ON DELETE CASCADE", description: "Affected inverter" },
      { name: "severity", type: "VARCHAR(32)", constraints: "NOT NULL", description: "Critical, High, Medium, Low" },
      { name: "peak_temp_celsius", type: "NUMERIC(5,2)", constraints: "NOT NULL", description: "Maximum temperature reached during runaway" },
      { name: "auto_isolated", type: "BOOLEAN", constraints: "DEFAULT TRUE", description: "Whether breaker tripped automatically" },
      { name: "detected_at", type: "TIMESTAMPTZ", constraints: "DEFAULT NOW()", description: "Detection timestamp" },
      { name: "resolved_at", type: "TIMESTAMPTZ", constraints: "NULL", description: "Field resolution timestamp" },
    ],
  },
  {
    id: "field_work_orders",
    name: "field_work_orders",
    description: "PWA work orders dispatched to technicians with geofenced mobile navigation.",
    category: "operations",
    columns: [
      { name: "id", type: "UUID", constraints: "PRIMARY KEY DEFAULT gen_random_uuid()", description: "Work order ID" },
      { name: "incident_id", type: "UUID", constraints: "REFERENCES arc_fault_incidents(id) ON DELETE CASCADE", description: "Triggering incident" },
      { name: "technician_name", type: "VARCHAR(128)", constraints: "NOT NULL", description: "Assigned field engineer" },
      { name: "replacement_part_sku", type: "VARCHAR(64)", constraints: "NULL", description: "Replaced diode / PCB module SKU" },
      { name: "bluetooth_verified", type: "BOOLEAN", constraints: "DEFAULT FALSE", description: "On-site Bluetooth diagnostic pass handshake" },
      { name: "dispatched_at", type: "TIMESTAMPTZ", constraints: "DEFAULT NOW()", description: "Dispatch timestamp" },
      { name: "completed_at", type: "TIMESTAMPTZ", constraints: "NULL", description: "Completion timestamp" },
    ],
  },
];

export const SOLAR_DDL_SCHEMA = `-- ==========================================================
-- SolarPulse Clean Tech PostgreSQL 16+ TimescaleDB Schema
-- ==========================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. Solar Plants
CREATE TABLE IF NOT EXISTS solar_plants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    capacity_mw NUMERIC(8, 2) NOT NULL,
    grid_operator VARCHAR(64) NOT NULL,
    geo_latitude NUMERIC(9, 6) NOT NULL,
    geo_longitude NUMERIC(9, 6) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Inverters
CREATE TABLE IF NOT EXISTS solar_inverters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    plant_id UUID NOT NULL REFERENCES solar_plants(id) ON DELETE CASCADE,
    serial_number VARCHAR(64) UNIQUE NOT NULL,
    rated_kw NUMERIC(6, 2) NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'Online',
    firmware_version VARCHAR(32) NOT NULL,
    last_ping_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Telemetry Time-Series Hypertable
CREATE TABLE IF NOT EXISTS inverter_telemetry (
    time TIMESTAMPTZ NOT NULL,
    inverter_id UUID NOT NULL REFERENCES solar_inverters(id) ON DELETE CASCADE,
    dc_voltage NUMERIC(6, 2) NOT NULL,
    dc_amperage NUMERIC(6, 2) NOT NULL,
    ac_power_kw NUMERIC(6, 2) NOT NULL,
    temp_celsius NUMERIC(5, 2) NOT NULL,
    efficiency_pct NUMERIC(4, 2) NOT NULL
);

-- 4. Arc Fault Incidents
CREATE TABLE IF NOT EXISTS arc_fault_incidents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    inverter_id UUID NOT NULL REFERENCES solar_inverters(id) ON DELETE CASCADE,
    severity VARCHAR(32) NOT NULL,
    peak_temp_celsius NUMERIC(5, 2) NOT NULL,
    auto_isolated BOOLEAN NOT NULL DEFAULT TRUE,
    detected_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    resolved_at TIMESTAMPTZ
);

-- 5. Field Work Orders
CREATE TABLE IF NOT EXISTS field_work_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    incident_id UUID NOT NULL REFERENCES arc_fault_incidents(id) ON DELETE CASCADE,
    technician_name VARCHAR(128) NOT NULL,
    replacement_part_sku VARCHAR(64),
    bluetooth_verified BOOLEAN NOT NULL DEFAULT FALSE,
    dispatched_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_telemetry_inverter_time ON inverter_telemetry(inverter_id, time DESC);
CREATE INDEX IF NOT EXISTS idx_incidents_active ON arc_fault_incidents(resolved_at) WHERE resolved_at IS NULL;
`;

export const SOLAR_ERD_DIAGRAM = `erDiagram
    SOLAR_PLANTS ||--o{ SOLAR_INVERTERS : "monitors"
    SOLAR_INVERTERS ||--o{ INVERTER_TELEMETRY : "streams"
    SOLAR_INVERTERS ||--o{ ARC_FAULT_INCIDENTS : "triggers"
    ARC_FAULT_INCIDENTS ||--o{ FIELD_WORK_ORDERS : "dispatches"

    SOLAR_PLANTS {
        uuid id PK
        string name
        numeric capacity_mw
        string grid_operator
        numeric geo_latitude
        numeric geo_longitude
    }

    SOLAR_INVERTERS {
        uuid id PK
        uuid plant_id FK
        string serial_number UK
        numeric rated_kw
        string status
        string firmware_version
    }

    INVERTER_TELEMETRY {
        timestamptz time
        uuid inverter_id FK
        numeric dc_voltage
        numeric dc_amperage
        numeric ac_power_kw
        numeric temp_celsius
        numeric efficiency_pct
    }

    ARC_FAULT_INCIDENTS {
        uuid id PK
        uuid inverter_id FK
        string severity
        numeric peak_temp_celsius
        boolean auto_isolated
        timestamptz detected_at
    }

    FIELD_WORK_ORDERS {
        uuid id PK
        uuid incident_id FK
        string technician_name
        string replacement_part_sku
        boolean bluetooth_verified
        timestamptz dispatched_at
    }
`;

export const SOLAR_API_SPECIFICATIONS: ApiEndpointItem[] = [
  {
    method: "GET",
    path: "/api/v1/inverters/telemetry/live",
    summary: "High-frequency telemetry stream of live voltage, temperature & harmonic yield",
    auth: "X-Device-Cert mTLS",
    category: "Telemetry",
    responseBody: `{\n  "inverterId": "inv_04_north",\n  "voltage": 542.4,\n  "amperage": 18.2,\n  "tempCelsius": 52.4,\n  "efficiency": 98.6,\n  "status": "Nominal"\n}`,
    curlExample: `curl -X GET "https://api.bizzmitra.ai/v1/inverters/telemetry/live" \\\n  -H "X-Device-Token: inv_live_491823"`,
  },
  {
    method: "POST",
    path: "/api/v1/inverters/{id}/trip-breaker",
    summary: "Safety emergency breaker trip to isolate overheating inverter array in < 50ms",
    auth: "Operator JWT",
    category: "Safety Control",
    requestBody: `{\n  "reason": "Thermal spike above 75C detected by AI"\n}`,
    responseBody: `{\n  "success": true,\n  "isolated": true,\n  "breakerTrippedAt": "2026-09-22T14:22:04Z"\n}`,
    curlExample: `curl -X POST "https://api.bizzmitra.ai/v1/inverters/inv_04/trip-breaker" \\\n  -H "Authorization: Bearer OPERATOR_KEY"`,
  },
  {
    method: "POST",
    path: "/api/v1/work-orders/dispatch",
    summary: "Dispatch geofenced technician PWA with turn-by-turn navigation & replacement SKU",
    auth: "Operator JWT",
    category: "Operations",
    requestBody: `{\n  "incidentId": "inc_9012",\n  "technicianId": "tech_vikram_p",\n  "priority": "Critical"\n}`,
    responseBody: `{\n  "workOrderId": "wo_48129",\n  "status": "Dispatched",\n  "technicianEtaMins": 8\n}`,
    curlExample: `curl -X POST "https://api.bizzmitra.ai/v1/work-orders/dispatch" \\\n  -H "Authorization: Bearer OPERATOR_KEY" \\\n  -d '{"incidentId":"inc_9012"}'`,
  },
  {
    method: "GET",
    path: "/api/v1/grid/generation-yield",
    summary: "Hourly MWh export generation records for ISO-NE / PJM settlement",
    auth: "Grid Token",
    category: "Compliance",
    responseBody: `{\n  "dailyYieldMwh": 38.4,\n  "curtailmentLoss": 0.8,\n  "settlementInr": 428000\n}`,
    curlExample: `curl -X GET "https://api.bizzmitra.ai/v1/grid/generation-yield" \\\n  -H "X-Grid-Token: pjm_audit_token"`,
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// 3. HEALTHCARE & CLINICAL DIAGNOSTICS
// ─────────────────────────────────────────────────────────────────────────────
export const HEALTHCARE_DATABASE_TABLES: TableDef[] = [
  {
    id: "medical_organizations",
    name: "medical_organizations",
    description: "Multi-facility diagnostic hospital and clinical pathology network nodes.",
    category: "core",
    columns: [
      { name: "id", type: "UUID", constraints: "PRIMARY KEY DEFAULT gen_random_uuid()", description: "Facility identifier" },
      { name: "name", type: "VARCHAR(255)", constraints: "NOT NULL", description: "Clinical organization name" },
      { name: "nabl_license_code", type: "VARCHAR(64)", constraints: "UNIQUE NOT NULL", description: "National accreditation laboratory ID" },
      { name: "hipaa_tier", type: "VARCHAR(32)", constraints: "DEFAULT 'Strict'", description: "PHI compliance level" },
      { name: "created_at", type: "TIMESTAMPTZ", constraints: "DEFAULT NOW()", description: "Record creation timestamp" },
    ],
  },
  {
    id: "patients",
    name: "patients",
    description: "Encrypted patient identity records with Medical Record Numbers (MRN).",
    category: "clinical",
    columns: [
      { name: "id", type: "UUID", constraints: "PRIMARY KEY DEFAULT gen_random_uuid()", description: "Unique patient ID" },
      { name: "mrn", type: "VARCHAR(64)", constraints: "UNIQUE NOT NULL", description: "Hospital Medical Record Number" },
      { name: "full_name_encrypted", type: "BYTEA", constraints: "NOT NULL", description: "KMS encrypted patient legal name" },
      { name: "dob", type: "DATE", constraints: "NOT NULL", description: "Date of birth for demographic baseline" },
      { name: "blood_group", type: "VARCHAR(8)", constraints: "NULL", description: "Blood type ABO / Rh" },
      { name: "created_at", type: "TIMESTAMPTZ", constraints: "DEFAULT NOW()", description: "Registration timestamp" },
    ],
  },
  {
    id: "lab_specimens",
    name: "lab_specimens",
    description: "Blood and tissue vials with 2D barcode chain-of-custody tracking.",
    category: "clinical",
    columns: [
      { name: "id", type: "UUID", constraints: "PRIMARY KEY DEFAULT gen_random_uuid()", description: "Specimen tube ID" },
      { name: "patient_id", type: "UUID", constraints: "REFERENCES patients(id) ON DELETE CASCADE", description: "Patient foreign key" },
      { name: "barcode_hash", type: "VARCHAR(64)", constraints: "UNIQUE NOT NULL", description: "2D Barcode thermal scan hash" },
      { name: "tube_type", type: "VARCHAR(64)", constraints: "NOT NULL", description: "EDTA Lavender, SST Gold, Heparin Green" },
      { name: "draw_time", type: "TIMESTAMPTZ", constraints: "NOT NULL", description: "Bedside phlebotomy draw timestamp" },
      { name: "status", type: "VARCHAR(32)", constraints: "DEFAULT 'Drawn'", description: "Drawn, Centrifuged, Analyzing, Completed" },
    ],
  },
  {
    id: "critical_panic_results",
    name: "critical_panic_results",
    description: "Life-threatening lab values requiring mandatory sub-2-minute doctor callback.",
    category: "clinical",
    columns: [
      { name: "id", type: "UUID", constraints: "PRIMARY KEY DEFAULT gen_random_uuid()", description: "Panic alert ID" },
      { name: "specimen_id", type: "UUID", constraints: "REFERENCES lab_specimens(id) ON DELETE CASCADE", description: "Source blood vial" },
      { name: "analyte_name", type: "VARCHAR(64)", constraints: "NOT NULL", description: "Hemoglobin, Potassium, Platelet Count" },
      { name: "observed_value", type: "NUMERIC(8,2)", constraints: "NOT NULL", description: "Critical laboratory reading" },
      { name: "panic_threshold", type: "VARCHAR(64)", constraints: "NOT NULL", description: "Panic lower/upper limit threshold" },
      { name: "physician_paged_at", type: "TIMESTAMPTZ", constraints: "DEFAULT NOW()", description: "SMS / App page timestamp" },
      { name: "acknowledged_at", type: "TIMESTAMPTZ", constraints: "NULL", description: "Doctor PIN read-receipt timestamp" },
    ],
  },
  {
    id: "clinical_audit_trails",
    name: "clinical_audit_trails",
    description: "Immutable 7-year audit ledger for HIPAA, CAP, and medical malpractice defense.",
    category: "security",
    columns: [
      { name: "id", type: "BIGSERIAL", constraints: "PRIMARY KEY", description: "Monotonically increasing sequence ID" },
      { name: "clinician_id", type: "UUID", constraints: "NOT NULL", description: "Viewing or signing doctor ID" },
      { name: "patient_id", type: "UUID", constraints: "NOT NULL", description: "Accessed patient record" },
      { name: "action", type: "VARCHAR(64)", constraints: "NOT NULL", description: "VIEW_CHART, PANIC_ACK, FINAL_SIGN" },
      { name: "ip_address", type: "INET", constraints: "NULL", description: "Hospital network endpoint IP" },
      { name: "created_at", type: "TIMESTAMPTZ", constraints: "DEFAULT NOW()", description: "Immutable audit timestamp" },
    ],
  },
];

export const HEALTHCARE_DDL_SCHEMA = `-- ==========================================================
-- MedPulse HIPAA Compliant PostgreSQL 16+ Clinical Schema
-- ==========================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS medical_organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    nabl_license_code VARCHAR(64) UNIQUE NOT NULL,
    hipaa_tier VARCHAR(32) NOT NULL DEFAULT 'Strict',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS patients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    mrn VARCHAR(64) UNIQUE NOT NULL,
    full_name_encrypted BYTEA NOT NULL,
    dob DATE NOT NULL,
    blood_group VARCHAR(8),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS lab_specimens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    barcode_hash VARCHAR(64) UNIQUE NOT NULL,
    tube_type VARCHAR(64) NOT NULL,
    draw_time TIMESTAMPTZ NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'Drawn'
);

CREATE TABLE IF NOT EXISTS critical_panic_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    specimen_id UUID NOT NULL REFERENCES lab_specimens(id) ON DELETE CASCADE,
    analyte_name VARCHAR(64) NOT NULL,
    observed_value NUMERIC(8, 2) NOT NULL,
    panic_threshold VARCHAR(64) NOT NULL,
    physician_paged_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    acknowledged_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS clinical_audit_trails (
    id BIGSERIAL PRIMARY KEY,
    clinician_id UUID NOT NULL,
    patient_id UUID NOT NULL,
    action VARCHAR(64) NOT NULL,
    ip_address INET,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_specimens_barcode ON lab_specimens(barcode_hash);
CREATE INDEX IF NOT EXISTS idx_panic_unack ON critical_panic_results(acknowledged_at) WHERE acknowledged_at IS NULL;
`;

export const HEALTHCARE_ERD_DIAGRAM = `erDiagram
    PATIENTS ||--o{ LAB_SPECIMENS : "yields"
    LAB_SPECIMENS ||--o{ CRITICAL_PANIC_RESULTS : "triggers"
    PATIENTS ||--o{ CLINICAL_AUDIT_TRAILS : "protects"

    PATIENTS {
        uuid id PK
        string mrn UK
        date dob
        string blood_group
    }

    LAB_SPECIMENS {
        uuid id PK
        uuid patient_id FK
        string barcode_hash UK
        string tube_type
        timestamptz draw_time
        string status
    }

    CRITICAL_PANIC_RESULTS {
        uuid id PK
        uuid specimen_id FK
        string analyte_name
        numeric observed_value
        string panic_threshold
        timestamptz physician_paged_at
        timestamptz acknowledged_at
    }

    CLINICAL_AUDIT_TRAILS {
        bigserial id PK
        uuid clinician_id
        uuid patient_id FK
        string action
        timestamptz created_at
    }
`;

export const HEALTHCARE_API_SPECIFICATIONS: ApiEndpointItem[] = [
  {
    method: "POST",
    path: "/api/v1/specimens/scan",
    summary: "Bedside 2D barcode thermal optical scan chain-of-custody verification",
    auth: "Bearer Clinician JWT",
    category: "Specimen Ingestion",
    requestBody: `{\n  "barcodeHash": "BC-9021-SPEC",\n  "tubeType": "EDTA Lavender",\n  "patientMrn": "MRN-8812"\n}`,
    responseBody: `{\n  "specimenId": "spc_8812",\n  "verified": true,\n  "status": "Centrifuge Queued"\n}`,
    curlExample: `curl -X POST "https://api.bizzmitra.ai/v1/specimens/scan" \\\n  -H "Authorization: Bearer NURSE_TOKEN"`,
  },
  {
    method: "GET",
    path: "/api/v1/panic-alerts/active",
    summary: "Active unacknowledged life-threatening laboratory panic alerts",
    auth: "Bearer Doctor JWT",
    category: "Panic Dispatch",
    responseBody: `{\n  "alerts": [\n    {\n      "alertId": "pnc_102",\n      "analyte": "Hemoglobin",\n      "value": 5.4,\n      "unit": "g/dL",\n      "patient": "Jane Doe (Bed 402)",\n      "elapsedSeconds": 34\n    }\n  ]\n}`,
    curlExample: `curl -X GET "https://api.bizzmitra.ai/v1/panic-alerts/active" \\\n  -H "Authorization: Bearer DOCTOR_TOKEN"`,
  },
  {
    method: "POST",
    path: "/api/v1/panic-alerts/{id}/ack",
    summary: "Physician 1-tap PIN acknowledgment locking regulatory HIPAA audit trail",
    auth: "Bearer Doctor JWT",
    category: "Panic Dispatch",
    requestBody: `{\n  "pinHash": "e3b0c44298fc1c149afb",\n  "actionTaken": "Blood transfusion ordered stat"\n}`,
    responseBody: `{\n  "success": true,\n  "acknowledgedAt": "2026-09-22T14:28:10Z"\n}`,
    curlExample: `curl -X POST "https://api.bizzmitra.ai/v1/panic-alerts/pnc_102/ack" \\\n  -H "Authorization: Bearer DOCTOR_TOKEN"`,
  },
  {
    method: "GET",
    path: "/api/v1/fhir/v4/Observation",
    summary: "Bidirectional HL7 / FHIR v4 Observation endpoint for hospital EMR integration",
    auth: "Mutual TLS",
    category: "EMR Integration",
    responseBody: `{\n  "resourceType": "Observation",\n  "id": "obs-9021",\n  "status": "final",\n  "code": {\n    "text": "Platelet Count"\n  },\n  "valueQuantity": {\n    "value": 142000,\n    "unit": "/uL"\n  }\n}`,
    curlExample: `curl -X GET "https://api.bizzmitra.ai/v1/fhir/v4/Observation?patient=MRN-8812" \\\n  --cert client-cert.pem --key client-key.pem`,
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// 4. LOGISTICS, FLEET & SUPPLY CHAIN
// ─────────────────────────────────────────────────────────────────────────────
export const LOGISTICS_DATABASE_TABLES: TableDef[] = [
  {
    id: "carrier_fleets",
    name: "carrier_fleets",
    description: "Commercial logistics carrier accounts with DOT license compliance.",
    category: "core",
    columns: [
      { name: "id", type: "UUID", constraints: "PRIMARY KEY DEFAULT gen_random_uuid()", description: "Fleet account ID" },
      { name: "company_name", type: "VARCHAR(255)", constraints: "NOT NULL", description: "Commercial fleet operator name" },
      { name: "dot_license_number", type: "VARCHAR(64)", constraints: "UNIQUE NOT NULL", description: "Department of Transportation registration" },
      { name: "active_trucks", type: "INTEGER", constraints: "DEFAULT 0", description: "Count of actively assigned commercial vehicles" },
      { name: "created_at", type: "TIMESTAMPTZ", constraints: "DEFAULT NOW()", description: "Fleet creation timestamp" },
    ],
  },
  {
    id: "fleet_vehicles",
    name: "fleet_vehicles",
    description: "Heavy trucks, medium freighters, and reefer vehicles with telemetry status.",
    category: "telemetry",
    columns: [
      { name: "id", type: "UUID", constraints: "PRIMARY KEY DEFAULT gen_random_uuid()", description: "Vehicle unique ID" },
      { name: "fleet_id", type: "UUID", constraints: "REFERENCES carrier_fleets(id) ON DELETE CASCADE", description: "Parent carrier fleet" },
      { name: "license_plate", type: "VARCHAR(32)", constraints: "UNIQUE NOT NULL", description: "Vehicle registration plate" },
      { name: "vin", type: "VARCHAR(64)", constraints: "UNIQUE NOT NULL", description: "Vehicle Identification Number" },
      { name: "vehicle_class", type: "VARCHAR(32)", constraints: "NOT NULL", description: "32T Multi-Axle, 16T Freight, Reefer Cold-Chain" },
      { name: "is_cold_chain", type: "BOOLEAN", constraints: "DEFAULT FALSE", description: "Whether vehicle possesses refrigerated cargo sensors" },
      { name: "status", type: "VARCHAR(32)", constraints: "DEFAULT 'En-Route'", description: "Staged, En-Route, At-Dock, Maintenance" },
    ],
  },
  {
    id: "telematics_pings",
    name: "telematics_pings",
    description: "Sub-second GPS coordinates streaming into Redis Geo and PostGIS R-tree stores.",
    category: "telemetry",
    columns: [
      { name: "time", type: "TIMESTAMPTZ", constraints: "NOT NULL", description: "Ping timestamp" },
      { name: "vehicle_id", type: "UUID", constraints: "REFERENCES fleet_vehicles(id) ON DELETE CASCADE", description: "Source vehicle" },
      { name: "latitude", type: "NUMERIC(9,6)", constraints: "NOT NULL", description: "GPS latitude coordinate" },
      { name: "longitude", type: "NUMERIC(9,6)", constraints: "NOT NULL", description: "GPS longitude coordinate" },
      { name: "speed_kmh", type: "NUMERIC(5,2)", constraints: "NOT NULL", description: "Vehicle speed in km/h" },
      { name: "engine_temp", type: "NUMERIC(5,2)", constraints: "NULL", description: "Engine coolant temperature" },
    ],
  },
  {
    id: "delivery_manifests",
    name: "delivery_manifests",
    description: "Multi-stop delivery routes optimized via Travelling Salesperson AI solvers.",
    category: "operations",
    columns: [
      { name: "id", type: "UUID", constraints: "PRIMARY KEY DEFAULT gen_random_uuid()", description: "Manifest unique ID" },
      { name: "vehicle_id", type: "UUID", constraints: "REFERENCES fleet_vehicles(id) ON DELETE CASCADE", description: "Assigned vehicle" },
      { name: "driver_name", type: "VARCHAR(128)", constraints: "NOT NULL", description: "Assigned commercial driver" },
      { name: "origin_depot", type: "VARCHAR(128)", constraints: "NOT NULL", description: "Origin loading warehouse" },
      { name: "destination_dock", type: "VARCHAR(128)", constraints: "NOT NULL", description: "Target receiving facility" },
      { name: "total_stops", type: "INTEGER", constraints: "DEFAULT 1", description: "Optimized stop count" },
      { name: "status", type: "VARCHAR(32)", constraints: "DEFAULT 'In-Transit'", description: "Staged, In-Transit, Geofenced, Delivered" },
      { name: "created_at", type: "TIMESTAMPTZ", constraints: "DEFAULT NOW()", description: "Manifest dispatch timestamp" },
    ],
  },
  {
    id: "proof_of_delivery",
    name: "proof_of_delivery",
    description: "Glass digital signatures, photo proof, and geotagged drop-off verification.",
    category: "operations",
    columns: [
      { name: "id", type: "UUID", constraints: "PRIMARY KEY DEFAULT gen_random_uuid()", description: "POD ID" },
      { name: "manifest_id", type: "UUID", constraints: "REFERENCES delivery_manifests(id) ON DELETE CASCADE", description: "Associated manifest" },
      { name: "signee_name", type: "VARCHAR(128)", constraints: "NOT NULL", description: "Receiving dock manager name" },
      { name: "signature_s3_url", type: "TEXT", constraints: "NOT NULL", description: "S3 URL of digital signature" },
      { name: "geo_latitude", type: "NUMERIC(9,6)", constraints: "NOT NULL", description: "Geotag latitude at drop-off" },
      { name: "geo_longitude", type: "NUMERIC(9,6)", constraints: "NOT NULL", description: "Geotag longitude at drop-off" },
      { name: "verified_at", type: "TIMESTAMPTZ", constraints: "DEFAULT NOW()", description: "Sign-off timestamp" },
    ],
  },
];

export const LOGISTICS_DDL_SCHEMA = `-- ==========================================================
-- LogiTrack Fleet Telematics PostGIS PostgreSQL 16+ Schema
-- ==========================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "postgis";

CREATE TABLE IF NOT EXISTS carrier_fleets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_name VARCHAR(255) NOT NULL,
    dot_license_number VARCHAR(64) UNIQUE NOT NULL,
    active_trucks INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS fleet_vehicles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    fleet_id UUID NOT NULL REFERENCES carrier_fleets(id) ON DELETE CASCADE,
    license_plate VARCHAR(32) UNIQUE NOT NULL,
    vin VARCHAR(64) UNIQUE NOT NULL,
    vehicle_class VARCHAR(32) NOT NULL,
    is_cold_chain BOOLEAN NOT NULL DEFAULT FALSE,
    status VARCHAR(32) NOT NULL DEFAULT 'En-Route'
);

CREATE TABLE IF NOT EXISTS telematics_pings (
    time TIMESTAMPTZ NOT NULL,
    vehicle_id UUID NOT NULL REFERENCES fleet_vehicles(id) ON DELETE CASCADE,
    latitude NUMERIC(9, 6) NOT NULL,
    longitude NUMERIC(9, 6) NOT NULL,
    speed_kmh NUMERIC(5, 2) NOT NULL,
    engine_temp NUMERIC(5, 2)
);

CREATE TABLE IF NOT EXISTS delivery_manifests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vehicle_id UUID NOT NULL REFERENCES fleet_vehicles(id) ON DELETE CASCADE,
    driver_name VARCHAR(128) NOT NULL,
    origin_depot VARCHAR(128) NOT NULL,
    destination_dock VARCHAR(128) NOT NULL,
    total_stops INTEGER NOT NULL DEFAULT 1,
    status VARCHAR(32) NOT NULL DEFAULT 'In-Transit',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS proof_of_delivery (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    manifest_id UUID NOT NULL REFERENCES delivery_manifests(id) ON DELETE CASCADE,
    signee_name VARCHAR(128) NOT NULL,
    signature_s3_url TEXT NOT NULL,
    geo_latitude NUMERIC(9, 6) NOT NULL,
    geo_longitude NUMERIC(9, 6) NOT NULL,
    verified_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_telematics_pings ON telematics_pings(vehicle_id, time DESC);
CREATE INDEX IF NOT EXISTS idx_manifests_active ON delivery_manifests(status) WHERE status != 'Delivered';
`;

export const LOGISTICS_ERD_DIAGRAM = `erDiagram
    CARRIER_FLEETS ||--o{ FLEET_VEHICLES : "operates"
    FLEET_VEHICLES ||--o{ TELEMATICS_PINGS : "emits"
    FLEET_VEHICLES ||--o{ DELIVERY_MANIFESTS : "carries"
    DELIVERY_MANIFESTS ||--o{ PROOF_OF_DELIVERY : "finalized by"

    CARRIER_FLEETS {
        uuid id PK
        string company_name
        string dot_license_number UK
        integer active_trucks
    }

    FLEET_VEHICLES {
        uuid id PK
        uuid fleet_id FK
        string license_plate UK
        string vin UK
        string vehicle_class
        boolean is_cold_chain
        string status
    }

    TELEMATICS_PINGS {
        timestamptz time
        uuid vehicle_id FK
        numeric latitude
        numeric longitude
        numeric speed_kmh
    }

    DELIVERY_MANIFESTS {
        uuid id PK
        uuid vehicle_id FK
        string driver_name
        string origin_depot
        string destination_dock
        string status
    }

    PROOF_OF_DELIVERY {
        uuid id PK
        uuid manifest_id FK
        string signee_name
        string signature_s3_url
        numeric geo_latitude
        numeric geo_longitude
        timestamptz verified_at
    }
`;

export const LOGISTICS_API_SPECIFICATIONS: ApiEndpointItem[] = [
  {
    method: "POST",
    path: "/api/v1/telematics/ping",
    summary: "High-throughput GPS telemetry ingestion (100k packets/min buffered via Kafka)",
    auth: "Device HMAC",
    category: "Telemetry",
    requestBody: `{\n  "vehicleId": "veh_trk_402",\n  "latitude": 18.5204,\n  "longitude": 73.8567,\n  "speedKmh": 58.4,\n  "engineTemp": 88.2\n}`,
    responseBody: `{\n  "acknowledged": true,\n  "geofenceEvaluated": true,\n  "proximityEtaMins": 4\n}`,
    curlExample: `curl -X POST "https://api.bizzmitra.ai/v1/telematics/ping" \\\n  -H "X-Device-Signature: hmac_sha256_hash" \\\n  -d '{"vehicleId":"veh_trk_402","latitude":18.52,"longitude":73.85}'`,
  },
  {
    method: "GET",
    path: "/api/v1/fleet/live-positions",
    summary: "Sub-millisecond Redis GeoSpatial query of active truck coordinates for Mapbox",
    auth: "Dispatcher JWT",
    category: "Fleet Dispatch",
    responseBody: `{\n  "activeCount": 148,\n  "vehicles": [\n    {\n      "id": "veh_trk_402",\n      "driver": "Rajesh Kumar",\n      "lat": 18.5204,\n      "lng": 73.8567,\n      "status": "Geofenced Dock 4"\n    }\n  ]\n}`,
    curlExample: `curl -X GET "https://api.bizzmitra.ai/v1/fleet/live-positions" \\\n  -H "Authorization: Bearer DISPATCHER_KEY"`,
  },
  {
    method: "POST",
    path: "/api/v1/routes/optimize-stops",
    summary: "Multi-stop Travelling Salesperson route optimization solver with real-time traffic",
    auth: "Dispatcher JWT",
    category: "Route Solvers",
    requestBody: `{\n  "stops": 18,\n  "vehicleCapacityKg": 16000,\n  "avoidExpresswayTolls": false\n}`,
    responseBody: `{\n  "optimizedRouteKm": 384.2,\n  "estimatedHours": 6.4,\n  "fuelSavedLiters": 42.8\n}`,
    curlExample: `curl -X POST "https://api.bizzmitra.ai/v1/routes/optimize-stops" \\\n  -H "Authorization: Bearer DISPATCHER_KEY"`,
  },
  {
    method: "POST",
    path: "/api/v1/manifests/{id}/pod",
    summary: "Upload glass-signature proof of delivery with GPS geotag and automated invoice generation",
    auth: "Driver PWA JWT",
    category: "Proof of Delivery",
    requestBody: `{\n  "signeeName": "Vikram Patel",\n  "signatureBase64": "data:image/png;base64,...",\n  "latitude": 18.5204,\n  "longitude": 73.8567\n}`,
    responseBody: `{\n  "podId": "pod_88129",\n  "verified": true,\n  "invoiceDispatched": true\n}`,
    curlExample: `curl -X POST "https://api.bizzmitra.ai/v1/manifests/man_8821/pod" \\\n  -H "Authorization: Bearer DRIVER_KEY"`,
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// BLUEPRINT FACTORY FOR ANY PROBLEM INTAKE
// ─────────────────────────────────────────────────────────────────────────────
export function getDatabaseBlueprint(context?: {
  businessName?: string;
  industry?: string;
  problemStatement?: string;
}): DatabaseBlueprint {
  const combined = `${context?.industry || ""} ${context?.problemStatement || ""} ${context?.businessName || ""}`.toLowerCase();
  const name = context?.businessName?.trim() || "Enterprise";

  // 1. Clean Tech & Solar
  if (
    combined.includes("solar") ||
    combined.includes("clean tech") ||
    combined.includes("renewable") ||
    combined.includes("energy") ||
    combined.includes("inverter") ||
    combined.includes("photovoltaic") ||
    combined.includes("grid")
  ) {
    return {
      domainId: "solar",
      domainTitle: `${name} — Clean Tech & Solar Database Architecture`,
      tables: SOLAR_DATABASE_TABLES,
      erdDiagram: SOLAR_ERD_DIAGRAM,
      ddlSchema: SOLAR_DDL_SCHEMA,
      apiCategories: ["All", "Telemetry", "Safety Control", "Operations", "Compliance"],
      apiSpecifications: SOLAR_API_SPECIFICATIONS,
      apiEndpoints: SOLAR_API_SPECIFICATIONS,
      metrics: {
        tableCount: `${SOLAR_DATABASE_TABLES.length} Entities`,
        apiCount: `${SOLAR_API_SPECIFICATIONS.length} Routes`,
        multiTenancy: "Plant Isolated",
        compliance: "IEEE 1547 / ISO-NE",
      },
    };
  }

  // 0. Project Management, TaskFlow & Leave-Aware Scheduling
  if (isProjectManagementDomain(combined)) {
    return {
      domainId: "taskflow",
      domainTitle: `${name} — TaskFlow & Leave Management Data Architecture`,
      tables: [
        {
          id: "projects",
          name: "projects",
          description: "Project records defining project scope, overall timeline, and status.",
          category: "core",
          columns: [
            { name: "id", type: "UUID", constraints: "PRIMARY KEY DEFAULT gen_random_uuid()", description: "Unique project identifier" },
            { name: "name", type: "VARCHAR(255)", constraints: "NOT NULL", description: "Project title or initiative name" },
            { name: "start_date", type: "DATE", constraints: "NOT NULL", description: "Scheduled project launch date" },
            { name: "end_date", type: "DATE", constraints: "NOT NULL", description: "Scheduled project completion date" },
            { name: "status", type: "VARCHAR(32)", constraints: "DEFAULT 'active'", description: "Project status (active, completed, archived)" },
            { name: "created_at", type: "TIMESTAMPTZ", constraints: "DEFAULT NOW()", description: "Record creation timestamp" },
          ],
        },
        {
          id: "team_members",
          name: "team_members",
          description: "Minimal team member roster managed by the single project manager.",
          category: "operations",
          columns: [
            { name: "id", type: "UUID", constraints: "PRIMARY KEY DEFAULT gen_random_uuid()", description: "Unique team member ID" },
            { name: "name", type: "VARCHAR(128)", constraints: "NOT NULL", description: "Full name of the team member (e.g. Priya Sharma)" },
            { name: "created_at", type: "TIMESTAMPTZ", constraints: "DEFAULT NOW()", description: "Enrollment timestamp" },
          ],
        },
        {
          id: "leave_records",
          name: "leave_records",
          description: "Scheduled time-off intervals for team members used to enforce assignment boundaries.",
          category: "operations",
          columns: [
            { name: "id", type: "UUID", constraints: "PRIMARY KEY DEFAULT gen_random_uuid()", description: "Unique leave record ID" },
            { name: "member_id", type: "UUID", constraints: "REFERENCES team_members(id) ON DELETE CASCADE", description: "Team member on leave" },
            { name: "start_date", type: "DATE", constraints: "NOT NULL", description: "Leave start date (inclusive)" },
            { name: "end_date", type: "DATE", constraints: "NOT NULL", description: "Leave end date (inclusive)" },
            { name: "reason", type: "VARCHAR(255)", constraints: "DEFAULT 'Approved PTO'", description: "Leave category or notes" },
            { name: "created_at", type: "TIMESTAMPTZ", constraints: "DEFAULT NOW()", description: "Log timestamp" },
          ],
        },
        {
          id: "tasks",
          name: "tasks",
          description: "Project deliverables with strict leave-collision validation against assignee schedules.",
          category: "core",
          columns: [
            { name: "id", type: "UUID", constraints: "PRIMARY KEY DEFAULT gen_random_uuid()", description: "Unique task identifier" },
            { name: "project_id", type: "UUID", constraints: "REFERENCES projects(id) ON DELETE CASCADE", description: "Parent project ID" },
            { name: "assigned_to", type: "UUID", constraints: "REFERENCES team_members(id) ON DELETE SET NULL", description: "Assigned team member" },
            { name: "title", type: "VARCHAR(255)", constraints: "NOT NULL", description: "Task headline / action item" },
            { name: "start_date", type: "DATE", constraints: "NOT NULL", description: "Task execution start date" },
            { name: "due_date", type: "DATE", constraints: "NOT NULL", description: "Task deadline" },
            { name: "status", type: "VARCHAR(32)", constraints: "NOT NULL DEFAULT 'To Do'", description: "Kanban column: 'To Do' | 'In Progress' | 'Done'" },
            { name: "created_at", type: "TIMESTAMPTZ", constraints: "DEFAULT NOW()", description: "Creation timestamp" },
          ],
        },
      ],
      erdDiagram: `erDiagram
    PROJECTS ||--o{ TASKS : "contains"
    TEAM_MEMBERS ||--o{ TASKS : "assigned_to"
    TEAM_MEMBERS ||--o{ LEAVE_RECORDS : "schedules"
    
    PROJECTS {
      uuid id PK
      string name
      date start_date
      date end_date
      string status
    }
    TEAM_MEMBERS {
      uuid id PK
      string name
    }
    LEAVE_RECORDS {
      uuid id PK
      uuid member_id FK
      date start_date
      date end_date
    }
    TASKS {
      uuid id PK
      uuid project_id FK
      uuid assigned_to FK
      string title
      date start_date
      date due_date
      string status
    }`,
      ddlSchema: `-- TaskFlow: Leave-Aware Project Management Schema
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status VARCHAR(32) DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT clock_timestamp()
);

CREATE TABLE team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(128) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT clock_timestamp()
);

CREATE TABLE leave_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID NOT NULL REFERENCES team_members(id) ON DELETE CASCADE,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT clock_timestamp(),
  CONSTRAINT valid_leave_range CHECK (end_date >= start_date)
);

CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  assigned_to UUID REFERENCES team_members(id) ON DELETE SET NULL,
  title VARCHAR(255) NOT NULL,
  start_date DATE NOT NULL,
  due_date DATE NOT NULL,
  status VARCHAR(32) NOT NULL DEFAULT 'To Do' CHECK (status IN ('To Do', 'In Progress', 'Done')),
  created_at TIMESTAMPTZ DEFAULT clock_timestamp(),
  CONSTRAINT valid_task_range CHECK (due_date >= start_date)
);

-- Leave-Aware Assignment Block Validation Trigger
CREATE OR REPLACE FUNCTION validate_task_leave_overlap()
RETURNS TRIGGER AS $$
DECLARE
  v_conflict RECORD;
  v_member_name VARCHAR(128);
BEGIN
  IF NEW.assigned_to IS NOT NULL THEN
    SELECT l.start_date, l.end_date INTO v_conflict
    FROM leave_records l
    WHERE l.member_id = NEW.assigned_to
      AND (NEW.start_date <= l.end_date AND NEW.due_date >= l.start_date)
    LIMIT 1;

    IF FOUND THEN
      SELECT name INTO v_member_name FROM team_members WHERE id = NEW.assigned_to;
      RAISE EXCEPTION 'Assignment Blocked: % is on leave from % to %, overlapping task schedule.',
        v_member_name, v_conflict.start_date, v_conflict.end_date;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_check_task_leave_overlap
BEFORE INSERT OR UPDATE OF assigned_to, start_date, due_date ON tasks
FOR EACH ROW EXECUTE FUNCTION validate_task_leave_overlap();`,
      apiCategories: ["All", "Projects", "Tasks & Kanban", "Team & Leaves"],
      apiSpecifications: [
        {
          method: "POST",
          path: "/api/v1/tasks",
          summary: "Create Task with Leave-Aware Collision Guard",
          auth: "Local PM Context",
          category: "Tasks & Kanban",
          requestBody: '{\n  "projectId": "uuid",\n  "assignedTo": "uuid",\n  "title": "Build Kanban Drag-and-Drop",\n  "startDate": "2026-06-05",\n  "dueDate": "2026-06-08"\n}',
          responseBody: '{\n  "success": true,\n  "taskId": "uuid",\n  "leaveCollision": false,\n  "message": "Task assigned with verified member availability"\n}',
          curlExample: "curl -X POST /api/v1/tasks -H 'Content-Type: application/json' -d '{\"title\":\"API Ingress\",\"assignedTo\":\"p-1\"}'",
        },
        {
          method: "GET",
          path: "/api/v1/team/availability",
          summary: "Team Availability Overview & Upcoming Leave",
          auth: "Local PM Context",
          category: "Team & Leaves",
          responseBody: '{\n  "members": [\n    { "id": "p-1", "name": "Priya Sharma", "upcomingLeave": { "from": "2026-06-05", "to": "2026-06-08" }, "status": "On Leave Next Week" },\n    { "id": "p-2", "name": "Rohan Varma", "upcomingLeave": null, "status": "Available" }\n  ]\n}',
          curlExample: "curl /api/v1/team/availability",
        },
        {
          method: "GET",
          path: "/api/v1/projects/:id/kanban",
          summary: "Project Kanban View by Status",
          auth: "Local PM Context",
          category: "Projects",
          responseBody: '{\n  "projectId": "uuid",\n  "columns": {\n    "todo": [{ "id": "t-1", "title": "Setup local storage", "assignee": "Devendra" }],\n    "inProgress": [{ "id": "t-2", "title": "Build Leave Guard", "assignee": "Rohan" }],\n    "done": []\n  }\n}',
          curlExample: "curl /api/v1/projects/proj-101/kanban",
        },
        {
          method: "POST",
          path: "/api/v1/leaves",
          summary: "Log Team Member Leave Record",
          auth: "Local PM Context",
          category: "Team & Leaves",
          requestBody: '{\n  "memberId": "uuid",\n  "startDate": "2026-06-05",\n  "endDate": "2026-06-08"\n}',
          responseBody: '{\n  "success": true,\n  "leaveId": "uuid",\n  "conflictingTasks": 0\n}',
          curlExample: "curl -X POST /api/v1/leaves -H 'Content-Type: application/json' -d '{\"memberId\":\"uuid\",\"startDate\":\"2026-06-05\",\"endDate\":\"2026-06-08\"}'",
        },
        {
          method: "POST",
          path: "/api/v1/team-members",
          summary: "Register Minimal Team Member",
          auth: "Local PM Context",
          category: "Team & Leaves",
          requestBody: '{\n  "name": "Ananya Roy"\n}',
          responseBody: '{\n  "id": "uuid",\n  "name": "Ananya Roy",\n  "created_at": "2026-09-26T10:00:00Z"\n}',
          curlExample: "curl -X POST /api/v1/team-members -H 'Content-Type: application/json' -d '{\"name\":\"Ananya Roy\"}'",
        },
      ],
      apiEndpoints: [
        {
          method: "POST",
          path: "/api/v1/tasks",
          summary: "Create Task with Leave-Aware Collision Guard",
          auth: "Local PM Context",
          category: "Tasks & Kanban",
          requestBody: '{\n  "projectId": "uuid",\n  "assignedTo": "uuid",\n  "title": "Build Kanban Drag-and-Drop",\n  "startDate": "2026-06-05",\n  "dueDate": "2026-06-08"\n}',
          responseBody: '{\n  "success": true,\n  "taskId": "uuid",\n  "leaveCollision": false,\n  "message": "Task assigned with verified member availability"\n}',
          curlExample: "curl -X POST /api/v1/tasks -H 'Content-Type: application/json' -d '{\"title\":\"API Ingress\",\"assignedTo\":\"p-1\"}'",
        },
        {
          method: "GET",
          path: "/api/v1/team/availability",
          summary: "Team Availability Overview & Upcoming Leave",
          auth: "Local PM Context",
          category: "Team & Leaves",
          responseBody: '{\n  "members": [\n    { "id": "p-1", "name": "Priya Sharma", "upcomingLeave": { "from": "2026-06-05", "to": "2026-06-08" }, "status": "On Leave Next Week" },\n    { "id": "p-2", "name": "Rohan Varma", "upcomingLeave": null, "status": "Available" }\n  ]\n}',
          curlExample: "curl /api/v1/team/availability",
        },
        {
          method: "GET",
          path: "/api/v1/projects/:id/kanban",
          summary: "Project Kanban View by Status",
          auth: "Local PM Context",
          category: "Projects",
          responseBody: '{\n  "projectId": "uuid",\n  "columns": {\n    "todo": [{ "id": "t-1", "title": "Setup local storage", "assignee": "Devendra" }],\n    "inProgress": [{ "id": "t-2", "title": "Build Leave Guard", "assignee": "Rohan" }],\n    "done": []\n  }\n}',
          curlExample: "curl /api/v1/projects/proj-101/kanban",
        },
        {
          method: "POST",
          path: "/api/v1/leaves",
          summary: "Log Team Member Leave Record",
          auth: "Local PM Context",
          category: "Team & Leaves",
          requestBody: '{\n  "memberId": "uuid",\n  "startDate": "2026-06-05",\n  "endDate": "2026-06-08"\n}',
          responseBody: '{\n  "success": true,\n  "leaveId": "uuid",\n  "conflictingTasks": 0\n}',
          curlExample: "curl -X POST /api/v1/leaves -H 'Content-Type: application/json' -d '{\"memberId\":\"uuid\",\"startDate\":\"2026-06-05\",\"endDate\":\"2026-06-08\"}'",
        },
        {
          method: "POST",
          path: "/api/v1/team-members",
          summary: "Register Minimal Team Member",
          auth: "Local PM Context",
          category: "Team & Leaves",
          requestBody: '{\n  "name": "Ananya Roy"\n}',
          responseBody: '{\n  "id": "uuid",\n  "name": "Ananya Roy",\n  "created_at": "2026-09-26T10:00:00Z"\n}',
          curlExample: "curl -X POST /api/v1/team-members -H 'Content-Type: application/json' -d '{\"name\":\"Ananya Roy\"}'",
        },
      ],
      metrics: {
        tableCount: "4 Entities",
        apiCount: "5 Routes",
        multiTenancy: "Single-PM Local Storage",
        compliance: "Strict Overlap Guard Active",
      },
    };
  }

  // 2. Healthcare & Diagnostic Lab
  if (isHealthcareDomain(combined)) {
    return {
      domainId: "healthcare",
      domainTitle: `${name} — Clinical Diagnostics & LIS Data Architecture`,
      tables: HEALTHCARE_DATABASE_TABLES,
      erdDiagram: HEALTHCARE_ERD_DIAGRAM,
      ddlSchema: HEALTHCARE_DDL_SCHEMA,
      apiCategories: ["All", "Specimen Ingestion", "Panic Dispatch", "EMR Integration"],
      apiSpecifications: HEALTHCARE_API_SPECIFICATIONS,
      apiEndpoints: HEALTHCARE_API_SPECIFICATIONS,
      metrics: {
        tableCount: `${HEALTHCARE_DATABASE_TABLES.length} Entities`,
        apiCount: `${HEALTHCARE_API_SPECIFICATIONS.length} Routes`,
        multiTenancy: "HIPAA Zero-Trust",
        compliance: "HL7 v4 / CAP NABL",
      },
    };
  }

  // 3. Logistics, Fleet & Supply Chain
  if (
    combined.includes("logistics") ||
    combined.includes("fleet") ||
    combined.includes("delivery") ||
    combined.includes("truck") ||
    combined.includes("dispatch") ||
    combined.includes("transport") ||
    combined.includes("freight") ||
    combined.includes("cargo") ||
    combined.includes("warehouse") ||
    combined.includes("supply chain")
  ) {
    return {
      domainId: "logistics",
      domainTitle: `${name} — Fleet Dispatch & Telematics Data Architecture`,
      tables: LOGISTICS_DATABASE_TABLES,
      erdDiagram: LOGISTICS_ERD_DIAGRAM,
      ddlSchema: LOGISTICS_DDL_SCHEMA,
      apiCategories: ["All", "Telemetry", "Fleet Dispatch", "Route Solvers", "Proof of Delivery"],
      apiSpecifications: LOGISTICS_API_SPECIFICATIONS,
      apiEndpoints: LOGISTICS_API_SPECIFICATIONS,
      metrics: {
        tableCount: `${LOGISTICS_DATABASE_TABLES.length} Entities`,
        apiCount: `${LOGISTICS_API_SPECIFICATIONS.length} Routes`,
        multiTenancy: "Carrier Isolated",
        compliance: "DOT / PostGIS Spatial",
      },
    };
  }

  // 4. HR & Recruitment (ONLY if specifically matching HR / recruitment keywords)
  if (
    combined.includes("recruitment") ||
    combined.includes("staffing") ||
    combined.includes("talentcraft") ||
    combined.includes("recruiter") ||
    combined.includes("headhunting") ||
    combined.includes("hr consultancy") ||
    (combined.includes("candidate") && combined.includes("hire"))
  ) {
    return {
      domainId: "hr",
      domainTitle: `${name} — Multi-Tenant Recruitment Data Architecture`,
      tables: HR_DATABASE_TABLES,
      erdDiagram: HR_ERD_DIAGRAM,
      ddlSchema: HR_DDL_SCHEMA,
      apiCategories: ["All", "Recruitment", "Operations", "Client Portal"],
      apiSpecifications: HR_API_SPECIFICATIONS,
      apiEndpoints: HR_API_SPECIFICATIONS,
      metrics: {
        tableCount: `${HR_DATABASE_TABLES.length} Entities`,
        apiCount: `${HR_API_SPECIFICATIONS.length} Routes`,
        multiTenancy: "org_id RLS",
        compliance: "SOC 2 / GDPR",
      },
    };
  }

  // 5. Universal Enterprise & Workflow Architecture
  const defaultTables: TableDef[] = [
    {
      id: "organizations",
      name: "organizations",
      description: "Multi-tenant tenant isolation and security configuration",
      category: "core",
      columns: [
        { name: "id", type: "UUID", constraints: "PRIMARY KEY DEFAULT gen_random_uuid()", description: "Unique tenant identifier" },
        { name: "name", type: "VARCHAR(255)", constraints: "NOT NULL", description: "Legal entity or business name" },
        { name: "industry", type: "VARCHAR(100)", constraints: "NOT NULL", description: "Operating domain and classification" },
        { name: "status", type: "VARCHAR(50)", constraints: "DEFAULT 'active'", description: "Account state (active/trial/suspended)" },
        { name: "created_at", type: "TIMESTAMPTZ", constraints: "DEFAULT NOW()", description: "Tenant inception timestamp" },
      ],
    },
    {
      id: "workflow_items",
      name: "workflow_items",
      description: "Core transactional business records, requests, and pipeline items",
      category: "operations",
      columns: [
        { name: "id", type: "UUID", constraints: "PRIMARY KEY DEFAULT gen_random_uuid()", description: "Primary record ID" },
        { name: "org_id", type: "UUID", constraints: "REFERENCES organizations(id) ON DELETE CASCADE", description: "Foreign key linking to organizations" },
        { name: "title", type: "VARCHAR(255)", constraints: "NOT NULL", description: "Task or transaction identifier" },
        { name: "stage", type: "VARCHAR(50)", constraints: "NOT NULL DEFAULT 'intake'", description: "Current lifecycle state in workflow engine" },
        { name: "priority", type: "VARCHAR(20)", constraints: "DEFAULT 'medium'", description: "SLA priority level (low/medium/urgent)" },
        { name: "assigned_to", type: "UUID", constraints: "NULL", description: "Responsible operator / assignee" },
        { name: "metadata", type: "JSONB", constraints: "DEFAULT '{}'", description: "Domain-specific attributes and custom fields" },
        { name: "created_at", type: "TIMESTAMPTZ", constraints: "DEFAULT NOW()", description: "Record creation timestamp" },
      ],
    },
    {
      id: "audit_events",
      name: "audit_events",
      description: "Immutable cryptographically verifiable audit trail for regulatory compliance",
      category: "security",
      columns: [
        { name: "id", type: "UUID", constraints: "PRIMARY KEY DEFAULT gen_random_uuid()", description: "Audit record ID" },
        { name: "org_id", type: "UUID", constraints: "REFERENCES organizations(id) ON DELETE CASCADE", description: "Tenant scope" },
        { name: "actor_id", type: "UUID", constraints: "NOT NULL", description: "User or API key performing the action" },
        { name: "action", type: "VARCHAR(100)", constraints: "NOT NULL", description: "Action type (CREATE, UPDATE, DELETE, APPROVE)" },
        { name: "payload_diff", type: "JSONB", constraints: "NOT NULL", description: "Before-and-after change diff" },
        { name: "timestamp", type: "TIMESTAMPTZ", constraints: "DEFAULT NOW()", description: "Event timestamp" },
      ],
    },
  ];

  const defaultApis: ApiEndpointItem[] = [
    {
      method: "POST",
      path: "/api/v1/workflow/items",
      summary: "Ingest and route operational workflow item",
      auth: "Bearer Token / API Key",
      category: "Operations",
      requestBody: '{\n  "title": "Quarterly Vendor Review",\n  "priority": "medium",\n  "metadata": {}\n}',
      responseBody: '{\n  "id": "e2a4c100-3498-466d-85fa-7b98a39d8e01",\n  "status": "queued",\n  "created_at": "2026-09-26T10:00:00Z"\n}',
      curlExample: "curl -X POST https://api.bizzmitra.ai/v1/workflow/items \\\n  -H 'Authorization: Bearer YOUR_TOKEN' \\\n  -H 'Content-Type: application/json' \\\n  -d '{\"title\":\"Quarterly Review\"}'",
    },
    {
      method: "GET",
      path: "/api/v1/workflow/items",
      summary: "List filtered workflow items",
      auth: "Bearer Token",
      category: "Operations",
      responseBody: '[\n  {\n    "id": "e2a4c100-3498-466d-85fa-7b98a39d8e01",\n    "title": "Quarterly Vendor Review",\n    "stage": "intake",\n    "priority": "medium"\n  }\n]',
      curlExample: "curl -X GET https://api.bizzmitra.ai/v1/workflow/items \\\n  -H 'Authorization: Bearer YOUR_TOKEN'",
    },
    {
      method: "GET",
      path: "/api/v1/audit/events",
      summary: "Query cryptographic audit trail",
      auth: "Bearer Admin JWT",
      category: "Audit & Reporting",
      responseBody: '[\n  {\n    "id": "a901-44bb",\n    "action": "ITEM_CREATED",\n    "actor": "user_sys_01",\n    "timestamp": "2026-09-26T10:00:00Z"\n  }\n]',
      curlExample: "curl -X GET https://api.bizzmitra.ai/v1/audit/events \\\n  -H 'Authorization: Bearer ADMIN_TOKEN'",
    },
  ];

  return {
    domainId: "enterprise",
    domainTitle: `${name} — Enterprise Workflow & Operations Data Architecture`,
    tables: defaultTables,
    erdDiagram: `erDiagram
    organizations ||--o{ workflow_items : "manages"
    organizations ||--o{ audit_events : "audits"
    workflow_items ||--o{ audit_events : "tracks"`,
    ddlSchema: `-- Enterprise Operations Core DDL Schema
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  industry VARCHAR(100) NOT NULL,
  status VARCHAR(50) DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT clock_timestamp()
);

CREATE TABLE workflow_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  stage VARCHAR(50) NOT NULL DEFAULT 'intake',
  priority VARCHAR(20) DEFAULT 'medium',
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT clock_timestamp()
);

CREATE TABLE audit_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  action VARCHAR(100) NOT NULL,
  payload_diff JSONB NOT NULL,
  timestamp TIMESTAMPTZ DEFAULT clock_timestamp()
);

-- RLS Enforcement
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_events ENABLE ROW LEVEL SECURITY;`,
    apiCategories: ["All", "Operations", "Audit & Reporting"],
    apiSpecifications: defaultApis,
    apiEndpoints: defaultApis,
    metrics: {
      tableCount: `${defaultTables.length} Entities`,
      apiCount: `${defaultApis.length} Routes`,
      multiTenancy: "org_id RLS",
      compliance: "SOC 2 / ISO 27001",
    },
  };
}

// Backward-compatible exports
export const DATABASE_TABLES = HR_DATABASE_TABLES;
export const POSTGRES_DDL_SCHEMA = HR_DDL_SCHEMA;
export const BIZMITRA_ERD_DIAGRAM = HR_ERD_DIAGRAM;
export const API_SPECIFICATIONS = HR_API_SPECIFICATIONS;
