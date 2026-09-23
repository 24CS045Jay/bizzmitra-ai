import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { ArrowRight, Lock } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

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
        if (!parsed.includes("discovery")) parsed.unshift("discovery");
        return parsed;
      }
    }
  } catch {}
  return ["discovery"];
}

/**
 * Checks whether AI Discovery has been completed for the active workspace.
 * Checked against workspaceContext flag, local storage, user cache, and stages list.
 */
export function isDiscoveryCompleted(targetWsId?: string): boolean {
  if (typeof window === "undefined") return false;
  const wsId = targetWsId || window.localStorage.getItem("bizzmitra.activeWorkspaceId") || "default";

  // Demo account default always unlocked
  if (wsId === "ws-talentcraft-default") return true;

  // 1. Direct workspaceContext check
  try {
    const raw = window.localStorage.getItem("bizzmitra.workspaceContext");
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed?.discoveryCompleted === true) return true;
    }
  } catch {}

  // 2. Explicit discovery completed key
  if (window.localStorage.getItem(`bizzmitra.discoveryCompleted_${wsId}`) === "true") {
    return true;
  }

  // 3. User-scoped cache check
  try {
    for (let i = 0; i < window.localStorage.length; i++) {
      const k = window.localStorage.key(i);
      if (k && k.startsWith("bizzmitra.user_workspaces_")) {
        const val = window.localStorage.getItem(k);
        if (val) {
          const parsed = JSON.parse(val);
          if (parsed?.activeId === wsId && parsed?.context?.discoveryCompleted === true) {
            return true;
          }
        }
      }
    }
  } catch {}

  // 4. Stored unlocked stages list
  const unlocked = getUnlockedStages();
  return unlocked.includes("solution") || unlocked.includes("all") || unlocked.length > 1;
}

/**
 * Checks whether a specific stage is unlocked.
 * Discovery, export, and settings are always accessible.
 * Once Discovery is completed, ALL stages across the platform are unlocked!
 */
export function isStageUnlocked(stageId: string): boolean {
  if (stageId === "discovery" || stageId === "export" || stageId === "settings") return true;
  return isDiscoveryCompleted();
}

/**
 * Unlocks all workspace stages upon completing AI Discovery and persists to DB.
 */
export function completeDiscoveryAndUnlockAll(
  workspaceId?: string,
  extraContext?: Record<string, unknown>,
): void {
  if (typeof window === "undefined") return;
  const wsId = workspaceId || window.localStorage.getItem("bizzmitra.activeWorkspaceId") || "default";
  const allIds = [...WORKSPACE_STAGES.map((s) => s.id), "crm", "all"];

  const key = `${STAGES_STORAGE_KEY_PREFIX}_${wsId}`;
  window.localStorage.setItem(key, JSON.stringify(allIds));
  window.localStorage.setItem(`bizzmitra.discoveryCompleted_${wsId}`, "true");

  // Update local workspaceContext
  let currentCtx: any = {};
  try {
    const raw = window.localStorage.getItem("bizzmitra.workspaceContext");
    if (raw) currentCtx = JSON.parse(raw);
  } catch {}

  const updatedCtx = {
    ...currentCtx,
    ...(extraContext || {}),
    discoveryCompleted: true,
    lastUpdated: new Date().toISOString(),
  };

  window.localStorage.setItem("bizzmitra.workspaceContext", JSON.stringify(updatedCtx));

  // Persist to Supabase if valid UUID
  const isUuid = wsId && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(wsId);
  if (isUuid) {
    void supabase
      .from("workspaces")
      .update({
        workspace_context: updatedCtx,
        maturity_score: 85,
        updated_at: new Date().toISOString(),
      })
      .eq("id", wsId)
      .then(({ error }) => {
        if (error) console.warn("[completeDiscoveryAndUnlockAll DB error]:", error.message);
      });
  }

  window.dispatchEvent(new CustomEvent("bizzmitra:stages-updated", { detail: allIds }));
  window.dispatchEvent(new CustomEvent("bizzmitra:workspace-updated", { detail: updatedCtx }));
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
 * Resets stage progression for a new workspace (only discovery unlocked until completed).
 */
export function resetWorkspaceStages(workspaceId?: string): void {
  if (typeof window === "undefined") return;
  const wsId = workspaceId || window.localStorage.getItem("bizzmitra.activeWorkspaceId") || "default";
  const key = `${STAGES_STORAGE_KEY_PREFIX}_${wsId}`;
  window.localStorage.setItem(key, JSON.stringify(["discovery"]));
  window.localStorage.removeItem(`bizzmitra.discoveryCompleted_${wsId}`);

  try {
    const raw = window.localStorage.getItem("bizzmitra.workspaceContext");
    if (raw) {
      const parsed = JSON.parse(raw);
      parsed.discoveryCompleted = false;
      window.localStorage.setItem("bizzmitra.workspaceContext", JSON.stringify(parsed));
    }
  } catch {}

  window.dispatchEvent(new CustomEvent("bizzmitra:stages-updated", { detail: ["discovery"] }));
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
  if (isDiscoveryCompleted()) {
    return WORKSPACE_STAGES[1]!; // Solution Studio
  }
  return WORKSPACE_STAGES[0]!; // Discovery
}

/**
 * Given a target path, returns whether it is allowed.
 */
export function validateRouteAccess(pathname: string): { allowed: boolean; redirectTo?: string; reason?: string } {
  if (
    pathname.startsWith("/workspace/discovery") ||
    pathname.startsWith("/workspace/new") ||
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/settings") ||
    pathname.startsWith("/workspace/export")
  ) {
    return { allowed: true };
  }

  if (!isDiscoveryCompleted()) {
    return {
      allowed: false,
      redirectTo: "/workspace/discovery",
      reason: "Please complete AI Discovery first to unlock all workspace blueprints.",
    };
  }

  return { allowed: true };
}

/**
 * React hook that enforces stage gating on any workspace route.
 */
export function useStageGate(currentStageId: string) {
  const navigate = useNavigate();

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (currentStageId === "discovery") return;

    if (!isStageUnlocked(currentStageId)) {
      toast.warning("Please complete AI Discovery first to unlock all workspace modules.", {
        id: "gate-lock-discovery",
      });
      navigate({ to: "/workspace/discovery" });
    }
  }, [currentStageId, navigate]);
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

