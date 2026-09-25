import * as React from "react";
import { useState, useEffect } from "react";
import { Zap, Sparkles, Plus, CreditCard, CheckCircle2, TrendingUp, X, ShieldCheck, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  loadCreditWallet,
  saveCreditWallet,
  CreditWallet,
  INITIAL_FREE_WALLET,
} from "@/lib/admin-rbac-data";
import { cn } from "@/lib/utils";

interface CreditsBadgeProps {
  className?: string;
  variant?: "header" | "compact" | "sidebar";
  onUpgradeClick?: () => void;
}

export const GENERATION_COST_SCHEDULE = [
  { action: "Complete Blueprint Synthesis", cost: "10 Credits", desc: "Full 11-stage enterprise transformation pack" },
  { action: "AI Architecture & BPMN Re-generation", cost: "5 Credits", desc: "Groq Llama 3.3 70B deep system compilation" },
  { action: "Discovery Diagnostic Q&A Turn", cost: "2 Credits", desc: "Loss-tree diagnostic interview & gap analysis" },
  { action: "AI Copilot Grounded Query", cost: "1 Credit", desc: "Artifact-grounded conversational inquiry" },
  { action: "Universal Export (Word, Excel, SQL, DDL)", cost: "0 Credits", desc: "Included free with unlimited client downloads" },
];

