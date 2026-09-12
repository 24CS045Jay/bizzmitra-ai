import { AnimatePresence, motion } from "motion/react";
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Clock,
  Diff,
  FileCheck,
  GitBranch,
  GitCommit,
  Layers,
  Plus,
  RotateCcw,
  ShieldCheck,
  Tag,
  User,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import {
  ArtifactDiffItem,
  loadWorkspaceVersions,
  saveWorkspaceVersions,
  WorkspaceVersionSnapshot,
} from "@/lib/version-control-data";

interface VersionControlDrawerProps {
  open: boolean;
  onClose: () => void;
  onRollback?: (version: WorkspaceVersionSnapshot) => void;
}

export function VersionControlDrawer({ open, onClose, onRollback }: VersionControlDrawerProps) {
  const [versions, setVersions] = useState<WorkspaceVersionSnapshot[]>([]);
  const [selectedVersionId, setSelectedVersionId] = useState<string>("v1.3");
  const [newSnapshotModalOpen, setNewSnapshotModalOpen] = useState(false);
  const [newSnapshotLabel, setNewSnapshotLabel] = useState("");
  const [newSnapshotSummary, setNewSnapshotSummary] = useState("");

  useEffect(() => {
    if (open) {
      setVersions(loadWorkspaceVersions());
    }
  }, [open]);

  const activeVersion = versions.find((v) => v.version === selectedVersionId) ?? versions[0];

  const handleRollback = (v: WorkspaceVersionSnapshot) => {
    // Set active in storage
    const updated = versions.map((item) => ({
      ...item,
      status: item.version === v.version ? ("active" as const) : ("archived" as const),
    }));
    setVersions(updated);
    saveWorkspaceVersions(updated);
    toast.success(`Restored workspace blueprint to ${v.version} (${v.label})!`);
    if (onRollback) onRollback(v);
  };

  const handleCreateSnapshot = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSnapshotLabel.trim()) {
      toast.error("Please provide a snapshot label");
      return;
    }

    const nextVerNum = (parseFloat(versions[0]?.version.replace("v", "") ?? "1.3") + 0.1).toFixed(1);
    const newVer: WorkspaceVersionSnapshot = {
      version: `v${nextVerNum}`,
      label: newSnapshotLabel.trim(),
      author: {
        name: "Param Shah",
        role: "Transformation Lead",
      },
      timestamp: "Just now",
      summary: newSnapshotSummary.trim() || "User-created milestone checkpoint.",
      status: "active",
      diffs: [
        {
          artifact: "Workspace Checkpoint",
          changeType: "added",
          description: `Custom checkpoint created: ${newSnapshotLabel.trim()}`,
        },
      ],
      metricsSnapshot: {
        maturityScore: 96,
        annualSavings: "₹32.30 L",
        paybackMonths: 2.4,
        activeFieldsCount: 14,
      },
    };

    const updated = [newVer, ...versions.map((v) => ({ ...v, status: "archived" as const }))];
    setVersions(updated);
    saveWorkspaceVersions(updated);
    setSelectedVersionId(newVer.version);
    setNewSnapshotModalOpen(false);
    setNewSnapshotLabel("");
    setNewSnapshotSummary("");
    toast.success(`Created snapshot ${newVer.version}: ${newVer.label}!`);
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-50 bg-foreground/30 backdrop-blur-[2px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Slide-out Drawer */}
          <motion.div
            className="fixed inset-y-0 right-0 z-50 flex w-full max-w-2xl flex-col bg-card shadow-2xl border-l border-border/40 sm:rounded-l-2xl"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border/40 p-5 sm:px-6">
              <div className="flex items-center gap-2.5">
                <div className="grid size-9 place-items-center rounded-xl bg-primary/10 text-primary">
                  <GitBranch className="size-4.5" />
                </div>
                <div>
                  <h3 className="font-display text-base font-bold">Workspace Version History</h3>
                  <p className="text-xs text-muted-foreground">
                    Chronological audit trail, visual diffs, and instant rollback.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setNewSnapshotModalOpen(true)}
                  className="neu-sm neu-press flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-primary"
                >
                  <Plus className="size-3.5" />
                  Create Snapshot
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="neu-sm neu-press grid size-8 place-items-center"
                >
                  <X className="size-4" />
                </button>
              </div>
            </div>

            {/* Main Body: Split View (Timeline List on Left, Deep Diff on Right) */}
            <div className="grid flex-1 overflow-hidden sm:grid-cols-12">
              {/* Left Timeline (5 cols) */}
              <div className="border-r border-border/40 overflow-y-auto p-4 sm:col-span-5 space-y-3">
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Iterations ({versions.length})
                </p>

                <div className="space-y-2">
                  {versions.map((v) => {
                    const isSelected = v.version === activeVersion?.version;
                    return (
                      <div
                        key={v.version}
                        onClick={() => setSelectedVersionId(v.version)}
                        className={`group cursor-pointer rounded-xl p-3 transition ${
                          isSelected
                            ? "neu-inset ring-1 ring-primary/50"
                            : "neu-sm hover:bg-muted/40"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-xs font-bold text-primary">
                            {v.version}
                          </span>
                          <span
                            className={`rounded px-1.5 py-0.5 text-[9px] font-bold uppercase ${
                              v.status === "approved"
                                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                                : v.status === "active"
                                  ? "bg-primary/10 text-primary"
                                  : "bg-muted text-muted-foreground"
                            }`}
                          >
                            {v.status}
                          </span>
                        </div>
                        <h4 className="mt-1 text-xs font-bold leading-snug line-clamp-2">
                          {v.label}
                        </h4>
                        <div className="mt-2 flex items-center justify-between text-[10px] text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="size-3" />
                            {v.timestamp}
                          </span>
                          <span>{v.diffs.length} diffs</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Right Diff Inspector (7 cols) */}
              <div className="flex flex-col overflow-y-auto p-5 sm:col-span-7 space-y-5">
                {activeVersion ? (
                  <>
                    {/* Active Version Title Card */}
                    <div className="neu-inset p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-base font-extrabold text-primary">
                            {activeVersion.version}
                          </span>
                          <span className="text-xs text-muted-foreground">·</span>
                          <span className="text-xs font-bold">{activeVersion.label}</span>
                        </div>
                        {activeVersion.status !== "active" && (
                          <button
                            type="button"
                            onClick={() => handleRollback(activeVersion)}
                            className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1 text-xs font-bold text-primary-foreground shadow-sm hover:opacity-90"
                          >
                            <RotateCcw className="size-3" />
                            Rollback
                          </button>
                        )}
                      </div>

                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {activeVersion.summary}
                      </p>

                      <div className="flex items-center justify-between border-t border-border/30 pt-2 text-[11px] text-muted-foreground">
                        <span className="flex items-center gap-1.5">
                          <User className="size-3.5 text-primary" />
                          {activeVersion.author.name} ({activeVersion.author.role})
                        </span>
                        <span>{activeVersion.timestamp}</span>
                      </div>
                    </div>

                    {/* Snapshot Metrics Snapshot */}
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">
                        State at this Checkpoint
                      </p>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="neu-inset p-2.5">
                          <span className="text-muted-foreground text-[10px]">Digital Maturity</span>
                          <p className="font-bold text-foreground">
                            {activeVersion.metricsSnapshot.maturityScore}%
                          </p>
                        </div>
                        <div className="neu-inset p-2.5">
                          <span className="text-muted-foreground text-[10px]">Annual Benefit</span>
                          <p className="font-bold text-emerald-600 dark:text-emerald-400">
                            {activeVersion.metricsSnapshot.annualSavings}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Visual Diff Changes */}
                    <div className="space-y-2.5 flex-1">
                      <div className="flex items-center justify-between">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                          Changes in this Version ({activeVersion.diffs.length})
                        </p>
                        <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                          <Diff className="size-3" /> Visual AST Diff
                        </span>
                      </div>

                      <div className="space-y-2">
                        {activeVersion.diffs.map((diff, i) => (
                          <div key={i} className="rounded-xl border border-border/40 p-3 text-xs space-y-1.5">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-foreground">{diff.artifact}</span>
                              <span
                                className={`rounded px-1.5 py-0.5 text-[9px] font-bold uppercase ${
                                  diff.changeType === "added"
                                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                                    : diff.changeType === "modified"
                                      ? "bg-blue-500/10 text-blue-600 dark:text-blue-400"
                                      : "bg-red-500/10 text-red-500"
                                }`}
                              >
                                {diff.changeType}
                              </span>
                            </div>
                            <p className="text-[11px] text-muted-foreground leading-snug">
                              {diff.description}
                            </p>

                            {diff.previousValue && diff.currentValue && (
                              <div className="mt-2 space-y-1 rounded bg-background/60 p-2 text-[10px] font-mono">
                                <div className="text-red-500 line-through">
                                  - {diff.previousValue}
                                </div>
                                <div className="text-emerald-500 font-semibold">
                                  + {diff.currentValue}
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="grid flex-1 place-items-center text-xs text-muted-foreground">
                    Select a version to inspect diffs
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-border/40 p-4 bg-muted/20 flex items-center justify-between text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="size-3.5 text-emerald-500" />
                Immutable Git-backed Hash Verification
              </span>
              <button
                type="button"
                onClick={onClose}
                className="neu-sm neu-press px-3 py-1 font-semibold hover:text-primary"
              >
                Done
              </button>
            </div>
          </motion.div>

          {/* Create Snapshot Modal */}
          {newSnapshotModalOpen && (
            <div className="fixed inset-0 z-60 grid place-items-center bg-foreground/40 p-4 backdrop-blur-[2px]">
              <motion.div
                className="w-full max-w-md rounded-2xl bg-card p-6 shadow-2xl border border-border/50 space-y-4"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <div className="flex items-center justify-between border-b border-border/40 pb-3">
                  <div className="flex items-center gap-2">
                    <Tag className="size-4 text-primary" />
                    <h4 className="font-display text-base font-bold">Create Version Checkpoint</h4>
                  </div>
                  <button
                    type="button"
                    onClick={() => setNewSnapshotModalOpen(false)}
                    className="neu-sm neu-press grid size-7 place-items-center"
                  >
                    <X className="size-3.5" />
                  </button>
                </div>

                <form onSubmit={handleCreateSnapshot} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-foreground">Checkpoint Label</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Pre-Steering Committee v1.4"
                      value={newSnapshotLabel}
                      onChange={(e) => setNewSnapshotLabel(e.target.value)}
                      className="neu-inset w-full px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-foreground">Change Summary</label>
                    <textarea
                      rows={3}
                      placeholder="What was updated in this milestone?"
                      value={newSnapshotSummary}
                      onChange={(e) => setNewSnapshotSummary(e.target.value)}
                      className="neu-inset w-full px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-2 border-t border-border/30">
                    <button
                      type="button"
                      onClick={() => setNewSnapshotModalOpen(false)}
                      className="neu-sm px-3 py-1.5 text-xs font-semibold"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="rounded-lg bg-primary px-4 py-1.5 text-xs font-bold text-primary-foreground shadow-sm hover:opacity-90"
                    >
                      Save Snapshot
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </>
      )}
    </AnimatePresence>
  );
}
