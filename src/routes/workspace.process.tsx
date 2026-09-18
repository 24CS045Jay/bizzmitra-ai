import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Clock,
  Columns,
  GitBranch,
  Layers,
  Sparkles,
  Timer,
  Users,
  Zap,
  Workflow,
  ShieldCheck,
  Split,
  CornerDownRight,
} from "lucide-react";

import { AppShell } from "@/components/AppShell";
import { ArtifactHeader } from "@/components/ArtifactHeader";
import { GenerationSequence } from "@/components/GenerationSequence";
import { Mermaid } from "@/components/Mermaid";
import { Stagger, StaggerItem } from "@/components/motion/primitives";
import { GENERATION_STEPS, generateArtifact } from "@/lib/ai/generate-artifact";
import {
  BOTTLENECK_ANALYSIS,
  HR_BPMN_AFTER,
  HR_BPMN_BEFORE,
  HR_SWIMLANE_BPMN,
  PROCESS_METRICS,
} from "@/lib/process-data";

export const Route = createFileRoute("/workspace/process")({
  head: () => ({
    meta: [
      { title: "Process Intelligence & BPMN — BizzMitra-AI" },
      {
        name: "description",
        content: "BPMN 2.0 process modeling with As-Is vs To-Be comparison, 4-tier swimlanes, and bottleneck analysis.",
      },
      { property: "og:title", content: "Process Intelligence — BizzMitra-AI" },
      {
        property: "og:description",
        content: "As-is manual recruitment versus to-be automated intelligence, modeled side-by-side.",
      },
    ],
  }),
  component: ProcessPage,
});

type TabView = "comparison" | "swimlane" | "bottlenecks" | "decisionTree";
type DiffViewMode = "split" | "before" | "after";

