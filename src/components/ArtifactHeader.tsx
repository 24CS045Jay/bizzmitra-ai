import { Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import { ArrowLeft, ArrowRight, Download, RefreshCw } from "lucide-react";
import { useState } from "react";

import { ExportModal } from "@/components/ExportModal";
import { cn } from "@/lib/utils";

export const CHAIN = [
  { id: "intake", label: "Intake", to: "/workspace/new" },
  { id: "discovery", label: "Discovery", to: "/workspace/discovery" },
  { id: "solution", label: "Framing & Solution", to: "/workspace/solution" },
  { id: "architecture", label: "Architecture", to: "/workspace/architecture" },
  { id: "process", label: "Process", to: "/workspace/process" },
  { id: "wireframes", label: "UX", to: "/workspace/wireframes" },
  { id: "data", label: "Data & APIs", to: "/workspace/data" },
  { id: "roadmap", label: "Roadmap", to: "/workspace/roadmap" },
] as const;

export function ArtifactHeader({
  id,
  title,
  kicker,
  onRegenerate,
}: {
  id: (typeof CHAIN)[number]["id"];
  title: string;
  kicker: string;
  onRegenerate?: () => void;
}) {
  const [exporting, setExporting] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const idx = CHAIN.findIndex((c) => c.id === id);
  const prev = CHAIN[idx - 1];
  const next = CHAIN[idx + 1];

  function regen() {
    setRegenerating(true);
    onRegenerate?.();
    setTimeout(() => setRegenerating(false), 2200);
  }

  return (
    <header className="mb-8">
      {/* Chain breadcrumb — the visible "connected workspace" motif */}
      <nav aria-label="Artifact chain" className="mb-6 overflow-x-auto pb-1">
        <ol className="flex items-center gap-1.5 whitespace-nowrap text-xs">
          {CHAIN.map((c, i) => (
            <li key={c.id} className="flex items-center gap-1.5">
              {i > 0 ? <span className="text-border">—</span> : null}
              <Link
                to={c.to}
                className={cn(
                  "rounded-full px-2.5 py-1 transition-colors",
                  c.id === id
                    ? "bg-primary font-semibold text-primary-foreground"
                    : i < idx
                      ? "text-foreground hover:bg-accent"
                      : "text-muted-foreground hover:bg-accent",
                )}
              >
                {c.label}
              </Link>
            </li>
          ))}
        </ol>
      </nav>

      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">{kicker}</p>
          <h1 className="mt-2 font-display text-4xl font-extrabold sm:text-5xl">{title}</h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={regen}
            className="neu-sm neu-press flex items-center gap-2 px-3.5 py-2.5 text-sm font-medium"
          >
            <motion.span
              animate={regenerating ? { rotate: 360 } : { rotate: 0 }}
              transition={regenerating ? { duration: 1, repeat: Infinity, ease: "linear" } : {}}
            >
              <RefreshCw className="size-4" />
            </motion.span>
            {regenerating ? "Regenerating" : "Regenerate"}
          </button>
          <button
            onClick={() => setExporting(true)}
            className="neu-press flex items-center gap-2 rounded-xl bg-primary px-3.5 py-2.5 text-sm font-semibold text-primary-foreground"
          >
            <Download className="size-4" />
            Export
          </button>
        </div>
      </div>

      <ExportModal open={exporting} onClose={() => setExporting(false)} artifactName={title} />

      <div className="mt-6 flex items-center justify-between text-sm">
        {prev ? (
          <Link to={prev.to} className="flex items-center gap-1.5 text-muted-foreground hover:text-primary">
            <ArrowLeft className="size-3.5" /> {prev.label}
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link to={next.to} className="flex items-center gap-1.5 font-medium text-primary">
            {next.label} <ArrowRight className="size-3.5" />
          </Link>
        ) : null}
      </div>
    </header>
  );
}
