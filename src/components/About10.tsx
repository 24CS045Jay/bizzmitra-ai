import * as React from "react";
import { CheckCircle2 } from "lucide-react";
import { Reveal, Stagger, StaggerItem } from "./motion/primitives";

interface SquadMember {
  id: string;
  name: string;
  role: string;
  affiliation: string;
  quote: string;
  avatarBg: string;
  initials: string;
}

const COLLAGE_MEMBERS: SquadMember[] = [
  {
    id: "maya",
    name: "Maya Patel",
    role: "Principal Enterprise Architect",
    affiliation: "Ex-Sundara Bank",
    quote: "We used to lose 40% of context between business analysts and engineering squads. BizzMitra eliminates that translation gap.",
    avatarBg: "from-coral-500 to-amber-500",
    initials: "MP",
  },
  {
    id: "daniel",
    name: "Daniel Vance",
    role: "VP Digital Transformation",
    affiliation: "Kelder Group",
    quote: "Generating the solution CRM, relational architecture, and delivery roadmap from a single discovery thread saved us 6 weeks of consulting overhead.",
    avatarBg: "from-blue-500 to-indigo-600",
    initials: "DV",
  },
  {
    id: "soraya",
    name: "Soraya Chen",
    role: "Lead Solutions Consultant",
    affiliation: "Nexa Retail",
    quote: "Clients are astonished when they see the interactive BPMN lanes and CRM schemas synthesized during the actual workshop.",
    avatarBg: "from-emerald-500 to-teal-600",
    initials: "SC",
  },
  {
    id: "marcus",
    name: "Marcus Brody",
    role: "Director of Systems Engineering",
    affiliation: "Tavara Global",
    quote: "Deterministic 5-layer graph modeling means our compliance and cloud architecture teams speak the exact same language.",
    avatarBg: "from-purple-500 to-pink-600",
    initials: "MB",
  },
];

const TRUST_LOGOS = [
  { name: "Nexa Retail", badge: "Enterprise Retail" },
  { name: "Kelder Group", badge: "Consulting Practice" },
  { name: "Tavara Global", badge: "Cloud Systems" },
  { name: "Orbiq Logistics", badge: "Supply Chain" },
  { name: "Sundara Bank", badge: "Fintech Core" },
];

export function About10({ className = "" }: { className?: string }) {
  return (
    <section id="about" className={`relative py-24 sm:py-32 overflow-hidden ${className}`}>
      {/* Faded Background Brand Statement */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2 flex items-center justify-center select-none overflow-hidden opacity-[0.03] dark:opacity-[0.05]"
      >
        <p className="font-display text-[clamp(4rem,14vw,14rem)] font-black uppercase tracking-tighter leading-none text-foreground text-center">
          TRANSFORM CONTEXT
        </p>
      </div>

      <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
        {/* Section Header */}
        <div className="mx-auto max-w-3xl text-center">
          <Reveal>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">
              People-First Architecture
            </p>
          </Reveal>
          <Reveal delay={0.06}>
            <h2 className="mt-3 font-display text-[clamp(2.2rem,5vw,3.8rem)] font-extrabold leading-[1.02] text-balance-tight">
              Enterprise transformation isn&apos;t built on slides.{" "}
              <span className="text-primary">It&apos;s built by squads who refuse to lose context.</span>
            </h2>
          </Reveal>
          <Reveal delay={0.12}>
            <p className="mt-5 text-sm sm:text-base text-muted-foreground leading-relaxed">
              BizzMitra-AI pairs seasoned enterprise architects, transformation consultants, and product leaders with a deterministic AI intelligence engine that remembers every constraint across all 11 modules.
            </p>
          </Reveal>
        </div>

        {/* People-First Portrait Collage */}
        <Stagger className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {COLLAGE_MEMBERS.map((member) => (
            <StaggerItem key={member.id}>
              <div className="neu-reflect-hover neu-reflect group h-full rounded-2xl border border-border/80 bg-card/90 p-6 shadow-sm flex flex-col justify-between">
                <div>
                  {/* Avatar & Badges */}
                  <div className="flex items-center gap-3">
                    <div className="grid size-12 place-items-center rounded-2xl bg-gradient-to-br from-primary to-primary/60 font-display text-sm font-black text-primary-foreground shadow-sm">
                      {member.initials}
                    </div>
                    <div>
                      <h3 className="font-display text-base font-bold text-foreground">
                        {member.name}
                      </h3>
                      <p className="text-xs text-primary font-medium">{member.role}</p>
                      <span className="font-mono text-[10px] text-muted-foreground">
                        {member.affiliation}
                      </span>
                    </div>
                  </div>

                  {/* Quote */}
                  <p className="mt-4 text-xs sm:text-sm text-muted-foreground leading-relaxed italic">
                    “{member.quote}”
                  </p>
                </div>

                <div className="mt-5 pt-3 border-t border-border/60 flex items-center justify-between text-[11px] font-mono text-muted-foreground">
                  <span className="flex items-center gap-1 text-sage font-semibold">
                    <CheckCircle2 className="size-3" />
                    <span>Verified Lead</span>
                  </span>
                  <span>100% Blueprinted</span>
                </div>
              </div>
            </StaggerItem>
          ))}
        </Stagger>

        {/* Trust Strip */}
        <div className="mt-20 pt-10 border-t border-border/60">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
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
      </div>
    </section>
  );
}
