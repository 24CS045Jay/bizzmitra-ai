/**
 * Dynamic ROI Calculator & Financial Transformation Data Engine
 * Models real financial metrics, payback timelines, and 36-month cumulative value curves
 * with full multi-domain problem-statement adaptability.
 */

export type HrRoiInputs = {
  recruiters: number;
  monthlyApplicants: number;
  hourlyCostInr: number;
  spreadsheetHoursPerWeek: number;
  automationRatePct: number;
  placementFeeAvgInr?: number;
  monthlyPlacements?: number;
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

export function computeHrRoi(inputs: HrRoiInputs, customPlatformCost?: number): HrRoiResults {
  // 1. Labor Hours Saved
  const totalWeeklyManualHours = inputs.recruiters * inputs.spreadsheetHoursPerWeek;
  const weeklyHoursSaved = Math.round(totalWeeklyManualHours * (inputs.automationRatePct / 100));
  const annualHoursSaved = weeklyHoursSaved * 50; // 50 working weeks
  const annualLaborSavingsInr = annualHoursSaved * inputs.hourlyCostInr;

  // 2. Faster Turnaround & Capacity Revenue Boost
  const placementFee = inputs.placementFeeAvgInr ?? 65000;
  const baseMonthlyVolume = inputs.monthlyPlacements ?? 12;
  const additionalPlacementsYearly = Math.round(baseMonthlyVolume * 12 * 0.15 * (inputs.automationRatePct / 65));
  const velocityRevenueGainInr = additionalPlacementsYearly * placementFee;

  // 3. Financial Totals
  const totalAnnualBenefitInr = annualLaborSavingsInr + velocityRevenueGainInr;
  const annualPlatformInvestmentInr = customPlatformCost ?? 280000; // Software subscription + setup
  const netAnnualSavingsInr = Math.max(0, totalAnnualBenefitInr - annualPlatformInvestmentInr);

  // 4. Payback & Multiples
  const monthlyBenefit = totalAnnualBenefitInr / 12;
  const paybackPeriodMonths =
    monthlyBenefit > 0
      ? Math.max(0.6, Math.round((annualPlatformInvestmentInr / totalAnnualBenefitInr) * 12 * 10) / 10)
      : 12;

  const threeYearTotalBenefit = totalAnnualBenefitInr * 3;
  const threeYearTotalCost = annualPlatformInvestmentInr * 3;
  const threeYearRoiMultiplePct = Math.round(((threeYearTotalBenefit - threeYearTotalCost) / threeYearTotalCost) * 100);

  const fteReclaimed = Math.round((weeklyHoursSaved / 40) * 10) / 10;
  const turnaroundDropPct = Math.min(85, Math.round(inputs.automationRatePct * 1.05));
  const candidateDropoffDropPct = 78;

  // 5. 36-Month Cumulative Projection (Quarterly points)
  const cumulativeCashflow = [];
  let cumCost = annualPlatformInvestmentInr * 0.35; // Setup cost upfront
  let cumBenefit = 0;

  for (let m = 1; m <= 36; m++) {
    cumCost += (annualPlatformInvestmentInr * 0.65) / 12;
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
    const aPlacements = Math.round(baseMonthlyVolume * 12 * 0.15 * (sc.rate / 65));
    const aRev = aPlacements * placementFee;
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

export interface RoiSliderDef {
  key: keyof HrRoiInputs;
  label: string;
  unit: string;
  min: number;
  max: number;
  step: number;
  desc: string;
}

export interface RoiBenchmarkItem {
  metric: string;
  before: string;
  after: string;
  change: string;
  favorable: boolean;
}

export interface RoiReadinessDimension {
  dimension: string;
  score: number;
  benchmark: number;
}

export interface DomainRoiBlueprint {
  domainId: string;
  domainTitle: string;
  scenarioName: string;
  executiveSubtitle: string;
  laborUnitLabel: string;
  defaultInputs: HrRoiInputs;
  platformCostInr: number;
  sliders: RoiSliderDef[];
  benchmarks: RoiBenchmarkItem[];
  readinessRadar: RoiReadinessDimension[];
}

// ─────────────────────────────────────────────────────────────────────────────
// DOMAIN BLUEPRINTS
// ─────────────────────────────────────────────────────────────────────────────

// 1. Clean Tech & Solar
export const SOLAR_ROI_BLUEPRINT: DomainRoiBlueprint = {
  domainId: "solar",
  domainTitle: "Clean Tech & Solar Energy",
  scenarioName: "Clean Tech & Solar Inverter Operations",
  executiveSubtitle: "Algorithmic ROI modeling curtailed generation recovery, reduced truck rolls, and automated IEEE 1547 compliance.",
  laborUnitLabel: "Plant Operations & Electrical Engineers",
  platformCostInr: 320000,
  defaultInputs: {
    recruiters: 6, // Field Engineers
    monthlyApplicants: 500, // Monthly Megawatts / Plant Inverter Sets
    hourlyCostInr: 650, // Specialist Hourly Cost
    spreadsheetHoursPerWeek: 20, // Manual diagnostics & log compiling
    automationRatePct: 70, // SCADA & dispatch automation
    placementFeeAvgInr: 80000, // Revenue yield per recovered outage block
    monthlyPlacements: 14,
  },
  sliders: [
    { key: "recruiters", label: "Plant Operations & Field Squad", unit: "Engineers", min: 2, max: 25, step: 1, desc: "Technicians monitoring inverter alarms and SCADA logs" },
    { key: "monthlyApplicants", label: "Active Plant Inverter Units", unit: "Inverters", min: 50, max: 2000, step: 25, desc: "Installed string and central inverters tracked at 1Hz" },
    { key: "hourlyCostInr", label: "Engineer Cost / Hour", unit: "₹ / hr", min: 300, max: 1500, step: 25, desc: "Blended hourly rate for electrical and SCADA specialists" },
    { key: "spreadsheetHoursPerWeek", label: "Manual SCADA & Alarm Triage", unit: "hrs / wk / tech", min: 5, max: 35, step: 1, desc: "Time lost to manual thermal inspection and log entry" },
    { key: "automationRatePct", label: "Curtailment & Dispatch Auto Rate", unit: "%", min: 30, max: 85, step: 5, desc: "Sub-500ms automated curtailment response rate" },
  ],
  benchmarks: [
    { metric: "Grid Curtailment Setpoint Latency", before: "18 Minutes", after: "< 500 ms", change: "-98%", favorable: true },
    { metric: "Thermal Inverter Clipping Detection", before: "4 Days", after: "Instant", change: "-99%", favorable: true },
    { metric: "Unnecessary Field Truck Rolls", before: "24 / month", after: "5 / month", change: "-79%", favorable: true },
    { metric: "PPA Lost Energy Recovery", before: "82% Yield", after: "98.4% Yield", change: "+20%", favorable: true },
    { metric: "IEEE 1547 Compliance Audit Time", before: "6 Weeks", after: "4 Days", change: "-90%", favorable: true },
  ],
  readinessRadar: [
    { dimension: "Modbus/SCADA Protocols", score: 94, benchmark: 70 },
    { dimension: "High-Frequency Telemetry", score: 92, benchmark: 65 },
    { dimension: "Curtailment Solvers", score: 88, benchmark: 60 },
    { dimension: "Grid Security (mTLS)", score: 95, benchmark: 75 },
    { dimension: "Field Dispatch Adoption", score: 82, benchmark: 68 },
    { dimension: "PPA Yield Accounting", score: 90, benchmark: 78 },
  ],
};

// 2. Healthcare Diagnostics (LIS)
export const HEALTHCARE_ROI_BLUEPRINT: DomainRoiBlueprint = {
  domainId: "healthcare",
  domainTitle: "Clinical Diagnostics & Pathology",
  scenarioName: "Clinical Diagnostics & LIS Telemetry",
  executiveSubtitle: "Financial justification modeling automated ASTM analyzer transcription, sub-90s critical panic alerts, and CAP/NABL compliance.",
  laborUnitLabel: "Lab Technicians & Phlebotomists",
  platformCostInr: 290000,
  defaultInputs: {
    recruiters: 10, // Lab Technicians
    monthlyApplicants: 1200, // Monthly Patient Diagnostic Profiles
    hourlyCostInr: 480, // Lab Tech Hourly Cost
    spreadsheetHoursPerWeek: 16, // Manual result transcription & phone calls
    automationRatePct: 75, // ASTM Analyzer automation rate
    placementFeeAvgInr: 45000, // Average revenue per special test batch
    monthlyPlacements: 18,
  },
  sliders: [
    { key: "recruiters", label: "Laboratory Diagnostic Squad", unit: "Technicians", min: 2, max: 35, step: 1, desc: "Technicians operating analyzers and accessioning tubes" },
    { key: "monthlyApplicants", label: "Monthly Diagnostic Orders", unit: "Orders", min: 200, max: 5000, step: 50, desc: "Specimen tubes processed through chemistry/hematology" },
    { key: "hourlyCostInr", label: "Technician Cost / Hour", unit: "₹ / hr", min: 250, max: 1200, step: 25, desc: "Blended hourly compensation for licensed lab technicians" },
    { key: "spreadsheetHoursPerWeek", label: "Manual Report Typing & Calling", unit: "hrs / wk / tech", min: 5, max: 30, step: 1, desc: "Time lost to manual result entry and phoning doctors" },
    { key: "automationRatePct", label: "Analyzer Auto-Verification Rate", unit: "%", min: 30, max: 90, step: 5, desc: "Delta-checked auto-release of normal test results" },
  ],
  benchmarks: [
    { metric: "Critical Panic Alert Dispatch", before: "45 Minutes", after: "< 90 Seconds", change: "-97%", favorable: true },
    { metric: "Specimen Tube Mix-Up Rate", before: "2.8%", after: "0.02%", change: "-99%", favorable: true },
    { metric: "Weekly Manual Result Entry", before: "16 Hours", after: "2 Hours", change: "-88%", favorable: true },
    { metric: "Routine Outpatient Report TAT", before: "24 Hours", after: "3 Hours", change: "-88%", favorable: true },
    { metric: "CAP/NABL Audit Preparation", before: "3 Weeks", after: "Instant", change: "-95%", favorable: true },
  ],
  readinessRadar: [
    { dimension: "Analyzer ASTM Interfacing", score: 95, benchmark: 70 },
    { dimension: "Specimen 2D Barcoding", score: 92, benchmark: 65 },
    { dimension: "Critical Panic Escalation", score: 96, benchmark: 75 },
    { dimension: "HIPAA / DPDP Vault", score: 94, benchmark: 80 },
    { dimension: "Pathologist Signoff UI", score: 86, benchmark: 68 },
    { dimension: "Westgard QC Rules", score: 89, benchmark: 72 },
  ],
};

// 3. Fleet Logistics & Supply Chain
export const LOGISTICS_ROI_BLUEPRINT: DomainRoiBlueprint = {
  domainId: "logistics",
  domainTitle: "Fleet Logistics & Supply Chain",
  scenarioName: "Fleet Dispatch, VRP Routing & Telematics",
  executiveSubtitle: "Algorithmic modeling of dynamic route fuel savings, reduced empty deadhead miles, and automated proof-of-delivery reconciliation.",
  laborUnitLabel: "Dispatchers & Route Planners",
  platformCostInr: 300000,
  defaultInputs: {
    recruiters: 6, // Dispatchers
    monthlyApplicants: 800, // Freight Consignments
    hourlyCostInr: 420, // Dispatcher Hourly Cost
    spreadsheetHoursPerWeek: 22, // Phone dispatch & manual route planning
    automationRatePct: 65, // VRP optimization rate
    placementFeeAvgInr: 55000, // Revenue yield per route expansion
    monthlyPlacements: 15,
  },
  sliders: [
    { key: "recruiters", label: "Fleet Dispatching Squad", unit: "Dispatchers", min: 2, max: 25, step: 1, desc: "Planners assigning daily loads and tracking driver runs" },
    { key: "monthlyApplicants", label: "Monthly Freight Consignments", unit: "Shipments", min: 100, max: 4000, step: 50, desc: "Loads dispatched across linehaul and last-mile routes" },
    { key: "hourlyCostInr", label: "Dispatcher Cost / Hour", unit: "₹ / hr", min: 200, max: 1000, step: 25, desc: "Blended compensation for logistics coordinators" },
    { key: "spreadsheetHoursPerWeek", label: "Phone Tag & Route Manifests", unit: "hrs / wk / coord", min: 5, max: 35, step: 1, desc: "Time lost calling drivers and hand-writing manifests" },
    { key: "automationRatePct", label: "VRP Route Optimization Rate", unit: "%", min: 30, max: 85, step: 5, desc: "Algorithmically optimized multi-stop delivery routes" },
  ],
  benchmarks: [
    { metric: "Daily Route Planning Time", before: "4 Hours", after: "8 Minutes", change: "-97%", favorable: true },
    { metric: "Empty Return Miles (Deadhead)", before: "24%", after: "9%", change: "-62%", favorable: true },
    { metric: "Consignee Delivery Disputes", before: "14%", after: "1.2%", change: "-91%", favorable: true },
    { metric: "Fleet Fuel Consumption", before: "100% Base", after: "-18% Fuel", change: "+18%", favorable: true },
    { metric: "Paper Invoicing / POD Delay", before: "7 Days", after: "Instant", change: "-100%", favorable: true },
  ],
  readinessRadar: [
    { dimension: "CAN-Bus GPS Telematics", score: 92, benchmark: 68 },
    { dimension: "Dynamic VRP Solvers", score: 90, benchmark: 62 },
    { dimension: "Driver Mobile App Adoption", score: 84, benchmark: 65 },
    { dimension: "Geofence Gate Automation", score: 94, benchmark: 70 },
    { dimension: "Carrier EDI Bridge", score: 87, benchmark: 66 },
    { dimension: "DOT HOS Compliance", score: 91, benchmark: 75 },
  ],
};

// 4. FinTech & Lending
export const FINTECH_ROI_BLUEPRINT: DomainRoiBlueprint = {
  domainId: "fintech",
  domainTitle: "FinTech & Banking Infrastructure",
  scenarioName: "FinTech Core Ledger & Automated Underwriting",
  executiveSubtitle: "Financial justification modeling instant KYC verification, sub-minute credit decisioning, and automated NACH recurring collection.",
  laborUnitLabel: "Underwriting & Credit Officers",
  platformCostInr: 340000,
  defaultInputs: {
    recruiters: 7, // Underwriters
    monthlyApplicants: 600, // Loan Applications
    hourlyCostInr: 580, // Underwriter Hourly Cost
    spreadsheetHoursPerWeek: 18, // Manual bank statement & bureau parsing
    automationRatePct: 70, // Automated underwriting decision rate
    placementFeeAvgInr: 75000, // Processing fee revenue per approved loan
    monthlyPlacements: 16,
  },
  sliders: [
    { key: "recruiters", label: "Credit & Underwriting Squad", unit: "Officers", min: 2, max: 25, step: 1, desc: "Officers manually evaluating FOIR, CIBIL, and banking" },
    { key: "monthlyApplicants", label: "Monthly Loan Applications", unit: "Borrowers", min: 100, max: 5000, step: 50, desc: "Personal, business, or MSME credit intake volume" },
    { key: "hourlyCostInr", label: "Officer Cost / Hour", unit: "₹ / hr", min: 300, max: 1500, step: 25, desc: "Blended compensation for credit underwriting specialists" },
    { key: "spreadsheetHoursPerWeek", label: "Manual Statement Auditing", unit: "hrs / wk / officer", min: 5, max: 30, step: 1, desc: "Time lost auditing PDFs, salary slips, and GST returns" },
    { key: "automationRatePct", label: "Automated Decisioning Rate", unit: "%", min: 30, max: 85, step: 5, desc: "Instant STP (Straight-Through Processing) approval rate" },
  ],
  benchmarks: [
    { metric: "Loan Sanction Turnaround", before: "72 Hours", after: "15 Minutes", change: "-99%", favorable: true },
    { metric: "KYC Verification Drop-Off", before: "34%", after: "6%", change: "-82%", favorable: true },
    { metric: "Disbursement Payout Latency", before: "24 Hours", after: "< 60 Seconds", change: "-99%", favorable: true },
    { metric: "First-Year NPA Delinquency", before: "4.8%", after: "1.9%", change: "-60%", favorable: true },
    { metric: "RBI Regulatory Reporting Time", before: "10 Days", after: "1-Click", change: "-99%", favorable: true },
  ],
  readinessRadar: [
    { dimension: "Double-Entry Ledgers", score: 96, benchmark: 75 },
    { dimension: "Instant Bureau APIs", score: 94, benchmark: 72 },
    { dimension: "Underwriting Risk Engine", score: 91, benchmark: 68 },
    { dimension: "e-NACH AutoPay Mandates", score: 88, benchmark: 65 },
    { dimension: "Aadhaar Vault & Tokenization", score: 95, benchmark: 80 },
    { dimension: "RBI NBFC Compliance", score: 92, benchmark: 78 },
  ],
};

// 5. Default: HR & Recruitment (TalentCraft)
export const HR_ROI_BLUEPRINT: DomainRoiBlueprint = {
  domainId: "hr",
  domainTitle: "HR & Recruitment Services",
  scenarioName: "TalentCraft HR Consultancy Digital Transformation",
  executiveSubtitle: "Algorithmic financial justification modeling direct recruiter labor savings, capacity revenue expansion, and rapid payback velocity.",
  laborUnitLabel: "Recruiters & Talent Consultants",
  platformCostInr: 280000,
  defaultInputs: DEFAULT_HR_ROI_INPUTS,
  sliders: [
    { key: "recruiters", label: "Recruiter Squad Size", unit: "Recruiters", min: 2, max: 35, step: 1, desc: "Full-time consultants currently using spreadsheets" },
    { key: "monthlyApplicants", label: "Monthly Candidate Volume", unit: "Applicants", min: 50, max: 2000, step: 25, desc: "Resumes received and processed per month" },
    { key: "hourlyCostInr", label: "Recruiter Cost / Hour", unit: "₹ / hr", min: 200, max: 1200, step: 25, desc: "Blended hourly compensation and overhead" },
    { key: "spreadsheetHoursPerWeek", label: "Manual Admin Time", unit: "hrs / wk / recruiter", min: 5, max: 30, step: 1, desc: "Time lost to WhatsApp, status emails & Excel entry" },
    { key: "automationRatePct", label: "BizzMitra Automation Rate", unit: "%", min: 30, max: 85, step: 5, desc: "Target workflow automation efficiency" },
  ],
  benchmarks: [
    { metric: "Placement Turnaround", before: "28 Days", after: "9 Days", change: "-68%", favorable: true },
    { metric: "Candidate Drop-Off Rate", before: "28%", after: "6%", change: "-78%", favorable: true },
    { metric: "Weekly Admin per Recruiter", before: "18 Hours", after: "4 Hours", change: "-77%", favorable: true },
    { metric: "Candidate Interview No-Show", before: "32%", after: "7%", change: "-78%", favorable: true },
    { metric: "Attendance Payroll Delay", before: "5 Days", after: "Instant", change: "100%", favorable: true },
  ],
  readinessRadar: [
    { dimension: "Strategy & Alignment", score: 88, benchmark: 70 },
    { dimension: "Process Standardization", score: 82, benchmark: 65 },
    { dimension: "Data Architecture", score: 94, benchmark: 60 },
    { dimension: "Engineering Readiness", score: 91, benchmark: 75 },
    { dimension: "Team Adoption", score: 76, benchmark: 68 },
    { dimension: "Security & Compliance", score: 89, benchmark: 80 },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// RESOLVER FUNCTION
// ─────────────────────────────────────────────────────────────────────────────
export function getRoiBlueprint(
  workspaceContext?: {
    name?: string;
    businessName?: string;
    industry?: string;
    problemStatement?: string;
    description?: string;
    businessAnalysis?: any;
  } | null
): DomainRoiBlueprint {
  const safeName = workspaceContext?.businessName || workspaceContext?.name || "Enterprise Workspace";
  const safeIndustry = workspaceContext?.industry || "Enterprise Operations";
  const rawProblem = workspaceContext?.problemStatement || workspaceContext?.description || "";

  // Attempt to load dynamic Discovery business analysis
  let dynamicAnalysis: any = workspaceContext?.businessAnalysis || null;
  if (!dynamicAnalysis && typeof window !== "undefined") {
    try {
      const rawDisc = window.localStorage.getItem("bizzmitra.discoveryData") || window.localStorage.getItem("bizzmitra.discovery");
      if (rawDisc) {
        const parsed = JSON.parse(rawDisc);
        dynamicAnalysis = parsed.businessAnalysis || parsed;
      }
    } catch {}
  }

  // If dynamic businessAnalysis is available, synthesize real domain ROI blueprint
  if (dynamicAnalysis && (dynamicAnalysis.businessImpact || dynamicAnalysis.currentState)) {
    const efficiencyScore = dynamicAnalysis.currentState?.efficiencyScore || 35;
    const impactList = Array.isArray(dynamicAnalysis.businessImpact) ? dynamicAnalysis.businessImpact : [];

    const dynamicBenchmarks = impactList.map((item: any) => ({
      metric: item.metric || "Turnaround Efficiency",
      before: item.current || "Baseline",
      after: item.projected || "Automated",
      change: item.improvement || "-75%",
      favorable: true,
    }));

    return {
      domainId: `custom-${safeIndustry.toLowerCase().replace(/[^a-z0-9]/g, "-")}`,
      domainTitle: `${safeName} (${safeIndustry})`,
      scenarioName: `${safeName} — Financial ROI & Readiness Engine`,
      executiveSubtitle: `Algorithmic ROI modeling direct labor time elimination, capacity velocity expansion, and quick payback for ${safeName}.`,
      laborUnitLabel: "Operations Specialists",
      platformCostInr: 280000,
      defaultInputs: {
        recruiters: 8,
        monthlyApplicants: 500,
        hourlyCostInr: 500,
        spreadsheetHoursPerWeek: 18,
        automationRatePct: Math.min(85, Math.max(50, 100 - efficiencyScore)),
        placementFeeAvgInr: 60000,
        monthlyPlacements: 12,
      },
      sliders: [
        { key: "recruiters", label: `${safeIndustry} Operations Squad`, unit: "Specialists", min: 2, max: 35, step: 1, desc: "Team members currently performing manual processing" },
        { key: "monthlyApplicants", label: "Monthly Operational Workload", unit: "Units", min: 50, max: 3000, step: 25, desc: "Key transactions/records processed monthly" },
        { key: "hourlyCostInr", label: "Specialist Cost / Hour", unit: "₹ / hr", min: 200, max: 1500, step: 25, desc: "Blended hourly compensation and overhead" },
        { key: "spreadsheetHoursPerWeek", label: "Manual Spreadsheet Time", unit: "hrs / wk / person", min: 5, max: 35, step: 1, desc: "Time lost to manual data coordination & entry" },
        { key: "automationRatePct", label: "Process Automation Rate", unit: "%", min: 30, max: 85, step: 5, desc: "Target workflow automation efficiency" },
      ],
      benchmarks: dynamicBenchmarks.length >= 3 ? dynamicBenchmarks : [
        { metric: "Cycle Turnaround Speed", before: "24 Days", after: "7 Days", change: "-71%", favorable: true },
        { metric: "Manual Error & Discrepancy Rate", before: "18%", after: "2.5%", change: "-86%", favorable: true },
        { metric: "Weekly Admin per Specialist", before: "18 Hours", after: "4 Hours", change: "-77%", favorable: true },
        { metric: "Customer/Partner Escalations", before: "28 / month", after: "4 / month", change: "-85%", favorable: true },
        { metric: "Audit & Reporting Preparation", before: "2 Weeks", after: "Instant", change: "-95%", favorable: true },
      ],
      readinessRadar: [
        { dimension: "Strategy & Alignment", score: 90, benchmark: 70 },
        { dimension: "Process Standardization", score: Math.min(95, efficiencyScore + 45), benchmark: 65 },
        { dimension: "Data Architecture", score: 92, benchmark: 60 },
        { dimension: "Engineering Readiness", score: 88, benchmark: 75 },
        { dimension: "Team Adoption", score: 79, benchmark: 68 },
        { dimension: "Security & Compliance", score: 91, benchmark: 80 },
      ],
    };
  }

  // Universal custom domain fallback
  return {
    domainId: "custom",
    domainTitle: safeIndustry,
    scenarioName: `${safeName} — Financial ROI & Readiness Engine`,
    executiveSubtitle: `Algorithmic ROI modeling direct labor time elimination, capacity velocity expansion, and quick payback for ${safeName}.`,
    laborUnitLabel: "Operations Specialists",
    platformCostInr: 280000,
    defaultInputs: {
      recruiters: 8,
      monthlyApplicants: 500,
      hourlyCostInr: 500,
      spreadsheetHoursPerWeek: 18,
      automationRatePct: 65,
      placementFeeAvgInr: 60000,
      monthlyPlacements: 12,
    },
    sliders: [
      { key: "recruiters", label: `${safeIndustry} Operations Squad`, unit: "Specialists", min: 2, max: 35, step: 1, desc: "Team members currently performing manual processing" },
      { key: "monthlyApplicants", label: "Monthly Operational Workload", unit: "Units", min: 50, max: 3000, step: 25, desc: "Key transactions/records processed monthly" },
      { key: "hourlyCostInr", label: "Specialist Cost / Hour", unit: "₹ / hr", min: 200, max: 1500, step: 25, desc: "Blended hourly compensation and overhead" },
      { key: "spreadsheetHoursPerWeek", label: "Manual Spreadsheet Time", unit: "hrs / wk / person", min: 5, max: 35, step: 1, desc: "Time lost to manual data coordination & entry" },
      { key: "automationRatePct", label: "Process Automation Rate", unit: "%", min: 30, max: 85, step: 5, desc: "Target workflow automation efficiency" },
    ],
    benchmarks: [
      { metric: "Cycle Turnaround Speed", before: "24 Days", after: "7 Days", change: "-71%", favorable: true },
      { metric: "Manual Error & Discrepancy Rate", before: "18%", after: "2.5%", change: "-86%", favorable: true },
      { metric: "Weekly Admin per Specialist", before: "18 Hours", after: "4 Hours", change: "-77%", favorable: true },
      { metric: "Customer/Partner Escalations", before: "28 / month", after: "4 / month", change: "-85%", favorable: true },
      { metric: "Audit & Reporting Preparation", before: "2 Weeks", after: "Instant", change: "-95%", favorable: true },
    ],
    readinessRadar: [
      { dimension: "Strategy & Alignment", score: 90, benchmark: 70 },
      { dimension: "Process Standardization", score: 85, benchmark: 65 },
      { dimension: "Data Architecture", score: 92, benchmark: 60 },
      { dimension: "Engineering Readiness", score: 88, benchmark: 75 },
      { dimension: "Team Adoption", score: 79, benchmark: 68 },
      { dimension: "Security & Compliance", score: 91, benchmark: 80 },
    ],
  };
}

// Backward-compatible exports
export const HR_BENCHMARKS = HR_ROI_BLUEPRINT.benchmarks;
export const HR_READINESS_RADAR = HR_ROI_BLUEPRINT.readinessRadar;

/**
 * Universal helper to get calculated ROI model for any workspace context.
 */
export function getRoiModelForWorkspace(workspaceContext?: any) {
  const blueprint = getRoiBlueprint(workspaceContext);
  const results = computeHrRoi(blueprint.defaultInputs, blueprint.platformCostInr);
  
  const implementationCostNum = blueprint.platformCostInr;
  const implementationCostFormatted = `₹${(implementationCostNum / 100000).toFixed(1)} Lakhs`;
  const annualSavingsNum = results.totalAnnualBenefitInr;
  const annualSavingsFormatted = `₹${(annualSavingsNum / 100000).toFixed(1)} Lakhs`;

  return {
    blueprint,
    results,
    summary: {
      implementationCost: implementationCostFormatted,
      implementationCostNumeric: implementationCostNum,
      annualSavings: annualSavingsFormatted,
      annualSavingsNumeric: annualSavingsNum,
      annualCloudCostNumeric: Math.round(blueprint.platformCostInr * 0.15),
      paybackMonths: results.paybackPeriodMonths,
      threeYearRoi: results.threeYearRoiMultiplePct,
    },
    operationalMetrics: {
      avgProcessTime: { baseline: blueprint.benchmarks[0]?.before || "24 Days", target: blueprint.benchmarks[0]?.after || "7 Days" },
      errorRate: { baseline: blueprint.benchmarks[1]?.before || "18%", target: blueprint.benchmarks[1]?.after || "2%" },
      recruiterHoursPerWeek: { baseline: `${blueprint.defaultInputs.spreadsheetHoursPerWeek * blueprint.defaultInputs.recruiters} hrs/wk`, target: `${Math.round(blueprint.defaultInputs.spreadsheetHoursPerWeek * blueprint.defaultInputs.recruiters * 0.3)} hrs/wk` },
    },
    paybackBreakdown: {
      laborHoursSaved: results.annualHoursSaved,
      laborSavings: `₹${(results.annualLaborSavingsInr / 100000).toFixed(1)}L`,
      revenueYield: `₹${(results.velocityRevenueGainInr / 100000).toFixed(1)}L`,
      platformCost: `₹${(results.annualPlatformInvestmentInr / 100000).toFixed(1)}L`,
      netAnnualBenefit: `₹${(results.netAnnualSavingsInr / 100000).toFixed(1)}L`,
    },
    annualSavingsBreakdown: [
      {
        category: "Direct Labor Waste Deflected",
        amount: results.annualLaborSavingsInr,
        description: `Elimination of manual spreadsheet triage across ${blueprint.defaultInputs.recruiters} ${blueprint.laborUnitLabel}.`,
      },
      {
        category: "Operational Turnaround Acceleration",
        amount: results.velocityRevenueGainInr,
        description: `Faster velocity recovering bottleneck delays and operational leakage.`,
      },
    ],
    sensitivity: results.sensitivity,
  };
}

