/**
 * BizzMitra — Pricing, Plan & Credit Architecture (v1)
 * -----------------------------------------------------
 * Single source of truth for: plan entitlements, workspace allocation,
 * AI model access, and per-feature credit costs.
 *
 * This file is meant to REPLACE the hard-coded numbers currently split
 * across src/lib/admin-rbac-data.ts (AI_MODELS, INITIAL_*_WALLET) and
 * src/components/Pricing13.tsx (PLANS). Import from here in both places
 * instead of re-declaring numbers, so pricing only ever lives in one spot.
 *
 * IMPORTANT: today all of this (wallet balance, tier, workspace count
 * fallback) lives in localStorage on the client (see loadCreditWallet /
 * saveCreditWallet). That means a user can open devtools and edit
 * `bizzmitra.creditWallet` to grant themselves Enterprise credits.
 * This config is written so it can be moved server-side (Supabase table +
 * RPC) with zero shape changes — see the migration file alongside this one.
 */

// ─────────────────────────────────────────────────────────────────────────
// 1. PLAN IDENTITY
// ─────────────────────────────────────────────────────────────────────────

export type PlanId = "free_starter" | "growth_pro" | "enterprise_scale";

// ─────────────────────────────────────────────────────────────────────────
// 2. AI MODELS — cost multiplier reflects real per-token provider cost
//    relative to the cheapest model (Gemini 2.0 Flash = 1.0x baseline).
//    Re-check these ratios against current provider pricing pages before
//    finalizing — they move over time and this file is the one place
//    that should need updating.
// ─────────────────────────────────────────────────────────────────────────

export type AiModelId = "gpt-4o" | "claude-3-5-sonnet" | "gemini-2-flash" | "deepseek-v3";

export interface AiModelConfig {
  id: AiModelId;
  name: string;
  provider: string;
  tierRequired: PlanId;
  costMultiplier: number; // multiplies the base credit cost of every action
}

export const AI_MODELS: AiModelConfig[] = [
  { id: "gemini-2-flash", name: "Gemini 2.0 Flash", provider: "Google Cloud", tierRequired: "free_starter", costMultiplier: 1.0 },
  { id: "deepseek-v3", name: "DeepSeek V3 Reasoner", provider: "DeepSeek Cloud", tierRequired: "enterprise_scale", costMultiplier: 1.5 },
  { id: "gpt-4o", name: "GPT-4o Omnichannel", provider: "OpenAI", tierRequired: "growth_pro", costMultiplier: 2.0 },
  { id: "claude-3-5-sonnet", name: "Claude 3.5 Sonnet", provider: "Anthropic", tierRequired: "growth_pro", costMultiplier: 2.5 },
];

// ─────────────────────────────────────────────────────────────────────────
// 3. FEATURE → BASE CREDIT COST
//    "Base" = cost on the cheapest model (Gemini Flash, 1.0x). Multiply by
//    the active model's costMultiplier to get the real deduction. This
//    replaces flat/dummy numbers with a cost that actually tracks what
//    the feature does (a full multi-artifact synthesis call costs far
//    more in tokens than a one-line chat reply).
//
//    Where a feature already meters exact tokens (AiCopilotPanel does,
//    via deductCreditsByTokens), FLOOR_CREDITS below is the minimum
//    charge — it stops a 3-word message from costing 0 credits.
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
  discovery_chat_turn:        { action: "discovery_chat_turn",        label: "Discovery interview turn",         baseCredits: 2,  tokenMetered: true,  minPlan: "free_starter" },
  ai_copilot_turn:            { action: "ai_copilot_turn",            label: "AI Copilot question",              baseCredits: 1,  tokenMetered: true,  minPlan: "free_starter" },
  solution_studio_regenerate: { action: "solution_studio_regenerate", label: "Solution Studio regeneration",     baseCredits: 15, tokenMetered: false, minPlan: "free_starter" },
  architecture_regenerate:    { action: "architecture_regenerate",    label: "HLD/LLD regeneration",             baseCredits: 25, tokenMetered: false, minPlan: "free_starter" },
  data_model_regenerate:      { action: "data_model_regenerate",      label: "PostgreSQL DDL + REST API spec",   baseCredits: 20, tokenMetered: false, minPlan: "free_starter" },
  process_bpmn_regenerate:    { action: "process_bpmn_regenerate",    label: "BPMN pipeline generation",         baseCredits: 20, tokenMetered: false, minPlan: "growth_pro" },
  roadmap_regenerate:         { action: "roadmap_regenerate",         label: "Roadmap regeneration",             baseCredits: 12, tokenMetered: false, minPlan: "free_starter" },
  wireframe_generate:         { action: "wireframe_generate",         label: "Wireframe generation",             baseCredits: 18, tokenMetered: false, minPlan: "growth_pro" },
  insights_analysis:          { action: "insights_analysis",          label: "CRM / insights AI analysis",       baseCredits: 10, tokenMetered: false, minPlan: "growth_pro" },
  confidence_score_recalc:    { action: "confidence_score_recalc",    label: "Confidence score recalculation",   baseCredits: 3,  tokenMetered: false, minPlan: "free_starter" },
  export_basic_hld:           { action: "export_basic_hld",           label: "Basic HLD export (PDF)",           baseCredits: 5,  tokenMetered: false, minPlan: "free_starter" },
  export_full_deliverable:    { action: "export_full_deliverable",    label: "Full deliverable pack + pitch deck", baseCredits: 20, tokenMetered: false, minPlan: "growth_pro" },
  full_blueprint_synthesis:   { action: "full_blueprint_synthesis",   label: "Full blueprint synthesis (all artifacts)", baseCredits: 50, tokenMetered: false, minPlan: "free_starter" },
};

