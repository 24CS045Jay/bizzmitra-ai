import { createClient } from "@supabase/supabase-js";
import {
  PAYLOADS,
  type ArtifactKind,
} from "../lib/ai/generate-artifact-payloads";
import {
  exportToWordDocHtml,
  generateExcelCsvContent,
} from "../lib/document-exporters";
import {
  generateOpenApiJson,
  generatePostgreSqlDdl,
  generateTechnicalSpecMarkdown,
} from "../lib/export-engine";

function isNewSupabaseApiKey(value: string): boolean {
  return value.startsWith("sb_publishable_") || value.startsWith("sb_secret_");
}

function createSupabaseFetch(supabaseKey: string): typeof fetch {
  return (input, init) => {
    const headers = new Headers(
      typeof Request !== "undefined" && input instanceof Request ? input.headers : undefined,
    );

    if (init?.headers) {
      new Headers(init.headers).forEach((value, key) => headers.set(key, value));
    }

    // New Supabase API keys are opaque strings, not bearer JWTs.
    if (isNewSupabaseApiKey(supabaseKey) && headers.get("Authorization") === `Bearer ${supabaseKey}`) {
      headers.delete("Authorization");
    }

    headers.set("apikey", supabaseKey);
    return fetch(input, { ...init, headers });
  };
}

function getSupabaseConfig(env: unknown) {
  const supabaseUrl =
    (env as any)?.SUPABASE_URL ||
    (env as any)?.VITE_SUPABASE_URL ||
    process.env["SUPABASE_URL"] ||
    process.env["VITE_SUPABASE_URL"] ||
    "https://pyqbmgkusnvyyjdsyqyj.supabase.co";

  const serviceRoleKey =
    (env as any)?.SUPABASE_SERVICE_ROLE_KEY ||
    process.env["SUPABASE_SERVICE_ROLE_KEY"] ||
    (env as any)?.SUPABASE_PUBLISHABLE_KEY ||
    (env as any)?.VITE_SUPABASE_PUBLISHABLE_KEY ||
    process.env["SUPABASE_PUBLISHABLE_KEY"] ||
    process.env["VITE_SUPABASE_PUBLISHABLE_KEY"] ||
    "sb_publishable_UNXcq8DuZlHhTimGfZVx4A_qVCnnnZh";

  const anonKey =
    (env as any)?.SUPABASE_PUBLISHABLE_KEY ||
    (env as any)?.VITE_SUPABASE_PUBLISHABLE_KEY ||
    process.env["SUPABASE_PUBLISHABLE_KEY"] ||
    process.env["VITE_SUPABASE_PUBLISHABLE_KEY"] ||
    "sb_publishable_UNXcq8DuZlHhTimGfZVx4A_qVCnnnZh";

  return { supabaseUrl, serviceRoleKey, anonKey };
}

function getCorsHeaders(request?: Request): Record<string, string> {
  const origin = request?.headers.get("Origin") || "";
  const allowedOrigins = [
    "https://bizzmitra-ai.vercel.app",
    "http://localhost:5173",
    "http://localhost:3000",
    "http://localhost:8080",
    "http://localhost:8082",
    "capacitor://localhost",
    "http://localhost",
  ];

  let allowOrigin = "https://bizzmitra-ai.vercel.app";
  if (
    allowedOrigins.includes(origin) ||
    origin.endsWith(".vercel.app") ||
    origin.startsWith("http://localhost:") ||
    origin.startsWith("capacitor://")
  ) {
    allowOrigin = origin;
  }

  return {
    "access-control-allow-origin": allowOrigin,
    "access-control-allow-methods": "GET, POST, PUT, DELETE, OPTIONS",
    "access-control-allow-headers": "Content-Type, Authorization, X-Workspace-Id",
    "access-control-allow-credentials": "true",
  };
}

function jsonResponse(
  data: unknown,
  status = 200,
  headers: Record<string, string> = {},
  request?: Request
) {
  const corsHeaders = getCorsHeaders(request);
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json",
      ...corsHeaders,
      ...headers,
    },
  });
}

async function getAuthenticatedUser(request: Request, supabaseAdmin: any) {
  const authHeader = request.headers.get("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }
  const token = authHeader.replace("Bearer ", "").trim();
  if (!token) return null;

  const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !user) return null;
  return user;
}

async function assertWorkspaceOwnership(
  userId: string,
  workspaceId: string,
  supabaseAdmin: any
): Promise<{ allowed: boolean; workspace?: any; error?: string }> {
  if (!workspaceId || !userId) {
    return { allowed: false, error: "Missing workspace or user identifier" };
  }

  const isValidUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(workspaceId);
  if (!isValidUuid) {
    return { allowed: true };
  }

  const { data: workspace, error } = await supabaseAdmin
    .from("workspaces")
    .select("id, owner_id, name, industry, problem_statement, goals, constraints_text, workspace_context")
    .eq("id", workspaceId)
    .maybeSingle();

  if (error) {
    return { allowed: false, error: error.message };
  }

  if (!workspace) {
    return { allowed: false, error: "Workspace not found" };
  }

  if (workspace.owner_id && workspace.owner_id !== userId) {
    return { allowed: false, error: "Forbidden: You do not own this workspace" };
  }

  return { allowed: true, workspace };
}

export async function handleApiRoute(
  request: Request,
  env: unknown,
  _ctx: unknown
): Promise<Response | null> {
  const url = new URL(request.url);
  const pathname = url.pathname;

  // Handle CORS preflight options
  if (request.method === "OPTIONS") {
    const corsHeaders = getCorsHeaders(request);
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }

  // Only route /api/* requests
  if (!pathname.startsWith("/api/")) {
    return null;
  }

  const { supabaseUrl, serviceRoleKey } = getSupabaseConfig(env);
  const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
    global: {
      fetch: createSupabaseFetch(serviceRoleKey),
    },
  });

  // 1. Auth: User Registration
  if (pathname === "/api/auth/register" && request.method === "POST") {
    try {
      const body = (await request.json()) as { email?: string; password?: string; fullName?: string };
      const email = body.email?.trim().toLowerCase();
      const password = body.password;
      const fullName = body.fullName?.trim();

      if (!email || !password) {
        return jsonResponse({ error: "Email and password are required." }, 400, {}, request);
      }

      if (password.length < 6) {
        return jsonResponse({ error: "Password must be at least 6 characters long." }, 400, {}, request);
      }

      const { data: userRes, error: createErr } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { full_name: fullName || email.split("@")[0] },
      });

      if (createErr) {
        if (
          createErr.message.toLowerCase().includes("already") ||
          createErr.message.toLowerCase().includes("exists")
        ) {
          return jsonResponse(
            { error: "An account with this email address already exists. Please sign in or reset your password." },
            409,
            {},
            request
          );
        }
        return jsonResponse({ error: createErr.message }, 400, {}, request);
      }

      if (userRes?.user) {
        await supabaseAdmin.from("profiles").upsert({
          id: userRes.user.id,
          full_name: fullName || email.split("@")[0],
          plan: "free",
        });
      }

      return jsonResponse({ success: true, userId: userRes?.user?.id }, 201, {}, request);
    } catch (err: any) {
      return jsonResponse({ error: err?.message || "Registration failed" }, 500, {}, request);
    }
  }

  // 2. Auth: Current User Profile /api/auth/me
  if (pathname === "/api/auth/me" && request.method === "GET") {
    const user = await getAuthenticatedUser(request, supabaseAdmin);
    if (!user) return jsonResponse({ error: "Unauthorized" }, 401);
    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle();

    return jsonResponse({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        fullName: profile?.full_name || user.email?.split("@")[0],
        plan: profile?.plan || "free",
      },
    });
  }

  // 3. Workspaces: GET /api/workspaces or POST /api/workspaces
  if (pathname === "/api/workspaces") {
    const user = await getAuthenticatedUser(request, supabaseAdmin);
    if (!user) return jsonResponse({ error: "Unauthorized" }, 401);

    if (request.method === "GET") {
      const { data: workspaces, error } = await supabaseAdmin
        .from("workspaces")
        .select("*")
        .eq("owner_id", user.id)
        .order("updated_at", { ascending: false });

      if (error) return jsonResponse({ error: error.message }, 500);
      return jsonResponse({ success: true, workspaces: workspaces || [] });
    }

    if (request.method === "POST") {
      try {
        const body = await request.json();
        const {
          name,
          problemStatement,
          industry,
          goals,
          constraints,
          intakeMode,
          intakeMethod,
          language,
          workspaceContext,
        } = body;
        if (!name?.trim()) {
          return jsonResponse({ error: "Workspace name is required" }, 400);
        }

        // Enforce basic plan limit: max 1 workspace
        const { data: profile } = await supabaseAdmin
          .from("profiles")
          .select("plan")
          .eq("id", user.id)
          .single();

        const userPlan = profile?.plan || "free";
        const isBasic = userPlan === "free" || userPlan === "starter" || userPlan === "basic";

        if (isBasic) {
          const { count, error: countErr } = await supabaseAdmin
            .from("workspaces")
            .select("id", { count: "exact", head: true })
            .eq("owner_id", user.id);

          if (!countErr && (count ?? 0) >= 1) {
            return jsonResponse(
              {
                error:
                  "In basic plan you can only create one workspace. Please upgrade your plan to create another workspace.",
                limitReached: true,
                maxWorkspaces: 1,
              },
              403,
            );
          }
        }

        const { data: newWs, error } = await supabaseAdmin
          .from("workspaces")
          .insert({
            name: name.trim(),
            problem_statement: problemStatement || null,
            industry: industry || "Cross-Industry Transformation",
            goals: goals || null,
            constraints_text: constraints || null,
            intake_mode: intakeMode || "consult",
            intake_method: intakeMethod || "prompt",
            language_code: language || "en",
            workspace_context: workspaceContext || null,
            owner_id: user.id,
            status: "active",
            maturity_score: 54,
            ai_readiness_score: 81,
          })
          .select()
          .single();

        if (error) return jsonResponse({ error: error.message }, 500);
        return jsonResponse({ success: true, workspace: newWs }, 201);
      } catch (err: any) {
        return jsonResponse({ error: err?.message || "Invalid payload" }, 400);
      }
    }
  }

  // 4. Artifacts: GET /api/artifacts?workspaceId=... or POST /api/artifacts
  if (pathname === "/api/artifacts") {
    const user = await getAuthenticatedUser(request, supabaseAdmin);
    if (!user) return jsonResponse({ error: "Unauthorized" }, 401, {}, request);

    if (request.method === "GET") {
      const workspaceId = url.searchParams.get("workspaceId");
      if (!workspaceId) return jsonResponse({ error: "workspaceId is required" }, 400, {}, request);

      const authCheck = await assertWorkspaceOwnership(user.id, workspaceId, supabaseAdmin);
      if (!authCheck.allowed) {
        return jsonResponse({ error: authCheck.error || "Forbidden: You do not own this workspace" }, 403, {}, request);
      }

      const { data: artifacts, error } = await supabaseAdmin
        .from("artifacts")
        .select("*")
        .eq("workspace_id", workspaceId)
        .order("version", { ascending: false });

      if (error) return jsonResponse({ error: error.message }, 500, {}, request);
      return jsonResponse({ success: true, artifacts: artifacts || [] }, 200, {}, request);
    }

    if (request.method === "POST") {
      try {
        const body = await request.json();
        const { workspaceId, moduleType, content } = body;
        if (!workspaceId || !moduleType || !content) {
          return jsonResponse({ error: "workspaceId, moduleType, and content are required" }, 400, {}, request);
        }

        const authCheck = await assertWorkspaceOwnership(user.id, workspaceId, supabaseAdmin);
        if (!authCheck.allowed) {
          return jsonResponse({ error: authCheck.error || "Forbidden: You do not own this workspace" }, 403, {}, request);
        }

        // Get current latest version
        const { data: latest } = await supabaseAdmin
          .from("artifacts")
          .select("version")
          .eq("workspace_id", workspaceId)
          .eq("module_type", moduleType)
          .order("version", { ascending: false })
          .limit(1)
          .maybeSingle();

        const nextVersion = (latest?.version ?? 0) + 1;

        const { data: newArtifact, error } = await supabaseAdmin
          .from("artifacts")
          .insert({
            workspace_id: workspaceId,
            module_type: moduleType,
            content,
            version: nextVersion,
          })
          .select()
          .single();

        if (error) return jsonResponse({ error: error.message }, 500, {}, request);
        return jsonResponse({ success: true, artifact: newArtifact, version: nextVersion }, 201, {}, request);
      } catch (err: any) {
        return jsonResponse({ error: err?.message || "Failed to save artifact" }, 500, {}, request);
      }
    }
  }

