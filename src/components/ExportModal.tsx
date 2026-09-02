import { AnimatePresence, motion } from "motion/react";
import { Check, Download, FileSpreadsheet, FileText, Presentation, X } from "lucide-react";
import { useState } from "react";

import { ThinkingDots } from "@/components/motion/primitives";
import { cn } from "@/lib/utils";

const FORMATS = [
  { id: "pdf", label: "PDF", icon: FileText, note: "Board-ready document" },
  { id: "docx", label: "Word", icon: FileText, note: "Editable spec" },
  { id: "xlsx", label: "Excel", icon: FileSpreadsheet, note: "Estimates & endpoints" },
  { id: "pptx", label: "PowerPoint", icon: Presentation, note: "Steering-committee deck" },
];

const STAGES = ["Collecting artifacts", "Rendering diagrams", "Typesetting document", "Packaging file"];

export function ExportModal({
  open,
  onClose,
  artifactName,
}: {
  open: boolean;
  onClose: () => void;
  artifactName: string;
}) {
  const [format, setFormat] = useState("pdf");
  const [phase, setPhase] = useState<"idle" | "working" | "done">("idle");
  const [stage, setStage] = useState(0);

  function startExport() {
    setPhase("working");
    setStage(0);
    let i = 0;
    const id = setInterval(() => {
      i += 1;
      setStage(i);
      if (i >= STAGES.length) {
        clearInterval(id);
        setTimeout(() => setPhase("done"), 400);
      }
    }, 560);
  }

  function reset() {
    setPhase("idle");
    setStage(0);
    onClose();
  }

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-50 grid place-items-center bg-foreground/25 p-4 backdrop-blur-[2px]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={reset}
        >
          <motion.div
            className="w-full max-w-lg rounded-2xl bg-card p-6 shadow-lift sm:p-7"
            initial={{ opacity: 0, y: 18, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="font-display text-2xl font-bold">Export artifact</h3>
                <p className="mt-1 text-sm text-muted-foreground">{artifactName}</p>
              </div>
              <button
                onClick={reset}
                aria-label="Close export dialog"
                className="neu-sm neu-press grid size-9 place-items-center"
              >
                <X className="size-4" />
              </button>
            </div>

            {phase === "idle" ? (
              <>
                <div className="mt-6 grid grid-cols-2 gap-3">
                  {FORMATS.map((f) => (
                    <button
                      key={f.id}
                      onClick={() => setFormat(f.id)}
                      className={cn(
                        "flex items-start gap-3 rounded-xl p-3.5 text-left transition-all",
                        format === f.id ? "neu-inset" : "neu-sm neu-press",
                      )}
                    >
                      <f.icon
                        className={cn(
                          "mt-0.5 size-4",
                          format === f.id ? "text-primary" : "text-muted-foreground",
                        )}
                      />
                      <span>
                        <span className="block text-sm font-semibold">{f.label}</span>
                        <span className="block text-xs text-muted-foreground">{f.note}</span>
                      </span>
                    </button>
                  ))}
                </div>
                <button
                  onClick={startExport}
                  className="neu-press mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground"
                >
                  <Download className="size-4" />
                  Prepare export
                </button>
              </>
            ) : null}

            {phase === "working" ? (
              <div className="mt-6">
                <ThinkingDots label="Preparing your export" />
                <ul className="mt-5 space-y-2.5">
                  {STAGES.map((s, i) => (
                    <li key={s} className="flex items-center gap-3 text-sm">
                      <span
                        className={cn(
                          "grid size-5 place-items-center rounded-full border",
                          i < stage
                            ? "border-sage bg-sage text-sage-foreground"
                            : "border-border text-muted-foreground",
                        )}
                      >
                        {i < stage ? <Check className="size-3" /> : null}
                      </span>
                      <span className={i < stage ? "text-foreground" : "text-muted-foreground"}>
                        {s}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            {phase === "done" ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 text-center"
              >
                <div className="mx-auto grid size-14 place-items-center rounded-full bg-sage text-sage-foreground">
                  <Check className="size-6" />
                </div>
                <p className="mt-4 font-display text-xl font-bold">Export ready</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  bizzmitra-{artifactName.toLowerCase().replace(/\s+/g, "-")}.{format}
                </p>
                <button
                  onClick={reset}
                  className="neu-press mt-5 w-full rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground"
                >
                  Download
                </button>
              </motion.div>
            ) : null}
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
