import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { COLORS } from "../../constants/colors";

interface EscrowMilestone {
  title: string;
  amount: string;
  status: "completed" | "active" | "pending";
  date?: string;
}

interface EscrowData {
  transactionId: string;
  buyer: string;
  seller: string;
  totalAmount: string;
  milestones: EscrowMilestone[];
}

interface Props {
  data: EscrowData;
}

export function EscrowStatus({ data }: Props) {
  const completedCount = data.milestones.filter(m => m.status === "completed").length;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.label}>ESCROW</Text>
          <Text style={styles.transactionId}>{data.transactionId}</Text>
        </View>
        <View style={styles.totalBox}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue}>{data.totalAmount}</Text>
        </View>
      </View>

      <View style={styles.partiesRow}>
        <View style={styles.party}>
          <Text style={styles.partyRole}>Buyer</Text>
          <Text style={styles.partyName}>{data.buyer}</Text>
        </View>
        <Text style={styles.arrow}>→</Text>
        <View style={styles.party}>
          <Text style={styles.partyRole}>Seller</Text>
          <Text style={styles.partyName}>{data.seller}</Text>
        </View>
      </View>

      <Text style={styles.milestonesTitle}>Milestones ({completedCount}/{data.milestones.length})</Text>
      <View style={styles.milestones}>
        {data.milestones.map((m, i) => (
          <View key={i} style={styles.milestoneRow}>
            <View style={styles.milestoneIndicator}>
              <View style={[
                styles.milestoneDot,
                m.status === "completed" && styles.dotCompleted,
                m.status === "active" && styles.dotActive,
              ]}>
                {m.status === "completed" && <Text style={styles.checkmark}>✓</Text>}
              </View>
              {i < data.milestones.length - 1 && (
                <View style={[styles.milestoneLine, m.status === "completed" && styles.lineCompleted]} />
              )}
            </View>
            <View style={styles.milestoneContent}>
              <View style={styles.milestoneHeader}>
                <Text style={[styles.milestoneTitle, m.status === "completed" && styles.titleCompleted]}>{m.title}</Text>
                <Text style={styles.milestoneAmount}>{m.amount}</Text>
              </View>
              {m.date && <Text style={styles.milestoneDate}>{m.date}</Text>}
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: COLORS.card, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: COLORS.border },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 },
  label: { fontSize: 10, fontWeight: "700", color: COLORS.textMuted, letterSpacing: 1 },
  transactionId: { fontSize: 14, fontWeight: "700", color: COLORS.text, marginTop: 2 },
  totalBox: { alignItems: "flex-end" },
  totalLabel: { fontSize: 10, color: COLORS.textMuted },
  totalValue: { fontSize: 18, fontWeight: "800", color: COLORS.primary, marginTop: 2 },
  partiesRow: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 16, marginBottom: 16, paddingVertical: 12, backgroundColor: COLORS.borderLight, borderRadius: 12 },
  party: { alignItems: "center" },
  partyRole: { fontSize: 10, color: COLORS.textMuted },
  partyName: { fontSize: 13, fontWeight: "600", color: COLORS.text, marginTop: 2 },
  arrow: { fontSize: 18, color: COLORS.primary, fontWeight: "700" },
  milestonesTitle: { fontSize: 12, fontWeight: "700", color: COLORS.text, marginBottom: 12 },
  milestones: {},
  milestoneRow: { flexDirection: "row", gap: 12, minHeight: 48 },
  milestoneIndicator: { alignItems: "center", width: 24 },
  milestoneDot: { width: 20, height: 20, borderRadius: 10, backgroundColor: COLORS.borderLight, borderWidth: 2, borderColor: COLORS.border, alignItems: "center", justifyContent: "center" },
  dotCompleted: { backgroundColor: COLORS.success, borderColor: COLORS.success },
  dotActive: { borderColor: COLORS.primary, borderWidth: 3, backgroundColor: "#fff" },
  checkmark: { fontSize: 10, color: "#fff", fontWeight: "700" },
  milestoneLine: { flex: 1, width: 2, backgroundColor: COLORS.border, marginVertical: 2 },
  lineCompleted: { backgroundColor: COLORS.success },
  milestoneContent: { flex: 1, paddingBottom: 16 },
  milestoneHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  milestoneTitle: { fontSize: 13, fontWeight: "600", color: COLORS.text },
  titleCompleted: { color: COLORS.textSecondary },
  milestoneAmount: { fontSize: 12, fontWeight: "700", color: COLORS.primary },
  milestoneDate: { fontSize: 10, color: COLORS.textMuted, marginTop: 2 },
});
