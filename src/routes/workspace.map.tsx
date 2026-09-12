import { createFileRoute, Link } from "@tanstack/react-router";
import {
  AlertCircle,
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
  ExternalLink,
  Eye,
  GitFork,
  Layers,
  Network,
  RefreshCw,
  Share2,
  ShieldCheck,
  Sparkles,
  Zap,
} from "lucide-react";
import { motion } from "motion/react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { AppShell } from "@/components/AppShell";
import { ArtifactHeader } from "@/components/ArtifactHeader";
import { CountUp, Reveal, Stagger, StaggerItem } from "@/components/motion/primitives";
import {
  ARTIFACT_MAP_EDGES,
  ARTIFACT_MAP_NODES,
  ArtifactLayer,
  ArtifactNode,
  TRACEABILITY_METRICS,
} from "@/lib/artifact-map-data";

export const Route = createFileRoute("/workspace/map")({
  head: () => ({
    meta: [
      { title: "Connected Artifact Map (USP #3) — BizzMitra-AI" },
      {
        name: "description",
        content: "Interactive dependency graph proving that every technical blueprint is connected to the business problem.",
      },
      { property: "og:title", content: "Connected Artifact Map (USP #3) — BizzMitra-AI" },
      { property: "og:description", content: "One single connected workspace, not five disconnected tools." },
    ],
  }),
  component: ArtifactMapPage,
});

