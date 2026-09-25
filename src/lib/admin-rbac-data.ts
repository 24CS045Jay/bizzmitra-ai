/**
 * Admin Console, Role-Based Access Control (RBAC) & Monetization Engine
 * Powers enterprise tenant management, dynamic role simulation, and AI credit billing.
 */

import {
  AI_MODELS as CONFIG_AI_MODELS,
  AiModelConfig,
  AiModelId as ConfigAiModelId,
  FEATURE_COSTS,
  FeatureAction,
  PLANS,
  PlanId,
  RATE_LIMITS,
  calculateCreditCost,
  calculateUsageWindows,
  checkRateLimit,
  planIdToName,
  planNameToId,
} from "./pricing-config";

export type AiModelId = ConfigAiModelId;

export type AiModel = {
  id: AiModelId;
  name: string;
  provider: string;
  badge: string;
  tierRequired: "Free Starter" | "Growth Pro" | "Enterprise Scale";
  isPro: boolean;
  costMultiplier: number;
  description: string;
};

export const AI_MODELS: AiModel[] = CONFIG_AI_MODELS.map((m) => ({
  id: m.id,
  name: m.name,
  provider: m.provider,
  badge: m.tierRequired === "free_starter" ? "Free Included" : m.tierRequired === "growth_pro" ? "Pro Required" : "Enterprise",
  tierRequired: planIdToName(m.tierRequired),
  isPro: m.tierRequired !== "free_starter",
  costMultiplier: m.costMultiplier,
  description: m.description || "",
}));

export type UserRole = "admin" | "architect" | "analyst" | "viewer";

export type RoleDefinition = {
  id: UserRole;
  title: string;
  badge: string;
  description: string;
  permissions: {
    canEditSchema: boolean;
    canRegenerateAI: boolean;
    canApproveBlueprint: boolean;
    canExportDeliverables: boolean;
    canManageUsers: boolean;
    canManageBilling: boolean;
    canSwitchModelsWithoutPayment: boolean;
  };
};

export const ROLE_DEFINITIONS: Record<UserRole, RoleDefinition> = {
  admin: {
    id: "admin",
    title: "Enterprise Administrator",
    badge: "Super Admin",
    description: "Full read-write governance, billing administration, user management, and blueprint approval.",
    permissions: {
      canEditSchema: true,
      canRegenerateAI: true,
      canApproveBlueprint: true,
      canExportDeliverables: true,
      canManageUsers: true,
      canManageBilling: true,
      canSwitchModelsWithoutPayment: true,
    },
  },
  architect: {
    id: "architect",
    title: "Lead Solution Architect",
    badge: "Technical Lead",
    description: "Full control over HLD/LLD diagrams, PostgreSQL schemas, REST API specs, and AI regeneration.",
    permissions: {
      canEditSchema: true,
      canRegenerateAI: true,
      canApproveBlueprint: true,
      canExportDeliverables: true,
      canManageUsers: false,
      canManageBilling: false,
      canSwitchModelsWithoutPayment: true,
    },
  },
  analyst: {
    id: "analyst",
    title: "Senior Business Analyst",
    badge: "Analyst",
    description: "Conducts discovery interviews, refines business context, reviews CRM pipelines, and posts feedback.",
    permissions: {
      canEditSchema: false,
      canRegenerateAI: false,
      canApproveBlueprint: false,
      canExportDeliverables: true,
      canManageUsers: false,
      canManageBilling: false,
      canSwitchModelsWithoutPayment: false,
    },
  },
  viewer: {
    id: "viewer",
    title: "Stakeholder / Client Viewer",
    badge: "Read Only",
    description: "View-only access to generated architecture, roadmap timelines, and exportable deliverables.",
    permissions: {
      canEditSchema: false,
      canRegenerateAI: false,
      canApproveBlueprint: false,
      canExportDeliverables: false,
      canManageUsers: false,
      canManageBilling: false,
      canSwitchModelsWithoutPayment: false,
    },
  },
};

