import { useState } from "react";
import {
  Monitor,
  Tablet,
  Smartphone,
  Layers,
  Sparkles,
  ExternalLink,
  ChevronRight,
  BarChart3,
  Users,
  Search,
  CheckCircle2,
  TrendingUp,
  Settings,
  Bell,
  ArrowUpRight,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export type ViewportMode = "desktop" | "tablet" | "mobile";
export type ScreenConceptId = "dashboard" | "pipeline" | "insights" | "settings";

interface ScreenConcept {
  id: ScreenConceptId;
  title: string;
  category: string;
  description: string;
  uxHighlights: string[];
}

export const SCREEN_CONCEPTS: ScreenConcept[] = [
  {
    id: "dashboard",
    title: "Executive Operations Hub",
    category: "Primary Workspace",
    description: "High-density command center with live operational KPIs, funnel velocity, and actionable quick triggers.",
    uxHighlights: [
      "F-pattern information hierarchy prioritizing throughput alerts",
      "One-click status transitions reducing clicks by 65%",
      "Real-time reactive telemetry without page reloads",
    ],
  },
  {
    id: "pipeline",
    title: "Interactive Talent Pipeline",
    category: "Core Flow",
    description: "Multi-stage Kanban and list view for candidate tracking with automated status progressions.",
    uxHighlights: [
      "Color-coded SLA urgency indicators for candidate retention",
      "Inline quick-action modal for instant client interviews",
      "Keyboard shortcut navigation (J/K navigation, 1-4 stage move)",
    ],
  },
  {
    id: "insights",
    title: "Performance & Cost Analytics",
    category: "Intelligence",
    description: "Predictive throughput forecasting, recruiter productivity benchmarks, and cost-per-hire telemetry.",
    uxHighlights: [
      "Interactive time-horizon scrubber (7d, 30d, 90d, YTD)",
      "Automated anomaly detection callouts with AI guidance",
      "One-click report generator exportable to PDF and Excel",
    ],
  },
  {
    id: "settings",
    title: "Enterprise Governance & Integrations",
    category: "Administration",
    description: "Security roles, webhook monitors, API access tokens, and organizational billing configuration.",
    uxHighlights: [
      "Zero-trust permission toggles with audit confirmation",
      "Live API health ping and latency monitoring graph",
      "Razorpay INR billing portal with real-time tax invoices",
    ],
  },
];

export function WireframeVisualizer() {
  const [activeScreen, setActiveScreen] = useState<ScreenConceptId>("dashboard");
  const [viewport, setViewport] = useState<ViewportMode>("desktop");
  const [showAnnotations, setShowAnnotations] = useState<boolean>(true);

  const currentConcept = SCREEN_CONCEPTS.find((s) => s.id === activeScreen) || SCREEN_CONCEPTS[0]!;

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
          {SCREEN_CONCEPTS.map((concept) => (
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
            {activeScreen === "dashboard" && (
              <div className="space-y-4">
                {/* Mock Header */}
                <div className="flex items-center justify-between border-b border-border/60 pb-3">
                  <div>
                    <h4 className="font-display text-sm font-bold text-foreground">TalentCraft Executive Command</h4>
                    <p className="text-[10px] text-muted-foreground">Real-time candidate telemetry & placement velocity</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-md bg-emerald-500/10 px-2 py-0.5 text-[9px] font-bold text-emerald-600 dark:text-emerald-400">
                      ● Live Syncing
                    </span>
                    <button className="rounded-lg bg-primary px-3 py-1 text-[11px] font-bold text-primary-foreground shadow-2xs">
                      + New Candidate
                    </button>
                  </div>
                </div>

                {/* KPI Metrics Strip */}
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {[
                    { label: "Active Pipeline", val: "428 Candidates", change: "+14% vs last wk" },
                    { label: "Interview Turnaround", val: "9.2 Days", change: "-67% faster (SLA)" },
                    { label: "Placement Revenue", val: "₹18.4 Lakhs", change: "+24% MoM" },
                    { label: "Recruiter Utilization", val: "94.2%", change: "8 of 8 active" },
                  ].map((k, i) => (
                    <div key={i} className="rounded-xl border border-border/70 bg-surface/60 p-3 shadow-2xs">
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{k.label}</p>
                      <p className="mt-1 font-display text-base font-extrabold text-foreground">{k.val}</p>
                      <p className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400">{k.change}</p>
                    </div>
                  ))}
                </div>

                {/* Chart & Activity Feed */}
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="sm:col-span-2 rounded-xl border border-border/70 bg-surface/60 p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-foreground">Placement Velocity Funnel</span>
                      <span className="text-[10px] font-mono text-muted-foreground">Weekly Aggregate</span>
                    </div>
                    <div className="space-y-2 pt-2">
                      {[
                        { stage: "Sourced & Screened", count: 428, pct: 100 },
                        { stage: "Technical Evaluation", count: 184, pct: 43 },
                        { stage: "Client Final Round", count: 72, pct: 17 },
                        { stage: "Offer Accepted", count: 48, pct: 11 },
                      ].map((bar, idx) => (
                        <div key={idx} className="space-y-1">
                          <div className="flex justify-between text-[10px]">
                            <span className="font-semibold text-foreground">{bar.stage}</span>
                            <span className="font-mono text-muted-foreground">{bar.count} ({bar.pct}%)</span>
                          </div>
                          <div className="h-2 w-full rounded-full bg-muted/60 overflow-hidden">
                            <div className="h-full bg-primary rounded-full" style={{ width: `${bar.pct}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-xl border border-border/70 bg-surface/60 p-4 space-y-2">
                    <span className="text-xs font-bold text-foreground">Live Recruiter Feed</span>
                    <div className="space-y-2 pt-1 text-[11px] text-muted-foreground">
                      <div className="rounded-lg bg-card/80 p-2 border border-border/50">
                        <p className="font-semibold text-foreground">Rahul S. placed Senior React Dev</p>
                        <p className="text-[9px] text-muted-foreground">₹28 LPA CTC • TechCorp Client</p>
                      </div>
                      <div className="rounded-lg bg-card/80 p-2 border border-border/50">
                        <p className="font-semibold text-foreground">Priya V. completed 8 screens</p>
                        <p className="text-[9px] text-muted-foreground">Turnaround: 18 mins avg</p>
                      </div>
                      <div className="rounded-lg bg-card/80 p-2 border border-border/50">
                        <p className="font-semibold text-foreground">AI Parsed 42 New Resumes</p>
                        <p className="text-[9px] text-emerald-600 font-bold">100% matched to open roles</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeScreen === "pipeline" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-border/60 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="font-display text-sm font-bold text-foreground">Candidate Kanban Board</span>
                    <span className="rounded bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary font-mono">
                      4 Stages
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 rounded-lg border border-border/70 bg-surface/80 px-2 py-1 text-xs">
                      <Search className="size-3 text-muted-foreground" />
                      <input
                        type="text"
                        placeholder="Filter talent..."
                        className="w-24 sm:w-36 bg-transparent text-[11px] outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* 4 Stage Columns */}
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
                  {[
                    { stage: "Screening (82)", items: ["Arjun Mehta (Lead Architect)", "Neha Sharma (Product Designer)"] },
                    { stage: "Interview (34)", items: ["Devansh Patel (Fullstack Go)", "Rohan Joshi (DevOps Eng)"] },
                    { stage: "Offer Made (12)", items: ["Kavya Nair (Data Engineer)", "Siddharth Rao (Security Lead)"] },
                    { stage: "Hired (48)", items: ["Ananya Sen (Engineering Mgr)", "Vikram Roy (Frontend Dev)"] },
                  ].map((col, idx) => (
                    <div key={idx} className="rounded-xl border border-border/70 bg-surface/50 p-3 space-y-2">
                      <div className="flex items-center justify-between pb-1 border-b border-border/40">
                        <span className="text-[11px] font-bold text-foreground">{col.stage}</span>
                        <span className="size-2 rounded-full bg-primary" />
                      </div>
                      {col.items.map((candidate, ci) => (
                        <div
                          key={ci}
                          className="rounded-lg border border-border/70 bg-card p-2.5 shadow-2xs text-[11px] space-y-1 hover:border-primary/50 transition-colors"
                        >
                          <p className="font-bold text-foreground leading-tight">{candidate}</p>
                          <div className="flex items-center justify-between text-[9px] text-muted-foreground">
                            <span>Notice: 15 Days</span>
                            <span className="font-bold text-emerald-600">Match: 96%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeScreen === "insights" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-border/60 pb-3">
                  <div>
                    <h4 className="font-display text-sm font-bold text-foreground">Transformation Health & Throughput</h4>
                    <p className="text-[10px] text-muted-foreground">Engineering velocity, cost savings, and risk predictions</p>
                  </div>
                  <span className="rounded-full bg-emerald-500/10 px-2.5 py-1 text-[10px] font-extrabold text-emerald-600">
                    Health Score: 94% (Optimal)
                  </span>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-xl border border-border/70 bg-surface/60 p-4 space-y-2">
                    <span className="text-xs font-bold text-foreground">Cost-per-Placement Trend</span>
                    <div className="flex items-baseline gap-2">
                      <span className="font-display text-xl font-extrabold text-foreground">₹2,420</span>
                      <span className="text-xs font-bold text-emerald-600">-64% reduction</span>
                    </div>
                    <p className="text-[10px] text-muted-foreground">Previous manual spreadsheet cost was ₹6,800 per candidate.</p>
                  </div>

                  <div className="rounded-xl border border-border/70 bg-surface/60 p-4 space-y-2">
                    <span className="text-xs font-bold text-foreground">Candidate Conversion Velocity</span>
                    <div className="flex items-baseline gap-2">
                      <span className="font-display text-xl font-extrabold text-foreground">9.2 Days</span>
                      <span className="text-xs font-bold text-emerald-600">18.8 days saved</span>
                    </div>
                    <p className="text-[10px] text-muted-foreground">Automated resume parsing and calendar coordination SLA.</p>
                  </div>
                </div>
              </div>
            )}

            {activeScreen === "settings" && (
              <div className="space-y-4 max-w-xl">
                <div className="border-b border-border/60 pb-3">
                  <h4 className="font-display text-sm font-bold text-foreground">Platform Integrations & Governance</h4>
                  <p className="text-[10px] text-muted-foreground">Webhooks, API keys, and Razorpay billing status</p>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="flex items-center justify-between rounded-xl border border-border/70 bg-surface/60 p-3">
                    <div>
                      <p className="font-bold text-foreground">Razorpay Indian Rupee Gateway</p>
                      <p className="text-[10px] text-muted-foreground">Key ID: rzp_test_TcCkj2XoiCr1tZ (Active)</p>
                    </div>
                    <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-bold text-emerald-600">
                      Connected
                    </span>
                  </div>

                  <div className="flex items-center justify-between rounded-xl border border-border/70 bg-surface/60 p-3">
                    <div>
                      <p className="font-bold text-foreground">Multi-Tenant Row-Level Security</p>
                      <p className="text-[10px] text-muted-foreground">PostgreSQL 16 RLS policies enforced</p>
                    </div>
                    <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-bold text-emerald-600">
                      Enforced
                    </span>
                  </div>

                  <div className="flex items-center justify-between rounded-xl border border-border/70 bg-surface/60 p-3">
                    <div>
                      <p className="font-bold text-foreground">Multilingual i18n Engine</p>
                      <p className="text-[10px] text-muted-foreground">8 regional languages supported</p>
                    </div>
                    <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-bold text-emerald-600">
                      Active
                    </span>
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
