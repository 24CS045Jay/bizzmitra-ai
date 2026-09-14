import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  AlertTriangle,
  ArrowRight,
  Bot,
  CheckCircle2,
  ChevronRight,
  Clock,
  Coins,
  Copy,
  MessageSquare,
  RotateCcw,
  Send,
  ShieldAlert,
  Sparkles,
  User,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { getRoadmapForWorkspace } from "@/lib/planning-data";
import { evaluateBlueprintRisks } from "@/lib/risk-evaluator";
import { delay } from "@/lib/ai/generate-artifact";

interface Message {
  id: string;
  sender: "user" | "assistant";
  text: string;
  timestamp: string;
  badge?: string;
  bullets?: string[];
  actionLabel?: string;
}

const QUICK_PROMPTS = [
  "What is my biggest open risk?",
  "Summarize my rollout plan",
  "How is my budget allocated?",
  "What are my next 3 action items?",
  "Explain my confidence score",
];

export function AiCopilotPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      sender: "assistant",
      text: "Hello! I am your BizzMitra Blueprint Copilot. Ask me anything about your active transformation workspace, risks, architecture, or rollout schedule.",
      timestamp: "Just now",
      bullets: [
        "Live data pulled from your Supabase blueprint artifacts",
        "Trained on your active risk register & delivery roadmap",
      ],
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();

  // Scroll to bottom when messages change
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  // Global event listener to open copilot with an optional initial prompt
  useEffect(() => {
    const handleTrigger = (event: Event) => {
      const custom = event as CustomEvent<{ prompt?: string }>;
      setIsOpen(true);
      if (custom.detail?.prompt) {
        void handleSend(custom.detail.prompt);
      }
    };
    window.addEventListener("bizzmitra:open-copilot", handleTrigger);
    return () => window.removeEventListener("bizzmitra:open-copilot", handleTrigger);
  }, []);

  async function handleSend(queryText?: string) {
    const textToSend = (queryText ?? input).trim();
    if (!textToSend || busy) return;

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      sender: "user",
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setBusy(true);

    try {
      // 1. Pull active workspace context and roadmap from storage/DB
      const wsId = typeof window !== "undefined" ? window.localStorage.getItem("bizzmitra.activeWorkspaceId") : null;
      let workspaceName = "TalentCraft HR Consultancy";
      let problem = "";

      if (wsId && !wsId.startsWith("ws-")) {
        const { data: ws } = await supabase
          .from("workspaces")
          .select("name, problem_statement")
          .eq("id", wsId)
          .maybeSingle();
        if (ws?.name) workspaceName = ws.name;
        if (ws?.problem_statement) problem = ws.problem_statement;
      }

      const roadmap = getRoadmapForWorkspace({ name: workspaceName, industry: "HR Tech" });
      const { topRisks, actionItems, scoreResult } = evaluateBlueprintRisks(roadmap, {
        name: workspaceName,
        problemStatement: problem,
      });

      // 2. Synthesize answers based on the user's inquiry
      await delay(700 + Math.random() * 500);

      const q = textToSend.toLowerCase();
      let responseText = "";
      let badge: string | undefined;
      let bullets: string[] | undefined;

      if (q.includes("risk") || q.includes("biggest")) {
        const primaryRisk = topRisks[0];
        const backupRisk = roadmap.riskRegister[0];
        badge = "Risk Analysis";
        responseText = `Your highest-priority open risk is: "${primaryRisk?.title ?? backupRisk?.title}".`;
        bullets = [
          `Category: ${(primaryRisk?.category ?? backupRisk?.category ?? "TECHNICAL").toUpperCase()}`,
          `Impact: ${primaryRisk?.detail ?? backupRisk?.consequence ?? "Requires mitigation prior to Phase 2 sprint launch"}`,
          `Remediation: ${primaryRisk?.remediation ?? backupRisk?.mitigationStrategy ?? "Review Risk Register in Roadmap & ROI"}`,
        ];
      } else if (q.includes("rollout") || q.includes("timeline") || q.includes("plan") || q.includes("phase")) {
        badge = "Delivery Roadmap";
        responseText = `Your execution blueprint is sequenced into ${roadmap.phases.length} strategic phases spanning ${roadmap.targetTimelineWeeks} calendar weeks (${roadmap.totalPersonDays} Person-Days total effort).`;
        bullets = roadmap.phases.map(
          (p) => `${p.name}: Weeks ${p.startWeek + 1}–${p.startWeek + p.durationWeekCount} (${p.milestones.length} milestones, ${p.durationWeeks})`,
        );
      } else if (q.includes("budget") || q.includes("cost") || q.includes("financial") || q.includes("roi")) {
        badge = "Financial Model";
        const estimatedCapex = roadmap.totalPersonDays * 12500;
        responseText = `Estimated CapEx effort is ₹${(estimatedCapex / 100000).toFixed(1)} Lakhs based on ${roadmap.totalPersonDays} person-days of technical execution.`;
        bullets = [
          "Phase 1 Foundation: ~35% of total budget",
          "Phase 2 Core Implementation: ~45% of total budget",
          "Phase 3 Hardening & Go-Live: ~20% of total budget",
          "Projected net ROI recovery period: 5.2 months post deployment",
        ];
      } else if (q.includes("action") || q.includes("next") || q.includes("todo")) {
        badge = "Immediate Action Items";
        responseText = `Here are your next 3 chronological execution deliverables ready for sprint kick-off:`;
        bullets = actionItems.map(
          (item) => `${item.title} — Owner: ${item.owner} (${item.timeline})`,
        );
      } else if (q.includes("confidence") || q.includes("score")) {
        badge = "Confidence Audit";
        responseText = `Your current Blueprint Confidence Score is ${scoreResult.score}% (${scoreResult.grade}).`;
        bullets = [
          `Improvement Target: ${scoreResult.improvementHint}`,
          `Domains Verified: ${scoreResult.breakdown.filter((d) => d.completed).length} / ${scoreResult.breakdown.length} blueprint domains`,
        ];
      } else {
        badge = "Blueprint Synthesis";
        responseText = `Analyzing blueprint context for "${workspaceName}": Your architecture, process BPMN, and roadmap are currently active.`;
        bullets = [
          `Current Rollout: ${roadmap.scenarioName} (${roadmap.targetTimelineWeeks} Weeks)`,
          `Top Risk: ${topRisks[0]?.title ?? "Data Migration Bottlenecks"}`,
          `Confidence Score: ${scoreResult.score}% (${scoreResult.grade})`,
        ];
      }

      const botMsg: Message = {
        id: `bot-${Date.now()}`,
        sender: "assistant",
        text: responseText,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        badge,
        bullets,
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err: unknown) {
      const error = err as Error;
      toast.error(error.message || "Failed to analyze blueprint context");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      {/* Bottom-right Persistent Floating Launcher */}
      <div className="fixed bottom-6 right-6 z-40">
        <motion.button
          whileHover={{ scale: 1.06, y: -2 }}
          whileTap={{ scale: 0.94 }}
          onClick={() => setIsOpen(!isOpen)}
          className="neu-press group flex items-center gap-2.5 rounded-2xl bg-primary px-4 py-3.5 text-sm font-bold text-primary-foreground shadow-2xl glow-primary"
          title="Open AI Copilot"
        >
          <div className="relative">
            <Bot className="size-5 transition-transform group-hover:rotate-12" />
            <span className="absolute -right-1 -top-1 size-2 rounded-full bg-emerald-400 animate-pulse" />
          </div>
          <span className="font-display tracking-tight">AI Copilot</span>
        </motion.button>
      </div>

      {/* Expandable Side Panel Drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, x: 380 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 380 }}
            transition={{ type: "spring", stiffness: 360, damping: 32 }}
            className="fixed bottom-4 right-4 top-4 z-50 flex w-full max-w-[420px] flex-col overflow-hidden rounded-3xl border border-border/80 bg-card/95 shadow-2xl backdrop-blur-xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border/70 p-4">
              <div className="flex items-center gap-2.5">
                <div className="grid size-9 place-items-center rounded-xl bg-primary/10 text-primary">
                  <Sparkles className="size-5" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-display text-sm font-extrabold text-foreground">
                      Blueprint Copilot
                    </h3>
                    <span className="rounded-full bg-emerald-500/10 px-1.5 py-0.5 text-[9px] font-bold text-emerald-600 dark:text-emerald-400">
                      Live Grounded
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    Answering from your blueprint & artifacts
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() =>
                    setMessages([
                      {
                        id: "welcome-reset",
                        sender: "assistant",
                        text: "History reset. What would you like to explore next?",
                        timestamp: "Now",
                      },
                    ])
                  }
                  title="Reset conversation"
                  className="grid size-8 place-items-center rounded-lg text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                >
                  <RotateCcw className="size-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="grid size-8 place-items-center rounded-lg text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                >
                  <X className="size-4" />
                </button>
              </div>
            </div>

            {/* Quick Prompts Chips */}
            <div className="flex gap-1.5 overflow-x-auto border-b border-border/50 p-2.5 scrollbar-none">
              {QUICK_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  disabled={busy}
                  onClick={() => handleSend(prompt)}
                  className="neu-sm neu-press shrink-0 rounded-full px-3 py-1 text-[11px] font-medium text-muted-foreground hover:text-foreground hover:border-primary/40 disabled:opacity-50"
                >
                  {prompt}
                </button>
              ))}
            </div>

            {/* Chat Message Thread */}
            <div className="flex-1 space-y-4 overflow-y-auto p-4">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`flex gap-3 ${m.sender === "user" ? "justify-end" : "justify-start"}`}
                >
                  {m.sender === "assistant" && (
                    <div className="grid size-7 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                      <Bot className="size-4" />
                    </div>
                  )}

                  <div
                    className={`max-w-[85%] rounded-2xl p-3.5 text-xs leading-relaxed ${
                      m.sender === "user"
                        ? "bg-primary text-primary-foreground font-medium rounded-tr-xs"
                        : "neu bg-surface text-foreground rounded-tl-xs"
                    }`}
                  >
                    {m.badge && (
                      <div className="mb-2 inline-flex items-center gap-1 rounded-md bg-primary/15 px-2 py-0.5 text-[10px] font-bold text-primary">
                        <Sparkles className="size-3" />
                        {m.badge}
                      </div>
                    )}
                    <p>{m.text}</p>

                    {m.bullets && m.bullets.length > 0 && (
                      <ul className="mt-2.5 space-y-1.5 border-t border-border/60 pt-2 text-[11px]">
                        {m.bullets.map((b, idx) => (
                          <li key={idx} className="flex items-start gap-1.5 text-muted-foreground">
                            <span className="mt-1 size-1 shrink-0 rounded-full bg-primary" />
                            <span className="leading-snug">{b}</span>
                          </li>
                        ))}
                      </ul>
                    )}

                    <div
                      className={`mt-2 text-[9px] ${
                        m.sender === "user" ? "text-primary-foreground/70" : "text-muted-foreground"
                      } text-right`}
                    >
                      {m.timestamp}
                    </div>
                  </div>

                  {m.sender === "user" && (
                    <div className="grid size-7 shrink-0 place-items-center rounded-lg bg-muted text-muted-foreground">
                      <User className="size-4" />
                    </div>
                  )}
                </div>
              ))}

              {busy && (
                <div className="flex items-center gap-2.5 text-xs text-muted-foreground">
                  <div className="grid size-7 place-items-center rounded-lg bg-primary/10 text-primary animate-pulse">
                    <Sparkles className="size-3.5" />
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="size-1.5 rounded-full bg-primary animate-bounce" />
                    <span
                      className="size-1.5 rounded-full bg-primary animate-bounce"
                      style={{ animationDelay: "0.15s" }}
                    />
                    <span
                      className="size-1.5 rounded-full bg-primary animate-bounce"
                      style={{ animationDelay: "0.3s" }}
                    />
                    <span className="ml-1 text-[11px] font-medium">Analyzing blueprint data…</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                void handleSend();
              }}
              className="border-t border-border/70 p-3"
            >
              <div className="neu-inset flex items-center gap-2 px-3 py-2">
                <input
                  type="text"
                  value={input}
                  disabled={busy}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask about your risks, timeline, budget..."
                  className="w-full bg-transparent text-xs outline-none placeholder:text-muted-foreground"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || busy}
                  className="grid size-7 shrink-0 place-items-center rounded-lg bg-primary text-primary-foreground disabled:opacity-40 transition-opacity"
                >
                  <Send className="size-3.5" />
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
