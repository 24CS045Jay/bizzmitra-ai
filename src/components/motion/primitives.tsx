import { motion, useInView, type Variants } from "motion/react";
import { useEffect, useRef, useState, type ReactNode } from "react";

import { cn } from "@/lib/utils";

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } },
};

export function Reveal({
  children,
  className,
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-60px" }}
      variants={{
        hidden: { opacity: 0, y: 16 },
        show: { opacity: 1, y: 0, transition: { duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] } },
      }}
    >
      {children}
    </motion.div>
  );
}

export function Stagger({
  children,
  className,
  gap = 0.07,
}: {
  children: ReactNode;
  className?: string;
  gap?: number;
}) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-60px" }}
      variants={{ show: { transition: { staggerChildren: gap } } }}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <motion.div className={className} variants={fadeUp}>
      {children}
    </motion.div>
  );
}

export function PageTransition({ children }: { children: ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}

/** Word-by-word reveal for oversized display headlines. */
export function WordReveal({
  text,
  className,
  accentWords = [],
  delay = 0,
}: {
  text: string;
  className?: string;
  accentWords?: string[];
  delay?: number;
}) {
  const words = text.split(" ");
  return (
    <span className={className}>
      {words.map((w, i) => {
        const clean = w.replace(/[^\w]/g, "").toLowerCase();
        const accent = accentWords.some((a) => a.toLowerCase() === clean);
        return (
          <motion.span
            key={`${w}-${i}`}
            className={cn("inline-block", accent && "text-primary italic font-normal")}
            initial={{ opacity: 0, y: 26 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: delay + i * 0.04, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            {w}
            {i < words.length - 1 ? "\u00A0" : ""}
          </motion.span>
        );
      })}
    </span>
  );
}

/** Word-by-word typewriter for simulated AI streaming. */
export function Typewriter({
  text,
  speed = 18,
  delay = 0,
  className,
  onDone,
}: {
  text: string;
  speed?: number;
  delay?: number;
  className?: string;
  onDone?: () => void;
}) {
  const [shown, setShown] = useState("");
  useEffect(() => {
    setShown("");
    let i = 0;
    let id: ReturnType<typeof setInterval>;
    const start = setTimeout(() => {
      id = setInterval(() => {
        i += 1;
        setShown(text.slice(0, i));
        if (i >= text.length) {
          clearInterval(id);
          onDone?.();
        }
      }, speed);
    }, delay);
    return () => {
      clearTimeout(start);
      clearInterval(id);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, speed, delay]);

  return <span className={className}>{shown}</span>;
}

/** Breathing three-dot AI indicator — deliberately not a spinner. */
export function ThinkingDots({ label }: { label?: string }) {
  return (
    <div className="flex items-center gap-2.5">
      <div className="flex items-center gap-1.5">
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="size-2 rounded-full bg-primary"
            animate={{ scale: [0.7, 1.25, 0.7], opacity: [0.35, 1, 0.35] }}
            transition={{ duration: 1.1, repeat: Infinity, delay: i * 0.16, ease: "easeInOut" }}
          />
        ))}
      </div>
      {label ? <span className="text-xs text-muted-foreground">{label}</span> : null}
    </div>
  );
}

export function CountUp({
  to,
  duration = 1.1,
  decimals = 0,
  prefix = "",
  suffix = "",
  className,
}: {
  to: number;
  duration?: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const [val, setVal] = useState(0);

  useEffect(() => {
    if (!inView) return;
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / (duration * 1000));
      const eased = 1 - Math.pow(1 - p, 3);
      setVal(to * eased);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, to, duration]);

  return (
    <span ref={ref} className={className}>
      {prefix}
      {val.toLocaleString("en-IN", {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      })}
      {suffix}
    </span>
  );
}
