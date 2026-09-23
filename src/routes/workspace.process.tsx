import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import {
  Activity,
  AlertTriangle,
  ArrowDown,
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
} from "lucide-react";

import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { ArtifactHeader } from "@/components/ArtifactHeader";
import { GenerationSequence } from "@/components/GenerationSequence";
import { Mermaid } from "@/components/Mermaid";
import { supabase } from "@/integrations/supabase/client";
import { GENERATION_STEPS, generateArtifact } from "@/lib/ai/generate-artifact";
import { getProcessBlueprint } from "@/lib/process-data";
import { useStageGate, StageNextButton } from "@/lib/workspace-stage-gate";

function ensureVerticalDiagram(chartStr: string): string {
  if (!chartStr || typeof chartStr !== "string") return chartStr;
  return chartStr
    .replace(/^graph\s+LR\b/im, "graph TD")
    .replace(/^flowchart\s+LR\b/im, "flowchart TD")
    .replace(/\bgraph\s+LR\b/g, "graph TD")
    .replace(/\bflowchart\s+LR\b/g, "flowchart TD");
}

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
        content: "As-is manual process versus to-be automated intelligence, modeled side-by-side.",
      },
    ],
  }),
  component: ProcessPage,
});

type TabView = "comparison" | "swimlane" | "bottlenecks" | "decisionTree";
type DiffViewMode = "vertical" | "split" | "before" | "after";

