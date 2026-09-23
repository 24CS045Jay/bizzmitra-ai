import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2,
  Linkedin,
  Twitter,
  Camera,
  Sparkles,
  Award,
  Layers,
  X,
  ChevronRight,
  UserCheck,
  ArrowUpRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Reveal, Stagger, StaggerItem } from "./motion/primitives";

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  category: "architecture" | "transformation" | "systems" | "solutions";
  categoryLabel: string;
  affiliation: string;
  quote: string;
  bio: string;
  /** Add path to member picture (e.g. "/team/maya.jpg" or URL) */
  image?: string;
  initials: string;
  avatarBg: string;
  specialties: string[];
  metrics: { label: string; value: string };
  socials?: {
    linkedin?: string;
    twitter?: string;
  };
}

export const TEAM_MEMBERS: TeamMember[] = [
  {
    id: "maya",
    name: "Maya Patel",
    role: "Principal Enterprise Architect",
    category: "architecture",
    categoryLabel: "Enterprise Architecture",
    affiliation: "Ex-Sundara Bank",
    quote:
      "We used to lose 40% of context between business analysts and engineering squads. BizzMitra eliminates that translation gap in a single session.",
    bio: "Over 14 years leading core banking modernizations, cloud migrations, and distributed event-driven graph models across EMEA and APAC financial institutions.",
    initials: "MP",
    avatarBg: "from-coral-500 to-amber-600",
    image: "", // Ready for member photo
    specialties: ["5-Layer Graph", "Event-Driven Core", "SOC2 Architecture", "Domain-Driven Design"],
    metrics: { label: "Roadmaps Authored", value: "140+" },
    socials: { linkedin: "https://linkedin.com", twitter: "https://twitter.com" },
  },
  {
    id: "daniel",
    name: "Daniel Vance",
    role: "VP Digital Transformation",
    category: "transformation",
    categoryLabel: "Transformation & Strategy",
    affiliation: "Kelder Group",
    quote:
      "Generating the solution CRM, relational architecture, and delivery roadmap from a single discovery thread saved us 6 weeks of consulting overhead.",
    bio: "Spearheaded digital transformation initiatives across Fortune 500 logistics and manufacturing clients, reducing strategy-to-execution cycle times by 65%.",
    initials: "DV",
    avatarBg: "from-blue-500 to-indigo-600",
    image: "", // Ready for member photo
    specialties: ["Executive Discovery", "Target Operating Models", "Value Stream Mapping", "Sprint Phasing"],
    metrics: { label: "Transformations Delivered", value: "₹3,500 Cr+" },
    socials: { linkedin: "https://linkedin.com" },
  },
  {
    id: "soraya",
    name: "Soraya Chen",
    role: "Lead Solutions Consultant",
    category: "solutions",
    categoryLabel: "Solutions Consulting",
    affiliation: "Nexa Retail",
    quote:
      "Clients are astonished when they see the interactive BPMN lanes and CRM schemas synthesized during the actual discovery workshop.",
    bio: "Specializes in enterprise omnichannel commerce, automated CRM pipelines, and low-latency customer data platforms across global high-growth retailers.",
    initials: "SC",
    avatarBg: "from-emerald-500 to-teal-600",
    image: "", // Ready for member photo
    specialties: ["BPMN 2.0 Orchestration", "Solution Studio CRM", "API Synthesis", "Escalation Matrix"],
    metrics: { label: "Workshop Acceleration", value: "4.8x" },
    socials: { linkedin: "https://linkedin.com", twitter: "https://twitter.com" },
  },
  {
    id: "marcus",
    name: "Marcus Brody",
    role: "Director of Systems Engineering",
    category: "systems",
    categoryLabel: "Systems & Cloud",
    affiliation: "Tavara Global",
    quote:
      "Deterministic 5-layer graph modeling means our compliance, security, and cloud architecture teams speak the exact same language without ambiguity.",
    bio: "Pioneered automated infrastructure compliance, Terraform state generation, and multi-cloud resilience frameworks across telecom and government infrastructure.",
    initials: "MB",
    avatarBg: "from-purple-500 to-pink-600",
    image: "", // Ready for member photo
    specialties: ["Cloud Resilience", "Infrastructure as Code", "Deterministic Schemas", "Security Posture"],
    metrics: { label: "Production Nodes Managed", value: "50k+" },
    socials: { linkedin: "https://linkedin.com" },
  },
  {
    id: "elena",
    name: "Dr. Elena Rostova",
    role: "Head of AI Cognitive Reasoning",
    category: "architecture",
    categoryLabel: "Enterprise Architecture",
    affiliation: "Former Oxford Research Lab",
    quote:
      "Grounded deterministic graphs eliminate LLM hallucinations when producing mission-critical entity relationships and data structures.",
    bio: "PhD in Knowledge Graphs and Neuro-symbolic AI. Leads BizzMitra's multi-agent synthesis pipeline, ensuring rigorous consistency across all 11 workspace modules.",
    initials: "ER",
    avatarBg: "from-amber-500 to-red-600",
    image: "", // Ready for member photo
    specialties: ["Neuro-symbolic Graph", "Multi-Agent Synthesis", "Constraint Solvers", "Schema Consistency"],
    metrics: { label: "Zero-Loss Fidelity", value: "99.98%" },
    socials: { linkedin: "https://linkedin.com", twitter: "https://twitter.com" },
  },
];