export type SystemHealthService = {
  name: string;
  status: "operational" | "degraded" | "maintenance";
  uptimePct: number;
  latencyMs: number;
  region: string;
};

export const SYSTEM_HEALTH_SERVICES: SystemHealthService[] = [
  { name: "Cloudflare Edge Gateway", status: "operational", uptimePct: 99.99, latencyMs: 24, region: "Global Anycast" },
  { name: "Supabase PostgreSQL 16 Cluster", status: "operational", uptimePct: 99.98, latencyMs: 38, region: "ap-south-1 (Mumbai)" },
  { name: "BullMQ Asynchronous Queue", status: "operational", uptimePct: 100.0, latencyMs: 12, region: "Redis 7 Dedicated" },
  { name: "AI Inference & Generation Engine", status: "operational", uptimePct: 99.95, latencyMs: 280, region: "AWS us-east-1" },
  { name: "Client-Side Serialization Engine", status: "operational", uptimePct: 100.0, latencyMs: 4, region: "Browser WebAssembly" },
];

export type CreditTransaction = {
  id: string;
  description: string;
  type: "deduction" | "credit";
  amount: number;
  timestamp: string;
  balanceAfter: number;
  createdAt?: string; // ISO string for accurate rate limit window calculations
  action?: FeatureAction;
  modelId?: string;
  promptTokens?: number;
  completionTokens?: number;
};

export type CreditWallet = {
  balance: number;
  monthlyQuota: number;
  tier: "Free Starter" | "Growth Pro" | "Enterprise Scale";
  nextBillingDate: string;
  transactions: CreditTransaction[];
};

export const INITIAL_FREE_WALLET: CreditWallet = {
  balance: 100,
  monthlyQuota: 100,
  tier: "Free Starter",
  nextBillingDate: "Oct 01, 2026",
  transactions: [
    {
      id: "tx-init-free",
      description: "Welcome Free Starter Grant (100 credits/mo)",
      type: "credit",
      amount: 100,
      timestamp: "Today",
      balanceAfter: 100,
      createdAt: new Date().toISOString(),
    },
  ],
};

