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

export default function RegisterScreen() {
  const router = useRouter();
  const { signInWithToken } = useMobileAuth();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRegister = async () => {
    if (!email.trim() || !password.trim()) {
      setError("Email and password are required.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await mobileApi.register(email, password, fullName);
      if (res.success) {
        const session = {
          id: res.userId,
          email: email.trim().toLowerCase(),
          fullName: fullName.trim() || email.split("@")[0],
          role: "viewer" as const,
          plan: "free",
        };
        await signInWithToken(`custom-token-${Date.now()}`, session);
        router.replace("/(tabs)");
      }
    } catch (err: any) {
      setError(err?.message || "Registration failed");
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
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Join your team's transformation workspace</Text>
        </View>

        {error && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        <View style={styles.form}>
          <Text style={styles.label}>Full Name</Text>
          <TextInput
            style={styles.input}
            placeholder="Jay Ladva"
            placeholderTextColor="#71717a"
            value={fullName}
            onChangeText={setFullName}
          />

          <Text style={styles.label}>Work Email</Text>
          <TextInput
            style={styles.input}
            placeholder="jay@company.com"
            placeholderTextColor="#71717a"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />

          <Text style={styles.label}>Password (min. 6 characters)</Text>
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
            onPress={handleRegister}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={styles.primaryButtonText}>Get Started</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.linkButton}
            onPress={() => router.back()}
          >
            <Text style={styles.linkText}>
              Already have an account? <Text style={styles.linkTextBold}>Sign In</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#09090b" },
  scrollContent: { flexGrow: 1, justifyContent: "center", padding: 24 },
  header: { alignItems: "center", marginBottom: 32 },
  title: { color: "#fafafa", fontSize: 26, fontWeight: "800", letterSpacing: -0.5 },
  subtitle: { color: "#a1a1aa", fontSize: 13, marginTop: 4, textAlign: "center" },
  errorBox: {
    backgroundColor: "rgba(239, 68, 68, 0.15)",
    borderWidth: 1,
    borderColor: "#ef4444",
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  errorText: { color: "#f87171", fontSize: 13, textAlign: "center" },
  form: { width: "100%" },
  label: { color: "#d4d4d8", fontSize: 13, fontWeight: "600", marginBottom: 6, marginTop: 12 },
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
  },
  primaryButtonText: { color: "#ffffff", fontSize: 15, fontWeight: "700" },
  linkButton: { alignItems: "center", marginTop: 20, padding: 8 },
  linkText: { color: "#a1a1aa", fontSize: 13 },
  linkTextBold: { color: "#818cf8", fontWeight: "700" },
});
