import type { BusinessAnalysisReport, DiscoveryQuestionItem } from "@/lib/demo-data";
import {
  HEALTHCARE_BUSINESS_ANALYSIS,
  HEALTHCARE_DISCOVERY_SCRIPT,
  HEALTHCARE_AI_SUMMARY,
  HR_BUSINESS_ANALYSIS,
  HR_DISCOVERY_SCRIPT,
  HR_AI_SUMMARY,
  NEXA_BUSINESS_ANALYSIS,
  DISCOVERY_SCRIPT,
  AI_SUMMARY,
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

  // Graceful Local Domain Heuristic Fallback
  const lower = cleanPrompt.toLowerCase();
  if (
    lower.includes("pathology") ||
    lower.includes("clinic") ||
    lower.includes("health") ||
    lower.includes("lims") ||
    lower.includes("diagnostic") ||
    lower.includes("patient") ||
    lower.includes("biopsy") ||
    lower.includes("apexcare") ||
    lower.includes("hospital")
  ) {
    return {
      questions: HEALTHCARE_DISCOVERY_SCRIPT,
      summary: HEALTHCARE_AI_SUMMARY,
      businessAnalysis: HEALTHCARE_BUSINESS_ANALYSIS,
      source: "local-heuristics",
    };
  }

  if (lower.includes("support") || lower.includes("ticket") || lower.includes("shopify")) {
    return {
      questions: DISCOVERY_SCRIPT,
      summary: AI_SUMMARY,
      businessAnalysis: NEXA_BUSINESS_ANALYSIS,
      source: "local-heuristics",
    };
  }

  return {
    questions: HR_DISCOVERY_SCRIPT,
    summary: HR_AI_SUMMARY,
    businessAnalysis: HR_BUSINESS_ANALYSIS,
    source: "local-heuristics",
  };
}
