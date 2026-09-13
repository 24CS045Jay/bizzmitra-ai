import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Reveal } from "@/components/motion/primitives";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/hooks/useTheme";
import { ThemeToggle } from "@/components/ThemeToggle";
import { GridMotion } from "@/components/effects/GridMotion";
import { LightRays } from "@/components/effects/LightRays";
import { supabase } from "@/integrations/supabase/client";

import grid01 from "@/assets/images/login-background/grid-01.jpg";
import grid02 from "@/assets/images/login-background/grid-02.jpg";
import grid03 from "@/assets/images/login-background/grid-03.jpg";
import grid04 from "@/assets/images/login-background/grid-04.jpg";
import grid05 from "@/assets/images/login-background/grid-05.jpg";
import grid06 from "@/assets/images/login-background/grid-06.jpg";
import grid07 from "@/assets/images/login-background/grid-07.jpg";
import grid08 from "@/assets/images/login-background/grid-08.jpg";
import grid09 from "@/assets/images/login-background/grid-09.jpg";
import grid10 from "@/assets/images/login-background/grid-10.jpg";
import grid11 from "@/assets/images/login-background/grid-11.jpg";

const loginBackgroundImages = [
  grid01,
  grid02,
  grid03,
  grid04,
  grid05,
  grid06,
  grid07,
  grid08,
  grid09,
  grid10,
  grid11,
];

// Cycle through the images until all 28 grid cells are filled
const gridMotionItems: string[] = Array.from(
  { length: 28 },
  (_, index) => loginBackgroundImages[index % loginBackgroundImages.length]!,
);

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
  const { session } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();

  useEffect(() => {
    if (session) navigate({ to: "/dashboard" });
  }, [session, navigate]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) toast.error(error.message);
    else navigate({ to: "/dashboard" });
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
      {/* Dimmed, non-interactive GridMotion background layer */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden="true">
        {/* Grid container with balanced opacity */}
        <div className="absolute inset-0 opacity-70 dark:opacity-65">
          <GridMotion items={gridMotionItems} gradientColor="var(--background)" />
        </div>
        {/* Theme-aware overlay sitting between grid and login form */}
        <div className="absolute inset-0 z-[1] bg-background/45 backdrop-blur-[1px] dark:bg-black/50" />
      </div>

      {theme === "dark" && (
        <div className="pointer-events-none absolute inset-0 z-[2] h-full w-full overflow-hidden opacity-30">
          <LightRays
            raysOrigin="top-center"
            raysColor="#ff5a3c"
            rayLength={1.1}
            lightSpread={0.7}
            followMouse={false}
            noiseAmount={0.05}
            pulsating={false}
          />
        </div>
      )}

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
              className="neu-sm neu-press mt-6 flex w-full items-center justify-center gap-2 px-4 py-3 text-sm font-medium"
            >
              Continue with Google
            </button>

            <div className="my-5 flex items-center gap-3 text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
              <span className="h-px flex-1 bg-border" /> or <span className="h-px flex-1 bg-border" />
            </div>

            <form onSubmit={submit} className="space-y-3">
              <div className="neu-inset px-3.5 py-2.5">
                <label className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-transparent text-sm outline-none"
                  placeholder="you@company.com"
                />
              </div>
              <div className="neu-inset px-3.5 py-2.5">
                <label className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                  Password
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-transparent text-sm outline-none"
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
