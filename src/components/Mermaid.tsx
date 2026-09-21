
import { motion } from "motion/react";
import { useEffect, useId, useRef, useState } from "react";
import { Maximize2, Minimize2, ZoomIn, ZoomOut, RotateCcw } from "lucide-react";

import { useTheme } from "@/hooks/useTheme";
import { cn } from "@/lib/utils";

let initialised = false;

export function Mermaid({ chart, className }: { chart: string; className?: string }) {
  const { theme } = useTheme();
  const id = useId().replace(/[:]/g, "");
  const ref = useRef<HTMLDivElement>(null);
  const [svg, setSvg] = useState<string>("");
  const [failed, setFailed] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const mermaid = (await import("mermaid")).default;
        const css = getComputedStyle(document.documentElement);
        const read = (v: string, f: string) => css.getPropertyValue(v).trim() || f;
        if (!initialised) {
          initialised = true;
        }
        mermaid.initialize({
          startOnLoad: false,
          securityLevel: "loose",
          fontFamily: "Inter Tight, sans-serif",
          theme: "base",
          themeVariables: {
            background: "transparent",
            primaryColor: read("--surface-2", "#fff"),
            primaryTextColor: read("--foreground", "#1B1B1B"),
            primaryBorderColor: read("--primary", "#FF5A3C"),
            lineColor: read("--muted-foreground", "#8A8478"),
            secondaryColor: read("--muted", "#EDEAE3"),
            tertiaryColor: read("--surface", "#EDEAE3"),
            fontSize: "14px",
          },
        });
        const out = await mermaid.render(`m-${id}`, chart);
        if (!cancelled) setSvg(out.svg);
      } catch {
        if (!cancelled) setFailed(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [chart, id, theme]);

  if (failed) {
    return (
      <pre className="neu-inset overflow-auto p-4 text-xs text-muted-foreground">{chart}</pre>
    );
  }

  const handleZoomIn = () => setZoom((z) => Math.min(z + 0.25, 2.5));
  const handleZoomOut = () => setZoom((z) => Math.max(z - 0.25, 0.5));
  const handleResetZoom = () => setZoom(1);

  return (
    <div
      className={cn(
        "relative group flex flex-col rounded-xl border border-border/60 bg-card/40 backdrop-blur-sm",
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

      {/* Diagram Scrollable Viewport */}
      <div className="flex-1 w-full overflow-auto p-4 touch-pan-x touch-pan-y">
        <motion.div
          initial={{ opacity: 0, scale: 0.985 }}
          animate={{ opacity: svg ? 1 : 0, scale: svg ? zoom : 0.985 }}
          transition={{ duration: 0.3 }}
          style={{ transformOrigin: "top left" }}
          className="min-w-fit [&_svg]:h-auto [&_svg]:max-w-none"
          ref={ref}
          dangerouslySetInnerHTML={{ __html: svg }}
        />
      </div>
    </div>
  );
}

