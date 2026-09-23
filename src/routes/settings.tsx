import { createFileRoute } from "@tanstack/react-router";
import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  CreditCard,
  Coins,
  Check,
  TrendingUp,
  History,
  Sparkles,
  Zap,
  ShieldCheck,
  PlusCircle,
  Building2,
  Sliders,
  Layers,
  RefreshCw,
  FileCode2,
} from "lucide-react";

import { AppShell } from "@/components/AppShell";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/primitives";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/hooks/useTheme";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import {
  AI_MODELS,
  AiModel,
  CreditWallet,
  INITIAL_WALLET,
  isSuperAdminEmail,
  loadCreditWallet,
  saveCreditWallet,
} from "@/lib/admin-rbac-data";
import { AiModelPaymentModal } from "@/components/AiModelPaymentModal";
import {
  initiateRazorpayPayment,
  getRazorpayKeyId,
  saveRazorpayKeyId,
} from "@/lib/razorpay";
import { LanguageSelector } from "@/components/LanguageSelector";
import { SUPPORTED_LANGUAGES, getCurrentLanguage, setLanguage, SupportedLanguage, useTranslation } from "@/lib/i18n";
import { getDatabaseBlueprint } from "@/lib/database-data";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings & Monetization — BizzMitra-AI" },
      { name: "description", content: "Manage your BizzMitra-AI profile, AI credit balance, subscription plans, and workspace defaults." },
      { property: "og:title", content: "Settings & Monetization — BizzMitra-AI" },
      { property: "og:description", content: "Profile, AI credit balance, subscription plans, and workspace defaults." },
    ],
  }),
  component: SettingsPage,
});

const TIERS = [
  {
    name: "Free Starter",
    monthlyPrice: "₹0",
    annualPrice: "₹0",
    cadence: "forever free",
    credits: "100 credits/mo",
    features: ["Single workspace", "Standard LLM intake", "Basic HLD export", "Community support"],
    highlight: false,
  },
  {
    name: "Growth Pro",
    monthlyPrice: "₹3,999",
    annualPrice: "₹3,199",
    cadence: "per seat / month",
    credits: "1,000 credits/mo",
    features: ["Unlimited workspaces", "Solution Studio customizer", "PostgreSQL DDL & REST APIs", "Executive pitch deck export", "Role-based access preview"],
    highlight: true,
  },
  {
    name: "Enterprise Scale",
    monthlyPrice: "₹15,999",
    annualPrice: "₹12,799",
    cadence: "per org / month",
    credits: "5,000 credits/mo",
    features: ["Dedicated compute cluster", "Custom BPMN 2.0 pipelines", "Full Git multi-tier versioning", "99.99% SLA guarantee", "SOC2 compliance attestation"],
    highlight: false,
  },
];

const DOMAIN_PRESETS = [
  {
    name: "Solar & Clean Tech (SCADA Telemetry)",
    industry: "Clean Tech & Renewable Energy",
    problemStatement: "Fragmented SCADA telemetry across 45 distributed solar photovoltaic micro-grids causing 22% inverter downtime and lagging manual failure detection.",
  },
  {
    name: "Healthcare & Diagnostics (LIS & HL7)",
    industry: "Healthcare & Diagnostics",
    problemStatement: "Specimen barcode mismatches and 6.5-hour turnaround delay between phlebotomy collection and pathology analyzer results violating NABL/CAP audit compliance.",
  },
  {
    name: "Logistics & Supply Chain (Cold-Chain IoT)",
    industry: "Logistics & Supply Chain",
    problemStatement: "Perishable cargo spoilage and unmonitored cold-chain telemetry across 320 refrigerated transit vehicles creating high transit shrink.",
  },
  {
    name: "FinTech & Lending (NBFC Underwriting)",
    industry: "FinTech & Financial Services",
    problemStatement: "Manual paper-based underwriting and delayed bureau verification leading to 96-hour loan approval turn-around time and high customer drop-off.",
  },
  {
    name: "TalentCraft HR (Recruitment Pipeline)",
    industry: "Human Resources & Recruitment",
    problemStatement: "Manual spreadsheet-driven candidate tracking, uncoordinated interview scheduling, and 28-day hiring cycle lag with 28% drop-off.",
  },
];

