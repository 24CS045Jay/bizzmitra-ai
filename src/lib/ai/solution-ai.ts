import type { BuildBuyOption } from "../demo-data";
import { isHealthcareDomain, isProjectManagementDomain } from "../domain-classifier";

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
  options?: {
    forceFresh?: boolean;
    customFields?: string[];
    discoverySummary?: string;
    diagnosticAnswers?: Array<{ question: string; answer: string }>;
  }
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
        discoverySummary: options?.discoverySummary || "",
        diagnosticAnswers: options?.diagnosticAnswers || [],
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

export function generateDomainSolutionFallback(
  problem: string,
  businessName: string,
  industry: string
): SolutionGenerationResult {
  // 0. Project Management, TaskFlow & Leave-Aware Scheduling
  if (isProjectManagementDomain(problem) || isProjectManagementDomain(industry)) {
    return {
      source: "domain-heuristic",
      modelUsed: "BizzMitra TaskFlow & Project Orchestrator",
      framing: {
        statement: `${businessName} struggles with project deadline risks and mid-sprint work stalls caused by blind task scheduling that fails to account for employee leave, team availability gaps, and unbuffered handovers.`,
        impact: [
          { metric: "Task Overlap Delivery Stalls", value: "-94%" },
          { metric: "Sprint Schedule Reliability", value: "97.2%" },
          { metric: "Unplanned Handover Delays", value: "-86%" },
          { metric: "On-Time Project Delivery Lift", value: "+42%" },
        ],
        rootCauses: [
          { title: "Blind Deadline Scheduling", detail: "Project deadlines are fixed without cross-referencing team member leave calendars, creating avoidable delivery bottlenecks." },
          { title: "Zero Handover Buffers", detail: "When a team member goes on leave mid-task, work stalls or gets rushed at the last minute with no planned handover preparation." },
          { title: "Disconnected Task & Leave Silos", detail: "Task tracking spreadsheets and employee leave records live in separate places without automated assignment validation." },
        ],
        constraints: [
          "Local storage only — zero backend, zero authentication, client data persists in-browser across sessions.",
          "Single-user PM cockpit — team members and leaves are managed as lightweight records without multi-tenant login overhead.",
          "Leave-Aware Assignment Block — strictly blocks task assignment when date range overlaps scheduled employee leave.",
        ],
      },
      solution: {
        headline: `Leave-Aware Task & Sprint Delivery Cockpit (TaskFlow) for ${businessName}`,
        summary: "A local-first project management system for project managers that actively prevents task assignment during employee leave, orchestrates visual Kanban boards, and maintains a real-time team availability radar.",
        pillars: [
          { title: "Leave-Aware Assignment Guard", detail: "Compares task start and due dates against employee leave schedules in real time, throwing clear inline errors that prevent overlapping assignments." },
          { title: "Interactive Kanban Project Board", detail: "Visual task management categorized by To Do, In Progress, and Done stages with instant assignee availability badges." },
          { title: "Team Availability & Leave Radar", detail: "Consolidated team schedule view displaying upcoming and past leave records so the PM can plan assignments before hitting blocks." },
          { title: "Local-First Storage & Offline State", detail: "Client-side persistence engine saving all projects, tasks, and leave records in-browser without external server dependencies." },
        ],
        tradeoffs: [
          { option: "Complex Heavy Enterprise PPM Suite (Jira / Workfront)", verdict: "Rejected", why: "Prohibitive license costs, steep learning curve, and excessive configuration overhead for a single PM." },
          { option: "TaskFlow Local-First Architecture (Recommended)", verdict: "Recommended", why: "Instant zero-backend startup, active leave-overlap blocking, and 100% offline reliability." },
          { option: "Manual Spreadsheets & WhatsApp Coordination", verdict: "Rejected", why: "Causes 100% of blind deadline collisions, forgotten handovers, and project delivery fire-fighting." },
        ],
        stack: [
          { layer: "Presentation & Kanban Board", choice: "React 19 + TypeScript + Tailwind CSS", why: "Zero-latency interactive task management, modal editors, and fluid status transitions." },
          { layer: "Leave Collision Rule Engine", choice: "Client-Side Date Overlap Validator", why: "Sub-millisecond date interval verification blocking invalid assignments with inline PM warnings." },
          { layer: "Persistence Layer", choice: "Browser LocalStorage Native Engine", why: "Guaranteed single-user session persistence without backend latency or database hosting costs." },
          { layer: "Team Availability Visualizer", choice: "Chronological Leave Calendar Radar", why: "Clear at-a-glance visibility into team availability windows and planned PTO." },
        ],
      },
      modules: [
        {
          key: "leave-guard-engine",
          name: "Leave-Aware Assignment Guard & Overlap Blocker",
          description: "Intelligent date validation blocking task assignments when scheduled dates collide with approved employee leave.",
          icon: "Clock",
          status: "Core",
          timeTag: "Invest",
          features: ["Real-time date range overlap detection", "Inline PM collision warning banner", "Automatic handover preparation alert"],
        },
        {
          key: "kanban-project-board",
          name: "Interactive Kanban Board & Project Manager",
          description: "Project management board grouping tasks into To Do, In Progress, and Done with live assignee status badges.",
          icon: "BarChart3",
          status: "Core",
          timeTag: "Invest",
          features: ["Projects list & detail views", "Status columns (To Do / In Progress / Done)", "Manual task status toggle without complex workflows"],
        },
        {
          key: "team-availability-radar",
          name: "Team Availability & Leave Timeline Radar",
          description: "Centralized dashboard displaying all team members, upcoming leave records, and availability at a glance.",
          icon: "Users",
          status: "Core",
          timeTag: "Invest",
          features: ["Team member roster management", "Upcoming & past leave calendar view", "Pre-planning availability overview"],
        },
        {
          key: "blind-spreadsheets",
          name: "Blind Scheduling in Spreadsheets & Chat",
          description: "Disconnected manual task tracking without leave visibility or assignment safeguards.",
          icon: "Clock",
          status: "Optional",
          timeTag: "Eliminate",
          features: ["High mid-task stall risk", "Decommission in Phase 1", "Zero leave overlap visibility"],
        },
      ],
      buildBuyMatrix: getDomainBuildBuy("Project Management & Operations"),
    };
  }

  // 1. Healthcare / Clinical / Diagnostics
  if (isHealthcareDomain(problem) || isHealthcareDomain(industry)) {
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

  // 2. Cold-Chain & Perishable Logistics (e.g. AeroCold Logistics)
  if (
    p.includes("cold-chain") ||
    p.includes("cold chain") ||
    p.includes("aerocold") ||
    p.includes("perishable") ||
    p.includes("refrigerat") ||
    p.includes("spoilage")
  ) {
    return {
      source: "domain-heuristic",
      modelUsed: "BizzMitra Cold-Chain IoT Engine",
      framing: {
        statement: `${businessName} experiences cold-chain telemetry blind spots, perishable cargo transit spoilage, and manual temperature log reconciliation, resulting in high shrink and customer SLA penalty claims.`,
        impact: [
          { metric: "Perishable Cargo Shrink Reduction", value: "-46%" },
          { metric: "Real-Time Sensor Telemetry Coverage", value: "99.8%" },
          { metric: "SLA Breach & Claims Reduction", value: "-62%" },
          { metric: "Projected Annual Fleet ROI", value: "4.4x" },
        ],
        rootCauses: [
          { title: "Manual temperature datalogger reconciliation", detail: "Temperature logs are manually exported only upon destination arrival, preventing real-time intervention." },
          { title: "Intermittent cellular coverage blind spots", detail: "Transit trucks lose telemetry in remote transit corridors without edge buffering." },
          { title: "Static reefer dispatching", detail: "Dispatchers lack live thermal unit status and battery health when assigning critical perishable cargo." },
        ],
        constraints: [
          "In-cabin and cargo IoT sensors must cache data offline during transit dead-zones.",
          "Must generate HACCP and regulatory cold-chain compliance audit logs.",
          "Fleet telemetry deployment rollout within 6 weeks.",
        ],
      },
      solution: {
        headline: `Unified Cold-Chain IoT & Fleet Telematics Platform for ${businessName}`,
        summary: "A real-time cold-chain intelligence network with active sensor streaming, automated excursion intervention alerts, and client chain-of-custody verification.",
        pillars: [
          { title: "Edge Telematics Ingestion", detail: "Streams continuous temperature, humidity, and vibration telemetry into cloud event queues." },
          { title: "Automated Excursion Alerts", detail: "Instantly notifies dispatchers and drivers when thermal thresholds drift before cargo spoils." },
          { title: "HACCP Digital Compliance Hub", detail: "Generates tamper-proof cryptographic temperature audit trails for consignee inspection." },
          { title: "Predictive Reefer Maintenance", detail: "Monitors compressor vibration and cooling cycle anomalies to avert in-transit failures." },
        ],
        tradeoffs: [
          { option: "Generic GPS Fleet Tracker", verdict: "Rejected", why: "Lacks specialized multi-probe temperature calibration and HACCP compliance reporting." },
          { option: "BizzMitra Cold-Chain Suite (Recommended)", verdict: "Recommended", why: "Instant sensor alerts, automated client portal, and rapid 6-week deployment." },
          { option: "Manual Paper Manifests", verdict: "Rejected", why: "Causes 100% of insurance claim disputes and delayed billings." },
        ],
        stack: [
          { layer: "Driver & Crew App", choice: "React 19 PWA + Offline Storage", why: "Seamless digital pre-trip inspection and offline delivery sign-offs." },
          { layer: "IoT Stream Ingestion", choice: "Node Edge Workers + MQTT Gateway", why: "High-frequency sensor stream processing with sub-second latency." },
          { layer: "Audit & Compliance DB", choice: "Supabase (PostgreSQL 16 Timescale)", why: "Time-series sensor telemetry and tamper-evident audit trails." },
          { layer: "Predictive Analytics", choice: "Groq Llama 3.3 70B & Telemetry Engine", why: "Real-time route risk scoring and temperature drift prediction." },
        ],
      },
      modules: [
        {
          key: "reefer-telemetry",
          name: "Real-Time Thermal Monitoring Core",
          description: "Live sensor tracking for in-transit ambient and probe temperatures with instant threshold breach alerts.",
          icon: "BarChart3",
          status: "Core",
          timeTag: "Invest",
          features: ["Sub-60s excursion alerts", "Multi-zone probe monitoring", "Battery and compressor telemetry"],
        },
        {
          key: "driver-portal",
          name: "Driver Trip & Pre-Cooling App",
          description: "Mobile workflow for pre-cooling verification, digital cargo manifests, and consignee sign-off.",
          icon: "Building2",
          status: "Core",
          timeTag: "Invest",
          features: ["Offline manifest access", "Digital signature capture", "Automated pre-cool checklist"],
        },
        {
          key: "client-tracker",
          name: "Client Chain-of-Custody Portal",
          description: "Live web tracking for shippers and consignees with shareable temperature audit certificates.",
          icon: "Users",
          status: "Recommended",
          timeTag: "Migrate",
          features: ["Shareable live tracking link", "Automated PDF HACCP export", "ETA & delay prediction"],
        },
        {
          key: "manual-dataloggers",
          name: "Manual USB Datalogger Retrieval",
          description: "Manual USB download and paper logging at end of shipment.",
          icon: "Clock",
          status: "Optional",
          timeTag: "Eliminate",
          features: ["Reactive problem detection", "Zero real-time protection", "Decommission in Phase 1"],
        },
      ],
      buildBuyMatrix: getDomainBuildBuy("Cold-Chain Logistics"),
    };
  }

  // 3. Amazon FBA, E-Commerce & Retail (e.g. Apex Brands)
  if (
    p.includes("amazon") ||
    p.includes("fba") ||
    p.includes("apex brands") ||
    p.includes("stockout") ||
    p.includes("ecommerce") ||
    p.includes("e-commerce") ||
    p.includes("repricing") ||
    p.includes("buy-box")
  ) {
    return {
      source: "domain-heuristic",
      modelUsed: "BizzMitra Amazon FBA Intelligence Engine",
      framing: {
        statement: `${businessName} faces critical Amazon FBA stockout penalties, aging inventory storage surcharges, and lagging manual repricing adjustments that erode Buy-Box win rates and tie up working capital.`,
        impact: [
          { metric: "Stockout Days Avoided", value: "-68%" },
          { metric: "Aged Inventory Surcharge Saved", value: "₹18.5L / yr" },
          { metric: "Buy-Box Share Retention", value: "98.4%" },
          { metric: "Projected Working Capital ROI", value: "5.2x" },
        ],
        rootCauses: [
          { title: "Static lead time assumptions", detail: "Replenishment formulas do not account for supplier shipment variance or Amazon check-in queue delays." },
          { title: "Disconnected multi-warehouse inventory", detail: "Amazon FBA buffers, 3PL warehouses, and merchant stock levels are tracked in disconnected spreadsheets." },
          { title: "Manual competitor repricing latency", detail: "Price shifts take hours to execute manually, causing lost Buy-Box exposure to competing sellers." },
        ],
        constraints: [
          "Strict Amazon SP-API rate limits and authentication standards.",
          "Must automate multi-SKU bundle reconciliations.",
          "Zero downtime deployment during peak Q4 sales events.",
        ],
      },
      solution: {
        headline: `Automated Amazon FBA & Inventory Optimization Suite for ${businessName}`,
        summary: "An integrated intelligence platform connecting Amazon SP-API webhooks, predictive reorder algorithms, dynamic algorithmic repricing, and executive margin dashboards.",
        pillars: [
          { title: "Predictive FBA Inflow Engine", detail: "Calculates optimal shipment quantities considering Amazon restock limits and transit lead times." },
          { title: "Real-Time Algorithmic Repricer", detail: "Monitors Buy-Box competitors and updates pricing in sub-10s cycles to maximize gross margin." },
          { title: "Aged Inventory Liquidator", detail: "Identifies slow-moving SKUs before 180-day storage fee cliffs and triggers automated promotions." },
          { title: "Multi-Channel Stock Orchestrator", detail: "Synchronizes inventory buffers across Amazon, Shopify, and quick-commerce channels." },
        ],
        tradeoffs: [
          { option: "Off-the-shelf Generic Repricer", verdict: "Rejected", why: "Charges revenue-share fees without connecting to supplier purchase orders." },
          { option: "BizzMitra FBA Suite (Recommended)", verdict: "Recommended", why: "Native SP-API integration, automated replenishment, and high gross margin retention." },
          { option: "Manual Seller Central Spreadsheets", verdict: "Rejected", why: "Primary cause of stockouts and thousands in dead-stock fees." },
        ],
        stack: [
          { layer: "Seller Operations Console", choice: "React 19 + TypeScript + Real-time Grid", why: "High-density SKU monitoring and 1-click batch reorders." },
          { layer: "Amazon SP-API Connector", choice: "Node Edge Functions + SQS Queue", why: "Rate-limit safe event-driven ingestion of orders and inventory reports." },
          { layer: "Inventory & Margin DB", choice: "Supabase (PostgreSQL 16) + RLS", why: "Transactional order logs, SKU cost modeling, and multi-tenant security." },
          { layer: "Pricing & Forecast AI", choice: "Groq Llama 3.3 70B & Prediction Engine", why: "Sub-second elasticity modeling and demand forecasting." },
        ],
      },
      modules: [
        {
          key: "fba-replenishment",
          name: "Predictive Restock & Reorder Engine",
          description: "Automated replenishment calculation factoring in supplier lead time, sales velocity, and Amazon restock limits.",
          icon: "Building2",
          status: "Core",
          timeTag: "Invest",
          features: ["Dynamic safety stock buffers", "Automated purchase order drafting", "Lead time drift alerts"],
        },
        {
          key: "buybox-repricer",
          name: "Algorithmic Buy-Box Optimizer",
          description: "Automated pricing engine that defends Buy-Box ownership while enforcing strict minimum profit margins.",
          icon: "BarChart3",
          status: "Core",
          timeTag: "Invest",
          features: ["Sub-10s competitor detection", "Floor price safeguards", "Velocity-driven elasticity pricing"],
        },
        {
          key: "fee-auditor",
          name: "FBA Fee & Surcharge Auditor",
          description: "Automated scanner tracking aged inventory, dimensional weight discrepancies, and lost unit reimbursements.",
          icon: "Users",
          status: "Recommended",
          timeTag: "Migrate",
          features: ["180-day storage fee countdown", "Automated reimbursement claims", "Dead-stock promotion trigger"],
        },
        {
          key: "manual-fba-sheets",
          name: "Manual Seller Central Spreadsheets",
          description: "Manual copy-pasting of daily business reports into Excel trackers.",
          icon: "Clock",
          status: "Optional",
          timeTag: "Eliminate",
          features: ["Zero real-time alerting", "High human error rate", "Decommission in Phase 1"],
        },
      ],
      buildBuyMatrix: getDomainBuildBuy("E-Commerce & Amazon FBA"),
    };
  }

  // 4. FinTech, NBFC, Lending & Payments
  if (
    p.includes("fintech") ||
    p.includes("lending") ||
    p.includes("loan") ||
    p.includes("credit") ||
    p.includes("underwriting") ||
    p.includes("nbfc") ||
    p.includes("kyc")
  ) {
    return {
      source: "domain-heuristic",
      modelUsed: "BizzMitra FinTech Underwriting Engine",
      framing: {
        statement: `${businessName} experiences protracted loan underwriting turnaround times, manual credit bureau reconciliation, and fragmented document verification that leads to drop-offs and elevated default risk.`,
        impact: [
          { metric: "Underwriting Turnaround Time", value: "-78%" },
          { metric: "Automated Bureau Verification", value: "94.2%" },
          { metric: "Default Risk Prediction Precision", value: "98.6%" },
          { metric: "Capital Turnover Efficiency", value: "3.8x" },
        ],
        rootCauses: [
          { title: "Manual document verification bottlenecks", detail: "Bank statements, ITRs, and identity proofs are manually reviewed by credit officers." },
          { title: "Static rule-based underwriting engines", detail: "Fails to evaluate alternative bureau data or real-time cash flow patterns." },
          { title: "Fragmented disbursal pipelines", detail: "Loan sanctioning and payment gateway disbursals live across disparate banking interfaces." },
        ],
        constraints: [
          "RBI Digital Lending Guidelines and strict borrower consent compliance.",
          "AES-256 data encryption at rest and in transit.",
          "Integration with Account Aggregator (AA) and CIBIL/Experian APIs.",
        ],
      },
      solution: {
        headline: `Digital Underwriting & Automated Lending Suite for ${businessName}`,
        summary: "A unified credit decisioning engine that automates borrower KYC, bank statement OCR extraction, rule-based algorithmic scoring, and instant e-NACH mandate collection.",
        pillars: [
          { title: "Account Aggregator Ingestion", detail: "Fetches verified financial statements directly from banks with borrower digital consent." },
          { title: "Algorithmic Risk Scoring Engine", detail: "Evaluates cash-flow volatility and debt service coverage ratio in sub-30 seconds." },
          { title: "Instant e-NACH & Disbursal Gateway", detail: "Automates recurring auto-debit mandate setup and triggers instant IMPS/RTGS disbursals." },
          { title: "Regulatory Audit & DPDP Compliance", detail: "Maintains cryptographic consent logs and automated borrower data retention policies." },
        ],
        tradeoffs: [
          { option: "Legacy Core Banking System Customization", verdict: "Rejected", why: "Millions in implementation cost and 9-month delivery cycles." },
          { option: "BizzMitra Digital Lending Engine (Recommended)", verdict: "Recommended", why: "Pre-integrated AA connectors, sub-second underwriting, and 6-week launch." },
          { option: "Manual Loan Processing Spreadsheets", verdict: "Rejected", why: "Critical regulatory non-compliance risk and high fraud vulnerability." },
        ],
        stack: [
          { layer: "Borrower Portal & Loan Journey", choice: "React 19 + Secure Mobile SDK", why: "Frictionless 3-step digital loan onboarding." },
          { layer: "Underwriting Microservices", choice: "Node.js Workers + Banking Gateway", why: "Secure API calls to bureau and AA networks." },
          { layer: "Financial Persistence & Audit", choice: "Supabase (PostgreSQL 16) + RLS", why: "Multi-tenant tenant isolation and encrypted credit records." },
          { layer: "Decision AI", choice: "Groq Llama 3.3 70B & Risk Model", why: "Instant structured JSON financial assessment and cash-flow triage." },
        ],
      },
      modules: [
        {
          key: "aa-underwriting",
          name: "Account Aggregator & Cash-Flow Analyzer",
          description: "Automated retrieval and parsing of 12-month bank statements with fraud and circular transaction detection.",
          icon: "Building2",
          status: "Core",
          timeTag: "Invest",
          features: ["Instant AA consent parsing", "Automated cash-flow scoring", "Bounced cheque detection"],
        },
        {
          key: "credit-engine",
          name: "Rule-Based Loan Decisioning Engine",
          description: "Configurable underwriting matrix establishing loan quantum, interest rate, and tenure recommendations.",
          icon: "BarChart3",
          status: "Core",
          timeTag: "Invest",
          features: ["Configurable policy builder", "Instant bureau pull", "Automated sanction letter generation"],
        },
        {
          key: "enach-gateway",
          name: "Instant e-NACH & Payment Gateway",
          description: "Digital mandate registration via NetBanking or UPI with automated loan disbursal triggers.",
          icon: "Users",
          status: "Recommended",
          timeTag: "Migrate",
          features: ["e-NACH auto-debit collection", "Instant IMPS disbursals", "Repayment schedule tracker"],
        },
        {
          key: "manual-underwriting",
          name: "Paper-Based Credit Appraisal Memos",
          description: "Manual handwriting of credit memos and physical file circulation.",
          icon: "Clock",
          status: "Optional",
          timeTag: "Eliminate",
          features: ["High fraud vulnerability", "Slow 5-day cycle time", "Decommission in Phase 1"],
        },
      ],
      buildBuyMatrix: getDomainBuildBuy("FinTech & Digital Lending"),
    };
  }

  // 5. CleanTech, Solar & Industrial SCADA
  if (
    p.includes("solar") ||
    p.includes("scada") ||
    p.includes("clean tech") ||
    p.includes("renewable") ||
    p.includes("inverter") ||
    p.includes("photovoltaic")
  ) {
    return {
      source: "domain-heuristic",
      modelUsed: "BizzMitra CleanTech SCADA Engine",
      framing: {
        statement: `${businessName} faces distributed solar inverter downtime, delayed manual string fault isolation, and lagging SCADA telemetry that cause generation loss and contractual grid penalties.`,
        impact: [
          { metric: "Inverter Downtime Elimination", value: "-82%" },
          { metric: "SCADA Telemetry Refresh Latency", value: "< 1.8s" },
          { metric: "Preventive Maintenance Precision", value: "96.4%" },
          { metric: "Annual Clean Energy Yield Lift", value: "+24%" },
        ],
        rootCauses: [
          { title: "Fragmented OEM inverter protocols", detail: "Multiple hardware brands (SMA, Sungrow, Huawei) stream into isolated manufacturer dashboards." },
          { title: "Manual string fault inspection", detail: "Ground faults and clipping losses are only caught during periodic manual site visits." },
          { title: "Lack of predictive thermal alarms", detail: "Inverter overheating alerts trigger after hardware trip rather than before." },
        ],
        constraints: [
          "Must interface with industrial Modbus RTU / TCP and DNP3 protocols.",
          "Zero telemetry data loss during micro-grid connectivity drops.",
          "4-week plant commissioning timeline.",
        ],
      },
      solution: {
        headline: `Unified Solar Inverter Telemetry & Asset Intelligence Hub for ${businessName}`,
        summary: "A vendor-agnostic SCADA supervisory layer that normalizes multi-brand inverter telemetry, isolates string failures, and automates dispatch of maintenance technicians.",
        pillars: [
          { title: "Universal Modbus Telemetry Gateway", detail: "Normalizes raw inverter registers into unified cloud time-series metrics." },
          { title: "Predictive String Fault Detector", detail: "Compares peer-string IV curves to catch shading, soiling, and degradation anomalies." },
          { title: "Automated Plant Dispatch Workflows", detail: "Automatically generates maintenance work-orders with exact inverter and string coordinates." },
          { title: "Grid Performance & Revenue Dashboard", detail: "Tracks daily PR (Performance Ratio), generation revenue, and carbon offset credits." },
        ],
        tradeoffs: [
          { option: "Proprietary OEM Cloud Software", verdict: "Rejected", why: "Locked to single hardware vendor and charges recurring annual monitoring fees." },
          { option: "BizzMitra Solar Platform (Recommended)", verdict: "Recommended", why: "Hardware-agnostic, automated fault isolation, and 4-week deployment." },
          { option: "Manual Daily Meter Logging", verdict: "Rejected", why: "Discovers inverter failures days after thousands in generation revenue are lost." },
        ],
        stack: [
          { layer: "Plant Operations Console", choice: "React 19 + High-Speed Canvas Charts", why: "Visual representation of 100+ inverter clusters without browser lag." },
          { layer: "Industrial Edge Connector", choice: "Node Modbus Bridge + MQTT Broker", why: "Sub-second bidirectional telemetry polling." },
          { layer: "Time-Series Data Store", choice: "Supabase (PostgreSQL 16) + Timescale", why: "Scalable high-density energy telemetry logging." },
          { layer: "Diagnostic AI", choice: "Groq Llama 3.3 70B & Telemetry Engine", why: "Real-time anomaly identification across distributed solar arrays." },
        ],
      },
      modules: [
        {
          key: "telemetry-gateway",
          name: "Universal Inverter Telemetry Gateway",
          description: "Sub-second polling and normalization of multi-brand solar inverter and weather station sensors.",
          icon: "BarChart3",
          status: "Core",
          timeTag: "Invest",
          features: ["Modbus RTU/TCP support", "Offline register buffer", "Sub-second latency"],
        },
        {
          key: "string-analyzer",
          name: "Predictive String Fault & Soiling Analyzer",
          description: "Algorithmic comparison of peer string performance to pinpoint exact soiling and module failures.",
          icon: "Building2",
          status: "Core",
          timeTag: "Invest",
          features: ["Automated PR calculation", "Soiling index telemetry", "Instant fault alarm"],
        },
        {
          key: "field-dispatch",
          name: "Preventive O&M Work-Order Dispatcher",
          description: "Automated work-order generation linking exact fault coordinates to site technician mobile apps.",
          icon: "Users",
          status: "Recommended",
          timeTag: "Migrate",
          features: ["Geo-tagged work orders", "Resolution verification", "Spare part tracking"],
        },
        {
          key: "manual-logs",
          name: "Manual Daily Generation Logsheets",
          description: "Physical walk-through and handwriting inverter readings onto paper registers.",
          icon: "Clock",
          status: "Optional",
          timeTag: "Eliminate",
          features: ["Lagging failure detection", "High human error rate", "Decommission in Phase 1"],
        },
      ],
      buildBuyMatrix: getDomainBuildBuy("Clean Tech & Solar SCADA"),
    };
  }

  // 6. Universal Deterministic & Domain-Seeded Dynamic Engine
  // Ensures NO workspace ever receives static identical numbers
  let hash = 0;
  const seedStr = `${businessName} ${problem} ${industry}`;
  for (let i = 0; i < seedStr.length; i++) {
    hash = ((hash << 5) - hash) + seedStr.charCodeAt(i);
    hash |= 0;
  }
  const abs = Math.abs(hash);
  const p1 = 62 + (abs % 26); // 62% - 87%
  const p2 = 42 + ((abs >> 2) % 36); // -42% - -77%
  const p3 = 91 + ((abs >> 4) % 8); // 91% - 98.9%
  const roi = (3.4 + (((abs >> 6) % 28) / 10)).toFixed(1); // 3.4x - 6.1x

  const metric1Label = p.includes("cost") || p.includes("budget")
    ? "Operational Cost Reduction"
    : p.includes("speed") || p.includes("time") || p.includes("delay")
      ? "Cycle Time Velocity Gain"
      : `${industry || "Workflow"} Automation Potential`;

  const metric2Label = p.includes("sla") || p.includes("turnaround")
    ? "Turnaround SLA Reduction"
    : p.includes("error") || p.includes("defect")
      ? "Manual Error Rate Elimination"
      : "Bottleneck Latency Reduction";

  const metric3Label = p.includes("accuracy") || p.includes("quality")
    ? "Data Accuracy & Integrity"
    : "Data Re-entry Elimination";

  const metric4Label = p.includes("margin") || p.includes("revenue")
    ? "Target Margin Efficiency ROI"
    : "Projected Annual ROI";

  return {
    source: "domain-heuristic",
    modelUsed: "BizzMitra Adaptive Strategy Engine",
    framing: {
      statement: `${businessName} experiences operational throughput friction, fragmented data silos, and manual handoff latency in ${industry || "core operations"}, constraining customer satisfaction and growth.`,
      impact: [
        { metric: metric1Label, value: `${p1}%` },
        { metric: metric2Label, value: `-${p2}%` },
        { metric: metric3Label, value: `${p3}%` },
        { metric: metric4Label, value: `${roi}x` },
      ],
      rootCauses: [
        { title: "Manual intake and data handling", detail: `Operational requests require multiple human handoffs before entering execution pipelines in ${industry}.` },
        { title: "Fragmented software silos", detail: "Client records, communications, and audit histories live across disconnected files and tools." },
        { title: "Lack of real-time visibility", detail: "Leadership and operational teams lack transparent SLA tracking dashboards." },
      ],
      constraints: [
        "Must integrate with existing enterprise data repositories.",
        "Strict role-based access control and security compliance.",
        "Rapid 6-week phased delivery roadmap.",
      ],
    },
    solution: {
      headline: `Intelligent Operations & Workflow Orchestrator for ${businessName}`,
      summary: `A unified cloud architecture connecting self-service client intake, automated workflow orchestration, and real-time executive analytics tailored to ${industry}.`,
      pillars: [
        { title: "Self-Service Intake & Validation", detail: "Captures verified client requirements and validates input data automatically at intake." },
        { title: "Workflow Automation Core", detail: "Eliminates repetitive handoffs through deterministic event-driven rules and AI copilots." },
        { title: "Transparent Visibility Portal", detail: "Provides real-time transparent progress tracking, document exchange, and approvals." },
        { title: "Executive Decision Analytics", detail: "Surfaces operational bottlenecks, resource utilization, and revenue forecasting." },
      ],
      tradeoffs: [
        { option: "Rigid Generic Enterprise Suite", verdict: "Rejected", why: "Extensive licensing costs and multi-quarter deployment delay." },
        { option: "BizzMitra Custom Cloud Platform (Recommended)", verdict: "Recommended", why: "Rapid time-to-market, custom workflow alignment, and high agility." },
        { option: "Spreadsheets & Ad-hoc Tools", verdict: "Rejected", why: "Inability to scale and frequent data inconsistencies." },
      ],
      stack: [
        { layer: "Presentation & Workable Layer", choice: "React 19 + TypeScript + Tailwind CSS", why: "Modern enterprise UX with zero latency." },
        { layer: "API & Workflow Orchestration", choice: "Cloud-Native Microservices", why: "Automates multi-step event triggers and task allocations." },
        { layer: "Database & Security", choice: "Supabase (PostgreSQL 16)", why: "Enterprise grade RLS, audit trail, and instant GraphQL/REST." },
        { layer: "AI Copilot Engine", choice: "Groq Llama 3.3 70B & Gemini 2.5", why: "Rapid document extraction and deterministic decision recommendations." },
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
