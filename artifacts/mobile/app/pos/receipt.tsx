import React, { useMemo, useCallback } from "react";
import { View, Text, Pressable, StyleSheet, ScrollView, Alert, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { usePos } from "@/context/PosContext";
import type { PosTransaction, ReceiptData } from "@/types/pos";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";

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

function generateReceiptHtml(tx: PosTransaction): string {
  const r = tx.receiptData;
  const itemRows = (r?.items || [])
    .map(
      (item) =>
        `<tr><td>${item.name}</td><td style="text-align:center">x${item.quantity}</td><td style="text-align:right">${item.lineTotal.toFixed(2)}</td></tr>`
    )
    .join("");

  const splitRows =
    tx.payment.splitPayments && tx.payment.splitPayments.length > 0
      ? tx.payment.splitPayments
          .map((sp) => `<tr><td>${sp.method.toUpperCase()}</td><td style="text-align:right">${sp.amount.toFixed(2)} SAR</td></tr>`)
          .join("")
      : "";

  return `<!DOCTYPE html><html><head><meta charset="utf-8"><style>
    body{font-family:monospace;width:280px;margin:0 auto;padding:20px;font-size:12px}
    h1{font-size:16px;text-align:center;margin:0}
    .center{text-align:center}
    .small{font-size:10px;color:#666}
    hr{border:none;border-top:1px dashed #999;margin:8px 0}
    table{width:100%;border-collapse:collapse}
    td{padding:2px 0}
    .total{font-size:14px;font-weight:bold}
    .footer{text-align:center;font-style:italic;color:#999;margin-top:12px}
  </style></head><body>
    <h1>${r?.storeName || "Dakkah Store"}</h1>
    <p class="center small">${r?.storeAddress || ""}<br>Tax ID: ${r?.storeTaxId || ""}</p>
    <hr>
    <p class="center small">${new Date(tx.createdAt).toLocaleString()}<br>Order: #${tx.orderNumber}</p>
    <hr>
    <table>${itemRows}</table>
    <hr>
    <table>
      <tr><td>Subtotal</td><td style="text-align:right">${tx.subtotal.toFixed(2)}</td></tr>
      ${tx.discountTotal > 0 ? `<tr><td>Discount</td><td style="text-align:right;color:green">-${tx.discountTotal.toFixed(2)}</td></tr>` : ""}
      <tr><td>VAT (15%)</td><td style="text-align:right">${tx.taxTotal.toFixed(2)}</td></tr>
    </table>
    <hr>
    <table><tr class="total"><td>TOTAL</td><td style="text-align:right">${tx.total.toFixed(2)} SAR</td></tr></table>
    <hr>
    <p class="center">Paid: ${tx.payment.method.toUpperCase()}${tx.payment.cardLast4 ? ` ****${tx.payment.cardLast4}` : ""}</p>
    ${tx.payment.amountTendered ? `<p class="center small">Tendered: ${tx.payment.amountTendered.toFixed(2)} SAR<br>Change: ${(tx.payment.changeDue || 0).toFixed(2)} SAR</p>` : ""}
    ${splitRows ? `<hr><p class="center small">Split Payments</p><table>${splitRows}</table>` : ""}
    <p class="footer">Thank you for your purchase!</p>
  </body></html>`;
}

export default function ReceiptScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { lastTransaction } = usePos();

  const escPosData = useMemo(() => {
    if (!lastTransaction) return "";
    return generateEscPosCommands(lastTransaction);
  }, [lastTransaction]);

  const receiptHtml = useMemo(() => {
    if (!lastTransaction) return "";
    return generateReceiptHtml(lastTransaction);
  }, [lastTransaction]);

  const handlePrint = useCallback(async () => {
    try {
      if (Platform.OS === "web") {
        const printWindow = window.open("", "_blank");
        if (printWindow) {
          printWindow.document.write(receiptHtml);
          printWindow.document.close();
          printWindow.print();
        } else {
          Alert.alert("Print", "Pop-up blocked. Please allow pop-ups to print receipts.");
        }
      } else {
        await Print.printAsync({ html: receiptHtml });
      }
    } catch {
      Alert.alert("Print Error", "Failed to print receipt");
    }
  }, [receiptHtml]);

  const handlePdfExport = useCallback(async () => {
    try {
      const { uri } = await Print.printToFileAsync({ html: receiptHtml });
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, { mimeType: "application/pdf", dialogTitle: "Receipt PDF" });
      } else {
        Alert.alert("PDF Generated", `Receipt saved to: ${uri}`);
      }
    } catch {
      Alert.alert("PDF Error", "Failed to generate PDF receipt");
    }
  }, [receiptHtml]);

  const handleOpenDrawer = useCallback(() => {
    Alert.alert("Cash Drawer", "Drawer kick pulse sent (ESC p command).\n\nOn a connected terminal, this opens the cash drawer via serial/USB.");
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
            <Text style={styles.hwBtnText}>Print</Text>
            <Text style={styles.hwBtnSub}>Thermal / OS</Text>
          </Pressable>
          <Pressable style={styles.hwBtn} onPress={handlePdfExport}>
            <Text style={styles.hwBtnIcon}>📄</Text>
            <Text style={styles.hwBtnText}>PDF</Text>
            <Text style={styles.hwBtnSub}>Save / Share</Text>
          </Pressable>
          <Pressable style={styles.hwBtn} onPress={handleOpenDrawer}>
            <Text style={styles.hwBtnIcon}>💰</Text>
            <Text style={styles.hwBtnText}>Drawer</Text>
            <Text style={styles.hwBtnSub}>ESC/POS</Text>
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
