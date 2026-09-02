import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Reveal } from "@/components/motion/primitives";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/signup")({
  head: () => ({
    meta: [
      { title: "Create your account — BizzMitra-AI" },
      {
        name: "description",
        content: "Start free: turn a business problem into an implementation-ready blueprint with BizzMitra-AI.",
      },
      { property: "og:title", content: "Create your account — BizzMitra-AI" },
      { property: "og:description", content: "Start free with BizzMitra-AI." },
    ],
  }),
  component: SignupPage,
});

function SignupPage() {
  const [fullName, setFullName] = useState("");
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
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/dashboard`,
        data: { full_name: fullName },
      },
    });
    setBusy(false);
    if (error) toast.error(error.message);
    else toast.success("Account created — check your inbox to confirm.");
  }

  async function google() {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/dashboard` },
    });
    if (error) toast.error(error.message);
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
          <h1 className="font-display text-3xl font-extrabold">Start your first blueprint</h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            One workspace, free forever. No card needed.
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
                Full name
              </label>
              <input
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full bg-transparent text-sm outline-none"
                placeholder="Ananya Rao"
              />
            </div>
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
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-transparent text-sm outline-none"
                placeholder="At least 6 characters"
              />
            </div>
            <button
              type="submit"
              disabled={busy}
              className="neu-press w-full rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground disabled:opacity-60"
            >
              {busy ? "Creating…" : "Create account"}
            </button>
          </form>

          <p className="mt-5 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link to="/login" className="font-semibold text-primary">
              Sign in
            </Link>
          </p>
        </div>
      </Reveal>
    </div>
  );
}
