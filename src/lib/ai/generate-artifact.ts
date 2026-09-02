/**
 * The single mock boundary for the "AI brain".
 *
 * Round 1 returns curated seed content after a believable delay. To go live,
 * replace the body of `generateArtifact` with a Groq/Gemini call that returns
 * the same shape — no UI component needs to change.
 */

import {
  AI_SUMMARY,
  API_ENDPOINTS,
  BPMN_AFTER,
  BPMN_BEFORE,
  ER_DIAGRAM,
  HLD_DIAGRAM,
  LLD_DIAGRAM,
  NAV_FLOW_DIAGRAM,
  PROBLEM_FRAMING,
  ROADMAP,
  SOLUTION,
  SWIMLANE_DIAGRAM,
  WIREFRAMES,
} from "@/lib/demo-data";
import { supabase } from "@/integrations/supabase/client";
import type { Json } from "@/integrations/supabase/types";

export type ArtifactKind =
  | "framing"
  | "solution"
  | "architecture"
  | "process"
  | "ux"
  | "data"
  | "roadmap"
  | "summary";

export type GenerationContext = {
  problem?: string;
  answers?: string[];
};

export const GENERATION_STEPS: Record<ArtifactKind, string[]> = {
  summary: ["Reading intake", "Extracting entities", "Scoring ambiguity", "Preparing questions"],
  framing: ["Analyzing context", "Isolating root causes", "Quantifying impact", "Framing the problem"],
  solution: ["Mapping requirements", "Comparing approaches", "Scoring trade-offs", "Selecting stack"],
  architecture: ["Loading solution context", "Placing components", "Resolving data flows", "Drafting architecture"],
  process: ["Reconstructing as-is flow", "Detecting automation points", "Modelling to-be flow", "Rendering BPMN"],
  ux: ["Deriving screen inventory", "Grouping by actor", "Linking navigation", "Sketching wireframes"],
  data: ["Deriving entities", "Normalising relations", "Designing API surface", "Rendering ER model"],
  roadmap: ["Sizing workstreams", "Sequencing dependencies", "Estimating effort", "Building roadmap"],
};

const PAYLOADS: Record<ArtifactKind, unknown> = {
  summary: { text: AI_SUMMARY },
  framing: PROBLEM_FRAMING,
  solution: SOLUTION,
  architecture: { hld: HLD_DIAGRAM, lld: LLD_DIAGRAM },
  process: { before: BPMN_BEFORE, after: BPMN_AFTER, swimlane: SWIMLANE_DIAGRAM },
  ux: { screens: WIREFRAMES, flow: NAV_FLOW_DIAGRAM },
  data: { er: ER_DIAGRAM, endpoints: API_ENDPOINTS },
  roadmap: { phases: ROADMAP },
};

export function delay(ms: number) {
  return new Promise<void>((r) => setTimeout(r, ms));
}

export async function generateArtifact<T = unknown>(
  kind: ArtifactKind,
  _ctx: GenerationContext = {},
): Promise<T> {
  // Simulated inference latency (1.5–3s) — replace with the real LLM call.
  await delay(1500 + Math.random() * 1500);
  const payload = PAYLOADS[kind];
  const workspaceId = window.localStorage.getItem("bizzmitra.activeWorkspaceId");

  if (workspaceId && kind !== "summary") {
    const { data: latest, error: latestError } = await supabase
      .from("artifacts")
      .select("version")
      .eq("workspace_id", workspaceId)
      .eq("module_type", kind)
      .order("version", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (latestError) throw latestError;

    const { error } = await supabase.from("artifacts").insert({
      workspace_id: workspaceId,
      module_type: kind,
      content: payload as Json,
      version: (latest?.version ?? 0) + 1,
    });
    if (error) throw error;
  }

  return payload as T;
}
