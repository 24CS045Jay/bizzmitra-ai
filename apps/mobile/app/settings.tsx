import React from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import {
  ArrowLeft,
  User,
  Shield,
  Globe,
  Lock,
  LogOut,
  ChevronRight,
  Sparkles,
} from "lucide-react-native";
import { useMobileAuth } from "../src/hooks/useAuth";

export default function MobileSettingsScreen() {
  const router = useRouter();
  const { user, signOut } = useMobileAuth();

  const handleSignOut = async () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: async () => {
          await signOut();
          router.replace("/(auth)/login");
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft color="#ffffff" size={20} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Account & Settings</Text>
      </View>

      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        {/* User Card */}
        <View style={styles.userCard}>
          <View style={styles.avatarBox}>
            <Text style={styles.avatarText}>
              {user?.fullName?.charAt(0).toUpperCase() || "A"}
            </Text>
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{user?.fullName || "Super Administrator"}</Text>
            <Text style={styles.userEmail}>{user?.email || "admin@bizzmitra.ai"}</Text>
            <View style={styles.roleBadge}>
              <Shield color="#818cf8" size={12} />
              <Text style={styles.roleText}>{user?.role?.toUpperCase() || "ADMIN"}</Text>
            </View>
          </View>
        </View>

        {/* Settings Sections */}
        <Text style={styles.sectionHeading}>Preferences</Text>

        <TouchableOpacity
          style={styles.settingRow}
          onPress={() => Alert.alert("Language Selector", "English (Default)\nHindi (हिन्दी)\nGujarati (ગુજરાતી)")}
        >
          <View style={styles.settingIconBox}>
            <Globe color="#818cf8" size={18} />
          </View>
          <View style={styles.settingInfo}>
            <Text style={styles.settingTitle}>Language</Text>
            <Text style={styles.settingSubtitle}>English (EN)</Text>
          </View>
          <ChevronRight color="#71717a" size={16} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.settingRow}
          onPress={() => Alert.alert("AI Engine", "Currently using Groq Llama-3.3-70b-Versatile with Gemini 2.5 Pro fallback.")}
        >
          <View style={styles.settingIconBox}>
            <Sparkles color="#10b981" size={18} />
          </View>
          <View style={styles.settingInfo}>
            <Text style={styles.settingTitle}>Active AI Engine</Text>
            <Text style={styles.settingSubtitle}>Groq Llama-3.3-70b</Text>
          </View>
          <ChevronRight color="#71717a" size={16} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.settingRow}
          onPress={() => Alert.alert("Security", "Row-Level Security (RLS) active. JWT token expires in 24 hours.")}
        >
          <View style={styles.settingIconBox}>
            <Lock color="#f59e0b" size={18} />
          </View>
          <View style={styles.settingInfo}>
            <Text style={styles.settingTitle}>Security & Privacy</Text>
            <Text style={styles.settingSubtitle}>PostgreSQL 16 RLS Multi-Tenant</Text>
          </View>
          <ChevronRight color="#71717a" size={16} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.logoutButton} onPress={handleSignOut}>
          <LogOut color="#f87171" size={18} />
          <Text style={styles.logoutText}>Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#09090b" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#27272a",
    gap: 12,
  },
  backButton: { width: 36, height: 36, justifyContent: "center", alignItems: "center" },
  headerTitle: { color: "#fafafa", fontSize: 18, fontWeight: "700" },
  container: { flex: 1 },
  content: { padding: 18, paddingBottom: 36 },
  userCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#18181b",
    borderWidth: 1,
    borderColor: "#27272a",
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    gap: 14,
  },
  avatarBox: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: "#4f46e5",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: { color: "#ffffff", fontSize: 22, fontWeight: "800" },
  userInfo: { flex: 1 },
  userName: { color: "#fafafa", fontSize: 16, fontWeight: "700" },
  userEmail: { color: "#a1a1aa", fontSize: 12, marginTop: 2 },
  roleBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(99, 102, 241, 0.15)",
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginTop: 6,
    gap: 4,
  },
  roleText: { color: "#818cf8", fontSize: 10, fontWeight: "800" },
  sectionHeading: { color: "#71717a", fontSize: 12, fontWeight: "700", textTransform: "uppercase", marginBottom: 10, letterSpacing: 0.5 },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#18181b",
    borderWidth: 1,
    borderColor: "#27272a",
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    gap: 12,
  },
  settingIconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: "#27272a",
    justifyContent: "center",
    alignItems: "center",
  },
  settingInfo: { flex: 1 },
  settingTitle: { color: "#fafafa", fontSize: 14, fontWeight: "600" },
  settingSubtitle: { color: "#71717a", fontSize: 12, marginTop: 2 },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(239, 68, 68, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(239, 68, 68, 0.3)",
    borderRadius: 14,
    padding: 14,
    marginTop: 24,
    gap: 8,
  },
  logoutText: { color: "#f87171", fontSize: 14, fontWeight: "700" },
});
