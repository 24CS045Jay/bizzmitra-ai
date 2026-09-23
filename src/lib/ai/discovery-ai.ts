import type { BusinessAnalysisReport, DiscoveryQuestionItem } from "@/lib/demo-data";
import {
  getActiveDiscoveryScript,
  getActiveAiSummary,
  getActiveBusinessAnalysis,
} from "@/lib/demo-data";

export type DiscoveryInterviewPayload = {
  questions: DiscoveryQuestionItem[];
  summary: string;
  businessAnalysis: BusinessAnalysisReport;
  source: "gemini-llm" | "groq-llm" | "local-heuristics";
  modelUsed?: string;
};

export interface DiscoveryGenerationOptions {
  goals?: string;
  constraints?: string;
  intakeMode?: string;
  intakeMethod?: string;
  documentSummary?: string;
  legacyTools?: string;
  diagnosticAnswers?: Array<{ question: string; answer: string; hint?: string }>;
}

/**
 * Generates dynamic, deeply tailored discovery interview questions and structured business analysis
 * via the backend server AI endpoint (/api/ai/discovery-interview) based on the user's workspace intake.
 */
export async function generateDynamicDiscovery(
  problemStatement: string,
  businessName?: string,
  industry?: string,
  options?: DiscoveryGenerationOptions,
): Promise<DiscoveryInterviewPayload> {
  const cleanPrompt = (problemStatement || "").trim();
  const safeBusinessName = (businessName || "Enterprise Workspace").trim();
  const safeIndustry = (industry || "Cross-Industry Transformation").trim();
  const goalsText = (options?.goals || "").trim();
  const constraintsText = (options?.constraints || "").trim();
  const intakeMode = options?.intakeMode || "";
  const intakeMethod = options?.intakeMethod || "";
  const documentSummary = options?.documentSummary || "";
  const legacyTools = options?.legacyTools || "";
  const diagnosticAnswers = options?.diagnosticAnswers || [];

  // 1. Centralized Server AI Router (Groq Llama 3.3 70B primary, Google Gemini fallback)
  try {
    const res = await fetch("/api/ai/discovery-interview", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        problemStatement: cleanPrompt,
        businessName: safeBusinessName,
        industry: safeIndustry,
        goals: goalsText,
        constraints: constraintsText,
        intakeMode,
        intakeMethod,
        documentSummary,
        legacyTools,
        diagnosticAnswers,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.success && Array.isArray(data.questions) && data.questions.length >= 3) {
        console.log(`[AI Discovery] Generated dynamic interview via server AI (${data.modelUsed || data.source})`);
        return {
          questions: data.questions,
          summary: data.summary || getActiveAiSummary(cleanPrompt, safeBusinessName, safeIndustry),
          businessAnalysis: data.businessAnalysis || getActiveBusinessAnalysis(cleanPrompt, safeBusinessName, safeIndustry),
          source: data.source || "groq-llm",
          modelUsed: data.modelUsed || "Groq Llama 3.3 70B",
        };
      } else {
        console.warn("[AI Discovery] Server returned unexpected payload structure:", data);
      }
    } else {
      const errBody = await res.json().catch(() => ({}));
      console.warn(`[AI Discovery] Server endpoint error HTTP ${res.status}:`, errBody);
    }
  } catch (apiErr) {
    console.warn("[AI Discovery] Server endpoint fetch error:", apiErr);
  }

  // 2. Graceful Multi-Domain Engine Fallback if server inference is unreachable
  return {
    questions: getActiveDiscoveryScript(cleanPrompt, safeBusinessName, safeIndustry),
    summary: getActiveAiSummary(cleanPrompt, safeBusinessName, safeIndustry),
    businessAnalysis: getActiveBusinessAnalysis(cleanPrompt, safeBusinessName, safeIndustry),
    source: "local-heuristics",
    modelUsed: "BizzMitra Strategic Engine (Heuristic Starter)",
  };
}
