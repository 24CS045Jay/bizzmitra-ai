import { useState, useEffect, createContext, useContext, ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { mobileApi } from "../services/api";
import { UserSession } from "../types";

interface AuthContextType {
  user: UserSession | null;
  loading: boolean;
  signInAsDemoAdmin: () => Promise<void>;
  signInWithToken: (token: string, user: UserSession) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signInAsDemoAdmin: async () => {},
  signInWithToken: async () => {},
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserSession | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStoredAuth() {
      try {
        await mobileApi.init();
        const storedUser = await AsyncStorage.getItem("bizzmitra_mobile_user");
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      } catch (err) {
        console.warn("Error loading mobile auth:", err);
      } finally {
        setLoading(false);
      }
    }
    loadStoredAuth();
  }, []);

  const signInAsDemoAdmin = async () => {
    const demoUser: UserSession = {
      id: "demo-admin-id",
      email: "admin@bizzmitra.ai",
      fullName: "Enterprise Admin (Mobile)",
      role: "admin",
      plan: "enterprise",
    };
    await mobileApi.setToken("demo-token-bypass");
    await AsyncStorage.setItem("bizzmitra_mobile_user", JSON.stringify(demoUser));
    setUser(demoUser);
  };

  const signInWithToken = async (token: string, userData: UserSession) => {
    await mobileApi.setToken(token);
    await AsyncStorage.setItem("bizzmitra_mobile_user", JSON.stringify(userData));
    setUser(userData);
  };

  const signOut = async () => {
    await mobileApi.setToken(null);
    await AsyncStorage.removeItem("bizzmitra_mobile_user");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signInAsDemoAdmin, signInWithToken, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useMobileAuth() {
  return useContext(AuthContext);
}
