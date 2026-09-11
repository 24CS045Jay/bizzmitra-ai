/**
 * Single coherent seeded demo journey — "Nexa Retail" e-commerce support.
 * Every artifact page reads from here so the whole workspace tells one story.
 */

export const SAMPLE_PROBLEM =
  "Our e-commerce support team is overwhelmed — 60% of tickets are repetitive order-status and return questions, average response time is 14 hours, and we're losing repeat customers because of it.";

export const HR_CONSULTANCY_PROBLEM =
  "I am starting an HR consultancy. I have company, candidate, and client information. We need to track candidates through screening and interview stages, log daily consultant attendance, onboard enterprise clients, and maintain a professional public agency portal.";

export const DEMO_WORKSPACE = {
  name: "Nexa Retail — Support Deflection",
  industry: "D2C E-commerce",
  problem: SAMPLE_PROBLEM,
  maturity: 62,
  readiness: 74,
};

export const HR_DEMO_WORKSPACE = {
  name: "TalentCraft HR — Recruitment & Operations Suite",
  industry: "HR & Recruitment Services",
  problem: HR_CONSULTANCY_PROBLEM,
  maturity: 54,
  readiness: 81,
};

export const EXAMPLE_CHIPS = [
  "I am starting an HR consultancy with candidate, client & attendance needs",
  "Support team drowning in repetitive tickets and 14h response times",
  "Manual invoice reconciliation takes 3 days across finance spreadsheets",
  "Field technicians still using paper job cards with no GPS validation",
];

export type DiscoveryQuestionItem = {
  question: string;
  hint: string;
  whyWeAsk: string;
  missingEntity: string;
  options: string[];
  answer: string;
};

export const DISCOVERY_SCRIPT: DiscoveryQuestionItem[] = [
  {
    question:
      "Got it — repetitive order-status and return tickets at 14h first response. What's your current support volume per day?",
    hint: "Volume drives whether we automate deflection or just assist agents.",
    whyWeAsk: "High volume (>500/day) justifies an automated deflection layer over human routing.",
    missingEntity: "Daily inbound ticket volume & peak surges",
    options: [
      "About 1,200 tickets a day, spiking to 2,000 during sale weeks.",
      "Around 300-500 tickets per day.",
      "Over 3,000 tickets a day across multiple brands.",
    ],
    answer: "About 1,200 tickets a day, spiking to 2,000 during sale weeks.",
  },
  {
    question:
      "1,200/day with 2,000 peaks — that's deflection territory. Do you have an existing helpdesk tool (Zendesk, Freshdesk, or none)?",
    hint: "An existing helpdesk means we integrate rather than replace.",
    whyWeAsk: "Determines whether the solution builds a custom helpdesk or integrates via webhooks.",
    missingEntity: "Helpdesk software & e-commerce backend",
    options: [
      "Freshdesk, plus Shopify for orders and Shiprocket for logistics.",
      "Zendesk with WooCommerce.",
      "Custom in-house database with no ticketing software.",
    ],
    answer: "Freshdesk, plus Shopify for orders and Shiprocket for logistics.",
  },
  {
    question:
      "Freshdesk + Shopify + Shiprocket. Last one — what's your support team size, and is it in-house or outsourced?",
    hint: "Team size sets the ROI baseline and change-management effort.",
    whyWeAsk: "Agent count and shifts establish the cost baseline for ROI and payback period.",
    missingEntity: "Support staff count & shift distribution",
    options: [
      "18 in-house agents across two shifts.",
      "8 full-time agents with no shift coverage.",
      "35 outsourced BPO agents on a 24/7 rota.",
    ],
    answer: "18 in-house agents across two shifts.",
  },
];

