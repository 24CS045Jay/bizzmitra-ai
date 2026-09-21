import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import {
  Sparkles,
  Plus,
  FileUp,
  Layers,
  ChevronRight,
  ShieldCheck,
  Zap,
  TrendingUp,
  User,
} from "lucide-react-native";
import { useMobileAuth } from "../../src/hooks/useAuth";
import { mobileApi } from "../../src/services/api";
import { WorkspaceItem } from "../../src/types";

export default function MobileDashboardScreen() {
  const router = useRouter();
  const { user } = useMobileAuth();
  const [workspaces, setWorkspaces] = useState<WorkspaceItem[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [activeWs, setActiveWs] = useState<WorkspaceItem | null>(null);

  const loadData = async () => {
    try {
      const list = await mobileApi.getWorkspaces();
      setWorkspaces(list);
      if (list.length > 0) {
        setActiveWs(list[0]);
        await mobileApi.setActiveWorkspaceId(list[0].id);
      } else {
        // Fallback demo item for instant test drive
        setActiveWs({
          id: "demo-ws-1",
          name: "TalentCraft HR Consultancy",
          status: "active",
          maturity_score: 78,
          ai_readiness_score: 92,
          problem_statement: "Modernizing ATS recruitment workflows from spreadsheets.",
          updated_at: new Date().toISOString(),
        });
      }
    } catch {
      setActiveWs({
        id: "demo-ws-1",
        name: "TalentCraft HR Consultancy",
        status: "active",
        maturity_score: 78,
        ai_readiness_score: 92,
        problem_statement: "Modernizing ATS recruitment workflows from spreadsheets.",
        updated_at: new Date().toISOString(),
      });
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#6366f1" />}
      >
        {/* Top Header */}
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.greeting}>Command Center</Text>
            <Text style={styles.workspaceTitle}>{activeWs?.name || "No Active Workspace"}</Text>
          </View>
          <TouchableOpacity style={styles.profileButton} onPress={() => router.push("/settings")}>
            <User color="#e4e4e7" size={18} />
          </TouchableOpacity>
        </View>

        {/* AI Readiness Score Hero Card */}
        <View style={styles.heroCard}>
          <View style={styles.heroHeader}>
            <View style={styles.badgeRow}>
              <Zap color="#818cf8" size={16} />
              <Text style={styles.badgeText}>AI Readiness Score</Text>
            </View>
            <Text style={styles.scoreText}>{activeWs?.ai_readiness_score || 92}%</Text>
          </View>
          <Text style={styles.heroSubtext}>
            High blueprint maturity. 3 candidate workflows and architecture models validated for execution.
          </Text>
          <View style={styles.heroProgressBar}>
            <View style={[styles.heroProgressFill, { width: `${activeWs?.ai_readiness_score || 92}%` }]} />
          </View>
        </View>

        {/* Quick Actions Grid */}
        <Text style={styles.sectionHeading}>Quick Actions</Text>
        <View style={styles.quickActionsGrid}>
          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => router.push("/(tabs)/ai")}
          >
            <View style={[styles.actionIconBadge, { backgroundColor: "#4f46e5" }]}>
              <Sparkles color="#ffffff" size={20} />
            </View>
            <Text style={styles.actionTitle}>Ask AI</Text>
            <Text style={styles.actionSubtitle}>Synthesize solutions</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => router.push("/(tabs)/documents")}
          >
            <View style={[styles.actionIconBadge, { backgroundColor: "#0284c7" }]}>
              <FileUp color="#ffffff" size={20} />
            </View>
            <Text style={styles.actionTitle}>Add Context</Text>
            <Text style={styles.actionSubtitle}>Upload PDF / BRD</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => router.push("/(tabs)/projects")}
          >
            <View style={[styles.actionIconBadge, { backgroundColor: "#059669" }]}>
              <Layers color="#ffffff" size={20} />
            </View>
            <Text style={styles.actionTitle}>Workspaces</Text>
            <Text style={styles.actionSubtitle}>All blueprints</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => router.push("/artifact/architecture")}
          >
            <View style={[styles.actionIconBadge, { backgroundColor: "#d97706" }]}>
              <ShieldCheck color="#ffffff" size={20} />
            </View>
            <Text style={styles.actionTitle}>Architecture</Text>
            <Text style={styles.actionSubtitle}>HLD / LLD diagram</Text>
          </TouchableOpacity>
        </View>

        {/* Recent Transformation Blueprints */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionHeading}>Active Blueprint Modules</Text>
          <TouchableOpacity onPress={() => router.push("/(tabs)/projects")}>
            <Text style={styles.viewAllText}>View all</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.blueprintItem}
          onPress={() => router.push("/artifact/architecture")}
        >
          <View style={styles.blueprintIconBox}>
            <TrendingUp color="#6366f1" size={20} />
          </View>
          <View style={styles.blueprintInfo}>
            <Text style={styles.blueprintTitle}>Cloud Architecture (HLD & LLD)</Text>
            <Text style={styles.blueprintStatus}>PostgreSQL 16 · Redis 7 · Node Microservices</Text>
          </View>
          <ChevronRight color="#71717a" size={18} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.blueprintItem}
          onPress={() => router.push("/artifact/process")}
        >
          <View style={styles.blueprintIconBox}>
            <Layers color="#10b981" size={20} />
          </View>
          <View style={styles.blueprintInfo}>
            <Text style={styles.blueprintTitle}>Process Flow (BPMN As-Is & To-Be)</Text>
            <Text style={styles.blueprintStatus}>Automated stage progression & triggers</Text>
          </View>
          <ChevronRight color="#71717a" size={18} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.blueprintItem}
          onPress={() => router.push("/artifact/data")}
        >
          <View style={styles.blueprintIconBox}>
            <ShieldCheck color="#38bdf8" size={20} />
          </View>
          <View style={styles.blueprintInfo}>
            <Text style={styles.blueprintTitle}>Data Schema & OpenAPI 3.1</Text>
            <Text style={styles.blueprintStatus}>Candidates, punches, RLS policies</Text>
          </View>
          <ChevronRight color="#71717a" size={18} />
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#09090b" },
  container: { flex: 1 },
  content: { padding: 18, paddingBottom: 36 },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  greeting: { color: "#a1a1aa", fontSize: 13, fontWeight: "600" },
  workspaceTitle: { color: "#fafafa", fontSize: 20, fontWeight: "800", letterSpacing: -0.3 },
  profileButton: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: "#18181b",
    borderWidth: 1,
    borderColor: "#27272a",
    justifyContent: "center",
    alignItems: "center",
  },
  heroCard: {
    backgroundColor: "#18181b",
    borderWidth: 1,
    borderColor: "#27272a",
    borderRadius: 16,
    padding: 18,
    marginBottom: 24,
  },
  heroHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  badgeRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  badgeText: { color: "#818cf8", fontSize: 13, fontWeight: "700" },
  scoreText: { color: "#ffffff", fontSize: 26, fontWeight: "900" },
  heroSubtext: { color: "#a1a1aa", fontSize: 13, marginTop: 8, lineHeight: 18 },
  heroProgressBar: {
    height: 6,
    backgroundColor: "#27272a",
    borderRadius: 3,
    marginTop: 14,
    overflow: "hidden",
  },
  heroProgressFill: {
    height: "100%",
    backgroundColor: "#6366f1",
    borderRadius: 3,
  },
  sectionHeading: {
    color: "#e4e4e7",
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 12,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 20,
    marginBottom: 12,
  },
  viewAllText: { color: "#818cf8", fontSize: 12, fontWeight: "600" },
  quickActionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  actionCard: {
    width: "48%",
    backgroundColor: "#18181b",
    borderWidth: 1,
    borderColor: "#27272a",
    borderRadius: 14,
    padding: 14,
  },
  actionIconBadge: {
    width: 38,
    height: 38,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  actionTitle: { color: "#fafafa", fontSize: 14, fontWeight: "700" },
  actionSubtitle: { color: "#71717a", fontSize: 11, marginTop: 2 },
  blueprintItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#18181b",
    borderWidth: 1,
    borderColor: "#27272a",
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
  },
  blueprintIconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: "#27272a",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  blueprintInfo: { flex: 1 },
  blueprintTitle: { color: "#fafafa", fontSize: 14, fontWeight: "700" },
  blueprintStatus: { color: "#a1a1aa", fontSize: 11, marginTop: 2 },
});
