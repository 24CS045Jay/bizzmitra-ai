import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  BarChart3,
  Building2,
  Check,
  Clock,
  Filter,
  Sliders,
  Sparkles,
  Users,
  Wand2,
  X,
} from "lucide-react";
import { useEffect, useState, useMemo } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

import { AppShell } from "@/components/AppShell";
import { ArtifactHeader } from "@/components/ArtifactHeader";
import { GenerationSequence } from "@/components/GenerationSequence";
import { SolutionStudioDrawer } from "@/components/SolutionStudioDrawer";
import { Stagger, StaggerItem } from "@/components/motion/primitives";
import { GENERATION_STEPS, generateArtifact } from "@/lib/ai/generate-artifact";
import {
  generateDynamicSolution,
  type ProblemFramingData,
  type SolutionData,
  type DynamicSolutionModule,
} from "@/lib/ai/solution-ai";
import {
  getActiveProblemFraming,
  getActiveSolution,
  HR_BUILD_BUY_MATRIX,
  HR_CONSULTANCY_PROBLEM,
  HR_SOLUTION_MODULES,
  type BuildBuyOption,
} from "@/lib/demo-data";
import { supabase } from "@/integrations/supabase/client";
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

export type TimeTag = "All" | "Invest" | "Migrate" | "Tolerate" | "Eliminate";

const TIME_BADGE_STYLES: Record<Exclude<TimeTag, "All">, string> = {
  Invest: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
  Migrate: "bg-primary/10 text-primary border-primary/30",
  Tolerate: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30",
  Eliminate: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30",
};

const MODULE_TIME_TAGS: Record<string, Exclude<TimeTag, "All">> = {
  ats: "Invest",
  "client-portal": "Migrate",
  attendance: "Tolerate",
  analytics: "Invest",
  "legacy-tracker": "Eliminate",
};