export const INITIAL_ADMIN_WALLET: CreditWallet = {
  balance: 840,
  monthlyQuota: 1000,
  tier: "Growth Pro",
  nextBillingDate: "Oct 01, 2026",
  transactions: [
    {
      id: "tx-101",
      description: "Solution Studio AI Regeneration (v1.1)",
      type: "deduction",
      amount: 40,
      timestamp: "Today, 11:30 AM",
      balanceAfter: 840,
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "tx-102",
      description: "Full Blueprint AST Serialization",
      type: "deduction",
      amount: 25,
      timestamp: "Yesterday, 04:15 PM",
      balanceAfter: 880,
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "tx-103",
      description: "AI Architecture HLD/LLD Synthesis",
      type: "deduction",
      amount: 50,
      timestamp: "Yesterday, 02:00 PM",
      balanceAfter: 905,
      createdAt: new Date(Date.now() - 26 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "tx-104",
      description: "Monthly Subscription Credit Grant",
      type: "credit",
      amount: 1000,
      timestamp: "Sep 01, 2026",
      balanceAfter: 1000,
      createdAt: new Date(Date.now() - 24 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ],
};

export const INITIAL_WALLET: CreditWallet = INITIAL_FREE_WALLET;

export type ManagedTenantWorkspace = {
  id: string;
  name: string;
  industry: string;
  ownerName: string;
  ownerEmail: string;
  status: "active" | "archived";
  version: string;
  maturityScore: number;
  membersCount: number;
  createdAt: string;
};

export const MANAGED_WORKSPACES: ManagedTenantWorkspace[] = [
  {
    id: "ws-talentcraft-hr",
    name: "TalentCraft HR Consultancy",
    industry: "HR & Recruitment Services",
    ownerName: "Param Shah",
    ownerEmail: "param@talentcraft.co",
    status: "active",
    version: "v1.3",
    maturityScore: 96,
    membersCount: 8,
    createdAt: "Sep 11, 2026",
  },
  {
    id: "ws-nexa-support",
    name: "Nexa E-Commerce Support",
    industry: "Consumer Retail & Logistics",
    ownerName: "Ananya Rao",
    ownerEmail: "ananya@nexa-retail.in",
    status: "active",
    version: "v1.2",
    maturityScore: 84,
    membersCount: 14,
    createdAt: "Sep 08, 2026",
  },
  {
    id: "ws-healthsync",
    name: "HealthSync Telemedicine",
    industry: "Healthcare & MedTech",
    ownerName: "Dr. Vikram Seth",
    ownerEmail: "vikram@healthsync.care",
    status: "archived",
    version: "v1.0",
    maturityScore: 58,
    membersCount: 4,
    createdAt: "Aug 24, 2026",
  },
];

export const STORAGE_KEY_CURRENT_ROLE = "bizzmitra.activeUserRole";
export const STORAGE_KEY_WALLET = "bizzmitra.creditWallet";

export function loadCurrentRole(): UserRole {
  if (typeof window === "undefined") return "viewer";
  try {
    const role = localStorage.getItem(STORAGE_KEY_CURRENT_ROLE) as UserRole | null;
    return role && ROLE_DEFINITIONS[role] ? role : "viewer";
  } catch {
    return "viewer";
  }
}

export function saveCurrentRole(role: UserRole): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY_CURRENT_ROLE, role);
    window.dispatchEvent(new CustomEvent("bizzmitra:role-changed", { detail: role }));
  } catch {}
}

export function isSuperAdminEmail(email?: string | null): boolean {
  if (!email) return false;
  const normalized = email.trim().toLowerCase();
  return (
    normalized === "admin@bizzmitra.ai" ||
    normalized === "param@talentcraft.co" ||
    normalized.endsWith("@talentcraft.co")
  );
}

export function syncUserRoleAndWallet(
  email?: string | null,
  forceReset: boolean = false,
): { role: UserRole; wallet: CreditWallet } {
  const isSuperAdmin = isSuperAdminEmail(email);

  if (isSuperAdmin) {
    saveCurrentRole("admin");
    const currentWallet = loadCreditWallet();
    if (forceReset || currentWallet.tier === "Free Starter" || currentWallet.balance < 500) {
      saveCreditWallet(INITIAL_ADMIN_WALLET);
      return { role: "admin", wallet: INITIAL_ADMIN_WALLET };
    }
    return { role: "admin", wallet: currentWallet };
  } else {
    // Normal client users: strictly viewer role and Free Starter tier (100 credits/mo)
    saveCurrentRole("viewer");
    const currentWallet = loadCreditWallet();
    // If forced reset or coming from an admin wallet state or uninitialized
    if (
      forceReset ||
      (currentWallet.tier !== "Growth Pro" && currentWallet.tier !== "Enterprise Scale") ||
      currentWallet.balance === 840
    ) {
      saveCreditWallet(INITIAL_FREE_WALLET);
      return { role: "viewer", wallet: INITIAL_FREE_WALLET };
    }
    return { role: "viewer", wallet: currentWallet };
  }
}

export function loadCreditWallet(): CreditWallet {
  if (typeof window === "undefined") return INITIAL_WALLET;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_WALLET);
    if (!raw) return INITIAL_WALLET;
    return JSON.parse(raw);
  } catch {
    return INITIAL_WALLET;
  }
}

export function saveCreditWallet(wallet: CreditWallet): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY_WALLET, JSON.stringify(wallet));
    window.dispatchEvent(new CustomEvent("bizzmitra:wallet-changed", { detail: wallet }));
  } catch {}
}

