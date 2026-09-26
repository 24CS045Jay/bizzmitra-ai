import { getRoadmapForWorkspace, type RoadmapBlueprint } from "@/lib/planning-data";
import { loadFinancialModel } from "@/lib/financial-data";

export interface FlaggedRisk {
  id: string;
  category: "budget" | "owner" | "timeline" | "compliance" | "architecture";
  severity: "high" | "medium" | "low";
  title: string;
  detail: string;
  badgeText: string;
  remediation: string;
  section: string;
}

export interface BlueprintScoreResult {
  score: number;
  grade: "Exemplary" | "Ready" | "Developing" | "Draft";
  missingSections: string[];
  improvementHint: string;
  breakdown: {
    domain: string;
    weight: number;
    completed: boolean;
    missingHint?: string;
  }[];
}

export interface ActionItem {
  id: string;
  title: string;
  phase: string;
  owner: string;
  timeline: string;
  status: "ready" | "in-progress" | "blocked";
  effort: string;
}

export function evaluateBlueprintRisks(
  blueprint?: RoadmapBlueprint | null,
  workspaceContext?: { id?: string; name?: string; businessName?: string; industry?: string; problemStatement?: string; budget?: number; [key: string]: any } | null | undefined,
): {
  flaggedRisks: FlaggedRisk[];
  topRisks: FlaggedRisk[];
  actionItems: ActionItem[];
  scoreResult: BlueprintScoreResult;
} {
  const bp = blueprint ?? getRoadmapForWorkspace(workspaceContext);
  const risks: FlaggedRisk[] = [];

  // 1. Owner assignment check across resourcing
  let missingOwnersCount = 0;
  bp.phases.forEach((phase) => {
    if (!phase.teamResourcing || phase.teamResourcing.length === 0) {
      missingOwnersCount++;
    }
  });

  if (missingOwnersCount > 0) {
    risks.push({
      id: "risk-owner",
      category: "owner",
      severity: "high",
      title: `${missingOwnersCount} Phases Missing Assigned Team Leads`,
      detail: `Sprint phases in ${bp.phases[0]?.name ?? "Phase 1"} do not have designated engineering leads.`,
      badgeText: `⚠️ ${missingOwnersCount} Unstaffed Phases`,
      remediation: "Assign named engineering or operational leads to eliminate delivery ambiguity.",
      section: "Roadmap & Ownership",
    });
  }

  // 2. Budget allocation & ROI verification check
  const finModel = loadFinancialModel(workspaceContext);
  if (!finModel.inputs.isLocked) {
    risks.push({
      id: "risk-budget",
      category: "budget",
      severity: "high",
      title: "CapEx/OpEx Budget Ceiling Not Explicitly Locked",
      detail: `Estimated effort of ${bp.totalPersonDays || finModel.inputs.estimatedPersonDays} person-days requires explicit financial authorization.`,
      badgeText: "⚠️ No Budget Locked",
      remediation: "Lock CapEx runway and compute target ROI in Financial Intelligence.",
      section: "Financial Planning",
    });
  } else if (!finModel.computed.isBudgetUnderCeiling) {
    risks.push({
      id: "risk-budget",
      category: "budget",
      severity: "high",
      title: "CapEx Build Cost Exceeds Approved Budget Ceiling",
      detail: `Projected build investment exceeds the allocated ceiling.`,
      badgeText: "⚠️ Budget Over Ceiling",
      remediation: "Rebalance sprint effort or increase approved CapEx ceiling in Financial Intelligence.",
      section: "Financial Planning",
    });
  }

  // 3. Timeline & dependency compression check
  if (bp.targetTimelineWeeks <= 6 && bp.phases.length >= 3) {
    risks.push({
      id: "risk-timeline",
      category: "timeline",
      severity: "medium",
      title: "Aggressive Critical Path Compression",
      detail: `${bp.targetTimelineWeeks}-week rollout creates concurrent dependency bottlenecks in deployment.`,
      badgeText: "⚠️ Tight Delivery Window",
      remediation: "Consider Phased Scenario variant with 2-week testing buffer.",
      section: "Sprint Planning",
    });
  }

  // 4. Compliance & DPDP/GDPR Data Governance check (cleared when financial/governance baseline is locked)
  if (!finModel.inputs.isLocked) {
    risks.push({
      id: "risk-compliance",
      category: "compliance",
      severity: "medium",
      title: "DPDP / PII Consent Controls Pending Security Audit",
      detail: "Data pipeline integration requires consent tokenization before production go-live.",
      badgeText: "⚠️ Compliance Signoff Needed",
      remediation: "Review Consent Architecture in Governance & Review tab.",
      section: "Governance & Review",
    });
  }

  // 5. Technical integration bottleneck check
  if (!finModel.inputs.isLocked) {
    const highRiskItem = bp.riskRegister.find((r) => r.impact === "High" || r.likelihood === "High");
    if (highRiskItem) {
      risks.push({
        id: "risk-tech",
        category: "architecture",
        severity: "medium",
        title: highRiskItem.title,
        detail: highRiskItem.mitigationStrategy,
        badgeText: `⚠️ ${highRiskItem.category} Risk`,
        remediation: highRiskItem.mitigationStrategy,
        section: "Risk Register",
      });
    }
  }

  // Calculate completeness & confidence score breakdown
  const domains = [
    {
      domain: "Problem Framing & Objectives",
      weight: 15,
      completed: Boolean(workspaceContext?.problemStatement || bp.executiveSummary),
      missingHint: "Complete Problem Discovery in AI Intake",
    },
    {
      domain: "Solution Architecture & Stack",
      weight: 20,
      completed: true,
      missingHint: "Finalize Stack Specifications in Architecture",
    },
    {
      domain: "BPMN Process Automation Flows",
      weight: 15,
      completed: true,
      missingHint: "Map As-Is vs To-Be flows in Process Designer",
    },
    {
      domain: "Data Models & API Contracts",
      weight: 15,
      completed: true,
      missingHint: "Generate ER diagrams in Data & APIs",
    },
    {
      domain: "Resource & Budget Allocation",
      weight: 20,
      completed: Boolean(finModel.inputs.isLocked && finModel.computed.isBudgetUnderCeiling),
      missingHint: "Lock CapEx runway & verify positive ROI in Financial Intelligence (+20%)",
    },
    {
      domain: "Delivery Roadmap & Milestones",
      weight: 15,
      completed: bp.phases.length > 0 && missingOwnersCount === 0,
      missingHint: "Assign workstream leads to all milestones (+15%)",
    },
  ];

  const totalScore = domains.reduce((sum, d) => sum + (d.completed ? d.weight : 0), 0);
  const incomplete = domains.filter((d) => !d.completed);

  const scoreResult: BlueprintScoreResult = {
    score: totalScore,
    grade:
      totalScore >= 90
        ? "Exemplary"
        : totalScore >= 75
          ? "Ready"
          : totalScore >= 50
            ? "Developing"
            : "Draft",
    missingSections: incomplete.map((i) => i.domain),
    improvementHint:
      incomplete[0]?.missingHint ?? "All primary blueprint domains verified and locked.",
    breakdown: domains,
  };

  // Extract next 3 action items
  const actionItems: ActionItem[] = [];
  bp.phases.forEach((phase) => {
    phase.milestones.forEach((m) => {
      if (actionItems.length < 3) {
        actionItems.push({
          id: m.id,
          title: m.title,
          phase: phase.name,
          owner: phase.teamResourcing[0]?.role || "Technical Lead",
          timeline: `Week ${phase.startWeek + 1} · ${phase.durationWeeks}`,
          status: m.completed ? "ready" : "in-progress",
          effort: `${m.effortDays}d effort`,
        });
      }
    });
  });

  return {
    flaggedRisks: risks,
    topRisks: risks.slice(0, 3),
    actionItems,
    scoreResult,
  };
}
