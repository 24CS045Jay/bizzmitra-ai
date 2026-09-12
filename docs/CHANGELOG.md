# Changelog — BizzMitra-AI

All notable changes across the 8-day engineering sprint will be documented in this file.

## [Day 6] - 2026-09-12: AI Implementation Planning, Dynamic ROI & Connected Artifact Map (USP #3)

### Added
- **AI Implementation Planning Engine (`/workspace/roadmap`)**:
  - 3-phase, 9-week modernization blueprint for TalentCraft HR Consultancy (Foundation Sprint, Coordination Sprint, Intelligence Sprint).
  - Interactive Gantt chart timeline projecting sprint execution schedules over 9 calendar weeks.
  - Milestone checklist with interactive status toggles, category badges, effort days (68 person-days total), and toast notifications.
  - Team resourcing matrix detailing FTE allocation across software disciplines.
  - Enterprise Risk Mitigation Register with likelihood/impact severity scoring and actionable contingency plans.
- **Dynamic ROI Calculator & Financial Transformation Cockpit (`/workspace/insights`)**:
  - Live interactive sliders (Recruiter team size, Monthly applicant volume, Hourly cost, Spreadsheet hours, Automation rate).
  - Real-time recalculation of direct labor savings, capacity revenue expansion, net annual savings, payback period (months), and 3-year cumulative ROI multiple.
  - 36-month cumulative value trajectory Area chart showing the rapid break-even intersection point.
  - Multi-scenario Sensitivity Analysis matrix comparing Conservative, Expected, and Aggressive outcomes.
  - Transformation benchmark comparison cards (Placement turnaround: 28d → 9d; Candidate drop-off: 28% → 6%).
  - Six-dimension organizational readiness radar chart and 1-click executive case copy.
- **Signature USP #3: Connected Artifact Dependency Map (`/workspace/map`)**:
  - Interactive Directed Acyclic Graph (DAG) canvas mapping 11 artifacts across 5 enterprise layers.
  - Bidirectional dependency tracing: Highlights upstream parents in amber (inputs consumed) and downstream derivatives in emerald (outputs produced) with dimming of unrelated nodes.
  - Node Inspector Drawer: Deep-dive artifact metadata, version (`v1.1`), inputs consumed, outputs produced, key metrics, and direct route navigation.
  - Enterprise Provenance Assurance: Formally verifies 100% traceability back to the initial business problem statement.
- **Artifact Navigation Breadcrumb Integration**:
  - Extended `CHAIN` in `src/components/ArtifactHeader.tsx` to include `dashboard` (`/workspace/insights`) and `map` (`/workspace/map`).

## [Day 5] - 2026-09-12: Technical Blueprint Engine (HLD/LLD, BPMN & APIs)


### Added
- **Architecture Builder (`/workspace/architecture`)**:
  - High-Level Architecture (HLD) diagram modeling Client presentation, Cloudflare edge, Go/Node core services, BullMQ AI queues, and PostgreSQL/Redis persistence.
  - Low-Level Architecture (LLD) sequence diagram modeling synchronous and asynchronous API execution flows.
  - Interactive Component Inspector Drawer: Deep-dive inspection of 7 architecture components detailing technology stack, security policies, data contracts, and scaling considerations.
  - Security & SLA Compliance Matrix table covering latency targets (P95 < 80ms), uptime SLAs (99.95%), encryption standards (TLS 1.3, AES-256), and rate limits.
  - One-click copy Mermaid source code for external whiteboard and documentation tools.
- **Process Intelligence & BPMN Engine (`/workspace/process`)**:
  - Comparative As-Is Manual vs. To-Be Automated process models with split, manual-only, and automated-only view toggles.
  - 4-Tier BPMN 2.0 Swimlane sequence diagram formalizing responsibilities between Candidates, Recruiters, AI Engine, and Corporate Clients.
  - Cycle time reduction metrics: Candidate screening (48h -> 30s), Time-to-offer (14.2d -> 2.4d, 83% reduction), and timesheet reconciliation (12h/mo -> real-time).
  - Bottleneck Resolution Analysis: In-depth breakdowns of resume screening, client feedback loops, and timesheet discrepancies with quantified business impact.
- **Database & API Designer (`/workspace/data`)**:
  - Multi-tenant Entity-Relationship Diagram (ERD) with Crow's Foot notation covering `organizations`, `candidates`, `candidate_custom_fields`, `clients`, `attendance_punches`, and `audit_logs`.
  - Table Schema Dictionary: Interactive inspector for all 6 tables with column definitions, data types, constraints, and descriptions.
  - Production-ready PostgreSQL 16+ DDL script with multi-tenant Row Level Security (RLS) policies, indexes, and foreign keys.
  - One-click Copy SQL and Download `bizzmitra_schema_v1.sql` actions.
  - RESTful API Specification Explorer: OpenAPI 3.1 compatible endpoint documentation with HTTP method badges, request/response JSON payloads, and copyable cURL generators.
