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

