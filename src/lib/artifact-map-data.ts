/**
 * Connected Artifact Map Engine (USP #3)
 * Defines the complete digital transformation dependency graph, node metadata,
 * bidirectional lineage, and traceability verification rules.
 */

export type ArtifactLayer =
  | "foundation"
  | "analysis"
  | "solution"
  | "blueprint"
  | "execution";

export type ArtifactNode = {
  id: string;
  name: string;
  kicker: string;
  layer: ArtifactLayer;
  layerLabel: string;
  route: string;
  version: string;
  status: "ready" | "in-review" | "regenerated";
  x: number; // Percentage on canvas 0-100
  y: number; // Percentage on canvas 0-100
  summary: string;
  inputsConsumed: string[];
  outputsProduced: string[];
  metrics: { label: string; value: string }[];
  isUsp?: boolean;
  uspLabel?: string;
};

export type ArtifactEdge = {
  from: string;
  to: string;
  relation: string;
  isUspFlow?: boolean;
};

export const ARTIFACT_MAP_NODES: ArtifactNode[] = [
  // 1. Foundation
  {
    id: "intake",
    name: "Multi-Modal Intake",
    kicker: "Stage 01",
    layer: "foundation",
    layerLabel: "Business Context",
    route: "/workspace/new",
    version: "v1.0",
    status: "ready",
    x: 8,
    y: 48,
    summary:
      "Ingests raw business problem statements, PDF/DOCX BRDs, website URLs, and voice inputs into a persistent workspace schema.",
    inputsConsumed: ["Founder business prompt", "Uploaded HR documents", "Operating mode selection"],
    outputsProduced: ["Structured Business Context", "Entity candidate profile", "Workspace ID"],
    metrics: [
      { label: "Extraction Channels", value: "5 Inputs" },
      { label: "Supported Locales", value: "EN + HI" },
    ],
  },

  // 2. Analysis
  {
    id: "discovery",
    name: "AI Discovery Dialogue",
    kicker: "Stage 02",
    layer: "analysis",
    layerLabel: "Cognitive Discovery",
    route: "/workspace/discovery",
    version: "v1.0",
    status: "ready",
    x: 24,
    y: 24,
    summary:
      "Detects missing business context parameters with explainable 'Why we ask' callouts, advancing context maturity from 38% to 96%.",
    inputsConsumed: ["Problem context", "Industry schema", "Target workload"],
    outputsProduced: ["Slot-filled business parameters", "Context maturity score (96%)"],
    metrics: [
      { label: "Maturity Level", value: "96% Complete" },
      { label: "Clarifying Turns", value: "3 Questions" },
    ],
  },
  {
    id: "business-analysis",
    name: "Business Analysis Engine",
    kicker: "Stage 03",
    layer: "analysis",
    layerLabel: "Cognitive Discovery",
    route: "/workspace/discovery",
    version: "v1.0",
    status: "ready",
    x: 24,
    y: 72,
    summary:
      "Synthesizes As-Is vs To-Be operating models, stakeholder impact matrix, and high-severity operational gap analysis.",
    inputsConsumed: ["Discovery answers", "Pain points", "Current tool bottlenecks"],
    outputsProduced: ["As-Is vs To-Be report", "Stakeholder matrix", "Gap analysis severity matrix"],
    metrics: [
      { label: "Efficiency Delta", value: "34% → 89%" },
      { label: "Stakeholder Groups", value: "4 Roles" },
    ],
  },

  // 3. Solution
  {
    id: "solution-suite",
    name: "Solution Recommendation",
    kicker: "Stage 04",
    layer: "solution",
    layerLabel: "Workable Solutions",
    route: "/workspace/solution",
    version: "v1.1",
    status: "regenerated",
    x: 44,
    y: 48,
    summary:
      "Recommends 4 core solution pillars, build-vs-buy trade-off matrices, and technical stack justifications.",
    inputsConsumed: ["Business analysis gaps", "Budget constraints", "Target timeline"],
    outputsProduced: ["4 Solution Pillars", "Build vs Buy evaluation", "Tech stack picks"],
    metrics: [
      { label: "Recommended Pillars", value: "4 Modules" },
      { label: "Trade-off Strategy", value: "Hybrid SaaS" },
    ],
  },
  {
    id: "hr-crm",
    name: "Workable HR CRM",
    kicker: "Signature USP #1",
    layer: "solution",
    layerLabel: "Workable Solutions",
    route: "/workspace/solution/crm",
    version: "v1.1",
    status: "ready",
    x: 44,
    y: 20,
    isUsp: true,
    uspLabel: "USP #1: Workable App",
    summary:
      "A live, interactive applicant tracking CRM with candidate stage progression, search, add candidate modal, and attendance punch clock.",
    inputsConsumed: ["Solution pillar specs", "Candidate data schema", "Recruiter role permissions"],
    outputsProduced: ["Live candidate roster", "Stage transitions", "Attendance timesheet logs"],
    metrics: [
      { label: "Active Candidates", value: "10 Seed Records" },
      { label: "Stage Flow", value: "4 Pipelines" },
    ],
  },
  {
    id: "solution-studio",
    name: "Solution Studio & Regen",
    kicker: "Signature USP #2",
    layer: "solution",
    layerLabel: "Workable Solutions",
    route: "/workspace/solution/crm",
    version: "v1.1",
    status: "regenerated",
    x: 44,
    y: 78,
    isUsp: true,
    uspLabel: "USP #2: Live Customizer",
    summary:
      "Interactive field builder and schema customizer allowing runtime addition of custom attributes (e.g. LinkedIn URL) and versioned AI regeneration.",
    inputsConsumed: ["User field additions", "Label adjustments", "Theme accents"],
    outputsProduced: ["Regenerated v1.1 CRM schema", "Updated data views", "Version changelog"],
    metrics: [
      { label: "Custom Attributes", value: "+3 Fields" },
      { label: "Regen Velocity", value: "3-Step State" },
    ],
  },

  // 4. Blueprints
  {
    id: "architecture",
    name: "Architecture (HLD / LLD)",
    kicker: "Stage 05",
    layer: "blueprint",
    layerLabel: "Technical Blueprints",
    route: "/workspace/architecture",
    version: "v1.1",
    status: "ready",
    x: 66,
    y: 16,
    summary:
      "Interactive High-Level and Low-Level architecture diagrams rendered via Mermaid.js with component inspection and SLA matrices.",
    inputsConsumed: ["Solution suite", "Scale parameters", "Security compliance standards"],
    outputsProduced: ["HLD system architecture", "LLD component diagram", "SLA & security matrix"],
    metrics: [
      { label: "Architecture Views", value: "HLD + LLD" },
      { label: "Inspected Nodes", value: "8 Components" },
    ],
  },
  {
    id: "process",
    name: "Process Intelligence (BPMN)",
    kicker: "Stage 06",
    layer: "blueprint",
    layerLabel: "Technical Blueprints",
    route: "/workspace/process",
    version: "v1.1",
    status: "ready",
    x: 66,
    y: 44,
    summary:
      "BPMN 2.0 process workflows comparing Manual As-Is vs Automated To-Be with 4-tier swimlanes and bottleneck resolution analysis.",
    inputsConsumed: ["Operational bottlenecks", "Stakeholder roles", "Automation initiatives"],
    outputsProduced: ["BPMN 2.0 diagram", "4-tier swimlane sequence", "Bottleneck resolution breakdown"],
    metrics: [
      { label: "Resolution Time", value: "28d → 9d" },
      { label: "Swimlanes", value: "4 Actors" },
    ],
  },
  {
    id: "data-api",
    name: "Database & REST APIs",
    kicker: "Stage 07",
    layer: "blueprint",
    layerLabel: "Technical Blueprints",
    route: "/workspace/data",
    version: "v1.1",
    status: "ready",
    x: 66,
    y: 74,
    summary:
      "Relational Entity-Relationship diagram, column dictionary, downloadable PostgreSQL 16 DDL, and RESTful API explorer.",
    inputsConsumed: ["Customizer schema", "Candidate data models", "Client auth requirements"],
    outputsProduced: ["ER diagram", "PostgreSQL DDL schema", "RESTful API endpoints + cURL"],
    metrics: [
      { label: "Relational Tables", value: "5 Tables" },
      { label: "REST Endpoints", value: "8 Routes" },
    ],
  },

  // 5. Execution
  {
    id: "roadmap",
    name: "Implementation Roadmap",
    kicker: "Stage 08",
    layer: "execution",
    layerLabel: "Execution & Economics",
    route: "/workspace/roadmap",
    version: "v1.0",
    status: "ready",
    x: 88,
    y: 30,
    summary:
      "Phased 3-tier rollout plan (Foundation, Coordination, Intelligence) with milestone checklists, team FTE resourcing, and risk register.",
    inputsConsumed: ["Architecture components", "API endpoints", "Operational priorities"],
    outputsProduced: ["3-phase Gantt projection", "15 milestone deliverables", "Team staffing plan"],
    metrics: [
      { label: "Delivery Duration", value: "9 Weeks" },
      { label: "Total Effort", value: "68 Person-Days" },
    ],
  },
  {
    id: "roi",
    name: "Financial ROI Cockpit",
    kicker: "Stage 09",
    layer: "execution",
    layerLabel: "Execution & Economics",
    route: "/workspace/insights",
    version: "v1.0",
    status: "ready",
    x: 88,
    y: 64,
    summary:
      "Algorithmic financial return calculator with live variable sliders, 36-month cumulative trajectory, and digital readiness radar.",
    inputsConsumed: ["Recruiter headcount", "Application volume", "Labor rates", "Automation factor"],
    outputsProduced: ["Net annual value", "Payback period", "36-month cashflow", "Sensitivity models"],
    metrics: [
      { label: "Payback Period", value: "2.4 Months" },
      { label: "3-Year ROI", value: "480%" },
    ],
  },
];

