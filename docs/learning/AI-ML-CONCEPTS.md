# AI/ML Concepts Catalog — BizzMitra-AI

> A living record of the machine learning, natural language processing, and AI architecture concepts actually used across the development of BizzMitra-AI.

---

# 1. Information Extraction (IE) from Unstructured Business Text

## Simple Definition
The process of automatically reading unorganized human text (or documents) and pulling out specific key facts, numbers, and entities into a clean, structured computer table.

## How It Works
Traditional approaches use Named Entity Recognition (NER) models or Regular Expressions. Modern Large Language Models (LLMs) achieve this by reading the text prompt, matching semantic meaning against a requested JSON schema, and populating predefined fields (like `Industry`, `Goals`, and `Constraints`).

## Where BizzMitra Uses It
In **Step 1: Multi-Modal Intake** (`/workspace/new`). When a user enters an HR consultancy problem or uploads a Business Requirements Document (BRD), the system extracts:
- Primary Industry
- Stakeholder Roles (Recruiters, Clients, Candidates)
- Core Bottlenecks
- Current Tools (Spreadsheets, WhatsApp)

## Example
**Input**:
> *"We run an HR consultancy with 8 recruiters. We track candidates in spreadsheets and lose status updates after interview round 2."*

**Extracted JSON**:
```json
{
  "industry": "HR & Recruitment Services",
  "teamSize": 8,
  "existingTools": ["Spreadsheets"],
  "bottleneck": "Lost status updates after interview round 2"
}
```

## Why We Need It
Downstream modules like the Architecture Builder and Process Designer cannot work with vague conversational paragraphs. They need clean, predictable data fields to generate diagrams and technical blueprints.

## Limitations
- In the current Day 1 prototype phase, document extraction is **simulated** using predefined extraction templates (`DOCUMENT_PARSE_TEMPLATES`).
- Real-world LLMs can hallucinate entities or miss implicit business constraints if prompt schemas are not strictly validated.

## What I Should Be Able To Explain To A Judge
> *"We isolate raw user input into a structured business context schema. In production, this runs through an LLM extraction pipeline with JSON schema validation. In our prototype demo, we use a simulated extraction workflow to guarantee high speed, deterministic reliability, and zero risk of rate-limit failures during judging."*

---

# 2. Deterministic vs. Probabilistic Logic in AI Systems

## Simple Definition
- **Deterministic**: Logic where the same input always produces the exact same output (like math: $2 + 2 = 4$, or a database primary key).
- **Probabilistic**: Logic where the output is based on probabilities and likelihoods (like language generation, where the next word has an 85% probability).

## How It Works
Software code like `if/else`, SQL queries, and mathematical formulas are 100% deterministic. Neural networks and LLMs are probabilistic models that predict tokens based on statistical weights learned during training.

## Where BizzMitra Uses It
In the **BizzMitra Hybrid Architecture**:
- **Probabilistic Layer**: Understanding the business problem, answering questions, generating conversational recommendations.
- **Deterministic Layer**: Storing workspace IDs in PostgreSQL, enforcing foreign key relationships, calculating ROI equations, rendering strict Mermaid diagrams.

## Why We Need It
If a system uses probabilistic AI for everything (including calculations and database state), it will hallucinate and fail. Critical enterprise platforms require a deterministic skeleton with an intelligent probabilistic brain on top.

## Limitations
Probabilistic outputs can vary between runs, which is why BizzMitra provides human review, customization, and version control.

## What I Should Be Able To Explain To A Judge
> *"BizzMitra is deliberately built as a hybrid system: we use AI where human language nuance is required, but keep state management, calculations, and data persistence strictly deterministic."*

---

# 3. Goal-Oriented Dialog & Slot Filling (Frame Semantics)

## Simple Definition
A technique in conversational AI where the system has a mental "form" with empty slots (e.g., `Expected Volume`, `Team Roles`, `Key Integrations`), and asks targeted questions until every essential slot is filled.

