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
} from "../demo-data";

import { PROCESS_METRICS } from "../process-data";

export type ArtifactKind =
  | "framing"
  | "solution"
  | "architecture"
  | "process"
  | "ux"
  | "data"
  | "roadmap"
  | "summary";

export const PAYLOADS: Record<ArtifactKind, unknown> = {
  summary: { text: AI_SUMMARY },
  framing: PROBLEM_FRAMING,
  solution: SOLUTION,
  architecture: { hld: HLD_DIAGRAM, lld: LLD_DIAGRAM },
  process: { before: BPMN_BEFORE, after: BPMN_AFTER, swimlane: SWIMLANE_DIAGRAM, metrics: PROCESS_METRICS },
  ux: { screens: WIREFRAMES, flow: NAV_FLOW_DIAGRAM },
  data: { er: ER_DIAGRAM, endpoints: API_ENDPOINTS },
  roadmap: { phases: ROADMAP },
};
