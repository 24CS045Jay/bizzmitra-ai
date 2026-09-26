/**
 * BizzMitra — Pricing, Plan & Credit Architecture (v1)
 * -----------------------------------------------------
 * Single source of truth for: plan entitlements, workspace allocation,
 * AI model access, per-feature credit costs, and rate limits.
 */

// ─────────────────────────────────────────────────────────────────────────
// 1. PLAN IDENTITY
// ─────────────────────────────────────────────────────────────────────────

export type PlanId = "free_starter" | "growth_pro" | "enterprise_scale";

export function planNameToId(name: string): PlanId {
  const norm = name.toLowerCase().replace(/[^a-z]/g, "");
  if (norm.includes("enterprise")) return "enterprise_scale";
  if (norm.includes("growth") || norm.includes("pro")) return "growth_pro";
  return "free_starter";
}

export function planIdToName(id: PlanId): "Free Starter" | "Growth Pro" | "Enterprise Scale" {
  if (id === "enterprise_scale") return "Enterprise Scale";
  if (id === "growth_pro") return "Growth Pro";
  return "Free Starter";
}

// ─────────────────────────────────────────────────────────────────────────
// 2. AI MODELS — cost multiplier reflects real per-token provider cost
//    relative to the cheapest model (Gemini 2.0 Flash = 1.0x baseline).
// ─────────────────────────────────────────────────────────────────────────

export type AiModelId = "gpt-4o" | "claude-3-5-sonnet" | "gemini-2-flash" | "deepseek-v3";

export interface AiModelConfig {
  id: AiModelId;
  name: string;
  provider: string;
  badge?: string;
  tierRequired: PlanId;
  costMultiplier: number; // multiplies the base credit cost of every action
  description?: string;
}

export const AI_MODELS: AiModelConfig[] = [
  {
    id: "gemini-2-flash",
    name: "Gemini 2.0 Flash",
    provider: "Google Cloud",
    badge: "Free Included",
    tierRequired: "free_starter",
    costMultiplier: 1.0,
    description: "Fast, low-latency reasoning suitable for daily discovery and Q&A.",
  },
  {
    id: "gpt-4o",
    name: "GPT-4o Omnichannel",
    provider: "OpenAI",
    badge: "Pro Required",
    tierRequired: "growth_pro",
    costMultiplier: 2.0,
    description: "High-precision architecture design, schema synthesis, and complex analysis.",
  },
  {
    id: "claude-3-5-sonnet",
    name: "Claude 3.5 Sonnet",
    provider: "Anthropic",
    badge: "Pro Required",
    tierRequired: "growth_pro",
    costMultiplier: 2.5,
    description: "Superior coding ability, complex BPMN workflows, and technical writing.",
  },
  {
    id: "deepseek-v3",
    name: "DeepSeek V3 Reasoner",
    provider: "DeepSeek Cloud",
    badge: "Enterprise",
    tierRequired: "enterprise_scale",
    costMultiplier: 1.5,
    description: "Deep chain-of-thought mathematical planning and financial ROI modeling.",
  },
];

// ─────────────────────────────────────────────────────────────────────────
// 3. FEATURE → BASE CREDIT COST
// ─────────────────────────────────────────────────────────────────────────

export type FeatureAction =
  | "discovery_chat_turn"       // /workspace/discovery — Q&A with AI
  | "ai_copilot_turn"           // AiCopilotPanel free-form question
  | "solution_studio_regenerate"// /workspace/solution — customize & regenerate
  | "full_blueprint_synthesis"  // one-click "Generate full blueprint" (HLD+LLD+DDL+API together)
  | "architecture_regenerate"   // /workspace/architecture — HLD/LLD only
  | "data_model_regenerate"     // /workspace/data — PostgreSQL DDL + REST API spec
  | "process_bpmn_regenerate"   // /workspace/process — BPMN pipeline
  | "roadmap_regenerate"        // /workspace/roadmap
  | "wireframe_generate"        // /workspace/wireframes
  | "insights_analysis"         // /workspace/insights, CRM scoring
  | "confidence_score_recalc"   // maturity/confidence score
  | "export_basic_hld"          // PDF export of HLD only
  | "export_full_deliverable";  // pitch deck + full doc pack

