import * as React from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Network,
  Workflow,
  PenTool,
  Users,
  Database,
  Route as RouteIcon,
  Settings,
  LayoutGrid,
  ChevronRight,
  Pin,
  PinOff,
  Zap,
  MessageSquare,
  Boxes,
  LogOut,
  BarChart3,
  GitBranch,
  FileCheck2,
  Package,
  Home,
  ArrowRight,
  ChevronDown,
  Shield,
  Lock,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth, isTestingAccount } from "@/hooks/useAuth";
import { ThemeToggle } from "./ThemeToggle";
import { LanguageSelector } from "./LanguageSelector";
import { useTranslation } from "@/lib/i18n";
import { supabase } from "@/integrations/supabase/client";
import { isSuperAdminEmail } from "@/lib/admin-rbac-data";
import { cn } from "@/lib/utils";
import { isStageUnlocked, getUnlockedStages, WORKSPACE_STAGES, completeDiscoveryAndUnlockAll } from "@/lib/workspace-stage-gate";
import { useWorkspaceLimit } from "@/lib/workspace-plan-limit";
import { WorkspaceUpgradeModal } from "@/components/WorkspaceUpgradeModal";

interface SubMenuItem {
  label: string;
  href: string;
  badge?: string;
}

interface PortalNavItem {
  id: string;
  label: string;
  description: string;
  to: string;
  icon: React.ElementType;
  badge?: string;
  subItems?: SubMenuItem[];
}

interface PortalNavGroup {
  groupName: string;
  items: PortalNavItem[];
}