export const HR_DISCOVERY_SCRIPT: DiscoveryQuestionItem[] = [
  {
    question:
      "Welcome to BizzMitra! Starting an HR consultancy involves managing candidates, client accounts, and internal consultants. What is your expected monthly candidate volume and number of active client companies?",
    hint: "Volume and client count size your candidate CRM pipeline, database relations, and concurrency.",
    whyWeAsk: "Sizes database schemas, indexing requirements, and UI pagination for candidate pipelines.",
    missingEntity: "Monthly candidate applicants & active corporate clients",
    options: [
      "Around 400 candidate applications a month across 35 active corporate client accounts.",
      "Under 100 candidates with 5-10 boutique startup clients.",
      "1,500+ high-volume candidates across industrial staffing contracts.",
    ],
    answer: "Around 400 candidate applications a month across 35 active corporate client accounts.",
  },
  {
    question:
      "400 candidates and 35 clients is significant. What specific stages do candidates pass through, and where does candidate drop-off or data loss occur today?",
    hint: "Defines the exact state-machine stages for the Workable HR CRM and notifications.",
    whyWeAsk: "Sets up the CRM Kanban column stages and identifies which transitions need automation.",
    missingEntity: "Recruitment lifecycle stages & operational drop-off points",
    options: [
      "Screening → Interview → Offer → Rejected. We lose track after round 2 because of scattered WhatsApp and Excel files.",
      "Sourcing → Technical Screen → Client Review → Offer. Communication lags take 7+ days.",
      "Application → Assessment → Video Interview → Final Placement.",
    ],
    answer:
      "Screening → Interview → Offer → Rejected. We lose track after round 2 because of scattered WhatsApp and Excel files.",
  },
  {
    question:
      "For consultant attendance and client onboarding, what are your core operational and compliance needs?",
    hint: "Determines whether attendance requires web punch-clock and if clients need self-serve contract sign-off.",
    whyWeAsk: "Specifies feature requirements for the attendance log and client portal modules.",
    missingEntity: "Attendance tracking rules & client self-serve requirements",
    options: [
      "Daily web check-in/out with leave approval for our 8 consultants, plus a client portal to review shortlists and sign MSAs.",
      "Simple attendance punch-clock only; client contracts handled via email.",
      "Hourly billing timesheet tracker integrated with payroll.",
    ],
    answer:
      "Daily web check-in/out with leave approval for our 8 consultants, plus a client portal to review shortlists and sign MSAs.",
  },
];

export const AI_SUMMARY =
  "Here's what I have: 1,200 tickets/day (2,000 at peak), 18 in-house agents on two shifts, Freshdesk + Shopify + Shiprocket, 60% repetitive order-status and return intent, 14h average first response. That's roughly 720 automatable contacts a day. I'll frame the problem, recommend a solution, and generate the full blueprint chain.";

export const HR_AI_SUMMARY =
  "Here is what I have captured: ~400 candidates/month across 35 client accounts, 8 internal recruiters on WhatsApp and Excel, a 4-stage recruitment pipeline with drop-offs after interview round 2, and manual consultant attendance tracking. I have performed gap analysis, framed your business problem, and will now generate your Business Analysis report and workable system blueprints.";

export type BusinessAnalysisReport = {
  currentState: {
    summary: string;
    tools: string[];
    bottlenecks: string[];
    efficiencyScore: number;
  };
  stakeholders: {
    role: string;
    count: string;
    needs: string;
    impact: string;
  }[];
  gapAnalysis: {
    area: string;
    current: string;
    future: string;
    severity: "High" | "Medium" | "Critical";
  }[];
  futureState: {
    summary: string;
    recommendedModules: string[];
    automationOpportunities: string[];
  };
  businessImpact: {
    metric: string;
    current: string;
    projected: string;
    improvement: string;
  }[];
};