/**
 * Token-based calculation and metering.
 * Standard industry conversion: 1 word ≈ 1.33 tokens.
 * Credit conversion: 250 tokens = 1 Credit. Minimum = 1 Credit.
 */
export function estimateTokensForText(text: string): number {
  if (!text || !text.trim()) return 0;
  // Word count heuristic
  const words = text.trim().split(/\s+/).length;
  // Account for punctuation & subwords: ~1.33 tokens per word + base prompt framing overhead
  return Math.max(1, Math.round(words * 1.35));
}

export type TokenDeductionResult = {
  success: boolean;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  creditsDeducted: number;
  newBalance: number;
  message?: string;
};

export function getWalletUsageWindows(wallet: CreditWallet = loadCreditWallet()) {
  const history = wallet.transactions
    .filter((t) => t.type === "deduction")
    .map((t) => ({
      credits: t.amount,
      createdAt: t.createdAt || new Date().toISOString(),
    }));
  return calculateUsageWindows(history);
}

export function deductCreditsByTokens(
  promptText: string,
  completionText: string,
  activityDescription: string,
  costMultiplier: number = 1.0,
  action: FeatureAction = "ai_copilot_turn",
): TokenDeductionResult {
  const currentWallet = loadCreditWallet();
  const promptTokens = estimateTokensForText(promptText);
  const completionTokens = estimateTokensForText(completionText);
  const totalTokens = promptTokens + completionTokens;

  // 1 credit per 250 tokens scaled by model costMultiplier, minimum floor
  const featureConfig = FEATURE_COSTS[action] || FEATURE_COSTS.ai_copilot_turn;
  const baseCredits = Math.ceil(totalTokens / 250);
  const creditsDeducted = Math.max(featureConfig.baseCredits, Math.round(baseCredits * (costMultiplier || 1.0)));

  // Rate Limit Check (5-hour: 150 cr, Weekly: 500 cr)
  const history = currentWallet.transactions
    .filter((t) => t.type === "deduction")
    .map((t) => ({
      credits: t.amount,
      createdAt: t.createdAt || new Date().toISOString(),
    }));
  const rateLimitCheck = checkRateLimit(history, creditsDeducted);

  if (!rateLimitCheck.allowed) {
    return {
      success: false,
      promptTokens,
      completionTokens,
      totalTokens,
      creditsDeducted: 0,
      newBalance: currentWallet.balance,
      message: rateLimitCheck.reason,
    };
  }

  if (currentWallet.balance < creditsDeducted) {
    return {
      success: false,
      promptTokens,
      completionTokens,
      totalTokens,
      creditsDeducted: 0,
      newBalance: currentWallet.balance,
      message: `Insufficient credits! This request requires ${creditsDeducted} credits (${totalTokens} tokens), but your balance is ${currentWallet.balance}.`,
    };
  }

  const newBalance = currentWallet.balance - creditsDeducted;
  const nowIso = new Date().toISOString();
  const newTx: CreditTransaction = {
    id: `tx-${Date.now().toString().slice(-5)}`,
    description: `${activityDescription} (${totalTokens} tokens • ${creditsDeducted} cr)`,
    type: "deduction",
    amount: creditsDeducted,
    timestamp: "Just now",
    balanceAfter: newBalance,
    createdAt: nowIso,
    action,
    promptTokens,
    completionTokens,
  };

  const updatedWallet: CreditWallet = {
    ...currentWallet,
    balance: newBalance,
    transactions: [newTx, ...currentWallet.transactions],
  };

  saveCreditWallet(updatedWallet);

  return {
    success: true,
    promptTokens,
    completionTokens,
    totalTokens,
    creditsDeducted,
    newBalance,
  };
}

