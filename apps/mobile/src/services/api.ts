import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  ArtifactItem,
  DocumentItem,
  NotificationItem,
  UserSession,
  WorkspaceItem,
} from "../types";

// Base API configuration: Supports development and production environments
const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL || "https://bizzmitra-ai.vercel.app";

const AUTH_TOKEN_KEY = "bizzmitra_mobile_auth_token";
const ACTIVE_WS_KEY = "bizzmitra_mobile_active_ws";

class MobileApiClient {
  private token: string | null = null;

  async init(): Promise<void> {
    try {
      this.token = await AsyncStorage.getItem(AUTH_TOKEN_KEY);
    } catch {
      this.token = null;
    }
  }

  async setToken(token: string | null): Promise<void> {
    this.token = token;
    if (token) {
      await AsyncStorage.setItem(AUTH_TOKEN_KEY, token);
    } else {
      await AsyncStorage.removeItem(AUTH_TOKEN_KEY);
    }
  }

  async getToken(): Promise<string | null> {
    if (!this.token) {
      this.token = await AsyncStorage.getItem(AUTH_TOKEN_KEY);
    }
    return this.token;
  }

  async setActiveWorkspaceId(id: string): Promise<void> {
    await AsyncStorage.setItem(ACTIVE_WS_KEY, id);
  }

  async getActiveWorkspaceId(): Promise<string | null> {
    return await AsyncStorage.getItem(ACTIVE_WS_KEY);
  }

  private async fetchWithAuth(endpoint: string, options: RequestInit = {}): Promise<any> {
    const token = await this.getToken();
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(options.headers as Record<string, string>),
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorJson;
      try {
        errorJson = JSON.parse(errorText);
      } catch {
        errorJson = { error: errorText || `HTTP ${response.status}` };
      }
      throw new Error(errorJson.error || "Request failed");
    }

    return response.json();
  }

  // Authentication
  async register(email: string, password: string, fullName?: string): Promise<{ success: boolean; userId: string }> {
    return this.fetchWithAuth("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({ email, password, fullName }),
    });
  }

  async getCurrentUser(): Promise<{ success: boolean; user: UserSession }> {
    return this.fetchWithAuth("/api/auth/me", { method: "GET" });
  }

  // Workspaces
  async getWorkspaces(): Promise<WorkspaceItem[]> {
    const res = await this.fetchWithAuth("/api/workspaces", { method: "GET" });
    return res.workspaces || [];
  }

  async createWorkspace(name: string, problemStatement?: string): Promise<WorkspaceItem> {
    const res = await this.fetchWithAuth("/api/workspaces", {
      method: "POST",
      body: JSON.stringify({ name, problemStatement }),
    });
    return res.workspace;
  }

  // Artifacts
  async getArtifacts(workspaceId: string): Promise<ArtifactItem[]> {
    const res = await this.fetchWithAuth(`/api/artifacts?workspaceId=${encodeURIComponent(workspaceId)}`, {
      method: "GET",
    });
    return res.artifacts || [];
  }

  // AI Generation
  async generateAiArtifact(workspaceId: string, moduleType: string): Promise<any> {
    return this.fetchWithAuth("/api/ai/generate", {
      method: "POST",
      body: JSON.stringify({ workspaceId, moduleType }),
    });
  }

  // Documents
  async getDocuments(workspaceId: string): Promise<DocumentItem[]> {
    const res = await this.fetchWithAuth(`/api/documents?workspaceId=${encodeURIComponent(workspaceId)}`, {
      method: "GET",
    });
    return res.documents || [];
  }

  // Notifications
  async getNotifications(): Promise<NotificationItem[]> {
    const res = await this.fetchWithAuth("/api/notifications", { method: "GET" });
    return res.notifications || [];
  }

  // Export URL helper
  getExportUrl(workspaceName: string, format: string): string {
    return `${API_BASE_URL}/api/export/${format}?workspaceName=${encodeURIComponent(workspaceName)}`;
  }
}

export const mobileApi = new MobileApiClient();
