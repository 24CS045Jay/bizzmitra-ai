import { createFileRoute, Link } from "@tanstack/react-router";
import { AnimatePresence, motion } from "motion/react";
import {
  AlertCircle,
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
  Edit3,
  RotateCcw,
  Check,
  RefreshCw,
  X,
  Loader2,
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
import { completeDiscoveryAndUnlockAll, isDiscoveryCompleted, StageNextButton } from "@/lib/workspace-stage-gate";

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

export interface DiscoveryAnswerItem {
  questionId: string;
  question: string;
  hint?: string | undefined;
  whyWeAsk?: string | undefined;
  missingEntity?: string | undefined;
  options: string[];
  answer: string;
}

type Turn = {
  role: "user" | "ai";
  text: string;
  hint?: string | undefined;
  whyWeAsk?: string | undefined;
  missingEntity?: string | undefined;
};

const DEFAULT_DISCOVERY_PROBLEM =
  "Streamline and automate operational workflows, eliminate manual data bottlenecks, and establish transparent operational visibility.";

function DiscoveryPage() {
  const { user } = useAuth();
  const [workspaceId, setWorkspaceId] = useState<string | null>(null);

  const initialContext = (() => {
    if (typeof window === "undefined") {
      return {
        problem: DEFAULT_DISCOVERY_PROBLEM,
        businessName: "Enterprise Workspace",
        industry: "Cross-Industry",
        goals: "",
        constraints: "",
        intakeMode: "consult",
        intakeMethod: "prompt",
        discoveryCompleted: false,
        discoveryAnswers: [] as DiscoveryAnswerItem[],
        discoveryQuestions: [] as DiscoveryQuestionItem[],
        discoverySummary: "",
        businessAnalysis: null as BusinessAnalysisReport | null,
      };
    }
    try {
      const raw = window.localStorage.getItem("bizzmitra.workspaceContext");
      if (raw) {
        const parsed = JSON.parse(raw);
        return {
          problem: parsed.problemStatement || parsed.summary || DEFAULT_DISCOVERY_PROBLEM,
          businessName: parsed.businessName || parsed.name || "Enterprise Workspace",
          industry: parsed.industry || "Cross-Industry",
          goals: parsed.goals || "",
          constraints: parsed.constraints || "",
          intakeMode: parsed.intakeMode || "consult",
          intakeMethod: parsed.intakeMethod || "prompt",
          discoveryCompleted: parsed.discoveryCompleted === true,
          discoveryAnswers: Array.isArray(parsed.discoveryAnswers) ? (parsed.discoveryAnswers as DiscoveryAnswerItem[]) : [],
          discoveryQuestions: Array.isArray(parsed.discoveryQuestions) ? (parsed.discoveryQuestions as DiscoveryQuestionItem[]) : [],
          discoverySummary: parsed.discoverySummary || "",
          businessAnalysis: (parsed.businessAnalysis as BusinessAnalysisReport) || null,
        };
      }
    } catch {}
    return {
      problem: DEFAULT_DISCOVERY_PROBLEM,
      businessName: "Enterprise Workspace",
      industry: "Cross-Industry",
      goals: "",
      constraints: "",
      intakeMode: "consult",
      intakeMethod: "prompt",
      discoveryCompleted: false,
      discoveryAnswers: [] as DiscoveryAnswerItem[],
      discoveryQuestions: [] as DiscoveryQuestionItem[],
      discoverySummary: "",
      businessAnalysis: null as BusinessAnalysisReport | null,
    };
  })();

  const [problemText, setProblemText] = useState<string>(initialContext.problem);
  const [turns, setTurns] = useState<Turn[]>([]);
  const [step, setStep] = useState(0);
  const [thinking, setThinking] = useState(false);
  const [complete, setComplete] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    const wsId = window.localStorage.getItem("bizzmitra.activeWorkspaceId");
    return Boolean(initialContext.discoveryCompleted || isDiscoveryCompleted(wsId ?? undefined));
  });
  const [customInput, setCustomInput] = useState("");
  const [isDocModalOpen, setIsDocModalOpen] = useState(false);

  const [answers, setAnswers] = useState<DiscoveryAnswerItem[]>(initialContext.discoveryAnswers);
  const [isEditingAnswers, setIsEditingAnswers] = useState(false);
  const [editingAnswers, setEditingAnswers] = useState<DiscoveryAnswerItem[]>([]);
  const [isRegeneratingAll, setIsRegeneratingAll] = useState(false);

  const [dynamicScript, setDynamicScript] = useState<DiscoveryQuestionItem[]>(() =>
    initialContext.discoveryQuestions.length > 0
      ? initialContext.discoveryQuestions
      : getActiveDiscoveryScript(initialContext.problem, initialContext.businessName, initialContext.industry)
  );
  const [dynamicSummary, setDynamicSummary] = useState<string>(() =>
    initialContext.discoverySummary
      ? initialContext.discoverySummary
      : getActiveAiSummary(initialContext.problem, initialContext.businessName, initialContext.industry)
  );
  const [dynamicAnalysis, setDynamicAnalysis] = useState<BusinessAnalysisReport>(() =>
    initialContext.businessAnalysis
      ? initialContext.businessAnalysis
      : getActiveBusinessAnalysis(initialContext.problem, initialContext.businessName, initialContext.industry)
  );
  const [aiModelLabel, setAiModelLabel] = useState<string>("BizzMitra NLP Engine");
  const [isAiFallback, setIsAiFallback] = useState<boolean>(false);

  const script = dynamicScript;
  const summaryText = dynamicSummary;
  const analysis = dynamicAnalysis;

  useEffect(() => {
    const id = window.localStorage.getItem("bizzmitra.activeWorkspaceId");
    setWorkspaceId(id);

    // Read full problem context from local storage or Supabase
    let loadedText = "";
    let bName = "Enterprise Workspace";
    let ind = "Cross-Industry";
    let goalsText = "";
    let constraintsText = "";
    let intakeMode = "";
    let intakeMethod = "";
    let documentSummary = "";
    let legacyTools = "";

    try {
      const raw = window.localStorage.getItem("bizzmitra.workspaceContext");
      if (raw) {
        const parsed = JSON.parse(raw);
        loadedText = parsed.problemStatement || parsed.summary || "";
        bName = parsed.businessName || parsed.name || bName;
        ind = parsed.industry || ind;
        goalsText = parsed.goals || "";
        constraintsText = parsed.constraints || "";
        intakeMode = parsed.intakeMode || "";
        intakeMethod = parsed.intakeMethod || "";
        documentSummary = parsed.sourceDetails?.document || "";
        legacyTools = parsed.sourceDetails?.legacyTools || "";
      }
    } catch {}

    if (!loadedText) loadedText = DEFAULT_DISCOVERY_PROBLEM;
    setProblemText(loadedText);

    // Immediate synchronous domain calibration
    const localScript = getActiveDiscoveryScript(loadedText, bName, ind);
    const localSummary = getActiveAiSummary(loadedText, bName, ind);
    const localAnalysis = getActiveBusinessAnalysis(loadedText, bName, ind);
    if (initialContext.discoveryQuestions.length === 0) setDynamicScript(localScript);
    if (!initialContext.discoverySummary) setDynamicSummary(localSummary);
    if (!initialContext.businessAnalysis) setDynamicAnalysis(localAnalysis);

    // Dynamically generate discovery questions & analysis via server LLM (only if not already completed)
    if (!initialContext.discoveryCompleted) {
      void generateDynamicDiscovery(loadedText, bName, ind, {
        goals: goalsText,
        constraints: constraintsText,
        intakeMode,
        intakeMethod,
        documentSummary,
        legacyTools,
      }).then((res) => {
        setDynamicScript(res.questions);
        setDynamicSummary(res.summary);
        setDynamicAnalysis(res.businessAnalysis);
        setAiModelLabel(res.modelUsed || (res.source === "groq-llm" ? "Groq Llama 3.3 70B" : "Google Gemini"));
        setIsAiFallback(res.source === "local-heuristics");

        // If user hasn't answered yet, update the active question to the newly generated AI question
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
    }

    const isUuid = id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

    // If discovery was already completed, restore turns from saved context immediately
    if (initialContext.discoveryCompleted && initialContext.discoveryAnswers.length > 0) {
      const reconstructed: Turn[] = [{ role: "user", text: loadedText }];
      initialContext.discoveryAnswers.forEach((ans) => {
        reconstructed.push({ role: "ai", text: ans.question, hint: ans.hint });
        reconstructed.push({ role: "user", text: ans.answer });
      });
      reconstructed.push({ role: "ai", text: initialContext.discoverySummary || localSummary });
      setTurns(reconstructed);
      setStep(initialContext.discoveryAnswers.length);
      setComplete(true);
      completeDiscoveryAndUnlockAll(id || undefined);
      return;
    }

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

        const isFinished =
          initialContext.discoveryCompleted ||
          isDiscoveryCompleted(id!) ||
          answered >= (localScript.length || 3) ||
          loadedTurns.some(
            (t) =>
              t.role === "ai" &&
              (t.text === localSummary || t.text.includes("Business Discovery Summary") || t.text.length > 180)
          );

        if (isFinished) {
          setComplete(true);
          completeDiscoveryAndUnlockAll(id!);
        }

        // Reconstruct answers from loadedTurns if answers state is empty
        setAnswers((current) => {
          if (current.length > 0) return current;
          const extracted: DiscoveryAnswerItem[] = [];
          for (let i = 1; i < loadedTurns.length - 1; i += 2) {
            const qTurn = loadedTurns[i];
            const aTurn = loadedTurns[i + 1];
            if (qTurn?.role === "ai" && aTurn?.role === "user") {
              const qIdx = Math.floor(i / 2);
              const scriptQ = localScript[qIdx];
              extracted.push({
                questionId: scriptQ?.id || scriptQ?.questionId || `q-${qIdx}`,
                question: qTurn.text,
                hint: scriptQ?.hint,
                whyWeAsk: scriptQ?.whyWeAsk,
                missingEntity: scriptQ?.missingEntity,
                options: scriptQ?.options || [],
                answer: aTurn.text,
              });
            }
          }
          return extracted.length > 0 ? extracted : current;
        });
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
        completeDiscoveryAndUnlockAll(workspaceId || undefined, {
          discoveryCompleted: true,
          discoveryAnswers: answers,
          discoveryQuestions: script,
          discoverySummary: summaryText,
          businessAnalysis: analysis,
          regenerateVersion: Date.now(),
        });
        window.dispatchEvent(
          new CustomEvent("bizzmitra:workspace-updated", {
            detail: {
              workspaceId,
              discoveryCompleted: true,
              discoveryAnswers: answers,
              discoverySummary: summaryText,
              businessAnalysis: analysis,
            },
          })
        );
        toast.success("AI Discovery complete! All workspace blueprints are now unlocked.");
      }
      setThinking(false);
    }, 1200);

    return () => clearTimeout(t);
  }, [thinking, step, workspaceId, script, summaryText, answers, analysis]);

  useEffect(() => {
    if (complete) {
      completeDiscoveryAndUnlockAll(workspaceId || undefined, {
        discoveryCompleted: true,
        discoveryAnswers: answers,
        discoveryQuestions: script,
        discoverySummary: summaryText,
        businessAnalysis: analysis,
      });
    }
  }, [complete]);

  function handleFastTrackComplete() {
    setThinking(true);
    const filledAnswers: DiscoveryAnswerItem[] = [...answers];
    script.forEach((q, idx) => {
      const qId = q.id || q.questionId || `q-${idx}`;
      if (!filledAnswers.some((a) => a.questionId === qId || a.question === q.question)) {
        filledAnswers.push({
          questionId: qId,
          question: q.question,
          hint: q.hint,
          whyWeAsk: q.whyWeAsk,
          missingEntity: q.missingEntity,
          options: q.options,
          answer: q.options[0] || "Standard operational configuration",
        });
      }
    });
    setAnswers(filledAnswers);

    setTimeout(() => {
      setTurns((prev) => [...prev, { role: "ai", text: summaryText }]);
      setComplete(true);
      completeDiscoveryAndUnlockAll(workspaceId || undefined, {
        discoveryCompleted: true,
        discoveryAnswers: filledAnswers,
        discoveryQuestions: script,
        discoverySummary: summaryText,
        businessAnalysis: analysis,
        regenerateVersion: Date.now(),
      });
      window.dispatchEvent(
        new CustomEvent("bizzmitra:workspace-updated", {
          detail: {
            workspaceId,
            discoveryCompleted: true,
            discoveryAnswers: filledAnswers,
            discoverySummary: summaryText,
            businessAnalysis: analysis,
          },
        })
      );
      setThinking(false);
      toast.success("AI Discovery complete! All workspace blueprints are now unlocked.");
    }, 600);
  }

  function submitAnswer(textToSubmit: string) {
    if (!textToSubmit.trim()) return;
    const currentQ = step < script.length ? script[step] : null;

    if (workspaceId && !workspaceId.startsWith("ws-")) {
      void supabase.from("discovery_messages").insert({
        workspace_id: workspaceId,
        role: "user",
        content: textToSubmit,
      });
    }

    setTurns((prev) => [...prev, { role: "user", text: textToSubmit }]);
    setCustomInput("");

    if (currentQ) {
      setAnswers((prev) => {
        const next = [...prev];
        const qId = currentQ.id || currentQ.questionId || `q-${step}`;
        const existingIdx = next.findIndex((a) => a.questionId === qId || a.question === currentQ.question);
        const item: DiscoveryAnswerItem = {
          questionId: qId,
          question: currentQ.question,
          hint: currentQ.hint,
          whyWeAsk: currentQ.whyWeAsk,
          missingEntity: currentQ.missingEntity,
          options: currentQ.options,
          answer: textToSubmit,
        };
        if (existingIdx >= 0) {
          next[existingIdx] = item;
        } else {
          next.push(item);
        }
        return next;
      });
    }

    setStep((s) => s + 1);
    setThinking(true);
  }

  function handleStartEditing() {
    const baseline =
      answers.length > 0
        ? answers
        : script.map((q, idx) => ({
            questionId: q.id || q.questionId || `q-${idx}`,
            question: q.question,
            hint: q.hint,
            whyWeAsk: q.whyWeAsk,
            missingEntity: q.missingEntity,
            options: q.options,
            answer: q.options[0] || "",
          }));
    setEditingAnswers(baseline);
    setIsEditingAnswers(true);
  }

  function handleOptionSelect(qIdx: number, selectedOption: string) {
    setEditingAnswers((prev) => {
      const copy = [...prev];
      if (copy[qIdx]) {
        copy[qIdx] = { ...copy[qIdx], answer: selectedOption };
      }
      return copy;
    });
  }

  function handleCustomAnswerChange(qIdx: number, text: string) {
    setEditingAnswers((prev) => {
      const copy = [...prev];
      if (copy[qIdx]) {
        copy[qIdx] = { ...copy[qIdx], answer: text };
      }
      return copy;
    });
  }

  async function handleSaveAndRegenerate(targetAnswers: DiscoveryAnswerItem[]) {
    setIsRegeneratingAll(true);
    const toastId = toast.loading("Synthesizing updated diagnostic answers and regenerating all blueprints...");

    try {
      const res = await generateDynamicDiscovery(problemText, initialContext.businessName, initialContext.industry, {
        goals: initialContext.goals,
        constraints: initialContext.constraints,
        intakeMode: initialContext.intakeMode,
        intakeMethod: initialContext.intakeMethod,
        diagnosticAnswers: targetAnswers.map((a) => ({ question: a.question, answer: a.answer, ...(a.hint ? { hint: a.hint } : {}) })),
      });

      const newSummary = res.summary || summaryText;
      const newAnalysis = res.businessAnalysis || analysis;

      setDynamicSummary(newSummary);
      setDynamicAnalysis(newAnalysis);
      setAnswers(targetAnswers);

      const rebuiltTurns: Turn[] = [{ role: "user", text: problemText }];
      targetAnswers.forEach((ans) => {
        rebuiltTurns.push({ role: "ai", text: ans.question, hint: ans.hint });
        rebuiltTurns.push({ role: "user", text: ans.answer });
      });
      rebuiltTurns.push({ role: "ai", text: newSummary });
      setTurns(rebuiltTurns);

      if (workspaceId && !workspaceId.startsWith("ws-")) {
        await supabase.from("discovery_messages").delete().eq("workspace_id", workspaceId);
        const rows = rebuiltTurns.map((t) => ({
          workspace_id: workspaceId,
          role: t.role,
          content: t.text,
        }));
        await supabase.from("discovery_messages").insert(rows);
      }

      if (typeof window !== "undefined") {
        Object.keys(window.sessionStorage).forEach((key) => {
          if (key.startsWith("bizzmitra.")) {
            window.sessionStorage.removeItem(key);
          }
        });
      }

      const newVersion = Date.now();
      completeDiscoveryAndUnlockAll(workspaceId || undefined, {
        discoveryCompleted: true,
        discoveryAnswers: targetAnswers,
        discoveryQuestions: script,
        discoverySummary: newSummary,
        businessAnalysis: newAnalysis,
        regenerateVersion: newVersion,
        lastRegeneratedAt: new Date().toISOString(),
      });

      window.dispatchEvent(
        new CustomEvent("bizzmitra:workspace-updated", {
          detail: {
            workspaceId,
            regenerateVersion: newVersion,
            discoveryAnswers: targetAnswers,
            discoverySummary: newSummary,
            businessAnalysis: newAnalysis,
          },
        })
      );

      toast.dismiss(toastId);
      toast.success("Diagnostic answers updated! All downstream blueprints & modules have been regenerated.");
      setIsEditingAnswers(false);
    } catch (err: any) {
      console.error("[handleSaveAndRegenerate error]:", err);
      toast.dismiss(toastId);
      toast.error(err?.message || "Failed to regenerate modules. Please try again.");
    } finally {
      setIsRegeneratingAll(false);
    }
  }

  function handleRetakeDiscovery() {
    if (
      !window.confirm(
        "Are you sure you want to retake the diagnostic Q&A? This will restart the interactive interview from Question 1."
      )
    ) {
      return;
    }
    setStep(0);
    setComplete(false);
    setAnswers([]);
    setIsEditingAnswers(false);
    setTurns([{ role: "user", text: problemText }]);
    setThinking(true);
    if (workspaceId && !workspaceId.startsWith("ws-")) {
      void supabase
        .from("discovery_messages")
        .delete()
        .eq("workspace_id", workspaceId)
        .then(() => {
          void supabase.from("discovery_messages").insert({
            workspace_id: workspaceId,
            role: "user",
            content: problemText,
          });
        });
    }
    toast.info("Restarted diagnostic interview. Choose your answers step-by-step.");
  }

  const currentQuestion = step < script.length ? script[step] : null;
  const progressPercent = Math.min(100, Math.round(((step + (complete ? 1 : 0)) / (script.length + 1)) * 100));
  const confidenceScore = complete ? 96 : Math.min(92, 38 + step * 24);

  return (
    <AppShell>
      <div className="w-full max-w-full min-w-0 overflow-x-hidden space-y-6">
        <ArtifactHeader
          id="discovery"
          kicker="Step 02"
          title="AI Discovery & Business Analysis"
        />

        {/* Fallback Warning Notice if Live LLM Inference is Unavailable */}
        {isAiFallback ? (
          <div className="mb-4 flex items-center gap-2.5 rounded-xl border border-amber-500/30 bg-amber-500/10 px-3.5 py-2.5 text-xs text-amber-700 dark:text-amber-300 w-full max-w-full min-w-0">
            <AlertCircle className="size-4 shrink-0 text-amber-600 dark:text-amber-400" />
            <div className="flex-1 min-w-0 break-words">
              <span className="font-semibold">AI inference unavailable:</span> Showing a dynamic heuristic starter interview based on multi-domain analysis.
            </div>
          </div>
        ) : (
          /* Dynamic Model Status Bar */
          <div className="mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 rounded-xl border border-primary/20 bg-primary/5 p-3 w-full max-w-full min-w-0">
            <div className="flex flex-wrap items-center gap-2 min-w-0 flex-1">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/15 px-2.5 py-0.5 text-[11px] font-semibold text-primary shrink-0">
                <Sparkles className="size-3 animate-pulse text-primary" />
                {aiModelLabel}
              </span>
              <span className="text-[11px] text-muted-foreground break-words min-w-0">
                Adaptive diagnostic interview generated in real-time based on your problem intake
              </span>
            </div>
            <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider shrink-0 self-start sm:self-auto">
              Live Server LLM Inference
            </span>
          </div>
        )}

        {/* Business Document Upload Fast-Track Banner */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 rounded-2xl border border-border/80 bg-card/60 p-3.5 shadow-xs backdrop-blur-md w-full max-w-full min-w-0">
          <div className="flex items-start sm:items-center gap-3 min-w-0 flex-1">
            <div className="grid size-9 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
              <Upload className="size-4.5" />
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="text-xs font-bold text-foreground break-words">Have an existing SOP, BRD, or PDF Specification?</h4>
              <p className="text-[11px] text-muted-foreground break-words">Upload your document to auto-extract context and fast-track discovery analysis.</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsDocModalOpen(true)}
            className="rounded-xl bg-primary px-3.5 py-2 text-xs font-bold text-primary-foreground shadow-xs glow-primary hover:opacity-90 active:scale-95 flex items-center justify-center gap-1.5 shrink-0 w-full sm:w-auto"
          >
            <Upload className="size-3.5" /> Upload SOP / BRD
          </button>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_310px] w-full max-w-full min-w-0">
          {/* Main Conversation Stream */}
          <div className="neu p-3.5 sm:p-6 space-y-6 w-full max-w-full min-w-0 overflow-hidden">
            <div className="space-y-4 w-full max-w-full min-w-0">
              <AnimatePresence initial={false}>
                {turns.map((t, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                    className={t.role === "user" ? "flex justify-end w-full" : "w-full"}
                  >
                    <div
                      className={
                        t.role === "user"
                          ? "max-w-[90%] sm:max-w-[85%] rounded-2xl rounded-br-sm bg-primary px-3.5 py-2.5 sm:px-4 sm:py-3 text-xs sm:text-sm text-primary-foreground shadow-sm break-words"
                          : "max-w-full sm:max-w-[95%] w-full min-w-0"
                      }
                    >
                      {t.role === "ai" ? (
                        <div className="neu-sm px-3.5 py-3 sm:px-4 sm:py-3.5 space-y-2 w-full max-w-full min-w-0 overflow-hidden">
                          <div className="flex items-center gap-2 text-primary font-semibold text-xs">
                            <Sparkles className="size-3.5 shrink-0" />
                            <span>AI Business Consultant</span>
                          </div>
                          <p className="text-xs sm:text-sm leading-relaxed text-foreground break-words">
                            {i === turns.length - 1 ? <Typewriter text={t.text} /> : t.text}
                          </p>

                          {/* Missing Information Detector Callout */}
                          {t.missingEntity && (
                            <div className="neu-inset mt-3 rounded-lg p-2.5 text-xs space-y-1 w-full max-w-full min-w-0 overflow-hidden">
                              <p className="font-semibold text-primary flex items-center gap-1.5 break-words">
                                <Search className="size-3 shrink-0 text-primary" />
                                <span>Missing Information: {t.missingEntity}</span>
                              </p>
                              {t.whyWeAsk && (
                                <p className="text-[11px] text-muted-foreground leading-normal break-words">
                                  <strong className="text-foreground">Why we ask:</strong> {t.whyWeAsk}
                                </p>
                              )}
                            </div>
                          )}

                          {t.hint && (
                            <p className="flex items-start gap-1.5 text-[11px] text-muted-foreground pt-1 break-words">
                              <Lightbulb className="mt-0.5 size-3 shrink-0 text-clay" />
                              <span className="break-words min-w-0">{t.hint}</span>
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
                <div className="neu-sm w-fit max-w-full px-4 py-3">
                  <ThinkingDots label="AI Consultant is analyzing business context..." />
                </div>
              )}
            </div>

            {/* User Response Controls */}
            <div className="border-t border-border pt-4 w-full max-w-full min-w-0">
              {complete ? (
                <div className="space-y-4 w-full max-w-full min-w-0">
                  <div className="neu-inset p-3.5 sm:p-4 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 w-full max-w-full min-w-0">
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                        <CheckCircle2 className="size-4 shrink-0" /> Discovery Completed & Context Verified
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5 break-words">
                        Business Analysis synthesized below. Ready to generate solution recommendations.
                      </p>
                    </div>
                    <Link
                      to="/workspace/solution"
                      className="neu-press inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 sm:px-5 sm:py-3 text-xs sm:text-sm font-semibold text-primary-foreground shadow-md w-full sm:w-auto text-center shrink-0"
                    >
                      <span>View Solution Recommendations</span> <ArrowRight className="size-4 shrink-0" />
                    </Link>
                  </div>
                </div>
              ) : currentQuestion && !thinking ? (
                <div className="space-y-3 w-full max-w-full min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 w-full">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                      Select a response or type a custom answer:
                    </p>
                    <button
                      type="button"
                      onClick={handleFastTrackComplete}
                      className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-primary/30 bg-primary/10 px-2.5 py-1 text-[11px] font-bold text-primary hover:bg-primary/20 transition-colors shadow-xs w-full sm:w-auto self-start sm:self-auto"
                      title="Skip remaining questions and synthesize full business analysis now"
                    >
                      <Sparkles className="size-3 shrink-0" />
                      <span>Synthesize & Unlock Solution Studio</span>
                    </button>
                  </div>

                  {/* Quick Contextual Response Options */}
                  <div className="grid gap-2 w-full max-w-full min-w-0">
                    {currentQuestion.options.map((opt, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => submitAnswer(opt)}
                        className="neu-sm neu-press p-3 text-left text-xs hover:border-primary/50 transition-all flex items-start justify-between gap-2 group w-full min-w-0"
                      >
                        <span className="leading-relaxed text-foreground break-words min-w-0 flex-1">{opt}</span>
                        <ArrowRight className="size-3.5 text-muted-foreground group-hover:text-primary shrink-0 mt-0.5 transition-colors" />
                      </button>
                    ))}
                  </div>

                  {/* Custom Input Bar */}
                  <div className="flex gap-2 pt-1 w-full max-w-full min-w-0">
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
                      className="neu-inset flex-1 min-w-0 px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-primary rounded-lg"
                    />
                    <button
                      type="button"
                      disabled={!customInput.trim()}
                      onClick={() => submitAnswer(customInput.trim())}
                      className="neu-sm neu-press px-3.5 sm:px-4 py-2 text-xs font-semibold text-primary flex items-center justify-center gap-1.5 disabled:opacity-40 shrink-0"
                    >
                      <Send className="size-3" /> Send
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
          </div>

        {/* Right Context & Missing Info Sidebar */}
        <aside className="space-y-4 w-full max-w-full min-w-0">
          <div className="neu p-4 sm:p-5 w-full max-w-full min-w-0 overflow-hidden">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                Context Maturity
              </p>
              <span className="text-xs font-bold text-primary">{confidenceScore}%</span>
            </div>

            <div className="neu-inset mt-2 h-2 overflow-hidden rounded-full p-0 w-full">
              <motion.div
                className="h-full rounded-full bg-primary"
                animate={{ width: `${progressPercent}%` }}
                transition={{ type: "spring", stiffness: 180, damping: 26 }}
              />
            </div>

            <div className="mt-4 space-y-2.5 text-xs w-full min-w-0">
              <div className="flex items-center gap-2 min-w-0">
                <CheckCircle2 className="size-3.5 text-emerald-500 shrink-0" />
                <span className="font-medium text-foreground truncate">Problem Context Captured</span>
              </div>
              <div className="flex items-center gap-2 min-w-0">
                {step > 0 ? (
                  <CheckCircle2 className="size-3.5 text-emerald-500 shrink-0" />
                ) : (
                  <HelpCircle className="size-3.5 text-muted-foreground shrink-0" />
                )}
                <span className={`truncate ${step > 0 ? "font-medium text-foreground" : "text-muted-foreground"}`}>
                  {step > 0 ? "Volume & Client Scale ✓" : "Volume & Scale Detection…"}
                </span>
              </div>
              <div className="flex items-center gap-2 min-w-0">
                {step > 1 ? (
                  <CheckCircle2 className="size-3.5 text-emerald-500 shrink-0" />
                ) : (
                  <HelpCircle className="size-3.5 text-muted-foreground shrink-0" />
                )}
                <span className={`truncate ${step > 1 ? "font-medium text-foreground" : "text-muted-foreground"}`}>
                  {step > 1 ? "Vetting Lifecycle & Gaps ✓" : "Lifecycle Stages…"}
                </span>
              </div>
              <div className="flex items-center gap-2 min-w-0">
                {step > 2 ? (
                  <CheckCircle2 className="size-3.5 text-emerald-500 shrink-0" />
                ) : (
                  <HelpCircle className="size-3.5 text-muted-foreground shrink-0" />
                )}
                <span className={`truncate ${step > 2 ? "font-medium text-foreground" : "text-muted-foreground"}`}>
                  {step > 2 ? "Attendance & Portal Rules ✓" : "Compliance & Operations…"}
                </span>
              </div>
            </div>
          </div>

          {/* Active Context Card */}
          <div className="neu p-4 sm:p-5 space-y-3 w-full max-w-full min-w-0 overflow-hidden">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Extracted Persona Model
            </p>
            <div className="space-y-2 text-xs w-full min-w-0">
              <div className="neu-inset p-2.5 rounded-lg space-y-1 w-full min-w-0 overflow-hidden">
                <p className="font-bold text-foreground">Target Stakeholders</p>
                <p className="text-[11px] text-muted-foreground break-words">
                  {analysis.stakeholders.slice(0, 3).map((s) => `${s.role} (${s.count})`).join(", ")}
                </p>
              </div>
              <div className="neu-inset p-2.5 rounded-lg space-y-1 w-full min-w-0 overflow-hidden">
                <p className="font-bold text-foreground">Identified Friction</p>
                <p className="text-[11px] text-muted-foreground break-words">
                  {analysis.currentState.bottlenecks.slice(0, 3).join("; ")}
                </p>
              </div>
            </div>
          </div>
        </aside>
      </div>

      {/* Business Analysis & Strategic Diagnostic Inputs Section */}
      {complete && (
        <motion.section
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mt-8 space-y-6 w-full max-w-full min-w-0"
        >
          {/* Strategic Answers & Module Regeneration Control Card */}
          <div className="neu p-4 sm:p-6 space-y-5 border-l-4 border-l-primary w-full max-w-full min-w-0 overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/80 pb-4 w-full min-w-0">
              <div className="space-y-1 min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="size-3 shrink-0" />
                    Discovery Calibrated & Blueprints Active
                  </span>
                  <span className="text-[11px] text-muted-foreground font-medium">
                    • All platform modules unlocked
                  </span>
                </div>
                <h3 className="font-display text-lg font-bold text-foreground flex items-center gap-2">
                  <span>Diagnostic Answers & Strategic Inputs</span>
                </h3>
                <p className="text-xs text-muted-foreground break-words">
                  The operational inputs and scale decisions below drive your Solution Studio, System Architecture, Process Map, Database Schema, and Execution Roadmap.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto shrink-0">
                {!isEditingAnswers ? (
                  <>
                    <button
                      type="button"
                      onClick={handleStartEditing}
                      className="neu-sm neu-press px-3.5 py-2 text-xs font-semibold text-primary flex items-center justify-center gap-1.5 hover:border-primary/40 transition-all flex-1 sm:flex-none"
                    >
                      <Edit3 className="size-3.5 shrink-0" />
                      <span>Edit Answers</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleRetakeDiscovery}
                      className="neu-sm neu-press px-3 py-2 text-xs font-medium text-muted-foreground hover:text-foreground flex items-center justify-center gap-1.5 transition-all flex-1 sm:flex-none"
                      title="Restart interactive chat from Question 1"
                    >
                      <RotateCcw className="size-3.5 shrink-0" />
                      <span>Retake Q&A</span>
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      disabled={isRegeneratingAll}
                      onClick={() => setIsEditingAnswers(false)}
                      className="neu-sm neu-press px-3.5 py-2 text-xs font-medium text-muted-foreground hover:text-foreground flex items-center justify-center gap-1.5 transition-all flex-1 sm:flex-none"
                    >
                      <X className="size-3.5 shrink-0" />
                      <span>Cancel</span>
                    </button>
                    <button
                      type="button"
                      disabled={isRegeneratingAll}
                      onClick={() => handleSaveAndRegenerate(editingAnswers)}
                      className="neu-sm neu-press px-4 py-2 text-xs font-bold bg-primary text-primary-foreground flex items-center justify-center gap-2 shadow-md shadow-primary/25 disabled:opacity-50 transition-all flex-1 sm:flex-none"
                    >
                      {isRegeneratingAll ? (
                        <>
                          <Loader2 className="size-3.5 animate-spin shrink-0" />
                          <span>Regenerating...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="size-3.5 shrink-0" />
                          <span>Save & Regenerate</span>
                        </>
                      )}
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* View Mode: Answer Summary Grid */}
            {!isEditingAnswers ? (
              <div className="grid gap-3.5 grid-cols-1 md:grid-cols-3 w-full max-w-full min-w-0">
                {(answers.length > 0
                  ? answers
                  : script.map((q, idx) => ({
                      questionId: q.id || q.questionId || `q-${idx}`,
                      question: q.question,
                      hint: q.hint,
                      whyWeAsk: q.whyWeAsk,
                      options: q.options,
                      answer: q.options[0] || "Standard operational configuration",
                    }))
                ).map((item, idx) => (
                  <div
                    key={idx}
                    className="neu-inset p-3.5 sm:p-4 rounded-xl flex flex-col justify-between space-y-3 relative group hover:border-primary/40 transition-all w-full max-w-full min-w-0 overflow-hidden"
                  >
                    <div className="space-y-1.5 w-full min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                          Question 0{idx + 1}
                        </span>
                        <button
                          type="button"
                          onClick={handleStartEditing}
                          className="text-[11px] font-semibold text-primary hover:underline flex items-center gap-1 opacity-80 group-hover:opacity-100 shrink-0"
                        >
                          <Edit3 className="size-2.5" /> Change
                        </button>
                      </div>
                      <p className="text-xs font-semibold text-foreground leading-snug break-words">
                        {item.question}
                      </p>
                    </div>

                    <div className="space-y-1.5 pt-1 border-t border-border/50 w-full min-w-0">
                      <div className="rounded-lg bg-primary/10 border border-primary/20 px-3 py-2 text-xs font-bold text-primary flex items-start gap-1.5 break-words min-w-0">
                        <Check className="size-3.5 shrink-0 text-emerald-500 mt-0.5" />
                        <span className="leading-snug break-words flex-1 min-w-0">{item.answer}</span>
                      </div>
                      {item.hint && (
                        <p className="text-[10px] text-muted-foreground leading-relaxed flex items-center gap-1 min-w-0">
                          <Lightbulb className="size-2.5 text-amber-500 shrink-0" />
                          <span className="truncate">{item.hint}</span>
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              /* Edit Mode: Interactive Question Editor */
              <div className="space-y-4 pt-1 w-full max-w-full min-w-0">
                <div className="rounded-xl border border-primary/30 bg-primary/5 p-3.5 text-xs text-foreground flex items-center justify-between gap-3 w-full max-w-full min-w-0">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <Sparkles className="size-4 text-primary shrink-0" />
                    <span className="break-words">
                      Modify your answers below. Clicking <strong>Save & Regenerate All Modules</strong> will synthesize your choices with AI, update the business gap analysis, and re-engineer all downstream solution, architecture, process, and data blueprints.
                    </span>
                  </div>
                </div>

                <div className="grid gap-4 w-full max-w-full min-w-0">
                  {editingAnswers.map((item, qIdx) => (
                    <div
                      key={item.questionId || qIdx}
                      className="neu p-3.5 sm:p-4 rounded-xl space-y-3 border border-border w-full max-w-full min-w-0 overflow-hidden"
                    >
                      <div className="flex items-start justify-between gap-3 w-full min-w-0">
                        <div className="space-y-0.5 min-w-0 flex-1">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-primary">
                            Strategic Factor 0{qIdx + 1}
                          </span>
                          <h4 className="text-xs font-bold text-foreground break-words">
                            {item.question}
                          </h4>
                          {item.hint && (
                            <p className="text-[11px] text-muted-foreground flex items-center gap-1.5 min-w-0">
                              <Lightbulb className="size-3 text-clay shrink-0" />
                              <span className="break-words min-w-0 flex-1">{item.hint}</span>
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Selectable Options */}
                      <div className="grid gap-2 grid-cols-1 sm:grid-cols-3 w-full max-w-full min-w-0">
                        {(item.options && item.options.length > 0
                          ? item.options
                          : script[qIdx]?.options || []
                        ).map((opt, optIdx) => {
                          const isSelected = item.answer === opt;
                          return (
                            <button
                              key={optIdx}
                              type="button"
                              onClick={() => handleOptionSelect(qIdx, opt)}
                              className={`neu-sm p-3 text-left text-xs transition-all flex items-start justify-between gap-2 rounded-xl w-full min-w-0 break-words ${
                                isSelected
                                  ? "border-primary bg-primary/10 text-primary font-bold shadow-inner ring-1 ring-primary/40"
                                  : "hover:border-primary/40 text-foreground"
                              }`}
                            >
                              <span className="leading-snug break-words flex-1 min-w-0">{opt}</span>
                              {isSelected && (
                                <Check className="size-3.5 text-primary shrink-0 mt-0.5" />
                              )}
                            </button>
                          );
                        })}
                      </div>

                      {/* Custom Answer Input */}
                      <div className="pt-1 w-full min-w-0">
                        <input
                          type="text"
                          value={item.answer}
                          onChange={(e) => handleCustomAnswerChange(qIdx, e.target.value)}
                          placeholder="Or type a specific operational answer..."
                          className="neu-inset w-full min-w-0 px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-primary rounded-lg"
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2.5 pt-2 w-full">
                  <button
                    type="button"
                    disabled={isRegeneratingAll}
                    onClick={() => setIsEditingAnswers(false)}
                    className="neu-sm neu-press px-4 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground text-center"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={isRegeneratingAll}
                    onClick={() => handleSaveAndRegenerate(editingAnswers)}
                    className="neu-sm neu-press px-5 py-2.5 text-xs font-bold bg-primary text-primary-foreground flex items-center justify-center gap-2 shadow-lg shadow-primary/25 disabled:opacity-50"
                  >
                    {isRegeneratingAll ? (
                      <>
                        <Loader2 className="size-3.5 animate-spin" />
                        <span>Regenerating All Modules with AI...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="size-3.5" />
                        <span>Save & Regenerate All Modules</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-3 w-full max-w-full min-w-0">
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-primary">
                Futurrizon Business Analysis Engine
              </p>
              <h2 className="font-display text-xl sm:text-2xl font-bold mt-1 break-words">
                Business Discovery & Gap Analysis Report
              </h2>
            </div>
            <span className="neu-sm px-3 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 self-start sm:self-auto shrink-0">
              <CheckCircle2 className="size-3.5" /> Validated by AI Consultant
            </span>
          </div>

          {/* Current State vs Future State Grid */}
          <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2 w-full max-w-full min-w-0">
            {/* Current State */}
            <div className="neu p-4 sm:p-6 space-y-3 w-full max-w-full min-w-0 overflow-hidden">
              <div className="flex items-center justify-between gap-2">
                <h3 className="font-display text-base font-bold flex items-center gap-2">
                  <AlertTriangle className="size-4 text-amber-500 shrink-0" />
                  <span>Current State (As-Is)</span>
                </h3>
                <span className="neu-sm px-2 py-0.5 text-[10px] font-semibold text-muted-foreground shrink-0">
                  Efficiency: {analysis.currentState.efficiencyScore}%
                </span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed break-words">
                {analysis.currentState.summary}
              </p>
              <div className="neu-inset p-3 rounded-lg space-y-1.5 w-full min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Active Tools
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {analysis.currentState.tools.map((t, idx) => (
                    <span key={idx} className="neu-sm px-2 py-0.5 text-[10px] font-medium break-words">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
              <div className="space-y-1 pt-1 w-full min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Primary Bottlenecks
                </p>
                <ul className="space-y-1 text-xs text-muted-foreground">
                  {analysis.currentState.bottlenecks.map((b, idx) => (
                    <li key={idx} className="flex items-start gap-1.5 break-words">
                      <span className="text-amber-500 font-bold shrink-0">•</span>
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Future State */}
            <div className="neu p-4 sm:p-6 space-y-3 w-full max-w-full min-w-0 overflow-hidden">
              <div className="flex items-center justify-between gap-2">
                <h3 className="font-display text-base font-bold flex items-center gap-2 text-primary">
                  <Sparkles className="size-4 shrink-0" />
                  <span>Future State (To-Be)</span>
                </h3>
                <span className="neu-sm px-2 py-0.5 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 shrink-0">
                  Target: 95% Automated
                </span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed break-words">
                {analysis.futureState.summary}
              </p>
              <div className="neu-inset p-3 rounded-lg space-y-1.5 w-full min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Recommended Architecture Modules
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {analysis.futureState.recommendedModules.map((m, idx) => (
                    <span key={idx} className="neu-sm px-2 py-0.5 text-[10px] font-semibold text-primary break-words">
                      {m}
                    </span>
                  ))}
                </div>
              </div>
              <div className="space-y-1 pt-1 w-full min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Automation Initiatives
                </p>
                <ul className="space-y-1 text-xs text-muted-foreground">
                  {analysis.futureState.automationOpportunities.map((o, idx) => (
                    <li key={idx} className="flex items-start gap-1.5 break-words">
                      <span className="text-primary font-bold shrink-0">✓</span>
                      <span>{o}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Stakeholder Analysis Table */}
          <div className="neu p-4 sm:p-6 space-y-3 w-full max-w-full min-w-0 overflow-hidden">
            <h3 className="font-display text-base font-bold flex items-center gap-2">
              <Users className="size-4 text-primary shrink-0" />
              <span>Stakeholder Analysis & Personas</span>
            </h3>
            <div className="w-full max-w-full min-w-0 overflow-x-auto rounded-xl -mx-1 px-1 sm:mx-0 sm:px-0">
              <table className="w-full min-w-[520px] text-left text-xs">
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
                      <td className="py-2.5 font-bold text-foreground break-words">{s.role}</td>
                      <td className="py-2.5 text-muted-foreground">{s.count}</td>
                      <td className="py-2.5 text-foreground leading-relaxed break-words">{s.needs}</td>
                      <td className="py-2.5 text-muted-foreground break-words">{s.impact}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Gap Analysis Matrix */}
          <div className="neu p-4 sm:p-6 space-y-3 w-full max-w-full min-w-0 overflow-hidden">
            <h3 className="font-display text-base font-bold">Gap Analysis Matrix</h3>
            <div className="w-full max-w-full min-w-0 overflow-x-auto rounded-xl -mx-1 px-1 sm:mx-0 sm:px-0">
              <table className="w-full min-w-[540px] text-left text-xs">
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
                      <td className="py-2.5 font-bold text-foreground break-words">{g.area}</td>
                      <td className="py-2.5 text-muted-foreground leading-relaxed break-words">{g.current}</td>
                      <td className="py-2.5 text-foreground leading-relaxed break-words">{g.future}</td>
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
          <div className="neu p-4 sm:p-6 space-y-3 w-full max-w-full min-w-0 overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
              <h3 className="font-display text-base font-bold flex items-center gap-2">
                <TrendingUp className="size-4 text-emerald-500 shrink-0" />
                <span>Quantified Transformation Impact</span>
              </h3>
              <span className="text-[11px] text-muted-foreground font-medium">
                Baseline vs. Post-Implementation Projection
              </span>
            </div>
            <div className="grid gap-2.5 sm:gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 pt-2 w-full max-w-full min-w-0">
              {analysis.businessImpact.map((item, idx) => (
                <div key={idx} className="neu-inset p-3 rounded-xl text-center space-y-1 w-full min-w-0 overflow-hidden">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider truncate">
                    {item.metric}
                  </p>
                  <p className="font-display text-base sm:text-lg font-extrabold text-foreground truncate">
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
      </div>

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
