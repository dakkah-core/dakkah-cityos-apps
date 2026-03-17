import React, { useState, useCallback, useEffect } from "react";
import { View, Text, Pressable, StyleSheet, ScrollView, Alert, ActivityIndicator } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { usePos } from "@/context/PosContext";
import type { DailySalesReport, PosShift } from "@/types/pos";
import { TextInput } from "react-native";
import { COLORS, BRAND } from "@cityos/mobile-core";

export default function ReportsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { activeShift, closeShift, getDailyReport } = usePos();
  const [report, setReport] = useState<DailySalesReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [closingCash, setClosingCash] = useState("");
  const [closedShift, setClosedShift] = useState<PosShift | null>(null);
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const r = await getDailyReport();
        setReport(r);
      } catch {}
      setLoading(false);
    })();
  }, [getDailyReport]);

  const handleCloseShift = useCallback(async () => {
    const amount = parseFloat(closingCash) || 0;
    setClosing(true);
    try {
      const shift = await closeShift(amount);
      setClosedShift(shift);
      Alert.alert("Shift Closed", `Variance: ${(shift.variance || 0).toFixed(2)} SAR`);
    } catch {
      Alert.alert("Error", "Failed to close shift");
    } finally {
      setClosing(false);
    }
  }, [closingCash, closeShift]);

  if (loading) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={BRAND.teal} />
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backIcon}>{"<"}</Text>
        </Pressable>
        <Text style={styles.title}>Reports & End of Day</Text>
      </View>

      <ScrollView style={styles.body} contentContainerStyle={styles.bodyContent}>
        {activeShift && !closedShift && (
          <View style={styles.shiftSection}>
            <Text style={styles.sectionTitle}>Close Shift</Text>
            <View style={styles.shiftCard}>
              <View style={styles.shiftRow}>
                <Text style={styles.shiftLabel}>Shift ID</Text>
                <Text style={styles.shiftValue}>{activeShift.id}</Text>
              </View>
              <View style={styles.shiftRow}>
                <Text style={styles.shiftLabel}>Opened At</Text>
                <Text style={styles.shiftValue}>{new Date(activeShift.openedAt).toLocaleTimeString()}</Text>
              </View>
              <View style={styles.shiftRow}>
                <Text style={styles.shiftLabel}>Opening Cash</Text>
                <Text style={styles.shiftValue}>{activeShift.openingCash.toFixed(2)} SAR</Text>
              </View>
              <View style={styles.shiftRow}>
                <Text style={styles.shiftLabel}>Total Sales</Text>
                <Text style={[styles.shiftValue, styles.teal]}>{activeShift.totalSales.toFixed(2)} SAR</Text>
              </View>
              <View style={styles.shiftRow}>
                <Text style={styles.shiftLabel}>Transactions</Text>
                <Text style={styles.shiftValue}>{activeShift.totalTransactions}</Text>
              </View>

              <Text style={styles.cashLabel}>Closing Cash Count (SAR)</Text>
              <TextInput
                style={styles.cashInput}
                value={closingCash}
                onChangeText={setClosingCash}
                placeholder="Count your drawer..."
                placeholderTextColor="rgba(255,255,255,0.3)"
                keyboardType="decimal-pad"
              />
              <Pressable style={[styles.closeBtn, closing && styles.btnDisabled]} onPress={handleCloseShift} disabled={closing}>
                {closing ? <ActivityIndicator size="small" color="#fff" /> : <Text style={styles.closeBtnText}>Close Shift</Text>}
              </Pressable>
            </View>
          </View>
        )}

        {closedShift && (
          <View style={styles.reconciliationCard}>
            <Text style={styles.reconciliationTitle}>Shift Reconciliation</Text>
            <View style={styles.shiftRow}>
              <Text style={styles.shiftLabel}>Opening Cash</Text>
              <Text style={styles.shiftValue}>{closedShift.openingCash.toFixed(2)}</Text>
            </View>
            <View style={styles.shiftRow}>
              <Text style={styles.shiftLabel}>Total Sales</Text>
              <Text style={[styles.shiftValue, styles.teal]}>{closedShift.totalSales.toFixed(2)}</Text>
            </View>
            <View style={styles.shiftRow}>
              <Text style={styles.shiftLabel}>Returns</Text>
              <Text style={[styles.shiftValue, styles.red]}>-{closedShift.totalReturns.toFixed(2)}</Text>
            </View>
            <View style={styles.shiftRow}>
              <Text style={styles.shiftLabel}>Expected Cash</Text>
              <Text style={styles.shiftValue}>{(closedShift.expectedCash || 0).toFixed(2)}</Text>
            </View>
            <View style={styles.shiftRow}>
              <Text style={styles.shiftLabel}>Actual Cash</Text>
              <Text style={styles.shiftValue}>{(closedShift.closingCash || 0).toFixed(2)}</Text>
            </View>
            <View style={[styles.shiftRow, styles.varianceRow]}>
              <Text style={styles.varianceLabel}>Variance</Text>
              <Text style={[styles.varianceValue, (closedShift.variance || 0) < 0 ? styles.red : styles.teal]}>
                {(closedShift.variance || 0).toFixed(2)} SAR
              </Text>
            </View>
          </View>
        )}

        {report && (
          <>
            <Text style={styles.sectionTitle}>Daily Sales Summary</Text>
            <View style={styles.statsRow}>
              <View style={styles.statCard}>
                <Text style={styles.statLabel}>Total Sales</Text>
                <Text style={styles.statValue}>{report.totalSales.toFixed(0)}</Text>
                <Text style={styles.statUnit}>SAR</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statLabel}>Transactions</Text>
                <Text style={styles.statValue}>{report.totalTransactions}</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statLabel}>Net Sales</Text>
                <Text style={[styles.statValue, styles.teal]}>{report.netSales.toFixed(0)}</Text>
                <Text style={styles.statUnit}>SAR</Text>
              </View>
            </View>

            <View style={styles.breakdownCard}>
              <Text style={styles.breakdownTitle}>Payment Breakdown</Text>
              <View style={styles.breakdownRow}>
                <Text style={styles.breakdownIcon}>💵</Text>
                <Text style={styles.breakdownLabel}>Cash</Text>
                <Text style={styles.breakdownValue}>{report.cashTotal.toFixed(2)} SAR</Text>
              </View>
              <View style={styles.breakdownRow}>
                <Text style={styles.breakdownIcon}>💳</Text>
                <Text style={styles.breakdownLabel}>Card</Text>
                <Text style={styles.breakdownValue}>{report.cardTotal.toFixed(2)} SAR</Text>
              </View>
              <View style={styles.breakdownRow}>
                <Text style={styles.breakdownIcon}>📱</Text>
                <Text style={styles.breakdownLabel}>NFC</Text>
                <Text style={styles.breakdownValue}>{report.nfcTotal.toFixed(2)} SAR</Text>
              </View>
            </View>

            <Text style={styles.sectionTitle}>Top Products</Text>
            {report.topProducts.map((p, idx) => (
              <View key={idx} style={styles.topProductRow}>
                <Text style={styles.topProductRank}>{idx + 1}</Text>
                <Text style={styles.topProductName}>{p.name}</Text>
                <Text style={styles.topProductQty}>{p.quantity} sold</Text>
                <Text style={styles.topProductRev}>{p.revenue} SAR</Text>
              </View>
            ))}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BRAND.navy },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 12, gap: 12 },
  backBtn: { width: 36, height: 36, borderRadius: 10, backgroundColor: "rgba(255,255,255,0.15)", alignItems: "center", justifyContent: "center" },
  backIcon: { color: "#fff", fontSize: 18, fontWeight: "700" },
  title: { flex: 1, fontSize: 20, fontWeight: "800", color: "#fff" },
  body: { flex: 1 },
  bodyContent: { padding: 16, gap: 16, paddingBottom: 40 },
  sectionTitle: { fontSize: 16, fontWeight: "700", color: "rgba(255,255,255,0.7)", marginBottom: 4 },
  shiftSection: {},
  shiftCard: { backgroundColor: "rgba(255,255,255,0.05)", borderRadius: 14, padding: 16, borderWidth: 1, borderColor: "rgba(255,255,255,0.1)" },
  shiftRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 4 },
  shiftLabel: { fontSize: 13, color: "rgba(255,255,255,0.5)" },
  shiftValue: { fontSize: 13, fontWeight: "600", color: "#fff" },
  teal: { color: BRAND.teal },
  red: { color: BRAND.rose },
  cashLabel: { fontSize: 12, fontWeight: "600", color: "rgba(255,255,255,0.5)", marginTop: 12, marginBottom: 6 },
  cashInput: { backgroundColor: "rgba(255,255,255,0.1)", borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, fontSize: 16, color: "#fff", textAlign: "center", borderWidth: 1, borderColor: "rgba(255,255,255,0.15)", marginBottom: 12 },
  closeBtn: { backgroundColor: BRAND.rose, paddingVertical: 12, borderRadius: 10, alignItems: "center" },
  closeBtnText: { color: "#fff", fontWeight: "700", fontSize: 14 },
  btnDisabled: { opacity: 0.5 },
  reconciliationCard: { backgroundColor: "rgba(13,148,136,0.1)", borderRadius: 14, padding: 16, borderWidth: 1, borderColor: "rgba(13,148,136,0.3)" },
  reconciliationTitle: { fontSize: 16, fontWeight: "800", color: BRAND.teal, marginBottom: 12 },
  varianceRow: { borderTopWidth: 1, borderTopColor: "rgba(255,255,255,0.1)", paddingTop: 8, marginTop: 4 },
  varianceLabel: { fontSize: 14, fontWeight: "700", color: "#fff" },
  varianceValue: { fontSize: 14, fontWeight: "800" },
  statsRow: { flexDirection: "row", gap: 10 },
  statCard: { flex: 1, backgroundColor: "rgba(255,255,255,0.05)", borderRadius: 12, padding: 14, alignItems: "center", borderWidth: 1, borderColor: "rgba(255,255,255,0.1)" },
  statLabel: { fontSize: 10, color: "rgba(255,255,255,0.5)", marginBottom: 4 },
  statValue: { fontSize: 22, fontWeight: "800", color: "#fff" },
  statUnit: { fontSize: 10, color: "rgba(255,255,255,0.4)" },
  breakdownCard: { backgroundColor: "rgba(255,255,255,0.05)", borderRadius: 14, padding: 16, borderWidth: 1, borderColor: "rgba(255,255,255,0.1)" },
  breakdownTitle: { fontSize: 14, fontWeight: "700", color: "#fff", marginBottom: 12 },
  breakdownRow: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 6 },
  breakdownIcon: { fontSize: 18 },
  breakdownLabel: { flex: 1, fontSize: 13, color: "rgba(255,255,255,0.6)" },
  breakdownValue: { fontSize: 13, fontWeight: "600", color: "#fff" },
  topProductRow: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: "rgba(255,255,255,0.05)" },
  topProductRank: { width: 24, fontSize: 14, fontWeight: "800", color: BRAND.teal, textAlign: "center" },
  topProductName: { flex: 1, fontSize: 13, color: "#fff" },
  topProductQty: { fontSize: 11, color: "rgba(255,255,255,0.5)" },
  topProductRev: { fontSize: 13, fontWeight: "600", color: BRAND.teal },
});
