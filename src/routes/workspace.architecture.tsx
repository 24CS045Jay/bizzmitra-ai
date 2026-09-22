import { createFileRoute, Link } from "@tanstack/react-router";
import { AnimatePresence, motion } from "motion/react";
import {
  Activity,
  ArrowRight,
  Boxes,
  Check,
  ChevronRight,
  Clock,
  Code2,
  Copy,
  Cpu,
  Database,
  Layers,
  Network,
  Server,
  ShieldCheck,
  Sparkles,
  Workflow,
  X,
  Zap,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { AppShell } from "@/components/AppShell";
import { ArtifactHeader } from "@/components/ArtifactHeader";
import { GenerationSequence } from "@/components/GenerationSequence";
import { Mermaid } from "@/components/Mermaid";
import { GENERATION_STEPS, generateArtifact } from "@/lib/ai/generate-artifact";
import {
  getArchitectureBlueprint,
  type ArchitectureComponent,
} from "@/lib/architecture-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/workspace/architecture")({
  head: () => ({
    meta: [
      { title: "Architecture Blueprint — BizzMitra-AI" },
      {
        name: "description",
        content:
          "High-level and low-level architecture specifications, 5-layer topology, security policies, and SLA matrix.",
      },
      { property: "og:title", content: "Architecture Blueprint — BizzMitra-AI" },
      {
        property: "og:description",
        content: "Complete engineering blueprint derived from your business solution.",
      },
    ],
  }),
  component: ArchitecturePage,
});

const LAYER_COLORS: Record<string, string> = {
  "Client & Presentation": "bg-teal-500/10 text-teal-700 dark:text-teal-300 border-teal-500/30",
  "API Gateway & Edge": "bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border-indigo-500/30",
  "Core Services": "bg-sky-500/10 text-sky-700 dark:text-sky-300 border-sky-500/30",
  "Async & AI Pipeline": "bg-violet-500/10 text-violet-700 dark:text-violet-300 border-violet-500/30",
  "Data & Cache": "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30",
};

