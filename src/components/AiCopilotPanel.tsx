import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  AlertTriangle,
  ArrowRight,
  Bot,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  ChevronUp,
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
  Check,
  Lock,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth, isTestingAccount } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { getRoadmapForWorkspace } from "@/lib/planning-data";
import { evaluateBlueprintRisks } from "@/lib/risk-evaluator";
import { delay } from "@/lib/ai/generate-artifact";
import {
  CreditWallet,
  loadCreditWallet,
  deductCreditsByTokens,
  AI_MODELS,
  AiModel,
  AiModelId,
  loadActiveModel,
  saveActiveModel,
  canUserAccessModel,
  loadCurrentRole,
  UserRole,
} from "@/lib/admin-rbac-data";
import { AiModelPaymentModal } from "@/components/AiModelPaymentModal";

interface Message {
  id: string;
  sender: "user" | "assistant";
  text: string;
  timestamp: string;
  badge?: string | undefined;
  bullets?: string[] | undefined;
  actionLabel?: string | undefined;
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
  const [wallet, setWallet] = useState<CreditWallet>(loadCreditWallet());
  const [activeModelId, setActiveModelId] = useState<AiModelId>(loadActiveModel());
  const [currentRole, setCurrentRole] = useState<UserRole>(loadCurrentRole());
  const [isModelDropdownOpen, setIsModelDropdownOpen] = useState(false);
  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);
  const [pendingModel, setPendingModel] = useState<AiModel | null>(null);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      sender: "assistant",
      text: "Hello! I am your BizzMitra Blueprint Copilot. How can I help with your transformation workspace today?",
      timestamp: "Just now",
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();

  useEffect(() => {
    setWallet(loadCreditWallet());
    const onWalletChange = (e: Event) => {
      const ce = e as CustomEvent<CreditWallet>;
      if (ce.detail) setWallet(ce.detail);
      else setWallet(loadCreditWallet());
    };
    const onRoleChange = (e: Event) => {
      const ce = e as CustomEvent<UserRole>;
      if (ce.detail) setCurrentRole(ce.detail);
      else setCurrentRole(loadCurrentRole());
    };
    const onModelChange = (e: Event) => {
      const ce = e as CustomEvent<AiModelId>;
      if (ce.detail) setActiveModelId(ce.detail);
      else setActiveModelId(loadActiveModel());
    };

    window.addEventListener("bizzmitra:wallet-changed", onWalletChange);
    window.addEventListener("bizzmitra:role-changed", onRoleChange);
    window.addEventListener("bizzmitra:model-changed", onModelChange);
    return () => {
      window.removeEventListener("bizzmitra:wallet-changed", onWalletChange);
      window.removeEventListener("bizzmitra:role-changed", onRoleChange);
      window.removeEventListener("bizzmitra:model-changed", onModelChange);
    };
  }, []);

  const activeModel = AI_MODELS.find((m) => m.id === activeModelId) || AI_MODELS[0]!;
  const currentAccess = canUserAccessModel(activeModelId, currentRole, user?.email, wallet.tier);

  function handleSelectModel(model: AiModel) {
    const access = canUserAccessModel(model.id, currentRole, user?.email, wallet.tier);
    if (access.allowed) {
      saveActiveModel(model.id);
      setActiveModelId(model.id);
      setIsModelDropdownOpen(false);
      if (access.isSuperAdminBypass) {
        toast.success(`🛡️ Super Admin Bypass: Switched to ${model.name} without payment.`);
      } else {
        toast.success(`Switched active model to ${model.name}.`);
      }
    } else {
      setIsModelDropdownOpen(false);
      setPendingModel(model);
      setCheckoutModalOpen(true);
    }
  }

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
      const isTestAcc = isTestingAccount(user?.email);
      let workspaceName = isTestAcc ? "TalentCraft HR Consultancy" : "";
      let problem = "";

      // 1. Pull active workspace context and roadmap from storage/DB
      const wsId = typeof window !== "undefined" ? window.localStorage.getItem("bizzmitra.activeWorkspaceId") : null;
      if (wsId && !wsId.startsWith("ws-")) {
        const { data: ws } = await supabase
          .from("workspaces")
          .select("name, problem_statement")
          .eq("id", wsId)
          .maybeSingle();
        if (ws?.name) workspaceName = ws.name;
        if (ws?.problem_statement) problem = ws.problem_statement;
      } else if (wsId?.startsWith("ws-") && isTestAcc) {
        try {
          const raw = window.localStorage.getItem("bizzmitra.workspaceContext");
          if (raw) {
            const parsed = JSON.parse(raw);
            if (parsed.businessName) workspaceName = parsed.businessName;
            if (parsed.problemStatement) problem = parsed.problemStatement;
          }
        } catch {}
      }

      // If non-testing user and no workspace in localStorage, check their Supabase workspaces
      if (!workspaceName && !isTestAcc && user?.id) {
        const { data: wsList } = await supabase
          .from("workspaces")
          .select("id, name, problem_statement")
          .eq("owner_id", user.id)
          .order("updated_at", { ascending: false })
          .limit(1);
        if (wsList && wsList.length > 0 && wsList[0]) {
          workspaceName = wsList[0].name;
          problem = wsList[0].problem_statement || "";
          window.localStorage.setItem("bizzmitra.activeWorkspaceId", wsList[0].id);
        }
      }

      // If user has NO workspace created yet:
      if (!workspaceName) {
        await delay(400);
        const botMsg: Message = {
          id: `bot-${Date.now()}`,
          sender: "assistant",
          text: "Welcome to BizzMitra AI! You don't have an active workspace yet. Please create a new intake workspace to begin analyzing your digital blueprint.",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        };
        setMessages((prev) => [...prev, botMsg]);
        return;
      }

      // 2. Extract cached discovery inputs if available
      let discoverySummary = "";
      let diagnosticAnswers: Array<{ question: string; answer: string }> = [];
      try {
        if (typeof window !== "undefined") {
          const rawCtx = window.localStorage.getItem("bizzmitra.workspaceContext");
          if (rawCtx) {
            const parsed = JSON.parse(rawCtx);
            if (parsed.discoverySummary) discoverySummary = parsed.discoverySummary;
            if (parsed.discoveryAnswers) diagnosticAnswers = parsed.discoveryAnswers;
          }
        }
      } catch {}

      const roadmap = getRoadmapForWorkspace({ name: workspaceName, industry: "HR Tech" });
      const { topRisks, actionItems, scoreResult } = evaluateBlueprintRisks(roadmap, {
        name: workspaceName,
        problemStatement: problem,
      });

      let responseText = "";
      let badge: string | undefined = "Blueprint Copilot";
      let bullets: string[] | undefined = undefined;

      // 3. Primary Layer: Call Live Server AI Copilot with Conversation History & Full Context
      try {
        const res = await fetch("/api/ai/copilot", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: textToSend,
            history: messages.map((m) => ({
              sender: m.sender,
              text: m.text,
              bullets: m.bullets,
            })),
            workspaceContext: {
              workspaceId: wsId || undefined,
              businessName: workspaceName,
              industry: "HR Tech",
              problemStatement: problem,
              discoverySummary,
              diagnosticAnswers,
              roadmap,
            },
            activeModelId,
          }),
        });

        if (res.ok) {
          const data = await res.json();
          if (data.text) {
            responseText = data.text;
            badge = data.badge || "Blueprint Copilot";
            bullets = Array.isArray(data.bullets) && data.bullets.length > 0 ? data.bullets : undefined;
          }
        }
      } catch (apiErr) {
        console.warn("[AiCopilotPanel] Server copilot API unavailable, using local intelligence engine:", apiErr);
      }

      // 4. Secondary Layer: Contextual Deterministic Fallback if server inference is unreachable
      if (!responseText) {
        const q = textToSend.toLowerCase().trim();

        // Check for Out-of-Scope questions
        const outOfScopeRegex = /(recipe|cake|pasta|cook|food|bake|dinner|weather|rain|temperature|cricket|football|fifa|ipl|world\s*cup|movie|cinema|actor|actress|hollywood|bollywood|song|lyrics|singer|celebrity|joke|comedy|funny|horoscope|zodiac|astrology|capital\s*of|president\s*of|prime\s*minister\s*of|who\s*won\b|translate\b|homework|dating|girlfriend|boyfriend)/i;

        if (outOfScopeRegex.test(q)) {
          badge = "Scope Notice";
          responseText = `This question is outside my context scope. I am dedicated to **${workspaceName}**'s business transformation, roadmap, and architecture.`;
          bullets = undefined;
        }
        // Intent: Specific Day in Rollout Plan (e.g. "what is the work to do on day 7", "day 1", "day 14")
        else if (/\b(?:day|on\s+day)\s*(\d+)\b/i.test(q)) {
          const match = q.match(/\b(?:day|on\s+day)\s*(\d+)\b/i);
          const dayNum = match ? parseInt(match[1]!, 10) : 7;
          const weekNum = Math.ceil(dayNum / 7) || 1;
          const dayInWeek = ((dayNum - 1) % 7) + 1;

          // Find which phase this day belongs to
          const currentPhase = roadmap.phases.find(
            (p) => (p.startWeek + 1) <= weekNum && weekNum <= (p.startWeek + p.durationWeekCount)
          ) || (weekNum > roadmap.targetTimelineWeeks ? roadmap.phases[roadmap.phases.length - 1]! : roadmap.phases[0]!);

          const activeMilestone = currentPhase.milestones[Math.min(dayInWeek - 1, currentPhase.milestones.length - 1)] || currentPhase.milestones[0];

          badge = `Day ${dayNum}`;
          responseText = `On **Day ${dayNum}** (Phase ${currentPhase.phaseNumber}, Week ${weekNum}):`;
          bullets = [
            `${activeMilestone?.title ?? "System pipeline validation"} (${activeMilestone?.deliverable ?? "Core deliverable"})`,
            `Sprint review and daily test sign-off`,
          ];
        }
        // Intent: Greetings & Casual Openers
        else if (/^(hi|hello|hey|greetings|namaste|good\s(morning|afternoon|evening)|yo\b|sup\b|howdy)/i.test(q)) {
          badge = "Blueprint Copilot";
          responseText = `Hello! How can I assist with your **${workspaceName}** blueprint today?`;
          bullets = undefined;
        }
        // Intent: Status & Well-being
        else if (/how\s*(are|r)\s*you|how's\s*it\s*going|what'?s\s*up/i.test(q)) {
          badge = "Blueprint Copilot";
          responseText = `I'm doing well! What would you like to explore for **${workspaceName}**?`;
          bullets = undefined;
        }
        // Intent: Politeness & Closures
        else if (/^(thanks|thank\s*you|thx|appreciate\s*it|great\s*thanks|bye|goodbye)/i.test(q)) {
          badge = "Blueprint Copilot";
          responseText = `You're welcome! Let me know if you need anything else for **${workspaceName}**.`;
          bullets = undefined;
        }
        // Intent: Capabilities / Help
        else if (q === "help" || /what\s*can\s*you\s*do|who\s*are\s*you/i.test(q)) {
          badge = "Copilot Scope";
          responseText = `I provide direct insights on **${workspaceName}**'s rollout timeline, daily sprint work, architecture, risks, and budget.`;
          bullets = undefined;
        }
        // Intent: Rollout Timeline & Phases
        else if (q.includes("rollout") || q.includes("timeline") || q.includes("schedule") || q.includes("how long") || q.includes("duration") || q.includes("phase") || q.includes("week") || q.includes("gantt")) {
          badge = "Delivery Roadmap";
          responseText = `Rollout is **${roadmap.targetTimelineWeeks} weeks** across **${roadmap.phases.length} phases** (${roadmap.totalPersonDays} person-days total effort):`;
          bullets = roadmap.phases.map(
            (p) => `Phase ${p.phaseNumber}: ${p.name} (${p.durationWeeks})`,
          );
        }
        // Intent: Risks & Compliance
        else if (q.includes("risk") || q.includes("threat") || q.includes("security") || q.includes("compliance") || q.includes("dpdp") || q.includes("audit")) {
          const primaryRisk = topRisks[0];
          const backupRisk = roadmap.riskRegister[0];
          badge = "Risk & Compliance";
          responseText = `Primary risk is **${primaryRisk?.title ?? backupRisk?.title}** (${primaryRisk?.category ?? "Compliance"}): ${primaryRisk?.remediation ?? backupRisk?.mitigationStrategy ?? "Automated retention triggers in PostgreSQL"}.`;
          bullets = undefined;
        }
        // Intent: Financials, Budget, CapEx, ROI, Savings
        else if (q.includes("budget") || q.includes("cost") || q.includes("financial") || q.includes("roi") || q.includes("saving") || q.includes("money") || q.includes("capex") || q.includes("price") || q.includes("how much")) {
          badge = "Financial Model";
          const estimatedCapex = roadmap.totalPersonDays * 12500;
          responseText = `Estimated CapEx for **${workspaceName}** is ~₹${(estimatedCapex / 100000).toFixed(1)} Lakhs (${roadmap.totalPersonDays} person-days, 4.2-month payback).`;
          bullets = undefined;
        }
        // Intent: Next Action Items, Sprints & Tasks
        else if (q.includes("action") || q.includes("next") || q.includes("todo") || q.includes("task") || q.includes("sprint") || q.includes("deliverable")) {
          badge = "Next Actions";
          responseText = `Immediate sprint deliverables:`;
          bullets = actionItems.slice(0, 2).map(
            (item) => `${item.title} (${item.timeline})`,
          );
        }
        // Intent: Architecture, Tech Stack, Database, API
        else if (q.includes("database") || q.includes("postgres") || q.includes("schema") || q.includes("sql") || q.includes("tables")) {
          badge = "Database";
          responseText = `**PostgreSQL 16** with Row-Level Security (RLS) isolating tenant records, automated audit trails, and DPDP compliance retention triggers.`;
          bullets = undefined;
        }
        else if (q.includes("api") || q.includes("rest") || q.includes("endpoint")) {
          badge = "API Surface";
          responseText = `REST API on **Cloudflare Edge Workers** with JWT Bearer authentication, rate limiting, and OpenAPI 3.1 schema.`;
          bullets = undefined;
        }
        else if (q.includes("architecture") || q.includes("stack") || q.includes("tech") || q.includes("backend") || q.includes("frontend") || q.includes("hld") || q.includes("lld")) {
          badge = "Architecture";
          responseText = `Core stack for **${workspaceName}**: React 19 frontend, Cloudflare Edge Worker gateway, BullMQ queue, and PostgreSQL 16 with RLS.`;
          bullets = undefined;
        }
        // Intent: Confidence Score & Maturity
        else if (q.includes("confidence") || q.includes("score") || q.includes("maturity") || q.includes("readiness")) {
          badge = "Readiness Score";
          responseText = `Confidence Score is **${scoreResult.score}% (${scoreResult.grade})** across ${scoreResult.breakdown.length} verified blueprint domains.`;
          bullets = undefined;
        }
        // Intent: Contextual fallback with relevance check
        else {
          const isBusinessRelated = /(work|task|sprint|item|step|plan|goal|lead|status|system|data|flow|user|client|customer|scale|cost|price|fee|pay|bill|time|date|month|year|deploy|launch|release|test|bug|fix|code|spec|api|doc|team|staff|role|hire|metric|kpi|milestone)/i.test(q);
          if (!isBusinessRelated) {
            badge = "Scope Notice";
            responseText = `This question is outside my context scope. I am dedicated to **${workspaceName}**'s business transformation, roadmap, and architecture.`;
            bullets = undefined;
          } else {
            badge = "Blueprint Copilot";
            responseText = `For **${workspaceName}**, this relates to your ${roadmap.targetTimelineWeeks}-week delivery path. Ask me about timeline, daily sprint work, budget, or architecture.`;
            bullets = undefined;
          }
        }
      }

      // 5. Deduct credits based on exact token count (prompt tokens + completion tokens) & active model multiplier
      const fullResponseContent = `${responseText} ${bullets ? bullets.join(" ") : ""}`;
      deductCreditsByTokens(
        textToSend,
        fullResponseContent,
        `AI Copilot (${activeModel.name}): "${textToSend.slice(0, 30)}${textToSend.length > 30 ? "..." : ""}"`,
        activeModel.costMultiplier,
      );

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
      {/* Bottom-right Persistent Floating Launcher (elevated on mobile to clear MobileBottomNav) */}
      <div className="fixed bottom-[calc(5.25rem+env(safe-area-inset-bottom,0px))] right-4 sm:bottom-6 sm:right-6 z-40">
        <motion.button
          whileHover={{ scale: 1.06, y: -2 }}
          whileTap={{ scale: 0.94 }}
          onClick={() => setIsOpen(!isOpen)}
          className="neu-press group flex items-center gap-2.5 rounded-2xl bg-primary px-3.5 py-3 sm:px-4 sm:py-3.5 text-sm font-bold text-primary-foreground shadow-2xl glow-primary"
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
            initial={{ opacity: 0, y: 40, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 360, damping: 32 }}
            className="fixed inset-x-2 bottom-[calc(5.25rem+env(safe-area-inset-bottom,0px))] top-14 sm:inset-x-auto sm:bottom-4 sm:right-4 sm:top-4 z-[70] flex w-auto sm:w-full sm:max-w-[420px] flex-col overflow-hidden rounded-3xl border border-border/80 bg-card/95 shadow-2xl backdrop-blur-xl"
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
                    <span
                      title="Available AI Credits. Deducted dynamically based on prompt + completion token usage."
                      className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary font-mono"
                    >
                      <Coins className="size-3" />
                      {wallet.balance} cr
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    Live metered • Deducts per token
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

            {/* AI Model Selector Bar */}
            <div className="border-b border-border/70 bg-muted/20 px-3.5 py-2">
              <div className="flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => setIsModelDropdownOpen(!isModelDropdownOpen)}
                  className="neu-sm neu-press flex items-center gap-2 rounded-xl px-2.5 py-1.5 text-xs text-foreground hover:border-primary/40 transition-all"
                >
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="size-3.5 text-primary" />
                    <span className="font-semibold">{activeModel.name}</span>
                    <span className="text-[10px] text-muted-foreground">({activeModel.provider})</span>
                  </div>
                  {currentAccess.isSuperAdminBypass ? (
                    <span
                      title="Super Admin / Whitelisted testing account: Free access to all AI models"
                      className="flex items-center gap-1 rounded-full bg-emerald-500/15 px-1.5 py-0.5 text-[9px] font-bold text-emerald-600 dark:text-emerald-400 font-mono"
                    >
                      <ShieldCheck className="size-2.5" />
                      Admin Bypass
                    </span>
                  ) : activeModel.isPro ? (
                    <span className="rounded-full bg-primary/15 px-1.5 py-0.5 text-[9px] font-bold text-primary font-mono">
                      Pro Active
                    </span>
                  ) : null}
                  {isModelDropdownOpen ? (
                    <ChevronUp className="size-3 text-muted-foreground ml-0.5" />
                  ) : (
                    <ChevronDown className="size-3 text-muted-foreground ml-0.5" />
                  )}
                </button>

                <div className="text-[10px] text-muted-foreground font-mono">
                  {activeModel.costMultiplier}x rate
                </div>
              </div>

              {/* Dropdown Menu */}
              <AnimatePresence>
                {isModelDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-2 space-y-1 overflow-hidden rounded-2xl border border-border/80 bg-card p-2 shadow-xl"
                  >
                    <div className="px-2 py-1 flex items-center justify-between text-[10px] text-muted-foreground font-medium border-b border-border/40 pb-1.5 mb-1">
                      <span>SELECT REASONING ENGINE</span>
                      {currentAccess.isSuperAdminBypass ? (
                        <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                          <ShieldCheck className="size-3" /> Admin: 0 Payment
                        </span>
                      ) : (
                        <span className="text-primary font-bold">Real-time Gateway</span>
                      )}
                    </div>

                    {AI_MODELS.map((model) => {
                      const isSelected = model.id === activeModelId;
                      const access = canUserAccessModel(model.id, currentRole, user?.email, wallet.tier);

                      return (
                        <button
                          key={model.id}
                          type="button"
                          onClick={() => handleSelectModel(model)}
                          className={`w-full flex items-center justify-between rounded-xl px-2.5 py-2 text-left transition-all ${
                            isSelected
                              ? "bg-primary/10 border border-primary/30"
                              : "hover:bg-muted/50 border border-transparent"
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div
                              className={`grid size-6 shrink-0 place-items-center rounded-lg ${
                                isSelected
                                  ? "bg-primary text-primary-foreground"
                                  : "bg-muted text-muted-foreground"
                              }`}
                            >
                              {isSelected ? <Check className="size-3.5" /> : <Bot className="size-3.5" />}
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5">
                                <span className="text-xs font-bold text-foreground truncate">
                                  {model.name}
                                </span>
                                <span className="text-[10px] text-muted-foreground">
                                  • {model.provider}
                                </span>
                              </div>
                              <p className="text-[10px] text-muted-foreground truncate">
                                {model.description}
                              </p>
                            </div>
                          </div>

                          <div className="shrink-0 ml-2">
                            {access.isSuperAdminBypass ? (
                              <span className="flex items-center gap-1 rounded-md bg-emerald-500/10 px-1.5 py-0.5 text-[9px] font-bold text-emerald-600 dark:text-emerald-400">
                                <ShieldCheck className="size-2.5" />
                                Admin Free
                              </span>
                            ) : !model.isPro ? (
                              <span className="rounded-md bg-muted px-1.5 py-0.5 text-[9px] font-medium text-muted-foreground">
                                Free
                              </span>
                            ) : access.allowed ? (
                              <span className="rounded-md bg-primary/10 px-1.5 py-0.5 text-[9px] font-bold text-primary">
                                Unlocked
                              </span>
                            ) : (
                              <span className="flex items-center gap-1 rounded-md bg-amber-500/15 px-1.5 py-0.5 text-[9px] font-bold text-amber-600 dark:text-amber-400">
                                <Lock className="size-2.5" />
                                {model.tierRequired === "Enterprise Scale" ? "₹15,999" : "₹3,999"}
                              </span>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
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
                      className={`mt-2 flex items-center justify-end text-[9px] ${
                        m.sender === "user" ? "text-primary-foreground/70" : "text-muted-foreground/80"
                      }`}
                    >
                      <span>{m.timestamp}</span>
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
              className="border-t border-border/70 p-3 shrink-0 bg-card"
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

      <AiModelPaymentModal
        isOpen={checkoutModalOpen}
        onClose={() => setCheckoutModalOpen(false)}
        model={pendingModel}
        onSuccess={(upgradedModel) => {
          setActiveModelId(upgradedModel.id);
        }}
        currentRole={currentRole}
      />
    </>
  );
}
