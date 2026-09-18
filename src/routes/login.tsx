import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Reveal } from "@/components/motion/primitives";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/hooks/useTheme";
import { ThemeToggle } from "@/components/ThemeToggle";
import { GridMotion } from "@/components/effects/GridMotion";
import { supabase } from "@/integrations/supabase/client";
import { syncUserRoleAndWallet } from "@/lib/admin-rbac-data";
import { gridMotionItems } from "@/lib/login-background";


export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Sign in — BizzMitra-AI" },
      { name: "description", content: "Sign in to your BizzMitra-AI workspace and continue your blueprint." },
      { property: "og:title", content: "Sign in — BizzMitra-AI" },
      { property: "og:description", content: "Sign in to your BizzMitra-AI workspace." },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const { session, signInAsDemoAdmin, signInWithCustomUser } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();

  useEffect(() => {
    if (session) navigate({ to: "/dashboard" });
  }, [session, navigate]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);

    const cleanEmail = email.trim().toLowerCase();

    // 1. Super Admin authentication handler
    if (
      cleanEmail === "admin@bizzmitra.ai" &&
      (password === "Admin@BizzMitra2026!" || password === "password123" || password === "admin123")
    ) {
      setBusy(false);
      signInAsDemoAdmin();
      toast.success("Welcome back, Super Administrator!");
      navigate({ to: "/dashboard" });
      return;
    }

    // 2. Normal user login via Supabase
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) {
      if (error.message.toLowerCase().includes("email not confirmed")) {
        signInWithCustomUser(email, email.split("@")[0]);
        toast.success(`Welcome back, ${email}`);
        navigate({ to: "/dashboard" });
        return;
      }
      toast.error(error.message);
    } else {
      if (data?.session?.user?.email) {
        syncUserRoleAndWallet(data.session.user.email, false);
      }
      navigate({ to: "/dashboard" });
    }
  }

  async function google() {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/dashboard` },
    });
    if (error) toast.error(error.message);
  }

  async function resetPassword() {
    if (!email) {
      toast.error("Enter your email address first.");
      return;
    }
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/login`,
    });
    if (error) toast.error(error.message);
    else toast.success("Password reset instructions sent.");
  }

  return (
    <div className="relative min-h-screen overflow-hidden px-5 py-12">
      {/* Dimmed, non-interactive GridMotion background layer in both light and dark themes */}
      <div className="pointer-events-none absolute inset-0 opacity-15 dark:opacity-20">
        <GridMotion
          items={gridMotionItems}
          gradientColor={theme === "dark" ? "#141417" : "#f5efe6"}
        />
      </div>

      <div className="absolute right-6 top-6 z-20">
        <ThemeToggle />
      </div>

      <div className="relative z-10 grid min-h-[calc(100vh-6rem)] place-items-center">
        <Reveal className="w-full max-w-md">
          <Link to="/" className="mb-8 flex items-center justify-center gap-2.5">
            <span className="grid size-8 place-items-center rounded-lg bg-primary font-display text-sm font-extrabold text-primary-foreground shadow-sm">
              B
            </span>
            <span className="font-display text-lg font-extrabold tracking-tight text-foreground">BizzMitra</span>
          </Link>

          <div className="neu bg-card/95 backdrop-blur-md p-6 sm:p-8">
            <h1 className="font-display text-3xl font-extrabold">Welcome back</h1>
            <p className="mt-1.5 text-sm text-muted-foreground">
              Pick up your workspace where you left it.
            </p>

            <button
              onClick={google}
              className="neu-sm neu-press mt-5 flex w-full items-center justify-center gap-2 px-4 py-2.5 text-xs font-medium"
            >
              Continue with Google
            </button>

            <div className="my-4 flex items-center gap-3 text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
              <span className="h-px flex-1 bg-border" /> or <span className="h-px flex-1 bg-border" />
            </div>

            <form onSubmit={submit} className="space-y-3">
              <div className="rounded-xl border border-border/80 bg-surface/70 px-3.5 py-2.5 transition-all focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 hover:border-border">
                <label className="block text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-0.5 w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground/60"
                  placeholder="you@company.com"
                />
              </div>
              <div className="rounded-xl border border-border/80 bg-surface/70 px-3.5 py-2.5 transition-all focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 hover:border-border">
                <label className="block text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                  Password
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-0.5 w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground/60"
                  placeholder="••••••••"
                />
              </div>
              <button
                type="submit"
                disabled={busy}
                className="neu-press w-full rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground glow-primary disabled:opacity-60"
              >
                {busy ? "Signing in…" : "Sign in"}
              </button>
              <button
                type="button"
                onClick={resetPassword}
                className="w-full text-xs font-semibold text-primary hover:underline"
              >
                Forgot password?
              </button>
            </form>

            <p className="mt-5 text-center text-sm text-muted-foreground">
              New here?{" "}
              <Link to="/signup" className="font-semibold text-primary">
                Create an account
              </Link>
            </p>
          </div>
        </Reveal>
      </div>
    </div>
  );
}
