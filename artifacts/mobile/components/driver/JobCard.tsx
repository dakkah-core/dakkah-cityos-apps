import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { COLORS } from "@/constants/colors";
import type { DriverJob } from "@/types/driver";

interface JobCardProps {
  job: DriverJob;
  onPress: () => void;
  isActive?: boolean;
}

const STATUS_COLORS: Record<string, string> = {
  pending: "#d97706",
  accepted: "#3182ce",
  in_transit: "#0d9488",
  arrived: "#7c3aed",
  completed: "#059669",
  cancelled: "#dc2626",
};

export function JobCard({ job, onPress, isActive }: JobCardProps) {
  const statusColor = STATUS_COLORS[job.status] || COLORS.textSecondary;

  return (
    <Pressable style={[styles.card, isActive && styles.cardActive]} onPress={onPress}>
      <View style={styles.topRow}>
        <View style={[styles.typeBadge, { backgroundColor: job.type === "delivery" ? "#3182ce" : "#d97706" }]}>
          <Text style={styles.typeBadgeText}>{job.type.toUpperCase()}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: statusColor + "20" }]}>
          <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
          <Text style={[styles.statusText, { color: statusColor }]}>{job.status.replace("_", " ")}</Text>
        </View>
      </View>

      <View style={styles.locationSection}>
        <View style={styles.locationLine}>
          <View style={styles.pickupDot} />
          <Text style={styles.locationText} numberOfLines={1}>{job.pickup.name}</Text>
        </View>
        <View style={styles.routeConnector} />
        <View style={styles.locationLine}>
          <View style={styles.dropDot} />
          <Text style={styles.locationText} numberOfLines={1}>{job.customer.name} — {job.customer.address}</Text>
        </View>
      </View>

      <View style={styles.bottomRow}>
        <Text style={styles.metaText}>{job.estimatedDistance} • {job.estimatedDuration}</Text>
        <Text style={styles.payoutText}>{job.payout} {job.currency}</Text>
      </View>

      {job.items.length > 0 && (
        <Text style={styles.itemsText}>{job.items.length} item(s) • {job.items.map((i) => i.name).join(", ")}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: COLORS.surfaceWhite, borderRadius: 14, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: COLORS.border },
  cardActive: { borderColor: "#0d9488", borderWidth: 2 },
  topRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
  typeBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 4 },
  typeBadgeText: { color: "#fff", fontSize: 10, fontWeight: "700" },
  statusBadge: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusText: { fontSize: 11, fontWeight: "600", textTransform: "capitalize" },
  locationSection: { marginBottom: 10 },
  locationLine: { flexDirection: "row", alignItems: "center", gap: 8 },
  pickupDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: "#3182ce" },
  dropDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: "#e11d48" },
  routeConnector: { width: 1, height: 12, backgroundColor: COLORS.border, marginLeft: 4.5 },
  locationText: { fontSize: 13, color: COLORS.text, flex: 1 },
  bottomRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  metaText: { fontSize: 12, color: COLORS.textSecondary },
  payoutText: { fontSize: 16, fontWeight: "700", color: "#0d9488" },
  itemsText: { fontSize: 11, color: COLORS.textSecondary, marginTop: 6 },
});
