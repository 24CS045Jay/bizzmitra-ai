# DAY 1 — Multi-Modal Intake & Workspace Foundation

## 1. What We Built Today
Today, we built the foundational entry point of **BizzMitra-AI**: the **Multi-Modal Intake Engine** and **Context-Connected Workspace Initializer**. 

Instead of forcing users to start with a blank text box, the platform now accepts business information in **5 distinct modalities**:
1. **Plain-Text Problem Prompt**: Describe a problem naturally or pick from curated industry scenarios (including our flagship **TalentCraft HR Consultancy**).
2. **Business Document Upload**: Drag-and-drop simulator for `.pdf`, `.docx`, `.pptx`, and `.brd` files that simulates structured entity extraction.
3. **Website URL Analyzer**: Input an existing company website domain (e.g., `https://talentcraft-staffing.in`) to extract company profile, industry, and detected service gaps.
4. **Voice Input Simulator**: Press-to-speak audio interaction with animated waveform visualization and automatic transcription into the workspace context.
5. **Existing Systems & Processes**: Dedicated inputs for legacy spreadsheets, WhatsApp channels, and operational bottlenecks.

We also introduced a **Dual Operating Mode**:
- 🚀 **Direct Track ("I know what to build")**: For technical users with clear specifications.
- 💡 **AI Guided Track ("I need recommendations")**: For startups and non-technical founders where the AI Business Consultant will run a structured discovery interview.

Finally, we implemented **Multilingual Support** (English + हिन्दी) and wired the entire intake to save persistent business context in Supabase PostgreSQL with an offline/local storage fallback, linking directly into the sidebar (`AppShell`) and downstream discovery (`workspace.discovery.tsx`).

---

## 2. Features Implemented

| Feature | Status | Details |
| :--- | :--- | :--- |
| **Workspace Creation (Name, Industry, Goals, Constraints)** | **IMPLEMENTED** | Validated form saving to Supabase `workspaces` table with localStorage backup. |
| **Plain Text Problem Statement** | **IMPLEMENTED** | Multi-line auto-resizing text input with curated scenario chips. |
| **Flagship HR Consultancy Scenario** | **IMPLEMENTED** | `TalentCraft HR Consultancy` seed data with candidate, client, and attendance context. |
| **Document Upload Simulator (PDF, DOCX, PPTX, BRD)** | **MOCKED/SIMULATED** | Drag-and-drop UI with realistic progress animation and entity extraction card. |
| **Website URL Analyzer** | **MOCKED/SIMULATED** | Domain ingestion with crawling animation and business profile synthesis. |
| **Voice Input Simulator** | **MOCKED/SIMULATED** | Mic button with dynamic equalizer waveform and auto-transcription into context. |
| **Dual Operating Modes (Direct vs AI Guided)** | **IMPLEMENTED** | Visual mode toggle persisted in context and displayed in the sidebar badge. |
| **Multilingual Switcher (English + हिन्दी)** | **IMPLEMENTED** | Dynamic language toggle updating all intake headers, labels, and placeholders. |
| **Supabase DB Synchronization** | **IMPLEMENTED** | Creates records in `workspaces` and `uploaded_documents` tables. |
| **AppShell Context Connection** | **IMPLEMENTED** | Sidebar reflects active workspace name, industry, mode badge, and language. |
| **Downstream Discovery Connection** | **IMPLEMENTED** | `workspace.discovery.tsx` reads persisted context to seed the AI interview. |

---

## 3. User Flow

```text
User opens "/workspace/new"
       │
       ▼
Selects Language (EN / हिन्दी) & Operating Mode (Direct / AI Guided)
       │
       ▼
Chooses Intake Modality:
┌──────────────┬──────────────┬──────────────┬──────────────┬──────────────┐
│ Text Prompt  │ Upload File  │ Website URL  │ Voice Input  │ Legacy Tools │
│ (e.g. HR CRM)│ (PDF/BRD)    │ (Domain Crawl│ (Equalizer   │ (Spreadsheet │
│              │ Progress bar)│ Extractor)   │ Transcribe)  │ Bottlenecks) │
└──────┬───────┴──────┬───────┴──────┬───────┴──────┬───────┴──────┬───────┘
       └──────────────┴───────┬──────┴──────────────┴──────────────┘
                              ▼
           Form Populates Structured Business Context
               (Name, Industry, Problem, Goals, Gaps)
                              │
                              ▼
           User clicks "Create Workspace & Start AI Discovery"
                              │
                              ▼
        ┌─────────────────────┴─────────────────────┐
        ▼                                           ▼
[Online with Auth]                         [Offline / Guest]
Insert to Supabase DB:                     Store in localStorage:
• public.workspaces                        • bizzmitra.activeWorkspaceId
• public.uploaded_documents                • bizzmitra.workspaceContext
        │                                           │
        └─────────────────────┬─────────────────────┘
                              ▼
AppShell Sidebar updates active badge: [TalentCraft HR | AI Guided]
                              │
                              ▼
Navigation to "/workspace/discovery" with context locked in
```

