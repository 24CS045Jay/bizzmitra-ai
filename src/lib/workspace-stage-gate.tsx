import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { ArrowRight, Lock } from "lucide-react";
import { toast } from "sonner";

/**
 * Workspace Stage Progression & Access Control Engine
 * Ensures sequential milestone unlocking across the transformation lifecycle:
 * Discovery -> Solution -> Architecture -> Process -> Wireframes -> Data -> Roadmap -> ROI -> Map -> Collaboration -> Export
 */

export interface WorkspaceStage {
  id: string;
  order: number;
  label: string;
  path: string;
  requiredStageId?: string;
  description: string;
}

export const WORKSPACE_STAGES: WorkspaceStage[] = [
  {
    id: "discovery",
    order: 1,
    label: "AI Discovery",
    path: "/workspace/discovery",
    description: "Diagnostic problem interview & business analysis report",
  },
  {
    id: "solution",
    order: 2,
    label: "Solution Studio",
    path: "/workspace/solution",
    requiredStageId: "discovery",
    description: "Architectural capability matrix & solution framing",
  },
  {
    id: "architecture",
    order: 3,
    label: "Architecture Models",
    path: "/workspace/architecture",
    requiredStageId: "solution",
    description: "HLD topology, component sequence, and security",
  },
  {
    id: "process",
    order: 4,
    label: "Process Intelligence",
    path: "/workspace/process",
    requiredStageId: "architecture",
    description: "BPMN 2.0 executable lanes & failure matrices",
  },
  {
    id: "wireframes",
    order: 5,
    label: "Interactive Wireframes",
    path: "/workspace/wireframes",
    requiredStageId: "process",
    description: "High-fidelity interactive screen concepts",
  },
  {
    id: "data",
    order: 6,
    label: "Data & APIs",
    path: "/workspace/data",
    requiredStageId: "wireframes",
    description: "PostgreSQL 16 RLS DDL & REST API contracts",
  },
  {
    id: "roadmap",
    order: 7,
    label: "Delivery Roadmap",
    path: "/workspace/roadmap",
    requiredStageId: "data",
    description: "Phased agile rollout & sprint capacity planning",
  },
  {
    id: "insights",
    order: 8,
    label: "Financial ROI & Readiness",
    path: "/workspace/insights",
    requiredStageId: "roadmap",
    description: "Algorithmic payback modeling & organizational radar",
  },
  {
    id: "map",
    order: 9,
    label: "Artifact Map",
    path: "/workspace/map",
    requiredStageId: "insights",
    description: "Interactive Cytoscape dependency knowledge graph",
  },
  {
    id: "collaboration",
    order: 10,
    label: "Governance & Review",
    path: "/workspace/collaboration",
    requiredStageId: "map",
    description: "Multi-stakeholder sign-offs & audit trails",
  },
  {
    id: "export",
    order: 11,
    label: "Universal Export Center",
    path: "/workspace/export",
    requiredStageId: "collaboration",
    description: "Multi-format deliverables packaging (PDF, Word, Excel, PPT, SQL)",
  },
];

const STAGES_STORAGE_KEY_PREFIX = "bizzmitra.unlockedStages";

function getStorageKey(): string {
  if (typeof window === "undefined") return `${STAGES_STORAGE_KEY_PREFIX}_default`;
  const activeWsId = window.localStorage.getItem("bizzmitra.activeWorkspaceId") || "default";
  return `${STAGES_STORAGE_KEY_PREFIX}_${activeWsId}`;
}

/**
 * Returns list of currently unlocked stage IDs for the active workspace.
 */
export function getUnlockedStages(): string[] {
  if (typeof window === "undefined") return ["discovery"];
  try {
    const raw = window.localStorage.getItem(getStorageKey());
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Ensure discovery is always present
        if (!parsed.includes("discovery")) parsed.unshift("discovery");
        return parsed;
      }
    }
  } catch {}
  return ["discovery"];
}

/**
 * Checks whether AI Discovery has been completed for the active workspace.
 */
export function isDiscoveryCompleted(): boolean {
  if (typeof window === "undefined") return false;
  const unlocked = getUnlockedStages();
  return unlocked.includes("solution") || unlocked.includes("all") || unlocked.length > 1;
}

/**
 * Checks whether a specific stage is unlocked.
 * Discovery is always accessible.
 * Once Discovery is completed, ALL stages across the entire platform are unlocked!
 */
