import * as React from "react";
import { motion } from "framer-motion";
import { Mail, CheckCircle2, RefreshCw, ArrowLeft } from "lucide-react";
import { Shake } from "./motion/primitives";

interface Auth6Props {
  email?: string;
  defaultLength?: 6 | 8;
  onVerify?: (code: string) => Promise<boolean | string | void> | boolean | string | void;
  onResend?: () => Promise<void> | void;
  onBack?: () => void;
  initialCountdown?: number;
  className?: string;
  cardClassName?: string;
}

export function Auth6({
  email = "alex@enterprise.com",
  defaultLength = 8,
  onVerify,
  onResend,
  onBack,
  initialCountdown = 30,
  className = "",
  cardClassName = "neu neu-reflect p-7 sm:p-9 rounded-2xl relative overflow-hidden",
}: Auth6Props) {
  const [codeLength, setCodeLength] = React.useState<6 | 8>(defaultLength);
  const [digits, setDigits] = React.useState<string[]>(() =>
    Array(defaultLength).fill("")
  );
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [countdown, setCountdown] = React.useState(initialCountdown);
  const [hasError, setHasError] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [isSuccess, setIsSuccess] = React.useState(false);
  const inputRefs = React.useRef<(HTMLInputElement | null)[]>([]);

  // Countdown timer
  React.useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => setCountdown((c) => c - 1), 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  // Sync initialCountdown when it changes
  React.useEffect(() => {
    setCountdown(initialCountdown);
  }, [initialCountdown]);

  // Focus first input on mount or length change
  React.useEffect(() => {
    inputRefs.current[0]?.focus();
  }, [codeLength]);

  const switchLength = (newLen: 6 | 8) => {
    if (newLen === codeLength) return;
    setCodeLength(newLen);
    setDigits(Array(newLen).fill(""));
    setHasError(false);
    setErrorMessage(null);
  };

  const handleInputChange = (index: number, val: string) => {
    // Only accept numbers
    const clean = val.replace(/\D/g, "");
    if (!clean && val !== "") return;

    setHasError(false);
    setErrorMessage(null);

    // Handle paste of multiple digits
    if (clean.length > 1) {
      const targetLen = clean.length >= 8 ? 8 : clean.length === 6 ? 6 : codeLength;
      if (targetLen !== codeLength) {
        setCodeLength(targetLen);
      }
      const newDigits = Array(targetLen).fill("");
      const chars = clean.slice(0, targetLen).split("");
      chars.forEach((ch, idx) => {
        newDigits[idx] = ch;
      });
      setDigits(newDigits);
      const nextIdx = Math.min(chars.length, targetLen - 1);
      inputRefs.current[nextIdx]?.focus();

      if (newDigits.every((d) => d && d.length === 1)) {
        triggerSubmit(newDigits.join(""));
      }
      return;
    }

    const newDigits = [...digits];
    newDigits[index] = clean.slice(-1);
    setDigits(newDigits);

    // Auto-advance
    if (clean && index < codeLength - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    if (newDigits.every((d) => d && d.length === 1)) {
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
    } else if (e.key === "ArrowRight" && index < codeLength - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const triggerSubmit = async (code: string) => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    setHasError(false);
    setErrorMessage(null);
    try {
      const res = await onVerify?.(code);
      if (typeof res === "string") {
        setHasError(true);
        setErrorMessage(res);
      } else if (res === false) {
        setHasError(true);
        setErrorMessage("Invalid verification code. Please check and try again.");
      } else {
        setIsSuccess(true);
      }
    } catch (err: any) {
      setHasError(true);
      setErrorMessage(err?.message || "Verification failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResend = async () => {
    if (countdown > 0) return;
    setDigits(Array(codeLength).fill(""));
    setHasError(false);
    setCountdown(initialCountdown);
    await onResend?.();
    inputRefs.current[0]?.focus();
  };

  const half = codeLength / 2;
  const firstGroup = Array.from({ length: half }, (_, i) => i);
  const secondGroup = Array.from({ length: half }, (_, i) => i + half);

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
            We sent a {codeLength}-digit verification code to <span className="font-semibold text-foreground">{email}</span>
          </p>

          {/* Quick toggle for 8-digit vs 6-digit codes */}
          <div className="mt-4 inline-flex items-center rounded-xl p-1 bg-muted/40 border border-border/60 text-xs">
            <button
              type="button"
              onClick={() => switchLength(8)}
              className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                codeLength === 8
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              8-Digit Code
            </button>
            <button
              type="button"
              onClick={() => switchLength(6)}
              className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                codeLength === 6
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              6-Digit Code
            </button>
          </div>
        </div>

        {/* Grouped OTP input */}
        <div className="mt-6 flex flex-col items-center">
          <Shake shakeKey={hasError}>
            <div className="flex items-center gap-1.5 sm:gap-2 justify-center flex-nowrap">
              {/* First Group */}
              <div className="flex items-center gap-1 sm:gap-1.5">
                {firstGroup.map((idx) => (
                  <input
                    key={idx}
                    ref={(el) => {
                      inputRefs.current[idx] = el;
                    }}
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={1}
                    value={digits[idx] || ""}
                    disabled={isSubmitting || isSuccess}
                    onChange={(e) => handleInputChange(idx, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(idx, e)}
                    className={`${
                      codeLength === 8
                        ? "size-9 sm:size-11 rounded-lg sm:rounded-xl text-base sm:text-lg"
                        : "size-11 sm:size-12 rounded-xl text-xl"
                    } text-center font-mono font-extrabold outline-none transition-all duration-150 ${
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
              <div className="w-1.5 sm:w-2.5 h-0.5 rounded-full bg-muted-foreground/40 shrink-0" />

              {/* Second Group */}
              <div className="flex items-center gap-1 sm:gap-1.5">
                {secondGroup.map((idx) => (
                  <input
                    key={idx}
                    ref={(el) => {
                      inputRefs.current[idx] = el;
                    }}
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={1}
                    value={digits[idx] || ""}
                    disabled={isSubmitting || isSuccess}
                    onChange={(e) => handleInputChange(idx, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(idx, e)}
                    className={`${
                      codeLength === 8
                        ? "size-9 sm:size-11 rounded-lg sm:rounded-xl text-base sm:text-lg"
                        : "size-11 sm:size-12 rounded-xl text-xl"
                    } text-center font-mono font-extrabold outline-none transition-all duration-150 ${
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
            <p className="mt-3 text-xs font-semibold text-destructive text-center max-w-xs">
              {errorMessage || "Invalid verification code. Please double check and try again."}
            </p>
          )}

          {isSuccess && (
            <div className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-emerald-500">
              <CheckCircle2 className="size-4" />
              <span>Email verified successfully!</span>
            </div>
          )}

          <p className="mt-3 text-[11px] text-muted-foreground text-center">
            💡 Enter your {codeLength}-digit code above or paste it directly. You can also click the confirmation link in your inbox.
          </p>

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