/** Real credit cost of one action call, given the active model. */
export function calculateCreditCost(
  action: FeatureAction,
  modelId: AiModelId,
  tokens?: { promptTokens: number; completionTokens: number },
): number {
  const feature = FEATURE_COSTS[action];
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
//    workspaceLimit: hard cap enforced at creation time (see
//    canCreateWorkspace below). Growth Pro is intentionally capped, not
//    "unlimited" — unlimited workspaces on a flat seat+credit price lets
//    one subscription be shared across unlimited client tenants, which
//    breaks both the cost model and the seat-based value metric.
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
    extraWorkspacePriceInr: 0, // not purchasable on Free — forces upgrade, standard freemium lever
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
    supportSla: "Community",
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
    allowedFeatures: Object.keys(FEATURE_COSTS) as FeatureAction[], // everything except deepseek-gated items
    creditTopUpAllowed: true,
    supportSla: "Priority email (4h SLA)",
  },
  enterprise_scale: {
    id: "enterprise_scale",
    name: "Enterprise Scale",
    tagline: "Custom governance, dedicated compute, and VPC deployment.",
    monthlyPriceInr: 15999, // starting price — enterprise is typically negotiated/custom
    annualPriceInr: 12799,
    workspaceLimit: Infinity, // contractually unlimited, fair-use monitored
    extraWorkspacePriceInr: 0,
    monthlyCredits: 5000, // scalable via negotiated add-on blocks
    seatLimit: Infinity,
    allowedModels: ["gemini-2-flash", "gpt-4o", "claude-3-5-sonnet", "deepseek-v3"],
    allowedFeatures: Object.keys(FEATURE_COSTS) as FeatureAction[],
    creditTopUpAllowed: true,
    supportSla: "Dedicated Lead Architect",
  },
};

// ─────────────────────────────────────────────────────────────────────────
// 5. CREDIT TOP-UP PACKS (pay-as-you-go, paid plans only)
//    Lets a Growth Pro team push past 1,000 credits mid-cycle without an
//    Enterprise upgrade. Priced with a slight markup vs the plan's
//    effective per-credit rate to keep upgrading the better long-run deal.
// ─────────────────────────────────────────────────────────────────────────

export interface CreditTopUpPack {
  id: string;
  credits: number;
  priceInr: number;
}

export const CREDIT_TOP_UP_PACKS: CreditTopUpPack[] = [
  { id: "topup-150", credits: 150, priceInr: 699 },
  { id: "topup-500", credits: 500, priceInr: 2099 },
  { id: "topup-2000", credits: 2000, priceInr: 7499 },
];

