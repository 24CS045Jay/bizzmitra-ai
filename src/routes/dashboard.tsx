import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
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
  Lock,
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
import { useWorkspaceLimit } from "@/lib/workspace-plan-limit";
import { WorkspaceUpgradeModal } from "@/components/WorkspaceUpgradeModal";

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
  const navigate = useNavigate();
  const isTest = isTestingAccount(user?.email);
  const [workspaces, setWorkspaces] = useState<Tables<"workspaces">[]>([]);
  const [artifactCount, setArtifactCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Active workspace name with seamless fallback
  const [activeWsName, setActiveWsName] = useState(() => {
    if (typeof window !== "undefined") {
      const raw = window.localStorage.getItem("bizzmitra.workspaceContext");
      if (raw) {
        try {
          const parsed = JSON.parse(raw);
          if (parsed?.businessName) return parsed.businessName;
        } catch {}
      }
    }
    return isTest ? "TalentCraft HR Consultancy" : "";
  });

  const {
    isBasicPlan,
    isLimitReached,
    workspaceCount,
    refresh: refreshWorkspaceLimit,
  } = useWorkspaceLimit();
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);

  const handleCreateWorkspaceAttempt = (e: React.MouseEvent) => {
    if (isLimitReached || (isBasicPlan && workspaces.length >= 1)) {
      e.preventDefault();
      setIsUpgradeModalOpen(true);
    }
  };

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
          const raw = window.localStorage.getItem("bizzmitra.workspaceContext");
          if (raw) {
            try {
              const parsed = JSON.parse(raw);
              if (parsed?.businessName) {
                setActiveWsName(parsed.businessName);
              }
            } catch {}
          }
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

  function loadSampleDemoWorkspace() {
    if (typeof window !== "undefined") {
      window.localStorage.setItem("bizzmitra.activeWorkspaceId", "ws-talentcraft-default");
      window.localStorage.setItem(
        "bizzmitra.workspaceContext",
        JSON.stringify({
          businessName: "TalentCraft HR Consultancy",
          problemStatement: "Scaling remote tech recruitment and candidate onboarding automation",
          industry: "HR & Recruitment",
        }),
      );
    }
    setActiveWsName("TalentCraft HR Consultancy");
    toast.success("Loaded TalentCraft demo workspace!");
  }

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

  if (loading) {
    return (
      <AppShell>
        <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3">
          <div className="size-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="text-xs font-semibold text-muted-foreground">Loading workspace...</p>
        </div>
      </AppShell>
    );
  }

  const rawCtx = typeof window !== "undefined" ? window.localStorage.getItem("bizzmitra.workspaceContext") : null;
  const localWsId = typeof window !== "undefined" ? window.localStorage.getItem("bizzmitra.activeWorkspaceId") : null;
  const hasCustomWorkspace = workspaces.length > 0 || (localWsId && localWsId !== "ws-talentcraft-default" && rawCtx);

  // If non-test user has no active workspaces, display the Workspaces Hub with Welcome Empty State & Create Action
  if (!isTest && !hasCustomWorkspace) {
    return (
      <AppShell>
        <div className="mx-auto max-w-4xl py-6">
          {/* Header */}
          <Reveal>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border/50 pb-6">
              <div>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/15 px-2.5 py-0.5 text-[10px] font-bold text-primary uppercase tracking-wider">
                    <LayoutGrid className="size-3" />
                    Workspace Hub
                  </span>
                </div>
                <h1 className="mt-2 font-display text-3xl font-extrabold sm:text-4xl text-foreground">
                  Workspaces
                </h1>
                <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
                  All projects, business blueprints, and AI transformation workspaces.
                </p>
              </div>

              <Link
                to="/workspace/new"
                onClick={handleCreateWorkspaceAttempt}
                className="neu-press inline-flex items-center gap-2 self-start sm:self-auto rounded-xl bg-primary px-4 py-2.5 text-xs font-bold text-primary-foreground glow-primary shadow-sm"
              >
                <Plus className="size-4" />
                <span>Create Workspace</span>
              </Link>
            </div>
          </Reveal>

          {/* Empty State Card */}
          <Reveal delay={0.1}>
            <div className="neu mt-8 p-8 sm:p-12 text-center rounded-2xl flex flex-col items-center justify-center">
              <div className="size-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-5 shadow-inner">
                <Sparkles className="size-8 animate-pulse" />
              </div>

              <h2 className="font-display text-2xl font-bold text-foreground">
                Create your first business workspace
              </h2>
              <p className="mt-2 max-w-lg text-xs sm:text-sm text-muted-foreground leading-relaxed">
                You do not have an active workspace yet. Create a workspace to frame your business challenge, run guided AI diagnostics, and generate tailored enterprise blueprints.
              </p>

              <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                <Link
                  to="/workspace/new"
                  onClick={handleCreateWorkspaceAttempt}
                  className="neu-press inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-bold text-primary-foreground glow-primary shadow-md hover:brightness-105 transition-all"
                >
                  <Plus className="size-4" />
                  <span>Create Your Workspace</span>
                  <ArrowRight className="size-4 ml-1" />
                </Link>

                <button
                  type="button"
                  onClick={loadSampleDemoWorkspace}
                  className="neu-sm neu-press inline-flex items-center gap-2 rounded-xl border border-border/80 bg-card px-4 py-3 text-xs font-bold text-foreground hover:bg-muted/50 transition-all"
                >
                  <Sparkles className="size-3.5 text-primary" />
                  <span>Explore Demo Workspace (TalentCraft)</span>
                </button>
              </div>

              {/* 3 Step Workflow Preview */}
              <div className="mt-10 grid w-full gap-4 sm:grid-cols-3 text-left border-t border-border/60 pt-8">
                <div className="rounded-xl border border-border/50 bg-card/60 p-4">
                  <div className="size-7 rounded-lg bg-primary/15 text-primary text-xs font-bold flex items-center justify-center mb-2.5">
                    1
                  </div>
                  <h3 className="font-bold text-sm text-foreground">Multi-Modal Intake</h3>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Define problem via text, voice, PDF ingestion, or existing URLs.
                  </p>
                </div>

                <div className="rounded-xl border border-border/50 bg-card/60 p-4">
                  <div className="size-7 rounded-lg bg-primary/15 text-primary text-xs font-bold flex items-center justify-center mb-2.5">
                    2
                  </div>
                  <h3 className="font-bold text-sm text-foreground">AI Guided Discovery</h3>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Interactive diagnostic loss tree questions synthesize root causes.
                  </p>
                </div>

                <div className="rounded-xl border border-border/50 bg-card/60 p-4">
                  <div className="size-7 rounded-lg bg-primary/15 text-primary text-xs font-bold flex items-center justify-center mb-2.5">
                    3
                  </div>
                  <h3 className="font-bold text-sm text-foreground">11 Living Deliverables</h3>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Generate architectures, schemas, wireframes, roadmaps, and pitch decks.
                  </p>
                </div>
              </div>
            </div>
          </Reveal>
        </div>

        <WorkspaceUpgradeModal
          isOpen={isUpgradeModalOpen}
          onClose={() => setIsUpgradeModalOpen(false)}
          workspaceCount={workspaces.length || workspaceCount || 1}
          onUpgradeSuccess={() => {
            void refreshWorkspaceLimit();
          }}
        />
      </AppShell>
    );
  }

  return (
    <AppShell>
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
          <div className="flex items-center gap-3">
            {isBasicPlan && (
              <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 px-3 py-1 text-[11px] font-semibold text-amber-600 dark:text-amber-400">
                <Lock className="size-3" />
                Basic: {workspaces.length}/1 Workspace Used
              </span>
            )}
            <Link
              to="/workspace/new"
              onClick={handleCreateWorkspaceAttempt}
              className="neu-press flex items-center gap-2 rounded-xl bg-primary px-3.5 py-2.5 text-xs font-bold text-primary-foreground glow-primary"
            >
              <Plus className="size-4" /> New workspace
            </Link>
          </div>
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

      <WorkspaceUpgradeModal
        isOpen={isUpgradeModalOpen}
        onClose={() => setIsUpgradeModalOpen(false)}
        workspaceCount={workspaces.length || workspaceCount || 1}
        onUpgradeSuccess={() => {
          void refreshWorkspaceLimit();
        }}
      />
    </AppShell>
  );
}