export function deductFeatureCredits(
  action: FeatureAction,
  modelId: AiModelId = "gemini-2-flash",
  descriptionOverride?: string,
): { success: boolean; creditsDeducted: number; newBalance: number; message?: string } {
  const currentWallet = loadCreditWallet();
  const credits = calculateCreditCost(action, modelId);
  const feature = FEATURE_COSTS[action];
  const desc = descriptionOverride || `${feature?.label || action} (${credits} cr)`;

  // Check rate limit
  const history = currentWallet.transactions
    .filter((t) => t.type === "deduction")
    .map((t) => ({
      credits: t.amount,
      createdAt: t.createdAt || new Date().toISOString(),
    }));
  const rateLimitCheck = checkRateLimit(history, credits);

  if (!rateLimitCheck.allowed) {
    return {
      success: false,
      creditsDeducted: 0,
      newBalance: currentWallet.balance,
      message: rateLimitCheck.reason,
    };
  }

  if (currentWallet.balance < credits) {
    return {
      success: false,
      creditsDeducted: 0,
      newBalance: currentWallet.balance,
      message: `Insufficient credits! Action requires ${credits} credits, balance is ${currentWallet.balance}.`,
    };
  }

  const newBalance = currentWallet.balance - credits;
  const nowIso = new Date().toISOString();
  const newTx: CreditTransaction = {
    id: `tx-${Date.now().toString().slice(-5)}`,
    description: desc,
    type: "deduction",
    amount: credits,
    timestamp: "Just now",
    balanceAfter: newBalance,
    createdAt: nowIso,
    action,
    modelId,
  };

  const updatedWallet: CreditWallet = {
    ...currentWallet,
    balance: newBalance,
    transactions: [newTx, ...currentWallet.transactions],
  };

  saveCreditWallet(updatedWallet);

  return {
    success: true,
    creditsDeducted: credits,
    newBalance,
  };
}

export const STORAGE_KEY_ACTIVE_MODEL = "bizzmitra.activeAiModel";

export function loadActiveModel(): AiModelId {
  if (typeof window === "undefined") return "gemini-2-flash";
  try {
    const stored = localStorage.getItem(STORAGE_KEY_ACTIVE_MODEL) as AiModelId | null;
    return stored && AI_MODELS.some((m) => m.id === stored) ? stored : "gemini-2-flash";
  } catch {
    return "gemini-2-flash";
  }
}

export function saveActiveModel(modelId: AiModelId): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY_ACTIVE_MODEL, modelId);
    window.dispatchEvent(new CustomEvent("bizzmitra:model-changed", { detail: modelId }));
  } catch {}
}

export function canUserAccessModel(
  modelId: AiModelId,
  userRole: UserRole,
  userEmail?: string | null,
  walletTier?: string,
): { allowed: boolean; reason?: string; isSuperAdminBypass: boolean } {
  const model = AI_MODELS.find((m) => m.id === modelId) || AI_MODELS[0]!;

  // 1. Super Admin Whitelist Check:
  // Strictly verified super admin accounts get testing bypass automatically
  const isSuperAdmin = isSuperAdminEmail(userEmail);

  if (isSuperAdmin) {
    return {
      allowed: true,
      isSuperAdminBypass: true,
    };
  }

  // 2. Standard user tier check
  const tier = walletTier || loadCreditWallet().tier;
  if (!model.isPro) {
    return {
      allowed: true,
      isSuperAdminBypass: false,
    };
  }

  if (model.tierRequired === "Growth Pro" && (tier === "Growth Pro" || tier === "Enterprise Scale")) {
    return {
      allowed: true,
      isSuperAdminBypass: false,
    };
  }

  if (model.tierRequired === "Enterprise Scale" && tier === "Enterprise Scale") {
    return {
      allowed: true,
      isSuperAdminBypass: false,
    };
  }

  return {
    allowed: false,
    reason: `${model.name} is a high-precision reasoning model locked to the ${model.tierRequired} tier. Upgrade your account or switch to an Administrator role to test.`,
    isSuperAdminBypass: false,
  };
}
