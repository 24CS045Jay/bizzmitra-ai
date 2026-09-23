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
  modelUsed?: string;
};

export interface DiscoveryGenerationOptions {
  goals?: string;
  constraints?: string;
  intakeMode?: string;
  intakeMethod?: string;
}

/**
 * Generates dynamic, deeply tailored discovery interview questions and structured business analysis
 * using Groq AI (Llama 3.3 70B / 8B) analyzing the user's workspace intake problem statement, goals, and constraints.
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

  // 1. Try Server-side Groq endpoint first
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
      }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.success && Array.isArray(data.questions) && data.questions.length >= 3) {
        console.log("[AI Discovery] Generated dynamic interview via server Groq LLM");
        return {
          questions: data.questions,
          summary: data.summary,
          businessAnalysis: data.businessAnalysis,
          source: "groq-llm",
          modelUsed: data.modelUsed || "Groq Llama 3.3 70B",
        };
      }
    }
  } catch (apiErr) {
    console.warn("[AI Discovery] Server endpoint unavailable, trying direct Groq API:", apiErr);
  }

  // 2. Client-side Direct Groq API Call (using VITE_GROQ_API_KEY)
  const clientGroqKey =
    typeof import.meta !== "undefined" && import.meta.env
      ? (import.meta.env.VITE_GROQ_API_KEY as string | undefined)
      : undefined;

  if (clientGroqKey && clientGroqKey.trim().length > 10) {
    try {
      const systemPrompt = `You are a Principal Enterprise Systems Architect and Senior McKinsey/Bain Business Transformation Consultant.
Output strictly valid JSON with no markdown backticks, no markdown codeblocks, and no preamble text.`;

      const userPrompt = `Analyze this specific business intake and generate 3 dynamic discovery diagnostic interview questions and a structured business analysis:

BUSINESS CONTEXT:
- Company/Project Name: ${safeBusinessName}
- Industry: ${safeIndustry}
- Problem Statement: ${cleanPrompt}
${goalsText ? `- Stated Goals: ${goalsText}` : ""}
${constraintsText ? `- Stated Constraints: ${constraintsText}` : ""}

REQUIRED TASK:
1. Generate exactly 3 progressive, deeply contextual diagnostic interview questions specific to "${safeBusinessName}" and their problem.
   - Question 1: Operational scale, volume, legacy bottlenecks, or intake drop-offs.
   - Question 2: Daily operational pain points, manual errors, or handoff friction.
   - Question 3: Governance, integrations (WhatsApp, ERP, APIs, payment gateways, regulatory portals), or user access.
2. For each question, provide:
   - "question": Direct, insightful question tailored to this business.
   - "hint": 1-sentence technical consequence (e.g. how it affects database sizing or API throughput).
   - "whyWeAsk": 1-sentence justification for system sizing/architecture.
   - "missingEntity": Short tag (e.g. "Specimen transit protocol", "Payment reconciliation SLA").
   - "options": Exactly 3 realistic, mutually exclusive choices.
   - "answer": The first recommended option string.
3. Provide a concise 2-sentence "summary" synthesizing the transformation scope for ${safeBusinessName}.
4. Provide a structured "businessAnalysis" object:
   - "currentState": { "summary": string, "tools": string[], "bottlenecks": string[], "efficiencyScore": number (25 to 45) }
   - "stakeholders": array of 4 items { "role": string, "count": string, "needs": string, "impact": "Critical" | "High" | "Medium" }
   - "gapAnalysis": array of 4 items { "area": string, "current": string, "future": string, "severity": "Critical" | "High" | "Medium" }
   - "futureState": { "summary": string, "recommendedModules": string[], "automationOpportunities": string[] }
   - "businessImpact": array of 4 items { "metric": string, "current": string, "projected": string, "improvement": string }

STRICT JSON OUTPUT FORMAT:
{
  "questions": [
    {
      "question": "...",
      "hint": "...",
      "whyWeAsk": "...",
      "missingEntity": "...",
      "options": ["...", "...", "..."],
      "answer": "..."
    }
  ],
  "summary": "...",
  "businessAnalysis": { ... }
}`;

      // Call Groq Llama 3.3 70B (with fallback to 8B instant)
      const modelsToTry = ["llama-3.3-70b-versatile", "llama-3.1-8b-instant"];
      for (const model of modelsToTry) {
        try {
          const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${clientGroqKey.trim()}`,
            },
            body: JSON.stringify({
              model,
              messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userPrompt },
              ],
              response_format: { type: "json_object" },
              temperature: 0.3,
            }),
          });

          if (groqRes.ok) {
            const resJson = await groqRes.json();
            const rawContent = resJson.choices?.[0]?.message?.content;
            if (rawContent) {
              const parsed = JSON.parse(rawContent);
              if (parsed && Array.isArray(parsed.questions) && parsed.questions.length >= 3) {
                console.log(`[AI Discovery] Successfully generated dynamic questions via Groq (${model})`);
                return {
                  questions: parsed.questions,
                  summary: parsed.summary || getActiveAiSummary(cleanPrompt, safeBusinessName, safeIndustry),
                  businessAnalysis: parsed.businessAnalysis || getActiveBusinessAnalysis(cleanPrompt, safeBusinessName, safeIndustry),
                  source: "groq-llm",
                  modelUsed: `Groq (${model})`,
                };
              }
            }
          }
        } catch (mErr) {
          console.warn(`[AI Discovery] Groq attempt with ${model} failed:`, mErr);
        }
      }
    } catch (directErr) {
      console.warn("[AI Discovery] Direct Groq call failed:", directErr);
    }
  }

  // 3. Graceful Multi-Domain Engine Fallback
  return {
    questions: getActiveDiscoveryScript(cleanPrompt, safeBusinessName, safeIndustry),
    summary: getActiveAiSummary(cleanPrompt, safeBusinessName, safeIndustry),
    businessAnalysis: getActiveBusinessAnalysis(cleanPrompt, safeBusinessName, safeIndustry),
    source: "local-heuristics",
    modelUsed: "BizzMitra Strategic Engine",
  };
}
