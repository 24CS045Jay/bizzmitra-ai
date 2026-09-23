import { useEffect, useState, useMemo } from "react";
import {
  Monitor,
  Tablet,
  Smartphone,
  Sparkles,
  Search,
  CheckCircle2,
} from "lucide-react";
import { motion } from "framer-motion";

import {
  getWireframeBlueprint,
  type ScreenConcept,
  type ScreenConceptId,
  type ViewportMode,
  type WireframeBlueprint,
} from "@/lib/wireframes-data";

export function WireframeVisualizer({
  blueprint: propBlueprint,
}: {
  blueprint?: WireframeBlueprint;
}) {
  const [activeScreen, setActiveScreen] = useState<ScreenConceptId>("dashboard");
  const [viewport, setViewport] = useState<ViewportMode>("desktop");
  const [showAnnotations, setShowAnnotations] = useState<boolean>(true);
  const [kanbanFilter, setKanbanFilter] = useState<string>("");
  const [workspaceContext, setWorkspaceContext] = useState<{
    businessName: string;
    industry: string;
    problemStatement?: string;
  }>({
    businessName: "Enterprise Workspace",
    industry: "Digital Operations",
    problemStatement: "",
  });

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem("bizzmitra.workspaceContext");
      if (raw) {
        const parsed = JSON.parse(raw);
        setWorkspaceContext({
          businessName: parsed.businessName || "Enterprise Workspace",
          industry: parsed.industry || "Digital Operations",
          problemStatement: parsed.problemStatement || "",
        });
      }
    } catch {}
  }, []);

  const fallbackBlueprint = useMemo(() => getWireframeBlueprint(workspaceContext), [workspaceContext]);

  const screenConcepts: ScreenConcept[] = useMemo(() => {
    const raw: any = propBlueprint;
    if (raw?.screenConcepts && Array.isArray(raw.screenConcepts) && raw.screenConcepts.length > 0) {
      return raw.screenConcepts;
    }
    if (raw?.screens && Array.isArray(raw.screens) && raw.screens.length > 0) {
      return raw.screens.map((s: any, idx: number) => ({
        id: (s.id || `screen-${idx + 1}`) as ScreenConceptId,
        title: s.title || `Screen ${idx + 1}`,
        category: s.actor || "Enterprise View",
        description: s.userStory || "",
        uxHighlights: Array.isArray(s.components) ? s.components : ["Live Operations Queue", "Real-Time Telemetry"],
        mockData: fallbackBlueprint.screenConcepts[idx % fallbackBlueprint.screenConcepts.length]?.mockData || fallbackBlueprint.screenConcepts[0]!.mockData,
      }));
    }
    return fallbackBlueprint.screenConcepts;
  }, [propBlueprint, fallbackBlueprint]);

  const currentConcept: ScreenConcept = useMemo(() => {
    return (
      screenConcepts.find((s) => s.id === activeScreen) ||
      screenConcepts[0] ||
      fallbackBlueprint.screenConcepts[0]!
    );
  }, [screenConcepts, activeScreen, fallbackBlueprint]);

  const mock = currentConcept.mockData;

  const viewportWidthClass =
    viewport === "mobile"
      ? "max-w-[380px]"
      : viewport === "tablet"
        ? "max-w-[768px]"
        : "w-full max-w-[1180px]";

  return (
    <div className="space-y-6">
      {/* Top Controls Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border/80 bg-card/70 p-4 shadow-sm backdrop-blur-md">
        {/* Screen Concept Tabs */}
        <div className="flex flex-wrap items-center gap-2">
          {screenConcepts.map((concept) => (
            <button
              key={concept.id}
              type="button"
              onClick={() => setActiveScreen(concept.id)}
              className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-semibold transition-all ${
                activeScreen === concept.id
                  ? "bg-primary text-primary-foreground shadow-sm glow-primary"
                  : "neu-sm neu-press text-muted-foreground hover:text-foreground"
              }`}
            >
              <span>{concept.title}</span>
              <span className="text-[10px] opacity-70">({concept.category})</span>
            </button>
          ))}
        </div>

        {/* Viewport Switcher & Annotation Toggle */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setShowAnnotations((prev) => !prev)}
            className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition-all ${
              showAnnotations
                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                : "border border-border/60 text-muted-foreground hover:text-foreground"
            }`}
          >
            {showAnnotations ? "✓ UX Annotations ON" : "UX Annotations OFF"}
          </button>

          <div className="flex items-center rounded-xl border border-border/80 bg-surface/80 p-1 shadow-xs">
            <button
              type="button"
              onClick={() => setViewport("desktop")}
              title="Desktop View (1440px)"
              className={`grid size-8 place-items-center rounded-lg text-xs transition-all ${
                viewport === "desktop"
                  ? "bg-primary text-primary-foreground font-bold shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Monitor className="size-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewport("tablet")}
              title="Tablet View (768px)"
              className={`grid size-8 place-items-center rounded-lg text-xs transition-all ${
                viewport === "tablet"
                  ? "bg-primary text-primary-foreground font-bold shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Tablet className="size-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewport("mobile")}
              title="Mobile View (375px)"
              className={`grid size-8 place-items-center rounded-lg text-xs transition-all ${
                viewport === "mobile"
                  ? "bg-primary text-primary-foreground font-bold shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Smartphone className="size-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Screen Overview & UX Recommendations */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="md:col-span-2 rounded-2xl border border-border/80 bg-card/60 p-5 backdrop-blur-md">
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary font-mono uppercase">
              {currentConcept.category}
            </span>
            <h3 className="font-display text-base font-bold text-foreground">
              {currentConcept.title}
            </h3>
          </div>
          <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
            {currentConcept.description}
          </p>
        </div>

        <div className="rounded-2xl border border-border/80 bg-card/60 p-5 backdrop-blur-md">
          <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
            <Sparkles className="size-3.5 text-primary" />
            <span>AI UX Recommendations</span>
          </div>
          <ul className="mt-2 space-y-1.5 text-[11px] text-muted-foreground">
            {currentConcept.uxHighlights.map((hl, idx) => (
              <li key={idx} className="flex items-start gap-1.5">
                <CheckCircle2 className="size-3 shrink-0 text-emerald-500 mt-0.5" />
                <span>{hl}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Canvas Viewport Mockup Frame */}
      <div className="flex justify-center overflow-x-auto rounded-3xl border border-border/80 bg-surface/40 p-4 sm:p-8 backdrop-blur-xs">
        <motion.div
          layout
          transition={{ type: "spring", stiffness: 300, damping: 28 }}
          className={`w-full ${viewportWidthClass} overflow-hidden rounded-2xl border border-border/90 bg-card shadow-2xl transition-all duration-300`}
        >
          {/* Browser / Device Chrome Bar */}
          <div className="flex items-center justify-between border-b border-border/70 bg-surface-2/90 px-4 py-2.5">
            <div className="flex items-center gap-1.5">
              <span className="size-2.5 rounded-full bg-rose-500/80" />
              <span className="size-2.5 rounded-full bg-amber-500/80" />
              <span className="size-2.5 rounded-full bg-emerald-500/80" />
            </div>

            <div className="flex items-center gap-2 rounded-lg border border-border/60 bg-background/80 px-3 py-1 text-[10px] font-mono text-muted-foreground shadow-2xs">
              <span className="text-emerald-500">https://</span>
              <span>app.bizzmitra.ai/{activeScreen}</span>
            </div>

            <div className="text-[10px] font-mono text-muted-foreground uppercase">
              {viewport.toUpperCase()}
            </div>
          </div>

          {/* Interactive Screen Concept Renderer */}
          <div className="p-5 sm:p-6 space-y-5 min-h-[460px]">
            {/* Header Area */}
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <div>
                <h4 className="font-display text-sm font-bold text-foreground">
                  {mock.headerTitle}
                </h4>
                <p className="text-[10px] text-muted-foreground">
                  {mock.headerSubtitle}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="rounded-md bg-emerald-500/10 px-2 py-0.5 text-[9px] font-bold text-emerald-600 dark:text-emerald-400">
                  {mock.liveBadge}
                </span>
                <button className="rounded-lg bg-primary px-3 py-1 text-[11px] font-bold text-primary-foreground shadow-2xs">
                  {mock.actionLabel}
                </button>
              </div>
            </div>

            {/* KPI Metrics Strip */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {mock.kpis.map((k, i) => (
                <div
                  key={i}
                  className="rounded-xl border border-border/70 bg-surface/60 p-3 shadow-2xs"
                >
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                    {k.label}
                  </p>
                  <p className="mt-1 font-display text-base font-extrabold text-foreground">
                    {k.val}
                  </p>
                  <p className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400">
                    {k.change}
                  </p>
                </div>
              ))}
            </div>

            {/* Screen-Specific Content */}
            {activeScreen === "pipeline" && mock.kanbanColumns && mock.kanbanColumns.length > 0 ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-display text-xs font-bold text-foreground">
                      Operational Workflow Pipeline
                    </span>
                    <span className="rounded bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary font-mono">
                      {mock.kanbanColumns.length} Stages
                    </span>
                  </div>
                  <div className="flex items-center gap-1 rounded-lg border border-border/70 bg-surface/80 px-2 py-1 text-xs">
                    <Search className="size-3 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="Filter records..."
                      value={kanbanFilter}
                      onChange={(e) => setKanbanFilter(e.target.value)}
                      className="w-24 sm:w-36 bg-transparent text-[11px] outline-none text-foreground placeholder:text-muted-foreground"
                    />
                  </div>
                </div>

                {/* Multi-Column Kanban Board */}
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
                  {mock.kanbanColumns.map((col, idx) => {
                    const filteredItems = kanbanFilter.trim()
                      ? col.items.filter(
                          (item) =>
                            item.name.toLowerCase().includes(kanbanFilter.toLowerCase()) ||
                            item.meta.toLowerCase().includes(kanbanFilter.toLowerCase()) ||
                            item.tag.toLowerCase().includes(kanbanFilter.toLowerCase())
                        )
                      : col.items;
                    return (
                      <div
                        key={idx}
                        className="rounded-xl border border-border/70 bg-surface/50 p-3 space-y-2.5"
                      >
                        <div className="flex items-center justify-between pb-1 border-b border-border/40">
                          <span className="text-[11px] font-bold text-foreground truncate">
                            {col.title}
                          </span>
                          <span className="size-2 rounded-full bg-primary" />
                        </div>
                        <div className="space-y-2">
                          {filteredItems.map((item, ci) => (
                            <div
                              key={ci}
                              className="rounded-lg border border-border/70 bg-card p-2.5 shadow-2xs text-[11px] space-y-1.5 hover:border-primary/50 transition-colors"
                            >
                              <p className="font-bold text-foreground leading-tight">
                                {item.name}
                              </p>
                              <p className="text-[10px] text-muted-foreground leading-snug">
                                {item.meta}
                              </p>
                              <div className="flex items-center justify-between pt-1 border-t border-border/40 text-[9px]">
                                <span className="font-semibold text-primary">{item.tag}</span>
                                <span className="rounded bg-muted/80 px-1.5 py-0.2 font-mono text-muted-foreground">
                                  {item.urgency}
                                </span>
                              </div>
                            </div>
                          ))}
                          {filteredItems.length === 0 && (
                            <div className="py-4 text-center text-[10px] text-muted-foreground italic">
                              No matching records
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              /* Standard Funnel / Visual Breakdown & Activity Strip */
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="sm:col-span-2 rounded-xl border border-border/70 bg-surface/60 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-foreground">
                      {mock.visualWidgetTitle}
                    </span>
                    <span className="text-[10px] font-mono text-muted-foreground">
                      {mock.visualWidgetSubtitle}
                    </span>
                  </div>
                  <div className="space-y-2.5 pt-2">
                    {mock.stages.map((bar, idx) => (
                      <div key={idx} className="space-y-1">
                        <div className="flex justify-between text-[10px]">
                          <span className="font-semibold text-foreground">{bar.stage}</span>
                          <span className="font-mono text-muted-foreground">
                            {bar.count} ({bar.pct}%)
                          </span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-muted/60 overflow-hidden">
                          <div
                            className="h-full bg-primary rounded-full transition-all duration-300"
                            style={{ width: `${bar.pct}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-xl border border-border/70 bg-surface/60 p-4 space-y-2">
                  <span className="text-xs font-bold text-foreground">
                    {mock.activityTitle}
                  </span>
                  <div className="space-y-2 pt-1 text-[11px] text-muted-foreground">
                    {mock.activities.map((act, ai) => (
                      <div
                        key={ai}
                        className="rounded-lg bg-card/80 p-2 border border-border/50 space-y-0.5"
                      >
                        <p className="font-semibold text-foreground text-[11px] leading-tight">
                          {act.title}
                        </p>
                        <p className="text-[9px] text-muted-foreground leading-snug">
                          {act.subtitle}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
