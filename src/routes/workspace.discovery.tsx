import { createFileRoute, Link } from "@tanstack/react-router";
import { AnimatePresence, motion } from "motion/react";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  HelpCircle,
  Lightbulb,
  Search,
  Send,
  Sparkles,
  TrendingUp,
  Users,
  Upload,
  FileText,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { AppShell } from "@/components/AppShell";
import { ArtifactHeader } from "@/components/ArtifactHeader";
import { ThinkingDots, Typewriter } from "@/components/motion/primitives";
import {
  getActiveAiSummary,
  getActiveBusinessAnalysis,
  getActiveDiscoveryScript,
  HR_CONSULTANCY_PROBLEM,
  DiscoveryQuestionItem,
  BusinessAnalysisReport,
} from "@/lib/demo-data";
import { generateDynamicDiscovery } from "@/lib/ai/discovery-ai";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { DocumentIngestionModal } from "@/components/DocumentIngestionModal";
import { completeDiscoveryAndUnlockAll, StageNextButton } from "@/lib/workspace-stage-gate";

export const Route = createFileRoute("/workspace/discovery")({
  head: () => ({
    meta: [
      { title: "AI Discovery & Business Analysis — BizzMitra-AI" },
      {
        name: "description",
        content: "Context-aware discovery interview and automated business analysis engine.",
      },
      { property: "og:title", content: "AI Discovery & Business Analysis — BizzMitra-AI" },
      {
        property: "og:description",
        content: "Targeted discovery questions and structured business analysis.",
      },
    ],
  }),
  component: DiscoveryPage,
});

type Turn = {
  role: "user" | "ai";
  text: string;
  hint?: string;
  whyWeAsk?: string;
  missingEntity?: string;
};

