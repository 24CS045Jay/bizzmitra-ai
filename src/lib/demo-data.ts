/**
 * Single coherent seeded demo journey — "Nexa Retail" e-commerce support.
 * Every artifact page reads from here so the whole workspace tells one story.
 */

export const SAMPLE_PROBLEM =
  "Our e-commerce support team is overwhelmed — 60% of tickets are repetitive order-status and return questions, average response time is 14 hours, and we're losing repeat customers because of it.";

export const DEMO_WORKSPACE = {
  name: "Nexa Retail — Support Deflection",
  industry: "D2C E-commerce",
  problem: SAMPLE_PROBLEM,
  maturity: 62,
  readiness: 74,
};

export const EXAMPLE_CHIPS = [
  "Support team drowning in repetitive tickets",
  "Manual invoice reconciliation takes 3 days",
  "Field technicians still using paper job cards",
  "Sales pipeline data lives in five spreadsheets",
];

export const DISCOVERY_SCRIPT: {
  question: string;
  hint: string;
  answer: string;
}[] = [
  {
    question:
      "Got it — repetitive order-status and return tickets at 14h first response. What's your current support volume per day?",
    hint: "Volume drives whether we automate deflection or just assist agents.",
    answer: "About 1,200 tickets a day, spiking to 2,000 during sale weeks.",
  },
  {
    question:
      "1,200/day with 2,000 peaks — that's deflection territory. Do you have an existing helpdesk tool (Zendesk, Freshdesk, or none)?",
    hint: "An existing helpdesk means we integrate rather than replace.",
    answer: "Freshdesk, plus Shopify for orders and Shiprocket for logistics.",
  },
  {
    question:
      "Freshdesk + Shopify + Shiprocket. Last one — what's your support team size, and is it in-house or outsourced?",
    hint: "Team size sets the ROI baseline and change-management effort.",
    answer: "18 in-house agents across two shifts.",
  },
];

export const AI_SUMMARY =
  "Here's what I have: 1,200 tickets/day (2,000 at peak), 18 in-house agents on two shifts, Freshdesk + Shopify + Shiprocket, 60% repetitive order-status and return intent, 14h average first response. That's roughly 720 automatable contacts a day. I'll frame the problem, recommend a solution, and generate the full blueprint chain.";

export const PROBLEM_FRAMING = {
  statement:
    "Nexa Retail's support function absorbs ~720 low-value contacts per day (60% of 1,200) that carry no decision content — order status and return eligibility. Because agents triage manually, high-intent tickets queue behind them, pushing average first response to 14 hours and driving measurable repeat-purchase churn.",
  rootCauses: [
    {
      title: "No intent classification at intake",
      detail:
        "Every ticket enters one undifferentiated Freshdesk queue; agents read before they route.",
    },
    {
      title: "Order data is not customer-reachable",
      detail:
        "Shopify + Shiprocket status exists but is only surfaced inside the agent console, so customers must ask.",
    },
    {
      title: "Return eligibility is a policy lookup, not a judgement call",
      detail:
        "94% of return questions resolve deterministically from order date, SKU category and delivery state.",
    },
  ],
  constraints: [
    "Cannot replace Freshdesk — 18 agents, 2 years of macros and SLA reporting.",
    "No PII may leave the existing data region.",
    "Round-1 budget assumes a 6-week delivery window, one squad.",
  ],
  impact: [
    { metric: "Automatable contact volume", value: "~720 / day" },
    { metric: "Agent hours lost to repetitive work", value: "~96 hrs / day" },
    { metric: "Avg. first response time", value: "14 hrs" },
    { metric: "Repeat-purchase drop after a slow ticket", value: "-18%" },
  ],
};

