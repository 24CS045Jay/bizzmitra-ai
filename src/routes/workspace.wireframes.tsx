import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Sparkles,
  Layout,
  Compass,
  Layers,
  Cpu,
  RefreshCw,
  Copy,
  Check,
  Zap,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
  FileCode2,
} from "lucide-react";
import { toast } from "sonner";

import { AppShell } from "@/components/AppShell";
import { ArtifactHeader } from "@/components/ArtifactHeader";
import { GenerationSequence } from "@/components/GenerationSequence";
import { Mermaid } from "@/components/Mermaid";
import { GENERATION_STEPS, generateArtifact } from "@/lib/ai/generate-artifact";
import { getWireframeBlueprint, type ScreenConceptId } from "@/lib/wireframes-data";
import { WireframeVisualizer } from "@/components/WireframeVisualizer";
import { useStageGate, StageNextButton } from "@/lib/workspace-stage-gate";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/workspace/wireframes")({
  head: () => ({
    meta: [
      { title: "AI UX Designer & Wireframes — BizzMitra-AI" },
      {
        name: "description",
        content:
          "Interactive screen concepts, responsive wireframes, and navigation flows generated dynamically by the AI UX Designer for any business problem statement.",
      },
      { property: "og:title", content: "AI UX Designer & Wireframes — BizzMitra-AI" },
      {
        property: "og:description",
        content: "Dynamic interactive wireframes and navigation flow concepts tailored to your problem statement.",
      },
    ],
  }),
  component: WireframesPage,
});

// Quick testing scenarios for instant validation of multi-domain wireframes
const TEST_PRESETS = [
  {
    name: "⚡ QuickCart Dark Store",
    industry: "Quick-Commerce & Retail",
    businessName: "QuickCart 10-Min Delivery",
    problemStatement:
      "QuickCart is a 10-minute quick commerce delivery service operating 42 dark stores across metro cities. Dark store order pickers face intense pressure to pick and pack orders within 3 minutes, leading to high mispick rates and inventory discrepancies.",
  },
  {
    name: "💳 FinTech Micro-Lending",
    industry: "FinTech & Digital Lending",
    businessName: "FinPulse Credit Engine",
    problemStatement:
      "FinTech micro-lending platform for small businesses with automated KYC, bureau scoring, and instant credit underwriting. Manual verification creates 48-hour disbursal backlog and customer drop-off.",
  },
  {
    name: "☀️ SolarPulse CleanTech",
    industry: "Renewable Energy & Solar",
    businessName: "SolarPulse Energy Networks",
    problemStatement:
      "Solar inverter telemetry, arc-fault sensor tracking, and technician dispatch for commercial solar power arrays across utility grids.",
  },
  {
    name: "🏥 MediPulse Clinical Lab",
    industry: "Healthcare & Diagnostics",
    businessName: "MediPulse Diagnostic Labs",
    problemStatement:
      "Diagnostic pathology laboratory with automated sample barcoding, LIS analyzer bidirectional telemetry, and rapid doctor report delivery.",
  },
  {
    name: "🚚 FleetCommand Logistics",
    industry: "Freight Logistics & Cold Chain",
    businessName: "FleetCommand Freightways",
    problemStatement:
      "Interstate freight logistics with GPS fleet dispatch, fuel sensor telematics, cold chain temperature monitoring, and automated driver proof-of-delivery.",
  },
  {
    name: "🎓 EduMatrix LMS Platform",
    industry: "EdTech & Learning Architecture",
    businessName: "EduMatrix Online Academy",
    problemStatement:
      "Higher-education learning platform with student assessment submissions, automated code/essay scoring, curriculum tracking, and blockchain credential certification.",
  },
];

