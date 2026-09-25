import { useState, useRef, useEffect } from "react";
import { Link, createFileRoute } from "@tanstack/react-router";
import { motion, AnimatePresence } from "motion/react";
import { ArrowRight, Check, Minus } from "lucide-react";

import { MiniDemo } from "@/components/MiniDemo";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/hooks/useTheme";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LanguageSelector } from "@/components/LanguageSelector";
import { LightRays } from "@/components/effects/LightRays";
import { Navigation12 } from "@/components/Navigation12";
import { LiveProcessStreamer } from "@/components/LiveProcessStreamer";
import { Pricing13 } from "@/components/Pricing13";
import { Footer11 } from "@/components/Footer11";
import { ThreeDLetterSwap } from "@/components/ThreeDLetterSwap";
import { TransparentRobotCanvas } from "@/components/TransparentRobotCanvas";

import { Reveal, Stagger, StaggerItem, WordReveal } from "@/components/motion/primitives";
import { COMPETITOR_ROWS, MODULES, PRICING, TESTIMONIALS } from "@/lib/demo-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "BizzMitra-AI — From business problem to blueprint" },
      {
        name: "description",
        content:
          "Describe a business problem. BizzMitra-AI runs discovery, frames it, and generates architecture, process, data, UX and a costed roadmap in one connected workspace.",
      },
      { property: "og:title", content: "BizzMitra-AI — From business problem to blueprint" },
      {
        property: "og:description",
        content:
          "One AI-guided workspace that turns a business problem into an implementation-ready blueprint.",
      },
    ],
  }),
  component: Landing,
});

function Nav() {
  const { session, signOut } = useAuth();
  return (


    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/85 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8">
        <Link to="/" className="flex items-center gap-2.5 group">
          <img
            src="/logo.png"
            alt="BizzMitra"
            className="size-8 rounded-lg object-cover shadow-sm ring-1 ring-primary/40 group-hover:scale-105 transition-transform"
          />
          <span className="font-display text-lg font-extrabold tracking-tight">BizzMitra-AI</span>
        </Link>
        <nav className="hidden items-center gap-7 text-sm text-muted-foreground md:flex">
          <a href="#modules" className="hover:text-foreground">
            Modules
          </a>
          <a href="#compare" className="hover:text-foreground">
            Why one workspace
          </a>
          <a href="#pricing" className="hover:text-foreground">
            Pricing
          </a>
        </nav>
        <div className="flex items-center gap-2.5">
          <ThemeToggle />
          <LanguageSelector variant="compact" />
          {session ? (
            <>
              <Link
                to="/dashboard"
                className="neu-press rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground glow-primary"
              >
                Go to workspace
              </Link>
              <button
                onClick={() => signOut()}
                className="rounded-lg px-3 py-2 text-sm font-medium hover:text-primary"
              >
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="rounded-lg px-3 py-2 text-sm font-medium hover:text-primary">
                Log in
              </Link>
              <Link
                to="/signup"
                className="neu-press rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground glow-primary"
              >
                Start free
              </Link>
            </>
          )}

        </div>
      </div>
    </header>
  );
}

function ConnectingLines() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 600 400"
      className="pointer-events-none absolute -right-24 top-6 hidden w-[46rem] opacity-[0.5] lg:block"
    >
      {[
        "M20,200 C160,60 260,60 400,120",
        "M20,200 C160,200 260,200 400,200",
        "M20,200 C160,340 260,340 400,280",
        "M400,120 C500,140 520,180 560,200",
        "M400,200 L560,200",
        "M400,280 C500,260 520,220 560,200",
      ].map((d, i) => (
        <motion.path
          key={d}
          d={d}
          fill="none"
          stroke="var(--primary)"
          strokeWidth={1.2}
          strokeOpacity={0.45}
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 2.2, delay: 0.5 + i * 0.18, ease: "easeInOut" }}
        />
      ))}
      {[
        [20, 200],
        [400, 120],
        [400, 200],
        [400, 280],
        [560, 200],
      ].map(([cx, cy], i) => (
        <motion.circle
          key={`${cx}-${cy}`}
          cx={cx}
          cy={cy}
          r={5}
          fill="var(--primary)"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.9 + i * 0.2, type: "spring", stiffness: 300 }}
        />
      ))}
    </svg>
  );
}

