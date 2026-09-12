# Day 5 — Technical Learning: Technical Blueprint Engine (HLD/LLD, BPMN & APIs)

> Engineering journal for Day 5 of the BizzMitra-AI 8-day sprint (September 12, 2026).
> This document covers the technical concepts, implementation patterns, and design decisions
> used to build the Architecture Builder (HLD/LLD), Process Intelligence (BPMN 2.0), and Database & API Designer.

---

## 1. High-Level (HLD) & Low-Level (LLD) Architectural Modeling

In modern AI-first business architecture, systems must balance synchronous user interactions (low latency) with heavy asynchronous operations (LLM scoring, document parsing, OCR).

### Multi-Tier Architecture Pattern
In `src/lib/architecture-data.ts`, we established a 5-tier architecture:
1. **Presentation Tier**: Vite SPA with TanStack Router, Tailwind CSS, and Neumorphic design primitives.
2. **Edge & API Gateway**: Cloudflare Workers / Traefik handling SSL termination, JWT authentication, tenant identification, and distributed rate limiting (600 req/min).
3. **Core Application Tier**: Node.js & Go microservices executing recruitment CRM business logic, permission checks, and transactional mutations.
4. **Asynchronous AI Pipeline**: Redis & BullMQ task queues executing background resume extraction, semantic vector embedding generation, and multi-model LLM inference.
5. **Persistence & Cache Tier**: PostgreSQL 16+ with Row Level Security (RLS) for transactional isolation, alongside Redis 7 cluster for real-time state and session caching.

### Interactive Component Inspector Drawer
To eliminate static architecture diagrams, the Architecture Builder implements an interactive slide-out inspector:
- Clicking any node in the component directory opens a deep-dive specification containing:
  - **Technology Stack & Runtime**: Framework, language, and deployment runtime.
  - **Security Policies**: Authentication protocol, rate limits, and encryption standards.
  - **Data Contracts**: Inbound and outbound JSON schemas with validation rules.
  - **Scaling & SLA Targets**: P95 latency thresholds, availability SLA (99.95%), and auto-scaling rules.

---

## 2. BPMN 2.0 Process Modeling & Bottleneck Analysis

BizzMitra-AI's core value proposition is transforming manual, spreadsheet-bound enterprise workflows into automated intelligence pipelines.

### As-Is vs. To-Be Comparative Modeling
In `src/lib/process-data.ts` and `src/routes/workspace.process.tsx`, the process is modeled across two contrasting states:
- **As-Is Manual Workflow (14.2 Days Cycle Time)**:
  - Resumes submitted across disparate emails and WhatsApp messages.
  - Recruiter manually downloads attachments and types metadata into spreadsheets.
  - Phone-tag follow-ups causing 3+ days delay.
  - Email attachments sent to corporate clients with no SLA tracking.
  - Paper-based attendance tracking causing payroll discrepancies and revenue leakage.
- **To-Be Automated Pipeline (2.4 Days Cycle Time — 83% Faster)**:
  - Automated ingestion and OCR extraction in 30 seconds.
  - AI semantic qualification and star scoring within 2 minutes.
  - Real-time client review portal with 1-click interview approval.
  - Cryptographic smart attendance punch clock with automated billing export.

### 4-Tier BPMN Swimlane Architecture
A sequence diagram formalizes the interaction contracts across four organizational tiers:
- **Candidate / Consultant**: Submits application, logs punch-in/out.
- **Agency Recruiter**: Reviews AI match scores, fine-tunes custom attributes in Solution Studio, advances pipeline stages.
- **BizzMitra AI Engine**: Asynchronously extracts metadata, scores candidates against job requirements, and updates CRM state.
- **Corporate Client**: Interacts through a dedicated portal to approve shortlists with zero email overhead.

---

## 3. Multi-Tenant Relational Database Design with PostgreSQL RLS

Enterprise SaaS applications require rigorous tenant data isolation to prevent cross-customer leakage.

### Row Level Security (RLS) Pattern
Rather than maintaining separate physical databases per client, BizzMitra leverages PostgreSQL Row Level Security:
```sql
ALTER TABLE candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance_punches ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation_candidates ON candidates
    FOR ALL
    USING (org_id = current_setting('app.current_org_id')::UUID);
```

### Relational Schema Design
The schema in `src/lib/database-data.ts` defines six mission-critical entities:
- `organizations`: Tenant metadata, subscription tier, and custom workspace settings.
- `candidates`: Resume entities, technical skills array (`TEXT[]`), AI ratings, and stage tracking.
- `candidate_custom_fields`: Dynamic attributes defined at runtime via Solution Studio.
- `clients`: Corporate partner profiles with hourly billing rates and portal permissions.
- `attendance_punches`: Geolocation-verified punch timestamps calculating billable hours.
- `audit_logs`: Append-only, tamper-evident security audit trail for SOC 2 and GDPR compliance.

### One-Click Schema Export
The DDL script can be copied to the clipboard or downloaded directly as `bizzmitra_schema_v1.sql` for instant deployment to Supabase, Neon, AWS RDS, or local Docker environments.

---

## 4. RESTful API Specification & Developer Ergonomics

In `src/routes/workspace.data.tsx`, all core operations are documented according to OpenAPI 3.1 standards:
- Clear HTTP method tagging (`GET`, `POST`, `PUT`, `DELETE`).
- Explicit authentication requirements (Bearer JWT vs. Client Token).
- Request and Response JSON schemas with real-world recruitment payloads.
- One-click copyable cURL commands for direct terminal testing.

---

## 5. Summary of Achievements for Day 5

| Feature Area | Key Deliverable | Value Delivered |
|---|---|---|
| **Architecture** | High-Level & Low-Level Diagrams | Full system clarity across Presentation, Edge, Core, and AI pipelines |
| **Inspection** | Interactive Node Drawer | Detailed tech specs, security, data contracts, and SLA matrix |
| **Process Model** | As-Is vs To-Be BPMN | Visual proof of 83% cycle time reduction (14.2d -> 2.4d) |
| **Orchestration**| 4-Tier Swimlane Flow | Clear division of responsibility across Candidate, Recruiter, AI & Client |
| **Data Architecture** | ERD & PostgreSQL DDL | Production-ready multi-tenant schema with RLS and dynamic custom fields |
| **Developer Hub** | RESTful API Explorer | OpenAPI schemas with live cURL generation and payload inspectors |
