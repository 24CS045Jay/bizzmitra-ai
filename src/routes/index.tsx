import { Link, createFileRoute } from "@tanstack/react-router";
import { motion } from "motion/react";
import { ArrowRight, Check, Minus } from "lucide-react";

import { MiniDemo } from "@/components/MiniDemo";
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
        <div className="flex items-center gap-2">
          <Link to="/login" className="rounded-lg px-3 py-2 text-sm font-medium hover:text-primary">
            Log in
          </Link>
          <Link
            to="/signup"
            className="neu-press rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground"
          >
            Start free
          </Link>
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
  return (
    <section className="grain relative overflow-hidden">
      <ConnectingLines />
      <div className="mx-auto grid max-w-7xl gap-12 px-5 pb-20 pt-16 sm:px-8 lg:grid-cols-[1.15fr_0.85fr] lg:pb-28 lg:pt-24">
        <div>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-xs font-semibold uppercase tracking-[0.22em] text-primary"
          >
            AI business transformation companion
          </motion.p>
          <h1 className="mt-5 font-display text-[clamp(3rem,8.4vw,7rem)] font-extrabold leading-[0.92] text-balance-tight">
            <WordReveal text="From business problem" />
            <br />
            <WordReveal text="to blueprint," accentWords={["blueprint"]} delay={0.16} />
            <br />
            <WordReveal text="in one workspace." delay={0.3} />
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
              className="neu-press inline-flex items-center gap-2 rounded-2xl bg-primary px-7 py-4 text-base font-semibold text-primary-foreground"
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

        <Stagger className="mt-12 overflow-hidden rounded-2xl bg-card">
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
                className="h-full rounded-2xl bg-card p-6 shadow-[0_1px_0_var(--color-border)] hover:shadow-lift"
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
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <Reveal>
          <h2 className="font-display text-[clamp(2.2rem,5vw,4rem)] font-extrabold leading-[0.98] text-balance-tight">
            Pricing that scales with the squad.
          </h2>
        </Reveal>
        <Stagger className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {PRICING.map((p) => (
            <StaggerItem key={p.name}>
              <motion.div
                whileHover={{ y: -4 }}
                transition={{ duration: 0.15 }}
                className={cn(
                  "flex h-full flex-col rounded-2xl p-6",
                  p.featured ? "neu ring-1 ring-primary/40" : "bg-card",
                )}
              >
                {p.featured ? (
                  <span className="mb-3 w-fit rounded-full bg-primary px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary-foreground">
                    Most picked
                  </span>
                ) : null}
                <h3 className="font-display text-xl font-bold">{p.name}</h3>
                <p className="mt-2 font-display text-4xl font-extrabold">
                  {p.price}
                  <span className="text-sm font-medium text-muted-foreground">{p.period}</span>
                </p>
                <p className="mt-2 text-sm text-muted-foreground">{p.blurb}</p>
                <ul className="mt-5 flex-1 space-y-2 text-sm">
                  {p.features.map((f) => (
                    <li key={f} className="flex gap-2">
                      <Check className="mt-0.5 size-3.5 shrink-0 text-sage" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  to="/signup"
                  className={cn(
                    "neu-press mt-6 rounded-xl px-4 py-3 text-center text-sm font-semibold",
                    p.featured
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-secondary-foreground",
                  )}
                >
                  {p.cta}
                </Link>
              </motion.div>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
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
              <figure className="h-full rounded-2xl bg-card p-6">
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

function Footer() {
  return (
    <footer className="border-t border-border bg-surface/60 py-12">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-6 px-5 sm:px-8">
        <div>
          <p className="font-display text-2xl font-extrabold">BizzMitra-AI</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Your AI business transformation companion.
          </p>
        </div>
        <div className="flex flex-wrap gap-x-8 gap-y-2 text-sm text-muted-foreground">
          <a href="#modules" className="hover:text-foreground">
            Modules
          </a>
          <a href="#pricing" className="hover:text-foreground">
            Pricing
          </a>
          <Link to="/login" className="hover:text-foreground">
            Log in
          </Link>
          <Link to="/signup" className="hover:text-foreground">
            Start free
          </Link>
        </div>
      </div>
      <p className="mx-auto mt-8 max-w-6xl px-5 text-xs text-muted-foreground sm:px-8">
        © {new Date().getFullYear()} BizzMitra-AI. Prototype build.
      </p>
    </footer>
  );
}

function Landing() {
  return (
    <div className="min-h-screen">
      <Nav />
      <Hero />
      <Compare />
      <Modules />
      <Testimonials />
      <Pricing />
      <Footer />
    </div>
  );
}
