import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { COLORS } from "../../constants/colors";

interface Props {
  data: {
    trackingId: string;
    carrier: string;
    status: "in-transit" | "delivered" | "ready-for-pickup" | "returned";
    lockerLocation?: string;
    lockerCode?: string;
    estimatedDelivery?: string;
    items?: string[];
  };
  onAction?: (action: string) => void;
}

const STATUS_MAP: Record<string, { icon: string; label: string; bg: string; color: string }> = {
  "in-transit": { icon: "📦", label: "In Transit", bg: "#DBEAFE", color: "#1E40AF" },
  delivered: { icon: "✅", label: "Delivered", bg: "#D1FAE5", color: "#065F46" },
  "ready-for-pickup": { icon: "🔔", label: "Ready for Pickup", bg: "#FEF3C7", color: "#92400E" },
  returned: { icon: "↩️", label: "Returned", bg: "#FEE2E2", color: "#991B1B" },
};

export function ParcelLocker({ data, onAction }: Props) {
  const s = STATUS_MAP[data.status] || STATUS_MAP["in-transit"];
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.icon}>{s.icon}</Text>
        <View style={styles.info}>
          <Text style={styles.carrier}>{data.carrier}</Text>
          <Text style={styles.tracking}>{data.trackingId}</Text>
        </View>
        <View style={[styles.badge, { backgroundColor: s.bg }]}>
          <Text style={[styles.badgeText, { color: s.color }]}>{s.label}</Text>
        </View>
      </View>
      {data.lockerLocation && <Text style={styles.detail}>📍 {data.lockerLocation}</Text>}
      {data.lockerCode && (
        <View style={styles.codeBox}>
          <Text style={styles.codeLabel}>Locker Code</Text>
          <Text style={styles.code}>{data.lockerCode}</Text>
        </View>
      )}
      {data.estimatedDelivery && <Text style={styles.detail}>Est. delivery: {data.estimatedDelivery}</Text>}
      {data.status === "ready-for-pickup" && (
        <Pressable style={styles.btn} onPress={() => onAction?.("open-locker")}>
          <Text style={styles.btnText}>Open Locker</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: COLORS.card, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: COLORS.border },
  header: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 10 },
  icon: { fontSize: 28 },
  info: { flex: 1 },
  carrier: { fontSize: 14, fontWeight: "700", color: COLORS.text },
  tracking: { fontSize: 11, color: COLORS.textMuted, fontFamily: "monospace" },
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  badgeText: { fontSize: 10, fontWeight: "700" },
  detail: { fontSize: 12, color: COLORS.textSecondary, marginBottom: 6 },
  codeBox: { alignItems: "center", backgroundColor: COLORS.surface, borderRadius: 10, padding: 12, marginVertical: 8 },
  codeLabel: { fontSize: 10, color: COLORS.textMuted, marginBottom: 4 },
  code: { fontSize: 24, fontWeight: "800", color: COLORS.text, letterSpacing: 4 },
  btn: { backgroundColor: COLORS.primary, borderRadius: 10, paddingVertical: 10, alignItems: "center", marginTop: 8 },
  btnText: { fontSize: 13, fontWeight: "700", color: "#fff" },
});
