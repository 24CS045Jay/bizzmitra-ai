import { createFileRoute, Link } from "@tanstack/react-router";
import {
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  Calculator,
  Calendar,
  CheckCircle2,
  Clock,
  Coins,
  Copy,
  DollarSign,
  Download,
  Flame,
  HelpCircle,
  IndianRupee,
  Layers,
  Lock,
  ShieldCheck,
  Sliders,
  Sparkles,
  TrendingUp,
  Unlock,
  Users,
} from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { toast } from "sonner";

import { AppShell } from "@/components/AppShell";
import { ArtifactHeader } from "@/components/ArtifactHeader";
import { CountUp, Reveal } from "@/components/motion/primitives";
import {
  computeHrRoi,
  DomainRoiBlueprint,
  getRoiBlueprint,
  HrRoiInputs,
} from "@/lib/roi-data";
import {
  CURRENCIES,
  CurrencyCode,
  FinancialBudgetInputs,
  FullFinancialModel,
  computeFinancials,
  loadFinancialModel,
  saveFinancialModel,
} from "@/lib/financial-data";
import { FinancialConfigModal } from "@/components/dashboard/FinancialConfigModal";
import { FinancialRoiCard } from "@/components/dashboard/FinancialRoiCard";
import { useStageGate, StageNextButton } from "@/lib/workspace-stage-gate";
import { saveAndShareFile } from "@/lib/native-bridge";

export const Route = createFileRoute("/workspace/insights")({
  head: () => ({
    meta: [
      { title: "Dynamic ROI & Transformation Dashboard — BizzMitra-AI" },
      {
        name: "description",
        content: "Interactive financial return calculator, 36-month value projection curve, and digital readiness radar.",
      },
      { property: "og:title", content: "Dynamic ROI & Transformation Dashboard — BizzMitra-AI" },
      { property: "og:description", content: "Real-time financial payback modeling and enterprise impact analytics." },
    ],
  }),
  component: InsightsPage,
});

type RoiTab = "all" | "capex_opex" | "calculator" | "projection" | "readiness";