export interface FeatureCostConfig {
  action: FeatureAction;
  label: string;
  baseCredits: number;   // flat cost, OR floor when tokenMetered is true
  tokenMetered: boolean; // true => real cost = max(baseCredits, ceil(tokens/250) * multiplier)
  minPlan: PlanId;       // cheapest plan that can use this action at all
}

export const FEATURE_COSTS: Record<FeatureAction, FeatureCostConfig> = {
  discovery_chat_turn:        { action: "discovery_chat_turn",        label: "Discovery interview turn",         baseCredits: 2,  tokenMetered: false, minPlan: "free_starter" },
  ai_copilot_turn:            { action: "ai_copilot_turn",            label: "AI Copilot question",              baseCredits: 1,  tokenMetered: false, minPlan: "free_starter" },
  solution_studio_regenerate: { action: "solution_studio_regenerate", label: "Solution Studio regeneration",     baseCredits: 5,  tokenMetered: false, minPlan: "free_starter" },
  architecture_regenerate:    { action: "architecture_regenerate",    label: "HLD/LLD regeneration",             baseCredits: 5,  tokenMetered: false, minPlan: "free_starter" },
  data_model_regenerate:      { action: "data_model_regenerate",      label: "PostgreSQL DDL + REST API spec",   baseCredits: 5,  tokenMetered: false, minPlan: "free_starter" },
  process_bpmn_regenerate:    { action: "process_bpmn_regenerate",    label: "BPMN pipeline generation",         baseCredits: 5,  tokenMetered: false, minPlan: "free_starter" },
  roadmap_regenerate:         { action: "roadmap_regenerate",         label: "Roadmap regeneration",             baseCredits: 3,  tokenMetered: false, minPlan: "free_starter" },
  wireframe_generate:         { action: "wireframe_generate",         label: "Wireframe generation",             baseCredits: 5,  tokenMetered: false, minPlan: "free_starter" },
  insights_analysis:          { action: "insights_analysis",          label: "CRM / insights AI analysis",       baseCredits: 3,  tokenMetered: false, minPlan: "free_starter" },
  confidence_score_recalc:    { action: "confidence_score_recalc",    label: "Confidence score recalculation",   baseCredits: 1,  tokenMetered: false, minPlan: "free_starter" },
  export_basic_hld:           { action: "export_basic_hld",           label: "Basic HLD export (PDF)",           baseCredits: 0,  tokenMetered: false, minPlan: "free_starter" },
  export_full_deliverable:    { action: "export_full_deliverable",    label: "Full deliverable pack + pitch deck", baseCredits: 0, tokenMetered: false, minPlan: "free_starter" },
  full_blueprint_synthesis:   { action: "full_blueprint_synthesis",   label: "Full blueprint synthesis (all artifacts)", baseCredits: 10, tokenMetered: false, minPlan: "free_starter" },
};

/** Real credit cost of one action call, given the active model. */
export function calculateCreditCost(
  action: FeatureAction,
  modelId: AiModelId,
  tokens?: { promptTokens: number; completionTokens: number },
): number {
  const feature = FEATURE_COSTS[action];
  if (!feature) return 1;
  const model = AI_MODELS.find((m) => m.id === modelId) ?? AI_MODELS[0]!;

  if (feature.tokenMetered && tokens) {
    const totalTokens = tokens.promptTokens + tokens.completionTokens;
    const tokenCredits = Math.ceil(totalTokens / 250);
    return Math.max(feature.baseCredits, Math.round(tokenCredits * model.costMultiplier));
  }

  return Math.max(1, Math.round(feature.baseCredits * model.costMultiplier));
}