---

## 4. Frontend Architecture

### 1. `src/routes/workspace.new.tsx`
- **Purpose**: Primary intake screen handling multi-modal business problem capture.
- **Key State Variables**:
  - `lang`: `"en" | "hi"` — Controls active UI dictionary.
  - `mode`: `"know" | "consult"` — Operating mode selection.
  - `activeTab`: `"prompt" | "upload" | "url" | "voice" | "legacy"` — Currently selected ingestion tab.
  - `businessName`, `industry`, `problemStatement`, `goals`, `constraints`: Structured context fields.
  - `uploading`, `uploadProgress`, `uploadedDoc`: Manages file ingestion simulation.
  - `analyzingUrl`, `urlExtracted`: Manages domain scraping simulation.
  - `recording`, `recordingSeconds`: Manages voice equalizer simulation.
- **Connections**: 
  - Submits to Supabase client (`supabase.from("workspaces").insert()`).
  - Stores backup context in `localStorage`.
  - Routes to `/workspace/discovery`.

### 2. `src/components/AppShell.tsx`
- **Purpose**: Persistent app layout and navigation frame across desktop and mobile.
- **Key Functions**:
  - `SidebarContent`: Dynamically reads `bizzmitra.workspaceContext` or queries `workspaces` table to render active workspace name, industry, and mode badge (`[Direct]` vs `[AI Guided]`).
- **Connections**: Wraps all authenticated `/workspace/*` routes.

### 3. `src/lib/demo-data.ts`
- **Purpose**: Centralized seed catalog and dictionary.
- **Exports Added Today**:
  - `HR_CONSULTANCY_PROBLEM`, `HR_DEMO_WORKSPACE`, `DEFAULT_HR_CONTEXT`
  - `URL_ANALYZER_SAMPLES`, `DOCUMENT_PARSE_TEMPLATES`, `VOICE_SAMPLE_TRANSCRIPT`
  - `INTAKE_LANGUAGES` (EN & HI dictionaries).

---

## 5. Backend Architecture

- **Supabase Client Layer** (`src/integrations/supabase/client.ts`):
  - Uses `@supabase/supabase-js` configured with project URL and Anon public key.
  - Communicates directly over PostgREST HTTP protocol.
- **Controller/Service Flow**:
  1. Frontend calls `supabase.from("workspaces").insert({...}).select("id").single()`.
  2. If a document is ingested, calls `supabase.from("uploaded_documents").insert({...})`.
  3. Row Level Security (RLS) validates `owner_id = auth.uid()`.
  4. In the event of network failure or unauthenticated demo sessions, graceful fallback stores context in `localStorage` so the user is never blocked.

---

## 6. API Documentation

### 1. Create Workspace
- **Method**: `POST /rest/v1/workspaces` (via PostgREST)
- **Header**: `Authorization: Bearer <user_token>`, `apikey: <anon_key>`
- **Request Body**:
  ```json
  {
    "owner_id": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
    "name": "TalentCraft HR Consultancy",
    "problem_statement": "I am starting an HR consultancy...",
    "maturity_score": 54,
    "ai_readiness_score": 81,
    "status": "active"
  }
  ```
- **Response (201 Created)**:
  ```json
  {
    "id": "c3e1467a-1234-4567-89ab-cdef01234567"
  }
  ```

### 2. Register Uploaded Document Metadata
- **Method**: `POST /rest/v1/uploaded_documents`
- **Request Body**:
  ```json
  {
    "workspace_id": "c3e1467a-1234-4567-89ab-cdef01234567",
    "file_name": "TalentCraft_Recruitment_BRD_v2.pdf",
    "file_type": "PDF",
    "storage_path": "simulated/TalentCraft_Recruitment_BRD_v2.pdf"
  }
  ```

---

## 7. Database Architecture

```text
┌───────────────────────────┐         ┌───────────────────────────┐
│        workspaces         │         │    uploaded_documents     │
├───────────────────────────┤         ├───────────────────────────┤
│ id (UUID, PK)             │◄───┐    │ id (UUID, PK)             │
│ owner_id (UUID, FK)       │    └───┼──workspace_id (UUID, FK)   │
│ name (TEXT)               │         │ file_name (TEXT)          │
│ problem_statement (TEXT)  │         │ file_type (TEXT)          │
│ status (TEXT)             │         │ storage_path (TEXT)       │
│ maturity_score (INT)      │         │ uploaded_at (TIMESTAMPTZ) │
│ ai_readiness_score (INT)  │         └───────────────────────────┘
│ created_at (TIMESTAMPTZ)  │
└───────────────────────────┘
```

