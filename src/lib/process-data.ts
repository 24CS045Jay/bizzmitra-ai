export interface ProcessMetric {
  label: string;
  before: string;
  after: string;
  improvement: string;
  icon: string;
}

export const PROCESS_METRICS: ProcessMetric[] = [
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
  actor Cand as Candidate / Consultant
  actor Recruiter as Agency Recruiter
  participant AI as BizzMitra AI Engine
  participant CRM as Workable HR CRM
  actor Client as Corporate Client

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

export interface BottleneckItem {
  stage: string;
  problem: string;
  impact: string;
  solution: string;
  timeSavings: string;
}

export const BOTTLENECK_ANALYSIS: BottleneckItem[] = [
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
