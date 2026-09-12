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
  Shield,
} from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";

import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { DEMO_WORKSPACE } from "@/lib/demo-data";
import { cn } from "@/lib/utils";
import {
  ROLE_DEFINITIONS,
  UserRole,
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
  const [activeWs, setActiveWs] = useState({
    name: "TalentCraft HR Consultancy",
    industry: "HR & Recruitment Services",
    mode: "consult",
    lang: "en",
  });
  const [activeRole, setActiveRole] = useState<UserRole>("admin");

  useEffect(() => {
    setActiveRole(loadCurrentRole());
  }, []);

  const handleRoleChange = (newRole: UserRole) => {
    setActiveRole(newRole);
    saveCurrentRole(newRole);
    window.dispatchEvent(new CustomEvent("bizzmitra:role-changed", { detail: newRole }));
  };

  useEffect(() => {
    if (typeof window === "undefined") return;
    const wsId = window.localStorage.getItem("bizzmitra.activeWorkspaceId");
    const storedLang = window.localStorage.getItem("bizzmitra.language") || "en";

    try {
      const raw = window.localStorage.getItem("bizzmitra.workspaceContext");
      if (raw) {
        const parsed = JSON.parse(raw);
        setActiveWs({
          name: parsed.businessName || "TalentCraft HR Consultancy",
          industry: parsed.industry || "HR & Recruitment Services",
          mode: parsed.intakeMode || "consult",
          lang: storedLang,
        });
        return;
      }
    } catch {}

    if (user && wsId && !wsId.startsWith("ws-")) {
      supabase
        .from("workspaces")
        .select("name, problem_statement")
        .eq("id", wsId)
        .maybeSingle()
        .then((res: { data: { name?: string } | null }) => {
          const fetchedName = res.data?.name;
          if (fetchedName) {
            setActiveWs((prev) => ({
              ...prev,
              name: fetchedName,
            }));
          }
        });
    }
  }, [user]);

  return (
    <div className="flex h-full flex-col gap-6 p-4">
      <Link to="/" className="flex items-center gap-2.5 px-2 pt-2">
        <span className="grid size-8 place-items-center rounded-lg bg-primary font-display text-sm font-extrabold text-primary-foreground">
          B
        </span>
        <span className="font-display text-lg font-extrabold tracking-tight">BizzMitra</span>
      </Link>

      <div className="neu-sm neu-press flex cursor-pointer items-center justify-between gap-3 px-3.5 py-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Active workspace
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
        {NAV.map((item) => {
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
                  className="absolute inset-0 rounded-lg bg-primary"
                  transition={{ type: "spring", stiffness: 420, damping: 34 }}
                />
              ) : null}
              <item.icon className="relative size-4 shrink-0" />
              <span className="relative font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-border pt-3 space-y-2">
        <div className="rounded-xl border border-border/80 bg-background/50 p-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Active Role</span>
            <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[9px] font-bold text-primary">
              {ROLE_DEFINITIONS[activeRole].badge}
            </span>
          </div>
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
        </div>

        <p className="truncate px-1 text-xs text-muted-foreground">{user?.email}</p>
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
  const [currentRole, setCurrentRole] = useState<UserRole>("admin");
  const { loading, session } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !session) navigate({ to: "/login" });
  }, [loading, session, navigate]);

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
    <div className="min-h-screen lg:flex">
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 border-r border-border bg-sidebar lg:block">
        <SidebarContent />
      </aside>

      <div className="flex items-center justify-between border-b border-border bg-sidebar px-4 py-3 lg:hidden">
        <Link to="/dashboard" className="flex items-center gap-2">
          <span className="grid size-7 place-items-center rounded-lg bg-primary font-display text-xs font-extrabold text-primary-foreground">
            B
          </span>
          <span className="font-display text-base font-extrabold">BizzMitra</span>
        </Link>
        <button
          onClick={() => setOpen(true)}
          aria-label="Open navigation"
          className="neu-sm neu-press grid size-9 place-items-center"
        >
          <Menu className="size-4" />
        </button>
      </div>

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

      <div className="flex min-w-0 flex-1 flex-col">
        {currentRole !== "admin" ? (
          <div className="border-b border-amber-500/20 bg-amber-500/10 px-6 py-2 text-xs font-medium text-amber-700 dark:text-amber-300">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="inline-block size-2 rounded-full bg-amber-500 animate-pulse" />
                <span>
                  <strong>RBAC Preview Active:</strong> Logged in as{" "}
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
        <main className="min-w-0 flex-1 px-5 py-8 sm:px-8 lg:px-12 lg:py-12">{children}</main>
      </div>
    </div>
  );
}
