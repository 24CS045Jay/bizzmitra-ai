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
  Workflow,
  X,
  ChevronDown,
} from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";

import { useAuth } from "@/hooks/useAuth";
import { DEMO_WORKSPACE } from "@/lib/demo-data";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/dashboard", label: "Workspaces", icon: LayoutGrid },
  { to: "/workspace/new", label: "New Intake", icon: Sparkles },
  { to: "/workspace/discovery", label: "AI Discovery", icon: MessageSquare },
  { to: "/workspace/solution", label: "Solution", icon: Boxes },
  { to: "/workspace/architecture", label: "Architecture", icon: Network },
  { to: "/workspace/process", label: "Process", icon: Workflow },
  { to: "/workspace/wireframes", label: "UX Designer", icon: PenTool },
  { to: "/workspace/data", label: "Data & APIs", icon: Database },
  { to: "/workspace/roadmap", label: "Roadmap & ROI", icon: RouteIcon },
  { to: "/workspace/insights", label: "Transformation", icon: BarChart3 },
  { to: "/workspace/map", label: "Artifact Map", icon: GitBranch },
  { to: "/settings", label: "Settings", icon: Settings },
] as const;

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { user, signOut } = useAuth();

  return (
    <div className="flex h-full flex-col gap-6 p-4">
      <Link to="/" className="flex items-center gap-2.5 px-2 pt-2">
        <span className="grid size-8 place-items-center rounded-lg bg-primary font-display text-sm font-extrabold text-primary-foreground">
          B
        </span>
        <span className="font-display text-lg font-extrabold tracking-tight">BizzMitra</span>
      </Link>

      <div className="neu-sm neu-press flex cursor-pointer items-center justify-between gap-3 px-3.5 py-3">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Active workspace
          </p>
          <p className="mt-1 text-sm font-semibold leading-tight">{DEMO_WORKSPACE.name}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">{DEMO_WORKSPACE.industry}</p>
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

      <div className="border-t border-border pt-3">
        <p className="truncate px-3 text-xs text-muted-foreground">{user?.email}</p>
        <button
          onClick={() => signOut()}
          className="mt-2 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:text-primary"
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

      <main className="min-w-0 flex-1 px-5 py-8 sm:px-8 lg:px-12 lg:py-12">{children}</main>
    </div>
  );
}
