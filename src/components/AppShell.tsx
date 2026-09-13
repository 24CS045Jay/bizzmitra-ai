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
} from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";

import { useAuth } from "@/hooks/useAuth";
import { ThemeToggle } from "@/components/ThemeToggle";
import { AppSidebar2 } from "@/components/AppSidebar2";
import { AiCopilotPanel } from "@/components/AiCopilotPanel";
import { supabase } from "@/integrations/supabase/client";
import { DEMO_WORKSPACE } from "@/lib/demo-data";
import { cn } from "@/lib/utils";

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
    } catch { }

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
                  className="absolute inset-0 rounded-lg bg-primary glow-primary"
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
        <div className="flex items-center justify-between px-3">
          <p className="truncate text-xs text-muted-foreground">{user?.email}</p>
          <ThemeToggle />
        </div>
        <button
          onClick={() => signOut()}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:text-primary"
        >
          <LogOut className="size-4" /> Sign out
        </button>
      </div>
    </div>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const { loading, session } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !session) navigate({ to: "/login" });
  }, [loading, session, navigate]);

  if (loading || !session) return null;

  return (
    <div className="min-h-screen">
      {/* React Bits Pro App Sidebar 2 (Icon rail with left-to-right hover slide expansion) */}
      <AppSidebar2 />

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

      {/* Main Workspace Portal View where all tasks are performed */}
      <main className="min-w-0 flex-1 px-5 py-8 sm:px-8 lg:pl-[86px] lg:pr-10 lg:py-10">{children}</main>

      {/* Persistent AI Copilot Panel across all authenticated screens */}
      <AiCopilotPanel />
    </div>
  );
}
