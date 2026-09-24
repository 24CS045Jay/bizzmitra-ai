import * as React from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ArrowRight } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import { useAuth } from "@/hooks/useAuth";

interface NavLink {
  label: string;
  href: string;
}

const DEFAULT_LINKS: NavLink[] = [
  { label: "Overview", href: "/#" },
  { label: "Compare", href: "/#compare" },
  { label: "Modules", href: "/#modules" },
  { label: "Pricing", href: "/#pricing" },
  { label: "About BizzMitra", href: "/about" },
];

export function Navigation12({
  links = DEFAULT_LINKS,
  className = "",
}: {
  links?: NavLink[];
  className?: string;
}) {
  const { session, signOut } = useAuth();
  const [active, setActive] = React.useState<string>(links[0]?.label ?? "Overview");
  const [hovered, setHovered] = React.useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = React.useState<boolean>(false);

  return (
    <header className={`fixed top-4 inset-x-0 z-50 flex flex-col items-center px-4 ${className}`}>
      {/* Floating Glass Pill Navbar */}
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="neu-reflect relative flex items-center justify-between gap-3 sm:gap-6 rounded-full border border-border/80 bg-surface/80 px-3.5 py-2 shadow-lg backdrop-blur-xl dark:border-white/15 dark:bg-surface/85 dark:shadow-[0_12px_36px_-10px_rgba(0,0,0,0.8)]"
      >
        {/* Brand mark */}
        <Link to="/" className="flex items-center gap-2 pl-1 pr-2 group">
          <img
            src="/logo.png"
            alt="BizzMitra"
            className="size-7 rounded-full object-cover shadow-sm ring-1 ring-primary/40 group-hover:scale-105 transition-transform"
          />
          <span className="hidden font-display text-sm font-extrabold tracking-tight sm:inline">
            BizzMitra
          </span>
        </Link>

        {/* Desktop Links with Layout-Animated Indicator */}
        <div className="hidden md:flex items-center gap-1 rounded-full bg-surface-2/60 p-1 border border-border/40 dark:bg-surface/90 dark:border-white/15">
          {links.map((link) => {
            const isCurrent = (hovered || active) === link.label;
            const isInternal = link.href.startsWith("/") && !link.href.includes("#");
            const linkClass = `relative rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors duration-200 ${
              isCurrent
                ? "text-primary dark:text-white"
                : "text-muted-foreground hover:text-foreground dark:text-zinc-300 dark:hover:text-white"
            }`;

            const inner = (
              <>
                {isCurrent && (
                  <motion.span
                    layoutId="nav12-active-indicator"
                    className="absolute inset-0 rounded-full bg-card shadow-sm border border-border/70 dark:bg-zinc-800/95 dark:border-white/20 dark:shadow-[0_0_12px_rgba(255,255,255,0.08)] -z-10"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                {link.label}
              </>
            );

            if (isInternal) {
              return (
                <Link
                  key={link.label}
                  to={link.href}
                  onClick={() => setActive(link.label)}
                  onMouseEnter={() => setHovered(link.label)}
                  onMouseLeave={() => setHovered(null)}
                  className={linkClass}
                >
                  {inner}
                </Link>
              );
            }

            return (
              <a
                key={link.label}
                href={link.href}
                onClick={() => setActive(link.label)}
                onMouseEnter={() => setHovered(link.label)}
                onMouseLeave={() => setHovered(null)}
                className={linkClass}
              >
                {inner}
              </a>
            );
          })}
        </div>

        {/* Action buttons & Theme Toggle */}
        <div className="flex items-center gap-2">
          <ThemeToggle />

          {session ? (
            <div className="flex items-center gap-2">
              <Link
                to="/dashboard"
                className="neu-press rounded-full bg-primary px-3.5 py-1.5 text-xs font-semibold text-primary-foreground glow-primary shadow-sm"
              >
                Workspace
              </Link>
              <button
                onClick={() => signOut()}
                className="hidden rounded-full px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground dark:text-zinc-300 dark:hover:text-white hover:bg-surface-2/60 dark:hover:bg-white/10 transition-colors sm:inline"
              >
                Sign out
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <Link
                to="/login"
                className="hidden rounded-full px-3.5 py-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground dark:text-zinc-300 dark:hover:text-white hover:bg-surface-2/60 dark:hover:bg-white/10 transition-colors sm:inline"
              >
                Log in
              </Link>
              <Link
                to="/signup"
                className="neu-press flex items-center gap-1 rounded-full bg-primary px-3.5 py-1.5 text-xs font-semibold text-primary-foreground glow-primary shadow-sm"
              >
                <span>Start free</span>
                <ArrowRight className="size-3" />
              </Link>
            </div>
          )}

          {/* Mobile Menu Trigger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle navigation menu"
            className="grid size-8 place-items-center rounded-full border border-border/60 bg-surface/50 text-foreground md:hidden"
          >
            {mobileOpen ? <X className="size-4" /> : <Menu className="size-4" />}
          </button>
        </div>
      </motion.nav>

      {/* Expanding Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.96 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="neu-reflect mt-2 w-full max-w-sm overflow-hidden rounded-2xl border border-border/80 bg-surface/95 p-4 shadow-xl backdrop-blur-2xl dark:border-white/15 dark:bg-surface/95 md:hidden"
          >
            <div className="flex flex-col gap-1">
              {links.map((link) => {
                const isInternal = link.href.startsWith("/") && !link.href.includes("#");
                const itemClass = "flex items-center justify-between rounded-xl px-4 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-surface-2 dark:hover:bg-white/10 dark:hover:text-white";
                if (isInternal) {
                  return (
                    <Link
                      key={link.label}
                      to={link.href}
                      onClick={() => {
                        setActive(link.label);
                        setMobileOpen(false);
                      }}
                      className={itemClass}
                    >
                      <span>{link.label}</span>
                      <ArrowRight className="size-3.5 text-muted-foreground" />
                    </Link>
                  );
                }
                return (
                  <a
                    key={link.label}
                    href={link.href}
                    onClick={() => {
                      setActive(link.label);
                      setMobileOpen(false);
                    }}
                    className={itemClass}
                  >
                    <span>{link.label}</span>
                    <ArrowRight className="size-3.5 text-muted-foreground" />
                  </a>
                );
              })}

              <div className="mt-2 pt-2 border-t border-border/60 flex flex-col gap-2">
                {session ? (
                  <>
                    <Link
                      to="/dashboard"
                      onClick={() => setMobileOpen(false)}
                      className="neu-press flex items-center justify-center rounded-xl bg-primary py-2.5 text-xs font-bold text-primary-foreground glow-primary"
                    >
                      Go to workspace
                    </Link>
                    <button
                      onClick={() => {
                        signOut();
                        setMobileOpen(false);
                      }}
                      className="py-1 text-xs text-muted-foreground hover:text-foreground dark:text-zinc-300 dark:hover:text-white"
                    >
                      Sign out
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      to="/signup"
                      onClick={() => setMobileOpen(false)}
                      className="neu-press flex items-center justify-center rounded-xl bg-primary py-2.5 text-xs font-bold text-primary-foreground glow-primary"
                    >
                      Start free
                    </Link>
                    <Link
                      to="/login"
                      onClick={() => setMobileOpen(false)}
                      className="py-1 text-center text-xs font-medium text-muted-foreground hover:text-foreground dark:text-zinc-300 dark:hover:text-white"
                    >
                      Log in
                    </Link>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
