import { createFileRoute } from "@tanstack/react-router";
import {
  Legend,
  Line,
  LineChart,
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { AppShell } from "@/components/AppShell";
import { CountUp, Reveal, Stagger, StaggerItem } from "@/components/motion/primitives";
import { DEMO_WORKSPACE, FRT_TREND, READINESS_RADAR, ROI_DEFAULTS, computeRoi } from "@/lib/demo-data";

export const Route = createFileRoute("/workspace/insights")({
  head: () => ({
    meta: [
      { title: "Transformation dashboard — BizzMitra-AI" },
      { name: "description", content: "Digital maturity, readiness by dimension and projected response-time impact." },
      { property: "og:title", content: "Transformation dashboard — BizzMitra-AI" },
      { property: "og:description", content: "Maturity, readiness and project health in one board." },
    ],
  }),
  component: InsightsPage,
});

function InsightsPage() {
  const roi = computeRoi(ROI_DEFAULTS);

  return (
    <AppShell>
      <Reveal>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Board view</p>
        <h1 className="mt-2 font-display text-4xl font-extrabold sm:text-5xl">Transformation</h1>
        <p className="mt-3 max-w-xl text-muted-foreground">
          How ready {DEMO_WORKSPACE.name.split(" — ")[0]} is to deliver this blueprint, and what it buys them.
        </p>
      </Reveal>

      <Stagger className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Digital maturity", value: DEMO_WORKSPACE.maturity, suffix: "%" },
          { label: "Delivery readiness", value: DEMO_WORKSPACE.readiness, suffix: "%" },
          { label: "Monthly savings", value: roi.monthlySavings, prefix: "₹" },
          { label: "FRT reduction", value: roi.frtReduction, suffix: "%" },
        ].map((s) => (
          <StaggerItem key={s.label} className="neu p-5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              {s.label}
            </p>
            <p className="mt-1 font-display text-3xl font-extrabold">
              <CountUp to={s.value} prefix={s.prefix ?? ""} suffix={s.suffix ?? ""} />
            </p>
          </StaggerItem>
        ))}
      </Stagger>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Reveal className="neu p-6">
          <h2 className="font-display text-base font-bold">Readiness by dimension</h2>
          <div className="mt-4 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={READINESS_RADAR}>
                <PolarGrid stroke="var(--color-border)" />
                <PolarAngleAxis dataKey="dimension" tick={{ fontSize: 11 }} />
                <Radar
                  dataKey="score"
                  stroke="var(--color-primary)"
                  fill="var(--color-primary)"
                  fillOpacity={0.25}
                />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </Reveal>

        <Reveal className="neu p-6">
          <h2 className="font-display text-base font-bold">First response time, projected</h2>
          <div className="mt-4 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={FRT_TREND}>
                <XAxis dataKey="week" tick={{ fontSize: 11 }} stroke="var(--color-border)" />
                <YAxis unit="h" tick={{ fontSize: 11 }} stroke="var(--color-border)" />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="before"
                  name="Without BizzMitra"
                  stroke="var(--color-muted-foreground)"
                  strokeDasharray="4 4"
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="after"
                  name="With blueprint"
                  stroke="var(--color-primary)"
                  strokeWidth={2.5}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Reveal>
      </div>
    </AppShell>
  );
}