function SettingsPage() {
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();
  const { t } = useTranslation();
  const [fullName, setFullName] = useState("");
  const [plan, setPlan] = useState("free");
  const [workspaceName, setWorkspaceName] = useState("");
  const [problemStatement, setProblemStatement] = useState("");
  const [industry, setIndustry] = useState("");
  const [workspace, setWorkspace] = useState<{
    id: string;
    name: string;
    maturity_score: number;
  } | null>(null);

  const [workspaceContext, setWorkspaceContext] = useState<any>(() => {
    if (typeof window === "undefined") return null;
    const raw = localStorage.getItem("bizzmitra.workspaceContext");
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (workspaceContext) {
      setWorkspaceName(workspaceContext.name || workspaceContext.businessName || "Enterprise Solution Blueprint");
      setProblemStatement(workspaceContext.problemStatement || workspaceContext.description || "");
      setIndustry(workspaceContext.industry || "Enterprise Cloud & Software");
    } else {
      setWorkspaceName("Enterprise Solution Blueprint");
      setProblemStatement("End-to-end enterprise digital transformation and automated workflows.");
      setIndustry("Enterprise Software");
    }
  }, [workspaceContext]);

  const dbBlueprint = getDatabaseBlueprint(workspaceContext);

  const [wallet, setWallet] = useState<CreditWallet>(INITIAL_WALLET);
  const isSuperAdmin = isSuperAdminEmail(user?.email);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedModelForPayment, setSelectedModelForPayment] = useState<AiModel | null>(null);
  const [razorpayKey, setRazorpayKey] = useState<string>(getRazorpayKeyId());
  const [isEditingKey, setIsEditingKey] = useState<boolean>(false);
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">("monthly");

  useEffect(() => {
    setWallet(loadCreditWallet());
    const handleWalletChange = (e: Event) => {
      const ce = e as CustomEvent<CreditWallet>;
      if (ce.detail) setWallet(ce.detail);
      else setWallet(loadCreditWallet());
    };
    window.addEventListener("bizzmitra:wallet-changed", handleWalletChange);
    return () => window.removeEventListener("bizzmitra:wallet-changed", handleWalletChange);
  }, []);

  useEffect(() => {
    if (!user) return;
    const currentUserId = user.id;
    async function loadSettings() {
      const [{ data: profile }, workspaceResult] = await Promise.all([
        supabase.from("profiles").select("full_name, plan").eq("id", currentUserId).single(),
        supabase
          .from("workspaces")
          .select("id, name, maturity_score")
          .eq("id", window.localStorage.getItem("bizzmitra.activeWorkspaceId") ?? "")
          .maybeSingle(),
      ]);
      setFullName(profile?.full_name ?? "");
      setPlan(profile?.plan ?? "free");
      if (workspaceResult.data) {
        setWorkspace(workspaceResult.data);
        if (!workspaceContext) {
          setWorkspaceName(workspaceResult.data.name ?? "");
        }
      }
    }
    void loadSettings();
  }, [user]);

  async function saveProfile() {
    if (!user) return;
    const { error } = await supabase.from("profiles").update({ full_name: fullName }).eq("id", user.id);
    if (error) toast.error(error.message);
    else toast.success("Profile updated");
  }

  function saveWorkspaceContext(newCtx?: any) {
    const updated = newCtx || {
      ...(workspaceContext || {}),
      name: workspaceName.trim() || "Enterprise Modernization Blueprint",
      businessName: workspaceName.trim() || "Enterprise Modernization Blueprint",
      industry: industry.trim() || "Enterprise Software",
      problemStatement: problemStatement.trim() || "End-to-end enterprise modernization.",
      description: problemStatement.trim() || "End-to-end enterprise modernization.",
    };
    localStorage.setItem("bizzmitra.workspaceContext", JSON.stringify(updated));
    setWorkspaceContext(updated);
    window.dispatchEvent(new CustomEvent("bizzmitra:workspace-changed", { detail: updated }));
    toast.success("Active problem statement & workspace blueprint synchronized!");
    if (workspace && workspaceName.trim()) {
      void supabase
        .from("workspaces")
        .update({ name: workspaceName.trim() })
        .eq("id", workspace.id)
        .then(({ error }) => {
          if (!error) setWorkspace({ ...workspace, name: workspaceName.trim() });
        });
    }
  }

  function applyPreset(preset: typeof DOMAIN_PRESETS[0]) {
    setWorkspaceName(preset.name);
    setIndustry(preset.industry);
    setProblemStatement(preset.problemStatement);
    const updated = {
      ...(workspaceContext || {}),
      name: preset.name,
      businessName: preset.name,
      industry: preset.industry,
      problemStatement: preset.problemStatement,
      description: preset.problemStatement,
    };
    saveWorkspaceContext(updated);
  }

  async function renameWorkspace() {
    saveWorkspaceContext();
  }

  async function handleAddCredits(amount: number, priceRupees: number) {
    if (isSuperAdmin) {
      const updated: CreditWallet = {
        ...wallet,
        balance: wallet.balance + amount,
        transactions: [
          {
            id: `tx-${Date.now().toString().slice(-4)}`,
            description: `Super Admin Testing Grant (+${amount} credits)`,
            type: "credit",
            amount: amount,
            timestamp: "Just now",
            balanceAfter: wallet.balance + amount,
          },
          ...wallet.transactions,
        ],
      };
      setWallet(updated);
      saveCreditWallet(updated);
      toast.success(`Admin bypass: Added ${amount} credits! New balance: ${updated.balance}`);
      return;
    }

    try {
      await initiateRazorpayPayment({
        amountInRupees: priceRupees,
        planName: `Credit Top-Up (+${amount} Credits)`,
        creditsGranted: amount,
        customerName: (user?.user_metadata as Record<string, any> | undefined)?.["full_name"] || fullName || "Enterprise Customer",
        customerEmail: user?.email || undefined,
        onSuccess: (resp) => {
          const newBalance = wallet.balance + amount;
          const updated: CreditWallet = {
            ...wallet,
            balance: newBalance,
            transactions: [
              {
                id: `tx-rzp-${Date.now().toString().slice(-6)}`,
                description: `Razorpay Payment (${resp.razorpay_payment_id}): +${amount} Credits (₹${priceRupees})`,
                type: "credit",
                amount: amount,
                timestamp: "Just now",
                balanceAfter: newBalance,
              },
              ...wallet.transactions,
            ],
          };
          setWallet(updated);
          saveCreditWallet(updated);
          toast.success(`🎉 Payment of ₹${priceRupees} confirmed! Added ${amount} credits.`);
        },
        onDismiss: () => {
          toast.info("Payment window closed.");
        },
      });
    } catch (err: any) {
      toast.error(err.message || "Failed to initialize Razorpay checkout.");
    }
  }

  function handleUpgradeTier(tierName: "Free Starter" | "Growth Pro" | "Enterprise Scale") {
    if (tierName === "Free Starter") {
      const updated: CreditWallet = {
        ...wallet,
        tier: tierName,
      };
      setWallet(updated);
      saveCreditWallet(updated);
      toast.success("Account switched to Free Starter plan");
      return;
    }
    if (!isSuperAdmin) {
      const targetModel =
        tierName === "Enterprise Scale"
          ? AI_MODELS.find((m) => m.id === "deepseek-v3") || null
          : AI_MODELS.find((m) => m.id === "gpt-4o") || null;
      setSelectedModelForPayment(targetModel);
      setIsPaymentModalOpen(true);
      return;
    }
    const updated: CreditWallet = {
      ...wallet,
      tier: tierName,
    };
    setWallet(updated);
    saveCreditWallet(updated);
    toast.success(`Admin bypass: Switched to ${tierName}!`);
  }

  return (
    <AppShell>
      <Reveal>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Account & Billing</p>
        <h1 className="mt-2 font-display text-4xl font-extrabold sm:text-5xl">{t("settings.title", "Settings & Monetization")}</h1>
      </Reveal>

      <Stagger className="mt-8 grid gap-4 lg:grid-cols-2">
        <StaggerItem className="neu p-6 min-w-0 overflow-hidden">
          <h2 className="font-display text-lg font-bold">{t("settings.profile", "Profile")}</h2>
          <dl className="mt-4 space-y-3 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="shrink-0 text-muted-foreground">Email</dt>
              <dd className="truncate font-medium min-w-0 text-right">{user?.email ?? "—"}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Current Plan</dt>
              <dd className="font-medium text-primary font-semibold">{wallet.tier}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Seats</dt>
              <dd className="font-medium">1 of 5 active</dd>
            </div>
          </dl>
          <div className="mt-5 flex gap-2">
            <input
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
              placeholder="Full name"
              className="neu-inset min-w-0 flex-1 px-3 py-2 text-sm outline-none"
            />
            <button onClick={saveProfile} className="neu-sm neu-press px-3 py-2 text-xs font-semibold">
              {t("action.save", "Save")}
            </button>
          </div>
        </StaggerItem>

        <StaggerItem className="neu p-6 min-w-0 overflow-hidden space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Building2 className="size-4 text-primary" />
              <h2 className="font-display text-lg font-bold">{t("settings.workspace", "Active Workspace & Problem Blueprint")}</h2>
            </div>
            <span className="rounded-md bg-primary/10 px-2 py-0.5 text-xs font-mono font-bold text-primary">
              {dbBlueprint.domainId.toUpperCase()} ENGINE
            </span>
          </div>

          <p className="text-xs text-muted-foreground leading-relaxed">
            Configure the active business problem statement. All solution blueprints (Architecture, BPMN, Wireframes, Database, Roadmap, ROI, Collaboration, and Exports) dynamically calibrate to this definition.
          </p>

          <dl className="grid grid-cols-2 gap-3 text-xs neu-inset p-3">
            <div>
              <dt className="text-muted-foreground">Domain Schema</dt>
              <dd className="font-semibold text-foreground">{(dbBlueprint.tables || []).length} Tables · {(dbBlueprint.apiSpecifications || dbBlueprint.apiEndpoints || []).length} APIs</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Tenant Security</dt>
              <dd className="font-semibold text-emerald-600 dark:text-emerald-400">PostgreSQL Multi-Tenant RLS</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Maturity Score</dt>
              <dd className="font-semibold text-foreground">{workspace?.maturity_score ?? 98}% Production Ready</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Real-time Sync</dt>
              <dd className="font-semibold text-primary flex items-center gap-1">
                <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" /> Live Synchronized
              </dd>
            </div>
          </dl>

          <div className="space-y-3 pt-1">
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-muted-foreground">Workspace / Scenario Title</label>
              <input
                value={workspaceName}
                onChange={(event) => setWorkspaceName(event.target.value)}
                placeholder="e.g. SolarGrid Telemetry Platform"
                className="neu-inset w-full px-3 py-2 text-xs outline-none font-medium"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-muted-foreground">Target Industry Sector</label>
              <input
                value={industry}
                onChange={(event) => setIndustry(event.target.value)}
                placeholder="e.g. Clean Tech & Renewable Energy"
                className="neu-inset w-full px-3 py-2 text-xs outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-muted-foreground">Problem Statement & Scope</label>
              <textarea
                value={problemStatement}
                onChange={(event) => setProblemStatement(event.target.value)}
                rows={3}
                placeholder="Describe operational bottleneck, turnaround lag, compliance requirements, or manual silos..."
                className="neu-inset w-full p-2.5 text-xs outline-none leading-relaxed"
              />
            </div>

            <div className="flex items-center justify-between pt-1">
              <button
                type="button"
                onClick={() => saveWorkspaceContext()}
                className="neu-press flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-primary-foreground hover:bg-primary/90 transition shadow-sm"
              >
                <Sparkles className="size-3.5" /> Save & Sync Blueprint
              </button>
            </div>

            {/* Quick Domain Presets for testing */}
            <div className="border-t border-border/40 pt-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block mb-1.5">
                Quick-Switch Domain Problem Presets
              </span>
              <div className="flex flex-wrap gap-1.5">
                {DOMAIN_PRESETS.map((preset) => (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() => applyPreset(preset)}
                    className={`rounded-lg px-2.5 py-1 text-[11px] font-medium transition ${
                      workspaceName === preset.name
                        ? "bg-primary text-primary-foreground font-bold shadow-xs"
                        : "neu-sm hover:text-primary"
                    }`}
                  >
                    {preset.name.split(" ")[0]} ({preset.name.includes("Solar") ? "Solar" : preset.name.includes("Healthcare") ? "Health" : preset.name.includes("Logistics") ? "Logistics" : preset.name.includes("FinTech") ? "FinTech" : "HR"})
                  </button>
                ))}
              </div>
            </div>
          </div>
        </StaggerItem>

        {/* AI Credit Wallet Section */}
        <StaggerItem className="neu p-6 lg:col-span-2 min-w-0 overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border/80 pb-4">
            <div className="flex items-center gap-3">
              <div className="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary">
                <Coins className="size-5" />
              </div>
              <div>
                <h2 className="font-display text-xl font-bold">{t("settings.wallet", "AI Token & Credit Wallet")}</h2>
                <p className="text-xs text-muted-foreground">Live metering for LLM synthesis, solution regeneration, and blueprint exports.</p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {isSuperAdmin && (
                <span className="rounded bg-amber-500/10 px-2 py-1 text-[10px] font-bold text-amber-600 dark:text-amber-400">
                  Admin Testing Bypass
                </span>
              )}
              <button
                onClick={() => handleAddCredits(250, 799)}
                className="neu-sm neu-press flex items-center gap-1.5 px-3 py-2 text-xs font-semibold hover:text-primary transition-colors"
                title="Purchase 250 AI Credits via Razorpay"
              >
                <PlusCircle className="size-3.5 text-primary" /> +250 Credits (₹799)
              </button>
              <button
                onClick={() => handleAddCredits(1000, 2799)}
                className="neu-press flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 px-3.5 py-2 text-xs font-semibold text-white shadow-sm glow-primary transition-colors"
                title="Purchase 1,000 AI Credits via Razorpay"
              >
                <Sparkles className="size-3.5" /> +1,000 Credits (₹2,799)
              </button>
            </div>
          </div>

          {/* Razorpay Gateway Status / Config Bar */}
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border/70 bg-background/50 p-3 text-xs">
            <div className="flex items-center gap-2.5">
              <div className={`size-2.5 rounded-full ${razorpayKey ? "bg-emerald-500 animate-pulse" : "bg-amber-500"}`} />
              <div>
                <span className="font-semibold text-foreground">
                  Razorpay Real-time Gateway: {razorpayKey ? "Active (INR ₹ Ready)" : "Key Configuration Required"}
                </span>
                <p className="text-[10px] text-muted-foreground font-mono">
                  Key ID: {razorpayKey || "Not set. Set VITE_RAZORPAY_KEY_ID in .env or configure below."}
                </p>
              </div>
            </div>
            <div>
              {isEditingKey ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={razorpayKey}
                    onChange={(e) => {
                      setRazorpayKey(e.target.value);
                      saveRazorpayKeyId(e.target.value);
                    }}
                    placeholder="rzp_test_... or rzp_live_..."
                    className="neu-inset px-2.5 py-1 text-xs font-mono outline-none w-56"
                  />
                  <button
                    onClick={() => {
                      saveRazorpayKeyId(razorpayKey);
                      setIsEditingKey(false);
                      toast.success("Razorpay Key ID saved!");
                    }}
                    className="neu-sm neu-press px-2.5 py-1 text-xs font-bold text-primary"
                  >
                    Save
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setIsEditingKey(true)}
                  className="neu-sm neu-press px-3 py-1 text-xs font-semibold text-primary hover:underline"
                >
                  Configure Key
                </button>
              )}
            </div>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-border bg-background/50 p-4">
              <p className="text-xs text-muted-foreground">Available Credits</p>
              <p className="mt-1 font-display text-3xl font-extrabold text-primary">{wallet.balance}</p>
              <p className="mt-1 text-[11px] text-muted-foreground">of {wallet.monthlyQuota} monthly allocation</p>
            </div>
            <div className="rounded-xl border border-border bg-background/50 p-4">
              <p className="text-xs text-muted-foreground">Current Tier</p>
              <p className="mt-1 font-display text-2xl font-bold text-foreground">{wallet.tier}</p>
              <p className="mt-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">Renews on {wallet.nextBillingDate}</p>
            </div>
            <div className="rounded-xl border border-border bg-background/50 p-4">
              <p className="text-xs text-muted-foreground">Average Burn Rate</p>
              <p className="mt-1 font-display text-2xl font-bold text-foreground">32 / day</p>
              <p className="mt-1 text-[11px] text-muted-foreground">Estimated 26 days of usage remaining</p>
            </div>
          </div>

          {/* Transaction Ledger */}
          <div className="mt-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <History className="size-3.5" /> Recent Token Transactions
              </h3>
              <span className="text-[11px] text-muted-foreground">Audited in Supabase Ledger</span>
            </div>
            <div className="rounded-xl border border-border bg-background/40 divide-y divide-border/60 overflow-hidden">
              {wallet.transactions.slice(0, 4).map((tx) => (
                <div key={tx.id} className="flex items-center justify-between gap-3 p-3 text-xs">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className={tx.type === "credit" ? "text-emerald-500 font-bold shrink-0" : "text-amber-500 font-bold shrink-0"}>
                      {tx.type === "credit" ? "+" : "—"}
                    </span>
                    <div className="min-w-0">
                      <p className="font-semibold truncate">{tx.description}</p>
                      <p className="text-[11px] text-muted-foreground">{tx.timestamp}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`font-mono font-bold ${tx.type === "credit" ? "text-emerald-600 dark:text-emerald-400" : "text-foreground"}`}>
                      {tx.type === "credit" ? `+${tx.amount}` : `-${tx.amount}`} credits
                    </span>
                    <p className="text-[10px] text-muted-foreground">Bal: {tx.balanceAfter}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </StaggerItem>

        {/* Pricing Tiers & Upgrade Engine */}
        <StaggerItem className="neu p-6 lg:col-span-2 min-w-0 overflow-hidden">
          <div className="text-center max-w-xl mx-auto mb-6">
            <h2 className="font-display text-2xl font-extrabold">{t("settings.plans", "Subscription Plans & SaaS Tiers")}</h2>
            <p className="text-xs text-muted-foreground mt-1 mb-4">
              Select the plan that fits your consultancy or enterprise transformation needs.
            </p>

            {/* Monthly / Annual Toggle matching Landing Page */}
            <div className="neu-sm inline-flex items-center gap-1.5 p-1 rounded-full">
              <button
                type="button"
                onClick={() => setBillingCycle("monthly")}
                className={`rounded-full px-3.5 py-1 text-xs font-bold transition-all ${
                  billingCycle === "monthly"
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Monthly Billing
              </button>
              <button
                type="button"
                onClick={() => setBillingCycle("annual")}
                className={`rounded-full px-3.5 py-1 text-xs font-bold transition-all flex items-center gap-1.5 ${
                  billingCycle === "annual"
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <span>Annual Billing</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${
                  billingCycle === "annual" ? "bg-primary-foreground/20 text-primary-foreground" : "bg-primary/15 text-primary"
                }`}>
                  Save 20%
                </span>
              </button>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {TIERS.map((t) => {
              const isCurrent = wallet.tier === t.name;
              const price = billingCycle === "annual" ? t.annualPrice : t.monthlyPrice;
              return (
                <div
                  key={t.name}
                  className={`rounded-2xl border p-5 flex flex-col justify-between transition-all ${
                    isCurrent
                      ? "border-primary bg-primary/5 shadow-md shadow-primary/10 ring-1 ring-primary"
                      : "border-border bg-background/60"
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-sm">{t.name}</h3>
                      {isCurrent ? (
                        <span className="rounded bg-primary px-2 py-0.5 text-[9px] font-bold text-primary-foreground">
                          Current Plan
                        </span>
                      ) : null}
                    </div>
                    <div className="mt-3 flex items-baseline gap-1">
                      <span className="font-display text-3xl font-extrabold">{price}</span>
                      <span className="text-xs text-muted-foreground">{t.cadence}</span>
                    </div>
                    <p className="mt-1 text-xs font-semibold text-primary">{t.credits}</p>

                    <ul className="mt-4 space-y-2 border-t border-border/70 pt-4 text-xs">
                      {t.features.map((feat) => (
                        <li key={feat} className="flex items-start gap-2">
                          <Check className="size-3.5 shrink-0 text-emerald-500 mt-0.5" />
                          <span className="text-muted-foreground">{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <button
                    onClick={() => handleUpgradeTier(t.name as any)}
                    disabled={isCurrent}
                    className={`mt-6 w-full rounded-xl py-2 text-xs font-semibold transition-colors ${
                      isCurrent
                        ? "neu-inset cursor-default text-muted-foreground"
                        : "neu-press bg-primary text-primary-foreground hover:bg-primary/90"
                    }`}
                  >
                    {isCurrent ? "Active Plan" : `Switch to ${t.name}`}
                  </button>
                </div>
              );
            })}
          </div>
        </StaggerItem>

        <StaggerItem className="neu p-6 lg:col-span-2 min-w-0 overflow-hidden">
          <h2 className="font-display text-lg font-bold">{t("settings.appearance", "Appearance & Theme")}</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Switch between Warm Graphite (light) and Ambient Ray (dark) modes.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => setTheme("light")}
              className={cn(
                "flex items-center gap-2.5 rounded-xl px-4 py-2.5 text-xs font-semibold transition-all",
                theme === "light"
                  ? "bg-primary text-primary-foreground glow-primary"
                  : "neu-sm neu-press text-muted-foreground hover:text-foreground",
              )}
            >
              <Sun className="size-4" /> Light (Warm Graphite)
            </button>
            <button
              type="button"
              onClick={() => setTheme("dark")}
              className={cn(
                "flex items-center gap-2.5 rounded-xl px-4 py-2.5 text-xs font-semibold transition-all",
                theme === "dark"
                  ? "bg-primary text-primary-foreground glow-primary"
                  : "neu-sm neu-press text-muted-foreground hover:text-foreground",
              )}
            >
              <Moon className="size-4" /> Dark (Ambient Ray)
            </button>
          </div>
        </StaggerItem>

        <StaggerItem className="neu p-6 lg:col-span-2 min-w-0 overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-display text-lg font-bold">{t("settings.language", "Language & Multilingual Support")}</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {t("settings.languageDesc", "Set your primary language for navigation, blueprints, and AI recommendations.")}
              </p>
            </div>
            <LanguageSelector variant="button" />
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {SUPPORTED_LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                type="button"
                onClick={() => {
                  setLanguage(lang.code);
                  toast.success(`Language set to ${lang.name} (${lang.nativeName})`);
                }}
                className={cn(
                  "flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold transition-all",
                  getCurrentLanguage() === lang.code
                    ? "bg-primary text-primary-foreground shadow-xs glow-primary"
                    : "neu-sm neu-press text-muted-foreground hover:text-foreground",
                )}
              >
                <span>{lang.flag}</span>
                <span>{lang.nativeName}</span>
                <span className="text-[10px] opacity-70">({lang.name})</span>
              </button>
            ))}
          </div>
        </StaggerItem>

        <StaggerItem className="neu p-6 lg:col-span-2 min-w-0 overflow-hidden">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-bold">Export Defaults & Deliverables Bundle</h2>
            <span className="rounded-md bg-emerald-500/10 px-2.5 py-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
              7 Enterprise Formats Active
            </span>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Available deliverables automatically generated for <strong>{workspaceName || "the active problem statement"}</strong> in the Universal Export Center.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {[
              "Executive Board PDF Blueprint",
              "Microsoft Word Architecture Spec (.doc)",
              "Microsoft Excel Estimates & ROI (.xls)",
              "PowerPoint Executive Deck (.ppt)",
              `${dbBlueprint.domainId.toUpperCase()} OpenAPI 3.1 JSON`,
              "PostgreSQL 16 RLS DDL (.sql)",
              `${dbBlueprint.domainId.toUpperCase()} Domain Master CSV`,
            ].map((f, i) => (
              <span
                key={f}
                className={
                  i === 0
                    ? "rounded-full bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground"
                    : "neu-sm px-3 py-1.5 text-xs font-medium"
                }
              >
                {f}
              </span>
            ))}
          </div>
        </StaggerItem>
      </Stagger>

      <AiModelPaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        model={selectedModelForPayment}
        onSuccess={(m) => {
          setWallet(loadCreditWallet());
          setIsPaymentModalOpen(false);
          toast.success(`Successfully activated ${m.tierRequired} tier!`);
        }}
        currentRole={isSuperAdmin ? "admin" : "viewer"}
      />
    </AppShell>
  );
}