function ProcessPage() {
  useStageGate("process");
  const [activeTab, setActiveTab] = useState<TabView>("comparison");
  const [diffMode, setDiffMode] = useState<DiffViewMode>("split");
  const [workspaceContext, setWorkspaceContext] = useState<{
    businessName: string;
    industry: string;
    problemStatement?: string;
  }>({
    businessName: "TalentCraft HR Consultancy",
    industry: "HR & Recruitment Services",
    problemStatement: "",
  });

  useEffect(() => {
    async function loadContext() {
      let bName = "TalentCraft HR Consultancy";
      let ind = "HR & Recruitment Services";
      let prob = "";

      try {
        const raw = window.localStorage.getItem("bizzmitra.workspaceContext");
        if (raw) {
          const parsed = JSON.parse(raw);
          bName = parsed.businessName || bName;
          ind = parsed.industry || ind;
          prob = parsed.problemStatement || parsed.summary || prob;
        }
      } catch {}

      const wsId = typeof window !== "undefined"
        ? window.localStorage.getItem("bizzmitra.activeWorkspaceId")
        : null;

      if (wsId && !wsId.startsWith("ws-")) {
        try {
          const { data: ws } = await supabase
            .from("workspaces")
            .select("problem_statement, name, industry")
            .eq("id", wsId)
            .maybeSingle();

          if (ws) {
            if (ws.name) bName = ws.name;
            if (ws.industry) ind = ws.industry;
            if (ws.problem_statement) prob = ws.problem_statement;
          }

          // Check if an existing process artifact is already persisted
          const { data: art } = await supabase
            .from("artifacts")
            .select("content")
            .eq("workspace_id", wsId)
            .eq("module_type", "process")
            .order("version", { ascending: false })
            .limit(1)
            .maybeSingle();

          if (art?.content) {
            setDynamicBlueprint(art.content);
          }
        } catch (e) {
          console.warn("[ProcessPage] Supabase load error:", e);
        }
      }

      setWorkspaceContext({
        businessName: bName,
        industry: ind,
        problemStatement: prob,
      });
    }

    loadContext();

    window.addEventListener("bizzmitra:workspace-updated", loadContext);
    return () => window.removeEventListener("bizzmitra:workspace-updated", loadContext);
  }, []);

  const [dynamicBlueprint, setDynamicBlueprint] = useState<any>(null);
  const [modelLabel, setModelLabel] = useState("Groq Llama 3.3 70B");

  const fallbackBlueprint = getProcessBlueprint(workspaceContext);
  const rawBlueprint = dynamicBlueprint || fallbackBlueprint;

  const blueprint = {
    ...fallbackBlueprint,
    ...rawBlueprint,
    domainTitle: rawBlueprint.domainTitle || fallbackBlueprint.domainTitle,
    asIsDiagram: rawBlueprint.asIsDiagram || rawBlueprint.beforeDiagram || rawBlueprint.before || fallbackBlueprint.asIsDiagram,
    toBeDiagram: rawBlueprint.toBeDiagram || rawBlueprint.afterDiagram || rawBlueprint.after || fallbackBlueprint.toBeDiagram,
    swimlaneDiagram: rawBlueprint.swimlaneDiagram || rawBlueprint.swimlane || fallbackBlueprint.swimlaneDiagram,
    decisionTreeDiagram: rawBlueprint.decisionTreeDiagram || rawBlueprint.decisionTree || fallbackBlueprint.decisionTreeDiagram,
    metrics: (rawBlueprint.metrics && Array.isArray(rawBlueprint.metrics) && rawBlueprint.metrics.length > 0)
      ? rawBlueprint.metrics.map((m: any, idx: number) => ({
          label: m.label || fallbackBlueprint.metrics[idx]?.label || `Metric ${idx + 1}`,
          before: m.before || m.asIs || fallbackBlueprint.metrics[idx]?.before || "Manual",
          after: m.after || m.toBe || fallbackBlueprint.metrics[idx]?.after || "Automated",
          improvement: m.improvement || m.delta || fallbackBlueprint.metrics[idx]?.improvement || "80% Faster",
          icon: m.icon || fallbackBlueprint.metrics[idx]?.icon || "Zap",
        }))
      : fallbackBlueprint.metrics,
    bottlenecks: (rawBlueprint.bottlenecks && Array.isArray(rawBlueprint.bottlenecks) && rawBlueprint.bottlenecks.length > 0)
      ? rawBlueprint.bottlenecks.map((b: any, idx: number) => ({
          stage: b.stage || b.title || b.name || fallbackBlueprint.bottlenecks[idx]?.stage || `Phase ${idx + 1}`,
          problem: b.problem || b.asIsDetail || b.description || fallbackBlueprint.bottlenecks[idx]?.problem || "Manual bottleneck",
          impact: b.impact || b.businessImpact || b.consequence || fallbackBlueprint.bottlenecks[idx]?.impact || "Operational latency",
          solution: b.solution || b.toBeDetail || b.remediation || fallbackBlueprint.bottlenecks[idx]?.solution || "Automated workflow",
          timeSavings: b.timeSavings || b.timeSaved || b.savings || fallbackBlueprint.bottlenecks[idx]?.timeSavings || "80% reduction",
        }))
      : fallbackBlueprint.bottlenecks,
    decisionTiers: (rawBlueprint.decisionTiers && Array.isArray(rawBlueprint.decisionTiers))
      ? rawBlueprint.decisionTiers
      : fallbackBlueprint.decisionTiers,
  };

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

  const handleRegenerate = async () => {
    const tId = toast.loading("Regenerating process blueprint with AI...");
    try {
      const res = await generateArtifact("process", {
        businessName: workspaceContext.businessName,
        industry: workspaceContext.industry,
        problem: workspaceContext.problemStatement || "",
      }, { forceFresh: true });

      if (res) {
        setDynamicBlueprint(res);
        setModelLabel("Groq Llama 3.3 70B (Fresh)");
        toast.success("Process blueprint regenerated!", { id: tId });
      }
    } catch {
      toast.error("Failed to regenerate process blueprint", { id: tId });
    }
  };

  return (
    <AppShell>
      <ArtifactHeader
        id="process"
        kicker="Step 05"
        title="Process Intelligence & BPMN Engine"
        onRegenerate={() => void handleRegenerate()}
      />

      {/* Blueprint Context Banner */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-primary/20 bg-primary/5 px-4 py-2.5 text-xs">
        <div className="flex items-center gap-2">
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          <span className="text-muted-foreground">Process Modeling Context:</span>
          <span className="font-bold text-foreground">{workspaceContext.businessName}</span>
          <span className="rounded-full bg-primary/10 px-2 py-0.5 font-medium text-primary">
            {workspaceContext.industry}
          </span>
          <span className="rounded-full bg-sage/15 px-2 py-0.5 font-bold text-sage">
            {modelLabel}
          </span>
        </div>
        <Link to="/workspace/architecture" className="font-medium text-primary hover:underline">
          View Technical Architecture →
        </Link>
      </div>

      <GenerationSequence
        steps={GENERATION_STEPS.process}
        run={async () => {
          const res: any = await generateArtifact("process", {
            businessName: workspaceContext.businessName,
            industry: workspaceContext.industry,
            problem: workspaceContext.problemStatement || "",
          });
          if (res) {
            setDynamicBlueprint(res);
          }
          return res;
        }}
      >
        <div className="space-y-6">
          {/* Top Performance Metrics Banner */}
          <div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {blueprint.metrics.slice(0, 4).map((metric: any, idx: number) => (
                <div key={`${metric.label}-${idx}`} className="neu p-4 transition-all hover:scale-[1.01]">
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
          </div>

          {/* Navigation Controls */}
          <div>
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
                  Bottleneck Analysis ({blueprint.bottlenecks.length})
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
                      diffMode === "split" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Side-by-Side
                  </button>
                  <button
                    type="button"
                    onClick={() => setDiffMode("vertical")}
                    className={`rounded-md px-2.5 py-1 font-medium transition-colors ${
                      diffMode === "vertical" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Vertical Stack
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
          </div>

          {/* TAB 1: Before vs After Comparison */}
          {activeTab === "comparison" && (
            <motion.div
              key="comparison"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
            >
              <div
                className={`grid gap-6 items-stretch ${
                  diffMode === "split" ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1"
                }`}
              >
                {(diffMode === "vertical" || diffMode === "split" || diffMode === "before") && (
                  <div className="neu flex flex-col rounded-xl p-5 border-l-4 border-l-rose-500 min-w-0 shadow-sm">
                    <div className="flex items-center justify-between border-b border-border/30 pb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="h-2 w-2 rounded-full bg-rose-500" />
                          <h3 className="font-display text-sm font-bold text-rose-600 dark:text-rose-400">
                            As-Is: Manual Fragmented Process
                          </h3>
                        </div>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          Fragmented manual handoffs, phone tag, spreadsheets · High Latency Cycle
                        </p>
                      </div>
                      <span className="shrink-0 rounded-full bg-rose-500/10 px-2.5 py-1 text-[11px] font-semibold text-rose-600 dark:text-rose-400">
                        High Friction
                      </span>
                    </div>
                    <div className="mt-4 flex-1 overflow-x-auto rounded-lg bg-background/50 p-3 min-w-0">
                      <Mermaid key="before" chart={ensureVerticalDiagram(blueprint.asIsDiagram)} />
                    </div>
                  </div>
                )}

                {diffMode === "vertical" && (
                  <div className="flex items-center justify-center -my-2">
                    <div className="flex items-center gap-3 rounded-full border border-primary/20 bg-background/90 px-4 py-1.5 shadow-sm backdrop-blur-sm">
                      <span className="text-[11px] font-semibold text-rose-500">As-Is Manual Bottlenecks</span>
                      <ArrowDown className="h-3.5 w-3.5 text-primary animate-bounce" />
                      <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                        To-Be Automated Flow (80%+ Faster)
                      </span>
                    </div>
                  </div>
                )}

                {(diffMode === "vertical" || diffMode === "split" || diffMode === "after") && (
                  <div className="neu flex flex-col rounded-xl p-5 border-l-4 border-l-emerald-500 min-w-0 shadow-sm">
                    <div className="flex items-center justify-between border-b border-border/30 pb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="h-2 w-2 rounded-full bg-emerald-500" />
                          <h3 className="font-display text-sm font-bold text-emerald-600 dark:text-emerald-400">
                            To-Be: BizzMitra Intelligent Flow
                          </h3>
                        </div>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          AI Parsing, Real-time Validation & Automated Pipeline · Streamlined Cycle
                        </p>
                      </div>
                      <span className="shrink-0 inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                        <Sparkles className="h-3 w-3" />
                        80%+ Faster
                      </span>
                    </div>
                    <div className="mt-4 flex-1 overflow-x-auto rounded-lg bg-background/50 p-3 min-w-0">
                      <Mermaid key="after" chart={ensureVerticalDiagram(blueprint.toBeDiagram)} />
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* TAB 2: Swimlanes */}
          {activeTab === "swimlane" && (
            <motion.div
              key="swimlane"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              <div className="neu p-6">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/30 pb-3">
                  <div>
                    <h2 className="font-display text-base font-bold flex items-center gap-2">
                      <Layers className="h-4 w-4 text-primary" />
                      4-Tier BPMN 2.0 Swimlane Orchestration
                    </h2>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Real-time interactive sequence modeling handoffs across operational roles, AI automation engines, and stakeholders.
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <span className="inline-flex items-center rounded-md bg-teal-500/10 px-2 py-1 text-[10px] font-medium text-teal-600">
                      Phase 1: Ingestion
                    </span>
                    <span className="inline-flex items-center rounded-md bg-indigo-500/10 px-2 py-1 text-[10px] font-medium text-indigo-600">
                      Phase 2: Screening & AI
                    </span>
                    <span className="inline-flex items-center rounded-md bg-sky-500/10 px-2 py-1 text-[10px] font-medium text-sky-600">
                      Phase 3: Decision Gate
                    </span>
                    <span className="inline-flex items-center rounded-md bg-amber-500/10 px-2 py-1 text-[10px] font-medium text-amber-600">
                      Phase 4: Execution / Billing
                    </span>
                  </div>
                </div>

                <div className="mt-5 overflow-x-auto rounded-xl bg-background/60 p-4 shadow-inner">
                  <Mermaid key="swimlane" chart={blueprint.swimlaneDiagram} />
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 3: Bottleneck Analysis */}
          {activeTab === "bottlenecks" && (
            <motion.div
              key="bottlenecks"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                {blueprint.bottlenecks.map((item: any) => (
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
            </motion.div>
          )}

          {/* Tab 4: Approval Workflows & Decision Trees */}
          {activeTab === "decisionTree" && (
            <motion.div
              key="decisionTree"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
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
                  {blueprint.decisionTiers.map((step: any, idx: number) => (
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
                      Process Intake & Auto-Routing Decision Tree
                    </h4>
                    <p className="text-[11px] text-muted-foreground">
                      Visual flow diagram representing exclusive BPMN XOR and Inclusive OR decision gates.
                    </p>
                  </div>
                </div>

                <div className="overflow-x-auto pt-2">
                  <Mermaid
                    key="decision-tree"
                    chart={blueprint.decisionTreeDiagram}
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
                  {blueprint.recommendations.map((rec: any) => (
                    <div key={rec.title} className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3 space-y-1">
                      <p className="font-bold text-emerald-600 dark:text-emerald-400">{rec.title}</p>
                      <p className="text-[11px] text-muted-foreground leading-relaxed">
                        {rec.detail}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          <StageNextButton currentStageId="process" label="Proceed to Interactive Wireframes" />
        </div>
      </GenerationSequence>
    </AppShell>
  );
}
