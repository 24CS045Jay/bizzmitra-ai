import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "motion/react";

import { AppShell } from "@/components/AppShell";
import { Reveal } from "@/components/motion/primitives";
import { ARTIFACT_EDGES, ARTIFACT_NODES } from "@/lib/demo-data";

export const Route = createFileRoute("/workspace/map")({
  head: () => ({
    meta: [
      { title: "Artifact map — BizzMitra-AI" },
      { name: "description", content: "See how every artifact in the workspace derives from the one before it." },
      { property: "og:title", content: "Artifact map — BizzMitra-AI" },
      { property: "og:description", content: "One connected workspace, not five disconnected tools." },
    ],
  }),
  component: MapPage,
});

function MapPage() {
  const byId = Object.fromEntries(ARTIFACT_NODES.map((n) => [n.id, n]));

  return (
    <AppShell>
      <Reveal>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">The point</p>
        <h1 className="mt-2 font-display text-4xl font-extrabold sm:text-5xl">Artifact map</h1>
        <p className="mt-3 max-w-xl text-muted-foreground">
          Every artifact is derived from the one before it. Change the framing and the chain downstream
          changes with it.
        </p>
      </Reveal>

      <div className="neu mt-8 overflow-x-auto p-6">
        <div className="relative h-[420px] min-w-[860px]">
          <svg className="absolute inset-0 size-full" aria-hidden>
            {ARTIFACT_EDGES.map(([a, b], i) => {
              const from = byId[a];
              const to = byId[b];
              if (!from || !to) return null;
              return (
                <motion.line
                  key={`${a}-${b}`}
                  x1={`${from.x}%`}
                  y1={`${from.y}%`}
                  x2={`${to.x}%`}
                  y2={`${to.y}%`}
                  stroke="var(--color-border)"
                  strokeWidth={1.5}
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{ delay: 0.2 + i * 0.06, duration: 0.5 }}
                />
              );
            })}
          </svg>

          {ARTIFACT_NODES.map((n, i) => (
            <motion.div
              key={n.id}
              className="absolute -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${n.x}%`, top: `${n.y}%` }}
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 + i * 0.06, type: "spring", stiffness: 320, damping: 26 }}
            >
              <Link
                to={n.to}
                className="neu-sm neu-press block whitespace-nowrap px-3.5 py-2 text-xs font-semibold hover:text-primary"
              >
                {n.label}
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
