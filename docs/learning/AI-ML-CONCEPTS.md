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