function WireframesPage() {
  useStageGate("wireframes");

  // Load synchronous initial context
  const [workspaceContext, setWorkspaceContext] = useState<{
    businessName: string;
    industry: string;
    problemStatement: string;
  }>(() => {
    if (typeof window !== "undefined") {
      try {
        const raw = window.localStorage.getItem("bizzmitra.workspaceContext");
        if (raw) {
          const parsed = JSON.parse(raw);
          return {
            businessName: parsed.businessName || parsed.name || "Enterprise Workspace",
            industry: parsed.industry || "Cross-Industry",
            problemStatement: parsed.problemStatement || parsed.summary || parsed.description || "",
          };
        }
      } catch {}
    }
    return {
      businessName: "Enterprise Workspace",
      industry: "Cross-Industry",
      problemStatement: "",
    };
  });

  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [customProblem, setCustomProblem] = useState("");
  const [customBusinessName, setCustomBusinessName] = useState("");
  const [customIndustry, setCustomIndustry] = useState("");
  const [inventoryFilter, setInventoryFilter] = useState<"all" | ScreenConceptId>("all");
  const [copiedSpec, setCopiedSpec] = useState(false);

  // Sync workspace from Supabase or localStorage
  useEffect(() => {
    async function syncContext() {
      try {
        let loadedText = "";
        let bName = "Enterprise Workspace";
        let ind = "Cross-Industry";

        const raw = window.localStorage.getItem("bizzmitra.workspaceContext");
        if (raw) {
          const parsed = JSON.parse(raw);
          loadedText = parsed.problemStatement || parsed.summary || parsed.description || "";
          bName = parsed.businessName || parsed.name || bName;
          ind = parsed.industry || ind;
        }

        const wsId = window.localStorage.getItem("bizzmitra.activeWorkspaceId");
        if (wsId && !wsId.startsWith("ws-")) {
          const { data: ws } = await supabase
            .from("workspaces")
            .select("problem_statement, name, industry")
            .eq("id", wsId)
            .maybeSingle();

          if (ws?.problem_statement) {
            loadedText = ws.problem_statement;
            if (ws.name) bName = ws.name;
            if (ws.industry) ind = ws.industry;
          }
        }

        setWorkspaceContext({
          businessName: bName,
          industry: ind,
          problemStatement: loadedText,
        });
        setCustomProblem(loadedText);
        setCustomBusinessName(bName);
        setCustomIndustry(ind);
      } catch (e) {
        console.warn("[WireframesPage] Context sync error:", e);
      }
    }

    void syncContext();

    window.addEventListener("bizzmitra:workspace-updated", syncContext);
    window.addEventListener("storage", syncContext);
    return () => {
      window.removeEventListener("bizzmitra:workspace-updated", syncContext);
      window.removeEventListener("storage", syncContext);
    };
  }, []);

  const [dynamicBlueprint, setDynamicBlueprint] = useState<any>(null);
  const [modelLabel, setModelLabel] = useState("Groq Llama 3.3 70B");

  // Compute the dynamically synthesized blueprint
  const fallbackBlueprint = getWireframeBlueprint(workspaceContext);
  const blueprint = dynamicBlueprint || fallbackBlueprint;

  const handleCopySpec = () => {
    try {
      const spec = JSON.stringify(blueprint, null, 2);
      navigator.clipboard.writeText(spec);
      setCopiedSpec(true);
      toast.success("Copied wireframe specs to clipboard!");
      setTimeout(() => setCopiedSpec(false), 2000);
    } catch {
      toast.error("Failed to copy specs");
    }
  };

  const handleApplyProblem = (bName: string, ind: string, prob: string) => {
    setWorkspaceContext({
      businessName: bName || "Enterprise Workspace",
      industry: ind || "Cross-Industry",
      problemStatement: prob,
    });
    setDynamicBlueprint(null);
    setIsEditorOpen(false);
    toast.success("Synthesizing wireframes for new problem context...");
  };

  const inventoryList = blueprint.screenInventory || [];
  const filteredInventory =
    inventoryFilter === "all"
      ? inventoryList
      : inventoryList.filter((s: any) => s.screenTarget === inventoryFilter);

  const handleRegenerate = async () => {
    const tId = toast.loading("Regenerating UX wireframes with AI...");
    try {
      const res = await generateArtifact("ux", {
        businessName: workspaceContext.businessName,
        industry: workspaceContext.industry,
        problem: workspaceContext.problemStatement,
      }, { forceFresh: true });

      if (res) {
        setDynamicBlueprint(res);
        setModelLabel("Groq Llama 3.3 70B (Fresh)");
        toast.success("UX Wireframes regenerated with AI!", { id: tId });
      }
    } catch {
      toast.error("Failed to regenerate UX wireframes", { id: tId });
    }
  };

  return (
    <AppShell>
      <ArtifactHeader
        id="wireframes"
        kicker="Step 06 • AI UX Designer"
        title="Interactive Wireframes & Screen Concepts"
        onRegenerate={() => void handleRegenerate()}
      />

      {/* Blueprint Context Banner & Problem Statement Bar */}
      <div className="mb-6 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-primary/20 bg-primary/5 p-4 text-xs shadow-xs">
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="flex items-center gap-1.5 rounded-lg bg-primary/10 px-2.5 py-1 text-primary font-bold">
              <Sparkles className="size-3.5" />
              <span>Domain Synthesized</span>
            </div>
            <span className="font-display font-bold text-foreground text-sm">
              {blueprint.domainTitle}
            </span>
            <span className="rounded-full border border-border/60 bg-surface/80 px-2 py-0.5 font-medium text-muted-foreground text-[11px]">
              {workspaceContext.industry}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsEditorOpen((prev) => !prev)}
              className="flex items-center gap-1.5 rounded-xl border border-primary/30 bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary transition-all hover:bg-primary/20"
            >
              <SlidersHorizontal className="size-3.5" />
              <span>{isEditorOpen ? "Close Tester" : "Test Any Problem Statement"}</span>
              {isEditorOpen ? <ChevronUp className="size-3" /> : <ChevronDown className="size-3" />}
            </button>

            <button
              type="button"
              onClick={handleCopySpec}
              className="flex items-center gap-1.5 rounded-xl border border-border/70 bg-card px-3 py-1.5 text-xs font-semibold text-foreground transition-all hover:border-primary/40"
            >
              {copiedSpec ? <Check className="size-3.5 text-emerald-500" /> : <Copy className="size-3.5 text-muted-foreground" />}
              <span>{copiedSpec ? "Copied!" : "Export Specs"}</span>
            </button>
          </div>
        </div>

        {/* Collapsible Problem Statement Tester Drawer */}
        {isEditorOpen && (
          <div className="neu p-5 rounded-2xl border border-primary/20 bg-card/90 space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <div className="flex items-center gap-2">
                <Zap className="size-4 text-primary" />
                <h4 className="font-display text-sm font-bold text-foreground">
                  Universal Problem Statement UX Tester
                </h4>
              </div>
              <span className="text-[11px] text-muted-foreground">
                Enter any problem statement to generate tailored wireframes instantly
              </span>
            </div>

            {/* Quick Testing Presets */}
            <div className="space-y-1.5">
              <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                Quick Multi-Domain Presets:
              </p>
              <div className="flex flex-wrap gap-2">
                {TEST_PRESETS.map((preset) => (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() =>
                      handleApplyProblem(
                        preset.businessName,
                        preset.industry,
                        preset.problemStatement
                      )
                    }
                    className="rounded-lg border border-border/80 bg-surface/70 px-2.5 py-1 text-[11px] font-semibold text-foreground hover:border-primary/50 hover:bg-primary/10 transition-colors"
                  >
                    {preset.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Input Fields */}
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1">
                <label className="text-[11px] font-medium text-muted-foreground">
                  Business / Project Name
                </label>
                <input
                  type="text"
                  value={customBusinessName}
                  onChange={(e) => setCustomBusinessName(e.target.value)}
                  placeholder="e.g. QuickCart 10-Min Delivery"
                  className="w-full rounded-xl border border-border/80 bg-surface/80 px-3 py-1.5 text-xs text-foreground outline-none focus:border-primary"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-medium text-muted-foreground">
                  Domain / Industry
                </label>
                <input
                  type="text"
                  value={customIndustry}
                  onChange={(e) => setCustomIndustry(e.target.value)}
                  placeholder="e.g. Quick-Commerce & Dark Stores"
                  className="w-full rounded-xl border border-border/80 bg-surface/80 px-3 py-1.5 text-xs text-foreground outline-none focus:border-primary"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-medium text-muted-foreground">
                Problem Statement (What operational challenge are you solving?)
              </label>
              <textarea
                rows={3}
                value={customProblem}
                onChange={(e) => setCustomProblem(e.target.value)}
                placeholder="Describe your operational bottleneck, target users, metrics, and core workflow..."
                className="w-full rounded-xl border border-border/80 bg-surface/80 p-3 text-xs text-foreground outline-none focus:border-primary leading-relaxed"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setIsEditorOpen(false)}
                className="rounded-xl border border-border/60 px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() =>
                  handleApplyProblem(customBusinessName, customIndustry, customProblem)
                }
                className="flex items-center gap-1.5 rounded-xl bg-primary px-4 py-1.5 text-xs font-bold text-primary-foreground shadow-sm glow-primary hover:opacity-90"
              >
                <RefreshCw className="size-3.5" />
                <span>Synthesize Wireframes</span>
              </button>
            </div>
          </div>
        )}
      </div>

      <GenerationSequence
        steps={GENERATION_STEPS.ux}
        run={async () => {
          const res: any = await generateArtifact("ux", {
            businessName: workspaceContext.businessName,
            industry: workspaceContext.industry,
            problem: workspaceContext.problemStatement,
          });
          if (res && (res.screens || res.flow)) {
            setDynamicBlueprint(res);
          }
          return res;
        }}
      >
        <div className="space-y-8">
          {/* Main Feature: Interactive Multi-Device Wireframe Visualizer */}
          <div>
            <WireframeVisualizer blueprint={blueprint} />
          </div>

          {/* Screen Concept Inventory with Interactive Target Filtering */}
          <div className="neu p-6 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 pb-3">
              <div className="flex items-center gap-2">
                <Layout className="size-4 text-primary" />
                <h3 className="font-display text-base font-bold text-foreground">
                  Screen Architecture & Component Inventory
                </h3>
              </div>

              {/* Screen Filter Tabs */}
              <div className="flex flex-wrap items-center gap-1.5">
                {(["all", "dashboard", "pipeline", "insights", "settings"] as const).map(
                  (fId) => (
                    <button
                      key={fId}
                      type="button"
                      onClick={() => setInventoryFilter(fId)}
                      className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold capitalize transition-all ${
                        inventoryFilter === fId
                          ? "bg-primary text-primary-foreground shadow-2xs"
                          : "border border-border/60 text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {fId === "all" ? "All Screens" : fId}
                    </button>
                  )
                )}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredInventory.map((w: any) => (
                <div
                  key={w.id}
                  className="neu-sm p-4 rounded-xl border border-border/70 bg-surface/50 space-y-2 hover:border-primary/40 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-primary uppercase font-bold">
                      ID: {w.id}
                    </span>
                    <span className="rounded bg-primary/10 px-2 py-0.5 text-[9px] font-mono text-primary capitalize font-medium">
                      {w.screenTarget}
                    </span>
                  </div>
                  <p className="text-xs font-bold text-foreground">{w.name}</p>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">{w.note}</p>
                </div>
              ))}
            </div>
          </div>

          {/* User Journey & Navigation Flow Diagram */}
          <div className="neu overflow-x-auto p-6 space-y-3">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <div className="flex items-center gap-2">
                <Compass className="size-4 text-primary" />
                <div>
                  <h3 className="font-display text-base font-bold text-foreground">
                    User Journey & Screen Navigation Flow
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    End-to-end navigational routing between screens, core workflows, and administration portals for {workspaceContext.businessName}.
                  </p>
                </div>
              </div>
              <div className="hidden sm:flex items-center gap-1.5 rounded-lg border border-border/60 bg-surface/80 px-2.5 py-1 text-[11px] font-mono text-muted-foreground">
                <FileCode2 className="size-3 text-primary" />
                <span>Mermaid Architecture</span>
              </div>
            </div>
            <div className="mt-4">
              <Mermaid key={blueprint.domainId} chart={blueprint.navFlowDiagram} />
            </div>
          </div>

          {/* Design System Tokens & Accessibility Matrix */}
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="neu-sm p-4 rounded-xl border border-border/70 bg-surface/40 space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-bold text-foreground">
                <Layers className="size-3.5 text-primary" />
                <span>WCAG 2.1 AA Compliance</span>
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                4.5:1 text contrast ratio, clear focus indicators, screen reader labels, and keyboard navigation shortcuts across all screens.
              </p>
            </div>

            <div className="neu-sm p-4 rounded-xl border border-border/70 bg-surface/40 space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-bold text-foreground">
                <Cpu className="size-3.5 text-primary" />
                <span>Responsive Viewport Grid</span>
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Fluid layout adapting seamlessly from Desktop (1440px multi-column) to Tablet (768px split) and Mobile (375px single-column PWA).
              </p>
            </div>

            <div className="neu-sm p-4 rounded-xl border border-border/70 bg-surface/40 space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-bold text-foreground">
                <Sparkles className="size-3.5 text-primary" />
                <span>Sub-100ms Micro-Interactions</span>
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Optimistic UI state transitions, live search filtering, and reactive telemetry without full-page reloads.
              </p>
            </div>
          </div>

          <StageNextButton currentStageId="wireframes" label="Proceed to Data & APIs" />
        </div>
      </GenerationSequence>
    </AppShell>
  );
}

