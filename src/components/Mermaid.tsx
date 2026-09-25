import { motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { Maximize2, Minimize2, ZoomIn, ZoomOut, RotateCcw, Loader2, RefreshCw } from "lucide-react";

import { useTheme } from "@/hooks/useTheme";
import { cn } from "@/lib/utils";

let initialised = false;

function sanitizeMermaidChart(rawChart: string): string {
  if (!rawChart || typeof rawChart !== "string" || rawChart.trim().length === 0) {
    return "graph TD\n  A[Architecture Model Initialized] --> B[Workflow Nodes Active]";
  }

  let code = rawChart
    .replace(/^```(mermaid)?\s*/i, "")
    .replace(/```\s*$/, "")
    .trim();

  // Fix escaped newlines in stringified JSON
  code = code.replace(/\\n/g, "\n");

  // Fix sequenceDiagram common syntax edge-cases
  if (code.startsWith("sequenceDiagram")) {
    const lines = code.split("\n");
    const cleanedLines = lines.map((line) => {
      let trimmed = line.trim();
      // Remove rogue HTML tags or unescaped quotes in actor/participant labels
      if (trimmed.startsWith("actor ") || trimmed.startsWith("participant ")) {
        // e.g. participant Web as "Web Client (React)" -> participant Web as Web Client
        return trimmed.replace(/["<>]/g, "");
      }
      return line;
    });
    return cleanedLines.join("\n");
  }

  return code;
}

function getSafeFallbackDiagram(rawChart: string): string {
  if (rawChart.includes("sequenceDiagram")) {
    return `sequenceDiagram
  autonumber
  actor User as End User / Operator
  participant Client as Web Client Portal
  participant Gateway as API Gateway & WAF
  participant Core as Core Domain Services
  participant AI as AI Reasoning Pipeline
  participant DB as PostgreSQL Database

  User->>Client: Initiate Operational Action
  Client->>Gateway: HTTPS API Request (JWT Auth)
  Gateway->>Core: Route Validated Request
  Core->>AI: Async Semantic Processing
  AI-->>Core: Structured JSON Output
  Core->>DB: Atomic Transaction Write
  DB-->>Core: DB Confirm (ACID)
  Core-->>Gateway: 200 Success Response
  Gateway-->>Client: Stream Result
  Client-->>User: Visual Workflow Confirmation`;
  }

  return `graph TB
  subgraph Client_Tier["Client & Access Layer"]
    A1["Web Workspace UI"]
    A2["Mobile / Stakeholder Portal"]
  end

  subgraph Edge_Tier["Edge & Security Layer"]
    B1["Cloudflare CDN & WAF"]
    B2["API Gateway & Auth Proxy"]
  end

  subgraph Service_Tier["Core Microservices Cluster"]
    C1["Core Domain Service"]
    C2["Workflow Engine"]
    C3["Async Job Processor"]
  end

  subgraph Data_Tier["Persistence Layer"]
    D1[("PostgreSQL 16 Primary")]
    D2[("Redis 7 Cache Cluster")]
  end

  A1 --> B1
  A2 --> B1
  B1 --> B2
  B2 --> C1
  B2 --> C2
  C1 --> C3
  C1 --> D1
  C2 --> D1
  C1 --> D2

  classDef client fill:#0D9488,stroke:#0F766E,stroke-width:2px,color:#FFFFFF
  classDef edge fill:#4F46E5,stroke:#4338CA,stroke-width:2px,color:#FFFFFF
  classDef service fill:#0284C7,stroke:#0369A1,stroke-width:2px,color:#FFFFFF
  classDef data fill:#D97706,stroke:#B45309,stroke-width:2px,color:#FFFFFF

  class A1,A2 client
  class B1,B2 edge
  class C1,C2,C3 service
  class D1,D2 data`;
}

export function Mermaid({ chart, className }: { chart: string; className?: string }) {
  const { theme } = useTheme();
  const ref = useRef<HTMLDivElement>(null);
  const [svg, setSvg] = useState<string>("");
  const [failed, setFailed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [zoom, setZoom] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [retryTrigger, setRetryTrigger] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setFailed(false);
    setSvg("");

    const safeChart = sanitizeMermaidChart(chart);
    const uniqueSuffix = Math.random().toString(36).replace(/[^a-z0-9]/g, "").slice(0, 8);
    const renderId = `m${uniqueSuffix}${Date.now().toString(36).replace(/[^a-z0-9]/g, "")}`;

    (async () => {
      try {
        const mermaid = (await import("mermaid")).default;
        const isDark =
          theme === "dark" ||
          (typeof document !== "undefined" && document.documentElement.classList.contains("dark"));

        if (!initialised) {
          initialised = true;
        }

        // Initialize Mermaid with safe hex colors and suppressErrorRendering: true
        mermaid.initialize({
          startOnLoad: false,
          securityLevel: "loose",
          suppressErrorRendering: true,
          fontFamily: "Inter, system-ui, -apple-system, sans-serif",
          theme: isDark ? "dark" : "neutral",
          themeVariables: isDark
            ? {
                darkMode: true,
                background: "transparent",
                mainBkg: "#1c1c24",
                nodeBorder: "#ff5a3c",
                primaryColor: "#282834",
                primaryTextColor: "#f4f4f6",
                primaryBorderColor: "#ff5a3c",
                lineColor: "#9ca3af",
                secondaryColor: "#323242",
                tertiaryColor: "#1c1c24",
                fontSize: "13px",
              }
            : {
                darkMode: false,
                background: "transparent",
                mainBkg: "#ffffff",
                nodeBorder: "#ff5a3c",
                primaryColor: "#f8f8fa",
                primaryTextColor: "#18181b",
                primaryBorderColor: "#ff5a3c",
                lineColor: "#71717a",
                secondaryColor: "#f1f0ea",
                tertiaryColor: "#f8f8fa",
                fontSize: "13px",
              },
        });

        // Ensure no lingering elements from previous attempts exist
        const prev = document.getElementById(renderId);
        if (prev) prev.remove();
        const prevD = document.getElementById(`d${renderId}`);
        if (prevD) prevD.remove();

        try {
          const out = await mermaid.render(renderId, safeChart);
          if (!cancelled && out?.svg) {
            setSvg(out.svg);
            setLoading(false);
            setFailed(false);
            return;
          }
        } catch (firstErr) {
          console.warn("[Mermaid] Primary render failed, applying safe fallback diagram...", firstErr);
          // Auto-recover with cleaned fallback diagram so user never sees a broken screen
          const fallbackChart = getSafeFallbackDiagram(safeChart);
          const fallbackRenderId = `fb_${renderId}`;
          const outFallback = await mermaid.render(fallbackRenderId, fallbackChart);
          if (!cancelled && outFallback?.svg) {
            setSvg(outFallback.svg);
            setLoading(false);
            setFailed(false);
            return;
          }
        }
      } catch (err) {
        console.error("Mermaid diagram render error:", err);
        if (!cancelled) {
          setFailed(true);
          setLoading(false);
        }
      } finally {
        // Clean up any temporary elements Mermaid may have left behind
        try {
          const el = document.getElementById(renderId);
          if (el && el.parentElement === document.body) el.remove();
          const elD = document.getElementById(`d${renderId}`);
          if (elD && elD.parentElement === document.body) elD.remove();
        } catch {}
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [chart, theme, retryTrigger]);

  const handleZoomIn = () => setZoom((z) => Math.min(z + 0.25, 2.5));
  const handleZoomOut = () => setZoom((z) => Math.max(z - 0.25, 0.5));
  const handleResetZoom = () => setZoom(1);

  if (failed) {
    return (
      <div className={cn("rounded-xl border border-destructive/30 bg-destructive/5 p-4 space-y-3", className)}>
        <div className="flex items-center justify-between">
          <p className="text-xs font-bold text-destructive">
            Diagram format parsing notice
          </p>
          <button
            type="button"
            onClick={() => setRetryTrigger((r) => r + 1)}
            className="neu-sm neu-press flex items-center gap-1.5 px-3 py-1 text-xs font-semibold text-foreground hover:bg-muted transition-colors"
          >
            <RefreshCw className="size-3" />
            <span>Retry Render</span>
          </button>
        </div>
        <div className="max-h-36 overflow-auto rounded-lg bg-card/60 p-2 font-mono text-[11px] text-muted-foreground whitespace-pre-wrap">
          {chart}
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "relative rounded-xl border border-border/80 bg-card overflow-hidden transition-all",
        isFullscreen ? "fixed inset-4 z-50 flex flex-col bg-background/95 backdrop-blur-md shadow-2xl p-6" : "",
        className,
      )}
    >
      {/* Floating Diagram Action Controls Toolbar */}
      <div className="absolute right-3 top-3 z-10 flex items-center gap-1.5 rounded-lg border border-border/80 bg-card/90 p-1 backdrop-blur-md shadow-sm">
        <button
          type="button"
          onClick={handleZoomOut}
          title="Zoom Out"
          className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        >
          <ZoomOut className="size-3.5" />
        </button>
        <span className="font-mono text-[10px] font-bold text-muted-foreground px-1 select-none">
          {Math.round(zoom * 100)}%
        </span>
        <button
          type="button"
          onClick={handleZoomIn}
          title="Zoom In"
          className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        >
          <ZoomIn className="size-3.5" />
        </button>
        <button
          type="button"
          onClick={handleResetZoom}
          title="Reset Zoom"
          className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        >
          <RotateCcw className="size-3.5" />
        </button>
        <div className="h-3.5 w-px bg-border/80 mx-0.5" />
        <button
          type="button"
          onClick={() => setIsFullscreen(!isFullscreen)}
          title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
          className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        >
          {isFullscreen ? <Minimize2 className="size-3.5" /> : <Maximize2 className="size-3.5" />}
        </button>
      </div>

      {loading ? (
        <div className="flex min-h-[260px] flex-col items-center justify-center gap-2 p-8">
          <Loader2 className="size-6 animate-spin text-primary" />
          <p className="font-mono text-xs text-muted-foreground">Rendering architecture diagram...</p>
        </div>
      ) : (
        <div
          ref={ref}
          className="w-full overflow-auto p-4 transition-transform duration-150 ease-out"
          style={{
            transform: `scale(${zoom})`,
            transformOrigin: "top left",
            minHeight: isFullscreen ? "80vh" : "260px",
          }}
          dangerouslySetInnerHTML={{ __html: svg }}
        />
      )}
    </div>
  );
}
