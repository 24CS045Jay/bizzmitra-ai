/**
 * BizzMitra AI — Cloud Credentials & BYOC (Bring Your Own Cloud) Store
 * Enables dual-mode deployments:
 * 1. "managed" (Default): 1-click instant demo via pre-configured BizzMitra infrastructure.
 * 2. "custom" (BYOC): Deploys directly into the user's personal GitHub, Vercel, and Supabase accounts.
 */

export interface CloudCredentials {
  mode: "managed" | "custom";
  githubToken?: string | undefined;
  githubUsername?: string | undefined;
  githubAvatar?: string | undefined;
  vercelToken?: string | undefined;
  vercelUsername?: string | undefined;
  vercelTeamName?: string | undefined;
  supabaseUrl?: string | undefined;
  supabaseAnonKey?: string | undefined;
}

const STORAGE_KEY = "bizzmitra_cloud_credentials_v1";

/**
 * Strips surrounding quotes, whitespace, and 'Bearer' prefix from user-provided API tokens.
 */
export function cleanAuthToken(token?: string | null): string {
  if (!token) return "";
  let clean = String(token).trim();
  clean = clean.replace(/^(bearer|token)\s+/i, "");
  clean = clean.replace(/^["'`]|["'`]$/g, "").trim();
  clean = clean.replace(/^["'`]|["'`]$/g, "").trim();
  return clean;
}

export function loadCloudCredentials(): CloudCredentials {
  if (typeof window === "undefined") {
    return { mode: "managed" };
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { mode: "managed" };
    const parsed = JSON.parse(raw);
    return {
      mode: "managed",
      ...parsed,
      githubToken: cleanAuthToken(parsed.githubToken) || undefined,
      vercelToken: cleanAuthToken(parsed.vercelToken) || undefined,
    };
  } catch {
    return { mode: "managed" };
  }
}

export function saveCloudCredentials(creds: Partial<CloudCredentials>): CloudCredentials {
  const current = loadCloudCredentials();
  const sanitized = {
    ...creds,
    githubToken: creds.githubToken !== undefined ? cleanAuthToken(creds.githubToken) || undefined : current.githubToken,
    vercelToken: creds.vercelToken !== undefined ? cleanAuthToken(creds.vercelToken) || undefined : current.vercelToken,
  };
  const updated = { ...current, ...sanitized };
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  }
  return updated;
}

/**
 * Validates a user's GitHub Personal Access Token
 */
export async function testGithubToken(rawToken: string): Promise<{
  valid: boolean;
  username?: string;
  avatarUrl?: string;
  error?: string;
}> {
  const token = cleanAuthToken(rawToken);
  if (!token) {
    return { valid: false, error: "Please enter a GitHub token." };
  }
  try {
    const res = await fetch("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github.v3+json",
      },
    });
    if (!res.ok) {
      return { valid: false, error: "Invalid token or insufficient permissions (requires 'repo' scope)." };
    }
    const data = await res.json();
    return {
      valid: true,
      username: data.login,
      avatarUrl: data.avatar_url,
    };
  } catch (err: any) {
    return { valid: false, error: err?.message || "Failed to reach GitHub API." };
  }
}

/**
 * Validates a user's Vercel Access Token
 */
export async function testVercelToken(token: string): Promise<{
  valid: boolean;
  username?: string;
  teamName?: string;
  error?: string;
}> {
  if (!token || !token.trim()) {
    return { valid: false, error: "Please enter a Vercel token." };
  }
  try {
    const res = await fetch("https://api.vercel.com/v2/user", {
      headers: {
        Authorization: `Bearer ${token.trim()}`,
      },
    });
    if (!res.ok) {
      return { valid: false, error: "Invalid Vercel token or expired credentials." };
    }
    const data = await res.json();
    const user = data.user || {};
    return {
      valid: true,
      username: user.username || user.email,
      teamName: user.name || "Personal Account",
    };
  } catch (err: any) {
    return { valid: false, error: err?.message || "Failed to reach Vercel API." };
  }
}
