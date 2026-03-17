import React from "react";
import { View, Text, Pressable, Modal, StyleSheet, ScrollView } from "react-native";
import { COLORS } from "../constants/colors";
import type { Contact } from "../types/chat";

interface Props {
  visible: boolean;
  contact: Contact | null;
  onClose: () => void;
}

export function ContactProfileModal({ visible, contact, onClose }: Props) {
  if (!contact) return null;

  return (
    <Modal transparent animationType="slide" visible={visible} onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <View style={styles.handle} />
          <View style={styles.avatarLarge}>
            <Text style={styles.avatarText}>{contact.name[0]}{contact.name.split(" ")[1]?.[0] || ""}</Text>
          </View>
          <Text style={styles.name}>{contact.name}</Text>
          <View style={styles.statusRow}>
            <View style={[styles.statusDot, contact.isOnline ? styles.online : styles.offline]} />
            <Text style={styles.statusText}>{contact.isOnline ? "Online" : "Offline"}</Text>
          </View>
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Role</Text>
              <Text style={styles.infoValue}>{contact.role}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Department</Text>
              <Text style={styles.infoValue}>{contact.department}</Text>
            </View>
          </View>
          <View style={styles.actions}>
            <Pressable style={styles.actionBtn}>
              <Text style={styles.actionIcon}>💬</Text>
              <Text style={styles.actionLabel}>Message</Text>
            </Pressable>
            <Pressable style={styles.actionBtn}>
              <Text style={styles.actionIcon}>📧</Text>
              <Text style={styles.actionLabel}>Email</Text>
            </Pressable>
            <Pressable style={styles.actionBtn}>
              <Text style={styles.actionIcon}>📞</Text>
              <Text style={styles.actionLabel}>Call</Text>
            </Pressable>
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
  sheet: { backgroundColor: COLORS.surfaceWhite, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 24, alignItems: "center", paddingBottom: 40 },
  handle: { width: 40, height: 4, borderRadius: 2, backgroundColor: COLORS.border, marginBottom: 20 },
  avatarLarge: { width: 80, height: 80, borderRadius: 40, backgroundColor: COLORS.darkNavy, alignItems: "center", justifyContent: "center", marginBottom: 12 },
  avatarText: { color: COLORS.primary, fontSize: 28, fontWeight: "700" },
  name: { fontSize: 20, fontWeight: "700", color: COLORS.text, marginBottom: 4 },
  statusRow: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 20 },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  online: { backgroundColor: COLORS.online },
  offline: { backgroundColor: COLORS.textMuted },
  statusText: { fontSize: 13, color: COLORS.textSecondary },
  infoCard: { width: "100%", backgroundColor: COLORS.surface, borderRadius: 12, padding: 16, marginBottom: 20 },
  infoRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 8 },
  infoLabel: { fontSize: 13, color: COLORS.textMuted },
  infoValue: { fontSize: 13, fontWeight: "600", color: COLORS.text },
  divider: { height: 1, backgroundColor: COLORS.border },
  actions: { flexDirection: "row", gap: 20, marginBottom: 20 },
  actionBtn: { alignItems: "center", gap: 4 },
  actionIcon: { fontSize: 24 },
  actionLabel: { fontSize: 11, color: COLORS.textSecondary },
  closeBtn: { width: "100%", paddingVertical: 12, borderRadius: 12, backgroundColor: COLORS.surface, alignItems: "center" },
  closeBtnText: { fontSize: 15, fontWeight: "600", color: COLORS.textSecondary },
});
