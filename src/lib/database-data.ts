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
  category: "core" | "recruitment" | "operations" | "security";
  columns: ColumnDef[];
}

export const DATABASE_TABLES: TableDef[] = [
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

export const POSTGRES_DDL_SCHEMA = `-- ==========================================================
-- BizzMitra-AI Multi-Tenant Enterprise PostgreSQL Schema
-- Generated: 2026-09-12 | Target: PostgreSQL 16+
-- Extensions: pgcrypto, btree_gist
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
CREATE INDEX IF NOT EXISTS idx_attendance_org_dates ON attendance_punches(org_id, punch_in);
CREATE INDEX IF NOT EXISTS idx_audit_org_created ON audit_logs(org_id, created_at DESC);

-- Multi-Tenant Row Level Security (RLS)
ALTER TABLE candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidate_custom_fields ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance_punches ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Tenant Isolation Policies
CREATE POLICY tenant_isolation_candidates ON candidates
    FOR ALL
    USING (org_id = current_setting('app.current_org_id')::UUID);

CREATE POLICY tenant_isolation_attendance ON attendance_punches
    FOR ALL
    USING (org_id = current_setting('app.current_org_id')::UUID);
`;

export const BIZMITRA_ERD_DIAGRAM = `erDiagram
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
        text_array skills
        string current_ctc
        string expected_ctc
        string notice_period
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
        jsonb payload_diff
        timestamptz created_at
    }
`;

export interface ApiEndpointItem {
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  path: string;
  summary: string;
  auth: string;
  category: "Recruitment" | "Solution Studio" | "Operations" | "Client Portal";
  requestBody?: string;
  responseBody: string;
  curlExample: string;
}

export const API_SPECIFICATIONS: ApiEndpointItem[] = [
  {
    method: "GET",
    path: "/api/v1/candidates",
    summary: "Retrieve filtered list of candidate profiles with AI scores and stages",
    auth: "Bearer JWT",
    category: "Recruitment",
    responseBody: `{
  "data": [
    {
      "id": "cnd_01j78ab",
      "fullName": "Priya Sharma",
      "role": "Senior React Engineer",
      "aiScore": 4.8,
      "pipelineStage": "Interview",
      "skills": ["React", "TypeScript", "Node.js"]
    }
  ],
  "total": 48,
  "page": 1
}`,
    curlExample: `curl -X GET "https://api.bizzmitra.ai/v1/candidates?stage=Interview" \\
  -H "Authorization: Bearer YOUR_API_KEY"`,
  },
  {
    method: "POST",
    path: "/api/v1/candidates",
    summary: "Create and score candidate profile with automatic resume parsing",
    auth: "Bearer JWT",
    category: "Recruitment",
    requestBody: `{
  "fullName": "Amit Verma",
  "email": "amit.v@example.com",
  "phone": "+91 98765 43210",
  "role": "Full Stack Developer",
  "skills": ["React", "Go", "PostgreSQL"],
  "expectedCtc": "22 LPA",
  "noticePeriod": "30 Days"
}`,
    responseBody: `{
  "success": true,
  "candidate": {
    "id": "cnd_02k91zx",
    "aiScore": 4.6,
    "pipelineStage": "Screening",
    "status": "Active"
  }
}`,
    curlExample: `curl -X POST "https://api.bizzmitra.ai/v1/candidates" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"fullName":"Amit Verma","email":"amit@example.com","role":"Full Stack Developer"}'`,
  },
  {
    method: "PUT",
    path: "/api/v1/candidates/{id}/stage",
    summary: "Transition candidate between Kanban pipeline stages with automated triggers",
    auth: "Bearer JWT",
    category: "Recruitment",
    requestBody: `{
  "pipelineStage": "Client Review",
  "note": "AI match score 4.8 exceeds client threshold"
}`,
    responseBody: `{
  "success": true,
  "candidateId": "cnd_01j78ab",
  "newStage": "Client Review",
  "notificationSent": true
}`,
    curlExample: `curl -X PUT "https://api.bizzmitra.ai/v1/candidates/cnd_01j78ab/stage" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"pipelineStage":"Client Review"}'`,
  },
  {
    method: "POST",
    path: "/api/v1/attendance/punch",
    summary: "Log real-time consultant punch in/out with geolocation and timestamp verification",
    auth: "Bearer JWT",
    category: "Operations",
    requestBody: `{
  "candidateId": "cnd_01j78ab",
  "action": "punch_in",
  "latitude": 28.6139,
  "longitude": 77.2090
}`,
    responseBody: `{
  "status": "active",
  "punchInTime": "2026-09-12T09:00:00Z",
  "verified": true
}`,
    curlExample: `curl -X POST "https://api.bizzmitra.ai/v1/attendance/punch" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"candidateId":"cnd_01j78ab","action":"punch_in"}'`,
  },
  {
    method: "GET",
    path: "/api/v1/attendance/timesheets/export",
    summary: "Generate and export billing timesheet CSV for corporate client reconciliation",
    auth: "Bearer JWT",
    category: "Operations",
    responseBody: `[CSV attachment streamed with headers candidate_id, hours, date, client]`,
    curlExample: `curl -X GET "https://api.bizzmitra.ai/v1/attendance/timesheets/export?month=2026-09" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  --output timesheets-sept-2026.csv`,
  },
  {
    method: "GET",
    path: "/api/v1/client-portal/shortlists",
    summary: "External client API to view shortlisted candidates ready for interview approval",
    auth: "Client Token",
    category: "Client Portal",
    responseBody: `{
  "client": "Nexus Enterprises",
  "shortlists": [
    {
      "candidateId": "cnd_01j78ab",
      "fullName": "Priya Sharma",
      "role": "Senior React Engineer",
      "aiScore": 4.8,
      "interviewStatus": "Awaiting Approval"
    }
  ]
}`,
    curlExample: `curl -X GET "https://api.bizzmitra.ai/v1/client-portal/shortlists" \\
  -H "X-Client-Token: client_live_8912739"`,
  },
];
