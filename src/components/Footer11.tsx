import * as React from "react";
import { Link } from "@tanstack/react-router";
import {
  Sparkles,
  ArrowUpRight,
  ShieldCheck,
  Github,
  Twitter,
  Linkedin,
  Disc as Discord,
  Layers,
  FileCode,
  Compass,
  Cpu,
  Workflow,
} from "lucide-react";

interface FooterLink {
  label: string;
  href: string;
  badge?: string;
  isExternal?: boolean;
}

interface FooterColumn {
  title: string;
  icon?: React.ReactNode;
  links: FooterLink[];
}

const FOOTER_COLUMNS: FooterColumn[] = [
  {
    title: "Intelligence Modules",
    icon: <Cpu className="size-3.5 text-primary" />,
    links: [
      { label: "Discovery Intelligence", href: "#modules" },
      { label: "Architecture Graph", href: "#modules" },
      { label: "Process Orchestration", href: "#modules" },
      { label: "Wireframe Blueprints", href: "#modules" },
      { label: "Solution Studio CRM", href: "#modules", badge: "Live" },
    ],
  },
  {
    title: "Workspaces",
    icon: <Layers className="size-3.5 text-primary" />,
    links: [
      { label: "Executive Intake", href: "/workspace/new" },
      { label: "System Modeler", href: "/workspace/architecture" },
      { label: "Data Entity Studio", href: "/workspace/data" },
      { label: "Roadmap Phasing", href: "/workspace/roadmap" },
      { label: "Artifact Hub", href: "/dashboard" },
    ],
  },
  {
    title: "Resources & Docs",
    icon: <FileCode className="size-3.5 text-primary" />,
    links: [
      { label: "Platform Architecture", href: "#compare" },
      { label: "5-Layer Graph Specification", href: "#compare" },
      { label: "Solution Templates", href: "#modules" },
      { label: "API Reference", href: "/docs" },
      { label: "Release Changelog", href: "#", badge: "v2.4" },
    ],
  },
  {
    title: "Squad & Practice",
    icon: <Compass className="size-3.5 text-primary" />,
    links: [
      { label: "About BizzMitra", href: "/about" },
      { label: "Consulting Network", href: "#" },
      { label: "Transformation Advisory", href: "#" },
      { label: "Careers", href: "#", badge: "We're hiring" },
      { label: "Contact Engineering", href: "mailto:support@bizzmitra.ai" },
    ],
  },
  {
    title: "Governance & Trust",
    icon: <ShieldCheck className="size-3.5 text-sage" />,
    links: [
      { label: "Security & SOC2", href: "#" },
      { label: "Privacy Policy", href: "#" },
      { label: "Terms of Service", href: "#" },
      { label: "Data Processing (DPA)", href: "#" },
      { label: "Zero Retention Commitment", href: "#" },
    ],
  },
];

