import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { COLORS } from "../../constants/colors";

interface LineItem {
  label: string;
  amount: string;
}

interface Props {
  data: {
    merchant: string;
    date: string;
    items: LineItem[];
    subtotal?: string;
    tax?: string;
    total: string;
    paymentMethod?: string;
    transactionId?: string;
  };
}

export function ReceiptCard({ data }: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.emoji}>🧾</Text>
        <Text style={styles.merchant}>{data.merchant}</Text>
        <Text style={styles.date}>{data.date}</Text>
      </View>
      <View style={styles.divider} />
      <View style={styles.items}>
        {data.items.map((item, i) => (
          <View key={i} style={styles.itemRow}>
            <Text style={styles.itemLabel}>{item.label}</Text>
            <Text style={styles.itemAmount}>{item.amount}</Text>
          </View>
        ))}
      </View>
      <View style={styles.divider} />
      {data.subtotal && <SummaryRow label="Subtotal" value={data.subtotal} />}
      {data.tax && <SummaryRow label="Tax" value={data.tax} />}
      <SummaryRow label="Total" value={data.total} bold />
      {data.paymentMethod && (
        <Text style={styles.meta}>Paid via {data.paymentMethod}</Text>
      )}
      {data.transactionId && (
        <Text style={styles.meta}>Ref: {data.transactionId}</Text>
      )}
    </View>
  );
}

function SummaryRow({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <View style={styles.itemRow}>
      <Text style={[styles.itemLabel, bold && styles.boldText]}>{label}</Text>
      <Text style={[styles.itemAmount, bold && styles.boldText]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: COLORS.card, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: COLORS.border },
  header: { alignItems: "center", marginBottom: 8 },
  emoji: { fontSize: 24, marginBottom: 4 },
  merchant: { fontSize: 16, fontWeight: "700", color: COLORS.text },
  date: { fontSize: 12, color: COLORS.textMuted, marginTop: 2 },
  divider: { height: 1, backgroundColor: COLORS.border, marginVertical: 10 },
  items: { gap: 6 },
  itemRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 2 },
  itemLabel: { fontSize: 13, color: COLORS.text },
  itemAmount: { fontSize: 13, color: COLORS.text },
  boldText: { fontWeight: "700" },
  meta: { fontSize: 11, color: COLORS.textMuted, textAlign: "center", marginTop: 6 },
});
