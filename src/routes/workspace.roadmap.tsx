import { createFileRoute } from "@tanstack/react-router";
import { motion } from "motion/react";
import { useState } from "react";

import { AppShell } from "@/components/AppShell";
import { ArtifactHeader } from "@/components/ArtifactHeader";
import { GenerationSequence } from "@/components/GenerationSequence";
import { CountUp, Stagger, StaggerItem } from "@/components/motion/primitives";
import { GENERATION_STEPS, generateArtifact } from "@/lib/ai/generate-artifact";
import { ROADMAP, ROI_DEFAULTS, computeRoi } from "@/lib/demo-data";

export const Route = createFileRoute("/workspace/roadmap")({
  head: () => ({
    meta: [
      { title: "Delivery roadmap & ROI — BizzMitra-AI" },
      { name: "description", content: "A phased six-week roadmap with effort estimates and a live ROI model." },
      { property: "og:title", content: "Delivery roadmap & ROI — BizzMitra-AI" },
      { property: "og:description", content: "Phased plan, effort estimates and the business case in one view." },
    ],
  }),
  component: RoadmapPage,
});

const TOTAL_WEEKS = 6;

function RoadmapPage() {
  const [inputs, setInputs] = useState(ROI_DEFAULTS);
  const roi = computeRoi(inputs);

  const sliders = [
    { key: "ticketsPerDay", label: "Tickets / day", min: 200, max: 3000, step: 50 },
    { key: "repetitivePct", label: "Repetitive %", min: 20, max: 90, step: 1 },
    { key: "deflectionPct", label: "Target deflection %", min: 20, max: 90, step: 1 },
    { key: "agentCostPerHour", label: "Agent cost / hour (₹)", min: 100, max: 1200, step: 10 },
  ] as const;

  return (
    <AppShell>
      <ArtifactHeader id="roadmap" kicker="Step 08" title="Roadmap & ROI" />

      <GenerationSequence steps={GENERATION_STEPS.roadmap} run={() => generateArtifact("roadmap")}>
        <Stagger className="space-y-6">
          <StaggerItem className="neu p-6">
            <h2 className="font-display text-base font-bold">Six-week delivery plan</h2>
            <div className="mt-5 space-y-3">
              {ROADMAP.map((p) => (
                <div key={p.phase} className="neu-inset px-4 py-3.5">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <p className="text-sm font-semibold">
                      {p.phase} · {p.title}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {p.weeks} · {p.effort}
                    </p>
                  </div>
                  <div className="mt-3 h-2 rounded-full bg-border/50">
                    <motion.div
                      className="h-full rounded-full bg-primary"
                      initial={{ width: 0, marginLeft: `${(p.start / TOTAL_WEEKS) * 100}%` }}
                      animate={{ width: `${(p.length / TOTAL_WEEKS) * 100}%` }}
                      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                    />
                  </div>
                  <ul className="mt-3 flex flex-wrap gap-1.5">
                    {p.items.map((i) => (
                      <li key={i} className="rounded-full bg-accent px-2.5 py-1 text-[11px] text-muted-foreground">
                        {i}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </StaggerItem>

          <StaggerItem className="neu p-6">
            <h2 className="font-display text-base font-bold">Live ROI model</h2>
            <div className="mt-5 grid gap-6 lg:grid-cols-2">
              <div className="space-y-4">
                {sliders.map((s) => (
                  <div key={s.key}>
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">{s.label}</span>
                      <span className="font-semibold">{inputs[s.key].toLocaleString("en-IN")}</span>
                    </div>
                    <input
                      type="range"
                      min={s.min}
                      max={s.max}
                      step={s.step}
                      value={inputs[s.key]}
                      onChange={(e) =>
                        setInputs((p) => ({ ...p, [s.key]: Number(e.target.value) }))
                      }
                      className="mt-2 w-full accent-[var(--color-primary)]"
                    />
                  </div>
                ))}
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="neu-inset px-4 py-3.5">
                  <p className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                    Monthly savings
                  </p>
                  <p className="mt-1 font-display text-2xl font-extrabold">
                    ₹<CountUp to={roi.monthlySavings} />
                  </p>
                </div>
                <div className="neu-inset px-4 py-3.5">
                  <p className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                    Contacts deflected / day
                  </p>
                  <p className="mt-1 font-display text-2xl font-extrabold">
                    <CountUp to={roi.deflected} />
                  </p>
                </div>
                <div className="neu-inset px-4 py-3.5">
                  <p className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                    Agent capacity freed
                  </p>
                  <p className="mt-1 font-display text-2xl font-extrabold">
                    <CountUp to={roi.agentsFreed} decimals={1} suffix=" FTE" />
                  </p>
                </div>
                <div className="neu-inset px-4 py-3.5">
                  <p className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                    First response cut
                  </p>
                  <p className="mt-1 font-display text-2xl font-extrabold">
                    <CountUp to={roi.frtReduction} suffix="%" />
                  </p>
                </div>
              </div>
            </div>
          </StaggerItem>
        </Stagger>
      </GenerationSequence>
    </AppShell>
  );
}