// ─────────────────────────────────────────────────────────────────────────
// 4. PLAN DEFINITIONS
// ─────────────────────────────────────────────────────────────────────────

export interface PlanConfig {
  id: PlanId;
  name: string;
  tagline: string;
  monthlyPriceInr: number;
  annualPriceInr: number; // per-month price when billed annually
  workspaceLimit: number; // Infinity only for true unlimited (enterprise, negotiated)
  extraWorkspacePriceInr: number; // add-on cost per workspace beyond the cap (0 = not offered)
  monthlyCredits: number;
  seatLimit: number; // Infinity for unlimited
  allowedModels: AiModelId[];
  allowedFeatures: FeatureAction[];
  creditTopUpAllowed: boolean;
  supportSla: string;
}

export const PLANS: Record<PlanId, PlanConfig> = {
  free_starter: {
    id: "free_starter",
    name: "Free Starter",
    tagline: "For individual architects validating one venture at a time.",
    monthlyPriceInr: 0,
    annualPriceInr: 0,
    workspaceLimit: 1,
    extraWorkspacePriceInr: 0,
    monthlyCredits: 100,
    seatLimit: 1,
    allowedModels: ["gemini-2-flash"],
    allowedFeatures: [
      "discovery_chat_turn",
      "ai_copilot_turn",
      "solution_studio_regenerate",
      "architecture_regenerate",
      "data_model_regenerate",
      "roadmap_regenerate",
      "confidence_score_recalc",
      "export_basic_hld",
      "full_blueprint_synthesis",
    ],
    creditTopUpAllowed: false,
    supportSla: "Community Support",
  },
  growth_pro: {
    id: "growth_pro",
    name: "Growth Pro",
    tagline: "For boutique consultancies running several client workspaces in parallel.",
    monthlyPriceInr: 3999,
    annualPriceInr: 3199,
    workspaceLimit: 5,
    extraWorkspacePriceInr: 499, // per extra workspace / month
    monthlyCredits: 1000,
    seatLimit: 8,
    allowedModels: ["gemini-2-flash", "gpt-4o", "claude-3-5-sonnet"],
    allowedFeatures: Object.keys(FEATURE_COSTS) as FeatureAction[],
    creditTopUpAllowed: true,
    supportSla: "Priority email (4h SLA)",
  },
  enterprise_scale: {
    id: "enterprise_scale",
    name: "Enterprise Scale",
    tagline: "Custom governance, dedicated compute, and VPC deployment.",
    monthlyPriceInr: 15999,
    annualPriceInr: 12799,
    workspaceLimit: Infinity,
    extraWorkspacePriceInr: 0,
    monthlyCredits: 5000,
    seatLimit: Infinity,
    allowedModels: ["gemini-2-flash", "gpt-4o", "claude-3-5-sonnet", "deepseek-v3"],
    allowedFeatures: Object.keys(FEATURE_COSTS) as FeatureAction[],
    creditTopUpAllowed: true,
    supportSla: "Dedicated Lead Architect",
  },
};

// ─────────────────────────────────────────────────────────────────────────
// 5. CREDIT TOP-UP PACKS (paid plans only)
// ─────────────────────────────────────────────────────────────────────────

export interface CreditTopUpPack {
  id: string;
  name: string;
  credits: number;
  priceInr: number;
  popular?: boolean;
}

export const CREDIT_TOP_UP_PACKS: CreditTopUpPack[] = [
  { id: "topup-150", name: "Starter Booster", credits: 150, priceInr: 699 },
  { id: "topup-500", name: "Pro Expansion", credits: 500, priceInr: 2099, popular: true },
  { id: "topup-2000", name: "Enterprise Burst", credits: 2000, priceInr: 7499 },
];

// ─────────────────────────────────────────────────────────────────────────
// 6. RATE LIMITS — same ceiling for every plan (infra protection)
// ─────────────────────────────────────────────────────────────────────────

