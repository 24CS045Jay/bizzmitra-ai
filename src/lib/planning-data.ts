/**
 * AI Implementation Planning Engine Data & Models
 * Supports dynamic domain-specific roadmaps for Clean Tech/Solar, Healthcare/Diagnostics,
 * Fleet Logistics, FinTech, E-Commerce Support, and HR/TalentCraft, plus a universal
 * problem statement generator for any arbitrary industry intake.
 */

export type MilestoneItem = {
  id: string;
  title: string;
  category: "Architecture" | "Frontend" | "Backend" | "Data & Integration" | "QA & Security" | "Operations";
  effortDays: number;
  completed: boolean;
  deliverable: string;
};

import { isHealthcareDomain, isProjectManagementDomain } from "./domain-classifier";

export type SprintPhase = {
  id: string;
  phaseNumber: number;
  name: string;
  codename: string;
  durationWeeks: string;
  startWeek: number;
  durationWeekCount: number;
  objective: string;
  status: "completed" | "in-progress" | "upcoming";
  milestones: MilestoneItem[];
  teamResourcing: {
    role: string;
    fte: number;
    responsibilities: string;
  }[];
  criticalDeliverables: string[];
};

export type RiskItem = {
  id: string;
  title: string;
  category: "Technical" | "Adoption" | "Security" | "Timeline";
  likelihood: "Low" | "Medium" | "High";
  impact: "Low" | "Medium" | "High" | "Critical";
  consequence: string;
  mitigationStrategy: string;
  owner: string;
};

export type RoadmapBlueprint = {
  workspaceId: string;
  scenarioName: string;
  targetTimelineWeeks: number;
  totalPersonDays: number;
  estimatedGoLive: string;
  confidenceScore: number;
  executiveSummary: string;
  phases: SprintPhase[];
  riskRegister: RiskItem[];
};

