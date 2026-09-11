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