export const RATE_LIMITS = {
  fiveHourWindowCredits: 150, // max credits any single user may spend in a rolling 5-hour window
  weeklyCredits: 500,         // max credits any single user may spend in a rolling 7-day window
};

export interface CreditSpendRecord {
  credits: number;
  createdAt: string | Date;
}

export interface RateLimitCheckResult {
  allowed: boolean;
  reason?: string;
  fiveHourUsed: number;
  fiveHourRemaining: number;
  fiveHourMax: number;
  weeklyUsed: number;
  weeklyRemaining: number;
  weeklyMax: number;
}

/**
 * Calculates current 5-hour and 7-day usage windows from transaction records.
 */
export function calculateUsageWindows(
  history: CreditSpendRecord[],
  now: Date = new Date(),
): {
  fiveHourUsed: number;
  fiveHourRemaining: number;
  fiveHourMax: number;
  weeklyUsed: number;
  weeklyRemaining: number;
  weeklyMax: number;
} {
  const fiveHoursAgo = new Date(now.getTime() - 5 * 60 * 60 * 1000);
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const fiveHourUsed = history
    .filter((r) => {
      const d = typeof r.createdAt === "string" ? new Date(r.createdAt) : r.createdAt;
      return !isNaN(d.getTime()) && d >= fiveHoursAgo;
    })
    .reduce((sum, r) => sum + Math.abs(r.credits), 0);

  const weeklyUsed = history
    .filter((r) => {
      const d = typeof r.createdAt === "string" ? new Date(r.createdAt) : r.createdAt;
      return !isNaN(d.getTime()) && d >= sevenDaysAgo;
    })
    .reduce((sum, r) => sum + Math.abs(r.credits), 0);

  const fiveHourRemaining = Math.max(0, RATE_LIMITS.fiveHourWindowCredits - fiveHourUsed);
  const weeklyRemaining = Math.max(0, RATE_LIMITS.weeklyCredits - weeklyUsed);

  return {
    fiveHourUsed,
    fiveHourRemaining,
    fiveHourMax: RATE_LIMITS.fiveHourWindowCredits,
    weeklyUsed,
    weeklyRemaining,
    weeklyMax: RATE_LIMITS.weeklyCredits,
  };
}

export function checkRateLimit(
  history: CreditSpendRecord[],
  proposedCredits: number,
  now: Date = new Date(),
): RateLimitCheckResult {
  const usage = calculateUsageWindows(history, now);

  if (usage.fiveHourUsed + proposedCredits > RATE_LIMITS.fiveHourWindowCredits) {
    return {
      allowed: false,
      reason: `You've hit the 5-hour usage limit (${RATE_LIMITS.fiveHourWindowCredits} credits). It resets on a rolling basis — try again shortly.`,
      ...usage,
    };
  }

  if (usage.weeklyUsed + proposedCredits > RATE_LIMITS.weeklyCredits) {
    return {
      allowed: false,
      reason: `You've hit the weekly usage limit (${RATE_LIMITS.weeklyCredits} credits). It resets on a rolling 7-day basis.`,
      ...usage,
    };
  }

  return { allowed: true, ...usage };
}

// ─────────────────────────────────────────────────────────────────────────
// 7. PROVIDER BUCKETS — fair-share division of shared Groq / Gemini capacity
// ─────────────────────────────────────────────────────────────────────────

export type ProviderId = "groq" | "gemini";

export interface ProviderConfig {
  id: ProviderId;
  label: string;
  rpm: number;
  tpm: number;
  rpd: number;
}

export const PROVIDERS: Record<ProviderId, ProviderConfig> = {
  groq: { id: "groq", label: "Groq", rpm: 30, tpm: 15_000, rpd: 14_400 },
  gemini: { id: "gemini", label: "Gemini", rpm: 15, tpm: 1_000_000, rpd: 200 },
};