- **Workspace Context Ribbon**:
  - Added dynamic context banner across all technical blueprint routes displaying active business name, industry, and quick navigation links.

---

## [Day 4] - 2026-09-12: Live Customizer, Field Builder & AI Regeneration (USP #2)

### Added
- **USP #2: Solution Studio Slide-Out Drawer** (`src/components/SolutionStudioDrawer.tsx`):
  - Accessible directly from both the Solution recommendation page (`/workspace/solution`) and the Workable HR CRM (`/workspace/solution/crm`).
  - Spring-animated slide-out drawer with backdrop blur and tabbed interface: "UI & Theme", "Field Builder", and "Versions".
  - **Theme Accent Customizer**: Live switcher supporting 6 color palettes (Teal Mint, Electric Indigo, Warm Amber, Rose Quartz, Cyber Violet, Deep Sky).
  - **Table Layout Density Controls**: Switch between `Compact`, `Comfortable`, and `Spacious` row heights.
  - **Layout Preferences**: Zebra row striping toggle and soft neumorphic depth toggle.
  - **Column Visibility Checklist**: Toggle standard columns (Role, Experience, Stage, Rating, Status, Applied, Notes) in real time.
- **Field Builder & Dynamic Schema Engine** (`src/components/SolutionStudioDrawer.tsx`, `src/lib/solution-studio.ts`):
  - Custom attribute creation form: Label, Key (auto-slugified camelCase), Type (`text`, `number`, `url`, `select`, `date`), Placeholder, Default Value, and Required toggle.
  - **Quick-Add Presets**: One-click chip addition for common recruitment attributes (`LinkedIn URL`, `Notice Period`, `Expected CTC`, `Portfolio / GitHub`, `Current Location`, `Highest Education`).
  - **Active Custom Fields Manager**: Delete, inspect, and preview active schema fields.
  - **Schema Statistics Bar**: Live tally of standard fields (8), custom attributes (N), and total schema count (8 + N).
- **AI Regeneration Engine** (`src/components/AIRegenerationModal.tsx`):
  - Multi-step animated progress overlay simulating real-time schema synthesis:
    1. *"Analyzing updated schema & field constraints…"*
    2. *"Adjusting data pipeline & type definitions…"*
    3. *"Rebuilding CRM views & dynamic table columns…"*
    4. *"Applying theme accent & layout density…"*
  - Solution version incrementing (`v1.0` → `v1.1` → `v1.2` etc.) with automated changelog generation and timestamped version history.
  - Broadcast event dispatcher (`bizzmitra:studio-updated`) syncing all workspace views instantly without page reloads.
- **Dynamic CRM Integration** (`src/routes/workspace.solution.crm.tsx`):
  - Candidate table dynamically displays new custom attributes as additional columns with type-specific badges and external link handlers.
  - **Dynamic Add Candidate Modal**: Automatically generates input controls for any active custom schema fields, storing values in `c.customValues`.
  - **Dynamic CSV Export**: Automatically writes custom column headers and serializes candidate custom attribute values.
  - Real-time zebra striping and density classes applied to candidate records.
- **Solution Page Enhancements** (`src/routes/workspace.solution.tsx`):
  - Solution Studio Trigger Strip displaying active solution version (`v1.0`), custom field count, theme accent, and quick access drawer trigger.

---

## [Day 3] - 2026-09-12: Solution Builder & Workable HR CRM (USP #1)

### Added
- **Solution Builder Enhancements** (`src/routes/workspace.solution.tsx`):
  - 4-module recommendation grid: Core ATS, Client Onboarding Portal, Smart Attendance Tracker, Analytics & Reporting Engine.
  - Each module card displays icon, description, status badge (Core/Recommended/Planned), and feature checklist.
  - **Build vs. Buy vs. Hybrid Decision Matrix** with visual score bars (Cost Efficiency, Delivery Speed, Control, Agency Fit) scored 1–5.
  - CTA button linking to the interactive HR CRM page.
- **USP #1: Interactive Workable HR CRM** (`src/routes/workspace.solution.crm.tsx`):
  - Candidate Pipeline Data Table with 15 realistic talent records (Name, Email, Role, Experience, Stage, Rating, Status, Applied Date, Notes).
  - Pipeline Stage Tabs: All / Screening / Interview / Offer / Rejected with animated count badges and spring-animated active pill.
  - Full-text search bar across name, role, and email fields.
  - Multi-filter panel with Status dropdown, Experience range (min/max) inputs, and "Reset all" button.
  - **Add Candidate Modal**: Form with Name, Email, Role, Experience, Stage, Notes — validates required fields, appends to live table state.
  - **CSV Export**: One-click download of the filtered candidate roster as timestamped `.csv` file.
  - **Attendance Punch Clock**: Punch-in/out toggle button, live session timer (HH:MM:SS), and historical punch log table with 7 seed entries.