## How It Works
Traditional task-oriented dialogue systems (like airline booking bots) use semantic frame parsing to identify unfilled slots. In LLM-based architectures, the prompt instructs the model to inspect the business requirement schema, identify missing fields required to produce a valid technical architecture, and formulate a targeted clarifying question for the highest-priority empty slot.

## Where BizzMitra Uses It
In **Step 2: AI Discovery Interview** (`/workspace/discovery`).
When the user submits a business problem, BizzMitra tracks the `Context Maturity Score` (38% → 62% → 88% → 96%).
The AI identifies missing parameters:
- `Candidate Volume` (how many resumes/month)
- `Stakeholder Roles` (who uses the system)
- `Integration Targets` (spreadsheets, emails, ERPs)

Each time the user answers a question (either via interactive chips or custom typing), the missing slot is filled, and the context maturity score advances.

## Why We Need It
Generating enterprise blueprints (database schemas, API routes, process workflows) requires concrete boundary conditions. If an AI generates a solution without knowing volume or integrations, it generates generic, unworkable boilerplate.

## Limitations
In the Day 2 prototype, the discovery interview sequence uses adaptive question templates (`HR_DISCOVERY_SCRIPT` and `NEXA_DISCOVERY_SCRIPT`) with simulated slot recognition. In full production, this runs as a dynamic multi-turn LLM agent with structured output extraction.

## What I Should Be Able To Explain To A Judge
> *"BizzMitra doesn't rush into generating architecture on day one. It runs a structured slot-filling dialogue. Until essential architectural parameters like scale, roles, and bottlenecks are established, the system flags missing information and guides the user to full context maturity."*

---

# 4. Missing Information Detection & Explainable Prompting

## Simple Definition
Detecting what critical information the user *omitted* from their prompt, and explaining to the user *why* that information is needed before the system can build a solution.

## How It Works
When evaluating business requirements, the AI compares the user's initial problem description against a reference ontology for that industry. For every missing dimension (e.g., scale, concurrency, regulatory compliance), the system produces:
1. The missing entity name.
2. The architectural rationale ("Why we ask").
3. A set of plausible answers calibrated for that industry.

## Where BizzMitra Uses It
In the **Missing Information Detector** badges in `/workspace/discovery`:
```text
[Missing Information Detector]: Monthly candidate applicants & active client accounts
[Why we ask]: Sizes database schemas, indexing requirements, and UI pagination for candidate pipelines.
```

## Why We Need It
It builds user trust and educates non-technical business founders. When an AI asks questions without explaining why, users feel interrogated or annoyed. When the AI shows that the question directly impacts database indexing and server sizing, the user understands the value of the discovery process.

## Limitations
Ontologies for niche enterprise domains must be maintained or learned from enterprise architecture frameworks (TOGAF, C4 model).

## What I Should Be Able To Explain To A Judge
> *"Most AI chatbots just hallucinate default assumptions when information is missing. BizzMitra features an explicit Missing Information Detector that alerts the user to ambiguity and transparently explains why each detail is necessary for downstream technical architecture."*

---

# 5. Directed Acyclic Graphs (DAGs) & Lineage Provenance in Generative Systems

## Simple Definition
Using a directed graph with no closed loops to track where every piece of generated content came from, what influenced it, and what downstream assets depend on it.

## How It Works
In generative software systems, each artifact (problem, CRM, architecture diagram, database schema, roadmap) is represented as a vertex ($V$), and every dependency is represented as a directed edge ($E$). This enables bidirectional topological sorting:
- **Upstream Traversal (Lineage / Provenance)**: Identifies the root inputs that caused an artifact to exist.
- **Downstream Traversal (Change Propagation)**: Identifies which technical blueprints must be re-evaluated or regenerated if an upstream business requirement changes.