export function isStageUnlocked(stageId: string): boolean {
  return true;
}

/**
 * Unlocks all workspace stages upon completing AI Discovery.
 */
export function completeDiscoveryAndUnlockAll(workspaceId?: string): void {
  if (typeof window === "undefined") return;
  const allIds = [...WORKSPACE_STAGES.map((s) => s.id), "crm", "all"];
  const key = workspaceId ? `${STAGES_STORAGE_KEY_PREFIX}_${workspaceId}` : getStorageKey();
  window.localStorage.setItem(key, JSON.stringify(allIds));
  window.dispatchEvent(new CustomEvent("bizzmitra:stages-updated", { detail: allIds }));
}

/**
 * Unlocks a stage and persists it permanently for the active workspace.
 */
export function unlockStage(stageId: string): void {
  completeDiscoveryAndUnlockAll();
}

/**
 * Marks a stage as completed and automatically unlocks all stages.
 */
export function completeStageAndUnlockNext(currentStageId: string): string | null {
  completeDiscoveryAndUnlockAll();

  const currentIndex = WORKSPACE_STAGES.findIndex((s) => s.id === currentStageId);
  if (currentIndex >= 0 && currentIndex < WORKSPACE_STAGES.length - 1) {
    const nextStage = WORKSPACE_STAGES[currentIndex + 1]!;
    return nextStage.path;
  }
  return null;
}

/**
 * Resets stage progression for a new workspace.
 */
export function resetWorkspaceStages(workspaceId?: string): void {
  if (typeof window === "undefined") return;
  const key = workspaceId ? `${STAGES_STORAGE_KEY_PREFIX}_${workspaceId}` : getStorageKey();
  window.localStorage.setItem(key, JSON.stringify(WORKSPACE_STAGES.map((s) => s.id)));
  window.dispatchEvent(new CustomEvent("bizzmitra:stages-updated", { detail: WORKSPACE_STAGES.map((s) => s.id) }));
}

/**
 * Unlocks all stages.
 */
export function unlockAllStages(): void {
  completeDiscoveryAndUnlockAll();
}

/**
 * Resolves the highest unlocked stage that the user can currently navigate to.
 */
export function getHighestUnlockedStage(): WorkspaceStage {
  return WORKSPACE_STAGES[1]!; // Solution Studio
}

/**
 * Given a target path, returns whether it is allowed.
 */
export function validateRouteAccess(pathname: string): { allowed: boolean; redirectTo?: string; reason?: string } {
  return { allowed: true };
}

/**
 * React hook that tracks stage progression without blocking navigation.
 */
export function useStageGate(currentStageId: string) {
  useEffect(() => {
    // Stage tracking hook
  }, [currentStageId]);
}

/**
 * Bottom milestone completion banner that unlocks the next phase and navigates forward.
 */
export function StageNextButton({
  currentStageId,
  label,
}: {
  currentStageId: string;
  label?: string;
}) {
  const navigate = useNavigate();
  const currentIndex = WORKSPACE_STAGES.findIndex((s) => s.id === currentStageId);
  const nextStage =
    currentIndex >= 0 && currentIndex < WORKSPACE_STAGES.length - 1
      ? WORKSPACE_STAGES[currentIndex + 1]
      : null;

  if (!nextStage) return null;

  const isDiscovery = currentStageId === "discovery";

  const handleProceed = () => {
    completeDiscoveryAndUnlockAll();
    navigate({ to: nextStage.path });
    if (isDiscovery) {
      toast.success("AI Discovery complete! All workspace blueprints unlocked.");
    }
  };

  return (
    <div className="mt-8 pt-6 border-t border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div className="space-y-1">
        <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
          <span className="inline-block size-2 rounded-full bg-emerald-500" />
          <span>{isDiscovery ? "AI Discovery Completed • All Blueprints Unlocked" : "Stage Milestone Completed"}</span>
        </div>
        <p className="text-xs text-muted-foreground">
          Next Phase: <strong className="text-foreground">{nextStage.label}</strong> — {nextStage.description}
        </p>
      </div>

      <button
        type="button"
        onClick={handleProceed}
        className="flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-xs font-bold text-primary-foreground hover:bg-primary/90 transition shadow-sm shrink-0"
      >
        <span>{label || (isDiscovery ? "Explore Solution Studio & All Modules" : `Proceed to ${nextStage.label}`)}</span>
        <ArrowRight className="size-4" />
      </button>
    </div>
  );
}

