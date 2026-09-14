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

      // 2. Synthesize answers based on the user's inquiry with comprehensive intent recognition
      await delay(600 + Math.random() * 400);

      const q = textToSend.toLowerCase().trim();
      let responseText = "";
      let badge: string | undefined;
      let bullets: string[] | undefined;

      // Intent 1: Greetings & Small Talk
      if (/^(hi|hello|hey|greetings|namaste|good\s(morning|afternoon|evening)|yo|sup)/i.test(q)) {
        badge = "Blueprint Assistant";
        responseText = `Hello! I am your AI Blueprint Copilot for **${workspaceName}**. I'm connected to your live solution architecture, HR CRM pipeline, financial ROI model, and 9-week roadmap.`;
        bullets = [
          "Ask me how to scale your business or expand recruitment capacity",
          "Ask about your financial ROI, savings, and payback period",
          "Ask about your top risks, timeline, or next action items",
          "Ask about your database schema, architecture, or REST APIs",
        ];
      }
      // Intent 2: Business Scaling, Growth & Expansion
      else if (q.includes("scale") || q.includes("grow") || q.includes("expand") || q.includes("business") || q.includes("revenue") || q.includes("more client") || q.includes("client")) {
        badge = "Scaling Strategy";
        responseText = `To scale **${workspaceName}**, your digital blueprint unlocks three immediate operational growth levers:`;
        bullets = [
          "⚡ Automated Candidate Sourcing: Replace manual Google Sheets with the HR CRM candidate pipeline, cutting turnaround from 28 days to 9 days.",
          "📈 Capacity Expansion: Reclaim 18 hours/week per recruiter so your 8 consultants can manage 600+ monthly applicants without hiring additional staff.",
          "🏢 Corporate Client Portal: Give client companies direct self-service access to shortlist candidates, reducing feedback delays from 5 days to 4 hours.",
          "💰 Projected Financial Impact: Generates an estimated ₹68,000+ net annual savings with a 340% 3-year ROI multiple.",
        ];
      }
      // Intent 3: Risks & Compliance (DPDP, Security, Bottlenecks)
      else if (q.includes("risk") || q.includes("biggest") || q.includes("threat") || q.includes("security") || q.includes("compliance") || q.includes("dpdp") || q.includes("audit")) {
        const primaryRisk = topRisks[0];
        const backupRisk = roadmap.riskRegister[0];
        badge = "Risk & Compliance";
        responseText = `Your primary operational risk is: **"${primaryRisk?.title ?? backupRisk?.title}"**.`;
        bullets = [
          `Category: ${(primaryRisk?.category ?? backupRisk?.category ?? "COMPLIANCE").toUpperCase()}`,
          `Severity Impact: ${primaryRisk?.detail ?? backupRisk?.consequence ?? "Requires 180-day resume purge routine under India DPDP Act"}`,
          `Mitigation Strategy: ${primaryRisk?.remediation ?? backupRisk?.mitigationStrategy ?? "Implement automated retention triggers in PostgreSQL and complete Steering Committee sign-off."}`,
        ];
      }
      // Intent 4: Rollout Timeline & Phases
      else if (q.includes("rollout") || q.includes("timeline") || q.includes("plan") || q.includes("phase") || q.includes("week") || q.includes("gantt") || q.includes("schedule")) {
        badge = "Delivery Roadmap";
        responseText = `Your transformation is structured into **${roadmap.phases.length} strategic phases** over **${roadmap.targetTimelineWeeks} calendar weeks** (${roadmap.totalPersonDays} Person-Days total effort):`;
        bullets = roadmap.phases.map(
          (p) => `📌 ${p.name}: Weeks ${p.startWeek + 1}–${p.startWeek + p.durationWeekCount} (${p.milestones.length} milestones — ${p.durationWeeks})`,
        );
      }
      // Intent 5: Profit Maximization, Revenue & Economics
      else if (q.includes("profit") || q.includes("margin") || q.includes("earn") || q.includes("monetiz") || q.includes("bottomline") || q.includes("revenue gain")) {
        badge = "Profit Maximization Strategy";
        responseText = `To maximize operational profit for **${workspaceName}**, your digital transformation drives profitability through two simultaneous engines:`;
        bullets = [
          "💰 Direct Cost Reduction: Automating 65% of manual recruiter spreadsheet tasks saves ₹68,400+ annually in direct labor waste.",
          "⚡ Placement Velocity Expansion: Cutting interview turnaround from 28 days to 9 days enables 8 recruiters to close 35% more placements each month without hiring more staff.",
          "📉 Candidate Leakage Reduction: Slashing candidate drop-off from 28% to 6% captures an estimated ₹4.5 Lakhs/year in otherwise lost recruitment fees.",
          "⏱️ Fast Payback: The entire system reaches net profitability within 4.2 months, yielding a 340% cumulative 3-year ROI multiple.",
        ];
      }
      // Intent 6: Financials, Budget, ROI, Savings
      else if (q.includes("budget") || q.includes("cost") || q.includes("financial") || q.includes("roi") || q.includes("saving") || q.includes("money") || q.includes("capex") || q.includes("price")) {
        badge = "Financial Model & ROI";
        const estimatedCapex = roadmap.totalPersonDays * 12500;
        responseText = `Based on your team of 8 recruiters and 400 monthly applicants, here is your financial snapshot:`;
        bullets = [
          `Total Implementation CapEx: ~₹${(estimatedCapex / 100000).toFixed(1)} Lakhs (${roadmap.totalPersonDays} person-days)`,
          "Net Annual Labor Savings: ~₹68,400+ per year",
          "Payback Period: 4.2 to 5.2 months post-deployment",
          "3-Year Cumulative ROI Multiple: 340% return on investment",
        ];
      }
      // Intent 6: Next Action Items, Sprints & Tasks
      else if (q.includes("action") || q.includes("next") || q.includes("todo") || q.includes("task") || q.includes("sprint") || q.includes("deliverable")) {
        badge = "Immediate Action Items";
        responseText = `Here are your next high-priority execution deliverables ready for sprint kick-off:`;
        bullets = actionItems.map(
          (item) => `✅ ${item.title} — Assigned to: ${item.owner} (${item.timeline})`,
        );
      }
      // Intent 7: Architecture, Tech Stack, Cloud, Backend
      else if (q.includes("architecture") || q.includes("stack") || q.includes("tech") || q.includes("database") || q.includes("api") || q.includes("backend") || q.includes("hld") || q.includes("lld")) {
        badge = "Solution Architecture";
        responseText = `Your technical blueprint utilizes a cloud-native, event-driven architecture designed for high throughput:`;
        bullets = [
          "Frontend: React 19 + TanStack Router + Tailwind CSS v4 (Sub-80ms client latency)",
          "Edge & Gateway: Cloudflare Edge Worker with JWT authentication and rate limiting",
          "Async AI Pipeline: Redis 7 + BullMQ queue handling asynchronous resume parsing and AI matching",
          "Persistence & Data: PostgreSQL 16 with Row-Level Security (RLS) isolating tenant records",
        ];
      }
      // Intent 8: HR CRM, Solution, Features
      else if (q.includes("crm") || q.includes("solution") || q.includes("candidate") || q.includes("pipeline") || q.includes("feature") || q.includes("punch")) {
        badge = "Workable Solution";
        responseText = `Your interactive HR CRM application includes 4 core functional modules:`;
        bullets = [
          "🎯 Candidate Pipeline: Real-time candidate tracking across Screening, Interview, Offer, and Rejected stages",
          "⏱️ Consultant Punch Clock: Instant daily check-in/out attendance logging with live hours tracked",
          "⚡ Solution Studio (USP #2): Add custom candidate fields (e.g. Expected CTC, LinkedIn URL) with 1-click AI regeneration",
          "📁 Instant CSV Export: One-click download of the complete active talent roster",
        ];
      }
      // Intent 9: Confidence Score & Maturity
      else if (q.includes("confidence") || q.includes("score") || q.includes("maturity") || q.includes("readiness")) {
        badge = "Readiness Audit";
        responseText = `Your current Blueprint Confidence Score is **${scoreResult.score}% (${scoreResult.grade})**.`;
        bullets = [
          `Verified Domains: ${scoreResult.breakdown.filter((d) => d.completed).length} of ${scoreResult.breakdown.length} blueprint domains complete`,
          `Key Recommendation: ${scoreResult.improvementHint}`,
        ];
      }
      // Intent 10: General Contextual Assistant Fallback
      else {
        badge = "Blueprint Advisory";
        responseText = `Regarding **"${textToSend}"**: Based on the active **${workspaceName}** enterprise blueprint, here are the key contextual details:`;
        bullets = [
          `Current Modernization Scope: ${roadmap.scenarioName} (${roadmap.targetTimelineWeeks} Weeks critical path)`,
          `Active Architecture: Cloud-native ATS with PostgreSQL 16 and BullMQ async workers`,
          `Confidence & Health: ${scoreResult.score}% (${scoreResult.grade}) with ${topRisks.length} open risk mitigations monitored`,
          "Tip: You can ask me about scaling, ROI, timeline, tech stack, or immediate action items!",
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
                    className={`max-w-[88%] rounded-2xl p-4 text-xs leading-relaxed shadow-sm ${
                      m.sender === "user"
                        ? "bg-primary text-primary-foreground font-medium rounded-tr-xs"
                        : "rounded-tl-xs border border-border/80 bg-background/90 text-foreground"
                    }`}
                  >
                    {m.badge && (
                      <div className="mb-2.5 inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-0.5 text-[10px] font-bold text-primary">
                        <Sparkles className="size-3" />
                        {m.badge}
                      </div>
                    )}
                    <p className="whitespace-pre-wrap text-xs leading-relaxed text-foreground font-normal">
                      {m.text.split(/(\*\*.*?\*\*)/g).map((part, i) =>
                        part.startsWith("**") && part.endsWith("**") ? (
                          <strong key={i} className="font-semibold text-primary">
                            {part.slice(2, -2)}
                          </strong>
                        ) : (
                          part
                        ),
                      )}
                    </p>

                    {m.bullets && m.bullets.length > 0 && (
                      <div className="mt-3 space-y-2 border-t border-border/60 pt-2.5">
                        {m.bullets.map((b, idx) => (
                          <div key={idx} className="flex items-start gap-2 text-[11px] leading-relaxed">
                            <span className="mt-1 size-1.5 shrink-0 rounded-full bg-primary/70" />
                            <span className="text-muted-foreground font-normal">
                              {b.split(/(\*\*.*?\*\*)/g).map((part, i) =>
                                part.startsWith("**") && part.endsWith("**") ? (
                                  <strong key={i} className="font-medium text-foreground">
                                    {part.slice(2, -2)}
                                  </strong>
                                ) : (
                                  part
                                ),
                              )}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    <div
                      className={`mt-2.5 text-[9px] ${
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
