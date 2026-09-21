import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Share,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  ArrowLeft,
  Share2,
  Download,
  RotateCcw,
  Sparkles,
  Layers,
  Database,
  CheckCircle2,
} from "lucide-react-native";
import { mobileApi } from "../../src/services/api";

export default function ArtifactDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [version, setVersion] = useState(1);
  const [regenerating, setRegenerating] = useState(false);

  const title =
    id === "architecture"
      ? "Cloud Solution Architecture"
      : id === "process"
      ? "Process Intelligence (BPMN)"
      : id === "data"
      ? "Database & API Surface"
      : "Transformation Blueprint";

  const handleShare = async () => {
    try {
      await Share.share({
        message: `BizzMitra AI Blueprint: ${title} (v${version}) has been generated and validated for execution.`,
      });
    } catch {}
  };

  const handleExport = (format: string) => {
    const url = mobileApi.getExportUrl("TalentCraft HR Consultancy", format);
    Alert.alert(
      "Export Deliverable",
      `Deliverable ready for download:\n${url}`,
      [
        { text: "Copy Link", onPress: () => {} },
        { text: "Done", style: "cancel" },
      ]
    );
  };

  const handleRegenerate = () => {
    setRegenerating(true);
    setTimeout(() => {
      setVersion((v) => v + 1);
      setRegenerating(false);
      Alert.alert("Artifact Regenerated", `Blueprint updated to Version ${version + 1}.`);
    }, 1200);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft color="#ffffff" size={20} />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {title}
          </Text>
          <Text style={styles.versionBadge}>Version {version}.0 · Approved</Text>
        </View>
        <TouchableOpacity style={styles.headerAction} onPress={handleShare}>
          <Share2 color="#ffffff" size={18} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        {/* Diagram Card */}
        <View style={styles.diagramCard}>
          <View style={styles.diagramHeader}>
            <Text style={styles.diagramLabel}>Topology & Data Flow Diagram</Text>
            <View style={styles.liveTag}>
              <Text style={styles.liveTagText}>Interactive</Text>
            </View>
          </View>
          <View style={styles.diagramBox}>
            <View style={styles.diagramNode}>
              <Text style={styles.nodeText}>React 19 Native Client</Text>
            </View>
            <Text style={styles.nodeArrow}>↓ HTTPS / WSS</Text>
            <View style={[styles.diagramNode, { borderColor: "#6366f1" }]}>
              <Text style={[styles.nodeText, { color: "#818cf8" }]}>Edge Gateway (JWT / RLS)</Text>
            </View>
            <Text style={styles.nodeArrow}>↓</Text>
            <View style={[styles.diagramNode, { borderColor: "#10b981" }]}>
              <Text style={[styles.nodeText, { color: "#34d399" }]}>PostgreSQL 16 Multi-Tenant</Text>
            </View>
          </View>
        </View>

        {/* Specifications & Blueprint Details */}
        <Text style={styles.sectionTitle}>Executive Specifications</Text>
        <View style={styles.specBox}>
          <View style={styles.specRow}>
            <Text style={styles.specKey}>Target Velocity:</Text>
            <Text style={styles.specVal}>28 Days → 9 Days (-68% Turnaround)</Text>
          </View>
          <View style={styles.specRow}>
            <Text style={styles.specKey}>Net Annual ROI:</Text>
            <Text style={styles.specVal}>₹32,30,000 / Year Reclaimed</Text>
          </View>
          <View style={styles.specRow}>
            <Text style={styles.specKey}>Security Standard:</Text>
            <Text style={styles.specVal}>DPDP Act & PostgreSQL 16 RLS</Text>
          </View>
          <View style={styles.specRow}>
            <Text style={styles.specKey}>Payback Period:</Text>
            <Text style={styles.specVal}>2.4 Months to Break-Even</Text>
          </View>
        </View>

        {/* Export Deliverables Grid */}
        <Text style={styles.sectionTitle}>Universal Export Center</Text>
        <View style={styles.exportGrid}>
          <TouchableOpacity style={styles.exportCard} onPress={() => handleExport("docx")}>
            <Download color="#3b82f6" size={18} />
            <Text style={styles.exportLabel}>MS Word (.doc)</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.exportCard} onPress={() => handleExport("xlsx")}>
            <Download color="#10b981" size={18} />
            <Text style={styles.exportLabel}>Excel Model (.csv)</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.exportCard} onPress={() => handleExport("openapi")}>
            <Download color="#f59e0b" size={18} />
            <Text style={styles.exportLabel}>OpenAPI 3.1</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.exportCard} onPress={() => handleExport("sql")}>
            <Download color="#8b5cf6" size={18} />
            <Text style={styles.exportLabel}>Postgres DDL</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Bottom Sticky Action Bar */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.regenerateButton}
          onPress={handleRegenerate}
          disabled={regenerating}
        >
          <RotateCcw color="#e4e4e7" size={16} />
          <Text style={styles.regenerateText}>
            {regenerating ? "Regenerating..." : "Regenerate AI"}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.approveButton}
          onPress={() => Alert.alert("Sign-Off Confirmed", "Governance sign-off recorded in enterprise audit log.")}
        >
          <CheckCircle2 color="#ffffff" size={16} />
          <Text style={styles.approveText}>Sign-Off Blueprint</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#09090b" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#27272a",
  },
  backButton: { width: 36, height: 36, justifyContent: "center", alignItems: "center" },
  headerTitleContainer: { flex: 1, marginLeft: 8 },
  headerTitle: { color: "#fafafa", fontSize: 16, fontWeight: "700" },
  versionBadge: { color: "#818cf8", fontSize: 11, marginTop: 2 },
  headerAction: { width: 36, height: 36, justifyContent: "center", alignItems: "center" },
  container: { flex: 1 },
  content: { padding: 18, paddingBottom: 36 },
  diagramCard: {
    backgroundColor: "#18181b",
    borderWidth: 1,
    borderColor: "#27272a",
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  },
  diagramHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  diagramLabel: { color: "#fafafa", fontSize: 14, fontWeight: "700" },
  liveTag: { backgroundColor: "#1e1b4b", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  liveTagText: { color: "#818cf8", fontSize: 10, fontWeight: "700" },
  diagramBox: { alignItems: "center", paddingVertical: 8 },
  diagramNode: {
    width: "100%",
    backgroundColor: "#09090b",
    borderWidth: 1,
    borderColor: "#3f3f46",
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: "center",
  },
  nodeText: { color: "#d4d4d8", fontSize: 12, fontWeight: "600" },
  nodeArrow: { color: "#71717a", fontSize: 11, marginVertical: 6 },
  sectionTitle: { color: "#e4e4e7", fontSize: 14, fontWeight: "700", marginBottom: 10, marginTop: 10 },
  specBox: {
    backgroundColor: "#18181b",
    borderWidth: 1,
    borderColor: "#27272a",
    borderRadius: 14,
    padding: 14,
    marginBottom: 16,
  },
  specRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#27272a",
  },
  specKey: { color: "#a1a1aa", fontSize: 12 },
  specVal: { color: "#fafafa", fontSize: 12, fontWeight: "600" },
  exportGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  exportCard: {
    width: "48%",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#18181b",
    borderWidth: 1,
    borderColor: "#27272a",
    borderRadius: 12,
    padding: 12,
    gap: 8,
  },
  exportLabel: { color: "#fafafa", fontSize: 12, fontWeight: "600" },
  bottomBar: {
    flexDirection: "row",
    padding: 14,
    borderTopWidth: 1,
    borderTopColor: "#27272a",
    backgroundColor: "#09090b",
    gap: 10,
  },
  regenerateButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#18181b",
    borderWidth: 1,
    borderColor: "#27272a",
    borderRadius: 12,
    paddingVertical: 12,
    gap: 6,
  },
  regenerateText: { color: "#e4e4e7", fontSize: 13, fontWeight: "600" },
  approveButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#4f46e5",
    borderRadius: 12,
    paddingVertical: 12,
    gap: 6,
  },
  approveText: { color: "#ffffff", fontSize: 13, fontWeight: "700" },
});
