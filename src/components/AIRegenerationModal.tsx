import { AnimatePresence, motion } from "motion/react";
import {
  ArrowRight,
  Check,
  CheckCircle2,
  Cpu,
  Database,
  Layers,
  Loader2,
  Sparkles,
  Wand2,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";

import {
  loadStudioSettings,
  saveStudioSettings,
  type StudioSettings,
  type StudioVersionEntry,
} from "@/lib/solution-studio";
import { cn } from "@/lib/utils";

interface AIRegenerationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete?: (updatedSettings: StudioSettings) => void;
}

interface StepItem {
  id: number;
  label: string;
  detail: string;
  icon: React.ComponentType<{ className?: string }>;
}

const REGENERATION_STEPS: StepItem[] = [
  {
    id: 1,
    label: "Analyzing updated schema & field constraints…",
    detail: "Parsing custom attribute types, validation rules, and schema AST.",
    icon: Database,
  },
  {
    id: 2,
    label: "Adjusting data pipeline & type definitions…",
    detail: "Reconciling candidate model definitions and index maps.",
    icon: Cpu,
  },
  {
    id: 3,
    label: "Rebuilding CRM views & dynamic table columns…",
    detail: "Re-rendering interactive data grids, filters, and add candidate inputs.",
    icon: Layers,
  },
  {
    id: 4,
    label: "Applying theme accent & layout density…",
    detail: "Synthesizing neumorphic style tokens and zebra row rendering.",
    icon: Sparkles,
  },
];

export function AIRegenerationModal({ isOpen, onClose, onComplete }: AIRegenerationModalProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [nextVersion, setNextVersion] = useState("v1.1");
  const [changelogItems, setChangelogItems] = useState<string[]>([]);

  useEffect(() => {
    if (!isOpen) {
      setCurrentStep(0);
      setProgress(0);
      setIsFinished(false);
      return;
    }

    const currentSettings = loadStudioSettings();
    const currentVerNum = parseFloat(currentSettings.version.replace("v", "")) || 1.0;
    const computedNext = `v${(currentVerNum + 0.1).toFixed(1)}`;
    setNextVersion(computedNext);

    const generatedChanges: string[] = [
      `Integrated ${currentSettings.customFields.length} custom schema attributes (${currentSettings.customFields.map((f) => f.label).join(", ") || "Standard"}).`,
      `Applied ${currentSettings.accent} theme accent with ${currentSettings.density} table density.`,
      `Auto-generated reactive input fields for candidate creation modal.`,
    ];
    setChangelogItems(generatedChanges);

    // Multi-step animated progress progression
    let step = 0;
    const interval = setInterval(() => {
      step += 1;
      if (step <= REGENERATION_STEPS.length) {
        setCurrentStep(step);
        setProgress(Math.min(step * 25, 95));
      } else {
        clearInterval(interval);
        setProgress(100);
        setIsFinished(true);

        // Commit version update
        const newHistoryEntry: StudioVersionEntry = {
          version: computedNext,
          timestamp: new Date().toISOString().replace("T", " ").slice(0, 16),
          changes: generatedChanges,
        };

        const updated: StudioSettings = {
          ...currentSettings,
          version: computedNext,
          versionHistory: [newHistoryEntry, ...currentSettings.versionHistory],
        };

        saveStudioSettings(updated);
        onComplete?.(updated);
      }
    }, 700);

    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-foreground/40 backdrop-blur-md">
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: "spring", stiffness: 380, damping: 28 }}
          className="neu w-full max-w-lg p-6 overflow-hidden relative"
        >
          {/* Glowing Aura Background */}
          <div className="absolute -top-24 -left-24 size-48 rounded-full bg-primary/20 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 size-48 rounded-full bg-sage/20 blur-3xl pointer-events-none" />

          {/* Modal Header */}
          <div className="flex items-center justify-between mb-5 relative">
            <div className="flex items-center gap-3">
              <div className="grid size-11 place-items-center rounded-2xl bg-gradient-to-tr from-primary to-primary/80 text-primary-foreground shadow-md shadow-primary/25">
                <Wand2 className="size-5 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-display text-lg font-extrabold tracking-tight">
                    AI Regeneration Engine
                  </h3>
                  <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-bold text-primary">
                    {nextVersion}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Synthesizing custom attributes & UI into live CRM
                </p>
              </div>
            </div>

            {isFinished && (
              <button
                onClick={onClose}
                className="grid size-8 place-items-center rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="size-4" />
              </button>
            )}
          </div>

          {/* Progress Bar */}
          <div className="neu-inset p-1 rounded-full mb-6">
            <motion.div
              className="h-2 rounded-full bg-gradient-to-r from-primary to-sage transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Steps Pipeline */}
          <div className="space-y-3 mb-6">
            {REGENERATION_STEPS.map((step) => {
              const isCompleted = step.id < currentStep || isFinished;
              const isCurrent = step.id === currentStep && !isFinished;
              const Icon = step.icon;

              return (
                <motion.div
                  key={step.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: step.id * 0.1 }}
                  className={cn(
                    "neu-inset p-3 flex items-start gap-3 transition-all",
                    isCurrent && "ring-2 ring-primary/40 bg-primary/5",
                    isCompleted && "border-emerald-500/30",
                  )}
                >
                  <div
                    className={cn(
                      "grid size-7 place-items-center rounded-lg shrink-0 mt-0.5 transition-colors",
                      isCompleted && "bg-emerald-500 text-white",
                      isCurrent && "bg-primary text-primary-foreground animate-pulse",
                      !isCompleted && !isCurrent && "bg-muted text-muted-foreground opacity-50",
                    )}
                  >
                    {isCompleted ? (
                      <Check className="size-4" />
                    ) : isCurrent ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <Icon className="size-3.5" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p
                      className={cn(
                        "text-xs font-bold",
                        isCurrent && "text-primary",
                        isCompleted && "text-foreground",
                        !isCompleted && !isCurrent && "text-muted-foreground",
                      )}
                    >
                      {step.label}
                    </p>
                    <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug">
                      {step.detail}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Finished Confirmation Card */}
          {isFinished && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="neu p-4 rounded-xl bg-card border border-emerald-500/30 space-y-3"
            >
              <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-xs">
                <CheckCircle2 className="size-4 shrink-0" />
                <span>Solution successfully regenerated to {nextVersion}!</span>
              </div>
              <ul className="text-xs text-muted-foreground space-y-1 pl-6 list-disc">
                {changelogItems.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </motion.div>
          )}

          {/* Action Footer */}
          <div className="mt-6 flex items-center justify-end gap-2">
            {isFinished ? (
              <button
                onClick={onClose}
                className="neu-press w-full rounded-xl bg-primary px-5 py-3 text-xs font-bold text-primary-foreground shadow-lg flex items-center justify-center gap-2 hover:brightness-105"
              >
                <span>View Updated Live CRM</span>
                <ArrowRight className="size-4" />
              </button>
            ) : (
              <div className="w-full flex items-center justify-center gap-2 py-2 text-xs text-muted-foreground font-semibold">
                <Loader2 className="size-4 animate-spin text-primary" />
                <span>AI Engine is applying your schema changes…</span>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
