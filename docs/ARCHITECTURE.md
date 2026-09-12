# BizzMitra-AI System Architecture

> True Current State Architecture as of Day 2 (September 11, 2026)

```text
                                  CLIENT TIER
                 ┌───────────────────────────────────────────┐
                 │          Browser / Mobile / Tablet        │
                 │      React 19.2 + Tailwind CSS v4         │
                 │          Framer Motion Animation          │
                 └─────────────────────┬─────────────────────┘
                                       │
                         TanStack Router / Start
                                       │
                                       ▼
                             PRESENTATION ROUTES
   ┌───────────────────┬───────────────────┬───────────────────┬───────────────────┐
   │    Landing & Auth │  Multi-Modal      │  AI Discovery &   │  Solution Engine  │
   │  "/" & "/login"   │  Intake Page      │  Analysis Engine  │  "/solution"      │
   │                   │  "/workspace/new" │  "/discovery"     │  + Downstream     │
   └───────────────────┴─────────┬─────────┴─────────┬─────────┴───────────────────┘
                                 │                   │
                                 ▼                   ▼
                     STATE & PERSISTENCE LAYER
        ┌─────────────────────────────────────────────────────┐
        │ 1. LocalStorage Context ("bizzmitra.workspaceCtx")  │
        │ 2. React Context ("useAuth")                        │
        │ 3. Supabase JS Client (PostgREST API Engine)        │
        └──────────────────────────┬──────────────────────────┘
                                   │
                                   ▼
                            DATABASE TIER
                        ┌─────────────────────┐
                        │ Supabase PostgreSQL │
                        ├─────────────────────┤
                        │ • workspaces        │
                        │ • uploaded_documents│
                        │ • discovery_messages│
                        │ • artifacts         │
                        │ • profiles          │
                        │ • workspace_members │
                        └─────────────────────┘
```

---

## Component Architecture Overview

### 1. Frontend Framework
- **Core**: React 19.2.0 + TypeScript 5.8.3
- **Build & Dev Tool**: Vite 8.1.5 with TanStack Start Nitro plugin
- **Routing**: `@tanstack/react-router` with file-based routing in `src/routes/`
- **Styling**: Tailwind CSS v4 (`@tailwindcss/vite`) with custom **Neu-Bold-Minimal** tokens (`.neu`, `.neu-inset`, `.neu-press`, `.neu-sm`) and Warm Graphite palette
- **Icons**: Lucide React (`lucide-react`)
- **Visuals & Motion**: Motion (`motion/react`), Mermaid.js (`mermaid`), Recharts (`recharts`)

### 2. Backend & Data Tier
- **Database**: Supabase PostgreSQL 14.5
- **Communication Protocol**: PostgREST over HTTPS via `@supabase/supabase-js`
- **Security**: PostgreSQL Row Level Security (RLS) policies based on `auth.uid() = owner_id`

### 3. AI Discovery & Business Analysis Engine (Day 2)
- **Missing Information Detector**: Identifies omitted business dimensions (scale, integrations, compliance) and provides architectural rationale ("Why we ask").
- **Goal-Oriented Slot Filling**: Dynamic multi-turn interview with context maturity scoring (38% → 62% → 88% → 96%).
- **Futurrizon Business Analysis Engine**: Synthesizes current-state (As-Is) vs future-state (To-Be), stakeholder matrices, gap analysis with severity tags, and quantified transformation KPI impact.
- **Downstream Solution Handoff**: Auto-populates solution pillars, architecture recommendations, and build-vs-buy analysis in `/workspace/solution`.

### 4. AI Service Boundary
- Isolated service interface in `src/lib/ai/generate-artifact.ts`.
- Separates frontend UI from LLM/generation logic.
- Currently serves high-fidelity seed payloads with simulated delay and step transitions, ready for zero-downtime LLM provider swap.

### 5. Interactive HR CRM Module (Day 3 — USP #1)
- **Route**: `/workspace/solution/crm` (`src/routes/workspace.solution.crm.tsx`)
- **Candidate Pipeline Engine**: React state-managed CRUD table with 15 seed records. Pipeline stages (Screening → Interview → Offer → Rejected) rendered as animated tabbed filters with count badges.
- **Search & Filter**: Full-text search across name/role/email fields, multi-filter panel with status dropdown and experience range sliders.
- **Add Candidate Modal**: Form-based candidate entry with validation, immediately appends to live pipeline state.
- **CSV Export**: Client-side CSV generation via `Blob` API — exports the currently filtered candidate roster as a timestamped `.csv` file.
- **Attendance Punch Clock**: Punch-in/out toggle with live elapsed timer (`setInterval`-based), punch log history table, and automatic hours calculation.
- **Data Layer**: All CRM state is managed in-memory via React `useState` hooks. Types (`CRMCandidate`, `AttendanceEntry`) and seed data live in `src/lib/demo-data.ts`.

