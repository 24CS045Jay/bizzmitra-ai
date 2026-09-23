import { Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import { ArrowLeft, ArrowRight, Download, GitBranch, Lock, RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { ExportModal } from "@/components/ExportModal";
import { VersionControlDrawer } from "@/components/VersionControlDrawer";
import { cn } from "@/lib/utils";
import { ROLE_DEFINITIONS, UserRole, loadCurrentRole } from "@/lib/admin-rbac-data";
import { useTranslation } from "@/lib/i18n";
import { isStageUnlocked, getUnlockedStages } from "@/lib/workspace-stage-gate";

export const CHAIN = [
  { id: "intake", label: "Intake", to: "/workspace/new" },
  { id: "discovery", label: "Discovery", to: "/workspace/discovery" },
  { id: "solution", label: "Framing & Solution", to: "/workspace/solution" },
  { id: "crm", label: "Prototype CRM", to: "/workspace/solution/crm" },
  { id: "architecture", label: "Architecture", to: "/workspace/architecture" },
  { id: "process", label: "Process", to: "/workspace/process" },
  { id: "wireframes", label: "UX", to: "/workspace/wireframes" },
  { id: "data", label: "Data & APIs", to: "/workspace/data" },
  { id: "roadmap", label: "Roadmap", to: "/workspace/roadmap" },
  { id: "insights", label: "Transformation", to: "/workspace/insights" },
  { id: "map", label: "Artifact Map", to: "/workspace/map" },
  { id: "collaboration", label: "Governance", to: "/workspace/collaboration" },
  { id: "export", label: "Export", to: "/workspace/export" },
] as const;

export function ArtifactHeader({
  id,
  title,
  kicker,
  onRegenerate,
}: {
  id: string;
  title: string;
  kicker: string;
  onRegenerate?: () => void;
}) {
  const [exporting, setExporting] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [versionDrawerOpen, setVersionDrawerOpen] = useState(false);
  const [role, setRole] = useState<UserRole>("admin");
  const [unlockedStages, setUnlockedStages] = useState<string[]>(() => getUnlockedStages());
  const { t } = useTranslation();

  useEffect(() => {
    setRole(loadCurrentRole());
    const onRoleChange = (e: Event) => {
      const ce = e as CustomEvent<UserRole>;
      setRole(ce.detail || loadCurrentRole());
    };
    const onStagesChange = () => {
      setUnlockedStages(getUnlockedStages());
    };

    window.addEventListener("bizzmitra:role-changed", onRoleChange);
    window.addEventListener("bizzmitra:stages-updated", onStagesChange);
    window.addEventListener("storage", onStagesChange);

    return () => {
      window.removeEventListener("bizzmitra:role-changed", onRoleChange);
      window.removeEventListener("bizzmitra:stages-updated", onStagesChange);
      window.removeEventListener("storage", onStagesChange);
    };
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
    <header className="mb-8 w-full max-w-full min-w-0 overflow-hidden">
      {/* Chain breadcrumb — the visible "connected workspace" motif */}
      <nav aria-label="Artifact chain" className="mb-6 w-full max-w-full min-w-0 overflow-x-auto pb-1">
        <ol className="flex items-center gap-1.5 whitespace-nowrap text-xs">
          {CHAIN.map((c, i) => {
            const isItemUnlocked = c.id === "intake" || isStageUnlocked(c.id);

            return (
              <li key={c.id} className="flex items-center gap-1.5">
                {i > 0 ? <span className="text-border">—</span> : null}
                {!isItemUnlocked ? (
                  <button
                    type="button"
                    onClick={() =>
                      toast.warning(`Please complete earlier stages to unlock ${c.label}.`)
                    }
                    className="flex items-center gap-1 rounded-full px-2.5 py-1 text-muted-foreground/50 cursor-not-allowed hover:bg-accent/40 transition-colors"
                    title={`Locked: Complete earlier stages to unlock ${c.label}`}
                  >
                    <Lock className="size-2.5 opacity-60" />
                    <span>{t("chain." + c.id, c.label)}</span>
                  </button>
                ) : (
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
                )}
              </li>
            );
          })}
        </ol>
      </nav>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">{kicker}</p>
          <h1 className="mt-1 font-display text-2xl font-extrabold sm:text-3xl lg:text-4xl break-words leading-tight text-foreground">{title}</h1>
        </div>
        <div className="flex flex-wrap items-center gap-2 shrink-0">
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
          (() => {
            const isNextUnlocked = next.id === "intake" || isStageUnlocked(next.id);
            if (!isNextUnlocked) {
              return (
                <button
                  type="button"
                  onClick={() =>
                    toast.warning(`Please complete this stage first to unlock ${next.label}.`)
                  }
                  className="flex items-center gap-1.5 font-medium text-muted-foreground/60 cursor-not-allowed"
                  title={`Complete this stage to unlock ${next.label}`}
                >
                  <Lock className="size-3.5" />
                  <span>{t("chain." + next.id, next.label)}</span>
                  <span className="text-[10px] text-muted-foreground font-normal">(Locked)</span>
                </button>
              );
            }
            return (
              <Link to={next.to} className="flex items-center gap-1.5 font-medium text-primary">
                {t("chain." + next.id, next.label)} <ArrowRight className="size-3.5" />
              </Link>
            );
          })()
        ) : null}
      </div>
    </header>
  );
}
