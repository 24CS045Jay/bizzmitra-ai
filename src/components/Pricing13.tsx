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
    name: "Free Starter",
    tagline: "For individual architects & solo founders validating new ventures.",
    monthlyPrice: 0,
    annualPrice: 0,
    features: [
      "Single workspace",
      "Standard LLM intake",
      "Basic HLD export",
      "Community support",
    ],
    specs: {
      workspaces: "1 active",
      generations: "100 credits / mo",
      collaborators: "Solo (1 seat)",
      support: "Standard community",
    },
  },
  {
    id: "growth",
    name: "Growth Pro",
    tagline: "For boutique consultancies & cross-functional enterprise squads.",
    monthlyPrice: 3999,
    annualPrice: 3199,
    featured: true,
    badge: "Most Popular",
    features: [
      "Unlimited workspaces",
      "Solution Studio customizer",
      "PostgreSQL DDL & REST APIs",
      "Executive pitch deck export",
      "Role-based access preview",
    ],
    specs: {
      workspaces: "Unlimited",
      generations: "1,000 credits / mo",
      collaborators: "Up to 8 members",
      support: "Priority email (4h SLA)",
    },
  },
  {
    id: "enterprise",
    name: "Enterprise Scale",
    tagline: "Custom governance, dedicated compute cluster, and VPC deployment.",
    monthlyPrice: 15999,
    annualPrice: 12799,
    features: [
      "Dedicated compute cluster",
      "Custom BPMN 2.0 pipelines",
      "Full Git multi-tier versioning",
      "99.99% SLA guarantee",
      "SOC2 compliance attestation",
    ],
    specs: {
      workspaces: "Unlimited",
      generations: "5,000 credits / mo",
      collaborators: "Unlimited members",
      support: "Dedicated Lead Architect",
    },
  },
];

export function Pricing13({ className = "" }: { className?: string }) {
  const [billingCycle, setBillingCycle] = React.useState<"monthly" | "annual">("monthly");
  const [selectedPlanId, setSelectedPlanId] = React.useState<string>("growth");

  const selectedPlan = PLANS.find((p) => p.id === selectedPlanId) ?? PLANS[1]!;

  return (
    <div className={`w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ${className}`}>
      {/* Header & Cadence Toggle */}
      <div className="flex flex-col items-center text-center mb-10">
        <div className="neu-sm inline-flex items-center gap-1.5 p-1 rounded-full mb-4">
          <button
            type="button"
            onClick={() => setBillingCycle("monthly")}
            className={`relative rounded-full px-4 py-1.5 text-xs font-bold transition-colors ${
              billingCycle === "monthly" ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {billingCycle === "monthly" && (
              <motion.span
                layoutId="pricing13-billing-pill"
                className="absolute inset-0 rounded-full bg-primary shadow-sm"
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
            <span className="relative z-10">Monthly Billing</span>
          </button>
          <button
            type="button"
            onClick={() => setBillingCycle("annual")}
            className={`relative rounded-full px-4 py-1.5 text-xs font-bold transition-colors ${
              billingCycle === "annual" ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {billingCycle === "annual" && (
              <motion.span
                layoutId="pricing13-billing-pill"
                className="absolute inset-0 rounded-full bg-primary shadow-sm"
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
            <span className="relative z-10">Annual Billing</span>
            <span className="relative z-10 ml-1.5 rounded-full bg-sage/20 text-sage px-1.5 py-0.5 text-[9px] font-extrabold uppercase">
              Save 20%
            </span>
          </button>
        </div>
      </div>

      {/* Plan Selector Grid */}
      <div className="grid gap-6 md:grid-cols-3 mb-8">
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
                    {price === 0 ? "₹0" : `₹${price.toLocaleString("en-IN")}`}
                  </span>
                  <span className="text-xs text-muted-foreground font-medium">
                    {price === 0 ? "forever free" : plan.id === "enterprise" ? "per org / month" : "per seat / month"}
                  </span>
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
                      ? `₹${selectedPlan.annualPrice.toLocaleString("en-IN")}`
                      : selectedPlan.monthlyPrice === 0
                        ? "₹0"
                        : `₹${selectedPlan.monthlyPrice.toLocaleString("en-IN")}`}
                    <span className="text-xs font-normal text-muted-foreground ml-1">
                      {selectedPlan.id === "starter"
                        ? "forever free"
                        : selectedPlan.id === "enterprise"
                          ? "per org / month"
                          : "per seat / month"}
                    </span>
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
