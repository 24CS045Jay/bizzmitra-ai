export type CurrencyCode = "INR" | "USD" | "EUR" | "GBP";

export interface CurrencyConfig {
  symbol: string;
  code: CurrencyCode;
  name: string;
  format: (amount: number) => string;
}

export const CURRENCIES: Record<CurrencyCode, CurrencyConfig> = {
  INR: {
    symbol: "₹",
    code: "INR",
    name: "Indian Rupee (₹)",
    format: (amt: number) => {
      if (amt >= 10000000) return `₹${(amt / 10000000).toFixed(2)} Cr`;
      if (amt >= 100000) return `₹${(amt / 100000).toFixed(2)} L`;
      return `₹${amt.toLocaleString("en-IN")}`;
    },
  },
  USD: {
    symbol: "$",
    code: "USD",
    name: "US Dollar ($)",
    format: (amt: number) => {
      if (amt >= 1000000) return `$${(amt / 1000000).toFixed(2)}M`;
      if (amt >= 1000) return `$${(amt / 1000).toFixed(1)}K`;
      return `$${amt.toLocaleString("en-US")}`;
    },
  },
  EUR: {
    symbol: "€",
    code: "EUR",
    name: "Euro (€)",
    format: (amt: number) => {
      if (amt >= 1000000) return `€${(amt / 1000000).toFixed(2)}M`;
      if (amt >= 1000) return `€${(amt / 1000).toFixed(1)}K`;
      return `€${amt.toLocaleString("de-DE")}`;
    },
  },
  GBP: {
    symbol: "£",
    code: "GBP",
    name: "British Pound (£)",
    format: (amt: number) => {
      if (amt >= 1000000) return `£${(amt / 1000000).toFixed(2)}M`;
      if (amt >= 1000) return `£${(amt / 1000).toFixed(1)}K`;
      return `£${amt.toLocaleString("en-GB")}`;
    },
  },
};

export interface FinancialBudgetInputs {
  currency: CurrencyCode;
  // CapEx (Build Costs)
  developerRatePerDay: number;
  allocatedCapExCeiling: number;
  licensingSetupCost: number;
  contingencyBufferPercent: number;

  // OpEx (Monthly Running Costs)
  monthlyCloudHosting: number;
  monthlyAiTokenEstimate: number;
  monthlyMaintenanceRetainer: number;

  // Business Value & Cost Savings
  manualHoursSavedPerMonth: number;
  internalHourlyStaffCost: number;
  directRevenueUpliftAnnual: number;
  targetPaybackMonthsCeiling: number;

  // Estimated Person Days (from roadmap or default)
  estimatedPersonDays: number;
  isLocked: boolean;
  lockedAt?: string | undefined;
}

export interface ComputedFinancials {
  totalEstimatedBuildCost: number;
  contingencyAmount: number;
  totalInitialInvestment: number;
  totalMonthlyOpEx: number;
  totalAnnualOpEx: number;
  grossAnnualLaborSavings: number;
  totalGrossAnnualBenefit: number;
  netAnnualBenefitYear1: number;
  roiPercentYear1: number;
  paybackPeriodMonths: number;
  isBudgetUnderCeiling: boolean;
  isPaybackWithinTarget: boolean;
  isAuditReady: boolean;
}

export interface FullFinancialModel {
  inputs: FinancialBudgetInputs;
  computed: ComputedFinancials;
}

export const DEFAULT_FINANCIAL_INPUTS: FinancialBudgetInputs = {
  currency: "INR",
  developerRatePerDay: 12500,
  allocatedCapExCeiling: 1800000,
  licensingSetupCost: 150000,
  contingencyBufferPercent: 15,

  monthlyCloudHosting: 25000,
  monthlyAiTokenEstimate: 15000,
  monthlyMaintenanceRetainer: 30000,

  manualHoursSavedPerMonth: 420,
  internalHourlyStaffCost: 1100,
  directRevenueUpliftAnnual: 1200000,
  targetPaybackMonthsCeiling: 6,

  estimatedPersonDays: 95,
  isLocked: true,
  lockedAt: new Date().toISOString(),
};

