import React, { useState } from "react";
import { View, Text, StyleSheet, Pressable, ScrollView, Modal, TextInput, Linking } from "react-native";
import { COLORS } from "../constants/colors";
import type { ChatThread } from "../types/chat";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { UserProfile } from "./UserProfile";
import { ActiveQuests } from "./ActiveQuests";
import { CopilotSettings } from "./CopilotSettings";

interface Props {
  visible: boolean;
  onClose: () => void;
  threads: ChatThread[];
  onNewChat: () => void;
  onLoadThread: (id: string) => void;
  onRefresh: () => void;
}

export function ThreadsDrawer({ visible, onClose, threads, onNewChat, onLoadThread, onRefresh }: Props) {
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState("");
  const [settingsOpen, setSettingsOpen] = useState(false);

  const handleNew = () => {
    onNewChat();
    onClose();
  };

  const handleLoad = (id: string) => {
    onLoadThread(id);
    onClose();
  };

  const filteredThreads = searchQuery.trim()
    ? threads.filter(
        (t) =>
          t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          t.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : threads;

  return (
    <>
      <Modal visible={visible} animationType="slide" transparent>
        <View style={styles.overlay}>
          <Pressable style={styles.backdrop} onPress={onClose} />
          <View style={[styles.sheet, { paddingTop: insets.top + 8, paddingBottom: insets.bottom + 16 }]}>
            <View style={styles.header}>
              <View style={styles.headerLeft}>
                <View style={styles.headerLogo}>
                  <Text style={styles.headerLogoText}>✦</Text>
                </View>
                <Text style={styles.title}>Dakkah</Text>
              </View>
              <Pressable onPress={onClose} style={styles.closeBtn}>
                <Text style={styles.close}>✕</Text>
              </Pressable>
            </View>

            <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
              <UserProfile />

              <ActiveQuests />

              <View style={styles.threadsSection}>
                <View style={styles.threadsSectionHeader}>
                  <Text style={styles.sectionTitle}>Conversations</Text>
                  <Pressable style={styles.refreshBtn} onPress={onRefresh}>
                    <Text style={styles.refreshIcon}>↻</Text>
                  </Pressable>
                </View>

                <View style={styles.searchRow}>
                  <View style={styles.searchBar}>
                    <Text style={styles.searchIcon}>🔍</Text>
                    <TextInput
                      style={styles.searchInput}
                      placeholder="Search conversations..."
                      placeholderTextColor={COLORS.textMuted}
                      value={searchQuery}
                      onChangeText={setSearchQuery}
                    />
                    {searchQuery.length > 0 && (
                      <Pressable onPress={() => setSearchQuery("")}>
                        <Text style={styles.clearIcon}>✕</Text>
                      </Pressable>
                    )}
                  </View>
                </View>

                <Pressable style={styles.newBtn} onPress={handleNew}>
                  <Text style={styles.newBtnIcon}>+</Text>
                  <Text style={styles.newBtnText}>New Conversation</Text>
                </Pressable>

                {filteredThreads.length === 0 ? (
                  <View style={styles.empty}>
                    <Text style={styles.emptyText}>
                      {searchQuery ? "No matching conversations" : "No previous conversations"}
                    </Text>
                  </View>
                ) : (
                  filteredThreads.map((thread) => (
                    <Pressable key={thread.id} style={styles.threadItem} onPress={() => handleLoad(thread.id)}>
                      <View style={styles.threadIcon}>
                        <Text style={styles.threadIconText}>💬</Text>
                      </View>
                      <View style={styles.threadContent}>
                        <Text style={styles.threadTitle} numberOfLines={1}>{thread.title}</Text>
                        <Text style={styles.threadMsg} numberOfLines={1}>{thread.lastMessage}</Text>
                      </View>
                    </Pressable>
                  ))
                )}
              </View>

              <View style={styles.bottomSection}>
                <Pressable style={styles.menuItem} onPress={() => setSettingsOpen(true)}>
                  <Text style={styles.menuItemIcon}>⚙️</Text>
                  <Text style={styles.menuItemText}>Copilot Settings</Text>
                  <Text style={styles.menuItemChevron}>›</Text>
                </Pressable>

                <View style={styles.supportSection}>
                  <Text style={styles.supportTitle}>Support</Text>
                  <Pressable
                    style={styles.supportItem}
                    onPress={() => Linking.openURL("https://dakkah.app/help").catch(() => {})}
                  >
                    <Text style={styles.supportIcon}>❓</Text>
                    <Text style={styles.supportText}>Help & FAQ</Text>
                  </Pressable>
                  <Pressable
                    style={styles.supportItem}
                    onPress={() => Linking.openURL("mailto:feedback@dakkah.app").catch(() => {})}
                  >
                    <Text style={styles.supportIcon}>💬</Text>
                    <Text style={styles.supportText}>Send Feedback</Text>
                  </Pressable>
                </View>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      <CopilotSettings visible={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1 },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: COLORS.overlay },
  sheet: {
    backgroundColor: "#fff",
    flex: 1,
    width: "85%",
    maxWidth: 360,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  headerLogo: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: COLORS.darkNavy,
    alignItems: "center",
    justifyContent: "center",
  },
  headerLogoText: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: "700",
  },
  title: { fontSize: 20, fontWeight: "800", color: COLORS.text },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  close: { fontSize: 16, color: COLORS.textMuted },
  scrollContent: { flex: 1 },
  threadsSection: {
    paddingHorizontal: 20,
    paddingTop: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingBottom: 14,
  },
  threadsSectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.text,
  },
  refreshBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  refreshIcon: {
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  searchRow: {
    marginBottom: 10,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.surface,
    borderRadius: 10,
    paddingHorizontal: 10,
    gap: 6,
    height: 36,
  },
  searchIcon: {
    fontSize: 13,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: COLORS.text,
    padding: 0,
  },
  clearIcon: {
    fontSize: 12,
    color: COLORS.textMuted,
    padding: 4,
  },
  newBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 12,
    backgroundColor: COLORS.darkNavy,
    borderRadius: 12,
    marginBottom: 10,
  },
  newBtnIcon: { fontSize: 16, fontWeight: "700", color: "#fff" },
  newBtnText: { fontSize: 13, fontWeight: "700", color: "#fff" },
  threadItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  threadIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: COLORS.primaryTint,
    alignItems: "center",
    justifyContent: "center",
  },
  threadIconText: { fontSize: 16 },
  threadContent: { flex: 1 },
  threadTitle: { fontSize: 13, fontWeight: "600", color: COLORS.text },
  threadMsg: { fontSize: 11, color: COLORS.textMuted, marginTop: 2 },
  empty: { alignItems: "center", paddingVertical: 24 },
  emptyText: { fontSize: 13, color: COLORS.textMuted },
  bottomSection: {
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 20,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 12,
    paddingHorizontal: 14,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    marginBottom: 16,
  },
  menuItemIcon: { fontSize: 16 },
  menuItemText: { flex: 1, fontSize: 13, fontWeight: "600", color: COLORS.text },
  menuItemChevron: { fontSize: 18, color: COLORS.textMuted },
  supportSection: {
    gap: 4,
  },
  supportTitle: {
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  supportItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 10,
  },
  supportIcon: { fontSize: 14 },
  supportText: { fontSize: 13, color: COLORS.textSecondary },
});
