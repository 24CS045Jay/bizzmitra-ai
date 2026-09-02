import { createFileRoute } from "@tanstack/react-router";

import { AppShell } from "@/components/AppShell";
import { ArtifactHeader } from "@/components/ArtifactHeader";
import { GenerationSequence } from "@/components/GenerationSequence";
import { Mermaid } from "@/components/Mermaid";
import { CountUp, Stagger, StaggerItem } from "@/components/motion/primitives";
import { GENERATION_STEPS, generateArtifact } from "@/lib/ai/generate-artifact";
import { AUTOMATION_OPPS, BPMN_AFTER, BPMN_BEFORE, SWIMLANE_DIAGRAM } from "@/lib/demo-data";

export const Route = createFileRoute("/workspace/process")({
  head: () => ({
    meta: [
      { title: "Process intelligence — BizzMitra-AI" },
      { name: "description", content: "Before and after process models with swimlanes and the automation opportunities between them." },
      { property: "og:title", content: "Process intelligence — BizzMitra-AI" },
      { property: "og:description", content: "As-is versus to-be process, modelled side by side." },
    ],
  }),
  component: ProcessPage,
});

function ProcessPage() {
  return (
    <AppShell>
      <ArtifactHeader id="process" kicker="Step 05" title="Process model" />

      <GenerationSequence steps={GENERATION_STEPS.process} run={() => generateArtifact("process")}>
        <Stagger className="space-y-6">
          <StaggerItem className="grid gap-4 lg:grid-cols-2">
            <div className="neu overflow-x-auto p-5">
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                As-is — 14h average
              </p>
              <div className="mt-4">
                <Mermaid chart={BPMN_BEFORE} />
              </div>
            </div>
            <div className="neu overflow-x-auto p-5">
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-sage">
                To-be — 40s / 3.1h
              </p>
              <div className="mt-4">
                <Mermaid chart={BPMN_AFTER} />
              </div>
            </div>
          </StaggerItem>

          <StaggerItem className="neu overflow-x-auto p-6">
            <h2 className="font-display text-base font-bold">Swimlanes</h2>
            <div className="mt-4">
              <Mermaid chart={SWIMLANE_DIAGRAM} />
            </div>
          </StaggerItem>

          <StaggerItem className="neu p-6">
            <h2 className="font-display text-base font-bold">Automation opportunities</h2>
            <div className="mt-4 space-y-3">
              {AUTOMATION_OPPS.map((o) => (
                <div key={o.name} className="neu-inset px-4 py-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-semibold">{o.name}</span>
                    <span className="text-muted-foreground">
                      <CountUp to={o.volume} /> / day · {Math.round(o.confidence * 100)}% conf.
                    </span>
                  </div>
                  <div className="neu-inset mt-2 h-1.5 overflow-hidden rounded-full p-0">
                    <div
                      className="h-full rounded-full bg-primary"
                      style={{ width: `${o.confidence * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </StaggerItem>
        </Stagger>
      </GenerationSequence>
    </AppShell>
  );
}
