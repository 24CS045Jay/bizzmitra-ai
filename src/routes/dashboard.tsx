import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import {
  AlertTriangle,
  ArrowRight,
  ArrowUpRight,
  Bot,
  Calendar,
  CheckCircle2,
  Clock,
  LayoutGrid,
  Plus,
  ShieldAlert,
  Sparkles,
  Users,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { AppShell } from "@/components/AppShell";
import { CountUp, Reveal, Stagger, StaggerItem } from "@/components/motion/primitives";
import { useAuth, isTestingAccount } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { getRoadmapForWorkspace } from "@/lib/planning-data";
import { evaluateBlueprintRisks } from "@/lib/risk-evaluator";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Command Center — BizzMitra-AI" },
      { name: "description", content: "Executive blueprint command center and active transformation progress." },
      { property: "og:title", content: "Command Center — BizzMitra-AI" },
      { property: "og:description", content: "Track blueprint completion, top risks, and next action items." },
    ],
  }),
  component: DashboardPage,
});

function ProgressRing({ value, size = 56, stroke = 5 }: { value: number; size?: number; stroke?: number }) {
  const r = (size - stroke * 2) / 2;
  const c = 2 * Math.PI * r;
  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="shrink-0 -rotate-90" style={{ width: size, height: size }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={stroke} className="stroke-border" />
      <motion.circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        strokeWidth={stroke}
        strokeLinecap="round"
        className="stroke-primary"
        strokeDasharray={c}
        initial={{ strokeDashoffset: c }}
        whileInView={{ strokeDashoffset: c - (c * value) / 100 }}
        viewport={{ once: true }}
        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
      />
    </svg>
  );
}

