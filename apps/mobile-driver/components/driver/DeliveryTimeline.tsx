import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { COLORS, BRAND } from "@cityos/mobile-core";
import type { TimelineEntry, DeliveryStep } from "@/types/driver";

interface DeliveryTimelineProps {
  entries: TimelineEntry[];
}

const STEP_ICONS: Record<string, string> = {
  pending: "📋",
  accepted: "✅",
  en_route_pickup: "🚗",
  at_pickup: "📍",
  scanning: "📱",
  en_route_customer: "🛣️",
  arrived: "🏠",
  proof_of_delivery: "📸",
  completed: "🎉",
};

const STEP_ACTIONS: Partial<Record<DeliveryStep, string>> = {
  pending: "Accept or decline this job",
  accepted: "Navigate to pickup location",
  en_route_pickup: "Open maps for directions",
  at_pickup: "Verify items with barcode scan",
  scanning: "Scan remaining items",
  en_route_customer: "Open maps for directions",
  arrived: "Complete proof of delivery",
  proof_of_delivery: "Capture signature or photo",
  completed: "View earnings summary",
};

export function DeliveryTimeline({ entries }: DeliveryTimelineProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Delivery Timeline</Text>
      {entries.map((entry, index) => {
        const isLast = index === entries.length - 1;
        const dotColor =
          entry.status === "done" ? BRAND.teal :
          entry.status === "active" ? BRAND.blue :
          COLORS.border;
        const actionText = entry.status === "active" ? STEP_ACTIONS[entry.step] : undefined;

        return (
          <View key={entry.step} style={styles.entryRow}>
            <View style={styles.timelineColumn}>
              <View style={[
                styles.dot,
                { backgroundColor: dotColor },
                entry.status === "active" && styles.dotActive,
              ]}>
                <Text style={styles.dotIcon}>{STEP_ICONS[entry.step] || "•"}</Text>
              </View>
              {!isLast && (
                <View style={[
                  styles.line,
                  entry.status === "done" && { backgroundColor: BRAND.teal },
                ]} />
              )}
            </View>
            <View style={[styles.content, entry.status === "active" && styles.contentActive]}>
              <Text style={[
                styles.label,
                entry.status === "done" && styles.labelDone,
                entry.status === "active" && styles.labelActive,
              ]}>
                {entry.label}
              </Text>
              {entry.timestamp && (
                <Text style={styles.timestamp}>{entry.timestamp}</Text>
              )}
              {actionText && (
                <View style={styles.actionHint}>
                  <Text style={styles.actionHintText}>→ {actionText}</Text>
                </View>
              )}
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginHorizontal: 16, marginVertical: 12, backgroundColor: COLORS.surfaceWhite, borderRadius: 14, padding: 16, borderWidth: 1, borderColor: COLORS.border },
  title: { fontSize: 15, fontWeight: "700", color: COLORS.text, marginBottom: 14 },
  entryRow: { flexDirection: "row", minHeight: 48 },
  timelineColumn: { alignItems: "center", width: 40, marginRight: 10 },
  dot: { width: 32, height: 32, borderRadius: 16, alignItems: "center", justifyContent: "center", zIndex: 1 },
  dotActive: { borderWidth: 3, borderColor: BRAND.blue + "40" },
  dotIcon: { fontSize: 14 },
  line: { width: 2, flex: 1, backgroundColor: COLORS.border, marginVertical: 2 },
  content: { flex: 1, paddingBottom: 16 },
  contentActive: { backgroundColor: BRAND.blue + "08", marginLeft: -4, paddingLeft: 8, paddingTop: 4, paddingRight: 8, borderRadius: 8 },
  label: { fontSize: 14, fontWeight: "500", color: COLORS.textSecondary },
  labelDone: { color: BRAND.teal, fontWeight: "600" },
  labelActive: { color: BRAND.blue, fontWeight: "700" },
  timestamp: { fontSize: 11, color: COLORS.textSecondary, marginTop: 2 },
  actionHint: { marginTop: 4, backgroundColor: BRAND.blue + "12", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, alignSelf: "flex-start" },
  actionHintText: { fontSize: 11, fontWeight: "600", color: BRAND.blue },
});
