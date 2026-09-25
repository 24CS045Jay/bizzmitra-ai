import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  X,
  DollarSign,
  TrendingUp,
  Clock,
  ShieldCheck,
  AlertCircle,
  Sparkles,
  Calculator,
  Sliders,
  Layers,
  ArrowRight,
  CheckCircle2,
  Lock,
  Unlock,
} from "lucide-react";
import { toast } from "sonner";
import {
  CURRENCIES,
  CurrencyCode,
  FinancialBudgetInputs,
  computeFinancials,
  loadFinancialModel,
  saveFinancialModel,
} from "@/lib/financial-data";

interface FinancialConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  workspaceContext?: { id?: string; name?: string; budget?: number } | null;
  onSaved?: () => void;
}

export function FinancialConfigModal({
  isOpen,
  onClose,
  workspaceContext,
  onSaved,
}: FinancialConfigModalProps) {
  const [inputs, setInputs] = useState<FinancialBudgetInputs>(() => {
    const model = loadFinancialModel(workspaceContext);
    return model.inputs;
  });

  const [activeTab, setActiveTab] = useState<"capex" | "opex" | "returns">("capex");

  useEffect(() => {
    if (isOpen) {
      const model = loadFinancialModel(workspaceContext);
      setInputs(model.inputs);
    }
  }, [isOpen, workspaceContext]);

  if (!isOpen) return null;

  const computed = computeFinancials(inputs);
  const currency = CURRENCIES[inputs.currency] || CURRENCIES.INR;

  const handleCurrencyChange = (c: CurrencyCode) => {
    setInputs((prev) => {
      let multiplier = 1;
      if (prev.currency === "INR" && c !== "INR") multiplier = 0.012; // INR -> USD/EUR/GBP
      else if (prev.currency !== "INR" && c === "INR") multiplier = 83; // USD/EUR/GBP -> INR

      return {
        ...prev,
        currency: c,
        developerRatePerDay: Math.round(prev.developerRatePerDay * multiplier),
        allocatedCapExCeiling: Math.round(prev.allocatedCapExCeiling * multiplier),
        licensingSetupCost: Math.round(prev.licensingSetupCost * multiplier),
        monthlyCloudHosting: Math.round(prev.monthlyCloudHosting * multiplier),
        monthlyAiTokenEstimate: Math.round(prev.monthlyAiTokenEstimate * multiplier),
        monthlyMaintenanceRetainer: Math.round(prev.monthlyMaintenanceRetainer * multiplier),
        internalHourlyStaffCost: Math.round(prev.internalHourlyStaffCost * multiplier),
        directRevenueUpliftAnnual: Math.round(prev.directRevenueUpliftAnnual * multiplier),
      };
    });
  };

  const handleSave = () => {
    saveFinancialModel({
      ...inputs,
      isLocked: true,
      lockedAt: new Date().toISOString(),
    });
    toast.success("Financial Model & ROI verified and locked!", {
      description: "Blueprint confidence score updated to Audit Ready.",
    });
    if (onSaved) onSaved();
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-background/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 12 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="relative w-full max-w-4xl max-h-[90vh] flex flex-col rounded-2xl border border-border bg-card shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border/80 px-6 py-4 bg-muted/30">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-xl bg-primary/15 text-primary">
                <Calculator className="size-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold text-foreground">
                    Financial Budgeting & ROI Modeler
                  </h2>
                  <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                    Live Simulation
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Simulate CapEx build runway, recurring OpEx, and projected payback time.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Currency Selector */}
              <div className="flex items-center gap-1 rounded-xl border border-border bg-background p-1 text-xs">
                {(Object.keys(CURRENCIES) as CurrencyCode[]).map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => handleCurrencyChange(c)}
                    className={`rounded-lg px-2.5 py-1 font-bold transition-colors ${
                      inputs.currency === c
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {c} ({CURRENCIES[c].symbol})
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={onClose}
                className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              >
                <X className="size-5" />
              </button>
            </div>
          </div>

          {/* Real-time Computed Summary Header Ribbon */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 border-b border-border/60 bg-muted/10 p-4">
            <div className="neu-sm p-3 rounded-xl">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Total CapEx Build
              </span>
              <p className="text-lg font-extrabold text-foreground mt-0.5">
                {currency.format(computed.totalInitialInvestment)}
              </p>
              <div className="flex items-center gap-1 text-[10px] text-muted-foreground mt-0.5">
                <span>Ceiling: {currency.format(inputs.allocatedCapExCeiling)}</span>
              </div>
            </div>

            <div className="neu-sm p-3 rounded-xl">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Annual OpEx
              </span>
              <p className="text-lg font-extrabold text-foreground mt-0.5">
                {currency.format(computed.totalAnnualOpEx)}
              </p>
              <span className="text-[10px] text-muted-foreground">
                {currency.format(computed.totalMonthlyOpEx)}/month
              </span>
            </div>

            <div className="neu-sm p-3 rounded-xl">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Year-1 Net ROI
              </span>
              <p className={`text-lg font-extrabold mt-0.5 ${
                computed.roiPercentYear1 > 0 ? "text-emerald-500" : "text-rose-500"
              }`}>
                {computed.roiPercentYear1 > 0 ? `+${computed.roiPercentYear1}%` : `${computed.roiPercentYear1}%`}
              </p>
              <span className="text-[10px] text-muted-foreground">
                Net: {currency.format(computed.netAnnualBenefitYear1)}
              </span>
            </div>

            <div className="neu-sm p-3 rounded-xl">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Payback Period
              </span>
              <p className="text-lg font-extrabold text-primary mt-0.5">
                {computed.paybackPeriodMonths} Months
              </p>
              <div className="flex items-center gap-1 text-[10px]">
                {computed.isPaybackWithinTarget ? (
                  <span className="text-emerald-500 font-bold flex items-center gap-0.5">
                    <CheckCircle2 className="size-3" /> Under {inputs.targetPaybackMonthsCeiling}M target
                  </span>
                ) : (
                  <span className="text-amber-500 font-bold flex items-center gap-0.5">
                    <AlertCircle className="size-3" /> Exceeds {inputs.targetPaybackMonthsCeiling}M target
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex border-b border-border/70 px-6 gap-6 text-xs font-bold">
            <button
              type="button"
              onClick={() => setActiveTab("capex")}
              className={`py-3 border-b-2 transition-colors flex items-center gap-2 ${
                activeTab === "capex"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <Layers className="size-3.5" />
              <span>1. CapEx & Team Rates</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("opex")}
              className={`py-3 border-b-2 transition-colors flex items-center gap-2 ${
                activeTab === "opex"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <Sliders className="size-3.5" />
              <span>2. Cloud & Monthly OpEx</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("returns")}
              className={`py-3 border-b-2 transition-colors flex items-center gap-2 ${
                activeTab === "returns"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <TrendingUp className="size-3.5" />
              <span>3. Savings, Revenue & Targets</span>
            </button>
          </div>

          {/* Body Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {activeTab === "capex" && (
              <div className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-foreground flex items-center justify-between">
                    <span>Developer Rate (Per Day)</span>
                    <span className="text-primary font-mono">{currency.format(inputs.developerRatePerDay)}/day</span>
                  </label>
                  <input
                    type="number"
                    value={inputs.developerRatePerDay}
                    onChange={(e) => setInputs({ ...inputs, developerRatePerDay: Number(e.target.value) || 0 })}
                    className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-xs text-foreground focus:border-primary focus:outline-none"
                  />
                  <p className="text-[11px] text-muted-foreground">
                    Blended daily rate across full-stack engineers, architects, and QA specialists.
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-foreground flex items-center justify-between">
                    <span>Estimated Sprint Effort</span>
                    <span className="text-primary font-mono">{inputs.estimatedPersonDays} Person-Days</span>
                  </label>
                  <input
                    type="number"
                    value={inputs.estimatedPersonDays}
                    onChange={(e) => setInputs({ ...inputs, estimatedPersonDays: Number(e.target.value) || 0 })}
                    className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-xs text-foreground focus:border-primary focus:outline-none"
                  />
                  <p className="text-[11px] text-muted-foreground">
                    Derived from roadmap phases (Sprint 1, 2 & 3 deliverables).
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-foreground flex items-center justify-between">
                    <span>Allocated CapEx Budget Ceiling</span>
                    <span className="text-primary font-mono">{currency.format(inputs.allocatedCapExCeiling)}</span>
                  </label>
                  <input
                    type="number"
                    value={inputs.allocatedCapExCeiling}
                    onChange={(e) => setInputs({ ...inputs, allocatedCapExCeiling: Number(e.target.value) || 0 })}
                    className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-xs text-foreground focus:border-primary focus:outline-none"
                  />
                  <p className="text-[11px] text-muted-foreground">
                    Maximum financial runway approved by leadership/investors.
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-foreground flex items-center justify-between">
                    <span>Licensing & Initial Setup Fee</span>
                    <span className="text-primary font-mono">{currency.format(inputs.licensingSetupCost)}</span>
                  </label>
                  <input
                    type="number"
                    value={inputs.licensingSetupCost}
                    onChange={(e) => setInputs({ ...inputs, licensingSetupCost: Number(e.target.value) || 0 })}
                    className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-xs text-foreground focus:border-primary focus:outline-none"
                  />
                  <p className="text-[11px] text-muted-foreground">
                    Enterprise SaaS tiers, domain SSL certs, and developer tooling licenses.
                  </p>
                </div>

                <div className="sm:col-span-2 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-foreground">
                      Contingency Buffer ({inputs.contingencyBufferPercent}%)
                    </label>
                    <span className="text-xs font-bold text-primary">
                      +{currency.format(computed.contingencyAmount)}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="30"
                    step="5"
                    value={inputs.contingencyBufferPercent}
                    onChange={(e) => setInputs({ ...inputs, contingencyBufferPercent: Number(e.target.value) })}
                    className="w-full accent-primary"
                  />
                  <p className="text-[11px] text-muted-foreground">
                    Recommended 10-20% scope buffer for complex third-party API integrations.
                  </p>
                </div>
              </div>
            )}

            {activeTab === "opex" && (
              <div className="grid gap-6 sm:grid-cols-3">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-foreground flex items-center justify-between">
                    <span>Cloud Hosting (Monthly)</span>
                  </label>
                  <input
                    type="number"
                    value={inputs.monthlyCloudHosting}
                    onChange={(e) => setInputs({ ...inputs, monthlyCloudHosting: Number(e.target.value) || 0 })}
                    className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-xs text-foreground focus:border-primary focus:outline-none"
                  />
                  <p className="text-[11px] text-muted-foreground">
                    Supabase PostgreSQL, edge compute, and CDN bandwidth.
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-foreground flex items-center justify-between">
                    <span>LLM / AI Token Fees (Monthly)</span>
                  </label>
                  <input
                    type="number"
                    value={inputs.monthlyAiTokenEstimate}
                    onChange={(e) => setInputs({ ...inputs, monthlyAiTokenEstimate: Number(e.target.value) || 0 })}
                    className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-xs text-foreground focus:border-primary focus:outline-none"
                  />
                  <p className="text-[11px] text-muted-foreground">
                    Groq Llama 3.3 and DeepSeek API invocations.
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-foreground flex items-center justify-between">
                    <span>DevOps & Maintenance (Monthly)</span>
                  </label>
                  <input
                    type="number"
                    value={inputs.monthlyMaintenanceRetainer}
                    onChange={(e) => setInputs({ ...inputs, monthlyMaintenanceRetainer: Number(e.target.value) || 0 })}
                    className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-xs text-foreground focus:border-primary focus:outline-none"
                  />
                  <p className="text-[11px] text-muted-foreground">
                    Security patches, uptime monitoring, and SLA guarantee.
                  </p>
                </div>

                <div className="sm:col-span-3 neu-inset p-4 rounded-xl flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-foreground">Total Monthly OpEx Runway</p>
                    <p className="text-[11px] text-muted-foreground">
                      Continuous operational cost once deployed into production.
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-base font-extrabold text-foreground">
                      {currency.format(computed.totalMonthlyOpEx)} / month
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      {currency.format(computed.totalAnnualOpEx)} / year
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "returns" && (
              <div className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-foreground flex items-center justify-between">
                    <span>Manual Hours Saved (Monthly)</span>
                    <span className="text-primary font-mono">{inputs.manualHoursSavedPerMonth} hrs/mo</span>
                  </label>
                  <input
                    type="number"
                    value={inputs.manualHoursSavedPerMonth}
                    onChange={(e) => setInputs({ ...inputs, manualHoursSavedPerMonth: Number(e.target.value) || 0 })}
                    className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-xs text-foreground focus:border-primary focus:outline-none"
                  />
                  <p className="text-[11px] text-muted-foreground">
                    Hours automated per month across support, back-office, or intake operations.
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-foreground flex items-center justify-between">
                    <span>Internal Staff Hourly Cost</span>
                    <span className="text-primary font-mono">{currency.format(inputs.internalHourlyStaffCost)}/hr</span>
                  </label>
                  <input
                    type="number"
                    value={inputs.internalHourlyStaffCost}
                    onChange={(e) => setInputs({ ...inputs, internalHourlyStaffCost: Number(e.target.value) || 0 })}
                    className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-xs text-foreground focus:border-primary focus:outline-none"
                  />
                  <p className="text-[11px] text-muted-foreground">
                    Fully burdened hourly rate of internal employees whose time is recovered.
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-foreground flex items-center justify-between">
                    <span>Direct Revenue Uplift (Annual)</span>
                    <span className="text-primary font-mono">{currency.format(inputs.directRevenueUpliftAnnual)}</span>
                  </label>
                  <input
                    type="number"
                    value={inputs.directRevenueUpliftAnnual}
                    onChange={(e) => setInputs({ ...inputs, directRevenueUpliftAnnual: Number(e.target.value) || 0 })}
                    className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-xs text-foreground focus:border-primary focus:outline-none"
                  />
                  <p className="text-[11px] text-muted-foreground">
                    Estimated new revenue unlocked via self-serve onboarding, churn reduction, or faster conversion.
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-foreground flex items-center justify-between">
                    <span>Target Payback Ceiling (Months)</span>
                    <span className="text-primary font-mono">{inputs.targetPaybackMonthsCeiling} Months</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="24"
                    value={inputs.targetPaybackMonthsCeiling}
                    onChange={(e) => setInputs({ ...inputs, targetPaybackMonthsCeiling: Number(e.target.value) || 1 })}
                    className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-xs text-foreground focus:border-primary focus:outline-none"
                  />
                  <p className="text-[11px] text-muted-foreground">
                    Executive threshold for break-even payback period (typically 6-12 months).
                  </p>
                </div>

                <div className="sm:col-span-2 neu-inset p-4 rounded-xl flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-foreground">Gross Annual Value Generated</p>
                    <p className="text-[11px] text-muted-foreground">
                      Labor savings ({currency.format(computed.grossAnnualLaborSavings)}) + Revenue uplift ({currency.format(inputs.directRevenueUpliftAnnual)})
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-base font-extrabold text-emerald-500">
                      +{currency.format(computed.totalGrossAnnualBenefit)} / year
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-between border-t border-border/80 px-6 py-4 bg-muted/20">
            <div className="flex items-center gap-2 text-xs">
              {computed.isBudgetUnderCeiling ? (
                <span className="flex items-center gap-1 font-bold text-emerald-600 dark:text-emerald-400">
                  <ShieldCheck className="size-4" />
                  Budget is within ceiling
                </span>
              ) : (
                <span className="flex items-center gap-1 font-bold text-rose-500">
                  <AlertCircle className="size-4" />
                  CapEx exceeds approved ceiling by {currency.format(computed.totalInitialInvestment - inputs.allocatedCapExCeiling)}
                </span>
              )}
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="neu-sm neu-press px-4 py-2 text-xs font-semibold text-foreground hover:bg-muted"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="neu-press flex items-center gap-2 rounded-xl bg-primary px-5 py-2 text-xs font-bold text-primary-foreground glow-primary hover:brightness-105"
              >
                <Lock className="size-3.5" />
                <span>Lock Budget & Verify ROI</span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
