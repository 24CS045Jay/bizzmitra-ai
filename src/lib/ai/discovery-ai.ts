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
  source: "groq-llm" | "local-heuristics";
};

/**
 * Calls server Groq API to dynamically generate 3 domain-tailored discovery questions,
 * options, why-we-ask explanations, and full business analysis report for ANY business problem.
 */
export async function generateDynamicDiscovery(
  problemStatement: string,
  businessName?: string,
  industry?: string,
): Promise<DiscoveryInterviewPayload> {
  const cleanPrompt = (problemStatement || "").trim();

  // Try Server-side Groq LLM endpoint first
  try {
    const res = await fetch("/api/ai/discovery-interview", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        problemStatement: cleanPrompt,
        businessName: businessName || "Enterprise Workspace",
        industry: industry || "Cross-Industry Transformation",
      }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.success && data.questions && data.questions.length >= 3) {
        console.log("[AI Discovery] Generated dynamic interview via Groq LLM (120B)");
        return {
          questions: data.questions,
          summary: data.summary,
          businessAnalysis: data.businessAnalysis,
          source: "groq-llm",
        };
      }
    }
  } catch (apiErr) {
    console.warn("[AI Discovery] Server LLM fetch warning:", apiErr);
  }

  // Graceful Multi-Domain Engine Fallback
  return {
    questions: getActiveDiscoveryScript(cleanPrompt, businessName, industry),
    summary: getActiveAiSummary(cleanPrompt, businessName, industry),
    businessAnalysis: getActiveBusinessAnalysis(cleanPrompt, businessName, industry),
    source: "local-heuristics",
  };
}

