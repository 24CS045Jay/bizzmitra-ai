import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { AnimatePresence, motion } from "motion/react";
import { ArrowRight, Eye, EyeOff } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Reveal } from "@/components/motion/primitives";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LanguageSelector } from "@/components/LanguageSelector";
import { GridMotion } from "@/components/effects/GridMotion";
import { Auth6 } from "@/components/Auth6";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/hooks/useTheme";
import { supabase } from "@/integrations/supabase/client";
import { syncUserRoleAndWallet } from "@/lib/admin-rbac-data";
import { gridMotionItems } from "@/lib/login-background";
import { useTranslation } from "@/lib/i18n";


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
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [fullName, setFullName] = useState("");
  const [busy, setBusy] = useState(false);
  const [step, setStep] = useState<"form" | "otp">("form");
  const [cooldown, setCooldown] = useState(0);

  const { session, signInAsDemoAdmin, setSession } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();

  useEffect(() => {
    if (session) navigate({ to: "/dashboard" });
  }, [session, navigate]);

  // Cooldown countdown timer for OTP resend
  useEffect(() => {
    if (cooldown <= 0) return;
    const interval = setInterval(() => {
      setCooldown((c) => Math.max(0, c - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [cooldown]);

  async function syncUserProfile(userId: string, name?: string) {
    try {
      const displayName = name || email.split("@")[0] || "User";
      await supabase.from("profiles").upsert({
        id: userId,
        full_name: displayName,
      });
    } catch (e) {
      console.warn("Profile upsert notice:", e);
    }
  }

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName },
          emailRedirectTo: `${window.location.origin}/dashboard`,
        },
      });

      if (error) {
        // If user is already registered, attempt to log in or check confirmation
        if (
          error.message.toLowerCase().includes("already registered") ||
          error.message.toLowerCase().includes("already exists")
        ) {
          const { data: signInData, error: signInErr } = await supabase.auth.signInWithPassword({
            email,
            password,
          });
          if (signInData?.session) {
            setSession(signInData.session);
            if (signInData.session.user) {
              void syncUserProfile(signInData.session.user.id, fullName || email.split("@")[0]);
            }
            syncUserRoleAndWallet(email, true);
            toast.success("Welcome back! Signed in to your workspace.");
            navigate({ to: "/dashboard" });
            return;
          }
          if (signInErr?.message.toLowerCase().includes("email not confirmed")) {
            toast.info("Account exists but email is not confirmed yet. A verification code has been sent.");
            await supabase.auth.resend({ type: "signup", email });
            setStep("otp");
            setCooldown(60);
            return;
          }
        }

        // If email sending failed (invalid SMTP settings or Supabase rate limit)
        if (
          error.message.toLowerCase().includes("error sending") ||
          error.message.toLowerCase().includes("rate limit") ||
          error.message.toLowerCase().includes("over_email_send_rate_limit")
        ) {
          toast.info("Supabase mail limit reached. Creating direct authenticated account...");
          try {
            const regRes = await fetch("/api/auth/register", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ email, password, fullName }),
            });
            const regData = await regRes.json();
            if (regData.success) {
              const { data: signInData } = await supabase.auth.signInWithPassword({ email, password });
              if (signInData?.session) {
                setSession(signInData.session);
                if (signInData.session.user) {
                  void syncUserProfile(signInData.session.user.id, fullName || email.split("@")[0]);
                }
                syncUserRoleAndWallet(email, true);
                toast.success("Account created and saved to database! Welcome to your workspace.");
                navigate({ to: "/dashboard" });
                return;
              }
            }
          } catch (serverErr) {
            console.warn("Direct server registration notice:", serverErr);
          }

          toast.error(
            "Could not deliver confirmation email (rate limit reached). Please wait a few moments or try again.",
            { duration: 6000 }
          );
          return;
        }

        toast.error(error.message);
        return;
      }

      // If session was immediately created without email confirmation requirement
      if (data.session) {
        setSession(data.session);
        if (data.session.user) {
          void syncUserProfile(data.session.user.id, fullName || email.split("@")[0]);
        }
        syncUserRoleAndWallet(email, true);
        toast.success("Account created! Welcome to your workspace.");
        navigate({ to: "/dashboard" });
        return;
      }

      // Try immediate password login in case auto-confirmation is active
      const { data: signInData } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (signInData?.session) {
        setSession(signInData.session);
        if (signInData.session.user) {
          void syncUserProfile(signInData.session.user.id, fullName || email.split("@")[0]);
        }
        syncUserRoleAndWallet(email, true);
        toast.success("Account created and signed in!");
        navigate({ to: "/dashboard" });
        return;
      }

      // Move to 2FA Email OTP step
      toast.success("Verification email sent! Check your inbox for your verification code or confirmation link.");
      setStep("otp");
      setCooldown(60);
    } catch {
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  async function handleResendCode() {
    if (cooldown > 0 || busy) return;
    setBusy(true);
    const { error } = await supabase.auth.resend({
      type: "signup",
      email,
    });
    setBusy(false);

    if (error) {
      if (error.message.toLowerCase().includes("rate limit")) {
        toast.error("Email rate limit reached. Please wait a minute or check your spam folder.");
      } else {
        toast.error(error.message);
      }
    } else {
      toast.success("A new verification code has been sent to your email.");
      setCooldown(60);
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
            <span className="grid size-8 place-items-center rounded-lg bg-primary font-display text-sm font-extrabold text-primary-foreground">
              B
            </span>
            <span className="font-display text-lg font-extrabold tracking-tight">BizzMitra</span>
          </Link>

          <div className="neu neu-reflect p-6 sm:p-8">
            <AnimatePresence mode="wait">
              {step === "form" ? (
                <motion.div
                  key="signup-form"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                >
                  <h1 className="font-display text-3xl font-extrabold">{t("auth.startFirstBlueprint", "Start your first blueprint")}</h1>
                  <p className="mt-1.5 text-sm text-muted-foreground">
                    {t("auth.startSub", "One workspace, free forever. No card needed.")}
                  </p>

                  <button
                    type="button"
                    onClick={google}
                    className="neu-sm neu-press mt-5 flex w-full items-center justify-center gap-2.5 px-4 py-2.5 text-xs font-semibold hover:border-primary/40 transition-all"
                  >
                    <GoogleIcon className="size-4 shrink-0" />
                    <span>{t("auth.google", "Continue with Google")}</span>
                  </button>

                  <div className="my-4 flex items-center gap-3 text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                    <span className="h-px flex-1 bg-border" /> {t("auth.or", "or")} <span className="h-px flex-1 bg-border" />
                  </div>

                  <form onSubmit={handleSignUp} className="space-y-3">
                    <div className="rounded-xl border border-border/80 bg-surface/70 px-3.5 py-2.5 transition-all focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 hover:border-border">
                      <label className="block text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                        {t("auth.fullName", "Full name")}
                      </label>
                      <input
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="mt-0.5 w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground/60"
                        placeholder="Ananya Rao"
                      />
                    </div>
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
                      <div className="mt-0.5 flex items-center gap-2">
                        <input
                          type={showPassword ? "text" : "password"}
                          required
                          minLength={6}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground/60"
                          placeholder="At least 6 characters"
                        />
                        <button
                          type="button"
                          tabIndex={-1}
                          onClick={() => setShowPassword((v) => !v)}
                          className="shrink-0 text-muted-foreground hover:text-foreground transition-colors"
                          aria-label={showPassword ? "Hide password" : "Show password"}
                        >
                          {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                        </button>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={busy}
                      className="neu-press w-full rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground glow-primary disabled:opacity-50"
                    >
                      {busy ? t("auth.signingIn", "Creating account…") : t("auth.createAccount", "Create account")}
                    </button>
                  </form>

                  <p className="mt-5 text-center text-sm text-muted-foreground">
                    {t("auth.alreadyHaveAccount", "Already have an account?")}{" "}
                    <Link to="/login" className="font-semibold text-primary">
                      {t("auth.signIn", "Sign in")}
                    </Link>
                  </p>
                </motion.div>
              ) : (
                <div key="otp-step" className="space-y-4">
                  <Auth6
                    email={email}
                    defaultLength={8}
                    initialCountdown={cooldown}
                    cardClassName="space-y-5"
                    onVerify={async (code) => {
                      const trimmedCode = code.trim();
                      setBusy(true);

                      // 1. Try Supabase verifyOtp with type "signup"
                      const { data: res1, error: err1 } = await supabase.auth.verifyOtp({
                        email,
                        token: trimmedCode,
                        type: "signup",
                      });

                      if (!err1 && (res1?.session || res1?.user)) {
                        const uId = res1.session?.user?.id || res1.user?.id;
                        if (uId) void syncUserProfile(uId, fullName || email.split("@")[0]);

                        if (res1.session) {
                          setSession(res1.session);
                          setBusy(false);
                          toast.success("Account confirmed! Welcome to BizzMitra.");
                          navigate({ to: "/dashboard" });
                          return true;
                        } else if (password) {
                          const { data: signInData, error: sErr } = await supabase.auth.signInWithPassword({
                            email,
                            password,
                          });
                          if (signInData?.session) {
                            setSession(signInData.session);
                            setBusy(false);
                            toast.success("Account confirmed! Welcome to BizzMitra.");
                            navigate({ to: "/dashboard" });
                            return true;
                          }
                          setBusy(false);
                          toast.error(sErr?.message || "Please sign in with your password.");
                          navigate({ to: "/login" });
                          return true;
                        } else {
                          setBusy(false);
                          toast.success("Account confirmed! Please log in.");
                          navigate({ to: "/login" });
                          return true;
                        }
                      }

                      // 2. Try Supabase verifyOtp with type "email"
                      const { data: res2, error: err2 } = await supabase.auth.verifyOtp({
                        email,
                        token: trimmedCode,
                        type: "email",
                      });

                      if (!err2 && (res2?.session || res2?.user)) {
                        const uId = res2.session?.user?.id || res2.user?.id;
                        if (uId) void syncUserProfile(uId, fullName || email.split("@")[0]);

                        if (res2.session) {
                          setSession(res2.session);
                          setBusy(false);
                          toast.success("Account confirmed! Welcome to BizzMitra.");
                          navigate({ to: "/dashboard" });
                          return true;
                        } else if (password) {
                          const { data: signInData, error: sErr } = await supabase.auth.signInWithPassword({
                            email,
                            password,
                          });
                          if (signInData?.session) {
                            setSession(signInData.session);
                            setBusy(false);
                            toast.success("Account confirmed! Welcome to BizzMitra.");
                            navigate({ to: "/dashboard" });
                            return true;
                          }
                          setBusy(false);
                          toast.error(sErr?.message || "Please sign in with your password.");
                          navigate({ to: "/login" });
                          return true;
                        } else {
                          setBusy(false);
                          toast.success("Account confirmed! Please log in.");
                          navigate({ to: "/login" });
                          return true;
                        }
                      }

                      setBusy(false);
                      const errMsg = err1?.message || err2?.message || "Invalid or expired verification code.";
                      toast.error(errMsg);
                      return errMsg;
                    }}
                    onResend={handleResendCode}
                    onBack={() => setStep("form")}
                  />

                  {/* Direct Admin Auto-Confirmation in case email delivery was delayed */}
                  <div className="flex flex-col items-center gap-2 text-center rounded-2xl border border-border/60 bg-muted/20 p-4">
                    <button
                      type="button"
                      onClick={async () => {
                        setBusy(true);
                        try {
                          const regRes = await fetch("/api/auth/register", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ email, password, fullName }),
                          });
                          const regData = await regRes.json();
                          if (regData.success) {
                            const { data: signInData, error: sErr } = await supabase.auth.signInWithPassword({ email, password });
                            if (signInData?.session) {
                              setSession(signInData.session);
                              if (signInData.session.user) {
                                void syncUserProfile(signInData.session.user.id, fullName || email.split("@")[0]);
                              }
                              toast.success("Account verified and saved to database! Welcome.");
                              navigate({ to: "/dashboard" });
                              return;
                            } else if (sErr) {
                              toast.error(sErr.message);
                            }
                          } else if (regData.error) {
                            toast.error(regData.error);
                          }
                        } catch (err: any) {
                          toast.error(err?.message || "Direct verification failed.");
                        } finally {
                          setBusy(false);
                        }
                      }}
                      className="neu-press flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white shadow-md hover:bg-emerald-500 transition-colors"
                    >
                      <span>⚡ Direct Confirm & Enter Workspace</span>
                    </button>
                    <p className="text-[11px] text-muted-foreground">
                      Didn't receive the email code? Click above to verify your account directly via server authentication.
                    </p>
                  </div>
                </div>
              )}
            </AnimatePresence>
          </div>
        </Reveal>
      </div>
    </div>
  );
}
