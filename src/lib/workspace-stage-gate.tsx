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
 * When discovery is not yet completed, only 'discovery' is unlocked.
 */
export function getUnlockedStages(targetWsId?: string): string[] {
  if (isDiscoveryCompleted(targetWsId)) {
    return [...WORKSPACE_STAGES.map((s) => s.id), "crm", "build", "all"];
  }
  return ["discovery"];
}

/**
 * Checks whether AI Discovery has been completed for the active workspace.
 */
export function isDiscoveryCompleted(targetWsId?: string): boolean {
  if (typeof window === "undefined") return false;
  const wsId = targetWsId || window.localStorage.getItem("bizzmitra.activeWorkspaceId") || "default";

  // 1. Direct discovery completion flag for active workspace
  if (window.localStorage.getItem(`bizzmitra.discoveryCompleted_${wsId}`) === "true") {
    return true;
  }

  // 2. Check workspace context in localStorage
  try {
    const raw = window.localStorage.getItem("bizzmitra.workspaceContext");
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.discoveryCompleted === true) return true;
    }
  } catch {}

  // 3. Check cached unlocked stages list
  try {
    const key = `${STAGES_STORAGE_KEY_PREFIX}_${wsId}`;
    const rawStages = window.localStorage.getItem(key);
    if (rawStages) {
      const list = JSON.parse(rawStages);
      if (Array.isArray(list) && list.includes("solution")) return true;
    }
  } catch {}

  return false;
}

/**
 * Checks whether a specific stage is unlocked.
 * Problem Intake, Dashboard/Workspaces, and AI Discovery are ALWAYS accessible.
 * Downstream modules require AI Discovery to be completed.
 */
export function isStageUnlocked(stageId: string, targetWsId?: string): boolean {
  if (
    stageId === "discovery" ||
    stageId === "new" ||
    stageId === "intake" ||
    stageId === "dashboard" ||
    stageId === "settings" ||
    stageId === "home"
  ) {
    return true;
  }

  return isDiscoveryCompleted(targetWsId);
}

/**
 * Unlocks all workspace stages upon completing AI Discovery and persists to DB.
 */
export function completeDiscoveryAndUnlockAll(
  workspaceId?: string,
  extraContext?: any,
): void {
  if (typeof window === "undefined") return;
  const wsId = workspaceId || window.localStorage.getItem("bizzmitra.activeWorkspaceId") || "default";
  const allIds = [...WORKSPACE_STAGES.map((s) => s.id), "crm", "build", "all"];

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
      } as any)
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
  if (stageId === "discovery") return;
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
 * Resets stage progression for a new workspace: locks downstream modules until discovery is done.
 */
export function resetWorkspaceStages(workspaceId?: string): void {
  if (typeof window === "undefined") return;
  const wsId = workspaceId || window.localStorage.getItem("bizzmitra.activeWorkspaceId") || "default";
  const key = `${STAGES_STORAGE_KEY_PREFIX}_${wsId}`;
  window.localStorage.setItem(key, JSON.stringify(["discovery"]));
  window.localStorage.removeItem(`bizzmitra.discoveryCompleted_${wsId}`);

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
  return WORKSPACE_STAGES[0]!; // AI Discovery
}

/**
 * Given a target path, returns whether it is allowed.
 */
export function validateRouteAccess(pathname: string): { allowed: boolean; redirectTo?: string; reason?: string } {
  // Problem Intake, Workspaces/Dashboard, and AI Discovery are ALWAYS allowed
  if (
    pathname === "/" ||
    pathname.startsWith("/login") ||
    pathname.startsWith("/signup") ||
    pathname.startsWith("/dashboard") ||
    pathname === "/workspace/new" ||
    pathname === "/workspace/discovery" ||
    pathname.startsWith("/settings") ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/about")
  ) {
    return { allowed: true };
  }

  // All downstream workspace modules require AI Discovery
  if (!isDiscoveryCompleted()) {
    return {
      allowed: false,
      redirectTo: "/workspace/discovery",
      reason: "Please complete AI Diagnostic Discovery first before proceeding to this module.",
    };
  }

  return { allowed: true };
}

/**
 * React hook that enforces stage gating on downstream workspace routes.
 */
export function useStageGate(currentStageId: string) {
  const navigate = useNavigate();

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (currentStageId === "discovery") return; // Discovery is always permitted

    const unlocked = isStageUnlocked(currentStageId);
    if (!unlocked) {
      toast.error(
        "🔒 AI Discovery Required: Please complete the AI Diagnostic Discovery first before accessing this module.",
        {
          duration: 5000,
          id: "discovery-required-gate",
        }
      );
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

