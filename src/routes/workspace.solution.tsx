import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  BarChart3,
  Building2,
  Check,
  Clock,
  Sliders,
  Sparkles,
  Users,
  Wand2,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";

import { AppShell } from "@/components/AppShell";
import { ArtifactHeader } from "@/components/ArtifactHeader";
import { GenerationSequence } from "@/components/GenerationSequence";
import { SolutionStudioDrawer } from "@/components/SolutionStudioDrawer";
import { Stagger, StaggerItem } from "@/components/motion/primitives";
import { GENERATION_STEPS, generateArtifact } from "@/lib/ai/generate-artifact";
import {
  getActiveProblemFraming,
  getActiveSolution,
  HR_BUILD_BUY_MATRIX,
  HR_CONSULTANCY_PROBLEM,
  HR_SOLUTION_MODULES,
} from "@/lib/demo-data";
import { loadStudioSettings } from "@/lib/solution-studio";

export const Route = createFileRoute("/workspace/solution")({
  head: () => ({
    meta: [
      { title: "Problem Framing & Solution — BizzMitra-AI" },
      {
        name: "description",
        content:
          "Root causes, constraints, quantified impact and the recommended solution with rejected options.",
      },
      { property: "og:title", content: "Problem Framing & Solution — BizzMitra-AI" },
      { property: "og:description", content: "The recommended approach, and why the alternatives lost." },
    ],
  }),
  component: SolutionPage,
});

const MODULE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  Users,
  Building2,
  Clock,
  BarChart3,
};

const STATUS_COLORS: Record<string, string> = {
  Core: "bg-primary text-primary-foreground",
  Recommended: "bg-sage text-sage-foreground",
  Optional: "bg-muted text-muted-foreground",
  Planned: "bg-accent text-accent-foreground",
};

