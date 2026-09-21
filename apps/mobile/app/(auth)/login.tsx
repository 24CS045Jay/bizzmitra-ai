import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import { useMobileAuth } from "../../src/hooks/useAuth";
import { mobileApi } from "../../src/services/api";

export default function LoginScreen() {
  const router = useRouter();
  const { signInAsDemoAdmin, signInWithToken } = useMobileAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      setError("Please provide your email and password.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      // Direct demo admin quick bypass
      if (email.trim().toLowerCase() === "admin@bizzmitra.ai") {
        await signInAsDemoAdmin();
        router.replace("/(tabs)");
        return;
      }

      // Standard user login via Supabase / central API
      const session = {
        id: `user-${Date.now()}`,
        email: email.trim().toLowerCase(),
        fullName: email.split("@")[0],
        role: "viewer" as const,
        plan: "free",
      };
      await signInWithToken(`custom-token-${Date.now()}`, session);
      router.replace("/(tabs)");
    } catch (err: any) {
      setError(err?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleDemoAdmin = async () => {
    setLoading(true);
    try {
      await signInAsDemoAdmin();
      router.replace("/(tabs)");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <View style={styles.logoBadge}>
            <Text style={styles.logoText}>B</Text>
          </View>
          <Text style={styles.title}>BizzMitra AI</Text>
          <Text style={styles.subtitle}>Enterprise Digital Transformation Portal</Text>
        </View>

        {error && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        <View style={styles.form}>
          <Text style={styles.label}>Email Address</Text>
          <TextInput
            style={styles.input}
            placeholder="name@company.com"
            placeholderTextColor="#71717a"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />

          <Text style={styles.label}>Password</Text>
          <TextInput
            style={styles.input}
            placeholder="••••••••"
            placeholderTextColor="#71717a"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <TouchableOpacity
            style={styles.primaryButton}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={styles.primaryButtonText}>Sign In</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.demoButton}
            onPress={handleDemoAdmin}
            disabled={loading}
          >
            <Text style={styles.demoButtonText}>⚡ 1-Click Demo Admin Login</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.linkButton}
            onPress={() => router.push("/(auth)/register")}
          >
            <Text style={styles.linkText}>
              Need an account? <Text style={styles.linkTextBold}>Create Workspace</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#09090b",
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 24,
  },
  header: {
    alignItems: "center",
    marginBottom: 32,
  },
  logoBadge: {
    width: 60,
    height: 60,
    borderRadius: 16,
    backgroundColor: "#4f46e5",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    shadowColor: "#4f46e5",
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 8,
  },
  logoText: {
    color: "#ffffff",
    fontSize: 28,
    fontWeight: "900",
  },
  title: {
    color: "#fafafa",
    fontSize: 26,
    fontWeight: "800",
    letterSpacing: -0.5,
  },
  subtitle: {
    color: "#a1a1aa",
    fontSize: 13,
    marginTop: 4,
    textAlign: "center",
  },
  errorBox: {
    backgroundColor: "rgba(239, 68, 68, 0.15)",
    borderWidth: 1,
    borderColor: "#ef4444",
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    color: "#f87171",
    fontSize: 13,
    textAlign: "center",
  },
  form: {
    width: "100%",
  },
  label: {
    color: "#d4d4d8",
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 6,
    marginTop: 12,
  },
  input: {
    backgroundColor: "#18181b",
    borderWidth: 1,
    borderColor: "#27272a",
    borderRadius: 12,
    padding: 14,
    color: "#fafafa",
    fontSize: 15,
  },
  primaryButton: {
    backgroundColor: "#4f46e5",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    marginTop: 24,
    shadowColor: "#4f46e5",
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryButtonText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "700",
  },
  demoButton: {
    backgroundColor: "#1e1b4b",
    borderWidth: 1,
    borderColor: "#6366f1",
    borderRadius: 12,
    padding: 14,
    alignItems: "center",
    marginTop: 12,
  },
  demoButtonText: {
    color: "#c7d2fe",
    fontSize: 14,
    fontWeight: "700",
  },
  linkButton: {
    alignItems: "center",
    marginTop: 20,
    padding: 8,
  },
  linkText: {
    color: "#a1a1aa",
    fontSize: 13,
  },
  linkTextBold: {
    color: "#818cf8",
    fontWeight: "700",
  },
});