export function ArtifactMapPage() {
  const [selectedNodeId, setSelectedNodeId] = useState<string>("hr-crm");
  const [activeLayerFilter, setActiveLayerFilter] = useState<ArtifactLayer | "all">("all");

  // Read workspace context
  const workspaceContext = useMemo(() => {
    if (typeof window === "undefined") return null;
    const raw = localStorage.getItem("bizzmitra.workspaceContext");
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }, []);

  const scenarioName = workspaceContext?.name ?? "TalentCraft HR Consultancy";

  const byId = useMemo(() => {
    return Object.fromEntries(ARTIFACT_MAP_NODES.map((n) => [n.id, n])) as Record<string, ArtifactNode>;
  }, []);

  const selectedNode = (byId[selectedNodeId] ?? ARTIFACT_MAP_NODES[0])!;

  // Upstream parents & Downstream children for selected node
  const parentNodeIds = useMemo(() => {
    return ARTIFACT_MAP_EDGES.filter((e) => e.to === selectedNodeId).map((e) => e.from);
  }, [selectedNodeId]);

  const childNodeIds = useMemo(() => {
    return ARTIFACT_MAP_EDGES.filter((e) => e.from === selectedNodeId).map((e) => e.to);
  }, [selectedNodeId]);

  const filteredNodes = useMemo(() => {
    if (activeLayerFilter === "all") return ARTIFACT_MAP_NODES;
    return ARTIFACT_MAP_NODES.filter((n) => n.layer === activeLayerFilter);
  }, [activeLayerFilter]);

  const layerColors: Record<ArtifactLayer, { border: string; bg: string; text: string }> = {
    foundation: { border: "border-purple-500/40", bg: "bg-purple-500/10", text: "text-purple-600 dark:text-purple-400" },
    analysis: { border: "border-blue-500/40", bg: "bg-blue-500/10", text: "text-blue-600 dark:text-blue-400" },
    solution: { border: "border-emerald-500/40", bg: "bg-emerald-500/10", text: "text-emerald-600 dark:text-emerald-400" },
    blueprint: { border: "border-indigo-500/40", bg: "bg-indigo-500/10", text: "text-indigo-600 dark:text-indigo-400" },
    execution: { border: "border-amber-500/40", bg: "bg-amber-500/10", text: "text-amber-600 dark:text-amber-400" },
  };

  const copyLineage = () => {
    navigator.clipboard.writeText(TRACEABILITY_METRICS.provenanceChain);
    toast.success("Transformation provenance chain copied to clipboard!");
  };

  return (
    <AppShell>
      <ArtifactHeader
        id="map"
        kicker="Signature USP #3 · Step 11"
        title="Connected Artifact Dependency Map"
      />

      <div className="space-y-8 pb-16">
        {/* Top Hero Banner */}
        <Reveal className="neu p-6 md:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-3xl space-y-2">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                  <Sparkles className="size-3.5" />
                  Signature USP #3 · Complete Artifact Traceability
                </span>
                <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <ShieldCheck className="size-3.5" />
                  100% Grounded Lineage
                </span>
              </div>
              <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
                The Single Source of Transformation Truth
              </h1>
              <p className="text-sm leading-relaxed text-muted-foreground">
                In competitor tools, discovery happens in ChatGPT, diagrams in Lucidchart, tickets in Jira, and ROI in spreadsheets. In <strong>BizzMitra-AI</strong>, every technical asset is dynamically connected back to the original business problem.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={copyLineage}
                className="neu-sm neu-press flex items-center gap-2 px-3.5 py-2 text-xs font-semibold hover:text-primary"
              >
                <Share2 className="size-3.5" />
                Copy Provenance Chain
              </button>
              <Link
                to={selectedNode.route}
                className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-semibold text-primary-foreground shadow-sm transition hover:opacity-90"
              >
                Open {selectedNode.name}
                <ExternalLink className="size-3.5" />
              </Link>
            </div>
          </div>

          {/* Quick Stats Bar */}
          <div className="mt-8 grid grid-cols-2 gap-4 border-t border-border/40 pt-6 sm:grid-cols-4">
            <div className="neu-inset p-3.5">
              <div className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
                <ShieldCheck className="size-3.5 text-emerald-500" />
                Traceability Score
              </div>
              <p className="mt-1 font-display text-xl font-bold text-emerald-600 dark:text-emerald-400">
                {TRACEABILITY_METRICS.traceabilityScore}%
              </p>
              <p className="text-[11px] text-muted-foreground">Zero orphaned artifacts</p>
            </div>

            <div className="neu-inset p-3.5">
              <div className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
                <Network className="size-3.5 text-primary" />
                Connected Artifacts
              </div>
              <p className="mt-1 font-display text-xl font-bold">
                {ARTIFACT_MAP_NODES.length} Modules
              </p>
              <p className="text-[11px] text-muted-foreground">Across 5 transformation layers</p>
            </div>

            <div className="neu-inset p-3.5">
              <div className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
                <GitFork className="size-3.5 text-blue-500" />
                Verified Pathways
              </div>
              <p className="mt-1 font-display text-xl font-bold">
                {TRACEABILITY_METRICS.verifiedPathways} Directed Edges
              </p>
              <p className="text-[11px] text-muted-foreground">Bidirectional lineage</p>
            </div>

            <div className="neu-inset p-3.5">
              <div className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
                <Zap className="size-3.5 text-amber-500" />
                Active Version
              </div>
              <p className="mt-1 font-display text-xl font-bold">
                v1.1 (Regenerated)
              </p>
              <p className="text-[11px] text-muted-foreground">Synchronized schema</p>
            </div>
          </div>
        </Reveal>

        {/* Filter Tabs & Interactive Canvas */}
        <Reveal className="neu p-6 md:p-8 space-y-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border/40 pb-4">
            <div>
              <h2 className="font-display text-lg font-bold">Interactive Transformation Topology</h2>
              <p className="text-xs text-muted-foreground">
                Click any node to inspect its consumed inputs, produced outputs, and upstream/downstream dependencies.
              </p>
            </div>

            {/* Layer Filters */}
            <div className="flex flex-wrap gap-1.5">
              {(
                [
                  { key: "all", label: "All Layers" },
                  { key: "foundation", label: "Context" },
                  { key: "analysis", label: "Discovery" },
                  { key: "solution", label: "Workable Solutions" },
                  { key: "blueprint", label: "Blueprints" },
                  { key: "execution", label: "Economics" },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveLayerFilter(tab.key)}
                  className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
                    activeLayerFilter === tab.key
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "neu-sm hover:text-primary"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Interactive Graph Canvas */}
          <div className="relative h-[560px] min-w-[940px] overflow-x-auto rounded-2xl bg-card/60 p-4 border border-border/40">
            {/* SVG Edges Layer */}
            <svg className="absolute inset-0 size-full pointer-events-none" aria-hidden>
              <defs>
                <marker
                  id="arrow"
                  viewBox="0 0 10 10"
                  refX="16"
                  refY="5"
                  markerWidth="6"
                  markerHeight="6"
                  orient="auto-start-reverse"
                >
                  <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--color-border)" />
                </marker>
                <marker
                  id="arrow-active"
                  viewBox="0 0 10 10"
                  refX="16"
                  refY="5"
                  markerWidth="6"
                  markerHeight="6"
                  orient="auto-start-reverse"
                >
                  <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--color-primary)" />
                </marker>
              </defs>

              {ARTIFACT_MAP_EDGES.map((edge) => {
                const from = byId[edge.from];
                const to = byId[edge.to];
                if (!from || !to) return null;

                const isConnectedToSelected =
                  edge.from === selectedNodeId || edge.to === selectedNodeId;

                const isParentEdge = edge.to === selectedNodeId;
                const isChildEdge = edge.from === selectedNodeId;

                const strokeColor = isConnectedToSelected
                  ? isParentEdge
                    ? "#f59e0b" // Amber for input
                    : "#10b981" // Emerald for output
                  : edge.isUspFlow
                    ? "var(--color-primary)"
                    : "var(--color-border)";

                return (
                  <g key={`${edge.from}-${edge.to}`}>
                    <motion.line
                      x1={`${from.x}%`}
                      y1={`${from.y}%`}
                      x2={`${to.x}%`}
                      y2={`${to.y}%`}
                      stroke={strokeColor}
                      strokeWidth={isConnectedToSelected ? 2.5 : edge.isUspFlow ? 2 : 1.2}
                      strokeDasharray={edge.isUspFlow ? "4 4" : undefined}
                      opacity={
                        selectedNodeId && !isConnectedToSelected && activeLayerFilter === "all"
                          ? 0.25
                          : 0.8
                      }
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                      markerEnd={isConnectedToSelected ? "url(#arrow-active)" : "url(#arrow)"}
                    />
                  </g>
                );
              })}
            </svg>

            {/* Nodes Layer */}
            {ARTIFACT_MAP_NODES.map((node) => {
              const isSelected = node.id === selectedNodeId;
              const isParent = parentNodeIds.includes(node.id);
              const isChild = childNodeIds.includes(node.id);
              const isDimmed =
                selectedNodeId &&
                !isSelected &&
                !isParent &&
                !isChild &&
                activeLayerFilter === "all";

              const layerStyle = layerColors[node.layer];

              return (
                <motion.div
                  key={node.id}
                  onClick={() => setSelectedNodeId(node.id)}
                  className={`absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all duration-300 ${
                    isDimmed ? "opacity-30 scale-95" : "opacity-100 scale-100"
                  }`}
                  style={{ left: `${node.x}%`, top: `${node.y}%` }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div
                    className={`rounded-xl p-3.5 min-w-[170px] shadow-sm transition-all ${
                      isSelected
                        ? "neu-inset ring-2 ring-primary border-primary bg-background"
                        : isParent
                          ? "ring-2 ring-amber-500/80 bg-background border-amber-500/50"
                          : isChild
                            ? "ring-2 ring-emerald-500/80 bg-background border-emerald-500/50"
                            : "neu hover:border-primary/50"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1 text-[10px]">
                      <span className={`font-bold ${layerStyle.text}`}>{node.kicker}</span>
                      <span className="rounded bg-accent px-1.5 py-0.5 text-[9px] font-mono text-muted-foreground">
                        {node.version}
                      </span>
                    </div>

                    <h4 className="mt-1 text-xs font-bold leading-snug">{node.name}</h4>

                    {node.isUsp && (
                      <span className="mt-1.5 inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[9px] font-bold text-primary">
                        <Zap className="size-2.5" />
                        {node.uspLabel}
                      </span>
                    )}

                    <div className="mt-2 flex items-center justify-between border-t border-border/30 pt-1.5 text-[10px] text-muted-foreground">
                      <span>{node.layerLabel}</span>
                      <span
                        className={`size-1.5 rounded-full ${
                          node.status === "regenerated"
                            ? "bg-primary animate-pulse"
                            : "bg-emerald-500"
                        }`}
                      />
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Canvas Legend */}
          <div className="flex flex-wrap items-center justify-between gap-4 text-xs text-muted-foreground border-t border-border/40 pt-4">
            <div className="flex flex-wrap items-center gap-4">
              <span className="flex items-center gap-1.5">
                <span className="size-2.5 rounded-full bg-primary" />
                Active Selection
              </span>
              <span className="flex items-center gap-1.5">
                <span className="size-2.5 rounded-full bg-amber-500" />
                Upstream Dependency (Inputs Consumed)
              </span>
              <span className="flex items-center gap-1.5">
                <span className="size-2.5 rounded-full bg-emerald-500" />
                Downstream Derivative (Outputs Produced)
              </span>
            </div>
            <div>
              <span className="font-semibold text-foreground">Click any node</span> to trace its transformation path.
            </div>
          </div>
        </Reveal>

        {/* Selected Node Deep Inspector Panel */}
        <Reveal className="neu p-6 md:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            {/* Left Col: Node Summary & Metrics */}
            <div className="max-w-2xl space-y-4">
              <div className="flex items-center gap-2">
                <span className="rounded-md bg-primary/10 px-2.5 py-1 text-xs font-bold text-primary">
                  {selectedNode.kicker} · {selectedNode.layerLabel}
                </span>
                <span className="rounded bg-muted px-2 py-0.5 text-xs font-mono font-medium text-muted-foreground">
                  Version: {selectedNode.version}
                </span>
                <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                  Status: {selectedNode.status.toUpperCase()}
                </span>
              </div>

              <div>
                <h3 className="font-display text-2xl font-bold">{selectedNode.name}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {selectedNode.summary}
                </p>
              </div>

              {/* Metrics Pills */}
              <div className="flex flex-wrap gap-3 pt-2">
                {selectedNode.metrics.map((m) => (
                  <div key={m.label} className="neu-inset px-3 py-2 text-xs">
                    <span className="text-muted-foreground">{m.label}: </span>
                    <strong className="text-foreground">{m.value}</strong>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Col: Navigation CTA */}
            <div className="flex flex-col items-start gap-3 lg:items-end">
              <Link
                to={selectedNode.route}
                className="flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-xs font-bold text-primary-foreground shadow-sm transition hover:opacity-90"
              >
                Inspect Live Artifact
                <ArrowRight className="size-4" />
              </Link>
              <span className="text-[11px] text-muted-foreground">
                Path: <code className="font-mono text-foreground">{selectedNode.route}</code>
              </span>
            </div>
          </div>

          {/* Lineage Breakdown: Inputs Consumed vs Outputs Produced */}
          <div className="mt-8 grid gap-6 md:grid-cols-2 border-t border-border/40 pt-6">
            {/* Upstream Inputs */}
            <div className="neu-inset p-4 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-500">
                <ArrowUpRight className="size-4" />
                Inputs Consumed From Upstream ({selectedNode.inputsConsumed.length})
              </div>
              <ul className="space-y-1.5 text-xs text-muted-foreground">
                {selectedNode.inputsConsumed.map((inp, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="mt-1 size-1.5 rounded-full bg-amber-500" />
                    <span>{inp}</span>
                  </li>
                ))}
              </ul>
              {parentNodeIds.length > 0 && (
                <div className="mt-3 border-t border-border/30 pt-2 text-[11px]">
                  <span className="text-muted-foreground">Parent Nodes: </span>
                  {parentNodeIds.map((pId) => (
                    <button
                      key={pId}
                      type="button"
                      onClick={() => setSelectedNodeId(pId)}
                      className="ml-1 text-primary hover:underline font-semibold"
                    >
                      {byId[pId]?.name ?? pId},
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Downstream Outputs */}
            <div className="neu-inset p-4 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-500">
                <ArrowDownRight className="size-4" />
                Outputs Delivered to Downstream ({selectedNode.outputsProduced.length})
              </div>
              <ul className="space-y-1.5 text-xs text-muted-foreground">
                {selectedNode.outputsProduced.map((out, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="mt-1 size-1.5 rounded-full bg-emerald-500" />
                    <span>{out}</span>
                  </li>
                ))}
              </ul>
              {childNodeIds.length > 0 && (
                <div className="mt-3 border-t border-border/30 pt-2 text-[11px]">
                  <span className="text-muted-foreground">Derivative Nodes: </span>
                  {childNodeIds.map((cId) => (
                    <button
                      key={cId}
                      type="button"
                      onClick={() => setSelectedNodeId(cId)}
                      className="ml-1 text-primary hover:underline font-semibold"
                    >
                      {byId[cId]?.name ?? cId},
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </Reveal>

        {/* Provenance Assurance Banner */}
        <Reveal className="neu p-6 border-l-4 border-l-primary flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <h4 className="text-xs font-bold uppercase tracking-wider text-primary">
              Enterprise Provenance & Change Propagation Guard
            </h4>
            <p className="text-xs text-muted-foreground">
              {TRACEABILITY_METRICS.provenanceChain}
            </p>
          </div>
          <div className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 shrink-0">
            ✓ 100% Traceable to Business Problem
          </div>
        </Reveal>
      </div>
    </AppShell>
  );
}
