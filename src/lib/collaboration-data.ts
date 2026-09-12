/**
 * Enterprise Collaboration, Approval Workflows & Activity Audit Log Engine
 * Powers cross-functional stakeholder reviews, in-context comments, and immutable audit trails.
 */

export type ApprovalStatus = "draft" | "in_review" | "approved";

export type ApproverSignOff = {
  role: "Solution Architect" | "Product Delivery Lead" | "HR Operations Lead" | "Security & Compliance";
  name: string;
  email: string;
  signed: boolean;
  signedAt?: string | undefined;
  comments?: string | undefined;
};

export type ArtifactComment = {
  id: string;
  artifactId: string;
  artifactName: string;
  author: {
    name: string;
    role: string;
    avatar?: string;
  };
  content: string;
  timestamp: string;
  severity: "feedback" | "blocking" | "approved";
  resolved: boolean;
  replies?: {
    id: string;
    authorName: string;
    authorRole: string;
    content: string;
    timestamp: string;
  }[];
};

export type AuditLogEntry = {
  id: string;
  actor: {
    name: string;
    type: "user" | "ai" | "system";
    role: string;
  };
  action: string;
  category: "governance" | "ai_generation" | "schema" | "collaboration";
  details: string;
  timestamp: string;
  metadata?: Record<string, string | number>;
};

export type CollaborationWorkspaceState = {
  workspaceId: string;
  overallStatus: ApprovalStatus;
  signOffs: ApproverSignOff[];
  comments: ArtifactComment[];
  auditLogs: AuditLogEntry[];
};

