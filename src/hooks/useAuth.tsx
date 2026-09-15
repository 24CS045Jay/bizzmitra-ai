import type { Session, User } from "@supabase/supabase-js";
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

import { supabase } from "@/integrations/supabase/client";
import {
  syncUserRoleAndWallet,
  saveCurrentRole,
  saveCreditWallet,
  INITIAL_FREE_WALLET,
} from "@/lib/admin-rbac-data";

type AuthValue = {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
  signInAsDemoAdmin: () => void;
  signInWithCustomUser: (email: string, fullName?: string) => void;
};

const AuthContext = createContext<AuthValue>({
  session: null,
  user: null,
  loading: true,
  signOut: async () => {},
  signInAsDemoAdmin: () => {},
  signInWithCustomUser: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedDemo = localStorage.getItem("bizzmitra.demoSession");
      if (storedDemo) {
        try {
          const parsed = JSON.parse(storedDemo) as Session;
          setSession(parsed);
          syncUserRoleAndWallet(parsed.user?.email);
          setLoading(false);
        } catch {}
      }
    }

    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      if (s) {
        setSession(s);
        syncUserRoleAndWallet(s.user?.email);
      }
      setLoading(false);
    });
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        setSession(data.session);
        syncUserRoleAndWallet(data.session.user?.email);
      }
      setLoading(false);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const signInAsDemoAdmin = () => {
    const demoSession = {
      access_token: "demo-token-bypass",
      token_type: "bearer",
      expires_in: 86400,
      refresh_token: "demo-refresh",
      user: {
        id: "demo-admin-id",
        email: "admin@bizzmitra.ai",
        aud: "authenticated",
        role: "authenticated",
        user_metadata: { full_name: "Super Administrator" },
        app_metadata: { provider: "email" },
        created_at: new Date().toISOString(),
      },
    } as unknown as Session;

    if (typeof window !== "undefined") {
      localStorage.setItem("bizzmitra.demoSession", JSON.stringify(demoSession));
    }
    syncUserRoleAndWallet("admin@bizzmitra.ai", true);
    setSession(demoSession);
  };

  const signInWithCustomUser = (email: string, fullName?: string) => {
    const customSession = {
      access_token: `custom-token-${Date.now()}`,
      token_type: "bearer",
      expires_in: 86400,
      refresh_token: "custom-refresh",
      user: {
        id: `user-${Date.now()}`,
        email,
        aud: "authenticated",
        role: "authenticated",
        user_metadata: { full_name: fullName || email.split("@")[0] },
        app_metadata: { provider: "email" },
        created_at: new Date().toISOString(),
      },
    } as unknown as Session;

    if (typeof window !== "undefined") {
      localStorage.setItem("bizzmitra.demoSession", JSON.stringify(customSession));
    }
    syncUserRoleAndWallet(email, false);
    setSession(customSession);
  };

  const value = useMemo<AuthValue>(
    () => ({
      session,
      user: session?.user ?? null,
      loading,
      signOut: async () => {
        if (typeof window !== "undefined") {
          localStorage.removeItem("bizzmitra.demoSession");
        }
        saveCurrentRole("viewer");
        saveCreditWallet(INITIAL_FREE_WALLET);
        await supabase.auth.signOut();
        setSession(null);
      },
      signInAsDemoAdmin,
      signInWithCustomUser,
    }),
    [session, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