### 6. Solution Builder Module (Day 3)
- **Route**: `/workspace/solution` (`src/routes/workspace.solution.tsx`)
- **4-Module Recommendation Grid**: Core ATS, Client Portal, Smart Attendance, Analytics Engine — each with icon, status badge, description, and feature checklist.
- **Build vs. Buy vs. Hybrid Decision Matrix**: Multi-dimensional scoring (Cost, Speed, Control, Fit) with visual bar indicators and verdict badges.
- **Navigation Chain**: Breadcrumb chain updated in `ArtifactHeader.tsx` to include CRM step. Sidebar nav updated in `AppShell.tsx`.

### 7. Solution Studio & Dynamic Schema Customizer (Day 4 — USP #2)
- **Component**: `src/components/SolutionStudioDrawer.tsx`
- **State Store**: `src/lib/solution-studio.ts`
- **Slide-Out Studio Drawer**: Persistent slide-out drawer accessible from both `/workspace/solution` and `/workspace/solution/crm`.
- **Dynamic Field Builder**: Enables non-technical users to extend candidate schema at runtime by adding custom attributes (e.g. `LinkedIn URL`, `Notice Period`, `Expected CTC`, `Portfolio`). Supports attribute typing (`text`, `number`, `url`, `select`, `date`), auto-slugified keys, placeholders, default values, and required constraints.
- **UI Customizer**:
  - Theme accent palette switcher (Teal, Indigo, Amber, Rose, Violet, Cyan).
  - Table density controller (`compact`, `comfortable`, `spacious`).
  - Zebra alternating rows and soft neumorphic depth toggles.
  - Column visibility toggles for both standard columns and custom attributes.
- **Cross-Component Reactivity**: Broadcasts `bizzmitra:studio-updated` `CustomEvent` alongside `localStorage` synchronization to immediately reconcile views across active routes with zero page reload.

### 8. AI Regeneration Engine (Day 4 — USP #2)
- **Component**: `src/components/AIRegenerationModal.tsx`
- **Multi-Step Animated Synthesis Pipeline**:
  1. *Schema AST Analysis*: Validates custom field types, uniqueness, and constraints.
  2. *Data Pipeline Adjustment*: Reconciles candidate records and in-memory indices.
  3. *CRM View Rebuilding*: Re-renders table columns, dynamic forms, and CSV serializers.
  4. *Theme & Density Synthesis*: Applies neumorphic tokens, color classes, and spacing variables.
- **Solution Versioning**: Automatically increments version from `v1.0` to `v1.1`, synthesizing changelog summaries and recording timestamped audit history in `StudioVersionEntry`.

### 9. Architecture Builder & Interactive Component Inspector (Day 5)
- **Route**: `/workspace/architecture` (`src/routes/workspace.architecture.tsx`)
- **Data Model**: `src/lib/architecture-data.ts`
- **High-Level Architecture (HLD)**: Mermaid diagram detailing presentation, API gateway, core microservices, background AI processing queue, and multi-tenant persistence.
- **Low-Level Architecture (LLD)**: Sequence diagram tracing synchronous HTTP workflows (candidate ingestion, stage changes) and asynchronous BullMQ jobs (OCR extraction, vector generation).
- **Interactive Component Inspector**: Slide-out drawer displaying technology stack, runtime environment, security protocols, inbound/outbound data contracts, and scaling considerations for all 7 architectural components.
- **Security & SLA Compliance Matrix**: Latency (P95), availability SLAs (99.95%), encryption standards (TLS 1.3, AES-256), and rate limiting policies.

### 10. Process Intelligence & BPMN 2.0 Engine (Day 5)
- **Route**: `/workspace/process` (`src/routes/workspace.process.tsx`)
- **Data Model**: `src/lib/process-data.ts`
- **As-Is vs. To-Be Comparative Modeling**: Visual comparison proving an 83% cycle time reduction (14.2 days manual down to 2.4 days automated). Features split, manual-only, and automated-only view filters.
- **4-Tier BPMN Swimlane Flow**: Sequence diagram establishing operational handoffs between Candidates/Consultants, Agency Recruiters, BizzMitra AI Engine, and Corporate Clients.
- **Bottleneck Resolution Engine**: Identifies root causes, business impacts, and quantified time savings across resume screening, client feedback loops, and timesheet disputes.

### 11. Database Designer & RESTful API Surface (Day 5)
- **Route**: `/workspace/data` (`src/routes/workspace.data.tsx`)
- **Data Model**: `src/lib/database-data.ts`
- **Entity-Relationship Diagram (ERD)**: Crow's Foot ERD detailing `organizations`, `candidates`, `candidate_custom_fields`, `clients`, `attendance_punches`, and `audit_logs`.
- **Table Schema Dictionary**: Interactive explorer of table fields, primary keys, foreign keys, data types, and constraint definitions.
- **PostgreSQL 16+ DDL Script**: Copyable and downloadable SQL script (`bizzmitra_schema_v1.sql`) featuring Row Level Security (RLS) policies for multi-tenant isolation.
- **RESTful API Specifications**: OpenAPI 3.1 compatible endpoint documentation with HTTP method indicators, request/response JSON schemas, authentication scopes, and instant cURL command generators.

