# Changelog — BizzMitra-AI

All notable changes across the 8-day engineering sprint will be documented in this file.

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