export const HR_BUSINESS_ANALYSIS: BusinessAnalysisReport = {
  currentState: {
    summary:
      "TalentCraft HR currently manages hiring operations through disjointed tools (Excel spreadsheets, WhatsApp groups, and email attachments). Recruiters duplicate resume entries, interview feedback is lost after round 2, client contract turnaround lags by 10+ days, and consultant daily attendance is recorded manually on paper.",
    tools: ["Microsoft Excel (5 workbooks)", "WhatsApp Web", "Google Drive", "Manual Outlook emails"],
    bottlenecks: [
      "No centralized candidate database; resumes saved across personal local folders",
      "Severe candidate drop-off between interview round 2 and client offer stage",
      "Manual consultant attendance tracking lacks auditability and leave approval records",
      "Client onboarding agreements (MSAs) take 10-14 days due to back-and-forth PDF signing",
    ],
    efficiencyScore: 38,
  },
  stakeholders: [
    {
      role: "Internal Recruiters",
      count: "8 team members",
      needs: "Unified candidate tracking pipeline, instant resume search, stage movement alerts",
      impact: "High — spends 4.5 hrs/day on repetitive data entry across spreadsheets",
    },
    {
      role: "Corporate Clients",
      count: "35 active enterprise clients",
      needs: "Self-serve portal to review candidate shortlists, approve interviews, and track hiring SLA",
      impact: "Critical — client satisfaction drops when candidate status takes >48 hrs to report",
    },
    {
      role: "Job Candidates",
      count: "~400 applicants/month",
      needs: "Clear application status updates, interview schedule reminders, professional touchpoint",
      impact: "High — 28% candidate drop-off due to radio silence during interview stages",
    },
    {
      role: "Agency Operations Lead",
      count: "Founding Partner / Ops Lead",
      needs: "Audited daily consultant attendance, verified timesheets, revenue/placement visibility",
      impact: "Medium — manual billing reconciliation takes 4 days at month-end",
    },
  ],
  gapAnalysis: [
    {
      area: "Candidate Pipeline",
      current: "Static multi-sheet Excel files with no stage validation or audit history",
      future: "Interactive Workable CRM with drag-and-drop stages (Screening → Interview → Offer → Rejected)",
      severity: "Critical",
    },
    {
      area: "Client Onboarding",
      current: "Manual email attachments for MSAs, rate cards, and KYC documents",
      future: "Self-serve Client Onboarding Portal with digital document upload and status tracker",
      severity: "High",
    },
    {
      area: "Consultant Attendance",
      current: "Manual WhatsApp check-ins and paper punch sheets",
      future: "Digital web attendance clock-in/out with punch log and leave approval workflow",
      severity: "High",
    },
    {
      area: "Public Presence",
      current: "No dedicated agency web portal; reliance on LinkedIn personal profiles",
      future: "Modern Agency Website with integrated candidate application submission",
      severity: "Medium",
    },
  ],
  futureState: {
    summary:
      "A unified, connected digital operations hub where recruiters manage candidates through an interactive CRM, corporate clients review candidates through a private portal, consultants record attendance digitally, and public candidates apply via a modern agency website.",
    recommendedModules: [
      "Workable HR Candidate CRM",
      "Consultant Daily Attendance & Punch Tracker",
      "Client Onboarding & Collaboration Portal",
      "Public Agency Web Presence",
      "AI-Assisted Candidate Screening & Matching",
    ],
    automationOpportunities: [
      "Automated stage transition alerts sent to candidates via email",
      "One-click client shortlist generation with resume PII redaction",
      "Automated attendance punch logs with daily summary alerts",
      "Self-serve client onboarding wizard reducing contract signing from 10 days to 24 hours",
    ],
  },
  businessImpact: [
    { metric: "Candidate Placement Cycle", current: "28 days", projected: "9 days", improvement: "-68%" },
    { metric: "Candidate Drop-Off Rate", current: "28%", projected: "6%", improvement: "-78%" },
    { metric: "Recruiter Manual Admin Time", current: "4.5 hrs/day", projected: "1.0 hr/day", improvement: "-77%" },
    { metric: "Client Contract Turnaround", current: "10-14 days", projected: "24-48 hrs", improvement: "-82%" },
    { metric: "Attendance & Timesheet Accuracy", current: "62%", projected: "99.4%", improvement: "+37.4%" },
  ],
};

