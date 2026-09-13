import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { AnimatePresence, motion } from "motion/react";
import { ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Reveal } from "@/components/motion/primitives";
import { Turnstile } from "@/components/Turnstile";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LightRays } from "@/components/effects/LightRays";
import { Auth6 } from "@/components/Auth6";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/hooks/useTheme";
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
  const [step, setStep] = useState<"form" | "otp">("form");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [captchaToken, setCaptchaToken] = useState("");
  const [cooldown, setCooldown] = useState(0);
  const [busy, setBusy] = useState(false);

  const { session } = useAuth();
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

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault();
    if (!captchaToken) {
      toast.error("Please complete the security check to continue.");
      return;
    }

    setBusy(true);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
        captchaToken,
      },
    });
    setBusy(false);

    if (error) {
      toast.error(error.message);
      return;
    }

    // If session was immediately created without email confirmation requirement
    if (data.session) {
      toast.success("Account created successfully!");
      navigate({ to: "/dashboard" });
      return;
    }

    // Move to 2FA Email OTP step
    toast.success("Verification code sent to your email!");
    setStep("otp");
    setCooldown(30);
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
      toast.error(error.message);
    } else {
      toast.success("A new 6-digit verification code has been sent.");
      setCooldown(30);
    }
  }

  async function google() {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/dashboard` },
    });
    if (error) toast.error(error.message);
  }

  return (
    <div className="relative min-h-screen overflow-hidden px-5 py-12">
      {theme === "dark" && (
        <div className="pointer-events-none absolute inset-0 z-0 h-full w-full overflow-hidden opacity-35">
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
                  <h1 className="font-display text-3xl font-extrabold">Start your first blueprint</h1>
                  <p className="mt-1.5 text-sm text-muted-foreground">
                    One workspace, free forever. No card needed.
                  </p>

                  <button
                    type="button"
                    onClick={google}
                    className="neu-sm neu-press mt-6 flex w-full items-center justify-center gap-2 px-4 py-3 text-sm font-medium"
                  >
                    Continue with Google
                  </button>

                  <div className="my-5 flex items-center gap-3 text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                    <span className="h-px flex-1 bg-border" /> or <span className="h-px flex-1 bg-border" />
                  </div>

                  <form onSubmit={handleSignUp} className="space-y-3">
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

                    {/* Turnstile Captcha Widget */}
                    <div className="pt-2">
                      <Turnstile
                        onVerify={(token) => setCaptchaToken(token)}
                        onError={() => setCaptchaToken("")}
                        onExpire={() => setCaptchaToken("")}
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={busy || !captchaToken}
                      className="neu-press w-full rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground glow-primary disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {busy ? "Creating account…" : "Create account"}
                    </button>
                  </form>

                  <p className="mt-5 text-center text-sm text-muted-foreground">
                    Already have an account?{" "}
                    <Link to="/login" className="font-semibold text-primary">
                      Sign in
                    </Link>
                  </p>
                </motion.div>
              ) : (
                <div key="otp-step">
                  <Auth6
                    email={email}
                    initialCountdown={cooldown}
                    cardClassName="space-y-5"
                    onVerify={async (code) => {
                      setBusy(true);
                      const { error } = await supabase.auth.verifyOtp({
                        email,
                        token: code,
                        type: "signup",
                      });
                      setBusy(false);

                      if (error) {
                        toast.error(error.message);
                        return false;
                      }

                      toast.success("Account confirmed! Welcome to BizzMitra.");
                      navigate({ to: "/dashboard" });
                      return true;
                    }}
                    onResend={handleResendCode}
                    onBack={() => setStep("form")}
                  />
                </div>
              )}
            </AnimatePresence>
          </div>
        </Reveal>
      </div>
    </div>
  );
}
