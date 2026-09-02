import { AnimatePresence, motion } from "motion/react";
import { Check } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";

import { ThinkingDots } from "@/components/motion/primitives";
import { cn } from "@/lib/utils";

/**
 * Shows an animated step list while `generate` runs, then fades the result in.
 * `generate` is always the mock `generateArtifact()` — swap-safe.
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

  useEffect(() => {
    if (!autoStart) return;
    let alive = true;
    const stepMs = 620;
    const id = setInterval(() => {
      setActive((a) => Math.min(a + 1, steps.length - 1));
    }, stepMs);
    run().then(() => {
      if (!alive) return;
      setActive(steps.length - 1);
      setTimeout(() => alive && setDone(true), 260);
    });
    return () => {
      alive = false;
      clearInterval(id);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoStart]);

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
            <ThinkingDots label="BizzMitra is working" />
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
