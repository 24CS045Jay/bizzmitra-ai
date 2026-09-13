import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { CheckCircle2, ChevronDown, ChevronUp, HelpCircle, ShieldCheck, Sparkles } from "lucide-react";
import type { BlueprintScoreResult } from "@/lib/risk-evaluator";

interface BlueprintConfidenceScoreProps {
  scoreResult: BlueprintScoreResult;
  className?: string;
}

export function BlueprintConfidenceScore({ scoreResult, className = "" }: BlueprintConfidenceScoreProps) {
  const [showDetails, setShowDetails] = useState(false);
  const { score, grade, improvementHint, breakdown } = scoreResult;

  const r = 36;
  const c = 2 * Math.PI * r;
  const strokeColor =
    score >= 80 ? "stroke-primary" : score >= 60 ? "stroke-amber-500" : "stroke-rose-500";

  return (
    <div className={`neu p-5 sm:p-6 transition-all ${className}`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
        <div className="flex items-center gap-4">
          <div className="relative grid size-20 shrink-0 place-items-center">
            <svg viewBox="0 0 88 88" className="size-20 -rotate-90">
              <circle
                cx="44"
                cy="44"
                r={r}
                fill="none"
                strokeWidth="7"
                className="stroke-muted/40"
              />
              <motion.circle
                cx="44"
                cy="44"
                r={r}
                fill="none"
                strokeWidth="7"
                strokeLinecap="round"
                className={strokeColor}
                strokeDasharray={c}
                initial={{ strokeDashoffset: c }}
                animate={{ strokeDashoffset: c - (c * score) / 100 }}
                transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="font-display text-lg font-extrabold tracking-tight">{score}%</span>
              <span className="text-[9px] uppercase tracking-wider font-semibold text-muted-foreground">
                Score
              </span>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-[0.16em] text-primary flex items-center gap-1">
                <ShieldCheck className="size-3.5" />
                Blueprint Confidence
              </span>
              <span className="neu-sm px-2 py-0.5 text-[10px] font-bold text-foreground">
                {grade}
              </span>
            </div>
            <h3 className="font-display text-base font-bold mt-0.5">
              Completeness & Feasibility Rating
            </h3>
            <p className="mt-1 text-xs text-muted-foreground leading-relaxed flex items-center gap-1.5">
              <Sparkles className="size-3 text-primary shrink-0" />
              <span>{improvementHint}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-center">
          <button
            type="button"
            onClick={() => setShowDetails(!showDetails)}
            className="neu-sm neu-press flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground"
          >
            <span>{showDetails ? "Hide breakdown" : "Score breakdown"}</span>
            {showDetails ? <ChevronUp className="size-3.5" /> : <ChevronDown className="size-3.5" />}
          </button>
        </div>
      </div>

      {/* Expandable Domain Audit Breakdown */}
      <AnimatePresence>
        {showDetails && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="mt-4 pt-4 border-t border-border/70 overflow-hidden"
          >
            <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
              {breakdown.map((item) => (
                <div
                  key={item.domain}
                  className={`neu-inset p-3 flex items-start justify-between gap-2 transition-colors ${
                    item.completed ? "border-emerald-500/20" : "border-amber-500/20"
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <p className="text-xs font-bold truncate">{item.domain}</p>
                    </div>
                    <p className="mt-0.5 text-[10px] text-muted-foreground leading-snug">
                      {item.completed ? "Locked & verified" : item.missingHint}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <span className="text-[10px] font-mono font-bold text-muted-foreground">
                      +{item.weight}%
                    </span>
                    {item.completed ? (
                      <CheckCircle2 className="size-4 text-emerald-500" />
                    ) : (
                      <HelpCircle className="size-4 text-amber-500" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
