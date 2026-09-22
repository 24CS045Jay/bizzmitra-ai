import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as DocumentPicker from "expo-document-picker";
import { FileUp, FileText, CheckCircle2, Clock, Plus, Sparkles } from "lucide-react-native";
import { mobileApi } from "../../src/services/api";
import { DocumentItem } from "../../src/types";

export default function MobileDocumentsScreen() {
  const [documents, setDocuments] = useState<DocumentItem[]>([
    {
      id: "doc-1",
      workspace_id: "ws-talentcraft",
      file_name: "Enterprise_Talent_Acquisition_BRD.docx",
      storage_path: "documents/brd.docx",
      file_type: "DOCX",
      uploaded_at: "2 hours ago",
    },
    {
      id: "doc-2",
      workspace_id: "ws-talentcraft",
      file_name: "ATS_Standard_Operating_Procedure.pdf",
      storage_path: "documents/sop.pdf",
      file_type: "PDF",
      uploaded_at: "Yesterday",
    },
  ]);
  const [uploading, setUploading] = useState(false);

  const handlePickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const file = result.assets[0];
        setUploading(true);

        // Simulated central ingestion and extraction
        setTimeout(() => {
          const newDoc: DocumentItem = {
            id: `doc-${Date.now()}`,
            workspace_id: "ws-talentcraft",
            file_name: file.name,
            storage_path: `documents/${file.name}`,
            file_type: file.name.split(".").pop()?.toUpperCase() || "DOC",
            uploaded_at: "Just now",
          };
          setDocuments((prev) => [newDoc, ...prev]);
          setUploading(false);
          Alert.alert("Context Ingested", `Successfully parsed entities and objectives from "${file.name}".`);
        }, 1500);
      }
    } catch {
      setUploading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <View style={styles.container}>
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>Document Ingestion</Text>
            <Text style={styles.headerSubtitle}>SOPs, BRDs & Architecture Specifications</Text>
          </View>
        </View>

        {/* Upload Action Box */}
        <TouchableOpacity
          style={styles.uploadBox}
          onPress={handlePickDocument}
          disabled={uploading}
        >
          {uploading ? (
            <View style={styles.uploadingState}>
              <ActivityIndicator color="#6366f1" size="large" />
              <Text style={styles.uploadingText}>Extracting business context & constraints...</Text>
            </View>
          ) : (
            <View style={styles.uploadIdleState}>
              <View style={styles.uploadIconCircle}>
                <FileUp color="#ffffff" size={24} />
              </View>
              <Text style={styles.uploadPrompt}>+ Add Business Context</Text>
              <Text style={styles.uploadFormatNotice}>Tap to select PDF, DOCX, or PPTX file</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Ingested Documents List */}
        <Text style={styles.listHeading}>Active Context Documents ({documents.length})</Text>
        <FlatList
          data={documents}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <View style={styles.docCard}>
              <View style={styles.docIconBox}>
                <FileText color="#818cf8" size={22} />
              </View>
              <View style={styles.docInfo}>
                <Text style={styles.docName} numberOfLines={1}>
                  {item.file_name}
                </Text>
                <View style={styles.docMetaRow}>
                  <Text style={styles.docTypeBadge}>{item.file_type}</Text>
                  <Text style={styles.docDate}>· {item.uploaded_at}</Text>
                </View>
              </View>
              <View style={styles.statusCheck}>
                <CheckCircle2 color="#10b981" size={18} />
              </View>
            </View>
          )}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#09090b" },
  container: { flex: 1 },
  header: { paddingHorizontal: 18, paddingVertical: 14 },
  headerTitle: { color: "#fafafa", fontSize: 20, fontWeight: "800" },
  headerSubtitle: { color: "#a1a1aa", fontSize: 12, marginTop: 2 },
  uploadBox: {
    marginHorizontal: 18,
    backgroundColor: "#18181b",
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderColor: "#4f46e5",
    borderRadius: 18,
    padding: 24,
    alignItems: "center",
    marginBottom: 24,
  },
  uploadIdleState: { alignItems: "center" },
  uploadingState: { alignItems: "center", padding: 12 },
  uploadingText: { color: "#818cf8", fontSize: 13, marginTop: 12, fontWeight: "600" },
  uploadIconCircle: {
    width: 50,
    height: 50,
    borderRadius: 14,
    backgroundColor: "#4f46e5",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  uploadPrompt: { color: "#fafafa", fontSize: 15, fontWeight: "700" },
  uploadFormatNotice: { color: "#71717a", fontSize: 12, marginTop: 4 },
  listHeading: {
    color: "#d4d4d8",
    fontSize: 14,
    fontWeight: "700",
    paddingHorizontal: 18,
    marginBottom: 10,
  },
  listContent: { paddingHorizontal: 18, paddingBottom: 24 },
  docCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#18181b",
    borderWidth: 1,
    borderColor: "#27272a",
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
  },
  docIconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: "#1e1b4b",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  docInfo: { flex: 1 },
  docName: { color: "#fafafa", fontSize: 14, fontWeight: "600" },
  docMetaRow: { flexDirection: "row", alignItems: "center", marginTop: 4 },
  docTypeBadge: { color: "#818cf8", fontSize: 10, fontWeight: "700" },
  docDate: { color: "#71717a", fontSize: 11, marginLeft: 4 },
  statusCheck: { marginLeft: 8 },
});
