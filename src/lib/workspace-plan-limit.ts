import { useEffect, useState, useCallback } from "react";
import { useAuth, isTestingAccount } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { loadCreditWallet, isSuperAdminEmail, CreditWallet } from "@/lib/admin-rbac-data";

export interface WorkspaceLimitInfo {
  isBasicPlan: boolean;
  tier: "Free Starter" | "Growth Pro" | "Enterprise Scale" | string;
  workspaceCount: number;
  maxWorkspaces: number;
  canCreateWorkspace: boolean;
  isLimitReached: boolean;
  loading: boolean;
  refresh: () => Promise<void>;
}

export const BASIC_PLAN_WORKSPACE_LIMIT = 1;

/**
 * Checks synchronously whether the current client state indicates basic plan and limit reached.
 */
export function checkWorkspaceLimitSync(): {
  isBasicPlan: boolean;
  canCreateWorkspace: boolean;
  isLimitReached: boolean;
} {
  if (typeof window === "undefined") {
    return { isBasicPlan: true, canCreateWorkspace: true, isLimitReached: false };
  }

  const wallet = loadCreditWallet();
  const isBasic = wallet.tier === "Free Starter";
  if (!isBasic) {
    return { isBasicPlan: false, canCreateWorkspace: true, isLimitReached: false };
  }

  // In basic tier, check if user already has an active workspace stored locally
  const activeWsId = window.localStorage.getItem("bizzmitra.activeWorkspaceId");
  const rawCtx = window.localStorage.getItem("bizzmitra.workspaceContext");
  const hasLocalWorkspace = Boolean(activeWsId && rawCtx);

  return {
    isBasicPlan: true,
    canCreateWorkspace: !hasLocalWorkspace,
    isLimitReached: hasLocalWorkspace,
  };
}

/**
 * React hook to reactively track workspace limits according to the user's plan.
 */
export function useWorkspaceLimit(): WorkspaceLimitInfo {
  const { user } = useAuth();
  const [wallet, setWallet] = useState<CreditWallet>(loadCreditWallet);
  const [workspaceCount, setWorkspaceCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  const isSuperAdmin = isSuperAdminEmail(user?.email);
  const isTest = isTestingAccount(user?.email);

  // Growth Pro, Enterprise Scale, Super Admin and Demo Admin have unlimited workspaces
  const isBasicPlan = !isSuperAdmin && !isTest && wallet.tier === "Free Starter";
  const maxWorkspaces = isBasicPlan ? BASIC_PLAN_WORKSPACE_LIMIT : Infinity;

  const refresh = useCallback(async () => {
    try {
      const currentWallet = loadCreditWallet();
      setWallet(currentWallet);

      if (user?.id) {
        const { count, error } = await supabase
          .from("workspaces")
          .select("id", { count: "exact", head: true })
          .eq("owner_id", user.id);

        if (!error && typeof count === "number") {
          setWorkspaceCount(count);
          setLoading(false);
          return;
        }
      }

      // Fallback for offline / demo mode
      if (typeof window !== "undefined") {
        const activeWsId = window.localStorage.getItem("bizzmitra.activeWorkspaceId");
        const rawCtx = window.localStorage.getItem("bizzmitra.workspaceContext");
        const hasExisting = Boolean(activeWsId && rawCtx && activeWsId !== "ws-talentcraft-default");
        setWorkspaceCount(hasExisting ? 1 : 0);
      }
    } catch {
      // safe fallback
      setWorkspaceCount(0);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    void refresh();

    const handleWalletChange = (e: Event) => {
      const ce = e as CustomEvent<CreditWallet>;
      if (ce.detail) {
        setWallet(ce.detail);
      } else {
        setWallet(loadCreditWallet());
      }
    };

    const handleWorkspaceChange = () => {
      void refresh();
    };

    window.addEventListener("bizzmitra:wallet-changed", handleWalletChange);
    window.addEventListener("bizzmitra:workspace-updated", handleWorkspaceChange);
    window.addEventListener("bizzmitra:workspace-changed", handleWorkspaceChange);

    return () => {
      window.removeEventListener("bizzmitra:wallet-changed", handleWalletChange);
      window.removeEventListener("bizzmitra:workspace-updated", handleWorkspaceChange);
      window.removeEventListener("bizzmitra:workspace-changed", handleWorkspaceChange);
    };
  }, [refresh]);

  const isLimitReached = isBasicPlan && workspaceCount >= maxWorkspaces;
  const canCreateWorkspace = !isLimitReached;

  return {
    isBasicPlan,
    tier: wallet.tier,
    workspaceCount,
    maxWorkspaces,
    canCreateWorkspace,
    isLimitReached,
    loading,
    refresh,
  };
}