function FixedLandingBackground() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [isSnapping, setIsSnapping] = useState(false);
  const snapTriggerRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    const handleSnap = () => {
      setIsSnapping(true);
      if (snapTriggerRef.current) {
        snapTriggerRef.current();
      }
      const t = setTimeout(() => setIsSnapping(false), 900);
      return () => clearTimeout(t);
    };

    window.addEventListener("bizzmitra:theme-snap", handleSnap);
    return () => window.removeEventListener("bizzmitra:theme-snap", handleSnap);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none">
      {/* Dark Theme Background */}
      <img
        src="/landing-bg-dark.png"
        alt="BizzMitra AI Dark Background"
        className={cn(
          "absolute inset-0 h-full w-full object-cover object-center transition-opacity duration-700 ease-in-out",
          isDark ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
      />
      {/* Light Theme Background */}
      <img
        src="/landing-bg-light.png"
        alt="BizzMitra AI Light Background"
        className={cn(
          "absolute inset-0 h-full w-full object-cover object-center transition-opacity duration-700 ease-in-out",
          !isDark ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
      />

      {/* Seamless Animated 3D Robot Figure (With Lightweight Translucent Dark Backdrop for Rich Contrast) */}
      <div className="absolute top-[46%] sm:top-[48%] -translate-y-1/2 right-4 sm:right-10 md:right-16 lg:right-24 xl:right-32 z-10 flex items-center justify-end pointer-events-none select-none">
        <div className="relative w-[320px] sm:w-[410px] lg:w-[480px] xl:w-[540px] max-w-[52vw] p-3 sm:p-4 rounded-3xl bg-black/40 dark:bg-black/55 backdrop-blur-md border border-white/15 dark:border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.35)] filter contrast-[1.05] brightness-[1.04] dark:brightness-100">
          {/* Subtle soft ambient aura behind robot figure */}
          <div className="absolute inset-0 -z-10 rounded-3xl bg-gradient-to-tr from-primary/15 via-black/25 to-blue-500/15 blur-xl opacity-75" />
          <TransparentRobotCanvas
            videoSrc="/robot-animation-2.mp4"
            className="w-full h-auto"
            onSnapReady={(trigger) => {
              snapTriggerRef.current = trigger;
            }}
            onSnapMoment={() => {
              setIsSnapping(true);
              setTimeout(() => setIsSnapping(false), 900);
            }}
          />
        </div>
      </div>

      {/* Theme Snap Wave Transition Effect */}
      <AnimatePresence>
        {isSnapping && (
          <motion.div
            initial={{ opacity: 0.85, scale: 0.98 }}
            animate={{ opacity: 0, scale: 1.04 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.85, ease: "easeOut" }}
            className="pointer-events-none absolute inset-0 z-10 bg-gradient-to-tr from-primary/30 via-white/30 to-amber-300/30 backdrop-blur-[1px]"
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function Hero() {
  const { theme } = useTheme();

  return (
    <section className="relative overflow-hidden">
      {theme === "dark" && (
        <div className="pointer-events-none absolute inset-0 z-0 h-full w-full overflow-hidden opacity-25">
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
      <ConnectingLines />
      <div className="relative z-10 mx-auto grid max-w-7xl gap-10 px-5 pb-20 pt-16 sm:px-8 lg:grid-cols-[1.1fr_0.9fr] lg:pb-28 lg:pt-20 items-center">
        <div className="rounded-3xl bg-white/80 dark:bg-black/75 backdrop-blur-xl p-6 sm:p-9 border border-white/90 dark:border-white/15 shadow-2xl">
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/10 dark:bg-primary/20 px-3.5 py-1 text-xs font-bold uppercase tracking-[0.22em] text-primary backdrop-blur-md shadow-sm"
          >
            <span className="size-1.5 rounded-full bg-primary animate-pulse" />
            AI business transformation companion
          </motion.div>
          <h1 className="mt-5 font-display text-[clamp(2.5rem,6.5vw,5.5rem)] font-black leading-[0.98] sm:leading-[0.95] text-balance-tight text-slate-950 dark:text-white drop-shadow-sm">
            <ThreeDLetterSwap
              text="From business problem"
              frontClassName="text-slate-950 dark:text-white font-black"
              backClassName="text-primary font-black"
              delay={0.08}
            />
            <br />
            <ThreeDLetterSwap
              text="to blueprint,"
              accentWords={["blueprint"]}
              accentClassName="text-primary italic font-display font-black"
              frontClassName="text-slate-950 dark:text-white font-black"
              backClassName="text-primary font-black"
              delay={0.2}
            />
            <br />
            <ThreeDLetterSwap
              text="in one workspace."
              frontClassName="text-slate-950 dark:text-white font-black"
              backClassName="text-primary font-black"
              delay={0.32}
            />
          </h1>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.5 }}
            className="mt-6 max-w-xl text-lg leading-relaxed text-slate-800 dark:text-zinc-200 font-semibold drop-shadow-sm"
          >
            Discovery, framing, solution, stack, architecture, process, data, UX and a costed
            roadmap — generated as one connected, versioned chain. Not five disconnected tools.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.95, duration: 0.5 }}
            className="mt-8 flex flex-wrap items-center gap-4"
          >
            <Link
              to="/signup"
              className="neu-press inline-flex items-center gap-2 rounded-2xl bg-primary px-7 py-4 text-base font-bold text-primary-foreground glow-primary shadow-2xl"
            >
              Frame your first problem <ArrowRight className="size-4" />
            </Link>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="lg:pt-4"
        >
          <MiniDemo />
        </motion.div>
      </div>
    </section>
  );
}

function Compare() {
  return (
    <section id="compare" className="border-y border-white/20 dark:border-white/10 bg-transparent py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <div className="rounded-3xl bg-white/80 dark:bg-black/75 backdrop-blur-xl p-6 sm:p-8 border border-white/90 dark:border-white/15 shadow-xl max-w-3xl mb-8">
          <Reveal>
            <h2 className="font-display text-[clamp(2.2rem,5vw,4rem)] font-black leading-[0.98] text-balance-tight text-slate-950 dark:text-white drop-shadow-sm">
              Five tools, five contexts. Or <span className="text-primary font-black">one chain.</span>
            </h2>
          </Reveal>
          <Reveal delay={0.08}>
            <p className="mt-4 text-slate-800 dark:text-zinc-200 font-semibold leading-relaxed">
              Every competitor owns one slice of the journey and forgets the rest. BizzMitra keeps the
              whole chain in a single workspace, so the roadmap still references the architecture that
              referenced the framing.
            </p>
          </Reveal>
        </div>

        <div className="mt-8 overflow-x-auto max-w-full rounded-3xl border border-white/90 dark:border-white/15 shadow-2xl backdrop-blur-2xl bg-white/90 dark:bg-black/75">
          <Stagger className="min-w-[540px]">
            <div className="grid grid-cols-[1.1fr_1fr_1fr] gap-4 border-b border-black/10 dark:border-white/10 px-5 py-4 text-xs font-black uppercase tracking-[0.14em] text-slate-900 dark:text-zinc-200 sm:px-7">
              <span>Capability</span>
              <span>Today&apos;s stack</span>
              <span className="text-primary font-black">BizzMitra-AI</span>
            </div>
            {COMPETITOR_ROWS.map((r) => (
              <StaggerItem key={r.capability}>
                <div className="grid grid-cols-[1.1fr_1fr_1fr] items-start gap-4 border-b border-black/10 dark:border-white/10 px-5 py-5 text-sm last:border-0 sm:px-7">
                  <span className="font-black text-slate-950 dark:text-white">{r.capability}</span>
                  <span className="flex gap-2 text-slate-700 dark:text-zinc-300 font-medium">
                    <Minus className="mt-0.5 size-3.5 shrink-0" />
                    {r.them}
                  </span>
                  <span className="flex gap-2 font-black text-slate-950 dark:text-white">
                    <Check className="mt-0.5 size-3.5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                    {r.us}
                  </span>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </div>
    </section>
  );
}

function Modules() {
  return (
    <section id="modules" className="py-20 sm:py-28 bg-transparent">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <div className="rounded-3xl bg-white/80 dark:bg-black/75 backdrop-blur-xl p-6 sm:p-8 border border-white/90 dark:border-white/15 shadow-xl max-w-3xl mb-12">
          <Reveal>
            <p className="text-xs font-black uppercase tracking-[0.22em] text-primary">
              Eleven modules, one thread
            </p>
          </Reveal>
          <Reveal delay={0.06}>
            <h2 className="mt-3 font-display text-[clamp(2.2rem,5vw,4rem)] font-black leading-[0.98] text-balance-tight text-slate-950 dark:text-white drop-shadow-sm">
              Each module reads what the last one wrote.
            </h2>
          </Reveal>
        </div>

        <Stagger className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3" gap={0.05}>
          {MODULES.map((m, i) => (
            <StaggerItem key={m.key}>
              <motion.article
                whileHover={{ y: -4, scale: 1.015 }}
                transition={{ duration: 0.15 }}
                className="group h-full rounded-3xl bg-white/90 dark:bg-black/75 backdrop-blur-xl p-6 border border-white/90 dark:border-white/15 shadow-xl hover:border-primary/50 transition-colors"
              >
                <span className="font-mono text-xs text-primary font-black">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-3 font-display text-xl font-black text-slate-950 dark:text-white">{m.name}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-800 dark:text-zinc-200 font-medium">{m.desc}</p>
              </motion.article>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}

function Pricing() {
  return (
    <section id="pricing" className="border-t border-white/20 dark:border-white/10 bg-transparent py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-5 sm:px-8 mb-12">
        <div className="rounded-3xl bg-white/80 dark:bg-black/75 backdrop-blur-xl p-6 sm:p-8 border border-white/90 dark:border-white/15 shadow-xl max-w-3xl mx-auto text-center">
          <Reveal>
            <p className="text-xs font-black uppercase tracking-[0.22em] text-primary">
              Flexible Consulting Tiers
            </p>
          </Reveal>
          <Reveal delay={0.06}>
            <h2 className="mt-3 font-display text-[clamp(2.2rem,5vw,4rem)] font-black leading-[0.98] text-balance-tight text-slate-950 dark:text-white drop-shadow-sm">
              Pricing that scales with the squad.
            </h2>
          </Reveal>
        </div>
      </div>
      <div className="rounded-3xl bg-white/90 dark:bg-black/75 backdrop-blur-2xl p-4 sm:p-6 border border-white/90 dark:border-white/15 shadow-2xl mx-auto max-w-6xl">
        <Pricing13 />
      </div>
    </section>
  );
}

function Testimonials() {
  return (
    <section className="py-20 sm:py-28 bg-transparent">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <div className="rounded-3xl bg-white/80 dark:bg-black/75 backdrop-blur-xl p-6 sm:p-8 border border-white/90 dark:border-white/15 shadow-xl max-w-3xl mb-8">
          <Reveal>
            <p className="text-xs font-black uppercase tracking-[0.22em] text-primary">
              Used by transformation teams at
            </p>
          </Reveal>
          <Stagger className="mt-4 flex flex-wrap items-center gap-x-8 gap-y-3 font-display text-lg font-black text-slate-950 dark:text-white">
            {["Nexa Retail", "Kelder Group", "Tavara", "Orbiq Logistics", "Sundara Bank"].map((l) => (
              <StaggerItem key={l}>{l}</StaggerItem>
            ))}
          </Stagger>
        </div>

        <Stagger className="mt-8 grid gap-4 md:grid-cols-3">
          {TESTIMONIALS.map((t) => (
            <StaggerItem key={t.name}>
              <figure className="h-full rounded-3xl bg-white/90 dark:bg-black/75 backdrop-blur-xl p-6 border border-white/90 dark:border-white/15 shadow-xl">
                <blockquote className="font-display text-lg font-bold leading-snug text-slate-950 dark:text-white">
                  “{t.quote}”
                </blockquote>
                <figcaption className="mt-4 text-sm text-slate-800 dark:text-zinc-300 font-medium">
                  <span className="font-black text-slate-950 dark:text-white">{t.name}</span> — {t.role}
                </figcaption>
              </figure>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}

function Landing() {
  return (
    <div className="relative min-h-screen pt-4 overflow-x-clip bg-transparent">
      <FixedLandingBackground />
      <div className="relative z-10">
        <Navigation12 />
        <div className="pt-20 sm:pt-22">
          <LiveProcessStreamer />
        </div>
        <Hero />
        <Compare />
        <Modules />
        <Testimonials />
        <Pricing />
        <Footer11 />
      </div>
    </div>
  );
}
