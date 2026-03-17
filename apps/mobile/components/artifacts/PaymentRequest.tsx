import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { COLORS } from "../../constants/colors";

interface Props {
  data: {
    title: string;
    amount: string;
    currency?: string;
    recipient?: string;
    description?: string;
    method?: string;
    status?: "pending" | "paid" | "failed";
  };
  onAction?: (action: string) => void;
}

export function PaymentRequest({ data, onAction }: Props) {
  const isPaid = data.status === "paid";

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.emoji}>💳</Text>
        <View style={styles.headerInfo}>
          <Text style={styles.title}>{data.title}</Text>
          {data.recipient && <Text style={styles.recipient}>To: {data.recipient}</Text>}
        </View>
        {data.status && (
          <View style={[styles.statusBadge, isPaid && styles.statusPaid]}>
            <Text style={[styles.statusText, isPaid && styles.statusPaidText]}>{data.status}</Text>
          </View>
        )}
      </View>
      <View style={styles.amountRow}>
        <Text style={styles.amount}>{data.currency || "$"}{data.amount}</Text>
      </View>
      {data.description && <Text style={styles.description}>{data.description}</Text>}
      {data.method && (
        <View style={styles.methodRow}>
          <Text style={styles.methodLabel}>Payment method</Text>
          <Text style={styles.methodValue}>{data.method}</Text>
        </View>
      )}
      {!isPaid && (
        <Pressable style={styles.payBtn} onPress={() => onAction?.(`pay:${data.amount}`)}>
          <Text style={styles.payText}>Pay Now</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: COLORS.card, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: COLORS.border },
  header: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 12 },
  emoji: { fontSize: 24 },
  headerInfo: { flex: 1 },
  title: { fontSize: 15, fontWeight: "700", color: COLORS.text },
  recipient: { fontSize: 12, color: COLORS.textSecondary },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 8, backgroundColor: "#FEF3C7" },
  statusPaid: { backgroundColor: "#D1FAE5" },
  statusText: { fontSize: 10, fontWeight: "700", color: "#92400E", textTransform: "capitalize" },
  statusPaidText: { color: "#065F46" },
  amountRow: { alignItems: "center", marginBottom: 12 },
  amount: { fontSize: 32, fontWeight: "800", color: COLORS.text },
  description: { fontSize: 13, color: COLORS.textSecondary, textAlign: "center", marginBottom: 12 },
  methodRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 8, borderTopWidth: 1, borderTopColor: COLORS.border, marginBottom: 12 },
  methodLabel: { fontSize: 12, color: COLORS.textSecondary },
  methodValue: { fontSize: 12, fontWeight: "600", color: COLORS.text },
  payBtn: { backgroundColor: COLORS.success, borderRadius: 12, paddingVertical: 14, alignItems: "center" },
  payText: { fontSize: 15, fontWeight: "700", color: "#fff" },
});
