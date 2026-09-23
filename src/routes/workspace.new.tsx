import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AnimatePresence, motion } from "motion/react";
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Cpu,
  FileSpreadsheet,
  FileText,
  Globe,
  Languages,
  Mic,
  MicOff,
  Sparkles,
  Upload,
  Workflow,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";

import { AppShell } from "@/components/AppShell";
import { ArtifactHeader } from "@/components/ArtifactHeader";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/primitives";
import {
  DOCUMENT_PARSE_TEMPLATES,
  EXAMPLE_CHIPS,
  HR_CONSULTANCY_PROBLEM,
  INTAKE_LANGUAGES,
  SupportedLanguage,
  URL_ANALYZER_SAMPLES,
  VOICE_SAMPLE_TRANSCRIPT,
} from "@/lib/demo-data";
import { useAuth, isTestingAccount } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { DocumentIngestionModal } from "@/components/DocumentIngestionModal";
import { resetWorkspaceStages } from "@/lib/workspace-stage-gate";
import { useWorkspaceLimit } from "@/lib/workspace-plan-limit";
import { WorkspaceUpgradeModal } from "@/components/WorkspaceUpgradeModal";

export const Route = createFileRoute("/workspace/new")({
  head: () => ({
    meta: [
      { title: "New Problem Intake — BizzMitra-AI" },
      { name: "description", content: "Multi-modal business intake: enter text, upload documents, analyze URLs or speak." },
      { property: "og:title", content: "New Problem Intake — BizzMitra-AI" },
      { property: "og:description", content: "Start a workspace from plain text, documents, URLs, or voice." },
    ],
  }),
  component: IntakePage,
});

type IntakeTab = "prompt" | "upload" | "url" | "voice" | "legacy";
type OperatingMode = "know" | "consult";

const INDUSTRIES = [
  "HR & Recruitment Services",
  "D2C E-Commerce",
  "Healthcare & MedTech",
  "Fintech & Financial Services",
  "Logistics & Supply Chain",
  "Manufacturing & Industry 4.0",
  "Professional & Legal Services",
  "SaaS & Enterprise Software",
];

