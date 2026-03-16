import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { COLORS } from "../../constants/colors";

interface Props {
  data: {
    title: string;
    type: string;
    size?: string;
    date?: string;
    preview?: string;
    status?: "draft" | "signed" | "pending" | "expired";
  };
  onAction?: (action: string) => void;
}

const TYPE_ICONS: Record<string, string> = { pdf: "📄", doc: "📝", contract: "📋", invoice: "🧾", receipt: "🧾", image: "🖼️", spreadsheet: "📊" };
const STATUS_COLORS: Record<string, { bg: string; color: string }> = {
  draft: { bg: "#F3F4F6", color: "#374151" },
  signed: { bg: "#D1FAE5", color: "#065F46" },
  pending: { bg: "#FEF3C7", color: "#92400E" },
  expired: { bg: "#FEE2E2", color: "#991B1B" },
};

export function DocumentCard({ data, onAction }: Props) {
  const icon = TYPE_ICONS[data.type.toLowerCase()] || "📄";
  const statusStyle = data.status ? STATUS_COLORS[data.status] : null;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.icon}>{icon}</Text>
        <View style={styles.info}>
          <Text style={styles.title} numberOfLines={1}>{data.title}</Text>
          <View style={styles.meta}>
            <Text style={styles.type}>{data.type.toUpperCase()}</Text>
            {data.size && <Text style={styles.size}>{data.size}</Text>}
            {data.date && <Text style={styles.size}>{data.date}</Text>}
          </View>
        </View>
        {statusStyle && (
          <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
            <Text style={[styles.statusText, { color: statusStyle.color }]}>{data.status}</Text>
          </View>
        )}
      </View>
      {data.preview && <Text style={styles.preview} numberOfLines={2}>{data.preview}</Text>}
      <Pressable style={styles.viewBtn} onPress={() => onAction?.(`view:${data.title}`)}>
        <Text style={styles.viewText}>View Document</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: COLORS.card, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: COLORS.border },
  header: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 10 },
  icon: { fontSize: 28 },
  info: { flex: 1 },
  title: { fontSize: 14, fontWeight: "700", color: COLORS.text },
  meta: { flexDirection: "row", gap: 8, marginTop: 2 },
  type: { fontSize: 10, fontWeight: "700", color: COLORS.primary },
  size: { fontSize: 10, color: COLORS.textMuted },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  statusText: { fontSize: 10, fontWeight: "700", textTransform: "capitalize" },
  preview: { fontSize: 12, color: COLORS.textSecondary, lineHeight: 17, marginBottom: 12 },
  viewBtn: { borderRadius: 10, borderWidth: 1, borderColor: COLORS.border, paddingVertical: 10, alignItems: "center" },
  viewText: { fontSize: 13, fontWeight: "600", color: COLORS.text },
});