export const SOLUTION = {
  headline: "AI-assisted support triage + self-serve order-status automation",
  summary:
    "Insert a classification and resolution layer in front of Freshdesk. Inbound tickets are classified by intent; deterministic order-status and return-eligibility intents are resolved automatically from Shopify and Shiprocket data and answered in-channel. Everything else is enriched with order context and routed to the right agent queue with a suggested reply.",
  pillars: [
    {
      title: "Intent triage service",
      detail:
        "A lightweight classifier (7 intents) scores every inbound ticket. >0.86 confidence auto-resolves, 0.6–0.86 drafts a reply for agent approval, below that routes untouched.",
    },
    {
      title: "Order-status resolver",
      detail:
        "Deterministic composer that joins Shopify order + Shiprocket tracking into a single templated, localised answer with an ETA.",
    },
    {
      title: "Return eligibility engine",
      detail:
        "Rules engine over order date, SKU category and delivery confirmation; issues or declines an RMA without an agent touch.",
    },
    {
      title: "Agent copilot sidebar",
      detail:
        "Freshdesk app that shows enriched context and the suggested reply for the assist tier.",
    },
  ],
  tradeoffs: [
    {
      option: "Full conversational LLM agent on every ticket",
      verdict: "Rejected",
      why: "Highest deflection ceiling but unbounded hallucination risk on refunds and a 3x inference cost at 1,200/day. Not defensible in round one.",
    },
    {
      option: "Classifier + deterministic resolvers (recommended)",
      verdict: "Recommended",
      why: "Covers the 60% repetitive band with auditable, rules-backed answers. LLM is used for classification and phrasing only, never for policy decisions.",
    },
    {
      option: "Freshdesk native automations only",
      verdict: "Rejected",
      why: "Zero integration cost but keyword rules cap out near 15% deflection and cannot join live Shiprocket state.",
    },
  ],
  stack: [
    { layer: "API / orchestration", choice: "Node.js + Express", why: "Team already runs Node; fastest path to Freshdesk webhooks." },
    { layer: "Intent classification", choice: "Fine-tuned small text classifier + LLM fallback", why: "7-label task; 40ms local inference, LLM only on low confidence." },
    { layer: "Data", choice: "PostgreSQL (Supabase)", why: "Ticket mirror, RMA ledger, audit trail, row-level security." },
    { layer: "Cache / queue", choice: "Redis + BullMQ", why: "Absorbs 2,000/day sale spikes without dropping webhooks." },
    { layer: "Integrations", choice: "Freshdesk API, Shopify Admin API, Shiprocket API", why: "All three already licensed." },
    { layer: "Observability", choice: "OpenTelemetry + Grafana", why: "Deflection rate and confidence drift must be visible from week one." },
  ],
};

export const HLD_DIAGRAM = `flowchart LR
  C([Customer]) -->|email / chat / web| FD[Freshdesk]
  FD -->|webhook| GW[Express API Gateway]
  GW --> Q[(Redis Queue)]
  Q --> TR[Intent Triage Service]
  TR -->|order status| OS[Order Status Resolver]
  TR -->|return| RE[Return Eligibility Engine]
  TR -->|complex| AC[Agent Copilot Sidebar]
  OS --> SH[(Shopify Admin API)]
  OS --> SR[(Shiprocket API)]
  RE --> DB[(PostgreSQL)]
  OS --> RP[Reply Composer]
  RE --> RP
  RP -->|auto reply| FD
  AC -->|suggested reply| FD
  TR --> DB
  DB --> AN[Analytics / Deflection Dashboard]`;

export const LLD_DIAGRAM = `flowchart TB
  subgraph Ingest
    WH[POST /webhooks/freshdesk] --> V{HMAC valid?}
    V -->|no| X[401]
    V -->|yes| N[Normalize ticket payload]
    N --> EQ[[bullmq: ticket.classify]]
  end
  subgraph Triage
    EQ --> CL[classify(text) -> intent, score]
    CL --> D{score}
    D -->|>= 0.86| AUTO[auto-resolve path]
    D -->|0.60 - 0.86| ASSIST[draft + agent approval]
    D -->|< 0.60| ROUTE[route untouched]
  end
  subgraph Resolvers
    AUTO --> OSR[orderStatus(orderId)]
    AUTO --> RER[returnEligible(orderId, sku)]
    OSR --> CACHE[(redis 90s TTL)]
    RER --> RULES[policy rules v3]
  end
  AUTO --> AUD[(audit_log)]
  ASSIST --> AUD
  ROUTE --> AUD`;

export const BPMN_BEFORE = `flowchart LR
  A([Ticket arrives]) --> B[Agent opens queue]
  B --> C[Agent reads ticket]
  C --> D[Agent opens Shopify tab]
  D --> E[Agent opens Shiprocket tab]
  E --> F[Agent writes reply]
  F --> G([Customer answered - avg 14h])`;

