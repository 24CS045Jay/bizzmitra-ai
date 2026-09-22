import { createFileRoute, Link } from "@tanstack/react-router";
import {
  AlertTriangle,
  ArrowRight,
  Calendar,
  CheckCircle2,
  Clock,
  Copy,
  Download,
  FileCheck,
  Layers,
  Scale,
  Share2,
  ShieldAlert,
  Sparkles,
  Users,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { AppShell } from "@/components/AppShell";
import { ArtifactHeader } from "@/components/ArtifactHeader";
import { GenerationSequence } from "@/components/GenerationSequence";
import { CountUp, Reveal } from "@/components/motion/primitives";
import { BlueprintConfidenceScore } from "@/components/BlueprintConfidenceScore";
import { ScenarioComparisonModal, type ScenarioData } from "@/components/ScenarioComparisonModal";
import { ShareBlueprintModal } from "@/components/ShareBlueprintModal";
import { GENERATION_STEPS, generateArtifact } from "@/lib/ai/generate-artifact";
import {
  getRoadmapForWorkspace,
  MilestoneItem,
  RiskItem,
  SprintPhase,
} from "@/lib/planning-data";
import { evaluateBlueprintRisks } from "@/lib/risk-evaluator";
import { useStageGate, StageNextButton } from "@/lib/workspace-stage-gate";

export const Route = createFileRoute("/workspace/roadmap")({
  head: () => ({
    meta: [
      { title: "AI Implementation Planning Engine — BizzMitra-AI" },
      {
        name: "description",
        content: "Phased 3-tier delivery roadmap with sprint milestones, staffing allocation, and risk mitigation register.",
      },
      { property: "og:title", content: "AI Implementation Planning Engine — BizzMitra-AI" },
      { property: "og:description", content: "From business problem to sprint-ready delivery plan." },
    ],
  }),
  component: RoadmapPage,
});

export function RoadmapPage() {
  useStageGate("roadmap");
  // Read active workspace context reactively
  const [workspaceContext, setWorkspaceContext] = useState<{
    id?: string;
    name?: string;
    businessName?: string;
    industry?: string;
    problemStatement?: string;
    description?: string;
    budget?: number;
    scale?: string;
  } | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("bizzmitra.workspaceContext");
      if (raw) {
        setWorkspaceContext(JSON.parse(raw));
      }
    } catch {}
  }, []);

  const blueprint = useMemo(() => getRoadmapForWorkspace(workspaceContext), [workspaceContext]);
  const [activePhaseIndex, setActivePhaseIndex] = useState(0);

  const [completedMilestones, setCompletedMilestones] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    blueprint.phases.forEach((p) => {
      p.milestones.forEach((m) => {
        initial[m.id] = m.completed;
      });
    });
    return initial;
  });

  // Re-synchronize milestones state whenever the blueprint/scenario changes
  useEffect(() => {
    const initial: Record<string, boolean> = {};
    blueprint.phases.forEach((p) => {
      p.milestones.forEach((m) => {
        initial[m.id] = m.completed;
      });
    });
    setCompletedMilestones(initial);
    setActivePhaseIndex(0);
  }, [blueprint.workspaceId, blueprint.scenarioName]);

  const [riskFilter, setRiskFilter] = useState<"All" | "Technical" | "Adoption" | "Security" | "Timeline">("All");
  const [isScenarioModalOpen, setIsScenarioModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  const { flaggedRisks, scoreResult } = useMemo(
    () => evaluateBlueprintRisks(blueprint, workspaceContext),
    [blueprint, workspaceContext],
  );

  const activePhase = (blueprint.phases[activePhaseIndex] ?? blueprint.phases[0])!;

  const totalMilestones = blueprint.phases.reduce((acc, p) => acc + p.milestones.length, 0);
  const doneMilestones = Object.values(completedMilestones).filter(Boolean).length;
  const progressPercent = totalMilestones > 0 ? Math.round((doneMilestones / totalMilestones) * 100) : 0;

  const toggleMilestone = (id: string) => {
    setCompletedMilestones((prev) => {
      const next = !prev[id];
      toast.success(next ? "Milestone marked completed" : "Milestone reverted to in-progress");
      return { ...prev, [id]: next };
    });
  };

  const copyRoadmap = () => {
    const text = `# ${blueprint.scenarioName} — Implementation Roadmap\n\nTimeline: ${blueprint.targetTimelineWeeks} Weeks | Effort: ${blueprint.totalPersonDays} Person-Days | Go-Live: ${blueprint.estimatedGoLive}\nConfidence: ${blueprint.confidenceScore}%\n\nExecutive Summary:\n${blueprint.executiveSummary}\n\n${blueprint.phases
      .map(
        (p) =>
          `## Phase ${p.phaseNumber}: ${p.name} (${p.durationWeeks}) — ${p.codename}\nObjective: ${p.objective}\n\n### Milestones:\n${p.milestones
            .map((m) => `- [${completedMilestones[m.id] ? "X" : " "}] ${m.title} (${m.effortDays}d, ${m.category}): ${m.deliverable}`)
            .join("\n")}\n\n### Resourcing:\n${p.teamResourcing.map((r) => `- ${r.role} (${r.fte} FTE): ${r.responsibilities}`).join("\n")}\n\n### Key Deliverables:\n${p.criticalDeliverables.map((d) => `- ${d}`).join("\n")}`
      )
      .join("\n\n")}\n\n## Risk Register:\n${blueprint.riskRegister
      .map(
        (r) =>
          `### ${r.title} [${r.category} | Likelihood: ${r.likelihood} | Impact: ${r.impact}]\n- Owner: ${r.owner}\n- Consequence: ${r.consequence}\n- Mitigation: ${r.mitigationStrategy}`
      )
      .join("\n\n")}`;
    navigator.clipboard.writeText(text);
    toast.success("Implementation plan copied as Markdown!");
  };

  const downloadRoadmap = () => {
    const text = `# ${blueprint.scenarioName} — Implementation Roadmap\n\nTimeline: ${blueprint.targetTimelineWeeks} Weeks | Effort: ${blueprint.totalPersonDays} Person-Days | Go-Live: ${blueprint.estimatedGoLive}\nConfidence: ${blueprint.confidenceScore}%\n\nExecutive Summary:\n${blueprint.executiveSummary}\n\n${blueprint.phases
      .map(
        (p) =>
          `## Phase ${p.phaseNumber}: ${p.name} (${p.durationWeeks}) — ${p.codename}\nObjective: ${p.objective}\n\n### Milestones:\n${p.milestones
            .map((m) => `- [${completedMilestones[m.id] ? "X" : " "}] ${m.title} (${m.effortDays}d, ${m.category}): ${m.deliverable}`)
            .join("\n")}`
      )
      .join("\n\n")}`;
    const blob = new Blob([text], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${blueprint.workspaceId}_delivery_plan.md`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success("Delivery plan downloaded as Markdown!");
  };

  const filteredRisks = useMemo(() => {
    if (riskFilter === "All") return blueprint.riskRegister;
    return blueprint.riskRegister.filter((r) => r.category === riskFilter);
  }, [riskFilter, blueprint.riskRegister]);

  return (
    <AppShell>
      <ArtifactHeader
        id="roadmap"
        kicker="Implementation Engine · Step 08"
        title="Delivery Roadmap & Sprint Planning"
      />

      {/* Blueprint Context Banner */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-primary/20 bg-primary/5 px-4 py-2.5 text-xs">
        <div className="flex items-center gap-2">
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          <span className="text-muted-foreground">Delivery Planning Context:</span>
          <span className="font-bold text-foreground">
            {workspaceContext?.businessName || workspaceContext?.name || "Active Workspace"}
          </span>
          <span className="rounded-full bg-primary/10 px-2 py-0.5 font-medium text-primary">
            {workspaceContext?.industry || "Custom Domain"}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/workspace/architecture" className="font-medium text-muted-foreground hover:text-primary transition-colors">
            Architecture →
          </Link>
          <Link to="/workspace/data" className="font-medium text-primary hover:underline">
            Data & APIs →
          </Link>
        </div>
      </div>

      <GenerationSequence steps={GENERATION_STEPS.roadmap} run={() => generateArtifact("roadmap")}>
        <div className="space-y-8 pb-16">
          {/* Top Summary Banner */}
          <Reveal className="neu p-6 md:p-8">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="max-w-3xl space-y-2">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                    <Sparkles className="size-3.5" />
                    AI Planned · 3-Phase Execution Model
                  </span>
                  <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                    Confidence: {blueprint.confidenceScore}%
                  </span>
                </div>
                <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
                  {blueprint.scenarioName}
                </h1>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {blueprint.executiveSummary}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsScenarioModalOpen(true)}
                  className="neu-sm neu-press flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-primary hover:brightness-105"
                >
                  <Scale className="size-3.5" />
                  Compare Scenarios
                </button>
                <button
                  type="button"
                  onClick={() => setIsShareModalOpen(true)}
                  className="neu-sm neu-press flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-foreground hover:text-primary"
                >
                  <Share2 className="size-3.5" />
                  Share Blueprint
                </button>
                <button
                  type="button"
                  onClick={copyRoadmap}
                  className="neu-sm neu-press flex items-center gap-2 px-3.5 py-2 text-xs font-semibold hover:text-primary"
                >
                  <Copy className="size-3.5" />
                  Copy Markdown
                </button>
                <button
                  type="button"
                  onClick={downloadRoadmap}
                  className="neu-sm neu-press flex items-center gap-2 px-3.5 py-2 text-xs font-semibold hover:text-primary"
                >
                  <Download className="size-3.5" />
                  Download Plan
                </button>
                <Link
                  to="/workspace/insights"
                  className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-semibold text-primary-foreground shadow-sm transition hover:opacity-90"
                >
                  Inspect ROI Cockpit
                  <ArrowRight className="size-3.5" />
                </Link>
              </div>
            </div>

            {/* Quick Metrics Bar */}
            <div className="mt-8 grid grid-cols-2 gap-4 border-t border-border/40 pt-6 sm:grid-cols-4">
              <div className="neu-inset p-3.5">
                <div className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
                  <Calendar className="size-3.5 text-primary" />
                  Target Delivery
                </div>
                <p className="mt-1 font-display text-xl font-bold">
                  {blueprint.targetTimelineWeeks} Weeks
                </p>
                <p className="text-[11px] text-muted-foreground">{blueprint.estimatedGoLive}</p>
              </div>

              <div className="neu-inset p-3.5">
                <div className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
                  <Clock className="size-3.5 text-emerald-500" />
                  Total Engineering
                </div>
                <p className="mt-1 font-display text-xl font-bold">
                  <CountUp to={blueprint.totalPersonDays} /> Person-Days
                </p>
                <p className="text-[11px] text-muted-foreground">Across all phases</p>
              </div>

              <div className="neu-inset p-3.5">
                <div className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
                  <FileCheck className="size-3.5 text-blue-500" />
                  Milestone Progress
                </div>
                <p className="mt-1 font-display text-xl font-bold">
                  {doneMilestones} / {totalMilestones}
                </p>
                <p className="text-[11px] text-muted-foreground">{progressPercent}% complete</p>
              </div>

              <div className="neu-inset p-3.5">
                <div className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
                  <ShieldAlert className="size-3.5 text-amber-500" />
                  Active Risks Tracked
                </div>
                <p className="mt-1 font-display text-xl font-bold">
                  {blueprint.riskRegister.length} Factors
                </p>
                <p className="text-[11px] text-muted-foreground">With mitigations</p>
              </div>
            </div>

            {/* Flagged Risks Warning Badges */}
            {flaggedRisks.length > 0 && (
              <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-border/40 pt-4">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Flagged Blueprint Warnings:
                </span>
                {flaggedRisks.map((r) => (
                  <span
                    key={r.id}
                    title={r.detail}
                    className="inline-flex items-center gap-1 rounded-full bg-destructive/10 px-2.5 py-0.5 text-[10px] font-bold text-destructive"
                  >
                    <AlertTriangle className="size-3" />
                    {r.badgeText}
                  </span>
                ))}
              </div>
            )}
          </Reveal>

          {/* Blueprint Completeness & Confidence Score Indicator */}
          <BlueprintConfidenceScore scoreResult={scoreResult} />

          {/* Interactive Gantt Timeline */}
          <Reveal className="neu p-6">
            <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
              <div>
                <h2 className="font-display text-base font-bold">Visual Sprint Timeline (Gantt Projection)</h2>
                <p className="text-xs text-muted-foreground">
                  Phased delivery sequence mapped over {blueprint.targetTimelineWeeks} calendar weeks. Click any phase bar to inspect its sprints.
                </p>
              </div>
              <div className="text-xs font-semibold text-primary">
                Overall Health: On Schedule
              </div>
            </div>

            {/* Week Axis Header - Dynamically sized grid columns */}
            <div className="mt-6 border-b border-border/40 pb-2">
              <div
                className="grid text-center text-[10px] font-bold uppercase tracking-wider text-muted-foreground"
                style={{ gridTemplateColumns: `repeat(${blueprint.targetTimelineWeeks}, minmax(0, 1fr))` }}
              >
                {Array.from({ length: blueprint.targetTimelineWeeks }).map((_, i) => (
                  <div key={i}>W{i + 1}</div>
                ))}
              </div>
            </div>

            {/* Phase Bars */}
            <div className="mt-4 space-y-4">
              {blueprint.phases.map((phase, idx) => {
                const isSelected = idx === activePhaseIndex;
                const leftPercent = (phase.startWeek / blueprint.targetTimelineWeeks) * 100;
                const widthPercent = (phase.durationWeekCount / blueprint.targetTimelineWeeks) * 100;

                return (
                  <div
                    key={phase.id}
                    onClick={() => setActivePhaseIndex(idx)}
                    className={`group cursor-pointer rounded-xl p-3 transition ${
                      isSelected ? "neu-inset ring-1 ring-primary/40" : "hover:bg-muted/40"
                    }`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span
                          className={`size-2 rounded-full ${
                            phase.status === "completed"
                              ? "bg-emerald-500"
                              : phase.status === "in-progress"
                                ? "bg-primary animate-pulse"
                                : "bg-muted-foreground"
                          }`}
                        />
                        <span className="text-xs font-bold">
                          Phase {phase.phaseNumber}: {phase.name}
                        </span>
                        <span className="text-[10px] rounded-full bg-accent px-2 py-0.5 text-muted-foreground">
                          {phase.durationWeeks} · {phase.codename}
                        </span>
                      </div>
                      <span className="text-[11px] font-medium text-muted-foreground">
                        {phase.milestones.filter((m) => completedMilestones[m.id]).length} /{" "}
                        {phase.milestones.length} Milestones
                      </span>
                    </div>

                    {/* Bar track */}
                    <div className="relative mt-2.5 h-3.5 w-full rounded-full bg-muted/60">
                      <motion.div
                        className={`absolute top-0 h-full rounded-full ${
                          isSelected
                            ? "bg-primary shadow-sm"
                            : phase.status === "completed"
                              ? "bg-emerald-500"
                              : "bg-primary/70"
                        }`}
                        style={{ left: `${leftPercent}%`, width: `${widthPercent}%` }}
                        initial={{ opacity: 0, scaleX: 0 }}
                        animate={{ opacity: 1, scaleX: 1 }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </Reveal>

          {/* Phase Navigation Tabs */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/40 pb-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground mr-1">
                Active Phase:
              </span>
              {blueprint.phases.map((p, idx) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setActivePhaseIndex(idx)}
                  className={`flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition ${
                    activePhaseIndex === idx
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "neu hover:bg-accent/40 text-foreground"
                  }`}
                >
                  <span>Phase {p.phaseNumber}</span>
                  <span className="opacity-75 text-[10px]">({p.durationWeeks})</span>
                </button>
              ))}
            </div>
            <span className="text-xs text-muted-foreground font-mono">
              Phase {activePhase.phaseNumber} of {blueprint.phases.length}
            </span>
          </div>

          {/* Detailed Phase Inspection: Milestones & Resourcing */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activePhase.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="grid gap-6 lg:grid-cols-3"
            >
              {/* Left 2 Cols: Milestone Checklist */}
              <div className="lg:col-span-2 space-y-6">
                <div className="neu p-6">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/40 pb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="rounded-md bg-primary/10 px-2.5 py-0.5 text-xs font-bold text-primary">
                          Phase {activePhase.phaseNumber} · {activePhase.codename}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          ({activePhase.durationWeeks})
                        </span>
                      </div>
                      <h3 className="mt-1 font-display text-lg font-bold">{activePhase.name}</h3>
                      <p className="mt-1 text-xs text-muted-foreground">{activePhase.objective}</p>
                    </div>
                  </div>

                  {/* Milestones List */}
                  <div className="mt-5 space-y-3">
                    {activePhase.milestones.map((m) => {
                      const isDone = !!completedMilestones[m.id];
                      return (
                        <div
                          key={m.id}
                          onClick={() => toggleMilestone(m.id)}
                          className={`group flex cursor-pointer items-start gap-3 rounded-xl p-3.5 transition ${
                            isDone ? "bg-emerald-500/5 border border-emerald-500/20" : "neu-inset hover:bg-muted/30"
                          }`}
                        >
                          <button
                            type="button"
                            className="mt-0.5 text-muted-foreground transition hover:text-primary"
                          >
                            <CheckCircle2
                              className={`size-4.5 ${
                                isDone ? "fill-emerald-500 text-background" : "text-border group-hover:text-primary"
                              }`}
                            />
                          </button>
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-baseline justify-between gap-2">
                              <p
                                className={`text-xs font-bold ${
                                  isDone ? "line-through text-muted-foreground" : "text-foreground"
                                }`}
                              >
                                {m.title}
                              </p>
                              <span className="rounded-full bg-accent px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
                                {m.effortDays} Days · {m.category}
                              </span>
                            </div>
                            <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
                              <span className="font-semibold text-foreground/80">Deliverable: </span>
                              {m.deliverable}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Right Col: Team Resourcing & Critical Deliverables */}
              <div className="space-y-6">
                <div className="neu p-6">
                  <div className="flex items-center gap-2">
                    <Users className="size-4 text-primary" />
                    <h3 className="font-display text-sm font-bold">Team Resourcing (FTE)</h3>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Allocated engineering squad for Phase {activePhase.phaseNumber}.
                  </p>

                  <div className="mt-4 space-y-3">
                    {activePhase.teamResourcing.map((res) => (
                      <div key={res.role} className="neu-inset p-3">
                        <div className="flex items-center justify-between text-xs font-bold">
                          <span>{res.role}</span>
                          <span className="rounded bg-primary/10 px-1.5 py-0.5 text-primary text-[11px]">
                            {res.fte} FTE
                          </span>
                        </div>
                        <p className="mt-1 text-[11px] text-muted-foreground leading-snug">
                          {res.responsibilities}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 border-t border-border/40 pt-4">
                    <h4 className="text-xs font-bold">Key Deliverables:</h4>
                    <ul className="mt-2 space-y-1.5 text-xs text-muted-foreground">
                      {activePhase.criticalDeliverables.map((d, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="mt-1 size-1.5 rounded-full bg-primary" />
                          <span>{d}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Risk Mitigation Register */}
          <Reveal className="neu p-6 md:p-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border/40 pb-5">
              <div>
                <div className="flex items-center gap-2">
                  <AlertTriangle className="size-4 text-amber-500" />
                  <h2 className="font-display text-lg font-bold">Enterprise Risk Register & Mitigation</h2>
                </div>
                <p className="text-xs text-muted-foreground">
                  Proactive operational and architectural risk mitigation strategies evaluated by BizzMitra AI.
                </p>
              </div>

              {/* Category Filter Pills */}
              <div className="flex flex-wrap gap-1.5">
                {(["All", "Technical", "Adoption", "Security", "Timeline"] as const).map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setRiskFilter(cat)}
                    className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                      riskFilter === cat ? "bg-primary text-primary-foreground shadow-sm" : "neu-sm hover:text-primary"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Risk Grid */}
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {filteredRisks.map((risk) => (
                <div key={risk.id} className="neu-inset p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="text-xs font-bold leading-snug">{risk.title}</h4>
                    <span className="rounded-full bg-accent px-2 py-0.5 text-[10px] font-semibold text-muted-foreground shrink-0">
                      {risk.category}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-[11px]">
                    <div>
                      <span className="text-muted-foreground">Likelihood: </span>
                      <span
                        className={`font-semibold ${
                          risk.likelihood === "High"
                            ? "text-red-500"
                            : risk.likelihood === "Medium"
                              ? "text-amber-500"
                              : "text-emerald-500"
                        }`}
                      >
                        {risk.likelihood}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Impact: </span>
                      <span
                        className={`font-semibold ${
                          risk.impact === "Critical" || risk.impact === "High"
                            ? "text-red-500"
                            : "text-amber-500"
                        }`}
                      >
                        {risk.impact}
                      </span>
                    </div>
                    <div className="ml-auto text-muted-foreground">
                      Owner: <span className="font-medium text-foreground">{risk.owner}</span>
                    </div>
                  </div>

                  <div className="space-y-1 rounded-lg bg-background/50 p-2.5 text-[11px]">
                    <p className="text-muted-foreground">
                      <span className="font-semibold text-foreground">Consequence: </span>
                      {risk.consequence}
                    </p>
                    <p className="text-muted-foreground">
                      <span className="font-semibold text-primary">Mitigation: </span>
                      {risk.mitigationStrategy}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Reveal>

          <StageNextButton currentStageId="roadmap" label="Proceed to Financial ROI & Readiness" />
        </div>
      </GenerationSequence>

      {/* Scenario Comparison Modal */}
      <ScenarioComparisonModal
        isOpen={isScenarioModalOpen}
        onClose={() => setIsScenarioModalOpen(false)}
        currentBlueprint={blueprint}
        workspaceId={workspaceContext?.id}
      />

      {/* Share Blueprint Modal */}
      <ShareBlueprintModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        blueprintId={workspaceContext?.id}
        blueprintName={blueprint.scenarioName}
      />
    </AppShell>
  );
}
