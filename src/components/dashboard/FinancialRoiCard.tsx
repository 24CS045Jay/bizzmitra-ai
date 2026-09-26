import { useState, useEffect } from "react";
import { motion } from "motion/react";
import {
  TrendingUp,
  DollarSign,
  Clock,
  ShieldCheck,
  AlertTriangle,
  Sparkles,
  Sliders,
  ArrowUpRight,
  CheckCircle2,
  Lock,
} from "lucide-react";
import {
  CURRENCIES,
  FullFinancialModel,
  loadFinancialModel,
} from "@/lib/financial-data";
import { FinancialConfigModal } from "./FinancialConfigModal";

interface FinancialRoiCardProps {
  workspaceContext?: { id?: string; name?: string; budget?: number; [key: string]: any } | null | undefined;
  className?: string;
  variant?: "full" | "compact";
}

export function FinancialRoiCard({
  workspaceContext,
  className = "",
  variant = "full",
}: FinancialRoiCardProps) {
  const [model, setModel] = useState<FullFinancialModel>(() =>
    loadFinancialModel(workspaceContext)
  );
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    function refresh() {
      setModel(loadFinancialModel(workspaceContext));
    }
    refresh();

    window.addEventListener("bizzmitra:financials-updated", refresh);
    window.addEventListener("bizzmitra:workspace-updated", refresh);
    return () => {
      window.removeEventListener("bizzmitra:financials-updated", refresh);
      window.removeEventListener("bizzmitra:workspace-updated", refresh);
    };
  }, [workspaceContext]);

  const { inputs, computed } = model;
  const currency = CURRENCIES[inputs.currency] || CURRENCIES.INR;

  const rawCapExUsagePercent = Math.round(
    (computed.totalInitialInvestment / (inputs.allocatedCapExCeiling || 1)) * 100
  );
  const capExUsagePercent = Math.min(100, Math.max(0, rawCapExUsagePercent));

  if (variant === "compact") {
    return (
      <>
        <div className={`neu p-5 flex flex-col justify-between ${className}`}>
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <TrendingUp className="size-3 text-primary" />
              Financial ROI & Runway
            </span>
            <span
              className={`rounded-full px-2 py-0.5 text-[9px] font-bold ${
                computed.isAuditReady
                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                  : "bg-amber-500/10 text-amber-600 dark:text-amber-400"
              }`}
            >
              {computed.isAuditReady ? "Audit Ready" : "Draft Runway"}
            </span>
          </div>

          <div className="my-3 flex items-baseline justify-between">
            <div>
              <p className="font-display text-2xl font-extrabold text-foreground">
                {computed.roiPercentYear1 > 0 ? `+${computed.roiPercentYear1}%` : `${computed.roiPercentYear1}%`}
              </p>
              <p className="text-[11px] text-muted-foreground">
                Year-1 ROI · {computed.paybackPeriodMonths}mo Payback
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs font-bold text-foreground">
                {currency.format(computed.totalInitialInvestment)}
              </p>
              <p className="text-[10px] text-muted-foreground">
                of {currency.format(inputs.allocatedCapExCeiling)} CapEx
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between pt-1 border-t border-border/50">
            <span className="text-[10px] text-muted-foreground">
              {inputs.manualHoursSavedPerMonth}h/mo saved
            </span>
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="text-[11px] font-bold text-primary hover:underline flex items-center gap-1"
            >
              <span>Edit Model</span>
              <ArrowUpRight className="size-3" />
            </button>
          </div>
        </div>

        <FinancialConfigModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          workspaceContext={workspaceContext}
          onSaved={() => setModel(loadFinancialModel(workspaceContext))}
        />
      </>
    );
  }

  return (
    <>
      <div className={`neu p-6 md:p-7 space-y-6 ${className}`}>
        {/* Header Ribbon */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-border/70 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-0.5 text-[10px] font-bold text-primary uppercase tracking-wider">
                <TrendingUp className="size-3" />
                Financial Intelligence
              </span>
              <span className="text-xs text-muted-foreground">· Currency: <strong className="text-foreground">{inputs.currency} ({currency.symbol})</strong></span>
              {inputs.isLocked && (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                  <Lock className="size-2.5" />
                  Budget Locked
                </span>
              )}
            </div>
            <h2 className="font-display text-xl font-bold text-foreground">
              CapEx Budget Runway & Target ROI Projection
            </h2>
            <p className="text-xs text-muted-foreground">
              Deterministic financial forecast covering developer build effort, recurring cloud OpEx, and automated labor recovery.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="neu-sm neu-press flex items-center gap-2 px-3.5 py-2 text-xs font-bold text-primary hover:brightness-105"
            >
              <Sliders className="size-3.5" />
              <span>Configure Financials</span>
            </button>
          </div>
        </div>

        {/* 4 Core Financial KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* KPI 1: Year-1 ROI */}
          <div className="neu-inset p-4 rounded-xl space-y-1">
            <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              <span>Year-1 Net ROI</span>
              <TrendingUp className="size-3.5 text-emerald-500" />
            </div>
            <p className={`font-display text-2xl font-extrabold ${
              computed.roiPercentYear1 >= 100 ? "text-emerald-500" : "text-primary"
            }`}>
              {computed.roiPercentYear1 > 0 ? `+${computed.roiPercentYear1}%` : `${computed.roiPercentYear1}%`}
            </p>
            <p className="text-[10px] text-muted-foreground">
              Net Value: <strong className="text-foreground">{currency.format(computed.netAnnualBenefitYear1)}</strong>
            </p>
          </div>

          {/* KPI 2: Payback Period */}
          <div className="neu-inset p-4 rounded-xl space-y-1">
            <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              <span>Break-Even Payback</span>
              <Clock className="size-3.5 text-primary" />
            </div>
            <p className="font-display text-2xl font-extrabold text-foreground">
              {computed.paybackPeriodMonths} Months
            </p>
            <p className="text-[10px] text-muted-foreground">
              Target Ceiling: <strong className="text-foreground">{inputs.targetPaybackMonthsCeiling} Mo</strong>
            </p>
          </div>

          {/* KPI 3: CapEx Build Runway */}
          <div className="neu-inset p-4 rounded-xl space-y-1">
            <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              <span>Initial CapEx Build</span>
              <ShieldCheck className="size-3.5 text-sage" />
            </div>
            <p className="font-display text-2xl font-extrabold text-foreground">
              {currency.format(computed.totalInitialInvestment)}
            </p>
            <p className="text-[10px] text-muted-foreground">
              {inputs.estimatedPersonDays} Person-Days + {inputs.contingencyBufferPercent}% Buffer
            </p>
          </div>

          {/* KPI 4: Monthly OpEx */}
          <div className="neu-inset p-4 rounded-xl space-y-1">
            <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              <span>Monthly OpEx</span>
              <DollarSign className="size-3.5 text-muted-foreground" />
            </div>
            <p className="font-display text-2xl font-extrabold text-foreground">
              {currency.format(computed.totalMonthlyOpEx)}
            </p>
            <p className="text-[10px] text-muted-foreground">
              Hosting, AI Tokens & Retainer
            </p>
          </div>
        </div>

        {/* CapEx Budget Ceiling Utilization Bar */}
        <div className="rounded-xl border border-border/70 bg-card/60 p-4 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-foreground flex items-center gap-1.5">
              <span>CapEx Ceiling Utilization</span>
              <span className="text-muted-foreground font-normal">
                ({currency.format(computed.totalInitialInvestment)} / {currency.format(inputs.allocatedCapExCeiling)})
              </span>
            </span>
            <span className={`font-mono font-bold ${
              rawCapExUsagePercent > 100 ? "text-rose-500" : "text-emerald-600 dark:text-emerald-400"
            }`}>
              {rawCapExUsagePercent}% utilized
            </span>
          </div>

          <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${capExUsagePercent}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className={`h-full rounded-full ${
                rawCapExUsagePercent > 100
                  ? "bg-rose-500"
                  : rawCapExUsagePercent > 80
                    ? "bg-amber-500"
                    : "bg-emerald-500"
              }`}
            />
          </div>

          <div className="flex flex-wrap items-center justify-between pt-1 text-[11px] text-muted-foreground">
            <span className="flex items-center gap-1">
              <CheckCircle2 className="size-3 text-emerald-500" />
              Automates ~{inputs.manualHoursSavedPerMonth} hours/mo across internal staff
            </span>
            <span>
              Direct Revenue Uplift: <strong className="text-foreground">+{currency.format(inputs.directRevenueUpliftAnnual)}/yr</strong>
            </span>
          </div>
        </div>
      </div>

      <FinancialConfigModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        workspaceContext={workspaceContext}
        onSaved={() => setModel(loadFinancialModel(workspaceContext))}
      />
    </>
  );
}