export const BPMN_AFTER = `flowchart LR
  A([Ticket arrives]) --> B{Intent triage}
  B -->|order status 41%| C[Auto-composed answer]
  B -->|return 19%| D[Eligibility engine]
  B -->|complex 40%| E[Enriched agent queue]
  C --> F([Answered - avg 40s])
  D --> F
  E --> G[Agent replies with copilot draft]
  G --> H([Answered - avg 3.1h])`;

export const SWIMLANE_DIAGRAM = `flowchart TB
  subgraph Customer
    C1[Asks 'where is my order?']
    C4[Receives answer + ETA]
  end
  subgraph BizzMitra Automation
    A1[Classify intent]
    A2[Fetch order + tracking]
    A3[Compose localised reply]
  end
  subgraph Support Agent
    S1[Handles only complex 40%]
  end
  C1 --> A1 --> A2 --> A3 --> C4
  A1 -->|low confidence| S1 --> C4`;

export const ER_DIAGRAM = `erDiagram
  CUSTOMER ||--o{ ORDER : places
  ORDER ||--o{ ORDER_ITEM : contains
  ORDER ||--o| SHIPMENT : has
  CUSTOMER ||--o{ TICKET : raises
  TICKET ||--o{ TICKET_EVENT : logs
  TICKET }o--|| INTENT : classified_as
  ORDER ||--o{ RETURN_REQUEST : may_have
  CUSTOMER {
    uuid id PK
    text email
    text locale
    int lifetime_orders
  }
  ORDER {
    uuid id PK
    uuid customer_id FK
    text shopify_order_no
    text status
    timestamptz placed_at
  }
  SHIPMENT {
    uuid id PK
    uuid order_id FK
    text carrier_awb
    text state
    date eta
  }
  TICKET {
    uuid id PK
    uuid customer_id FK
    text freshdesk_id
    text channel
    text intent
    numeric confidence
    text resolution_mode
  }
  RETURN_REQUEST {
    uuid id PK
    uuid order_id FK
    text sku
    text decision
    text policy_version
  }`;

export const API_ENDPOINTS = [
  { method: "POST", path: "/webhooks/freshdesk", desc: "HMAC-verified ticket intake; enqueues classification.", auth: "HMAC" },
  { method: "POST", path: "/v1/triage/classify", desc: "Returns intent label + confidence for a ticket body.", auth: "Service" },
  { method: "GET", path: "/v1/orders/:orderNo/status", desc: "Joined Shopify + Shiprocket status with ETA (90s cache).", auth: "Service" },
  { method: "POST", path: "/v1/returns/eligibility", desc: "Evaluates return policy rules; returns decision + reason code.", auth: "Service" },
  { method: "POST", path: "/v1/returns/rma", desc: "Issues an RMA and writes the audit trail.", auth: "Service" },
  { method: "GET", path: "/v1/tickets/:id/context", desc: "Enriched context payload for the agent copilot sidebar.", auth: "Agent JWT" },
  { method: "POST", path: "/v1/replies/compose", desc: "Composes a localised reply from a resolver result.", auth: "Service" },
  { method: "GET", path: "/v1/analytics/deflection", desc: "Deflection rate, confidence drift and FRT by day.", auth: "Admin JWT" },
];

export const WIREFRAMES = [
  { id: "wf1", name: "Agent Copilot Sidebar", note: "Freshdesk-embedded panel: order card, intent badge, suggested reply." },
  { id: "wf2", name: "Deflection Dashboard", note: "Daily deflection %, FRT trend, confidence drift alerting." },
  { id: "wf3", name: "Self-serve Order Status", note: "Customer-facing tracker reached from the auto-reply link." },
  { id: "wf4", name: "Return Eligibility Result", note: "Decision, reason code, RMA label download or appeal CTA." },
  { id: "wf5", name: "Policy Rules Console", note: "Ops-owned rules editor with version history and dry-run." },
  { id: "wf6", name: "Escalation Queue", note: "Enriched complex-ticket queue sorted by customer value." },
];

export const NAV_FLOW_DIAGRAM = `flowchart LR
  W1[Agent Copilot Sidebar] --> W6[Escalation Queue]
  W2[Deflection Dashboard] --> W5[Policy Rules Console]
  W3[Self-serve Order Status] --> W4[Return Eligibility Result]
  W4 --> W6
  W2 --> W1`;