function SolutionPage() {
  const [problemText, setProblemText] = useState(HR_CONSULTANCY_PROBLEM);
  const [businessName, setBusinessName] = useState("Enterprise Business");
  const [industry, setIndustry] = useState("Cross-Industry");
  const [isStudioOpen, setIsStudioOpen] = useState(false);
  const [studioSettings, setStudioSettings] = useState(() => loadStudioSettings());
  const [timeFilter, setTimeFilter] = useState<TimeTag>("All");
  const [aiModelLabel, setAiModelLabel] = useState("Groq 120B AI");

  const [framing, setFraming] = useState<ProblemFramingData>(() => getActiveProblemFraming(problemText));
  const [solution, setSolution] = useState<SolutionData>(() => getActiveSolution(problemText));
  const [modules, setModules] = useState<DynamicSolutionModule[]>(() => [
    ...HR_SOLUTION_MODULES.map((m) => ({
      ...m,
      timeTag: MODULE_TIME_TAGS[m.key] ?? ("Invest" as const),
    })),
    {
      key: "legacy-tracker",
      name: "Legacy Manual Spreadsheets & Tracker",
      description: "Informal, untracked manual coordination with zero auditability.",
      icon: "Clock",
      status: "Optional" as const,
      timeTag: "Eliminate" as const,
      features: [
        "Unmitigated data leakage risk",
        "Manual re-entry overhead",
        "Decommission scheduled in Phase 2",
      ],
    },
  ]);
  const [buildBuyMatrix, setBuildBuyMatrix] = useState<BuildBuyOption[]>(HR_BUILD_BUY_MATRIX);

  useEffect(() => {
    if (typeof window === "undefined") return;

    let loadedText = "";
    let bName = "Enterprise Business";
    let ind = "Cross-Industry";

    try {
      const raw = window.localStorage.getItem("bizzmitra.workspaceContext");
      if (raw) {
        const parsed = JSON.parse(raw);
        loadedText = parsed.problemStatement || parsed.summary || "";
        bName = parsed.businessName || bName;
        ind = parsed.industry || ind;
      }
    } catch { }

    const wsId = window.localStorage.getItem("bizzmitra.activeWorkspaceId");

    async function syncAndGenerate() {
      if (wsId && !wsId.startsWith("ws-")) {
        const { data: ws } = await supabase
          .from("workspaces")
          .select("problem_statement, name")
          .eq("id", wsId)
          .maybeSingle();

        if (ws?.problem_statement) {
          loadedText = ws.problem_statement;
          if (ws.name) bName = ws.name;
        }
      }

      if (!loadedText) loadedText = HR_CONSULTANCY_PROBLEM;
      setProblemText(loadedText);
      setBusinessName(bName);
      setIndustry(ind);

      // Trigger dynamic AI generation via Groq 120B
      try {
        const res = await generateDynamicSolution(loadedText, bName, ind);
        setFraming(res.framing);
        setSolution(res.solution);
        setModules(res.modules);
        if (res.buildBuyMatrix && res.buildBuyMatrix.length > 0) {
          setBuildBuyMatrix(res.buildBuyMatrix);
        }
        setAiModelLabel(res.source === "groq-llm" ? "Groq 120B AI" : "BizzMitra Strategic Engine");
      } catch (e) {
        console.warn("[SolutionPage] Dynamic generation error:", e);
      }
    }

    void syncAndGenerate();

    const handleStudioUpdate = (e: Event) => {
      const custom = e as CustomEvent<ReturnType<typeof loadStudioSettings>>;
      if (custom.detail) {
        setStudioSettings(custom.detail);
      }
    };
    window.addEventListener("bizzmitra:studio-updated", handleStudioUpdate);
    return () => window.removeEventListener("bizzmitra:studio-updated", handleStudioUpdate);
  }, []);

  const handleRegenerate = async () => {
    try {
      toast.loading("Regenerating dynamic solution with Groq 120B AI...");
      const res = await generateDynamicSolution(problemText, businessName, industry);
      setFraming(res.framing);
      setSolution(res.solution);
      setModules(res.modules);
      if (res.buildBuyMatrix && res.buildBuyMatrix.length > 0) {
        setBuildBuyMatrix(res.buildBuyMatrix);
      }
      setAiModelLabel(res.source === "groq-llm" ? "Groq 120B AI" : "BizzMitra Strategic Engine");
      toast.dismiss();
      toast.success("Solution successfully regenerated!");
    } catch {
      toast.dismiss();
      toast.error("Failed to regenerate solution");
    }
  };

  return (
    <AppShell>
      <ArtifactHeader
        id="solution"
        kicker="Step 03"
        title="Framing & solution"
        onRegenerate={handleRegenerate}
      />

      {/* Dynamic Model Status Bar */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-primary/20 bg-primary/5 px-3.5 py-2">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/15 px-2.5 py-0.5 text-[11px] font-semibold text-primary">
            <Sparkles className="size-3 animate-pulse text-primary" />
            {aiModelLabel}
          </span>
          <span className="text-[11px] text-muted-foreground">
            Custom Problem Framing, Target Architecture & TIME Portfolio generated for: <strong>{businessName}</strong>
          </span>
        </div>
        <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
          Groq High-Throughput Inference
        </span>
      </div>

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
              <span className="rounded-full bg-sage/15 px-2 py-0.5 text-[10px] font-bold text-sage">
                {studioSettings.customFields.length} Custom Fields
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Live customizer active with {studioSettings.accent} theme accent & {studioSettings.density} density.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleRegenerate}
            className="neu-press flex items-center gap-1.5 rounded-xl border border-primary/30 bg-primary/10 px-3.5 py-2 text-xs font-bold text-primary hover:bg-primary/20"
          >
            <Wand2 className="size-3.5" />
            Regenerate Solution
          </button>
          <button
            type="button"
            onClick={() => setIsStudioOpen(true)}
            className="neu-press flex items-center gap-2 rounded-xl bg-primary px-3.5 py-2 text-xs font-bold text-primary-foreground hover:brightness-105"
          >
            <Sliders className="size-3.5" />
            Open Solution Studio
          </button>
        </div>
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
              {solution.pillars.map((p, idx) => {
                const pillarTags: Exclude<TimeTag, "All">[] = ["Invest", "Migrate", "Tolerate", "Eliminate"];
                const tag = pillarTags[idx % pillarTags.length]!;
                return (
                  <div key={p.title} className="neu-inset px-4 py-3.5 space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-semibold text-foreground">{p.title}</p>
                      <span className={cn("rounded-full px-2 py-0.5 text-[9px] font-bold border", TIME_BADGE_STYLES[tag])}>
                        {tag}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">{p.detail}</p>
                  </div>
                );
              })}
            </div>
          </StaggerItem>

          {/* ═══ 4-Module Recommendation Grid with TIME Filter ═══ */}
          <StaggerItem className="neu p-6">
            <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-wider">
              <Sparkles className="size-3.5" />
              <span>Recommended Solution Modules</span>
            </div>
            <h2 className="mt-1.5 font-display text-xl font-extrabold">
              Delivery Blueprint & TIME Portfolio
            </h2>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
              Classified by the enterprise TIME matrix (Invest, Migrate, Tolerate, Eliminate).
              Filter below to inspect technical and process recommendations by strategic posture.
            </p>

            {/* TIME Framework Filter Control */}
            <div className="mt-5 mb-4 flex flex-wrap items-center justify-between gap-3 border-y border-border/60 py-3">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                <Filter className="size-3.5 text-primary" />
                <span>Filter by TIME Tag:</span>
              </div>
              <div className="flex flex-wrap items-center gap-1.5">
                {(["All", "Invest", "Migrate", "Tolerate", "Eliminate"] as const).map((tag) => {
                  const count =
                    tag === "All"
                      ? modules.length
                      : modules.filter((m) => m.timeTag === tag).length;
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => setTimeFilter(tag)}
                      className={cn(
                        "neu-sm neu-press flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold transition-all",
                        timeFilter === tag
                          ? "bg-primary text-primary-foreground glow-primary"
                          : "text-muted-foreground hover:text-foreground",
                      )}
                    >
                      <span>{tag}</span>
                      <span
                        className={cn(
                          "rounded-full px-1.5 py-0.2 text-[9px]",
                          timeFilter === tag ? "bg-white/25 text-primary-foreground" : "bg-muted text-muted-foreground",
                        )}
                      >
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              {modules
                .filter((mod) => timeFilter === "All" || mod.timeTag === timeFilter)
                .map((mod) => {
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
                            <div className="mt-1 flex items-center gap-1.5">
                              <span
                                className={`inline-block rounded-full px-2 py-0.5 text-[9px] font-bold ${STATUS_COLORS[mod.status] || STATUS_COLORS["Core"]}`}
                              >
                                {mod.status}
                              </span>
                              <span
                                className={cn(
                                  "inline-block rounded-full px-2 py-0.5 text-[9px] font-bold border",
                                  TIME_BADGE_STYLES[mod.timeTag] || TIME_BADGE_STYLES.Invest,
                                )}
                              >
                                {mod.timeTag}
                              </span>
                            </div>
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

            {/* Contextual CTA Strip */}
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <Link
                to="/workspace/solution/crm"
                className="neu-press inline-flex items-center gap-2 rounded-xl bg-card border border-border px-4 py-2.5 text-xs font-bold text-foreground transition-transform hover:scale-[1.02]"
              >
                Inspect Prototype CRM
                <ArrowRight className="size-3.5" />
              </Link>
              <Link
                to="/workspace/architecture"
                className="neu-press inline-flex items-center gap-2.5 rounded-xl bg-primary px-6 py-3 text-sm font-bold text-primary-foreground shadow-lg transition-transform hover:scale-[1.02]"
              >
                Proceed to Architecture (Step 04)
                <ArrowRight className="size-4" />
              </Link>
            </div>
          </StaggerItem>

          {/* ═══ Day 3: Build vs. Buy vs. Hybrid Decision Matrix ═══ */}
          <StaggerItem className="neu p-6">
            <h3 className="font-display text-base font-bold">
              Build vs. Buy vs. Hybrid — Strategic Decision Matrix
            </h3>
            <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
              Each dimension is scored 1–5. Calibrated specifically for {businessName} ({industry}).
            </p>
            <div className="mt-4 space-y-4">
              {buildBuyMatrix.map((row) => {
                const isRec = row.verdict === "Recommended";
                const isViable = row.verdict === "Viable";
                return (
                  <div
                    key={row.option}
                    className={`neu-inset px-4 py-4 ${isRec ? "ring-2 ring-primary/30" : ""}`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span
                        className={`grid size-5 shrink-0 place-items-center rounded-full ${isRec
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
                        className={`ml-auto neu-sm px-2 py-0.5 text-[10px] font-bold ${isRec
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
                          ["Domain Fit", row.fit],
                        ] as [string, number][]
                      ).map(([label, score]) => (
                        <div key={label}>
                          <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
                            {label}
                          </p>
                          <div className="flex items-center gap-1.5">
                            <div className="flex-1 h-2 rounded-full bg-border/60 overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all ${isRec ? "bg-primary" : isViable ? "bg-amber-400" : "bg-muted-foreground/40"
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
                      className={`mt-0.5 grid size-5 shrink-0 place-items-center rounded-full ${good ? "bg-sage text-sage-foreground" : "bg-muted text-muted-foreground"
                        }`}
                    >
                      {good ? <Check className="size-3" /> : <X className="size-3" />}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold">{t.option}</p>
                        <span
                          className={`neu-sm px-2 py-0.5 text-[10px] font-bold ${good ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground"
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
                  {(solution.stack || []).map((s: { layer: string; choice: string; why: string }) => (
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
        onTriggerRegeneration={handleRegenerate}
        onSettingsChange={(newSettings) => setStudioSettings(newSettings)}
      />
    </AppShell>
  );
}