export const NEXA_BUSINESS_ANALYSIS: BusinessAnalysisReport = {
  currentState: {
    summary:
      "Nexa Retail's support team absorbs ~720 repetitive low-value contacts per day. 18 agents spend 96 hours daily manually checking Shopify orders and Shiprocket delivery status, causing average first response times to balloon to 14 hours.",
    tools: ["Freshdesk", "Shopify Admin API", "Shiprocket Logistics API", "Manual agent macros"],
    bottlenecks: [
      "Undifferentiated Freshdesk queue; high-intent refund tickets wait behind simple tracking questions",
      "Order status exists in Shopify but is not reachable by customers directly",
      "Return eligibility checks are deterministic but performed manually by agents",
    ],
    efficiencyScore: 42,
  },
  stakeholders: [
    { role: "Support Agents", count: "18 in-house agents", needs: "Automated triage, AI suggested drafts", impact: "High" },
    { role: "Online Customers", count: "~25,000 active buyers", needs: "Instant order tracking and return answers", impact: "Critical" },
    { role: "Customer Experience Lead", count: "Head of Support", needs: "SLA compliance, deflection visibility", impact: "High" },
  ],
  gapAnalysis: [
    { area: "Intent Classification", current: "Manual agent reading and tagging", future: "AI intent triage at webhook ingestion", severity: "Critical" },
    { area: "Order Tracking", current: "Agent switches 3 browser tabs to query Shiprocket", future: "Automated resolver joins Shopify + Shiprocket into 40s answer", severity: "High" },
    { area: "Return Eligibility", current: "Agent manual policy lookup", future: "Rules engine auto-evaluates return window and SKU category", severity: "High" },
  ],
  futureState: {
    summary:
      "An automated deflection and triage layer inserted in front of Freshdesk. 60% repetitive tickets resolve automatically in seconds; complex tickets arrive enriched with full context and suggested drafts.",
    recommendedModules: ["Intent Triage Service", "Order Status Resolver", "Return Eligibility Engine", "Agent Copilot"],
    automationOpportunities: ["Instant tracking deflection", "Automated RMA generation", "Confidence-scored agent drafts"],
  },
  businessImpact: [
    { metric: "Average First Response Time", current: "14 hours", projected: "40 seconds (auto) / 3.1h (complex)", improvement: "-78%" },
    { metric: "Automatable Contacts Deflected", current: "0%", projected: "60% (~720/day)", improvement: "+60%" },
    { metric: "Agent Hours Freed Daily", current: "0 hrs", projected: "96 agent hrs/day", improvement: "+96 hrs" },
    { metric: "Repeat-Purchase Retention", current: "Base", projected: "+18%", improvement: "+18%" },
  ],
};

export function getActiveDiscoveryScript(problemText?: string): DiscoveryQuestionItem[] {
  if (problemText && (problemText.toLowerCase().includes("support") || problemText.toLowerCase().includes("ticket"))) {
    return DISCOVERY_SCRIPT;
  }
  return HR_DISCOVERY_SCRIPT;
}

export function getActiveAiSummary(problemText?: string): string {
  if (problemText && (problemText.toLowerCase().includes("support") || problemText.toLowerCase().includes("ticket"))) {
    return AI_SUMMARY;
  }
  return HR_AI_SUMMARY;
}

export function getActiveBusinessAnalysis(problemText?: string): BusinessAnalysisReport {
  if (problemText && (problemText.toLowerCase().includes("support") || problemText.toLowerCase().includes("ticket"))) {
    return NEXA_BUSINESS_ANALYSIS;
  }
  return HR_BUSINESS_ANALYSIS;
}

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

/**
 * Multi-Modal Ingestion Templates & Extraction Simulators
 * Supports URL scraping, document parsing (PDF/DOCX/PPTX/BRD), voice transcription, and legacy system context.
 */

export type ExtractedBusinessContext = {
  businessName: string;
  industry: string;
  businessModel: string;
  summary: string;
  targetUsers: string[];
  painPoints: string[];
  existingTools: string[];
  goals: string[];
  constraints: string[];
  confidence: number;
  sourceType: "prompt" | "document" | "url" | "voice" | "legacy";
};

export const DEFAULT_HR_CONTEXT: ExtractedBusinessContext = {
  businessName: "TalentCraft HR Consultancy",
  industry: "HR & Recruitment Services",
  businessModel: "B2B Staffing & Recruitment Retainer",
  summary:
    "A growing HR agency scaling from 8 recruiters to 25, currently losing candidate velocity due to disconnected Excel sheets, WhatsApp communications, and delayed client approvals.",
  targetUsers: ["Internal Recruiters", "Hiring Managers (Clients)", "Job Candidates", "Agency Operations Lead"],
  painPoints: [
    "Spreadsheet chaos: candidate data scattered across 5 files",
    "Candidate drop-off between interview round 1 and offer",
    "Manual daily consultant attendance logging on paper/chat",
    "Client contract onboarding takes 10+ days without a self-serve portal",
  ],
  existingTools: ["Excel Spreadsheets", "WhatsApp Web", "Google Drive", "Manual email threads"],
  goals: [
    "Deploy a unified Candidate Pipeline CRM",
    "Automate consultant daily check-in and attendance punch log",
    "Launch a client onboarding portal for contract sign-off",
    "Establish a professional public agency brand website",
  ],
  constraints: [
    "Non-technical recruiting team; needs intuitive zero-training UI",
    "Strict candidate resume PII privacy",
    "Must be delivered within a 6-week phased timeline",
  ],
  confidence: 0.94,
  sourceType: "prompt",
};

