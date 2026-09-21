/**
 * Shared API & Domain Types for BizzMitra AI
 * Used by Web, Tablet, and Mobile clients to guarantee identical contracts.
 */

export type UserRole =
  | "admin"
  | "architect"
  | "analyst"
  | "pm"
  | "developer"
  | "viewer";

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  plan: "free" | "starter" | "pro" | "enterprise";
  createdAt: string;
}

export interface Workspace {
  id: string;
  name: string;
  ownerId: string;
  problemStatement?: string | null;
  status: "draft" | "active" | "archived" | "approved";
  maturityScore: number;
  aiReadinessScore: number;
  industry?: string;
  createdAt: string;
  updatedAt: string;
}

export type ArtifactKind =
  | "summary"
  | "framing"
  | "solution"
  | "architecture"
  | "process"
  | "ux"
  | "data"
  | "roadmap";

export interface Artifact {
  id: string;
  workspaceId: string;
  moduleType: ArtifactKind;
  version: number;
  content: Record<string, unknown>;
  createdAt: string;
  updatedAt?: string;
}

export interface ArtifactVersion {
  version: number;
  createdAt: string;
  moduleType: ArtifactKind;
  summary?: string;
}

export interface DiscoveryMessage {
  id: string;
  workspaceId: string;
  role: "user" | "assistant" | "system";
  content: string;
  createdAt: string;
}

export interface UploadedDocument {
  id: string;
  workspaceId: string;
  fileName: string;
  storagePath: string;
  fileType: string;
  fileSizeFormatted?: string;
  uploadedAt: string;
}

export interface AISolutionRequest {
  workspaceId: string;
  moduleType: ArtifactKind;
  context?: {
    problemStatement?: string;
    answers?: string[];
    industry?: string;
    modelId?: string;
  };
}

export interface AISolutionResponse<T = unknown> {
  success: boolean;
  moduleType: ArtifactKind;
  version: number;
  payload: T;
  generatedAt: string;
  modelUsed: string;
}

export interface ExportRequest {
  workspaceId: string;
  format: "pdf" | "docx" | "xlsx" | "openapi" | "sql";
  workspaceName?: string;
}

export interface APIResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
