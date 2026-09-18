import type { Session, User } from "@supabase/supabase-js";
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";

type AuthValue = {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
  signInAsDemoAdmin: () => void;
  signInWithCustomUser: (email: string, fullName?: string) => void;
  setSession: (session: Session | null) => void;
};

const AuthContext = createContext<AuthValue>({
  session: null,
  user: null,
  loading: true,
  signOut: async () => {},
  signInAsDemoAdmin: () => {},
  signInWithCustomUser: () => {},
  setSession: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let hasUrlAction = false;

    if (typeof window !== "undefined") {
      const storedDemo = localStorage.getItem("bizzmitra.demoSession");
      if (storedDemo) {
        try {
          const parsed = JSON.parse(storedDemo) as Session;
          setSession(parsed);
          setLoading(false);
        } catch {}
      }

      // Handle email confirmation link redirect (token_hash or PKCE auth code)
      const url = new URL(window.location.href);
      const token_hash = url.searchParams.get("token_hash");
      const type = url.searchParams.get("type") as "signup" | "email" | "recovery" | "invite" | null;
      const code = url.searchParams.get("code");
      const queryError = url.searchParams.get("error_description") || url.searchParams.get("error");

      // Check hash parameters for errors or tokens
      let hashError: string | null = null;
      if (window.location.hash) {
        try {
          const hashParams = new URLSearchParams(window.location.hash.substring(1));
          hashError = hashParams.get("error_description") || hashParams.get("error");
        } catch {}
      }

      if (queryError || hashError) {
        const msg = decodeURIComponent((queryError || hashError)!.replace(/\+/g, " "));
        toast.error(msg);
        window.history.replaceState({}, document.title, window.location.pathname);
      } else if (token_hash && type) {
        hasUrlAction = true;
        setLoading(true);
        supabase.auth.verifyOtp({ token_hash, type }).then(({ data, error }) => {
          if (!error && data.session) {
            setSession(data.session);
            toast.success("Email verified successfully! Welcome to your workspace.");
            window.history.replaceState({}, document.title, window.location.pathname);
          } else if (error) {
            toast.error(error.message);
          }
          setLoading(false);
        });
      } else if (code) {
        hasUrlAction = true;
        setLoading(true);
        supabase.auth.exchangeCodeForSession(code).then(({ data, error }) => {
          if (!error && data.session) {
            setSession(data.session);
            toast.success("Email verified successfully! Welcome to your workspace.");
            window.history.replaceState({}, document.title, window.location.pathname);
          } else if (error) {
            toast.error(error.message);
          }
          setLoading(false);
        });
      }
    }

    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      if (s) {
        setSession(s);
      }
      if (!hasUrlAction) {
        setLoading(false);
      }
    });

    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        setSession(data.session);
      }
      if (!hasUrlAction) {
        setLoading(false);
      }
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
        user_metadata: { full_name: "Param Shah (Administrator)" },
        app_metadata: { provider: "email" },
        created_at: new Date().toISOString(),
      },
    } as unknown as Session;

    if (typeof window !== "undefined") {
      localStorage.setItem("bizzmitra.demoSession", JSON.stringify(demoSession));
    }
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
        await supabase.auth.signOut();
        setSession(null);
      },
      signInAsDemoAdmin,
      signInWithCustomUser,
      setSession,
    }),
    [session, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
