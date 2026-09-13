import * as React from "react";
import { Link } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Sparkles, ArrowRight, ShieldCheck, Zap } from "lucide-react";

interface PlanTier {
  id: string;
  name: string;
  tagline: string;
  monthlyPrice: number;
  annualPrice: number;
  featured?: boolean;
  badge?: string;
  features: string[];
  specs: {
    workspaces: string;
    generations: string;
    collaborators: string;
    support: string;
  };
}

const PLANS: PlanTier[] = [
  {
    id: "starter",
    name: "Starter",
    tagline: "For individual architects & solo founders validating new ventures.",
    monthlyPrice: 0,
    annualPrice: 0,
    features: [
      "1 active transformation workspace",
      "Full 11-module artifact pipeline",
      "Markdown & Mermaid exports",
      "Community support",
    ],
    specs: {
      workspaces: "1 active",
      generations: "20 / month",
      collaborators: "Solo (1 seat)",
      support: "Standard community",
    },
  },
  {
    id: "squad",
    name: "Squad",
    tagline: "For boutique consultancies & cross-functional enterprise squads.",
    monthlyPrice: 49,
    annualPrice: 39,
    featured: true,
    badge: "Most Popular",
    features: [
      "5 concurrent active workspaces",
      "Real-time team presence & comments",
      "Interactive Solution Studio CRM",
      "Full JSON data packs & API exports",
      "Custom branding on deliverables",
    ],
    specs: {
      workspaces: "5 concurrent",
      generations: "Unlimited blueprints",
      collaborators: "Up to 8 members",
      support: "Priority email (4h SLA)",
    },
  },
  {
    id: "scale",
    name: "Scale",
    tagline: "For digital transformation practices running multiple enterprise streams.",
    monthlyPrice: 129,
    annualPrice: 99,
    features: [
      "25 concurrent active workspaces",
      "Multi-squad permissions & RBAC",
      "Version control diffs & branch merging",
      "Custom AI prompts & private fine-tunes",
      "Dedicated onboarding architect",
    ],
    specs: {
      workspaces: "25 concurrent",
      generations: "Unlimited blueprints",
      collaborators: "Up to 30 members",
      support: "Dedicated Slack channel",
    },
  },
  {
    id: "enterprise",
    name: "Enterprise",
    tagline: "Custom governance, private tenant isolation, and VPC deployment.",
    monthlyPrice: 299,
    annualPrice: 239,
    features: [
      "Unlimited enterprise workspaces",
      "Self-hosted VPC or on-prem deployment",
      "SSO, SAML & audit logging",
      "Custom SLA & bespoke model fine-tuning",
      "Executive transformation advisory",
    ],
    specs: {
      workspaces: "Unlimited",
      generations: "Custom throughput",
      collaborators: "Unlimited members",
      support: "24/7 dedicated lead",
    },
  },
];