- **Navigation Wiring**:
  - Added "HR CRM" entry to sidebar navigation in `AppShell.tsx` with `Users` icon.
  - Added "HR CRM" step to artifact breadcrumb chain in `ArtifactHeader.tsx` between Solution and Architecture.
- **Seed Data** (`src/lib/demo-data.ts`):
  - `HR_SOLUTION_MODULES` — 4 solution module definitions with features.
  - `HR_BUILD_BUY_MATRIX` — 3 decision matrix options with multi-dimensional scores.
  - `HR_CRM_CANDIDATES` — 15 realistic candidate pipeline records.
  - `HR_ATTENDANCE_LOG` — 7 sample attendance punch entries.
  - TypeScript types: `SolutionModule`, `BuildBuyOption`, `CRMCandidate`, `AttendanceEntry`.

---

## [Day 2] - 2026-09-11: AI Business Consultant & Discovery Engine

### Added
- **AI Business Consultant & Discovery Dialogue** (`src/routes/workspace.discovery.tsx`):
  - Added adaptive discovery questions with `DiscoveryQuestionItem` schema (`whyWeAsk`, `missingEntity`, and quick-reply `options`).
  - Added **Missing Information Detector** badges alerting users to what was missing and explaining why it matters for technical architecture.
  - Interactive multi-choice answer chips with custom text input fallback.
  - Dynamic **Context Maturity Tracker** progress bar (advances 38% -> 62% -> 88% -> 96% as questions are answered).
- **Futurrizon Business Analysis Engine** (`src/lib/demo-data.ts`, `src/routes/workspace.discovery.tsx`):
  - Current State (As-Is) vs Future State (To-Be) comparison with operational efficiency scoring.
  - Stakeholder Analysis Matrix covering Recruiters, Clients, Candidates, and Operations Leads.
  - Gap Analysis Matrix with high/critical severity tags across candidate tracking, interview sync, attendance, and analytics.
  - Quantified Transformation Impact with 5 KPI comparison cards.
- **Downstream Solution Recommendation Engine** (`src/routes/workspace.solution.tsx`):
  - Dynamically binds HR Consultancy problem context and discovery responses.
  - Renders 4 recommended solution pillars (Core ATS, Client Portal, Smart Attendance, Analytics).
  - Provides Build vs. Buy trade-off comparison matrix and full technical stack recommendations.
- **Technical Learning Documentation**:
  - Created `/docs/learning/DAY-2.md` with 22 comprehensive technical sections for 5th-semester engineering students.
  - Updated `/docs/learning/AI-ML-CONCEPTS.md` with Slot Filling and Missing Information Detection concepts.
  - Updated `/docs/ARCHITECTURE.md` to document the Discovery and Business Analysis Engine layer.

### Fixed
- Automatically generated and synchronized TanStack route tree in `src/routeTree.gen.ts`.

---

## [Day 1] - 2026-09-11: Multi-Modal Intake & Workspace Foundation


### Added
- **Flagship Demo Scenario**: Introduced `TalentCraft HR Consultancy` seed problem, company profile, and discovery models into `src/lib/demo-data.ts`.
- **Multi-Modal Intake Engine** (`src/routes/workspace.new.tsx`):
  - 5 ingestion tabs: Text prompt, Document upload (PDF/DOCX/PPTX/BRD), Website URL analyzer, Voice input simulator, and Existing systems/processes.
  - Document upload simulator with animated progress bar (0% -> 100%) and extracted summary card.
  - Website URL crawler simulator with company context synthesis.
  - Voice audio equalizer simulator with speech-to-text transcription preview.
- **Dual Operating Modes**:
  - Direct Track: *"I know what to build"* (direct technical generation track).
  - AI Guided Track: *"I need recommendations"* (startup discovery track).
- **Multilingual Support**: Dynamic toggle between English and Hindi (`हिन्दी`) for intake headers, labels, and placeholders.
- **Workspace Context Persistence**:
  - Saved metadata into Supabase PostgreSQL (`workspaces` and `uploaded_documents`).
  - Implemented dual-layer persistence with browser `localStorage` fallback to guarantee crash-proof demo reliability.
- **AppShell Context Integration** (`src/components/AppShell.tsx`):
  - Sidebar dynamically renders the active workspace name, industry, and operating mode badge.
- **Technical Learning Documents**: Created `/docs/learning/DAY-1.md`, `/docs/learning/AI-ML-CONCEPTS.md`, and `/docs/ARCHITECTURE.md`.

### Fixed
- Fixed discovery page context initialization (`src/routes/workspace.discovery.tsx`) so it reads the newly created business problem statement instead of defaulting to a static fallback.

### Known Limitations
- Document parsing and voice transcription are currently prototype simulators with structured extraction templates.
- Deep AI reasoning in Hindi is planned for upcoming phases.
