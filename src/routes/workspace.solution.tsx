import { createFileRoute } from "@tanstack/react-router";
import { Check, Sparkles, X } from "lucide-react";
import { useEffect, useState } from "react";

import { AppShell } from "@/components/AppShell";
import { ArtifactHeader } from "@/components/ArtifactHeader";
import { GenerationSequence } from "@/components/GenerationSequence";
import { Stagger, StaggerItem } from "@/components/motion/primitives";
import { GENERATION_STEPS, generateArtifact } from "@/lib/ai/generate-artifact";
import {
  getActiveProblemFraming,
  getActiveSolution,
  HR_CONSULTANCY_PROBLEM,
} from "@/lib/demo-data";

export const Route = createFileRoute("/workspace/solution")({
  head: () => ({
    meta: [
      { title: "Problem Framing & Solution — BizzMitra-AI" },
      {
        name: "description",
        content:
          "Root causes, constraints, quantified impact and the recommended solution with rejected options.",
      },
      { property: "og:title", content: "Problem Framing & Solution — BizzMitra-AI" },
      { property: "og:description", content: "The recommended approach, and why the alternatives lost." },
    ],
  }),
  component: SolutionPage,
});

function SolutionPage() {
  const [problemText, setProblemText] = useState(HR_CONSULTANCY_PROBLEM);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem("bizzmitra.workspaceContext");
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.problemStatement) {
          setProblemText(parsed.problemStatement);
        }
      }
    } catch {}
  }, []);

  const framing = getActiveProblemFraming(problemText);
  const solution = getActiveSolution(problemText);

  return (
    <AppShell>
      <ArtifactHeader id="solution" kicker="Step 03" title="Framing & solution" />

      <GenerationSequence
        steps={GENERATION_STEPS.solution}
        run={() => generateArtifact("solution")}
      >
        <Stagger className="space-y-6">
          {/* Framed Problem Card */}
          <StaggerItem className="neu p-6">
            <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-wider">
              <Sparkles className="size-3.5" />
              <span>AI Business Analysis Synthesis</span>
            </div>
            <h2 className="font-display text-lg font-bold mt-1">Framed Problem Statement</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              {framing.statement}
            </p>
            <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {framing.impact.map((m) => (
                <div key={m.metric} className="neu-inset px-4 py-3">
                  <p className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                    {m.metric}
                  </p>
                  <p className="mt-1 font-display text-xl font-extrabold text-foreground">
                    {m.value}
                  </p>
                </div>
              ))}
            </div>
          </StaggerItem>

          {/* Root Causes & Constraints Grid */}
          <StaggerItem className="grid gap-4 lg:grid-cols-2">
            <div className="neu p-6">
              <h3 className="font-display text-base font-bold">Identified Root Causes</h3>
              <ul className="mt-3 space-y-3">
                {framing.rootCauses.map((r) => (
                  <li key={r.title}>
                    <p className="text-sm font-semibold">{r.title}</p>
                    <p className="text-xs text-muted-foreground leading-relaxed">{r.detail}</p>
                  </li>
                ))}
              </ul>
            </div>
            <div className="neu p-6">
              <h3 className="font-display text-base font-bold">Operational Constraints</h3>
              <ul className="mt-3 space-y-2.5 text-sm text-muted-foreground">
                {framing.constraints.map((c) => (
                  <li key={c} className="flex gap-2">
                    <span className="mt-2 size-1.5 shrink-0 rounded-full bg-clay" />
                    <span className="leading-relaxed">{c}</span>
                  </li>
                ))}
              </ul>
            </div>
          </StaggerItem>

          {/* Recommended Solution Suite */}
          <StaggerItem className="neu p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
              AI Solution Recommendation
            </p>
            <h2 className="mt-1.5 font-display text-2xl font-extrabold">{solution.headline}</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{solution.summary}</p>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {solution.pillars.map((p) => (
                <div key={p.title} className="neu-inset px-4 py-3.5">
                  <p className="text-sm font-semibold text-foreground">{p.title}</p>
                  <p className="mt-1 text-xs text-muted-foreground leading-relaxed">{p.detail}</p>
                </div>
              ))}
            </div>
          </StaggerItem>

          {/* Options Considered: Build vs Buy vs Hybrid */}
          <StaggerItem className="neu p-6">
            <h3 className="font-display text-base font-bold">Options Considered: Trade-Off Analysis</h3>
            <div className="mt-3 space-y-3">
              {solution.tradeoffs.map((t) => {
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
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold">{t.option}</p>
                        <span
                          className={`neu-sm px-2 py-0.5 text-[10px] font-bold ${
                            good ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground"
                          }`}
                        >
                          {t.verdict}
                        </span>
                      </div>
                      <p className="mt-0.5 text-xs text-muted-foreground leading-relaxed">{t.why}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </StaggerItem>

          {/* Recommended Tech Stack Table */}
          <StaggerItem className="neu p-6">
            <h3 className="font-display text-base font-bold">Recommended Technology Stack</h3>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground border-b border-border">
                    <th className="pb-2 pr-4 font-semibold">Architectural Layer</th>
                    <th className="pb-2 pr-4 font-semibold">Recommended Choice</th>
                    <th className="pb-2 font-semibold">Selection Rationale</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {solution.stack.map((s) => (
                    <tr key={s.layer} className="align-top hover:bg-card/40 transition-colors">
                      <td className="py-3 pr-4 text-xs text-muted-foreground font-medium">{s.layer}</td>
                      <td className="py-3 pr-4 text-xs font-bold text-foreground">{s.choice}</td>
                      <td className="py-3 text-xs text-muted-foreground leading-relaxed">{s.why}</td>
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
