import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  CreditCard,
  QrCode,
  Zap,
  ShieldCheck,
  CheckCircle2,
  X,
  Lock,
  Sparkles,
  ArrowRight,
  ShieldAlert,
  Loader2,
  Coins,
  Check,
} from "lucide-react";
import { toast } from "sonner";
import {
  AiModel,
  CreditWallet,
  loadCreditWallet,
  saveCreditWallet,
  saveActiveModel,
  UserRole,
  saveCurrentRole,
} from "@/lib/admin-rbac-data";

interface AiModelPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  model: AiModel | null;
  onSuccess: (upgradedModel: AiModel) => void;
  currentRole: UserRole;
}

export function AiModelPaymentModal({
  isOpen,
  onClose,
  model,
  onSuccess,
  currentRole,
}: AiModelPaymentModalProps) {
  const [activeTab, setActiveTab] = useState<"card" | "upi" | "instant">("card");
  const [processingState, setProcessingState] = useState<
    "idle" | "connecting" | "authorizing" | "capturing" | "success"
  >("idle");
  const [cardNumber, setCardNumber] = useState("4242 •••• •••• 4242");
  const [cardExpiry, setCardExpiry] = useState("12/28");
  const [cardCvc, setCardCvc] = useState("888");
  const [cardName, setCardName] = useState("Param Shah");
  const [upiId, setUpiId] = useState("param@okaxis");

  if (!isOpen || !model) return null;
  const targetModel = model;

  const priceFormatted = targetModel.tierRequired === "Enterprise Scale" ? "$199" : "$49";
  const creditsGranted = targetModel.tierRequired === "Enterprise Scale" ? 5000 : 1000;

  async function handleExecutePayment() {
    try {
      setProcessingState("connecting");
      await new Promise((r) => setTimeout(r, 650));

      setProcessingState("authorizing");
      await new Promise((r) => setTimeout(r, 750));

      setProcessingState("capturing");
      await new Promise((r) => setTimeout(r, 600));

      // 1. Upgrade Wallet
      const currentWallet: CreditWallet = loadCreditWallet();
      const upgradedTier =
        targetModel.tierRequired === "Enterprise Scale" ? "Enterprise Scale" : "Growth Pro";
      const newBalance = currentWallet.balance + creditsGranted;

      const upgradedWallet: CreditWallet = {
        ...currentWallet,
        tier: upgradedTier,
        balance: newBalance,
        monthlyQuota: currentWallet.monthlyQuota + creditsGranted,
        transactions: [
          {
            id: `tx-pay-${Date.now().toString().slice(-6)}`,
            description: `Real-time Subscription Payment: ${upgradedTier} (${priceFormatted}) — Unlocked ${targetModel.name}`,
            type: "credit",
            amount: creditsGranted,
            timestamp: "Just now",
            balanceAfter: newBalance,
          },
          ...currentWallet.transactions,
        ],
      };

      saveCreditWallet(upgradedWallet);

      // 2. Activate Model
      saveActiveModel(targetModel.id);

      setProcessingState("success");
      await new Promise((r) => setTimeout(r, 700));

      toast.success(
        `🎉 Payment of ${priceFormatted} Authorized! Upgraded to ${upgradedTier}. ${targetModel.name} is now active.`
      );
      onSuccess(targetModel);
      onClose();
    } catch {
      toast.error("Transaction failed to authorize. Please retry.");
      setProcessingState("idle");
    }
  }

  function handleSuperAdminBypass() {
    saveCurrentRole("admin");
    window.dispatchEvent(new CustomEvent("bizzmitra:role-changed", { detail: "admin" }));
    saveActiveModel(targetModel.id);
    toast.success(
      `🛡️ Super Admin Bypass: Session upgraded to Administrator. Switched to ${targetModel.name} without payment.`
    );
    onSuccess(targetModel);
    onClose();
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => processingState === "idle" && onClose()}
          className="fixed inset-0 bg-background/80 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 16 }}
          className="relative w-full max-w-xl overflow-hidden rounded-3xl border border-border/80 bg-card/95 shadow-2xl backdrop-blur-xl"
        >
          {/* Header Strip */}
          <div className="flex items-center justify-between border-b border-border/60 p-5">
            <div className="flex items-center gap-2.5">
              <div className="grid size-9 place-items-center rounded-xl bg-primary/10 text-primary">
                <Sparkles className="size-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-display text-base font-extrabold text-foreground">
                    Unlock {model.name}
                  </h3>
                  <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-bold text-primary">
                    {model.badge}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Real-time Payment Gateway Simulation • 256-Bit SSL Secured
                </p>
              </div>
            </div>

            {processingState === "idle" && (
              <button
                type="button"
                onClick={onClose}
                className="grid size-8 place-items-center rounded-lg text-muted-foreground hover:bg-muted/60 hover:text-foreground"
              >
                <X className="size-4" />
              </button>
            )}
          </div>

          <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
            {/* Model Target Details */}
            <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-primary">
                    Required Subscription Tier
                  </span>
                  <h4 className="font-display text-lg font-bold text-foreground">
                    {model.tierRequired} Plan
                  </h4>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {model.description}
                  </p>
                </div>
                <div className="text-right">
                  <span className="font-display text-2xl font-extrabold text-foreground">
                    {priceFormatted}
                  </span>
                  <span className="text-xs text-muted-foreground"> / month</span>
                </div>
              </div>

              {/* Perks grid */}
              <div className="mt-3 grid grid-cols-2 gap-2 border-t border-border/40 pt-3 text-[11px]">
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Coins className="size-3.5 text-primary shrink-0" />
                  <span>+{creditsGranted.toLocaleString()} AI Credits added</span>
                </div>
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Zap className="size-3.5 text-amber-500 shrink-0" />
                  <span>{model.costMultiplier}x Token Metering</span>
                </div>
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Check className="size-3.5 text-emerald-500 shrink-0" />
                  <span>High-Precision LLM Reasoning</span>
                </div>
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Check className="size-3.5 text-emerald-500 shrink-0" />
                  <span>Instant 1-Click Cancellation</span>
                </div>
              </div>
            </div>

            {/* Super Admin Bypass Callout (Testing Shortcut) */}
            <div className="flex items-center justify-between rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-3.5">
              <div className="flex items-center gap-2.5">
                <div className="grid size-8 shrink-0 place-items-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  <ShieldCheck className="size-4" />
                </div>
                <div>
                  <h5 className="text-xs font-bold text-emerald-700 dark:text-emerald-300">
                    Administrator & QA Testing Bypass
                  </h5>
                  <p className="text-[11px] text-muted-foreground">
                    Logged in as <span className="font-semibold text-foreground font-mono">{currentRole}</span>. Admins switch models with zero payment.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleSuperAdminBypass}
                disabled={processingState !== "idle"}
                className="neu-sm neu-press shrink-0 rounded-xl px-3 py-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 disabled:opacity-50"
              >
                Switch to Admin & Bypass
              </button>
            </div>

            {/* Payment Method Selector Tabs */}
            <div>
              <div className="flex rounded-xl bg-muted/40 p-1">
                <button
                  type="button"
                  onClick={() => setActiveTab("card")}
                  className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2 text-xs font-semibold transition-colors ${
                    activeTab === "card"
                      ? "bg-card text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <CreditCard className="size-3.5" />
                  Card (Stripe)
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("upi")}
                  className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2 text-xs font-semibold transition-colors ${
                    activeTab === "upi"
                      ? "bg-card text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <QrCode className="size-3.5" />
                  UPI / QR (India)
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("instant")}
                  className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2 text-xs font-semibold transition-colors ${
                    activeTab === "instant"
                      ? "bg-card text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Zap className="size-3.5 text-amber-500" />
                  1-Click Sandbox
                </button>
              </div>

              {/* Tab 1: Credit / Debit Card */}
              {activeTab === "card" && (
                <div className="mt-3.5 space-y-3 rounded-2xl border border-border/70 p-4">
                  <div>
                    <label className="text-[11px] font-semibold text-muted-foreground">Card Number</label>
                    <div className="neu-inset mt-1 flex items-center justify-between px-3 py-2">
                      <input
                        type="text"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        className="w-full bg-transparent text-xs font-mono outline-none"
                      />
                      <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[9px] font-bold text-primary">
                        TEST
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-semibold text-muted-foreground">Expires</label>
                      <div className="neu-inset mt-1 px-3 py-2">
                        <input
                          type="text"
                          value={cardExpiry}
                          onChange={(e) => setCardExpiry(e.target.value)}
                          className="w-full bg-transparent text-xs font-mono outline-none"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-muted-foreground">CVC</label>
                      <div className="neu-inset mt-1 px-3 py-2">
                        <input
                          type="text"
                          value={cardCvc}
                          onChange={(e) => setCardCvc(e.target.value)}
                          className="w-full bg-transparent text-xs font-mono outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-muted-foreground">Cardholder Name</label>
                    <div className="neu-inset mt-1 px-3 py-2">
                      <input
                        type="text"
                        value={cardName}
                        onChange={(e) => setCardName(e.target.value)}
                        className="w-full bg-transparent text-xs outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 2: UPI / QR Code */}
              {activeTab === "upi" && (
                <div className="mt-3.5 flex flex-col items-center justify-center rounded-2xl border border-border/70 p-5 text-center">
                  <div className="grid size-28 place-items-center rounded-2xl border-2 border-dashed border-primary/30 bg-primary/5 p-2">
                    <QrCode className="size-20 text-primary animate-pulse" />
                  </div>
                  <p className="mt-2.5 text-xs font-semibold text-foreground">
                    Scan with GPay, PhonePe, Paytm, or BHIM
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    Simulates dynamic NPCI UPI dynamic intent payload
                  </p>
                  <div className="mt-3 w-full max-w-xs">
                    <div className="neu-inset flex items-center justify-between px-3 py-2 text-xs">
                      <input
                        type="text"
                        value={upiId}
                        onChange={(e) => setUpiId(e.target.value)}
                        className="w-full bg-transparent font-mono text-xs outline-none"
                      />
                      <span className="text-[10px] font-bold text-primary">UPI</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 3: 1-Click Sandbox */}
              {activeTab === "instant" && (
                <div className="mt-3.5 rounded-2xl border border-border/70 p-4 text-center">
                  <div className="mx-auto grid size-12 place-items-center rounded-full bg-primary/10 text-primary">
                    <Zap className="size-6" />
                  </div>
                  <h5 className="mt-2.5 font-display text-sm font-bold text-foreground">
                    Instant Demo Gateway
                  </h5>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Immediately authorizes a simulated {priceFormatted} charge without requiring card or UPI credentials.
                  </p>
                </div>
              )}
            </div>

            {/* Live Progress Status Box */}
            {processingState !== "idle" && (
              <div className="rounded-2xl border border-primary/30 bg-primary/5 p-4 text-xs">
                <div className="flex items-center gap-3">
                  {processingState !== "success" ? (
                    <Loader2 className="size-5 animate-spin text-primary" />
                  ) : (
                    <CheckCircle2 className="size-5 text-emerald-500" />
                  )}
                  <div>
                    <p className="font-semibold text-foreground">
                      {processingState === "connecting" && "1/3. Connecting to Secure Payment Gateway..."}
                      {processingState === "authorizing" && "2/3. Authorizing 3D-Secure Transaction..."}
                      {processingState === "capturing" && "3/3. Payment Verified! Provisioning AI Model..."}
                      {processingState === "success" && "Done! Subscription active & model unlocked."}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      {processingState !== "success" ? "Real-time webhook callback in flight" : "Tenant updated"}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                disabled={processingState !== "idle"}
                className="neu-sm neu-press flex-1 rounded-2xl py-3 text-xs font-semibold text-muted-foreground disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleExecutePayment}
                disabled={processingState !== "idle"}
                className="neu-press flex-1 flex items-center justify-center gap-2 rounded-2xl bg-primary py-3 text-xs font-bold text-primary-foreground shadow-lg glow-primary disabled:opacity-50"
              >
                {processingState === "idle" ? (
                  <>
                    <Lock className="size-3.5" />
                    Pay {priceFormatted} & Unlock
                  </>
                ) : (
                  <>
                    <Loader2 className="size-3.5 animate-spin" />
                    Processing...
                  </>
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
