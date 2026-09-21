export type UserRole =
  | "admin"
  | "architect"
  | "analyst"
  | "pm"
  | "developer"
  | "viewer";

export interface UserSession {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  plan: string;
  token?: string;
}

export interface WorkspaceItem {
  id: string;
  name: string;
  problem_statement?: string | null;
  status: string;
  maturity_score: number;
  ai_readiness_score: number;
  updated_at: string;
}

export interface ArtifactItem {
  id: string;
  workspace_id: string;
  module_type: string;
  version: number;
  content: any;
  created_at: string;
}

export interface DocumentItem {
  id: string;
  workspace_id: string;
  file_name: string;
  storage_path: string;
  file_type: string;
  uploaded_at: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  type: "success" | "info" | "approval";
}

export interface ChatMessage {
  id: string;
  sender: "user" | "assistant";
  text: string;
  timestamp: string;
}
