import { createFileRoute } from "@tanstack/react-router";

import { AppShell } from "@/components/AppShell";
import { ArtifactHeader } from "@/components/ArtifactHeader";
import { GenerationSequence } from "@/components/GenerationSequence";
import { Mermaid } from "@/components/Mermaid";
import { Stagger, StaggerItem } from "@/components/motion/primitives";
import { GENERATION_STEPS, generateArtifact } from "@/lib/ai/generate-artifact";
import { NAV_FLOW_DIAGRAM, WIREFRAMES } from "@/lib/demo-data";

export const Route = createFileRoute("/workspace/wireframes")({
  head: () => ({
    meta: [
      { title: "AI UX designer — BizzMitra-AI" },
      { name: "description", content: "Screen inventory and navigation flow derived from the solution architecture." },
      { property: "og:title", content: "AI UX designer — BizzMitra-AI" },
      { property: "og:description", content: "Wireframe inventory and navigation flow for the whole build." },
    ],
  }),
  component: WireframesPage,
});

function WireframePlaceholder() {
  return (
    <div className="neu-inset flex h-36 flex-col gap-2 p-3">
      <div className="h-3 w-1/3 rounded bg-border" />
      <div className="flex flex-1 gap-2">
        <div className="w-1/3 rounded bg-border/60" />
        <div className="flex flex-1 flex-col gap-2">
          <div className="h-3 rounded bg-border/60" />
          <div className="h-3 w-4/5 rounded bg-border/60" />
          <div className="flex-1 rounded bg-border/40" />
        </div>
      </div>
    </div>
  );
}

function WireframesPage() {
  return (
    <AppShell>
      <ArtifactHeader id="wireframes" kicker="Step 06" title="UX wireframes" />

      <GenerationSequence steps={GENERATION_STEPS.ux} run={() => generateArtifact("ux")}>
        <Stagger className="space-y-6">
          <StaggerItem className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {WIREFRAMES.map((w) => (
              <div key={w.id} className="neu p-4">
                <WireframePlaceholder />
                <p className="mt-3 text-sm font-semibold">{w.name}</p>
                <p className="mt-1 text-xs text-muted-foreground">{w.note}</p>
              </div>
            ))}
          </StaggerItem>

          <StaggerItem className="neu overflow-x-auto p-6">
            <h2 className="font-display text-base font-bold">Navigation flow</h2>
            <div className="mt-4">
              <Mermaid chart={NAV_FLOW_DIAGRAM} />
            </div>
          </StaggerItem>
        </Stagger>
      </GenerationSequence>
    </AppShell>
  );
}
