import React, { useState, useCallback } from "react";
import { View, Text, Pressable, StyleSheet, ScrollView, TextInput, Alert, ActivityIndicator } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { usePos } from "@/context/PosContext";
import { PosApi } from "@/lib/pos-api";
import { useAuth } from "@/context/AuthContext";
import { BRAND } from "@/constants/colors";

const RETURN_REASONS = [
  "Defective product",
  "Wrong item delivered",
  "Customer changed mind",
  "Quality issue",
  "Overcharged",
  "Other",
];

type FlowMode = "return" | "exchange";

export default function ReturnsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { products, addToCart } = usePos();
  const { getAccessToken } = useAuth();
  const [mode, setMode] = useState<FlowMode>("return");
  const [transactionId, setTransactionId] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
  const [quantity, setQuantity] = useState("1");
  const [reason, setReason] = useState("");
  const [refundMethod, setRefundMethod] = useState<"cash" | "store_credit" | "original_payment">("cash");
  const [exchangeProduct, setExchangeProduct] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [storeCreditId, setStoreCreditId] = useState<string | null>(null);
  const [refundedAmount, setRefundedAmount] = useState(0);

  const selectedProd = products.find((p) => p.id === selectedProduct);
  const exchangeProd = products.find((p) => p.id === exchangeProduct);
  const returnAmount = selectedProd ? selectedProd.price * parseInt(quantity || "1") : 0;
  const exchangeAmount = exchangeProd ? exchangeProd.price * parseInt(quantity || "1") : 0;
  const priceDifference = exchangeAmount - returnAmount;

  const handleSubmit = useCallback(async () => {
    if (!transactionId.trim() || !selectedProduct || !reason) {
      Alert.alert("Missing Info", "Please fill in all required fields");
      return;
    }
    if (mode === "exchange" && !exchangeProduct) {
      Alert.alert("Missing Info", "Please select a product to exchange for");
      return;
    }
    setProcessing(true);
    try {
      const token = await getAccessToken();
      const data = await PosApi.processReturn(
        {
          transactionId: transactionId.trim(),
          items: [{ productId: selectedProduct, quantity: parseInt(quantity || "1"), reason }],
          refundMethod: mode === "exchange" ? "store_credit" : refundMethod,
          refundAmount: returnAmount,
        },
        token
      );
      if (mode === "exchange" && exchangeProd) {
        addToCart(exchangeProd);
      }
      setCompleted(true);
      setRefundedAmount(returnAmount);
      if (data.storeCreditId) setStoreCreditId(data.storeCreditId);
    } catch (err) {
      Alert.alert("Error", err instanceof Error ? err.message : "Operation failed");
    } finally {
      setProcessing(false);
    }
  }, [transactionId, selectedProduct, quantity, reason, refundMethod, returnAmount, getAccessToken, mode, exchangeProduct, exchangeProd, addToCart]);

  if (completed) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.completedView}>
          <Text style={styles.completedIcon}>{mode === "exchange" ? "🔄" : "✅"}</Text>
          <Text style={styles.completedTitle}>
            {mode === "exchange" ? "Exchange Processed" : "Return Processed"}
          </Text>
          <Text style={styles.completedAmount}>
            {mode === "exchange" ? `Returned: ${refundedAmount.toFixed(2)} SAR` : `Refund: ${refundedAmount.toFixed(2)} SAR`}
          </Text>
          {mode === "exchange" && exchangeProd && (
            <Text style={styles.completedExchange}>
              New item: {exchangeProd.name} ({exchangeProd.price.toFixed(2)} SAR)
              {priceDifference > 0 ? `\nCustomer owes: ${priceDifference.toFixed(2)} SAR` : ""}
              {priceDifference < 0 ? `\nCredit: ${Math.abs(priceDifference).toFixed(2)} SAR` : ""}
            </Text>
          )}
          {mode === "return" && (
            <Text style={styles.completedMethod}>
              Via: {refundMethod === "cash" ? "Cash" : refundMethod === "store_credit" ? "Store Credit" : "Original Payment"}
            </Text>
          )}
          {storeCreditId && (
            <View style={styles.creditCard}>
              <Text style={styles.creditLabel}>Store Credit ID</Text>
              <Text style={styles.creditValue}>{storeCreditId}</Text>
            </View>
          )}
          <Pressable style={styles.doneBtn} onPress={() => router.back()}>
            <Text style={styles.doneBtnText}>Done</Text>
          </Pressable>
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
        <Text style={styles.title}>Returns & Exchanges</Text>
      </View>

      <View style={styles.modeToggle}>
        <Pressable
          style={[styles.modeBtn, mode === "return" && styles.modeBtnActive]}
          onPress={() => setMode("return")}
        >
          <Text style={[styles.modeBtnText, mode === "return" && styles.modeBtnTextActive]}>Return</Text>
        </Pressable>
        <Pressable
          style={[styles.modeBtn, mode === "exchange" && styles.modeBtnActive]}
          onPress={() => setMode("exchange")}
        >
          <Text style={[styles.modeBtnText, mode === "exchange" && styles.modeBtnTextActive]}>Exchange</Text>
        </Pressable>
      </View>

      <ScrollView style={styles.body} contentContainerStyle={styles.bodyContent}>
        <Text style={styles.fieldLabel}>Original Transaction ID</Text>
        <TextInput
          style={styles.fieldInput}
          value={transactionId}
          onChangeText={setTransactionId}
          placeholder="e.g. POS-1001"
          placeholderTextColor="rgba(255,255,255,0.3)"
        />

        <Text style={styles.fieldLabel}>Product to {mode === "exchange" ? "Exchange" : "Return"}</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.productScroll} contentContainerStyle={styles.productScrollContent}>
          {products.slice(0, 10).map((p) => (
            <Pressable
              key={p.id}
              style={[styles.productChip, selectedProduct === p.id && styles.productChipActive]}
              onPress={() => setSelectedProduct(p.id)}
            >
              <Text style={[styles.productChipText, selectedProduct === p.id && styles.productChipTextActive]}>{p.name}</Text>
              <Text style={styles.productChipPrice}>{p.price} SAR</Text>
            </Pressable>
          ))}
        </ScrollView>

        <Text style={styles.fieldLabel}>Quantity</Text>
        <View style={styles.qtyRow}>
          <Pressable style={styles.qtyBtn} onPress={() => setQuantity(String(Math.max(1, parseInt(quantity || "1") - 1)))}>
            <Text style={styles.qtyBtnText}>-</Text>
          </Pressable>
          <TextInput
            style={styles.qtyInput}
            value={quantity}
            onChangeText={setQuantity}
            keyboardType="number-pad"
          />
          <Pressable style={styles.qtyBtn} onPress={() => setQuantity(String(parseInt(quantity || "1") + 1))}>
            <Text style={styles.qtyBtnText}>+</Text>
          </Pressable>
        </View>

        <Text style={styles.fieldLabel}>Reason</Text>
        <View style={styles.reasonGrid}>
          {RETURN_REASONS.map((r) => (
            <Pressable
              key={r}
              style={[styles.reasonChip, reason === r && styles.reasonActive]}
              onPress={() => setReason(r)}
            >
              <Text style={[styles.reasonText, reason === r && styles.reasonTextActive]}>{r}</Text>
            </Pressable>
          ))}
        </View>

        {mode === "exchange" ? (
          <>
            <Text style={styles.fieldLabel}>Exchange For</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.productScroll} contentContainerStyle={styles.productScrollContent}>
              {products
                .filter((p) => p.id !== selectedProduct && p.available)
                .slice(0, 10)
                .map((p) => (
                  <Pressable
                    key={p.id}
                    style={[styles.productChip, exchangeProduct === p.id && styles.exchangeChipActive]}
                    onPress={() => setExchangeProduct(p.id)}
                  >
                    <Text style={[styles.productChipText, exchangeProduct === p.id && styles.exchangeChipTextActive]}>{p.name}</Text>
                    <Text style={styles.productChipPrice}>{p.price} SAR</Text>
                  </Pressable>
                ))}
            </ScrollView>

            {selectedProduct && exchangeProduct && (
              <View style={styles.exchangeSummary}>
                <View style={styles.exchangeRow}>
                  <Text style={styles.exchangeLabel}>Return value</Text>
                  <Text style={styles.exchangeValue}>{returnAmount.toFixed(2)} SAR</Text>
                </View>
                <View style={styles.exchangeRow}>
                  <Text style={styles.exchangeLabel}>New item</Text>
                  <Text style={styles.exchangeValue}>{exchangeAmount.toFixed(2)} SAR</Text>
                </View>
                <View style={[styles.exchangeRow, styles.exchangeDiffRow]}>
                  <Text style={styles.exchangeDiffLabel}>
                    {priceDifference > 0 ? "Customer pays" : priceDifference < 0 ? "Credit to customer" : "Even exchange"}
                  </Text>
                  <Text style={[styles.exchangeDiffValue, priceDifference <= 0 && styles.exchangeCredit]}>
                    {Math.abs(priceDifference).toFixed(2)} SAR
                  </Text>
                </View>
              </View>
            )}
          </>
        ) : (
          <>
            <Text style={styles.fieldLabel}>Refund Method</Text>
            <View style={styles.refundRow}>
              {([
                { key: "cash" as const, icon: "💵", label: "Cash" },
                { key: "store_credit" as const, icon: "🎫", label: "Store Credit" },
                { key: "original_payment" as const, icon: "↩️", label: "Original" },
              ]).map((m) => (
                <Pressable
                  key={m.key}
                  style={[styles.refundCard, refundMethod === m.key && styles.refundActive]}
                  onPress={() => setRefundMethod(m.key)}
                >
                  <Text style={styles.refundIcon}>{m.icon}</Text>
                  <Text style={[styles.refundLabel, refundMethod === m.key && styles.refundLabelActive]}>{m.label}</Text>
                </Pressable>
              ))}
            </View>

            {selectedProduct && (
              <View style={styles.refundSummary}>
                <Text style={styles.refundSumLabel}>Refund Amount</Text>
                <Text style={styles.refundSumValue}>{returnAmount.toFixed(2)} SAR</Text>
              </View>
            )}
          </>
        )}
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <Pressable
          style={[styles.processBtn, processing && styles.btnDisabled]}
          onPress={handleSubmit}
          disabled={processing}
        >
          {processing ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.processBtnText}>
              {mode === "exchange" ? "Process Exchange" : "Process Return"}
            </Text>
          )}
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BRAND.navy },
  header: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 12, gap: 12 },
  backBtn: { width: 36, height: 36, borderRadius: 10, backgroundColor: "rgba(255,255,255,0.15)", alignItems: "center", justifyContent: "center" },
  backIcon: { color: "#fff", fontSize: 18, fontWeight: "700" },
  title: { flex: 1, fontSize: 20, fontWeight: "800", color: "#fff" },
  modeToggle: { flexDirection: "row", marginHorizontal: 16, marginBottom: 8, backgroundColor: "rgba(255,255,255,0.05)", borderRadius: 10, padding: 3, borderWidth: 1, borderColor: "rgba(255,255,255,0.1)" },
  modeBtn: { flex: 1, paddingVertical: 8, alignItems: "center", borderRadius: 8 },
  modeBtnActive: { backgroundColor: "rgba(13,148,136,0.2)" },
  modeBtnText: { fontSize: 13, fontWeight: "600", color: "rgba(255,255,255,0.4)" },
  modeBtnTextActive: { color: BRAND.teal },
  body: { flex: 1 },
  bodyContent: { padding: 16, gap: 4, paddingBottom: 40 },
  fieldLabel: { fontSize: 12, fontWeight: "600", color: "rgba(255,255,255,0.5)", marginTop: 12 },
  fieldInput: { backgroundColor: "rgba(255,255,255,0.1)", borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, color: "#fff", borderWidth: 1, borderColor: "rgba(255,255,255,0.15)", marginTop: 6 },
  productScroll: { marginTop: 6 },
  productScrollContent: { gap: 8, paddingVertical: 4 },
  productChip: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 10, backgroundColor: "rgba(255,255,255,0.08)", borderWidth: 1, borderColor: "rgba(255,255,255,0.12)", alignItems: "center" },
  productChipActive: { backgroundColor: "rgba(13,148,136,0.2)", borderColor: BRAND.teal },
  productChipText: { fontSize: 12, fontWeight: "600", color: "rgba(255,255,255,0.6)" },
  productChipTextActive: { color: BRAND.teal },
  productChipPrice: { fontSize: 10, color: "rgba(255,255,255,0.4)", marginTop: 2 },
  exchangeChipActive: { backgroundColor: "rgba(49,130,206,0.2)", borderColor: BRAND.blue },
  exchangeChipTextActive: { color: BRAND.blue },
  qtyRow: { flexDirection: "row", alignItems: "center", gap: 12, marginTop: 6 },
  qtyBtn: { width: 40, height: 40, borderRadius: 10, backgroundColor: "rgba(255,255,255,0.1)", alignItems: "center", justifyContent: "center" },
  qtyBtnText: { color: "#fff", fontSize: 20, fontWeight: "700" },
  qtyInput: { width: 60, backgroundColor: "rgba(255,255,255,0.1)", borderRadius: 10, paddingVertical: 8, fontSize: 18, color: "#fff", textAlign: "center", borderWidth: 1, borderColor: "rgba(255,255,255,0.15)" },
  reasonGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 6 },
  reasonChip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, backgroundColor: "rgba(255,255,255,0.08)", borderWidth: 1, borderColor: "rgba(255,255,255,0.12)" },
  reasonActive: { backgroundColor: "rgba(217,119,6,0.2)", borderColor: BRAND.amber },
  reasonText: { fontSize: 12, color: "rgba(255,255,255,0.6)" },
  reasonTextActive: { color: BRAND.amber, fontWeight: "600" },
  refundRow: { flexDirection: "row", gap: 10, marginTop: 6 },
  refundCard: { flex: 1, padding: 14, borderRadius: 12, backgroundColor: "rgba(255,255,255,0.05)", alignItems: "center", borderWidth: 1, borderColor: "rgba(255,255,255,0.1)" },
  refundActive: { backgroundColor: "rgba(13,148,136,0.15)", borderColor: BRAND.teal },
  refundIcon: { fontSize: 20, marginBottom: 4 },
  refundLabel: { fontSize: 11, fontWeight: "600", color: "rgba(255,255,255,0.5)" },
  refundLabelActive: { color: BRAND.teal },
  refundSummary: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", backgroundColor: "rgba(13,148,136,0.15)", borderRadius: 12, padding: 16, marginTop: 16, borderWidth: 1, borderColor: "rgba(13,148,136,0.3)" },
  refundSumLabel: { fontSize: 14, color: "rgba(255,255,255,0.6)" },
  refundSumValue: { fontSize: 20, fontWeight: "800", color: BRAND.teal },
  exchangeSummary: { backgroundColor: "rgba(49,130,206,0.1)", borderRadius: 12, padding: 16, marginTop: 16, borderWidth: 1, borderColor: "rgba(49,130,206,0.25)" },
  exchangeRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 4 },
  exchangeLabel: { fontSize: 13, color: "rgba(255,255,255,0.6)" },
  exchangeValue: { fontSize: 13, fontWeight: "600", color: "rgba(255,255,255,0.8)" },
  exchangeDiffRow: { borderTopWidth: 1, borderTopColor: "rgba(255,255,255,0.1)", marginTop: 8, paddingTop: 8 },
  exchangeDiffLabel: { fontSize: 14, fontWeight: "600", color: "#fff" },
  exchangeDiffValue: { fontSize: 16, fontWeight: "800", color: BRAND.amber },
  exchangeCredit: { color: BRAND.teal },
  footer: { paddingHorizontal: 16, paddingTop: 12 },
  processBtn: { backgroundColor: BRAND.amber, paddingVertical: 16, borderRadius: 14, alignItems: "center" },
  processBtnText: { color: "#fff", fontWeight: "700", fontSize: 16 },
  btnDisabled: { opacity: 0.5 },
  completedView: { flex: 1, justifyContent: "center", alignItems: "center", padding: 32 },
  completedIcon: { fontSize: 56, marginBottom: 16 },
  completedTitle: { fontSize: 22, fontWeight: "800", color: "#fff", marginBottom: 8 },
  completedAmount: { fontSize: 18, fontWeight: "700", color: BRAND.teal, marginBottom: 4 },
  completedExchange: { fontSize: 14, color: "rgba(255,255,255,0.6)", textAlign: "center", marginBottom: 8, lineHeight: 20 },
  completedMethod: { fontSize: 14, color: "rgba(255,255,255,0.5)", marginBottom: 20 },
  creditCard: { backgroundColor: "rgba(255,255,255,0.1)", borderRadius: 10, padding: 14, alignItems: "center", marginBottom: 20, width: "100%" },
  creditLabel: { fontSize: 11, color: "rgba(255,255,255,0.5)" },
  creditValue: { fontSize: 16, fontWeight: "700", color: BRAND.amber, marginTop: 4, fontFamily: "monospace" },
  doneBtn: { backgroundColor: BRAND.blue, paddingHorizontal: 40, paddingVertical: 14, borderRadius: 12 },
  doneBtnText: { color: "#fff", fontWeight: "700", fontSize: 16 },
});