const PORTAL_GROUPS: PortalNavGroup[] = [
  {
    groupName: "Workspace & Intake",
    items: [
      {
        id: "dashboard",
        label: "Workspaces",
        description: "All projects & blueprints",
        to: "/dashboard",
        icon: LayoutGrid,
        subItems: [
          { label: "Active Projects", href: "/dashboard" },
          { label: "Saved Artifacts", href: "/dashboard" },
        ],
      },
      {
        id: "new-intake",
        label: "New Intake",
        description: "Frame a new business problem",
        to: "/workspace/new",
        icon: Sparkles,
        badge: "New",
        subItems: [
          { label: "Executive Intake Form", href: "/workspace/new" },
          { label: "Quick Problem Prompt", href: "/workspace/new" },
        ],
      },
    ],
  },
  {
    groupName: "Intelligence & Solution",
    items: [
      {
        id: "discovery",
        label: "AI Discovery",
        description: "Guided diagnostic interview",
        to: "/workspace/discovery",
        icon: MessageSquare,
        badge: "AI Agent",
        subItems: [
          { label: "Loss-Tree Diagnostic", href: "/workspace/discovery" },
          { label: "Stakeholder Framing", href: "/workspace/discovery" },
          { label: "Problem Statement", href: "/workspace/discovery" },
        ],
      },
      {
        id: "solution",
        label: "Solution Studio",
        description: "Architectural solution overview",
        to: "/workspace/solution",
        icon: Boxes,
        subItems: [
          { label: "Capability Matrix", href: "/workspace/solution" },
          { label: "Target Architecture", href: "/workspace/solution" },
        ],
      },
      {
        id: "crm",
        label: "Prototype CRM",
        description: "Synthesized workforce & pipeline CRM",
        to: "/workspace/solution/crm",
        icon: Users,
        badge: "CRM",
        subItems: [
          { label: "Live Prototype CRM", href: "/workspace/solution/crm" },
          { label: "Pipeline Funnel", href: "/workspace/solution/crm" },
          { label: "Entity Customizer", href: "/workspace/solution/crm" },
        ],
      },
    ],
  },
  {
    groupName: "Systems & Design",
    items: [
      {
        id: "architecture",
        label: "Architecture",
        description: "5-layer system models & nodes",
        to: "/workspace/architecture",
        icon: Network,
        badge: "5-Layer",
        subItems: [
          { label: "5-Layer Graph", href: "/workspace/architecture" },
          { label: "Component Topology", href: "/workspace/architecture" },
          { label: "Cloud Services Map", href: "/workspace/architecture" },
        ],
      },
      {
        id: "process",
        label: "Process",
        description: "BPMN 2.0 executable lanes",
        to: "/workspace/process",
        icon: Workflow,
        subItems: [
          { label: "BPMN Swimlanes", href: "/workspace/process" },
          { label: "Trigger Matrix", href: "/workspace/process" },
          { label: "Escalation Paths", href: "/workspace/process" },
        ],
      },
      {
        id: "wireframes",
        label: "UX Designer",
        description: "Interactive blueprint screen specs",
        to: "/workspace/wireframes",
        icon: PenTool,
        subItems: [
          { label: "Screen Blueprints", href: "/workspace/wireframes" },
          { label: "User Task Flow", href: "/workspace/wireframes" },
        ],
      },
      {
        id: "data",
        label: "Data & APIs",
        description: "Relational ERD & OpenAPI contracts",
        to: "/workspace/data",
        icon: Database,
        subItems: [
          { label: "ERD Relational Graph", href: "/workspace/data" },
          { label: "Data Dictionary", href: "/workspace/data" },
          { label: "OpenAPI Spec", href: "/workspace/data" },
        ],
      },
    ],
  },
  {
    groupName: "Delivery & Governance",
    items: [
      {
        id: "roadmap",
        label: "Roadmap & ROI",
        description: "Quarterly sprint phasing & investment",
        to: "/workspace/roadmap",
        icon: RouteIcon,
        subItems: [
          { label: "Quarterly Gantt", href: "/workspace/roadmap" },
          { label: "Capex / Opex Model", href: "/workspace/roadmap" },
        ],
      },
      {
        id: "insights",
        label: "Transformation",
        description: "Executive KPI impact metrics",
        to: "/workspace/insights",
        icon: BarChart3,
        subItems: [
          { label: "Executive Summary", href: "/workspace/insights" },
          { label: "ROI Metrics", href: "/workspace/insights" },
        ],
      },
      {
        id: "map",
        label: "Artifact Map",
        description: "Dependency graph & version history",
        to: "/workspace/map",
        icon: GitBranch,
        subItems: [
          { label: "Version Dependency Tree", href: "/workspace/map" },
          { label: "Consistency Audit", href: "/workspace/map" },
        ],
      },
      {
        id: "collaboration",
        label: "Governance & Review",
        description: "Stakeholder approval matrix",
        to: "/workspace/collaboration",
        icon: FileCheck2,
      },
      {
        id: "export",
        label: "Export Center",
        description: "PDF, JSON, Mermaid & code export",
        to: "/workspace/export",
        icon: Package,
      },
      {
        id: "admin",
        label: "Admin Console",
        description: "Tenant & RBAC permission controls",
        to: "/admin",
        icon: Shield,
        badge: "Admin",
      },
      {
        id: "settings",
        label: "Settings",
        description: "Workspace configuration & keys",
        to: "/settings",
        icon: Settings,
      },
    ],
  },
];