export const PROVIDER_FOR_MODEL: Record<AiModelId, ProviderId> = {
  "gemini-2-flash": "gemini",
  "gpt-4o": "groq",
  "claude-3-5-sonnet": "groq",
  "deepseek-v3": "groq",
};

export const PROVIDER_RESERVED_SHARE: Record<PlanId, number> = {
  enterprise_scale: 0.30,
  growth_pro: 0.55,
  free_starter: 0.15,
};

export const PLAN_PRIORITY: PlanId[] = ["enterprise_scale", "growth_pro", "free_starter"];

export interface ProviderBucketUsage {
  global: { requests: number; tokens: number };
  byPlan: Record<PlanId, { requests: number; tokens: number }>;
}

export interface ProviderCapacityResult {
  allowed: boolean;
  reason?: string;
}

export function checkProviderCapacity(
  provider: ProviderConfig,
  planId: PlanId,
  estimatedTokens: number,
  usage: ProviderBucketUsage,
): ProviderCapacityResult {
  if (usage.global.requests + 1 > provider.rpm) {
    return { allowed: false, reason: `Shared ${provider.label} capacity is fully booked this minute (RPM limit reached). Try again shortly.` };
  }
  if (usage.global.tokens + estimatedTokens > provider.tpm) {
    return { allowed: false, reason: `Shared ${provider.label} capacity is fully booked this minute (TPM limit reached). Try again shortly.` };
  }

  const reservedForPlan = provider.tpm * PROVIDER_RESERVED_SHARE[planId];
  const usedByPlan = usage.byPlan[planId]?.tokens ?? 0;

  const borrowableSlack = PLAN_PRIORITY
    .filter((p) => p !== planId)
    .reduce((slack, p) => {
      const reserved = provider.tpm * PROVIDER_RESERVED_SHARE[p];
      const used = usage.byPlan[p]?.tokens ?? 0;
      return slack + Math.max(0, reserved - used);
    }, 0);

  const effectiveCeiling = reservedForPlan + borrowableSlack;

  if (usedByPlan + estimatedTokens > effectiveCeiling) {
    return {
      allowed: false,
      reason: planId === "free_starter"
        ? "Free tier's share of shared AI capacity is busy right now — paid plans get priority under load. Try again in a moment."
        : `Your plan's share of shared ${provider.label} capacity is exhausted for this minute. Try again shortly.`,
    };
  }

  return { allowed: true };
}

// ─────────────────────────────────────────────────────────────────────────
// 8. WORKSPACE ALLOCATION
// ─────────────────────────────────────────────────────────────────────────

export function canCreateWorkspace(planId: PlanId, currentWorkspaceCount: number): {
  allowed: boolean;
  reason?: string;
  requiresAddOn?: boolean;
} {
  const plan = PLANS[planId] || PLANS.free_starter;

  if (currentWorkspaceCount < plan.workspaceLimit) {
    return { allowed: true };
  }

  if (plan.extraWorkspacePriceInr > 0) {
    return {
      allowed: false,
      requiresAddOn: true,
      reason: `${plan.name} includes ${plan.workspaceLimit} workspaces. Add another for ₹${plan.extraWorkspacePriceInr}/month, or upgrade your plan.`,
    };
  }

  return {
    allowed: false,
    reason: `${plan.name} is limited to ${plan.workspaceLimit} workspace${plan.workspaceLimit === 1 ? "" : "s"}. Upgrade to Growth Pro to add more.`,
  };
}

export function canUseFeature(planId: PlanId, action: FeatureAction): boolean {
  const plan = PLANS[planId] || PLANS.free_starter;
  return plan.allowedFeatures.includes(action);
}

export function canUseModel(planId: PlanId, modelId: AiModelId): boolean {
  const model = AI_MODELS.find((m) => m.id === modelId);
  if (!model) return false;
  const order: PlanId[] = ["free_starter", "growth_pro", "enterprise_scale"];
  return order.indexOf(planId) >= order.indexOf(model.tierRequired);
}
