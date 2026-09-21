import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  TextInput,
  Modal,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Layers, Plus, Search, CheckCircle2, ChevronRight, X } from "lucide-react-native";
import { mobileApi } from "../../src/services/api";
import { WorkspaceItem } from "../../src/types";

export default function MobileProjectsScreen() {
  const router = useRouter();
  const [workspaces, setWorkspaces] = useState<WorkspaceItem[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [newName, setNewName] = useState("");
  const [newProblem, setNewProblem] = useState("");
  const [creating, setCreating] = useState(false);

  const loadWorkspaces = async () => {
    try {
      const list = await mobileApi.getWorkspaces();
      if (list.length > 0) {
        setWorkspaces(list);
      } else {
        setWorkspaces([
          {
            id: "ws-talentcraft",
            name: "TalentCraft HR Consultancy",
            status: "active",
            maturity_score: 82,
            ai_readiness_score: 94,
            problem_statement: "Automated candidate recruitment lifecycle and consultant attendance.",
            updated_at: new Date().toISOString(),
          },
          {
            id: "ws-finops",
            name: "FinOps Invoice Reconciliation",
            status: "active",
            maturity_score: 65,
            ai_readiness_score: 88,
            problem_statement: "Automating accounts payable matching with OCR invoice ingestion.",
            updated_at: new Date().toISOString(),
          },
        ]);
      }
    } catch {
      setWorkspaces([
        {
          id: "ws-talentcraft",
          name: "TalentCraft HR Consultancy",
          status: "active",
          maturity_score: 82,
          ai_readiness_score: 94,
          problem_statement: "Automated candidate recruitment lifecycle and consultant attendance.",
          updated_at: new Date().toISOString(),
        },
      ]);
    }
  };

  useEffect(() => {
    loadWorkspaces();
  }, []);

  const handleCreate = async () => {
    if (!newName.trim()) return;
    setCreating(true);
    try {
      await mobileApi.createWorkspace(newName.trim(), newProblem.trim());
      setModalVisible(false);
      setNewName("");
      setNewProblem("");
      await loadWorkspaces();
    } catch {
      // Local fallback insert
      setWorkspaces((prev) => [
        {
          id: `ws-${Date.now()}`,
          name: newName.trim(),
          status: "active",
          maturity_score: 25,
          ai_readiness_score: 70,
          problem_statement: newProblem.trim(),
          updated_at: new Date().toISOString(),
        },
        ...prev,
      ]);
      setModalVisible(false);
      setNewName("");
      setNewProblem("");
    } finally {
      setCreating(false);
    }
  };

  const filtered = workspaces.filter((w) =>
    w.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>Transformation Workspaces</Text>
            <Text style={styles.headerSubtitle}>{workspaces.length} active initiatives</Text>
          </View>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setModalVisible(true)}
          >
            <Plus color="#ffffff" size={20} />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={styles.searchBar}>
          <Search color="#71717a" size={16} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search projects by name..."
            placeholderTextColor="#71717a"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Workspace Cards List */}
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={async () => {
                setRefreshing(true);
                await loadWorkspaces();
                setRefreshing(false);
              }}
              tintColor="#6366f1"
            />
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.projectCard}
              onPress={async () => {
                await mobileApi.setActiveWorkspaceId(item.id);
                router.push("/artifact/architecture");
              }}
            >
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>{item.name}</Text>
                <View style={styles.statusBadge}>
                  <CheckCircle2 color="#10b981" size={12} />
                  <Text style={styles.statusText}>{item.status}</Text>
                </View>
              </View>

              {item.problem_statement ? (
                <Text style={styles.cardDescription} numberOfLines={2}>
                  {item.problem_statement}
                </Text>
              ) : null}

              <View style={styles.cardFooter}>
                <View style={styles.scoreRow}>
                  <Text style={styles.scoreLabel}>AI Score:</Text>
                  <Text style={styles.scoreValue}>{item.ai_readiness_score}%</Text>
                </View>
                <View style={styles.chevronRow}>
                  <Text style={styles.openText}>View Blueprint</Text>
                  <ChevronRight color="#6366f1" size={16} />
                </View>
              </View>
            </TouchableOpacity>
          )}
        />

        {/* New Workspace Modal */}
        <Modal visible={modalVisible} animationType="slide" transparent>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>New Transformation</Text>
                <TouchableOpacity onPress={() => setModalVisible(false)}>
                  <X color="#a1a1aa" size={20} />
                </TouchableOpacity>
              </View>

              <Text style={styles.modalLabel}>Business Initiative Name</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="e.g. Retail Inventory Automation"
                placeholderTextColor="#71717a"
                value={newName}
                onChangeText={setNewName}
              />

              <Text style={styles.modalLabel}>Problem Statement</Text>
              <TextInput
                style={[styles.modalInput, { height: 80 }]}
                placeholder="Describe current operational bottlenecks..."
                placeholderTextColor="#71717a"
                value={newProblem}
                onChangeText={setNewProblem}
                multiline
              />

              <TouchableOpacity
                style={styles.modalSubmit}
                onPress={handleCreate}
                disabled={creating}
              >
                {creating ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <Text style={styles.modalSubmitText}>Create Workspace</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#09090b" },
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 18,
    paddingVertical: 14,
  },
  headerTitle: { color: "#fafafa", fontSize: 20, fontWeight: "800", letterSpacing: -0.3 },
  headerSubtitle: { color: "#a1a1aa", fontSize: 12, marginTop: 2 },
  addButton: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: "#4f46e5",
    justifyContent: "center",
    alignItems: "center",
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#18181b",
    borderWidth: 1,
    borderColor: "#27272a",
    borderRadius: 12,
    marginHorizontal: 18,
    marginBottom: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
  },
  searchInput: { flex: 1, color: "#fafafa", fontSize: 13 },
  listContent: { padding: 18, paddingBottom: 36 },
  projectCard: {
    backgroundColor: "#18181b",
    borderWidth: 1,
    borderColor: "#27272a",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  cardTitle: { color: "#fafafa", fontSize: 16, fontWeight: "700", flex: 1, marginRight: 8 },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(16, 185, 129, 0.1)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  statusText: { color: "#10b981", fontSize: 10, fontWeight: "700", textTransform: "uppercase" },
  cardDescription: { color: "#a1a1aa", fontSize: 12, marginTop: 8, lineHeight: 16 },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#27272a",
  },
  scoreRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  scoreLabel: { color: "#71717a", fontSize: 12 },
  scoreValue: { color: "#6366f1", fontSize: 13, fontWeight: "700" },
  chevronRow: { flexDirection: "row", alignItems: "center", gap: 2 },
  openText: { color: "#6366f1", fontSize: 12, fontWeight: "600" },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.75)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#18181b",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    borderTopWidth: 1,
    borderTopColor: "#27272a",
  },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 18 },
  modalTitle: { color: "#fafafa", fontSize: 18, fontWeight: "700" },
  modalLabel: { color: "#d4d4d8", fontSize: 13, fontWeight: "600", marginTop: 12, marginBottom: 6 },
  modalInput: {
    backgroundColor: "#09090b",
    borderWidth: 1,
    borderColor: "#27272a",
    borderRadius: 12,
    padding: 12,
    color: "#fafafa",
    fontSize: 14,
  },
  modalSubmit: {
    backgroundColor: "#4f46e5",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    marginTop: 24,
  },
  modalSubmitText: { color: "#ffffff", fontSize: 14, fontWeight: "700" },
});