export const ROADMAP = [
  {
    phase: "Phase 1",
    weeks: "Week 1–2",
    title: "Foundation & Intake",
    effort: "18 person-days",
    items: ["Freshdesk webhook + HMAC intake", "Ticket mirror schema + audit log", "Shopify / Shiprocket read connectors", "Intent taxonomy sign-off (7 labels)"],
    start: 0,
    length: 2,
  },
  {
    phase: "Phase 2",
    weeks: "Week 2–4",
    title: "Triage & Resolvers",
    effort: "26 person-days",
    items: ["Classifier training on 90 days of tickets", "Order-status resolver + cache", "Return eligibility rules v1", "Confidence thresholds + shadow mode"],
    start: 2,
    length: 2,
  },
  {
    phase: "Phase 3",
    weeks: "Week 4–5",
    title: "Agent Copilot & Reply",
    effort: "14 person-days",
    items: ["Freshdesk sidebar app", "Reply composer + localisation", "Agent approval loop"],
    start: 4,
    length: 1,
  },
  {
    phase: "Phase 4",
    weeks: "Week 5–6",
    title: "Rollout & Measurement",
    effort: "11 person-days",
    items: ["10% -> 50% -> 100% traffic ramp", "Deflection dashboard", "Runbook + on-call handover"],
    start: 5,
    length: 1,
  },
];

export const GANTT_DATA = ROADMAP.map((p) => ({
  name: p.phase,
  offset: p.start,
  duration: p.length,
  effort: parseInt(p.effort, 10),
}));

export const ROI_DEFAULTS = {
  ticketsPerDay: 1200,
  repetitivePct: 60,
  agentCostPerHour: 380, // INR
  minutesPerTicket: 8,
  deflectionPct: 72,
};

export function computeRoi(i: typeof ROI_DEFAULTS) {
  const repetitive = (i.ticketsPerDay * i.repetitivePct) / 100;
  const deflected = (repetitive * i.deflectionPct) / 100;
  const hoursSavedPerDay = (deflected * i.minutesPerTicket) / 60;
  const monthlySavings = hoursSavedPerDay * i.agentCostPerHour * 30;
  const frtReduction = Math.min(78, Math.round(i.deflectionPct * 0.62));
  return {
    deflected: Math.round(deflected),
    hoursSavedPerDay: Math.round(hoursSavedPerDay),
    monthlySavings: Math.round(monthlySavings),
    frtReduction,
    agentsFreed: Math.round((hoursSavedPerDay / 8) * 10) / 10,
  };
}

export const READINESS_RADAR = [
  { dimension: "Data", score: 78 },
  { dimension: "Process", score: 61 },
  { dimension: "Talent", score: 70 },
  { dimension: "Tooling", score: 84 },
  { dimension: "Governance", score: 55 },
  { dimension: "Culture", score: 68 },
];

export const FRT_TREND = [
  { week: "W0", before: 14, after: 14 },
  { week: "W1", before: 14, after: 13.2 },
  { week: "W2", before: 14, after: 11.4 },
  { week: "W3", before: 14, after: 8.1 },
  { week: "W4", before: 14, after: 5.6 },
  { week: "W5", before: 14, after: 4.2 },
  { week: "W6", before: 14, after: 3.1 },
];

export const AUTOMATION_OPPS = [
  { name: "Order status replies", volume: 492, confidence: 0.94 },
  { name: "Return eligibility", volume: 228, confidence: 0.89 },
  { name: "Address change", volume: 96, confidence: 0.72 },
  { name: "Invoice resend", volume: 61, confidence: 0.91 },
];

export const MODULES = [
  { key: "intake", name: "Problem Intake", desc: "Type, speak or drop a PDF/DOCX/PPT — BizzMitra reads it all." },
  { key: "discovery", name: "AI Discovery", desc: "Clarifying questions that behave like a real analyst, not a prompt box." },
  { key: "framing", name: "Problem Framing", desc: "Root causes, constraints and quantified impact, written down." },
  { key: "solution", name: "Solution Recommender", desc: "Recommended approach with the rejected options and why." },
  { key: "stack", name: "Tech Stack Advisor", desc: "Layer-by-layer stack picks justified against your constraints." },
  { key: "architecture", name: "Architecture Builder", desc: "HLD and LLD diagrams generated, not hand-drawn." },
  { key: "process", name: "Process Intelligence", desc: "Before/after BPMN with swimlanes and time-to-resolution." },
  { key: "ux", name: "AI UX Designer", desc: "Screen inventory and navigation flow for the whole build." },
  { key: "data", name: "Data & Integration", desc: "ER model plus the REST surface your team will actually build." },
  { key: "planning", name: "Planning Engine", desc: "Phased roadmap, effort estimates and a live ROI model." },
  { key: "dashboard", name: "Transformation Dashboard", desc: "Maturity, readiness and project health in one board." },
];

