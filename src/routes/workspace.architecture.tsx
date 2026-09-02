import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

import { AppShell } from "@/components/AppShell";
import { ArtifactHeader } from "@/components/ArtifactHeader";
import { GenerationSequence } from "@/components/GenerationSequence";
import { Mermaid } from "@/components/Mermaid";
import { Stagger, StaggerItem } from "@/components/motion/primitives";
import { GENERATION_STEPS, generateArtifact } from "@/lib/ai/generate-artifact";
import { HLD_DIAGRAM, LLD_DIAGRAM, SOLUTION } from "@/lib/demo-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/workspace/architecture")({
  head: () => ({
    meta: [
      { title: "Architecture blueprint — BizzMitra-AI" },
      { name: "description", content: "High-level and low-level architecture diagrams generated from the framed problem." },
      { property: "og:title", content: "Architecture blueprint — BizzMitra-AI" },
      { property: "og:description", content: "HLD and LLD diagrams, generated not hand-drawn." },
    ],
  }),
  component: ArchitecturePage,
});

function ArchitecturePage() {
  const [tab, setTab] = useState<"hld" | "lld">("hld");

  return (
    <AppShell>
      <ArtifactHeader id="architecture" kicker="Step 04" title="Architecture" />

      <GenerationSequence
        steps={GENERATION_STEPS.architecture}
        run={() => generateArtifact("architecture")}
      >
        <Stagger className="space-y-6">
          <StaggerItem>
            <div className="neu-sm inline-flex gap-1 p-1">
              {(["hld", "lld"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={cn(
                    "rounded-lg px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] transition-colors",
                    tab === t ? "bg-primary text-primary-foreground" : "text-muted-foreground",
                  )}
                >
                  {t === "hld" ? "High level" : "Low level"}
                </button>
              ))}
            </div>
          </StaggerItem>

          <StaggerItem className="neu overflow-x-auto p-6">
            <Mermaid chart={tab === "hld" ? HLD_DIAGRAM : LLD_DIAGRAM} />
          </StaggerItem>

          <StaggerItem className="neu p-6">
            <h2 className="font-display text-base font-bold">Component rationale</h2>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {SOLUTION.stack.map((s) => (
                <div key={s.layer} className="neu-inset px-4 py-3">
                  <p className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">{s.layer}</p>
                  <p className="mt-0.5 text-sm font-semibold">{s.choice}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{s.why}</p>
                </div>
              ))}
            </div>
          </StaggerItem>
        </Stagger>
      </GenerationSequence>
    </AppShell>
  );
}
