import React, { useState } from "react";
import { View, Text, Pressable, Modal, StyleSheet, ScrollView } from "react-native";
import { COLORS } from "../constants/colors";
import { CONTACTS } from "../lib/contacts";
import { ContactProfileModal } from "./ContactProfileModal";
import type { Contact } from "../types/chat";

interface Props {
  visible: boolean;
  onClose: () => void;
  onAddMember: () => void;
}

export function GroupInfoDialog({ visible, onClose, onAddMember }: Props) {
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);

  const members = [
    { id: "copilot", name: "Dakkah Copilot", role: "AI Assistant", department: "CityOS", isOnline: true },
    { id: "user_me", name: "You", role: "Explorer", department: "City", isOnline: true },
    ...CONTACTS.slice(0, 3),
  ];

  return (
    <Modal transparent animationType="slide" visible={visible} onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <View style={styles.handle} />
          <Text style={styles.title}>Group Info</Text>
          <Text style={styles.subtitle}>Dakkah CityOS Chat</Text>
          <View style={styles.descCard}>
            <Text style={styles.descLabel}>Description</Text>
            <Text style={styles.descText}>A shared space for exploring the city through AI-powered conversations with Dakkah Copilot.</Text>
          </View>
          <View style={styles.membersHeader}>
            <Text style={styles.membersTitle}>Members ({members.length})</Text>
            <Pressable onPress={onAddMember}>
              <Text style={styles.addBtn}>+ Add</Text>
            </Pressable>
          </View>
          <ScrollView style={styles.membersList}>
            {members.map((m) => (
              <Pressable key={m.id} style={styles.memberRow} onPress={() => m.id !== "copilot" && m.id !== "user_me" && setSelectedContact(m as Contact)}>
                <View style={styles.memberAvatar}>
                  <Text style={styles.memberAvatarText}>{m.name[0]}</Text>
                </View>
                <View style={styles.memberInfo}>
                  <Text style={styles.memberName}>{m.name}</Text>
                  <Text style={styles.memberRole}>{m.role}</Text>
                </View>
                {m.isOnline && <View style={styles.onlineDot} />}
                <Text style={styles.badge}>{m.id === "user_me" ? "admin" : "member"}</Text>
              </Pressable>
            ))}
          </ScrollView>
          <Pressable style={styles.closeBtn} onPress={onClose}>
            <Text style={styles.closeBtnText}>Close</Text>
          </Pressable>
        </View>
      </View>
      <ContactProfileModal visible={!!selectedContact} contact={selectedContact} onClose={() => setSelectedContact(null)} />
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: COLORS.overlay, justifyContent: "flex-end" },
  sheet: { backgroundColor: COLORS.surfaceWhite, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, maxHeight: "80%", paddingBottom: 40 },
  handle: { width: 40, height: 4, borderRadius: 2, backgroundColor: COLORS.border, alignSelf: "center", marginBottom: 16 },
  title: { fontSize: 20, fontWeight: "700", color: COLORS.text, textAlign: "center" },
  subtitle: { fontSize: 13, color: COLORS.textMuted, textAlign: "center", marginBottom: 16 },
  descCard: { backgroundColor: COLORS.surface, borderRadius: 12, padding: 14, marginBottom: 16 },
  descLabel: { fontSize: 11, color: COLORS.textMuted, fontWeight: "600", marginBottom: 4 },
  descText: { fontSize: 13, color: COLORS.textSecondary, lineHeight: 19 },
  membersHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  membersTitle: { fontSize: 15, fontWeight: "600", color: COLORS.text },
  addBtn: { fontSize: 13, fontWeight: "600", color: COLORS.primary },
  membersList: { maxHeight: 250 },
  memberRow: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: COLORS.borderLight },
  memberAvatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: COLORS.darkNavy, alignItems: "center", justifyContent: "center" },
  memberAvatarText: { color: "#fff", fontSize: 14, fontWeight: "600" },
  memberInfo: { flex: 1 },
  memberName: { fontSize: 14, fontWeight: "600", color: COLORS.text },
  memberRole: { fontSize: 11, color: COLORS.textMuted },
  onlineDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.online },
  badge: { fontSize: 10, color: COLORS.textMuted, backgroundColor: COLORS.surface, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  closeBtn: { marginTop: 16, paddingVertical: 12, borderRadius: 12, backgroundColor: COLORS.surface, alignItems: "center" },
  closeBtnText: { fontSize: 15, fontWeight: "600", color: COLORS.textSecondary },
});
