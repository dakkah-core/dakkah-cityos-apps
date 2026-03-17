import React, { useState } from "react";
import { View, Text, TextInput, Pressable, Modal, StyleSheet, ScrollView } from "react-native";
import { COLORS } from "../constants/colors";
import { CONTACTS } from "../lib/contacts";

interface Props {
  visible: boolean;
  onClose: () => void;
}

export function AddMemberDialog({ visible, onClose }: Props) {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const filtered = CONTACTS.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) || c.department.toLowerCase().includes(search.toLowerCase())
  );

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <Modal transparent animationType="slide" visible={visible} onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <View style={styles.handle} />
          <Text style={styles.title}>Add Members</Text>
          <TextInput
            style={styles.search}
            placeholder="Search contacts..."
            placeholderTextColor={COLORS.textMuted}
            value={search}
            onChangeText={setSearch}
          />
          <ScrollView style={styles.list}>
            {filtered.map((c) => (
              <Pressable key={c.id} style={styles.row} onPress={() => toggleSelect(c.id)}>
                <View style={[styles.checkbox, selected.has(c.id) && styles.checked]}>
                  {selected.has(c.id) && <Text style={styles.checkmark}>✓</Text>}
                </View>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>{c.name[0]}</Text>
                </View>
                <View style={styles.info}>
                  <Text style={styles.name}>{c.name}</Text>
                  <Text style={styles.dept}>{c.department}</Text>
                </View>
                {c.isOnline && <View style={styles.onlineDot} />}
              </Pressable>
            ))}
          </ScrollView>
          <View style={styles.footer}>
            <Pressable style={styles.cancelBtn} onPress={onClose}>
              <Text style={styles.cancelText}>Cancel</Text>
            </Pressable>
            <Pressable style={[styles.addBtn, selected.size === 0 && styles.addBtnDisabled]} onPress={onClose} disabled={selected.size === 0}>
              <Text style={styles.addBtnText}>Add ({selected.size})</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: COLORS.overlay, justifyContent: "flex-end" },
  sheet: { backgroundColor: COLORS.surfaceWhite, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, maxHeight: "75%", paddingBottom: 40 },
  handle: { width: 40, height: 4, borderRadius: 2, backgroundColor: COLORS.border, alignSelf: "center", marginBottom: 16 },
  title: { fontSize: 18, fontWeight: "700", color: COLORS.text, textAlign: "center", marginBottom: 16 },
  search: { backgroundColor: COLORS.surface, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10, fontSize: 14, color: COLORS.text, marginBottom: 12, borderWidth: 1, borderColor: COLORS.border },
  list: { maxHeight: 300 },
  row: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: COLORS.borderLight },
  checkbox: { width: 22, height: 22, borderRadius: 6, borderWidth: 2, borderColor: COLORS.border, alignItems: "center", justifyContent: "center" },
  checked: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  checkmark: { color: "#fff", fontSize: 14, fontWeight: "700" },
  avatar: { width: 34, height: 34, borderRadius: 17, backgroundColor: COLORS.darkNavy, alignItems: "center", justifyContent: "center" },
  avatarText: { color: "#fff", fontSize: 13, fontWeight: "600" },
  info: { flex: 1 },
  name: { fontSize: 14, fontWeight: "600", color: COLORS.text },
  dept: { fontSize: 11, color: COLORS.textMuted },
  onlineDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.online },
  footer: { flexDirection: "row", gap: 12, marginTop: 16 },
  cancelBtn: { flex: 1, paddingVertical: 12, borderRadius: 12, backgroundColor: COLORS.surface, alignItems: "center" },
  cancelText: { fontSize: 14, fontWeight: "600", color: COLORS.textSecondary },
  addBtn: { flex: 1, paddingVertical: 12, borderRadius: 12, backgroundColor: COLORS.primary, alignItems: "center" },
  addBtnDisabled: { opacity: 0.4 },
  addBtnText: { fontSize: 14, fontWeight: "600", color: "#fff" },
});
