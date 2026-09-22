import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Reveal } from "@/components/motion/primitives";
import { useAuth, isTestingAccount } from "@/hooks/useAuth";
import { useTheme } from "@/hooks/useTheme";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LanguageSelector } from "@/components/LanguageSelector";
import { GridMotion } from "@/components/effects/GridMotion";
import { supabase } from "@/integrations/supabase/client";
import { syncUserRoleAndWallet } from "@/lib/admin-rbac-data";
import { gridMotionItems } from "@/lib/login-background";
import { useTranslation } from "@/lib/i18n";


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
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const { session, signInAsDemoAdmin, signInWithCustomUser } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();

  useEffect(() => {
    if (session) {
      navigate({ to: "/dashboard" });
    }
  }, [session, busy, navigate]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);

    const cleanEmail = email.trim().toLowerCase();

    // 1. Super Admin authentication handler (Designated Testing Account)
    if (
      cleanEmail === "admin@bizzmitra.ai" &&
      (password === "Admin@BizzMitra2026!" || password === "password123" || password === "admin123")
    ) {
      setBusy(false);
      signInAsDemoAdmin();
      toast.success("Welcome back, Super Administrator! Testing workspace loaded.");
      navigate({ to: "/dashboard" });
      return;
    }

    // 2. Normal user login via Supabase
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) {
      if (error.message.toLowerCase().includes("email not confirmed")) {
        signInWithCustomUser(email, email.split("@")[0]);
        toast.info(`Welcome, ${email}! Check out your workspaces.`);
        navigate({ to: "/dashboard" });
        return;
      }
      toast.error(error.message);
    } else {
      if (data?.session?.user?.email) {
        syncUserRoleAndWallet(data.session.user.email, false);
      }

      // Check if user has existing workspaces in Supabase
      const userId = data?.session?.user?.id;
      if (userId) {
        try {
          const { data: wsList } = await supabase
            .from("workspaces")
            .select("id, name, problem_statement")
            .eq("owner_id", userId)
            .order("updated_at", { ascending: false });

          if (wsList && wsList.length > 0 && wsList[0]) {
            localStorage.setItem("bizzmitra.activeWorkspaceId", wsList[0].id);
            localStorage.setItem(
              "bizzmitra.workspaceContext",
              JSON.stringify({
                businessName: wsList[0].name,
                problemStatement: wsList[0].problem_statement || "",
                industry: "Custom Workspace",
              }),
            );
            navigate({ to: "/dashboard" });
            return;
          }
        } catch {}
      }

      // Check if user already created a custom workspace locally
      const localWsId = localStorage.getItem("bizzmitra.activeWorkspaceId");
      const localCtx = localStorage.getItem("bizzmitra.workspaceContext");
      if (localWsId && localWsId !== "ws-talentcraft-default" && localCtx) {
        navigate({ to: "/dashboard" });
      } else {
        // First-time user: Route to Workspaces hub where they can click Create Workspace!
        localStorage.removeItem("bizzmitra.activeWorkspaceId");
        localStorage.removeItem("bizzmitra.workspaceContext");
        toast.info("Welcome! Here is your workspace hub.");
        navigate({ to: "/dashboard" });
      }
    }
  }

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className || "size-4 shrink-0"} viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
      />
    </svg>
  );
}

  async function google() {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: `${window.location.origin}/dashboard` },
      });
      if (error) {
        if (
          error.message.toLowerCase().includes("unsupported provider") ||
          error.message.toLowerCase().includes("not enabled")
        ) {
          toast.error(
            "Google provider is not enabled in Supabase yet. Please enable Google in Supabase Dashboard -> Authentication -> Providers with your Google Client ID & Secret.",
            { duration: 8000 }
          );
        } else {
          toast.error(error.message);
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to initiate Google authentication.";
      toast.error(msg);
    }
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

      <div className="absolute right-6 top-6 z-20 flex items-center gap-2">
        <ThemeToggle />
        <LanguageSelector variant="compact" />
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
            <h1 className="font-display text-3xl font-extrabold">{t("auth.welcomeBack", "Welcome back")}</h1>
            <p className="mt-1.5 text-sm text-muted-foreground">
              {t("auth.welcomeBackSub", "Pick up your workspace where you left it.")}
            </p>

            <button
              onClick={google}
              type="button"
              className="neu-sm neu-press mt-5 flex w-full items-center justify-center gap-2.5 px-4 py-2.5 text-xs font-semibold hover:border-primary/40 transition-all"
            >
              <GoogleIcon className="size-4 shrink-0" />
              <span>{t("auth.google", "Continue with Google")}</span>
            </button>

            <div className="my-4 flex items-center gap-3 text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
              <span className="h-px flex-1 bg-border" /> {t("auth.or", "or")} <span className="h-px flex-1 bg-border" />
            </div>

            <form onSubmit={submit} className="space-y-3">
              <div className="rounded-xl border border-border/80 bg-surface/70 px-3.5 py-2.5 transition-all focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 hover:border-border">
                <label className="block text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                  {t("auth.email", "Email")}
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
                  {t("auth.password", "Password")}
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
                {busy ? t("auth.signingIn", "Signing in…") : t("auth.signIn", "Sign in")}
              </button>
              <button
                type="button"
                onClick={resetPassword}
                className="w-full text-xs font-semibold text-primary hover:underline"
              >
                {t("auth.forgotPassword", "Forgot password?")}
              </button>
            </form>

            <p className="mt-5 text-center text-sm text-muted-foreground">
              {t("auth.newHere", "New here?")}{" "}
              <Link to="/signup" className="font-semibold text-primary">
                {t("auth.createAccount", "Create an account")}
              </Link>
            </p>
          </div>
        </Reveal>
      </div>
    </div>
  );
}
