import * as React from "react";
import { motion } from "framer-motion";
import { Mail, CheckCircle2, RefreshCw, ArrowLeft } from "lucide-react";
import { Shake } from "./motion/primitives";

interface Auth6Props {
  email?: string;
  onVerify?: (code: string) => Promise<boolean | void> | boolean | void;
  onResend?: () => Promise<void> | void;
  onBack?: () => void;
  initialCountdown?: number;
  className?: string;
  cardClassName?: string;
}

export function Auth6({
  email = "alex@enterprise.com",
  onVerify,
  onResend,
  onBack,
  initialCountdown = 30,
  className = "",
  cardClassName = "neu neu-reflect p-7 sm:p-9 rounded-2xl relative overflow-hidden",
}: Auth6Props) {
  const [digits, setDigits] = React.useState<string[]>(["", "", "", "", "", ""]);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [countdown, setCountdown] = React.useState(initialCountdown);
  const [hasError, setHasError] = React.useState(false);
  const [isSuccess, setIsSuccess] = React.useState(false);
  const inputRefs = React.useRef<(HTMLInputElement | null)[]>([]);

  // Countdown timer
  React.useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => setCountdown((c) => c - 1), 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  // Focus first input on mount
  React.useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const handleInputChange = (index: number, val: string) => {
    // Only accept numbers
    const clean = val.replace(/\D/g, "");
    if (!clean && val !== "") return;

    setHasError(false);

    // Handle paste of multiple digits
    if (clean.length > 1) {
      const newDigits = [...digits];
      const pastedChars = clean.slice(0, 6).split("");
      pastedChars.forEach((ch, idx) => {
        if (index + idx < 6) {
          newDigits[index + idx] = ch;
        }
      });
      setDigits(newDigits);
      const nextIdx = Math.min(index + pastedChars.length, 5);
      inputRefs.current[nextIdx]?.focus();

      if (newDigits.every((d) => d.length === 1)) {
        triggerSubmit(newDigits.join(""));
      }
      return;
    }

    const newDigits = [...digits];
    newDigits[index] = clean.slice(-1);
    setDigits(newDigits);

    // Auto-advance
    if (clean && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    if (newDigits.every((d) => d.length === 1)) {
      triggerSubmit(newDigits.join(""));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      if (!digits[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const triggerSubmit = async (code: string) => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    setHasError(false);
    try {
      const res = await onVerify?.(code);
      if (res === false) {
        setHasError(true);
      } else {
        setIsSuccess(true);
      }
    } catch {
      setHasError(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResend = async () => {
    if (countdown > 0) return;
    setDigits(["", "", "", "", "", ""]);
    setHasError(false);
    setCountdown(initialCountdown);
    await onResend?.();
    inputRefs.current[0]?.focus();
  };

  return (
    <div className={`w-full max-w-md mx-auto ${className}`}>
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        className={cardClassName}
      >
        {/* Top bar with back button */}
        {onBack && (
          <button
            onClick={onBack}
            className="group mb-5 inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="size-3.5 transition-transform group-hover:-translate-x-0.5" />
            <span>Back</span>
          </button>
        )}

        {/* Mail Icon & Title */}
        <div className="flex flex-col items-center text-center">
          <div className="grid size-12 place-items-center rounded-2xl bg-primary/10 text-primary border border-primary/20 shadow-sm">
            <Mail className="size-5" />
          </div>
          <h2 className="mt-4 font-display text-2xl font-bold tracking-tight">Check your inbox</h2>
          <p className="mt-1 text-xs sm:text-sm text-muted-foreground max-w-xs">
            We sent a 6-digit verification code to <span className="font-semibold text-foreground">{email}</span>
          </p>
        </div>

        {/* Six-digit grouped OTP input */}
        <div className="mt-8 flex flex-col items-center">
          <Shake shakeKey={hasError}>
            <div className="flex items-center gap-2 sm:gap-2.5">
              {/* First Group (3 digits) */}
              <div className="flex items-center gap-1.5 sm:gap-2">
                {[0, 1, 2].map((idx) => (
                  <input
                    key={idx}
                    ref={(el) => {
                      inputRefs.current[idx] = el;
                    }}
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={1}
                    value={digits[idx]}
                    disabled={isSubmitting || isSuccess}
                    onChange={(e) => handleInputChange(idx, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(idx, e)}
                    className={`size-11 sm:size-12 rounded-xl text-center font-mono text-xl font-extrabold outline-none transition-all duration-150 ${
                      hasError
                        ? "border-2 border-destructive bg-destructive/5 text-destructive"
                        : digits[idx]
                          ? "neu-inset border border-primary/50 text-foreground"
                          : "neu-inset border border-border/80 text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
                    }`}
                  />
                ))}
              </div>

              {/* Group separator pill */}
              <div className="w-2.5 h-0.5 rounded-full bg-muted-foreground/40" />

              {/* Second Group (3 digits) */}
              <div className="flex items-center gap-1.5 sm:gap-2">
                {[3, 4, 5].map((idx) => (
                  <input
                    key={idx}
                    ref={(el) => {
                      inputRefs.current[idx] = el;
                    }}
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={1}
                    value={digits[idx]}
                    disabled={isSubmitting || isSuccess}
                    onChange={(e) => handleInputChange(idx, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(idx, e)}
                    className={`size-11 sm:size-12 rounded-xl text-center font-mono text-xl font-extrabold outline-none transition-all duration-150 ${
                      hasError
                        ? "border-2 border-destructive bg-destructive/5 text-destructive"
                        : digits[idx]
                          ? "neu-inset border border-primary/50 text-foreground"
                          : "neu-inset border border-border/80 text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
                    }`}
                  />
                ))}
              </div>
            </div>
          </Shake>

          {hasError && (
            <p className="mt-3 text-xs font-semibold text-destructive">
              Invalid verification code. Please double check and try again.
            </p>
          )}

          {isSuccess && (
            <div className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-sage">
              <CheckCircle2 className="size-4" />
              <span>Email verified successfully!</span>
            </div>
          )}

          {/* Resend Countdown */}
          <div className="mt-6 flex items-center justify-between w-full text-xs">
            <span className="text-muted-foreground">Didn&apos;t receive the code?</span>
            {countdown > 0 ? (
              <span className="font-mono font-medium text-muted-foreground">
                Resend in <strong className="text-foreground">00:{String(countdown).padStart(2, "0")}</strong>
              </span>
            ) : (
              <button
                type="button"
                onClick={handleResend}
                className="font-semibold text-primary hover:underline flex items-center gap-1"
              >
                <RefreshCw className="size-3" />
                <span>Resend code</span>
              </button>
            )}
          </div>

          {/* Submit Action */}
          <button
            type="button"
            disabled={digits.some((d) => !d) || isSubmitting || isSuccess}
            onClick={() => triggerSubmit(digits.join(""))}
            className="neu-press glow-primary mt-6 w-full rounded-xl bg-primary py-3 text-sm font-bold text-primary-foreground shadow-md disabled:opacity-50 disabled:pointer-events-none transition-all"
          >
            {isSubmitting ? "Verifying code…" : "Verify and Continue"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