export function InsightsPage() {
  useStageGate("insights");
  const [activeTab, setActiveTab] = useState<RoiTab>("all");
  const [isFinModalOpen, setIsFinModalOpen] = useState(false);
  const [workspaceContext, setWorkspaceContext] = useState<{
    id?: string;
    name?: string;
    businessName?: string;
    industry?: string;
    problemStatement?: string;
    description?: string;
    budget?: number;
  } | null>(null);

  useEffect(() => {
    function loadContext() {
      try {
        const raw = localStorage.getItem("bizzmitra.workspaceContext");
        if (raw) {
          setWorkspaceContext(JSON.parse(raw));
        }
      } catch {}
    }
    loadContext();

    window.addEventListener("bizzmitra:workspace-updated", loadContext);
    return () => window.removeEventListener("bizzmitra:workspace-updated", loadContext);
  }, []);

  // Financial Model state (CapEx, OpEx, Payback, Lock status)
  const [finModel, setFinModel] = useState<FullFinancialModel>(() =>
    loadFinancialModel(workspaceContext)
  );

  useEffect(() => {
    function refreshFin() {
      setFinModel(loadFinancialModel(workspaceContext));
    }
    refreshFin();

    window.addEventListener("bizzmitra:financials-updated", refreshFin);
    window.addEventListener("bizzmitra:workspace-updated", refreshFin);
    return () => {
      window.removeEventListener("bizzmitra:financials-updated", refreshFin);
      window.removeEventListener("bizzmitra:workspace-updated", refreshFin);
    };
  }, [workspaceContext]);

  const { inputs: finInputs, computed: finComputed } = finModel;
  const activeCurrency = CURRENCIES[finInputs.currency] || CURRENCIES.INR;

  const blueprint: DomainRoiBlueprint = useMemo(
    () => getRoiBlueprint(workspaceContext),
    [workspaceContext]
  );

  const [inputs, setInputs] = useState<HrRoiInputs>(blueprint.defaultInputs);

  // Sync inputs if domain switches
  useEffect(() => {
    setInputs(blueprint.defaultInputs);
  }, [blueprint.domainId]);

  const roi = useMemo(
    () => computeHrRoi(inputs, finComputed.totalInitialInvestment || blueprint.platformCostInr),
    [inputs, finComputed.totalInitialInvestment, blueprint.platformCostInr]
  );

  const formatInr = (val: number) => {
    return activeCurrency.format(val);
  };

  const handleUpdateFinInputs = (updater: (prev: FinancialBudgetInputs) => FinancialBudgetInputs) => {
    const updatedInputs = updater(finInputs);
    const updated = saveFinancialModel(updatedInputs);
    setFinModel(updated);
  };

  const handleToggleLock = (shouldLock: boolean) => {
    const updatedInputs: FinancialBudgetInputs = {
      ...finInputs,
      isLocked: shouldLock,
      lockedAt: shouldLock ? new Date().toISOString() : undefined,
    };
    const updated = saveFinancialModel(updatedInputs);
    setFinModel(updated);

    if (shouldLock) {
      toast.success("Financial ROI & CapEx Runway Locked!", {
        description: "Blueprint confidence score updated to 100% (Audit Ready).",
      });
    } else {
      toast.info("Financial Model unlocked for adjustments.");
    }
  };

  const rawCapExUsage = Math.round(
    (finComputed.totalInitialInvestment / (finInputs.allocatedCapExCeiling || 1)) * 100
  );
  const visualCapExUsage = Math.min(100, Math.max(0, rawCapExUsage));

  const copyExecutiveSummary = () => {
    const summary = `EXECUTIVE ROI & FINANCIAL RUNWAY SUMMARY — ${blueprint.scenarioName}
==================================================
• Initial CapEx Build: ${formatInr(finComputed.totalInitialInvestment)} (Approved Ceiling: ${formatInr(finInputs.allocatedCapExCeiling)})
• Annual OpEx Runway: ${formatInr(finComputed.totalAnnualOpEx)} (${formatInr(finComputed.totalMonthlyOpEx)}/mo)
• Net Year-1 Value: ${formatInr(finComputed.netAnnualBenefitYear1)}
• Gross Annual Business Benefit: ${formatInr(finComputed.totalGrossAnnualBenefit)}
• Payback Period: ${finComputed.paybackPeriodMonths} Months (Ceiling: ${finInputs.targetPaybackMonthsCeiling} Mo)
• Year-1 Net ROI: ${finComputed.roiPercentYear1}%
• 3-Year ROI Multiple: ${roi.threeYearRoiMultiplePct}%
• Specialist Hours Reclaimed: ${finInputs.manualHoursSavedPerMonth * 12} hrs/year
• Audit Readiness Status: ${finComputed.isAuditReady ? "100% Audit Ready (Locked)" : "Draft Runway (Unlocked)"}

Generated by BizzMitra-AI Transformation Cockpit`;

    navigator.clipboard.writeText(summary);
    toast.success("Executive ROI & Financial summary copied to clipboard!");
  };

  const downloadRoiReport = () => {
    const report = `# ${blueprint.scenarioName} — Financial ROI & Readiness Engine\n\nExecutive Subtitle: ${blueprint.executiveSubtitle}\n\n## 1. Capital Expenditure (CapEx) & Operational Expenditure (OpEx)\n- Initial CapEx Investment: ${formatInr(finComputed.totalInitialInvestment)}\n- CapEx Approved Ceiling: ${formatInr(finInputs.allocatedCapExCeiling)} (${rawCapExUsage}% utilized)\n- Sprint Effort: ${finInputs.estimatedPersonDays} Person-Days @ ${formatInr(finInputs.developerRatePerDay)}/day\n- Contingency Buffer: ${finInputs.contingencyBufferPercent}% (+${formatInr(finComputed.contingencyAmount)})\n- Monthly Cloud & Infrastructure OpEx: ${formatInr(finComputed.totalMonthlyOpEx)}/month (${formatInr(finComputed.totalAnnualOpEx)}/yr)\n\n## 2. Business Value & Payback Model\n- Gross Annual Value: ${formatInr(finComputed.totalGrossAnnualBenefit)}\n- Direct Labor Savings: ${formatInr(finComputed.grossAnnualLaborSavings)}\n- Direct Revenue Uplift: ${formatInr(finInputs.directRevenueUpliftAnnual)}\n- Net Year-1 Benefit: ${formatInr(finComputed.netAnnualBenefitYear1)}\n- Payback Velocity: ${finComputed.paybackPeriodMonths} Months (Ceiling Target: ${finInputs.targetPaybackMonthsCeiling} Mo)\n- Year-1 ROI Multiple: ${finComputed.roiPercentYear1}%\n- 3-Year ROI Multiple: ${roi.threeYearRoiMultiplePct}%\n- Model Status: ${finComputed.isAuditReady ? "LOCKED & 100% AUDIT READY" : "DRAFT"}\n\n## 3. Operational Benchmarks:\n${blueprint.benchmarks.map((b) => `- ${b.metric}: Before ${b.before} -> After ${b.after} (${b.change})`).join("\n")}\n\n## 4. Readiness Scores:\n${blueprint.readinessRadar.map((r) => `- ${r.dimension}: ${r.score}% (Industry Benchmark: ${r.benchmark}%)`).join("\n")}`;
    const filename = `${blueprint.domainId || "domain"}_roi_readiness_report.md`;
    void saveAndShareFile(filename, report, "text/markdown");
    toast.success("Financial ROI report downloaded!");
  };

  return (
    <AppShell>
      <ArtifactHeader
        id="dashboard"
        kicker="Transformation Cockpit · Step 10"
        title="Financial ROI & Readiness Engine"
      />

      {/* Blueprint Context Banner */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-primary/20 bg-primary/5 px-4 py-2.5 text-xs">
        <div className="flex items-center gap-2">
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          <span className="text-muted-foreground">Financial Engineering Context:</span>
          <span className="font-bold text-foreground">
            {workspaceContext?.businessName || workspaceContext?.name || blueprint.scenarioName}
          </span>
          <span className="rounded-full bg-primary/10 px-2 py-0.5 font-medium text-primary">
            {blueprint.domainTitle}
          </span>
          {finInputs.isLocked ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
              <Lock className="size-2.5" />
              100% Audit Ready · Budget Locked
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold text-amber-600 dark:text-amber-400">
              <Unlock className="size-2.5" />
              Draft Runway (Lock to reach 100%)
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <Link to="/workspace/roadmap" className="font-medium text-muted-foreground hover:text-primary transition-colors">
            Roadmap →
          </Link>
          <Link to="/dashboard" className="font-medium text-primary hover:underline">
            Command Center →
          </Link>
        </div>
      </div>

      <div className="space-y-8 pb-16">
        {/* Top Hero Banner */}
        <Reveal className="neu p-6 md:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl space-y-2">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                  <TrendingUp className="size-3.5" />
                  Live Dynamic ROI & CapEx Model
                </span>
                <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                  Payback: {finComputed.paybackPeriodMonths} mo
                </span>
                {finInputs.isLocked && (
                  <span className="rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                    Audit Ready (100%)
                  </span>
                )}
              </div>
              <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
                Transformation Economics: {blueprint.scenarioName}
              </h1>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {blueprint.executiveSubtitle}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => handleToggleLock(!finInputs.isLocked)}
                className={`neu-press flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all shadow-sm ${
                  finInputs.isLocked
                    ? "bg-emerald-600 text-white hover:bg-emerald-700"
                    : "bg-primary text-primary-foreground glow-primary hover:brightness-105"
                }`}
              >
                {finInputs.isLocked ? (
                  <>
                    <Lock className="size-3.5" />
                    <span>Locked (100% Audit Ready)</span>
                  </>
                ) : (
                  <>
                    <Unlock className="size-3.5" />
                    <span>Lock Budget & Complete Audit (100%)</span>
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => setIsFinModalOpen(true)}
                className="neu-sm neu-press flex items-center gap-2 px-3.5 py-2 text-xs font-semibold hover:text-primary"
              >
                <Sliders className="size-3.5" />
                Configure Model
              </button>
              <button
                type="button"
                onClick={copyExecutiveSummary}
                className="neu-sm neu-press flex items-center gap-2 px-3.5 py-2 text-xs font-semibold hover:text-primary"
              >
                <Copy className="size-3.5" />
                Copy Summary
              </button>
              <button
                type="button"
                onClick={downloadRoiReport}
                className="neu-sm neu-press flex items-center gap-2 px-3.5 py-2 text-xs font-semibold hover:text-primary"
              >
                <Download className="size-3.5" />
                Download Report
              </button>
            </div>
          </div>

          {/* Key Executive KPI Cards - dynamically linked to CapEx / OpEx */}
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="neu-inset p-4">
              <div className="flex items-center justify-between text-xs font-medium text-muted-foreground">
                <span>Total CapEx Build</span>
                <ShieldCheck className="size-4 text-emerald-500" />
              </div>
              <p className="mt-1 font-display text-2xl font-extrabold text-foreground">
                {formatInr(finComputed.totalInitialInvestment)}
              </p>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Ceiling: {formatInr(finInputs.allocatedCapExCeiling)} ({rawCapExUsage}%)
              </p>
            </div>

            <div className="neu-inset p-4">
              <div className="flex items-center justify-between text-xs font-medium text-muted-foreground">
                <span>Annual OpEx Runway</span>
                <DollarSign className="size-4 text-primary" />
              </div>
              <p className="mt-1 font-display text-2xl font-extrabold text-foreground">
                {formatInr(finComputed.totalAnnualOpEx)}
              </p>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                {formatInr(finComputed.totalMonthlyOpEx)} / month
              </p>
            </div>

            <div className="neu-inset p-4">
              <div className="flex items-center justify-between text-xs font-medium text-muted-foreground">
                <span>Year-1 Net ROI</span>
                <Flame className="size-4 text-amber-500" />
              </div>
              <p className={`mt-1 font-display text-2xl font-extrabold ${
                finComputed.roiPercentYear1 >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-500"
              }`}>
                {finComputed.roiPercentYear1 > 0 ? `+${finComputed.roiPercentYear1}%` : `${finComputed.roiPercentYear1}%`}
              </p>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Net Value: {formatInr(finComputed.netAnnualBenefitYear1)}
              </p>
            </div>

            <div className="neu-inset p-4">
              <div className="flex items-center justify-between text-xs font-medium text-muted-foreground">
                <span>Payback Velocity</span>
                <Clock className="size-4 text-blue-500" />
              </div>
              <p className="mt-1 font-display text-2xl font-extrabold text-foreground">
                {finComputed.paybackPeriodMonths} <span className="text-base font-normal text-muted-foreground">Months</span>
              </p>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Target: {finInputs.targetPaybackMonthsCeiling} Mo threshold
              </p>
            </div>
          </div>
        </Reveal>

        {/* View Selection Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/40 pb-3">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setActiveTab("all")}
              className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold transition ${
                activeTab === "all"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "neu hover:bg-accent/40 text-foreground"
              }`}
            >
              Full Executive Cockpit
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("capex_opex")}
              className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold transition ${
                activeTab === "capex_opex"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "neu hover:bg-accent/40 text-foreground"
              }`}
            >
              CapEx & OpEx Runway
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("calculator")}
              className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold transition ${
                activeTab === "calculator"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "neu hover:bg-accent/40 text-foreground"
              }`}
            >
              Domain ROI Variables
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("projection")}
              className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold transition ${
                activeTab === "projection"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "neu hover:bg-accent/40 text-foreground"
              }`}
            >
              36-Month Trajectory
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("readiness")}
              className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold transition ${
                activeTab === "readiness"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "neu hover:bg-accent/40 text-foreground"
              }`}
            >
              Readiness Radar & Benchmarks
            </button>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground font-mono">
              Currency: <strong>{finInputs.currency}</strong>
            </span>
          </div>
        </div>

        {/* ═══ Section: CapEx & OpEx Interactive Controls ═══ */}
        {(activeTab === "all" || activeTab === "capex_opex") && (
          <motion.div
            key="section-capex-opex"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="space-y-6"
          >
            <div className="neu p-6 md:p-7 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-border/60 pb-4 gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-display text-lg font-bold text-foreground">
                      CapEx Build Costs & Recurring OpEx Modeler
                    </h3>
                    <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                      Live Dynamic Sync
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Adjust CapEx runway, monthly cloud OpEx, and recovery velocity. Changes reflect immediately on the dashboard.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleToggleLock(!finInputs.isLocked)}
                    className={`neu-press flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition ${
                      finInputs.isLocked
                        ? "bg-emerald-600 text-white"
                        : "bg-primary text-primary-foreground glow-primary"
                    }`}
                  >
                    {finInputs.isLocked ? (
                      <>
                        <Lock className="size-3.5" />
                        <span>Budget Locked (100% Audit Ready)</span>
                      </>
                    ) : (
                      <>
                        <Unlock className="size-3.5" />
                        <span>Lock ROI Model</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* CapEx & OpEx Input Grid */}
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {/* 1. CapEx Ceiling */}
                <div className="space-y-2 rounded-xl border border-border/60 bg-accent/20 p-4">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-foreground">Allocated CapEx Ceiling</span>
                    <span className="font-mono text-primary">{formatInr(finInputs.allocatedCapExCeiling)}</span>
                  </div>
                  <input
                    type="number"
                    value={finInputs.allocatedCapExCeiling}
                    onChange={(e) =>
                      handleUpdateFinInputs((prev) => ({
                        ...prev,
                        allocatedCapExCeiling: Number(e.target.value) || 0,
                      }))
                    }
                    className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground focus:border-primary focus:outline-none font-mono"
                  />
                  <input
                    type="range"
                    min="500000"
                    max="10000000"
                    step="100000"
                    value={finInputs.allocatedCapExCeiling}
                    onChange={(e) =>
                      handleUpdateFinInputs((prev) => ({
                        ...prev,
                        allocatedCapExCeiling: Number(e.target.value),
                      }))
                    }
                    className="w-full accent-primary cursor-pointer"
                  />
                  <p className="text-[10px] text-muted-foreground">
                    Maximum leadership-approved build runway ceiling.
                  </p>
                </div>

                {/* 2. Developer Rate Per Day */}
                <div className="space-y-2 rounded-xl border border-border/60 bg-accent/20 p-4">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-foreground">Developer Daily Rate</span>
                    <span className="font-mono text-primary">{formatInr(finInputs.developerRatePerDay)}/day</span>
                  </div>
                  <input
                    type="number"
                    value={finInputs.developerRatePerDay}
                    onChange={(e) =>
                      handleUpdateFinInputs((prev) => ({
                        ...prev,
                        developerRatePerDay: Number(e.target.value) || 0,
                      }))
                    }
                    className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground focus:border-primary focus:outline-none font-mono"
                  />
                  <p className="text-[10px] text-muted-foreground">
                    Blended rate across engineering squad ({finInputs.estimatedPersonDays} person-days).
                  </p>
                </div>

                {/* 3. Contingency Buffer */}
                <div className="space-y-2 rounded-xl border border-border/60 bg-accent/20 p-4">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-foreground">Contingency Buffer ({finInputs.contingencyBufferPercent}%)</span>
                    <span className="font-mono text-primary">+{formatInr(finComputed.contingencyAmount)}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="30"
                    step="5"
                    value={finInputs.contingencyBufferPercent}
                    onChange={(e) =>
                      handleUpdateFinInputs((prev) => ({
                        ...prev,
                        contingencyBufferPercent: Number(e.target.value),
                      }))
                    }
                    className="w-full accent-primary cursor-pointer"
                  />
                  <p className="text-[10px] text-muted-foreground">
                    Buffer for complex API integrations & scope variance.
                  </p>
                </div>

                {/* 4. Monthly Cloud Hosting OpEx */}
                <div className="space-y-2 rounded-xl border border-border/60 bg-accent/20 p-4">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-foreground">Monthly Cloud Hosting (OpEx)</span>
                    <span className="font-mono text-primary">{formatInr(finInputs.monthlyCloudHosting)}/mo</span>
                  </div>
                  <input
                    type="number"
                    value={finInputs.monthlyCloudHosting}
                    onChange={(e) =>
                      handleUpdateFinInputs((prev) => ({
                        ...prev,
                        monthlyCloudHosting: Number(e.target.value) || 0,
                      }))
                    }
                    className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground focus:border-primary focus:outline-none font-mono"
                  />
                  <p className="text-[10px] text-muted-foreground">
                    Supabase database, CDN, and edge compute infrastructure.
                  </p>
                </div>

                {/* 5. Monthly AI Token Costs */}
                <div className="space-y-2 rounded-xl border border-border/60 bg-accent/20 p-4">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-foreground">Monthly AI Token Estimate</span>
                    <span className="font-mono text-primary">{formatInr(finInputs.monthlyAiTokenEstimate)}/mo</span>
                  </div>
                  <input
                    type="number"
                    value={finInputs.monthlyAiTokenEstimate}
                    onChange={(e) =>
                      handleUpdateFinInputs((prev) => ({
                        ...prev,
                        monthlyAiTokenEstimate: Number(e.target.value) || 0,
                      }))
                    }
                    className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground focus:border-primary focus:outline-none font-mono"
                  />
                  <p className="text-[10px] text-muted-foreground">
                    LLM token invocations and model runtime fees.
                  </p>
                </div>

                {/* 6. DevOps & Maintenance Retainer */}
                <div className="space-y-2 rounded-xl border border-border/60 bg-accent/20 p-4">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-foreground">DevOps & Maintenance (OpEx)</span>
                    <span className="font-mono text-primary">{formatInr(finInputs.monthlyMaintenanceRetainer)}/mo</span>
                  </div>
                  <input
                    type="number"
                    value={finInputs.monthlyMaintenanceRetainer}
                    onChange={(e) =>
                      handleUpdateFinInputs((prev) => ({
                        ...prev,
                        monthlyMaintenanceRetainer: Number(e.target.value) || 0,
                      }))
                    }
                    className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground focus:border-primary focus:outline-none font-mono"
                  />
                  <p className="text-[10px] text-muted-foreground">
                    Security patches, ongoing SLA monitoring, and retainer.
                  </p>
                </div>
              </div>

              {/* CapEx Budget Ceiling Utilization Progress Bar */}
              <div className="rounded-xl border border-border/70 bg-card/60 p-4 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-foreground flex items-center gap-1.5">
                    <span>CapEx Ceiling Utilization</span>
                    <span className="text-muted-foreground font-normal">
                      ({formatInr(finComputed.totalInitialInvestment)} / {formatInr(finInputs.allocatedCapExCeiling)})
                    </span>
                  </span>
                  <span className={`font-mono font-bold ${
                    rawCapExUsage > 100 ? "text-rose-500" : "text-emerald-600 dark:text-emerald-400"
                  }`}>
                    {rawCapExUsage}% utilized
                  </span>
                </div>

                <div className="h-3 w-full overflow-hidden rounded-full bg-muted">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${visualCapExUsage}%` }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className={`h-full rounded-full ${
                      rawCapExUsage > 100
                        ? "bg-rose-500"
                        : rawCapExUsage > 80
                          ? "bg-amber-500"
                          : "bg-emerald-500"
                    }`}
                  />
                </div>

                <div className="flex flex-wrap items-center justify-between pt-1 text-[11px] text-muted-foreground">
                  <span className="flex items-center gap-1">
                    {finComputed.isBudgetUnderCeiling ? (
                      <span className="text-emerald-500 font-bold flex items-center gap-1">
                        <CheckCircle2 className="size-3" />
                        CapEx is within approved budget ceiling
                      </span>
                    ) : (
                      <span className="text-rose-500 font-bold flex items-center gap-1">
                        <AlertTriangle className="size-3" />
                        CapEx exceeds ceiling by {formatInr(finComputed.totalInitialInvestment - finInputs.allocatedCapExCeiling)}
                      </span>
                    )}
                  </span>
                  <span>
                    Gross Annual Value: <strong className="text-emerald-500">+{formatInr(finComputed.totalGrossAnnualBenefit)}/yr</strong>
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* ═══ Main Grid: Domain Calculator & 36-Month Trajectory ═══ */}
        {(activeTab === "all" || activeTab === "calculator" || activeTab === "projection") && (
          <motion.div
            key={`section-main-${activeTab}`}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className={`grid gap-8 ${
              activeTab === "calculator"
                ? "grid-cols-1 max-w-2xl mx-auto"
                : activeTab === "projection"
                  ? "grid-cols-1"
                  : "lg:grid-cols-12"
            }`}
          >
            {/* Left Col: Interactive Sliders */}
            {(activeTab === "all" || activeTab === "calculator") && (
              <div className={`space-y-6 ${activeTab === "all" ? "lg:col-span-5" : "w-full"}`}>
                <div className="neu p-6 space-y-6">
                  <div className="flex items-center justify-between border-b border-border/40 pb-4">
                    <div>
                      <h3 className="font-display text-base font-bold">Domain ROI Input Variables</h3>
                      <p className="text-xs text-muted-foreground">
                        Adjust parameters to recalculate savings instantly in real time.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setInputs(blueprint.defaultInputs)}
                      className="text-[11px] font-semibold text-primary hover:underline"
                    >
                      Reset Defaults
                    </button>
                  </div>

                  <div className="space-y-5">
                    {blueprint.sliders.map((s) => {
                      const val = inputs[s.key] ?? 0;
                      return (
                        <div key={s.key} className="space-y-1.5">
                          <div className="flex justify-between text-xs">
                            <span className="font-bold text-foreground">{s.label}</span>
                            <span className="font-mono font-bold text-primary">
                              {val.toLocaleString("en-IN")} {s.unit}
                            </span>
                          </div>
                          <input
                            type="range"
                            min={s.min}
                            max={s.max}
                            step={s.step}
                            value={val}
                            onChange={(e) =>
                              setInputs((prev) => ({ ...prev, [s.key]: Number(e.target.value) }))
                            }
                            className="w-full accent-primary cursor-pointer"
                          />
                          <p className="text-[10px] text-muted-foreground">{s.desc}</p>
                        </div>
                      );
                    })}
                  </div>

                  {/* Breakdown Breakdown */}
                  <div className="space-y-2 rounded-xl bg-accent/30 p-3 text-xs">
                    <div className="flex justify-between text-muted-foreground">
                      <span>Direct Labor Savings:</span>
                      <span className="font-medium text-foreground">{formatInr(roi.annualLaborSavingsInr)} / yr</span>
                    </div>
                    <div className="flex justify-between text-muted-foreground">
                      <span>Velocity Revenue Boost:</span>
                      <span className="font-medium text-foreground">{formatInr(roi.velocityRevenueGainInr)} / yr</span>
                    </div>
                    <div className="flex justify-between border-t border-border/40 pt-1.5 font-bold">
                      <span>Gross Annual Benefit:</span>
                      <span className="text-primary">{formatInr(roi.totalAnnualBenefitInr)}</span>
                    </div>
                    <div className="flex justify-between text-[11px] text-muted-foreground">
                      <span>Initial CapEx Build Cost:</span>
                      <span>- {formatInr(finComputed.totalInitialInvestment)}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Right Col: Charts & Sensitivity */}
            {(activeTab === "all" || activeTab === "projection") && (
              <div className={`space-y-6 ${activeTab === "all" ? "lg:col-span-7" : "w-full"}`}>
                {/* 36-Month Cumulative Value Chart */}
                <div className="neu p-6 space-y-4">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-border/40 pb-4">
                    <div>
                      <h3 className="font-display text-base font-bold">36-Month Cumulative Financial Trajectory</h3>
                      <p className="text-xs text-muted-foreground">
                        Break-even intersection point is reached within {finComputed.paybackPeriodMonths} months.
                      </p>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <span className="inline-block size-2 rounded-full bg-emerald-500" />
                      <span className="font-semibold text-emerald-600 dark:text-emerald-400">Net Value</span>
                      <span className="inline-block size-2 rounded-full bg-muted-foreground ml-2" />
                      <span className="text-muted-foreground">CapEx + OpEx</span>
                    </div>
                  </div>

                  <div className="h-72 w-full pt-2">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={roi.cumulativeCashflow} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                        <defs>
                          <linearGradient id="benefitGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.4} />
                            <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0.0} />
                          </linearGradient>
                          <linearGradient id="netGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" opacity={0.5} />
                        <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="var(--color-muted-foreground)" />
                        <YAxis
                          tickFormatter={(v) => `${(v / 100000).toFixed(0)}L`}
                          tick={{ fontSize: 11 }}
                          stroke="var(--color-muted-foreground)"
                        />
                        <Tooltip
                          formatter={(val: number, name: string) => [
                            formatInr(val),
                            name === "cumulativeBenefit"
                              ? "Gross Benefit"
                              : name === "netCashflow"
                                ? "Net Cashflow"
                                : "Investment (CapEx+OpEx)",
                          ]}
                          labelFormatter={(lbl) => `Timeline: ${lbl}`}
                          contentStyle={{
                            backgroundColor: "var(--color-background)",
                            borderColor: "var(--color-border)",
                            borderRadius: "0.75rem",
                            fontSize: "12px",
                          }}
                        />
                        <Area
                          type="monotone"
                          dataKey="cumulativeCost"
                          name="cumulativeCost"
                          stroke="var(--color-muted-foreground)"
                          strokeWidth={1.5}
                          fill="none"
                          strokeDasharray="4 4"
                        />
                        <Area
                          type="monotone"
                          dataKey="netCashflow"
                          name="netCashflow"
                          stroke="#10b981"
                          strokeWidth={2.5}
                          fill="url(#netGrad)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Sensitivity Analysis Table */}
                <div className="neu p-6">
                  <div className="flex items-center justify-between border-b border-border/40 pb-3">
                    <div>
                      <h3 className="font-display text-base font-bold">Sensitivity Scenarios (Risk Tolerance)</h3>
                      <p className="text-xs text-muted-foreground">
                        Conservative vs Expected vs Aggressive automation models.
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-border/40 text-muted-foreground">
                          <th className="pb-2 font-bold">Scenario</th>
                          <th className="pb-2 font-bold">Automation %</th>
                          <th className="pb-2 font-bold">Net Annual</th>
                          <th className="pb-2 font-bold">Payback</th>
                          <th className="pb-2 font-bold">3-Yr ROI</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/20">
                        {roi.sensitivity.map((sc) => (
                          <tr
                            key={sc.scenario}
                            className={sc.scenario === "Expected" ? "bg-primary/5 font-bold" : ""}
                          >
                            <td className="py-2.5">
                              <span
                                className={`rounded px-2 py-0.5 text-[10px] font-bold ${
                                  sc.scenario === "Expected"
                                    ? "bg-primary text-primary-foreground"
                                    : "bg-muted text-muted-foreground"
                                }`}
                              >
                                {sc.scenario}
                              </span>
                            </td>
                            <td className="py-2.5">{sc.automationPct}%</td>
                            <td className="py-2.5 text-emerald-600 dark:text-emerald-400">
                              {formatInr(sc.netAnnualSavingsInr)}
                            </td>
                            <td className="py-2.5">{sc.paybackMonths} mo</td>
                            <td className="py-2.5 font-mono">{sc.threeYearRoi}%</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* Readiness by Dimension & Transformation Benchmark Cards */}
        {(activeTab === "all" || activeTab === "readiness") && (
          <motion.div
            key={`section-readiness-${activeTab}`}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="grid gap-8 lg:grid-cols-2"
          >
            {/* Radar Chart: Readiness */}
            <div className="neu p-6 space-y-4">
              <div className="border-b border-border/40 pb-3">
                <h3 className="font-display text-base font-bold">Digital Transformation Readiness Radar</h3>
                <p className="text-xs text-muted-foreground">
                  Organizational capability score across 6 key enterprise transformation dimensions for {blueprint.domainTitle}.
                </p>
              </div>

              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={blueprint.readinessRadar}>
                    <PolarGrid stroke="var(--color-border)" />
                    <PolarAngleAxis dataKey="dimension" tick={{ fontSize: 10 }} />
                    <Radar
                      name="Your Score"
                      dataKey="score"
                      stroke="var(--color-primary)"
                      fill="var(--color-primary)"
                      fillOpacity={0.3}
                    />
                    <Radar
                      name="Industry Benchmark"
                      dataKey="benchmark"
                      stroke="var(--color-muted-foreground)"
                      fill="none"
                      strokeDasharray="3 3"
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "var(--color-background)",
                        borderColor: "var(--color-border)",
                        borderRadius: "0.5rem",
                        fontSize: "12px",
                      }}
                    />
                    <Legend />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Benchmark KPI Comparison Cards */}
            <div className="neu p-6 space-y-4">
              <div className="border-b border-border/40 pb-3">
                <h3 className="font-display text-base font-bold">Before vs. After Operational Benchmarks</h3>
                <p className="text-xs text-muted-foreground">
                  Quantified operational performance delta achieved through digital modernization.
                </p>
              </div>

              <div className="space-y-3 pt-1">
                {blueprint.benchmarks.map((bm) => (
                  <div key={bm.metric} className="neu-inset p-3 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-foreground">{bm.metric}</p>
                      <div className="flex items-center gap-2 mt-1 text-[11px] text-muted-foreground">
                        <span>Before: <strong className="text-foreground/80">{bm.before}</strong></span>
                        <span>→</span>
                        <span>After: <strong className="text-primary">{bm.after}</strong></span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                        {bm.change}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        <StageNextButton currentStageId="insights" label="Proceed to Artifact Map" />
      </div>

      <FinancialConfigModal
        isOpen={isFinModalOpen}
        onClose={() => setIsFinModalOpen(false)}
        workspaceContext={workspaceContext}
        onSaved={() => setFinModel(loadFinancialModel(workspaceContext))}
      />
    </AppShell>
  );
}
