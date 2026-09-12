/**
 * AI Implementation Planning Engine Data & Models
 * Supports both TalentCraft HR Consultancy (Flagship) and Nexa Support enterprise scenarios.
 */

export type MilestoneItem = {
  id: string;
  title: string;
  category: "Architecture" | "Frontend" | "Backend" | "Data & Integration" | "QA & Security" | "Operations";
  effortDays: number;
  completed: boolean;
  deliverable: string;
};

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

export const NEXA_SUPPORT_ROADMAP: RoadmapBlueprint = {
  workspaceId: "ws-nexa-support",
  scenarioName: "Nexa E-Commerce Support Automation",
  targetTimelineWeeks: 6,
  totalPersonDays: 69,
  estimatedGoLive: "Week 6",
  confidenceScore: 91,
  executiveSummary:
    "A 4-phase, 6-week engineering plan implementing AI triage, Shopify order status resolution, and Freshdesk copilot sidebar.",
  phases: [
    {
      id: "nexa-p1",
      phaseNumber: 1,
      name: "Foundation & Intake",
      codename: "Webhook Sprint",
      durationWeeks: "Weeks 1–2",
      startWeek: 0,
      durationWeekCount: 2,
      objective: "Connect Freshdesk webhooks and establish ticket mirror schema with HMAC authentication.",
      status: "completed",
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
      ],
      teamResourcing: [
        { role: "Backend Engineer", fte: 1.0, responsibilities: "Webhooks and API integrations" },
      ],
      criticalDeliverables: ["Secure webhook intake", "Order connector APIs"],
    },
    {
      id: "nexa-p2",
      phaseNumber: 2,
      name: "Triage & Resolvers",
      codename: "Classifier Sprint",
      durationWeeks: "Weeks 2–4",
      startWeek: 2,
      durationWeekCount: 2,
      objective: "Train classifier on 90 days of tickets and implement return eligibility rules.",
      status: "in-progress",
      milestones: [
        {
          id: "nm-3",
          title: "Intent Classifier Training (7 Labels)",
          category: "Architecture",
          effortDays: 8,
          completed: false,
          deliverable: "Fine-tuned classifier with >85% confidence threshold",
        },
      ],
      teamResourcing: [
        { role: "ML Engineer", fte: 1.0, responsibilities: "Model training and evaluation" },
      ],
      criticalDeliverables: ["Order status auto-resolver", "Return eligibility engine"],
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

export function getRoadmapForWorkspace(workspaceContext?: { name?: string; industry?: string } | null): RoadmapBlueprint {
  if (!workspaceContext) return HR_CONSULTANCY_ROADMAP;
  const isNexa =
    workspaceContext.name?.toLowerCase().includes("nexa") ||
    workspaceContext.industry?.toLowerCase().includes("ecommerce") ||
    workspaceContext.industry?.toLowerCase().includes("customer support");

  return isNexa ? NEXA_SUPPORT_ROADMAP : HR_CONSULTANCY_ROADMAP;
}
