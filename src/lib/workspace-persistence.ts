import { supabase } from "@/integrations/supabase/client";

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
}

/**
 * Restores a user's active workspace and context from Supabase or user-scoped cache
 * whenever the user logs in, re-authenticates, or switches accounts.
 */
export async function restoreUserActiveWorkspace(userId: string): Promise<boolean> {
  if (!userId) return false;

  // 1. First check user-scoped local cache for instant zero-latency UI hydrate
  try {
    const cachedRaw = localStorage.getItem(`bizzmitra.user_workspaces_${userId}`);
    if (cachedRaw) {
      const cached = JSON.parse(cachedRaw);
      if (cached && cached.activeId && cached.context) {
        localStorage.setItem("bizzmitra.activeWorkspaceId", cached.activeId);
        localStorage.setItem("bizzmitra.workspaceContext", JSON.stringify(cached.context));
        if (cached.context.language) {
          localStorage.setItem("bizzmitra.language", cached.context.language);
        }
        window.dispatchEvent(new CustomEvent("bizzmitra:workspace-updated"));
      }
    }
  } catch {}

  // 2. Query Supabase for real-time authoritative workspace list
  try {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userId);
    let query = supabase
      .from("workspaces")
      .select("id, name, problem_statement, industry, goals, constraints_text, intake_mode, intake_method, language_code, workspace_context, updated_at");

    if (isUuid) {
      query = query.eq("owner_id", userId);
    }

    const { data: wsList, error } = await query.order("updated_at", { ascending: false });

    if (!error && wsList && wsList.length > 0) {
      const currentActiveId = localStorage.getItem("bizzmitra.activeWorkspaceId");
      const matched = wsList.find((w) => w.id === currentActiveId) || wsList[0];

      if (matched) {
        const storedCtx =
          matched.workspace_context && typeof matched.workspace_context === "object"
            ? (matched.workspace_context as Record<string, unknown>)
            : null;

        const restoredContext: WorkspaceContextData = {
          businessName: (storedCtx?.["businessName"] as string) || matched.name || "Enterprise Workspace",
          name: matched.name || "Enterprise Workspace",
          problemStatement: (storedCtx?.["problemStatement"] as string) || matched.problem_statement || "",
          description: (storedCtx?.["description"] as string) || matched.problem_statement || "",
          industry: (storedCtx?.["industry"] as string) || matched.industry || "Cross-Industry Transformation",
          goals: (storedCtx?.["goals"] as string) || matched.goals || "",
          constraints: (storedCtx?.["constraints"] as string) || matched.constraints_text || "",
          intakeMode: (storedCtx?.["intakeMode"] as string) || matched.intake_mode || "consult",
          intakeMethod: (storedCtx?.["intakeMethod"] as string) || matched.intake_method || "prompt",
          language: (storedCtx?.["language"] as string) || matched.language_code || "en",
          sourceDetails: (storedCtx?.["sourceDetails"] as Record<string, unknown>) || {},
        };

        localStorage.setItem("bizzmitra.activeWorkspaceId", matched.id);
        localStorage.setItem("bizzmitra.activeWorkspaceName", matched.name);
        localStorage.setItem("bizzmitra.workspaceContext", JSON.stringify(restoredContext));
        if (restoredContext.language) {
          localStorage.setItem("bizzmitra.language", restoredContext.language);
        }

        // Cache for this user
        localStorage.setItem(
          `bizzmitra.user_workspaces_${userId}`,
          JSON.stringify({
            activeId: matched.id,
            activeName: matched.name,
            context: restoredContext,
            list: wsList.map((w) => ({ id: w.id, name: w.name })),
          }),
        );

        window.dispatchEvent(new CustomEvent("bizzmitra:workspace-updated"));
        return true;
      }
    }
  } catch (err) {
    console.warn("[restoreUserActiveWorkspace error]:", err);
  }

  return false;
}