export const URL_ANALYZER_SAMPLES: Record<string, ExtractedBusinessContext> = {
  "talentcraft": {
    businessName: "TalentCraft Staffing Solutions",
    industry: "Executive Search & HR Services",
    businessModel: "Retained search & contingent technical staffing",
    summary:
      "Specialized staffing agency providing senior engineering and leadership talent to venture-backed startups and mid-market enterprises.",
    targetUsers: ["Talent Acquisition Partners", "Enterprise Clients", "Senior Candidates"],
    painPoints: [
      "Inbound talent applications lack automated screening",
      "Client interview scheduling requires 4+ back-and-forth emails",
      "Manual client timesheet approvals delay billing cycles",
    ],
    existingTools: ["Custom WordPress site", "Google Sheets", "Typeform"],
    goals: [
      "Automate candidate pipeline with interactive CRM",
      "Direct client portal for candidate shortlists",
      "Automated attendance tracking for placed contract staff",
    ],
    constraints: ["Budget-conscious SMB tier", "Mobile-first access for recruiters on the move"],
    confidence: 0.91,
    sourceType: "url",
  },
  "default": {
    businessName: "Digital Business Enterprise",
    industry: "Professional Services",
    businessModel: "B2B Service Provider",
    summary:
      "Organization seeking digital transformation to streamline client intake, operational tracking, and automated service delivery.",
    targetUsers: ["Operations Lead", "Client Account Executives", "End Customers"],
    painPoints: ["Fragmented legacy systems", "High manual turnaround time", "Poor cross-department visibility"],
    existingTools: ["Legacy CRM", "Local Network Drive", "Spreadsheets"],
    goals: ["Centralized cloud portal", "Automated workflows", "Real-time transformation roadmap"],
    constraints: ["Strict compliance requirements", "Need phased migration plan"],
    confidence: 0.88,
    sourceType: "url",
  },
};

export const DOCUMENT_PARSE_TEMPLATES: Record<string, ExtractedBusinessContext> = {
  "pdf": {
    businessName: "TalentCraft HR Transformation BRD",
    industry: "Human Capital Management",
    businessModel: "B2B Recruitment & Staffing",
    summary:
      "Extracted from uploaded BRD: Business requires an end-to-end recruitment management system with automated screening, client approvals, and attendance logging.",
    targetUsers: ["Recruitment Consultants", "HR Managers", "Client Stakeholders"],
    painPoints: ["Lack of central candidate database", "Delayed feedback loops", "Unmonitored consultant billing hours"],
    existingTools: ["Microsoft Excel", "Outlook", "Zoho Mail"],
    goals: ["Build interactive candidate CRM", "Client onboarding workflow", "Attendance & leave tracker"],
    constraints: ["GDPR / DPDP compliance for applicant resumes", "Cloud-native scalable setup"],
    confidence: 0.96,
    sourceType: "document",
  },
  "docx": {
    businessName: "Standard Operating Procedure — Talent Intake",
    industry: "Staffing & Staff Augmentation",
    businessModel: "Contract-to-hire staffing",
    summary:
      "Extracted from SOP Document: Process outlines a 4-stage candidate vetting cycle that currently incurs 32 hours of manual coordinator effort per hiring cycle.",
    targetUsers: ["Talent Sourcers", "Interview Panelists", "Accounts Team"],
    painPoints: ["No automated stage movement alerts", "Manual feedback collation"],
    existingTools: ["Word templates", "Email attachments"],
    goals: ["Standardized candidate workflow", "Integrated interview status tracker"],
    constraints: ["Must support mobile review for hiring managers"],
    confidence: 0.93,
    sourceType: "document",
  },
  "pptx": {
    businessName: "Executive Digital Roadmap Presentation",
    industry: "Enterprise Services",
    businessModel: "Digital Agency & Staffing",
    summary:
      "Extracted from Deck: High-level leadership pitch to modernize candidate delivery pipelines and introduce client self-serve visibility.",
    targetUsers: ["Executive Leadership", "Client Directors", "Delivery Teams"],
    painPoints: ["Opaque operational metrics", "Long billing reconciliation cycles"],
    existingTools: ["PowerPoint Decks", "Financial Excel Sheets"],
    goals: ["Interactive operational dashboard", "Automated client onboarding pipeline"],
    constraints: ["Implementation within Q3", "Minimal downtime during rollout"],
    confidence: 0.89,
    sourceType: "document",
  },
};

