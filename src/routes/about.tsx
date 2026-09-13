import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Sparkles, Shield, Cpu, Network, CheckCircle2 } from "lucide-react";
import { Navigation12 } from "@/components/Navigation12";
import { Showcase5 } from "@/components/Showcase5";
import { Footer11 } from "@/components/Footer11";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/primitives";

const TRUST_LOGOS = [
  { name: "Nexa Retail", badge: "Enterprise Retail" },
  { name: "Kelder Group", badge: "Consulting Practice" },
  { name: "Tavara Global", badge: "Cloud Systems" },
  { name: "Orbiq Logistics", badge: "Supply Chain" },
  { name: "Sundara Bank", badge: "Fintech Core" },
];

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About BizzMitra-AI — Enterprise Transformation Intelligence" },
      {
        name: "description",
        content:
          "Discover how BizzMitra-AI pairs seasoned enterprise architects with deterministic AI intelligence to bridge business discovery and technical execution.",
      },
      { property: "og:title", content: "About BizzMitra-AI — Enterprise Transformation Intelligence" },
      {
        property: "og:description",
        content:
          "Eliminating the translation gap between business analysts and production engineering squads.",
      },
    ],
  }),
  component: AboutPage,
});

const PILLARS = [
  {
    icon: <Cpu className="size-5 text-primary" />,
    title: "Deterministic Synthesis",
    desc: "AI engines grounded by mathematical 5-layer graph models. No hallucinations in entity-relationship maps, BPMN swimlanes, or cloud costing.",
  },
  {
    icon: <Network className="size-5 text-sage" />,
    title: "Zero Context-Drop",
    desc: "Every constraint, compliance note, and stakeholder requirement recorded in discovery automatically ripples into architecture and delivery sprints.",
  },
  {
    icon: <Shield className="size-5 text-coral-500" />,
    title: "Enterprise Trust First",
    desc: "SOC2 Type II verified, zero customer data retention for model training, and customer-managed keys for sensitive enterprise schemas.",
  },
];

function AboutPage() {
  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/20">
      {/* Floating Pill Navigation */}
      <Navigation12 />

      <main className="pt-28 sm:pt-36">
        {/* Page Hero Header */}
        <section className="relative px-5 sm:px-8 pb-12 pt-6">
          <div className="mx-auto max-w-5xl text-center">
            <Reveal>
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-semibold text-primary backdrop-blur-sm">
                <Sparkles className="size-3.5" />
                <span>Our Vision & Advisory Practice</span>
              </div>
            </Reveal>

            <Reveal delay={0.06}>
              <h1 className="mt-6 font-display text-[clamp(2.5rem,6vw,4.5rem)] font-extrabold leading-[1.04] tracking-tight text-foreground">
                Turning fragmented strategy into{" "}
                <span className="text-primary">living architecture.</span>
              </h1>
            </Reveal>

            <Reveal delay={0.12}>
              <p className="mx-auto mt-6 max-w-3xl text-base sm:text-lg text-muted-foreground leading-relaxed">
                Enterprise transformations fail not from lack of ambition, but from loss of context between discovery workshops, architectural diagrams, and engineering backlogs. BizzMitra-AI unifies every discipline into a single cognitive workspace.
              </p>
            </Reveal>
          </div>
        </section>

        {/* ReactBits Pro Showcase 5: Tabbed Creator Showcase with Slide Carousel */}
        <Showcase5 className="py-8 sm:py-12" />

        {/* Enterprise Practice Trust Strip */}
        <div className="mx-auto max-w-6xl px-5 sm:px-8 pb-16">
          <div className="pt-8 border-t border-border/60 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <p className="font-mono text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Trusted by transformation practices at
              </p>
              <p className="text-xs text-muted-foreground/80 mt-0.5">
                Over 450+ enterprise transformation roadmaps delivered
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-6 sm:gap-8 font-display text-lg font-bold text-muted-foreground/70">
              {TRUST_LOGOS.map((item) => (
                <div key={item.name} className="flex items-center gap-2">
                  <span className="hover:text-foreground transition-colors">{item.name}</span>
                  <span className="hidden sm:inline text-[10px] font-mono font-normal text-muted-foreground/60 rounded bg-surface-2 px-1.5 py-0.5">
                    {item.badge}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Operating Pillars */}
        <section className="relative py-20 px-5 sm:px-8 border-t border-border/60 bg-surface/40">
          <div className="mx-auto max-w-6xl">
            <div className="text-center max-w-2xl mx-auto mb-14">
              <Reveal>
                <p className="text-xs font-bold uppercase tracking-widest text-primary">
                  Engineering Principles
                </p>
                <h2 className="mt-2 font-display text-2xl sm:text-3xl font-extrabold text-foreground">
                  The Foundation of BizzMitra Intelligence
                </h2>
              </Reveal>
            </div>

            <Stagger className="grid gap-6 md:grid-cols-3">
              {PILLARS.map((p) => (
                <StaggerItem key={p.title}>
                  <div className="neu neu-reflect-hover h-full rounded-2xl border border-border/70 bg-card p-6 sm:p-8 shadow-sm">
                    <div className="grid size-10 place-items-center rounded-xl bg-primary/10 mb-5">
                      {p.icon}
                    </div>
                    <h3 className="font-display text-lg font-bold text-foreground mb-2">
                      {p.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                      {p.desc}
                    </p>
                  </div>
                </StaggerItem>
              ))}
            </Stagger>
          </div>
        </section>

        {/* Bottom CTA to start blueprinting */}
        <section className="relative py-20 px-5 sm:px-8">
          <div className="mx-auto max-w-4xl neu neu-reflect rounded-3xl border border-primary/20 bg-card/90 p-8 sm:p-12 text-center shadow-xl">
            <Reveal>
              <h2 className="font-display text-2xl sm:text-3xl font-bold">
                Ready to accelerate your next enterprise transformation?
              </h2>
              <p className="mx-auto mt-3 max-w-xl text-sm text-muted-foreground">
                Synthesize problem discovery, target architectures, and phased delivery roadmaps in minutes.
              </p>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
                <Link
                  to="/signup"
                  className="neu-press glow-primary inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-bold text-primary-foreground shadow"
                >
                  <span>Start Free Workspace</span>
                  <ArrowRight className="size-4" />
                </Link>
                <Link
                  to="/"
                  className="neu-press inline-flex items-center gap-2 rounded-xl border border-border/80 bg-surface px-5 py-3 text-sm font-semibold text-foreground hover:bg-surface-2 transition-colors"
                >
                  <span>Back to Landing</span>
                </Link>
              </div>
            </Reveal>
          </div>
        </section>
      </main>

      {/* Footer */}
      <Footer11 />
    </div>
  );
}
