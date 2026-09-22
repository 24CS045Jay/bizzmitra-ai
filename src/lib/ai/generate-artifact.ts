/**
 * The single mock boundary for the "AI brain".
 *
 * Round 1 returns curated seed content after a believable delay. To go live,
 * replace the body of `generateArtifact` with a Groq/Gemini call that returns
 * the same shape — no UI component needs to change.
 */

import { supabase } from "@/integrations/supabase/client";
import type { Json } from "@/integrations/supabase/types";
import { PAYLOADS, type ArtifactKind } from "./generate-artifact-payloads";

export type { ArtifactKind };

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

export { PAYLOADS };

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
  const workspaceId = typeof window !== "undefined" ? window.localStorage.getItem("bizzmitra.activeWorkspaceId") : null;
  const isValidUuid = workspaceId && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(workspaceId);

  if (isValidUuid && kind !== "summary") {
    try {
      const { data: latest, error: latestError } = await supabase
        .from("artifacts")
        .select("version")
        .eq("workspace_id", workspaceId)
        .eq("module_type", kind)
        .order("version", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!latestError) {
        await supabase.from("artifacts").insert({
          workspace_id: workspaceId,
          module_type: kind,
          content: payload as Json,
          version: (latest?.version ?? 0) + 1,
        });
      }
    } catch (err) {
      console.warn(`[generateArtifact] Artifact persistence skipped for ${kind}:`, err);
    }
  }

  return payload as T;
}