export const VOICE_SAMPLE_TRANSCRIPT =
  "We are launching an HR consultancy with eight recruiters. We are managing candidate resumes in WhatsApp and Excel, but it's getting impossible to track who is in what interview stage. We also need our consultants to punch in daily attendance and let our enterprise clients review shortlisted profiles online.";

export const INTAKE_LANGUAGES = {
  en: {
    title: "New Transformation Intake",
    kicker: "Step 01",
    subtitle: "Describe your business challenge or provide business context in any format.",
    tabs: {
      prompt: "Describe Problem",
      upload: "Upload Documents",
      url: "Website URL",
      voice: "Voice Input",
      legacy: "Existing Systems",
    },
    modes: {
      know: {
        badge: "Direct Track",
        title: "I know what to build",
        desc: "Specify your desired systems (e.g., 'Build a website, CRM, attendance system') for rapid technical generation.",
      },
      consult: {
        badge: "Recommended for Startups",
        title: "I need recommendations",
        desc: "Our AI Business Consultant will analyze your context, ask clarifying questions, and advise what to build.",
      },
    },
    fields: {
      name: "Business / Project Name",
      namePlaceholder: "e.g., TalentCraft HR Consultancy",
      industry: "Primary Industry",
      description: "Business Description & Problem Statement",
      descriptionPlaceholder:
        "What is going wrong in the business or what are you looking to launch? Describe it in plain terms...",
      goals: "Primary Goals",
      goalsPlaceholder: "e.g., Automate candidate pipeline, track attendance, launch client portal",
      constraints: "Key Constraints (Budget, Timeline, Tools)",
      constraintsPlaceholder: "e.g., 6-week delivery target, non-technical team",
    },
    chipsLabel: "Or start from a curated business scenario:",
    cta: "Create Workspace & Start AI Discovery",
    creating: "Creating Workspace & Context...",
  },
  hi: {
    title: "नया बिजनेस ट्रांसफॉर्मेशन इनटेक",
    kicker: "चरण 01",
    subtitle: "अपनी व्यावसायिक समस्या बताएं या किसी भी प्रारूप में बिजनेस संदर्भ प्रदान करें।",
    tabs: {
      prompt: "समस्या बताएं",
      upload: "दस्तावेज़ अपलोड",
      url: "वेबसाइट URL",
      voice: "आवाज़ से इनपुट",
      legacy: "मौजूदा सिस्टम",
    },
    modes: {
      know: {
        badge: "डायरेक्ट ट्रैक",
        title: "मुझे पता है क्या बनाना है",
        desc: "अपनी आवश्यकताओं को स्पष्ट रूप से बताएं (उदा. 'वेबसाइट, CRM और अटेंडेंस सिस्टम बनाएं')।",
      },
      consult: {
        badge: "स्टार्टअप्स के लिए अनुशंसित",
        title: "मुझे AI सलाह और सुझाव चाहिए",
        desc: "हमारा AI बिजनेस कंसल्टेंट आपके संदर्भ को समझकर सही समाधानों की सिफारिश करेगा।",
      },
    },
    fields: {
      name: "व्यापार / प्रोजेक्ट का नाम",
      namePlaceholder: "उदा. टैलेंटक्राफ्ट एचआर कंसल्टेंसी",
      industry: "उद्योग (Industry)",
      description: "बिजनेस विवरण और समस्या",
      descriptionPlaceholder: "व्यापार में क्या समस्या आ रही है या आप क्या नया शुरू करना चाहते हैं?",
      goals: "मुख्य लक्ष्य (Goals)",
      goalsPlaceholder: "उदा. कैंडिडेट ट्रैकिंग आसान बनाना, अटेंडेंस और क्लाइंट पोर्टल शुरू करना",
      constraints: "सीमाएं (बजट, समय सीमा, तकनीक)",
      constraintsPlaceholder: "उदा. 6 सप्ताह की समय सीमा, आसान यूआई",
    },
    chipsLabel: "या पहले से तैयार बिजनेस परिदृश्य चुनें:",
    cta: "वर्कस्पेस बनाएं और AI डिस्कवरी शुरू करें",
    creating: "वर्कस्पेस और संदर्भ तैयार हो रहा है...",
  },
} as const;

export type SupportedLanguage = keyof typeof INTAKE_LANGUAGES;