// ─────────────────────────────────────────────────────────────────────────────
// 1. CLEAN TECH / SOLAR INVERTER OPERATIONS ROADMAP
// ─────────────────────────────────────────────────────────────────────────────
export const SOLAR_ROADMAP: RoadmapBlueprint = {
  workspaceId: "ws-solar-telemetry",
  scenarioName: "Clean Tech & Solar Inverter Operations Platform",
  targetTimelineWeeks: 10,
  totalPersonDays: 82,
  estimatedGoLive: "Week 10 (Grid Interconnection & PPA Ready)",
  confidenceScore: 96,
  executiveSummary:
    "A 3-phase, 10-week industrial IoT and SCADA modernization roadmap deploying real-time Modbus telemetry ingestion, automated grid curtailment solvers, string-level derating diagnostics, and IEEE 1547 compliance ledgers.",
  phases: [
    {
      id: "solar-p1",
      phaseNumber: 1,
      name: "Edge Gateway & Inverter Telemetry Ingestion",
      codename: "Telemetry Ingestion Sprint",
      durationWeeks: "Weeks 1–3",
      startWeek: 0,
      durationWeekCount: 3,
      objective:
        "Establish low-latency Modbus TCP/RTU edge collection pipeline, TimescaleDB metric partition store, and real-time plant topology canvas.",
      status: "in-progress",
      milestones: [
        {
          id: "sm-101",
          title: "Modbus TCP/RTU Edge Broker & MQTT Stream Ingestion",
          category: "Data & Integration",
          effortDays: 6,
          completed: true,
          deliverable: "Edge connector polling 48 inverters at 1Hz with local buffer and zero-packet drop",
        },
        {
          id: "sm-102",
          title: "TimescaleDB High-Frequency Metric Partitioning",
          category: "Backend",
          effortDays: 5,
          completed: true,
          deliverable: "Hypertable schema storing 1.2M daily telemetry samples with 7-day compressed rollups",
        },
        {
          id: "sm-103",
          title: "Real-Time Plant & Inverter String Health Visualizer",
          category: "Frontend",
          effortDays: 6,
          completed: true,
          deliverable: "Interactive SVG plant canvas displaying active power, DC/AC ratio, and thermal derating",
        },
        {
          id: "sm-104",
          title: "Edge Gateway Heartbeat & Offline Fallback Cache",
          category: "QA & Security",
          effortDays: 4,
          completed: false,
          deliverable: "Automated failover with local SQLite buffer preserving 72 hours of telemetry during blackouts",
        },
        {
          id: "sm-105",
          title: "mTLS Hardware Token Security & Inverter Identity Vault",
          category: "Architecture",
          effortDays: 4,
          completed: true,
          deliverable: "Mutual TLS cryptographic certificate rotation preventing rogue command injection",
        },
      ],
      teamResourcing: [
        { role: "IoT Systems Architect", fte: 1.0, responsibilities: "Modbus protocols, edge gateway firmware, and telemetry architecture" },
        { role: "Backend TimescaleDB Engineer", fte: 1.0, responsibilities: "Time-series partitioning, data compression, and metric APIs" },
        { role: "Frontend UI Specialist (React 19)", fte: 1.0, responsibilities: "Real-time plant dashboard, SVG topologies, and alerts" },
      ],
      criticalDeliverables: [
        "Sub-second Modbus telemetry ingestion from all plant inverters",
        "Plant operator real-time health dashboard with thermal alerts",
        "Secure hardware mTLS gateway with offline circular storage",
      ],
    },
    {
      id: "solar-p2",
      phaseNumber: 2,
      name: "Curtailment Automation & Field Diagnostics Engine",
      codename: "Curtailment & Dispatch Sprint",
      durationWeeks: "Weeks 4–7",
      startWeek: 3,
      durationWeekCount: 4,
      objective:
        "Implement sub-second utility curtailment solver, string derating diagnostic algorithms, and field technician mobile dispatch workflows.",
      status: "upcoming",
      milestones: [
        {
          id: "sm-201",
          title: "Automated Grid Curtailment & Power Derating Solver",
          category: "Backend",
          effortDays: 8,
          completed: false,
          deliverable: "Sub-500ms algorithm distributing utility limit setpoints across inverters dynamically",
        },
        {
          id: "sm-202",
          title: "String Underperformance & Soiling Anomaly Detector",
          category: "Architecture",
          effortDays: 6,
          completed: false,
          deliverable: "Machine learning classifier isolating soiling losses, diode failures, and shading faults",
        },
        {
          id: "sm-203",
          title: "Mobile Field Work-Order & Diagnostic App",
          category: "Frontend",
          effortDays: 6,
          completed: false,
          deliverable: "Offline-first PWA for field technicians with QR-code cabinet scan and guided troubleshooting",
        },
        {
          id: "sm-204",
          title: "BESS Battery Storage Charge/Discharge Coordinator",
          category: "Backend",
          effortDays: 5,
          completed: false,
          deliverable: "State-of-Charge optimizer shaving curtailment losses into battery reserves",
        },
        {
          id: "sm-205",
          title: "Modbus Jitter & Latency Stress Testing Suite",
          category: "QA & Security",
          effortDays: 4,
          completed: false,
          deliverable: "Automated chaos test simulating 20% cellular packet loss and electrical noise spikes",
        },
      ],
      teamResourcing: [
        { role: "Control Systems Algorithm Lead", fte: 1.0, responsibilities: "Curtailment solver, power regulation, and battery scheduling" },
        { role: "Mobile PWA Engineer", fte: 1.0, responsibilities: "Technician work orders, offline caching, and QR scanner" },
        { role: "QA / Simulation Test Engineer", fte: 0.8, responsibilities: "Hardware-in-the-loop and network chaos testing" },
      ],
      criticalDeliverables: [
        "Automated utility curtailment compliance under 500ms",
        "String anomaly detection reducing truck rolls by 40%",
        "Field technician mobile dispatch application with offline support",
      ],
    },
    {
      id: "solar-p3",
      phaseNumber: 3,
      name: "IEEE 1547 Grid Compliance & Yield PPA Financial Ledger",
      codename: "Compliance & Cutover Sprint",
      durationWeeks: "Weeks 8–10",
      startWeek: 7,
      durationWeekCount: 3,
      objective:
        "Finalize IEEE 1547/ISO-NE utility interconnection audits, financial PPA lost-generation ledgers, and 24/7 SCADA operations cutover.",
      status: "upcoming",
      milestones: [
        {
          id: "sm-301",
          title: "IEEE 1547.1 Interconnection Audit & Test Harness",
          category: "Architecture",
          effortDays: 6,
          completed: false,
          deliverable: "Automated test generator validating anti-islanding, ride-through, and VAR controls",
        },
        {
          id: "sm-302",
          title: "PPA Revenue Loss & Curtailment Financial Ledger",
          category: "Backend",
          effortDays: 5,
          completed: false,
          deliverable: "Immutable audit ledger calculating deemed generation losses and contractual penalties",
        },
        {
          id: "sm-303",
          title: "Central Control Room Multi-Screen SCADA Dashboard",
          category: "Frontend",
          effortDays: 5,
          completed: false,
          deliverable: "Wall-mounted operations dashboard with real-time audio-visual alarms and emergency trip",
        },
        {
          id: "sm-304",
          title: "Utility Operator DNP3 / IEC 61850 Feed Connector",
          category: "Data & Integration",
          effortDays: 5,
          completed: false,
          deliverable: "Secure telecommunications bridge streaming plant metrics directly to utility dispatchers",
        },
        {
          id: "sm-305",
          title: "Site Acceptance Testing (SAT) & Operator Certification",
          category: "Operations",
          effortDays: 4,
          completed: false,
          deliverable: "Complete on-site verification, safety handover signoff, and 24/7 operating procedures",
        },
      ],
      teamResourcing: [
        { role: "SCADA & Interconnect Specialist", fte: 1.0, responsibilities: "Utility DNP3 feed, IEEE 1547 certification, and protection relays" },
        { role: "Financial Data Engineer", fte: 0.8, responsibilities: "PPA yield accounting, deemed energy calculation, and billing reports" },
        { role: "Site Acceptance Lead", fte: 0.6, responsibilities: "Operator workshops, safety runbooks, and emergency drill signoff" },
      ],
      criticalDeliverables: [
        "Certified IEEE 1547 grid interconnection audit compliance",
        "Automated PPA financial ledger for lost revenue reconciliation",
        "Full SCADA control room commissioning with zero-downtime cutover",
      ],
    },
  ],
  riskRegister: [
    {
      id: "srisk-1",
      title: "Utility Curtailment Command Latency Exceeding 2.5s",
      category: "Technical",
      likelihood: "Medium",
      impact: "Critical",
      consequence: "Breaching grid interconnection agreement incurring substantial utility fines.",
      mitigationStrategy:
        "Local edge controller executes hardware PLC closed-loop curtailment directly via UDP broadcast, bypassing cloud hops.",
      owner: "Control Systems Lead",
    },
    {
      id: "srisk-2",
      title: "Cellular Telemetry Packet Drop in Remote Desert Sites",
      category: "Technical",
      likelihood: "High",
      impact: "Medium",
      consequence: "Gaps in historical yield reports and blind spots during grid disturbances.",
      mitigationStrategy:
        "Dual SIM failover with Satellite IoT secondary link and 72-hour on-broker compressed circular buffer.",
      owner: "IoT Systems Architect",
    },
    {
      id: "srisk-3",
      title: "Field Technician Resistance to Mobile App Troubleshooting",
      category: "Adoption",
      likelihood: "Medium",
      impact: "High",
      consequence: "Technicians revert to manual phone-based dispatch, delaying fault resolution by days.",
      mitigationStrategy:
        "1-click QR code scanner at inverter cabinet doors with pre-populated diagnostics and offline photo upload.",
      owner: "Field Operations Director",
    },
    {
      id: "srisk-4",
      title: "Cyber-Physical Attack on Inverter Frequency/Voltage Controls",
      category: "Security",
      likelihood: "Low",
      impact: "Critical",
      consequence: "Unauthorized setpoint tampering destabilizing plant generation or tripping grid disconnects.",
      mitigationStrategy:
        "Hardware-enforced TPM 2.0 cryptographic signing on all setpoint write commands, strict IP whitelisting, and read-only default bus.",
      owner: "Chief Information Security Officer",
    },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// 2. HEALTHCARE & CLINICAL DIAGNOSTICS ROADMAP
// ─────────────────────────────────────────────────────────────────────────────
export const HEALTHCARE_ROADMAP: RoadmapBlueprint = {
  workspaceId: "ws-healthcare-lis",
  scenarioName: "Clinical Diagnostics & LIS Telemetry Platform",
  targetTimelineWeeks: 9,
  totalPersonDays: 76,
  estimatedGoLive: "Week 9 (CAP / NABL Accreditation Ready)",
  confidenceScore: 95,
  executiveSummary:
    "A 3-phase, 9-week clinical lab automation roadmap connecting medical analyzers via ASTM/HL7, dispatching critical panic values in <90s, enforcing multi-tier pathologist reviews, and providing HIPAA/FHIR EMR integration.",
  phases: [
    {
      id: "health-p1",
      phaseNumber: 1,
      name: "LIS Core & Analyzer ASTM Protocol Intake",
      codename: "Specimen Intake Sprint",
      durationWeeks: "Weeks 1–3",
      startWeek: 0,
      durationWeekCount: 3,
      objective:
        "Deploy bi-directional serial/TCP ASTM analyzer drivers, unique 2D specimen barcode tracking, and HIPAA-compliant patient intake.",
      status: "in-progress",
      milestones: [
        {
          id: "hm-101",
          title: "ASTM / HL7 Analyzer Interface Engine",
          category: "Data & Integration",
          effortDays: 6,
          completed: true,
          deliverable: "Bi-directional serial/TCP driver parsing raw CBC and chemistry analyzer results",
        },
        {
          id: "hm-102",
          title: "Specimen 2D DataMatrix Barcode Lifecycle Tracker",
          category: "Backend",
          effortDays: 5,
          completed: true,
          deliverable: "Tube accessioning and centrifuge tracking with automated sample rack mapping",
        },
        {
          id: "hm-103",
          title: "Laboratory Phlebotomy & Intake Frontdesk Portal",
          category: "Frontend",
          effortDays: 5,
          completed: true,
          deliverable: "Patient registration interface with insurance eligibility check and order slip generator",
        },
        {
          id: "hm-104",
          title: "HIPAA Zero-Trust Patient Demographics Vault",
          category: "QA & Security",
          effortDays: 4,
          completed: true,
          deliverable: "PostgreSQL pgcrypto column-level encryption for MRN, national ID, and clinical notes",
        },
        {
          id: "hm-105",
          title: "Analyzer Dry-Run Synthetic Result Simulator",
          category: "Architecture",
          effortDays: 4,
          completed: false,
          deliverable: "Mock ASTM engine generating 500 simulated lab test runs across 12 diagnostic profiles",
        },
      ],
      teamResourcing: [
        { role: "Biomedical Systems Architect", fte: 1.0, responsibilities: "Analyzer communication drivers, ASTM/HL7 parsers, and LIS state" },
        { role: "Security & HIPAA Specialist", fte: 0.8, responsibilities: "Column encryption, access control, and audit trail vault" },
        { role: "Frontend UI Specialist", fte: 1.0, responsibilities: "Phlebotomy station UI, accessioning workflows, and barcode printer drivers" },
      ],
      criticalDeliverables: [
        "Bi-directional ASTM driver connecting chemistry and hematology analyzers",
        "Specimen tube barcode intake with duplicate-sample prevention",
        "HIPAA-compliant multi-tenant database with encrypted PHI columns",
      ],
    },
    {
      id: "health-p2",
      phaseNumber: 2,
      name: "Critical Panic Value Dispatch & Multi-Tier Review",
      codename: "Clinical Review Sprint",
      durationWeeks: "Weeks 4–6",
      startWeek: 3,
      durationWeekCount: 3,
      objective:
        "Implement real-time critical panic value escalation engine, digital delta-check verification, and senior pathologist sign-off cockpit.",
      status: "upcoming",
      milestones: [
        {
          id: "hm-201",
          title: "Sub-90s Critical Panic Value Alert Engine",
          category: "Backend",
          effortDays: 6,
          completed: false,
          deliverable: "Automated SMS, push notification, and IVR phone alert for life-threatening lab values",
        },
        {
          id: "hm-202",
          title: "Delta-Check Historical Deviation Analyzer",
          category: "Architecture",
          effortDays: 5,
          completed: false,
          deliverable: "Algorithm flagging >30% variance from patient's 30-day baseline to catch sample mix-ups",
        },
        {
          id: "hm-203",
          title: "Senior Pathologist Digital Sign-Off Cockpit",
          category: "Frontend",
          effortDays: 6,
          completed: false,
          deliverable: "High-speed multi-case review UI with digital cryptographic signature and stamp",
        },
        {
          id: "hm-204",
          title: "Critical Call Log & Physician Verbal Handover Registry",
          category: "QA & Security",
          effortDays: 4,
          completed: false,
          deliverable: "Mandatory timestamped recording of clinician verbal acknowledgment per CAP guidelines",
        },
        {
          id: "hm-205",
          title: "Patient Self-Serve Report Download & WhatsApp Bot",
          category: "Frontend",
          effortDays: 4,
          completed: false,
          deliverable: "OTP-verified encrypted PDF delivery directly to patient smartphone via WhatsApp",
        },
      ],
      teamResourcing: [
        { role: "Clinical Workflow Lead", fte: 1.0, responsibilities: "Pathologist signoff rules, panic ranges, and delta check thresholds" },
        { role: "Backend Real-Time Engineer", fte: 1.0, responsibilities: "WebSocket alerts, telephony API webhooks, and PDF report engines" },
        { role: "QA Automation Engineer", fte: 0.8, responsibilities: "Simulated panic alert escalation testing and load verification" },
      ],
      criticalDeliverables: [
        "Automated sub-90s physician panic alert for high-risk critical findings",
        "Delta-check algorithm preventing reporting of contaminated samples",
        "Secure patient WhatsApp and Web report delivery with OTP verification",
      ],
    },
    {
      id: "health-p3",
      phaseNumber: 3,
      name: "FHIR v4 Interoperability, CAP/NABL Audit Vault & Go-Live",
      codename: "Accreditation & Cutover Sprint",
      durationWeeks: "Weeks 7–9",
      startWeek: 6,
      durationWeekCount: 3,
      objective:
        "Achieve full HL7 FHIR v4 EMR interoperability, immutable QC calibration logs for CAP/NABL audits, and production clinic cutover.",
      status: "upcoming",
      milestones: [
        {
          id: "hm-301",
          title: "HL7 FHIR v4 DiagnosticReport REST API",
          category: "Data & Integration",
          effortDays: 6,
          completed: false,
          deliverable: "Standardized FHIR endpoints for bi-directional EMR/Hospital Information System sync",
        },
        {
          id: "hm-302",
          title: "Daily Quality Control (QC) Levey-Jennings Engine",
          category: "Architecture",
          effortDays: 5,
          completed: false,
          deliverable: "Westgard rules automated evaluation with automatic run suspension on 2-SD drift",
        },
        {
          id: "hm-303",
          title: "Immutable CAP / NABL Inspection Audit Ledger",
          category: "QA & Security",
          effortDays: 4,
          completed: false,
          deliverable: "Tamper-evident log of reagent lot numbers, calibration runs, and technician IDs",
        },
        {
          id: "hm-304",
          title: "Laboratory Performance & Turnaround Time (TAT) Analytics",
          category: "Frontend",
          effortDays: 4,
          completed: false,
          deliverable: "Executive dashboard tracking sample intake-to-report SLA compliance across departments",
        },
        {
          id: "hm-305",
          title: "Hospital EMR Cutover & Lab Technician Onboarding",
          category: "Operations",
          effortDays: 4,
          completed: false,
          deliverable: "Zero-downtime database cutover and staff training on phlebotomy scanning workflows",
        },
      ],
      teamResourcing: [
        { role: "Health Interoperability Specialist", fte: 1.0, responsibilities: "FHIR v4 endpoints, EMR integration, and Westgard QC rules" },
        { role: "Senior QA & Compliance Lead", fte: 1.0, responsibilities: "CAP/NABL documentation, validation checklists, and audit reports" },
        { role: "Lab Operations Transition Manager", fte: 0.6, responsibilities: "Technician training, user acceptance, and cutover monitoring" },
      ],
      criticalDeliverables: [
        "Certified HL7 FHIR v4 EMR integration for automatic lab orders",
        "Westgard rules QC monitor for analyzer precision and calibration",
        "Full CAP/NABL audit documentation readiness with zero critical findings",
      ],
    },
  ],
  riskRegister: [
    {
      id: "hrisk-1",
      title: "Analyzer Serial Communication Drift / Packet Dropping",
      category: "Technical",
      likelihood: "Medium",
      impact: "High",
      consequence: "Lab results trapped on device serial buffer, delaying patient diagnostics.",
      mitigationStrategy:
        "Robust hardware serial-to-IP gateways with local hardware flow control (RTS/CTS) and automatic ACK-retry.",
      owner: "Biomedical Systems Architect",
    },
    {
      id: "hrisk-2",
      title: "Delay in Clinician Acknowledgment of Critical Panic Findings",
      category: "Adoption",
      likelihood: "High",
      impact: "Critical",
      consequence: "Patient treatment delayed during acute medical emergencies.",
      mitigationStrategy:
        "Multi-tiered escalation ladder: Push alert → Automated phone call → Switchboard operator emergency dispatch in 5 min.",
      owner: "Clinical Operations Director",
    },
    {
      id: "hrisk-3",
      title: "Accidental Exposure of Protected Health Information (PHI)",
      category: "Security",
      likelihood: "Low",
      impact: "Critical",
      consequence: "Severe regulatory penalties under HIPAA and DPDP regulations.",
      mitigationStrategy:
        "Zero-trust row-level security, column-level AES-256 encryption for patient demographics, and audit logged access.",
      owner: "Data Protection Officer",
    },
    {
      id: "hrisk-4",
      title: "Technician Bypassing Barcode Scanners During Rush Hours",
      category: "Adoption",
      likelihood: "Medium",
      impact: "High",
      consequence: "Manual sample entry errors leading to mismatched specimen tubes.",
      mitigationStrategy:
        "System hard-blocks manual result entry for barcoded profiles without verified hardware scanner trigger event.",
      owner: "Chief Pathologist",
    },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// 3. FLEET LOGISTICS, SUPPLY CHAIN & DISPATCH ROADMAP
// ─────────────────────────────────────────────────────────────────────────────
export const LOGISTICS_ROADMAP: RoadmapBlueprint = {
  workspaceId: "ws-logistics-fleet",
  scenarioName: "Fleet Dispatch, VRP Routing & Telematics Platform",
  targetTimelineWeeks: 8,
  totalPersonDays: 72,
  estimatedGoLive: "Week 8 (Fleet Cutover Ready)",
  confidenceScore: 93,
  executiveSummary:
    "A 3-phase, 8-week logistics orchestration roadmap delivering real-time vehicle GPS geofencing, sub-second VRP route optimization solvers, automated driver HOS logging, and multi-carrier proof-of-delivery sync.",
  phases: [
    {
      id: "fleet-p1",
      phaseNumber: 1,
      name: "Telematics Intake & Geofence Ingestion Engine",
      codename: "Telemetry Sprint",
      durationWeeks: "Weeks 1–2",
      startWeek: 0,
      durationWeekCount: 2,
      objective:
        "Connect OBD-II / CAN-bus GPS trackers, configure automated warehouse geofences, and deploy vehicle telemetry state store.",
      status: "in-progress",
      milestones: [
        {
          id: "lm-101",
          title: "Vehicle OBD-II / CAN-Bus GPS Webhook Broker",
          category: "Data & Integration",
          effortDays: 5,
          completed: true,
          deliverable: "High-throughput ingestion handling 5,000 GPS pings/min with spatial PostGIS indexing",
        },
        {
          id: "lm-102",
          title: "Circular & Polygon Warehouse Geofencing Engine",
          category: "Backend",
          effortDays: 5,
          completed: true,
          deliverable: "Sub-100ms entry/exit detection triggering automatic gate check-in and dock assignment",
        },
        {
          id: "lm-103",
          title: "Fleet Dispatch Command Map Visualizer",
          category: "Frontend",
          effortDays: 6,
          completed: true,
          deliverable: "Live Mapbox/Leaflet vector map with vehicle clustering, breadcrumb trails, and status filters",
        },
        {
          id: "lm-104",
          title: "Driver Identity & Fleet Asset Registry",
          category: "Backend",
          effortDays: 4,
          completed: false,
          deliverable: "Relational schema mapping drivers, vehicles, trailers, and license compliance dates",
        },
      ],
      teamResourcing: [
        { role: "Geospatial Data Architect", fte: 1.0, responsibilities: "PostGIS schemas, spatial queries, and GPS intake streaming" },
        { role: "Frontend Maps Engineer", fte: 1.0, responsibilities: "Mapbox integration, vehicle live markers, and filter controls" },
      ],
      criticalDeliverables: [
        "Real-time GPS tracking stream with PostGIS spatial indexing",
        "Automated warehouse geofence entry and exit alerts",
        "Central fleet dispatch map with vehicle status indicators",
      ],
    },
    {
      id: "fleet-p2",
      phaseNumber: 2,
      name: "Dynamic VRP Route Optimizer & Driver Mobile App",
      codename: "Routing & Dispatch Sprint",
      durationWeeks: "Weeks 3–5",
      startWeek: 2,
      durationWeekCount: 3,
      objective:
        "Implement Capacitated Vehicle Routing Problem (CVRP) solver with live traffic constraints, driver manifest generation, and offline-ready mobile app.",
      status: "upcoming",
      milestones: [
        {
          id: "lm-201",
          title: "Multi-Stop CVRP Route Optimization Solver",
          category: "Architecture",
          effortDays: 7,
          completed: false,
          deliverable: "Genetic algorithm optimizer reducing total route distance by 22% and balancing driver shifts",
        },
        {
          id: "lm-202",
          title: "Driver Turn-by-Turn Navigation & Manifest Mobile App",
          category: "Frontend",
          effortDays: 7,
          completed: false,
          deliverable: "React Native / PWA driver application with offline manifests and audio turn prompts",
        },
        {
          id: "lm-203",
          title: "Hours of Service (HOS) & Driver Fatigue Safety Monitor",
          category: "Backend",
          effortDays: 5,
          completed: false,
          deliverable: "DOT-compliant driving shift tracker with mandatory rest alerts preventing violation fines",
        },
        {
          id: "lm-204",
          title: "Live ETA Dynamic Recalculation Service",
          category: "Backend",
          effortDays: 4,
          completed: false,
          deliverable: "Real-time ETA adjustments incorporating traffic slowdowns, sent via SMS to consignees",
        },
      ],
      teamResourcing: [
        { role: "Operations Research Algorithm Lead", fte: 1.0, responsibilities: "VRP solver, traffic matrices, and capacity algorithms" },
        { role: "Mobile Application Developer", fte: 1.0, responsibilities: "Driver app, offline SQLite caching, and navigation bridge" },
        { role: "Backend Distributed Engineer", fte: 0.8, responsibilities: "ETA recalculation engine and SMS webhooks" },
      ],
      criticalDeliverables: [
        "Automated route optimization engine saving 20%+ fleet fuel costs",
        "Driver mobile application with live dispatch manifest and navigation",
        "DOT-compliant driver Hours of Service (HOS) automated compliance",
      ],
    },
    {
      id: "fleet-p3",
      phaseNumber: 3,
      name: "Multi-Carrier EDI, Automated POD & Enterprise Cutover",
      codename: "Fulfillment & Cutover Sprint",
      durationWeeks: "Weeks 6–8",
      startWeek: 5,
      durationWeekCount: 3,
      objective:
        "Connect multi-carrier EDI integrations, implement digital proof-of-delivery (signature + photo), and complete fleet-wide rollout.",
      status: "upcoming",
      milestones: [
        {
          id: "lm-301",
          title: "Digital Proof-of-Delivery (e-POD) Signature & Photo Capture",
          category: "Frontend",
          effortDays: 5,
          completed: false,
          deliverable: "Driver signature pad, package barcode scan, and geostamped photo upload",
        },
        {
          id: "lm-302",
          title: "Carrier EDI 204/214/210 Freight Communication Hub",
          category: "Data & Integration",
          effortDays: 6,
          completed: false,
          deliverable: "Standardized EDI bridge interfacing with 3PL carriers and freight brokers",
        },
        {
          id: "lm-303",
          title: "Fleet Operating Margin & Fuel Consumption Dashboard",
          category: "Frontend",
          effortDays: 4,
          completed: false,
          deliverable: "Executive dashboard visualizing cost-per-mile, idle times, and route profitability",
        },
        {
          id: "lm-304",
          title: "Fleet-Wide Driver Rollout & Dispatcher Training",
          category: "Operations",
          effortDays: 4,
          completed: false,
          deliverable: "Onboarding workshops for 120+ drivers and cutover from legacy radio dispatch",
        },
      ],
      teamResourcing: [
        { role: "EDI & Carrier Integration Engineer", fte: 1.0, responsibilities: "Carrier EDI formats, freight billing, and webhook feeds" },
        { role: "Fullstack Analytics Engineer", fte: 0.8, responsibilities: "Fleet cost-per-mile analytics and POD archival" },
        { role: "Fleet Operations Change Manager", fte: 0.6, responsibilities: "Driver app training and transition execution" },
      ],
      criticalDeliverables: [
        "Contactless digital proof-of-delivery eliminating paper invoices",
        "Carrier EDI integration automating 3PL freight load tendering",
        "Executive fleet economics cockpit tracking cost-per-mile in real time",
      ],
    },
  ],
  riskRegister: [
    {
      id: "lrisk-1",
      title: "Cellular Coverage Dead Zones on Rural Highway Corridors",
      category: "Technical",
      likelihood: "High",
      impact: "Medium",
      consequence: "Driver app fails to sync delivery status or receive route modifications.",
      mitigationStrategy:
        "Offline-first mobile architecture stores manifests and signatures in encrypted local SQLite, auto-syncing upon signal recovery.",
      owner: "Mobile Application Developer",
    },
    {
      id: "lrisk-2",
      title: "Driver Resistance to Smartphone-Based Digital Manifests",
      category: "Adoption",
      likelihood: "Medium",
      impact: "High",
      consequence: "Drivers refuse to use the app, leading to missing delivery records.",
      mitigationStrategy:
        "Large-touch high-contrast UI, multi-language audio prompts, and gamified on-time fuel conservation bonus incentives.",
      owner: "Fleet Operations Change Manager",
    },
    {
      id: "lrisk-3",
      title: "Traffic Ingestion API Throttling During Major Weather Events",
      category: "Technical",
      likelihood: "Low",
      impact: "High",
      consequence: "VRP solver falls back to Euclidean distances, producing sub-optimal routes.",
      mitigationStrategy:
        "Dual-vendor traffic fallback (Mapbox + OpenStreetMap OSRM) with cached historical speed profiles.",
      owner: "Operations Research Algorithm Lead",
    },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// 4. FINTECH, LENDING & PAYMENT OPERATIONS ROADMAP
// ─────────────────────────────────────────────────────────────────────────────
export const FINTECH_ROADMAP: RoadmapBlueprint = {
  workspaceId: "ws-fintech-lending",
  scenarioName: "FinTech Core Ledger & Automated Underwriting Engine",
  targetTimelineWeeks: 8,
  totalPersonDays: 74,
  estimatedGoLive: "Week 8 (PCI-DSS & RBI Compliance Ready)",
  confidenceScore: 95,
  executiveSummary:
    "A 3-phase, 8-week financial infrastructure roadmap establishing double-entry balance sheets, automated credit bureau pull & underwriting risk models, instant video KYC verification, and automated NACH auto-debit settlements.",
  phases: [
    {
      id: "fin-p1",
      phaseNumber: 1,
      name: "Double-Entry Ledger & Multi-Tenant KYC Intake",
      codename: "Ledger Core Sprint",
      durationWeeks: "Weeks 1–3",
      startWeek: 0,
      durationWeekCount: 3,
      objective:
        "Establish immutable double-entry journal balance sheet, Aadhaar/PAN instant identity verification, and bank statement parser.",
      status: "in-progress",
      milestones: [
        {
          id: "fm-101",
          title: "Double-Entry Financial Accounting Ledger Engine",
          category: "Architecture",
          effortDays: 6,
          completed: true,
          deliverable: "Strict debit/credit equality constraint with immutable audit journal in PostgreSQL",
        },
        {
          id: "fm-102",
          title: "PAN / Aadhaar Instant KYC Verification API",
          category: "Data & Integration",
          effortDays: 5,
          completed: true,
          deliverable: "Real-time government registry lookup with biometric deduplication",
        },
        {
          id: "fm-103",
          title: "Borrower Loan Application Onboarding Journey",
          category: "Frontend",
          effortDays: 5,
          completed: true,
          deliverable: "Responsive mobile loan application funnel with step-by-step progress indicator",
        },
        {
          id: "fm-104",
          title: "Bank Statement AA (Account Aggregator) Parser",
          category: "Backend",
          effortDays: 5,
          completed: false,
          deliverable: "Automated extraction of monthly average balance, salary credits, and bounce history",
        },
      ],
      teamResourcing: [
        { role: "FinTech Core Ledger Architect", fte: 1.0, responsibilities: "Double-entry rules, financial balance checks, and accounting consistency" },
        { role: "Security & Compliance Engineer", fte: 1.0, responsibilities: "Aadhaar vault encryption, tokenization, and audit trails" },
      ],
      criticalDeliverables: [
        "Immutable double-entry transaction ledger with strict zero-sum verification",
        "Instant digital KYC verification verifying identity in under 30 seconds",
        "Account aggregator bank statement parser extracting financial health",
      ],
    },
    {
      id: "fin-p2",
      phaseNumber: 2,
      name: "Underwriting Risk Engine & Credit Bureau Pipeline",
      codename: "Underwriting Sprint",
      durationWeeks: "Weeks 4–6",
      startWeek: 3,
      durationWeekCount: 3,
      objective:
        "Connect CIBIL/Experian credit bureau APIs, deploy automated underwriting risk scorecards, and generate dynamic loan terms.",
      status: "upcoming",
      milestones: [
        {
          id: "fm-201",
          title: "Credit Bureau (CIBIL/Experian) Integration Gateway",
          category: "Data & Integration",
          effortDays: 6,
          completed: false,
          deliverable: "Automated credit report pull parsing credit scores, active tradelines, and DPD delinquency",
        },
        {
          id: "fm-202",
          title: "Automated Loan Underwriting & Approval Rules Engine",
          category: "Architecture",
          effortDays: 6,
          completed: false,
          deliverable: "Credit matrix evaluating Debt-to-Income, FOIR, and issuing automated sanction letters",
        },
        {
          id: "fm-203",
          title: "Credit Underwriter Manual Review & Override Desk",
          category: "Frontend",
          effortDays: 5,
          completed: false,
          deliverable: "Dedicated loan officer workbench for high-ticket exception approvals",
        },
        {
          id: "fm-204",
          title: "e-Sign & Digital Loan Agreement Contract Execution",
          category: "Backend",
          effortDays: 4,
          completed: false,
          deliverable: "Aadhaar e-Sign bridge with cryptographic legal contract stamping",
        },
      ],
      teamResourcing: [
        { role: "Credit Risk Algorithm Lead", fte: 1.0, responsibilities: "Underwriting scorecards, rule engines, and bureau parsing" },
        { role: "Frontend UI Specialist", fte: 1.0, responsibilities: "Loan officer review cockpit and e-sign workflows" },
      ],
      criticalDeliverables: [
        "Sub-minute automated credit decisioning engine with bureau integration",
        "Loan officer exception approval workbench with audit-logged overrides",
        "Legally binding digital loan agreement execution via Aadhaar e-Sign",
      ],
    },
    {
      id: "fin-p3",
      phaseNumber: 3,
      name: "Payment Gateway, NACH Auto-Debit & RBI Audit Reporting",
      codename: "Settlement & Cutover Sprint",
      durationWeeks: "Weeks 7–8",
      startWeek: 6,
      durationWeekCount: 2,
      objective:
        "Deploy automated loan disbursement via IMPS/NEFT, e-NACH recurring collection mandates, and regulatory reporting.",
      status: "upcoming",
      milestones: [
        {
          id: "fm-301",
          title: "Instant Loan Disbursement via Escrow Banking API",
          category: "Backend",
          effortDays: 5,
          completed: false,
          deliverable: "Automated instant payout into borrower bank account upon contract execution",
        },
        {
          id: "fm-302",
          title: "e-NACH / UPI AutoPay Recurring Mandate Setup",
          category: "Data & Integration",
          effortDays: 5,
          completed: false,
          deliverable: "Automated EMI collection mandate registration preventing default delinquencies",
        },
        {
          id: "fm-303",
          title: "Portfolio Delinquency (NPA) & Collection Dashboard",
          category: "Frontend",
          effortDays: 4,
          completed: false,
          deliverable: "Real-time monitoring of 30/60/90 DPD buckets, collection recovery, and yield return",
        },
        {
          id: "fm-304",
          title: "RBI NBFC Compliance & Statutory Audit Export Suite",
          category: "QA & Security",
          effortDays: 4,
          completed: false,
          deliverable: "One-click export of SMA/NPA classification and regulatory capital adequacy reports",
        },
      ],
      teamResourcing: [
        { role: "Payment Gateways & Banking Lead", fte: 1.0, responsibilities: "Disbursement rails, e-NACH mandates, and settlement reconciliation" },
        { role: "Regulatory Reporting Specialist", fte: 0.8, responsibilities: "RBI audit outputs, NPA ledgers, and compliance certification" },
      ],
      criticalDeliverables: [
        "Instant automated loan disbursement in under 60 seconds",
        "Recurring e-NACH auto-debit collection mandate coverage",
        "Comprehensive RBI compliance and delinquency risk cockpit",
      ],
    },
  ],
  riskRegister: [
    {
      id: "frisk-1",
      title: "Credit Bureau API Webhook Timeout During Peak Hours",
      category: "Technical",
      likelihood: "Medium",
      impact: "High",
      consequence: "Borrowers stuck in pending state, causing loan application abandonment.",
      mitigationStrategy:
        "Asynchronous worker with automatic retry and dual-bureau fallback (Experian fallback if CIBIL response exceeds 15s).",
      owner: "Credit Risk Algorithm Lead",
    },
    {
      id: "frisk-2",
      title: "e-NACH Mandate Bounces and High Payment Default Rate",
      category: "Adoption",
      likelihood: "High",
      impact: "Critical",
      consequence: "Escalation of Non-Performing Assets (NPAs) impacting lending profitability.",
      mitigationStrategy:
        "Proactive WhatsApp payment reminders 3 days prior, smart re-presentment rules, and UPI AutoPay secondary mandate.",
      owner: "Payment Gateways Lead",
    },
    {
      id: "frisk-3",
      title: "PII & Financial Identity Breach Under DPDP / RBI Regulations",
      category: "Security",
      likelihood: "Low",
      impact: "Critical",
      consequence: "Severe statutory penalties and suspension of NBFC operating license.",
      mitigationStrategy:
        "Aadhaar redaction at intake, tokenized bank account storage, and zero-knowledge employee access control.",
      owner: "Security & Compliance Engineer",
    },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// 5. HR & RECRUITMENT SERVICES ROADMAP (TalentCraft Flagship)
// ─────────────────────────────────────────────────────────────────────────────
export const HR_CONSULTANCY_ROADMAP: RoadmapBlueprint = {
  workspaceId: "ws-talentcraft-hr",
  scenarioName: "TalentCraft HR Consultancy Digital Transformation",
  targetTimelineWeeks: 9,
  totalPersonDays: 68,
  estimatedGoLive: "Week 9 (Go-Live Readiness)",
  confidenceScore: 94,
  executiveSummary:
    "A 3-phase, 9-week modernization roadmap transforming TalentCraft from manual spreadsheet pipelines into an automated Talent CRM, Client Requisition Portal, and Biometric Attendance Tracking Suite.",
  phases: [
    {
      id: "phase-1",
      phaseNumber: 1,
      name: "MVP Foundation & Core ATS Pipeline",
      codename: "Foundation Sprint",
      durationWeeks: "Weeks 1–3",
      startWeek: 0,
      durationWeekCount: 3,
      objective:
        "Replace fragmented Google Sheets with central candidate database, pipeline Kanban, and consultant check-in punch clock.",
      status: "in-progress",
      milestones: [
        {
          id: "m-101",
          title: "PostgreSQL 16 Multi-Tenant Schema Deployment",
          category: "Data & Integration",
          effortDays: 4,
          completed: true,
          deliverable: "Normalized tables for candidates, applications, clients, and attendance with RLS",
        },
        {
          id: "m-102",
          title: "Core ATS Pipeline & Stage Progression (USP #1)",
          category: "Frontend",
          effortDays: 7,
          completed: true,
          deliverable: "Interactive CRM candidate grid with stage transitions (Screening → Interview → Offer → Rejected)",
        },
        {
          id: "m-103",
          title: "Consultant Attendance Punch Clock Engine",
          category: "Backend",
          effortDays: 3,
          completed: true,
          deliverable: "Daily check-in / check-out timestamp logger with geolocation tagging",
        },
        {
          id: "m-104",
          title: "Legacy Spreadsheet Data Migration Script",
          category: "Data & Integration",
          effortDays: 4,
          completed: false,
          deliverable: "Automated CSV import parser cleaning 1,200 historical candidate records",
        },
        {
          id: "m-105",
          title: "Role-Based Authentication & Session Security",
          category: "QA & Security",
          effortDays: 3,
          completed: true,
          deliverable: "JWT auth with Recruiter, Account Manager, and Admin permission roles",
        },
      ],
      teamResourcing: [
        { role: "Lead Fullstack Architect", fte: 1.0, responsibilities: "Data schema, auth architecture, and core CRM state" },
        { role: "Frontend Engineer (React 19)", fte: 1.0, responsibilities: "Interactive CRM UI, stage dragging, and search filters" },
        { role: "Backend / Database Engineer", fte: 0.8, responsibilities: "PostgreSQL RLS, migration scripts, and punch clock APIs" },
      ],
      criticalDeliverables: [
        "Live interactive Talent CRM replacing Google Sheets",
        "Consultant daily punch clock with exportable timesheets",
        "Clean migration of historical candidate roster",
      ],
    },
    {
      id: "phase-2",
      phaseNumber: 2,
      name: "Client Portal & Automated Interview Sync",
      codename: "Coordination Sprint",
      durationWeeks: "Weeks 4–6",
      startWeek: 3,
      durationWeekCount: 3,
      objective:
        "Streamline client requisition intake, shortlisting reviews, and WhatsApp/Email calendar interview scheduling.",
      status: "upcoming",
      milestones: [
        {
          id: "m-201",
          title: "Client Self-Serve Onboarding & Requisition Portal",
          category: "Frontend",
          effortDays: 6,
          completed: false,
          deliverable: "Protected portal for corporate clients to post openings and review shortlists",
        },
        {
          id: "m-202",
          title: "Automated Interview Scheduling & Google Calendar Sync",
          category: "Backend",
          effortDays: 5,
          completed: false,
          deliverable: "2-way OAuth calendar sync preventing double-booking of interviewers",
        },
        {
          id: "m-203",
          title: "WhatsApp Business API & Email Notification Trigger",
          category: "Data & Integration",
          effortDays: 4,
          completed: false,
          deliverable: "Automated interview reminders cutting candidate no-show rates by 40%",
        },
        {
          id: "m-204",
          title: "Client Feedback & Rating Loop",
          category: "Frontend",
          effortDays: 3,
          completed: false,
          deliverable: "1-click client approval/rejection interface with interview scorecards",
        },
        {
          id: "m-205",
          title: "Solution Studio Custom Field Engine (USP #2)",
          category: "Architecture",
          effortDays: 5,
          completed: true,
          deliverable: "Runtime custom attribute builder (LinkedIn URL, CTC, Notice Period) + AI regeneration",
        },
      ],
      teamResourcing: [
        { role: "Fullstack Engineer", fte: 1.0, responsibilities: "Client portal routes and scorecard widgets" },
        { role: "Integration Specialist", fte: 1.0, responsibilities: "WhatsApp Business webhooks and Google Calendar APIs" },
        { role: "QA Automation Engineer", fte: 0.6, responsibilities: "End-to-end interview booking testing" },
      ],
      criticalDeliverables: [
        "Client self-serve portal reducing email coordination by 65%",
        "Automated WhatsApp interview reminder notifications",
        "Solution Studio runtime field schema customization",
      ],
    },
    {
      id: "phase-3",
      phaseNumber: 3,
      name: "AI Talent Matching & Executive Analytics",
      codename: "Intelligence Sprint",
      durationWeeks: "Weeks 7–9",
      startWeek: 6,
      durationWeekCount: 3,
      objective:
        "Deploy AI resume indexing, candidate-job matching algorithms, and agency profitability analytics.",
      status: "upcoming",
      milestones: [
        {
          id: "m-301",
          title: "AI Resume Parsing & Skill Extraction Pipeline",
          category: "Backend",
          effortDays: 6,
          completed: false,
          deliverable: "Async worker extracting candidate skills, experience years, and certifications from PDFs",
        },
        {
          id: "m-302",
          title: "Semantic Candidate-Job Requisition Matcher",
          category: "Architecture",
          effortDays: 5,
          completed: false,
          deliverable: "Vector embedding match ranking top 5 candidates for any newly posted requisition",
        },
        {
          id: "m-303",
          title: "Executive Profitability & Placement Velocity Dashboard",
          category: "Frontend",
          effortDays: 4,
          completed: false,
          deliverable: "C-level KPIs: placement velocity, recruiter billing ratios, and client SLA compliance",
        },
        {
          id: "m-304",
          title: "Universal Blueprint Export Center",
          category: "Operations",
          effortDays: 3,
          completed: false,
          deliverable: "One-click export of complete enterprise documentation (PDF, Word, Excel, OpenAPI, SQL)",
        },
        {
          id: "m-305",
          title: "Production Cutover & Recruiter Training Workshop",
          category: "Operations",
          effortDays: 3,
          completed: false,
          deliverable: "Zero-downtime database cutover and staff onboarding guide",
        },
      ],
      teamResourcing: [
        { role: "AI / ML Engineer", fte: 1.0, responsibilities: "Resume parser models and vector embedding ranker" },
        { role: "Frontend UI Specialist", fte: 1.0, responsibilities: "Analytics graphs and export center" },
        { role: "Product Delivery Lead", fte: 0.5, responsibilities: "User acceptance testing and team training" },
      ],
      criticalDeliverables: [
        "Automated resume indexing cutting manual screening time by 75%",
        "Executive dashboard for placement speed and client revenue",
        "Full production cutover with complete team sign-off",
      ],
    },
  ],
  riskRegister: [
    {
      id: "risk-1",
      title: "Recruiter Resistance to Spreadsheet Abandonment",
      category: "Adoption",
      likelihood: "Medium",
      impact: "High",
      consequence: "Recruiters continue running parallel shadow spreadsheets, causing data desynchronization.",
      mitigationStrategy:
        "Incorporate 1-click CSV export and high-speed keyboard shortcuts matching Excel muscle memory in the Talent CRM.",
      owner: "HR Operations Lead",
    },
    {
      id: "risk-2",
      title: "Resume Parsing Variability Across Non-Standard Formats",
      category: "Technical",
      likelihood: "High",
      impact: "Medium",
      consequence: "Complex or graphic designer resumes fail automated field extraction.",
      mitigationStrategy:
        "Human-in-the-loop review card allowing recruiters to verify or adjust extracted skills before indexing.",
      owner: "AI Solution Architect",
    },
    {
      id: "risk-3",
      title: "WhatsApp API Delivery Latency During Peak Cycles",
      category: "Technical",
      likelihood: "Low",
      impact: "High",
      consequence: "Interview reminder messages delayed, leading to candidate absence.",
      mitigationStrategy:
        "Dual-channel notification fallback with automatic SMS / Email trigger if WhatsApp delivery receipts time out after 90s.",
      owner: "Lead Backend Engineer",
    },
    {
      id: "risk-4",
      title: "Candidate Personal Data Privacy & Compliance (DPDP Act)",
      category: "Security",
      likelihood: "Low",
      impact: "Critical",
      consequence: "Legal liability or regulatory penalties for unconsented candidate profile storage.",
      mitigationStrategy:
        "Automated 180-day resume data retention policy, consent checkboxes on intake, and encrypted storage at rest.",
      owner: "Compliance & Security Officer",
    },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// 6. E-COMMERCE & SUPPORT AUTOMATION (NEXA SUPPORT)
// ─────────────────────────────────────────────────────────────────────────────
export const NEXA_SUPPORT_ROADMAP: RoadmapBlueprint = {
  workspaceId: "ws-nexa-support",
  scenarioName: "Nexa E-Commerce Support Automation",
  targetTimelineWeeks: 6,
  totalPersonDays: 69,
  estimatedGoLive: "Week 6 (Automated Triage Live)",
  confidenceScore: 91,
  executiveSummary:
    "A 3-phase, 6-week engineering plan implementing AI triage, Shopify order status auto-resolution, and agent Freshdesk copilot sidebar.",
  phases: [
    {
      id: "nexa-p1",
      phaseNumber: 1,
      name: "Foundation & Webhook Intake",
      codename: "Webhook Sprint",
      durationWeeks: "Weeks 1–2",
      startWeek: 0,
      durationWeekCount: 2,
      objective: "Connect Freshdesk webhooks and establish ticket mirror schema with HMAC authentication.",
      status: "in-progress",
      milestones: [
        {
          id: "nm-1",
          title: "Freshdesk Webhook Intake & Verification",
          category: "Backend",
          effortDays: 5,
          completed: true,
          deliverable: "HMAC-signed webhook listener handling 1,200 tickets/day",
        },
        {
          id: "nm-2",
          title: "Shopify / Shiprocket Read Connectors",
          category: "Data & Integration",
          effortDays: 6,
          completed: true,
          deliverable: "Order status joined endpoint with 90s in-memory cache",
        },
        {
          id: "nm-3",
          title: "Support Ticket State & Customer Ledger",
          category: "Architecture",
          effortDays: 4,
          completed: true,
          deliverable: "Normalized PostgreSQL customer purchase history schema",
        },
      ],
      teamResourcing: [
        { role: "Backend Systems Engineer", fte: 1.0, responsibilities: "Webhooks and API integrations" },
        { role: "E-Commerce Integration Specialist", fte: 0.8, responsibilities: "Shopify and Shiprocket connectors" },
      ],
      criticalDeliverables: ["Secure webhook intake", "Order connector APIs"],
    },
    {
      id: "nexa-p2",
      phaseNumber: 2,
      name: "AI Triage & Auto-Resolvers",
      codename: "Classifier Sprint",
      durationWeeks: "Weeks 3–4",
      startWeek: 2,
      durationWeekCount: 2,
      objective: "Train classifier on historical tickets and implement return eligibility business rules.",
      status: "upcoming",
      milestones: [
        {
          id: "nm-4",
          title: "Intent Classifier Training (7 Categories)",
          category: "Architecture",
          effortDays: 7,
          completed: false,
          deliverable: "Fine-tuned classifier with >85% confidence threshold",
        },
        {
          id: "nm-5",
          title: "Return & Refund Eligibility Rules Engine",
          category: "Backend",
          effortDays: 6,
          completed: false,
          deliverable: "Deterministic RMA approval pipeline evaluating 14-day delivery cutoff",
        },
      ],
      teamResourcing: [
        { role: "ML / AI Engineer", fte: 1.0, responsibilities: "Model training and evaluation" },
        { role: "Fullstack Engineer", fte: 1.0, responsibilities: "Return rules engine" },
      ],
      criticalDeliverables: ["Order status auto-resolver", "Return eligibility engine"],
    },
    {
      id: "nexa-p3",
      phaseNumber: 3,
      name: "Agent Copilot Sidebar & Analytics",
      codename: "Copilot Sprint",
      durationWeeks: "Weeks 5–6",
      startWeek: 4,
      durationWeekCount: 2,
      objective: "Deploy Freshdesk sidebar app with one-click canned response suggestions and CSAT analytics.",
      status: "upcoming",
      milestones: [
        {
          id: "nm-6",
          title: "Freshdesk Agent Sidebar Extension",
          category: "Frontend",
          effortDays: 6,
          completed: false,
          deliverable: "Iframe app displaying AI customer summary and recommended action",
        },
        {
          id: "nm-7",
          title: "Support Velocity & CSAT Executive Dashboard",
          category: "Frontend",
          effortDays: 4,
          completed: false,
          deliverable: "Metrics dashboard tracking first-contact resolution and deflection rate",
        },
      ],
      teamResourcing: [
        { role: "Frontend UI Specialist", fte: 1.0, responsibilities: "Freshdesk sidebar app and dashboards" },
      ],
      criticalDeliverables: ["Agent copilot sidebar", "CSAT deflection dashboard"],
    },
  ],
  riskRegister: [
    {
      id: "nrisk-1",
      title: "Classifier Hallucination on Return Policy Exceptions",
      category: "Technical",
      likelihood: "Medium",
      impact: "High",
      consequence: "Customers receive invalid RMA approvals for non-returnable items.",
      mitigationStrategy: "Deterministic rules engine overrides model whenever item category is perishable or sale-final.",
      owner: "ML Engineer",
    },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// 7. UNIVERSAL PROBLEM INTAKE DYNAMIC ROADMAP GENERATOR
// ─────────────────────────────────────────────────────────────────────────────
function generateDynamicRoadmap(
  businessName: string,
  industry: string,
  problemStatement: string
): RoadmapBlueprint {
  const safeName = businessName || "Enterprise Platform";
  const safeIndustry = industry || "Digital Operations";
  const cleanProblem = problemStatement.trim() || `Modernize and automate operational workflows for ${safeName}.`;

  const timelineWeeks = 8;
  const personDays = 70;

  return {
    workspaceId: `ws-custom-${safeName.toLowerCase().replace(/[^a-z0-9]/g, "-")}`,
    scenarioName: `${safeName} — Implementation & Delivery Roadmap`,
    targetTimelineWeeks: timelineWeeks,
    totalPersonDays: personDays,
    estimatedGoLive: `Week ${timelineWeeks} (Production Go-Live)`,
    confidenceScore: 92,
    executiveSummary: `A comprehensive 3-phase, ${timelineWeeks}-week agile delivery plan tailored to ${safeName} (${safeIndustry}). Tackles: "${cleanProblem.slice(0, 140)}${cleanProblem.length > 140 ? "..." : ""}" through automated pipelines, core state models, and scalable production architecture.`,
    phases: [
      {
        id: "dyn-p1",
        phaseNumber: 1,
        name: `Core Domain Architecture & Data Foundation`,
        codename: "Foundation Sprint",
        durationWeeks: "Weeks 1–3",
        startWeek: 0,
        durationWeekCount: 3,
        objective: `Establish cloud infrastructure, primary relational schema, identity security, and core entity intake pipelines for ${safeIndustry}.`,
        status: "in-progress",
        milestones: [
          {
            id: "dm-101",
            title: "PostgreSQL 16 Production Schema & Multi-Tenant Isolation",
            category: "Architecture",
            effortDays: 5,
            completed: true,
            deliverable: `Normalized database schema with RLS security policies tailored to ${safeIndustry} workflows`,
          },
          {
            id: "dm-102",
            title: "Core Domain Entity Ingestion & Validation Engine",
            category: "Backend",
            effortDays: 6,
            completed: true,
            deliverable: `High-throughput REST API with Zod validation parsing domain inputs and external webhooks`,
          },
          {
            id: "dm-103",
            title: "Interactive Workspace Dashboard & Navigation Shell",
            category: "Frontend",
            effortDays: 6,
            completed: true,
            deliverable: `Responsive React 19 UI shell with real-time status indicators and domain metrics`,
          },
          {
            id: "dm-104",
            title: "Legacy Data Migration & Sanitation Script",
            category: "Data & Integration",
            effortDays: 4,
            completed: false,
            deliverable: `Automated import utility cleaning existing operational spreadsheets and legacy archives`,
          },
        ],
        teamResourcing: [
          { role: "Lead Systems Architect", fte: 1.0, responsibilities: `Overall solution architecture, database design, and API standards` },
          { role: "Fullstack Engineer", fte: 1.0, responsibilities: `Core dashboard components, intake forms, and authentication` },
          { role: "Database Engineer", fte: 0.8, responsibilities: `Data normalization, migration scripts, and index optimization` },
        ],
        criticalDeliverables: [
          `Production PostgreSQL data tier with Row-Level Security`,
          `Interactive domain dashboard operational with initial test data`,
          `Verified legacy data migration pipeline`,
        ],
      },
      {
        id: "dyn-p2",
        phaseNumber: 2,
        name: `Business Logic Automation & Workflow Engine`,
        codename: "Execution Sprint",
        durationWeeks: "Weeks 4–6",
        startWeek: 3,
        durationWeekCount: 3,
        objective: `Automate manual bottlenecks identified in the problem statement through asynchronous task queues, notifications, and rule solvers.`,
        status: "upcoming",
        milestones: [
          {
            id: "dm-201",
            title: `Automated Workflow Rules & Decision Processor`,
            category: "Backend",
            effortDays: 7,
            completed: false,
            deliverable: `Event-driven background processing engine handling domain state transitions without manual handoffs`,
          },
          {
            id: "dm-202",
            title: `Interactive Operational Workspace & Kanban Studio`,
            category: "Frontend",
            effortDays: 6,
            completed: false,
            deliverable: `Rich visual board supporting drag-and-drop status changes, quick actions, and filter presets`,
          },
          {
            id: "dm-203",
            title: `Automated Multi-Channel Notification Dispatcher`,
            category: "Data & Integration",
            effortDays: 5,
            completed: false,
            deliverable: `Instant SMS, Email, and Webhook dispatch triggered upon key milestone updates`,
          },
          {
            id: "dm-204",
            title: `End-to-End Workflow Integration & Error Resilience Testing`,
            category: "QA & Security",
            effortDays: 4,
            completed: false,
            deliverable: `Automated test suite simulating edge-case failure modes and automated retry verification`,
          },
        ],
        teamResourcing: [
          { role: "Senior Backend Engineer", fte: 1.0, responsibilities: `Workflow state engine, background queue workers, and external triggers` },
          { role: "Frontend UI Specialist", fte: 1.0, responsibilities: `Kanban pipeline, live notification badges, and real-time feeds` },
          { role: "QA Automation Engineer", fte: 0.8, responsibilities: `Regression suite, end-to-end user journey tests, and latency benchmarking` },
        ],
        criticalDeliverables: [
          `Automated event-driven workflow engine eliminating manual handoffs`,
          `Interactive Kanban pipeline with real-time optimistic UI updates`,
          `Multi-channel notification dispatch with automated delivery fallback`,
        ],
      },
      {
        id: "dyn-p3",
        phaseNumber: 3,
        name: `AI Intelligence, Governance & Production Cutover`,
        codename: "Intelligence & Cutover Sprint",
        durationWeeks: "Weeks 7–8",
        startWeek: 6,
        durationWeekCount: 2,
        objective: `Integrate AI-assisted decision intelligence, compliance audit ledgers, executive KPI cockpit, and execute final production cutover.`,
        status: "upcoming",
        milestones: [
          {
            id: "dm-301",
            title: `AI-Powered Predictive Recommendations & Summary Copilot`,
            category: "Architecture",
            effortDays: 6,
            completed: false,
            deliverable: `LLM-driven assistant summarizing domain logs, flagging anomalies, and predicting next-best actions`,
          },
          {
            id: "dm-302",
            title: `Executive Operational Cockpit & SLA Analytics`,
            category: "Frontend",
            effortDays: 5,
            completed: false,
            deliverable: `High-level business intelligence view with throughput velocity, bottleneck graphs, and export center`,
          },
          {
            id: "dm-303",
            title: `Security Hardening, Compliance Audit Vault & DPDP Checks`,
            category: "QA & Security",
            effortDays: 4,
            completed: false,
            deliverable: `Penetration testing verification, immutable activity audit logging, and sensitive data encryption`,
          },
          {
            id: "dm-304",
            title: `Production Cutover & Operator Training Runbook`,
            category: "Operations",
            effortDays: 4,
            completed: false,
            deliverable: `Zero-downtime deployment cutover with rollback safety plan and operational user manuals`,
          },
        ],
        teamResourcing: [
          { role: "AI / ML Integration Lead", fte: 1.0, responsibilities: `AI copilot prompt orchestration, vector embedding indices, and intelligence models` },
          { role: "Security & Compliance Officer", fte: 0.6, responsibilities: `Access audits, penetration testing signoff, and compliance certificates` },
          { role: "Product Delivery Manager", fte: 0.6, responsibilities: `User acceptance testing, staff workshops, and go-live coordination` },
        ],
        criticalDeliverables: [
          `AI Copilot generating automated domain insights and summaries`,
          `Executive analytics cockpit showing business velocity and SLA health`,
          `Zero-downtime production cutover with complete operational sign-off`,
        ],
      },
    ],
    riskRegister: [
      {
        id: "drisk-1",
        title: "Staff Resistance to New Automated Operational Workflows",
        category: "Adoption",
        likelihood: "Medium",
        impact: "High",
        consequence: "Team members continue using unstructured manual tools, reducing system adoption.",
        mitigationStrategy:
          "Incorporate 1-click import/export capabilities, mirror familiar keyboard shortcuts, and run interactive team training workshops.",
        owner: "Product Delivery Manager",
      },
      {
        id: "drisk-2",
        title: "Integration Schema Drift Across External Third-Party APIs",
        category: "Technical",
        likelihood: "Medium",
        impact: "Medium",
        consequence: "Upstream third-party payload changes cause parsing failures in background workers.",
        mitigationStrategy:
          "Strict runtime schema validation using Zod with dead-letter queue routing and automated alerting for malformed payloads.",
        owner: "Lead Systems Architect",
      },
      {
        id: "drisk-3",
        title: "Data Privacy & Sensitive Audit Compliance Constraints",
        category: "Security",
        likelihood: "Low",
        impact: "Critical",
        consequence: "Unintended exposure of proprietary business or customer records.",
        mitigationStrategy:
          "Field-level encryption at rest, strict tenant-scoped Row-Level Security, and automated 90-day immutable audit logs.",
        owner: "Security & Compliance Officer",
      },
    ],
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// RESOLVER FUNCTION
// ─────────────────────────────────────────────────────────────────────────────
export function getRoadmapForWorkspace(
  workspaceContext?: {
    name?: string;
    businessName?: string;
    industry?: string;
    problemStatement?: string;
    description?: string;
    keyFeatures?: string[];
  } | null
): RoadmapBlueprint {
  if (!workspaceContext) return HR_CONSULTANCY_ROADMAP;

  const name = (workspaceContext.businessName || workspaceContext.name || "").toLowerCase();
  const industry = (workspaceContext.industry || "").toLowerCase();
  const problem = (workspaceContext.problemStatement || workspaceContext.description || "").toLowerCase();
  const combined = `${name} ${industry} ${problem}`;

  // 1. Clean Tech & Solar
  if (
    combined.includes("solar") ||
    combined.includes("clean tech") ||
    combined.includes("renewable") ||
    combined.includes("energy") ||
    combined.includes("inverter") ||
    combined.includes("photovoltaic") ||
    combined.includes("grid") ||
    combined.includes("curtailment")
  ) {
    const raw = SOLAR_ROADMAP;
    return {
      ...raw,
      scenarioName: `${workspaceContext.businessName || workspaceContext.name || "Clean Tech Solar"} — Delivery Roadmap & Sprint Plan`,
    };
  }

  // 0. Project Management, TaskFlow & Leave Management
  if (isProjectManagementDomain(combined)) {
    return generateDynamicRoadmap(
      workspaceContext?.businessName || workspaceContext?.name || "TaskFlow Project Management",
      "Leave-Aware Task & Sprint Delivery",
      workspaceContext?.problemStatement || "Project managers setting task deadlines without employee leave visibility causing mid-sprint stalls"
    );
  }

  // 2. Healthcare & Diagnostic Lab
  if (isHealthcareDomain(combined)) {
    const raw = HEALTHCARE_ROADMAP;
    return {
      ...raw,
      scenarioName: `${workspaceContext.businessName || workspaceContext.name || "Clinical Diagnostics"} — Delivery Roadmap & Sprint Plan`,
    };
  }

  // 3. Logistics, Fleet & Supply Chain
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
    const raw = LOGISTICS_ROADMAP;
    return {
      ...raw,
      scenarioName: `${workspaceContext.businessName || workspaceContext.name || "Fleet Logistics"} — Delivery Roadmap & Sprint Plan`,
    };
  }

  // 4. FinTech & Banking
  if (
    combined.includes("fintech") ||
    combined.includes("lending") ||
    combined.includes("loan") ||
    combined.includes("banking") ||
    combined.includes("payment") ||
    combined.includes("credit") ||
    combined.includes("wallet") ||
    combined.includes("underwriting") ||
    combined.includes("nbfc")
  ) {
    const raw = FINTECH_ROADMAP;
    return {
      ...raw,
      scenarioName: `${workspaceContext.businessName || workspaceContext.name || "FinTech Core"} — Delivery Roadmap & Sprint Plan`,
    };
  }

  // 5. E-Commerce & Customer Support (Nexa)
  if (
    combined.includes("nexa") ||
    combined.includes("ecommerce") ||
    combined.includes("e-commerce") ||
    combined.includes("support") ||
    combined.includes("shopify") ||
    combined.includes("customer service") ||
    combined.includes("freshdesk")
  ) {
    const raw = NEXA_SUPPORT_ROADMAP;
    return {
      ...raw,
      scenarioName: `${workspaceContext.businessName || workspaceContext.name || "Nexa Support"} — Delivery Roadmap & Sprint Plan`,
    };
  }

  // 6. HR Consultancy & Recruitment Services (Only when explicitly recruitment/staffing)
  if (
    combined.includes("recruitment") ||
    combined.includes("staffing agency") ||
    combined.includes("applicant tracking") ||
    combined.includes("headhunting") ||
    combined.includes("hr consultancy")
  ) {
    const raw = HR_CONSULTANCY_ROADMAP;
    return {
      ...raw,
      scenarioName: `${workspaceContext.businessName || workspaceContext.name || "Talent Operations"} — Delivery Roadmap & Sprint Plan`,
    };
  }

  // 7. Any other problem statement -> Generate bespoke dynamic roadmap
  return generateDynamicRoadmap(
    workspaceContext?.businessName || workspaceContext?.name || "Enterprise Operations",
    workspaceContext?.industry || "Enterprise Transformation",
    workspaceContext?.problemStatement || workspaceContext?.description || "End-to-end digital transformation and process automation roadmap"
  );
}