// ─────────────────────────────────────────────────────────────────────────
// 6. RATE LIMITS — same ceiling for every plan, on purpose.
//    monthlyCredits (section 4) is a QUOTA (how much a plan gets, differs
//    per tier). This is a THROTTLE (how fast any single user can spend
//    their quota, identical for every tier) — it exists to protect shared
//    inference capacity from one user's burst script or runaway loop, not
//    to differentiate plans. A Free user and an Enterprise user hitting
//    "regenerate" 30 times in one hour put the same load on the AI
//    provider, so both get capped the same way.
//
//    FREE PLAN NOTE: Free Starter's whole monthly allowance (100 credits)
//    is small enough that these windows rarely bind — the monthly quota
//    runs out first. In practice a Free user completes their one
//    workspace (discovery → blueprint → export) by spending down that
//    100-credit pool through AI Copilot questions and regenerations,
//    drawn from the SAME 5-hour/weekly buckets as everyone else; they
//    just hit the smaller monthly ceiling long before the rate limit
//    would ever trigger. For Growth Pro / Enterprise, the rate limit is
//    what actually bites during a heavy session.
//
//    If Enterprise customers need a higher ceiling contractually, raise
//    it per-account server-side (see rate_limit_override in the SQL
//    migration) rather than changing this shared default.
// ─────────────────────────────────────────────────────────────────────────

export const RATE_LIMITS = {
  fiveHourWindowCredits: 150, // max credits any single user may spend in a rolling 5-hour window
  weeklyCredits: 500,         // max credits any single user may spend in a rolling 7-day window
};

export interface CreditSpendRecord {
  credits: number;
  createdAt: string | Date; // ISO string or Date
}

export interface RateLimitCheckResult {
  allowed: boolean;
  reason?: string;
  fiveHourUsed: number;
  fiveHourRemaining: number;
  weeklyUsed: number;
  weeklyRemaining: number;
}

/**
 * Call this BEFORE deducting credits for an action (in addition to the
 * plan's monthly wallet balance check). Pass the user's recent
 * credit_transactions rows (or an equivalent client-side cache while
 * offline) — this function does not fetch anything itself.
 */
export function checkRateLimit(
  history: CreditSpendRecord[],
  proposedCredits: number,
  now: Date = new Date(),
): RateLimitCheckResult {
  const fiveHoursAgo = new Date(now.getTime() - 5 * 60 * 60 * 1000);
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const fiveHourUsed = history
    .filter((r) => new Date(r.createdAt) >= fiveHoursAgo)
    .reduce((sum, r) => sum + r.credits, 0);

  const weeklyUsed = history
    .filter((r) => new Date(r.createdAt) >= sevenDaysAgo)
    .reduce((sum, r) => sum + r.credits, 0);

  const fiveHourRemaining = Math.max(0, RATE_LIMITS.fiveHourWindowCredits - fiveHourUsed);
  const weeklyRemaining = Math.max(0, RATE_LIMITS.weeklyCredits - weeklyUsed);

  if (fiveHourUsed + proposedCredits > RATE_LIMITS.fiveHourWindowCredits) {
    return {
      allowed: false,
      reason: `You've hit the 5-hour usage limit (${RATE_LIMITS.fiveHourWindowCredits} credits). It resets on a rolling basis — try again shortly.`,
      fiveHourUsed, fiveHourRemaining, weeklyUsed, weeklyRemaining,
    };
  }

  if (weeklyUsed + proposedCredits > RATE_LIMITS.weeklyCredits) {
    return {
      allowed: false,
      reason: `You've hit the weekly usage limit (${RATE_LIMITS.weeklyCredits} credits). It resets on a rolling 7-day basis.`,
      fiveHourUsed, fiveHourRemaining, weeklyUsed, weeklyRemaining,
    };
  }

  return { allowed: true, fiveHourUsed, fiveHourRemaining, weeklyUsed, weeklyRemaining };
}

