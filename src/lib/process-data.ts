export interface ProcessMetric {
  label: string;
  before: string;
  after: string;
  improvement: string;
  icon: string;
}

export interface BottleneckItem {
  stage: string;
  problem: string;
  impact: string;
  solution: string;
  timeSavings: string;
}

export interface DecisionTier {
  tier: string;
  actor: string;
  criteria: string;
  action: string;
  status: string;
}

import { isHealthcareDomain, isProjectManagementDomain } from "./domain-classifier";

export interface ProcessBlueprint {
  domainId: string;
  domainTitle: string;
  metrics: ProcessMetric[];
  asIsDiagram: string;
  toBeDiagram: string;
  swimlaneDiagram: string;
  decisionTreeDiagram: string;
  decisionTiers: DecisionTier[];
  bottlenecks: BottleneckItem[];
  recommendations: {
    title: string;
    detail: string;
  }[];
}

// ─────────────────────────────────────────────────────────────────────────────
// DOMAIN 1: HR & RECRUITMENT SERVICES (TalentCraft Default)
// ─────────────────────────────────────────────────────────────────────────────
export const HR_PROCESS_METRICS: ProcessMetric[] = [
  {
    label: "Candidate Screening Cycle Time",
    before: "48 Hours",
    after: "30 Seconds",
    improvement: "98% Faster",
    icon: "Clock",
  },
  {
    label: "Average Time-to-Offer (TAT)",
    before: "14.2 Days",
    after: "2.4 Days",
    improvement: "83% Reduction",
    icon: "Zap",
  },
  {
    label: "Consultant Timesheet Reconciliation",
    before: "12 Hours / month",
    after: "Real-time (Automated)",
    improvement: "100% Automated",
    icon: "Timer",
  },
  {
    label: "Candidate Drop-off Rate",
    before: "38.5%",
    after: "6.2%",
    improvement: "84% Retention",
    icon: "Users",
  },
];

export const HR_BPMN_BEFORE = `flowchart TD
  subgraph Intake["1. Scattered Ingestion (1-2 Days)"]
    A1([Candidate sends CV via Email/WhatsApp]) --> A2[Recruiter manually downloads file]
    A2 --> A3[Manual data entry into Excel sheet]
    A3 --> A4[Missing details: CTC, notice period not verified]
  end

  subgraph Screening["2. Manual Screening & Follow-up (3-4 Days)"]
    A4 --> B1[Recruiter calls candidate for phone screen]
    B1 --> B2{Candidate answers?}
    B2 -->|No| B3[3+ days delay playing phone tag]
    B2 -->|Yes| B4[Notes typed into shared Word document]
  end

  subgraph ClientReview["3. Client Collaboration & Submission (4-5 Days)"]
    B4 --> C1[Recruiter formats candidate profile manually]
    C1 --> C2[Emails profile attachment to Client HR]
    C2 --> C3[Client HR takes 4-7 days to reply via email]
    C3 --> C4{Feedback?}
    C4 -->|Rejected| C5[Candidate never notified - poor candidate NPS]
    C4 -->|Approved| C6[Manual calendar scheduling over back-and-forth email]
  end

  subgraph Billing["4. Attendance & Timesheet Leakage (Ongoing)"]
    C6 --> D1[Consultants log hours on paper / WhatsApp]
    D1 --> D2[Admin reconciles hours at end of month manually]
    D2 --> D3([Payroll disputes & delayed client invoicing - 14d cycle])
  end

  classDef legacy fill:#FEE2E2,stroke:#DC2626,stroke-width:1.5px,color:#991B1B;
  class A1,A2,A3,A4,B1,B2,B3,B4,C1,C2,C3,C4,C5,C6,D1,D2,D3 legacy;
`;

export const HR_BPMN_AFTER = `flowchart TD
  subgraph AutoIntake["1. Instant Intake & Parsing (30 Seconds)"]
    N1([Candidate applies via Portal / Form]) --> N2[BizzMitra Document Parser extracts skills, CTC, notice period]
    N2 --> N3[Profile auto-created in Workable HR CRM]
  end

  subgraph SmartScreening["2. AI Scoring & Instant Qualification (< 2 Mins)"]
    N3 --> S1[AI Semantic Matching generates 1-5 star qualification score]
    S1 --> S2{Score >= 3.5?}
    S2 -->|Yes| S3[Auto-promoted to Interview Pipeline Stage]
    S2 -->|No| S4[Auto-tagged for future talent pool & respectful email sent]
  end

  subgraph ClientPortal["3. Real-Time Client Collaboration (< 1 Day)"]
    S3 --> P1[Shortlist appears directly in Client Portal]
    P1 --> P2[Client 1-clicks 'Approve Interview' with calendar sync]
    P2 --> P3[Automated SMS/Email invite dispatched to candidate]
  end

  subgraph SmartBilling["4. Smart Attendance Punch Clock (Real-Time)"]
    P3 --> B1[Consultant checks in with 1-click Punch In/Out]
    B1 --> B2[Live session timer calculates billable hours automatically]
    B2 --> B3([1-click exportable CSV timesheet & invoice ready in seconds])
  end

  classDef automated fill:#ECFDF5,stroke:#059669,stroke-width:1.5px,color:#065F46;
  class N1,N2,N3,S1,S2,S3,S4,P1,P2,P3,B1,B2,B3 automated;
`;

export const HR_SWIMLANE_BPMN = `sequenceDiagram
  autonumber
  actor Cand as "Candidate / Consultant"
  actor Recruiter as "Agency Recruiter"
  participant AI as "BizzMitra AI Engine"
  participant CRM as "Workable HR CRM"
  actor Client as "Corporate Client"

  rect rgb(13, 148, 136, 0.08)
    Note over Cand,AI: Phase 1: Ingestion & Smart Intake
    Cand->>AI: Submits application + resume PDF
    AI->>AI: Auto-extracts CTC, Notice Period, Skills
    AI->>CRM: Hydrates candidate record (status: Active)
  end

  rect rgb(99, 102, 241, 0.08)
    Note over Recruiter,AI: Phase 2: Pipeline Screening & Studio Customizer
    Recruiter->>CRM: Reviews AI Match Score & Star Rating
    Recruiter->>CRM: Customizes attributes in Solution Studio
    Recruiter->>CRM: Drags candidate to 'Interview' Stage
  end

  rect rgb(2, 132, 199, 0.08)
    Note over CRM,Client: Phase 3: Client Portal Decision
    CRM->>Client: Instant notification of qualified shortlist
    Client->>CRM: Approves candidate in Client Portal with 1-click
    CRM-->>Cand: Automated interview confirmation invite
  end

  rect rgb(217, 119, 6, 0.08)
    Note over Cand,CRM: Phase 4: Attendance Tracking & Billing
    Cand->>CRM: Consultant Punches In / Out daily
    CRM->>CRM: Computes elapsed hours & timesheet logs
    CRM->>Recruiter: One-click verified CSV export for client billing
  end
`;

export const HR_DECISION_TREE = `graph TD
  Start([📥 Resume Submitted]) --> Parse[⚡ AI Resume Extraction]
  Parse --> Q1{"Confidence > 85%?"}
  Q1 -- No --> ManualReview[👀 Recruiter Manual Review Queue]
  Q1 -- Yes --> Q2{"Skill Match Score"}
  Q2 -- "Score >= 75%" --> FastTrack[🚀 Fast-Track Auto Invite to Tech Screen]
  Q2 -- "50% to 74%" --> RecruiterScreen[📞 15-Min Phone Screen Scheduled]
  Q2 -- "Score < 50%" --> AutoReject[✉️ Polite Automated Feedback Email]
  FastTrack --> Interview[🎯 Technical Evaluation Passed]
  RecruiterScreen --> Interview
  Interview --> Q3{"Expected CTC <= Budget?"}
  Q3 -- Yes --> DraftOffer[📝 Auto-Draft Offer Letter]
  Q3 -- Exceeds Budget --> ApprovalGate[🛡️ VP Escalation Approval Gate]
  ApprovalGate -- Approved --> DraftOffer
  ApprovalGate -- Rejected --> Renegotiate[🤝 Client Rate Adjustment]
  DraftOffer --> ClientSign([✅ Offer Dispatched via e-Signature])
`;

