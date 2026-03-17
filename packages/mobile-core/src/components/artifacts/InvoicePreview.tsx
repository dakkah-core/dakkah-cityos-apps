import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { COLORS } from "../../constants/colors";

interface InvoiceData {
  invoiceNumber: string;
  vendor: string;
  date: string;
  dueDate: string;
  status: "paid" | "pending" | "overdue";
  lineItems: { description: string; amount: string }[];
  subtotal: string;
  tax: string;
  total: string;
}

interface Props {
  data: InvoiceData;
  onAction?: (action: string) => void;
}

export function InvoicePreview({ data, onAction }: Props) {
  const statusColor = data.status === "paid" ? COLORS.success : data.status === "overdue" ? COLORS.danger : COLORS.warning;
  const statusLabel = data.status.charAt(0).toUpperCase() + data.status.slice(1);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.invoiceLabel}>INVOICE</Text>
          <Text style={styles.invoiceNumber}>{data.invoiceNumber}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: statusColor + "20" }]}>
          <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
          <Text style={[styles.statusText, { color: statusColor }]}>{statusLabel}</Text>
        </View>
      </View>

      <View style={styles.vendorRow}>
        <Text style={styles.vendorLabel}>From</Text>
        <Text style={styles.vendorName}>{data.vendor}</Text>
      </View>

      <View style={styles.dateRow}>
        <View>
          <Text style={styles.dateLabel}>Issued</Text>
          <Text style={styles.dateValue}>{data.date}</Text>
        </View>
        <View>
          <Text style={styles.dateLabel}>Due</Text>
          <Text style={[styles.dateValue, data.status === "overdue" && { color: COLORS.danger }]}>{data.dueDate}</Text>
        </View>
      </View>

      <View style={styles.lineItems}>
        {data.lineItems.map((item, i) => (
          <View key={i} style={styles.lineItem}>
            <Text style={styles.lineDesc}>{item.description}</Text>
            <Text style={styles.lineAmount}>{item.amount}</Text>
          </View>
        ))}
      </View>

      <View style={styles.totals}>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Subtotal</Text>
          <Text style={styles.totalValue}>{data.subtotal}</Text>
        </View>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Tax</Text>
          <Text style={styles.totalValue}>{data.tax}</Text>
        </View>
        <View style={[styles.totalRow, styles.grandTotal]}>
          <Text style={styles.grandTotalLabel}>Total</Text>
          <Text style={styles.grandTotalValue}>{data.total}</Text>
        </View>
      </View>

      {data.status !== "paid" && (
        <TouchableOpacity style={styles.payButton} onPress={() => onAction?.("pay-invoice")}>
          <Text style={styles.payButtonText}>Pay Now</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: COLORS.card, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: COLORS.border },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 },
  invoiceLabel: { fontSize: 10, fontWeight: "700", color: COLORS.textMuted, letterSpacing: 1 },
  invoiceNumber: { fontSize: 18, fontWeight: "800", color: COLORS.text, marginTop: 2 },
  statusBadge: { flexDirection: "row", alignItems: "center", gap: 6, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5 },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusText: { fontSize: 11, fontWeight: "700" },
  vendorRow: { marginBottom: 12 },
  vendorLabel: { fontSize: 10, color: COLORS.textMuted },
  vendorName: { fontSize: 14, fontWeight: "600", color: COLORS.text, marginTop: 2 },
  dateRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 16 },
  dateLabel: { fontSize: 10, color: COLORS.textMuted },
  dateValue: { fontSize: 13, fontWeight: "600", color: COLORS.text, marginTop: 2 },
  lineItems: { borderTopWidth: 1, borderTopColor: COLORS.border, paddingTop: 12, marginBottom: 12 },
  lineItem: { flexDirection: "row", justifyContent: "space-between", marginBottom: 8 },
  lineDesc: { fontSize: 13, color: COLORS.text, flex: 1 },
  lineAmount: { fontSize: 13, fontWeight: "600", color: COLORS.text },
  totals: { borderTopWidth: 1, borderTopColor: COLORS.border, paddingTop: 12 },
  totalRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 6 },
  totalLabel: { fontSize: 12, color: COLORS.textSecondary },
  totalValue: { fontSize: 12, fontWeight: "600", color: COLORS.text },
  grandTotal: { borderTopWidth: 1, borderTopColor: COLORS.border, paddingTop: 8, marginTop: 4, marginBottom: 0 },
  grandTotalLabel: { fontSize: 14, fontWeight: "700", color: COLORS.text },
  grandTotalValue: { fontSize: 16, fontWeight: "800", color: COLORS.primary },
  payButton: { backgroundColor: COLORS.primary, borderRadius: 12, paddingVertical: 12, alignItems: "center", marginTop: 16 },
  payButtonText: { fontSize: 14, fontWeight: "700", color: "#fff" },
});