export const ARTIFACT_MAP_EDGES: ArtifactEdge[] = [
  // Foundation -> Analysis
  { from: "intake", to: "discovery", relation: "Seeds Clarifying Interview" },
  { from: "intake", to: "business-analysis", relation: "Provides Baseline Problem" },

  // Analysis -> Solution
  { from: "discovery", to: "solution-suite", relation: "Feeds Refined Boundaries" },
  { from: "business-analysis", to: "solution-suite", relation: "Feeds Identified Gaps" },
  { from: "solution-suite", to: "hr-crm", relation: "Generates Working ATS App", isUspFlow: true },
  { from: "hr-crm", to: "solution-studio", relation: "Enables Runtime Field Customization", isUspFlow: true },
  { from: "solution-studio", to: "hr-crm", relation: "Regenerates v1.1 Live State", isUspFlow: true },

  // Solution -> Blueprints
  { from: "solution-suite", to: "architecture", relation: "Determines System Topology" },
  { from: "solution-suite", to: "process", relation: "Defines Automated Workflows" },
  { from: "solution-studio", to: "data-api", relation: "Propagates Schema Attributes" },
  { from: "architecture", to: "data-api", relation: "Constrains Storage & APIs" },

  // Blueprints -> Execution
  { from: "architecture", to: "roadmap", relation: "Estimates Engineering Person-Days" },
  { from: "process", to: "roadmap", relation: "Determines Phase Transitions" },
  { from: "process", to: "roi", relation: "Quantifies Reclaimed Labor Hours" },
  { from: "roadmap", to: "roi", relation: "Supplies Implementation Cost Base" },
];

export const TRACEABILITY_METRICS = {
  traceabilityScore: 100,
  verifiedPathways: 14,
  orphanedArtifacts: 0,
  activeWorkspace: "TalentCraft HR Consultancy",
  provenanceChain:
    "Raw Problem Statement ──► Discovery Slots ──► Business Gaps ──► Workable CRM ──► Solution Studio ──► HLD/LLD ──► BPMN ──► Database/APIs ──► 9-Week Roadmap ──► Financial ROI",
};
