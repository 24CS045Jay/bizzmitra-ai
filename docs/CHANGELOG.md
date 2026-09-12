# Changelog — BizzMitra-AI

All notable changes across the 8-day engineering sprint will be documented in this file.

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