export function Footer11({ className = "" }: { className?: string }) {
  return (
    <footer
      className={`border-t border-border/80 bg-surface/80 dark:bg-surface/90 text-foreground neu-reflect relative overflow-hidden ${className}`}
    >
      <div className="mx-auto max-w-7xl px-5 sm:px-8 pt-16 pb-12">
        {/* Brand Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-12 border-b border-border/60">
          <div className="space-y-2 max-w-lg">
            <Link to="/" className="flex items-center gap-2.5">
              <span className="grid size-8 place-items-center rounded-xl bg-primary font-display text-sm font-black text-primary-foreground shadow-sm glow-primary">
                B
              </span>
              <span className="font-display text-xl font-extrabold tracking-tight">
                BizzMitra-AI
              </span>
            </Link>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              From business problem to blueprint. One connected AI workspace that turns enterprise
              ambiguity into implementation-ready artifacts without losing context.
            </p>
          </div>

          {/* Trust Status & Operational Pill */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="neu-sm neu-reflect px-3.5 py-2 flex items-center gap-2 text-xs font-semibold">
              <span className="relative flex size-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-sage opacity-75" />
                <span className="relative inline-flex size-2 rounded-full bg-sage" />
              </span>
              <span className="text-foreground">All Systems Operational</span>
            </div>

            <div className="neu-sm neu-reflect px-3.5 py-2 flex items-center gap-2 text-xs font-semibold text-muted-foreground">
              <ShieldCheck className="size-4 text-sage" />
              <span>SOC2 Type II Certified</span>
            </div>
          </div>
        </div>

        {/* Airy Five-Column Sitemap Grid */}
        <div className="grid grid-cols-2 gap-8 py-14 sm:grid-cols-3 md:grid-cols-5 lg:gap-10">
          {FOOTER_COLUMNS.map((col) => (
            <div key={col.title} className="space-y-4">
              <div className="flex items-center gap-1.5 font-display text-xs font-bold uppercase tracking-wider text-foreground">
                {col.icon}
                <span>{col.title}</span>
              </div>
              <ul className="space-y-2.5 text-xs">
                {col.links.map((link) => (
                  <li key={link.label}>
                    {link.href.startsWith("#") || link.href.startsWith("mailto:") ? (
                      <a
                        href={link.href}
                        className="group inline-flex items-center gap-1.5 text-muted-foreground transition-colors hover:text-primary"
                      >
                        <span>{link.label}</span>
                        {link.badge && (
                          <span className="rounded-full bg-primary/10 px-1.5 py-0.2 font-mono text-[9px] font-bold text-primary border border-primary/20">
                            {link.badge}
                          </span>
                        )}
                      </a>
                    ) : (
                      <Link
                        to={link.href}
                        className="group inline-flex items-center gap-1.5 text-muted-foreground transition-colors hover:text-primary"
                      >
                        <span>{link.label}</span>
                        {link.badge && (
                          <span className="rounded-full bg-primary/10 px-1.5 py-0.2 font-mono text-[9px] font-bold text-primary border border-primary/20">
                            {link.badge}
                          </span>
                        )}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Social Row & Product Badges */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-8 border-t border-border/60">
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-muted-foreground">Connect with our practice:</span>
            <div className="flex items-center gap-2">
              <a
                href="https://github.com"
                target="_blank"
                rel="noreferrer"
                aria-label="GitHub"
                className="grid size-8 place-items-center rounded-lg border border-border/70 bg-card/80 text-muted-foreground hover:text-foreground hover:border-primary transition-colors"
              >
                <Github className="size-4" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Twitter"
                className="grid size-8 place-items-center rounded-lg border border-border/70 bg-card/80 text-muted-foreground hover:text-foreground hover:border-primary transition-colors"
              >
                <Twitter className="size-4" />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noreferrer"
                aria-label="LinkedIn"
                className="grid size-8 place-items-center rounded-lg border border-border/70 bg-card/80 text-muted-foreground hover:text-foreground hover:border-primary transition-colors"
              >
                <Linkedin className="size-4" />
              </a>
              <a
                href="https://discord.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Discord"
                className="grid size-8 place-items-center rounded-lg border border-border/70 bg-card/80 text-muted-foreground hover:text-foreground hover:border-primary transition-colors"
              >
                <Discord className="size-4" />
              </a>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <Link to="/login" className="hover:text-foreground transition-colors">
              Platform Login
            </Link>
            <span>·</span>
            <Link to="/signup" className="hover:text-foreground transition-colors">
              Create Squad Account
            </Link>
            <span>·</span>
            <span className="font-mono text-[11px] text-primary font-bold">Release 2026.4</span>
          </div>
        </div>

        {/* Fine-Print Disclaimer & Copyright */}
        <div className="mt-8 pt-6 border-t border-border/40 text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-muted-foreground">
          <p>
            © {new Date().getFullYear()} BizzMitra-AI Inc. Built for enterprise transformation squads.
          </p>
          <p className="text-muted-foreground/80 max-w-xl text-center sm:text-right">
            Blueprints, architectures, CRM schemas, and delivery roadmaps are synthesized via deterministic 5-layer intelligence graphs.
          </p>
        </div>
      </div>
    </footer>
  );
}
