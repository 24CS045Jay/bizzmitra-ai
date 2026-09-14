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
} from "lucide-react";

import { AppShell } from "@/components/AppShell";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/primitives";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/hooks/useTheme";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import {
  CreditWallet,
  INITIAL_WALLET,
  loadCreditWallet,
  saveCreditWallet,
} from "@/lib/admin-rbac-data";

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
    price: "$0",
    cadence: "forever free",
    credits: "100 credits/mo",
    features: ["Single workspace", "Standard LLM intake", "Basic HLD export", "Community support"],
    highlight: false,
  },
  {
    name: "Growth Pro",
    price: "$49",
    cadence: "per seat / month",
    credits: "1,000 credits/mo",
    features: ["Unlimited workspaces", "Solution Studio customizer", "PostgreSQL DDL & REST APIs", "Executive pitch deck export", "Role-based access preview"],
    highlight: true,
  },
  {
    name: "Enterprise Scale",
    price: "$199",
    cadence: "per org / month",
    credits: "5,000 credits/mo",
    features: ["Dedicated compute cluster", "Custom BPMN 2.0 pipelines", "Full Git multi-tier versioning", "99.99% SLA guarantee", "SOC2 compliance attestation"],
    highlight: false,
  },
];

function SettingsPage() {
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();
  const [fullName, setFullName] = useState("");
  const [plan, setPlan] = useState("free");
  const [workspaceName, setWorkspaceName] = useState("");
  const [workspace, setWorkspace] = useState<{
    id: string;
    name: string;
    maturity_score: number;
  } | null>(null);

  const [wallet, setWallet] = useState<CreditWallet>(INITIAL_WALLET);

  useEffect(() => {
    setWallet(loadCreditWallet());
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
      setWorkspace(workspaceResult.data);
      setWorkspaceName(workspaceResult.data?.name ?? "");
    }
    void loadSettings();
  }, [user]);

  async function saveProfile() {
    if (!user) return;
    const { error } = await supabase.from("profiles").update({ full_name: fullName }).eq("id", user.id);
    if (error) toast.error(error.message);
    else toast.success("Profile updated");
  }

  async function renameWorkspace() {
    if (!workspace || !workspaceName.trim()) return;
    const { error } = await supabase
      .from("workspaces")
      .update({ name: workspaceName.trim() })
      .eq("id", workspace.id);
    if (error) toast.error(error.message);
    else {
      setWorkspace({ ...workspace, name: workspaceName.trim() });
      toast.success("Workspace renamed");
    }
  }

  function handleAddCredits(amount: number) {
    const updated: CreditWallet = {
      ...wallet,
      balance: wallet.balance + amount,
      transactions: [
        {
          id: `tx-${Date.now().toString().slice(-4)}`,
          description: `Instant AI Credit Top-Up (+${amount} credits)`,
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
    toast.success(`Added ${amount} credits to your balance! New balance: ${updated.balance}`);
  }

  function handleUpgradeTier(tierName: "Free Starter" | "Growth Pro" | "Enterprise Scale") {
    const updated: CreditWallet = {
      ...wallet,
      tier: tierName,
    };
    setWallet(updated);
    saveCreditWallet(updated);
    toast.success(`Your account has been switched to ${tierName}!`);
  }

  return (
    <AppShell>
      <Reveal>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Account & Billing</p>
        <h1 className="mt-2 font-display text-4xl font-extrabold sm:text-5xl">Settings & Monetization</h1>
      </Reveal>

      <Stagger className="mt-8 grid gap-4 lg:grid-cols-2">
        <StaggerItem className="neu p-6">
          <h2 className="font-display text-lg font-bold">Profile</h2>
          <dl className="mt-4 space-y-3 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Email</dt>
              <dd className="truncate font-medium">{user?.email ?? "—"}</dd>
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
              Save
            </button>
          </div>
        </StaggerItem>

        <StaggerItem className="neu p-6">
          <h2 className="font-display text-lg font-bold">Active workspace</h2>
          <dl className="mt-4 space-y-3 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Maturity</dt>
              <dd className="font-medium">{workspace?.maturity_score ?? 96}%</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Tenant Isolation</dt>
              <dd className="font-medium text-emerald-600 dark:text-emerald-400">PostgreSQL Row-Level Security</dd>
            </div>
          </dl>
          <div className="mt-5 flex gap-2">
            <input
              value={workspaceName}
              onChange={(event) => setWorkspaceName(event.target.value)}
              placeholder="Workspace name"
              className="neu-inset min-w-0 flex-1 px-3 py-2 text-sm outline-none"
            />
            <button onClick={renameWorkspace} className="neu-sm neu-press px-3 py-2 text-xs font-semibold">
              Rename
            </button>
          </div>
        </StaggerItem>

        {/* AI Credit Wallet Section */}
        <StaggerItem className="neu p-6 lg:col-span-2">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border/80 pb-4">
            <div className="flex items-center gap-3">
              <div className="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary">
                <Coins className="size-5" />
              </div>
              <div>
                <h2 className="font-display text-xl font-bold">AI Token & Credit Wallet</h2>
                <p className="text-xs text-muted-foreground">Live metering for LLM synthesis, solution regeneration, and blueprint exports.</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleAddCredits(250)}
                className="neu-sm neu-press flex items-center gap-1.5 px-3 py-2 text-xs font-semibold hover:text-primary"
              >
                <PlusCircle className="size-3.5 text-primary" /> +250 Credits ($10)
              </button>
              <button
                onClick={() => handleAddCredits(1000)}
                className="neu-press flex items-center gap-1.5 rounded-xl bg-primary px-3.5 py-2 text-xs font-semibold text-primary-foreground"
              >
                <Sparkles className="size-3.5" /> +1,000 Credits ($35)
              </button>
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
                <div key={tx.id} className="flex items-center justify-between p-3 text-xs">
                  <div className="flex items-center gap-2.5">
                    <span className={tx.type === "credit" ? "text-emerald-500 font-bold" : "text-amber-500 font-bold"}>
                      {tx.type === "credit" ? "+" : "—"}
                    </span>
                    <div>
                      <p className="font-semibold">{tx.description}</p>
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
        <StaggerItem className="neu p-6 lg:col-span-2">
          <div className="text-center max-w-xl mx-auto mb-6">
            <h2 className="font-display text-2xl font-extrabold">Subscription Plans & SaaS Tiers</h2>
            <p className="text-xs text-muted-foreground mt-1">
              Select the plan that fits your consultancy or enterprise transformation needs.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {TIERS.map((t) => {
              const isCurrent = wallet.tier === t.name;
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
                      <span className="font-display text-3xl font-extrabold">{t.price}</span>
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

        <StaggerItem className="neu p-6 lg:col-span-2">
          <h2 className="font-display text-lg font-bold">Appearance & Theme</h2>
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

        <StaggerItem className="neu p-6 lg:col-span-2">
          <h2 className="font-display text-lg font-bold">Export defaults</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Applied when you export any artifact from the chain.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {["PDF blueprint", "Word document", "PowerPoint deck", "Mermaid source"].map((f, i) => (
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
    </AppShell>
  );
}
