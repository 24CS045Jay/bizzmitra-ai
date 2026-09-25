import { supabase } from "@/integrations/supabase/client";
import { completeDiscoveryAndUnlockAll } from "@/lib/workspace-stage-gate";

export interface WorkspaceContextData {
  businessName: string;
  name?: string;
  problemStatement: string;
  description?: string;
  industry: string;
  goals: string;
  constraints: string;
  intakeMode?: string;
  intakeMethod?: string;
  language?: string;
  sourceDetails?: Record<string, unknown>;
  createdAt?: string;
  discoveryCompleted?: boolean;
  discoveryAnswers?: Array<{
    question: string;
    answer: string;
    hint?: string;
    missingEntity?: string;
  }>;
  discoveryQuestions?: any[];
  discoverySummary?: string;
  businessAnalysis?: any;
  lastUpdated?: string;
  regenerateVersion?: number;
}

/**
 * Helper to reliably persist active workspace selection across localStorage,
 * user-scoped cache, stage-gate unlock status, and event listeners.
 */
export function saveActiveWorkspaceLocally(
  workspaceId: string,
  workspaceName: string,
  context: Partial<WorkspaceContextData> & Record<string, any>,
  userId?: string | null,
): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem("bizzmitra.activeWorkspaceId", workspaceId);
    localStorage.setItem("bizzmitra.activeWorkspaceName", workspaceName);
    localStorage.setItem("bizzmitra.workspaceContext", JSON.stringify(context));

    if (context["language"]) {
      localStorage.setItem("bizzmitra.language", String(context["language"]));
    }

    if (context["discoveryCompleted"] === true) {
      completeDiscoveryAndUnlockAll(workspaceId, context);
    }

    if (userId) {
      const cacheKey = `bizzmitra.user_workspaces_${userId}`;
      const raw = localStorage.getItem(cacheKey);
      let list: any[] = [];
      if (raw) {
        try {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed?.list)) list = parsed.list;
        } catch {}
      }
      localStorage.setItem(
        cacheKey,
        JSON.stringify({
          activeId: workspaceId,
          activeName: workspaceName,
          context,
          list,
        }),
      );
    }

    window.dispatchEvent(new CustomEvent("bizzmitra:workspace-updated", { detail: context }));
    window.dispatchEvent(
      new CustomEvent("bizzmitra:workspace-changed", {
        detail: { workspaceId, workspaceName, context },
      }),
    );
  } catch (e) {
    console.warn("[saveActiveWorkspaceLocally error]:", e);
  }
}

/**
 * Restores a user's active workspace and context from Supabase or user-scoped cache
 * whenever the user logs in, re-authenticates, or switches accounts.
 */
