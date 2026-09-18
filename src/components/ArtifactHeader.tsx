import { Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import { ArrowLeft, ArrowRight, Download, GitBranch, RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { ExportModal } from "@/components/ExportModal";
import { VersionControlDrawer } from "@/components/VersionControlDrawer";
import { cn } from "@/lib/utils";
import { ROLE_DEFINITIONS, UserRole, loadCurrentRole } from "@/lib/admin-rbac-data";
import { useTranslation } from "@/lib/i18n";

export const CHAIN = [
  { id: "intake", label: "Intake", to: "/workspace/new" },
  { id: "discovery", label: "Discovery", to: "/workspace/discovery" },
  { id: "solution", label: "Framing & Solution", to: "/workspace/solution" },
  { id: "crm", label: "HR CRM", to: "/workspace/solution/crm" },
  { id: "architecture", label: "Architecture", to: "/workspace/architecture" },
  { id: "process", label: "Process", to: "/workspace/process" },
  { id: "wireframes", label: "UX", to: "/workspace/wireframes" },
  { id: "data", label: "Data & APIs", to: "/workspace/data" },
  { id: "roadmap", label: "Roadmap", to: "/workspace/roadmap" },
  { id: "dashboard", label: "Transformation", to: "/workspace/insights" },
  { id: "map", label: "Artifact Map", to: "/workspace/map" },
] as const;

export function ArtifactHeader({
  id,
  title,
  kicker,
  onRegenerate,
}: {
  id: (typeof CHAIN)[number]["id"];
  title: string;
  kicker: string;
  onRegenerate?: () => void;
}) {
  const [exporting, setExporting] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [versionDrawerOpen, setVersionDrawerOpen] = useState(false);
  const [role, setRole] = useState<UserRole>("admin");
  const { t } = useTranslation();

  useEffect(() => {
    setRole(loadCurrentRole());
    const onRoleChange = (e: Event) => {
      const ce = e as CustomEvent<UserRole>;
      setRole(ce.detail || loadCurrentRole());
    };
    window.addEventListener("bizzmitra:role-changed", onRoleChange);
    return () => window.removeEventListener("bizzmitra:role-changed", onRoleChange);
  }, []);

  const permissions = ROLE_DEFINITIONS[role]?.permissions || ROLE_DEFINITIONS.admin.permissions;
  const idx = CHAIN.findIndex((c) => c.id === id);
  const prev = CHAIN[idx - 1];
  const next = CHAIN[idx + 1];

  function regen() {
    if (!permissions.canRegenerateAI) {
      toast.error(`Your role (${ROLE_DEFINITIONS[role].badge}) cannot trigger AI blueprint regeneration.`);
      return;
    }
    setRegenerating(true);
    onRegenerate?.();
    setTimeout(() => setRegenerating(false), 2200);
  }

  function handleExportClick() {
    if (!permissions.canExportDeliverables) {
      toast.error(`Your role (${ROLE_DEFINITIONS[role].badge}) has read-only access. Export is disabled.`);
      return;
    }
    setExporting(true);
  }

  return (
    <header className="mb-8">
      {/* Chain breadcrumb — the visible "connected workspace" motif */}
      <nav aria-label="Artifact chain" className="mb-6 overflow-x-auto pb-1">
        <ol className="flex items-center gap-1.5 whitespace-nowrap text-xs">
          {CHAIN.map((c, i) => (
            <li key={c.id} className="flex items-center gap-1.5">
              {i > 0 ? <span className="text-border">—</span> : null}
              <Link
                to={c.to}
                className={cn(
                  "rounded-full px-2.5 py-1 transition-colors",
                  c.id === id
                    ? "bg-primary font-semibold text-primary-foreground"
                    : i < idx
                      ? "text-foreground hover:bg-accent"
                      : "text-muted-foreground hover:bg-accent",
                )}
              >
                {t("chain." + c.id, c.label)}
              </Link>
            </li>
          ))}
        </ol>
      </nav>

      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">{kicker}</p>
          <h1 className="mt-2 font-display text-4xl font-extrabold sm:text-5xl">{title}</h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setVersionDrawerOpen(true)}
            className="neu-sm neu-press flex items-center gap-1.5 px-3 py-2.5 text-xs font-semibold hover:text-primary"
            title="Inspect workspace versions and diffs"
          >
            <GitBranch className="size-3.5 text-primary" />
            <span>v1.3</span>
          </button>
          <button
            onClick={regen}
            disabled={!permissions.canRegenerateAI}
            title={!permissions.canRegenerateAI ? `Disabled for role: ${role}` : "Trigger AI regeneration"}
            className={cn(
              "neu-sm neu-press flex items-center gap-2 px-3.5 py-2.5 text-sm font-medium",
              !permissions.canRegenerateAI && "opacity-50 cursor-not-allowed",
            )}
          >
            <motion.span
              animate={regenerating ? { rotate: 360 } : { rotate: 0 }}
              transition={regenerating ? { duration: 1, repeat: Infinity, ease: "linear" } : {}}
            >
              <RefreshCw className="size-4" />
            </motion.span>
            {regenerating ? t("chain.regenerate", "Regenerating") : t("chain.regenerate", "Regenerate")}
          </button>
          <button
            onClick={handleExportClick}
            disabled={!permissions.canExportDeliverables}
            title={!permissions.canExportDeliverables ? `Disabled for role: ${role}` : "Export artifact deliverables"}
            className={cn(
              "neu-press flex items-center gap-2 rounded-xl bg-primary px-3.5 py-2.5 text-sm font-semibold text-primary-foreground",
              !permissions.canExportDeliverables && "opacity-50 cursor-not-allowed",
            )}
          >
            <Download className="size-4" />
            {t("chain.export", "Export")}
          </button>
        </div>
      </div>

      <ExportModal open={exporting} onClose={() => setExporting(false)} artifactName={title} />
      <VersionControlDrawer open={versionDrawerOpen} onClose={() => setVersionDrawerOpen(false)} />

      <div className="mt-6 flex items-center justify-between text-sm">
        {prev ? (
          <Link to={prev.to} className="flex items-center gap-1.5 text-muted-foreground hover:text-primary">
            <ArrowLeft className="size-3.5" /> {t("chain." + prev.id, prev.label)}
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link to={next.to} className="flex items-center gap-1.5 font-medium text-primary">
            {t("chain." + next.id, next.label)} <ArrowRight className="size-3.5" />
          </Link>
        ) : null}
      </div>
    </header>
  );
}