function DashboardPage() {
  const { user } = useAuth();
  const isTest = isTestingAccount(user?.email);
  const [workspaces, setWorkspaces] = useState<Tables<"workspaces">[]>([]);
  const [artifactCount, setArtifactCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Active workspace name
  const [activeWsName, setActiveWsName] = useState(() => (isTest ? "TalentCraft HR Consultancy" : ""));

  useEffect(() => {
    if (!user) return;
    async function loadWorkspaces() {
      let query = supabase.from("workspaces").select("*");
      if (!isTest && user?.id) {
        query = query.eq("owner_id", user.id);
      }
      const { data, error } = await query.order("updated_at", { ascending: false });
      if (error) toast.error(error.message);
      else {
        const list = data ?? [];
        setWorkspaces(list);
        if (list.length > 0) {
          const activeId = window.localStorage.getItem("bizzmitra.activeWorkspaceId");
          const found = list.find((w) => w.id === activeId) || list[0];
          if (found?.name) {
            setActiveWsName(found.name);
            window.localStorage.setItem("bizzmitra.activeWorkspaceId", found.id);
          }
        } else if (isTest) {
          setActiveWsName("TalentCraft HR Consultancy");
        } else {
          setActiveWsName("");
        }
      }

      const { count } = await supabase
        .from("artifacts")
        .select("id", { count: "exact", head: true });
      setArtifactCount(count ?? 0);
      setLoading(false);
    }
    void loadWorkspaces();
  }, [user, isTest]);

  // Evaluate risks and action items for the active workspace
  const blueprint = useMemo(
    () => getRoadmapForWorkspace({ name: activeWsName || "My Workspace" }),
    [activeWsName],
  );
  const { topRisks, actionItems, scoreResult, flaggedRisks } = useMemo(
    () => evaluateBlueprintRisks(blueprint, { name: activeWsName || "My Workspace" }),
    [blueprint, activeWsName],
  );

  const averageMaturity = workspaces.length
    ? Math.round(workspaces.reduce((total, workspace) => total + workspace.maturity_score, 0) / workspaces.length)
    : scoreResult.score;

  function triggerCopilot(promptText: string) {
    window.dispatchEvent(new CustomEvent("bizzmitra:open-copilot", { detail: { prompt: promptText } }));
  }

  return (
    <AppShell>
      {!loading && workspaces.length === 0 && !isTest ? (
        <Reveal>
          <div className="neu mt-4 p-8 sm:p-12 text-center rounded-3xl border border-dashed border-border/80 bg-gradient-to-b from-card/60 via-card to-background shadow-xl">
            <div className="mx-auto grid size-16 place-items-center rounded-2xl bg-primary/10 text-primary shadow-inner">
              <Sparkles className="size-8" />
            </div>
            <h1 className="mt-5 font-display text-2xl font-extrabold text-foreground sm:text-3xl">
              Welcome to BizzMitra AI
            </h1>
            <p className="mx-auto mt-2 max-w-lg text-xs sm:text-sm text-muted-foreground leading-relaxed">
              You haven't set up any business workspaces yet. Frame your operational challenge, upload your documents, or enter a prompt to generate your custom digital blueprint.
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <Link
                to="/workspace/new"
                className="neu-press inline-flex items-center gap-2 rounded-2xl bg-primary px-6 py-3.5 text-xs sm:text-sm font-bold text-primary-foreground shadow-xl glow-primary hover:brightness-105"
              >
                <Plus className="size-4" />
                <span>Create Your First Workspace</span>
                <ArrowRight className="size-4" />
              </Link>
            </div>

            <div className="mt-10 grid gap-4 sm:grid-cols-3 text-left border-t border-border/60 pt-8 max-w-3xl mx-auto">
              <div className="neu-inset p-4 space-y-1.5">
                <span className="text-[10px] font-extrabold uppercase text-primary tracking-wider">Step 01</span>
                <p className="text-xs font-bold text-foreground">Multi-Modal Intake</p>
                <p className="text-[11px] text-muted-foreground">Enter text, upload PDFs/CSVs, or record voice input.</p>
              </div>
              <div className="neu-inset p-4 space-y-1.5">
                <span className="text-[10px] font-extrabold uppercase text-primary tracking-wider">Step 02</span>
                <p className="text-xs font-bold text-foreground">AI Diagnostic & Solution</p>
                <p className="text-[11px] text-muted-foreground">Auto-generate interactive BPMN workflows, wireframes, and working CRM.</p>
              </div>
              <div className="neu-inset p-4 space-y-1.5">
                <span className="text-[10px] font-extrabold uppercase text-primary tracking-wider">Step 03</span>
                <p className="text-xs font-bold text-foreground">Roadmap & Governance</p>
                <p className="text-[11px] text-muted-foreground">Track financial ROI models, DPDP compliance risks, and sprint timelines.</p>
              </div>
            </div>
          </div>
        </Reveal>
      ) : (
        <>
          {/* Executive Command Center Header */}
          <Reveal>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/15 px-2.5 py-0.5 text-[10px] font-bold text-primary uppercase tracking-wider">
                    <Sparkles className="size-3" />
                    Live Command Center
                  </span>
                  <span className="text-xs text-muted-foreground">· Active Blueprint: <strong className="text-foreground">{activeWsName}</strong></span>
                </div>
                <h1 className="mt-1 font-display text-3xl font-extrabold sm:text-4xl">
                  Transformation Cockpit
                </h1>
                <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
                  Real-time portfolio overview of blueprint completeness, active risk exposure, and immediate execution milestones.
                </p>
              </div>

              <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => triggerCopilot("Summarize my current transformation status and top risk")}
              className="neu-sm neu-press flex items-center gap-2 px-3.5 py-2.5 text-xs font-bold text-primary hover:brightness-105"
            >
              <Bot className="size-4" />
              <span>Ask Copilot</span>
            </button>
            <Link
              to="/workspace/roadmap"
              className="neu-press flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-bold text-primary-foreground glow-primary"
            >
              <span>View Full Roadmap</span>
              <ArrowRight className="size-3.5" />
            </Link>
          </div>
        </div>
      </Reveal>

      {/* ═══ Top 4 Command Center Summary Cards ═══ */}
      <Stagger className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Card 1: Blueprint Completion % */}
        <StaggerItem className="neu p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Blueprint Completion
            </span>
            <span className="neu-sm px-2 py-0.5 text-[9px] font-bold text-primary">
              {scoreResult.grade}
            </span>
          </div>
          <div className="my-3 flex items-center gap-4">
            <div className="relative grid place-items-center">
              <ProgressRing value={scoreResult.score} size={64} stroke={6} />
              <span className="absolute font-display text-sm font-extrabold">
                {scoreResult.score}%
              </span>
            </div>
            <div>
              <p className="font-display text-lg font-extrabold text-foreground">
                {scoreResult.score >= 80 ? "Audit Ready" : "In Progress"}
              </p>
              <p className="text-[11px] text-muted-foreground leading-tight">
                {scoreResult.breakdown.filter((d) => d.completed).length} of {scoreResult.breakdown.length} sections locked
              </p>
            </div>
          </div>
          <p className="text-[10px] text-primary truncate font-medium">
            💡 {scoreResult.improvementHint}
          </p>
        </StaggerItem>

        {/* Card 2: Open Risks Summary */}
        <StaggerItem className="neu p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Flagged Open Risks
            </span>
            <span className="rounded-full bg-rose-500/10 px-2 py-0.5 text-[9px] font-bold text-rose-600 dark:text-rose-400">
              {topRisks.length} High Priority
            </span>
          </div>
          <div className="my-3">
            <p className="font-display text-2xl font-extrabold text-foreground">
              {blueprint.riskRegister.length} Total Risks
            </p>
            <p className="text-[11px] text-muted-foreground mt-0.5 truncate">
              Highest: {topRisks[0]?.title ?? "Data Integration Bottleneck"}
            </p>
          </div>
          <Link
            to="/workspace/roadmap"
            className="flex items-center gap-1 text-[11px] font-bold text-primary hover:underline"
          >
            <span>Review Risk Register</span>
            <ArrowRight className="size-3" />
          </Link>
        </StaggerItem>

        {/* Card 3: Next Milestones */}
        <StaggerItem className="neu p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Next Action Items
            </span>
            <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[9px] font-bold text-emerald-600 dark:text-emerald-400">
              Sprint 1
            </span>
          </div>
          <div className="my-3">
            <p className="font-display text-2xl font-extrabold text-foreground">
              {actionItems.length} Milestones
            </p>
            <p className="text-[11px] text-muted-foreground mt-0.5 truncate">
              {actionItems[0]?.title ?? "Architecture Baseline"}
            </p>
          </div>
          <Link
            to="/workspace/roadmap"
            className="flex items-center gap-1 text-[11px] font-bold text-primary hover:underline"
          >
            <span>Inspect Sprints</span>
            <ArrowRight className="size-3" />
          </Link>
        </StaggerItem>

        {/* Card 4: AI Copilot Shortcut */}
        <StaggerItem className="neu p-5 flex flex-col justify-between bg-primary/5 border-primary/20">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-primary">
              AI Copilot Assistant
            </span>
            <Sparkles className="size-3.5 text-primary" />
          </div>
          <div className="my-2 space-y-1">
            <p className="text-xs font-bold text-foreground">Have questions about your blueprint?</p>
            <p className="text-[11px] text-muted-foreground leading-snug">
              Instant answers grounded on your Supabase artifacts.
            </p>
          </div>
          <button
            type="button"
            onClick={() => triggerCopilot("What is my biggest open risk and how do I fix it?")}
            className="neu-press w-full rounded-xl bg-primary py-2 text-xs font-bold text-primary-foreground glow-primary flex items-center justify-center gap-1.5"
          >
            <Bot className="size-3.5" />
            <span>Launch Copilot</span>
          </button>
        </StaggerItem>
      </Stagger>

      {/* ═══ Section: Top 3 Flagged Risks & Next 3 Action Items Grid ═══ */}
      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        {/* Top 3 Flagged Risks */}
        <div className="neu p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div className="flex items-center gap-2">
              <ShieldAlert className="size-4 text-rose-500" />
              <h2 className="font-display text-base font-bold text-foreground">
                Top 3 Flagged Risks
              </h2>
            </div>
            <Link
              to="/workspace/roadmap"
              className="text-xs font-semibold text-primary hover:underline"
            >
              All Risks →
            </Link>
          </div>

          <div className="space-y-3">
            {topRisks.map((risk) => (
              <div key={risk.id} className="neu-inset p-3.5 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-xs font-bold text-foreground leading-snug">{risk.title}</p>
                  <span className="inline-flex items-center gap-1 rounded-full bg-destructive/10 px-2 py-0.5 text-[9px] font-bold text-destructive shrink-0">
                    <AlertTriangle className="size-2.5" />
                    {risk.badgeText}
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  {risk.detail}
                </p>
                <div className="flex items-center justify-between border-t border-border/50 pt-2 text-[10px] text-muted-foreground">
                  <span>Domain: <strong className="text-foreground">{risk.section}</strong></span>
                  <span className="text-primary font-medium">{risk.remediation}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Next 3 Action Items */}
        <div className="neu p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="size-4 text-emerald-500" />
              <h2 className="font-display text-base font-bold text-foreground">
                Next 3 Action Items
              </h2>
            </div>
            <Link
              to="/workspace/roadmap"
              className="text-xs font-semibold text-primary hover:underline"
            >
              Sprint Plan →
            </Link>
          </div>

          <div className="space-y-3">
            {actionItems.map((item, idx) => (
              <div key={item.id} className="neu-inset p-3.5 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="grid size-5 place-items-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">
                      {idx + 1}
                    </span>
                    <p className="text-xs font-bold text-foreground leading-snug">{item.title}</p>
                  </div>
                  <span className="neu-sm px-2 py-0.5 text-[9px] font-bold text-foreground shrink-0">
                    {item.timeline}
                  </span>
                </div>
                <div className="flex items-center justify-between pt-1 text-[11px] text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Users className="size-3 text-muted-foreground" />
                    Lead: <strong className="text-foreground">{item.owner}</strong>
                  </span>
                  <span>{item.phase}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ═══ Section: Workspaces Board ═══ */}
      <div className="mt-10">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display text-xl font-bold text-foreground">All Transformation Workspaces</h2>
            <p className="text-xs text-muted-foreground">Switch or create blueprints for client initiatives.</p>
          </div>
          <Link
            to="/workspace/new"
            className="neu-press flex items-center gap-2 rounded-xl bg-primary px-3.5 py-2.5 text-xs font-bold text-primary-foreground glow-primary"
          >
            <Plus className="size-4" /> New workspace
          </Link>
        </div>

        <Stagger className="mt-4 grid gap-4 lg:grid-cols-2">
          {loading ? <p className="text-sm text-muted-foreground">Loading workspaces…</p> : null}
          {!loading && workspaces.length === 0 ? (
            <p className="text-sm text-muted-foreground">No workspaces yet. Start with a new intake.</p>
          ) : null}
          {workspaces.map((w) => (
            <StaggerItem key={w.name}>
              <motion.div whileHover={{ y: -4, scale: 1.015 }} transition={{ duration: 0.15 }}>
                <Link
                  to="/workspace/discovery"
                  onClick={() => window.localStorage.setItem("bizzmitra.activeWorkspaceId", w.id)}
                  className="neu block p-5"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-display text-lg font-bold leading-tight">{w.name}</h3>
                        {/* Risk Warning Badge if incomplete */}
                        {w.maturity_score < 75 && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-destructive/10 px-2 py-0.5 text-[9px] font-bold text-destructive">
                            <AlertTriangle className="size-2.5" />
                            Action Needed
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {w.status} · Updated {new Date(w.updated_at).toLocaleDateString()}
                      </p>
                    </div>
                    <ArrowUpRight className="size-4 shrink-0 text-muted-foreground" />
                  </div>
                  <div className="mt-5 flex items-center gap-4">
                    <div className="relative grid place-items-center">
                      <ProgressRing value={w.maturity_score} />
                      <span className="absolute font-display text-[11px] font-extrabold">
                        {w.maturity_score}%
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[11px] text-muted-foreground">Blueprint completeness</p>
                      <div className="neu-inset mt-2 h-2 overflow-hidden rounded-full p-0">
                        <div className="h-full rounded-full bg-primary" style={{ width: `${w.maturity_score}%` }} />
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
      </>
      )}
    </AppShell>
  );
}
