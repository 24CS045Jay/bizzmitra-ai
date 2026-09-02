import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpRight, Plus } from "lucide-react";

import { AppShell } from "@/components/AppShell";
import { CountUp, Reveal, Stagger, StaggerItem } from "@/components/motion/primitives";
import { DEMO_WORKSPACE } from "@/lib/demo-data";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Workspaces — BizzMitra-AI" },
      { name: "description", content: "All your business problem workspaces and their blueprint progress." },
      { property: "og:title", content: "Workspaces — BizzMitra-AI" },
      { property: "og:description", content: "Track every blueprint workspace in one board." },
    ],
  }),
  component: DashboardPage,
});

const WORKSPACES = [
  {
    name: DEMO_WORKSPACE.name,
    industry: DEMO_WORKSPACE.industry,
    progress: 100,
    updated: "Updated 4 minutes ago",
    artifacts: 8,
  },
  {
    name: "Kelder Group — Invoice Reconciliation",
    industry: "Manufacturing",
    progress: 45,
    updated: "Updated yesterday",
    artifacts: 4,
  },
  {
    name: "Tavara — Field Job Cards",
    industry: "Field Services",
    progress: 20,
    updated: "Updated 3 days ago",
    artifacts: 2,
  },
];

function DashboardPage() {
  return (
    <AppShell>
      <Reveal>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Your board</p>
        <h1 className="mt-2 font-display text-4xl font-extrabold sm:text-5xl">Workspaces</h1>
        <p className="mt-3 max-w-xl text-muted-foreground">
          Each workspace holds one business problem and the full chain of artifacts generated from it.
        </p>
      </Reveal>

      <Stagger className="mt-8 grid gap-4 sm:grid-cols-3">
        {[
          { label: "Active workspaces", value: 3, suffix: "" },
          { label: "Artifacts generated", value: 14, suffix: "" },
          { label: "Avg. maturity score", value: 62, suffix: "%" },
        ].map((s) => (
          <StaggerItem key={s.label} className="neu p-5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              {s.label}
            </p>
            <p className="mt-1 font-display text-3xl font-extrabold">
              <CountUp to={s.value} suffix={s.suffix} />
            </p>
          </StaggerItem>
        ))}
      </Stagger>

      <div className="mt-10 flex items-center justify-between">
        <h2 className="font-display text-xl font-bold">All workspaces</h2>
        <Link
          to="/workspace/new"
          className="neu-press flex items-center gap-2 rounded-xl bg-primary px-3.5 py-2.5 text-sm font-semibold text-primary-foreground"
        >
          <Plus className="size-4" /> New workspace
        </Link>
      </div>

      <Stagger className="mt-4 grid gap-4 lg:grid-cols-2">
        {WORKSPACES.map((w) => (
          <StaggerItem key={w.name}>
            <Link to="/workspace/discovery" className="neu block p-5 transition-transform hover:-translate-y-0.5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="font-display text-lg font-bold leading-tight">{w.name}</h3>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {w.industry} · {w.artifacts} artifacts · {w.updated}
                  </p>
                </div>
                <ArrowUpRight className="size-4 shrink-0 text-muted-foreground" />
              </div>
              <div className="mt-5">
                <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                  <span>Blueprint completeness</span>
                  <span className="font-semibold text-foreground">{w.progress}%</span>
                </div>
                <div className="neu-inset mt-2 h-2 overflow-hidden rounded-full p-0">
                  <div className="h-full rounded-full bg-primary" style={{ width: `${w.progress}%` }} />
                </div>
              </div>
            </Link>
          </StaggerItem>
        ))}
      </Stagger>
    </AppShell>
  );
}
