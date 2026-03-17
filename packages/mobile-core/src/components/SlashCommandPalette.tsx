import React from "react";
import { View, Text, Pressable, StyleSheet, ScrollView } from "react-native";
import { COLORS } from "../constants/colors";
import { SLASH_COMMANDS } from "../lib/contacts";

interface Props {
  visible: boolean;
  filter: string;
  onSelect: (prompt: string) => void;
  onClose: () => void;
}

export function SlashCommandPalette({ visible, filter, onSelect, onClose }: Props) {
  if (!visible) return null;

  const filtered = SLASH_COMMANDS.filter((cmd) =>
    cmd.command.toLowerCase().includes(filter.toLowerCase()) || cmd.description.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <ScrollView style={styles.list} keyboardShouldPersistTaps="handled">
        {filtered.map((cmd) => (
          <Pressable key={cmd.command} style={styles.item} onPress={() => onSelect(cmd.prompt)}>
            <Text style={styles.command}>{cmd.command}</Text>
            <Text style={styles.desc}>{cmd.description}</Text>
          </Pressable>
        ))}
        {filtered.length === 0 && (
          <Text style={styles.empty}>No matching commands</Text>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { position: "absolute", bottom: 0, left: 0, right: 0, backgroundColor: COLORS.surfaceWhite, borderTopWidth: 1, borderTopColor: COLORS.border, borderTopLeftRadius: 12, borderTopRightRadius: 12, maxHeight: 240, shadowColor: "#000", shadowOffset: { width: 0, height: -2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 8 },
  list: { padding: 8 },
  item: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 10, paddingHorizontal: 12, borderRadius: 8 },
  command: { fontSize: 14, fontWeight: "700", color: COLORS.primary, minWidth: 80 },
  desc: { fontSize: 13, color: COLORS.textSecondary, flex: 1 },
  empty: { padding: 16, textAlign: "center", color: COLORS.textMuted, fontSize: 13 },
});