function DiscoveryPage() {
  const { user } = useAuth();
  const [workspaceId, setWorkspaceId] = useState<string | null>(null);

  const initialContext = (() => {
    if (typeof window === "undefined") {
      return { problem: HR_CONSULTANCY_PROBLEM, businessName: "Enterprise Workspace", industry: "Cross-Industry" };
    }
    try {
      const raw = window.localStorage.getItem("bizzmitra.workspaceContext");
      if (raw) {
        const parsed = JSON.parse(raw);
        return {
          problem: parsed.problemStatement || parsed.summary || HR_CONSULTANCY_PROBLEM,
          businessName: parsed.businessName || parsed.name || "Enterprise Workspace",
          industry: parsed.industry || "Cross-Industry",
        };
      }
    } catch {}
    return { problem: HR_CONSULTANCY_PROBLEM, businessName: "Enterprise Workspace", industry: "Cross-Industry" };
  })();

  const [problemText, setProblemText] = useState<string>(initialContext.problem);
  const [turns, setTurns] = useState<Turn[]>([]);
  const [step, setStep] = useState(0);
  const [thinking, setThinking] = useState(false);
  const [complete, setComplete] = useState(false);
  const [customInput, setCustomInput] = useState("");
  const [isDocModalOpen, setIsDocModalOpen] = useState(false);

  const [dynamicScript, setDynamicScript] = useState<DiscoveryQuestionItem[]>(() =>
    getActiveDiscoveryScript(initialContext.problem, initialContext.businessName, initialContext.industry)
  );
  const [dynamicSummary, setDynamicSummary] = useState<string>(() =>
    getActiveAiSummary(initialContext.problem, initialContext.businessName, initialContext.industry)
  );
  const [dynamicAnalysis, setDynamicAnalysis] = useState<BusinessAnalysisReport>(() =>
    getActiveBusinessAnalysis(initialContext.problem, initialContext.businessName, initialContext.industry)
  );
  const [aiModelLabel, setAiModelLabel] = useState<string>("BizzMitra NLP Engine");

  const script = dynamicScript;
  const summaryText = dynamicSummary;
  const analysis = dynamicAnalysis;

  useEffect(() => {
    const id = window.localStorage.getItem("bizzmitra.activeWorkspaceId");
    setWorkspaceId(id);

    // Read problem text from local context or Supabase
    let loadedText = "";
    let bName = "Enterprise Workspace";
    let goalsText = "";
    let constraintsText = "";
    try {
      const raw = window.localStorage.getItem("bizzmitra.workspaceContext");
      if (raw) {
        const parsed = JSON.parse(raw);
        loadedText = parsed.problemStatement || parsed.summary || "";
        bName = parsed.businessName || parsed.name || bName;
        ind = parsed.industry || ind;
        goalsText = parsed.goals || "";
        constraintsText = parsed.constraints || "";
      }
    } catch {}

    if (!loadedText) loadedText = HR_CONSULTANCY_PROBLEM;
    setProblemText(loadedText);

    // Immediate synchronous domain calibration
    const localScript = getActiveDiscoveryScript(loadedText, bName, ind);
    const localSummary = getActiveAiSummary(loadedText, bName, ind);
    const localAnalysis = getActiveBusinessAnalysis(loadedText, bName, ind);
    setDynamicScript(localScript);
    setDynamicSummary(localSummary);
    setDynamicAnalysis(localAnalysis);

    // Dynamically generate discovery questions & analysis via Groq Llama 3.3 70B LLM
    void generateDynamicDiscovery(loadedText, bName, ind, {
      goals: goalsText,
      constraints: constraintsText,
    }).then((res) => {
      setDynamicScript(res.questions);
      setDynamicSummary(res.summary);
      setDynamicAnalysis(res.businessAnalysis);
      setAiModelLabel(res.modelUsed || (res.source === "groq-llm" ? "Groq Llama 3.3 70B" : "BizzMitra Strategic Engine"));

      // If user hasn't answered yet, update the active question to the newly generated Groq question
      setTurns((prev) => {
        if (prev.length <= 2 && res.questions[0]) {
          const userTurn = prev.find((t) => t.role === "user") || { role: "user", text: loadedText };
          return [
            userTurn,
            {
              role: "ai",
              text: res.questions[0].question,
              hint: res.questions[0].hint,
              whyWeAsk: res.questions[0].whyWeAsk,
              missingEntity: res.questions[0].missingEntity,
            },
          ];
        }
        return prev;
      });
    });

    const isUuid = id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

    if (!user || !id || !isUuid) {
      // Local fallback mode
      setTurns([{ role: "user", text: loadedText }]);
      setThinking(true);
      return;
    }

    async function loadMessages() {
      const { data, error } = await supabase
        .from("discovery_messages")
        .select("role, content")
        .eq("workspace_id", id!)
        .order("created_at");

      if (error) {
        console.warn(error.message);
      }

      // Check if existing messages match the current problem intake
      const isMatchingCurrentProblem =
        data && data.length > 0 && data[0]?.content?.trim() === loadedText.trim();

      if (isMatchingCurrentProblem && data) {
        const loadedTurns = data.map((message) => ({
          role: message.role as Turn["role"],
          text: message.content,
        }));
        setTurns(loadedTurns);
        const answered = loadedTurns.filter((t) => t.role === "user").length - 1;
        setStep(Math.max(0, answered));
        setComplete(loadedTurns.some((t) => t.text === localSummary));
      } else {
        if (!id!.startsWith("ws-")) {
          const { data: ws } = await supabase
            .from("workspaces")
            .select("problem_statement")
            .eq("id", id!)
            .maybeSingle();
          if (ws?.problem_statement && ws.problem_statement !== loadedText) {
            loadedText = ws.problem_statement;
            setProblemText(loadedText);
            const wsScript = getActiveDiscoveryScript(loadedText, bName, ind);
            setDynamicScript(wsScript);
            setDynamicSummary(getActiveAiSummary(loadedText, bName, ind));
            setDynamicAnalysis(getActiveBusinessAnalysis(loadedText, bName, ind));
            void generateDynamicDiscovery(loadedText, bName, ind).then((res) => {
              setDynamicScript(res.questions);
              setDynamicSummary(res.summary);
              setDynamicAnalysis(res.businessAnalysis);
              setAiModelLabel(res.source === "groq-llm" ? "Groq 120B AI" : "BizzMitra NLP Engine");
            });
          }

          // Clear any stale messages if problem has changed
          if (data && data.length > 0 && !isMatchingCurrentProblem) {
            await supabase.from("discovery_messages").delete().eq("workspace_id", id!);
          }

          await supabase.from("discovery_messages").insert({
            workspace_id: id!,
            role: "user",
            content: loadedText,
          });
        }

        setTurns([{ role: "user", text: loadedText }]);
        setThinking(true);
      }
    }

    void loadMessages();
  }, [user]);

  // AI response streaming effect
  useEffect(() => {
    if (!thinking) return;
    const t = setTimeout(() => {
      if (step < script.length) {
        const q = script[step]!;
        if (workspaceId && !workspaceId.startsWith("ws-")) {
          void supabase.from("discovery_messages").insert({
            workspace_id: workspaceId,
            role: "ai",
            content: q.question,
          });
        }
        setTurns((prev) => [
          ...prev,
          {
            role: "ai",
            text: q.question,
            hint: q.hint,
            whyWeAsk: q.whyWeAsk,
            missingEntity: q.missingEntity,
          },
        ]);
      } else {
        if (workspaceId && !workspaceId.startsWith("ws-")) {
          void supabase.from("discovery_messages").insert({
            workspace_id: workspaceId,
            role: "ai",
            content: summaryText,
          });
        }
        setTurns((prev) => [...prev, { role: "ai", text: summaryText }]);
        setComplete(true);
        completeDiscoveryAndUnlockAll();
        toast.success("AI Discovery complete! All workspace blueprints are now unlocked.");
      }
      setThinking(false);
    }, 1200);

    return () => clearTimeout(t);
  }, [thinking, step, workspaceId, script, summaryText]);

  useEffect(() => {
    if (complete) {
      completeDiscoveryAndUnlockAll();
    }
  }, [complete]);

  function handleFastTrackComplete() {
    setThinking(true);
    setTimeout(() => {
      setTurns((prev) => [...prev, { role: "ai", text: summaryText }]);
      setComplete(true);
      completeDiscoveryAndUnlockAll();
      setThinking(false);
      toast.success("AI Discovery complete! All workspace blueprints are now unlocked.");
    }, 600);
  }

  function submitAnswer(textToSubmit: string) {
    if (!textToSubmit.trim()) return;
    if (workspaceId && !workspaceId.startsWith("ws-")) {
      void supabase.from("discovery_messages").insert({
        workspace_id: workspaceId,
        role: "user",
        content: textToSubmit,
      });
    }

    setTurns((prev) => [...prev, { role: "user", text: textToSubmit }]);
    setCustomInput("");
    setStep((s) => s + 1);
    setThinking(true);
  }

  const currentQuestion = step < script.length ? script[step] : null;
  const progressPercent = Math.min(100, Math.round(((step + (complete ? 1 : 0)) / (script.length + 1)) * 100));
  const confidenceScore = complete ? 96 : Math.min(92, 38 + step * 24);

  return (
    <AppShell>
      <ArtifactHeader
        id="discovery"
        kicker="Step 02"
        title="AI Discovery & Business Analysis"
      />

      {/* Dynamic Model Status Bar */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-primary/20 bg-primary/5 px-3.5 py-2">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/15 px-2.5 py-0.5 text-[11px] font-semibold text-primary">
            <Sparkles className="size-3 animate-pulse text-primary" />
            {aiModelLabel}
          </span>
          <span className="text-[11px] text-muted-foreground">
            Adaptive diagnostic interview generated in real-time based on your problem intake
          </span>
        </div>
        <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
          Groq High-Throughput Inference
        </span>
      </div>

      {/* Business Document Upload Fast-Track Banner */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border/80 bg-card/60 p-3.5 shadow-xs backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="grid size-9 place-items-center rounded-xl bg-primary/10 text-primary">
            <Upload className="size-4.5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-foreground">Have an existing SOP, BRD, or PDF Specification?</h4>
            <p className="text-[11px] text-muted-foreground">Upload your document to auto-extract context and fast-track discovery analysis.</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setIsDocModalOpen(true)}
          className="rounded-xl bg-primary px-3.5 py-2 text-xs font-bold text-primary-foreground shadow-xs glow-primary hover:opacity-90 active:scale-95 flex items-center gap-1.5"
        >
          <Upload className="size-3.5" /> Upload SOP / BRD
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_310px]">
        {/* Main Conversation Stream */}
        <div className="neu p-5 sm:p-6 space-y-6">
          <div className="space-y-4">
            <AnimatePresence initial={false}>
              {turns.map((t, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                  className={t.role === "user" ? "flex justify-end" : ""}
                >
                  <div
                    className={
                      t.role === "user"
                        ? "max-w-[85%] rounded-2xl rounded-br-sm bg-primary px-4 py-3 text-xs sm:text-sm text-primary-foreground shadow-sm"
                        : "max-w-[92%]"
                    }
                  >
                    {t.role === "ai" ? (
                      <div className="neu-sm px-4 py-3.5 space-y-2">
                        <div className="flex items-center gap-2 text-primary font-semibold text-xs">
                          <Sparkles className="size-3.5" />
                          <span>AI Business Consultant</span>
                        </div>
                        <p className="text-xs sm:text-sm leading-relaxed text-foreground">
                          {i === turns.length - 1 ? <Typewriter text={t.text} /> : t.text}
                        </p>

                        {/* Missing Information Detector Callout */}
                        {t.missingEntity && (
                          <div className="neu-inset mt-3 rounded-lg p-2.5 text-xs space-y-1">
                            <p className="font-semibold text-primary flex items-center gap-1.5">
                              <Search className="size-3 text-primary" />
                              <span>Missing Information: {t.missingEntity}</span>
                            </p>
                            {t.whyWeAsk && (
                              <p className="text-[11px] text-muted-foreground leading-normal">
                                <strong className="text-foreground">Why we ask:</strong> {t.whyWeAsk}
                              </p>
                            )}
                          </div>
                        )}

                        {t.hint && (
                          <p className="flex items-start gap-1.5 text-[11px] text-muted-foreground pt-1">
                            <Lightbulb className="mt-0.5 size-3 shrink-0 text-clay" />
                            <span>{t.hint}</span>
                          </p>
                        )}
                      </div>
                    ) : (
                      t.text
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {thinking && (
              <div className="neu-sm w-fit px-4 py-3">
                <ThinkingDots label="AI Consultant is analyzing business context..." />
              </div>
            )}
          </div>

          {/* User Response Controls */}
          <div className="border-t border-border pt-4">
            {complete ? (
              <div className="space-y-4">
                <div className="neu-inset p-4 rounded-xl flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                      <CheckCircle2 className="size-4" /> Discovery Completed & Context Verified
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Business Analysis synthesized below. Ready to generate solution recommendations.
                    </p>
                  </div>
                  <Link
                    to="/workspace/solution"
                    className="neu-press inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-xs sm:text-sm font-semibold text-primary-foreground whitespace-nowrap shadow-md"
                  >
                    View Solution Recommendations <ArrowRight className="size-4" />
                  </Link>
                </div>
              </div>
            ) : currentQuestion && !thinking ? (
              <div className="space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                    Select a response or type a custom answer:
                  </p>
                  <button
                    type="button"
                    onClick={handleFastTrackComplete}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-primary/30 bg-primary/10 px-2.5 py-1 text-[11px] font-bold text-primary hover:bg-primary/20 transition-colors shadow-xs"
                    title="Skip remaining questions and synthesize full business analysis now"
                  >
                    <Sparkles className="size-3" />
                    <span>Synthesize & Unlock Solution Studio</span>
                  </button>
                </div>

                {/* Quick Contextual Response Options */}
                <div className="grid gap-2">
                  {currentQuestion.options.map((opt, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => submitAnswer(opt)}
                      className="neu-sm neu-press p-3 text-left text-xs hover:border-primary/50 transition-all flex items-start justify-between gap-2 group"
                    >
                      <span className="leading-relaxed text-foreground">{opt}</span>
                      <ArrowRight className="size-3.5 text-muted-foreground group-hover:text-primary shrink-0 mt-0.5 transition-colors" />
                    </button>
                  ))}
                </div>

                {/* Custom Input Bar */}
                <div className="flex gap-2 pt-1">
                  <input
                    type="text"
                    value={customInput}
                    onChange={(e) => setCustomInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && customInput.trim()) {
                        submitAnswer(customInput.trim());
                      }
                    }}
                    placeholder="Or type specific details about your business..."
                    className="neu-inset flex-1 px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-primary"
                  />
                  <button
                    type="button"
                    disabled={!customInput.trim()}
                    onClick={() => submitAnswer(customInput.trim())}
                    className="neu-sm neu-press px-4 py-2 text-xs font-semibold text-primary flex items-center gap-1.5 disabled:opacity-40"
                  >
                    <Send className="size-3" /> Send
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </div>

        {/* Right Context & Missing Info Sidebar */}
        <aside className="space-y-4">
          <div className="neu p-5">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                Context Maturity
              </p>
              <span className="text-xs font-bold text-primary">{confidenceScore}%</span>
            </div>

            <div className="neu-inset mt-2 h-2 overflow-hidden rounded-full p-0">
              <motion.div
                className="h-full rounded-full bg-primary"
                animate={{ width: `${progressPercent}%` }}
                transition={{ type: "spring", stiffness: 180, damping: 26 }}
              />
            </div>

            <div className="mt-4 space-y-2.5 text-xs">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="size-3.5 text-emerald-500 shrink-0" />
                <span className="font-medium text-foreground">Problem Context Captured</span>
              </div>
              <div className="flex items-center gap-2">
                {step > 0 ? (
                  <CheckCircle2 className="size-3.5 text-emerald-500 shrink-0" />
                ) : (
                  <HelpCircle className="size-3.5 text-muted-foreground shrink-0" />
                )}
                <span className={step > 0 ? "font-medium text-foreground" : "text-muted-foreground"}>
                  {step > 0 ? "Volume & Client Scale ✓" : "Volume & Scale Detection…"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {step > 1 ? (
                  <CheckCircle2 className="size-3.5 text-emerald-500 shrink-0" />
                ) : (
                  <HelpCircle className="size-3.5 text-muted-foreground shrink-0" />
                )}
                <span className={step > 1 ? "font-medium text-foreground" : "text-muted-foreground"}>
                  {step > 1 ? "Vetting Lifecycle & Gaps ✓" : "Lifecycle Stages…"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {step > 2 ? (
                  <CheckCircle2 className="size-3.5 text-emerald-500 shrink-0" />
                ) : (
                  <HelpCircle className="size-3.5 text-muted-foreground shrink-0" />
                )}
                <span className={step > 2 ? "font-medium text-foreground" : "text-muted-foreground"}>
                  {step > 2 ? "Attendance & Portal Rules ✓" : "Compliance & Operations…"}
                </span>
              </div>
            </div>
          </div>

          {/* Active Context Card */}
          <div className="neu p-5 space-y-3">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Extracted Persona Model
            </p>
            <div className="space-y-2 text-xs">
              <div className="neu-inset p-2.5 rounded-lg space-y-1">
                <p className="font-bold text-foreground">Target Stakeholders</p>
                <p className="text-[11px] text-muted-foreground">
                  {analysis.stakeholders.slice(0, 3).map((s) => `${s.role} (${s.count})`).join(", ")}
                </p>
              </div>
              <div className="neu-inset p-2.5 rounded-lg space-y-1">
                <p className="font-bold text-foreground">Identified Friction</p>
                <p className="text-[11px] text-muted-foreground">
                  {analysis.currentState.bottlenecks.slice(0, 3).join("; ")}
                </p>
              </div>
            </div>
          </div>
        </aside>
      </div>

      {/* Business Analysis Engine Section */}
      {complete && (
        <motion.section
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mt-8 space-y-6"
        >
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-primary">
                Futurrizon Business Analysis Engine
              </p>
              <h2 className="font-display text-2xl font-bold mt-1">
                Business Discovery & Gap Analysis Report
              </h2>
            </div>
            <span className="neu-sm px-3 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
              <CheckCircle2 className="size-3.5" /> Validated by AI Consultant
            </span>
          </div>

          {/* Current State vs Future State Grid */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Current State */}
            <div className="neu p-5 sm:p-6 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-display text-base font-bold flex items-center gap-2">
                  <AlertTriangle className="size-4 text-amber-500" />
                  <span>Current State (As-Is)</span>
                </h3>
                <span className="neu-sm px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
                  Efficiency: {analysis.currentState.efficiencyScore}%
                </span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {analysis.currentState.summary}
              </p>
              <div className="neu-inset p-3 rounded-lg space-y-1.5">
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Active Tools
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {analysis.currentState.tools.map((t, idx) => (
                    <span key={idx} className="neu-sm px-2 py-0.5 text-[10px] font-medium">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
              <div className="space-y-1 pt-1">
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Primary Bottlenecks
                </p>
                <ul className="space-y-1 text-xs text-muted-foreground">
                  {analysis.currentState.bottlenecks.map((b, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="text-amber-500 font-bold">•</span>
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Future State */}
            <div className="neu p-5 sm:p-6 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-display text-base font-bold flex items-center gap-2 text-primary">
                  <Sparkles className="size-4" />
                  <span>Future State (To-Be)</span>
                </h3>
                <span className="neu-sm px-2 py-0.5 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                  Target: 95% Automated
                </span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {analysis.futureState.summary}
              </p>
              <div className="neu-inset p-3 rounded-lg space-y-1.5">
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Recommended Architecture Modules
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {analysis.futureState.recommendedModules.map((m, idx) => (
                    <span key={idx} className="neu-sm px-2 py-0.5 text-[10px] font-semibold text-primary">
                      {m}
                    </span>
                  ))}
                </div>
              </div>
              <div className="space-y-1 pt-1">
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Automation Initiatives
                </p>
                <ul className="space-y-1 text-xs text-muted-foreground">
                  {analysis.futureState.automationOpportunities.map((o, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="text-primary font-bold">✓</span>
                      <span>{o}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Stakeholder Analysis Table */}
          <div className="neu p-5 sm:p-6 space-y-3">
            <h3 className="font-display text-base font-bold flex items-center gap-2">
              <Users className="size-4 text-primary" />
              <span>Stakeholder Analysis & Personas</span>
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-border text-[10px] uppercase text-muted-foreground tracking-wider">
                    <th className="pb-2 font-semibold">Stakeholder Group</th>
                    <th className="pb-2 font-semibold">Scale</th>
                    <th className="pb-2 font-semibold">Core Needs</th>
                    <th className="pb-2 font-semibold">Business Impact</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {analysis.stakeholders.map((s, idx) => (
                    <tr key={idx} className="hover:bg-card/40 transition-colors">
                      <td className="py-2.5 font-bold text-foreground">{s.role}</td>
                      <td className="py-2.5 text-muted-foreground">{s.count}</td>
                      <td className="py-2.5 text-foreground leading-relaxed">{s.needs}</td>
                      <td className="py-2.5 text-muted-foreground">{s.impact}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Gap Analysis Matrix */}
          <div className="neu p-5 sm:p-6 space-y-3">
            <h3 className="font-display text-base font-bold">Gap Analysis Matrix</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-border text-[10px] uppercase text-muted-foreground tracking-wider">
                    <th className="pb-2 font-semibold">Functional Area</th>
                    <th className="pb-2 font-semibold">Current Process (As-Is)</th>
                    <th className="pb-2 font-semibold">Future Architecture (To-Be)</th>
                    <th className="pb-2 font-semibold">Severity</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {analysis.gapAnalysis.map((g, idx) => (
                    <tr key={idx} className="hover:bg-card/40 transition-colors">
                      <td className="py-2.5 font-bold text-foreground">{g.area}</td>
                      <td className="py-2.5 text-muted-foreground leading-relaxed">{g.current}</td>
                      <td className="py-2.5 text-foreground leading-relaxed">{g.future}</td>
                      <td className="py-2.5">
                        <span
                          className={`neu-sm px-2 py-0.5 text-[10px] font-bold ${
                            g.severity === "Critical"
                              ? "text-red-500"
                              : g.severity === "High"
                              ? "text-amber-500"
                              : "text-blue-500"
                          }`}
                        >
                          {g.severity}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Quantified Business Impact Cards */}
          <div className="neu p-5 sm:p-6 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-base font-bold flex items-center gap-2">
                <TrendingUp className="size-4 text-emerald-500" />
                <span>Quantified Transformation Impact</span>
              </h3>
              <span className="text-[11px] text-muted-foreground font-medium">
                Baseline vs. Post-Implementation Projection
              </span>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5 pt-2">
              {analysis.businessImpact.map((item, idx) => (
                <div key={idx} className="neu-inset p-3 rounded-xl text-center space-y-1">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider truncate">
                    {item.metric}
                  </p>
                  <p className="font-display text-lg font-extrabold text-foreground">
                    {item.projected}
                  </p>
                  <div className="flex items-center justify-center gap-1.5 text-[10px]">
                    <span className="text-muted-foreground line-through">{item.current}</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">
                      {item.improvement}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <StageNextButton currentStageId="discovery" label="Proceed to Solution Studio" />
        </motion.section>
      )}

      <DocumentIngestionModal
        isOpen={isDocModalOpen}
        onClose={() => setIsDocModalOpen(false)}
        onApplyContext={(ctx) => {
          const docMessage = `📄 Ingested Document: ${ctx.fileName} (${ctx.fileSizeFormatted})\n\nBusiness Domain: ${ctx.inferredTitle}\nIdentified Context: ${ctx.businessContext}\nDetected Bottlenecks: ${ctx.currentBottlenecks.join("; ")}\nRecommended Stack: ${ctx.suggestedStack.join(", ")}`;
          setTurns((prev) => [
            ...prev,
            { role: "user", text: docMessage },
            {
              role: "ai",
              text: `I have analyzed "${ctx.fileName}". Based on this document, I have ingested the operational bottlenecks and objectives. Let's incorporate this into your Business Analysis and Solution Blueprint!`,
            },
          ]);
          setProblemText(ctx.businessContext);
          toast.success(`Context from ${ctx.fileName} injected into Discovery!`);
        }}
      />
    </AppShell>
  );
}