---

## 8. Data Flow

```text
[User Form Action]
       │
       ▼
React Component State (workspace.new.tsx)
       │
       ├──► LocalStorage Cache ("bizzmitra.workspaceContext")
       │
       ▼
Supabase Client (@supabase/supabase-js)
       │
       ▼ (HTTPS REST / PostgREST)
PostgreSQL Database ("workspaces" & "uploaded_documents")
       │
       ▼ (Success ID)
TanStack Router: navigate({ to: "/workspace/discovery" })
       │
       ▼
AppShell reads persisted context -> Sidebar updates active workspace badge
```

---

## 9. AI/ML Concepts Used

### 1. Information Extraction (IE) from Unstructured Text
- **Definition**: The automated extraction of specific structured entities (e.g. business goals, pain points, user personas) from unstructured natural language or documents.
- **Why we use it**: Raw business problems contain conversational noise. Transformation blueprints require clean parameters: `Industry`, `Goals`, `Bottlenecks`, and `Constraints`.
- **Status in Prototype**: Simulated in Day 1 via template extraction matching (`DOCUMENT_PARSE_TEMPLATES`, `URL_ANALYZER_SAMPLES`). Production roadmap connects this to a Large Language Model (LLM) with JSON schema validation.

### 2. Deterministic vs. Probabilistic Ingestion
- **Deterministic**: Form field inputs, language dictionary key mapping, database ID generation. These follow exact logical rules with 100% predictable outcomes.
- **Probabilistic**: Text comprehension, entity parsing, speech transcription. These outputs have an associated confidence score (e.g., `0.94` confidence) because language interpretation is non-deterministic.

---

## 10. AI Pipeline

```text
Raw Business Input (Text / Doc / URL / Voice)
       │
       ▼
[Preprocessing]: Format normalization, file type verification
       │
       ▼
[Context Extraction]: Extract entities (Goals, Gaps, Personas, Tools)
       │
       ▼
[Validation]: Verify non-empty problem statement and required fields
       │
       ▼
[Storage]: Persist to Supabase DB + Local context
       │
       ▼
[Downstream Usage]: Consumed by Day 2 AI Discovery Interview
```

---

## 11. Prompt / AI Structure

When an LLM extraction runs in production, the structured prompt schema is:
- **System Instruction**: *"You are an enterprise Business Analyst. Given raw business input, extract the company profile, primary industry, core operational bottlenecks, current tools, and strategic goals into strict JSON format."*
- **Expected JSON Schema**:
  ```json
  {
    "businessName": "string",
    "industry": "string",
    "summary": "string",
    "targetUsers": ["string"],
    "painPoints": ["string"],
    "existingTools": ["string"],
    "goals": ["string"],
    "constraints": ["string"]
  }
  ```

---

## 12. Why We Chose This Architecture

1. **Dual Operating Modes**: Technical architects prefer directly entering their desired tech stack, while startup founders need consultative guidance. Giving the user an explicit mode choice prevents user frustration.
2. **Deterministic Fallbacks**: Competition demos often crash when live AI APIs encounter rate limits or network hiccups. By combining database persistence with `localStorage` context caches and deterministic scenario seeds, our demo is 100% crash-proof.
3. **Neu-Bold-Minimal Theme**: Neumorphic inset text inputs and extruded buttons create a distinct tactile SaaS feel without falling into generic shadcn clichés.

---

## 13. Error Handling

- **Empty Problem Input**: Prevented via `!problemStatement.trim()` disable condition and Sonner toast error notification.
- **Supabase Authentication / Network Error**: Wrapped in `try...catch`; gracefully falls back to local storage context (`ws-${Date.now()}`) and allows the user to proceed seamlessly.
- **Document Parse Errors**: If an unrecognized file is dropped, the simulator gracefully falls back to the default `pdf` template.

---

## 14. Security

- **Implemented**:
  - Supabase Row Level Security (RLS) on `workspaces` table requiring `auth.uid() = owner_id`.
  - Client-side sanitization of text inputs.
  - Zero API keys or private secrets in client-side code.
- **Future / Production Roadmap**:
  - Antivirus scanning on uploaded binary documents.
  - Enterprise SSO / SAML integration.
  - Data Loss Prevention (DLP) to scrub sensitive PII from uploaded documents before LLM ingestion.

---

## 15. Important Code Files

