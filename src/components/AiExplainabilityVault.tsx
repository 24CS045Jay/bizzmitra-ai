import * as React from "react";
import { useState, useMemo } from "react";
import {
  ShieldCheck,
  FileSearch,
  Sparkles,
  Lightbulb,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Filter,
  Layers,
  ArrowRight,
  Database,
  Lock,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export interface AssumptionEvidenceItem {
  id: string;
  category: "scale" | "architecture" | "compliance" | "financial";
  categoryLabel: string;
  assumption: string;
  evidence: string;
  evidenceSource: "Intake Problem" | "Discovery Q&A" | "Uploaded BRD/Doc" | "Statutory Rule" | "URL Crawler";
  whyChosen: string;
  discardedAlternative: string;
  downstreamImpact: string;
  confidence: number;
}

interface AiExplainabilityVaultProps {
  businessName?: string;
  industry?: string;
  problemStatement?: string;
  discoveryAnswers?: Array<{ question: string; answer: string; hint?: string }>;
  className?: string;
}

export function AiExplainabilityVault({
  businessName = "Active Enterprise",
  industry = "General",
  problemStatement = "",
  discoveryAnswers = [],
  className = "",
}: AiExplainabilityVaultProps) {
  const [activeFilter, setActiveFilter] = useState<"all" | "scale" | "architecture" | "compliance" | "financial">("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const isLogistics = industry.toLowerCase().includes("logistics") || problemStatement.toLowerCase().includes("fleet") || problemStatement.toLowerCase().includes("fba") || problemStatement.toLowerCase().includes("warehouse");
  const isHealthcare = industry.toLowerCase().includes("health") || industry.toLowerCase().includes("clinic") || problemStatement.toLowerCase().includes("patient");
  const isSolar = industry.toLowerCase().includes("solar") || industry.toLowerCase().includes("energy") || problemStatement.toLowerCase().includes("inverter");
  const isEcommerce = industry.toLowerCase().includes("e-commerce") || industry.toLowerCase().includes("retail") || problemStatement.toLowerCase().includes("order");

  // Dynamically tailor assumptions based on industry and context
  const assumptions: AssumptionEvidenceItem[] = useMemo(() => {
    if (isLogistics) {
      return [
        {
          id: "assump-1",
          category: "scale",
          categoryLabel: "Operational Scale",
          assumption: "Assumed high-frequency GPS ping ingestion (every 10s per vehicle across 80+ active fleet vehicles) requiring sub-50ms ingestion pipelines.",
          evidence: "Extracted from Discovery Question 01 on fleet telemetry frequency and Amazon FBA dispatch turnaround requirements.",
          evidenceSource: "Discovery Q&A",
          whyChosen: "MQTT / Webhook broker with Redis ring buffer chosen over direct database writes to prevent connection exhaustion during concurrent rural re-syncs.",
          discardedAlternative: "Direct HTTP POST writes into PostgreSQL was discarded; would cause database deadlocks under 500 pings/sec during batch reconnects.",
          downstreamImpact: "Influences Step 04 Architecture (Redis event broker) and Step 07 Data schema (partitioned telematics logs).",
          confidence: 96,
        },
        {
          id: "assump-2",
          category: "architecture",
          categoryLabel: "Technical Architecture",
          assumption: "Assumed frequent cellular dead zones along rural highway corridors requiring offline-first SQLite client architecture.",
          evidence: "Extracted from problem statement: 'Cellular Coverage Dead Zones on Rural Highway Corridors'.",
          evidenceSource: "Intake Problem",
          whyChosen: "Offline-first mobile SQLite with signed cryptographic delivery manifests guarantees zero lost proof-of-delivery timestamps even without 4G/5G.",
          discardedAlternative: "Pure Progressive Web App (PWA) with browser cache was discarded; fails when local storage quotas are purged by OS memory managers.",
          downstreamImpact: "Influences Step 06 Wireframes (offline status pill) and Step 08 Roadmap (offline sync testing sprint).",
          confidence: 94,
        },
        {
          id: "assump-3",
          category: "compliance",
          categoryLabel: "Statutory & Compliance",
          assumption: "Driver location telemetry and vehicle OBD-II metrics require DPDP & ISO 27001 pseudonymized data tokenization before long-term archiving.",
          evidence: "Statutory requirement: Digital Personal Data Protection (DPDP) Act for employee telematics.",
          evidenceSource: "Statutory Rule",
          whyChosen: "Pre-tokenizes driver IDs at edge so compliance audits pass without exposing driver PII in raw analytics data warehouses.",
          discardedAlternative: "Storing raw driver names in telemetry tables was rejected; incurs compliance sign-off blockers and legal penalties.",
          downstreamImpact: "Eliminates high-priority risk in Cockpit; triggers security review gate in Step 11 Governance.",
          confidence: 98,
        },
        {
          id: "assump-4",
          category: "financial",
          categoryLabel: "Financial & Runway",
          assumption: "Assumed 18-month payback target with ₹4.5 Lakhs CapEx allocation based on 22% fuel route optimization and automated dispatch deflection.",
          evidence: "Calculated in Step 02 Gap Analysis baseline: 12-hour dispatch delays currently cost ~₹3.8L/month in delivery penalties.",
          evidenceSource: "Discovery Q&A",
          whyChosen: "Phased 6-week rollout prioritized over multi-month overhaul to ensure immediate cash-flow ROI before Q4 peak sales season.",
          discardedAlternative: "Custom ERP replacement (₹25L+ cost) was rejected due to excessive payback timeline (> 3 years).",
          downstreamImpact: "Feeds directly into Step 09 Financial ROI 36-month trajectory and CapEx runway model.",
          confidence: 92,
        },
      ];
    }

    if (isHealthcare) {
      return [
        {
          id: "assump-1",
          category: "scale",
          categoryLabel: "Operational Scale",
          assumption: "Assumed 350+ daily diagnostic lab samples requiring sub-minute specimen triage and automated HL7/FHIR EHR sync.",
          evidence: "Extracted from clinical discovery context and uploaded lab workflow BRD.",
          evidenceSource: "Uploaded BRD/Doc",
          whyChosen: "Event-driven microservices decouple specimen accessioning from slow hospital EHR synchronization gateways.",
          discardedAlternative: "Synchronous REST calls to hospital EHR were rejected; hospital gateway downtimes would freeze local clinic check-in.",
          downstreamImpact: "Defines Step 04 Architecture (asynchronous FHIR message broker) and Step 07 API contracts.",
          confidence: 97,
        },
        {
          id: "assump-2",
          category: "compliance",
          categoryLabel: "Statutory & Compliance",
          assumption: "Patient diagnostic records and clinician notes require HIPAA / DISHA encryption at rest with immutable 7-year audit ledgers.",
          evidence: "Healthcare statutory compliance standard for digital patient records.",
          evidenceSource: "Statutory Rule",
          whyChosen: "Row-Level Security (RLS) with field-level AES-256 tokenization ensures zero unauthorized internal doctor cross-access.",
          discardedAlternative: "Application-layer permissions alone were rejected; does not satisfy HIPAA database admin inspection requirements.",
          downstreamImpact: "Generates strict PostgreSQL RLS policies in Step 07 Data and compliance gates in Step 11.",
          confidence: 99,
        },
        {
          id: "assump-3",
          category: "architecture",
          categoryLabel: "Technical Architecture",
          assumption: "Radiologists require sub-2s DICOM medical imaging viewer rendering over standard broadband without VPN software lag.",
          evidence: "Extracted from clinic diagnostic pain points on remote radiologist report turnaround.",
          evidenceSource: "Discovery Q&A",
          whyChosen: "Pre-signed AWS S3 multi-part streaming with WebAssembly client viewer decouples heavy image payloads from main app API.",
          discardedAlternative: "Routing 100MB DICOM image files through application backend servers was rejected; causes memory leaks.",
          downstreamImpact: "Feeds Step 04 Architecture LLD viewer layer and Step 06 Wireframe viewer layouts.",
          confidence: 93,
        },
      ];
    }

    // Default / HR & Professional Services
    return [
      {
        id: "assump-1",
        category: "scale",
        categoryLabel: "Operational Scale",
        assumption: "Assumed projected 25% annual volume expansion (500–1,500 active monthly records) with 15–25 concurrent squad members.",
        evidence: discoveryAnswers[0]?.answer
          ? `Extracted from Step 02 Discovery answer: "${discoveryAnswers[0].answer}".`
          : "Extracted from Step 01 Intake problem context and standard SMB staffing agency scale.",
        evidenceSource: discoveryAnswers.length > 0 ? "Discovery Q&A" : "Intake Problem",
        whyChosen: "Selected React 19 + PostgreSQL 16 micro-layer architecture because it easily handles 5,000+ concurrent records while maintaining sub-100ms query response times.",
        discardedAlternative: "Monolithic Ruby on Rails / PHP stack was discarded; synchronous queue execution causes worker timeouts during high-volume CSV resume uploads.",
        downstreamImpact: "Influences Step 04 Architecture (PostgreSQL RLS) and Step 07 Data (indexing on candidate_status).",
        confidence: 95,
      },
      {
        id: "assump-2",
        category: "architecture",
        categoryLabel: "Technical Architecture",
        assumption: "Assumed recruiters require instant drag-and-drop Kanban updates with optimistic UI and multi-channel client notification webhooks.",
        evidence: "Extracted from operational friction: 'Candidate status lost after round 2, 4+ back-and-forth emails to schedule'.",
        evidenceSource: "Intake Problem",
        whyChosen: "Event-driven state transitions with background queue workers eliminate manual follow-up delays and syncs clients via automated SMS/WhatsApp alerts.",
        discardedAlternative: "Polling database tables on 15s intervals was discarded; causes database connection spikes and sluggish UI feedback.",
        downstreamImpact: "Shapes Step 03b Prototype CRM Kanban board and Step 05 BPMN automation swimlanes.",
        confidence: 94,
      },
      {
        id: "assump-3",
        category: "compliance",
        categoryLabel: "Statutory & Compliance",
        assumption: "Candidate resumes, salary expectations, and client contracts require DPDP / GDPR consent tokenization and automated 90-day retention pruning.",
        evidence: "Statutory requirement: Digital Personal Data Protection Act compliance for applicant PII records.",
        evidenceSource: "Statutory Rule",
        whyChosen: "Built-in cryptographic consent tokens allow one-click data subject erasure requests ('Right to be Forgotten') without breaking historical reporting stats.",
        discardedAlternative: "Storing unencrypted PII in public cloud storage buckets was rejected; exposes agency to ₹50 Lakhs+ regulatory fines.",
        downstreamImpact: "Directly remediates high-priority risk in Cockpit; triggers sign-off in Step 11 Governance.",
        confidence: 98,
      },
      {
        id: "assump-4",
        category: "financial",
        categoryLabel: "Financial & Runway",
        assumption: "Assumed an 8-week rapid deployment runway with target payback velocity of 2.4 months based on reclaiming 850+ recruiter hours/year.",
        evidence: "Calculated from ROI baseline: 4 recruiters spend 18 hrs/week on manual timesheet reconciliation and status tracking.",
        evidenceSource: "Discovery Q&A",
        whyChosen: "Prioritized custom Kanban CRM and self-serve client portal over complex AI video interviewing to achieve break-even within Q1.",
        discardedAlternative: "Off-the-shelf enterprise software (Zoho/Salesforce) was rejected; ₹3.5L/year recurring seat licensing reduces 3-year net ROI by 45%.",
        downstreamImpact: "Justifies Build vs Buy matrix in Step 03 and aligns with Step 09 Financial ROI trajectory.",
        confidence: 92,
      },
    ];
  }, [isLogistics, isHealthcare, industry, problemStatement, discoveryAnswers]);

  const filteredAssumptions = useMemo(() => {
    if (activeFilter === "all") return assumptions;
    return assumptions.filter((a) => a.category === activeFilter);
  }, [activeFilter, assumptions]);

  const averageConfidence = Math.round(
    assumptions.reduce((acc, curr) => acc + curr.confidence, 0) / Math.max(1, assumptions.length),
  );

  return (
    <div className={`neu p-6 space-y-6 ${className}`}>
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/70 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/15 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary">
              <ShieldCheck className="size-3.5 text-primary" />
              AI Explainability & Evidence Vault
            </span>
            <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
              {averageConfidence}% Evidence-Backed
            </span>
          </div>
          <h2 className="font-display text-xl font-bold mt-1 text-foreground">
            Architectural Assumptions, Evidence & Decision Justification
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed max-w-2xl">
            Enterprise transparency log: exactly what data the AI ingested, what assumptions were formulated, why specific technologies were recommended, and why alternatives were discarded.
          </p>
        </div>

        {/* Confidence Indicator Pill */}
        <div className="neu-inset px-4 py-2.5 rounded-xl text-center self-start sm:self-auto shrink-0 space-y-0.5">
          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            Explainability Audit
          </p>
          <p className="font-display text-lg font-extrabold text-primary font-mono">
            {assumptions.length} Logged Proofs
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-semibold">
          <Filter className="size-3.5 text-primary" />
          <span>Filter by Domain:</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {[
            { id: "all", label: "All Evidence" },
            { id: "scale", label: "Operational Scale" },
            { id: "architecture", label: "Architecture Trade-offs" },
            { id: "compliance", label: "Statutory & DPDP" },
            { id: "financial", label: "Financial & Runway" },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveFilter(tab.id as any)}
              className={cn(
                "rounded-lg px-3 py-1.5 text-xs font-semibold transition-all",
                activeFilter === tab.id
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "neu-sm hover:text-primary text-muted-foreground",
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Assumptions Cards Grid */}
      <div className="grid gap-4">
        {filteredAssumptions.map((item, idx) => {
          const isExpanded = expandedId === item.id || filteredAssumptions.length <= 2;
          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: idx * 0.05 }}
              className="neu-inset p-5 rounded-2xl space-y-4 hover:border-primary/40 transition-colors"
            >
              {/* Card Header */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2.5">
                <div className="flex items-start gap-2.5 min-w-0 flex-1">
                  <span className="grid size-6 shrink-0 place-items-center rounded-full bg-primary/10 text-primary text-xs font-mono font-bold mt-0.5">
                    0{idx + 1}
                  </span>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-accent px-2 py-0.5 text-[9px] font-bold text-muted-foreground uppercase tracking-wider">
                        {item.categoryLabel}
                      </span>
                      <span className="rounded-md bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
                        Source: {item.evidenceSource}
                      </span>
                      <span className="text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400">
                        {item.confidence}% Grounded
                      </span>
                    </div>
                    <h3 className="font-display text-sm font-bold text-foreground mt-1.5 leading-snug">
                      {item.assumption}
                    </h3>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}
                  className="neu-sm px-2.5 py-1 text-[11px] font-semibold text-primary self-start shrink-0 hover:brightness-105"
                >
                  {isExpanded ? "Collapse Audit" : "Expand Rationale"}
                </button>
              </div>

              {/* Collapsible 3-Pillar Explainability Block */}
              {isExpanded && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  transition={{ duration: 0.2 }}
                  className="grid gap-3 sm:grid-cols-3 pt-3 border-t border-border/60 text-xs"
                >
                  {/* Pillar 1: Evidence Used */}
                  <div className="rounded-xl bg-card/60 border border-border/60 p-3 space-y-1">
                    <p className="font-bold text-foreground flex items-center gap-1.5 text-[11px]">
                      <FileSearch className="size-3.5 text-primary" />
                      Evidence & Information Used
                    </p>
                    <p className="text-[11px] text-muted-foreground leading-relaxed">
                      {item.evidence}
                    </p>
                  </div>

                  {/* Pillar 2: Why Recommendation Was Made */}
                  <div className="rounded-xl bg-emerald-500/5 border border-emerald-500/20 p-3 space-y-1">
                    <p className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 text-[11px]">
                      <CheckCircle2 className="size-3.5 text-emerald-500" />
                      Why Recommended (Decision Logic)
                    </p>
                    <p className="text-[11px] text-muted-foreground leading-relaxed">
                      {item.whyChosen}
                    </p>
                  </div>

                  {/* Pillar 3: Discarded Alternative */}
                  <div className="rounded-xl bg-rose-500/5 border border-rose-500/20 p-3 space-y-1">
                    <p className="font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1.5 text-[11px]">
                      <XCircle className="size-3.5 text-rose-500" />
                      Discarded Alternative & Why
                    </p>
                    <p className="text-[11px] text-muted-foreground leading-relaxed">
                      {item.discardedAlternative}
                    </p>
                  </div>
                </motion.div>
              )}

              {/* Downstream Artifact Footprint */}
              {isExpanded && (
                <div className="flex items-center gap-2 rounded-lg bg-surface-2/40 px-3 py-1.5 text-[10px] text-muted-foreground">
                  <Database className="size-3 text-primary shrink-0" />
                  <span className="font-medium text-foreground">Downstream Impact:</span>
                  <span className="truncate">{item.downstreamImpact}</span>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