const TABS = [
  { id: "all", label: "All Practice Leaders" },
  { id: "architecture", label: "Enterprise Architecture" },
  { id: "transformation", label: "Strategy & Transformation" },
  { id: "solutions", label: "Solutions Consulting" },
  { id: "systems", label: "Systems & Cloud" },
] as const;

export function Showcase5({
  members = TEAM_MEMBERS,
  className = "",
}: {
  members?: TeamMember[];
  className?: string;
}) {
  const [activeTab, setActiveTab] = React.useState<string>("all");
  const [selectedMemberId, setSelectedMemberId] = React.useState<string>(members[0]?.id || "maya");

  // Filter members based on active tab
  const filteredMembers = React.useMemo(() => {
    if (activeTab === "all") return members;
    return members.filter((m) => m.category === activeTab);
  }, [activeTab, members]);

  // Selected member object
  const selectedMember = React.useMemo(() => {
    return members.find((m) => m.id === selectedMemberId) || filteredMembers[0] || members[0];
  }, [members, selectedMemberId, filteredMembers]);

  // If active tab changes and selected member is not in filtered list, auto-select first from tab
  React.useEffect(() => {
    if (filteredMembers.length > 0 && !filteredMembers.some((m) => m.id === selectedMemberId)) {
      const first = filteredMembers[0];
      if (first) setSelectedMemberId(first.id);
    }
  }, [activeTab, filteredMembers, selectedMemberId]);

  const detailCardRef = React.useRef<HTMLDivElement>(null);

  const handleSelectMember = (id: string) => {
    setSelectedMemberId(id);
    // Smoothly ensure detail card is in focus
    if (detailCardRef.current) {
      detailCardRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  };

  return (
    <div className={cn("relative mx-auto max-w-6xl px-4 sm:px-6 py-12", className)}>
      {/* Section Title */}
      <div className="mx-auto max-w-3xl text-center mb-10">
        <Reveal>
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-4 py-1.5 text-xs font-semibold text-primary">
            <Sparkles className="size-3.5" />
            <span>Squad Leadership & Practice</span>
          </div>
          <h2 className="mt-3 font-display text-[clamp(2.2rem,4.5vw,3.4rem)] font-extrabold tracking-tight text-foreground">
            Meet the squads building{" "}
            <span className="text-primary">lossless enterprise blueprints.</span>
          </h2>
          <p className="mt-3 text-sm sm:text-base text-muted-foreground leading-relaxed">
            Click on any team member's portrait below to explore their architecture credentials, verified lead metrics, and transformation focus.
          </p>
        </Reveal>
      </div>

      {/* Tabs Filter Bar */}
      <div className="flex items-center justify-center mb-10 overflow-x-auto pb-2 scrollbar-none">
        <div className="inline-flex items-center gap-1 rounded-full border border-border/80 bg-surface/90 p-1.5 shadow-sm backdrop-blur-md dark:border-white/10 dark:bg-surface/90">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "relative rounded-full px-4 py-2 text-xs font-semibold transition-colors duration-200 whitespace-nowrap",
                  isActive
                    ? "text-primary dark:text-white"
                    : "text-muted-foreground hover:text-foreground dark:text-zinc-300 dark:hover:text-white",
                )}
              >
                {isActive && (
                  <motion.span
                    layoutId="showcase5-tab-indicator"
                    className="absolute inset-0 rounded-full bg-card shadow-sm border border-border/80 dark:bg-zinc-800/95 dark:border-white/20 dark:shadow-[0_0_12px_rgba(255,255,255,0.08)] -z-10"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ANIMATED TEAM IMAGES GALLERY (Click image to open detailed card) */}
      <div className="mb-12">
        <div className="flex items-center justify-between mb-4 px-1">
          <p className="text-xs font-mono font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
            <UserCheck className="size-3.5 text-primary" />
            <span>Select a squad leader ({filteredMembers.length})</span>
          </p>
          <span className="text-[11px] font-mono text-primary font-medium">
            Click image to open profile
          </span>
        </div>

        <Stagger className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 sm:gap-4">
          {filteredMembers.map((member) => {
            const isSelected = selectedMember?.id === member.id;
            return (
              <StaggerItem key={member.id}>
                <motion.div
                  onClick={() => handleSelectMember(member.id)}
                  whileHover={{ y: -6, scale: 1.02 }}
                  whileTap={{ scale: 0.96 }}
                  className={cn(
                    "group relative cursor-pointer rounded-2xl border p-3 transition-all duration-300 select-none neu-reflect-hover",
                    isSelected
                      ? "border-primary bg-primary/5 shadow-md dark:border-primary/80 dark:bg-primary/10"
                      : "border-border/75 bg-card/90 hover:border-primary/40 hover:bg-card dark:border-white/10",
                  )}
                  title={`Click to view ${member.name}'s profile`}
                >
                  {/* Selected Indicator Pill */}
                  {isSelected && (
                    <span className="absolute -top-2.5 inset-x-0 mx-auto w-max rounded-full bg-primary px-2 py-0.5 font-mono text-[9px] font-black uppercase tracking-wider text-primary-foreground shadow-sm">
                      Active Card
                    </span>
                  )}

                  {/* Portrait / Image Container */}
                  <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-surface-2 shadow-inner border border-border/50">
                    {member.image ? (
                      /* Real Image (when user provides member.image) */
                      <img
                        src={member.image}
                        alt={member.name}
                        className="size-full object-cover transition-transform duration-500 group-hover:scale-108"
                      />
                    ) : (
                      /* Fallback Gradient Avatar with Initials */
                      <div className="relative size-full flex flex-col items-center justify-center p-2">
                        <div
                          className={cn(
                            "grid size-14 sm:size-16 place-items-center rounded-2xl bg-gradient-to-br font-display text-xl font-black text-white shadow-md glow-primary transition-transform duration-300 group-hover:scale-105",
                            member.avatarBg,
                          )}
                        >
                          {member.initials}
                        </div>

                        {/* Subtle Camera / Image prompt */}
                        <span className="mt-2 flex items-center gap-1 rounded bg-surface/80 px-1.5 py-0.5 font-mono text-[8px] text-muted-foreground border border-border/60">
                          <Camera className="size-2.5 text-primary" />
                          <span>Photo slot</span>
                        </span>
                      </div>
                    )}

                    {/* Hover Overlay with Arrow */}
                    <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                      <div className="grid size-8 place-items-center rounded-full bg-card/90 text-primary shadow-md backdrop-blur-sm">
                        <ArrowUpRight className="size-4" />
                      </div>
                    </div>
                  </div>

                  {/* Name and Role snippet */}
                  <div className="mt-2.5 text-center">
                    <p className="font-display text-xs font-bold text-foreground truncate group-hover:text-primary transition-colors">
                      {member.name}
                    </p>
                    <p className="text-[10px] text-primary/90 font-medium truncate mt-0.5">
                      {member.affiliation}
                    </p>
                  </div>
                </motion.div>
              </StaggerItem>
            );
          })}
        </Stagger>
      </div>

      {/* DETAILED MEMBER CARD (The one from screenshot — dynamically updates on image click) */}
      <div ref={detailCardRef} className="relative scroll-mt-28">
        <AnimatePresence mode="wait">
          {selectedMember && (
            <motion.div
              key={selectedMember.id}
              initial={{ opacity: 0, y: 16, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -16, scale: 0.98 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="neu-reflect relative rounded-3xl border border-border/80 bg-card p-6 sm:p-10 shadow-2xl overflow-hidden dark:border-white/15"
            >
              {/* Subtle ambient glow matching the member's domain */}
              <div className="pointer-events-none absolute -top-24 -right-24 size-96 rounded-full bg-primary/10 blur-3xl" />
              <div className="pointer-events-none absolute -bottom-24 -left-24 size-96 rounded-full bg-sage/10 blur-3xl" />

              <div className="relative grid gap-8 lg:grid-cols-12 lg:items-center">
                {/* Left Column: Picture / Avatar Container with Badges */}
                <div className="lg:col-span-5 flex flex-col items-center sm:items-start">
                  <div className="group relative aspect-square sm:aspect-[4/5] w-full max-w-[340px] overflow-hidden rounded-2xl border border-border/80 bg-surface-2 shadow-md dark:border-white/15">
                    {selectedMember.image ? (
                      /* Real Image (when provided by user) */
                      <img
                        src={selectedMember.image}
                        alt={selectedMember.name}
                        className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      /* Elegant Avatar Placeholder with Gradient */
                      <div className="flex size-full flex-col items-center justify-center p-6 text-center">
                        <div
                          className={cn(
                            "grid size-28 place-items-center rounded-3xl bg-gradient-to-br shadow-xl font-display text-4xl font-black text-white glow-primary",
                            selectedMember.avatarBg,
                          )}
                        >
                          {selectedMember.initials}
                        </div>

                        {/* Photo Ready Badge */}
                        <div className="mt-5 inline-flex items-center gap-1.5 rounded-full border border-border/80 bg-card/80 px-3 py-1 font-mono text-[11px] text-muted-foreground backdrop-blur-sm">
                          <Camera className="size-3 text-primary" />
                          <span>Ready for member picture</span>
                        </div>
                      </div>
                    )}

                    {/* Category pill on top-left of image */}
                    <div className="absolute top-3 left-3 rounded-full bg-surface/90 backdrop-blur-md px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-wider text-primary border border-border/60 shadow-sm">
                      {selectedMember.categoryLabel}
                    </div>

                    {/* Verified badge on bottom bar of image */}
                    <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between rounded-xl bg-card/90 backdrop-blur-md px-3 py-2 text-xs border border-border/60 shadow-sm">
                      <span className="flex items-center gap-1.5 text-sage font-semibold text-[11px]">
                        <CheckCircle2 className="size-3.5" />
                        <span>Verified Practice Lead</span>
                      </span>
                      <span className="font-mono text-[10px] font-bold text-foreground">
                        {selectedMember.metrics.value}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right Column: Name, Title, Quote, Bio, Tags & Metrics */}
                <div className="lg:col-span-7 space-y-6">
                  <div>
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <h3 className="font-display text-2xl sm:text-3xl font-extrabold text-foreground">
                          {selectedMember.name}
                        </h3>
                        <p className="mt-1 text-sm font-semibold text-primary">
                          {selectedMember.role}
                        </p>
                      </div>

                      <span className="rounded-xl border border-border/80 bg-surface px-3 py-1.5 font-mono text-xs font-semibold text-muted-foreground">
                        {selectedMember.affiliation}
                      </span>
                    </div>
                  </div>

                  {/* Pull Quote with Coral Left Border */}
                  <div className="relative rounded-2xl border-l-4 border-primary bg-surface/50 p-4 sm:p-5 dark:bg-surface/30">
                    <p className="font-display text-sm sm:text-base italic text-foreground leading-relaxed">
                      “{selectedMember.quote}”
                    </p>
                  </div>

                  {/* Biography */}
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                    {selectedMember.bio}
                  </p>

                  {/* Domain Focus & Disciplines */}
                  <div>
                    <p className="text-[11px] font-mono font-bold uppercase tracking-wider text-muted-foreground mb-2.5 flex items-center gap-1.5">
                      <Layers className="size-3 text-primary" />
                      <span>Domain Focus & Disciplines</span>
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {selectedMember.specialties.map((spec) => (
                        <span
                          key={spec}
                          className="rounded-lg border border-border/70 bg-surface-2 px-2.5 py-1 font-mono text-[11px] font-medium text-foreground hover:border-primary/40 transition-colors"
                        >
                          {spec}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Metrics & Socials */}
                  <div className="pt-4 border-t border-border/60 flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <Award className="size-4 text-primary" />
                        <div>
                          <p className="text-[10px] font-mono uppercase text-muted-foreground">
                            {selectedMember.metrics.label}
                          </p>
                          <p className="text-sm font-display font-bold text-foreground">
                            {selectedMember.metrics.value}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {selectedMember.socials?.linkedin && (
                        <a
                          href={selectedMember.socials.linkedin}
                          target="_blank"
                          rel="noreferrer"
                          className="grid size-8 place-items-center rounded-lg border border-border bg-surface text-muted-foreground hover:text-primary transition-colors"
                          title="LinkedIn Profile"
                        >
                          <Linkedin className="size-3.5" />
                        </a>
                      )}
                      {selectedMember.socials?.twitter && (
                        <a
                          href={selectedMember.socials.twitter}
                          target="_blank"
                          rel="noreferrer"
                          className="grid size-8 place-items-center rounded-lg border border-border bg-surface text-muted-foreground hover:text-primary transition-colors"
                          title="Twitter / X Profile"
                        >
                          <Twitter className="size-3.5" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// Alias matching React Bits naming convention
export const TeamShowcase = Showcase5;