| File | Purpose | What to Understand |
| :--- | :--- | :--- |
| [`src/routes/workspace.new.tsx`](file:///c:/Chaos2Commit/bizzmitra-ai/src/routes/workspace.new.tsx) | Multi-modal intake screen | Tab state, simulated extractors, dual modes, and Supabase workspace creation. |
| [`src/lib/demo-data.ts`](file:///c:/Chaos2Commit/bizzmitra-ai/src/lib/demo-data.ts) | Central data models & dictionary | `HR_CONSULTANCY_PROBLEM`, multi-modal templates, and `INTAKE_LANGUAGES`. |
| [`src/components/AppShell.tsx`](file:///c:/Chaos2Commit/bizzmitra-ai/src/components/AppShell.tsx) | Core application layout | How the sidebar reads the active workspace context and mode dynamically. |
| [`src/routes/workspace.discovery.tsx`](file:///c:/Chaos2Commit/bizzmitra-ai/src/routes/workspace.discovery.tsx) | Discovery chat screen | How the discovery interview loads the newly persisted problem statement. |

---

## 16. Explain Like I'm New

1. **Multi-Modal Intake**: A system that can take information in different formats (text, PDF, audio, web link) rather than just a standard keyboard input.
2. **Context Persistence**: Remembering what the user typed so that other screens (like the AI chat or architecture diagram) already know about their business without asking again.
3. **Local Storage Fallback**: A browser feature that saves data on your computer's hard drive so the website still works even if the cloud server is temporarily unreachable.
4. **PostgREST**: A tool that automatically turns a PostgreSQL database into a REST API without writing custom backend controller code for every table.
5. **Dual Operating Modes**: Offering two paths through an app—one fast track for experts who know what they want, and one guided track for beginners who want advice.

---

## 17. What I Should Personally Inspect

- [ ] Open [`src/routes/workspace.new.tsx`](file:///c:/Chaos2Commit/bizzmitra-ai/src/routes/workspace.new.tsx) and see how `handleSimulateUpload` uses `setInterval` to animate the progress bar.
- [ ] Inspect `INTAKE_LANGUAGES` in [`src/lib/demo-data.ts`](file:///c:/Chaos2Commit/bizzmitra-ai/src/lib/demo-data.ts) to see how translation keys are structured.
- [ ] Inspect `createWorkspace()` in [`src/routes/workspace.new.tsx`](file:///c:/Chaos2Commit/bizzmitra-ai/src/routes/workspace.new.tsx) to see how data is written to Supabase and cached in `localStorage`.

---

## 18. Testing

1. **Normal Case (Text Prompt)**:
   - Click the "I am starting an HR consultancy..." chip.
   - Click "Create Workspace & Start AI Discovery".
   - Verify sidebar updates to `TalentCraft HR Consultancy` and discovery chat opens with the problem statement.
2. **Document Upload Case**:
   - Select the "Upload Documents" tab.
   - Click "Drop Sample BRD (.PDF)".
   - Observe upload progress (0% -> 100%) and verify that the extracted summary card appears.
3. **URL Analyzer Case**:
   - Select the "Website URL" tab.
   - Click "Analyze Website".
   - Observe 1.4s crawling state and check the extracted domain details.
4. **Voice Input Case**:
   - Select "Voice Input" tab.
   - Click the microphone button and observe the animated equalizer sound waves.
5. **Empty Input Case**:
   - Clear the problem textarea and attempt to click "Create Workspace".
   - Verify button is disabled or triggers a validation error.

---

## 19. Judge Questions & Defensible Answers

**Q: "Did you build actual document parsing or is it simulated?"**  
*A: "In today's prototype phase, document extraction is a simulated intelligence pipeline backed by pre-structured extraction schemas (`DOCUMENT_PARSE_TEMPLATES`). The user experience, entity mapping, and downstream context persistence are fully functional, and the extraction function is cleanly isolated behind a service boundary ready to connect to an OCR/LLM document parser like Google Document AI or LlamaParse."*

**Q: "How does the platform prevent the downstream modules from forgetting what the user entered?"**  
*A: "We created a centralized `bizzmitra.workspaceContext` schema that stores the business name, industry, goals, constraints, and source details in both Supabase and browser session storage. Every downstream module (Discovery, Solution, Architecture) reads from this single source of truth."*

---

## 20. Limitations

- Real PDF binary byte parsing and OCR are currently simulated.
- Speech-to-text uses a realistic timer-based audio waveform simulator rather than the Web Speech API or Whisper.
- Hindi language translations cover core intake UI labels; deep AI reasoning responses in Hindi are scheduled for subsequent phases.

---

## 21. What I Learned Today

- How to build a multi-modal user interface that handles text, documents, URLs, and audio inputs.
- How to structure persistent workspace context so downstream components don't lose user intent.
- How to write deterministic fallback logic to make a competition prototype completely resilient.

---

## 22. What Connects To Tomorrow

Tomorrow (**Day 2: AI Business Consultant + Discovery Engine**), we will consume the business context created today. The AI Discovery interview will parse the missing information, detect ambiguities, and generate the formal **Business Analysis Engine** deliverables (Current State, Gap Analysis, and Future State).
