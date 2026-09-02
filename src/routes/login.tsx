import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Reveal } from "@/components/motion/primitives";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

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
    <div className="grid min-h-screen place-items-center px-5 py-16">
      <Reveal className="w-full max-w-md">
        <Link to="/" className="mb-8 flex items-center justify-center gap-2.5">
          <span className="grid size-8 place-items-center rounded-lg bg-primary font-display text-sm font-extrabold text-primary-foreground">
            B
          </span>
          <span className="font-display text-lg font-extrabold tracking-tight">BizzMitra</span>
        </Link>

        <div className="neu p-6 sm:p-8">
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
              className="neu-press w-full rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground disabled:opacity-60"
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
  );
}
