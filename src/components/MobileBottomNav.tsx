import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Sparkles,
  Layers,
  Settings,
  Plus,
} from "lucide-react";
import { cn } from "@/lib/utils";

export function MobileBottomNav() {
  const currentPath = useRouterState({ select: (s) => s.location.pathname });

  // Only render on core authenticated / workspace app pages
  const isExcluded =
    currentPath === "/login" ||
    currentPath === "/signup" ||
    currentPath === "/" ||
    currentPath === "/about";

  if (isExcluded) return null;

  const navItems = [
    {
      label: "Dashboard",
      to: "/dashboard",
      icon: LayoutDashboard,
      isActive: currentPath === "/dashboard",
    },
    {
      label: "Discovery",
      to: "/workspace/discovery",
      icon: Sparkles,
      isActive: currentPath.startsWith("/workspace/discovery"),
    },
    {
      label: "New",
      to: "/workspace/new",
      icon: Plus,
      isAction: true,
      isActive: currentPath === "/workspace/new",
    },
    {
      label: "Solution",
      to: "/workspace/solution",
      icon: Layers,
      isActive: currentPath.startsWith("/workspace/solution"),
    },
    {
      label: "Settings",
      to: "/settings",
      icon: Settings,
      isActive: currentPath === "/settings",
    },
  ];

  return (
    <nav
      aria-label="Mobile Navigation"
      className="fixed bottom-0 left-0 right-0 z-50 block sm:hidden pointer-events-none"
    >
      <div className="mx-auto max-w-md px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        <div className="pointer-events-auto flex items-center justify-between rounded-2xl border border-border/70 bg-background/90 p-1.5 shadow-2xl backdrop-blur-xl dark:border-white/10 dark:bg-zinc-950/90 dark:shadow-[0_12px_36px_rgba(0,0,0,0.8)]">
          {navItems.map((item) => {
            const Icon = item.icon;

            if (item.isAction) {
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className="group relative -top-3 flex size-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-600 via-primary to-violet-500 shadow-lg shadow-primary/30 transition-transform active:scale-90"
                >
                  <Icon className="size-6 text-white transition-transform group-active:rotate-90" />
                  <span className="sr-only">New Blueprint</span>
                </Link>
              );
            }

            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "relative flex flex-1 flex-col items-center justify-center gap-0.5 rounded-xl py-1.5 text-[10px] font-medium transition-all duration-150 active:scale-95",
                  item.isActive
                    ? "text-primary font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <div className="relative">
                  <Icon className={cn("size-5 transition-transform", item.isActive && "scale-110")} />
                  {item.isActive && (
                    <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 size-1 rounded-full bg-primary shadow-[0_0_8px_currentColor]" />
                  )}
                </div>
                <span className="tracking-tight">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
