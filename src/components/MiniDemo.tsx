import { AnimatePresence, motion } from "motion/react";
import { CornerDownLeft } from "lucide-react";
import { useState } from "react";

import { ThinkingDots, Typewriter } from "@/components/motion/primitives";
import { SAMPLE_PROBLEM } from "@/lib/demo-data";

const PREVIEW =
  "Framed: ~720 of your 1,200 daily contacts carry no decision content. Recommended path — intent triage in front of your helpdesk, with deterministic order-status and return-eligibility resolvers. I can generate the architecture, data model and a 6-week roadmap from here.";

export function MiniDemo() {
  const [value, setValue] = useState(SAMPLE_PROBLEM);
  const [phase, setPhase] = useState<"idle" | "thinking" | "answer">("idle");

  function run() {
    if (!value.trim()) return;
    setPhase("thinking");
    setTimeout(() => setPhase("answer"), 1900);
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
            <ThinkingDots label="Reading intake, extracting entities…" />
          </motion.div>
        ) : null}
        {phase === "answer" ? (
          <motion.div
            key="a"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 rounded-xl bg-card p-4"
          >
            <p className="text-xs font-semibold text-primary">BizzMitra</p>
            <p className="mt-1.5 text-sm leading-relaxed">
              <Typewriter text={PREVIEW} speed={14} />
            </p>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