export function AppSidebar2({
  onNavigate,
  isPinned: externalPinned,
  onTogglePin,
  className = "",
}: {
  onNavigate?: () => void;
  isPinned?: boolean;
  onTogglePin?: () => void;
  className?: string;
}) {
  const [isHovered, setIsHovered] = React.useState<boolean>(false);
  const [internalPinned, setInternalPinned] = React.useState<boolean>(false);
  const isPinned = externalPinned !== undefined ? externalPinned : internalPinned;

  const togglePinned = () => {
    if (onTogglePin) {
      onTogglePin();
    } else {
      setInternalPinned(!internalPinned);
    }
  };

  const [activeFlyout, setActiveFlyout] = React.useState<string | null>(null);
  const [flyoutPosition, setFlyoutPosition] = React.useState<{ top: number }>({ top: 0 });

  const { user, signOut } = useAuth();
  const { t } = useTranslation();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isSuperAdmin = isSuperAdminEmail(user?.email);

  const { isLimitReached, workspaceCount, refresh: refreshLimit } = useWorkspaceLimit();
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = React.useState(false);

  const getGroupTitle = (name: string) => {
    switch (name) {
      case "Workspace & Intake": return t("group.workspace", name);
      case "Intelligence & Solution": return t("group.intelligence", name);
      case "Systems & Design": return t("group.systems", name);
      case "Delivery & Governance": return t("group.delivery", name);
      case "Execution & Strategy": return t("group.execution", name);
      case "Collaboration & Artifacts": return t("group.collaboration", name);
      case "Governance & Admin": return t("group.governance", name);
      default: return name;
    }
  };

  const getItemLabel = (item: PortalNavItem) => {
    const keyMap: Record<string, string> = {
      dashboard: "nav.dashboard",
      "new-intake": "nav.newIntake",
      discovery: "nav.discovery",
      solution: "nav.solution",
      crm: "nav.crm",
      architecture: "nav.architecture",
      process: "nav.process",
      wireframes: "nav.wireframes",
      data: "nav.data",
      roadmap: "nav.roadmap",
      insights: "nav.insights",
      map: "nav.artifactMap",
      collaboration: "nav.collaboration",
      export: "nav.export",
      admin: "nav.admin",
      settings: "nav.settings",
    };
    const key = keyMap[item.id] || `nav.${item.id}`;
    return t(key, item.label);
  };

  const filteredPortalGroups = React.useMemo(() => {
    return PORTAL_GROUPS.map((group) => ({
      ...group,
      items: group.items.filter((item) => item.id !== "admin" || isSuperAdmin),
    }));
  }, [isSuperAdmin]);

  const isTest = isTestingAccount(user?.email);

  // Active workspace state
  const [activeWs, setActiveWs] = React.useState({
    name: isTest ? "TalentCraft HR Consultancy" : "No Active Workspace",
    industry: isTest ? "HR & Recruitment Services" : "Create new workspace",
    mode: "consult",
    lang: "en",
  });

  const [unlockedStages, setUnlockedStages] = React.useState<string[]>(() => getUnlockedStages());

  React.useEffect(() => {
    const handleStagesUpdate = () => {
      setUnlockedStages(getUnlockedStages());
    };
    window.addEventListener("bizzmitra:stages-updated", handleStagesUpdate);
    window.addEventListener("storage", handleStagesUpdate);
    return () => {
      window.removeEventListener("bizzmitra:stages-updated", handleStagesUpdate);
      window.removeEventListener("storage", handleStagesUpdate);
    };
  }, []);

  React.useEffect(() => {
    if (typeof window === "undefined") return;
    const storedLang = window.localStorage.getItem("bizzmitra.language") || "en";
    const isTestAcc = isTestingAccount(user?.email);

    // 1. Testing account: allow fallback to TalentCraft demo workspace
    if (isTestAcc) {
      const raw = window.localStorage.getItem("bizzmitra.workspaceContext");
      if (raw) {
        try {
          const parsed = JSON.parse(raw);
          setActiveWs({
            name: parsed.businessName || "TalentCraft HR Consultancy",
            industry: parsed.industry || "HR & Recruitment Services",
            mode: parsed.intakeMode || "consult",
            lang: storedLang,
          });
          return;
        } catch {}
      }
      setActiveWs({
        name: "TalentCraft HR Consultancy",
        industry: "HR & Recruitment Services",
        mode: "consult",
        lang: storedLang,
      });
      return;
    }

    // 2. Standard user: Load their own workspace from Supabase
    if (user?.id) {
      supabase
        .from("workspaces")
        .select("id, name, problem_statement, industry, workspace_context")
        .eq("owner_id", user.id)
        .order("updated_at", { ascending: false })
        .then(({ data: wsList }) => {
          if (wsList && wsList.length > 0 && wsList[0]) {
            const wsId = window.localStorage.getItem("bizzmitra.activeWorkspaceId");
            const currentWs = wsList.find((w) => w.id === wsId) || wsList[0];
            const storedCtx =
              currentWs.workspace_context && typeof currentWs.workspace_context === "object"
                ? (currentWs.workspace_context as Record<string, unknown>)
                : null;
            const isCompleted =
              storedCtx?.["discoveryCompleted"] === true ||
              (storedCtx?.["discoveryAnswers"] && Array.isArray(storedCtx["discoveryAnswers"]) && storedCtx["discoveryAnswers"].length > 0);
            const fullCtx = {
              ...(storedCtx || {}),
              businessName: (storedCtx?.["businessName"] as string) || currentWs.name || "Custom Workspace",
              problemStatement: (storedCtx?.["problemStatement"] as string) || currentWs.problem_statement || "",
              industry: (storedCtx?.["industry"] as string) || currentWs.industry || "Custom Workspace",
              discoveryCompleted: Boolean(isCompleted),
            };

            setActiveWs({
              name: fullCtx.businessName,
              industry: fullCtx.industry,
              mode: (fullCtx.intakeMode as any) || "consult",
              lang: storedLang,
            });
            window.localStorage.setItem("bizzmitra.activeWorkspaceId", currentWs.id);
            window.localStorage.setItem("bizzmitra.workspaceContext", JSON.stringify(fullCtx));
            if (isCompleted) {
              completeDiscoveryAndUnlockAll(currentWs.id, fullCtx);
            }
          } else {
            // Check if user has local workspace context
            const raw = window.localStorage.getItem("bizzmitra.workspaceContext");
            if (raw) {
              try {
                const parsed = JSON.parse(raw);
                setActiveWs({
                  name: parsed.businessName || "New Workspace",
                  industry: parsed.industry || "Custom Workspace",
                  mode: parsed.intakeMode || "consult",
                  lang: storedLang,
                });
                return;
              } catch {}
            }
            setActiveWs({
              name: "New Workspace",
              industry: "Create intake to begin",
              mode: "consult",
              lang: storedLang,
            });
          }
        });
    } else {
      const raw = window.localStorage.getItem("bizzmitra.workspaceContext");
      if (raw) {
        try {
          const parsed = JSON.parse(raw);
          setActiveWs({
            name: parsed.businessName || "New Workspace",
            industry: parsed.industry || "Custom Workspace",
            mode: parsed.intakeMode || "consult",
            lang: storedLang,
          });
          return;
        } catch {}
      }
      setActiveWs({
        name: "New Workspace",
        industry: "Create intake to begin",
        mode: "consult",
        lang: storedLang,
      });
    }
  }, [user]);

  const isExpanded = isHovered || isPinned;

  // Handle flyout positioning
  const handleItemHover = (e: React.MouseEvent<HTMLElement>, item: PortalNavItem) => {
    if (item.subItems && item.subItems.length > 0) {
      const rect = e.currentTarget.getBoundingClientRect();
      setFlyoutPosition({ top: rect.top });
      setActiveFlyout(item.id);
    } else {
      setActiveFlyout(null);
    }
  };

  const handleMouseLeaveSidebar = () => {
    setIsHovered(false);
    setActiveFlyout(null);
  };

  return (
    <>
      {/* SIDEBAR CONTAINER (Icon rail expands from left to right on hover) */}
      <motion.aside
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={handleMouseLeaveSidebar}
        animate={{
          width: isExpanded ? 288 : 68,
        }}
        transition={{
          type: "spring",
          stiffness: 340,
          damping: 32,
        }}
        className={cn(
          "fixed left-0 top-0 bottom-0 z-40 hidden sm:flex flex-col border-r border-border/80 bg-sidebar/95 backdrop-blur-2xl shadow-2xl transition-colors select-none dark:border-white/10 dark:bg-sidebar/95",
          className,
        )}
      >
        {/* HEADER: LOGO & PIN TOGGLE */}
        <div className="flex h-16 items-center justify-between px-3.5 border-b border-border/60">
          <Link
            to="/"
            onClick={onNavigate}
            className="group relative flex items-center gap-3 overflow-hidden rounded-xl p-1 transition-all"
            title="Return to Landing Page"
          >
            <motion.div
              whileHover={{ scale: 1.1, rotate: -6 }}
              whileTap={{ scale: 0.9, rotate: 6 }}
              transition={{ type: "spring", stiffness: 420, damping: 22 }}
              className="relative grid size-8.5 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-primary via-primary to-primary/85 font-display text-sm font-black text-primary-foreground shadow-sm glow-primary"
            >
              B
            </motion.div>

            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.18 }}
                  className="whitespace-nowrap"
                >
                  <div className="flex items-center gap-1.5">
                    <span className="font-display text-sm font-extrabold tracking-tight text-foreground group-hover:text-primary transition-colors">
                      BizzMitra
                    </span>
                    <span className="rounded bg-primary/10 px-1.5 py-0.2 font-mono text-[9px] font-bold text-primary flex items-center gap-0.5">
                      <Home className="size-2.5" />
                      Home
                    </span>
                  </div>
                  <p className="text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5">
                    <span className="inline-block size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span>Active Portal</span>
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </Link>

          {/* Pin / Lock Button (Visible when expanded) */}
          <AnimatePresence>
            {isExpanded && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                onClick={togglePinned}
                title={isPinned ? "Unpin sidebar (auto-collapse)" : "Pin sidebar open"}
                className={cn(
                  "grid size-7 place-items-center rounded-lg border transition-colors",
                  isPinned
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border/60 text-muted-foreground hover:bg-surface-2 hover:text-foreground",
                )}
              >
                {isPinned ? <PinOff className="size-3.5" /> : <Pin className="size-3.5" />}
              </motion.button>
            )}
          </AnimatePresence>
        </div>

        {/* ACTIVE WORKSPACE PILL (Visible when expanded) */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="px-3 pt-3 overflow-hidden"
            >
              <Link
                to={activeWs.name === "No Active Workspace" ? "/workspace/new" : "/dashboard"}
                onClick={(e) => {
                  if (activeWs.name === "No Active Workspace" && isLimitReached) {
                    e.preventDefault();
                    setIsUpgradeModalOpen(true);
                    return;
                  }
                  onNavigate?.();
                }}
                className="neu-sm neu-press flex cursor-pointer items-center justify-between gap-2.5 rounded-xl border border-border/70 bg-card p-2.5 shadow-xs"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">
                      {t("settings.workspace", "Active Workspace")}
                    </span>
                    <span className="neu-sm px-1.5 py-0.2 text-[8px] font-bold text-primary">
                      {activeWs.mode === "know" ? "Direct" : "AI Guided"}
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs font-semibold leading-tight truncate text-foreground">
                    {activeWs.name}
                  </p>
                  <p className="text-[10px] text-muted-foreground truncate">
                    {activeWs.industry}
                  </p>
                </div>
                <ChevronDown className="size-3.5 shrink-0 text-muted-foreground" />
              </Link>
            </motion.div>
          )}
        </AnimatePresence>

        {/* NAVIGATION GROUPS WITH TASKS */}
        <div className="flex-1 overflow-y-auto px-2.5 py-3 scrollbar-none space-y-5">
          {filteredPortalGroups.map((group) => (
            <div key={group.groupName} className="space-y-1">
              {/* Group Title (Visible when expanded) */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="px-2 pb-1 font-mono text-[9px] font-bold uppercase tracking-wider text-muted-foreground"
                  >
                    {getGroupTitle(group.groupName)}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Task Items */}
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.to;
                const isItemHovered = activeFlyout === item.id;
                const isStage = WORKSPACE_STAGES.some((s) => s.id === item.id) || item.id === "crm";
                const isGated = isStage && item.id !== "discovery" && item.id !== "export" && item.id !== "settings";
                const isUnlocked = !isGated || isStageUnlocked(item.id);

                return (
                  <div
                    key={item.id}
                    onMouseEnter={(e) => handleItemHover(e, item)}
                    className="relative"
                  >
                    <Link
                      to={item.to}
                      onClick={(e) => {
                        if (item.to === "/workspace/new" && isLimitReached) {
                          e.preventDefault();
                          setActiveFlyout(null);
                          setIsUpgradeModalOpen(true);
                          return;
                        }
                        if (!isUnlocked) {
                          e.preventDefault();
                          toast.warning(`Please complete earlier stages first to unlock ${getItemLabel(item)}.`);
                          return;
                        }
                        onNavigate?.();
                      }}
                      className={cn(
                        "group relative flex items-center gap-3 rounded-xl px-2.5 py-2 transition-all duration-200",
                        !isUnlocked
                          ? "opacity-50 cursor-not-allowed hover:bg-transparent"
                          : isActive
                            ? "bg-primary text-primary-foreground font-semibold shadow-sm glow-primary"
                            : isItemHovered
                              ? "bg-surface-2 text-foreground"
                              : "text-muted-foreground hover:bg-surface-2/80 hover:text-foreground",
                      )}
                    >
                      {/* Task Icon */}
                      <div className="relative grid size-7 shrink-0 place-items-center rounded-lg transition-transform group-hover:scale-110">
                        <Icon
                          className={cn(
                            "size-4",
                            isActive ? "text-primary-foreground" : "text-foreground/80",
                          )}
                        />
                      </div>

                      {/* Full Task Name & Description */}
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ opacity: 0, x: -6 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -6 }}
                            transition={{ duration: 0.15 }}
                            className="flex-1 overflow-hidden"
                          >
                            <div className="flex items-center justify-between gap-1">
                              <span className="truncate text-xs font-semibold leading-none">
                                {getItemLabel(item)}
                              </span>
                              {!isUnlocked ? (
                                <span className="rounded bg-muted/60 px-1.5 py-0.2 font-mono text-[8px] font-bold text-muted-foreground flex items-center gap-0.5">
                                  <Lock className="size-2" /> Locked
                                </span>
                              ) : item.badge ? (
                                <span
                                  className={cn(
                                    "rounded px-1.5 py-0.2 font-mono text-[8px] font-bold",
                                    isActive
                                      ? "bg-primary-foreground/20 text-primary-foreground"
                                      : "bg-primary/10 text-primary",
                                  )}
                                >
                                  {item.badge}
                                </span>
                              ) : null}
                            </div>
                            <p
                              className={cn(
                                "truncate text-[10px] mt-0.5 leading-none",
                                isActive ? "text-primary-foreground/80" : "text-muted-foreground",
                              )}
                            >
                              {item.description}
                            </p>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* Sub-menu chevron */}
                      {isExpanded && item.subItems && item.subItems.length > 0 && (
                        <ChevronRight
                          className={cn(
                            "size-3 shrink-0 opacity-40 transition-transform group-hover:opacity-100 group-hover:translate-x-0.5",
                            isActive ? "text-primary-foreground" : "text-muted-foreground",
                          )}
                        />
                      )}
                    </Link>
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        {/* BOTTOM USER ROW */}
        <div className="border-t border-border/60 p-2.5 space-y-2">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-1.5 overflow-hidden">
              <ThemeToggle />
              <LanguageSelector variant="compact" />
              <AnimatePresence>
                {isExpanded && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="truncate text-[11px] text-muted-foreground"
                  >
                    {user?.email || "Guest Workspace"}
                  </motion.span>
                )}
              </AnimatePresence>
            </div>

            <button
              onClick={() => signOut()}
              title="Sign out"
              className="grid size-8 shrink-0 place-items-center rounded-lg text-muted-foreground hover:bg-surface-2 hover:text-foreground transition-colors"
            >
              <LogOut className="size-4" />
            </button>
          </div>
        </div>
      </motion.aside>

      {/* HOVER FLYOUT SUBMENU PANEL (Pops out to the right of the active task) */}
      <AnimatePresence>
        {activeFlyout && (
          <motion.div
            initial={{ opacity: 0, x: -12, scale: 0.96 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -8, scale: 0.96 }}
            transition={{ duration: 0.16, ease: "easeOut" }}
            onMouseEnter={() => {
              // keep flyout open while hovering inside it
            }}
            onMouseLeave={() => setActiveFlyout(null)}
            style={{
              position: "fixed",
              left: isExpanded ? 294 : 74,
              top: Math.max(16, Math.min(flyoutPosition.top - 10, window.innerHeight - 240)),
            }}
            className="z-50 w-64 rounded-2xl border border-border/80 bg-card/95 p-3 shadow-2xl backdrop-blur-2xl dark:border-white/15 dark:bg-zinc-900/95 dark:shadow-[0_16px_40px_rgba(0,0,0,0.6)]"
          >
            {/* Flyout Header */}
            {(() => {
              const allItems = filteredPortalGroups.flatMap((g) => g.items);
              const cur = allItems.find((i) => i.id === activeFlyout);
              if (!cur) return null;
              const Icon = cur.icon;
              return (
                <div className="pb-2 border-b border-border/60 mb-2 flex items-center gap-2.5">
                  <div className="grid size-6 place-items-center rounded-md bg-primary/10 text-primary">
                    <Icon className="size-3.5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-foreground leading-none">{getItemLabel(cur)}</h4>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{cur.description}</p>
                  </div>
                </div>
              );
            })()}

            {/* Sub-items List */}
            <div className="space-y-1">
              {(() => {
                const allItems = filteredPortalGroups.flatMap((g) => g.items);
                const cur = allItems.find((i) => i.id === activeFlyout);
                const curIsGated = cur && (WORKSPACE_STAGES.some((s) => s.id === cur.id) || cur.id === "crm") && cur.id !== "discovery";
                const curIsUnlocked = !curIsGated || (cur ? isStageUnlocked(cur.id) : true);

                return cur?.subItems?.map((sub) => {
                  if (!curIsUnlocked) {
                    return (
                      <button
                        key={sub.label}
                        type="button"
                        onClick={() => {
                          toast.warning(`Please complete earlier stages to unlock ${getItemLabel(cur!)}.`);
                        }}
                        className="group flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-xs text-muted-foreground/50 cursor-not-allowed hover:bg-transparent"
                      >
                        <span className="flex items-center gap-1.5">
                          <Lock className="size-2.5 opacity-60" />
                          <span>{sub.label}</span>
                        </span>
                        <span className="text-[10px] text-muted-foreground font-mono">(Locked)</span>
                      </button>
                    );
                  }

                  return (
                    <Link
                      key={sub.label}
                      to={sub.href}
                      onClick={(e) => {
                        if (sub.href === "/workspace/new" && isLimitReached) {
                          e.preventDefault();
                          setActiveFlyout(null);
                          setIsUpgradeModalOpen(true);
                          return;
                        }
                        setActiveFlyout(null);
                        onNavigate?.();
                      }}
                      className="group flex items-center justify-between rounded-lg px-2.5 py-1.5 text-xs text-muted-foreground hover:bg-primary/10 hover:text-primary transition-all"
                    >
                      <span>{sub.label}</span>
                      <ArrowRight className="size-3 opacity-0 transition-opacity group-hover:opacity-100" />
                    </Link>
                  );
                });
              })()}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <WorkspaceUpgradeModal
        isOpen={isUpgradeModalOpen}
        onClose={() => setIsUpgradeModalOpen(false)}
        workspaceCount={workspaceCount || 1}
        onUpgradeSuccess={() => {
          void refreshLimit();
        }}
      />
    </>
  );
}