## Where BizzMitra Uses It
In **Signature USP #3 — Connected Artifact Map** (`/workspace/map`):
```text
Business Problem ──► Discovery ──► Business Analysis ──► HR CRM ──► Architecture ──► Data/APIs ──► Roadmap ──► ROI
```
When an asset like the **Workable HR CRM** is clicked, the system computes the in-degree (parents) and out-degree (children) to highlight the exact chain of custody.

## Why We Need It
Enterprise leaders reject AI tools that behave like opaque "black boxes". Provenance graphs make AI generation 100% explainable, traceable, and auditable.

## What I Should Be Able To Explain To A Judge
> *"Competitor platforms create isolated artifacts with zero memory. BizzMitra models the entire transformation as a Directed Acyclic Graph (DAG). This allows complete bidirectional traceability: we can prove that every single database table and API route exists because of an explicit pain point identified in the initial business problem."*

---

# 6. Algorithmic Sensitivity Modeling & Deterministic Financial Grounding

## Simple Definition
Combining deterministic mathematical formulas with ranges of operational variables (sensitivity analysis) to calculate the real monetary impact of an AI transformation.

## How It Works
Rather than asking an LLM to hallucinate a financial figure, the system establishes a deterministic mathematical model:
$$S_{\text{net}} = \left(N_{\text{staff}} \times H_{\text{manual}} \times R_{\text{auto}} \times \text{Rate}\right) + \text{RevenueGain} - \text{PlatformCost}$$
The system evaluates this equation across Conservative, Expected, and Aggressive scenarios, calculating exact payback periods and 36-month cumulative value trajectories.

## Where BizzMitra Uses It
In **Step 10: Dynamic ROI & Transformation Dashboard** (`/workspace/insights`).

## Why We Need It
Generative AI frequently hallucinates numbers when tasked with arithmetic. By keeping calculations in a deterministic math engine and pairing it with live interactive sliders, founders and CFOs can test assumptions with mathematical confidence.

## What I Should Be Able To Explain To A Judge
> *"We never ask LLMs to generate financial ROI figures. We use deterministic mathematical models where the user adjusts operational variables in real time. This gives enterprise decision-makers transparent, mathematically sound justifications for digital transformation."*

---

# 7. Human-in-the-Loop (HITL) Governance & Stage-Gate AI Workflows

## Simple Definition
An enterprise AI pattern where automated generative models are bounded by explicit human review, authorization checkpoints, and formal sign-offs before any output can transition into an executable production state.

## How It Works
Rather than allowing AI outputs to deploy autonomously, the system creates a state machine:
$$\text{Draft} \longrightarrow \text{Under Review} \longrightarrow \text{Approved for Implementation}$$
Each state transition requires explicit cryptographic or authenticated signatures from designated domain experts (Solution Architect, Compliance Officer, Operations Lead).

## Where BizzMitra Uses It
In **Step 11: Governance, Review & Approvals Hub** (`/workspace/collaboration`).
The 4-tier sign-off matrix tracks reviews across Architecture, HR Operations, Delivery Planning, and DPDP Act legal compliance before approving the transformation blueprint.

## Why We Need It
Enterprise risk policies strictly prohibit unreviewed AI code or database migrations from reaching production environments. HITL governance provides legal accountability and compliance assurance.

## What I Should Be Able To Explain To A Judge
> *"BizzMitra-AI is not an autonomous black box. We enforce enterprise Stage-Gate governance. Even after AI synthesizes complete blueprints, four distinct domain leaders must review the visual diffs, resolve in-context comments, and provide formal sign-off before implementation begins."*

---

# 8. Multi-Format Code & Schema Serialization from Unified Business Context

## Simple Definition
The architectural technique of holding a single, unified business context in memory or database, and running multiple deterministic serializers to output disparate technical artifacts (OpenAPI, SQL, Markdown, CSV) without cross-tool translation loss.