function ArchitecturePage() {
  const [tab, setTab] = useState<"hld" | "lld" | "components" | "sla">("hld");
  const [selectedComponent, setSelectedComponent] = useState<ArchitectureComponent | null>(null);
  const [copied, setCopied] = useState(false);
  const [workspaceContext, setWorkspaceContext] = useState<{
    businessName: string;
    industry: string;
    problemStatement: string;
  }>({
    businessName: "TalentCraft HR Consultancy",
    industry: "HR & Recruitment Services",
    problemStatement: "",
  });

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem("bizzmitra.workspaceContext");
      if (raw) {
        const parsed = JSON.parse(raw);
        setWorkspaceContext({
          businessName: parsed.businessName || "TalentCraft HR Consultancy",
          industry: parsed.industry || "HR & Recruitment Services",
          problemStatement: parsed.problemStatement || "",
        });
      }
    } catch {}
  }, []);

  const blueprint = getArchitectureBlueprint(workspaceContext);

  const activeDiagram =
    tab === "hld"
      ? blueprint.hldDiagram
      : tab === "lld"
      ? blueprint.lldDiagram
      : tab === "components"
      ? blueprint.topologyDiagram
      : blueprint.securitySlaDiagram;

  const handleCopyMermaid = () => {
    navigator.clipboard.writeText(activeDiagram);
    setCopied(true);
    toast.success("Mermaid diagram source copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <AppShell>
      <ArtifactHeader id="architecture" kicker="Step 04" title="Technical Architecture" />

      {/* Blueprint Context Banner */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-primary/20 bg-primary/5 px-4 py-2.5 text-xs">
        <div className="flex items-center gap-2">
          <Sparkles className="h-3.5 w-3.5 text-primary shrink-0" />
          <span className="text-muted-foreground">Tailored Architecture For:</span>
          <span className="font-bold text-foreground">{workspaceContext.businessName}</span>
          <span className="rounded-full bg-primary/10 px-2 py-0.5 font-medium text-primary">
            {workspaceContext.industry}
          </span>
        </div>
        <Link to="/workspace/solution" className="font-medium text-primary hover:underline">
          Connected to Solution Stack →
        </Link>
      </div>

      {/* Architecture Spec Highlights Bar */}
      <div className="mb-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="neu-sm p-3 rounded-xl">
          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <Server className="size-3 text-primary" /> Cloud Infrastructure
          </p>
          <p className="font-semibold text-xs text-foreground mt-1 truncate">
            {blueprint.summary.cloudProvider}
          </p>
        </div>
        <div className="neu-sm p-3 rounded-xl">
          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <Database className="size-3 text-sky-500" /> Primary Persistence
          </p>
          <p className="font-semibold text-xs text-foreground mt-1 truncate">
            {blueprint.summary.dbEngine}
          </p>
        </div>
        <div className="neu-sm p-3 rounded-xl">
          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <Zap className="size-3 text-amber-500" /> Concurrency Target
          </p>
          <p className="font-semibold text-xs text-foreground mt-1 truncate">
            {blueprint.summary.concurrencyTarget}
          </p>
        </div>
        <div className="neu-sm p-3 rounded-xl">
          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <ShieldCheck className="size-3 text-emerald-500" /> Availability Guarantee
          </p>
          <p className="font-semibold text-xs text-foreground mt-1 truncate">
            {blueprint.summary.primarySla}
          </p>
        </div>
      </div>

      <GenerationSequence
        steps={GENERATION_STEPS.architecture}
        run={() => generateArtifact("architecture")}
      >
        <div className="space-y-6">
          {/* ═══ Header Tabs & Action Bar ═══ */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="neu-sm inline-flex flex-wrap gap-1 p-1 bg-surface/60 rounded-xl">
              {(
                [
                  ["hld", "1. High-Level (HLD)", Network],
                  ["lld", "2. Sequence (LLD)", Workflow],
                  ["components", "3. Topology (Mesh)", Layers],
                  ["sla", "4. Security & SLA", ShieldCheck],
                ] as const
              ).map(([t, label, Icon]) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={cn(
                    "flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-bold transition-all",
                    tab === t
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  <Icon className="size-3.5" />
                  <span>{label}</span>
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 text-xs">
              <button
                onClick={handleCopyMermaid}
                className="neu-sm neu-press flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground"
                title="Copy current Mermaid chart definition"
              >
                {copied ? <Check className="size-3.5 text-emerald-500" /> : <Copy className="size-3.5" />}
                <span>{copied ? "Copied" : "Copy Mermaid"}</span>
              </button>
              <button
                onClick={() => setSelectedComponent(blueprint.components[0] ?? null)}
                className="neu-press flex items-center gap-1.5 rounded-xl bg-primary px-3.5 py-2 font-semibold text-primary-foreground shadow-sm"
              >
                <Cpu className="size-3.5" />
                <span>Inspect Nodes</span>
              </button>
            </div>
          </div>

          {/* ═══ Tab 1: High Level Design (HLD) ═══ */}
          {tab === "hld" && (
            <motion.div
              key="hld"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className="neu p-6 space-y-4"
            >
              <div className="flex flex-wrap items-center justify-between border-b border-border/60 pb-3 gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-bold text-primary">
                      Diagram 1 of 4: System Topology
                    </span>
                    <h2 className="font-display text-base font-extrabold">
                      High-Level Cloud Architecture (HLD)
                    </h2>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Multi-tier microservices cloud architecture tailored to {workspaceContext.businessName}, including edge CDN, worker queues, and persistence.
                  </p>
                </div>
                <span className="text-[10px] font-mono text-muted-foreground">
                  {blueprint.summary.cloudProvider}
                </span>
              </div>

              <div className="overflow-x-auto rounded-xl bg-card/60 p-4 border border-border/60">
                <Mermaid key="hld" chart={blueprint.hldDiagram} />
              </div>

              {/* Node Inspector Callout Chips */}
              <div className="pt-2">
                <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-2">
                  Click any node below to inspect tech stack, security policies & scaling SLAs:
                </p>
                <div className="flex flex-wrap gap-2">
                  {blueprint.components.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => setSelectedComponent(c)}
                      className={cn(
                        "rounded-lg border px-3 py-1.5 text-xs font-semibold flex items-center gap-1.5 transition-all hover:scale-[1.02] shadow-sm",
                        LAYER_COLORS[c.layer],
                      )}
                    >
                      <Boxes className="size-3 shrink-0" />
                      <span>{c.name}</span>
                      <ChevronRight className="size-3 opacity-60 ml-0.5" />
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* ═══ Tab 2: Low Level Sequence Design (LLD) ═══ */}
          {tab === "lld" && (
            <motion.div
              key="lld"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className="neu p-6 space-y-4"
            >
              <div className="flex flex-wrap items-center justify-between border-b border-border/60 pb-3 gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-indigo-500/15 px-2 py-0.5 text-[10px] font-bold text-indigo-600 dark:text-indigo-400">
                      Diagram 2 of 4: Sequence Execution
                    </span>
                    <h2 className="font-display text-base font-extrabold">
                      Low-Level Service Interaction Flows (LLD)
                    </h2>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Step-by-step synchronous RPC interaction and asynchronous message streaming for {workspaceContext.businessName}.
                  </p>
                </div>
                <span className="text-[10px] font-mono text-muted-foreground">
                  End-to-End Sequence Trace
                </span>
              </div>

              <div className="overflow-x-auto rounded-xl bg-card/60 p-4 border border-border/60">
                <Mermaid key="lld" chart={blueprint.lldDiagram} />
              </div>
            </motion.div>
          )}

          {/* ═══ Tab 3: Component & 5-Layer Topology Diagram ═══ */}
          {tab === "components" && (
            <motion.div
              key="components"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className="neu p-6 space-y-5"
            >
              <div className="flex flex-wrap items-center justify-between border-b border-border/60 pb-3 gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-teal-500/15 px-2 py-0.5 text-[10px] font-bold text-teal-600 dark:text-teal-400">
                      Diagram 3 of 4: Node Mesh
                    </span>
                    <h2 className="font-display text-base font-extrabold">
                      Component & 5-Layer Topology Architecture
                    </h2>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Detailed component layout across Client, Edge Ingress, Core Microservices, AI/Worker Pipeline, and Persistence stores.
                  </p>
                </div>
                <span className="text-[10px] font-mono text-muted-foreground">5-Layer Architecture Graph</span>
              </div>

              <div className="overflow-x-auto rounded-xl bg-card/60 p-4 border border-border/60">
                <Mermaid key="topology" chart={blueprint.topologyDiagram} />
              </div>

              {/* Component Node Directory Cards */}
              <div className="pt-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
                  Node Specification Cards (Click to inspect complete technical contract):
                </h3>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {blueprint.components.map((c) => (
                    <motion.div
                      key={c.id}
                      whileHover={{ y: -3 }}
                      onClick={() => setSelectedComponent(c)}
                      className="neu p-5 cursor-pointer rounded-2xl border border-border/70 hover:border-primary/50 transition-all flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <span
                            className={cn(
                              "rounded-md border px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider",
                              LAYER_COLORS[c.layer],
                            )}
                          >
                            {c.layer}
                          </span>
                          <span className="text-[10px] font-mono text-primary font-bold">
                            {c.availabilitySla}
                          </span>
                        </div>
                        <h4 className="font-display text-sm font-bold text-foreground">{c.name}</h4>
                        <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed line-clamp-2">
                          {c.description}
                        </p>
                      </div>

                      <div className="mt-4 pt-3 border-t border-border/50 flex items-center justify-between text-xs">
                        <div className="flex flex-wrap gap-1">
                          {c.techStack.slice(0, 2).map((t) => (
                            <span
                              key={t}
                              className="rounded bg-accent/60 px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground"
                            >
                              {t}
                            </span>
                          ))}
                          {c.techStack.length > 2 && (
                            <span className="text-[10px] text-muted-foreground">
                              +{c.techStack.length - 2}
                            </span>
                          )}
                        </div>
                        <span className="text-primary font-semibold flex items-center gap-0.5 text-[11px]">
                          Inspect <ArrowRight className="size-3" />
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* ═══ Tab 4: Security Boundaries & SLA Diagram ═══ */}
          {tab === "sla" && (
            <motion.div
              key="sla"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className="neu p-6 space-y-5"
            >
              <div className="flex flex-wrap items-center justify-between border-b border-border/60 pb-3 gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                      Diagram 4 of 4: Zero-Trust Security
                    </span>
                    <h2 className="font-display text-base font-extrabold">
                      Security Boundaries & Network SLA Flow
                    </h2>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Zero-trust network segmentation, DMZ ingress, isolated VPC subnets, and certified uptime targets.
                  </p>
                </div>
                <span className="text-[10px] font-mono text-muted-foreground">
                  {blueprint.summary.primarySla}
                </span>
              </div>

              <div className="overflow-x-auto rounded-xl bg-card/60 p-4 border border-border/60">
                <Mermaid key="sla" chart={blueprint.securitySlaDiagram} />
              </div>

              {/* Enterprise Security Policies & Latency Budgets Table */}
              <div className="pt-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
                  Enterprise Security Policies & Latency Budgets
                </h3>
                <div className="overflow-x-auto rounded-xl border border-border/60 bg-card/40">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground border-b border-border bg-surface/60">
                        <th className="px-4 py-3 font-semibold">Service Node</th>
                        <th className="px-4 py-3 font-semibold">Availability SLA</th>
                        <th className="px-4 py-3 font-semibold">Latency Target</th>
                        <th className="px-4 py-3 font-semibold">Primary Security Policy</th>
                        <th className="px-4 py-3 font-semibold">Autoscaling Rule</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/60">
                      {blueprint.components.map((c) => (
                        <tr
                          key={c.id}
                          onClick={() => setSelectedComponent(c)}
                          className="hover:bg-card/60 transition-colors cursor-pointer"
                        >
                          <td className="px-4 py-3 font-bold text-foreground flex items-center gap-1.5">
                            <span className="size-2 rounded-full bg-emerald-500" />
                            {c.name}
                          </td>
                          <td className="px-4 py-3 font-mono font-semibold text-primary">
                            {c.availabilitySla}
                          </td>
                          <td className="px-4 py-3 font-mono text-muted-foreground">
                            {c.latencyBudget}
                          </td>
                          <td className="px-4 py-3 text-muted-foreground max-w-[220px] truncate">
                            {c.securityPolicies[0]}
                          </td>
                          <td className="px-4 py-3 text-muted-foreground max-w-[200px] truncate">
                            {c.scalingConsiderations[0]}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}

          {/* ═══ Architecture Rationale Cards ═══ */}
          <div className="neu p-6">
            <h2 className="font-display text-base font-bold">Key Architectural Decisions</h2>
            <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {blueprint.keyDecisions.map((item) => (
                <div key={item.title} className="neu-inset p-4 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-foreground">{item.title}</p>
                    <span className="rounded bg-primary/10 px-1.5 py-0.2 text-[9px] font-bold text-primary uppercase">
                      {item.badge}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{item.detail}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </GenerationSequence>

      {/* ═══ Component Inspection Slide-Out Drawer ═══ */}
      <AnimatePresence>
        {selectedComponent && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedComponent(null)}
              className="fixed inset-0 z-50 bg-foreground/20 backdrop-blur-sm"
            />

            <motion.aside
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 380, damping: 30 }}
              className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-lg bg-card/95 backdrop-blur-xl border-l border-border shadow-2xl flex flex-col overflow-hidden"
            >
              {/* Drawer Header */}
              <div className="p-5 border-b border-border flex items-center justify-between bg-surface/80">
                <div className="flex items-center gap-3">
                  <div className="grid size-10 place-items-center rounded-xl bg-primary/15 text-primary shadow-inner">
                    <Cpu className="size-5" />
                  </div>
                  <div>
                    <span
                      className={cn(
                        "rounded px-1.5 py-0.2 text-[9px] font-bold uppercase tracking-wider",
                        LAYER_COLORS[selectedComponent.layer],
                      )}
                    >
                      {selectedComponent.layer}
                    </span>
                    <h3 className="font-display font-extrabold text-base tracking-tight mt-0.5">
                      {selectedComponent.name}
                    </h3>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedComponent(null)}
                  className="grid size-8 place-items-center rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="size-4" />
                </button>
              </div>

              {/* Drawer Body */}
              <div className="flex-1 overflow-y-auto p-5 space-y-6 text-xs">
                {/* Metrics Bar */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="neu-inset p-3">
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold flex items-center gap-1">
                      <Clock className="size-3 text-primary" /> Latency Budget
                    </p>
                    <p className="font-mono text-sm font-bold text-foreground mt-0.5">
                      {selectedComponent.latencyBudget}
                    </p>
                  </div>
                  <div className="neu-inset p-3">
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold flex items-center gap-1">
                      <Activity className="size-3 text-emerald-500" /> Availability Target
                    </p>
                    <p className="font-mono text-sm font-bold text-primary mt-0.5">
                      {selectedComponent.availabilitySla}
                    </p>
                  </div>
                </div>

                {/* Description */}
                <div className="neu p-4 rounded-xl space-y-1.5">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">
                    Functional Overview
                  </p>
                  <p className="text-muted-foreground leading-relaxed text-xs">
                    {selectedComponent.description}
                  </p>
                </div>

                {/* Technology Stack */}
                <div className="neu p-4 rounded-xl space-y-2">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold flex items-center gap-1.5">
                    <Code2 className="size-3.5 text-primary" /> Technology Stack
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedComponent.techStack.map((tech) => (
                      <span
                        key={tech}
                        className="rounded-lg border border-border bg-card px-2.5 py-1 text-xs font-mono font-semibold text-foreground shadow-sm"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Security Policies */}
                <div className="neu p-4 rounded-xl space-y-2">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold flex items-center gap-1.5">
                    <ShieldCheck className="size-3.5 text-primary" /> Security & Compliance Policies
                  </p>
                  <ul className="space-y-2 text-muted-foreground">
                    {selectedComponent.securityPolicies.map((sec, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <Check className="size-3.5 text-emerald-500 shrink-0 mt-0.5" />
                        <span>{sec}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Scaling Considerations */}
                <div className="neu p-4 rounded-xl space-y-2">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold flex items-center gap-1.5">
                    <Zap className="size-3.5 text-primary" /> Scaling & High-Availability Specs
                  </p>
                  <ul className="space-y-2 text-muted-foreground">
                    {selectedComponent.scalingConsiderations.map((scale, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <ArrowRight className="size-3.5 text-primary shrink-0 mt-0.5" />
                        <span>{scale}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Data Ingress & Egress */}
                <div className="neu p-4 rounded-xl space-y-2.5">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold flex items-center gap-1.5">
                    <Database className="size-3.5 text-primary" /> Data Contracts
                  </p>
                  <div className="space-y-2">
                    <div className="p-2.5 rounded-lg bg-surface/60 border border-border/60">
                      <span className="text-[10px] uppercase tracking-wider text-primary font-bold">
                        Ingress Payload
                      </span>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        {selectedComponent.dataIngress}
                      </p>
                    </div>
                    <div className="p-2.5 rounded-lg bg-surface/60 border border-border/60">
                      <span className="text-[10px] uppercase tracking-wider text-sage font-bold">
                        Egress Response
                      </span>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        {selectedComponent.dataEgress}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Drawer Footer */}
              <div className="p-4 border-t border-border bg-surface/90 flex items-center justify-between">
                <span className="text-[10px] text-muted-foreground font-mono">
                  ID: {selectedComponent.id}
                </span>
                <button
                  onClick={() => setSelectedComponent(null)}
                  className="neu-press rounded-xl bg-primary px-4 py-2 text-xs font-bold text-primary-foreground"
                >
                  Done Inspecting
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </AppShell>
  );
}
