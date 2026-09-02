import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import { ArrowUpRight, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { AppShell } from "@/components/AppShell";
import { CountUp, Reveal, Stagger, StaggerItem } from "@/components/motion/primitives";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

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

function ProgressRing({ value }: { value: number }) {
  const r = 22;
  const c = 2 * Math.PI * r;
  return (
    <svg viewBox="0 0 56 56" className="size-14 shrink-0 -rotate-90">
      <circle cx="28" cy="28" r={r} fill="none" strokeWidth="5" className="stroke-border" />
      <motion.circle
        cx="28"
        cy="28"
        r={r}
        fill="none"
        strokeWidth="5"
        strokeLinecap="round"
        className="stroke-primary"
        strokeDasharray={c}
        initial={{ strokeDashoffset: c }}
        whileInView={{ strokeDashoffset: c - (c * value) / 100 }}
        viewport={{ once: true }}
        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
      />
    </svg>
  );
}

function DashboardPage() {
  const { user } = useAuth();
  const [workspaces, setWorkspaces] = useState<Tables<"workspaces">[]>([]);
  const [artifactCount, setArtifactCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    async function loadWorkspaces() {
      const { data, error } = await supabase
        .from("workspaces")
        .select("*")
        .order("updated_at", { ascending: false });
      if (error) toast.error(error.message);
      else setWorkspaces(data ?? []);

      const { count } = await supabase
        .from("artifacts")
        .select("id", { count: "exact", head: true });
      setArtifactCount(count ?? 0);
      setLoading(false);
    }
    void loadWorkspaces();
  }, [user]);

  const averageMaturity = workspaces.length
    ? Math.round(workspaces.reduce((total, workspace) => total + workspace.maturity_score, 0) / workspaces.length)
    : 0;

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
          { label: "Active workspaces", value: workspaces.length, suffix: "" },
          { label: "Artifacts generated", value: artifactCount, suffix: "" },
          { label: "Avg. maturity score", value: averageMaturity, suffix: "%" },
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
        {loading ? <p className="text-sm text-muted-foreground">Loading workspaces…</p> : null}
        {!loading && workspaces.length === 0 ? (
          <p className="text-sm text-muted-foreground">No workspaces yet. Start with a new intake.</p>
        ) : null}
        {workspaces.map((w) => (
          <StaggerItem key={w.name}>
            <motion.div whileHover={{ y: -4, scale: 1.012 }} transition={{ duration: 0.15 }}>
              <Link
                to="/workspace/discovery"
                onClick={() => window.localStorage.setItem("bizzmitra.activeWorkspaceId", w.id)}
                className="neu block p-5"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="font-display text-lg font-bold leading-tight">{w.name}</h3>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {w.status} · Updated {new Date(w.updated_at).toLocaleDateString()}
                    </p>
                  </div>
                  <ArrowUpRight className="size-4 shrink-0 text-muted-foreground" />
                </div>
                <div className="mt-5 flex items-center gap-4">
                  <div className="relative grid place-items-center">
                    <ProgressRing value={w.maturity_score} />
                    <span className="absolute font-display text-[11px] font-extrabold">
                      {w.maturity_score}%
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] text-muted-foreground">Blueprint completeness</p>
                    <div className="neu-inset mt-2 h-2 overflow-hidden rounded-full p-0">
                      <div className="h-full rounded-full bg-primary" style={{ width: `${w.maturity_score}%` }} />
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          </StaggerItem>
        ))}
      </Stagger>
    </AppShell>
  );
}

