import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import {
  AlertTriangle,
  ArrowRight,
  Calendar,
  CheckCircle2,
  Clock,
  Eye,
  Globe,
  Lock,
  Route as RouteIcon,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";
import { CountUp, Reveal, Stagger, StaggerItem } from "@/components/motion/primitives";
import { ThemeToggle } from "@/components/ThemeToggle";
import { BlueprintConfidenceScore } from "@/components/BlueprintConfidenceScore";
import { getRoadmapForWorkspace } from "@/lib/planning-data";
import { evaluateBlueprintRisks } from "@/lib/risk-evaluator";

export const Route = createFileRoute("/share/$token")({
  head: () => ({
    meta: [
      { title: "Shared Blueprint — BizzMitra-AI" },
      { name: "description", content: "Public read-only view of enterprise delivery blueprint." },
      { property: "og:title", content: "Shared Blueprint — BizzMitra-AI" },
    ],
  }),
  component: SharedBlueprintPage,
});

function SharedBlueprintPage() {
  const { token } = useParams({ from: "/share/$token" });
  const [activePhaseIndex, setActivePhaseIndex] = useState(0);

  // Load blueprint context
  const blueprint = useMemo(() => getRoadmapForWorkspace(null), []);
  const { flaggedRisks, scoreResult } = useMemo(
    () => evaluateBlueprintRisks(blueprint, null),
    [blueprint],
  );

  const activePhase = blueprint.phases[activePhaseIndex] ?? blueprint.phases[0]!;
  const totalMilestones = blueprint.phases.reduce((acc, p) => acc + p.milestones.length, 0);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Public Top Header */}
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-border/80 bg-background/90 px-6 py-3.5 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <Link to="/" className="flex items-center gap-2 group">
            <img
              src="/logo.png"
              alt="BizzMitra"
              className="size-8 rounded-lg object-cover shadow-sm ring-1 ring-primary/40 group-hover:scale-105 transition-transform"
            />
            <span className="font-display text-base font-extrabold tracking-tight group-hover:text-primary transition-colors">BizzMitra</span>
          </Link>
          <span className="hidden sm:inline-block text-border">/</span>
          <div className="hidden sm:flex items-center gap-1.5 rounded-full bg-muted/60 px-2.5 py-1 text-[11px] font-semibold text-muted-foreground">
            <Eye className="size-3 text-primary" />
            <span>Public Read-Only Blueprint</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Link
            to="/signup"
            className="neu-press inline-flex items-center gap-2 rounded-xl bg-primary px-3.5 py-2 text-xs font-bold text-primary-foreground glow-primary"
          >
            Create Your Blueprint
            <ArrowRight className="size-3.5" />
          </Link>
        </div>
      </header>

      {/* Main Blueprint View */}
      <main className="mx-auto max-w-5xl px-5 py-8 space-y-8">
        {/* Banner Notice */}
        <div className="neu p-3.5 flex items-center justify-between gap-3 bg-primary/5 border border-primary/20">
          <div className="flex items-center gap-2.5 text-xs text-muted-foreground">
            <Lock className="size-4 text-primary shrink-0" />
            <span>
              Viewing snapshot <span className="font-mono font-bold text-foreground">#{token}</span>. Editing and generation actions are disabled in public view.
            </span>
          </div>
          <span className="neu-sm px-2 py-0.5 text-[10px] font-bold text-primary shrink-0">
            Read-Only
          </span>
        </div>

        {/* Top Summary Banner */}
        <Reveal className="neu p-6 md:p-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-3xl space-y-2">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                  <Sparkles className="size-3.5" />
                  AI Planned · {blueprint.phases.length}-Phase Execution Model
                </span>
                <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                  Confidence: {blueprint.confidenceScore}%
                </span>
              </div>
              <h1 className="font-display text-2xl font-extrabold tracking-tight sm:text-4xl text-foreground">
                {blueprint.scenarioName}
              </h1>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {blueprint.executiveSummary}
              </p>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="mt-6 grid grid-cols-2 gap-3 border-t border-border pt-6 sm:grid-cols-4">
            <div className="neu-inset p-3.5">
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                Target Timeline
              </p>
              <p className="mt-1 font-display text-xl font-bold text-foreground">
                {blueprint.targetTimelineWeeks} Weeks
              </p>
              <p className="text-[11px] text-muted-foreground">{blueprint.estimatedGoLive}</p>
            </div>
            <div className="neu-inset p-3.5">
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                Total Effort
              </p>
              <p className="mt-1 font-display text-xl font-bold text-foreground">
                <CountUp to={blueprint.totalPersonDays} /> Person-Days
              </p>
              <p className="text-[11px] text-muted-foreground">Across all workstreams</p>
            </div>
            <div className="neu-inset p-3.5">
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                Execution Phases
              </p>
              <p className="mt-1 font-display text-xl font-bold text-foreground">
                {blueprint.phases.length} Phases
              </p>
              <p className="text-[11px] text-muted-foreground">{totalMilestones} Milestones</p>
            </div>
            <div className="neu-inset p-3.5">
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                Risk Register
              </p>
              <p className="mt-1 font-display text-xl font-bold text-foreground">
                {blueprint.riskRegister.length} Factors
              </p>
              <p className="text-[11px] text-muted-foreground">Audited & Mitigated</p>
            </div>
          </div>
        </Reveal>

        {/* Confidence Score Section */}
        <BlueprintConfidenceScore scoreResult={scoreResult} />

        {/* Interactive Delivery Timeline Gantt Strip */}
        <div className="neu p-6 md:p-8">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-6">
            <div>
              <h2 className="font-display text-xl font-bold text-foreground">
                Execution Timeline & Critical Path
              </h2>
              <p className="text-xs text-muted-foreground">
                Phased delivery sequence mapped over {blueprint.targetTimelineWeeks} calendar weeks.
              </p>
            </div>
          </div>

          {/* Gantt Bar Visualization */}
          <div className="space-y-4">
            <div className="grid grid-cols-12 gap-1 text-center text-[10px] font-mono text-muted-foreground border-b border-border pb-2">
              {Array.from({ length: blueprint.targetTimelineWeeks }).map((_, i) => (
                <div key={i}>W{i + 1}</div>
              ))}
            </div>

            <div className="space-y-3 pt-2">
              {blueprint.phases.map((phase, idx) => {
                const leftPercent = (phase.startWeek / blueprint.targetTimelineWeeks) * 100;
                const widthPercent = (phase.durationWeekCount / blueprint.targetTimelineWeeks) * 100;
                const isSelected = activePhaseIndex === idx;

                return (
                  <div key={phase.id} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold flex items-center gap-1.5">
                        <span className="size-2 rounded-full bg-primary" />
                        {phase.name}
                      </span>
                      <span className="text-muted-foreground text-[11px]">
                        {phase.durationWeekCount} Weeks ({phase.durationWeeks})
                      </span>
                    </div>

                    <div className="h-8 rounded-xl bg-muted/30 p-1 relative overflow-hidden">
                      <div
                        style={{ left: `${leftPercent}%`, width: `${widthPercent}%` }}
                        onClick={() => setActivePhaseIndex(idx)}
                        className={`absolute top-1 bottom-1 rounded-lg cursor-pointer transition-all flex items-center px-3 text-[11px] font-bold text-primary-foreground ${
                          isSelected ? "bg-primary shadow-md glow-primary" : "bg-primary/70 hover:bg-primary"
                        }`}
                      >
                        <span className="truncate">{phase.milestones.length} Milestones</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Milestones & Deliverables Detail */}
        <div className="neu p-6 md:p-8 space-y-6">
          <div className="flex items-center justify-between border-b border-border pb-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-primary">
                Active Phase Inspection
              </span>
              <h3 className="font-display text-lg font-bold text-foreground">
                {activePhase.name} — Workstream Breakdown
              </h3>
            </div>
            <span className="neu-sm px-3 py-1 text-xs font-bold text-muted-foreground">
              {activePhase.milestones.length} Key Milestones
            </span>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {activePhase.milestones.map((m) => (
              <div key={m.id} className="neu-inset p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-bold text-foreground leading-tight">{m.title}</p>
                  <span className="neu-sm px-2 py-0.5 text-[9px] font-mono font-bold text-primary shrink-0">
                    {m.category}
                  </span>
                </div>
                <div className="space-y-1.5 border-t border-border/60 pt-2">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    Key Deliverable
                  </p>
                  <div className="flex items-start gap-1.5 text-xs text-muted-foreground">
                    <CheckCircle2 className="size-3.5 text-emerald-500 shrink-0 mt-0.5" />
                    <span>{m.deliverable}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-2 text-[11px] text-muted-foreground">
                  <span>Status: <strong className={m.completed ? "text-emerald-500" : "text-amber-500"}>{m.completed ? "Completed" : "In Progress"}</strong></span>
                  <span>{m.effortDays} Person-Days</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Risk Register Table */}
        <div className="neu p-6 md:p-8 space-y-4">
          <h3 className="font-display text-lg font-bold text-foreground">
            Risk Register & Mitigation Strategy
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-border text-muted-foreground uppercase text-[10px]">
                <tr>
                  <th className="pb-3 font-semibold">Category</th>
                  <th className="pb-3 font-semibold">Risk Factor</th>
                  <th className="pb-3 font-semibold">Impact</th>
                  <th className="pb-3 font-semibold">Mitigation Strategy</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60 text-muted-foreground">
                {blueprint.riskRegister.map((r) => (
                  <tr key={r.id}>
                    <td className="py-3 font-bold text-foreground">{r.category}</td>
                    <td className="py-3 pr-4 font-medium text-foreground">{r.title}</td>
                    <td className="py-3 pr-4">
                      <span
                        className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-bold ${
                          r.impact === "High" || r.impact === "Critical"
                            ? "bg-rose-500/10 text-rose-600"
                            : r.impact === "Medium"
                              ? "bg-amber-500/10 text-amber-600"
                              : "bg-emerald-500/10 text-emerald-600"
                        }`}
                      >
                        {r.impact}
                      </span>
                    </td>
                    <td className="py-3">{r.mitigationStrategy}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* CTA Footer */}
        <div className="neu p-8 text-center space-y-3 bg-gradient-to-br from-primary/5 via-card to-primary/10">
          <span className="grid size-10 place-items-center rounded-xl bg-primary text-primary-foreground mx-auto font-display font-extrabold shadow-sm">
            B
          </span>
          <h3 className="font-display text-xl font-extrabold">Build Your Own Enterprise Blueprint</h3>
          <p className="text-xs text-muted-foreground max-w-md mx-auto">
            Turn complex business problems into implementation-ready delivery roadmaps, BPMN flows, and system architectures in minutes.
          </p>
          <div className="pt-2">
            <Link
              to="/signup"
              className="neu-press inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-bold text-primary-foreground glow-primary"
            >
              Get Started with BizzMitra-AI
              <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
