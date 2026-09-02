import { createFileRoute } from "@tanstack/react-router";

import { AppShell } from "@/components/AppShell";
import { ArtifactHeader } from "@/components/ArtifactHeader";
import { GenerationSequence } from "@/components/GenerationSequence";
import { Mermaid } from "@/components/Mermaid";
import { Stagger, StaggerItem } from "@/components/motion/primitives";
import { GENERATION_STEPS, generateArtifact } from "@/lib/ai/generate-artifact";
import { API_ENDPOINTS, ER_DIAGRAM } from "@/lib/demo-data";

export const Route = createFileRoute("/workspace/data")({
  head: () => ({
    meta: [
      { title: "Data model & API surface — BizzMitra-AI" },
      { name: "description", content: "Entity relationship model and the REST endpoints your team will actually build." },
      { property: "og:title", content: "Data model & API surface — BizzMitra-AI" },
      { property: "og:description", content: "ER model plus the REST surface, derived from the architecture." },
    ],
  }),
  component: DataPage,
});

const METHOD_TONE: Record<string, string> = {
  GET: "bg-sage/15 text-sage",
  POST: "bg-primary/12 text-primary",
};

function DataPage() {
  return (
    <AppShell>
      <ArtifactHeader id="data" kicker="Step 07" title="Data & APIs" />

      <GenerationSequence steps={GENERATION_STEPS.data} run={() => generateArtifact("data")}>
        <Stagger className="space-y-6">
          <StaggerItem className="neu overflow-x-auto p-6">
            <h2 className="font-display text-base font-bold">Entity relationship model</h2>
            <div className="mt-4">
              <Mermaid chart={ER_DIAGRAM} />
            </div>
          </StaggerItem>

          <StaggerItem className="neu p-6">
            <h2 className="font-display text-base font-bold">API surface</h2>
            <div className="mt-4 space-y-2">
              {API_ENDPOINTS.map((e) => (
                <div
                  key={e.path}
                  className="neu-inset flex flex-wrap items-center gap-3 px-4 py-3 text-sm"
                >
                  <span
                    className={`rounded px-2 py-0.5 font-mono text-[10px] font-bold ${
                      METHOD_TONE[e.method] ?? "bg-muted text-muted-foreground"
                    }`}
                  >
                    {e.method}
                  </span>
                  <code className="font-mono text-xs font-semibold">{e.path}</code>
                  <span className="min-w-40 flex-1 text-xs text-muted-foreground">{e.desc}</span>
                  <span className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                    {e.auth}
                  </span>
                </div>
              ))}
            </div>
          </StaggerItem>
        </Stagger>
      </GenerationSequence>
    </AppShell>
  );
}