function IntakePage() {
  const { user, session } = useAuth();
  const navigate = useNavigate();

  // Workspace Metadata State
  const [lang, setLang] = useState<SupportedLanguage>("en");
  const [mode, setMode] = useState<OperatingMode>("consult");
  const [activeTab, setActiveTab] = useState<IntakeTab>("prompt");
  const [businessName, setBusinessName] = useState("");
  const [industry, setIndustry] = useState("HR & Recruitment Services");
  const [problemStatement, setProblemStatement] = useState("");
  const [goals, setGoals] = useState("");
  const [constraints, setConstraints] = useState("");
  const [busy, setBusy] = useState(false);

  // Workspace Plan Limit State
  const { isBasicPlan, isLimitReached, workspaceCount, refresh: refreshLimit } = useWorkspaceLimit();
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);

  useEffect(() => {
    if (isLimitReached) {
      setIsUpgradeModalOpen(true);
    }
  }, [isLimitReached]);

  // Document Upload Simulator State
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isDocModalOpen, setIsDocModalOpen] = useState(false);
  const [uploadedDoc, setUploadedDoc] = useState<{
    name: string;
    size: string;
    type: string;
    extractedSummary?: string;
  } | null>(null);

  // URL Analyzer Simulator State
  const [urlInput, setUrlInput] = useState("https://talentcraft-staffing.in");
  const [analyzingUrl, setAnalyzingUrl] = useState(false);
  const [urlExtracted, setUrlExtracted] = useState<boolean>(false);

  // Voice Simulator State
  const [recording, setRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);

  // Legacy Systems State
  const [legacyTools, setLegacyTools] = useState("Excel spreadsheets (5 sheets), WhatsApp groups, Google Drive folders");
  const [legacyBottlenecks, setLegacyBottlenecks] = useState("Candidate status lost after round 2, manual daily timesheets, 10-day client contract lag");

  const strings = INTAKE_LANGUAGES[lang];

  // Document Upload Handler (Simulated)
  function handleSimulateUpload(fileName: string, type: "pdf" | "docx" | "pptx") {
    setUploading(true);
    setUploadProgress(15);
    const interval = setInterval(() => {
      setUploadProgress((p) => {
        if (p >= 90) {
          clearInterval(interval);
          const template = DOCUMENT_PARSE_TEMPLATES[type] ?? DOCUMENT_PARSE_TEMPLATES["pdf"]!;
          setUploadedDoc({
            name: fileName,
            size: "2.4 MB",
            type: type.toUpperCase(),
            extractedSummary: template.summary,
          });
          setBusinessName(template.businessName);
          setIndustry(template.industry);
          setProblemStatement(template.summary);
          setUploading(false);
          toast.success(`Parsed ${fileName} (Prototype Document Intelligence Extractor)`);
          return 100;
        }
        return p + 25;
      });
    }, 280);
  }

  // URL Scraping Handler (Simulated)
  function handleAnalyzeUrl() {
    if (!urlInput.trim()) return;
    setAnalyzingUrl(true);
    setTimeout(() => {
      const sampleKey = urlInput.toLowerCase().includes("talentcraft") ? "talentcraft" : "default";
      const data = URL_ANALYZER_SAMPLES[sampleKey] ?? URL_ANALYZER_SAMPLES["default"]!;
      setBusinessName(data.businessName);
      setIndustry(data.industry);
      setProblemStatement(data.summary);
      setGoals(data.goals.join(", "));
      setConstraints(data.constraints.join(", "));
      setUrlExtracted(true);
      setAnalyzingUrl(false);
      toast.success("Extracted business context from URL (Prototype Crawler)");
    }, 1400);
  }

  // Real Web Speech Recognition Engine
  const recognitionRef = useRef<any>(null);
  const recordingTimerRef = useRef<any>(null);

  const BCP47_LANGUAGE_MAP: Record<string, string> = {
    en: "en-US",
    hi: "hi-IN",
    gu: "gu-IN",
    es: "es-ES",
    fr: "fr-FR",
    de: "de-DE",
    ja: "ja-JP",
    ar: "ar-SA",
  };

  const LANGUAGE_NAMES: Record<string, string> = {
    en: "English",
    hi: "Hindi (हिन्दी)",
    gu: "Gujarati (ગુજરાતી)",
    es: "Spanish (Español)",
    fr: "French (Français)",
    de: "German (Deutsch)",
    ja: "Japanese (日本語)",
    ar: "Arabic (العربية)",
  };

  function stopVoiceRecording() {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
      recognitionRef.current = null;
    }
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }
    setRecording(false);
  }

  function startLiveSpeechRecognition() {
    if (typeof window === "undefined") return;

    const SpeechRecognitionClass =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognitionClass) {
      toast.warning(
        "Live Speech Recognition is not supported by your current browser (Chrome, Edge, or Safari recommended). Loaded sample transcript as fallback.",
        { duration: 6000 }
      );
      setProblemStatement(VOICE_SAMPLE_TRANSCRIPT);
      return;
    }

    try {
      const recognition = new SpeechRecognitionClass();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = BCP47_LANGUAGE_MAP[lang] || "en-US";

      let accumulatedFinal = "";

      recognition.onstart = () => {
        setRecording(true);
        setRecordingSeconds(0);
        toast.info(`Microphone active. Speak now in ${LANGUAGE_NAMES[lang]}...`);

        if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
        recordingTimerRef.current = setInterval(() => {
          setRecordingSeconds((sec) => sec + 1);
        }, 1000);
      };

      recognition.onresult = (event: any) => {
        let interim = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcriptChunk = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            accumulatedFinal += transcriptChunk + " ";
          } else {
            interim += transcriptChunk;
          }
        }
        const fullTranscript = (accumulatedFinal + interim).trim();
        if (fullTranscript) {
          setProblemStatement(fullTranscript);
        }
      };

      recognition.onerror = (event: any) => {
        console.warn("[SpeechRecognition] event error:", event.error);
        if (event.error === "not-allowed" || event.error === "permission-denied") {
          toast.error("Microphone access was denied. Please allow microphone permissions in your browser URL bar.");
        } else if (event.error === "no-speech") {
          toast.info("No speech detected. Please speak into your microphone.");
        } else {
          toast.error(`Speech recognition: ${event.error}`);
        }
        stopVoiceRecording();
      };

      recognition.onend = () => {
        stopVoiceRecording();
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.error("[SpeechRecognition] start error:", err);
      toast.error("Could not activate microphone. Loaded sample transcript as fallback.");
      setProblemStatement(VOICE_SAMPLE_TRANSCRIPT);
      stopVoiceRecording();
    }
  }

  function toggleVoiceRecording() {
    if (recording) {
      stopVoiceRecording();
      toast.success("Voice recording saved to problem context!");
    } else {
      startLiveSpeechRecognition();
    }
  }

  // Cleanup microphone on component unmount
  useEffect(() => {
    return () => {
      stopVoiceRecording();
    };
  }, []);

  // Workspace Creation Handler
  async function createWorkspace() {
    if (isLimitReached) {
      toast.error("In the basic plan you can only create one workspace. Please upgrade your plan to create another workspace.");
      setIsUpgradeModalOpen(true);
      return;
    }

    if (!problemStatement.trim()) {
      toast.error("Please provide a business problem or description");
      return;
    }
    setBusy(true);

    const safeBusinessName = businessName.trim() || "Enterprise Modernization Blueprint";
    const contextPayload = {
      name: safeBusinessName,
      businessName: safeBusinessName,
      industry: industry || "Cross-Industry Transformation",
      problemStatement: problemStatement.trim(),
      description: problemStatement.trim(),
      goals: goals.trim(),
      constraints: constraints.trim(),
      intakeMode: mode,
      intakeMethod: activeTab,
      language: lang,
      sourceDetails: {
        document: uploadedDoc ? uploadedDoc.name : null,
        url: urlExtracted ? urlInput : null,
        legacyTools: activeTab === "legacy" ? legacyTools : null,
      },
      createdAt: new Date().toISOString(),
    };

    const isTest = isTestingAccount(user?.email) || user?.id === "demo-admin-id";
    const isValidUuid =
      user?.id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(user.id);

    if (!user) {
      toast.error("Please sign in or create an account to create and persist workspaces.");
      navigate({ to: "/login" });
      setBusy(false);
      return;
    }

    try {
      let createdWorkspaceId: string | null = null;
      const { data: sessionData } = await supabase.auth.getSession();
      const activeToken = sessionData?.session?.access_token || session?.access_token;
      const authBearer = activeToken
        ? `Bearer ${activeToken}`
        : isTest
          ? "Bearer demo-token-bypass"
          : "";

      // 1. Try Server API first (Bypasses client-side RLS quirks and guarantees owner_id = user.id)
      if (authBearer) {
        try {
          const apiRes = await fetch("/api/workspaces", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: authBearer,
            },
            body: JSON.stringify({
              name: safeBusinessName,
              problemStatement: problemStatement.trim(),
              industry,
              goals: goals.trim() || null,
              constraints: constraints.trim() || null,
              intakeMode: mode,
              intakeMethod: activeTab,
              language: lang,
              workspaceContext: contextPayload,
            }),
          });

          if (apiRes.ok) {
            const apiData = await apiRes.json();
            if (apiData.success && apiData.workspace?.id) {
              createdWorkspaceId = apiData.workspace.id;
            }
          } else {
            const errJson = await apiRes.json().catch(() => ({}));
            console.warn("[Server /api/workspaces notice]:", errJson);
          }
        } catch (apiErr) {
          console.warn("[Server /api/workspaces fetch error]:", apiErr);
        }
      }

      // 2. Client Supabase Insert fallback
      if (!createdWorkspaceId && isValidUuid && user) {
        try {
          const { data, error } = await supabase
            .from("workspaces")
            .insert({
              owner_id: user.id,
              name: safeBusinessName,
              problem_statement: problemStatement.trim(),
              industry,
              goals: goals.trim() || null,
              constraints_text: constraints.trim() || null,
              intake_mode: mode,
              intake_method: activeTab,
              language_code: lang,
              workspace_context: contextPayload,
              maturity_score: 54,
              ai_readiness_score: 81,
              status: "active",
            })
            .select("id")
            .single();

          if (!error && data?.id) {
            createdWorkspaceId = data.id;
          }
        } catch (clientErr) {
          console.warn("[Client Supabase Insert fallback error]:", clientErr);
        }
      }

      if (createdWorkspaceId) {
        if (uploadedDoc) {
          try {
            await supabase.from("uploaded_documents").insert({
              workspace_id: createdWorkspaceId,
              file_name: uploadedDoc.name,
              file_type: uploadedDoc.type,
              storage_path: `simulated/${uploadedDoc.name}`,
            });
          } catch {}
        }

        window.localStorage.setItem("bizzmitra.activeWorkspaceId", createdWorkspaceId);
        window.localStorage.setItem("bizzmitra.activeWorkspaceName", safeBusinessName);
        window.localStorage.setItem("bizzmitra.workspaceContext", JSON.stringify(contextPayload));
        window.localStorage.setItem("bizzmitra.language", lang);
        resetWorkspaceStages(createdWorkspaceId);
        window.dispatchEvent(new CustomEvent("bizzmitra:workspace-updated"));
        toast.success("Workspace created successfully!");
        navigate({ to: "/workspace/discovery" });
        return;
      }

      if (isTest) {
        const testWsId = `ws-admin-${Date.now()}`;
        window.localStorage.setItem("bizzmitra.activeWorkspaceId", testWsId);
        window.localStorage.setItem("bizzmitra.activeWorkspaceName", safeBusinessName);
        window.localStorage.setItem("bizzmitra.workspaceContext", JSON.stringify(contextPayload));
        window.localStorage.setItem("bizzmitra.language", lang);
        resetWorkspaceStages(testWsId);
        window.dispatchEvent(new CustomEvent("bizzmitra:workspace-updated"));
        toast.success("Testing workspace created!");
        navigate({ to: "/workspace/discovery" });
        return;
      }

      toast.error("Failed to persist workspace to database. Please check your login session and try again.");
    } catch (err: any) {
      console.error("[createWorkspace error]:", err);
      toast.error(err?.message || "An unexpected error occurred while creating your workspace.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <AppShell>
      <div className="border-b border-border pb-4">
        <div className="flex items-center justify-end mb-2">
          {/* Multilingual Selector */}
          <div className="shrink-0 neu-sm flex items-center gap-1.5 p-1 text-xs">
            <Languages className="ml-1 size-3.5 text-muted-foreground" />
            <button
              type="button"
              onClick={() => setLang("en")}
              className={`rounded-md px-2.5 py-1 font-semibold transition-colors ${
                lang === "en" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              English
            </button>
            <button
              type="button"
              onClick={() => setLang("hi")}
              className={`rounded-md px-2.5 py-1 font-semibold transition-colors ${
                lang === "hi" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              हिन्दी
            </button>
          </div>
        </div>

        <div className="min-w-0 w-full">
          <ArtifactHeader id="intake" kicker={strings.kicker} title={strings.title} />
        </div>
      </div>

      <p className="mt-2 text-sm text-muted-foreground">{strings.subtitle}</p>

      {/* Plan Limit Warning Banner */}
      {isLimitReached && (
        <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-xs">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="size-4 shrink-0 text-amber-500" />
            <div>
              <p className="font-bold text-amber-600 dark:text-amber-400">
                Workspace Limit Reached ({workspaceCount}/1 Workspaces Used)
              </p>
              <p className="text-muted-foreground mt-0.5">
                In the Basic (Free Starter) plan, you can only create 1 workspace. Upgrade your plan to create another workspace.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsUpgradeModalOpen(true)}
            className="neu-press shrink-0 rounded-xl bg-amber-500 px-3.5 py-2 text-xs font-bold text-white shadow-sm hover:brightness-105 transition-all"
          >
            Upgrade Plan
          </button>
        </div>
      )}

      {/* Dual Operating Modes */}
      <Reveal className="mt-6">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          Step 1: Choose Operating Mode
        </p>
        <div className="mt-2.5 grid gap-3 sm:grid-cols-2">
          {/* Mode: I know what to build */}
          <button
            type="button"
            onClick={() => setMode("know")}
            className={`neu-press text-left p-4 transition-all rounded-xl ${
              mode === "know" ? "ring-2 ring-primary neu" : "neu opacity-85 hover:opacity-100"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="neu-sm px-2 py-0.5 text-[10px] font-bold text-primary">
                {strings.modes.know.badge}
              </span>
              <Cpu className="size-4 text-muted-foreground" />
            </div>
            <h3 className="mt-2 font-display text-base font-bold">{strings.modes.know.title}</h3>
            <p className="mt-1 text-xs text-muted-foreground leading-relaxed">{strings.modes.know.desc}</p>
          </button>

          {/* Mode: I need recommendations */}
          <button
            type="button"
            onClick={() => setMode("consult")}
            className={`neu-press text-left p-4 transition-all rounded-xl ${
              mode === "consult" ? "ring-2 ring-primary neu" : "neu opacity-85 hover:opacity-100"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="neu-sm px-2 py-0.5 text-[10px] font-bold text-primary">
                {strings.modes.consult.badge}
              </span>
              <Sparkles className="size-4 text-primary" />
            </div>
            <h3 className="mt-2 font-display text-base font-bold">{strings.modes.consult.title}</h3>
            <p className="mt-1 text-xs text-muted-foreground leading-relaxed">{strings.modes.consult.desc}</p>
          </button>
        </div>
      </Reveal>

      {/* Workspace Basics */}
      <Reveal className="mt-6">
        <div className="neu p-5 sm:p-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Step 2: Workspace Essentials
          </p>
          <div className="mt-3 grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-foreground">{strings.fields.name}</label>
              <input
                type="text"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                placeholder={strings.fields.namePlaceholder}
                className="neu-inset mt-1.5 w-full px-3 py-2.5 text-xs outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-foreground">{strings.fields.industry}</label>
              <select
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                className="neu-inset mt-1.5 w-full px-3 py-2.5 text-xs outline-none bg-background focus:ring-1 focus:ring-primary"
              >
                {INDUSTRIES.map((ind) => (
                  <option key={ind} value={ind}>
                    {ind}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </Reveal>

      {/* Multi-Modal Ingestion Tabs */}
      <Reveal className="mt-6">
        <div className="neu p-5 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Step 3: Provide Business Context
            </p>
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full scrollbar-none sm:flex-wrap">
              <button
                type="button"
                onClick={() => setActiveTab("prompt")}
                className={`neu-sm shrink-0 px-3 py-1.5 text-xs font-semibold flex items-center gap-1.5 ${
                  activeTab === "prompt" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <FileText className="size-3.5" /> {strings.tabs.prompt}
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("upload")}
                className={`neu-sm shrink-0 px-3 py-1.5 text-xs font-semibold flex items-center gap-1.5 ${
                  activeTab === "upload" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Upload className="size-3.5" /> {strings.tabs.upload}
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("url")}
                className={`neu-sm shrink-0 px-3 py-1.5 text-xs font-semibold flex items-center gap-1.5 ${
                  activeTab === "url" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Globe className="size-3.5" /> {strings.tabs.url}
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("voice")}
                className={`neu-sm shrink-0 px-3 py-1.5 text-xs font-semibold flex items-center gap-1.5 ${
                  activeTab === "voice" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Mic className="size-3.5" /> {strings.tabs.voice}
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("legacy")}
                className={`neu-sm shrink-0 px-3 py-1.5 text-xs font-semibold flex items-center gap-1.5 ${
                  activeTab === "legacy" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Workflow className="size-3.5" /> {strings.tabs.legacy}
              </button>
            </div>
          </div>

          <div className="mt-4">
            {/* Tab 1: Plain Prompt */}
            {activeTab === "prompt" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                <div className="neu-inset p-4">
                  <textarea
                    value={problemStatement}
                    onChange={(e) => setProblemStatement(e.target.value)}
                    rows={5}
                    aria-label="Business Problem Description"
                    placeholder={strings.fields.descriptionPlaceholder}
                    className="w-full resize-none bg-transparent text-xs leading-relaxed outline-none"
                  />
                </div>

                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                    {strings.chipsLabel}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {EXAMPLE_CHIPS.map((chip) => (
                      <button
                        type="button"
                        key={chip}
                        onClick={() => {
                          setProblemStatement(chip);
                          if (chip.includes("HR consultancy")) {
                            setBusinessName("TalentCraft HR Consultancy");
                            setIndustry("HR & Recruitment Services");
                          } else if (chip.includes("Support team")) {
                            setBusinessName("Nexa Retail — Support Deflection");
                            setIndustry("D2C E-Commerce");
                          }
                        }}
                        className="neu-sm px-2.5 py-1.5 text-[11px] font-medium text-muted-foreground hover:text-foreground text-left max-w-full break-words whitespace-normal"
                      >
                        {chip}
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Tab 2: Document Upload */}
            {activeTab === "upload" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                <div className="neu-inset flex flex-col items-center justify-center p-5 sm:p-8 text-center border border-dashed border-border rounded-xl">
                  <Upload className="size-8 text-primary/80 animate-bounce" />
                  <p className="mt-3 text-xs font-bold text-foreground">
                    Drag & Drop Business Requirements (PDF, DOCX, PPTX, BRD)
                  </p>
                  <p className="mt-1 text-[11px] text-muted-foreground">
                    Prototype Extractor will parse entities, goals, and constraints into your workspace context.
                  </p>

                  <div className="mt-4 flex flex-wrap gap-2.5 justify-center max-w-full">
                    <button
                      type="button"
                      onClick={() => setIsDocModalOpen(true)}
                      className="rounded-xl bg-primary px-4 py-2.5 text-xs font-bold text-primary-foreground flex items-center justify-center gap-2 shadow-sm glow-primary hover:opacity-90 active:scale-95 text-center max-w-full break-words whitespace-normal"
                    >
                      <Upload className="size-4 shrink-0" /> Upload Real Document (PDF, Word, PPTX, SOP, BRD)
                    </button>
                  </div>

                  <div className="mt-2 flex flex-wrap gap-2 justify-center opacity-80 max-w-full">
                    <button
                      type="button"
                      onClick={() => handleSimulateUpload("TalentCraft_Recruitment_BRD_v2.pdf", "pdf")}
                      className="neu-sm neu-press px-2.5 py-1 text-[11px] font-medium text-muted-foreground hover:text-primary flex items-center gap-1.5"
                    >
                      <FileText className="size-3 shrink-0" /> Sample BRD (.PDF)
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSimulateUpload("Hiring_Operations_SOP.docx", "docx")}
                      className="neu-sm neu-press px-2.5 py-1 text-[11px] font-medium text-muted-foreground hover:text-primary flex items-center gap-1.5"
                    >
                      <FileText className="size-3 shrink-0" /> Sample SOP (.DOCX)
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSimulateUpload("Transformation_Strategy.pptx", "pptx")}
                      className="neu-sm neu-press px-2.5 py-1 text-[11px] font-medium text-muted-foreground hover:text-primary flex items-center gap-1.5"
                    >
                      <FileSpreadsheet className="size-3 shrink-0" /> Sample Deck (.PPTX)
                    </button>
                  </div>

                  {uploading && (
                    <div className="mt-4 w-full max-w-sm">
                      <div className="flex justify-between text-[11px] text-muted-foreground">
                        <span>Extracting business entities...</span>
                        <span>{uploadProgress}%</span>
                      </div>
                      <div className="neu-inset mt-1 h-2 w-full overflow-hidden rounded-full">
                        <div
                          className="h-full bg-primary transition-all duration-300"
                          style={{ width: `${uploadProgress}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {uploadedDoc && (
                  <div className="neu p-4 border border-border/70 rounded-xl bg-card/60">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <CheckCircle2 className="size-4 text-emerald-500 shrink-0" />
                        <div>
                          <p className="text-xs font-bold text-foreground">{uploadedDoc.name}</p>
                          <p className="text-[10px] text-muted-foreground">
                            {uploadedDoc.size} • {uploadedDoc.type} • Processed with Structured Document Extractor
                          </p>
                        </div>
                      </div>
                      <span className="neu-sm px-2 py-0.5 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                        Context Ingested
                      </span>
                    </div>
                    {uploadedDoc.extractedSummary && (
                      <p className="mt-2.5 text-xs text-muted-foreground leading-relaxed neu-inset p-2.5">
                        <strong className="text-foreground">Extracted Summary:</strong> {uploadedDoc.extractedSummary}
                      </p>
                    )}
                  </div>
                )}
              </motion.div>
            )}

            {/* Tab 3: Website URL Analyzer */}
            {activeTab === "url" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                <div className="neu-inset p-4">
                  <label className="block text-xs font-semibold text-foreground">Company Website / App URL</label>
                  <div className="mt-2 flex flex-col sm:flex-row gap-2">
                    <input
                      type="url"
                      value={urlInput}
                      onChange={(e) => setUrlInput(e.target.value)}
                      placeholder="https://your-company.com"
                      className="w-full min-w-0 bg-transparent text-xs outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleAnalyzeUrl}
                      disabled={analyzingUrl}
                      className="neu-sm neu-press px-4 py-2 text-xs font-semibold text-primary shrink-0 self-start sm:self-auto"
                    >
                      {analyzingUrl ? "Crawling & Analyzing..." : "Analyze Website"}
                    </button>
                  </div>
                </div>

                {urlExtracted && (
                  <div className="neu p-4 border border-border/70 rounded-xl">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="size-4 text-emerald-500" />
                      <p className="text-xs font-bold">Domain Analyzed: {urlInput}</p>
                      <span className="neu-sm ml-auto px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                        Simulated Web Extractor
                      </span>
                    </div>
                    <p className="mt-2 text-xs text-muted-foreground">
                      Extracted company profile, customer segments, and manual service bottlenecks into workspace context.
                    </p>
                  </div>
                )}
              </motion.div>
            )}

            {/* Tab 4: Voice Input */}
            {activeTab === "voice" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4 text-center">
                <div className="neu-inset p-6 flex flex-col items-center">
                  <button
                    type="button"
                    onClick={toggleVoiceRecording}
                    className={`grid size-16 place-items-center rounded-full transition-all ${
                      recording
                        ? "bg-red-500 text-white shadow-lg animate-pulse ring-4 ring-red-400/30"
                        : "neu neu-press text-primary hover:scale-105"
                    }`}
                  >
                    {recording ? <MicOff className="size-6" /> : <Mic className="size-6" />}
                  </button>

                  <p className="mt-3 text-xs font-bold text-foreground">
                    {recording
                      ? `Listening live in ${LANGUAGE_NAMES[lang]} (${recordingSeconds}s)... Click to Stop`
                      : "Click to Speak Business Idea"}
                  </p>
                  <p className="mt-1 text-[11px] text-muted-foreground max-w-md">
                    {recording
                      ? "Speak your business bottlenecks and requirements clearly into your microphone."
                      : "Uses live browser Web Speech Recognition to transcribe your voice directly into the business problem statement."}
                  </p>

                  {/* Equalizer animation */}
                  {recording && (
                    <div className="mt-3 flex items-center justify-center gap-1">
                      {[12, 28, 16, 36, 20, 32, 14, 26, 18, 30].map((h, i) => (
                        <div
                          key={i}
                          className="w-1 rounded-full bg-red-500 animate-pulse"
                          style={{
                            height: `${h}px`,
                            animationDuration: `${0.4 + (i % 3) * 0.2}s`,
                            animationDelay: `${i * 80}ms`,
                          }}
                        />
                      ))}
                    </div>
                  )}

                  {/* Fallback Sample button */}
                  {!recording && (
                    <button
                      type="button"
                      onClick={() => {
                        setProblemStatement(VOICE_SAMPLE_TRANSCRIPT);
                        toast.success("Loaded sample voice transcript (TalentCraft HR)");
                      }}
                      className="mt-3 text-[11px] font-semibold text-primary underline hover:text-primary/80 transition-colors"
                    >
                      Or insert sample transcript (TalentCraft HR)
                    </button>
                  )}
                </div>

                {problemStatement && (
                  <div className="neu text-left p-4 rounded-xl border border-border/70 bg-card">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-primary">
                        Live Voice Transcript
                      </span>
                      <button
                        type="button"
                        onClick={() => setProblemStatement("")}
                        className="text-[10px] text-muted-foreground hover:text-destructive underline"
                      >
                        Clear
                      </button>
                    </div>
                    <p className="text-xs text-foreground leading-relaxed whitespace-pre-wrap">
                      {problemStatement}
                    </p>
                  </div>
                )}
              </motion.div>
            )}

            {/* Tab 5: Existing Systems */}
            {activeTab === "legacy" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-foreground">Current Software, Sheets & Tools</label>
                  <input
                    type="text"
                    value={legacyTools}
                    onChange={(e) => setLegacyTools(e.target.value)}
                    placeholder="e.g., 5 Excel spreadsheets, WhatsApp group chats, manual paper timesheets"
                    className="neu-inset mt-1.5 w-full px-3 py-2 text-xs outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-foreground">Operational Bottlenecks & Gaps</label>
                  <textarea
                    value={legacyBottlenecks}
                    onChange={(e) => setLegacyBottlenecks(e.target.value)}
                    rows={3}
                    placeholder="Where are delays happening? How many hours are lost?"
                    className="neu-inset mt-1.5 w-full px-3 py-2 text-xs outline-none resize-none"
                  />
                </div>
              </motion.div>
            )}
          </div>

          {/* Goals & Constraints */}
          <div className="mt-4 grid gap-3 sm:grid-cols-2 pt-3 border-t border-border">
            <div>
              <label className="block text-xs font-semibold text-foreground">{strings.fields.goals}</label>
              <input
                type="text"
                value={goals}
                onChange={(e) => setGoals(e.target.value)}
                placeholder={strings.fields.goalsPlaceholder}
                className="neu-inset mt-1.5 w-full px-3 py-2 text-xs outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-foreground">{strings.fields.constraints}</label>
              <input
                type="text"
                value={constraints}
                onChange={(e) => setConstraints(e.target.value)}
                placeholder={strings.fields.constraintsPlaceholder}
                className="neu-inset mt-1.5 w-full px-3 py-2 text-xs outline-none"
              />
            </div>
          </div>
        </div>
      </Reveal>

      {/* Action Footer */}
      <div className="mt-6 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pb-4">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <AlertCircle className="size-3.5 shrink-0 text-primary" />
          <span>Context will be locked and carried forward across all 11 blueprint modules.</span>
        </div>

        <button
          type="button"
          onClick={isLimitReached ? () => setIsUpgradeModalOpen(true) : createWorkspace}
          disabled={(!problemStatement.trim() && !isLimitReached) || busy}
          className="neu-press rounded-xl bg-primary px-6 py-3.5 text-sm font-bold text-primary-foreground shadow-md transition-all flex items-center justify-center gap-2 w-full sm:w-auto disabled:opacity-50 shrink-0"
        >
          {busy ? (
            <span>{strings.creating}</span>
          ) : isLimitReached ? (
            <>
              <span>Upgrade Plan to Create Workspace</span>
              <ArrowRight className="size-4" />
            </>
          ) : (
            <>
              <span>{strings.cta}</span>
              <ArrowRight className="size-4" />
            </>
          )}
        </button>
      </div>

      <DocumentIngestionModal
        isOpen={isDocModalOpen}
        onClose={() => setIsDocModalOpen(false)}
        onApplyContext={(ctx) => {
          setBusinessName(ctx.inferredTitle);
          setProblemStatement(ctx.businessContext);
          setGoals(ctx.targetObjectives.join("; "));
          setConstraints(ctx.currentBottlenecks.join("; "));
          setUploadedDoc({
            name: ctx.fileName,
            size: ctx.fileSizeFormatted,
            type: ctx.fileType,
            extractedSummary: ctx.businessContext,
          });
        }}
      />

      <WorkspaceUpgradeModal
        isOpen={isUpgradeModalOpen}
        onClose={() => setIsUpgradeModalOpen(false)}
        workspaceCount={workspaceCount || 1}
        onUpgradeSuccess={() => {
          void refreshLimit();
        }}
      />
    </AppShell>
  );
}