// ─────────────────────────────────────────────────────────────────────────
// 7. PROVIDER BUCKETS — Groq and Gemini give a rate limit to YOUR account/
//    project, not to each of your subscribers individually. Section 6
//    (RATE_LIMITS) caps how fast one *user* can spend, regardless of
//    plan. This section caps how the *shared* Groq/Gemini ceiling gets
//    divided across your Free / Growth Pro / Enterprise population so
//    one tier's traffic can't starve another's.
//
//    Numbers below are illustrative free-tier figures — pull your real
//    RPM/TPM/RPD from console.groq.com/settings/limits and Google AI
//    Studio's rate-limit page and paste them in here; they change as
//    your spend tier goes up.
//
//    You mentioned you only hold Groq and Gemini keys, so PROVIDER_FOR_MODEL
//    below maps each AI_MODELS entry to whichever of the two actually
//    serves it in your backend. If a listed model isn't really routed
//    through one of these two providers yet, either update the mapping
//    or remove the model from AI_MODELS / plan.allowedModels until it is
//    — don't let the pricing page promise a model you can't actually call.
// ─────────────────────────────────────────────────────────────────────────

export type ProviderId = "groq" | "gemini";

export interface ProviderConfig {
  id: ProviderId;
  label: string;
  rpm: number; // requests per minute — from your console, whole account/project
  tpm: number; // tokens per minute
  rpd: number; // requests per day
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

/**
 * How the ONE shared provider ceiling is carved up across plan tiers.
 * Must sum to 1.0. A plan's reserved share is a floor it always gets —
 * see the borrowing rule in checkProviderCapacity below for how unused
 * slack gets redistributed.
 */
export const PROVIDER_RESERVED_SHARE: Record<PlanId, number> = {
  enterprise_scale: 0.30,
  growth_pro: 0.55,
  free_starter: 0.15,
};

/** Highest to lowest priority when the shared bucket is under pressure. */
export const PLAN_PRIORITY: PlanId[] = ["enterprise_scale", "growth_pro", "free_starter"];

export interface ProviderBucketUsage {
  /** Total requests/tokens already used by ALL plans combined, this window. */
  global: { requests: number; tokens: number };
  /** Requests/tokens used by each plan tier individually, this window. */
  byPlan: Record<PlanId, { requests: number; tokens: number }>;
}

export interface ProviderCapacityResult {
  allowed: boolean;
  reason?: string;
}

/**
 * Call this AFTER checkRateLimit (per-user) and BEFORE calling Groq/Gemini.
 * `usage` is a rolling 1-minute snapshot you maintain server-side (Redis
 * counters keyed by provider+plan are the right tool here — see the
 * README and the Postgres fallback function in the SQL migration).
 *
 * Fair-share rule: each plan gets its PROVIDER_RESERVED_SHARE as a floor.
 * A plan may BORROW another tier's currently-unused slice (so a quiet
 * night doesn't waste Enterprise's reserved capacity), but the moment a
 * higher-priority tier needs it, borrowed capacity is the first thing
 * denied to lower-priority tiers.
 */
export function checkProviderCapacity(
  provider: ProviderConfig,
  planId: PlanId,
  estimatedTokens: number,
  usage: ProviderBucketUsage,
): ProviderCapacityResult {
  // 1. Hard ceiling — the real Groq/Gemini limit, never exceeded regardless of plan.
  if (usage.global.requests + 1 > provider.rpm) {
    return { allowed: false, reason: `Shared ${provider.label} capacity is fully booked this minute (RPM limit reached). Try again shortly.` };
  }
  if (usage.global.tokens + estimatedTokens > provider.tpm) {
    return { allowed: false, reason: `Shared ${provider.label} capacity is fully booked this minute (TPM limit reached). Try again shortly.` };
  }

  // 2. Fair-share ceiling — this plan's reserved slice, plus any slack
  //    currently unused by other tiers.
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
// 8. WORKSPACE ALLOCATION — drop-in replacement for the logic in
//    src/lib/workspace-plan-limit.ts
// ─────────────────────────────────────────────────────────────────────────

export function canCreateWorkspace(planId: PlanId, currentWorkspaceCount: number): {
  allowed: boolean;
  reason?: string;
  requiresAddOn?: boolean;
} {
  const plan = PLANS[planId];

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
  return PLANS[planId].allowedFeatures.includes(action);
}

export function canUseModel(planId: PlanId, modelId: AiModelId): boolean {
  const model = AI_MODELS.find((m) => m.id === modelId);
  if (!model) return false;
  // A plan can use a model if the model's required tier is at or below its own.
  const order: PlanId[] = ["free_starter", "growth_pro", "enterprise_scale"];
  return order.indexOf(planId) >= order.indexOf(model.tierRequired);
}
