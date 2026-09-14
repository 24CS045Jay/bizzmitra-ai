import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Check, Copy, Globe, Link2, Lock, Share2, Sparkles, X } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface ShareBlueprintModalProps {
  isOpen: boolean;
  onClose: () => void;
  blueprintId?: string;
  blueprintName?: string;
}

export function ShareBlueprintModal({
  isOpen,
  onClose,
  blueprintId = "default",
  blueprintName = "Executive Delivery Blueprint",
}: ShareBlueprintModalProps) {
  const [token, setToken] = useState<string>("");
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [expiryDays, setExpiryDays] = useState<number | null>(30);

  useEffect(() => {
    if (!isOpen) return;

    // Check if a share token already exists for this blueprint
    const existing = window.localStorage.getItem(`bizzmitra.share.${blueprintId}`);
    if (existing) {
      setToken(existing);
      return;
    }

    // Generate a clean public token
    const generated = "bp-" + Math.random().toString(36).substring(2, 10);
    setToken(generated);
  }, [isOpen, blueprintId]);

  async function handleCreateShare() {
    setLoading(true);
    try {
      const shareToken = token || "bp-" + Math.random().toString(36).substring(2, 10);
      const expiresAt = expiryDays
        ? new Date(Date.now() + expiryDays * 24 * 60 * 60 * 1000).toISOString()
        : null;

      // Persist to Supabase if valid workspace ID
      if (blueprintId && !blueprintId.startsWith("ws-") && blueprintId !== "default") {
        await supabase.from("blueprint_shares").insert({
          blueprint_id: blueprintId,
          token: shareToken,
          expires_at: expiresAt,
        });
      }

      window.localStorage.setItem(`bizzmitra.share.${blueprintId}`, shareToken);
      setToken(shareToken);

      const shareUrl = `${window.location.origin}/share/${shareToken}`;
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success("Public read-only link copied to clipboard!");
      setTimeout(() => setCopied(false), 2500);
    } catch {
      toast.error("Failed to generate share link");
    } finally {
      setLoading(false);
    }
  }

  if (!isOpen) return null;

  const shareUrl = typeof window !== "undefined" ? `${window.location.origin}/share/${token}` : "";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-foreground/35 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        className="neu bg-card w-full max-w-md overflow-hidden rounded-3xl border border-border p-6 shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div className="flex items-center gap-2.5">
            <div className="grid size-9 place-items-center rounded-xl bg-primary/10 text-primary">
              <Share2 className="size-5" />
            </div>
            <div>
              <h2 className="font-display text-lg font-extrabold text-foreground">
                Share Blueprint Link
              </h2>
              <p className="text-xs text-muted-foreground">Public, read-only view · No login required</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid size-8 place-items-center rounded-lg text-muted-foreground hover:bg-muted"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="mt-4 space-y-4">
          <p className="text-xs text-muted-foreground leading-relaxed">
            Anyone with this secure link can inspect the executive summary, delivery phases,
            architecture stack, and risk register for <span className="font-bold text-foreground">"{blueprintName}"</span>. All edit and generation controls are disabled.
          </p>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Link Expiration
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: "7 Days", val: 7 },
                { label: "30 Days", val: 30 },
                { label: "Never", val: null },
              ].map((opt) => (
                <button
                  key={opt.label}
                  type="button"
                  onClick={() => setExpiryDays(opt.val)}
                  className={`neu-sm py-1.5 text-xs font-bold transition-colors ${
                    expiryDays === opt.val
                      ? "bg-primary text-primary-foreground font-extrabold"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="neu-inset p-3 space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Public URL
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={shareUrl}
                className="w-full bg-transparent text-xs font-mono text-foreground outline-none select-all"
              />
              <button
                type="button"
                onClick={() => void handleCreateShare()}
                className="neu-press flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-bold text-primary-foreground shrink-0 glow-primary"
              >
                {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
                <span>{copied ? "Copied!" : "Copy Link"}</span>
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
            <Lock className="size-3.5 text-emerald-500 shrink-0" />
            <span>Encrypted read-only access. Edit permissions remain private to your account.</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