function extractJsonFromText(rawText: string): any {
  if (!rawText) throw new Error("Empty response from AI");
  let text = rawText.trim();
  if (text.startsWith("```json")) {
    text = text.replace(/^```json\s*/i, "").replace(/\s*```$/, "").trim();
  } else if (text.startsWith("```")) {
    text = text.replace(/^```\s*/, "").replace(/\s*```$/, "").trim();
  }
  try {
    return JSON.parse(text);
  } catch {
    const firstBrace = text.indexOf("{");
    const lastBrace = text.lastIndexOf("}");
    if (firstBrace !== -1 && lastBrace > firstBrace) {
      const candidate = text.slice(firstBrace, lastBrace + 1);
      try {
        return JSON.parse(candidate);
      } catch {
        // Attempt clean-up of trailing unclosed arrays/objects if truncated
        let fixed = candidate.replace(/,\s*([\]}])/g, "$1");
        try {
          return JSON.parse(fixed);
        } catch {}
      }
    }
    throw new Error("Could not extract valid JSON object from LLM response");
  }
}

  // 5. Centralized AI Orchestration: POST /api/ai/generate
  // Global key rotation pointers
  let groqRotIndex = 0;
  let geminiRotIndex = 0;

  // Helper: Call LLM (Multi-key Groq pool primary with Multi-key Gemini fallback)
  async function callLlmJson(
    prompt: string,
    systemPrompt = "You are an enterprise systems architect and McKinsey-grade strategy consultant at BizzMitra AI. You must return strictly valid JSON object. No other text or reasoning.",
    maxTokensOverride?: number,
    timeoutOverrideMs?: number
  ) {
    const rawGroqKeys = [
      (env as any)?.GROQ_API_KEYS,
      process.env["GROQ_API_KEYS"],
      (env as any)?.VITE_GROQ_API_KEYS,
      process.env["VITE_GROQ_API_KEYS"],
      (env as any)?.GROQ_API_KEY,
      process.env["GROQ_API_KEY"],
      (env as any)?.VITE_GROQ_API_KEY,
      process.env["VITE_GROQ_API_KEY"],
    ]
      .filter(Boolean)
      .join(",");

    const groqKeys = Array.from(
      new Set(
        rawGroqKeys
          .split(",")
          .map((k) => k.trim().replace(/^["']|["']$/g, ""))
          .filter(Boolean)
      )
    );

    const rawGeminiKeys = [
      (env as any)?.GEMINI_API_KEYS,
      process.env["GEMINI_API_KEYS"],
      (env as any)?.VITE_GEMINI_API_KEYS,
      process.env["VITE_GEMINI_API_KEYS"],
      (env as any)?.GEMINI_API_KEY,
      process.env["GEMINI_API_KEY"],
      (env as any)?.VITE_GEMINI_API_KEY,
      process.env["VITE_GEMINI_API_KEY"],
    ]
      .filter(Boolean)
      .join(",");

    const geminiKeys = Array.from(
      new Set(
        rawGeminiKeys
          .split(",")
          .map((k) => k.trim().replace(/^["']|["']$/g, ""))
          .filter(Boolean)
      )
    );

    console.log(`[callLlmJson] Initiating LLM call. Groq Pool: ${groqKeys.length} keys, Gemini Pool: ${geminiKeys.length} keys`);

    // 1. Try Groq Ultra-Fast Primary with Multi-Key Rotation
    if (groqKeys.length > 0) {
      const groqModels = [
        { id: "qwen/qwen3.8-27b", maxTokens: maxTokensOverride || 3000 },
        { id: "openai/gpt-oss-120b", maxTokens: maxTokensOverride || 3000 },
        { id: "openai/gpt-oss-20b", maxTokens: maxTokensOverride || 3000 },
        { id: "llama-3.3-70b-versatile", maxTokens: maxTokensOverride || 3000 },
        { id: "llama-3.1-8b-instant", maxTokens: maxTokensOverride || 2000 },
      ];

      // Try across all available Groq keys
      for (let kIdx = 0; kIdx < groqKeys.length; kIdx++) {
        const currentKey = groqKeys[(groqRotIndex + kIdx) % groqKeys.length]!;

        for (const modelDef of groqModels) {
          try {
            const controller = new AbortController();
            const timeoutMs = timeoutOverrideMs || 10000;
            const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

            const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${currentKey}`,
              },
              body: JSON.stringify({
                model: modelDef.id,
                messages: [
                  { role: "system", content: systemPrompt },
                  { role: "user", content: prompt },
                ],
                temperature: 0.2,
                max_tokens: modelDef.maxTokens,
              }),
              signal: controller.signal,
            });

            clearTimeout(timeoutId);

            if (groqRes.ok) {
              const groqData = await groqRes.json();
              const contentStr = groqData.choices?.[0]?.message?.content;
              if (contentStr) {
                const parsed = extractJsonFromText(contentStr);
                // Advance pointer on success for load-balancing
                groqRotIndex = (groqRotIndex + 1) % groqKeys.length;
                return {
                  success: true,
                  data: parsed,
                  modelUsed: `Groq (${modelDef.id})`,
                  source: "groq-llm",
                };
              }
            } else {
              const errText = await groqRes.text();
              if (groqRes.status === 429) {
                console.warn(`[callLlmJson] Groq key (${currentKey.slice(0, 8)}...) rate-limited (429). Rotating to next key in pool...`);
                break; // Try next key immediately
              }
              console.warn(`[callLlmJson] Groq ${modelDef.id} response (${groqRes.status}):`, errText.slice(0, 120));
              continue; // Try next model in pool
            }
          } catch (err: any) {
            console.warn(`[callLlmJson] Groq ${modelDef.id} execution error:`, err?.message || err);
            continue; // Try next model in pool
          }
        }
      }
    }

    // 2. Fallback to Google Gemini Multi-Key Pool
    if (geminiKeys.length > 0) {
      const geminiModels = [
        "gemini-2.5-flash",
        "gemini-1.5-flash",
        "gemini-1.5-pro",
      ];

      for (let gIdx = 0; gIdx < geminiKeys.length; gIdx++) {
        const currentGeminiKey = geminiKeys[(geminiRotIndex + gIdx) % geminiKeys.length]!;

        for (const model of geminiModels) {
          try {
            const controller = new AbortController();
            const timeoutMs = timeoutOverrideMs || 5000;
            const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

            const geminiRes = await fetch(
              `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${currentGeminiKey}`,
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  contents: [
                    { parts: [{ text: `${systemPrompt}\n\n${prompt}` }] },
                  ],
                  generationConfig: {
                    responseMimeType: "application/json",
                    temperature: 0.2,
                    maxOutputTokens: maxTokensOverride || 2048,
                  },
                }),
                signal: controller.signal,
              }
            );

            clearTimeout(timeoutId);

            if (geminiRes.ok) {
              const gData = await geminiRes.json();
              const textResponse = gData.candidates?.[0]?.content?.parts?.[0]?.text;
              if (textResponse) {
                const parsed = extractJsonFromText(textResponse);
                geminiRotIndex = (geminiRotIndex + 1) % geminiKeys.length;
                return {
                  success: true,
                  data: parsed,
                  modelUsed: `Google Gemini (${model})`,
                  source: "gemini-llm",
                };
              }
            } else {
              const errText = await geminiRes.text();
              console.warn(`[callLlmJson] Gemini ${model} response (${geminiRes.status}):`, errText.slice(0, 120));
              if (geminiRes.status === 429) {
                break; // Rotate to next Gemini key
              }
            }
          } catch (geminiErr: any) {
            console.warn(`[callLlmJson] Gemini ${model} execution error:`, geminiErr?.message || geminiErr);
          }
        }
      }
    }

    throw new Error("All AI inference providers (Groq and Gemini) failed or were unconfigured.");
  }

  // 5a. Unified Dynamic Artifact Generation: POST /api/ai/generate-artifact & POST /api/ai/generate
  if ((pathname === "/api/ai/generate-artifact" || pathname === "/api/ai/generate") && request.method === "POST") {
    try {
      const body = (await request.json()) as {
        workspaceId?: string;
        moduleType?: ArtifactKind;
        kind?: ArtifactKind;
        businessName?: string;
        industry?: string;
        problemStatement?: string;
        goals?: string;
        constraints?: string;
        discoveryData?: any;
        forceFresh?: boolean;
        customFields?: string[];
      };

      const kind = (body.kind || body.moduleType) as ArtifactKind;
      if (!kind) {
        return jsonResponse({ error: "Missing required 'kind' or 'moduleType' parameter" }, 400);
      }

      const workspaceId = body.workspaceId;
      const isValidUuid = workspaceId && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(workspaceId);

      // Verify workspace ownership for authenticated persistence
      if (isValidUuid) {
        const user = await getAuthenticatedUser(request, supabaseAdmin);
        if (!user) {
          return jsonResponse({ error: "Unauthorized: Please sign in to generate workspace artifacts." }, 401, {}, request);
        }
        const authCheck = await assertWorkspaceOwnership(user.id, workspaceId, supabaseAdmin);
        if (!authCheck.allowed) {
          return jsonResponse({ error: authCheck.error || "Forbidden: You do not own this workspace." }, 403, {}, request);
        }
      }

      // 1. Check if we already have this artifact generated in Supabase (Rate-limit / Cost awareness)
      if (isValidUuid && !body.forceFresh) {
        const { data: existing } = await supabaseAdmin
          .from("artifacts")
          .select("content, version, created_at")
          .eq("workspace_id", workspaceId)
          .eq("module_type", kind)
          .order("version", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (existing && existing.content) {
          return jsonResponse({
            success: true,
            source: "database-cache",
            modelUsed: "Persisted Supabase Artifact",
            content: existing.content,
            version: existing.version,
          }, 200, {}, request);
        }
      }

      // 2. Resolve Workspace Context
      let bName = body.businessName || "Enterprise Workspace";
      let ind = body.industry || "General Industry";
      let prob = body.problemStatement || "";
      let goals = body.goals || "";
      let constraints = body.constraints || "";
      let discovery = body.discoveryData || null;

      // Pull latest workspace context if UUID is available
      if (isValidUuid) {
        const { data: ws } = await supabaseAdmin
          .from("workspaces")
          .select("name, industry, problem_statement, goals, constraints_text, workspace_context")
          .eq("id", workspaceId)
          .maybeSingle();

        if (ws) {
          if (ws.name) bName = ws.name;
          if (ws.industry) ind = ws.industry;
          if (ws.problem_statement) prob = ws.problem_statement;
          if (ws.goals) goals = ws.goals;
          if (ws.constraints_text) constraints = ws.constraints_text;
          if (ws.workspace_context && !discovery) discovery = ws.workspace_context;
        }
      }

      // 3. Upstream Prompt Chaining: Load previous stages from artifacts table
      let upstreamSolution: any = null;
      let upstreamArchitecture: any = null;
      let upstreamProcess: any = null;

      if (isValidUuid) {
        const { data: artifactsList } = await supabaseAdmin
          .from("artifacts")
          .select("module_type, content")
          .eq("workspace_id", workspaceId)
          .in("module_type", ["solution", "architecture", "process", "framing"]);

        if (artifactsList && artifactsList.length > 0) {
          for (const art of artifactsList) {
            if (art.module_type === "solution") upstreamSolution = art.content;
            if (art.module_type === "architecture") upstreamArchitecture = art.content;
            if (art.module_type === "process") upstreamProcess = art.content;
            if (art.module_type === "framing" && !prob && (art.content as any)?.statement) {
              prob = (art.content as any).statement;
            }
          }
        }
      }

      const baseContextPrompt = `
Business Name: ${bName}
Industry: ${ind}
Problem Statement: ${prob || "Operational automation and workflow optimization."}
${goals ? `Business Goals: ${goals}` : ""}
${constraints ? `Operational Constraints: ${constraints}` : ""}
${discovery ? `Discovery Business Analysis: ${JSON.stringify(discovery)}` : ""}
${upstreamSolution ? `Upstream Chosen Solution Pillars & Tech Stack: ${JSON.stringify(upstreamSolution)}` : ""}
${upstreamArchitecture ? `Upstream System Architecture Components: ${JSON.stringify(upstreamArchitecture)}` : ""}
${upstreamProcess ? `Upstream BPMN Process Flow Details: ${JSON.stringify(upstreamProcess)}` : ""}
`;

      // 4. Construct Kind-Specific Generation Prompt
      let prompt = "";

      if (kind === "framing") {
        prompt = `You are an elite Business Strategy Analyst at BizzMitra AI.
Analyze the following business context and frame the core problem:
${baseContextPrompt}

Return strictly valid JSON with this exact structure:
{
  "statement": "2-3 sentences synthesizing root causes, daily operational friction, and business drag for ${bName}",
  "impact": [
    { "metric": "string (e.g. Daily Backlog, First Response Time, Error Rate, Reclaimed Capacity)", "value": "string (e.g. 70%, 18 hrs, -35%)" },
    { "metric": "string", "value": "string" },
    { "metric": "string", "value": "string" },
    { "metric": "string", "value": "string" }
  ],
  "rootCauses": [
    { "title": "string", "detail": "string" },
    { "title": "string", "detail": "string" },
    { "title": "string", "detail": "string" }
  ],
  "constraints": [ "string", "string", "string" ]
}`;
      } else if (kind === "solution") {
        prompt = `You are a Principal Enterprise Solutions Architect at BizzMitra AI.
Design an end-to-end software solution architecture and modular capabilities tailored specifically for ${bName}:
${baseContextPrompt}

Return strictly valid JSON with this exact structure:
{
  "headline": "Compelling, specific architectural solution title tailored to ${bName}",
  "summary": "2-3 sentences detailing the target architecture, resolution layer, and automation workflow",
  "pillars": [
    { "title": "string", "detail": "string" },
    { "title": "string", "detail": "string" },
    { "title": "string", "detail": "string" },
    { "title": "string", "detail": "string" }
  ],
  "tradeoffs": [
    { "option": "string", "verdict": "Recommended" or "Rejected" or "Deferred", "why": "string" },
    { "option": "string", "verdict": "Rejected" or "Recommended" or "Deferred", "why": "string" },
    { "option": "string", "verdict": "Rejected" or "Recommended" or "Deferred", "why": "string" }
  ],
  "stack": [
    { "layer": "Presentation & Interface", "choice": "React 19 + TypeScript + Tailwind CSS", "why": "string" },
    { "layer": "API Gateway & Edge Orchestration", "choice": "Cloudflare Workers / Node.js", "why": "string" },
    { "layer": "Persistence & Core Data", "choice": "Supabase PostgreSQL 16 + pgvector", "why": "string" },
    { "layer": "Intelligence & LLM Inference", "choice": "Groq Llama 3.3 70B & Gemini 2.0", "why": "string" }
  ],
  "modules": [
    {
      "key": "mod-1",
      "name": "string",
      "description": "string",
      "icon": "Users" or "Building2" or "Clock" or "BarChart3",
      "status": "Core",
      "timeTag": "Invest",
      "features": ["string", "string", "string"]
    },
    {
      "key": "mod-2",
      "name": "string",
      "description": "string",
      "icon": "Building2",
      "status": "Core",
      "timeTag": "Invest",
      "features": ["string", "string", "string"]
    },
    {
      "key": "mod-3",
      "name": "string",
      "description": "string",
      "icon": "Clock",
      "status": "Recommended",
      "timeTag": "Migrate",
      "features": ["string", "string", "string"]
    },
    {
      "key": "mod-4",
      "name": "string",
      "description": "string",
      "icon": "BarChart3",
      "status": "Recommended",
      "timeTag": "Invest",
      "features": ["string", "string", "string"]
    },
    {
      "key": "mod-legacy",
      "name": "Legacy Manual Spreadsheets & Ad-hoc Workflows",
      "description": "Disparate manual processes with zero auditability.",
      "icon": "Clock",
      "status": "Optional",
      "timeTag": "Eliminate",
      "features": ["High error rate", "Decommission planned in Phase 2", "Data fragmentation"]
    }
  ],
  "buildBuyMatrix": [
    {
      "option": "Custom Cloud-Native Build (Tailored Microservices)",
      "verdict": "Recommended",
      "cost": 4,
      "speed": 4,
      "control": 5,
      "fit": 5,
      "rationale": "High long-term differentiation and complete workflow ownership for ${bName}."
    },
    {
      "option": "Generic Off-the-Shelf SaaS Tool",
      "verdict": "Viable",
      "cost": 2,
      "speed": 5,
      "control": 2,
      "fit": 2,
      "rationale": "Fast initial setup but limited custom field extensibility and high subscription lock-in."
    },
    {
      "option": "BizzMitra AI Hybrid Platform",
      "verdict": "Recommended",
      "cost": 5,
      "speed": 4,
      "control": 5,
      "fit": 5,
      "rationale": "Optimal blend of rapid time-to-value, automated workflows, and enterprise compliance."
    }
  ]
}`;
      } else if (kind === "architecture") {
        prompt = `You are a Principal Cloud & Distributed Systems Architect at BizzMitra AI.
Create the engineering architecture specification for ${bName}:
${baseContextPrompt}

Return strictly valid JSON with this structure:
{
  "domainId": "custom-${ind.toLowerCase().replace(/[^a-z0-9]/g, "-")}",
  "domainTitle": "${bName} Technical Architecture",
  "hld": "graph TB\\n  Client[Presentation & Mobile Portal] --> Gateway[Cloudflare Edge Gateway]\\n  Gateway --> Services[Core Microservices Engine]\\n  Services --> AI[AI Inference Pipeline]\\n  Services --> DB[(PostgreSQL 16 & Redis Cache)]",
  "hldDiagram": "graph TB\\n  Client[Presentation & Mobile Portal] --> Gateway[Cloudflare Edge Gateway]\\n  Gateway --> Services[Core Microservices Engine]\\n  Services --> AI[AI Inference Pipeline]\\n  Services --> DB[(PostgreSQL 16 & Redis Cache)]",
  "lld": "sequenceDiagram\\n  User->>Gateway: API Request\\n  Gateway->>Services: Route Payload\\n  Services->>DB: Query / Store State\\n  Services-->>User: 200 OK Response",
  "lldDiagram": "sequenceDiagram\\n  User->>Gateway: API Request\\n  Gateway->>Services: Route Payload\\n  Services->>DB: Query / Store State\\n  Services-->>User: 200 OK Response",
  "topologyDiagram": "graph TB\\n  Edge[Global CDN] --> App[App Service Pods]\\n  App --> Postgres[(Primary DB)]",
  "securitySlaDiagram": "graph TD\\n  WAF[Firewall & Rate Limit] --> Auth[JWT & RBAC] --> Kernel[Postgres RLS]",
  "summary": {
    "cloudProvider": "Cloudflare Edge & AWS Multi-AZ",
    "dbEngine": "PostgreSQL 16 (Supabase) + Redis",
    "concurrencyTarget": "5,000+ Requests / sec",
    "primarySla": "99.95% Availability"
  },
  "keyDecisions": [
    { "title": "Zero-Cold-Start Edge Gateway", "detail": "Routes API calls with sub-20ms latency.", "badge": "Latency" },
    { "title": "Row-Level Multi-Tenant Security", "detail": "PostgreSQL RLS guarantees tenant data isolation.", "badge": "Security" },
    { "title": "Asynchronous Queue Buffering", "detail": "Decouples heavy background jobs via Redis queue.", "badge": "Reliability" }
  ],
  "components": [
    {
      "id": "comp-client",
      "name": "Web Workspace & Portals",
      "layer": "Client & Presentation",
      "techStack": ["React 19", "TanStack Router", "Tailwind CSS"],
      "description": "Unified responsive portal for internal teams and stakeholders.",
      "securityPolicies": ["HTTPS TLS 1.3", "CSP Nonce", "JWT HttpOnly"],
      "scalingConsiderations": ["Edge asset caching via Cloudflare CDN"],
      "latencyBudget": "< 80ms FCP",
      "availabilitySla": "99.99%",
      "dependencies": ["API Gateway"],
      "dataIngress": "User interactions",
      "dataEgress": "Rendered DOM"
    },
    {
      "id": "comp-services",
      "name": "Core Domain Services Engine",
      "layer": "Core Services",
      "techStack": ["Node.js / TypeScript", "Prisma ORM"],
      "description": "Business logic execution, workflow orchestration, and audit logging.",
      "securityPolicies": ["Role-Based Access Control (RBAC)", "Service mTLS"],
      "scalingConsiderations": ["Auto-scaling container group"],
      "latencyBudget": "< 120ms p95",
      "availabilitySla": "99.95%",
      "dependencies": ["PostgreSQL Primary", "Redis Cache"],
      "dataIngress": "API Gateway routed payloads",
      "dataEgress": "Database transactions"
    },
    {
      "id": "comp-data",
      "name": "Database & Persistence Cluster",
      "layer": "Data & Cache",
      "techStack": ["PostgreSQL 16", "Redis 7"],
      "description": "Relational entities, audit logs, and session state.",
      "securityPolicies": ["AES-256 at-rest", "TLS 1.3 in-transit"],
      "scalingConsiderations": ["Read replicas with connection pooling"],
      "latencyBudget": "< 10ms query",
      "availabilitySla": "99.99%",
      "dependencies": [],
      "dataIngress": "SQL queries",
      "dataEgress": "Relational rows"
    }
  ]
}`;
      } else if (kind === "process") {
        prompt = `You are a Principal BPMN 2.0 Process Architect at BizzMitra AI.
Synthesize the operational process intelligence for ${bName}:
${baseContextPrompt}

CRITICAL INSTRUCTION FOR PROCESS METRICS (DO NOT RETURN GENERIC NUMBERS OR LOGISTICS DRIVER TAT UNLESS IT IS STRICTLY A LOGISTICS FLEET):
You MUST calculate exactly 4 highly tailored, realistic, domain-specific operational process efficiency metrics comparing As-Is (before) vs To-Be (after) specifically relevant to ${bName}'s operations, industry (${ind}), and problem:
Examples:
- If Cold-Chain Logistics / Fleet:
  - "Perishable Spoilage Rate": before "18.5% Spoilage", after "1.8% Spoilage", improvement: "90% Waste Reduction", icon: "Clock"
  - "Driver Dispatch TAT": before "45 Minutes", after "30 Seconds", improvement: "98% Faster", icon: "Zap"
  - "Proof-of-Delivery Cycle Time": before "7.2 Days", after "Instant (Live)", improvement: "100% Real-Time", icon: "Timer"
  - "Reefer Telemetry Ingestion Latency": before "4.5 Hours", after "Sub-second", improvement: "Real-time Alerts", icon: "Users"
- If E-commerce / Amazon FBA:
  - "Amazon Restock Cycle Time": before "14.2 Days", after "1.8 Days", improvement: "87% Faster", icon: "Clock"
  - "Aged Inventory Surcharges": before "₹18.5L / yr", after "₹1.2L / yr", improvement: "93% Savings", icon: "Zap"
  - "Stockout Reconciliation Latency": before "48 Hours", after "Instant (Live)", improvement: "100% Real-Time", icon: "Timer"
  - "Listing Suppression SLA Rate": before "16.8%", after "0.4%", improvement: "98% Retention", icon: "Users"
- If FinTech / Lending:
  - "Loan Underwriting Turnaround": before "4.5 Days", after "15 Minutes", improvement: "98% Faster", icon: "Clock"
  - "e-KYC Document Verification": before "24 Hours", after "Instant (OCR)", improvement: "100% Real-Time", icon: "Zap"
  - "Credit Bureau Analysis Time": before "6.2 Hours", after "30 Seconds", improvement: "99% Reduction", icon: "Timer"
  - "Default Risk Pre-Screening Accuracy": before "79.4%", after "99.2%", improvement: "+20% Accuracy", icon: "Users"
- If Healthcare / Diagnostics:
  - "Phlebotomy Specimen Intake TAT": before "2.5 Hours", after "3 Minutes", improvement: "98% Reduction", icon: "Clock"
  - "Analyzer LIMS Transcription Lag": before "18.4 Hours", after "Instant (HL7)", improvement: "Zero Manual Typing", icon: "Zap"
  - "Critical Panic Value Reporting": before "4.2 Hours", after "45 Seconds", improvement: "Instant Alert", icon: "Timer"
  - "Patient Report Delivery Cycle": before "24-48 Hours", after "2.5 Hours", improvement: "90% Faster", icon: "Users"
- If Manufacturing / Industrial:
  - "Shift Changeover Handover TAT": before "75 Minutes", after "12 Minutes", improvement: "84% Faster", icon: "Clock"
  - "Machine Telemetry Alarm Response": before "35 Minutes", after "10 Seconds", improvement: "99% Faster", icon: "Zap"
  - "Batch QA Inspection Latency": before "5.5 Hours", after "25 Minutes", improvement: "92% Reduction", icon: "Timer"
  - "Scrap & Rework Rate": before "12.8%", after "1.2%", improvement: "91% Yield Boost", icon: "Users"
- If CleanTech / Solar:
  - "Inverter Fault Detection Latency": before "4.5 Hours", after "1.2 Seconds", improvement: "99% Faster", icon: "Clock"
  - "String Degradation Diagnostic Time": before "3 Days", after "10 Minutes", improvement: "99% Faster", icon: "Zap"
  - "Daily Generation Yield Loss": before "12.8%", after "1.4%", improvement: "89% Yield Saved", icon: "Timer"
  - "Grid Dispatch Compliance Rate": before "82.4%", after "99.8%", improvement: "100% SLA Met", icon: "Users"

Return strictly valid JSON with this structure:
{
  "domainId": "custom-proc-${ind.toLowerCase().replace(/[^a-z0-9]/g, "-")}",
  "domainTitle": "${bName} Process Intelligence",
  "asIsDiagram": "graph TD\\n  A[Manual Ingestion] --> B[Manual Verification] --> C[Paper/Spreadsheet Tracking] --> D[Delayed Resolution]",
  "beforeDiagram": "graph TD\\n  A[Manual Ingestion] --> B[Manual Verification] --> C[Paper/Spreadsheet Tracking] --> D[Delayed Resolution]",
  "before": "graph TD\\n  A[Manual Ingestion] --> B[Manual Verification] --> C[Paper/Spreadsheet Tracking] --> D[Delayed Resolution]",
  "toBeDiagram": "graph TD\\n  A[Instant Ingestion] --> B[AI Validation] --> C[Automated Workflow Engine] --> D[Real-time Resolution]",
  "afterDiagram": "graph TD\\n  A[Instant Ingestion] --> B[AI Validation] --> C[Automated Workflow Engine] --> D[Real-time Resolution]",
  "after": "graph TD\\n  A[Instant Ingestion] --> B[AI Validation] --> C[Automated Workflow Engine] --> D[Real-time Resolution]",
  "swimlaneDiagram": "graph TB\\n  subgraph Customer\\n    C1[Submit Request]\\n  end\\n  subgraph Operations\\n    O1[Review Exceptions]\\n  end\\n  subgraph AIEngine[AI Engine]\\n    A1[Auto Parse & Validate]\\n  end\\n  C1 --> A1 --> O1",
  "swimlane": "graph TB\\n  subgraph Customer\\n    C1[Submit Request]\\n  end\\n  subgraph Operations\\n    O1[Review Exceptions]\\n  end\\n  subgraph AIEngine[AI Engine]\\n    A1[Auto Parse & Validate]\\n  end\\n  C1 --> A1 --> O1",
  "decisionTreeDiagram": "graph TD\\n  In[Request Received] --> Val{Valid & Complete?}\\n  Val -->|Yes| Auto[Auto-Approve & Route]\\n  Val -->|No| Triage[Flag for Supervisor Review]",
  "metrics": [
    { "label": "string (Specific domain metric name)", "before": "string (As-Is baseline)", "after": "string (To-Be automated)", "improvement": "string (Delta % or speed)", "icon": "Clock" },
    { "label": "string", "before": "string", "after": "string", "improvement": "string", "icon": "Zap" },
    { "label": "string", "before": "string", "after": "string", "improvement": "string", "icon": "Timer" },
    { "label": "string", "before": "string", "after": "string", "improvement": "string", "icon": "Users" }
  ],
  "bottlenecks": [
    {
      "stage": "string",
      "problem": "string",
      "impact": "string",
      "solution": "string",
      "timeSavings": "string"
    },
    {
      "stage": "string",
      "problem": "string",
      "impact": "string",
      "solution": "string",
      "timeSavings": "string"
    }
  ],
  "decisionTiers": [
    { "tier": "Tier 1", "actor": "AI Engine", "criteria": "High Confidence (>90%)", "action": "Auto-Execute", "status": "Active" },
    { "tier": "Tier 2", "actor": "Supervisor", "criteria": "Exception / Low Confidence", "action": "Manual Review", "status": "Active" }
  ]
}`;
      } else if (kind === "ux") {
        prompt = `You are a Principal Enterprise UX/UI Product Designer at BizzMitra AI.
Design the user experience architecture, screen inventory, and interactive wireframes for ${bName}:
${baseContextPrompt}

Return strictly valid JSON with this structure:
{
  "domainId": "custom-ux-${ind.toLowerCase().replace(/[^a-z0-9]/g, "-")}",
  "domainTitle": "${bName} Interactive Wireframes & UX Flow",
  "screenCount": 4,
  "flowComplexity": "Enterprise Multi-Role",
  "flow": "string (Valid Mermaid graph LR navigation flow)",
  "flowDiagram": "string (Same valid Mermaid graph LR navigation flow)",
  "screens": [
    {
      "id": "screen-1",
      "title": "Executive Command Dashboard",
      "actor": "Business Manager & Admin",
      "userStory": "As an operations manager, I want full visibility into live queue throughput, SLA alerts, and staff efficiency.",
      "wireframe": "+--------------------------------------------------------+\\n| [BizzMitra] ${bName} Operations Hub       [Search] [User] |\\n+--------------------------------------------------------+\\n| Active Volume: 1,240 | SLA: 99.4% | Backlog: 12        |\\n+--------------------------------------------------------+\\n| [Real-time Queue Table]         | [Live Telemetry Chart] |\\n| ID-101 | Status: In-Progress    | [===================]  |\\n| ID-102 | Status: AI Resolved    | [===================]  |\\n+--------------------------------------------------------+",
      "components": ["KPI Metric Banner", "Real-Time Queue Table", "Throughput Radar Chart", "Action Filter Bar"],
      "actions": ["Filter by Status", "Trigger Batch Processing", "Export CSV Spec", "Drill down to Detail"]
    },
    {
      "id": "screen-2",
      "title": "Workable Operations & Triage Pipeline",
      "actor": "Frontline Operations Team",
      "userStory": "As a frontline operator, I want an interactive Kanban pipeline to review, update, and resolve items rapidly.",
      "wireframe": "+--------------------------------------------------------+\\n| [Stage: Ingest] -> [Stage: Verify] -> [Stage: Resolve] |\\n| +------------+     +------------+     +------------+   |\\n| | Item #8812 |     | Item #8810 |     | Item #8804 |   |\\n| | Score: 94% |     | Flagged    |     | Completed  |   |\\n| +------------+     +------------+     +------------+   |\\n+--------------------------------------------------------+",
      "components": ["Drag-and-Drop Kanban Columns", "Priority Tag Badges", "Quick Action Modals", "Audit Timeline"],
      "actions": ["Move Stage", "Add Note", "Trigger AI Copilot Draft", "Assign Owner"]
    },
    {
      "id": "screen-3",
      "title": "Stakeholder Self-Serve Portal",
      "actor": "Client / External User",
      "userStory": "As a client or end user, I want a frictionless self-serve interface to submit requests and track progress.",
      "wireframe": "+--------------------------------------------------------+\\n| Welcome to ${bName} Self-Serve Portal                 |\\n+--------------------------------------------------------+\\n| [Submit New Request]  [Track Active Status: #8812]     |\\n| Current Stage: Verification (Est. completion: 15 min)  |\\n+--------------------------------------------------------+",
      "components": ["Status Stepper", "Digital Document Upload", "Live Chat Assistant", "Approval Checkboxes"],
      "actions": ["Upload File", "Sign Digital Agreement", "Download Summary PDF"]
    },
    {
      "id": "screen-4",
      "title": "Analytics & Transformation ROI Cockpit",
      "actor": "Executive Leadership",
      "userStory": "As an executive, I want to track 36-month ROI, labor hours reclaimed, and payback milestones.",
      "wireframe": "+--------------------------------------------------------+\\n| Financial ROI & Capacity Reclaim Cockpit               |\\n+--------------------------------------------------------+\\n| Net Savings: INR 48.2L/yr | Payback: 4.2 Months        |\\n| [36-Month Cumulative Value Chart]                      |\\n+--------------------------------------------------------+",
      "components": ["Financial Payback Calculator", "36-Month Cumulative Recharts Curve", "Readiness Radar"],
      "actions": ["Adjust Sensitivity Sliders", "Download Executive Brief", "Share Scenario"]
    }
  ]
}`;
      } else if (kind === "data") {
        prompt = `You are a Principal Database Architect & API Designer at BizzMitra AI.
Design the normalized relational data model, PostgreSQL 16 DDL schema, and RESTful API specifications for ${bName}:
${baseContextPrompt}

Return strictly valid JSON with this exact structure:
{
  "domainId": "custom-db-${ind.toLowerCase().replace(/[^a-z0-9]/g, "-")}",
  "domainTitle": "${bName} Database & API Designer",
  "er": "erDiagram\\n  WORKSPACES ||--o{ OPERATIONAL_ITEMS : contains\\n  OPERATIONAL_ITEMS ||--o{ AUDIT_LOGS : tracks",
  "erDiagram": "erDiagram\\n  WORKSPACES ||--o{ OPERATIONAL_ITEMS : contains\\n  OPERATIONAL_ITEMS ||--o{ AUDIT_LOGS : tracks",
  "ddlSchema": "CREATE TABLE workspaces (id UUID PRIMARY KEY, name VARCHAR(255) NOT NULL, created_at TIMESTAMPTZ DEFAULT NOW());\\nCREATE TABLE operational_records (id UUID PRIMARY KEY, workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE, title VARCHAR(255) NOT NULL, status VARCHAR(50) DEFAULT 'active', created_at TIMESTAMPTZ DEFAULT NOW());",
  "metrics": {
    "tableCount": 3,
    "apiCount": 3,
    "rlsPoliciesCount": 3,
    "relationshipCount": 3
  },
  "tables": [
    {
      "name": "workspaces",
      "description": "Multi-tenant tenant root configuration and metadata",
      "category": "Core Tenant Layer",
      "rowEstimate": "1k - 10k",
      "columns": [
        { "name": "id", "type": "UUID PRIMARY KEY", "constraints": "DEFAULT gen_random_uuid()", "description": "Unique workspace identifier" },
        { "name": "name", "type": "VARCHAR(255)", "constraints": "NOT NULL", "description": "Business or organization name" },
        { "name": "created_at", "type": "TIMESTAMPTZ", "constraints": "DEFAULT NOW()", "description": "Timestamp created" }
      ]
    },
    {
      "name": "operational_records",
      "description": "Primary transactional records and workflow state",
      "category": "Domain Operations",
      "rowEstimate": "50k - 500k",
      "columns": [
        { "name": "id", "type": "UUID PRIMARY KEY", "constraints": "DEFAULT gen_random_uuid()", "description": "Unique record identifier" },
        { "name": "workspace_id", "type": "UUID", "constraints": "REFERENCES workspaces(id) ON DELETE CASCADE", "description": "Tenant FK" },
        { "name": "status", "type": "VARCHAR(50)", "constraints": "NOT NULL DEFAULT 'active'", "description": "Workflow stage" },
        { "name": "data", "type": "JSONB", "constraints": "DEFAULT '{}'::jsonb", "description": "Domain attributes payload" }
      ]
    }
  ],
  "apiSpecifications": [
    {
      "method": "POST",
      "path": "/api/v1/records/intake",
      "summary": "Ingest and auto-triage operational records",
      "category": "Ingestion",
      "requestBody": "{\\"title\\": \\"Sample Request\\", \\"priority\\": \\"high\\"}",
      "responseBody": "{\\"success\\": true, \\"recordId\\": \\"uuid\\"}",
      "headers": ["Authorization: Bearer <jwt>", "Content-Type: application/json"],
      "curlExample": "curl -X POST https://api.bizzmitra.ai/v1/records/intake -H 'Authorization: Bearer token' -d '{\\"title\\":\\"Demo\\"}'"
    },
    {
      "method": "GET",
      "path": "/api/v1/records/pipeline",
      "summary": "List active pipeline records",
      "category": "Pipeline",
      "responseBody": "{\\"records\\": [], \\"total\\": 0}",
      "headers": ["Authorization: Bearer <jwt>"],
      "curlExample": "curl -X GET https://api.bizzmitra.ai/v1/records/pipeline -H 'Authorization: Bearer token'"
    }
  ],
  "endpoints": [
    { "method": "POST", "path": "/api/v1/records/intake", "purpose": "Ingest and triage operational records" },
    { "method": "GET", "path": "/api/v1/records/pipeline", "purpose": "List active pipeline records" }
  ]
}
`;
      } else if (kind === "roadmap") {
        prompt = `You are a Principal Technical Program Director & Enterprise Delivery Lead at BizzMitra AI.
Synthesize a realistic 12-week phased implementation roadmap for ${bName}:
${baseContextPrompt}

Return strictly valid JSON with this exact structure:
{
  "domainId": "custom-rd-${ind.toLowerCase().replace(/[^a-z0-9]/g, "-")}",
  "domainTitle": "${bName} 12-Week Delivery Roadmap",
  "totalWeeks": 12,
  "sprintDurationWeeks": 2,
  "targetGoLive": "12 Weeks from Kickoff",
  "riskIndexScore": 22,
  "ganttDiagram": "gantt\\n  title ${bName} Delivery Plan\\n  dateFormat YYYY-MM-DD\\n  section Phase 1: Foundation\\n  Cloud Setup :2026-10-01, 14d\\n  section Phase 2: Core Domain\\n  Workflow Engine :2026-10-15, 28d\\n  section Phase 3: Rollout\\n  UAT & Go-Live :2026-11-12, 14d",
  "phases": [
    {
      "id": "phase-1",
      "phase": "Phase 1: Foundation & Architecture",
      "duration": "Weeks 1–4",
      "title": "Cloud Infrastructure, RLS Schema & Security Hardening",
      "goal": "Establish zero-trust multi-tenant cloud environment and PostgreSQL DDL schemas.",
      "riskLevel": "Low",
      "workstreams": [
        { "name": "Cloud Infrastructure", "tasks": ["Provision Supabase & Edge", "Configure rate-limiting and WAF"] },
        { "name": "Data Architecture", "tasks": ["Deploy PostgreSQL schema & RLS policies", "Seed baseline taxonomy"] }
      ],
      "milestones": [
        { "id": "m-101", "title": "Infrastructure & Schema Sign-Off", "targetDate": "Week 2", "deliverables": ["Production DB cluster", "Tested RLS security"], "riskLevel": "Low", "completed": false },
        { "id": "m-102", "title": "Auth & Ingestion Live", "targetDate": "Week 4", "deliverables": ["JWT Auth Proxy", "Webhook Ingestion Endpoint"], "riskLevel": "Low", "completed": false }
      ]
    },
    {
      "id": "phase-2",
      "phase": "Phase 2: Core Domain & Automation",
      "duration": "Weeks 5–8",
      "title": "Workable Operations Hub & AI Engine",
      "goal": "Implement live Kanban pipeline, automated verification engine, and stakeholder self-serve portal.",
      "riskLevel": "Medium",
      "workstreams": [
        { "name": "Core Application", "tasks": ["Build interactive Kanban & stage movements", "Implement digital document verification"] },
        { "name": "AI Intelligence", "tasks": ["Deploy semantic parsing pipeline", "Automate draft generation with confidence scoring"] }
      ],
      "milestones": [
        { "id": "m-201", "title": "Operations Hub Beta", "targetDate": "Week 6", "deliverables": ["Tested Kanban workflows", "Staff beta feedback"], "riskLevel": "Medium", "completed": false },
        { "id": "m-202", "title": "Automated Verification Verified", "targetDate": "Week 8", "deliverables": ["Sub-5s triage engine", "Sandbox pass"], "riskLevel": "Low", "completed": false }
      ]
    },
    {
      "id": "phase-3",
      "phase": "Phase 3: Rollout, Governance & Scale",
      "duration": "Weeks 9–12",
      "title": "User Acceptance Testing & Full Go-Live",
      "goal": "Conduct staff training, security compliance audit, and complete zero-downtime cutover.",
      "riskLevel": "Low",
      "workstreams": [
        { "name": "Quality & Security", "tasks": ["Penetration testing & compliance sign-off", "Load testing at 5,000 req/s"] },
        { "name": "Operations Rollout", "tasks": ["Frontline staff training workshops", "Decommission legacy spreadsheets"] }
      ],
      "milestones": [
        { "id": "m-301", "title": "Staff Training Sign-Off", "targetDate": "Week 10", "deliverables": ["100% staff certified", "Zero blocker bugs"], "riskLevel": "Low", "completed": false },
        { "id": "m-302", "title": "Production Cutover Live", "targetDate": "Week 12", "deliverables": ["DNS cutover", "Executive dashboard live"], "riskLevel": "Low", "completed": false }
      ]
    }
  ],
  "milestones": [
    { "title": "Foundation Ready", "quarter": "Month 1", "target": "Week 4", "status": "In Progress" },
    { "title": "Operations Hub Beta", "quarter": "Month 2", "target": "Week 8", "status": "Planned" },
    { "title": "Production Go-Live", "quarter": "Month 3", "target": "Week 12", "status": "Planned" }
  ],
  "kpis": [
    { "metric": "Process Cycle Time Reduction", "target": "> 75% Reduction", "timeline": "Month 3" },
    { "metric": "Manual Error Rate", "target": "< 0.5%", "timeline": "Month 3" },
    { "metric": "User Adoption Rate", "target": "> 95% Active Daily Use", "timeline": "Month 4" }
  ],
  "staffing": [
    { "role": "Lead Enterprise Architect", "count": "1 FTE", "commitment": "100%", "allocationPhase": "Phases 1–3" },
    { "role": "Full-Stack Engineers", "count": "3 FTE", "commitment": "100%", "allocationPhase": "Phases 1–3" },
    { "role": "AI & Integration Specialist", "count": "1 FTE", "commitment": "75%", "allocationPhase": "Phases 2–3" },
    { "role": "QA & Change Lead", "count": "1 FTE", "commitment": "50%", "allocationPhase": "Phases 2–3" }
  ],
  "risks": [
    {
      "id": "risk-1",
      "risk": "Legacy data inconsistency during migration",
      "impact": "High",
      "likelihood": "Medium",
      "mitigation": "Automated reconciliation scripts with dual-write validation during Phase 2.",
      "status": "Mitigated"
    },
    {
      "id": "risk-2",
      "risk": "Staff adoption hesitation with new workflow",
      "impact": "Medium",
      "likelihood": "Low",
      "mitigation": "Role-specific video onboarding and parallel runs during Week 10.",
      "status": "Monitored"
    }
  ]
}
`;
      } else if (kind === "summary") {
        prompt = `You are a Senior Strategic Advisor at BizzMitra AI.
Synthesize a concise, high-impact executive transformation summary for ${bName} based on the captured business analysis and solution roadmap:
${baseContextPrompt}

Return strictly valid JSON:
{
  "text": "2-3 paragraphs synthesizing what was captured, the transformation scope, target architecture, and projected ROI for ${bName}."
}`;
      }

      // 5. Execute LLM Call (Groq Primary -> Gemini Fallback)
      const llmResult = await callLlmJson(prompt);
      const generatedContent = llmResult.data;

      // 6. Persist to Supabase artifacts table
      let savedVersion = 1;
      if (isValidUuid) {
        try {
          const { data: latest } = await supabaseAdmin
            .from("artifacts")
            .select("version")
            .eq("workspace_id", workspaceId)
            .eq("module_type", kind)
            .order("version", { ascending: false })
            .limit(1)
            .maybeSingle();

          savedVersion = (latest?.version ?? 0) + 1;

          await supabaseAdmin.from("artifacts").insert({
            workspace_id: workspaceId,
            module_type: kind,
            content: generatedContent as any,
            version: savedVersion,
          });
        } catch (dbErr) {
          console.warn(`[api/ai/generate-artifact] DB persistence warning for ${kind}:`, dbErr);
        }
      }

      // Trigger background predictive prefetch for downstream modules if workspace ID is valid
      if (isValidUuid && (kind === "framing" || kind === "solution")) {
        void (async () => {
          const downstreamKinds: ArtifactKind[] = ["architecture", "process", "ux", "data", "roadmap"];
          for (const nextKind of downstreamKinds) {
            try {
              const { data: hasExisting } = await supabaseAdmin
                .from("artifacts")
                .select("id")
                .eq("workspace_id", workspaceId)
                .eq("module_type", nextKind)
                .maybeSingle();

              if (!hasExisting) {
                console.log(`[prefetch] Starting background pre-generation of ${nextKind} for ${workspaceId}...`);
                // Use fetch against internal endpoint or invoke generation
                await fetch(`http://localhost:8082/api/ai/generate-artifact`, {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    workspaceId,
                    moduleType: nextKind,
                    businessName: bName,
                    industry: ind,
                    problemStatement: prob,
                    goals,
                    constraints,
                  }),
                });
              }
            } catch (pErr) {
              console.warn(`[prefetch] Background generation error for ${nextKind}:`, pErr);
            }
          }
        })();
      }

      return jsonResponse({
        success: true,
        kind,
        moduleType: kind,
        version: savedVersion,
        modelUsed: llmResult.modelUsed,
        source: llmResult.source,
        content: generatedContent,
      });
    } catch (err: any) {
      console.error("[api/ai/generate-artifact error]:", err);
      return jsonResponse({
        error: "AI Generation Failed",
        details: err?.message || "Unknown inference error",
      }, 500);
    }
  }

  // 5a-2. Predictive Prefetch All Artifacts: POST /api/ai/prefetch-all
  if (pathname === "/api/ai/prefetch-all" && request.method === "POST") {
    try {
      const user = await getAuthenticatedUser(request, supabaseAdmin);
      if (!user) {
        return jsonResponse({ error: "Unauthorized" }, 401, {}, request);
      }

      const body = (await request.json()) as { workspaceId: string };
      const { workspaceId } = body;
      if (!workspaceId) {
        return jsonResponse({ error: "workspaceId is required" }, 400, {}, request);
      }

      const authCheck = await assertWorkspaceOwnership(user.id, workspaceId, supabaseAdmin);
      if (!authCheck.allowed) {
        return jsonResponse({ error: authCheck.error || "Forbidden: You do not own this workspace" }, 403, {}, request);
      }

      const ws = authCheck.workspace;
      if (!ws) return jsonResponse({ error: "Workspace not found" }, 404, {}, request);

      const allModules: ArtifactKind[] = ["framing", "solution", "architecture", "process", "ux", "data", "roadmap"];

      // Fire non-blocking parallel generation
      void (async () => {
        for (const m of allModules) {
          try {
            const { data: existing } = await supabaseAdmin
              .from("artifacts")
              .select("id")
              .eq("workspace_id", workspaceId)
              .eq("module_type", m)
              .maybeSingle();

            if (!existing) {
              await fetch(`http://localhost:8082/api/ai/generate-artifact`, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: request.headers.get("Authorization") || "",
                },
                body: JSON.stringify({
                  workspaceId,
                  moduleType: m,
                  businessName: ws.name,
                  industry: ws.industry,
                  problemStatement: ws.problem_statement,
                  goals: ws.goals,
                  constraints: ws.constraints_text,
                }),
              });
            }
          } catch (e) {
            console.warn(`[prefetch-all] Failed for module ${m}:`, e);
          }
        }
      })();

      return jsonResponse({ success: true, message: "Prefetch background pipeline started" }, 200, {}, request);
    } catch (err: any) {
      return jsonResponse({ error: err?.message || "Prefetch failed" }, 500, {}, request);
    }
  }

  // 5b. Dynamic AI Discovery Interview: POST /api/ai/discovery-interview
  if (pathname === "/api/ai/discovery-interview" && request.method === "POST") {
    try {
      const body = (await request.json()) as {
        problemStatement?: string;
        businessName?: string;
        industry?: string;
        goals?: string;
        constraints?: string;
        intakeMode?: string;
        intakeMethod?: string;
        documentSummary?: string;
        legacyTools?: string;
        diagnosticAnswers?: Array<{ question: string; answer: string; hint?: string }>;
      };
      const {
        problemStatement = "",
        businessName = "Enterprise Business",
        industry = "General",
        goals = "",
        constraints = "",
        intakeMode = "",
        intakeMethod = "",
        documentSummary = "",
        legacyTools = "",
        diagnosticAnswers = [],
      } = body;

      const prompt = `You are an elite Principal Enterprise Systems Architect and McKinsey/BCG Senior Business Analyst for BizzMitra AI.
A client submitted this business problem statement and intake context:
---
Business Name: ${businessName}
Industry: ${industry}
Problem Statement: ${problemStatement}
${goals ? `Stated Goals: ${goals}` : ""}
${constraints ? `Stated Constraints: ${constraints}` : ""}
${intakeMode ? `Operating Mode: ${intakeMode}` : ""}
${intakeMethod ? `Intake Channel: ${intakeMethod}` : ""}
${documentSummary ? `Uploaded SOP/Document Context: ${documentSummary}` : ""}
${legacyTools ? `Current Tools & Systems: ${legacyTools}` : ""}
${diagnosticAnswers && diagnosticAnswers.length > 0 ? `Diagnostic Interview Answers provided by client:\n${diagnosticAnswers.map((a, idx) => `Q${idx + 1}: ${a.question}\nAnswer: ${a.answer}`).join("\n")}` : ""}
---

Your task:
1. Generate exactly 3 progressive, deeply contextual diagnostic discovery interview questions tailored specifically to "${businessName}" and their problem.
   - Question 1: Operational Scale, Volume & existing technical interface bottlenecks.
   - Question 2: Operational drop-off, manual errors, and friction points in their daily workflow.
   - Question 3: Governance, regulatory compliance, integrations (e.g. WhatsApp, APIs, ERP, Government portals), and self-serve access.
2. For each question, provide:
   - "question": string (Direct, insightful question tailored to this business)
   - "hint": string (brief 1-sentence technical design consequence)
   - "whyWeAsk": string (1-sentence justification for system sizing/architecture)
   - "missingEntity": string (short tag, e.g. "Daily test volume & analyzer protocol")
   - "options": array of exactly 3 realistic, specific, mutually exclusive choices.
   - "answer": the first recommended option string.
3. Provide a concise 2-sentence "summary" synthesizing what was captured and the transformation scope for ${businessName}.
4. Provide a structured "businessAnalysis" report:
   - "currentState": { "summary": string, "tools": string[], "bottlenecks": string[], "efficiencyScore": number between 25 and 45 }
   - "stakeholders": array of 4 items { "role": string, "count": string, "needs": string, "impact": "Critical" | "High" | "Medium" }
   - "gapAnalysis": array of 4 items { "area": string, "current": string, "future": string, "severity": "Critical" | "High" | "Medium" }
   - "futureState": { "summary": string, "recommendedModules": string[], "automationOpportunities": string[] }
   - "businessImpact": array of 4 items { "metric": string, "current": string, "projected": string, "improvement": string }

Return strictly valid JSON in this exact structure with no markdown code fences:
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
  "businessAnalysis": {
    "currentState": { "summary": "...", "tools": ["..."], "bottlenecks": ["..."], "efficiencyScore": 32 },
    "stakeholders": [
      { "role": "...", "count": "...", "needs": "...", "impact": "Critical" }
    ],
    "gapAnalysis": [
      { "area": "...", "current": "...", "future": "...", "severity": "Critical" }
    ],
    "futureState": { "summary": "...", "recommendedModules": ["..."], "automationOpportunities": ["..."] },
    "businessImpact": [
      { "metric": "...", "current": "...", "projected": "...", "improvement": "..." }
    ]
  }
}`;

      const llmResult = await callLlmJson(prompt, "You are an enterprise business analysis AI. Output strictly valid JSON.");
      return jsonResponse({
        success: true,
        modelUsed: llmResult.modelUsed,
        source: llmResult.source,
        questions: llmResult.data.questions,
        summary: llmResult.data.summary,
        businessAnalysis: llmResult.data.businessAnalysis,
      });
    } catch (err: any) {
      console.error("[api/ai/discovery-interview error]:", err);
      return jsonResponse({ error: err?.message || "Internal error" }, 500);
    }
  }

  // 5c. Dynamic Framing & Solution Generation: POST /api/ai/solution-framing
  if (pathname === "/api/ai/solution-framing" && request.method === "POST") {
    try {
      const body = (await request.json()) as {
        problemStatement?: string;
        businessName?: string;
        industry?: string;
        customFields?: string[];
        discoverySummary?: string;
        diagnosticAnswers?: Array<{ question: string; answer: string }>;
      };
      const {
        problemStatement = "",
        businessName = "Enterprise Business",
        industry = "General",
        customFields = [],
        discoverySummary = "",
        diagnosticAnswers = [],
      } = body;

      const prompt = `You are a World-Class Principal Enterprise Systems Architect and McKinsey/BCG Strategy Partner at BizzMitra AI.
A client submitted this business problem statement:
---
Business Name: ${businessName}
Industry: ${industry}
Problem Statement: ${problemStatement}
${discoverySummary ? `Discovery Diagnostic Summary: ${discoverySummary}` : ""}
${diagnosticAnswers && diagnosticAnswers.length > 0 ? `Discovery Diagnostic Answers:\n${diagnosticAnswers.map((a, idx) => `Q${idx + 1}: ${a.question} -> Answer: ${a.answer}`).join("\n")}` : ""}
${customFields && customFields.length > 0 ? `Configured Custom Schema Attributes (from Solution Studio): ${customFields.join(", ")}` : ""}
---

Your task:
Synthesize an enterprise-grade Problem Framing and Recommended Architectural Solution for this specific business. Do NOT output generic HR templates unless the problem is strictly HR. Customize every pillar, metric, constraint, root cause, software module, and build-vs-buy option to their exact domain.

CRITICAL INSTRUCTION FOR IMPACT METRICS (DO NOT RETURN GENERIC NUMBERS LIKE 72% / -58% / 95% / 3.8x):
You MUST calculate 4 highly tailored, realistic, domain-specific quantitative impact metrics specifically relevant to ${businessName}'s operations and problem:
Examples:
- If Cold-chain Logistics / Fleet: "Perishable Transit Shrink Reduction" (-48%), "Fleet Turnaround Latency" (-54%), "Cold-Chain Sensor Telemetry Coverage" (99.8%), "Projected Annual Fleet ROI" (4.2x)
- If E-commerce / Amazon FBA: "Stockout Day Rate Avoided" (-62%), "Aged Inventory Surcharge Saved" (₹16.5L / yr), "Automated Repricing Latency" (Sub-5s), "Annual Inventory Capital ROI" (5.1x)
- If FinTech / Lending: "Underwriting Turnaround Time" (-76%), "Bureau Verification Automation" (94%), "Default Risk Prediction Accuracy" (98.2%), "Capital Turnover Efficiency" (3.7x)
- If Healthcare / Diagnostics: "Specimen Turnaround SLA" (-68%), "Barcode Matching Accuracy" (99.9%), "NABL Audit Compliance" (100%), "Lab Operational Margin Gain" (32%)
- If Manufacturing / Industrial: "OEE (Overall Equipment Effectiveness)" (+28%), "Unplanned Downtime Reduction" (-64%), "Defect Rate in Production" (< 0.2%), "Annual Machine Asset ROI" (4.6x)
- If CleanTech / Solar: "Inverter Downtime Elimination" (-78%), "SCADA Telemetry Latency" (< 2s), "Grid Dispatch Compliance" (99.9%), "Annual Clean Energy Yield" (+22%)

Return strictly valid JSON with this exact structure:
{
  "framing": {
    "statement": "2-3 sentences synthesizing root causes, daily operational friction, and business drag",
    "impact": [
      { "metric": "string (Specific domain metric name)", "value": "string (e.g. -48%, +34%, 99.2%, 4.2x, ₹18.4L)" },
      { "metric": "string (Specific domain metric name)", "value": "string" },
      { "metric": "string (Specific domain metric name)", "value": "string" },
      { "metric": "string (Specific domain metric name)", "value": "string" }
    ],
    "rootCauses": [
      { "title": "string", "detail": "string" },
      { "title": "string", "detail": "string" },
      { "title": "string", "detail": "string" }
    ],
    "constraints": [ "string", "string", "string" ]
  },
  "solution": {
    "headline": "Compelling, specific architectural solution title tailored to ${businessName}",
    "summary": "2-3 sentences detailing the target architecture, resolution layer, and automation workflow",
    "pillars": [
      { "title": "string", "detail": "string" },
      { "title": "string", "detail": "string" },
      { "title": "string", "detail": "string" },
      { "title": "string", "detail": "string" }
    ],
    "tradeoffs": [
      { "option": "string", "verdict": "Rejected" or "Recommended" or "Deferred", "why": "string" },
      { "option": "string", "verdict": "Rejected" or "Recommended" or "Deferred", "why": "string" },
      { "option": "string", "verdict": "Rejected" or "Recommended" or "Deferred", "why": "string" }
    ]
  },
  "modules": [
    {
      "key": "mod-1",
      "name": "string",
      "description": "string",
      "icon": "Users" or "Building2" or "Clock" or "BarChart3",
      "status": "Core",
      "timeTag": "Invest",
      "features": ["string", "string", "string"]
    },
    {
      "key": "mod-2",
      "name": "string",
      "description": "string",
      "icon": "Building2",
      "status": "Core",
      "timeTag": "Invest",
      "features": ["string", "string", "string"]
    },
    {
      "key": "mod-3",
      "name": "string",
      "description": "string",
      "icon": "Clock",
      "status": "Recommended",
      "timeTag": "Migrate",
      "features": ["string", "string", "string"]
    },
    {
      "key": "mod-4",
      "name": "string",
      "description": "string",
      "icon": "BarChart3",
      "status": "Recommended",
      "timeTag": "Invest",
      "features": ["string", "string", "string"]
    },
    {
      "key": "mod-legacy",
      "name": "Legacy Manual Spreadsheets & Ad-hoc Workflows",
      "description": "Disparate, untracked manual coordination with zero auditability.",
      "icon": "Clock",
      "status": "Optional",
      "timeTag": "Eliminate",
      "features": ["High error rate", "Decommission planned in Phase 2", "Data fragmentation"]
    }
  ],
  "buildBuyMatrix": [
    {
      "option": "Custom Cloud-Native Build (Tailored Microservices)",
      "verdict": "Recommended",
      "cost": 4,
      "speed": 3,
      "control": 5,
      "fit": 5,
      "rationale": "High long-term differentiation and complete workflow ownership for ${businessName}."
    },
    {
      "option": "Generic Off-the-Shelf SaaS Tool",
      "verdict": "Viable",
      "cost": 2,
      "speed": 5,
      "control": 2,
      "fit": 2,
      "rationale": "Fast initial setup but limited custom field extensibility and high subscription lock-in."
    },
    {
      "option": "BizzMitra AI Hybrid Platform (Custom Micro-Apps + AI Copilots)",
      "verdict": "Recommended",
      "cost": 5,
      "speed": 4,
      "control": 5,
      "fit": 5,
      "rationale": "Optimal blend of rapid time-to-value, automated workflows, and enterprise compliance."
    }
  ]
}`;

      let llmResult: any;
      try {
        llmResult = await callLlmJson(
          prompt,
          "You are an Elite Enterprise Business Architect. Return strictly valid JSON containing deeply customized impact metrics, problem framing, and solution modules tailored to the business.",
          1500,
          8000
        );
      } catch (llmErr) {
        console.warn("[api/ai/solution-framing] LLM provider error/rate-limited, using domain fallback:", llmErr);
      }

      if (llmResult?.success && llmResult.data?.framing) {
        return jsonResponse({
          success: true,
          modelUsed: llmResult.modelUsed,
          source: llmResult.source,
          framing: llmResult.data.framing,
          solution: llmResult.data.solution,
          modules: llmResult.data.modules,
          buildBuyMatrix: llmResult.data.buildBuyMatrix,
        });
      }

      return jsonResponse({ error: "AI inference rate-limited or unavailable" }, 503);
    } catch (err: any) {
      console.error("[api/ai/solution-framing error]:", err);
      return jsonResponse({ error: err?.message || "Internal error" }, 500);
    }
  }

  // 5d. Intelligent AI Copilot Chat: POST /api/ai/copilot
  if (pathname === "/api/ai/copilot" && request.method === "POST") {
    try {
      const user = await getAuthenticatedUser(request, supabaseAdmin);
      const body = (await request.json()) as {
        sessionId?: string;
        message: string;
        history?: Array<{ sender: "user" | "assistant"; text: string; bullets?: string[] }>;
        workspaceContext?: {
          workspaceId?: string;
          businessName?: string;
          industry?: string;
          problemStatement?: string;
          discoverySummary?: string;
          diagnosticAnswers?: Array<{ question: string; answer: string }>;
          roadmap?: any;
          currentStage?: string;
        };
        activeModelId?: string;
      };

      const {
        sessionId,
        message = "",
        history = [],
        workspaceContext = {},
        activeModelId = "claude-3-7-sonnet",
      } = body;

      const wsId = workspaceContext.workspaceId;
      let session: any = null;

      // If a sessionId is provided and user is authenticated, check ownership and insert user turn
      if (sessionId && user) {
        const { data: sData } = await supabaseAdmin
          .from("chat_sessions")
          .select("*")
          .eq("id", sessionId)
          .eq("user_id", user.id)
          .maybeSingle();

        if (sData) {
          session = sData;
          await supabaseAdmin.from("chat_messages").insert({
            session_id: sessionId,
            workspace_id: session.workspace_id || wsId,
            user_id: user.id,
            sender: "user",
            text: message,
          });
        }
      }

      const bName = workspaceContext.businessName || "Active Business Workspace";
      const ind = workspaceContext.industry || "General Enterprise";
      const prob = workspaceContext.problemStatement || "Operational workflow and system modernization";
      const roadmapData = workspaceContext.roadmap;

      // Format conversation history for context memory (from client or persisted session)
      let formattedHistory = "";
      if (history && history.length > 0) {
        formattedHistory = history
          .slice(-8)
          .map((m) => `${m.sender === "user" ? "Client" : "Copilot"}: ${m.text}${m.bullets && m.bullets.length ? `\n- ${m.bullets.join("\n- ")}` : ""}`)
          .join("\n\n");
      } else if (sessionId && user) {
        const { data: recentMsgs } = await supabaseAdmin
          .from("chat_messages")
          .select("sender, text, bullets")
          .eq("session_id", sessionId)
          .order("created_at", { ascending: true })
          .limit(8);

        if (recentMsgs && recentMsgs.length > 0) {
          formattedHistory = recentMsgs
            .map((m: any) => `${m.sender === "user" ? "Client" : "Copilot"}: ${m.text}${Array.isArray(m.bullets) && m.bullets.length ? `\n- ${m.bullets.join("\n- ")}` : ""}`)
            .join("\n\n");
        }
      }

      // Format roadmap phases & milestones
      let roadmapSummary = "";
      if (roadmapData && Array.isArray(roadmapData.phases)) {
        roadmapSummary = `Delivery Timeline: ${roadmapData.targetTimelineWeeks || 12} calendar weeks total (${roadmapData.totalPersonDays || 114} person-days total effort across ${roadmapData.phases.length} phases).\nPhases Breakdown:\n` +
          roadmapData.phases.map((p: any) => {
            const startDay = (p.startWeek || 0) * 7 + 1;
            const endDay = ((p.startWeek || 0) + (p.durationWeekCount || 4)) * 7;
            const ms = (p.milestones || []).map((m: any) => `  * Milestone: ${m.title} (${m.deliverable || "Core deliverable"}, ${m.effortDays || 5} effort days)`).join("\n");
            const delivs = (p.criticalDeliverables || []).map((d: any) => `  * Critical Deliverable: ${d}`).join("\n");
            return `Phase ${p.phaseNumber || 1}: ${p.name} (${p.durationWeeks || `Weeks ${(p.startWeek || 0) + 1}–${(p.startWeek || 0) + (p.durationWeekCount || 4)}`}, Days ${startDay}–${endDay})\nObjective: ${p.objective || "System foundation and rollout"}\nDeliverables:\n${delivs}\nMilestones:\n${ms}`;
          }).join("\n\n");
      }

      const prompt = `You are the BizzMitra AI Blueprint Copilot, an elite Principal Enterprise Solution Architect and Strategic Delivery Lead for "${bName}" (${ind}).

Workspace Context:
- Business: ${bName}
- Industry: ${ind}
- Problem Statement: "${prob}"
${workspaceContext.discoverySummary ? `- Discovery Summary: "${workspaceContext.discoverySummary}"` : ""}
${workspaceContext.diagnosticAnswers && workspaceContext.diagnosticAnswers.length > 0 ? `- Strategic Diagnostic Inputs:\n${workspaceContext.diagnosticAnswers.map((a, i) => `  Q${i+1}: ${a.question} -> Answer: ${a.answer}`).join("\n")}` : ""}

Active Execution Roadmap & Rollout Details:
${roadmapSummary || "12-week enterprise phased rollout across Foundation, Core Architecture, and Production Go-Live."}

Conversation History (Context Memory):
${formattedHistory || "(Start of conversation)"}

User's Latest Query:
"${message}"

CRITICAL INSTRUCTIONS (MUST BE ULTRA-CONCISE & TO THE POINT):
1. EXTREME BREVITY (NO BIG OUTPUTS, NO FLUFF):
   - Answer directly and strictly to the point in 1-2 short sentences maximum.
   - For greetings ("hi", "hello", "hey", etc.):
     Set "text" to "Hello! How can I assist with your **${bName}** blueprint today?" and set "bullets": []. DO NOT include any bullets for greetings!
   - If the user asks for specific tasks or daily work (e.g. "what is the work to do on day 7"):
     Set "text" to "On **Day 7** (Phase 1, Week 1):"
     Provide ONLY 2 short bullet points (max 6-8 words each) with the exact technical tasks.
   - If the user asks for the rollout plan (e.g. "give my rollout plan"):
     Set "text" to "Rollout is **${roadmapData?.targetTimelineWeeks || 12} weeks** across **${roadmapData?.phases?.length || 3} phases**:"
     Provide 1 concise bullet per phase (e.g. "Phase 1: Foundation (Weeks 1–4)").
   - For all other questions: Give a direct 1-sentence answer and leave "bullets": [].

2. OUT-OF-RANGE / OUT-OF-CONTEXT QUESTIONS:
   - If the query is outside business transformation, software architecture, rollout plan, or technical blueprints:
   - Set "isOutOfScope": true.
   - Set "text": "This question is outside my context scope. I am dedicated to **${bName}**'s business transformation, roadmap, and architecture."
   - Set "bullets": [].

Return strictly valid JSON with this exact structure:
{
  "badge": "string (e.g. 'Day 7', 'Rollout Plan', 'Scope Notice')",
  "text": "string (1-2 short sentences max. Supports **bold**)",
  "bullets": ["string"],
  "isOutOfScope": boolean
}`;

      const llmResult = await callLlmJson(
        prompt,
        "You are an ultra-concise enterprise blueprint copilot. Output strictly valid JSON. Keep answers very short, direct, and strictly to the point.",
        250,
        3500
      );

      const replyText = llmResult.data.text || "";
      const replyBadge = llmResult.data.badge || "Blueprint Copilot";
      const replyBullets = Array.isArray(llmResult.data.bullets) && llmResult.data.bullets.length > 0 ? llmResult.data.bullets : [];

      let updatedTitle: string | undefined = undefined;

      // Persist assistant message and auto-title session if needed
      if (sessionId && user && session) {
        await supabaseAdmin.from("chat_messages").insert({
          session_id: sessionId,
          workspace_id: session.workspace_id || wsId,
          user_id: user.id,
          sender: "assistant",
          text: replyText,
          badge: replyBadge,
          bullets: replyBullets,
        });

        // Auto-title if still default "New chat"
        if (session.title === "New chat" || !session.title) {
          const cleanTitle = message.trim().slice(0, 40) + (message.trim().length > 40 ? "…" : "");
          if (cleanTitle) {
            await supabaseAdmin.from("chat_sessions").update({ title: cleanTitle }).eq("id", sessionId);
            updatedTitle = cleanTitle;
          }
        }
      }

      return jsonResponse({
        success: true,
        modelUsed: llmResult.modelUsed,
        source: llmResult.source,
        badge: replyBadge,
        text: replyText,
        bullets: replyBullets,
        isOutOfScope: Boolean(llmResult.data.isOutOfScope),
        sessionId,
        sessionTitle: updatedTitle,
      });
    } catch (err: any) {
      console.error("[api/ai/copilot error]:", err);
      return jsonResponse({ error: err?.message || "Internal error" }, 500);
    }
  }

  // 5d.2 Dynamic AI & Google Translation API: POST /api/translate
  if (pathname === "/api/translate" && request.method === "POST") {
    try {
      const body = (await request.json()) as { texts: string[]; targetLang: string };
      const { texts = [], targetLang = "hi" } = body;

      if (!texts.length || targetLang === "en") {
        return jsonResponse({ success: true, translations: texts });
      }

      // 1. Check if a dedicated Google Cloud Translation API Key is configured
      const googleTranslateKey =
        (env as any)?.GOOGLE_TRANSLATE_API_KEY ||
        (env as any)?.VITE_GOOGLE_TRANSLATE_API_KEY ||
        process.env["GOOGLE_TRANSLATE_API_KEY"] ||
        process.env["VITE_GOOGLE_TRANSLATE_API_KEY"];

      if (googleTranslateKey) {
        try {
          const googleRes = await fetch(
            `https://translation.googleapis.com/language/translate/v2?key=${googleTranslateKey}`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                q: texts,
                target: targetLang,
                format: "text",
              }),
            }
          );
          if (googleRes.ok) {
            const gData = await googleRes.json();
            const translations = (gData?.data?.translations || []).map((t: any) => t.translatedText);
            if (translations.length === texts.length) {
              return jsonResponse({ success: true, source: "google-translate-v2", translations });
            }
          }
        } catch (gErr) {
          console.warn("[/api/translate] Google API error, falling back to LLM pool:", gErr);
        }
      }

      // 2. High-speed LLM Translation Engine (Groq Llama 3.3 / Gemini 2.0 Flash)
      const prompt = `You are a high-speed professional multilingual UI localization engine.
Translate the following array of JSON strings into target language code "${targetLang}" (e.g. "hi"=Hindi, "gu"=Gujarati, "es"=Spanish, "fr"=French, "de"=German, "ja"=Japanese, "ar"=Arabic).

RULES:
1. Translate ALL UI text, column headers, actions, metrics, and labels accurately into the native script.
2. Keep variables, URLs, and numbers intact.
3. Return an array of strings of EXACTLY the same length (${texts.length} items) in the exact same order.

Input Texts:
${JSON.stringify(texts, null, 2)}

Return strictly valid JSON with this exact structure:
{
  "translations": ["translated_text_1", "translated_text_2", ...]
}`;

      const result = await callLlmJson(
        prompt,
        "You are an enterprise translation engine. Return strictly valid JSON with key 'translations'.",
        3000,
        9000
      );

      const translations = Array.isArray(result?.data?.translations) && result.data.translations.length === texts.length
        ? result.data.translations
        : texts;

      return jsonResponse({ success: true, source: result?.source || "llm", translations });
    } catch (err: any) {
      console.warn("[/api/translate error]:", err);
      return jsonResponse({ success: false, error: err?.message || "Translation failed", translations: [] }, 500);
    }
  }

  // 5e. Chat Sessions: GET /api/chat/sessions?workspaceId=... and POST /api/chat/sessions
  if (pathname === "/api/chat/sessions") {
    const user = await getAuthenticatedUser(request, supabaseAdmin);
    if (!user) return jsonResponse({ error: "Unauthorized" }, 401, {}, request);

    if (request.method === "GET") {
      const workspaceId = url.searchParams.get("workspaceId");
      if (!workspaceId) return jsonResponse({ error: "workspaceId is required" }, 400, {}, request);

      const authCheck = await assertWorkspaceOwnership(user.id, workspaceId, supabaseAdmin);
      if (!authCheck.allowed) {
        return jsonResponse({ error: authCheck.error || "Forbidden: You do not own this workspace" }, 403, {}, request);
      }

      const { data: sessions, error } = await supabaseAdmin
        .from("chat_sessions")
        .select("*")
        .eq("workspace_id", workspaceId)
        .eq("user_id", user.id)
        .order("is_pinned", { ascending: false })
        .order("updated_at", { ascending: false });

      if (error) return jsonResponse({ error: error.message }, 500, {}, request);
      return jsonResponse({ success: true, sessions: sessions || [] }, 200, {}, request);
    }

    if (request.method === "POST") {
      try {
        const body = (await request.json()) as { workspaceId: string; title?: string; isPinned?: boolean };
        const { workspaceId, title, isPinned } = body;
        if (!workspaceId) return jsonResponse({ error: "workspaceId is required" }, 400, {}, request);

        const authCheck = await assertWorkspaceOwnership(user.id, workspaceId, supabaseAdmin);
        if (!authCheck.allowed) {
          return jsonResponse({ error: authCheck.error || "Forbidden: You do not own this workspace" }, 403, {}, request);
        }

        const { data: newSession, error } = await supabaseAdmin
          .from("chat_sessions")
          .insert({
            workspace_id: workspaceId,
            user_id: user.id,
            title: title?.trim() || "New chat",
            is_pinned: Boolean(isPinned),
          })
          .select()
          .single();

        if (error) return jsonResponse({ error: error.message }, 500, {}, request);
        return jsonResponse({ success: true, session: newSession }, 201, {}, request);
      } catch (err: any) {
        return jsonResponse({ error: err?.message || "Internal error" }, 500, {}, request);
      }
    }
  }

  // 5f. Chat Session Messages & Details: /api/chat/sessions/:id/...
  if (pathname.startsWith("/api/chat/sessions/")) {
    const user = await getAuthenticatedUser(request, supabaseAdmin);
    if (!user) return jsonResponse({ error: "Unauthorized" }, 401, {}, request);

    const subPath = pathname.replace("/api/chat/sessions/", "");

    // GET /api/chat/sessions/:id/messages
    if (subPath.endsWith("/messages") && request.method === "GET") {
      const sessionId = subPath.replace("/messages", "").trim();
      if (!sessionId) return jsonResponse({ error: "sessionId is required" }, 400, {}, request);

      // Verify user owns the session
      const { data: session, error: sErr } = await supabaseAdmin
        .from("chat_sessions")
        .select("id, workspace_id")
        .eq("id", sessionId)
        .eq("user_id", user.id)
        .maybeSingle();

      if (sErr || !session) {
        return jsonResponse({ error: "Chat session not found or access denied" }, 404, {}, request);
      }

      const { data: messages, error } = await supabaseAdmin
        .from("chat_messages")
        .select("*")
        .eq("session_id", sessionId)
        .eq("user_id", user.id)
        .order("created_at", { ascending: true });

      if (error) return jsonResponse({ error: error.message }, 500, {}, request);
      return jsonResponse({ success: true, messages: messages || [] }, 200, {}, request);
    }

    // PATCH /api/chat/sessions/:id (Rename or pin)
    if (request.method === "PATCH") {
      const sessionId = subPath.trim();
      try {
        const body = (await request.json()) as { title?: string; isPinned?: boolean };
        const updates: Record<string, any> = { updated_at: new Date().toISOString() };
        if (typeof body.title === "string") updates.title = body.title.trim();
        if (typeof body.isPinned === "boolean") updates.is_pinned = body.isPinned;

        const { data: updatedSession, error } = await supabaseAdmin
          .from("chat_sessions")
          .update(updates)
          .eq("id", sessionId)
          .eq("user_id", user.id)
          .select()
          .single();

        if (error) return jsonResponse({ error: error.message }, 500, {}, request);
        return jsonResponse({ success: true, session: updatedSession }, 200, {}, request);
      } catch (err: any) {
        return jsonResponse({ error: err?.message || "Internal error" }, 500, {}, request);
      }
    }

    // DELETE /api/chat/sessions/:id
    if (request.method === "DELETE") {
      const sessionId = subPath.trim();
      const { error } = await supabaseAdmin
        .from("chat_sessions")
        .delete()
        .eq("id", sessionId)
        .eq("user_id", user.id);

      if (error) return jsonResponse({ error: error.message }, 500, {}, request);
      return jsonResponse({ success: true, deletedId: sessionId }, 200, {}, request);
    }
  }

  // 6. Documents: GET /api/documents and POST /api/documents/upload
  if (pathname === "/api/documents") {
    const user = await getAuthenticatedUser(request, supabaseAdmin);
    if (!user) return jsonResponse({ error: "Unauthorized" }, 401, {}, request);

    const workspaceId = url.searchParams.get("workspaceId");
    if (!workspaceId) return jsonResponse({ error: "workspaceId is required" }, 400, {}, request);

    const authCheck = await assertWorkspaceOwnership(user.id, workspaceId, supabaseAdmin);
    if (!authCheck.allowed) {
      return jsonResponse({ error: authCheck.error || "Forbidden: You do not own this workspace" }, 403, {}, request);
    }

    const { data: docs, error } = await supabaseAdmin
      .from("uploaded_documents")
      .select("*")
      .eq("workspace_id", workspaceId)
      .order("uploaded_at", { ascending: false });

    if (error) return jsonResponse({ error: error.message }, 500, {}, request);
    return jsonResponse({ success: true, documents: docs || [] }, 200, {}, request);
  }

  // 7. Universal Deliverable Exports: GET /api/export/:format
  if (pathname.startsWith("/api/export/")) {
    const format = pathname.replace("/api/export/", "").toLowerCase();
    const workspaceName = url.searchParams.get("workspaceName") || "Enterprise Transformation";

    if (format === "docx" || format === "doc") {
      const docHtml = exportToWordDocHtml(workspaceName);
      return new Response(docHtml, {
        headers: {
          "content-type": "application/msword",
          "content-disposition": `attachment; filename="${workspaceName.replace(/\s+/g, "_")}_Blueprint.doc"`,
        },
      });
    }

    if (format === "xlsx" || format === "csv") {
      const csvData = generateExcelCsvContent();
      return new Response(csvData, {
        headers: {
          "content-type": "text/csv; charset=utf-8",
          "content-disposition": `attachment; filename="${workspaceName.replace(/\s+/g, "_")}_Data.csv"`,
        },
      });
    }

    if (format === "openapi" || format === "json") {
      const openapiJson = generateOpenApiJson(workspaceName);
      return new Response(openapiJson, {
        headers: {
          "content-type": "application/json",
          "content-disposition": `attachment; filename="${workspaceName.replace(/\s+/g, "_")}_OpenAPI.json"`,
        },
      });
    }

    if (format === "sql" || format === "ddl") {
      const sqlDdl = generatePostgreSqlDdl();
      return new Response(sqlDdl, {
        headers: {
          "content-type": "text/plain; charset=utf-8",
          "content-disposition": `attachment; filename="${workspaceName.replace(/\s+/g, "_")}_Schema.sql"`,
        },
      });
    }

    if (format === "markdown" || format === "md") {
      const mdSpec = generateTechnicalSpecMarkdown(workspaceName);
      return new Response(mdSpec, {
        headers: {
          "content-type": "text/markdown; charset=utf-8",
          "content-disposition": `attachment; filename="${workspaceName.replace(/\s+/g, "_")}_Spec.md"`,
        },
      });
    }

    return jsonResponse({ error: `Unsupported export format: ${format}` }, 400);
  }

  // 8. Notifications list /api/notifications
  if (pathname === "/api/notifications") {
    const user = await getAuthenticatedUser(request, supabaseAdmin);
    if (!user) return jsonResponse({ error: "Unauthorized" }, 401);

    const notifications = [
      {
        id: "notif-1",
        title: "AI Blueprint Generated",
        message: "Your cloud architecture & BPMN diagrams are ready for review.",
        timestamp: "5 minutes ago",
        read: false,
        type: "success",
      },
      {
        id: "notif-2",
        title: "Compliance Governance Passed",
        message: "DPDP Act data retention audit completed with 94% confidence score.",
        timestamp: "1 hour ago",
        read: true,
        type: "info",
      },
      {
        id: "notif-3",
        title: "New Stakeholder Sign-Off",
        message: "Solution Architect signed off on PostgreSQL 16 DDL migration.",
        timestamp: "Yesterday",
        read: true,
        type: "approval",
      },
    ];

    return jsonResponse({ success: true, notifications });
  }

  return null;
}
