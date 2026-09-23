import type { BuildBuyOption } from "../demo-data";

export type ProblemFramingData = {
  statement: string;
  impact: Array<{ metric: string; value: string }>;
  rootCauses: Array<{ title: string; detail: string }>;
  constraints: string[];
};

export type SolutionData = {
  headline: string;
  summary: string;
  pillars: Array<{ title: string; detail: string }>;
  tradeoffs: Array<{ option: string; verdict: string; why: string }>;
  stack?: Array<{ layer: string; choice: string; why: string }>;
};

export type DynamicSolutionModule = {
  key: string;
  name: string;
  description: string;
  icon: string;
  status: "Core" | "Recommended" | "Optional" | "Planned";
  timeTag: "Invest" | "Migrate" | "Tolerate" | "Eliminate";
  features: string[];
};

export type SolutionGenerationResult = {
  source: "groq-llm" | "domain-heuristic";
  modelUsed: string;
  framing: ProblemFramingData;
  solution: SolutionData;
  modules: DynamicSolutionModule[];
  buildBuyMatrix: BuildBuyOption[];
};

/**
 * Calls backend /api/ai/solution-framing powered by Groq 120B.
 * Falls back safely to tailored domain heuristics if offline or rate-limited.
 */
export async function generateDynamicSolution(
  problemStatement: string,
  businessName = "Enterprise Business",
  industry = "General",
  options?: { forceFresh?: boolean; customFields?: string[] }
): Promise<SolutionGenerationResult> {
  const cacheKey = `bizzmitra.solution_cache.${encodeURIComponent((problemStatement || "").slice(0, 50))}`;

  if (!options?.forceFresh) {
    try {
      const cached = typeof window !== "undefined" ? window.sessionStorage.getItem(cacheKey) : null;
      if (cached) {
        const parsed = JSON.parse(cached);
        return parsed;
      }
    } catch {}
  } else {
    try {
      if (typeof window !== "undefined") {
        window.sessionStorage.removeItem(cacheKey);
      }
    } catch {}
  }

  try {
    const res = await fetch("/api/ai/solution-framing", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        problemStatement,
        businessName,
        industry,
        customFields: options?.customFields || [],
      }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.success && data.framing && data.solution && data.modules) {
        const rawSolution = data.solution;
        const stack = rawSolution.stack || [
          { layer: "Presentation & Workable Layer", choice: "React 19 + TypeScript + Tailwind CSS", why: "Rapid workflow responsiveness and zero-latency client interactions." },
          { layer: "API Gateway & Orchestration", choice: "Cloud-Native Node / Edge Workers", why: "Low-latency webhook ingestion and event-driven automation." },
          { layer: "Data Layer & Persistence", choice: "Supabase (PostgreSQL 15)", why: "Row-level security, encrypted audit trails, and automatic REST/GraphQL endpoints." },
          { layer: "AI Reasoning & Copilots", choice: "Groq 120B Inference Engine", why: "Sub-second semantic intelligence and deterministic structured JSON processing." },
        ];

        const result: SolutionGenerationResult = {
          source: "groq-llm",
          modelUsed: data.modelUsed || "Groq Llama 3.3 70B",
          framing: data.framing,
          solution: { ...rawSolution, stack },
          modules: data.modules,
          buildBuyMatrix: data.buildBuyMatrix || getDomainBuildBuy(industry),
        };

        try {
          if (typeof window !== "undefined") {
            window.sessionStorage.setItem(cacheKey, JSON.stringify(result));
          }
        } catch {}

        return result;
      }
    }
  } catch (err) {
    console.warn("[generateDynamicSolution] Server Groq API unavailable, checking client key:", err);
  }

  // Domain Heuristic Fallback
  return generateDomainSolutionFallback(problemStatement, businessName, industry);
}

