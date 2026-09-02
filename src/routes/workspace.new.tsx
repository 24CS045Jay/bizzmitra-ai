import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { motion } from "motion/react";
import { FileText, Mic, Upload } from "lucide-react";
import { useState } from "react";

import { AppShell } from "@/components/AppShell";
import { ArtifactHeader } from "@/components/ArtifactHeader";
import { Reveal } from "@/components/motion/primitives";
import { EXAMPLE_CHIPS, SAMPLE_PROBLEM } from "@/lib/demo-data";

export const Route = createFileRoute("/workspace/new")({
  head: () => ({
    meta: [
      { title: "New problem intake — BizzMitra-AI" },
      { name: "description", content: "Describe a business problem in plain language and let BizzMitra frame it." },
      { property: "og:title", content: "New problem intake — BizzMitra-AI" },
      { property: "og:description", content: "Start a workspace from one plain-language problem statement." },
    ],
  }),
  component: IntakePage,
});

function IntakePage() {
  const [value, setValue] = useState(SAMPLE_PROBLEM);
  const navigate = useNavigate();

  return (
    <AppShell>
      <ArtifactHeader id="intake" kicker="Step 01" title="Describe the problem" />

      <Reveal className="max-w-3xl">
        <div className="neu p-5 sm:p-6">
          <div className="neu-inset p-4">
            <textarea
              value={value}
              onChange={(e) => setValue(e.target.value)}
              rows={6}
              aria-label="Business problem"
              placeholder="What is going wrong in the business? Say it the way you'd say it to a colleague."
              className="w-full resize-none bg-transparent text-sm leading-relaxed outline-none"
            />
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <button className="neu-sm neu-press flex items-center gap-2 px-3 py-2 text-xs font-medium">
              <Upload className="size-3.5" /> Upload PDF / DOCX / PPT
            </button>
            <button className="neu-sm neu-press flex items-center gap-2 px-3 py-2 text-xs font-medium">
              <Mic className="size-3.5" /> Voice input
            </button>
            <button className="neu-sm neu-press flex items-center gap-2 px-3 py-2 text-xs font-medium">
              <FileText className="size-3.5" /> Paste from doc
            </button>
          </div>
        </div>

        <div className="mt-6">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Or start from an example
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {EXAMPLE_CHIPS.map((c) => (
              <motion.button
                key={c}
                whileTap={{ scale: 0.97 }}
                onClick={() => setValue(c)}
                className="neu-sm px-3 py-2 text-xs font-medium text-muted-foreground hover:text-foreground"
              >
                {c}
              </motion.button>
            ))}
          </div>
        </div>

        <button
          onClick={() => navigate({ to: "/workspace/discovery" })}
          disabled={!value.trim()}
          className="neu-press mt-8 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground disabled:opacity-50"
        >
          Start AI discovery
        </button>
      </Reveal>
    </AppShell>
  );
}
