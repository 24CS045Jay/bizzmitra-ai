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

