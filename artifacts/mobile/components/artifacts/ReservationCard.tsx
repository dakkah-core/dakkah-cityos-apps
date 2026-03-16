import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { COLORS } from "../../constants/colors";

interface Props {
  data: {
    venue: string;
    type: string;
    date: string;
    time: string;
    guests?: number;
    confirmationCode?: string;
    status?: "confirmed" | "pending" | "cancelled";
    notes?: string;
  };
  onAction?: (action: string) => void;
}

const TYPE_ICONS: Record<string, string> = { restaurant: "🍽️", hotel: "🏨", spa: "🧖", flight: "✈️", car: "🚗", event: "🎟️" };
const STATUS_MAP: Record<string, { bg: string; color: string }> = {
  confirmed: { bg: "#D1FAE5", color: "#065F46" },
  pending: { bg: "#FEF3C7", color: "#92400E" },
  cancelled: { bg: "#FEE2E2", color: "#991B1B" },
};

export function ReservationCard({ data, onAction }: Props) {
  const icon = TYPE_ICONS[data.type.toLowerCase()] || "📋";
  const statusStyle = data.status ? STATUS_MAP[data.status] : null;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.icon}>{icon}</Text>
        <View style={styles.info}>
          <Text style={styles.venue}>{data.venue}</Text>
          <Text style={styles.type}>{data.type}</Text>
        </View>
        {statusStyle && (
          <View style={[styles.badge, { backgroundColor: statusStyle.bg }]}>
            <Text style={[styles.badgeText, { color: statusStyle.color }]}>{data.status}</Text>
          </View>
        )}
      </View>
      <View style={styles.details}>
        <DetailItem label="Date" value={data.date} />
        <DetailItem label="Time" value={data.time} />
        {data.guests && <DetailItem label="Guests" value={String(data.guests)} />}
      </View>
      {data.confirmationCode && (
        <View style={styles.codeRow}>
          <Text style={styles.codeLabel}>Confirmation</Text>
          <Text style={styles.code}>{data.confirmationCode}</Text>
        </View>
      )}
      {data.notes && <Text style={styles.notes}>{data.notes}</Text>}
      <View style={styles.actions}>
        <Pressable style={styles.modifyBtn} onPress={() => onAction?.("modify-reservation")}>
          <Text style={styles.modifyText}>Modify</Text>
        </Pressable>
        <Pressable style={styles.cancelBtn} onPress={() => onAction?.("cancel-reservation")}>
          <Text style={styles.cancelText}>Cancel</Text>
        </Pressable>
      </View>
    </View>
  );
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.detailItem}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: COLORS.card, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: COLORS.border },
  header: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 12 },
  icon: { fontSize: 28 },
  info: { flex: 1 },
  venue: { fontSize: 15, fontWeight: "700", color: COLORS.text },
  type: { fontSize: 12, color: COLORS.textSecondary, textTransform: "capitalize" },
  badge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 8 },
  badgeText: { fontSize: 10, fontWeight: "700", textTransform: "capitalize" },
  details: { flexDirection: "row", gap: 16, marginBottom: 12 },
  detailItem: {},
  detailLabel: { fontSize: 10, color: COLORS.textMuted },
  detailValue: { fontSize: 14, fontWeight: "600", color: COLORS.text },
  codeRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", backgroundColor: COLORS.surface, borderRadius: 8, padding: 10, marginBottom: 10 },
  codeLabel: { fontSize: 11, color: COLORS.textMuted },
  code: { fontSize: 14, fontWeight: "800", color: COLORS.text, letterSpacing: 2 },
  notes: { fontSize: 12, color: COLORS.textSecondary, marginBottom: 12 },
  actions: { flexDirection: "row", gap: 8 },
  modifyBtn: { flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: "center", borderWidth: 1, borderColor: COLORS.border },
  modifyText: { fontSize: 13, fontWeight: "600", color: COLORS.text },
  cancelBtn: { flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: "center", borderWidth: 1, borderColor: COLORS.danger },
  cancelText: { fontSize: 13, fontWeight: "600", color: COLORS.danger },
});