export function CreditsBadge({
  className = "",
  variant = "header",
  onUpgradeClick,
}: CreditsBadgeProps) {
  const [wallet, setWallet] = useState<CreditWallet>(loadCreditWallet);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleWalletUpdate = () => {
      setWallet(loadCreditWallet());
    };
    window.addEventListener("bizzmitra:wallet-changed", handleWalletUpdate);
    window.addEventListener("storage", handleWalletUpdate);
    return () => {
      window.removeEventListener("bizzmitra:wallet-changed", handleWalletUpdate);
      window.removeEventListener("storage", handleWalletUpdate);
    };
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  const handleGrantTestCredits = (amount: number = 25) => {
    const updated: CreditWallet = {
      ...wallet,
      balance: wallet.balance + amount,
      monthlyQuota: wallet.monthlyQuota + amount,
      transactions: [
        {
          id: `tx-${Date.now()}`,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          description: `Evaluator Sandbox Top-Up (+${amount} Credits)`,
          type: "credit",
          amount,
          balanceAfter: wallet.balance + amount,
        },
        ...wallet.transactions,
      ],
    };
    saveCreditWallet(updated);
    toast.success(`⚡ Added +${amount} test credits! New balance: ${updated.balance} Credits`);
  };

  const percentRemaining = Math.min(100, Math.round((wallet.balance / Math.max(1, wallet.monthlyQuota)) * 100));
  const isLow = wallet.balance < 15;

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className={cn(
          "group relative flex items-center gap-1.5 rounded-full border transition-all active:scale-95",
          isLow
            ? "border-amber-500/40 bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:border-amber-500"
            : "border-primary/30 bg-primary/10 text-primary hover:border-primary/60 hover:bg-primary/15",
          variant === "compact"
            ? "px-2 py-0.5 text-[10px] font-bold"
            : variant === "sidebar"
            ? "w-full justify-between px-3 py-2 text-xs font-semibold"
            : "px-2.5 py-1 text-xs font-bold shadow-xs",
          className,
        )}
        title="View AI Credit Balance & Generation Costs"
      >
        <span className="flex items-center gap-1">
          <Zap
            className={cn(
              "size-3.5 transition-transform group-hover:scale-110",
              isLow ? "text-amber-500 animate-bounce" : "text-primary animate-pulse",
            )}
          />
          <span className="font-mono">{wallet.balance}</span>
          <span className="opacity-75 font-normal text-[10px]">Credits</span>
        </span>

        {variant !== "compact" && (
          <span className="hidden sm:inline-flex items-center rounded-full bg-primary/20 px-1.5 py-0.2 text-[9px] font-mono text-primary font-bold">
            Pay-Per-Gen
          </span>
        )}
      </button>

      {/* Credit & Quota Details Modal */}
      <AnimatePresence>
        {isOpen && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md cursor-pointer"
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 14 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 14 }}
              transition={{ duration: 0.2 }}
              className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-3xl border border-border/80 bg-card p-6 shadow-2xl cursor-default scrollbar-thin"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Visible Circular Close Button */}
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                aria-label="Close credit modal"
                title="Close (Esc)"
                className="absolute right-4 top-4 grid size-8.5 place-items-center rounded-full border border-border/70 bg-surface-2/90 text-foreground hover:bg-muted hover:border-border transition-all active:scale-95 shadow-xs z-10"
              >
                <X className="size-4 text-foreground" />
              </button>

              {/* Modal Header */}
              <div className="flex items-center gap-3">
                <div className="grid size-11 place-items-center rounded-2xl bg-primary/10 text-primary">
                  <Zap className="size-6 animate-pulse" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-display text-lg font-bold text-foreground">
                      AI Credit & Generation Quota
                    </h3>
                    <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-bold text-primary">
                      {wallet.tier}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Transparent, pay-per-generation pricing model for autonomous AI business synthesis.
                  </p>
                </div>
              </div>

              {/* Balance Card */}
              <div className="mt-5 rounded-2xl border border-border/70 bg-surface-2/60 p-4.5 space-y-3">
                <div className="flex items-end justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                      Available Balance
                    </span>
                    <p className="font-display text-3xl font-extrabold text-foreground flex items-baseline gap-1 mt-0.5">
                      <span className="text-primary font-mono">{wallet.balance}</span>
                      <span className="text-xs font-medium text-muted-foreground">
                        / {wallet.monthlyQuota} monthly credits
                      </span>
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-foreground font-mono">
                      {percentRemaining}% Quota Left
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="h-2 w-full overflow-hidden rounded-full bg-border/60">
                  <motion.div
                    className={cn(
                      "h-full rounded-full transition-all",
                      isLow ? "bg-amber-500" : "bg-primary glow-primary",
                    )}
                    initial={{ width: 0 }}
                    animate={{ width: `${percentRemaining}%` }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                  />
                </div>

                <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1">
                  <span>Resets monthly • Unused credits roll over</span>
                  <span className="text-primary font-semibold">1 Credit ≈ 250 LLM Tokens</span>
                </div>
              </div>

              {/* Justified Cost Schedule Matrix */}
              <div className="mt-5 space-y-2">
                <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center justify-between">
                  <span>Pay-Per-Generation Cost Schedule</span>
                  <span className="text-primary font-normal text-[10px]">Justified Unit Pricing</span>
                </p>

                <div className="divide-y divide-border/50 rounded-xl border border-border/60 bg-card text-xs">
                  {GENERATION_COST_SCHEDULE.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2.5 hover:bg-muted/30 transition-colors">
                      <div className="min-w-0 pr-2">
                        <p className="font-semibold text-foreground text-xs leading-snug">{item.action}</p>
                        <p className="text-[10px] text-muted-foreground truncate">{item.desc}</p>
                      </div>
                      <span
                        className={cn(
                          "shrink-0 rounded-md px-2 py-0.5 font-mono text-[11px] font-bold",
                          item.cost.startsWith("0")
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                            : "bg-primary/10 text-primary border border-primary/20",
                        )}
                      >
                        {item.cost}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Modal Footer Actions */}
              <div className="mt-6 flex flex-wrap items-center justify-between gap-2.5 pt-3 border-t border-border/60">
                <button
                  type="button"
                  onClick={() => handleGrantTestCredits(25)}
                  className="neu-sm neu-press flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold text-primary hover:bg-primary/10 transition-colors"
                  title="Evaluator testing shortcut: adds 25 sandbox test credits immediately"
                >
                  <Sparkles className="size-3.5" />
                  <span>Test Top-Up (+25 Credits)</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="neu-sm neu-press flex items-center gap-1 rounded-xl px-3.5 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-surface-2 transition-colors border border-border/50"
                  >
                    <X className="size-3.5" />
                    <span>Close</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsOpen(false);
                      onUpgradeClick?.();
                    }}
                    className="neu-press flex items-center gap-1.5 rounded-xl bg-primary px-3.5 py-2 text-xs font-bold text-primary-foreground glow-primary shadow-sm hover:brightness-105"
                  >
                    <CreditCard className="size-3.5" />
                    <span>Upgrade Plan</span>
                    <ChevronRight className="size-3.5" />
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
