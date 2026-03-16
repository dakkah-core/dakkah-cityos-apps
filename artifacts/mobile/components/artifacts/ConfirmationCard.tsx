import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { COLORS } from "../../constants/colors";

interface Props {
  data: {
    title: string;
    venue: string;
    date: string;
    time: string;
    guests: number;
    total: string;
    notes?: string;
    actions: string[];
  };
  onAction?: (action: string) => void;
}

export function ConfirmationCard({ data, onAction }: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.proposeBadge}>
          <Text style={styles.proposeText}>Needs Confirmation</Text>
        </View>
      </View>
      <Text style={styles.title}>{data.title}</Text>
      <View style={styles.details}>
        <DetailRow label="Venue" value={data.venue} />
        <DetailRow label="Date" value={data.date} />
        <DetailRow label="Time" value={data.time} />
        <DetailRow label="Guests" value={String(data.guests)} />
        <DetailRow label="Total" value={data.total} highlight />
        {data.notes && <DetailRow label="Notes" value={data.notes} />}
      </View>
      <View style={styles.actions}>
        {data.actions.map((action, i) => (
          <Pressable
            key={action}
            style={[styles.actionBtn, i === 0 && styles.primaryBtn]}
            onPress={() => onAction?.(action)}
          >
            <Text style={[styles.actionText, i === 0 && styles.primaryBtnText]}>{action}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

function DetailRow({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={[styles.detailValue, highlight && styles.highlightValue]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: COLORS.card, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: COLORS.border },
  header: { marginBottom: 8 },
  proposeBadge: { alignSelf: "flex-start", backgroundColor: "#FEF3C7", borderRadius: 8, paddingHorizontal: 10, paddingVertical: 3 },
  proposeText: { fontSize: 10, fontWeight: "700", color: "#92400E" },
  title: { fontSize: 16, fontWeight: "700", color: COLORS.text, marginBottom: 12 },
  details: { gap: 8, marginBottom: 16 },
  detailRow: { flexDirection: "row", justifyContent: "space-between" },
  detailLabel: { fontSize: 12, color: COLORS.textSecondary },
  detailValue: { fontSize: 12, fontWeight: "600", color: COLORS.text },
  highlightValue: { color: COLORS.primary, fontWeight: "700" },
  actions: { flexDirection: "row", gap: 8 },
  actionBtn: { flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: "center", borderWidth: 1, borderColor: COLORS.border },
  primaryBtn: { backgroundColor: COLORS.darkNavy, borderColor: COLORS.darkNavy },
  actionText: { fontSize: 13, fontWeight: "600", color: COLORS.text },
  primaryBtnText: { color: "#fff" },
});
