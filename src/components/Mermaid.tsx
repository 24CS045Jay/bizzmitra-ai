import { motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { Maximize2, Minimize2, ZoomIn, ZoomOut, RotateCcw, Loader2, RefreshCw } from "lucide-react";

import { useTheme } from "@/hooks/useTheme";
import { cn } from "@/lib/utils";

let initialised = false;

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

    // Generate a valid, collision-free CSS-safe ID (starts with a letter, alphanumeric only)
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

        const out = await mermaid.render(renderId, chart);
        if (!cancelled && out?.svg) {
          setSvg(out.svg);
          setLoading(false);
          setFailed(false);
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
        <div className="flex items-center justify-between text-xs text-destructive">
          <span className="font-semibold">Unable to visually render diagram</span>
          <button
            onClick={() => setRetryTrigger((c) => c + 1)}
            className="flex items-center gap-1 underline text-[11px] font-bold hover:text-foreground"
          >
            <RefreshCw className="size-3" /> Retry Render
          </button>
        </div>
        <pre className="neu-inset overflow-auto p-3 text-[11px] text-muted-foreground font-mono max-h-60 whitespace-pre-wrap">
          {chart}
        </pre>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "relative group flex flex-col rounded-xl border border-border/60 bg-card/40 backdrop-blur-sm transition-all",
        isFullscreen && "fixed inset-2 sm:inset-6 z-50 bg-background/95 border-border shadow-2xl p-4 overflow-hidden",
        className,
      )}
    >
      {/* Floating Diagram Controls */}
      <div className="absolute top-2 right-2 z-10 flex items-center gap-1 rounded-lg bg-background/80 p-1 backdrop-blur-md border border-border/70 shadow-sm opacity-90 hover:opacity-100 transition-opacity">
        <button
          type="button"
          onClick={handleZoomIn}
          title="Zoom in"
          aria-label="Zoom in"
          className="grid size-7 place-items-center rounded hover:bg-muted text-muted-foreground hover:text-foreground"
        >
          <ZoomIn className="size-3.5" />
        </button>
        <button
          type="button"
          onClick={handleZoomOut}
          title="Zoom out"
          aria-label="Zoom out"
          className="grid size-7 place-items-center rounded hover:bg-muted text-muted-foreground hover:text-foreground"
        >
          <ZoomOut className="size-3.5" />
        </button>
        <button
          type="button"
          onClick={handleResetZoom}
          title="Fit to width"
          aria-label="Fit to width"
          className="grid size-7 place-items-center rounded hover:bg-muted text-muted-foreground hover:text-foreground"
        >
          <RotateCcw className="size-3.5" />
        </button>
        <button
          type="button"
          onClick={() => setIsFullscreen(!isFullscreen)}
          title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
          aria-label={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
          className="grid size-7 place-items-center rounded hover:bg-muted text-muted-foreground hover:text-foreground"
        >
          {isFullscreen ? <Minimize2 className="size-3.5" /> : <Maximize2 className="size-3.5" />}
        </button>
      </div>

      {/* Loading state indicator */}
      {loading && !svg && (
        <div className="flex items-center justify-center py-24 text-xs text-muted-foreground gap-2">
          <Loader2 className="size-4 animate-spin text-primary" />
          <span>Rendering architectural diagram...</span>
        </div>
      )}

      {/* Diagram Scrollable Viewport */}
      <div className="flex-1 w-full overflow-auto p-4 touch-pan-x touch-pan-y min-h-[360px] flex justify-center">
        <div
          ref={ref}
          style={{ transform: `scale(${zoom})`, transformOrigin: "top center" }}
          className="min-w-fit w-full flex justify-center [&_svg]:block [&_svg]:max-w-full [&_svg]:h-auto [&_svg]:mx-auto transition-transform duration-150"
          dangerouslySetInnerHTML={{ __html: svg }}
        />
      </div>
    </div>
  );
}
