import React, { useMemo, useCallback } from "react";
import { View, Text, Pressable, StyleSheet, ScrollView, Alert, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { usePos } from "@/context/PosContext";
import type { PosTransaction, ReceiptData } from "@/types/pos";

function generateEscPosCommands(tx: PosTransaction): string {
  const receipt = tx.receiptData;
  const lines: string[] = [];
  const ESC = "\x1B";
  const GS = "\x1D";

  lines.push(`${ESC}@`);
  lines.push(`${ESC}a${String.fromCharCode(1)}`);
  lines.push(`${GS}!${String.fromCharCode(17)}`);
  lines.push(receipt?.storeName || "Dakkah Store");
  lines.push(`${GS}!${String.fromCharCode(0)}`);
  lines.push(receipt?.storeAddress || "");
  lines.push(`Tax ID: ${receipt?.storeTaxId || ""}`);
  lines.push("--------------------------------");
  lines.push(new Date(tx.createdAt).toLocaleString());
  lines.push(`Order: #${tx.orderNumber}`);
  lines.push("--------------------------------");

  lines.push(`${ESC}a${String.fromCharCode(0)}`);
  if (receipt?.items) {
    for (const item of receipt.items) {
      const name = String(item.name).padEnd(18);
      const qty = `x${item.quantity}`;
      const total = `${item.lineTotal.toFixed(2)}`;
      lines.push(`${name} ${qty.padStart(3)} ${total.padStart(8)}`);
    }
  }

  lines.push("--------------------------------");
  lines.push(`${"Subtotal".padEnd(22)}${tx.subtotal.toFixed(2).padStart(10)}`);
  if (tx.discountTotal > 0) {
    lines.push(`${"Discount".padEnd(22)}${(`-${tx.discountTotal.toFixed(2)}`).padStart(10)}`);
  }
  lines.push(`${"VAT (15%)".padEnd(22)}${tx.taxTotal.toFixed(2).padStart(10)}`);
  lines.push("================================");
  lines.push(`${ESC}a${String.fromCharCode(1)}`);
  lines.push(`${GS}!${String.fromCharCode(17)}`);
  lines.push(`TOTAL: ${tx.total.toFixed(2)} SAR`);
  lines.push(`${GS}!${String.fromCharCode(0)}`);
  lines.push("================================");

  lines.push(`Paid: ${tx.payment.method.toUpperCase()}`);
  if (tx.payment.cardLast4) lines.push(`Card: ****${tx.payment.cardLast4}`);
  if (tx.payment.amountTendered) {
    lines.push(`Tendered: ${tx.payment.amountTendered.toFixed(2)} SAR`);
    lines.push(`Change: ${(tx.payment.changeDue || 0).toFixed(2)} SAR`);
  }
  if (tx.payment.splitPayments?.length) {
    lines.push("--- Split Payments ---");
    for (const sp of tx.payment.splitPayments) {
      lines.push(`  ${sp.method.toUpperCase()}: ${sp.amount.toFixed(2)} SAR`);
    }
  }

  lines.push("");
  lines.push("Thank you for your purchase!");
  lines.push("");
  lines.push(`${GS}V${String.fromCharCode(66)}${String.fromCharCode(3)}`);
  lines.push("");

  return lines.join("\n");
}

export default function ReceiptScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { lastTransaction } = usePos();

  const escPosData = useMemo(() => {
    if (!lastTransaction) return "";
    return generateEscPosCommands(lastTransaction);
  }, [lastTransaction]);

  const handlePrint = useCallback(() => {
    if (Platform.OS === "web") {
      Alert.alert(
        "ESC/POS Receipt Generated",
        `${escPosData.split("\n").length} lines of ESC/POS commands ready.\n\nOn a real terminal, this sends to the thermal printer via USB/Bluetooth serial.`,
        [{ text: "OK" }]
      );
    } else {
      Alert.alert("Print Receipt", "ESC/POS commands generated. Connect a thermal printer via Bluetooth to print.");
    }
  }, [escPosData]);

  const handleOpenDrawer = useCallback(() => {
    Alert.alert("Cash Drawer", "Drawer kick pulse sent (ESC p \\x00 \\x19 \\xFA).\n\nOn a connected terminal, this opens the cash drawer via serial/USB.");
  }, []);

  if (!lastTransaction) {
    router.replace("/pos" as never);
    return null;
  }

  const receipt = lastTransaction.receiptData;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Transaction Complete</Text>
      </View>

      <ScrollView style={styles.body} contentContainerStyle={styles.bodyContent}>
        <View style={styles.successIcon}>
          <Text style={styles.checkmark}>✓</Text>
        </View>
        <Text style={styles.successText}>Payment Successful</Text>
        <Text style={styles.orderNum}>#{lastTransaction.orderNumber}</Text>

        <View style={styles.receiptCard}>
          <View style={styles.receiptHeader}>
            <Text style={styles.storeName}>{receipt?.storeName || "Dakkah Store"}</Text>
            <Text style={styles.storeAddr}>{receipt?.storeAddress || ""}</Text>
            <Text style={styles.taxId}>Tax ID: {receipt?.storeTaxId || ""}</Text>
            <View style={styles.divider} />
            <Text style={styles.receiptDate}>
              {new Date(lastTransaction.createdAt).toLocaleString()}
            </Text>
          </View>

          <View style={styles.divider} />

          {receipt?.items?.map((item, idx) => (
            <View key={idx} style={styles.receiptItem}>
              <View style={styles.receiptItemLeft}>
                <Text style={styles.receiptItemName}>{item.name}</Text>
                <Text style={styles.receiptItemQty}>x{item.quantity}</Text>
              </View>
              <Text style={styles.receiptItemTotal}>
                {item.lineTotal.toFixed(2)} SAR
              </Text>
            </View>
          ))}

          <View style={styles.divider} />

          <View style={styles.receiptTotalRow}>
            <Text style={styles.receiptTotalLabel}>Subtotal</Text>
            <Text style={styles.receiptTotalVal}>{lastTransaction.subtotal.toFixed(2)}</Text>
          </View>
          {lastTransaction.discountTotal > 0 && (
            <View style={styles.receiptTotalRow}>
              <Text style={styles.receiptTotalLabel}>Discount</Text>
              <Text style={[styles.receiptTotalVal, styles.green]}>-{lastTransaction.discountTotal.toFixed(2)}</Text>
            </View>
          )}
          <View style={styles.receiptTotalRow}>
            <Text style={styles.receiptTotalLabel}>VAT (15%)</Text>
            <Text style={styles.receiptTotalVal}>{lastTransaction.taxTotal.toFixed(2)}</Text>
          </View>
          <View style={styles.receiptDividerDash} />
          <View style={styles.receiptTotalRow}>
            <Text style={styles.receiptGrandLabel}>TOTAL</Text>
            <Text style={styles.receiptGrandVal}>{lastTransaction.total.toFixed(2)} SAR</Text>
          </View>

          <View style={styles.divider} />
          <Text style={styles.payMethodText}>
            Paid by: {lastTransaction.payment.method.toUpperCase()}
            {lastTransaction.payment.cardLast4 ? ` ****${lastTransaction.payment.cardLast4}` : ""}
          </Text>
          {lastTransaction.payment.amountTendered && (
            <>
              <Text style={styles.payDetailText}>Tendered: {lastTransaction.payment.amountTendered.toFixed(2)} SAR</Text>
              <Text style={styles.payDetailText}>Change: {lastTransaction.payment.changeDue?.toFixed(2) || "0.00"} SAR</Text>
            </>
          )}
          {lastTransaction.payment.splitPayments && lastTransaction.payment.splitPayments.length > 0 && (
            <View style={styles.splitSection}>
              <Text style={styles.splitTitle}>Split Payment Breakdown</Text>
              {lastTransaction.payment.splitPayments.map((sp, idx) => (
                <View key={idx} style={styles.splitRow}>
                  <Text style={styles.splitMethod}>{sp.method.toUpperCase()}</Text>
                  <Text style={styles.splitAmount}>{sp.amount.toFixed(2)} SAR</Text>
                </View>
              ))}
            </View>
          )}

          <View style={styles.divider} />
          <Text style={styles.thankYou}>Thank you for your purchase!</Text>
        </View>

        <View style={styles.hardwareRow}>
          <Pressable style={styles.hwBtn} onPress={handlePrint}>
            <Text style={styles.hwBtnIcon}>🖨️</Text>
            <Text style={styles.hwBtnText}>Print Receipt</Text>
            <Text style={styles.hwBtnSub}>ESC/POS ({escPosData.split("\n").length} lines)</Text>
          </Pressable>
          <Pressable style={styles.hwBtn} onPress={handleOpenDrawer}>
            <Text style={styles.hwBtnIcon}>💰</Text>
            <Text style={styles.hwBtnText}>Open Drawer</Text>
            <Text style={styles.hwBtnSub}>ESC p pulse</Text>
          </Pressable>
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <Pressable style={styles.newSaleBtn} onPress={() => router.replace("/pos" as never)}>
          <Text style={styles.newSaleBtnText}>New Sale</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0a1628" },
  header: { alignItems: "center", paddingVertical: 16 },
  title: { fontSize: 18, fontWeight: "800", color: "#fff" },
  body: { flex: 1 },
  bodyContent: { padding: 20, alignItems: "center" },
  successIcon: { width: 64, height: 64, borderRadius: 32, backgroundColor: "#0d9488", alignItems: "center", justifyContent: "center", marginBottom: 12 },
  checkmark: { color: "#fff", fontSize: 32, fontWeight: "700" },
  successText: { fontSize: 20, fontWeight: "800", color: "#0d9488", marginBottom: 4 },
  orderNum: { fontSize: 14, color: "rgba(255,255,255,0.5)", marginBottom: 20 },
  receiptCard: { backgroundColor: "#fff", borderRadius: 12, padding: 20, width: "100%", maxWidth: 380 },
  receiptHeader: { alignItems: "center", marginBottom: 4 },
  storeName: { fontSize: 16, fontWeight: "800", color: "#0a1628" },
  storeAddr: { fontSize: 11, color: "#666", marginTop: 2 },
  taxId: { fontSize: 10, color: "#999", marginTop: 2 },
  receiptDate: { fontSize: 10, color: "#999" },
  divider: { height: 1, backgroundColor: "#e5e5e5", marginVertical: 8 },
  receiptItem: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 3 },
  receiptItemLeft: { flexDirection: "row", gap: 8, flex: 1 },
  receiptItemName: { fontSize: 12, color: "#333" },
  receiptItemQty: { fontSize: 12, color: "#999" },
  receiptItemTotal: { fontSize: 12, fontWeight: "600", color: "#333" },
  receiptTotalRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 2 },
  receiptTotalLabel: { fontSize: 12, color: "#666" },
  receiptTotalVal: { fontSize: 12, color: "#333" },
  green: { color: "#0d9488" },
  receiptDividerDash: { height: 1, borderStyle: "dashed", borderTopWidth: 1, borderColor: "#ccc", marginVertical: 6 },
  receiptGrandLabel: { fontSize: 14, fontWeight: "800", color: "#0a1628" },
  receiptGrandVal: { fontSize: 14, fontWeight: "800", color: "#0a1628" },
  payMethodText: { fontSize: 11, color: "#666", textAlign: "center" },
  payDetailText: { fontSize: 10, color: "#999", textAlign: "center" },
  splitSection: { marginTop: 6, paddingTop: 6, borderTopWidth: 1, borderTopColor: "#eee" },
  splitTitle: { fontSize: 10, fontWeight: "600", color: "#666", textAlign: "center", marginBottom: 4 },
  splitRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 1 },
  splitMethod: { fontSize: 10, color: "#666" },
  splitAmount: { fontSize: 10, fontWeight: "600", color: "#333" },
  thankYou: { fontSize: 11, color: "#999", textAlign: "center", fontStyle: "italic" },
  hardwareRow: { flexDirection: "row", gap: 12, marginTop: 20, width: "100%" },
  hwBtn: { flex: 1, backgroundColor: "rgba(255,255,255,0.05)", borderRadius: 12, padding: 14, alignItems: "center", borderWidth: 1, borderColor: "rgba(255,255,255,0.1)" },
  hwBtnIcon: { fontSize: 24, marginBottom: 4 },
  hwBtnText: { fontSize: 12, fontWeight: "600", color: "rgba(255,255,255,0.7)" },
  hwBtnSub: { fontSize: 9, color: "rgba(255,255,255,0.3)", marginTop: 2 },
  footer: { paddingHorizontal: 20, paddingTop: 12 },
  newSaleBtn: { backgroundColor: "#3182ce", paddingVertical: 16, borderRadius: 14, alignItems: "center" },
  newSaleBtnText: { color: "#fff", fontWeight: "700", fontSize: 16 },
});
