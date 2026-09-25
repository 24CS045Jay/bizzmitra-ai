/**
 * Connected Artifact Map Engine (USP #3)
 * Defines the complete digital transformation dependency graph, node metadata,
 * bidirectional lineage, and traceability verification rules with full multi-domain problem-statement adaptability.
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

export interface ArtifactMapBlueprint {
  domainId: string;
  domainTitle: string;
  scenarioName: string;
  nodes: ArtifactNode[];
  edges: ArtifactEdge[];
  metrics: {
    traceabilityScore: number;
    verifiedPathways: number;
    orphanedArtifacts: number;
    activeWorkspace: string;
    provenanceChain: string;
  };
}

// Standard base edges
export const DEFAULT_ARTIFACT_MAP_EDGES: ArtifactEdge[] = [
  // Foundation -> Analysis
  { from: "intake", to: "discovery", relation: "Seeds Clarifying Interview" },
  { from: "intake", to: "business-analysis", relation: "Provides Baseline Problem" },

  // Analysis -> Solution
  { from: "discovery", to: "solution-suite", relation: "Feeds Refined Boundaries" },
  { from: "business-analysis", to: "solution-suite", relation: "Feeds Identified Gaps" },
  { from: "solution-suite", to: "hr-crm", relation: "Generates Working App", isUspFlow: true },
  { from: "hr-crm", to: "solution-studio", relation: "Enables Runtime Field Customization", isUspFlow: true },
  { from: "solution-studio", to: "hr-crm", relation: "Regenerates Live State", isUspFlow: true },

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

export function getArtifactMapForWorkspace(
  workspaceContext?: {
    name?: string;
    businessName?: string;
    industry?: string;
    problemStatement?: string;
    description?: string;
  } | null
): ArtifactMapBlueprint {
  const name = workspaceContext?.businessName || workspaceContext?.name || "Enterprise Workspace";
  const industry = workspaceContext?.industry || "Operations & Management";
  const problem = workspaceContext?.problemStatement || workspaceContext?.description || "";
  const combined = `${name} ${industry} ${problem}`.toLowerCase();

  // 1. Clean Tech & Solar
  if (
    combined.includes("solar") ||
    combined.includes("clean tech") ||
    combined.includes("renewable") ||
    combined.includes("energy") ||
    combined.includes("inverter") ||
    combined.includes("photovoltaic") ||
    combined.includes("grid")
  ) {
    return {
      domainId: "solar",
      domainTitle: "Clean Tech & Solar Operations",
      scenarioName: `${name} — Connected Artifact Dependency Map`,
      edges: DEFAULT_ARTIFACT_MAP_EDGES,
      metrics: {
        traceabilityScore: 100,
        verifiedPathways: 14,
        orphanedArtifacts: 0,
        activeWorkspace: name,
        provenanceChain:
          "Raw Problem Statement ──► Discovery Slots ──► Operational Gaps ──► Solar Inverter Cockpit ──► Schema Studio ──► SCADA Architecture ──► Curtailment BPMN ──► Telemetry APIs ──► 10-Week Roadmap ──► Solar Yield ROI",
      },
      nodes: [
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
          summary: "Ingests plant single-line diagrams, Modbus register maps, curtailment guidelines, and voice inputs into a persistent workspace.",
          inputsConsumed: ["Solar plant generation brief", "Inverter technical sheets", "Grid interconnection rules"],
          outputsProduced: ["Plant Generation Topology", "Inverter Array Profile", "Workspace ID"],
          metrics: [
            { label: "Extraction Channels", value: "5 Inputs" },
            { label: "Telemetry Standard", value: "Modbus / MQTT" },
          ],
        },
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
          summary: "Identifies plant operational parameters: inverter clipping, communication deadzones, and utility curtailment penalty rates.",
          inputsConsumed: ["Plant capacity", "Grid connection tier", "Inverter OEM models"],
          outputsProduced: ["Slot-filled plant parameters", "Context maturity score (98%)"],
          metrics: [
            { label: "Maturity Level", value: "98% Complete" },
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
          summary: "Quantifies manual telemetry extraction delays, soiling detection lag, and uncoordinated utility dispatch losses.",
          inputsConsumed: ["Operational pain points", "SCADA downtime history", "Utility curtailment logs"],
          outputsProduced: ["As-Is vs To-Be SCADA model", "Plant technician matrix", "Curtailment severity matrix"],
          metrics: [
            { label: "Dispatch Velocity", value: "18m → <500ms" },
            { label: "Stakeholders", value: "4 Roles" },
          ],
        },
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
          summary: "Recommends edge gateway broker, automated power derating solvers, string diagnostics, and central SCADA control room.",
          inputsConsumed: ["Plant gap analysis", "Budget ceiling", "Interconnection timeline"],
          outputsProduced: ["4 Solar Pillars", "Edge vs Cloud evaluation", "SCADA stack picks"],
          metrics: [
            { label: "Recommended Pillars", value: "4 Modules" },
            { label: "Architecture Strategy", value: "Edge-First Hybrid" },
          ],
        },
        {
          id: "hr-crm",
          name: "Solar Inverter Cockpit",
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
          summary: "Live interactive SCADA operations portal with inverter array status, thermal derating alerts, MPPT metrics, and curtailment overrides.",
          inputsConsumed: ["Inverter telemetry stream", "Plant layout specs", "Grid setpoint limits"],
          outputsProduced: ["Live inverter roster", "Curtailment override state", "Field work orders"],
          metrics: [
            { label: "Monitored Inverters", value: "48 Inverters" },
            { label: "Telemetry Polling", value: "1Hz Stream" },
          ],
        },
        {
          id: "solution-studio",
          name: "Inverter Register Studio",
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
          summary: "Interactive register configurator and sensor threshold tuner allowing live adjustment of DC clipping limits and automated regeneration.",
          inputsConsumed: ["Modbus register additions", "Alarm setpoints", "Topology grouping"],
          outputsProduced: ["Regenerated v1.1 Inverter schema", "Updated SCADA dashboards", "Configuration changelog"],
          metrics: [
            { label: "Modbus Registers", value: "+12 Registers" },
            { label: "Regen Velocity", value: "Sub-Second" },
          ],
        },
        {
          id: "architecture",
          name: "SCADA & Modbus Architecture",
          kicker: "Stage 05",
          layer: "blueprint",
          layerLabel: "Technical Blueprints",
          route: "/workspace/architecture",
          version: "v1.1",
          status: "ready",
          x: 66,
          y: 16,
          summary: "Interactive Edge Modbus broker, TimescaleDB time-series partitions, and IEC 61850 grid telemetry architecture rendered via Mermaid.",
          inputsConsumed: ["Solar solution suite", "Telemetry scale parameters", "IEEE 1547 compliance"],
          outputsProduced: ["HLD SCADA architecture", "LLD telemetry pipeline", "Grid SLA matrix"],
          metrics: [
            { label: "Architecture Views", value: "HLD + LLD + Deploy" },
            { label: "Inspected Nodes", value: "8 Components" },
          ],
        },
        {
          id: "process",
          name: "Curtailment & Dispatch BPMN",
          kicker: "Stage 06",
          layer: "blueprint",
          layerLabel: "Technical Blueprints",
          route: "/workspace/process",
          version: "v1.1",
          status: "ready",
          x: 66,
          y: 44,
          summary: "BPMN 2.0 workflows comparing Manual Grid Curtailment vs Automated Sub-Second Setpoint Derating with field dispatch swimlanes.",
          inputsConsumed: ["Utility curtailment signals", "Plant technician roles", "BESS battery storage rules"],
          outputsProduced: ["BPMN 2.0 diagram", "4-tier swimlane sequence", "Curtailment latency breakdown"],
          metrics: [
            { label: "Response Latency", value: "18m → <500ms" },
            { label: "Swimlanes", value: "4 Actors" },
          ],
        },
        {
          id: "data-api",
          name: "Telemetry Models & APIs",
          kicker: "Stage 07",
          layer: "blueprint",
          layerLabel: "Technical Blueprints",
          route: "/workspace/data",
          version: "v1.1",
          status: "ready",
          x: 66,
          y: 74,
          summary: "Relational ER diagram, TimescaleDB hypertables, IEEE 1547 compliance schema, and RESTful telemetry API explorer.",
          inputsConsumed: ["Inverter schema", "TimescaleDB metrics", "Grid control auth"],
          outputsProduced: ["ER diagram", "PostgreSQL DDL schema", "RESTful telemetry APIs + cURL"],
          metrics: [
            { label: "Relational Tables", value: "6 Tables" },
            { label: "REST Endpoints", value: "8 Routes" },
          ],
        },
        {
          id: "roadmap",
          name: "10-Week SCADA Roadmap",
          kicker: "Stage 08",
          layer: "execution",
          layerLabel: "Execution & Economics",
          route: "/workspace/roadmap",
          version: "v1.0",
          status: "ready",
          x: 88,
          y: 30,
          summary: "Phased 3-tier rollout plan (Edge Ingestion, Curtailment Automation, Grid Certification) with staffing and industrial risk register.",
          inputsConsumed: ["SCADA components", "API contracts", "Grid certification deadlines"],
          outputsProduced: ["3-phase Gantt projection", "15 milestone deliverables", "Engineering FTE staffing"],
          metrics: [
            { label: "Delivery Duration", value: "10 Weeks" },
            { label: "Total Effort", value: "82 Person-Days" },
          ],
        },
        {
          id: "roi",
          name: "Solar Yield & PPA Lost Rev ROI",
          kicker: "Stage 09",
          layer: "execution",
          layerLabel: "Execution & Economics",
          route: "/workspace/insights",
          version: "v1.0",
          status: "ready",
          x: 88,
          y: 64,
          summary: "Algorithmic financial return calculator modeling curtailed generation recovery, reduced truck rolls, and automated IEEE 1547 compliance.",
          inputsConsumed: ["Plant megawatt capacity", "Inverter count", "Engineer rates", "Curtailment penalty rate"],
          outputsProduced: ["Net annual value", "Payback period", "36-month cashflow", "Sensitivity models"],
          metrics: [
            { label: "Payback Period", value: "2.1 Months" },
            { label: "3-Year ROI", value: "520%" },
          ],
        },
      ],
    };
  }

  // 2. Healthcare & Clinical Diagnostics
  if (
    combined.includes("health") ||
    combined.includes("clinic") ||
    combined.includes("hospital") ||
    combined.includes("medical") ||
    combined.includes("lab") ||
    combined.includes("doctor") ||
    combined.includes("patient") ||
    combined.includes("diagnostic") ||
    combined.includes("pathology")
  ) {
    return {
      domainId: "healthcare",
      domainTitle: "Clinical Diagnostics & LIS",
      scenarioName: `${name} — Connected Artifact Dependency Map`,
      edges: DEFAULT_ARTIFACT_MAP_EDGES,
      metrics: {
        traceabilityScore: 100,
        verifiedPathways: 14,
        orphanedArtifacts: 0,
        activeWorkspace: name,
        provenanceChain:
          "Raw Problem Statement ──► Discovery Slots ──► Clinical Gaps ──► Phlebotomy LIS Cockpit ──► Test Range Studio ──► LIS Architecture ──► Panic Alert BPMN ──► FHIR Database/APIs ──► 9-Week Roadmap ──► Lab Financial ROI",
      },
      nodes: [
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
          summary: "Ingests lab accreditation requirements, analyzer serial specs, phlebotomy workflows, and test requisition forms.",
          inputsConsumed: ["Clinical lab scope", "Analyzer model catalog", "CAP/NABL compliance rules"],
          outputsProduced: ["Diagnostic Department Profile", "Specimen Accessioning Spec", "Workspace ID"],
          metrics: [
            { label: "Analyzer Protocols", value: "ASTM / HL7" },
            { label: "Security Level", value: "HIPAA Zero-Trust" },
          ],
        },
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
          summary: "Detects missing clinical parameters: critical panic thresholds, delta-check margins, and physician verbal notification rules.",
          inputsConsumed: ["Department workflows", "Analyzer throughput", "Emergency contact hierarchies"],
          outputsProduced: ["Slot-filled clinical parameters", "Context maturity score (96%)"],
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
          summary: "Pinpoints high-risk operational gaps: manual phone calls for panic alerts, sample mix-ups, and delayed report sign-offs.",
          inputsConsumed: ["Phlebotomy bottlenecks", "Analyzer transcription lag", "Audit failure risks"],
          outputsProduced: ["As-Is vs To-Be LIS model", "Pathology review matrix", "TAT bottleneck analysis"],
          metrics: [
            { label: "Turnaround Time", value: "24h → 3h" },
            { label: "Stakeholders", value: "4 Roles" },
          ],
        },
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
          summary: "Recommends bi-directional ASTM drivers, 2D barcode specimen tracking, sub-90s panic alerts, and FHIR EMR sync.",
          inputsConsumed: ["Clinical gap analysis", "Budget constraints", "CAP accreditation deadlines"],
          outputsProduced: ["4 LIS Pillars", "Analyzer driver picks", "HIPAA cloud architecture"],
          metrics: [
            { label: "Recommended Pillars", value: "4 Modules" },
            { label: "Interoperability", value: "HL7 FHIR v4" },
          ],
        },
        {
          id: "hr-crm",
          name: "Phlebotomy & LIS Cockpit",
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
          summary: "Live interactive clinical LIS with specimen tube accessioning, analyzer test progression, delta-check flags, and pathologist signoff.",
          inputsConsumed: ["Analyzer serial streams", "Order requisitions", "Specimen barcodes"],
          outputsProduced: ["Verified patient results", "Delta-check exception flags", "WhatsApp report releases"],
          metrics: [
            { label: "Active Samples", value: "24 Tracked" },
            { label: "Panic Latency", value: "< 90 Seconds" },
          ],
        },
        {
          id: "solution-studio",
          name: "LIS Range & ASTM Studio",
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
          summary: "Interactive test range configurator and panic threshold customizer allowing live schema adjustment and versioned regeneration.",
          inputsConsumed: ["Custom clinical tests", "Reference ranges", "Panic alert rules"],
          outputsProduced: ["Regenerated v1.1 LIS schema", "Updated review tables", "Clinical changelog"],
          metrics: [
            { label: "Diagnostic Profiles", value: "+14 Panels" },
            { label: "Regen Velocity", value: "Instant" },
          ],
        },
        {
          id: "architecture",
          name: "LIS & FHIR Architecture",
          kicker: "Stage 05",
          layer: "blueprint",
          layerLabel: "Technical Blueprints",
          route: "/workspace/architecture",
          version: "v1.1",
          status: "ready",
          x: 66,
          y: 16,
          summary: "HLD and LLD architecture of bi-directional serial ASTM/HL7 analyzer drivers, pgcrypto PHI vault, and FHIR EMR connector.",
          inputsConsumed: ["LIS solution suite", "Analyzer telemetry scale", "CAP/NABL security rules"],
          outputsProduced: ["HLD system architecture", "LLD analyzer pipeline", "HIPAA SLA matrix"],
          metrics: [
            { label: "Architecture Views", value: "HLD + LLD + Deploy" },
            { label: "Inspected Nodes", value: "8 Components" },
          ],
        },
        {
          id: "process",
          name: "Panic Alert & Review BPMN",
          kicker: "Stage 06",
          layer: "blueprint",
          layerLabel: "Technical Blueprints",
          route: "/workspace/process",
          version: "v1.1",
          status: "ready",
          x: 66,
          y: 44,
          summary: "BPMN 2.0 workflows comparing Manual Delayed Calling vs Automated Sub-90s Critical Panic Dispatch across 4 clinical swimlanes.",
          inputsConsumed: ["Life-threatening panic values", "Pathologist review roles", "Emergency telephony APIs"],
          outputsProduced: ["BPMN 2.0 diagram", "4-tier swimlane sequence", "Panic escalation breakdown"],
          metrics: [
            { label: "Panic Escalation", value: "45m → <90s" },
            { label: "Swimlanes", value: "4 Actors" },
          ],
        },
        {
          id: "data-api",
          name: "Diagnostic Database & APIs",
          kicker: "Stage 07",
          layer: "blueprint",
          layerLabel: "Technical Blueprints",
          route: "/workspace/data",
          version: "v1.1",
          status: "ready",
          x: 66,
          y: 74,
          summary: "Relational ER diagram, specimen barcodes, PostgreSQL DDL with column encryption, and FHIR v4 DiagnosticReport APIs.",
          inputsConsumed: ["Specimen schema", "Clinical test dictionary", "Doctor auth requirements"],
          outputsProduced: ["ER diagram", "PostgreSQL DDL schema", "FHIR RESTful APIs + cURL"],
          metrics: [
            { label: "Relational Tables", value: "6 Tables" },
            { label: "REST Endpoints", value: "8 Routes" },
          ],
        },
        {
          id: "roadmap",
          name: "9-Week CAP/NABL Roadmap",
          kicker: "Stage 08",
          layer: "execution",
          layerLabel: "Execution & Economics",
          route: "/workspace/roadmap",
          version: "v1.0",
          status: "ready",
          x: 88,
          y: 30,
          summary: "Phased 3-tier rollout plan (Analyzer Ingestion, Clinical Review, EMR Interoperability) with staffing and clinical risk register.",
          inputsConsumed: ["LIS components", "FHIR endpoints", "CAP audit deadlines"],
          outputsProduced: ["3-phase Gantt projection", "15 milestone deliverables", "Clinical FTE staffing"],
          metrics: [
            { label: "Delivery Duration", value: "9 Weeks" },
            { label: "Total Effort", value: "76 Person-Days" },
          ],
        },
        {
          id: "roi",
          name: "Lab TAT & Diagnostics ROI",
          kicker: "Stage 09",
          layer: "execution",
          layerLabel: "Execution & Economics",
          route: "/workspace/insights",
          version: "v1.0",
          status: "ready",
          x: 88,
          y: 64,
          summary: "Algorithmic financial return calculator modeling automated analyzer transcription, reduced mix-up reruns, and CAP compliance.",
          inputsConsumed: ["Lab technician count", "Monthly specimen volume", "Technician rates", "Analyzer automation factor"],
          outputsProduced: ["Net annual value", "Payback period", "36-month cashflow", "Sensitivity models"],
          metrics: [
            { label: "Payback Period", value: "2.3 Months" },
            { label: "3-Year ROI", value: "490%" },
          ],
        },
      ],
    };
  }

  // 3. Fleet Logistics & Supply Chain
  if (
    combined.includes("logistics") ||
    combined.includes("fleet") ||
    combined.includes("delivery") ||
    combined.includes("truck") ||
    combined.includes("dispatch") ||
    combined.includes("transport") ||
    combined.includes("freight") ||
    combined.includes("cargo") ||
    combined.includes("warehouse") ||
    combined.includes("supply chain")
  ) {
    return {
      domainId: "logistics",
      domainTitle: "Fleet Logistics & Supply Chain",
      scenarioName: `${name} — Connected Artifact Dependency Map`,
      edges: DEFAULT_ARTIFACT_MAP_EDGES,
      metrics: {
        traceabilityScore: 100,
        verifiedPathways: 14,
        orphanedArtifacts: 0,
        activeWorkspace: name,
        provenanceChain:
          "Raw Problem Statement ──► Discovery Slots ──► Logistics Gaps ──► Dispatch Cockpit ──► Route Studio ──► Telematics Architecture ──► VRP Routing BPMN ──► Carrier EDI APIs ──► 8-Week Roadmap ──► Fleet Fuel ROI",
      },
      nodes: [
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
          summary: "Ingests fleet telematics specifications, route manifests, customer delivery windows, and DOT safety guidelines.",
          inputsConsumed: ["Fleet capacity brief", "GPS tracker hardware specs", "Carrier service agreements"],
          outputsProduced: ["Fleet Vehicle Topology", "Dispatch Route Profile", "Workspace ID"],
          metrics: [
            { label: "Tracking Protocol", value: "OBD-II / CAN-Bus" },
            { label: "Spatial Index", value: "PostGIS Geo" },
          ],
        },
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
          summary: "Identifies logistics parameters: driver shift limits (HOS), warehouse geofence radiuses, and dynamic ETA re-routing triggers.",
          inputsConsumed: ["Vehicle counts", "Delivery time windows", "Traffic density parameters"],
          outputsProduced: ["Slot-filled logistics parameters", "Context maturity score (95%)"],
          metrics: [
            { label: "Maturity Level", value: "95% Complete" },
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
          summary: "Analyzes high-cost operational bottlenecks: deadhead return miles, manual phone dispatch, and paper delivery signatures.",
          inputsConsumed: ["Dispatch delay logs", "Route fuel expense sheets", "Customer claim reports"],
          outputsProduced: ["As-Is vs To-Be Fleet model", "Driver dispatch matrix", "Routing gap severity matrix"],
          metrics: [
            { label: "Route Planning", value: "4h → 8 mins" },
            { label: "Fuel Saved", value: "+18% MPG" },
          ],
        },
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
          summary: "Recommends real-time GPS geofencing, multi-stop CVRP solver, offline driver mobile app, and carrier EDI 204/214 integration.",
          inputsConsumed: ["Logistics gap analysis", "Budget parameters", "Fleet rollout timeline"],
          outputsProduced: ["4 Fleet Pillars", "VRP solver picks", "Mobile stack architecture"],
          metrics: [
            { label: "Recommended Pillars", value: "4 Modules" },
            { label: "Routing Strategy", value: "Dynamic VRP" },
          ],
        },
        {
          id: "hr-crm",
          name: "Fleet Dispatch Cockpit",
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
          summary: "Live interactive dispatch board with active vehicle tracking, route assignment, driver check-in, and delivery manifest management.",
          inputsConsumed: ["GPS telematics stream", "Consignment manifests", "Driver status logs"],
          outputsProduced: ["Live fleet marker positions", "Active route dispatch", "Electronic POD receipts"],
          metrics: [
            { label: "Active Vehicles", value: "18 Trucks" },
            { label: "GPS Refresh", value: "5s Real-Time" },
          ],
        },
        {
          id: "solution-studio",
          name: "Capacity & Geofence Studio",
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
          summary: "Interactive vehicle capacity configurator and warehouse geofence polygon builder allowing runtime adjustment and regeneration.",
          inputsConsumed: ["Custom vehicle payload limits", "Geofence boundary polygons", "Shift durations"],
          outputsProduced: ["Regenerated v1.1 Fleet schema", "Updated dispatch views", "Logistics changelog"],
          metrics: [
            { label: "Geofence Zones", value: "+8 Hubs" },
            { label: "Regen Velocity", value: "Instant" },
          ],
        },
        {
          id: "architecture",
          name: "Telematics & VRP Architecture",
          kicker: "Stage 05",
          layer: "blueprint",
          layerLabel: "Technical Blueprints",
          route: "/workspace/architecture",
          version: "v1.1",
          status: "ready",
          x: 66,
          y: 16,
          summary: "HLD and LLD architecture of OBD-II telematics broker, PostGIS spatial queries, CVRP route solver, and offline driver sync.",
          inputsConsumed: ["Fleet solution suite", "GPS ingestion scale", "DOT compliance rules"],
          outputsProduced: ["HLD system architecture", "LLD telematics pipeline", "Driver SLA matrix"],
          metrics: [
            { label: "Architecture Views", value: "HLD + LLD + Deploy" },
            { label: "Inspected Nodes", value: "8 Components" },
          ],
        },
        {
          id: "process",
          name: "Warehouse & Route BPMN",
          kicker: "Stage 06",
          layer: "blueprint",
          layerLabel: "Technical Blueprints",
          route: "/workspace/process",
          version: "v1.1",
          status: "ready",
          x: 66,
          y: 44,
          summary: "BPMN 2.0 workflows comparing Manual Phone Dispatch vs Automated VRP Route Solving and Geofenced Gate Check-In.",
          inputsConsumed: ["Consignment orders", "Driver shift limits", "Traffic congestion feeds"],
          outputsProduced: ["BPMN 2.0 diagram", "4-tier swimlane sequence", "Turnaround delta breakdown"],
          metrics: [
            { label: "Dispatch Latency", value: "4h → 8 mins" },
            { label: "Swimlanes", value: "4 Actors" },
          ],
        },
        {
          id: "data-api",
          name: "Fleet Database & EDI APIs",
          kicker: "Stage 07",
          layer: "blueprint",
          layerLabel: "Technical Blueprints",
          route: "/workspace/data",
          version: "v1.1",
          status: "ready",
          x: 66,
          y: 74,
          summary: "Relational ER diagram, PostGIS spatial coordinates, PostgreSQL DDL with vehicle partitions, and Carrier EDI REST APIs.",
          inputsConsumed: ["Vehicle telematics schema", "Route manifest models", "Carrier auth tokens"],
          outputsProduced: ["ER diagram", "PostgreSQL DDL schema", "Carrier EDI APIs + cURL"],
          metrics: [
            { label: "Relational Tables", value: "6 Tables" },
            { label: "REST Endpoints", value: "8 Routes" },
          ],
        },
        {
          id: "roadmap",
          name: "8-Week Fleet Cutover Roadmap",
          kicker: "Stage 08",
          layer: "execution",
          layerLabel: "Execution & Economics",
          route: "/workspace/roadmap",
          version: "v1.0",
          status: "ready",
          x: 88,
          y: 30,
          summary: "Phased 3-tier rollout plan (Telematics Ingestion, VRP Solver App, Multi-Carrier EDI) with staffing and DOT risk register.",
          inputsConsumed: ["Fleet components", "Carrier EDI endpoints", "Driver rollout dates"],
          outputsProduced: ["3-phase Gantt projection", "12 milestone deliverables", "Engineering FTE staffing"],
          metrics: [
            { label: "Delivery Duration", value: "8 Weeks" },
            { label: "Total Effort", value: "72 Person-Days" },
          ],
        },
        {
          id: "roi",
          name: "Fleet Route & Fuel ROI",
          kicker: "Stage 09",
          layer: "execution",
          layerLabel: "Execution & Economics",
          route: "/workspace/insights",
          version: "v1.0",
          status: "ready",
          x: 88,
          y: 64,
          summary: "Algorithmic financial return calculator modeling route optimization fuel savings, deadhead mileage cuts, and driver productivity.",
          inputsConsumed: ["Dispatcher headcount", "Shipment volume", "Driver labor rates", "VRP automation rate"],
          outputsProduced: ["Net annual value", "Payback period", "36-month cashflow", "Sensitivity models"],
          metrics: [
            { label: "Payback Period", value: "2.2 Months" },
            { label: "3-Year ROI", value: "475%" },
          ],
        },
      ],
    };
  }

  // 4. Default / Dynamic Custom Workspace Map
  return {
    domainId: "custom",
    domainTitle: industry,
    scenarioName: `${name} — Connected Artifact Dependency Map`,
    edges: DEFAULT_ARTIFACT_MAP_EDGES,
    metrics: {
      traceabilityScore: 100,
      verifiedPathways: 14,
      orphanedArtifacts: 0,
      activeWorkspace: name,
      provenanceChain:
        `Problem Statement (${name}) ──► Discovery Dialogue ──► Business Analysis ──► Solution Suite ──► Architecture (HLD/LLD) ──► Process (BPMN) ──► Wireframes ──► Database/APIs ──► Roadmap ──► Financial ROI`,
    },
    nodes: [
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
        summary: `Ingests raw problem requirements, uploaded domain documents, and business context for ${name}.`,
        inputsConsumed: [`${industry} Problem Statement`, "Uploaded Documents", "Operating Parameters"],
        outputsProduced: ["Structured Business Context", "Entity Profile", "Workspace ID"],
        metrics: [
          { label: "Extraction Channels", value: "Multi-Modal" },
          { label: "Target Domain", value: industry.slice(0, 16) },
        ],
      },
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
        summary: "Detects missing business context parameters with explainable 'Why we ask' callouts, advancing context maturity from 38% to 96%.",
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
        summary: "Synthesizes As-Is vs To-Be operating models, stakeholder impact matrix, and high-severity operational gap analysis.",
        inputsConsumed: ["Discovery answers", "Pain points", "Current tool bottlenecks"],
        outputsProduced: ["As-Is vs To-Be report", "Stakeholder matrix", "Gap analysis severity matrix"],
        metrics: [
          { label: "Efficiency Delta", value: "34% → 89%" },
          { label: "Stakeholder Groups", value: "4 Roles" },
        ],
      },
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
        summary: "Recommends 4 core solution pillars, build-vs-buy trade-off matrices, and technical stack justifications.",
        inputsConsumed: ["Business analysis gaps", "Budget constraints", "Target timeline"],
        outputsProduced: ["4 Solution Pillars", "Build vs Buy evaluation", "Tech stack picks"],
        metrics: [
          { label: "Recommended Pillars", value: "4 Modules" },
          { label: "Trade-off Strategy", value: "Hybrid SaaS" },
        ],
      },
      {
        id: "hr-crm",
        name: "Prototype CRM App",
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
        summary: "A live, interactive operational CRM prototype with pipeline stage progression, quick search, entity modals, and activity logging.",
        inputsConsumed: ["Solution pillar specs", "Operational entity schema", "User role permissions"],
        outputsProduced: ["Live record roster", "Stage transitions", "Activity timesheet logs"],
        metrics: [
          { label: "Active Records", value: "Live Demo" },
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
        summary: "Interactive field builder and schema customizer allowing runtime addition of custom attributes and versioned AI regeneration.",
        inputsConsumed: ["User field additions", "Label adjustments", "Theme accents"],
        outputsProduced: ["Regenerated v1.1 CRM schema", "Updated data views", "Version changelog"],
        metrics: [
          { label: "Custom Attributes", value: "+3 Fields" },
          { label: "Regen Velocity", value: "3-Step State" },
        ],
      },
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
        summary: "Interactive High-Level and Low-Level architecture diagrams rendered via Mermaid.js with component inspection and SLA matrices.",
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
        summary: "BPMN 2.0 process workflows comparing Manual As-Is vs Automated To-Be with 4-tier swimlanes and bottleneck resolution analysis.",
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
        summary: "Relational Entity-Relationship diagram, column dictionary, downloadable PostgreSQL 16 DDL, and RESTful API explorer.",
        inputsConsumed: ["Customizer schema", "Candidate data models", "Client auth requirements"],
        outputsProduced: ["ER diagram", "PostgreSQL DDL schema", "RESTful API endpoints + cURL"],
        metrics: [
          { label: "Relational Tables", value: "5 Tables" },
          { label: "REST Endpoints", value: "8 Routes" },
        ],
      },
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
        summary: "Phased 3-tier rollout plan (Foundation, Coordination, Intelligence) with milestone checklists, team FTE resourcing, and risk register.",
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
        summary: "Algorithmic financial return calculator with live variable sliders, 36-month cumulative trajectory, and digital readiness radar.",
        inputsConsumed: ["Recruiter headcount", "Application volume", "Labor rates", "Automation factor"],
        outputsProduced: ["Net annual value", "Payback period", "36-month cashflow", "Sensitivity models"],
        metrics: [
          { label: "Payback Period", value: "2.4 Months" },
          { label: "3-Year ROI", value: "480%" },
        ],
      },
    ],
  };
}

// Backward-compatible exports
export const ARTIFACT_MAP_NODES = getArtifactMapForWorkspace().nodes;
export const ARTIFACT_MAP_EDGES = DEFAULT_ARTIFACT_MAP_EDGES;
export const TRACEABILITY_METRICS = getArtifactMapForWorkspace().metrics;
