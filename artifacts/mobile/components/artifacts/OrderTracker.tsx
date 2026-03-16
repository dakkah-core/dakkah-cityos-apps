import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { COLORS } from "../../constants/colors";
import type { OrderData } from "../../types/chat";

interface Props {
  data: OrderData;
}

const STEPS = ["confirmed", "preparing", "on-the-way", "delivered"] as const;
const STEP_LABELS = ["Confirmed", "Preparing", "On the Way", "Delivered"];

export function OrderTracker({ data }: Props) {
  const currentIndex = STEPS.indexOf(data.status);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.orderNum}>Order #{data.orderNumber}</Text>
        <Text style={styles.eta}>ETA: {data.estimatedTime}</Text>
      </View>

      <View style={styles.stepper}>
        {STEPS.map((step, i) => (
          <View key={step} style={styles.stepItem}>
            <View style={[styles.stepDot, i <= currentIndex && styles.stepDotActive, i === currentIndex && styles.stepDotCurrent]} />
            {i < STEPS.length - 1 && (
              <View style={[styles.stepLine, i < currentIndex && styles.stepLineActive]} />
            )}
          </View>
        ))}
      </View>
      <View style={styles.stepLabels}>
        {STEP_LABELS.map((label, i) => (
          <Text key={label} style={[styles.stepLabel, i <= currentIndex && styles.stepLabelActive]}>
            {label}
          </Text>
        ))}
      </View>

      <View style={styles.items}>
        <Text style={styles.itemsTitle}>Items</Text>
        {data.items.map((item, i) => (
          <Text key={i} style={styles.itemText}>• {item}</Text>
        ))}
      </View>
      <View style={styles.totalRow}>
        <Text style={styles.totalLabel}>Total</Text>
        <Text style={styles.totalValue}>{data.total}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: COLORS.card, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: COLORS.border },
  header: { flexDirection: "row", justifyContent: "space-between", marginBottom: 16 },
  orderNum: { fontSize: 14, fontWeight: "700", color: COLORS.text },
  eta: { fontSize: 12, fontWeight: "600", color: COLORS.primary },
  stepper: { flexDirection: "row", alignItems: "center", marginBottom: 6 },
  stepItem: { flexDirection: "row", alignItems: "center", flex: 1 },
  stepDot: { width: 14, height: 14, borderRadius: 7, backgroundColor: COLORS.borderLight, borderWidth: 2, borderColor: COLORS.border },
  stepDotActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  stepDotCurrent: { borderColor: COLORS.primary, backgroundColor: "#fff", borderWidth: 3 },
  stepLine: { flex: 1, height: 2, backgroundColor: COLORS.border },
  stepLineActive: { backgroundColor: COLORS.primary },
  stepLabels: { flexDirection: "row", justifyContent: "space-between", marginBottom: 16 },
  stepLabel: { fontSize: 9, color: COLORS.textMuted, textAlign: "center" },
  stepLabelActive: { color: COLORS.primary, fontWeight: "600" },
  items: { marginBottom: 12 },
  itemsTitle: { fontSize: 12, fontWeight: "700", color: COLORS.text, marginBottom: 4 },
  itemText: { fontSize: 12, color: COLORS.textSecondary, lineHeight: 20 },
  totalRow: { flexDirection: "row", justifyContent: "space-between", borderTopWidth: 1, borderTopColor: COLORS.border, paddingTop: 10 },
  totalLabel: { fontSize: 13, fontWeight: "600", color: COLORS.text },
  totalValue: { fontSize: 14, fontWeight: "700", color: COLORS.primary },
});