## How It Works
A central data model encapsulates the entities, attributes, pipeline stages, and security rules. When the user requests deliverables, specialized serializers traverse this abstract syntax tree (AST):
- **SQL Serializer**: Produces `CREATE TABLE`, `CREATE INDEX`, and PostgreSQL Row Level Security policies.
- **OpenAPI Serializer**: Produces RESTful endpoints, request/response schemas, and parameter enums.
- **Documentation Serializer**: Produces structured Markdown/Docx with executive summaries and risk registers.

## Where BizzMitra Uses It
In **Step 12: Universal Export Center** (`/workspace/export`).

## Why We Need It
If a company manually transcribes architecture diagrams into OpenAPI specs and database schemas, human error and scope drift inevitably occur. Automated multi-format serialization guarantees that every technical artifact is 100% synchronized with the original business intent.

## What I Should Be Able To Explain To A Judge
> *"In competitor workflows, you design a database in one tool, write OpenAPI specs in another, and draft requirements in Word. In BizzMitra, everything derives from one unified business context. Our Universal Export Center serializes this single source of truth into OpenAPI 3.1 JSON, PostgreSQL 16 DDL, Word specs, and board-ready PDFs with zero desynchronization."*

---

# 9. Dynamic Role-Based Access Control (RBAC) & Permission Scoping

## Simple Definition
A security architecture where access to specific actions, data models, and generative AI functions is strictly partitioned based on a user's defined organizational role (Admin, Architect, Analyst, Viewer).

## How It Works
Instead of binary read/write gates, each role carries a granular boolean permissions object:
- `canEditSchema`: Allows PostgreSQL DDL and API contract modifications.
- `canRegenerateAI`: Allows triggering LLM inference and solution studio re-generation.
- `canApproveBlueprint`: Authorizes stage-gate state transitions.
- `canExportDeliverables`: Enables downloading PDF, SQL, and ZIP bundles.

## Where BizzMitra Uses It
In the **AppShell & Admin Console** (`src/lib/admin-rbac-data.ts`, `AppShell.tsx`, `ArtifactHeader.tsx`). Switching to `viewer` or `analyst` instantly disables AI regeneration and export buttons with informative tooltips.

## Why We Need It
Enterprise procurement demands least-privilege security. External client stakeholders should inspect roadmap milestones and read-only prototypes without having the capability to alter database schemas or exhaust corporate AI token budgets.

## What I Should Be Able To Explain To A Judge
> *"Enterprise SaaS requires strict governance. In BizzMitra-AI, we implemented a reactive RBAC engine with 4 standard personas. Switching to an Analyst or Viewer role immediately locks down schema edits and prevents unauthorized AI compute consumption."*

---

# 10. AI Token Economics, Metering & Business Credit Abstraction

## Simple Definition
Translating raw, volatile Large Language Model compute metrics (input tokens, output tokens, latency ms) into predictable, user-friendly business credits that can be budgeted, metered, and billed in SaaS subscriptions.

## How It Works
Raw LLM inference APIs bill at variable rates per million tokens. The monetization engine introduces a virtual credit ledger:
$$\text{Available Credits} = \text{Monthly Quota} - \sum (\text{Task Cost})$$
- AI Discovery Turn: 5 credits (~1,250 tokens)
- Solution Studio Regeneration: 40 credits (~10,000 tokens)
- Architecture HLD Synthesis: 50 credits (~12,500 tokens)

## Where BizzMitra Uses It
In **Settings & Monetization** (`/settings`) and **Central Admin Console** (`/admin`). Tracks balance (840 credits), burn rate (32 credits/day), and provides an instant top-up simulation.

## Why We Need It
Directly passing raw token counts confuses business users and exposes platforms to runaway cloud costs. Credit abstraction gives customers clear budget transparency while providing SaaS founders with predictable unit margins.

## What I Should Be Able To Explain To A Judge
> *"We don't bill users in confusing token fractions. We created an enterprise AI Token Wallet. High-value synthesis tasks deduct transparent business credits, recorded in an immutable ledger, with clear tier quotas and top-up options."*
