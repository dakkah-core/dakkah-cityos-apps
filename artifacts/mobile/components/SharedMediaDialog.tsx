import React, { useState } from "react";
import { View, Text, Pressable, Modal, StyleSheet } from "react-native";
import { COLORS } from "@/constants/colors";

interface Props {
  visible: boolean;
  onClose: () => void;
}

const TABS = ["Images", "Documents", "Links"] as const;

export function SharedMediaDialog({ visible, onClose }: Props) {
  const [activeTab, setActiveTab] = useState<typeof TABS[number]>("Images");

  return (
    <Modal transparent animationType="slide" visible={visible} onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <View style={styles.handle} />
          <Text style={styles.title}>Shared Media</Text>
          <View style={styles.tabs}>
            {TABS.map((tab) => (
              <Pressable key={tab} style={[styles.tab, activeTab === tab && styles.tabActive]} onPress={() => setActiveTab(tab)}>
                <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>{tab}</Text>
              </Pressable>
            ))}
          </View>
          <View style={styles.content}>
            {activeTab === "Images" && (
              <View style={styles.emptyState}>
                <Text style={styles.emptyIcon}>🖼️</Text>
                <Text style={styles.emptyText}>No images shared yet</Text>
                <Text style={styles.emptyHint}>Images shared in the chat will appear here</Text>
              </View>
            )}
            {activeTab === "Documents" && (
              <View style={styles.emptyState}>
                <Text style={styles.emptyIcon}>📄</Text>
                <Text style={styles.emptyText}>No documents shared yet</Text>
                <Text style={styles.emptyHint}>PDFs, spreadsheets, and other files will appear here</Text>
              </View>
            )}
            {activeTab === "Links" && (
              <View style={styles.emptyState}>
                <Text style={styles.emptyIcon}>🔗</Text>
                <Text style={styles.emptyText}>No links shared yet</Text>
                <Text style={styles.emptyHint}>Links shared in messages will appear here</Text>
              </View>
            )}
          </View>
          <Pressable style={styles.closeBtn} onPress={onClose}>
            <Text style={styles.closeBtnText}>Close</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: COLORS.overlay, justifyContent: "flex-end" },
  sheet: { backgroundColor: COLORS.surfaceWhite, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, maxHeight: "70%", paddingBottom: 40 },
  handle: { width: 40, height: 4, borderRadius: 2, backgroundColor: COLORS.border, alignSelf: "center", marginBottom: 16 },
  title: { fontSize: 18, fontWeight: "700", color: COLORS.text, textAlign: "center", marginBottom: 16 },
  tabs: { flexDirection: "row", backgroundColor: COLORS.surface, borderRadius: 10, padding: 4, marginBottom: 16 },
  tab: { flex: 1, paddingVertical: 8, borderRadius: 8, alignItems: "center" },
  tabActive: { backgroundColor: COLORS.surfaceWhite, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2 },
  tabText: { fontSize: 13, color: COLORS.textMuted, fontWeight: "500" },
  tabTextActive: { color: COLORS.primary, fontWeight: "600" },
  content: { minHeight: 200, justifyContent: "center", alignItems: "center" },
  emptyState: { alignItems: "center", gap: 8 },
  emptyIcon: { fontSize: 40 },
  emptyText: { fontSize: 15, fontWeight: "600", color: COLORS.text },
  emptyHint: { fontSize: 12, color: COLORS.textMuted, textAlign: "center" },
  closeBtn: { marginTop: 16, paddingVertical: 12, borderRadius: 12, backgroundColor: COLORS.surface, alignItems: "center" },
  closeBtnText: { fontSize: 15, fontWeight: "600", color: COLORS.textSecondary },
});