export const HR_BOTTLENECK_ANALYSIS: BottleneckItem[] = [
  {
    stage: "Manual Resume Screening",
    problem: "Recruiters spent 4.2 hours daily reviewing unstructured PDFs and typing candidate details into spreadsheets.",
    impact: "Top talent accepted competing offers while waiting for screening results.",
    solution: "BizzMitra Automated Parsing & AI Semantic Matching ranks candidates within 30 seconds of submission.",
    timeSavings: "92% Time Saved",
  },
  {
    stage: "Unstructured Client Feedback Loops",
    problem: "Profiles sent over disjointed email threads resulted in lost resumes, delayed approvals, and zero hiring SLA visibility.",
    impact: "Client feedback took an average of 5.8 days per candidate shortlist.",
    solution: "Dedicated Client Portal allows hiring managers to review candidates and approve interviews in one click.",
    timeSavings: "80% TAT Drop",
  },
  {
    stage: "Consultant Timesheet Discrepancies",
    problem: "Consultant hours tracked on paper or WhatsApp chats caused end-of-month payroll disputes and delayed invoices.",
    impact: "12 hours per month lost to manual attendance auditing and 4% billing revenue leakage.",
    solution: "Cryptographically verified Smart Attendance Punch Clock with automated daily calculation and one-click timesheets.",
    timeSavings: "100% Dispute Elimination",
  },
];

export const HR_DECISION_TIERS: DecisionTier[] = [
  {
    tier: "Tier 1: Recruiter Screening",
    actor: "Talent Consultant",
    criteria: "Skill match >= 70%, Experience valid, Notice <= 30d",
    action: "Instant Auto-Invite to Tech Evaluation",
    status: "Fully Automated (AI Agent)",
  },
  {
    tier: "Tier 2: Commercial Budget Check",
    actor: "Client Account Lead",
    criteria: "CTC <= Budget + 10%, Gross Margin >= 22%",
    action: "Proceed to Client Final Interview",
    status: "Automated Gateway",
  },
  {
    tier: "Tier 3: Executive Offer Sign-off",
    actor: "VP / Managing Partner",
    criteria: "Exceptions only: Custom sign-on bonus or > 15% budget variance",
    action: "Digital e-Signature via DocuSign / AdobeSign",
    status: "Escalation Queue (< 4 hours)",
  },
];

