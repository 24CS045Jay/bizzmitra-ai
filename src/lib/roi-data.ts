/**
 * Dynamic ROI Calculator & Financial Transformation Data Engine
 * Models real financial metrics, payback timelines, and 36-month cumulative value curves
 * for both TalentCraft HR Consultancy (Flagship) and Nexa E-commerce Support.
 */

export type HrRoiInputs = {
  recruiters: number;
  monthlyApplicants: number;
  hourlyCostInr: number;
  spreadsheetHoursPerWeek: number;
  automationRatePct: number;
  placementFeeAvgInr: number;
  monthlyPlacements: number;
};

export const DEFAULT_HR_ROI_INPUTS: HrRoiInputs = {
  recruiters: 8,
  monthlyApplicants: 400,
  hourlyCostInr: 450,
  spreadsheetHoursPerWeek: 18,
  automationRatePct: 65,
  placementFeeAvgInr: 65000,
  monthlyPlacements: 12,
};

export type HrRoiResults = {
  weeklyHoursSaved: number;
  annualHoursSaved: number;
  annualLaborSavingsInr: number;
  velocityRevenueGainInr: number;
  totalAnnualBenefitInr: number;
  annualPlatformInvestmentInr: number;
  netAnnualSavingsInr: number;
  paybackPeriodMonths: number;
  threeYearRoiMultiplePct: number;
  turnaroundDropPct: number;
  candidateDropoffDropPct: number;
  fullTimeEquivalentsReclaimed: number;
  cumulativeCashflow: {
    month: string;
    monthIndex: number;
    cumulativeCost: number;
    cumulativeBenefit: number;
    netCashflow: number;
  }[];
  sensitivity: {
    scenario: "Conservative" | "Expected" | "Aggressive";
    automationPct: number;
    annualBenefitInr: number;
    netAnnualSavingsInr: number;
    paybackMonths: number;
    threeYearRoi: number;
  }[];
};

