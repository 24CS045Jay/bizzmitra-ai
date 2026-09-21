import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Bell, CheckCircle2, ShieldCheck, Sparkles } from "lucide-react-native";
import { mobileApi } from "../../src/services/api";
import { NotificationItem } from "../../src/types";

export default function MobileNotificationsScreen() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadNotifications = async () => {
    try {
      const items = await mobileApi.getNotifications();
      setNotifications(items);
    } catch {
      setNotifications([
        {
          id: "notif-1",
          title: "AI Blueprint Generated",
          message: "Your cloud architecture & BPMN diagrams are ready for review.",
          timestamp: "5 mins ago",
          read: false,
          type: "success",
        },
        {
          id: "notif-2",
          title: "Compliance Governance Passed",
          message: "DPDP Act data retention audit completed with 94% confidence score.",
          timestamp: "1 hour ago",
          read: true,
          type: "info",
        },
        {
          id: "notif-3",
          title: "Architecture Sign-Off",
          message: "Solution Architect approved the PostgreSQL 16 DDL migration.",
          timestamp: "Yesterday",
          read: true,
          type: "approval",
        },
      ]);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Notifications</Text>
          <Text style={styles.headerSubtitle}>Blueprint milestones & approvals</Text>
        </View>

        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={async () => {
                setRefreshing(true);
                await loadNotifications();
                setRefreshing(false);
              }}
              tintColor="#6366f1"
            />
          }
          renderItem={({ item }) => (
            <View style={[styles.notifCard, !item.read && styles.unreadCard]}>
              <View style={styles.iconBox}>
                {item.type === "success" && <Sparkles color="#10b981" size={18} />}
                {item.type === "approval" && <ShieldCheck color="#6366f1" size={18} />}
                {item.type === "info" && <CheckCircle2 color="#38bdf8" size={18} />}
              </View>
              <View style={styles.notifContent}>
                <Text style={styles.notifTitle}>{item.title}</Text>
                <Text style={styles.notifMessage}>{item.message}</Text>
                <Text style={styles.notifTime}>{item.timestamp}</Text>
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
  listContent: { padding: 18, paddingBottom: 24 },
  notifCard: {
    flexDirection: "row",
    backgroundColor: "#18181b",
    borderWidth: 1,
    borderColor: "#27272a",
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    gap: 12,
  },
  unreadCard: {
    borderColor: "rgba(99, 102, 241, 0.4)",
    backgroundColor: "#13131e",
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#27272a",
    justifyContent: "center",
    alignItems: "center",
  },
  notifContent: { flex: 1 },
  notifTitle: { color: "#fafafa", fontSize: 14, fontWeight: "700" },
  notifMessage: { color: "#a1a1aa", fontSize: 12, marginTop: 4, lineHeight: 17 },
  notifTime: { color: "#71717a", fontSize: 10, marginTop: 6 },
});