export function Pricing13({ className = "" }: { className?: string }) {
  const [billingCycle, setBillingCycle] = React.useState<"monthly" | "annual">("annual");
  const [selectedPlanId, setSelectedPlanId] = React.useState<string>("squad");

  const selectedPlan = PLANS.find((p) => p.id === selectedPlanId) ?? PLANS[1]!;

  return (
    <div className={`mx-auto max-w-6xl px-4 sm:px-6 ${className}`}>
      {/* Billing Cycle Toggle */}
      <div className="flex flex-col items-center mb-10">
        <div className="neu-reflect relative flex items-center gap-1 rounded-full border border-border/80 bg-surface/90 p-1.5 shadow-sm">
          <button
            type="button"
            onClick={() => setBillingCycle("monthly")}
            className={`relative rounded-full px-5 py-2 text-xs font-semibold transition-colors duration-200 ${
              billingCycle === "monthly"
                ? "text-primary dark:text-primary-foreground font-bold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {billingCycle === "monthly" && (
              <motion.span
                layoutId="pricing13-billing-pill"
                className="absolute inset-0 rounded-full bg-surface shadow-sm border border-border/60 dark:bg-primary/20 dark:border-primary/40 -z-10"
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
            Monthly
          </button>

          <button
            type="button"
            onClick={() => setBillingCycle("annual")}
            className={`relative rounded-full px-5 py-2 text-xs font-semibold transition-colors duration-200 flex items-center gap-1.5 ${
              billingCycle === "annual"
                ? "text-primary dark:text-primary-foreground font-bold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {billingCycle === "annual" && (
              <motion.span
                layoutId="pricing13-billing-pill"
                className="absolute inset-0 rounded-full bg-surface shadow-sm border border-border/60 dark:bg-primary/20 dark:border-primary/40 -z-10"
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
            <span>Annual</span>
            <span className="rounded-full bg-primary/15 px-2 py-0.5 font-mono text-[10px] font-extrabold text-primary">
              Save 20%
            </span>
          </button>
        </div>
      </div>

      {/* Plan Selector Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        {PLANS.map((plan) => {
          const isSelected = selectedPlanId === plan.id;
          const price = billingCycle === "annual" ? plan.annualPrice : plan.monthlyPrice;

          return (
            <div
              key={plan.id}
              onClick={() => setSelectedPlanId(plan.id)}
              className={`neu-reflect-hover neu-reflect relative flex flex-col justify-between rounded-2xl p-5 cursor-pointer border transition-all duration-200 ${
                isSelected
                  ? "border-primary bg-card ring-2 ring-primary/40 shadow-lg dark:bg-card/90"
                  : "border-border/80 bg-surface/70 hover:bg-card/60"
              }`}
            >
              {isSelected && (
                <motion.div
                  layoutId="pricing13-card-indicator"
                  className="absolute inset-0 rounded-2xl ring-2 ring-primary/60 pointer-events-none -z-10"
                  transition={{ type: "spring", stiffness: 350, damping: 28 }}
                />
              )}

              <div>
                <div className="flex items-center justify-between">
                  <h3 className="font-display text-lg font-bold text-foreground">{plan.name}</h3>
                  {plan.badge && (
                    <span className="rounded-full bg-primary px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-primary-foreground">
                      {plan.badge}
                    </span>
                  )}
                </div>

                <div className="mt-3 flex items-baseline gap-1">
                  <span className="font-display text-3xl font-black text-foreground">
                    {price === 0 ? "Free" : `$${price}`}
                  </span>
                  {price > 0 && (
                    <span className="text-xs text-muted-foreground font-medium">/ month</span>
                  )}
                </div>

                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{plan.tagline}</p>
              </div>

              <div className="mt-5 pt-3 border-t border-border/60 flex items-center justify-between text-xs font-semibold">
                <span className={isSelected ? "text-primary" : "text-muted-foreground"}>
                  {isSelected ? "Active selection" : "Click to view details"}
                </span>
                <ArrowRight className={`size-3.5 transition-transform ${isSelected ? "text-primary translate-x-0.5" : "text-muted-foreground"}`} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Live Detail Panel */}
      <AnimatePresence mode="wait">
        <motion.div
          key={selectedPlan.id + billingCycle}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="neu neu-reflect rounded-3xl p-6 sm:p-8 border border-border/90 bg-card/95 shadow-xl"
        >
          <div className="grid gap-8 lg:grid-cols-12 items-start">
            {/* Left: Plan Summary & Specs */}
            <div className="lg:col-span-5 space-y-6">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-display text-2xl sm:text-3xl font-black text-foreground">
                    {selectedPlan.name} Plan
                  </span>
                  {selectedPlan.badge && (
                    <span className="rounded-full bg-primary/15 px-2.5 py-0.5 text-[10px] font-bold text-primary border border-primary/30">
                      {selectedPlan.badge}
                    </span>
                  )}
                </div>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                  {selectedPlan.tagline}
                </p>
              </div>

              {/* Price Callout */}
              <div className="neu-inset p-4 rounded-xl flex items-baseline justify-between">
                <div>
                  <span className="text-xs font-mono uppercase text-muted-foreground">
                    Billing ({billingCycle})
                  </span>
                  <div className="mt-0.5 font-display text-3xl font-extrabold text-foreground">
                    {billingCycle === "annual" && selectedPlan.annualPrice > 0
                      ? `$${selectedPlan.annualPrice}`
                      : selectedPlan.monthlyPrice === 0
                        ? "Free"
                        : `$${selectedPlan.monthlyPrice}`}
                    <span className="text-xs font-normal text-muted-foreground ml-1">/ seat / mo</span>
                  </div>
                </div>
                {billingCycle === "annual" && selectedPlan.annualPrice > 0 && (
                  <span className="text-xs font-mono font-bold text-sage bg-sage/10 px-2.5 py-1 rounded-lg border border-sage/20">
                    Billed annually
                  </span>
                )}
              </div>

              {/* Resource Capacity Spec Grid */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="neu-sm p-3 rounded-xl">
                  <span className="text-muted-foreground block text-[10px] uppercase font-mono">Workspaces</span>
                  <span className="font-bold text-foreground mt-0.5 block">{selectedPlan.specs.workspaces}</span>
                </div>
                <div className="neu-sm p-3 rounded-xl">
                  <span className="text-muted-foreground block text-[10px] uppercase font-mono">Blueprints</span>
                  <span className="font-bold text-foreground mt-0.5 block">{selectedPlan.specs.generations}</span>
                </div>
                <div className="neu-sm p-3 rounded-xl">
                  <span className="text-muted-foreground block text-[10px] uppercase font-mono">Seats</span>
                  <span className="font-bold text-foreground mt-0.5 block">{selectedPlan.specs.collaborators}</span>
                </div>
                <div className="neu-sm p-3 rounded-xl">
                  <span className="text-muted-foreground block text-[10px] uppercase font-mono">SLA / Support</span>
                  <span className="font-bold text-foreground mt-0.5 block">{selectedPlan.specs.support}</span>
                </div>
              </div>

              <Link
                to="/signup"
                className="neu-press glow-primary flex items-center justify-center gap-2 w-full rounded-xl bg-primary py-3.5 text-sm font-bold text-primary-foreground shadow-lg transition-transform hover:scale-[1.01]"
              >
                <span>Get started with {selectedPlan.name}</span>
                <ArrowRight className="size-4" />
              </Link>
            </div>

            {/* Right: Live Feature Checklist & Guarantee */}
            <div className="lg:col-span-7 border-t lg:border-t-0 lg:border-l border-border/70 pt-6 lg:pt-0 lg:pl-8 space-y-6">
              <div>
                <h4 className="font-display text-sm font-bold uppercase tracking-wider text-muted-foreground">
                  Everything included in {selectedPlan.name}
                </h4>
                <ul className="mt-4 grid gap-3 sm:grid-cols-2 text-sm">
                  {selectedPlan.features.map((feat) => (
                    <li key={feat} className="flex items-start gap-2.5">
                      <div className="grid size-5 shrink-0 place-items-center rounded-full bg-sage/15 text-sage border border-sage/30 mt-0.5">
                        <Check className="size-3" />
                      </div>
                      <span className="text-foreground text-xs sm:text-sm font-medium leading-tight">
                        {feat}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Value Add Highlight Box */}
              <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4 flex items-start gap-3">
                <div className="grid size-8 shrink-0 place-items-center rounded-xl bg-primary/20 text-primary">
                  <Zap className="size-4" />
                </div>
                <div className="text-xs">
                  <p className="font-bold text-foreground">Zero context loss guarantee</p>
                  <p className="mt-0.5 text-muted-foreground leading-relaxed">
                    Every blueprint generated in BizzMitra is backed by the cross-layer intelligence graph. Change any architectural node and the downstream solution CRM and roadmap update automatically.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 text-xs text-muted-foreground pt-2">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="size-4 text-sage" />
                  <span>Enterprise SOC2 ready</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <Sparkles className="size-4 text-primary" />
                  <span>Cancel or switch anytime</span>
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
