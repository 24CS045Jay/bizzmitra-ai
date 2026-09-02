import { createFileRoute, Link } from "@tanstack/react-router";
import { AnimatePresence, motion } from "motion/react";
import { ArrowRight, Lightbulb } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { AppShell } from "@/components/AppShell";
import { ArtifactHeader } from "@/components/ArtifactHeader";
import { ThinkingDots, Typewriter } from "@/components/motion/primitives";
import { AI_SUMMARY, DISCOVERY_SCRIPT, SAMPLE_PROBLEM } from "@/lib/demo-data";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/workspace/discovery")({
  head: () => ({
    meta: [
      { title: "AI discovery interview — BizzMitra-AI" },
      { name: "description", content: "A scripted analyst-grade discovery interview that sharpens the problem before design." },
      { property: "og:title", content: "AI discovery interview — BizzMitra-AI" },
      { property: "og:description", content: "Clarifying questions that behave like a real business analyst." },
    ],
  }),
  component: DiscoveryPage,
});

type Turn = { role: "user" | "ai"; text: string; hint?: string };

function DiscoveryPage() {
  const { user } = useAuth();
  const [workspaceId, setWorkspaceId] = useState<string | null>(null);
  const [turns, setTurns] = useState<Turn[]>([]);
  const [step, setStep] = useState(0);
  const [thinking, setThinking] = useState(false);
  const [complete, setComplete] = useState(false);

  useEffect(() => {
    const id = window.localStorage.getItem("bizzmitra.activeWorkspaceId");
    setWorkspaceId(id);
    if (!user || !id) return;
    async function loadMessages() {
      const { data, error } = await supabase
        .from("discovery_messages")
        .select("role, content")
        .eq("workspace_id", id)
        .order("created_at");
      if (error) {
        toast.error(error.message);
        return;
      }
      if (data?.length) {
        const loadedTurns = data.map((message) => ({ role: message.role as Turn["role"], text: message.content }));
        setTurns(loadedTurns);
        const answered = loadedTurns.filter((turn) => turn.role === "user").length - 1;
        setStep(Math.max(0, answered));
        setComplete(loadedTurns.some((turn) => turn.text === AI_SUMMARY));
      } else {
        const { data: workspace } = await supabase
          .from("workspaces")
          .select("problem_statement")
          .eq("id", id)
          .single();
        const text = workspace?.problem_statement || SAMPLE_PROBLEM;
        const { error: insertError } = await supabase.from("discovery_messages").insert({
          workspace_id: id,
          role: "user",
          content: text,
        });
        if (insertError) toast.error(insertError.message);
        setTurns([{ role: "user", text }]);
        setThinking(true);
      }
    }
    void loadMessages();
  }, [user]);

  useEffect(() => {
    if (!thinking) return;
    const t = setTimeout(() => {
      if (step < DISCOVERY_SCRIPT.length) {
        const q = DISCOVERY_SCRIPT[step]!;
        if (workspaceId) {
          void supabase.from("discovery_messages").insert({
            workspace_id: workspaceId,
            role: "ai",
            content: q.question,
          });
        }
        setTurns((prev) => [...prev, { role: "ai", text: q.question, hint: q.hint }]);
      } else {
        if (workspaceId) {
          void supabase.from("discovery_messages").insert({
            workspace_id: workspaceId,
            role: "ai",
            content: AI_SUMMARY,
          });
        }
        setTurns((prev) => [...prev, { role: "ai", text: AI_SUMMARY }]);
        setComplete(true);
      }
      setThinking(false);
    }, 1400);
    return () => clearTimeout(t);
  }, [thinking, step, workspaceId]);

  function answer() {
    if (!workspaceId) return;
    const a = DISCOVERY_SCRIPT[step]!.answer;
    void supabase.from("discovery_messages").insert({
      workspace_id: workspaceId,
      role: "user",
      content: a,
    });
    setTurns((prev) => [...prev, { role: "user", text: a }]);
    setStep((s) => s + 1);
    setThinking(true);
  }

  const progress = Math.round((Math.min(step, DISCOVERY_SCRIPT.length) / DISCOVERY_SCRIPT.length) * 100);

  return (
    <AppShell>
      <ArtifactHeader id="discovery" kicker="Step 02" title="AI discovery" />

      <div className="grid gap-6 lg:grid-cols-[1fr_260px]">
        <div className="neu p-5 sm:p-6">
          <div className="space-y-4">
            <AnimatePresence initial={false}>
              {turns.map((t, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                  className={t.role === "user" ? "flex justify-end" : ""}
                >
                  <div
                    className={
                      t.role === "user"
                        ? "max-w-[80%] rounded-2xl rounded-br-sm bg-primary px-4 py-3 text-sm text-primary-foreground"
                        : "max-w-[85%]"
                    }
                  >
                    {t.role === "ai" ? (
                      <div className="neu-sm px-4 py-3">
                        <p className="text-sm leading-relaxed">
                          {i === turns.length - 1 ? <Typewriter text={t.text} /> : t.text}
                        </p>
                        {t.hint ? (
                          <p className="mt-2.5 flex items-start gap-1.5 text-xs text-muted-foreground">
                            <Lightbulb className="mt-0.5 size-3 shrink-0 text-clay" />
                            {t.hint}
                          </p>
                        ) : null}
                      </div>
                    ) : (
                      t.text
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {thinking ? (
              <div className="neu-sm w-fit px-4 py-3">
                <ThinkingDots label="BizzMitra is thinking" />
              </div>
            ) : null}
          </div>

          <div className="mt-6 border-t border-border pt-4">
            {complete ? (
              <Link
                to="/workspace/solution"
                className="neu-press inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground"
              >
                Generate framing & solution <ArrowRight className="size-4" />
              </Link>
            ) : (
              <button
                onClick={answer}
                disabled={thinking}
                className="neu-sm neu-press w-full px-4 py-3 text-left text-sm disabled:opacity-50"
              >
                {thinking ? "Waiting for the analyst…" : `Reply: “${DISCOVERY_SCRIPT[step]!.answer}”`}
              </button>
            )}
          </div>
        </div>

        <aside className="neu h-fit p-5">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Context captured
          </p>
          <div className="neu-inset mt-3 h-2 overflow-hidden rounded-full p-0">
            <motion.div
              className="h-full rounded-full bg-sage"
              animate={{ width: `${complete ? 100 : progress}%` }}
              transition={{ type: "spring", stiffness: 180, damping: 26 }}
            />
          </div>
          <ul className="mt-4 space-y-2 text-xs text-muted-foreground">
            <li>Problem statement ✓</li>
            <li>{step > 0 ? "Ticket volume ✓" : "Ticket volume …"}</li>
            <li>{step > 1 ? "Tool landscape ✓" : "Tool landscape …"}</li>
            <li>{step > 2 ? "Team shape ✓" : "Team shape …"}</li>
          </ul>
        </aside>
      </div>
    </AppShell>
  );
}
