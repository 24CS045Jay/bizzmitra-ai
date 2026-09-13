import * as React from "react";
import { motion } from "framer-motion";
import { Sparkles, CheckCircle2, ArrowRight, Cpu } from "lucide-react";

interface ProcessStep {
  id: string;
  stepNumber: string;
  module: string;
  action: string;
  status: "active" | "completed" | "verified";
  latency: string;
}

const PROCESS_STEPS: ProcessStep[] = [
  {
    id: "step-1",
    stepNumber: "01",
    module: "Intake & Framing",
    action: "Synthesizing executive scope, target squad & OKR matrix",
    status: "verified",
    latency: "12ms",
  },
  {
    id: "step-2",
    stepNumber: "02",
    module: "Discovery Intelligence",
    action: "Mining interview transcripts & evaluating enterprise maturity",
    status: "completed",
    latency: "18ms",
  },
  {
    id: "step-3",
    stepNumber: "03",
    module: "Architecture Synthesizer",
    action: "Generating 5-layer system graph & entity relation diagrams",
    status: "verified",
    latency: "24ms",
  },
  {
    id: "step-4",
    stepNumber: "04",
    module: "Process Orchestration",
    action: "Modeling BPMN workflow lanes, SLAs & escalation thresholds",
    status: "completed",
    latency: "15ms",
  },
  {
    id: "step-5",
    stepNumber: "05",
    module: "Wireframe Blueprints",
    action: "Rendering tactile responsive components & adaptive density layouts",
    status: "completed",
    latency: "21ms",
  },
  {
    id: "step-6",
    stepNumber: "06",
    module: "Solution Studio CRM",
    action: "Compiling executable database schemas & real-time webhook routes",
    status: "active",
    latency: "9ms",
  },
  {
    id: "step-7",
    stepNumber: "07",
    module: "Delivery Roadmap",
    action: "Sequencing phased sprints, dependency graphs & resource budgets",
    status: "completed",
    latency: "16ms",
  },
  {
    id: "step-8",
    stepNumber: "08",
    module: "Artifact Compilation",
    action: "Exporting unified Markdown, Mermaid models & JSON data packs",
    status: "verified",
    latency: "8ms",
  },
];

export function LiveProcessStreamer({ className = "" }: { className?: string }) {
  // Duplicate steps to make an uninterrupted, seamless infinite horizontal loop
  const duplicatedSteps = [...PROCESS_STEPS, ...PROCESS_STEPS, ...PROCESS_STEPS];

  return (
    <div
      className={`relative w-full overflow-hidden border-y border-border/80 bg-surface/75 backdrop-blur-md dark:border-white/10 dark:bg-surface/80 neu-reflect ${className}`}
    >
      <div className="flex items-center">
        {/* Left Fixed Badge: Live Pulse and Engine Label */}
        <div className="z-20 flex shrink-0 items-center gap-2.5 border-r border-border/70 bg-surface/95 px-4 py-2.5 shadow-sm dark:bg-surface/95 sm:px-6">
          <span className="relative flex size-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
            <span className="relative inline-flex size-2.5 rounded-full bg-primary" />
          </span>
          <div className="flex items-center gap-1.5">
            <Cpu className="size-3.5 text-primary" />
            <span className="font-mono text-[11px] font-extrabold uppercase tracking-wider text-foreground whitespace-nowrap">
              Live AI Pipeline
            </span>
          </div>
          <span className="hidden rounded-full bg-primary/10 px-1.5 py-0.5 font-mono text-[9px] font-bold text-primary border border-primary/20 md:inline">
            Real-time
          </span>
        </div>

        {/* Marquee Ticker Track: Moving from Left to Right */}
        <div className="relative flex-1 overflow-hidden py-2">
          {/* Left Fade Gradient Mask */}
          <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-12 bg-gradient-to-r from-surface to-transparent dark:from-surface" />
          {/* Right Fade Gradient Mask */}
          <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-12 bg-gradient-to-l from-surface to-transparent dark:from-surface" />

          {/* Continuous Left-to-Right Horizontal Animation (Calm, Readable Speed) */}
          <motion.div
            animate={{ x: ["-50%", "0%"] }}
            transition={{
              duration: 90,
              ease: "linear",
              repeat: Infinity,
            }}
            className="flex items-center gap-5 will-change-transform w-max"
          >
            {duplicatedSteps.map((step, idx) => (
              <div
                key={`${step.id}-${idx}`}
                className="neu-reflect-hover flex items-center gap-3.5 rounded-full border border-border/70 bg-card/90 px-4 py-2 text-xs shadow-sm transition-all hover:scale-[1.03] hover:border-primary/50 hover:bg-card shrink-0"
              >
                {/* Step number badge */}
                <span className="grid size-5 shrink-0 place-items-center rounded-full bg-primary/15 font-mono text-[10px] font-black text-primary border border-primary/30">
                  {step.stepNumber}
                </span>

                {/* Module name & action */}
                <div className="flex items-center gap-2 whitespace-nowrap">
                  <span className="font-display font-bold text-foreground">
                    {step.module}
                  </span>
                  <span className="text-muted-foreground/60">·</span>
                  <span className="text-muted-foreground max-w-[360px] truncate text-xs font-medium">
                    {step.action}
                  </span>
                </div>

                {/* Latency badge */}
                <span className="rounded bg-surface-2 px-1.5 py-0.5 font-mono text-[9px] font-semibold text-muted-foreground">
                  {step.latency}
                </span>

                {/* Status tag */}
                {step.status === "active" ? (
                  <span className="flex items-center gap-1 rounded-full bg-primary/15 px-2 py-0.5 font-mono text-[9px] font-bold text-primary border border-primary/30">
                    <Sparkles className="size-2.5 animate-spin" />
                    <span>Processing</span>
                  </span>
                ) : (
                  <span className="flex items-center gap-1 rounded-full bg-sage/15 px-2 py-0.5 font-mono text-[9px] font-bold text-sage border border-sage/30">
                    <CheckCircle2 className="size-2.5" />
                    <span>Compiled</span>
                  </span>
                )}

                <ArrowRight className="size-3 text-muted-foreground/40 shrink-0 ml-1" />
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
