import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { COLORS } from "../../constants/colors";

interface CreditLimitData {
  used: number;
  limit: number;
  currency: string;
  accountName: string;
  lastPayment: string;
  nextDue: string;
  minPayment: string;
}

interface Props {
  data: CreditLimitData;
}

export function CreditLimitGauge({ data }: Props) {
  const usagePercent = (data.used / data.limit) * 100;
  const available = data.limit - data.used;
  const gaugeColor = usagePercent > 80 ? COLORS.danger : usagePercent > 60 ? COLORS.warning : COLORS.success;

  return (
    <View style={styles.container}>
      <Text style={styles.accountName}>{data.accountName}</Text>

      <View style={styles.gaugeContainer}>
        <View style={styles.gaugeOuter}>
          <View style={[styles.gaugeFill, { width: `${Math.min(usagePercent, 100)}%`, backgroundColor: gaugeColor }]} />
        </View>
        <Text style={[styles.gaugePercent, { color: gaugeColor }]}>{usagePercent.toFixed(0)}%</Text>
      </View>

      <View style={styles.amountRow}>
        <View style={styles.amountItem}>
          <Text style={styles.amountLabel}>Used</Text>
          <Text style={styles.amountValue}>{data.currency}{data.used.toLocaleString()}</Text>
        </View>
        <View style={styles.amountDivider} />
        <View style={styles.amountItem}>
          <Text style={styles.amountLabel}>Available</Text>
          <Text style={[styles.amountValue, { color: COLORS.success }]}>{data.currency}{available.toLocaleString()}</Text>
        </View>
        <View style={styles.amountDivider} />
        <View style={styles.amountItem}>
          <Text style={styles.amountLabel}>Limit</Text>
          <Text style={styles.amountValue}>{data.currency}{data.limit.toLocaleString()}</Text>
        </View>
      </View>

      <View style={styles.detailsSection}>
        <DetailRow label="Last Payment" value={data.lastPayment} />
        <DetailRow label="Next Due" value={data.nextDue} />
        <DetailRow label="Min. Payment" value={data.minPayment} />
      </View>
    </View>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: COLORS.card, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: COLORS.border },
  accountName: { fontSize: 14, fontWeight: "700", color: COLORS.text, marginBottom: 16 },
  gaugeContainer: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 16 },
  gaugeOuter: { flex: 1, height: 12, borderRadius: 6, backgroundColor: COLORS.borderLight, overflow: "hidden" },
  gaugeFill: { height: "100%", borderRadius: 6 },
  gaugePercent: { fontSize: 16, fontWeight: "800", minWidth: 44, textAlign: "right" },
  amountRow: { flexDirection: "row", justifyContent: "space-around", marginBottom: 16, paddingVertical: 12, backgroundColor: COLORS.borderLight, borderRadius: 12 },
  amountItem: { alignItems: "center" },
  amountLabel: { fontSize: 10, color: COLORS.textMuted },
  amountValue: { fontSize: 14, fontWeight: "700", color: COLORS.text, marginTop: 2 },
  amountDivider: { width: 1, backgroundColor: COLORS.border },
  detailsSection: { gap: 8 },
  detailRow: { flexDirection: "row", justifyContent: "space-between" },
  detailLabel: { fontSize: 12, color: COLORS.textSecondary },
  detailValue: { fontSize: 12, fontWeight: "600", color: COLORS.text },
});
