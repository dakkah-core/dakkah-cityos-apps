import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { COLORS } from "../../constants/colors";

interface Props {
  data: {
    title: string;
    message: string;
    severity: "info" | "warning" | "critical";
    timestamp?: string;
    actions?: string[];
  };
  onAction?: (action: string) => void;
}

const SEVERITY: Record<string, { icon: string; bg: string; border: string; color: string }> = {
  info: { icon: "ℹ️", bg: "#EFF6FF", border: "#BFDBFE", color: "#1E40AF" },
  warning: { icon: "⚠️", bg: "#FFFBEB", border: "#FDE68A", color: "#92400E" },
  critical: { icon: "🚨", bg: "#FEF2F2", border: "#FECACA", color: "#991B1B" },
};

export function AlertCard({ data, onAction }: Props) {
  const s = SEVERITY[data.severity] || SEVERITY.info;
  return (
    <View style={[styles.container, { backgroundColor: s.bg, borderColor: s.border }]}>
      <View style={styles.header}>
        <Text style={styles.icon}>{s.icon}</Text>
        <Text style={[styles.title, { color: s.color }]}>{data.title}</Text>
      </View>
      <Text style={[styles.message, { color: s.color }]}>{data.message}</Text>
      {data.timestamp && <Text style={styles.time}>{data.timestamp}</Text>}
      {data.actions && data.actions.length > 0 && (
        <View style={styles.actions}>
          {data.actions.map((a) => (
            <Pressable key={a} style={[styles.actionBtn, { borderColor: s.border }]} onPress={() => onAction?.(a)}>
              <Text style={[styles.actionText, { color: s.color }]}>{a}</Text>
            </Pressable>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { borderRadius: 16, padding: 16, borderWidth: 1 },
  header: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 },
  icon: { fontSize: 18 },
  title: { fontSize: 14, fontWeight: "700", flex: 1 },
  message: { fontSize: 13, lineHeight: 18, marginBottom: 8 },
  time: { fontSize: 11, color: COLORS.textMuted, marginBottom: 8 },
  actions: { flexDirection: "row", gap: 8 },
  actionBtn: { paddingVertical: 6, paddingHorizontal: 14, borderRadius: 8, borderWidth: 1 },
  actionText: { fontSize: 12, fontWeight: "600" },
});