function SolutionPage() {
  const [problemText, setProblemText] = useState(HR_CONSULTANCY_PROBLEM);
  const [isStudioOpen, setIsStudioOpen] = useState(false);
  const [studioSettings, setStudioSettings] = useState(() => loadStudioSettings());

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem("bizzmitra.workspaceContext");
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.problemStatement) {
          setProblemText(parsed.problemStatement);
        }
      }
    } catch {}
  }, []);

  const framing = getActiveProblemFraming(problemText);
  const solution = getActiveSolution(problemText);

  return (
    <AppShell>
      <ArtifactHeader id="solution" kicker="Step 03" title="Framing & solution" />

      {/* Solution Studio Trigger Strip */}
      <div className="mb-6 neu p-3 flex flex-wrap items-center justify-between gap-3 bg-gradient-to-r from-primary/5 via-card to-accent/20">
        <div className="flex items-center gap-2.5">
          <span className="grid size-8 place-items-center rounded-lg bg-primary/10 text-primary">
            <Sparkles className="size-4" />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-extrabold uppercase tracking-wider text-foreground">
                Solution Studio (USP #2)
              </span>
              <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-bold text-primary">
                {studioSettings.version}
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Customize schema fields, UI layout density, and regenerate CRM views in real time.
            </p>
          </div>
        </div>
        <button
          onClick={() => setIsStudioOpen(true)}
          className="neu-press flex items-center gap-2 rounded-xl bg-primary px-3.5 py-2 text-xs font-bold text-primary-foreground hover:brightness-105"
        >
          <Sliders className="size-3.5" />
          Open Solution Studio
        </button>
      </div>

      <GenerationSequence
        steps={GENERATION_STEPS.solution}
        run={() => generateArtifact("solution")}
      >
        <Stagger className="space-y-6">
          {/* Framed Problem Card */}
          <StaggerItem className="neu p-6">
            <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-wider">
              <Sparkles className="size-3.5" />
              <span>AI Business Analysis Synthesis</span>
            </div>
            <h2 className="font-display text-lg font-bold mt-1">Framed Problem Statement</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              {framing.statement}
            </p>
            <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {framing.impact.map((m) => (
                <div key={m.metric} className="neu-inset px-4 py-3">
                  <p className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                    {m.metric}
                  </p>
                  <p className="mt-1 font-display text-xl font-extrabold text-foreground">
                    {m.value}
                  </p>
                </div>
              ))}
            </div>
          </StaggerItem>

          {/* Root Causes & Constraints Grid */}
          <StaggerItem className="grid gap-4 lg:grid-cols-2">
            <div className="neu p-6">
              <h3 className="font-display text-base font-bold">Identified Root Causes</h3>
              <ul className="mt-3 space-y-3">
                {framing.rootCauses.map((r) => (
                  <li key={r.title}>
                    <p className="text-sm font-semibold">{r.title}</p>
                    <p className="text-xs text-muted-foreground leading-relaxed">{r.detail}</p>
                  </li>
                ))}
              </ul>
            </div>
            <div className="neu p-6">
              <h3 className="font-display text-base font-bold">Operational Constraints</h3>
              <ul className="mt-3 space-y-2.5 text-sm text-muted-foreground">
                {framing.constraints.map((c) => (
                  <li key={c} className="flex gap-2">
                    <span className="mt-2 size-1.5 shrink-0 rounded-full bg-clay" />
                    <span className="leading-relaxed">{c}</span>
                  </li>
                ))}
              </ul>
            </div>
          </StaggerItem>

          {/* Recommended Solution Suite */}
          <StaggerItem className="neu p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
              AI Solution Recommendation
            </p>
            <h2 className="mt-1.5 font-display text-2xl font-extrabold">{solution.headline}</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{solution.summary}</p>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {solution.pillars.map((p) => (
                <div key={p.title} className="neu-inset px-4 py-3.5">
                  <p className="text-sm font-semibold text-foreground">{p.title}</p>
                  <p className="mt-1 text-xs text-muted-foreground leading-relaxed">{p.detail}</p>
                </div>
              ))}
            </div>
          </StaggerItem>

          {/* ═══ Day 3: 4-Module Recommendation Grid ═══ */}
          <StaggerItem className="neu p-6">
            <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-wider">
              <Sparkles className="size-3.5" />
              <span>Recommended Solution Modules</span>
            </div>
            <h2 className="mt-1.5 font-display text-xl font-extrabold">
              4-Module Delivery Blueprint
            </h2>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
              Each module is independently deployable. Core modules ship in the MVP phase;
              Recommended and Planned modules follow in subsequent sprints.
            </p>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              {HR_SOLUTION_MODULES.map((mod) => {
                const Icon = MODULE_ICONS[mod.icon] || Users;
                return (
                  <div
                    key={mod.key}
                    className="neu-inset p-4 flex flex-col gap-3 transition-all hover:scale-[1.01]"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                          <Icon className="size-4.5" />
                        </span>
                        <div>
                          <p className="text-sm font-bold leading-tight">{mod.name}</p>
                          <span
                            className={`mt-1 inline-block rounded-full px-2 py-0.5 text-[10px] font-bold ${STATUS_COLORS[mod.status]}`}
                          >
                            {mod.status}
                          </span>
                        </div>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {mod.description}
                    </p>
                    <ul className="mt-auto space-y-1.5">
                      {mod.features.map((f) => (
                        <li key={f} className="flex items-start gap-2 text-xs text-muted-foreground">
                          <Check className="mt-0.5 size-3 shrink-0 text-sage" />
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>

            {/* CRM CTA */}
            <div className="mt-6 flex justify-center">
              <Link
                to="/workspace/solution/crm"
                className="neu-press inline-flex items-center gap-2.5 rounded-xl bg-primary px-6 py-3 text-sm font-bold text-primary-foreground shadow-lg transition-transform hover:scale-[1.02]"
              >
                Explore Interactive HR CRM
                <ArrowRight className="size-4" />
              </Link>
            </div>
          </StaggerItem>

          {/* ═══ Day 3: Build vs. Buy vs. Hybrid Decision Matrix ═══ */}
          <StaggerItem className="neu p-6">
            <h3 className="font-display text-base font-bold">
              Build vs. Buy vs. Hybrid — Decision Matrix
            </h3>
            <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
              Each dimension is scored 1–5. Higher is better for your agency context.
            </p>
            <div className="mt-4 space-y-4">
              {HR_BUILD_BUY_MATRIX.map((row) => {
                const isRec = row.verdict === "Recommended";
                const isViable = row.verdict === "Viable";
                return (
                  <div
                    key={row.option}
                    className={`neu-inset px-4 py-4 ${isRec ? "ring-2 ring-primary/30" : ""}`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span
                        className={`grid size-5 shrink-0 place-items-center rounded-full ${
                          isRec
                            ? "bg-sage text-sage-foreground"
                            : isViable
                              ? "bg-accent text-accent-foreground"
                              : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {isRec ? <Check className="size-3" /> : <X className="size-3" />}
                      </span>
                      <p className="text-sm font-bold">{row.option}</p>
                      <span
                        className={`ml-auto neu-sm px-2 py-0.5 text-[10px] font-bold ${
                          isRec
                            ? "text-emerald-600 dark:text-emerald-400"
                            : isViable
                              ? "text-amber-600 dark:text-amber-400"
                              : "text-muted-foreground"
                        }`}
                      >
                        {row.verdict}
                      </span>
                    </div>

                    {/* Score bars */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3">
                      {(
                        [
                          ["Cost Efficiency", row.cost],
                          ["Delivery Speed", row.speed],
                          ["Control", row.control],
                          ["Agency Fit", row.fit],
                        ] as [string, number][]
                      ).map(([label, score]) => (
                        <div key={label}>
                          <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
                            {label}
                          </p>
                          <div className="flex items-center gap-1.5">
                            <div className="flex-1 h-2 rounded-full bg-border/60 overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all ${
                                  isRec ? "bg-primary" : isViable ? "bg-amber-400" : "bg-muted-foreground/40"
                                }`}
                                style={{ width: `${(score / 5) * 100}%` }}
                              />
                            </div>
                            <span className="text-xs font-bold tabular-nums">{score}/5</span>
                          </div>
                        </div>
                      ))}
                    </div>

                    <p className="mt-3 text-xs text-muted-foreground leading-relaxed">
                      {row.rationale}
                    </p>
                  </div>
                );
              })}
            </div>
          </StaggerItem>

          {/* Options Considered: Build vs Buy vs Hybrid */}
          <StaggerItem className="neu p-6">
            <h3 className="font-display text-base font-bold">Options Considered: Trade-Off Analysis</h3>
            <div className="mt-3 space-y-3">
              {solution.tradeoffs.map((t) => {
                const good = t.verdict === "Recommended";
                return (
                  <div key={t.option} className="neu-inset flex gap-3 px-4 py-3.5">
                    <span
                      className={`mt-0.5 grid size-5 shrink-0 place-items-center rounded-full ${
                        good ? "bg-sage text-sage-foreground" : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {good ? <Check className="size-3" /> : <X className="size-3" />}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold">{t.option}</p>
                        <span
                          className={`neu-sm px-2 py-0.5 text-[10px] font-bold ${
                            good ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground"
                          }`}
                        >
                          {t.verdict}
                        </span>
                      </div>
                      <p className="mt-0.5 text-xs text-muted-foreground leading-relaxed">{t.why}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </StaggerItem>

          {/* Recommended Tech Stack Table */}
          <StaggerItem className="neu p-6">
            <h3 className="font-display text-base font-bold">Recommended Technology Stack</h3>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground border-b border-border">
                    <th className="pb-2 pr-4 font-semibold">Architectural Layer</th>
                    <th className="pb-2 pr-4 font-semibold">Recommended Choice</th>
                    <th className="pb-2 font-semibold">Selection Rationale</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {solution.stack.map((s) => (
                    <tr key={s.layer} className="align-top hover:bg-card/40 transition-colors">
                      <td className="py-3 pr-4 text-xs text-muted-foreground font-medium">{s.layer}</td>
                      <td className="py-3 pr-4 text-xs font-bold text-foreground">{s.choice}</td>
                      <td className="py-3 text-xs text-muted-foreground leading-relaxed">{s.why}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </StaggerItem>
        </Stagger>
      </GenerationSequence>

      {/* Solution Studio Slide-Out Drawer */}
      <SolutionStudioDrawer
        isOpen={isStudioOpen}
        onClose={() => setIsStudioOpen(false)}
        onSettingsChange={(newSettings) => setStudioSettings(newSettings)}
      />
    </AppShell>
  );
}
