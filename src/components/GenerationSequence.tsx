import { AnimatePresence, motion } from "motion/react";
import { AlertCircle, Check, RefreshCw } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";

import { ThinkingDots } from "@/components/motion/primitives";
import { cn } from "@/lib/utils";

/**
 * Shows an animated step list while real AI inference `run()` executes,
 * then fades the result in. Handles real LLM latency (2–10s) and retry states.
 */
export function GenerationSequence({
  steps,
  run,
  children,
  autoStart = true,
  className,
}: {
  steps: string[];
  run: () => Promise<unknown>;
  children: ReactNode;
  autoStart?: boolean;
  className?: string;
}) {
  const [done, setDone] = useState(false);
  const [active, setActive] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!autoStart) return;
    let alive = true;
    setError(null);
    setDone(false);
    setActive(0);

    // Adaptive step timing: pace steps across typical 3–6s inference
    const stepIntervalMs = 900;
    const id = setInterval(() => {
      setActive((a) => {
        // Hold on second-to-last step until promise resolves
        if (a < steps.length - 2) return a + 1;
        return a;
      });
    }, stepIntervalMs);

    const finish = () => {
      if (!alive) return;
      setActive(steps.length - 1);
      setTimeout(() => {
        if (alive) setDone(true);
      }, 350);
    };

    run()
      .then(finish)
      .catch((err) => {
        if (!alive) return;
        console.warn("[GenerationSequence] run failed:", err);
        setError(err?.message || "AI inference took longer than expected or encountered an error.");
      });

    return () => {
      alive = false;
      clearInterval(id);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoStart, attempt]);

  const handleRetry = () => {
    setAttempt((c) => c + 1);
  };

  const handleContinueFallback = () => {
    setDone(true);
  };

  return (
    <div className={className}>
      <AnimatePresence mode="wait">
        {!done ? (
          <motion.div
            key="steps"
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
            className="neu mx-auto max-w-md p-6"
          >
            {error ? (
              <div className="space-y-4 text-center">
                <div className="mx-auto grid size-10 place-items-center rounded-full bg-rose-500/10 text-rose-500">
                  <AlertCircle className="size-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-foreground">AI Generation Encountered an Issue</h4>
                  <p className="mt-1 text-xs text-muted-foreground">{error}</p>
                </div>
                <div className="flex items-center justify-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleRetry}
                    className="neu-press flex items-center gap-1.5 rounded-xl bg-primary px-3.5 py-2 text-xs font-bold text-primary-foreground hover:brightness-105"
                  >
                    <RefreshCw className="size-3.5" />
                    Retry Real AI Generation
                  </button>
                  <button
                    type="button"
                    onClick={handleContinueFallback}
                    className="neu-press rounded-xl border border-border px-3 py-2 text-xs font-medium text-muted-foreground hover:text-foreground"
                  >
                    View Sample Preview
                  </button>
                </div>
              </div>
            ) : (
              <>
                <ThinkingDots label="BizzMitra AI is synthesizing blueprint" />
                <ul className="mt-5 space-y-3">
                  {steps.map((s, i) => (
                    <li key={s} className="flex items-center gap-3 text-sm">
                      <span
                        className={cn(
                          "grid size-5 shrink-0 place-items-center rounded-full border transition-colors",
                          i < active
                            ? "border-sage bg-sage text-sage-foreground"
                            : i === active
                              ? "border-primary text-primary"
                              : "border-border text-muted-foreground",
                        )}
                      >
                        {i < active ? (
                          <Check className="size-3" />
                        ) : (
                          <motion.span
                            className="size-1.5 rounded-full bg-current"
                            animate={i === active ? { scale: [0.7, 1.3, 0.7] } : {}}
                            transition={{ duration: 1, repeat: Infinity }}
                          />
                        )}
                      </span>
                      <span
                        className={cn(
                          i <= active ? "text-foreground" : "text-muted-foreground",
                          i === active && "font-medium",
                        )}
                      >
                        {s}
                      </span>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="result"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