function ProcessPage() {
  const [activeTab, setActiveTab] = useState<TabView>("comparison");
  const [diffMode, setDiffMode] = useState<DiffViewMode>("split");
  const [workspaceContext, setWorkspaceContext] = useState<{
    businessName: string;
    industry: string;
  }>({
    businessName: "TalentCraft HR Consultancy",
    industry: "HR & Recruitment Services",
  });

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem("bizzmitra.workspaceContext");
      if (raw) {
        const parsed = JSON.parse(raw);
        setWorkspaceContext({
          businessName: parsed.businessName || "TalentCraft HR Consultancy",
          industry: parsed.industry || "HR & Recruitment Services",
        });
      }
    } catch {}
  }, []);

  const getMetricIcon = (icon: string) => {
    switch (icon) {
      case "Clock":
        return <Clock className="h-4 w-4 text-amber-500" />;
      case "Zap":
        return <Zap className="h-4 w-4 text-emerald-500" />;
      case "Timer":
        return <Timer className="h-4 w-4 text-sky-500" />;
      case "Users":
        return <Users className="h-4 w-4 text-indigo-500" />;
      default:
        return <Activity className="h-4 w-4 text-primary" />;
    }
  };

  return (
    <AppShell>
      <ArtifactHeader id="process" kicker="Step 05" title="Process Intelligence & BPMN Engine" />

      {/* Blueprint Context Banner */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-primary/20 bg-primary/5 px-4 py-2.5 text-xs">
        <div className="flex items-center gap-2">
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          <span className="text-muted-foreground">Process Modeling Context:</span>
          <span className="font-bold text-foreground">{workspaceContext.businessName}</span>
          <span className="rounded-full bg-primary/10 px-2 py-0.5 font-medium text-primary">
            {workspaceContext.industry}
          </span>
        </div>
        <Link to="/workspace/architecture" className="font-medium text-primary hover:underline">
          View Technical Architecture →
        </Link>
      </div>

      <GenerationSequence steps={GENERATION_STEPS.process} run={() => generateArtifact("process")}>
        <Stagger className="space-y-6">
          {/* Top Performance Metrics Banner */}
          <StaggerItem>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {PROCESS_METRICS.map((metric) => (
                <div key={metric.label} className="neu p-4 transition-all hover:scale-[1.01]">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                      {metric.label}
                    </span>
                    <div className="rounded-full bg-background/80 p-1.5 shadow-inner">
                      {getMetricIcon(metric.icon)}
                    </div>
                  </div>
                  <div className="mt-3 flex items-baseline justify-between">
                    <div>
                      <span className="text-xs text-muted-foreground line-through decoration-rose-500/60">
                        {metric.before}
                      </span>
                      <div className="font-display text-xl font-bold tracking-tight text-foreground">
                        {metric.after}
                      </div>
                    </div>
                    <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                      {metric.improvement}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </StaggerItem>

          {/* Navigation Controls */}
          <StaggerItem>
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/40 pb-4">
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTab("comparison")}
                  className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold transition-all ${
                    activeTab === "comparison"
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "neu hover:bg-accent/40"
                  }`}
                >
                  <Columns className="h-3.5 w-3.5" />
                  As-Is vs To-Be Comparison
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("swimlane")}
                  className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold transition-all ${
                    activeTab === "swimlane"
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "neu hover:bg-accent/40"
                  }`}
                >
                  <GitBranch className="h-3.5 w-3.5" />
                  4-Tier BPMN Swimlane
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("bottlenecks")}
                  className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold transition-all ${
                    activeTab === "bottlenecks"
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "neu hover:bg-accent/40"
                  }`}
                >
                  <AlertTriangle className="h-3.5 w-3.5" />
                  Bottleneck Analysis ({BOTTLENECK_ANALYSIS.length})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("decisionTree")}
                  className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold transition-all ${
                    activeTab === "decisionTree"
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "neu hover:bg-accent/40"
                  }`}
                >
                  <Workflow className="h-3.5 w-3.5" />
                  Approval Workflows & Decision Trees
                </button>
              </div>

              {activeTab === "comparison" && (
                <div className="inline-flex items-center rounded-lg border border-border/50 bg-background/50 p-1 text-xs">
                  <button
                    type="button"
                    onClick={() => setDiffMode("split")}
                    className={`rounded-md px-2.5 py-1 font-medium transition-colors ${
                      diffMode === "split" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Side-by-Side
                  </button>
                  <button
                    type="button"
                    onClick={() => setDiffMode("before")}
                    className={`rounded-md px-2.5 py-1 font-medium transition-colors ${
                      diffMode === "before" ? "bg-rose-500 text-white" : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Manual Only
                  </button>
                  <button
                    type="button"
                    onClick={() => setDiffMode("after")}
                    className={`rounded-md px-2.5 py-1 font-medium transition-colors ${
                      diffMode === "after" ? "bg-emerald-600 text-white" : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Automated Only
                  </button>
                </div>
              )}
            </div>
          </StaggerItem>

          {/* TAB 1: Before vs After Comparison */}
          {activeTab === "comparison" && (
            <StaggerItem>
              <div
                className={`grid gap-6 ${
                  diffMode === "split" ? "grid-cols-1 lg:grid-cols-2" : "grid-cols-1"
                }`}
              >
                {(diffMode === "split" || diffMode === "before") && (
                  <div className="neu flex flex-col rounded-xl p-5 border-l-4 border-l-rose-500">
                    <div className="flex items-center justify-between border-b border-border/30 pb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="h-2 w-2 rounded-full bg-rose-500" />
                          <h3 className="font-display text-sm font-bold text-rose-600 dark:text-rose-400">
                            As-Is: Manual Fragmented Process
                          </h3>
                        </div>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          Spreadsheets, phone tag, manual email submission · ~14.2 Days Cycle Time
                        </p>
                      </div>
                      <span className="rounded-full bg-rose-500/10 px-2.5 py-1 text-[11px] font-semibold text-rose-600 dark:text-rose-400">
                        High Friction
                      </span>
                    </div>
                    <div className="mt-4 flex-1 overflow-x-auto rounded-lg bg-background/50 p-2">
                      <Mermaid chart={HR_BPMN_BEFORE} />
                    </div>
                  </div>
                )}

                {(diffMode === "split" || diffMode === "after") && (
                  <div className="neu flex flex-col rounded-xl p-5 border-l-4 border-l-emerald-500">
                    <div className="flex items-center justify-between border-b border-border/30 pb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="h-2 w-2 rounded-full bg-emerald-500" />
                          <h3 className="font-display text-sm font-bold text-emerald-600 dark:text-emerald-400">
                            To-Be: BizzMitra Intelligent Flow
                          </h3>
                        </div>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          AI Parsing, Semantic Scoring & Client Portal · ~2.4 Days Cycle Time
                        </p>
                      </div>
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                        <Sparkles className="h-3 w-3" />
                        83% Faster
                      </span>
                    </div>
                    <div className="mt-4 flex-1 overflow-x-auto rounded-lg bg-background/50 p-2">
                      <Mermaid chart={HR_BPMN_AFTER} />
                    </div>
                  </div>
                )}
              </div>
            </StaggerItem>
          )}

          {/* TAB 2: Swimlanes */}
          {activeTab === "swimlane" && (
            <StaggerItem className="space-y-4">
              <div className="neu p-6">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/30 pb-3">
                  <div>
                    <h2 className="font-display text-base font-bold flex items-center gap-2">
                      <Layers className="h-4 w-4 text-primary" />
                      4-Tier BPMN 2.0 Swimlane Orchestration
                    </h2>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Real-time interactive sequence modeling handoffs between Candidates, Agency Recruiters, BizzMitra AI Engine, and Corporate Clients.
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <span className="inline-flex items-center rounded-md bg-teal-500/10 px-2 py-1 text-[10px] font-medium text-teal-600">
                      Phase 1: Ingestion
                    </span>
                    <span className="inline-flex items-center rounded-md bg-indigo-500/10 px-2 py-1 text-[10px] font-medium text-indigo-600">
                      Phase 2: Screening
                    </span>
                    <span className="inline-flex items-center rounded-md bg-sky-500/10 px-2 py-1 text-[10px] font-medium text-sky-600">
                      Phase 3: Client Review
                    </span>
                    <span className="inline-flex items-center rounded-md bg-amber-500/10 px-2 py-1 text-[10px] font-medium text-amber-600">
                      Phase 4: Billing
                    </span>
                  </div>
                </div>

                <div className="mt-5 overflow-x-auto rounded-xl bg-background/60 p-4 shadow-inner">
                  <Mermaid chart={HR_SWIMLANE_BPMN} />
                </div>
              </div>
            </StaggerItem>
          )}

          {/* TAB 3: Bottleneck Analysis */}
          {activeTab === "bottlenecks" && (
            <StaggerItem className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                {BOTTLENECK_ANALYSIS.map((item) => (
                  <div key={item.stage} className="neu flex flex-col justify-between p-5">
                    <div>
                      <div className="flex items-center justify-between border-b border-border/30 pb-2.5">
                        <span className="font-display text-sm font-bold text-foreground">
                          {item.stage}
                        </span>
                        <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                          {item.timeSavings}
                        </span>
                      </div>

                      <div className="mt-3 space-y-3 text-xs">
                        <div>
                          <span className="font-semibold text-rose-500 flex items-center gap-1">
                            <AlertTriangle className="h-3 w-3" />
                            Identified Problem:
                          </span>
                          <p className="mt-0.5 text-muted-foreground leading-relaxed">
                            {item.problem}
                          </p>
                        </div>

                        <div>
                          <span className="font-semibold text-amber-500">Business Impact:</span>
                          <p className="mt-0.5 text-muted-foreground leading-relaxed">
                            {item.impact}
                          </p>
                        </div>

                        <div className="rounded-lg bg-emerald-500/5 p-2.5 border border-emerald-500/20">
                          <span className="font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                            <CheckCircle2 className="h-3 w-3" />
                            BizzMitra Solution:
                          </span>
                          <p className="mt-1 text-foreground leading-relaxed font-medium">
                            {item.solution}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-border/30 flex items-center justify-between text-[11px] text-muted-foreground">
                      <span>Status:</span>
                      <span className="font-semibold text-emerald-600 flex items-center gap-1">
                        Resolved via Automation
                        <ArrowRight className="h-3 w-3" />
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </StaggerItem>
          )}

          {/* Tab 4: Approval Workflows & Decision Trees */}
          {activeTab === "decisionTree" && (
            <StaggerItem className="space-y-6">
              {/* Overview Card */}
              <div className="rounded-2xl border border-border/80 bg-card/60 p-6 backdrop-blur-md space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h3 className="font-display text-base font-bold text-foreground">
                      BPMN 2.0 Approval Gateways & Decision Trees
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Automated branching logic, multi-tier approval escalations, and AI decision routing.
                    </p>
                  </div>
                  <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                    SLA: Sub-2 Hour Resolution
                  </span>
                </div>

                {/* 3-Tier Approval Workflow Strip */}
                <div className="grid gap-3 sm:grid-cols-3 pt-2">
                  {[
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
                  ].map((step, idx) => (
                    <div key={idx} className="rounded-xl border border-border/70 bg-surface/60 p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-foreground">{step.tier}</span>
                        <ShieldCheck className="size-3.5 text-primary" />
                      </div>
                      <p className="text-[10px] font-mono text-primary font-semibold">Actor: {step.actor}</p>
                      <p className="text-[11px] text-muted-foreground"><strong className="text-foreground">Rule:</strong> {step.criteria}</p>
                      <div className="pt-2 border-t border-border/40 flex items-center justify-between text-[10px]">
                        <span className="text-muted-foreground">{step.action}</span>
                        <span className="font-bold text-emerald-600">{step.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Decision Tree Branching Diagram */}
              <div className="rounded-2xl border border-border/80 bg-card/60 p-6 backdrop-blur-md space-y-4">
                <div className="flex items-center gap-2 border-b border-border/60 pb-3">
                  <Split className="size-4 text-primary" />
                  <div>
                    <h4 className="font-display text-sm font-bold text-foreground">
                      Candidate Intake & Auto-Routing Decision Tree
                    </h4>
                    <p className="text-[11px] text-muted-foreground">
                      Visual flow diagram representing exclusive BPMN XOR and Inclusive OR decision gates.
                    </p>
                  </div>
                </div>

                <div className="overflow-x-auto pt-2">
                  <Mermaid
                    chart={`graph TD
  Start([📥 Resume Submitted]) --> Parse[⚡ AI Resume Extraction]
  Parse --> Q1{Confidence > 85%?}
  Q1 -- No --> ManualReview[👀 Recruiter Manual Review Queue]
  Q1 -- Yes --> Q2{Skill Match Score}
  Q2 -- Score >= 75% --> FastTrack[🚀 Fast-Track Auto Invite to Tech Screen]
  Q2 -- 50% to 74% --> RecruiterScreen[📞 15-Min Phone Screen Scheduled]
  Q2 -- Score < 50% --> AutoReject[✉️ Polite Automated Feedback Email]
  FastTrack --> Interview[🎯 Technical Evaluation Passed]
  RecruiterScreen --> Interview
  Interview --> Q3{Expected CTC <= Budget?}
  Q3 -- Yes --> DraftOffer[📝 Auto-Draft Offer Letter]
  Q3 -- Exceeds Budget --> ApprovalGate[🛡️ VP Escalation Approval Gate]
  ApprovalGate -- Approved --> DraftOffer
  ApprovalGate -- Rejected --> Renegotiate[🤝 Client Rate Adjustment]
  DraftOffer --> ClientSign([✅ Offer Dispatched via e-Signature])`}
                  />
                </div>
              </div>

              {/* Process Optimization Recommendations */}
              <div className="rounded-2xl border border-border/80 bg-card/60 p-6 backdrop-blur-md space-y-3">
                <h4 className="font-display text-sm font-bold text-foreground flex items-center gap-2">
                  <Sparkles className="size-4 text-primary" />
                  AI Process Optimization Recommendations
                </h4>
                <div className="grid gap-3 sm:grid-cols-2 text-xs">
                  <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3 space-y-1">
                    <p className="font-bold text-emerald-600 dark:text-emerald-400">1. Eliminate Manual Scheduling Handoffs</p>
                    <p className="text-[11px] text-muted-foreground leading-relaxed">
                      Replace recruiter back-and-forth emails with automated Calendly / Google Calendar webhooks. Saves 2.4 days per placement cycle.
                    </p>
                  </div>
                  <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3 space-y-1">
                    <p className="font-bold text-emerald-600 dark:text-emerald-400">2. Async Candidate Video Screening</p>
                    <p className="text-[11px] text-muted-foreground leading-relaxed">
                      Use automated 3-question async video screens for Tier 1 applicants. Frees up 14 hours per week per recruiter.
                    </p>
                  </div>
                </div>
              </div>
            </StaggerItem>
          )}
        </Stagger>
      </GenerationSequence>
    </AppShell>
  );
}
