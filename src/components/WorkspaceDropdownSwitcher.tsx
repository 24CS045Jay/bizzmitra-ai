import * as React from "react";
import { useNavigate } from "@tanstack/react-router";
import {
  ChevronDown,
  Check,
  Plus,
  LayoutGrid,
  Sparkles,
  Building2,
  Lock,
  ArrowRight,
  Layers,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth, isTestingAccount } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useTranslation } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { completeDiscoveryAndUnlockAll } from "@/lib/workspace-stage-gate";
import { useWorkspaceLimit } from "@/lib/workspace-plan-limit";
import { saveActiveWorkspaceLocally } from "@/lib/workspace-persistence";
import { WorkspaceUpgradeModal } from "@/components/WorkspaceUpgradeModal";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export interface WorkspaceRecord {
  id: string;
  name: string;
  industry?: string | null;
  problem_statement?: string | null;
  goals?: string | null;
  constraints_text?: string | null;
  intake_mode?: string | null;
  intake_method?: string | null;
  language_code?: string | null;
  workspace_context?: Record<string, unknown> | null;
  status?: string | null;
  maturity_score?: number | null;
  created_at?: string | null;
  updated_at?: string | null;
}

interface WorkspaceDropdownSwitcherProps {
  onNavigate?: (() => void) | undefined;
  className?: string | undefined;
  variant?: ("sidebar" | "compact") | undefined;
}

