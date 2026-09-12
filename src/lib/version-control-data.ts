/**
 * Version Control & Workspace Snapshot Engine
 * Tracks chronological iterations of digital transformation blueprints,
 * calculates visual diffs across schema and architecture, and supports snapshot rollbacks.
 */

export type ArtifactDiffItem = {
  artifact: string;
  changeType: "added" | "modified" | "removed";
  description: string;
  previousValue?: string;
  currentValue?: string;
};

export type WorkspaceVersionSnapshot = {
  version: string;
  label: string;
  author: {
    name: string;
    role: string;
    avatar?: string;
  };
  timestamp: string;
  summary: string;
  status: "active" | "archived" | "approved";
  diffs: ArtifactDiffItem[];
  metricsSnapshot: {
    maturityScore: number;
    annualSavings: string;
    paybackMonths: number;
    activeFieldsCount: number;
  };
};

export const INITIAL_WORKSPACE_VERSIONS: WorkspaceVersionSnapshot[] = [
  {
    version: "v1.3",
    label: "Steering Committee Final Approval",
    author: {
      name: "Aarav Sharma",
      role: "Lead Solution Architect",
    },
    timestamp: "10 minutes ago",
    summary:
      "Formally approved implementation blueprint with DPDP compliance controls, 9-week rollout roadmap, and ₹32.3L net annual savings.",
    status: "approved",
    diffs: [
      {
        artifact: "Implementation Roadmap",
        changeType: "modified",
        description: "Locked 9-week delivery timeline with 68 person-days and DPDP Act compliance milestone.",
        previousValue: "12-week preliminary estimate",
        currentValue: "9-week locked critical path",
      },
      {
        artifact: "Financial ROI Cockpit",
        changeType: "modified",
        description: "Updated recruiter blended rate to ₹450/hr and verified 2.4 month payback velocity.",
        previousValue: "₹400/hr baseline",
        currentValue: "₹450/hr negotiated agency cost",
      },
      {
        artifact: "Governance & Review",
        changeType: "added",
        description: "Signed off by TalentCraft Operations Lead and external Solution Architect.",
      },
    ],
    metricsSnapshot: {
      maturityScore: 96,
      annualSavings: "₹32.30 L",
      paybackMonths: 2.4,
      activeFieldsCount: 14,
    },
  },
  {
    version: "v1.2",
    label: "Technical Architecture & API Blueprints",
    author: {
      name: "BizzMitra AI Engine",
      role: "AI Solution Architect",
    },
    timestamp: "Yesterday, 04:30 PM",
    summary:
      "Generated High-Level & Low-Level diagrams, normalized PostgreSQL 16 schema with RLS, and OpenAPI 3.1 REST specifications.",
    status: "archived",
    diffs: [
      {
        artifact: "Architecture (HLD/LLD)",
        changeType: "added",
        description: "Generated 5-tier architecture with Cloudflare Edge, Go/Node services, and BullMQ async queues.",
      },
      {
        artifact: "Database Designer",
        changeType: "added",
        description: "Created multi-tenant tables: organizations, candidates, custom_fields, attendance_punches.",
      },
      {
        artifact: "Process Intelligence (BPMN)",
        changeType: "added",
        description: "Synthesized 4-tier swimlane model reducing hiring turnaround from 28d to 9d.",
      },
    ],
    metricsSnapshot: {
      maturityScore: 91,
      annualSavings: "₹28.40 L",
      paybackMonths: 2.8,
      activeFieldsCount: 14,
    },
  },
  {
    version: "v1.1",
    label: "Solution Studio Dynamic Schema Customization (USP #2)",
    author: {
      name: "Param Shah",
      role: "Digital Transformation Consultant",
    },
    timestamp: "Yesterday, 11:15 AM",
    summary:
      "Added runtime candidate attributes (LinkedIn URL, Notice Period, Expected CTC) and executed AI regeneration cycle.",
    status: "archived",
    diffs: [
      {
        artifact: "Workable HR CRM",
        changeType: "modified",
        description: "Extended candidate data schema with 3 dynamic attributes and updated table grid views.",
        previousValue: "Standard candidate roster (11 fields)",
        currentValue: "Customized schema with LinkedIn URL and Notice Period (14 fields)",
      },
      {
        artifact: "Solution Studio",
        changeType: "added",
        description: "Configured warm graphite neumorphic theme accents and zebra alternating rows.",
      },
    ],
    metricsSnapshot: {
      maturityScore: 88,
      annualSavings: "₹24.60 L",
      paybackMonths: 3.1,
      activeFieldsCount: 14,
    },
  },
  {
    version: "v1.0",
    label: "Initial Intake & Discovery Synthesis",
    author: {
      name: "BizzMitra AI Engine",
      role: "AI Business Consultant",
    },
    timestamp: "Sep 11, 2026, 09:00 AM",
    summary:
      "Baseline workspace initialized from multi-modal problem intake with initial discovery slot-filling interview.",
    status: "archived",
    diffs: [
      {
        artifact: "Multi-Modal Intake",
        changeType: "added",
        description: "Ingested TalentCraft HR Consultancy problem statement and extracted preliminary goals.",
      },
      {
        artifact: "AI Discovery",
        changeType: "added",
        description: "Completed 3 slot-filling discovery turns with Missing Information Detector.",
      },
      {
        artifact: "Business Analysis",
        changeType: "added",
        description: "Synthesized As-Is vs To-Be models and 4-tier stakeholder matrix.",
      },
    ],
    metricsSnapshot: {
      maturityScore: 62,
      annualSavings: "₹18.00 L",
      paybackMonths: 3.8,
      activeFieldsCount: 11,
    },
  },
];

export const STORAGE_KEY_VERSIONS = "bizzmitra.workspaceVersions";

export function loadWorkspaceVersions(): WorkspaceVersionSnapshot[] {
  if (typeof window === "undefined") return INITIAL_WORKSPACE_VERSIONS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_VERSIONS);
    if (!raw) return INITIAL_WORKSPACE_VERSIONS;
    return JSON.parse(raw);
  } catch {
    return INITIAL_WORKSPACE_VERSIONS;
  }
}

export function saveWorkspaceVersions(versions: WorkspaceVersionSnapshot[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY_VERSIONS, JSON.stringify(versions));
  } catch (err) {
    console.error("Failed to save workspace versions:", err);
  }
}
