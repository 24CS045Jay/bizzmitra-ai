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
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { AppShell } from "@/components/AppShell";
import { ArtifactHeader } from "@/components/ArtifactHeader";
import { CountUp, Reveal } from "@/components/motion/primitives";
import {
  ArtifactLayer,
  ArtifactMapBlueprint,
  ArtifactNode,
  getArtifactMapForWorkspace,
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

  // Read workspace context reactively
  const [workspaceContext, setWorkspaceContext] = useState<{
    id?: string;
    name?: string;
    businessName?: string;
    industry?: string;
    problemStatement?: string;
    description?: string;
  } | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("bizzmitra.workspaceContext");
      if (raw) {
        setWorkspaceContext(JSON.parse(raw));
      }
    } catch {}
  }, []);

  const mapBlueprint: ArtifactMapBlueprint = useMemo(
    () => getArtifactMapForWorkspace(workspaceContext),
    [workspaceContext]
  );

  const byId = useMemo(() => {
    return Object.fromEntries(mapBlueprint.nodes.map((n) => [n.id, n])) as Record<string, ArtifactNode>;
  }, [mapBlueprint.nodes]);

  // Ensure selectedNode is always valid in the active blueprint
  const selectedNode = byId[selectedNodeId] ?? mapBlueprint.nodes[0]!;

  useEffect(() => {
    if (!byId[selectedNodeId]) {
      setSelectedNodeId(mapBlueprint.nodes[4]?.id ?? mapBlueprint.nodes[0]!.id);
    }
  }, [byId, selectedNodeId, mapBlueprint.nodes]);

  // Upstream parents & Downstream children for selected node
  const parentNodeIds = useMemo(() => {
    return mapBlueprint.edges.filter((e) => e.to === selectedNode.id).map((e) => e.from);
  }, [selectedNode.id, mapBlueprint.edges]);

  const childNodeIds = useMemo(() => {
    return mapBlueprint.edges.filter((e) => e.from === selectedNode.id).map((e) => e.to);
  }, [selectedNode.id, mapBlueprint.edges]);

  const filteredNodes = useMemo(() => {
    if (activeLayerFilter === "all") return mapBlueprint.nodes;
    return mapBlueprint.nodes.filter((n) => n.layer === activeLayerFilter);
  }, [activeLayerFilter, mapBlueprint.nodes]);

  const layerColors: Record<ArtifactLayer, { border: string; bg: string; text: string }> = {
    foundation: { border: "border-purple-500/40", bg: "bg-purple-500/10", text: "text-purple-600 dark:text-purple-400" },
    analysis: { border: "border-blue-500/40", bg: "bg-blue-500/10", text: "text-blue-600 dark:text-blue-400" },
    solution: { border: "border-emerald-500/40", bg: "bg-emerald-500/10", text: "text-emerald-600 dark:text-emerald-400" },
    blueprint: { border: "border-indigo-500/40", bg: "bg-indigo-500/10", text: "text-indigo-600 dark:text-indigo-400" },
    execution: { border: "border-amber-500/40", bg: "bg-amber-500/10", text: "text-amber-600 dark:text-amber-400" },
  };

  const copyLineage = () => {
    navigator.clipboard.writeText(mapBlueprint.metrics.provenanceChain);
    toast.success("Transformation provenance chain copied to clipboard!");
  };

  return (
    <AppShell>
      <ArtifactHeader
        id="map"
        kicker="Signature USP #3 · Step 11"
        title="Connected Artifact Dependency Map"
      />

      {/* Blueprint Context Banner */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-primary/20 bg-primary/5 px-4 py-2.5 text-xs">
        <div className="flex items-center gap-2">
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          <span className="text-muted-foreground">Lineage Topology Context:</span>
          <span className="font-bold text-foreground">
            {workspaceContext?.businessName || workspaceContext?.name || mapBlueprint.scenarioName}
          </span>
          <span className="rounded-full bg-primary/10 px-2 py-0.5 font-medium text-primary">
            {mapBlueprint.domainTitle}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/workspace/insights" className="font-medium text-muted-foreground hover:text-primary transition-colors">
            Financial ROI →
          </Link>
          <Link to="/workspace/solution/crm" className="font-medium text-primary hover:underline">
            Workable App →
          </Link>
        </div>
      </div>

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
                {mapBlueprint.metrics.traceabilityScore}%
              </p>
              <p className="text-[11px] text-muted-foreground">Zero orphaned artifacts</p>
            </div>

            <div className="neu-inset p-3.5">
              <div className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
                <Network className="size-3.5 text-primary" />
                Connected Artifacts
              </div>
              <p className="mt-1 font-display text-xl font-bold">
                {mapBlueprint.nodes.length} Modules
              </p>
              <p className="text-[11px] text-muted-foreground">Across 5 transformation layers</p>
            </div>

            <div className="neu-inset p-3.5">
              <div className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
                <GitFork className="size-3.5 text-blue-500" />
                Verified Pathways
              </div>
              <p className="mt-1 font-display text-xl font-bold">
                {mapBlueprint.metrics.verifiedPathways} Directed Edges
              </p>
              <p className="text-[11px] text-muted-foreground">Bidirectional lineage</p>
            </div>

            <div className="neu-inset p-3.5">
              <div className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
                <Zap className="size-3.5 text-amber-500" />
                Active Version
              </div>
              <p className="mt-1 font-display text-xl font-bold">
                v1.1 (Synchronized)
              </p>
              <p className="text-[11px] text-muted-foreground">Tailored to problem domain</p>
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

          {/* Interactive Graph Canvas (Scrollable on Mobile) */}
          <div className="w-full overflow-x-auto touch-pan-x rounded-2xl">
            <div className="relative h-[560px] min-w-[940px] rounded-2xl bg-card/60 p-4 border border-border/40">
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

                {mapBlueprint.edges.map((edge) => {
                  const from = byId[edge.from];
                  const to = byId[edge.to];
                  if (!from || !to) return null;

                  const isConnectedToSelected =
                    edge.from === selectedNode.id || edge.to === selectedNode.id;

                  const isParentEdge = edge.to === selectedNode.id;

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
                          selectedNode.id && !isConnectedToSelected && activeLayerFilter === "all"
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
              {mapBlueprint.nodes.map((node) => {
                const isSelected = node.id === selectedNode.id;
                const isParent = parentNodeIds.includes(node.id);
                const isChild = childNodeIds.includes(node.id);
                const isDimmed =
                  selectedNode.id &&
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

                      <p className="mt-1 text-xs font-bold leading-snug line-clamp-1">{node.name}</p>

                      <div className="mt-2 flex items-center justify-between text-[10px] text-muted-foreground border-t border-border/40 pt-1.5">
                        <span>{node.layerLabel}</span>
                        {node.isUsp && (
                          <span className="rounded-full bg-primary/10 px-1.5 py-0.2 text-[9px] font-bold text-primary">
                            ★ USP
                          </span>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Node Inspector Card */}
          <div className="neu-inset p-5 rounded-xl border border-border/40 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/40 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-primary">{selectedNode.kicker}</span>
                  <span className="text-xs text-muted-foreground">·</span>
                  <span className="text-xs font-medium text-muted-foreground">{selectedNode.layerLabel}</span>
                  {selectedNode.isUsp && (
                    <span className="rounded bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
                      {selectedNode.uspLabel}
                    </span>
                  )}
                </div>
                <h3 className="font-display text-lg font-bold mt-0.5">{selectedNode.name}</h3>
              </div>

              <div className="flex items-center gap-2">
                <Link
                  to={selectedNode.route}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:opacity-90 transition"
                >
                  <span>Open Step</span>
                  <ArrowRight className="size-3.5" />
                </Link>
              </div>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed">
              {selectedNode.summary}
            </p>

            {/* Upstream Inputs & Downstream Outputs */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-lg bg-background/50 p-3 space-y-2 border border-border/30">
                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-600 dark:text-amber-400">
                  <ArrowDownRight className="size-3.5" />
                  <span>Consumed Inputs (Upstream Lineage)</span>
                </div>
                <ul className="space-y-1 text-xs text-muted-foreground">
                  {selectedNode.inputsConsumed.map((inp, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="mt-1 size-1.5 rounded-full bg-amber-500 shrink-0" />
                      <span>{inp}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-lg bg-background/50 p-3 space-y-2 border border-border/30">
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                  <ArrowUpRight className="size-3.5" />
                  <span>Produced Outputs (Downstream Impact)</span>
                </div>
                <ul className="space-y-1 text-xs text-muted-foreground">
                  {selectedNode.outputsProduced.map((out, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="mt-1 size-1.5 rounded-full bg-emerald-500 shrink-0" />
                      <span>{out}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </AppShell>
  );
}
