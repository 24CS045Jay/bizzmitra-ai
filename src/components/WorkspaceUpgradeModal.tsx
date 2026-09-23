import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Lock,
  Sparkles,
  Zap,
  CheckCircle2,
  X,
  ArrowRight,
  ShieldCheck,
  Building2,
  ExternalLink,
  Layers,
  Check,
} from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { useAuth, isTestingAccount } from "@/hooks/useAuth";
import {
  loadCreditWallet,
  saveCreditWallet,
  CreditWallet,
  isSuperAdminEmail,
} from "@/lib/admin-rbac-data";
import { initiateRazorpayPayment } from "@/lib/razorpay";

interface WorkspaceUpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  workspaceCount?: number;
  onUpgradeSuccess?: () => void;
}

export function WorkspaceUpgradeModal({
  isOpen,
  onClose,
  workspaceCount = 1,
  onUpgradeSuccess,
}: WorkspaceUpgradeModalProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [upgrading, setUpgrading] = useState(false);

  const isSuperAdmin = isSuperAdminEmail(user?.email);
  const isTest = isTestingAccount(user?.email);

  if (!isOpen) return null;

  async function handleInstantUpgrade() {
    setUpgrading(true);

    // Bypass payment for Super Admins and Demo Testers
    if (isSuperAdmin || isTest) {
      const currentWallet = loadCreditWallet();
      const updated: CreditWallet = {
        ...currentWallet,
        tier: "Growth Pro",
        balance: currentWallet.balance + 1000,
        monthlyQuota: currentWallet.monthlyQuota + 1000,
        transactions: [
          {
            id: `tx-upgrade-${Date.now().toString().slice(-6)}`,
            description: "Admin Plan Upgrade: Growth Pro (Unlimited Workspaces Unlocked)",
            type: "credit",
            amount: 1000,
            timestamp: "Just now",
            balanceAfter: currentWallet.balance + 1000,
          },
          ...currentWallet.transactions,
        ],
      };
      saveCreditWallet(updated);
      toast.success("🎉 Upgraded to Growth Pro! Unlimited workspaces unlocked.");
      setUpgrading(false);
      onUpgradeSuccess?.();
      onClose();
      return;
    }

    try {
      await initiateRazorpayPayment({
        amountInRupees: 3999,
        planName: "Growth Pro (Unlimited Workspaces)",
        creditsGranted: 1000,
        customerName:
          (user?.user_metadata as Record<string, any> | undefined)?.["full_name"] ||
          user?.email?.split("@")[0] ||
          "Valued Customer",
        customerEmail: user?.email || undefined,
        onSuccess: (resp) => {
          const currentWallet = loadCreditWallet();
          const updated: CreditWallet = {
            ...currentWallet,
            tier: "Growth Pro",
            balance: currentWallet.balance + 1000,
            monthlyQuota: currentWallet.monthlyQuota + 1000,
            transactions: [
              {
                id: `tx-upgrade-${Date.now().toString().slice(-6)}`,
                description: `Razorpay Payment (${resp.razorpay_payment_id}): Growth Pro Upgrade (₹3,999)`,
                type: "credit",
                amount: 1000,
                timestamp: "Just now",
                balanceAfter: currentWallet.balance + 1000,
              },
              ...currentWallet.transactions,
            ],
          };
          saveCreditWallet(updated);
          toast.success("🎉 Payment confirmed! You now have Growth Pro with unlimited workspaces.");
          onUpgradeSuccess?.();
          onClose();
        },
        onDismiss: () => {
          toast.info("Upgrade checkout dismissed.");
          setUpgrading(false);
        },
      });
    } catch (err: any) {
      toast.error(err?.message || "Failed to initialize payment gateway.");
      setUpgrading(false);
    }
  }

  function handleGoToSettings() {
    onClose();
    navigate({ to: "/settings" });
  }

  function handleGoToWorkspaces() {
    onClose();
    navigate({ to: "/dashboard" });
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-background/80 backdrop-blur-md transition-opacity"
        />

        {/* Dialog Box */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 16 }}
          transition={{ duration: 0.22, ease: "easeOut" }}
          className="neu relative z-10 w-full max-w-xl overflow-hidden rounded-3xl border border-primary/20 bg-card p-6 sm:p-8 shadow-2xl shadow-primary/10"
        >
          {/* Close Icon Button */}
          <button
            type="button"
            onClick={onClose}
            className="absolute right-5 top-5 rounded-full p-2 text-muted-foreground hover:bg-muted/70 hover:text-foreground transition-colors"
            aria-label="Close dialog"
          >
            <X className="size-4" />
          </button>

          {/* Badge & Title */}
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/15 border border-amber-500/30 px-3 py-1 text-[11px] font-bold text-amber-600 dark:text-amber-400">
              <Lock className="size-3" />
              Basic Plan Limit Reached
            </span>
          </div>

          <h2 className="mt-3 font-display text-2xl font-extrabold sm:text-3xl text-foreground tracking-tight">
            Upgrade your plan to create another workspace
          </h2>

          <p className="mt-2 text-xs sm:text-sm text-muted-foreground leading-relaxed">
            In the <strong className="text-foreground">Basic (Free Starter) plan</strong>, you are allowed to create{" "}
            <strong className="text-primary font-bold">only one workspace</strong>. You currently have{" "}
            <span className="font-semibold text-foreground">{workspaceCount} active workspace</span>. Upgrade to unlock
            unlimited business blueprints, collaborative architectures, and full exports.
          </p>

          {/* Usage Meter Card */}
          <div className="mt-5 rounded-2xl border border-border/80 bg-muted/40 p-4">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-muted-foreground flex items-center gap-1.5">
                <Building2 className="size-3.5 text-primary" />
                Workspaces Quota (Basic Plan)
              </span>
              <span className="font-bold text-amber-600 dark:text-amber-400">
                {workspaceCount} / 1 Used (100%)
              </span>
            </div>
            <div className="mt-2.5 h-2 w-full overflow-hidden rounded-full bg-border">
              <div className="h-full w-full rounded-full bg-gradient-to-r from-amber-500 to-rose-500" />
            </div>
            <p className="mt-2 text-[11px] text-muted-foreground">
              Maximum 1 active workspace allowed on Free Starter. Need more? Switch to Growth Pro.
            </p>
          </div>

          {/* Upgrade Tier Highlights */}
          <div className="mt-5 rounded-2xl border-2 border-primary/40 bg-primary/5 p-4 sm:p-5 relative overflow-hidden">
            <div className="absolute right-3 top-3">
              <span className="rounded-full bg-primary px-2.5 py-0.5 text-[10px] font-extrabold text-primary-foreground uppercase tracking-wide">
                Recommended
              </span>
            </div>

            <div className="flex items-baseline gap-2">
              <h3 className="font-display text-lg font-bold text-foreground">Growth Pro</h3>
              <span className="font-display text-2xl font-black text-primary">₹3,999</span>
              <span className="text-xs text-muted-foreground">/ month</span>
            </div>

            <ul className="mt-3.5 space-y-2 text-xs">
              <li className="flex items-center gap-2 font-medium text-foreground">
                <Check className="size-4 shrink-0 text-emerald-500" />
                <span>
                  <strong>Unlimited Workspaces</strong> — create as many client & initiative blueprints as needed
                </span>
              </li>
              <li className="flex items-center gap-2 text-muted-foreground">
                <Check className="size-4 shrink-0 text-emerald-500" />
                <span><strong>1,000 AI Credits/month</strong> for full Solution Studio regeneration</span>
              </li>
              <li className="flex items-center gap-2 text-muted-foreground">
                <Check className="size-4 shrink-0 text-emerald-500" />
                <span>PostgreSQL DDL, REST OpenAPI 3.0 & Executive Pitch Deck exports</span>
              </li>
              <li className="flex items-center gap-2 text-muted-foreground">
                <Check className="size-4 shrink-0 text-emerald-500" />
                <span>Multi-tier Artifact Map & automated consistency audit</span>
              </li>
            </ul>
          </div>

          {/* Action CTAs */}
          <div className="mt-6 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <button
              type="button"
              onClick={handleInstantUpgrade}
              disabled={upgrading}
              className="neu-press flex-1 flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-xs sm:text-sm font-bold text-primary-foreground glow-primary shadow-md hover:brightness-105 transition-all disabled:opacity-50"
            >
              <Zap className="size-4" />
              <span>{upgrading ? "Processing Upgrade..." : "Upgrade to Growth Pro Now"}</span>
              <ArrowRight className="size-4 ml-0.5" />
            </button>

            <button
              type="button"
              onClick={handleGoToSettings}
              className="neu-sm neu-press flex items-center justify-center gap-1.5 rounded-xl border border-border px-4 py-3 text-xs font-semibold text-foreground hover:bg-muted/60 transition-colors"
            >
              <span>View All Plans</span>
              <ExternalLink className="size-3.5 text-muted-foreground" />
            </button>
          </div>

          {/* Dismiss button */}
          <div className="mt-3 text-center">
            <button
              type="button"
              onClick={handleGoToWorkspaces}
              className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-4 transition-colors"
            >
              Return to my existing workspace
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