export function computeFinancials(inputs: FinancialBudgetInputs): ComputedFinancials {
  const baseBuildCost = inputs.estimatedPersonDays * inputs.developerRatePerDay + inputs.licensingSetupCost;
  const contingencyAmount = baseBuildCost * (inputs.contingencyBufferPercent / 100);
  const totalInitialInvestment = baseBuildCost + contingencyAmount;

  const totalMonthlyOpEx =
    inputs.monthlyCloudHosting + inputs.monthlyAiTokenEstimate + inputs.monthlyMaintenanceRetainer;
  const totalAnnualOpEx = totalMonthlyOpEx * 12;

  const grossAnnualLaborSavings = inputs.manualHoursSavedPerMonth * inputs.internalHourlyStaffCost * 12;
  const totalGrossAnnualBenefit = grossAnnualLaborSavings + inputs.directRevenueUpliftAnnual;

  const netAnnualBenefitYear1 = totalGrossAnnualBenefit - totalAnnualOpEx - totalInitialInvestment;

  const totalYear1Costs = totalInitialInvestment + totalAnnualOpEx;
  const roiPercentYear1 = totalYear1Costs > 0 ? Math.round(((totalGrossAnnualBenefit - totalYear1Costs) / totalYear1Costs) * 100) : 0;

  const monthlyNetRunRate = (totalGrossAnnualBenefit - totalAnnualOpEx) / 12;
  const rawPayback = monthlyNetRunRate > 0 ? totalInitialInvestment / monthlyNetRunRate : 99;
  const paybackPeriodMonths = Math.min(99, Math.round(rawPayback * 10) / 10);

  const isBudgetUnderCeiling = totalInitialInvestment <= inputs.allocatedCapExCeiling;
  const isPaybackWithinTarget = paybackPeriodMonths <= inputs.targetPaybackMonthsCeiling;
  const isAuditReady = inputs.isLocked && isBudgetUnderCeiling && isPaybackWithinTarget;

  return {
    totalEstimatedBuildCost: baseBuildCost,
    contingencyAmount,
    totalInitialInvestment,
    totalMonthlyOpEx,
    totalAnnualOpEx,
    grossAnnualLaborSavings,
    totalGrossAnnualBenefit,
    netAnnualBenefitYear1,
    roiPercentYear1,
    paybackPeriodMonths,
    isBudgetUnderCeiling,
    isPaybackWithinTarget,
    isAuditReady,
  };
}

const STORAGE_KEY = "bizzmitra.workspace.financials";

export function loadFinancialModel(workspaceContext?: { id?: string; name?: string; budget?: number } | null): FullFinancialModel {
  try {
    if (typeof window !== "undefined") {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed?.inputs) {
          return {
            inputs: parsed.inputs,
            computed: computeFinancials(parsed.inputs),
          };
        }
      }
    }
  } catch (err) {
    console.warn("[FinancialData] Failed to load from localStorage:", err);
  }

  const initialInputs: FinancialBudgetInputs = {
    ...DEFAULT_FINANCIAL_INPUTS,
    allocatedCapExCeiling: workspaceContext?.budget || DEFAULT_FINANCIAL_INPUTS.allocatedCapExCeiling,
  };

  return {
    inputs: initialInputs,
    computed: computeFinancials(initialInputs),
  };
}

export function saveFinancialModel(inputs: FinancialBudgetInputs): FullFinancialModel {
  const model: FullFinancialModel = {
    inputs: {
      ...inputs,
      lockedAt: inputs.isLocked ? (inputs.lockedAt || new Date().toISOString()) : undefined,
    },
    computed: computeFinancials(inputs),
  };

  try {
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(model));

      // Synchronize workspaceContext budget & lock state
      try {
        const rawCtx = localStorage.getItem("bizzmitra.workspaceContext");
        if (rawCtx) {
          const ctx = JSON.parse(rawCtx);
          ctx.budget = inputs.allocatedCapExCeiling;
          ctx.financialsLocked = inputs.isLocked;
          localStorage.setItem("bizzmitra.workspaceContext", JSON.stringify(ctx));
          window.dispatchEvent(new CustomEvent("bizzmitra:workspace-updated", { detail: ctx }));
        }
      } catch {}

      window.dispatchEvent(new CustomEvent("bizzmitra:financials-updated", { detail: model }));
    }
  } catch (err) {
    console.warn("[FinancialData] Failed to save to localStorage:", err);
  }

  return model;
}