export const HR_RECOMMENDATIONS = [
  {
    title: "1. Eliminate Manual Scheduling Handoffs",
    detail: "Replace recruiter back-and-forth emails with automated calendar webhooks. Saves 2.4 days per placement cycle.",
  },
  {
    title: "2. Async Candidate Video Screening",
    detail: "Use automated 3-question async video screens for Tier 1 applicants. Frees up 14 hours per week per recruiter.",
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// DOMAIN 2: CLEAN TECH & SOLAR ENERGY
// ─────────────────────────────────────────────────────────────────────────────
export const SOLAR_PROCESS_METRICS: ProcessMetric[] = [
  {
    label: "Arc Fault Incident Response",
    before: "4.5 Hours",
    after: "1.2 Seconds",
    improvement: "99% Faster",
    icon: "Zap",
  },
  {
    label: "Field Work Order Resolution",
    before: "9.5 Days",
    after: "3.5 Hours",
    improvement: "98% Reduction",
    icon: "Clock",
  },
  {
    label: "Inverter Telemetry Audit",
    before: "18 Hours / week",
    after: "Continuous Stream",
    improvement: "100% Automated",
    icon: "Timer",
  },
  {
    label: "Solar Array Energy Curtailment",
    before: "14.2%",
    after: "1.8%",
    improvement: "87% Yield Recovered",
    icon: "Users",
  },
];

export const SOLAR_BPMN_BEFORE = `flowchart TD
  subgraph Intake["1. Periodic Inverter Logging (Daily)"]
    A1([Field tech manually writes inverter readings on paper]) --> A2[Physical logbook collected at end of shift]
    A2 --> A3[Manual data entry into central maintenance spreadsheet]
  end

  subgraph Screening["2. Lagging Fault Detection (2-4 Days)"]
    A3 --> B1[Engineer spots voltage drop in weekly review]
    B1 --> B2{Severity critical?}
    B2 -->|No| B3[Scheduled for monthly maintenance inspection]
    B2 -->|Yes| B4[Phone calls placed to locate available field technician]
  end

  subgraph Dispatch["3. Dispatch & Parts Procurement (3-5 Days)"]
    B4 --> C1[Paper work order created and printed]
    C1 --> C2[Parts requisition emailed to regional warehouse]
    C2 --> C3[Technician travels to site with diagnostic multimeters]
  end

  subgraph Resolution["4. Offline Repair Verification"]
    C3 --> D1[Manual multimeter testing and diode replacement]
    D1 --> D2([Paper sign-off mailed to compliance department])
  end

  classDef legacy fill:#FEE2E2,stroke:#DC2626,stroke-width:1.5px,color:#991B1B;
  class A1,A2,A3,B1,B2,B3,B4,C1,C2,C3,D1,D2 legacy;
`;

export const SOLAR_BPMN_AFTER = `flowchart TD
  subgraph AutoIntake["1. High-Frequency IoT Stream (< 1 Second)"]
    N1([Inverter publishes MQTT telemetry packet]) --> N2[AWS IoT Core parses voltage, temp, harmonic distortion]
    N2 --> N3[TimescaleDB records real-time sensor hypertable]
  end

  subgraph SmartScreening["2. AI Predictive Thermal Anomaly (< 2 Seconds)"]
    N3 --> S1[Kafka Event Engine evaluates 60-second moving window]
    S1 --> S2{"Thermal Anomaly or Arc Fault?"}
    S2 -->|Yes| S3[Instant PWA Alert + Auto-Tripped Isolation Breaker]
    S2 -->|No| S4[Aggregated to Daily Efficiency Yield Model]
  end

  subgraph AutoDispatch["3. Dynamic PWA Work Order Dispatch (< 5 Minutes)"]
    S3 --> P1[Geofenced Work Order assigned to closest on-call technician]
    P1 --> P2[Mobile PWA provides turn-by-turn navigation & replacement SKU]
    P2 --> P3[Technician validates fix with Bluetooth inverter handshake]
  end

  subgraph SmartCompliance["4. Real-Time Grid Synchronization"]
    P3 --> B1[Automated ISO-NE / PJM compliance telemetry reported]
    B1 --> B2([Executive Renewable Credit certificate issued instantly])
  end

  classDef automated fill:#ECFDF5,stroke:#059669,stroke-width:1.5px,color:#065F46;
  class N1,N2,N3,S1,S2,S3,S4,P1,P2,P3,B1,B2 automated;
`;

export const SOLAR_SWIMLANE_BPMN = `sequenceDiagram
  autonumber
  actor Inverter as "Solar Inverter IoT"
  actor Tech as "Field Technician PWA"
  participant AI as "Solar Anomaly AI"
  participant Cloud as "Telemetry & Dispatch Svc"
  actor Grid as "Regional Grid Operator"

  rect rgb(13, 148, 136, 0.08)
    Note over Inverter,Cloud: Phase 1: High-Speed Telemetry Ingestion
    Inverter->>Cloud: MQTT packet (Voltage, Amps, Temp 78C)
    Cloud->>AI: Stream telemetry into Kafka buffer
    AI->>AI: Detect acute thermal runaway condition
  end

  rect rgb(99, 102, 241, 0.08)
    Note over AI,Tech: Phase 2: Instant Automated Work Order
    AI->>Cloud: Trigger High-Priority Emergency Work Order
    Cloud->>Tech: Push Alert: Inverter Array 4 Overheating
    Tech->>Cloud: Acknowledges dispatch via Mobile PWA
  end

  rect rgb(2, 132, 199, 0.08)
    Note over Tech,Grid: Phase 3: Site Rectification & Grid Sync
    Tech->>Inverter: Replace degraded bypass diode
    Tech->>Cloud: Bluetooth diagnostics pass 100%
    Cloud->>Grid: Transmit live capacity handshake
  end
`;

export const SOLAR_DECISION_TREE = `graph TD
  Start([⚡ Telemetry Ingested]) --> SensorCheck[📊 Parse Voltage and Thermal Reading]
  SensorCheck --> Q1{"Inverter Temp > 75C or Arc Fault?"}
  Q1 -- Yes --> EmergencyTrip[🚨 Auto-Trip Breaker & Push Urgent PWA Alert]
  Q1 -- No --> Q2{"Yield vs Expected Baseline"}
  Q2 -- "Yield >= 95%" --> NormalOp[✅ Normal Operations Logged]
  Q2 -- "80% to 94%" --> DustWarning[🧹 Schedule Automated Panel Cleaning]
  Q2 -- "Yield < 80%" --> TechReview[🔍 Assign Low-Priority Field Diagnostic]
  EmergencyTrip --> TechDispatch[👷 On-Call Technician Dispatched]
  TechDispatch --> FixConfirmed[🔧 Sensor Recalibrated & Verified]
  FixConfirmed --> GridReconnect([🔌 Automated Grid Reconnection])
`;

export const SOLAR_BOTTLENECK_ANALYSIS: BottleneckItem[] = [
  {
    stage: "Lagging Inverter Failure Detection",
    problem: "Technicians only noticed burnt bypass diodes during scheduled monthly site walks, losing up to 30 days of clean energy generation.",
    impact: "Unplanned inverter downtime reduced solar farm output by 14.2% annually.",
    solution: "BizzMitra Edge Telemetry with real-time arc-fault AI alerting detects thermal runaway in under 2 seconds.",
    timeSavings: "99% Faster Response",
  },
  {
    stage: "Manual Paper Work Order Dispatch",
    problem: "Field service orders were printed and physically handed to technicians at the morning dispatch depot.",
    impact: "Technicians wasted 3.5 hours daily driving back to base for replacement parts manifests.",
    solution: "Mobile PWA with offline-first caching, Bluetooth inverter pairing, and real-time spare parts inventory.",
    timeSavings: "98% TAT Reduction",
  },
  {
    stage: "Delayed Grid Compliance Reporting",
    problem: "Regulatory generation compliance spreadsheets required 18 hours of manual data collation every Friday.",
    impact: "Late filing fees and missed peak-hour feed-in tariff credits.",
    solution: "Automated ISO-compliant real-time telemetry streaming with instantaneous generation credit reporting.",
    timeSavings: "100% Automation",
  },
];

export const SOLAR_DECISION_TIERS: DecisionTier[] = [
  {
    tier: "Tier 1: Real-time Inverter Telemetry Check",
    actor: "Edge AI Guard",
    criteria: "Inverter Temp <= 70C, String Voltage variance < 5%",
    action: "Continuous streaming to TimescaleDB",
    status: "Autonomous (< 50ms)",
  },
  {
    tier: "Tier 2: Efficiency Degraded Diagnostic",
    actor: "Field Operations Lead",
    criteria: "Yield drop between 10% - 25% over 48h rolling window",
    action: "Automated PWA Cleaning / Inspection Work Order",
    status: "Automated Gateway",
  },
  {
    tier: "Tier 3: Arc Fault Emergency Shutdown",
    actor: "Safety Officer / Grid Manager",
    criteria: "Arc signature confirmed or Thermal spike > 80C",
    action: "Instant breaker trip & priority technician dispatch",
    status: "Sub-Second Isolation",
  },
];

export const SOLAR_RECOMMENDATIONS = [
  {
    title: "1. Autonomous Drone Infrared Thermography",
    detail: "Deploy autonomous scheduled drone flyovers to detect micro-cracks in photovoltaic cells before arc faults materialize.",
  },
  {
    title: "2. Predictive Battery Degradation Modeling",
    detail: "Train LSTM neural networks on ambient weather and charge cycles to dynamically throttle inverter output during heatwaves.",
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// DOMAIN 3: HEALTHCARE & CLINICAL DIAGNOSTICS
// ─────────────────────────────────────────────────────────────────────────────
export const HEALTHCARE_PROCESS_METRICS: ProcessMetric[] = [
  {
    label: "Critical Panic-Value Turnaround",
    before: "4.8 Hours",
    after: "45 Seconds",
    improvement: "99% Reduction",
    icon: "Clock",
  },
  {
    label: "Specimen Chain-of-Custody Loss",
    before: "4.2%",
    after: "0.01%",
    improvement: "99.8% Accuracy",
    icon: "Zap",
  },
  {
    label: "EMR Lab Integration Time",
    before: "14 Hours / batch",
    after: "Real-time FHIR v4",
    improvement: "100% Automated",
    icon: "Timer",
  },
  {
    label: "Doctor Acknowledgment Compliance",
    before: "62.4%",
    after: "99.8%",
    improvement: "Zero Regulatory Fines",
    icon: "Users",
  },
];

export const HEALTHCARE_BPMN_BEFORE = `flowchart TD
  subgraph Intake["1. Paper Lab Requisitions (1-2 Hours)"]
    A1([Doctor writes paper lab requisition slip]) --> A2[Phlebotomist draws blood and labels tube with pen]
    A2 --> A3[Courier carries specimen in cooler to central lab]
  end

  subgraph Processing["2. Manual Specimen Logging (3-4 Hours)"]
    A3 --> B1[Clerk types handwritten patient details into EMR]
    B1 --> B2{Barcode unreadable?}
    B2 -->|Yes| B3[Specimen rejected - patient must be redrawn]
    B2 -->|No| B4[Specimen loaded into blood analyzer machine]
  end

  subgraph PanicReview["3. Critical Value Phone Callback (2-5 Hours)"]
    B4 --> C1[Analyzer prints paper test result strip]
    C1 --> C2[Pathologist notices critically low hemoglobin]
    C2 --> C3[Phone calls placed to clinic switchboard playing phone tag]
    C3 --> C4([Doctor receives result hours later - delayed patient care])
  end

  classDef legacy fill:#FEE2E2,stroke:#DC2626,stroke-width:1.5px,color:#991B1B;
  class A1,A2,A3,B1,B2,B3,B4,C1,C2,C3,C4 legacy;
`;

export const HEALTHCARE_BPMN_AFTER = `flowchart TD
  subgraph AutoIntake["1. 2D Barcode Verification (< 5 Seconds)"]
    N1([Doctor orders test digitally in EMR]) --> N2[2D Barcode printed on specimen vial at patient bedside]
    N2 --> N3[LIS validates specimen volume and tube type automatically]
  end

  subgraph SmartProcessing["2. Automated Analyzer Ingestion (< 15 Mins)"]
    N3 --> S1[Specimen routed to automated hematology track]
    S1 --> S2{"Critical Panic Value Detected?"}
    S2 -->|Yes| S3[Automated Critical Alert dispatched to Doctor's Phone]
    S2 -->|No| S4[Auto-verified and published to Patient Health Vault]
  end

  subgraph PanicDispatch["3. Doctor Acknowledgment & Escalation (< 2 Mins)"]
    S3 --> P1[Attending Physician phone sounds high-priority alarm]
    P1 --> P2[Doctor acknowledges receipt with 1-tap cryptographic PIN]
    P2 --> P3[Audit log locked into HIPAA CloudWatch record]
  end

  subgraph Completed["4. Certified Digital Lab Report"]
    P3 --> B1([Complete diagnostic panel available in EMR with zero lag])
  end

  classDef automated fill:#ECFDF5,stroke:#059669,stroke-width:1.5px,color:#065F46;
  class N1,N2,N3,S1,S2,S3,S4,P1,P2,P3,B1 automated;
`;

export const HEALTHCARE_SWIMLANE_BPMN = `sequenceDiagram
  autonumber
  actor Patient as "Patient / Specimen"
  actor Tech as "Phlebotomist / Tech"
  participant LIS as "LIS FHIR Gateway"
  participant AI as "Clinical Pathology AI"
  actor Doctor as "Attending Physician"

  rect rgb(13, 148, 136, 0.08)
    Note over Patient,LIS: Phase 1: 2D Barcode Chain of Custody
    Patient->>Tech: Specimen drawn at bedside
    Tech->>LIS: 2D Barcode scanned into FHIR gateway
    LIS->>AI: Stream raw test observations
  end

  rect rgb(99, 102, 241, 0.08)
    Note over AI,Doctor: Phase 2: Instant Panic Value Dispatch
    AI->>AI: Detect Critical Low Platelet Count (12,000 / uL)
    AI->>Doctor: Urgent SMS + Push Notification to Mobile App
    Doctor->>LIS: Acknowledges Critical Value with 1-tap PIN
  end

  rect rgb(2, 132, 199, 0.08)
    Note over LIS,Patient: Phase 3: HIPAA Locked Result Archival
    LIS->>Patient: Patient Health Vault updated with verified PDF
  end
`;

export const HEALTHCARE_DECISION_TREE = `graph TD
  Start([🧪 Lab Specimen Ingested]) --> BarcodeCheck[⚡ 2D Barcode Chain-of-Custody Verification]
  BarcodeCheck --> Q1{"Specimen Integrity Valid?"}
  Q1 -- No --> RedrawReq[⚠️ Immediate Redraw Alert to Clinic]
  Q1 -- Yes --> AnalyzerRun[🔬 Run Automated Blood Chemistry]
  AnalyzerRun --> Q2{"Panic / Critical Range Exceeded?"}
  Q2 -- Yes --> EmergencyDispatch[🚨 Tier-1 Emergency Push Notification to Physician]
  Q2 -- No --> RoutinePublish[📋 Auto-Verify & Transmit to Patient EMR]
  EmergencyDispatch --> DocAck{"Physician Acknowledged in 10 mins?"}
  DocAck -- Yes --> ResultFinalized[✅ Emergency Result Finalized]
  DocAck -- No --> OnCallEscalation[📞 Escalate to Department Medical Director]
  OnCallEscalation --> ResultFinalized
  RoutinePublish --> PatientVault([📱 Patient Health Vault Updated])
`;

export const HEALTHCARE_BOTTLENECK_ANALYSIS: BottleneckItem[] = [
  {
    stage: "Manual Phone Callbacks for Panic Values",
    problem: "Pathologists spent 3.5 hours daily attempting to call busy doctors regarding life-threatening critical lab values.",
    impact: "Average panic-value reporting took 4.8 hours, delaying urgent transfusions or intensive care interventions.",
    solution: "Automated multi-channel alerting (Push, SMS, EMR priority banner) with mandatory 1-tap acknowledgment.",
    timeSavings: "99% TAT Reduction",
  },
  {
    stage: "Handwritten Specimen Label Mismatches",
    problem: "Pen-labeled vials caused 4.2% specimen rejection rates due to smudged patient IDs and unreadable barcodes.",
    impact: "Patients forced to undergo repeat venipunctures, degrading clinical satisfaction.",
    solution: "Bedside 2D barcode thermal printing paired with optical scanner validation at each centrifuge handoff.",
    timeSavings: "99.8% Accuracy",
  },
  {
    stage: "Disjointed Batch EMR Data Entry",
    problem: "Test results were printed on thermal rolls and manually keyed into billing and medical record systems at end of shift.",
    impact: "14 hours per week lost to data entry with a 3.1% typographical transcription error rate.",
    solution: "Zero-latency HL7 / FHIR v4 bidirectional interface instantly pushing results directly to clinician charts.",
    timeSavings: "100% Automated",
  },
];

export const HEALTHCARE_DECISION_TIERS: DecisionTier[] = [
  {
    tier: "Tier 1: Routine Test Normal Range",
    actor: "LIS Auto-Verification Rule",
    criteria: "All analyte values within 2 standard deviations of normal",
    action: "Instant publication to patient chart & EMR",
    status: "Fully Automated (< 100ms)",
  },
  {
    tier: "Tier 2: Delta Check / Historical Variance",
    actor: "Clinical Pathologist",
    criteria: "Single analyte shifted > 50% from patient baseline",
    action: "Queue for Pathologist manual smear review",
    status: "Review Queue (< 30 Mins)",
  },
  {
    tier: "Tier 3: Life-Threatening Panic Value",
    actor: "Attending Physician & Charge Nurse",
    criteria: "Potassium > 6.2 mEq/L, Platelets < 20,000 / uL, Troponin > 0.04",
    action: "Priority multi-channel emergency alarm with required ACK",
    status: "Escalation Queue (< 2 Mins)",
  },
];

export const HEALTHCARE_RECOMMENDATIONS = [
  {
    title: "1. Bedside Phlebotomy Verification Scanner",
    detail: "Equip nurses with handheld wristband scanners to confirm patient identity before blood draws, cutting tube mismatches to zero.",
  },
  {
    title: "2. Deep Learning Peripheral Smear Analysis",
    detail: "Integrate convolutional neural networks to pre-classify abnormal blast cells, accelerating leukemia triage by 85%.",
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// DOMAIN 4: LOGISTICS, FLEET & SUPPLY CHAIN
// ─────────────────────────────────────────────────────────────────────────────
export const LOGISTICS_PROCESS_METRICS: ProcessMetric[] = [
  {
    label: "Driver Dispatch TAT",
    before: "45 Minutes",
    after: "30 Seconds",
    improvement: "98% Faster",
    icon: "Clock",
  },
  {
    label: "Proof-of-Delivery Cycle Time",
    before: "7.2 Days",
    after: "Instant (Live)",
    improvement: "100% Real-Time",
    icon: "Zap",
  },
  {
    label: "Route Optimization Efficiency",
    before: "18% Deadhead Miles",
    after: "3.2% Deadhead Miles",
    improvement: "82% Fuel Savings",
    icon: "Timer",
  },
  {
    label: "Missed Delivery SLA Rate",
    before: "19.5%",
    after: "2.1%",
    improvement: "89% Retention",
    icon: "Users",
  },
];

export const LOGISTICS_BPMN_BEFORE = `flowchart TD
  subgraph Intake["1. Paper Manifest Creation (2-3 Hours)"]
    A1([Orders phoned in and written on clipboards]) --> A2[Dispatch clerk manually groups delivery zones]
    A2 --> A3[Paper manifests printed and handed to drivers]
  end

  subgraph InTransit["2. Manual Route Navigation (5-7 Hours)"]
    A3 --> B1[Drivers navigate using consumer map apps]
    B1 --> B2{Customer not available?}
    B2 -->|Yes| B3[Driver calls dispatcher on phone playing phone tag]
    B2 -->|No| B4[Customer signs paper bill-of-lading with pen]
  end

  subgraph Billing["3. Delayed Paper Reconciliation (3-5 Days)"]
    B4 --> C1[Driver returns physical receipts to depot at end of week]
    C1 --> C2[Billing clerk types delivery slips into accounting software]
    C2 --> C3([Invoices dispatched 7-14 days after physical drop-off])
  end

  classDef legacy fill:#FEE2E2,stroke:#DC2626,stroke-width:1.5px,color:#991B1B;
  class A1,A2,A3,B1,B2,B3,B4,C1,C2,C3 legacy;
`;

export const LOGISTICS_BPMN_AFTER = `flowchart TD
  subgraph AutoIntake["1. AI Dynamic Route Solvers (< 10 Seconds)"]
    N1([Orders ingested via EDI / API]) --> N2[BizzMitra Travelling Salesperson algorithm optimizes 20+ stops]
    N2 --> N3[Digital manifests synchronized to Driver Navigation PWA]
  end

  subgraph SmartTransit["2. Real-Time Geofenced Tracking (Continuous)"]
    N3 --> S1[Truck telemetry streams live coordinates to Redis Geo]
    S1 --> S2{"Geofence 500m Threshold Reached?"}
    S2 -->|Yes| S3[Automated SMS ETA dispatched to Consignee Customer]
    S2 -->|No| S4[Continuous dead reckoning ETA recalculated]
  end

  subgraph InstantPOD["3. Geofenced Proof of Delivery (< 1 Minute)"]
    S3 --> P1[Driver captures digital signature & photo proof on mobile]
    P1 --> P2[GPS coordinates and timestamp cryptographically hashed]
    P2 --> P3[Delivery marked Complete in Central Dispatch Console]
  end

  subgraph AutomatedBilling["4. Real-Time Invoicing"]
    P3 --> B1([Automated invoice generated and emailed to client instantly])
  end

  classDef automated fill:#ECFDF5,stroke:#059669,stroke-width:1.5px,color:#065F46;
  class N1,N2,N3,S1,S2,S3,S4,P1,P2,P3,B1 automated;
`;

export const LOGISTICS_SWIMLANE_BPMN = `sequenceDiagram
  autonumber
  actor Driver as "Fleet Truck Driver"
  actor Dispatch as "Central Dispatcher"
  participant Kafka as "Kafka Telematics Stream"
  participant AI as "Dynamic Route AI"
  actor Customer as "Consignee Customer"

  rect rgb(13, 148, 136, 0.08)
    Note over Driver,Kafka: Phase 1: Real-Time GPS Tracking
    Driver->>Kafka: Transmit GPS ping (Lat, Lng, 55 mph)
    Kafka->>AI: Evaluate proximity to Destination Geofence
    AI->>Customer: Push SMS: Truck is 10 minutes away
  end

  rect rgb(99, 102, 241, 0.08)
    Note over Customer,Driver: Phase 2: Digital Proof of Delivery
    Driver->>Customer: Package unloaded at Receiving Dock
    Customer->>Driver: Signs on Mobile Touchscreen
    Driver->>Dispatch: Upload geotagged photo + signature
  end

  rect rgb(2, 132, 199, 0.08)
    Note over Dispatch,Customer: Phase 3: Instant Verified Billing
    Dispatch->>Customer: Automatic PDF bill of lading emailed
  end
`;

export const LOGISTICS_DECISION_TREE = `graph TD
  Start([📦 Delivery Order Placed]) --> RouteSolve[🗺️ Multi-Stop Traveling Salesperson Optimization]
  RouteSolve --> TrafficCheck[🚗 Live Traffic & Weather Ingestion]
  TrafficCheck --> Q1{"Traffic Delay > 20 Mins?"}
  Q1 -- Yes --> ReRoute[🔄 Dynamic Re-Route Around Congestion]
  Q1 -- No --> DispatchTruck[🚚 Driver Dispatched with Optimized Turns]
  ReRoute --> DispatchTruck
  DispatchTruck --> GeoFence{"Geofence 500m Triggered?"}
  GeoFence -- Yes --> CustomerSMS[📲 Automated SMS: Driver Arriving in 5 Mins]
  CustomerSMS --> DockArrival[🏭 Truck Arrives at Loading Dock]
  DockArrival --> SignCapture[✍️ Digital Glass Signature Captured]
  SignCapture --> AutoInvoice([📄 Instant Automated Bill of Lading Dispatched])
`;

export const LOGISTICS_BOTTLENECK_ANALYSIS: BottleneckItem[] = [
  {
    stage: "Manual Paper Manifest Compilation",
    problem: "Dispatchers spent 2.5 hours every morning manually sorting clipboards and grouping invoices by zip code.",
    impact: "Fleet departed depots late, missing morning retail delivery windows.",
    solution: "BizzMitra Travelling Salesperson route optimization solves 30-stop routes in under 10 seconds.",
    timeSavings: "98% Dispatch Acceleration",
  },
  {
    stage: "Lost Paper Proof-of-Delivery Slips",
    problem: "Signed physical delivery slips were kept in driver cabs for days, leading to 3.8% lost delivery receipts.",
    impact: "Billing disputes and delayed client invoice settlements by an average of 14 days.",
    solution: "Mobile glass-signature and photo proof-of-delivery with instant cloud upload and automated invoicing.",
    timeSavings: "100% Invoicing Acceleration",
  },
  {
    stage: "Zero Real-Time Geofence Notification",
    problem: "Customers had to call dispatch centers repeatedly to ask where their shipment was located.",
    impact: "Customer support desks overwhelmed with 'Where is my order?' phone inquiries.",
    solution: "Automated spatial geofencing triggers customer SMS notifications with live Mapbox tracking links.",
    timeSavings: "85% Support Call Reduction",
  },
];

export const LOGISTICS_DECISION_TIERS: DecisionTier[] = [
  {
    tier: "Tier 1: Regular Route Waypoint Execution",
    actor: "Driver Navigation PWA",
    criteria: "Truck follows scheduled GPS corridor within 200m buffer",
    action: "Normal telemetry streaming to Redis Geo",
    status: "Autonomous Tracking",
  },
  {
    tier: "Tier 2: Severe Traffic Congestion Re-route",
    actor: "Dynamic Route Optimizer",
    criteria: "Current route ETA degraded by > 20 minutes due to incidents",
    action: "Auto-recalculate alternate turn-by-turn route",
    status: "Real-Time AI Solver",
  },
  {
    tier: "Tier 3: Cold Chain Temperature Alarm",
    actor: "Safety Dispatch Officer",
    criteria: "Reefer cargo temperature exceeds 4C threshold for > 15 mins",
    action: "Immediate emergency alert to driver & nearest refrigerated depot",
    status: "Sub-Second Alarm",
  },
];

export const LOGISTICS_RECOMMENDATIONS = [
  {
    title: "1. Predictive Fuel Consumption Optimization",
    detail: "Incorporate truck gross vehicle weight and road elevation gradients into route solvers to cut diesel expenses by 8%.",
  },
  {
    title: "2. Geofenced Automated Gate Clearance",
    detail: "Install RFID / BLE beacons at distribution center entry points to auto-lift boom gates without driver cab dismounts.",
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// DOMAIN 5: E-COMMERCE, AMAZON FBA & RETAIL
// ─────────────────────────────────────────────────────────────────────────────
export const ECOMMERCE_PROCESS_METRICS: ProcessMetric[] = [
  {
    label: "Amazon Restock Cycle Time",
    before: "14.2 Days",
    after: "1.8 Days",
    improvement: "87% Faster",
    icon: "Clock",
  },
  {
    label: "Aged Inventory Surcharges",
    before: "₹18.5L / yr",
    after: "₹1.2L / yr",
    improvement: "93% Savings",
    icon: "Zap",
  },
  {
    label: "Stockout Reconciliation Latency",
    before: "48 Hours",
    after: "Instant (Live)",
    improvement: "100% Real-Time",
    icon: "Timer",
  },
  {
    label: "Listing Suppression SLA Rate",
    before: "16.8%",
    after: "0.4%",
    improvement: "98% Retention",
    icon: "Users",
  },
];

export const ECOMMERCE_BPMN_BEFORE = `flowchart TD
  subgraph Intake["1. Spreadsheet Stock Audit (3-4 Days)"]
    A1([Seller central CSV downloaded manually]) --> A2[Operator reconciles slow-moving SKUs in Excel]
    A2 --> A3[Manual re-order quantity guesses]
  end

  subgraph Restock["2. Delayed Purchase Orders (5-7 Days)"]
    A3 --> B1[Suppliers emailed with PDF purchase orders]
    B1 --> B2{Stockout on Amazon?}
    B2 -->|Yes| B3[Buy Box lost and rank drops severely]
    B2 -->|No| B4[Warehouse receives batch with mislabeled ASINs]
  end

  subgraph Reconciliation["3. Fee Audit & Leakage (Ongoing)"]
    B4 --> C1[Long-term storage fees charged by Amazon]
    C1 --> C2[Disputes logged manually through seller support tickets]
    C2 --> C3([Profit margin eroded by 18-24% annually])
  end

  classDef legacy fill:#FEE2E2,stroke:#DC2626,stroke-width:1.5px,color:#991B1B;
  class A1,A2,A3,B1,B2,B3,B4,C1,C2,C3 legacy;
`;

export const ECOMMERCE_BPMN_AFTER = `flowchart TD
  subgraph AutoSync["1. Real-Time SP-API Ingestion (30 Seconds)"]
    N1([Amazon SP-API live inventory webhook]) --> N2[Predictive run-rate velocity calculator]
    N2 --> N3[Automated PO generated at reorder point]
  end

  subgraph SmartRestock["2. Smart FBA Dispatch (< 1 Hour)"]
    N3 --> S1[Dynamic FBA split shipment optimizer]
    S1 --> S2{Aged stock warning?}
    S2 -->|Yes| S3[Automated markdown repricing or liquidation]
    S2 -->|No| S4[Auto-scheduled 3PL freight pickup with 2D barcode]
  end

  subgraph ProfitMax["3. Autonomous Reconciliation (Real-Time)"]
    S4 --> P1[Automated Amazon FBA reimbursement claims filed]
    P1 --> P2[Buy Box retention at 99.2% with zero stockouts]
    P2 --> P3([Protected working capital & 4.8x inventory ROI])
  end

  classDef modern fill:#DCFCE7,stroke:#16A34A,stroke-width:1.5px,color:#14532D;
  class N1,N2,N3,S1,S2,S3,S4,P1,P2,P3 modern;
`;

export const ECOMMERCE_SWIMLANE_BPMN = `flowchart TB
  subgraph AmazonMarketplace["Amazon SP-API Gateway"]
    A1[Live Inventory & Velocity Stream]
    A2[Order Drop & Buy Box Events]
  end

  subgraph BizzMitraEngine["BizzMitra Inventory Intelligence Engine"]
    B1[Dynamic Reorder Threshold Calculator]
    B2[Automated FBA Allocation & Markdown Rule]
  end

  subgraph SupplierWarehouse["Supplier & 3PL Logistics"]
    C1[Electronic PO Intake via EDI/Webhook]
    C2[Pre-Labeled FBA Carton Dispatch]
  end

  subgraph BrandOperator["E-Commerce Operations Director"]
    D1[Exception Approvals & Margin Cockpit]
  end

  A1 --> B1 --> C1 --> C2
  A2 --> B2 --> D1
`;

export const ECOMMERCE_DECISION_TREE = `flowchart TD
  In[SKU Inventory Ingestion] --> SkuCheck{Days of Cover < Lead Time + Safety Stock?}
  SkuCheck -->|Yes| CritCheck{Buy Box Velocity > 20 units/day?}
  CritCheck -->|Yes| AirPo[Auto-Issue Air Expedited PO to Supplier]
  CritCheck -->|No| SeaPo[Auto-Issue Standard Freight PO]
  SkuCheck -->|No| AgedCheck{Stock Age > 90 Days?}
  AgedCheck -->|Yes| Reprice[Trigger Dynamic Liquidation Repricer]
  AgedCheck -->|No| Optimal[Maintain Standard Prime Velocity]
`;

export const ECOMMERCE_DECISION_TIERS: DecisionTier[] = [
  { tier: "Tier 1: High Velocity Reorder", actor: "AI Replenishment Engine", criteria: "Days-of-cover < 14 and Buy-box share > 80%", action: "Auto-Generate & Transmit Supplier PO", status: "Active" },
  { tier: "Tier 2: Aged Stock Defense", actor: "AI Dynamic Repricer", criteria: "Inventory age > 90 days with velocity drop", action: "Execute Flash Promotion & Liquidate", status: "Active" },
  { tier: "Tier 3: Reimbursement Recovery", actor: "Audit Microservice", criteria: "FBA lost / damaged discrepancy detected", action: "File Automated Case with Amazon Support", status: "Active" },
];

export const ECOMMERCE_BOTTLENECK_ANALYSIS: BottleneckItem[] = [
  {
    stage: "Manual Excel Inventory Audits",
    problem: "Brand managers download weekly CSVs from Seller Central and calculate reorders by hand.",
    impact: "Unplanned stockouts during high-demand promotional spikes.",
    solution: "Continuous SP-API webhook streaming with dynamic velocity calculations.",
    timeSavings: "14 hours/week per brand manager",
  },
  {
    stage: "Aged Inventory Surcharge Bleed",
    problem: "Slow-moving variants sit in Amazon fulfillment centers accumulating punitive storage surcharges.",
    impact: "₹18.5L in avoidable fees eroded from annual EBITDA.",
    solution: "Proactive 60-day liquidation rules and automated bundle deals.",
    timeSavings: "93% fee elimination",
  },
  {
    stage: "Lost Buy Box During Stockouts",
    problem: "When flagship ASINs stock out, search rankings plunge and recovery takes weeks.",
    impact: "Long-term organic sales drop of up to 40%.",
    solution: "Multi-echelon supplier buffer and split-shipment automation.",
    timeSavings: "Zero stockout downtime",
  },
];

export const ECOMMERCE_RECOMMENDATIONS = [
  {
    title: "1. Real-Time SP-API Webhook Synchronizer",
    detail: "Directly connect Amazon Seller Central API to automate PO creation before safety stock triggers.",
  },
  {
    title: "2. Autonomous FBA Fee & Lost Inventory Audit",
    detail: "Continuously reconcile warehouse receipts against Amazon scanned units to recover thousands in lost inventory reimbursements.",
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// DOMAIN 6: FINTECH, NBFC & LENDING
// ─────────────────────────────────────────────────────────────────────────────
export const FINTECH_PROCESS_METRICS: ProcessMetric[] = [
  {
    label: "Loan Underwriting Turnaround",
    before: "4.5 Days",
    after: "15 Minutes",
    improvement: "98% Faster",
    icon: "Clock",
  },
  {
    label: "e-KYC & Bureau Verification",
    before: "24 Hours",
    after: "Instant (OCR)",
    improvement: "100% Real-Time",
    icon: "Zap",
  },
  {
    label: "Underwriting Exception Review",
    before: "6.2 Hours",
    after: "30 Seconds",
    improvement: "99% Reduction",
    icon: "Timer",
  },
  {
    label: "Default Pre-Screening Accuracy",
    before: "79.4%",
    after: "99.2%",
    improvement: "+20% Accuracy",
    icon: "Users",
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// DOMAIN 7: MANUFACTURING & INDUSTRIAL IOT
// ─────────────────────────────────────────────────────────────────────────────
export const MANUFACTURING_PROCESS_METRICS: ProcessMetric[] = [
  {
    label: "Shift Changeover Handover TAT",
    before: "75 Minutes",
    after: "12 Minutes",
    improvement: "84% Faster",
    icon: "Clock",
  },
  {
    label: "Machine Telemetry Alarm Response",
    before: "35 Minutes",
    after: "10 Seconds",
    improvement: "99% Faster",
    icon: "Zap",
  },
  {
    label: "Batch QA Inspection Latency",
    before: "5.5 Hours",
    after: "25 Minutes",
    improvement: "92% Reduction",
    icon: "Timer",
  },
  {
    label: "Scrap & Rework Rate",
    before: "12.8%",
    after: "1.2%",
    improvement: "91% Yield Boost",
    icon: "Users",
  },
];

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

/**
 * Deterministic Dynamic Process Blueprint generator for any custom domain.
 * Generates unique, realistic operational metrics tailored to the workspace.
 */
export function generateDynamicProcessMetrics(
  businessName: string,
  problem: string,
  industry: string
): ProcessMetric[] {
  const seed = `${businessName} ${problem} ${industry}`;
  const h = hashString(seed);

  const cycleHours = (h % 30) + 12;
  const cycleMins = (h % 5) + 1;
  const cycleSpeed = 85 + (h % 13);

  const errorBefore = ((h % 15) + 12).toFixed(1);
  const errorAfter = (0.2 + ((h % 8) / 10)).toFixed(1);
  const errorRed = 90 + (h % 8);

  const adminHours = (h % 25) + 20;

  const slaBefore = (60 + (h % 18)).toFixed(1);
  const slaAfter = (97.5 + ((h % 20) / 10)).toFixed(1);
  const slaGain = (Number(slaAfter) - Number(slaBefore)).toFixed(1);

  return [
    {
      label: `${businessName.split(" ")[0]} Operational Cycle Time`,
      before: `${cycleHours} Hours`,
      after: `${cycleMins} Minutes`,
      improvement: `${cycleSpeed}% Faster`,
      icon: "Clock",
    },
    {
      label: "Process Friction & Error Rate",
      before: `${errorBefore}%`,
      after: `${errorAfter}%`,
      improvement: `${errorRed}% Reduction`,
      icon: "Zap",
    },
    {
      label: "Manual Processing Overhead",
      before: `${adminHours} hrs/wk`,
      after: "Instant (Live)",
      improvement: "100% Real-Time",
      icon: "Timer",
    },
    {
      label: "Stakeholder SLA Adherence",
      before: `${slaBefore}%`,
      after: `${slaAfter}%`,
      improvement: `+${slaGain}% Retention`,
      icon: "Users",
    },
  ];
}

// ─────────────────────────────────────────────────────────────────────────────
// BLUEPRINT FACTORY FOR ANY PROBLEM INTAKE
// ─────────────────────────────────────────────────────────────────────────────
export function getProcessBlueprint(context?: {
  businessName?: string;
  industry?: string;
  problemStatement?: string;
}): ProcessBlueprint {
  const combined = `${context?.industry || ""} ${context?.problemStatement || ""} ${context?.businessName || ""}`.toLowerCase();
  const name = context?.businessName?.trim() || "Enterprise";
  const ind = context?.industry?.trim() || "General";
  const prob = context?.problemStatement?.trim() || "";

  // 1. E-Commerce & Amazon FBA / Retail
  if (
    combined.includes("amazon") ||
    combined.includes("fba") ||
    combined.includes("ecommerce") ||
    combined.includes("e-commerce") ||
    combined.includes("seller central") ||
    combined.includes("sku") ||
    combined.includes("stockout") ||
    combined.includes("retail") ||
    combined.includes("catalog")
  ) {
    return {
      domainId: "ecommerce",
      domainTitle: `${name} — Amazon FBA & E-Commerce BPMN Process Intelligence`,
      metrics: ECOMMERCE_PROCESS_METRICS,
      asIsDiagram: ECOMMERCE_BPMN_BEFORE,
      toBeDiagram: ECOMMERCE_BPMN_AFTER,
      swimlaneDiagram: ECOMMERCE_SWIMLANE_BPMN,
      decisionTreeDiagram: ECOMMERCE_DECISION_TREE,
      decisionTiers: ECOMMERCE_DECISION_TIERS,
      bottlenecks: ECOMMERCE_BOTTLENECK_ANALYSIS,
      recommendations: ECOMMERCE_RECOMMENDATIONS,
    };
  }

  // 2. Clean Tech & Solar
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
      domainTitle: `${name} — Clean Tech & Solar BPMN Process Intelligence`,
      metrics: SOLAR_PROCESS_METRICS,
      asIsDiagram: SOLAR_BPMN_BEFORE,
      toBeDiagram: SOLAR_BPMN_AFTER,
      swimlaneDiagram: SOLAR_SWIMLANE_BPMN,
      decisionTreeDiagram: SOLAR_DECISION_TREE,
      decisionTiers: SOLAR_DECISION_TIERS,
      bottlenecks: SOLAR_BOTTLENECK_ANALYSIS,
      recommendations: SOLAR_RECOMMENDATIONS,
    };
  }

  // 0. Project Management, TaskFlow & Leave Management
  if (isProjectManagementDomain(combined)) {
    return {
      domainId: "taskflow",
      domainTitle: `${name} — Leave-Aware Task & Sprint Delivery BPMN Process`,
      metrics: [
        { label: "Task Leave Collisions", before: "38% Sprints", after: "0% (Hard Blocked)", improvement: "-100% Conflict Elimination", icon: "Clock" },
        { label: "Mid-Task Handover Lag", before: "4.2 Days", after: "2 Hours", improvement: "-84% Stall Time", icon: "Users" },
        { label: "Sprint Delivery Reliability", before: "62%", after: "97%", improvement: "+56% On-Time Completion", icon: "CheckCircle2" },
        { label: "PM Emergency Re-Planning", before: "14 hrs/mo", after: "45 mins/mo", improvement: "-94% Time Reclaimed", icon: "TrendingUp" },
      ],
      asIsDiagram: `graph TD
    A["1. PM Identifies Project Scope"] --> B["2. Fixes Task Deadline Arbitrarily"]
    B --> C["3. Assigns Team Member in Spreadsheet"]
    C --> D{"4. Does Assignee Go on Leave Mid-Task?"}
    D -- "Yes (No Buffer Planned)" --> E["5. Task Stalls & Progress Freezes"]
    E --> F["6. Last-Minute Panic Reassignment"]
    F --> G["7. Deadline Missed & Sprint Failure"]
    D -- "No" --> H["8. Unpredictable Manual Delivery"]`,
      toBeDiagram: `graph TD
    A["1. PM Creates Project Task"] --> B["2. TaskFlow Checks Assignee Leave Records"]
    B --> C{"3. Date Overlap Detected?"}
    C -- "Yes (Collision)" --> D["4. BLOCK Assignment with Inline PM Alert"]
    D --> E["5. PM Adjusts Range or Selects Available Member"]
    E --> B
    C -- "No (Clear Window)" --> F["6. Confirm Task on Kanban Board"]
    F --> G["7. Team Availability Radar Updated"]
    G --> H["8. 100% On-Time Delivery with Zero Stalls"]`,
      swimlaneDiagram: `sequenceDiagram
    autonumber
    actor PM as Project Manager
    participant TF as TaskFlow Engine
    participant DB as Local-First Storage
    actor Member as Team Member
    
    PM->>TF: Submit Task(Title, Assignee, StartDate, DueDate)
    TF->>DB: Query Member Leave Records for Date Range
    DB-->>TF: Return Scheduled Leave Intervals
    alt Overlap Detected
        TF-->>PM: 400 Bad Request: "Priya is on leave June 5-8"
        Note over PM,TF: Assignment blocked; PM adjusts dates
    else Clear Availability
        TF->>DB: Persist Task in Project Kanban Store
        DB-->>TF: 201 Created
        TF-->>PM: Task Scheduled & Visible on Kanban
        TF-->>Member: Availability Confirmed
    end`,
      decisionTreeDiagram: `graph TD
    ROOT["Task Scheduling Request"] --> CHK{"Assignee Leave Conflict?"}
    CHK -- "Yes" --> BLK["Hard Block: Inline Error"]
    BLK --> SUG["Suggest Alternative Date or Available Peer"]
    CHK -- "No" --> KAN["Commit to Kanban Board"]
    KAN --> RAD["Update Team Availability Radar"]`,
      decisionTiers: [
        { tier: "Tier 1: Validation", actor: "Leave Collision Engine", criteria: "Task dates ∩ Leave intervals ≠ ∅", action: "Instantly block submission and surface date conflict warning", status: "Automated" },
        { tier: "Tier 2: Scheduling", actor: "Project Manager", criteria: "Task assignment verified against team capacity", action: "Confirm start/due dates and assign to sprint backlog", status: "Manual PM" },
        { tier: "Tier 3: Handover Buffer", actor: "Sprint Planning Rule", criteria: "Task duration > 3 days prior to known leave", action: "Flag required handover checklist before leave start date", status: "Recommended" },
      ],
      bottlenecks: [
        { stage: "Task Assignment", problem: "Deadlines set without checking employee leave calendars", impact: "High risk of sudden mid-task stoppage", solution: "Automated leave-aware assignment blocker", timeSavings: "10 hrs/month" },
        { stage: "Work Handover", problem: "No buffer or handover preparation when someone goes on leave mid-task", impact: "Work rushed at the last minute or abandoned", solution: "Pre-leave handover alert and buffer scheduling", timeSavings: "6 hrs/month" },
        { stage: "Status Tracking", problem: "Disconnected spreadsheets and manual WhatsApp queries", impact: "Zero real-time visibility into project health", solution: "Visual Kanban board (To Do / In Progress / Done)", timeSavings: "8 hrs/month" },
      ],
      recommendations: [
        { title: "Enforce Hard Assignment Blocking", description: "Never allow task submission if the assigned team member has an overlapping leave record.", impact: "Zero surprise delivery halts", priority: "Critical" },
        { title: "Maintain Visual Availability Radar", description: "Keep team availability and upcoming PTO dates visible directly in the PM planning dashboard.", impact: "Pre-emptive conflict avoidance", priority: "High" },
        { title: "Adopt Local-First Architecture", description: "Persist all projects, tasks, and leave records client-side for zero-friction single PM usability.", impact: "Zero backend hosting cost", priority: "High" },
      ],
    };
  }

  // 3. Healthcare & Diagnostic Lab
  if (isHealthcareDomain(combined)) {
    return {
      domainId: "healthcare",
      domainTitle: `${name} — Clinical Diagnostic BPMN Process Intelligence`,
      metrics: HEALTHCARE_PROCESS_METRICS,
      asIsDiagram: HEALTHCARE_BPMN_BEFORE,
      toBeDiagram: HEALTHCARE_BPMN_AFTER,
      swimlaneDiagram: HEALTHCARE_SWIMLANE_BPMN,
      decisionTreeDiagram: HEALTHCARE_DECISION_TREE,
      decisionTiers: HEALTHCARE_DECISION_TIERS,
      bottlenecks: HEALTHCARE_BOTTLENECK_ANALYSIS,
      recommendations: HEALTHCARE_RECOMMENDATIONS,
    };
  }

  // 4. FinTech & Lending
  if (
    combined.includes("fintech") ||
    combined.includes("loan") ||
    combined.includes("lending") ||
    combined.includes("nbfc") ||
    combined.includes("kyc") ||
    combined.includes("bureau") ||
    combined.includes("credit") ||
    combined.includes("underwriting") ||
    combined.includes("bank")
  ) {
    return {
      domainId: "fintech",
      domainTitle: `${name} — FinTech & Automated Lending BPMN Process Intelligence`,
      metrics: FINTECH_PROCESS_METRICS,
      asIsDiagram: HR_BPMN_BEFORE,
      toBeDiagram: HR_BPMN_AFTER,
      swimlaneDiagram: HR_SWIMLANE_BPMN,
      decisionTreeDiagram: HR_DECISION_TREE,
      decisionTiers: HR_DECISION_TIERS,
      bottlenecks: HR_BOTTLENECK_ANALYSIS,
      recommendations: HR_RECOMMENDATIONS,
    };
  }

  // 5. Manufacturing & Industrial
  if (
    combined.includes("manufactur") ||
    combined.includes("factory") ||
    combined.includes("assembly") ||
    combined.includes("plant") ||
    combined.includes("machine") ||
    combined.includes("oee") ||
    combined.includes("industrial")
  ) {
    return {
      domainId: "manufacturing",
      domainTitle: `${name} — Manufacturing & Plant Floor BPMN Process Intelligence`,
      metrics: MANUFACTURING_PROCESS_METRICS,
      asIsDiagram: HR_BPMN_BEFORE,
      toBeDiagram: HR_BPMN_AFTER,
      swimlaneDiagram: HR_SWIMLANE_BPMN,
      decisionTreeDiagram: HR_DECISION_TREE,
      decisionTiers: HR_DECISION_TIERS,
      bottlenecks: HR_BOTTLENECK_ANALYSIS,
      recommendations: HR_RECOMMENDATIONS,
    };
  }

  // 6. Logistics, Fleet & Supply Chain (Strictly fleet/trucking)
  if (
    combined.includes("logistics") ||
    combined.includes("fleet") ||
    combined.includes("reefer") ||
    combined.includes("deadhead") ||
    combined.includes("cold-chain") ||
    combined.includes("cold chain") ||
    combined.includes("truck") ||
    combined.includes("freight") ||
    (combined.includes("dispatch") && !combined.includes("hr"))
  ) {
    return {
      domainId: "logistics",
      domainTitle: `${name} — Fleet & Supply Chain BPMN Process Intelligence`,
      metrics: LOGISTICS_PROCESS_METRICS,
      asIsDiagram: LOGISTICS_BPMN_BEFORE,
      toBeDiagram: LOGISTICS_BPMN_AFTER,
      swimlaneDiagram: LOGISTICS_SWIMLANE_BPMN,
      decisionTreeDiagram: LOGISTICS_DECISION_TREE,
      decisionTiers: LOGISTICS_DECISION_TIERS,
      bottlenecks: LOGISTICS_BOTTLENECK_ANALYSIS,
      recommendations: LOGISTICS_RECOMMENDATIONS,
    };
  }

  // 7. HR & Recruitment Services (Only when explicitly HR or Recruitment)
  if (
    combined.includes("recruitment") ||
    combined.includes("staffing agency") ||
    combined.includes("applicant tracking") ||
    combined.includes("candidate interview") ||
    combined.includes("talent acquisition") ||
    /\b(hr|recruiter|recruiting|hiring|resumes?)\b/.test(combined)
  ) {
    return {
      domainId: "hr",
      domainTitle: `${name} — HR & Recruitment BPMN Process Intelligence`,
      metrics: HR_PROCESS_METRICS,
      asIsDiagram: HR_BPMN_BEFORE,
      toBeDiagram: HR_BPMN_AFTER,
      swimlaneDiagram: HR_SWIMLANE_BPMN,
      decisionTreeDiagram: HR_DECISION_TREE,
      decisionTiers: HR_DECISION_TIERS,
      bottlenecks: HR_BOTTLENECK_ANALYSIS,
      recommendations: HR_RECOMMENDATIONS,
    };
  }

  // 8. Dynamic Seeded Blueprint Engine for Any Custom Domain
  const dynamicMetrics = generateDynamicProcessMetrics(name, prob, ind);
  return {
    domainId: `custom-${ind.toLowerCase().replace(/[^a-z0-9]/g, "-")}`,
    domainTitle: `${name} — ${ind} BPMN Process Intelligence`,
    metrics: dynamicMetrics,
    asIsDiagram: HR_BPMN_BEFORE,
    toBeDiagram: HR_BPMN_AFTER,
    swimlaneDiagram: HR_SWIMLANE_BPMN,
    decisionTreeDiagram: HR_DECISION_TREE,
    decisionTiers: HR_DECISION_TIERS,
    bottlenecks: [
      {
        stage: "Manual Data Entry & Ingestion",
        problem: `Operations operators for ${name} manually transcribe records across fragmented tools with zero audit trail.`,
        impact: "4-6 hours wasted daily with high error rate.",
        solution: "Automated event-driven intake pipeline with instant validation.",
        timeSavings: "85% reduction",
      },
      {
        stage: "Cross-Functional Handoff Latency",
        problem: "Handoffs between internal teams rely on ad-hoc messaging and unmonitored email threads.",
        impact: "Severe turnaround drag and missed customer SLAs.",
        solution: "Rules-based automated workflow orchestration with auto-escalation.",
        timeSavings: "90% time saved",
      },
    ],
    recommendations: [
      {
        title: "1. Event-Driven Workflow Automation",
        detail: `Deploy automated webhook triggers for ${name} to eliminate manual queue management.`,
      },
      {
        title: "2. Real-Time Telemetry & SLA Tracking",
        detail: "Implement automated threshold alarms to intercept bottlenecks before SLA breaches occur.",
      },
    ],
  };
}

// Backward-compatible exports
export const PROCESS_METRICS = HR_PROCESS_METRICS;
export const BOTTLENECK_ANALYSIS = HR_BOTTLENECK_ANALYSIS;