export const COMPETITOR_ROWS = [
  { capability: "Problem discovery interview", them: "ChatGPT — unstructured, forgets context", us: "Scripted analyst discovery, persisted" },
  { capability: "Architecture diagrams", them: "Lucidchart — you draw it yourself", us: "Generated from the framed problem" },
  { capability: "Process modelling", them: "Signavio — separate licence, separate team", us: "Before/after BPMN in the same workspace" },
  { capability: "Portfolio & maturity view", them: "LeanIX — enterprise-only, no delivery link", us: "Maturity scored per workspace" },
  { capability: "Delivery plan & effort", them: "Jira — starts after the thinking is done", us: "Roadmap derived from the architecture" },
  { capability: "Everything connected", them: "Five tools, five contexts", us: "One versioned, exportable workspace" },
];

export const PRICING = [
  { name: "Free", price: "₹0", period: "forever", blurb: "One workspace to prove the idea.", features: ["1 workspace", "Discovery + framing", "PDF export", "Community support"], cta: "Start free" },
  { name: "Pro", price: "₹2,400", period: "/month", blurb: "For solo consultants and founders.", features: ["Unlimited workspaces", "All 11 modules", "PDF / Word / PPT export", "Version history"], cta: "Start Pro", featured: true },
  { name: "Team", price: "₹8,900", period: "/month", blurb: "For product and BA squads.", features: ["Everything in Pro", "5 seats + roles", "Shared artifact library", "Comment threads"], cta: "Start Team" },
  { name: "Enterprise", price: "Custom", period: "", blurb: "For transformation offices.", features: ["SSO + SAML", "Private deployment", "Custom module training", "Named success architect"], cta: "Talk to us" },
];

export const TESTIMONIALS = [
  { quote: "We walked into the steering committee with an architecture, a roadmap and a number. That used to take three weeks.", name: "Ananya Rao", role: "Head of Digital, Nexa Retail" },
  { quote: "The part that sold me is that the roadmap actually references the architecture. Nothing else I use does that.", name: "Marcus Feld", role: "Solution Architect, Kelder Group" },
  { quote: "My BAs stopped living in five tabs.", name: "Priya Menon", role: "Delivery Lead, Tavara Consulting" },
];

export const ARTIFACT_NODES = [
  { id: "intake", label: "Problem Intake", to: "/workspace/new", x: 8, y: 46 },
  { id: "discovery", label: "AI Discovery", to: "/workspace/discovery", x: 24, y: 20 },
  { id: "framing", label: "Problem Framing", to: "/workspace/solution", x: 24, y: 72 },
  { id: "solution", label: "Solution + Stack", to: "/workspace/solution", x: 44, y: 46 },
  { id: "architecture", label: "Architecture", to: "/workspace/architecture", x: 64, y: 16 },
  { id: "process", label: "Process Model", to: "/workspace/process", x: 64, y: 44 },
  { id: "data", label: "Data & APIs", to: "/workspace/data", x: 64, y: 74 },
  { id: "ux", label: "UX Wireframes", to: "/workspace/wireframes", x: 82, y: 30 },
  { id: "roadmap", label: "Roadmap + ROI", to: "/workspace/roadmap", x: 82, y: 62 },
  { id: "dashboard", label: "Transformation Board", to: "/workspace/insights", x: 95, y: 46 },
] as const;

export const ARTIFACT_EDGES: [string, string][] = [
  ["intake", "discovery"],
  ["intake", "framing"],
  ["discovery", "solution"],
  ["framing", "solution"],
  ["solution", "architecture"],
  ["solution", "process"],
  ["solution", "data"],
  ["architecture", "ux"],
  ["process", "ux"],
  ["data", "roadmap"],
  ["architecture", "roadmap"],
  ["ux", "roadmap"],
  ["roadmap", "dashboard"],
];