export async function restoreUserActiveWorkspace(userId: string): Promise<boolean> {
  if (!userId) return false;

  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userId);
  const isTest = userId === "demo-admin-id";

  if (!isUuid && !isTest) {
    return false;
  }

  const existingActiveId =
    typeof localStorage !== "undefined"
      ? localStorage.getItem("bizzmitra.activeWorkspaceId")
      : null;

  // 1. First check user-scoped local cache for instant zero-latency UI hydrate
  try {
    const cachedRaw = localStorage.getItem(`bizzmitra.user_workspaces_${userId}`);
    if (cachedRaw) {
      const cached = JSON.parse(cachedRaw);
      // Only hydrate cached workspace if no activeWorkspaceId was set or if existingActiveId matches cached.activeId
      if (cached && cached.context) {
        if (!existingActiveId || existingActiveId === cached.activeId) {
          localStorage.setItem("bizzmitra.activeWorkspaceId", cached.activeId);
          localStorage.setItem(
            "bizzmitra.activeWorkspaceName",
            cached.activeName || cached.context.businessName || "Enterprise Workspace",
          );
          localStorage.setItem("bizzmitra.workspaceContext", JSON.stringify(cached.context));
          if (cached.context.language) {
            localStorage.setItem("bizzmitra.language", cached.context.language);
          }
          if (cached.context.discoveryCompleted === true) {
            completeDiscoveryAndUnlockAll(cached.activeId, cached.context);
          }
          window.dispatchEvent(
            new CustomEvent("bizzmitra:workspace-updated", { detail: cached.context }),
          );
          window.dispatchEvent(
            new CustomEvent("bizzmitra:workspace-changed", {
              detail: { workspaceId: cached.activeId, context: cached.context },
            }),
          );
        }
      }
    }
  } catch {}

  // 2. Authoritative Database Fetch (Try Supabase Client first, then /api/workspaces server route)
  try {
    let wsList: any[] = [];

    // 2a. Direct Supabase Query
    try {
      let query = supabase
        .from("workspaces")
        .select(
          "id, name, problem_statement, industry, goals, constraints_text, intake_mode, intake_method, language_code, workspace_context, maturity_score, updated_at",
        );

      if (isUuid) {
        query = query.eq("owner_id", userId);
      }

      const { data, error } = await query.order("updated_at", { ascending: false });
      if (!error && data && data.length > 0) {
        wsList = data;
      }
    } catch (dbErr) {
      console.warn("[restoreUserActiveWorkspace Supabase client error]:", dbErr);
    }

    // 2b. Server API fallback using service-role if client returned empty
    if (wsList.length === 0) {
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        const token = sessionData?.session?.access_token;
        const authBearer = token ? `Bearer ${token}` : "";

        if (authBearer) {
          const apiRes = await fetch("/api/workspaces", {
            headers: { Authorization: authBearer },
          });
          if (apiRes.ok) {
            const json = await apiRes.json();
            if (json.success && Array.isArray(json.workspaces) && json.workspaces.length > 0) {
              wsList = json.workspaces;
            }
          }
        }
      } catch (apiErr) {
        console.warn("[restoreUserActiveWorkspace API fallback error]:", apiErr);
      }
    }

    if (wsList && wsList.length > 0) {
      const currentActiveId = localStorage.getItem("bizzmitra.activeWorkspaceId");
      // Find the workspace explicitly matching currentActiveId, or fallback to wsList[0]
      const matched =
        (currentActiveId && wsList.find((w) => w.id === currentActiveId)) || wsList[0];

      if (matched) {
        const storedCtx =
          matched.workspace_context && typeof matched.workspace_context === "object"
            ? (matched.workspace_context as Record<string, unknown>)
            : null;

        const isDiscoveryDone = Boolean(
          storedCtx?.["discoveryCompleted"] === true ||
          storedCtx?.["discoveryAnswers"] ||
          (matched.maturity_score && matched.maturity_score >= 80),
        );

        const restoredContext: WorkspaceContextData = {
          businessName:
            (storedCtx?.["businessName"] as string) || matched.name || "Enterprise Workspace",
          name: matched.name || "Enterprise Workspace",
          problemStatement:
            (storedCtx?.["problemStatement"] as string) || matched.problem_statement || "",
          description: (storedCtx?.["description"] as string) || matched.problem_statement || "",
          industry:
            (storedCtx?.["industry"] as string) ||
            matched.industry ||
            "Cross-Industry Transformation",
          goals: (storedCtx?.["goals"] as string) || matched.goals || "",
          constraints: (storedCtx?.["constraints"] as string) || matched.constraints_text || "",
          intakeMode: (storedCtx?.["intakeMode"] as string) || matched.intake_mode || "consult",
          intakeMethod:
            (storedCtx?.["intakeMethod"] as string) || matched.intake_method || "prompt",
          language: (storedCtx?.["language"] as string) || matched.language_code || "en",
          sourceDetails: (storedCtx?.["sourceDetails"] as Record<string, unknown>) || {},
          discoveryCompleted: isDiscoveryDone,
          discoveryAnswers: storedCtx?.["discoveryAnswers"] as any,
          discoveryQuestions: storedCtx?.["discoveryQuestions"] as any,
          discoverySummary: storedCtx?.["discoverySummary"] as any,
          businessAnalysis: storedCtx?.["businessAnalysis"] as any,
        };

        saveActiveWorkspaceLocally(
          matched.id,
          matched.name,
          restoredContext as Record<string, any>,
          userId,
        );

        // Also cache list of workspace headers
        const cacheKey = `bizzmitra.user_workspaces_${userId}`;
        const raw = localStorage.getItem(cacheKey);
        if (raw) {
          try {
            const parsed = JSON.parse(raw);
            parsed.list = wsList.map((w) => ({ id: w.id, name: w.name }));
            localStorage.setItem(cacheKey, JSON.stringify(parsed));
          } catch {}
        }

        return true;
      }
    } else {
      // User has no workspaces in Supabase yet - clear stale demo workspace if present
      localStorage.removeItem(`bizzmitra.user_workspaces_${userId}`);
      const curId = localStorage.getItem("bizzmitra.activeWorkspaceId");
      const curName = localStorage.getItem("bizzmitra.activeWorkspaceName") || "";
      if (curId === "ws-talentcraft-default" || curName.toLowerCase().includes("talentcraft") || !isTest) {
        localStorage.removeItem("bizzmitra.activeWorkspaceId");
        localStorage.removeItem("bizzmitra.activeWorkspaceName");
        localStorage.removeItem("bizzmitra.workspaceContext");
        if (typeof window !== "undefined") {
          window.dispatchEvent(new Event("bizzmitra:workspace-changed"));
        }
      }
    }
  } catch (err) {
    console.warn("[restoreUserActiveWorkspace error]:", err);
  }

  return false;
}

export function clearStaleDemoWorkspace() {
  if (typeof window === "undefined") return;
  try {
    const curId = localStorage.getItem("bizzmitra.activeWorkspaceId");
    const curName = localStorage.getItem("bizzmitra.activeWorkspaceName") || "";
    const curCtx = localStorage.getItem("bizzmitra.workspaceContext") || "";
    if (
      curId === "ws-talentcraft-default" ||
      curName.toLowerCase().includes("talentcraft") ||
      curCtx.toLowerCase().includes("talentcraft")
    ) {
      localStorage.removeItem("bizzmitra.activeWorkspaceId");
      localStorage.removeItem("bizzmitra.activeWorkspaceName");
      localStorage.removeItem("bizzmitra.workspaceContext");
      localStorage.removeItem("bizzmitra.discoveryData");
      localStorage.removeItem("bizzmitra.solutionData");
      window.dispatchEvent(new Event("bizzmitra:workspace-changed"));
    }
  } catch {}
}

