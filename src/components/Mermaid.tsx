import { motion } from "motion/react";
import { useEffect, useId, useRef, useState } from "react";

import { useTheme } from "@/hooks/useTheme";
import { cn } from "@/lib/utils";

let initialised = false;

export function Mermaid({ chart, className }: { chart: string; className?: string }) {
  const { theme } = useTheme();
  const id = useId().replace(/[:]/g, "");
  const ref = useRef<HTMLDivElement>(null);
  const [svg, setSvg] = useState<string>("");
  const [failed, setFailed] = useState(false);

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

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.985 }}
      animate={{ opacity: svg ? 1 : 0, scale: svg ? 1 : 0.985 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "[&_svg]:h-auto [&_svg]:w-full [&_svg]:max-w-full overflow-x-auto rounded-xl p-2",
        className,
      )}
      ref={ref}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}
