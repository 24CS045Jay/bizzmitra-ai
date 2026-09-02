import { AnimatePresence, motion } from "motion/react";
import { Check, CornerDownLeft } from "lucide-react";
import { useEffect, useState } from "react";

import { ThinkingDots, Typewriter } from "@/components/motion/primitives";
import { SAMPLE_PROBLEM } from "@/lib/demo-data";
import { cn } from "@/lib/utils";

const STEPS = ["Reading input", "Identifying constraints", "Framing problem"];

const QUESTIONS = [
  "Of the ~1,200 daily contacts, roughly what share are order-status and return questions — and are those already tagged in your helpdesk?",
  "Which system holds the authoritative order and tracking record today, and can BizzMitra read it directly?",
];

export function MiniDemo() {
  const [value, setValue] = useState(SAMPLE_PROBLEM);
  const [phase, setPhase] = useState<"idle" | "thinking" | "answer">("idle");
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (phase !== "thinking") return;
    setStep(0);
    const id = setInterval(() => setStep((s) => s + 1), 400);
    const done = setTimeout(() => setPhase("answer"), 400 * STEPS.length + 200);
    return () => {
      clearInterval(id);
      clearTimeout(done);
    };
  }, [phase]);

  function run() {
    if (!value.trim()) return;
    setPhase("thinking");
  }

  return (
    <div className="neu p-5 sm:p-6">
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          Try it — describe a problem
        </p>
        <span className="rounded-full bg-sage/15 px-2 py-0.5 text-[10px] font-semibold text-sage">
          live preview
        </span>
      </div>

      <div className="neu-inset mt-4 p-3">
        <textarea
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            setPhase("idle");
          }}
          rows={3}
          aria-label="Describe your business problem"
          className="w-full resize-none bg-transparent text-sm leading-relaxed outline-none placeholder:text-muted-foreground"
          placeholder="Our support team is overwhelmed…"
        />
        <div className="mt-2 flex justify-end">
          <button
            onClick={run}
            className="neu-press flex items-center gap-2 rounded-lg bg-primary px-3.5 py-2 text-xs font-semibold text-primary-foreground"
          >
            Analyse <CornerDownLeft className="size-3.5" />
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {phase === "thinking" ? (
          <motion.div
            key="t"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-4"
          >
            <ThinkingDots label="Analysing…" />
            <ul className="mt-3 space-y-2">
              {STEPS.map((s, i) => (
                <li key={s} className="flex items-center gap-2.5 text-xs">
                  <span
                    className={cn(
                      "grid size-4 shrink-0 place-items-center rounded-full border transition-colors",
                      i < step
                        ? "border-sage bg-sage text-sage-foreground"
                        : i === step
                          ? "border-primary text-primary"
                          : "border-border text-muted-foreground",
                    )}
                  >
                    {i < step ? (
                      <Check className="size-2.5" />
                    ) : (
                      <motion.span
                        className="size-1 rounded-full bg-current"
                        animate={i === step ? { scale: [0.7, 1.4, 0.7] } : {}}
                        transition={{ duration: 0.9, repeat: Infinity }}
                      />
                    )}
                  </span>
                  <span className={i <= step ? "text-foreground" : "text-muted-foreground"}>{s}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        ) : null}
        {phase === "answer" ? (
          <motion.div
            key="a"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 space-y-3"
          >
            <div className="rounded-xl bg-card p-4">
              <p className="text-xs font-semibold text-primary">BizzMitra · discovery</p>
              <p className="mt-1.5 text-sm leading-relaxed">
                <Typewriter text={QUESTIONS[0]!} speed={14} />
              </p>
            </div>
            <motion.div
              className="rounded-xl bg-card p-4"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 2.2 }}
            >
              <p className="mt-0 text-sm leading-relaxed">
                <Typewriter text={QUESTIONS[1]!} speed={14} delay={2300} />
              </p>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
