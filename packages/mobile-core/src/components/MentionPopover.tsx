import React from "react";
import { View, Text, Pressable, StyleSheet, ScrollView } from "react-native";
import { COLORS } from "../constants/colors";
import { CONTACTS } from "../lib/contacts";

interface Props {
  visible: boolean;
  filter: string;
  onSelect: (name: string) => void;
}

export function MentionPopover({ visible, filter, onSelect }: Props) {
  if (!visible) return null;

  const filtered = CONTACTS.filter((c) =>
    c.name.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <ScrollView style={styles.list} keyboardShouldPersistTaps="handled">
        {filtered.map((contact) => (
          <Pressable key={contact.id} style={styles.item} onPress={() => onSelect(contact.name)}>
            <View style={[styles.avatar, contact.isOnline && styles.avatarOnline]}>
              <Text style={styles.avatarText}>{contact.name[0]}</Text>
            </View>
            <View style={styles.info}>
              <Text style={styles.name}>{contact.name}</Text>
              <Text style={styles.role}>{contact.role}</Text>
            </View>
            {contact.isOnline && <View style={styles.onlineDot} />}
          </Pressable>
        ))}
        {filtered.length === 0 && <Text style={styles.empty}>No matching contacts</Text>}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { position: "absolute", bottom: 0, left: 0, right: 0, backgroundColor: COLORS.surfaceWhite, borderTopWidth: 1, borderTopColor: COLORS.border, borderTopLeftRadius: 12, borderTopRightRadius: 12, maxHeight: 220, shadowColor: "#000", shadowOffset: { width: 0, height: -2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 8 },
  list: { padding: 8 },
  item: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8 },
  avatar: { width: 32, height: 32, borderRadius: 16, backgroundColor: COLORS.darkNavy, alignItems: "center", justifyContent: "center" },
  avatarOnline: { borderWidth: 2, borderColor: COLORS.online },
  avatarText: { color: "#fff", fontSize: 14, fontWeight: "600" },
  info: { flex: 1 },
  name: { fontSize: 13, fontWeight: "600", color: COLORS.text },
  role: { fontSize: 11, color: COLORS.textMuted },
  onlineDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.online },
  empty: { padding: 16, textAlign: "center", color: COLORS.textMuted, fontSize: 13 },
});
