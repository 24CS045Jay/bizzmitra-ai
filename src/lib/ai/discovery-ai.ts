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
}

/**
 * Generates dynamic, deeply tailored discovery interview questions and structured business analysis
 * using Google Gemini AI or Groq AI based on the user's workspace intake problem statement, goals, and constraints.
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

  const systemPrompt = `You are a Principal Enterprise Systems Architect and Senior McKinsey/Bain Business Transformation Consultant for BizzMitra AI.
Output strictly valid JSON with no markdown backticks, no markdown code blocks, and no extra preamble text.`;

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

  // 1. Try Google Gemini API First (High Intelligence / Multilingual)
  const clientGeminiKey =
    typeof import.meta !== "undefined" && import.meta.env
      ? (import.meta.env.VITE_GEMINI_API_KEY as string | undefined)
      : undefined;

  if (clientGeminiKey && clientGeminiKey.trim().length > 5) {
    const geminiModels = ["gemini-2.0-flash", "gemini-1.5-flash", "gemini-2.5-flash"];
    for (const model of geminiModels) {
      try {
        const geminiRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${clientGeminiKey.trim()}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [
                {
                  parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }],
                },
              ],
              generationConfig: {
                responseMimeType: "application/json",
                temperature: 0.2,
              },
            }),
          },
        );

        if (geminiRes.ok) {
          const gData = await geminiRes.json();
          const textResponse = gData.candidates?.[0]?.content?.parts?.[0]?.text;
          if (textResponse) {
            const cleanText = textResponse.replace(/```json/g, "").replace(/```/g, "").trim();
            const parsed = JSON.parse(cleanText);
            if (parsed && Array.isArray(parsed.questions) && parsed.questions.length >= 3) {
              console.log(`[AI Discovery] Generated dynamic discovery via Google Gemini (${model})`);
              return {
                questions: parsed.questions,
                summary: parsed.summary || getActiveAiSummary(cleanPrompt, safeBusinessName, safeIndustry),
                businessAnalysis: parsed.businessAnalysis || getActiveBusinessAnalysis(cleanPrompt, safeBusinessName, safeIndustry),
                source: "gemini-llm",
                modelUsed: `Google Gemini (${model})`,
              };
            }
          }
        }
      } catch (geminiErr) {
        console.warn(`[AI Discovery] Gemini attempt with ${model} failed:`, geminiErr);
      }
    }
  }

  // 2. Try Groq Llama 3.3 70B API
  const clientGroqKey =
    typeof import.meta !== "undefined" && import.meta.env
      ? (import.meta.env.VITE_GROQ_API_KEY as string | undefined)
      : undefined;

  if (clientGroqKey && clientGroqKey.trim().length > 10) {
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
  }

  // 3. Try Server-side Groq endpoint
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
    console.warn("[AI Discovery] Server endpoint unavailable:", apiErr);
  }

  // 4. Graceful Multi-Domain Engine Fallback
  return {
    questions: getActiveDiscoveryScript(cleanPrompt, safeBusinessName, safeIndustry),
    summary: getActiveAiSummary(cleanPrompt, safeBusinessName, safeIndustry),
    businessAnalysis: getActiveBusinessAnalysis(cleanPrompt, safeBusinessName, safeIndustry),
    source: "local-heuristics",
    modelUsed: "BizzMitra Strategic Engine",
  };
}
