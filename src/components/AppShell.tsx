import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { AnimatePresence, motion } from "motion/react";
import {
  BarChart3,
  Boxes,
  Database,
  GitBranch,
  LayoutGrid,
  LogOut,
  Menu,
  MessageSquare,
  Network,
  PenTool,
  Route as RouteIcon,
  Settings,
  Sparkles,
  Users,
  Workflow,
  X,
  ChevronDown,
  FileCheck2,
  Package,
  ArrowRight,
  Home,
  Shield,
} from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";

import { useAuth, isTestingAccount } from "@/hooks/useAuth";
import { toast } from "sonner";
import { ThemeToggle } from "./ThemeToggle";
import { LanguageSelector } from "./LanguageSelector";
import { useTranslation } from "@/lib/i18n";
import { AppSidebar2 } from "@/components/AppSidebar2";
import { AiCopilotPanel } from "@/components/AiCopilotPanel";
import { supabase } from "@/integrations/supabase/client";
import { DEMO_WORKSPACE } from "@/lib/demo-data";
import { cn } from "@/lib/utils";
import {
  ROLE_DEFINITIONS,
  UserRole,
  isSuperAdminEmail,
  loadCurrentRole,
  saveCurrentRole,
} from "@/lib/admin-rbac-data";

const NAV = [
  { to: "/dashboard", label: "Workspaces", icon: LayoutGrid },
  { to: "/workspace/new", label: "New Intake", icon: Sparkles },
  { to: "/workspace/discovery", label: "AI Discovery", icon: MessageSquare },
  { to: "/workspace/solution", label: "Solution", icon: Boxes },
  { to: "/workspace/solution/crm", label: "HR CRM", icon: Users },
  { to: "/workspace/architecture", label: "Architecture", icon: Network },
  { to: "/workspace/process", label: "Process", icon: Workflow },
  { to: "/workspace/wireframes", label: "UX Designer", icon: PenTool },
  { to: "/workspace/data", label: "Data & APIs", icon: Database },
  { to: "/workspace/roadmap", label: "Roadmap & ROI", icon: RouteIcon },
  { to: "/workspace/insights", label: "Transformation", icon: BarChart3 },
  { to: "/workspace/map", label: "Artifact Map", icon: GitBranch },
  { to: "/workspace/collaboration", label: "Governance & Review", icon: FileCheck2 },
  { to: "/workspace/export", label: "Export Center", icon: Package },
  { to: "/admin", label: "Admin Console", icon: Shield },
  { to: "/settings", label: "Settings", icon: Settings },
] as const;

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { user, signOut } = useAuth();
  const { t } = useTranslation();
  const isSuperAdmin = isSuperAdminEmail(user?.email);

  const getNavLabel = (item: (typeof NAV)[number]) => {
    const map: Record<string, string> = {
      "/dashboard": "nav.dashboard",
      "/workspace/new": "nav.newIntake",
      "/workspace/discovery": "nav.discovery",
      "/workspace/solution": "nav.solution",
      "/workspace/solution/crm": "nav.crm",
      "/workspace/architecture": "nav.architecture",
      "/workspace/process": "nav.process",
      "/workspace/wireframes": "nav.wireframes",
      "/workspace/data": "nav.data",
      "/workspace/roadmap": "nav.roadmap",
      "/workspace/insights": "nav.insights",
      "/workspace/map": "nav.artifactMap",
      "/workspace/collaboration": "nav.collaboration",
      "/workspace/export": "nav.export",
      "/admin": "nav.admin",
      "/settings": "nav.settings",
    };
    const key = map[item.to] || "nav.dashboard";
    return t(key, item.label);
  };

  const isTestAccount = isTestingAccount(user?.email);

  const [activeWs, setActiveWs] = useState({
    name: isTestAccount ? "TalentCraft HR Consultancy" : "No Active Workspace",
    industry: isTestAccount ? "HR & Recruitment Services" : "Create new workspace",
    mode: "consult",
    lang: "en",
  });
  const [activeRole, setActiveRole] = useState<UserRole>("viewer");

  useEffect(() => {
    setActiveRole(loadCurrentRole());
  }, []);

  const handleRoleChange = (newRole: UserRole) => {
    if (!isSuperAdmin) return;
    setActiveRole(newRole);
    saveCurrentRole(newRole);
    window.dispatchEvent(new CustomEvent("bizzmitra:role-changed", { detail: newRole }));
  };

  useEffect(() => {
    if (typeof window === "undefined") return;
    const storedLang = window.localStorage.getItem("bizzmitra.language") || "en";
    const isTest = isTestingAccount(user?.email);

    // 1. Testing Admin account: allow fallback to TalentCraft demo workspace
    if (isTest) {
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
        .select("id, name, problem_statement")
        .eq("owner_id", user.id)
        .order("updated_at", { ascending: false })
        .then(({ data: wsList }) => {
          if (wsList && wsList.length > 0 && wsList[0]) {
            const wsId = window.localStorage.getItem("bizzmitra.activeWorkspaceId");
            const currentWs = wsList.find((w) => w.id === wsId) || wsList[0];
            setActiveWs({
              name: currentWs.name,
              industry: "Custom Workspace",
              mode: "consult",
              lang: storedLang,
            });
            window.localStorage.setItem("bizzmitra.activeWorkspaceId", currentWs.id);
            window.localStorage.setItem(
              "bizzmitra.workspaceContext",
              JSON.stringify({
                businessName: currentWs.name,
                problemStatement: currentWs.problem_statement || "",
                industry: "Custom Workspace",
              }),
            );
          } else {
            setActiveWs({
              name: "No Active Workspace",
              industry: "Create intake to begin",
              mode: "consult",
              lang: storedLang,
            });
            window.localStorage.removeItem("bizzmitra.activeWorkspaceId");
            window.localStorage.removeItem("bizzmitra.workspaceContext");
          }
        });
    } else {
      setActiveWs({
        name: "No Active Workspace",
        industry: "Create intake to begin",
        mode: "consult",
        lang: storedLang,
      });
    }
  }, [user]);

  const visibleNav = NAV.filter((item) => item.to !== "/admin" || isSuperAdmin);

  return (
    <div className="flex h-full flex-col gap-6 p-4">
      <Link
        to="/"
        onClick={onNavigate}
        className="group relative flex items-center justify-between rounded-xl px-2.5 py-2 transition-all duration-200 hover:bg-surface-2/80 dark:hover:bg-surface-2/60 border border-transparent hover:border-border/60 hover:shadow-sm"
        title="Return to Landing Page"
      >
        <div className="flex items-center gap-2.5">
          <motion.div
            whileHover={{ scale: 1.12, rotate: -6 }}
            whileTap={{ scale: 0.92, rotate: 6 }}
            transition={{ type: "spring", stiffness: 420, damping: 22 }}
            className="relative grid size-8.5 place-items-center rounded-xl bg-gradient-to-br from-primary via-primary to-primary/85 font-display text-sm font-black text-primary-foreground shadow-sm glow-primary"
          >
            <span className="absolute inset-0 rounded-xl bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
            B
          </motion.div>
          <div className="flex flex-col">
            <span className="font-display text-base font-extrabold tracking-tight text-foreground group-hover:text-primary transition-colors">
              BizzMitra
            </span>
            <span className="text-[10px] font-mono text-muted-foreground/80 flex items-center gap-1">
              <span className="inline-block size-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Workspace</span>
            </span>
          </div>
        </div>

        {/* Animated Return-to-Home indicator */}
        <motion.div
          className="flex items-center gap-1 rounded-md bg-primary/10 px-1.5 py-0.5 text-[10px] font-mono font-bold text-primary opacity-0 group-hover:opacity-100 transition-all duration-200 -translate-x-1 group-hover:translate-x-0"
        >
          <Home className="size-2.5" />
          <span>Home</span>
          <ArrowRight className="size-2.5 transition-transform group-hover:translate-x-0.5" />
        </motion.div>
      </Link>

      <div className="neu-sm neu-press flex cursor-pointer items-center justify-between gap-3 px-3.5 py-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              {t("settings.workspace", "Active workspace")}
            </p>
            <span className="neu-sm px-1.5 py-0.5 text-[9px] font-bold text-primary">
              {activeWs.mode === "know" ? "Direct" : "AI Guided"}
            </span>
          </div>
          <p className="mt-1 text-sm font-semibold leading-tight truncate">{activeWs.name}</p>
          <p className="mt-0.5 text-xs text-muted-foreground truncate">{activeWs.industry}</p>
        </div>
        <ChevronDown className="size-4 shrink-0 text-muted-foreground" />
      </div>

      <nav className="flex-1 space-y-0.5 overflow-y-auto">
        {visibleNav.map((item) => {
          const active = pathname === item.to;
          return (
            <Link
              key={item.to}
              to={item.to}
              onClick={onNavigate}
              className={cn(
                "relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors",
                active ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground",
              )}
            >
              {active ? (
                <motion.span
                  layoutId="nav-pill"
                  className="absolute inset-0 rounded-lg bg-primary glow-primary"
                  transition={{ type: "spring", stiffness: 420, damping: 34 }}
                />
              ) : null}
              <item.icon className="relative size-4 shrink-0" />
              <span className="relative font-medium">{getNavLabel(item)}</span>
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-border pt-3 space-y-2">
        <div className="rounded-xl border border-border/80 bg-background/50 p-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Active Role</span>
            <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[9px] font-bold text-primary">
              {ROLE_DEFINITIONS[activeRole]?.badge || "Viewer"}
            </span>
          </div>
          {isSuperAdmin ? (
            <select
              value={activeRole}
              onChange={(e) => handleRoleChange(e.target.value as UserRole)}
              className="mt-1.5 w-full rounded-md border border-input bg-background px-2 py-1 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-primary"
            >
              {(Object.keys(ROLE_DEFINITIONS) as UserRole[]).map((r) => (
                <option key={r} value={r}>
                  {ROLE_DEFINITIONS[r].title}
                </option>
              ))}
            </select>
          ) : (
            <p className="mt-1.5 text-xs font-medium text-foreground">
              {ROLE_DEFINITIONS[activeRole]?.title || "Stakeholder Viewer"}
            </p>
          )}
        </div>

        <div className="flex items-center justify-between px-2">
          <p className="truncate text-xs text-muted-foreground">{user?.email}</p>
          <ThemeToggle />
        </div>
        <button
          onClick={() => signOut()}
          className="flex w-full items-center gap-3 rounded-lg px-2 py-1.5 text-xs text-muted-foreground transition-colors hover:text-primary"
        >
          <LogOut className="size-3.5" /> Sign out
        </button>
      </div>
    </div>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [currentRole, setCurrentRole] = useState<UserRole>("viewer");
  const [isPinned, setIsPinned] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      return window.localStorage.getItem("bizzmitra.sidebarPinned") === "true";
    }
    return false;
  });

  const handleTogglePin = () => {
    setIsPinned((prev) => {
      const next = !prev;
      if (typeof window !== "undefined") {
        window.localStorage.setItem("bizzmitra.sidebarPinned", String(next));
      }
      return next;
    });
  };

  const { loading, session } = useAuth();
  const navigate = useNavigate();
  const isSuperAdmin = isSuperAdminEmail(session?.user?.email);

  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isTestAccount = isTestingAccount(session?.user?.email);

  useEffect(() => {
    if (!loading && !session) {
      supabase.auth.getSession().then(({ data }) => {
        if (!data.session) {
          navigate({ to: "/login" });
        }
      });
    }
  }, [loading, session, navigate]);

  // Route protection: If standard user attempts to view a workspace artifact page without any workspace created,
  // redirect them to /workspace/new
  useEffect(() => {
    if (!loading && session?.user && !isTestAccount) {
      if (pathname.startsWith("/workspace/") && pathname !== "/workspace/new") {
        supabase
          .from("workspaces")
          .select("id", { count: "exact", head: true })
          .eq("owner_id", session.user.id)
          .then(({ count }) => {
            if ((count ?? 0) === 0) {
              toast.info("Please create your first workspace to generate your digital blueprint.");
              navigate({ to: "/workspace/new" });
            }
          });
      }
    }
  }, [pathname, loading, session, isTestAccount, navigate]);

  useEffect(() => {
    setCurrentRole(loadCurrentRole());
    const handleRoleChanged = (e: Event) => {
      const customEvent = e as CustomEvent<UserRole>;
      setCurrentRole(customEvent.detail || loadCurrentRole());
    };
    window.addEventListener("bizzmitra:role-changed", handleRoleChanged);
    return () => window.removeEventListener("bizzmitra:role-changed", handleRoleChanged);
  }, []);

  if (loading || !session) return null;

  const roleDef = ROLE_DEFINITIONS[currentRole];

  return (
    <div className="min-h-screen">
      {/* React Bits Pro App Sidebar 2 (Icon rail with left-to-right hover slide expansion & pin) */}
      <AppSidebar2 isPinned={isPinned} onTogglePin={handleTogglePin} />

      {/* Mobile Top Navigation Header */}
      <div className="flex items-center justify-between border-b border-border bg-sidebar px-4 py-3 lg:hidden">
        <Link
          to="/"
          className="group flex items-center gap-2 rounded-lg p-1 transition-all active:scale-95"
          title="Return to Landing Page"
        >
          <motion.span
            whileHover={{ scale: 1.1, rotate: -6 }}
            whileTap={{ scale: 0.9, rotate: 6 }}
            transition={{ type: "spring", stiffness: 420, damping: 22 }}
            className="grid size-7.5 place-items-center rounded-lg bg-primary font-display text-xs font-black text-primary-foreground shadow-sm glow-primary"
          >
            B
          </motion.span>
          <span className="font-display text-base font-extrabold group-hover:text-primary transition-colors">
            BizzMitra
          </span>
          <span className="text-[10px] font-mono text-primary font-semibold rounded bg-primary/10 px-1.5 py-0.2 ml-1 flex items-center gap-0.5">
            <Home className="size-2.5" />
            Home
          </span>
        </Link>
        <div className="flex items-center gap-2">
          <LanguageSelector variant="compact" />
          <ThemeToggle />
          <button
            onClick={() => setOpen(true)}
            aria-label="Open navigation"
            className="neu-sm neu-press grid size-9 place-items-center"
          >
            <Menu className="size-4" />
          </button>
        </div>
      </div>

      {/* Mobile Sidebar Drawer */}
      <AnimatePresence>
        {open ? (
          <motion.div
            className="fixed inset-0 z-50 bg-foreground/30 lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
          >
            <motion.div
              className="h-full w-72 bg-sidebar"
              initial={{ x: -290 }}
              animate={{ x: 0 }}
              exit={{ x: -290 }}
              transition={{ type: "spring", stiffness: 380, damping: 36 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-end p-3">
                <button
                  onClick={() => setOpen(false)}
                  aria-label="Close navigation"
                  className="grid size-9 place-items-center rounded-lg"
                >
                  <X className="size-4" />
                </button>
              </div>
              <SidebarContent onNavigate={() => setOpen(false)} />
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <div
        className={cn(
          "flex min-w-0 flex-1 flex-col transition-all duration-300 ease-in-out",
          isPinned ? "lg:pl-[304px]" : "lg:pl-[86px]",
        )}
      >
        {isSuperAdmin && currentRole !== "admin" ? (
          <div className="border-b border-amber-500/20 bg-amber-500/10 px-6 py-2 text-xs font-medium text-amber-700 dark:text-amber-300">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="inline-block size-2 rounded-full bg-amber-500 animate-pulse" />
                <span>
                  <strong>Super Admin Sandbox:</strong> Previewing role as{" "}
                  <span className="font-bold underline">{roleDef.title}</span> ({roleDef.badge}).
                  {!roleDef.permissions.canEditSchema && " Schema editing is disabled."}
                  {!roleDef.permissions.canRegenerateAI && " AI regeneration is restricted."}
                  {!roleDef.permissions.canExportDeliverables && " Deliverable export is locked."}
                </span>
              </div>
              <button
                onClick={() => {
                  saveCurrentRole("admin");
                  setCurrentRole("admin");
                  window.dispatchEvent(new CustomEvent("bizzmitra:role-changed", { detail: "admin" }));
                }}
                className="text-[11px] font-bold underline hover:text-foreground"
              >
                Reset to Super Admin
              </button>
            </div>
          </div>
        ) : null}

        {/* Main Workspace Portal View where all tasks are performed */}
        <main
          className={cn(
            "min-w-0 flex-1 px-5 py-8 sm:px-8 lg:pr-10 lg:py-10 transition-all duration-300 ease-in-out",
            isPinned && "scale-[0.985] origin-top-left",
          )}
        >
          {children}
        </main>
      </div>

      {/* Persistent AI Copilot Panel across all authenticated screens */}
      <AiCopilotPanel />
    </div>
  );
}