function getDomainBuildBuy(industry: string): BuildBuyOption[] {
  return [
    {
      option: `BizzMitra AI Tailored Platform (${industry} Core)`,
      cost: 5,
      speed: 4,
      control: 5,
      fit: 5,
      verdict: "Recommended",
      rationale: "Domain-tailored workflow micro-services with enterprise compliance and 6-week delivery velocity.",
    },
    {
      option: "Custom Ground-Up Microservices",
      cost: 3,
      speed: 2,
      control: 5,
      fit: 4,
      verdict: "Viable",
      rationale: "Highest control and ownership, but carries substantial initial engineering effort and delayed ROI.",
    },
    {
      option: "Off-the-shelf Generic Enterprise SaaS",
      cost: 2,
      speed: 4,
      control: 2,
      fit: 2,
      verdict: "Rejected",
      rationale: "Rigid database schemas, high annual recurring licenses, and inability to automate niche edge-cases.",
    },
  ];
}

function generateDomainSolutionFallback(
  problem: string,
  businessName: string,
  industry: string
): SolutionGenerationResult {
  const p = (problem || "").toLowerCase();

  // 1. Healthcare / Clinical / Diagnostics
  if (p.includes("health") || p.includes("clinic") || p.includes("patient") || p.includes("lab") || p.includes("sample")) {
    return {
      source: "domain-heuristic",
      modelUsed: "BizzMitra Clinical Intelligence Engine",
      framing: {
        statement: `${businessName} experiences diagnostic turnaround delays, fragmented EHR interoperability, and manual sample tracking overhead, creating patient wait times and high staff compliance burden.`,
        impact: [
          { metric: "Automatable Lab Orders", value: "~74%" },
          { metric: "Sample Tracking Latency", value: "-62%" },
          { metric: "First Report Turnaround", value: "3.2 hrs" },
          { metric: "Patient Retention Lift", value: "+28%" },
        ],
        rootCauses: [
          { title: "Isolated LIMS / EHR silos", detail: "Clinical data is entered manually between sample collectors and analyzers with no HL7/FHIR bridge." },
          { title: "Manual patient notifications", detail: "Phlebotomists and front desk staff manually call or SMS patients when test results are verified." },
          { title: "Paper-based specimen custody", detail: "Barcode chain-of-custody verification is missing during batch transportation." },
        ],
        constraints: [
          "HIPAA / NABL clinical data privacy compliance is non-negotiable.",
          "Must interface with existing legacy analyzer RS232 / TCP ports.",
          "Must function reliably on mobile tablets in remote collection centers.",
        ],
      },
      solution: {
        headline: "AI-Powered Clinical Diagnostics Hub & Automated Patient Dispatcher",
        summary: "A secure healthcare orchestration layer that synchronizes digital sample custody, automates analyzer result validation, and dispatches encrypted reports over verified WhatsApp channels.",
        pillars: [
          { title: "Specimen Intake & Barcode Engine", detail: "Scans and tracks specimen vials from patient draw to centrifuge with cryptographic audit timestamps." },
          { title: "HL7/FHIR Analyzer Connector", detail: "Bi-directional interface reading automated chemistry and hematology analyzers directly into cloud EHR." },
          { title: "Automated Report Dispatcher", detail: "Generates tamper-proof PDF diagnostic reports and delivers them to patients via verified WhatsApp and SMS." },
          { title: "Clinical Compliance Copilot", detail: "Monitors QC calibration deviations and alerts pathologists before anomalous test batches release." },
        ],
        tradeoffs: [
          { option: "Legacy Monolithic Hospital HIS Upgrade", verdict: "Rejected", why: "Prohibitive multi-crore expense and 12-month implementation timeline." },
          { option: "BizzMitra Clinical Workflow Hub (Recommended)", verdict: "Recommended", why: "6-week deployment, zero hardware lock-in, and 90% automation of specimen status updates." },
          { option: "Manual WhatsApp Dispatching", verdict: "Rejected", why: "Catastrophic privacy violation risk under healthcare regulations." },
        ],
        stack: [
          { layer: "Clinical Client App", choice: "React 19 + TypeScript + PWA", why: "Rapid phlebotomist tablet scanning and offline specimen intake." },
          { layer: "Analyzer Integration Gateway", choice: "HL7 / FHIR Edge Connector", why: "Real-time automated result extraction without manual technician typing." },
          { layer: "Compliance & Data Store", choice: "Supabase (HIPAA/NABL Compliant)", why: "End-to-end encrypted specimen audit logs and role-based pathologist access." },
          { layer: "Patient Dispatch Hub", choice: "Automated WhatsApp API Engine", why: "Instant delivery of password-protected diagnostic PDF reports." },
        ],
      },
      modules: [
        {
          key: "specimen-engine",
          name: "Smart Specimen Intake & Barcode Engine",
          description: "Digital phlebotomy intake with 2D barcode generation, temperature logging, and real-time transit tracking.",
          icon: "Building2",
          status: "Core",
          timeTag: "Invest",
          features: ["2D DataMatrix specimen labeling", "Transit chain-of-custody logs", "Analyzer rack mapping"],
        },
        {
          key: "analyzer-sync",
          name: "HL7 / FHIR Analyzer Integrator",
          description: "Universal analyzer gateway converting proprietary equipment output into normalized clinical JSON records.",
          icon: "BarChart3",
          status: "Core",
          timeTag: "Invest",
          features: ["Automated QC range checks", "Zero manual re-keying of values", "Pathologist electronic signature"],
        },
        {
          key: "patient-portal",
          name: "Encrypted Patient Report Dispatcher",
          description: "Self-serve portal and verified WhatsApp bot delivering downloadable password-protected diagnostic reports.",
          icon: "Users",
          status: "Recommended",
          timeTag: "Migrate",
          features: ["Instant WhatsApp delivery", "Historical trend analysis charts", "Doctor consultation booking link"],
        },
        {
          key: "legacy-logs",
          name: "Paper Register & Manual Phone Logging",
          description: "Physical handwriting of specimen batches and manual phone follow-ups.",
          icon: "Clock",
          status: "Optional",
          timeTag: "Eliminate",
          features: ["High transcription error risk", "Decommission in Phase 1", "Zero audit trail"],
        },
      ],
      buildBuyMatrix: getDomainBuildBuy("Healthcare & Diagnostics"),
    };
  }

  // 2. Logistics / Supply Chain / Solar / Field Ops
  if (p.includes("solar") || p.includes("delivery") || p.includes("logistics") || p.includes("fleet") || p.includes("supply")) {
    return {
      source: "domain-heuristic",
      modelUsed: "BizzMitra Field Intelligence Engine",
      framing: {
        statement: `${businessName} faces critical dispatch bottlenecks, uncoordinated field operations, and estimation inaccuracies that lead to delayed job completions, high fuel burn, and customer churn.`,
        impact: [
          { metric: "Field Job Completion Rate", value: "+44%" },
          { metric: "Average Estimation Time", value: "15 mins" },
          { metric: "Manual Dispatch Overhead", value: "-78%" },
          { metric: "Operational Cost Reduction", value: "24%" },
        ],
        rootCauses: [
          { title: "Disconnected field and office data", detail: "Site technicians record field measurements on paper or messaging chats, causing manual re-entry errors." },
          { title: "Permit and approval lag", detail: "Regulatory, utility, and municipal filings are tracked in static spreadsheets without automated alerts." },
          { title: "Static route scheduling", detail: "Dispatchers allocate jobs without dynamic geo-clustering or technician skill-matching." },
        ],
        constraints: [
          "Technicians operate in intermittent offline connectivity zones.",
          "Must export formal engineering and regulatory compliance documentation.",
          "Initial rollout within 4 to 6 weeks.",
        ],
      },
      solution: {
        headline: "Dynamic Field Operations & Automated Telemetry Hub",
        summary: "An integrated operations platform providing instant site assessment, algorithmic dispatching, automated regulatory submission tracking, and customer milestone notifications.",
        pillars: [
          { title: "Geo-Spatial Assessment Engine", detail: "Converts site photos and specs into accurate structural blueprints and component bill-of-materials." },
          { title: "Algorithmic Dispatch Hub", detail: "Matches field crews by proximity, equipment inventory, and skill certifications." },
          { title: "Milestone & Permit Tracker", detail: "Monitors utility interconnection and permit filings with predictive SLA deadline alerts." },
          { title: "Offline-First Mobile PWA", detail: "Enables field teams to capture photos, checklists, and customer signatures even with zero cell service." },
        ],
        tradeoffs: [
          { option: "Off-the-shelf Field Management SaaS", verdict: "Rejected", why: "Lacks specialized engineering calculations and charges steep per-seat licenses." },
          { option: "BizzMitra Intelligent Field Suite (Recommended)", verdict: "Recommended", why: "Full offline-mode support, automated BOM generation, and rapid 6-week delivery." },
          { option: "Manual Google Sheet Trackers", verdict: "Rejected", why: "Source of 80% of project scheduling conflicts and delayed billings." },
        ],
        stack: [
          { layer: "Technician Field App", choice: "React 19 + Offline SQLite PWA", why: "Uninterrupted site assessment with zero cell coverage." },
          { layer: "Geo-Spatial & BOM Engine", choice: "Node Microservices + GeoJSON", why: "Accurate rooftop bill-of-materials calculations." },
          { layer: "Permit & Workflow Database", choice: "Supabase (PostgreSQL 15)", why: "State machine tracking municipality and utility approval SLAs." },
          { layer: "Executive Analytics", choice: "Real-time Telemetry Dashboard", why: "Fleet dispatch tracking and installation cycle time monitoring." },
        ],
      },
      modules: [
        {
          key: "dispatch-engine",
          name: "Algorithmic Crew Dispatcher",
          description: "Smart scheduling matrix that assigns field technicians based on real-time GPS locations and equipment readiness.",
          icon: "Users",
          status: "Core",
          timeTag: "Invest",
          features: ["Dynamic geo-fenced assignments", "Automated route optimization", "Equipment inventory verification"],
        },
        {
          key: "field-pwa",
          name: "Offline Field Execution App",
          description: "Mobile app for technicians to complete standardized digital checklists, capture site photos, and record customer sign-off.",
          icon: "Building2",
          status: "Core",
          timeTag: "Invest",
          features: ["Offline SQLite data sync", "Digital signature capture", "Automated photo geotagging"],
        },
        {
          key: "permit-portal",
          name: "Regulatory & Utility Permit Hub",
          description: "Centralized compliance pipeline tracking municipality approvals, utility interconnection, and subsidy disbursements.",
          icon: "BarChart3",
          status: "Recommended",
          timeTag: "Migrate",
          features: ["SLA countdown timers", "Document auto-generation", "Automated escalation alerts"],
        },
        {
          key: "legacy-chat",
          name: "Ad-hoc WhatsApp Group Coordination",
          description: "Unstructured chat messages for sharing job photos and addresses.",
          icon: "Clock",
          status: "Optional",
          timeTag: "Eliminate",
          features: ["Zero searchable history", "High data leakage risk", "Phase 1 decommissioning"],
        },
      ],
      buildBuyMatrix: getDomainBuildBuy("Field Services & Logistics"),
    };
  }

  // 3. General Enterprise Business Default
  return {
    source: "domain-heuristic",
    modelUsed: "BizzMitra Enterprise Strategy Engine",
    framing: {
      statement: `${businessName} experiences operational throughput friction, fragmented data silos, and manual process drop-offs, limiting customer satisfaction and scalability.`,
      impact: [
        { metric: "Process Automation Potential", value: "72%" },
        { metric: "Turnaround Time Reduction", value: "-58%" },
        { metric: "Data Re-entry Elimination", value: "95%" },
        { metric: "Projected Annual ROI", value: "3.8x" },
      ],
      rootCauses: [
        { title: "Manual intake and data handling", detail: "Customer requests require multiple human reviews before entering core execution pipelines." },
        { title: "Fragmented software silos", detail: "Customer records, communications, and reporting live in isolated systems." },
        { title: "Lack of real-time visibility", detail: "Management and clients lack transparent milestone tracking dashboards." },
      ],
      constraints: [
        "Must integrate with existing legacy enterprise data sources.",
        "Strict role-based access control and security compliance.",
        "Fast 6-week delivery roadmap.",
      ],
    },
    solution: {
      headline: `Intelligent Operations Platform for ${businessName}`,
      summary: "A unified cloud architecture connecting client self-service intake, automated workflow orchestration, and real-time executive analytics.",
      pillars: [
        { title: "Self-Service Intake & Triage", detail: "Captures verified client requirements and validates input data automatically at intake." },
        { title: "Workflow Automation Core", detail: "Eliminates repetitive handoffs through deterministic event-driven rules and AI copilots." },
        { title: "Client Visibility Portal", detail: "Provides real-time transparent progress tracking, document exchange, and approvals." },
        { title: "Executive Decision Analytics", detail: "Surfaces operational bottlenecks, resource utilization, and revenue forecasting." },
      ],
      tradeoffs: [
        { option: "Rigid Enterprise Suite", verdict: "Rejected", why: "Extensive licensing costs and multi-quarter deployment delay." },
        { option: "BizzMitra Custom Cloud Platform (Recommended)", verdict: "Recommended", why: "Rapid time-to-market, custom workflow alignment, and high agility." },
        { option: "Spreadsheets & Ad-hoc Tools", verdict: "Rejected", why: "Inability to scale and frequent data inconsistencies." },
      ],
      stack: [
        { layer: "Presentation & Workable Layer", choice: "React 19 + TypeScript + Tailwind CSS", why: "Modern enterprise UX with zero latency." },
        { layer: "API & Workflow Orchestration", choice: "Cloud-Native Microservices", why: "Automates multi-step event triggers and task allocations." },
        { layer: "Database & Security", choice: "Supabase (PostgreSQL 15)", why: "Enterprise grade RLS, audit trail, and instant GraphQL/REST." },
        { layer: "AI Copilot Engine", choice: "Groq 120B High-Throughput Inference", why: "Rapid document extraction and deterministic decision recommendations." },
      ],
    },
    modules: [
      {
        key: "intake-core",
        name: "Intelligent Intake & Validation Hub",
        description: "Automates customer request capture, data extraction, and routing.",
        icon: "Users",
        status: "Core",
        timeTag: "Invest",
        features: ["Smart forms", "Instant validation", "Zero manual entry"],
      },
      {
        key: "workflow-engine",
        name: "Operational Orchestration Engine",
        description: "Automates multi-stage approvals, task assignments, and notifications.",
        icon: "Building2",
        status: "Core",
        timeTag: "Invest",
        features: ["Role-based workflows", "Automated reminders", "Audit logging"],
      },
      {
        key: "analytics-suite",
        name: "Executive Visibility & SLA Dashboard",
        description: "Real-time metrics, bottleneck alerts, and performance trends.",
        icon: "BarChart3",
        status: "Recommended",
        timeTag: "Migrate",
        features: ["Live KPI monitoring", "SLA tracking", "Custom export"],
      },
      {
        key: "legacy-spreadsheets",
        name: "Disconnected Spreadsheets & Manual Logs",
        description: "Manual tracking files with no multi-user concurrency or auditability.",
        icon: "Clock",
        status: "Optional",
        timeTag: "Eliminate",
        features: ["Data fragmentation", "Error prone", "Decommission scheduled"],
      },
    ],
    buildBuyMatrix: getDomainBuildBuy(industry),
  };
}
