import { Link, createFileRoute } from "@tanstack/react-router";
import { motion } from "motion/react";
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
        <Link to="/" className="flex items-center gap-2.5">
          <span className="grid size-8 place-items-center rounded-lg bg-primary font-display text-sm font-extrabold text-primary-foreground">
            B
          </span>
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

function Hero() {
  const { theme } = useTheme();

  return (
    <section className="grain relative overflow-hidden">
      {theme === "dark" && (
        <div className="pointer-events-none absolute inset-0 z-0 h-full w-full overflow-hidden opacity-40">
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
      <div className="relative z-10 mx-auto grid max-w-7xl gap-12 px-5 pb-20 pt-16 sm:px-8 lg:grid-cols-[1.15fr_0.85fr] lg:pb-28 lg:pt-24">
        <div>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-xs font-semibold uppercase tracking-[0.22em] text-primary"
          >
            AI business transformation companion
          </motion.p>
          <h1 className="mt-5 font-display text-[clamp(3rem,8.4vw,7rem)] font-extrabold leading-[0.98] sm:leading-[0.95] text-balance-tight">
            <ThreeDLetterSwap text="From business problem" delay={0.08} />
            <br />
            <ThreeDLetterSwap
              text="to blueprint,"
              accentWords={["blueprint"]}
              accentClassName="text-primary italic font-display"
              delay={0.2}
            />
            <br />
            <ThreeDLetterSwap text="in one workspace." delay={0.32} />
          </h1>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.5 }}
            className="mt-7 max-w-xl text-lg leading-relaxed text-muted-foreground"
          >
            Discovery, framing, solution, stack, architecture, process, data, UX and a costed
            roadmap — generated as one connected, versioned chain. Not five disconnected tools.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.95, duration: 0.5 }}
            className="mt-9"
          >
            <Link
              to="/signup"
              className="neu-press inline-flex items-center gap-2 rounded-2xl bg-primary px-7 py-4 text-base font-semibold text-primary-foreground glow-primary"
            >
              Frame your first problem <ArrowRight className="size-4" />
            </Link>
            <p className="mt-3 text-xs text-muted-foreground">
              Free workspace. No card. Export what you generate.
            </p>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="lg:pt-6"
        >
          <MiniDemo />
        </motion.div>
      </div>
    </section>
  );
}

function Compare() {
  return (
    <section id="compare" className="border-y border-border bg-surface/60 py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <Reveal>
          <h2 className="max-w-3xl font-display text-[clamp(2.2rem,5vw,4rem)] font-extrabold leading-[0.98] text-balance-tight">
            Five tools, five contexts. Or <span className="text-primary">one chain.</span>
          </h2>
        </Reveal>
        <Reveal delay={0.08}>
          <p className="mt-5 max-w-2xl text-muted-foreground">
            Every competitor owns one slice of the journey and forgets the rest. BizzMitra keeps the
            whole chain in a single workspace, so the roadmap still references the architecture that
            referenced the framing.
          </p>
        </Reveal>

        <Stagger className="mt-12 overflow-hidden rounded-2xl bg-card border border-border/70 neu-reflect shadow-sm">
          <div className="grid grid-cols-[1.1fr_1fr_1fr] gap-4 border-b border-border px-5 py-4 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground sm:px-7">
            <span>Capability</span>
            <span>Today&apos;s stack</span>
            <span className="text-primary">BizzMitra-AI</span>
          </div>
          {COMPETITOR_ROWS.map((r) => (
            <StaggerItem key={r.capability}>
              <div className="grid grid-cols-[1.1fr_1fr_1fr] items-start gap-4 border-b border-border/60 px-5 py-5 text-sm last:border-0 sm:px-7">
                <span className="font-semibold">{r.capability}</span>
                <span className="flex gap-2 text-muted-foreground">
                  <Minus className="mt-0.5 size-3.5 shrink-0" />
                  {r.them}
                </span>
                <span className="flex gap-2">
                  <Check className="mt-0.5 size-3.5 shrink-0 text-sage" />
                  {r.us}
                </span>
              </div>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}

function Modules() {
  return (
    <section id="modules" className="py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <Reveal>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">
            Eleven modules, one thread
          </p>
        </Reveal>
        <Reveal delay={0.06}>
          <h2 className="mt-4 max-w-3xl font-display text-[clamp(2.2rem,5vw,4rem)] font-extrabold leading-[0.98] text-balance-tight">
            Each module reads what the last one wrote.
          </h2>
        </Reveal>

        <Stagger className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3" gap={0.05}>
          {MODULES.map((m, i) => (
            <StaggerItem key={m.key}>
              <motion.article
                whileHover={{ y: -4, scale: 1.015 }}
                transition={{ duration: 0.15 }}
                className="neu-reflect-hover neu-reflect group h-full rounded-2xl bg-card p-6 border border-border/80 shadow-[0_1px_0_var(--color-border)]"
              >
                <span className="font-mono text-xs text-muted-foreground">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-3 font-display text-xl font-bold">{m.name}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{m.desc}</p>
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
    <section id="pricing" className="border-t border-border bg-surface/60 py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-5 sm:px-8 mb-12 text-center">
        <Reveal>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">
            Flexible Consulting Tiers
          </p>
        </Reveal>
        <Reveal delay={0.06}>
          <h2 className="mt-3 font-display text-[clamp(2.2rem,5vw,4rem)] font-extrabold leading-[0.98] text-balance-tight">
            Pricing that scales with the squad.
          </h2>
        </Reveal>
      </div>
      <Pricing13 />
    </section>
  );
}

function Testimonials() {
  return (
    <section className="py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <Reveal>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
            Used by transformation teams at
          </p>
        </Reveal>
        <Stagger className="mt-6 flex flex-wrap items-center gap-x-10 gap-y-4 font-display text-xl font-bold text-muted-foreground/60">
          {["Nexa Retail", "Kelder Group", "Tavara", "Orbiq Logistics", "Sundara Bank"].map((l) => (
            <StaggerItem key={l}>{l}</StaggerItem>
          ))}
        </Stagger>

        <Stagger className="mt-14 grid gap-4 md:grid-cols-3">
          {TESTIMONIALS.map((t) => (
            <StaggerItem key={t.name}>
              <figure className="neu-reflect-hover neu-reflect h-full rounded-2xl bg-card p-6 border border-border/80">
                <blockquote className="font-display text-lg font-semibold leading-snug">
                  “{t.quote}”
                </blockquote>
                <figcaption className="mt-4 text-sm text-muted-foreground">
                  <span className="font-semibold text-foreground">{t.name}</span> — {t.role}
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
    <div className="min-h-screen pt-4">
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
  );
}
