import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { COLORS, BRAND } from "@cityos/mobile-core";
import type { DriverJob } from "@/types/driver";

interface JobCardProps {
  job: DriverJob;
  onPress: () => void;
  isActive?: boolean;
}

const STATUS_COLORS: Record<string, string> = {
  pending: BRAND.amber,
  accepted: BRAND.blue,
  in_transit: BRAND.teal,
  arrived: "#7c3aed",
  completed: "#059669",
  cancelled: "#dc2626",
};

const STATUS_LABELS: Record<string, string> = {
  pending: "New",
  accepted: "Accepted",
  in_transit: "In Transit",
  arrived: "Arrived",
  completed: "Completed",
  cancelled: "Cancelled",
};

function formatTimeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export function JobCard({ job, onPress, isActive }: JobCardProps) {
  const statusColor = STATUS_COLORS[job.status] || COLORS.textSecondary;

  return (
    <Pressable style={[styles.card, isActive && styles.cardActive]} onPress={onPress}>
      <View style={styles.topRow}>
        <View style={styles.topLeft}>
          <View style={[styles.typeBadge, { backgroundColor: job.type === "delivery" ? BRAND.blue : job.type === "pickup" ? BRAND.amber : BRAND.rose }]}>
            <Text style={styles.typeBadgeText}>{job.type.toUpperCase()}</Text>
          </View>
          {job.priority === "urgent" && (
            <View style={styles.urgentBadge}>
              <Text style={styles.urgentText}>URGENT</Text>
            </View>
          )}
        </View>
        <View style={[styles.statusBadge, { backgroundColor: statusColor + "20" }]}>
          <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
          <Text style={[styles.statusText, { color: statusColor }]}>{STATUS_LABELS[job.status] || job.status}</Text>
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
          <View style={{ flex: 1 }}>
            <Text style={styles.locationText} numberOfLines={1}>{job.customer.name}</Text>
            <Text style={styles.locationAddr} numberOfLines={1}>{job.customer.address}</Text>
          </View>
        </View>
      </View>

      <View style={styles.bottomRow}>
        <View style={styles.metaChips}>
          <View style={styles.metaChip}>
            <Text style={styles.metaChipText}>📏 {job.estimatedDistance}</Text>
          </View>
          <View style={styles.metaChip}>
            <Text style={styles.metaChipText}>⏱ {job.estimatedDuration}</Text>
          </View>
          <View style={styles.metaChip}>
            <Text style={styles.metaChipText}>📦 {job.items.length}</Text>
          </View>
        </View>
        <View style={styles.payoutColumn}>
          <Text style={styles.payoutText}>{job.payout.toFixed(2)} {job.currency}</Text>
          {job.tip ? <Text style={styles.tipText}>+{job.tip} tip</Text> : null}
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.timeAgo}>{formatTimeAgo(job.createdAt)}</Text>
        {isActive && <Text style={styles.activeLabel}>TAP TO VIEW →</Text>}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: COLORS.surfaceWhite, borderRadius: 14, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: COLORS.border },
  cardActive: { borderColor: BRAND.teal, borderWidth: 2, backgroundColor: BRAND.teal + "05" },
  topRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
  topLeft: { flexDirection: "row", gap: 6 },
  typeBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 4 },
  typeBadgeText: { color: "#fff", fontSize: 10, fontWeight: "700" },
  urgentBadge: { paddingHorizontal: 6, paddingVertical: 3, borderRadius: 4, backgroundColor: BRAND.rose },
  urgentText: { color: "#fff", fontSize: 9, fontWeight: "800" },
  statusBadge: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusText: { fontSize: 11, fontWeight: "600" },
  locationSection: { marginBottom: 10 },
  locationLine: { flexDirection: "row", alignItems: "center", gap: 8 },
  pickupDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: BRAND.blue },
  dropDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: BRAND.rose },
  routeConnector: { width: 1, height: 12, backgroundColor: COLORS.border, marginLeft: 4.5 },
  locationText: { fontSize: 13, fontWeight: "600", color: COLORS.text, flex: 1 },
  locationAddr: { fontSize: 11, color: COLORS.textSecondary, marginTop: 1 },
  bottomRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  metaChips: { flexDirection: "row", gap: 6 },
  metaChip: { paddingHorizontal: 6, paddingVertical: 3, backgroundColor: COLORS.surface, borderRadius: 4 },
  metaChipText: { fontSize: 10, color: COLORS.textSecondary, fontWeight: "500" },
  payoutColumn: { alignItems: "flex-end" },
  payoutText: { fontSize: 18, fontWeight: "800", color: BRAND.teal },
  tipText: { fontSize: 11, fontWeight: "600", color: BRAND.amber, marginTop: 1 },
  footer: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 8, paddingTop: 8, borderTopWidth: 1, borderTopColor: COLORS.border },
  timeAgo: { fontSize: 11, color: COLORS.textSecondary },
  activeLabel: { fontSize: 11, fontWeight: "700", color: BRAND.teal },
});