export function WorkspaceDropdownSwitcher({
  onNavigate,
  className = "",
  variant = "sidebar",
}: WorkspaceDropdownSwitcherProps) {
  const { user } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const isTest = isTestingAccount(user?.email);
  const {
    isLimitReached,
    isBasicPlan,
    tier,
    workspaceCount,
    refresh: refreshLimit,
  } = useWorkspaceLimit();

  const [isOpen, setIsOpen] = React.useState(false);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = React.useState(false);
  const [workspaces, setWorkspaces] = React.useState<WorkspaceRecord[]>([]);
  const [loading, setLoading] = React.useState(true);

  // Active workspace info state
  const [activeWsId, setActiveWsId] = React.useState<string | null>(null);
  const [activeWsInfo, setActiveWsInfo] = React.useState<{
    name: string;
    industry: string;
    mode: string;
  }>({
    name: isTest ? "TalentCraft HR Consultancy" : "Loading Workspace...",
    industry: isTest ? "HR & Recruitment Services" : "Initializing...",
    mode: "consult",
  });

  const loadWorkspaces = React.useCallback(async () => {
    let list: WorkspaceRecord[] = [];

    if (user?.id) {
      try {
        let query = supabase
          .from("workspaces")
          .select(
            "id, name, problem_statement, industry, goals, constraints_text, intake_mode, language_code, workspace_context, status, maturity_score, created_at, updated_at",
          );

        if (!isTest) {
          query = query.eq("owner_id", user.id);
        }

        const { data, error } = await query.order("updated_at", { ascending: false });
        if (!error && data && data.length > 0) {
          list = data as WorkspaceRecord[];
        }
      } catch (err) {
        console.warn("Direct Supabase workspaces fetch note:", err);
      }

      // Fallback via /api/workspaces if needed
      if (list.length === 0) {
        try {
          const { data: sessionData } = await supabase.auth.getSession();
          const token = sessionData?.session?.access_token;
          const authBearer = token ? `Bearer ${token}` : isTest ? "Bearer demo-token-bypass" : "";
          if (authBearer) {
            const apiRes = await fetch("/api/workspaces", {
              headers: { Authorization: authBearer },
            });
            if (apiRes.ok) {
              const apiJson = await apiRes.json();
              if (apiJson.success && Array.isArray(apiJson.workspaces)) {
                list = apiJson.workspaces as WorkspaceRecord[];
              }
            }
          }
        } catch {}
      }
    }

    // Read active ID and local storage context
    const currentActiveId =
      typeof window !== "undefined"
        ? window.localStorage.getItem("bizzmitra.activeWorkspaceId")
        : null;
    const rawLocalCtx =
      typeof window !== "undefined"
        ? window.localStorage.getItem("bizzmitra.workspaceContext")
        : null;
    let localParsed: Record<string, any> | null = null;
    if (rawLocalCtx) {
      try {
        localParsed = JSON.parse(rawLocalCtx);
      } catch {}
    }

    // If no workspaces in database but local context exists, create a virtual workspace item
    if (list.length === 0) {
      if (localParsed?.["businessName"] || isTest) {
        const demoWs: WorkspaceRecord = {
          id: currentActiveId || (isTest ? "ws-talentcraft-default" : "local-workspace"),
          name:
            (localParsed?.["businessName"] as string) ||
            (isTest ? "TalentCraft HR Consultancy" : "My Workspace"),
          industry:
            (localParsed?.["industry"] as string) ||
            (isTest ? "HR & Recruitment Services" : "Custom Industry"),
          problem_statement: (localParsed?.["problemStatement"] as string) || "",
          intake_mode: (localParsed?.["intakeMode"] as string) || "consult",
          workspace_context: localParsed || {},
          maturity_score: 85,
          status: "active",
        };
        list = [demoWs];
      }
    }

    setWorkspaces(list);

    // Determine current active workspace
    const found = (currentActiveId && list.find((w) => w.id === currentActiveId)) || list[0];
    if (found) {
      const storedCtx =
        found.workspace_context && typeof found.workspace_context === "object"
          ? (found.workspace_context as Record<string, unknown>)
          : localParsed;

      const bName = (storedCtx?.["businessName"] as string) || found.name || "Custom Workspace";
      const ind = (storedCtx?.["industry"] as string) || found.industry || "General";
      const intakeMode = (storedCtx?.["intakeMode"] as string) || found.intake_mode || "consult";

      setActiveWsId(found.id);
      setActiveWsInfo({
        name: bName,
        industry: ind,
        mode: intakeMode,
      });

      if (typeof window !== "undefined") {
        window.localStorage.setItem("bizzmitra.activeWorkspaceId", found.id);
        window.localStorage.setItem("bizzmitra.activeWorkspaceName", bName);
      }
    } else {
      setActiveWsId(null);
      setActiveWsInfo({
        name: isTest ? "TalentCraft HR Consultancy" : "No Active Workspace",
        industry: isTest ? "HR & Recruitment Services" : "Create intake to begin",
        mode: "consult",
      });
    }

    setLoading(false);
  }, [user, isTest]);

  // Initial load and event listeners for real-time reactivity
  React.useEffect(() => {
    void loadWorkspaces();

    const handleUpdate = () => {
      void loadWorkspaces();
    };

    window.addEventListener("bizzmitra:workspace-updated", handleUpdate);
    window.addEventListener("bizzmitra:workspace-changed", handleUpdate);
    window.addEventListener("bizzmitra:wallet-changed", handleUpdate);
    window.addEventListener("storage", handleUpdate);

    return () => {
      window.removeEventListener("bizzmitra:workspace-updated", handleUpdate);
      window.removeEventListener("bizzmitra:workspace-changed", handleUpdate);
      window.removeEventListener("bizzmitra:wallet-changed", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, [loadWorkspaces]);

  const handleSelectWorkspace = (ws: WorkspaceRecord) => {
    setIsOpen(false);
    if (ws.id === activeWsId) {
      onNavigate?.();
      return;
    }

    const storedCtx =
      ws.workspace_context && typeof ws.workspace_context === "object"
        ? (ws.workspace_context as Record<string, unknown>)
        : null;

    const isCompleted =
      storedCtx?.["discoveryCompleted"] === true ||
      (storedCtx?.["discoveryAnswers"] &&
        Array.isArray(storedCtx["discoveryAnswers"]) &&
        storedCtx["discoveryAnswers"].length > 0);

    const bName = (storedCtx?.["businessName"] as string) || ws.name || "Custom Workspace";
    const ind = (storedCtx?.["industry"] as string) || ws.industry || "General";
    const prob = (storedCtx?.["problemStatement"] as string) || ws.problem_statement || "";
    const intakeMode = (storedCtx?.["intakeMode"] as string) || ws.intake_mode || "consult";

    const fullCtx: Record<string, any> = {
      ...(storedCtx || {}),
      businessName: bName,
      problemStatement: prob,
      industry: ind,
      intakeMode,
      discoveryCompleted: Boolean(isCompleted),
    };

    saveActiveWorkspaceLocally(ws.id, bName, fullCtx, user?.id);

    setActiveWsId(ws.id);
    setActiveWsInfo({
      name: bName,
      industry: ind,
      mode: intakeMode,
    });

    toast.success(`Switched to "${bName}"`);
    onNavigate?.();
    // Navigate to dashboard to load new workspace context
    void navigate({ to: "/dashboard" });
  };

  const handleCreateNewClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsOpen(false);

    if (isLimitReached) {
      setIsUpgradeModalOpen(true);
      return;
    }

    onNavigate?.();
    navigate({ to: "/workspace/new" });
  };

  const handleManageClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsOpen(false);
    onNavigate?.();
    navigate({ to: "/dashboard" });
  };

  return (
    <>
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className={cn(
              "group relative w-full text-left neu-sm neu-press flex cursor-pointer items-center justify-between gap-2.5 rounded-xl border border-border/70 bg-card p-2.5 shadow-xs transition-all hover:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/40",
              isOpen && "border-primary ring-1 ring-primary/40 bg-card/90",
              className,
            )}
            title="Click arrow to switch workspace"
          >
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">
                  {t("settings.workspace", "WORKSPACE NAME")}
                </span>
                <span className="neu-sm px-1.5 py-0.2 text-[8px] font-bold text-primary">
                  {activeWsInfo.mode === "know" ? "Direct" : "AI Guided"}
                </span>
              </div>
              <p className="mt-0.5 text-xs font-semibold leading-tight truncate text-foreground group-hover:text-primary transition-colors">
                {activeWsInfo.name}
              </p>
              <p className="text-[10px] text-muted-foreground truncate">{activeWsInfo.industry}</p>
            </div>

            <ChevronDown
              className={cn(
                "size-3.5 shrink-0 text-muted-foreground transition-transform duration-200 group-hover:text-foreground",
                isOpen && "rotate-180 text-primary",
              )}
            />
          </button>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          align="start"
          sideOffset={6}
          className="w-72 sm:w-80 rounded-xl border border-border/80 bg-card/95 p-1.5 backdrop-blur-xl shadow-2xl z-50 animate-in fade-in-0 zoom-in-95"
        >
          {/* Header Info */}
          <div className="flex items-center justify-between px-2.5 py-2">
            <div className="flex items-center gap-1.5">
              <Layers className="size-3.5 text-primary" />
              <span className="text-xs font-bold tracking-tight text-foreground">Workspaces</span>
            </div>
            <span
              className={cn(
                "rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide",
                isBasicPlan
                  ? "bg-amber-500/10 text-amber-500 border border-amber-500/20"
                  : "bg-primary/10 text-primary border border-primary/20",
              )}
            >
              {isBasicPlan ? "Free (1/1)" : tier || "Pro"}
            </span>
          </div>

          <DropdownMenuSeparator className="my-1 bg-border/60" />

          {/* List of Workspaces */}
          <div className="max-h-60 overflow-y-auto space-y-1 py-1 scrollbar-none">
            {loading ? (
              <div className="px-3 py-2 text-center text-xs text-muted-foreground">
                Loading workspaces...
              </div>
            ) : workspaces.length === 0 ? (
              <div className="px-3 py-3 text-center">
                <p className="text-xs text-muted-foreground">No workspaces created yet.</p>
              </div>
            ) : (
              workspaces.map((ws) => {
                const isActive = ws.id === activeWsId;
                const wsTitle =
                  (ws.workspace_context &&
                    typeof ws.workspace_context === "object" &&
                    (ws.workspace_context as any).businessName) ||
                  ws.name ||
                  "Untitled Workspace";
                const wsIndustry =
                  (ws.workspace_context &&
                    typeof ws.workspace_context === "object" &&
                    (ws.workspace_context as any).industry) ||
                  ws.industry ||
                  "General";

                return (
                  <button
                    key={ws.id}
                    type="button"
                    onClick={() => handleSelectWorkspace(ws)}
                    className={cn(
                      "w-full flex items-center justify-between gap-2.5 rounded-lg px-2.5 py-2 text-left transition-all",
                      isActive
                        ? "bg-primary/15 text-primary font-medium border border-primary/30"
                        : "hover:bg-surface-2 text-foreground/90 hover:text-foreground",
                    )}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <Building2
                          className={cn(
                            "size-3.5 shrink-0",
                            isActive ? "text-primary" : "text-muted-foreground",
                          )}
                        />
                        <p className="text-xs font-semibold truncate leading-tight">{wsTitle}</p>
                      </div>
                      <p className="mt-0.5 text-[10px] text-muted-foreground truncate pl-5">
                        {wsIndustry}
                      </p>
                    </div>

                    {isActive ? (
                      <div className="flex items-center gap-1 shrink-0">
                        <span className="text-[9px] font-bold text-primary uppercase">Active</span>
                        <Check className="size-3.5 text-primary shrink-0" />
                      </div>
                    ) : (
                      typeof ws.maturity_score === "number" &&
                      ws.maturity_score > 0 && (
                        <span className="text-[10px] font-mono text-muted-foreground shrink-0">
                          {ws.maturity_score}%
                        </span>
                      )
                    )}
                  </button>
                );
              })
            )}
          </div>

          <DropdownMenuSeparator className="my-1 bg-border/60" />

          {/* Action: Create New Workspace */}
          <button
            type="button"
            onClick={handleCreateNewClick}
            className="w-full flex items-center justify-between rounded-lg px-2.5 py-2 text-xs font-medium text-foreground/90 hover:bg-surface-2 hover:text-primary transition-all"
          >
            <div className="flex items-center gap-2">
              <Plus className="size-3.5 text-primary" />
              <span>Create New Workspace</span>
            </div>
            {isLimitReached ? (
              <span className="rounded bg-amber-500/10 px-1.5 py-0.5 text-[9px] font-bold text-amber-500 flex items-center gap-1 border border-amber-500/20">
                <Lock className="size-2.5" />
                Upgrade
              </span>
            ) : (
              <ArrowRight className="size-3 text-muted-foreground" />
            )}
          </button>

          {/* Action: Manage in Dashboard */}
          <button
            type="button"
            onClick={handleManageClick}
            className="w-full flex items-center justify-between rounded-lg px-2.5 py-2 text-xs font-medium text-foreground/90 hover:bg-surface-2 hover:text-primary transition-all"
          >
            <div className="flex items-center gap-2">
              <LayoutGrid className="size-3.5 text-muted-foreground" />
              <span>All Workspaces Directory</span>
            </div>
            <ArrowRight className="size-3 text-muted-foreground" />
          </button>

          {/* Free Tier Upgrade Banner */}
          {isBasicPlan && (
            <div className="mt-1 rounded-lg border border-primary/20 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-2">
              <div className="flex items-start justify-between gap-1.5">
                <div>
                  <p className="text-[10px] font-bold text-primary flex items-center gap-1">
                    <Sparkles className="size-3" />
                    Unlock Unlimited Workspaces
                  </p>
                  <p className="text-[9px] text-muted-foreground mt-0.5 leading-tight">
                    Upgrade to Growth Pro to run multi-company blueprints simultaneously.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  setIsUpgradeModalOpen(true);
                }}
                className="mt-2 w-full rounded-md bg-primary py-1 text-center font-display text-[10px] font-bold text-primary-foreground hover:bg-primary/90 transition-all shadow-xs"
              >
                Upgrade to Growth Pro
              </button>
            </div>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <WorkspaceUpgradeModal
        isOpen={isUpgradeModalOpen}
        onClose={() => setIsUpgradeModalOpen(false)}
        workspaceCount={workspaceCount || 1}
        onUpgradeSuccess={() => {
          void refreshLimit();
          void loadWorkspaces();
        }}
      />
    </>
  );
}