export function computeHrRoi(inputs: HrRoiInputs): HrRoiResults {
  // 1. Labor Hours Saved
  const totalWeeklyManualHours = inputs.recruiters * inputs.spreadsheetHoursPerWeek;
  const weeklyHoursSaved = Math.round(totalWeeklyManualHours * (inputs.automationRatePct / 100));
  const annualHoursSaved = weeklyHoursSaved * 50; // 50 working weeks
  const annualLaborSavingsInr = annualHoursSaved * inputs.hourlyCostInr;

  // 2. Faster Turnaround & Capacity Revenue Boost
  // Shorter hiring cycle (28d -> 9d) unlocks +15% more placements without adding headcount
  const additionalPlacementsYearly = Math.round(inputs.monthlyPlacements * 12 * 0.15 * (inputs.automationRatePct / 65));
  const velocityRevenueGainInr = additionalPlacementsYearly * inputs.placementFeeAvgInr;

  // 3. Financial Totals
  const totalAnnualBenefitInr = annualLaborSavingsInr + velocityRevenueGainInr;
  const annualPlatformInvestmentInr = 280000; // Estimated BizzMitra software subscription + setup
  const netAnnualSavingsInr = Math.max(0, totalAnnualBenefitInr - annualPlatformInvestmentInr);

  // 4. Payback & Multiples
  const monthlyBenefit = totalAnnualBenefitInr / 12;
  const paybackPeriodMonths = monthlyBenefit > 0
    ? Math.max(0.8, Math.round((annualPlatformInvestmentInr / totalAnnualBenefitInr) * 12 * 10) / 10)
    : 12;

  const threeYearTotalBenefit = totalAnnualBenefitInr * 3;
  const threeYearTotalCost = annualPlatformInvestmentInr * 3;
  const threeYearRoiMultiplePct = Math.round(((threeYearTotalBenefit - threeYearTotalCost) / threeYearTotalCost) * 100);

  const fteReclaimed = Math.round((weeklyHoursSaved / 40) * 10) / 10;
  const turnaroundDropPct = Math.min(75, Math.round(inputs.automationRatePct * 1.05));
  const candidateDropoffDropPct = 78; // 28% down to 6%

  // 5. 36-Month Cumulative Projection (Quarterly points for chart cleanliness)
  const cumulativeCashflow = [];
  let cumCost = annualPlatformInvestmentInr * 0.35; // Initial setup cost upfront
  let cumBenefit = 0;

  for (let m = 1; m <= 36; m++) {
    cumCost += (annualPlatformInvestmentInr * 0.65) / 12;
    // Ramp up benefit over first 3 months (40%, 75%, 100%)
    const ramp = m === 1 ? 0.4 : m === 2 ? 0.75 : 1.0;
    cumBenefit += monthlyBenefit * ramp;

    if (m === 1 || m % 3 === 0) {
      cumulativeCashflow.push({
        month: `M${m}`,
        monthIndex: m,
        cumulativeCost: Math.round(cumCost),
        cumulativeBenefit: Math.round(cumBenefit),
        netCashflow: Math.round(cumBenefit - cumCost),
      });
    }
  }

  // 6. Sensitivity Analysis
  const scenarios: Array<{ name: "Conservative" | "Expected" | "Aggressive"; rate: number }> = [
    { name: "Conservative", rate: Math.max(35, inputs.automationRatePct - 20) },
    { name: "Expected", rate: inputs.automationRatePct },
    { name: "Aggressive", rate: Math.min(85, inputs.automationRatePct + 15) },
  ];

  const sensitivity = scenarios.map((sc) => {
    const wSaved = Math.round(totalWeeklyManualHours * (sc.rate / 100));
    const aLabor = wSaved * 50 * inputs.hourlyCostInr;
    const aPlacements = Math.round(inputs.monthlyPlacements * 12 * 0.15 * (sc.rate / 65));
    const aRev = aPlacements * inputs.placementFeeAvgInr;
    const tot = aLabor + aRev;
    const net = Math.max(0, tot - annualPlatformInvestmentInr);
    const payback = Math.round((annualPlatformInvestmentInr / tot) * 12 * 10) / 10;
    const threeYr = Math.round(((tot * 3 - threeYearTotalCost) / threeYearTotalCost) * 100);

    return {
      scenario: sc.name,
      automationPct: sc.rate,
      annualBenefitInr: tot,
      netAnnualSavingsInr: net,
      paybackMonths: payback,
      threeYearRoi: threeYr,
    };
  });

  return {
    weeklyHoursSaved,
    annualHoursSaved,
    annualLaborSavingsInr,
    velocityRevenueGainInr,
    totalAnnualBenefitInr,
    annualPlatformInvestmentInr,
    netAnnualSavingsInr,
    paybackPeriodMonths,
    threeYearRoiMultiplePct,
    turnaroundDropPct,
    candidateDropoffDropPct,
    fullTimeEquivalentsReclaimed: fteReclaimed,
    cumulativeCashflow,
    sensitivity,
  };
}

export const HR_BENCHMARKS = [
  { metric: "Placement Turnaround", before: "28 Days", after: "9 Days", change: "-68%", favorable: true },
  { metric: "Candidate Drop-Off Rate", before: "28%", after: "6%", change: "-78%", favorable: true },
  { metric: "Weekly Admin per Recruiter", before: "18 Hours", after: "4 Hours", change: "-77%", favorable: true },
  { metric: "Candidate Interview No-Show", before: "32%", after: "7%", change: "-78%", favorable: true },
  { metric: "Attendance Payroll Delay", before: "5 Days", after: "Instant", change: "100%", favorable: true },
];

export const HR_READINESS_RADAR = [
  { dimension: "Strategy & Alignment", score: 88, benchmark: 70 },
  { dimension: "Process Standardization", score: 82, benchmark: 65 },
  { dimension: "Data Architecture", score: 94, benchmark: 60 },
  { dimension: "Engineering Readiness", score: 91, benchmark: 75 },
  { dimension: "Team Adoption", score: 76, benchmark: 68 },
  { dimension: "Security & Compliance", score: 89, benchmark: 80 },
];
