import { createFileRoute } from "@tanstack/react-router";
import { Check, X } from "lucide-react";

import { AppShell } from "@/components/AppShell";
import { ArtifactHeader } from "@/components/ArtifactHeader";
import { GenerationSequence } from "@/components/GenerationSequence";
import { Stagger, StaggerItem } from "@/components/motion/primitives";
import { GENERATION_STEPS, generateArtifact } from "@/lib/ai/generate-artifact";
import { PROBLEM_FRAMING, SOLUTION } from "@/lib/demo-data";

export const Route = createFileRoute("/workspace/solution")({
  head: () => ({
    meta: [
      { title: "Problem framing & solution — BizzMitra-AI" },
      { name: "description", content: "Root causes, constraints, quantified impact and the recommended solution with rejected options." },
      { property: "og:title", content: "Problem framing & solution — BizzMitra-AI" },
      { property: "og:description", content: "The recommended approach, and why the alternatives lost." },
    ],
  }),
  component: SolutionPage,
});

function SolutionPage() {
  return (
    <AppShell>
      <ArtifactHeader id="solution" kicker="Step 03" title="Framing & solution" />

      <GenerationSequence
        steps={GENERATION_STEPS.solution}
        run={() => generateArtifact("solution")}
      >
        <Stagger className="space-y-6">
          <StaggerItem className="neu p-6">
            <h2 className="font-display text-lg font-bold">Framed problem</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              {PROBLEM_FRAMING.statement}
            </p>
            <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {PROBLEM_FRAMING.impact.map((m) => (
                <div key={m.metric} className="neu-inset px-4 py-3">
                  <p className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">{m.metric}</p>
                  <p className="mt-1 font-display text-xl font-extrabold">{m.value}</p>
                </div>
              ))}
            </div>
          </StaggerItem>

          <StaggerItem className="grid gap-4 lg:grid-cols-2">
            <div className="neu p-6">
              <h3 className="font-display text-base font-bold">Root causes</h3>
              <ul className="mt-3 space-y-3">
                {PROBLEM_FRAMING.rootCauses.map((r) => (
                  <li key={r.title}>
                    <p className="text-sm font-semibold">{r.title}</p>
                    <p className="text-xs text-muted-foreground">{r.detail}</p>
                  </li>
                ))}
              </ul>
            </div>
            <div className="neu p-6">
              <h3 className="font-display text-base font-bold">Constraints</h3>
              <ul className="mt-3 space-y-2.5 text-sm text-muted-foreground">
                {PROBLEM_FRAMING.constraints.map((c) => (
                  <li key={c} className="flex gap-2">
                    <span className="mt-2 size-1.5 shrink-0 rounded-full bg-clay" />
                    {c}
                  </li>
                ))}
              </ul>
            </div>
          </StaggerItem>

          <StaggerItem className="neu p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">Recommended</p>
            <h2 className="mt-1.5 font-display text-2xl font-extrabold">{SOLUTION.headline}</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{SOLUTION.summary}</p>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {SOLUTION.pillars.map((p) => (
                <div key={p.title} className="neu-inset px-4 py-3.5">
                  <p className="text-sm font-semibold">{p.title}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{p.detail}</p>
                </div>
              ))}
            </div>
          </StaggerItem>

          <StaggerItem className="neu p-6">
            <h3 className="font-display text-base font-bold">Options considered</h3>
            <div className="mt-3 space-y-3">
              {SOLUTION.tradeoffs.map((t) => {
                const good = t.verdict === "Recommended";
                return (
                  <div key={t.option} className="neu-inset flex gap-3 px-4 py-3.5">
                    <span
                      className={`mt-0.5 grid size-5 shrink-0 place-items-center rounded-full ${
                        good ? "bg-sage text-sage-foreground" : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {good ? <Check className="size-3" /> : <X className="size-3" />}
                    </span>
                    <div>
                      <p className="text-sm font-semibold">{t.option}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">{t.why}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </StaggerItem>

          <StaggerItem className="neu p-6">
            <h3 className="font-display text-base font-bold">Recommended stack</h3>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                    <th className="pb-2 pr-4 font-semibold">Layer</th>
                    <th className="pb-2 pr-4 font-semibold">Choice</th>
                    <th className="pb-2 font-semibold">Why</th>
                  </tr>
                </thead>
                <tbody>
                  {SOLUTION.stack.map((s) => (
                    <tr key={s.layer} className="border-t border-border align-top">
                      <td className="py-3 pr-4 text-muted-foreground">{s.layer}</td>
                      <td className="py-3 pr-4 font-semibold">{s.choice}</td>
                      <td className="py-3 text-muted-foreground">{s.why}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </StaggerItem>
        </Stagger>
      </GenerationSequence>
    </AppShell>
  );
}