export const INITIAL_COLLABORATION_STATE: CollaborationWorkspaceState = {
  workspaceId: "ws-talentcraft-hr",
  overallStatus: "approved",
  signOffs: [
    {
      role: "Solution Architect",
      name: "Aarav Sharma",
      email: "aarav@enterprise-arch.io",
      signed: true,
      signedAt: "Sep 12, 2026 · 10:15 AM",
      comments: "PostgreSQL multi-tenant schema with RLS verified. Ready for Phase 1 MVP sprint.",
    },
    {
      role: "HR Operations Lead",
      name: "Pooja Verma",
      email: "pooja@talentcraft.co",
      signed: true,
      signedAt: "Sep 12, 2026 · 11:30 AM",
      comments: "Reviewed candidate pipeline stages and punch clock. Solves our spreadsheet bottleneck completely.",
    },
    {
      role: "Product Delivery Lead",
      name: "Marcus Vance",
      email: "marcus@bizzmitra.ai",
      signed: true,
      signedAt: "Sep 12, 2026 · 11:45 AM",
      comments: "9-week delivery timeline (68 person-days) is achievable within Q4 engineering capacity.",
    },
    {
      role: "Security & Compliance",
      name: "Neha Sundaram",
      email: "neha.s@legal-corp.com",
      signed: true,
      signedAt: "Sep 12, 2026 · 12:05 PM",
      comments: "DPDP Act compliance 180-day resume retention policy added to Risk Register and approved.",
    },
  ],
  comments: [
    {
      id: "c-101",
      artifactId: "data",
      artifactName: "Database Designer & REST APIs",
      author: {
        name: "Aarav Sharma",
        role: "Lead Solution Architect",
      },
      content:
        "Ensure the PostgreSQL candidate custom fields table uses GIN indexing for fast JSONB querying across custom attributes like LinkedIn URL.",
      timestamp: "Yesterday, 04:45 PM",
      severity: "blocking",
      resolved: true,
      replies: [
        {
          id: "r-1",
          authorName: "BizzMitra AI Engine",
          authorRole: "AI Architect",
          content: "GIN index `idx_candidates_custom_attributes` has been added to the generated PostgreSQL DDL schema.",
          timestamp: "Yesterday, 04:50 PM",
        },
      ],
    },
    {
      id: "c-102",
      artifactId: "roadmap",
      artifactName: "AI Implementation Planning Engine",
      author: {
        name: "Pooja Verma",
        role: "HR Operations Lead",
      },
      content:
        "Can we schedule recruiter training workshops before Phase 1 cutover instead of waiting for Phase 3?",
      timestamp: "Today, 09:15 AM",
      severity: "feedback",
      resolved: false,
      replies: [
        {
          id: "r-2",
          authorName: "Param Shah",
          authorRole: "Transformation Lead",
          content: "Good point. We will run an initial 2-hour onboarding session during Week 2 of the Foundation Sprint.",
          timestamp: "Today, 09:30 AM",
        },
      ],
    },
    {
      id: "c-103",
      artifactId: "roi",
      artifactName: "Financial ROI & Transformation Cockpit",
      author: {
        name: "Marcus Vance",
        role: "Product Delivery Lead",
      },
      content:
        "The 2.4-month payback model looks solid. CFO confirmed the ₹280k annual software & setup budget is pre-approved.",
      timestamp: "Today, 10:00 AM",
      severity: "approved",
      resolved: true,
    },
  ],
  auditLogs: [
    {
      id: "log-001",
      actor: { name: "Param Shah", type: "user", role: "Transformation Lead" },
      action: "Approved Transformation Blueprint",
      category: "governance",
      details: "Transitioned workspace governance state from Under Review to Approved for Implementation.",
      timestamp: "12:05 PM",
    },
    {
      id: "log-002",
      actor: { name: "BizzMitra AI Engine", type: "ai", role: "AI Planning Engine" },
      action: "Synthesized 9-Week Delivery Plan",
      category: "ai_generation",
      details: "Calculated 68 person-day Critical Path Method schedule across Foundation, Coordination, and Intelligence sprints.",
      timestamp: "11:15 AM",
    },
    {
      id: "log-003",
      actor: { name: "Param Shah", type: "user", role: "Transformation Consultant" },
      action: "Executed AI Solution Studio Regeneration",
      category: "schema",
      details: "Extended candidate data schema with LinkedIn URL and Notice Period; incremented solution version to v1.1.",
      timestamp: "Yesterday, 05:20 PM",
    },
    {
      id: "log-004",
      actor: { name: "Aarav Sharma", type: "user", role: "Solution Architect" },
      action: "Resolved Technical Comment",
      category: "collaboration",
      details: "Marked comment regarding PostgreSQL GIN index on custom attributes as Resolved.",
      timestamp: "Yesterday, 04:55 PM",
    },
    {
      id: "log-005",
      actor: { name: "BizzMitra AI Engine", type: "ai", role: "AI Architecture Builder" },
      action: "Generated Technical Blueprints",
      category: "ai_generation",
      details: "Synthesized HLD/LLD diagrams, BPMN 2.0 4-tier swimlanes, and PostgreSQL 16 DDL schema with RLS.",
      timestamp: "Yesterday, 03:40 PM",
    },
    {
      id: "log-006",
      actor: { name: "BizzMitra AI Engine", type: "ai", role: "AI Business Consultant" },
      action: "Completed Discovery Interview",
      category: "ai_generation",
      details: "Detected missing candidate volume and tools; advanced Context Maturity to 96%.",
      timestamp: "Sep 11, 2026, 09:30 AM",
    },
  ],
};

export const STORAGE_KEY_COLLABORATION = "bizzmitra.collaborationState";

export function loadCollaborationState(): CollaborationWorkspaceState {
  if (typeof window === "undefined") return INITIAL_COLLABORATION_STATE;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_COLLABORATION);
    if (!raw) return INITIAL_COLLABORATION_STATE;
    return JSON.parse(raw);
  } catch {
    return INITIAL_COLLABORATION_STATE;
  }
}

export function saveCollaborationState(state: CollaborationWorkspaceState): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY_COLLABORATION, JSON.stringify(state));
  } catch (err) {
    console.error("Failed to save collaboration state:", err);
  }
}
