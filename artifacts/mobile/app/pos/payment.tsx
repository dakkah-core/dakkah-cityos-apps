import React, { useState, useCallback } from "react";
import { View, Text, Pressable, StyleSheet, TextInput, Alert, ActivityIndicator, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { COLORS } from "@/constants/colors";
import { usePos } from "@/context/PosContext";
import type { PaymentMethod } from "@/types/pos";

interface SplitEntry {
  method: "cash" | "card" | "nfc";
  amount: string;
}

export default function PaymentScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { cart, checkout } = usePos();
  const [method, setMethod] = useState<PaymentMethod>("cash");
  const [cashTendered, setCashTendered] = useState("");
  const [processing, setProcessing] = useState(false);
  const [cardLast4, setCardLast4] = useState("");
  const [nfcSimulated, setNfcSimulated] = useState(false);
  const [splitEntries, setSplitEntries] = useState<SplitEntry[]>([
    { method: "cash", amount: "" },
    { method: "card", amount: "" },
  ]);

  const changeDue = method === "cash" && parseFloat(cashTendered) > cart.total
    ? Math.round((parseFloat(cashTendered) - cart.total) * 100) / 100
    : 0;

  const splitTotal = splitEntries.reduce((s, e) => s + (parseFloat(e.amount) || 0), 0);
  const splitRemaining = Math.round((cart.total - splitTotal) * 100) / 100;

  const canPay = method === "cash"
    ? parseFloat(cashTendered) >= cart.total
    : method === "card"
    ? cardLast4.length === 4
    : method === "nfc"
    ? nfcSimulated
    : method === "split"
    ? Math.abs(splitRemaining) < 0.01
    : false;

  const handlePay = useCallback(async () => {
    if (processing) return;
    setProcessing(true);
    try {
      if (method === "split") {
        const validSplits = splitEntries
          .filter((e) => parseFloat(e.amount) > 0)
          .map((e) => ({ method: e.method, amount: parseFloat(e.amount) }));
        await checkout({ method: "split", splitPayments: validSplits });
      } else {
        await checkout({
          method,
          ...(method === "cash" ? { amountTendered: parseFloat(cashTendered), changeDue } : {}),
          ...(method === "card" ? { cardLast4 } : {}),
          ...(method === "nfc" ? { nfcToken: `nfc-sim-${Date.now()}` } : {}),
        });
      }
      router.replace("/pos/receipt" as never);
    } catch {
      Alert.alert("Payment Failed", "Please try again");
    } finally {
      setProcessing(false);
    }
  }, [method, cashTendered, cardLast4, changeDue, checkout, processing, router, nfcSimulated, splitEntries]);

  const quickCashAmounts = [
    Math.ceil(cart.total / 5) * 5,
    Math.ceil(cart.total / 10) * 10,
    Math.ceil(cart.total / 50) * 50,
    Math.ceil(cart.total / 100) * 100,
  ].filter((v, i, a) => a.indexOf(v) === i && v >= cart.total).slice(0, 4);

  const addSplitEntry = () => {
    setSplitEntries((prev) => [...prev, { method: "cash", amount: "" }]);
  };

  const updateSplitEntry = (index: number, field: keyof SplitEntry, value: string) => {
    setSplitEntries((prev) =>
      prev.map((e, i) => (i === index ? { ...e, [field]: value } : e))
    );
  };

  const removeSplitEntry = (index: number) => {
    if (splitEntries.length <= 2) return;
    setSplitEntries((prev) => prev.filter((_, i) => i !== index));
  };

  if (cart.items.length === 0) {
    router.back();
    return null;
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backIcon}>{"<"}</Text>
        </Pressable>
        <Text style={styles.title}>Payment</Text>
      </View>

      <ScrollView style={styles.body} contentContainerStyle={styles.bodyContent}>
        <View style={styles.totalCard}>
          <Text style={styles.totalLabel}>Total Due</Text>
          <Text style={styles.totalAmount}>{cart.total.toFixed(2)} SAR</Text>
          <Text style={styles.totalItems}>{cart.items.reduce((s, i) => s + i.quantity, 0)} items</Text>
        </View>

        <Text style={styles.sectionTitle}>Payment Method</Text>
        <View style={styles.methodRow}>
          {([
            { key: "cash" as PaymentMethod, icon: "💵", label: "Cash" },
            { key: "card" as PaymentMethod, icon: "💳", label: "Card" },
            { key: "nfc" as PaymentMethod, icon: "📱", label: "NFC Tap" },
            { key: "split" as PaymentMethod, icon: "✂️", label: "Split" },
          ]).map((m) => (
            <Pressable
              key={m.key}
              style={[styles.methodCard, method === m.key && styles.methodActive]}
              onPress={() => setMethod(m.key)}
            >
              <Text style={styles.methodIcon}>{m.icon}</Text>
              <Text style={[styles.methodLabel, method === m.key && styles.methodLabelActive]}>{m.label}</Text>
            </Pressable>
          ))}
        </View>

        {method === "cash" && (
          <View style={styles.paymentDetail}>
            <Text style={styles.detailLabel}>Amount Tendered (SAR)</Text>
            <TextInput
              style={styles.cashInput}
              value={cashTendered}
              onChangeText={setCashTendered}
              placeholder="0.00"
              placeholderTextColor="rgba(255,255,255,0.3)"
              keyboardType="decimal-pad"
            />
            <View style={styles.quickCashRow}>
              {quickCashAmounts.map((amt) => (
                <Pressable key={amt} style={styles.quickCashBtn} onPress={() => setCashTendered(String(amt))}>
                  <Text style={styles.quickCashText}>{amt}</Text>
                </Pressable>
              ))}
            </View>
            {changeDue > 0 && (
              <View style={styles.changeBox}>
                <Text style={styles.changeLabel}>Change Due</Text>
                <Text style={styles.changeAmount}>{changeDue.toFixed(2)} SAR</Text>
              </View>
            )}
          </View>
        )}

        {method === "card" && (
          <View style={styles.paymentDetail}>
            <Text style={styles.detailLabel}>Card Terminal Simulation</Text>
            <View style={styles.cardSimBox}>
              <Text style={styles.cardSimIcon}>💳</Text>
              <Text style={styles.cardSimText}>Insert or swipe card</Text>
            </View>
            <Text style={styles.detailLabel}>Last 4 Digits</Text>
            <TextInput
              style={styles.cardInput}
              value={cardLast4}
              onChangeText={(t) => setCardLast4(t.replace(/\D/g, "").slice(0, 4))}
              placeholder="1234"
              placeholderTextColor="rgba(255,255,255,0.3)"
              keyboardType="number-pad"
              maxLength={4}
            />
          </View>
        )}

        {method === "nfc" && (
          <View style={styles.paymentDetail}>
            <Text style={styles.detailLabel}>NFC Contactless Payment</Text>
            <Pressable
              style={[styles.nfcSimBtn, nfcSimulated && styles.nfcSimDone]}
              onPress={() => {
                setNfcSimulated(true);
                Alert.alert("NFC Simulated", "Contactless payment detected");
              }}
            >
              <Text style={styles.nfcSimIcon}>{nfcSimulated ? "✅" : "📱"}</Text>
              <Text style={styles.nfcSimText}>
                {nfcSimulated ? "Payment Detected" : "Tap to Simulate NFC"}
              </Text>
            </Pressable>
          </View>
        )}

        {method === "split" && (
          <View style={styles.paymentDetail}>
            <Text style={styles.detailLabel}>Split Payment</Text>
            {splitEntries.map((entry, idx) => (
              <View key={idx} style={styles.splitRow}>
                <View style={styles.splitMethodPicker}>
                  {(["cash", "card", "nfc"] as const).map((m) => (
                    <Pressable
                      key={m}
                      style={[styles.splitMethodBtn, entry.method === m && styles.splitMethodActive]}
                      onPress={() => updateSplitEntry(idx, "method", m)}
                    >
                      <Text style={[styles.splitMethodText, entry.method === m && styles.splitMethodTextActive]}>
                        {m === "cash" ? "💵" : m === "card" ? "💳" : "📱"}
                      </Text>
                    </Pressable>
                  ))}
                </View>
                <TextInput
                  style={styles.splitAmountInput}
                  value={entry.amount}
                  onChangeText={(v) => updateSplitEntry(idx, "amount", v)}
                  placeholder="0.00"
                  placeholderTextColor="rgba(255,255,255,0.3)"
                  keyboardType="decimal-pad"
                />
                <Text style={styles.splitCurrency}>SAR</Text>
                {splitEntries.length > 2 && (
                  <Pressable onPress={() => removeSplitEntry(idx)}>
                    <Text style={styles.splitRemoveBtn}>✕</Text>
                  </Pressable>
                )}
              </View>
            ))}
            <Pressable style={styles.addSplitBtn} onPress={addSplitEntry}>
              <Text style={styles.addSplitText}>+ Add Payment</Text>
            </Pressable>
            <View style={[styles.splitRemainingBox, Math.abs(splitRemaining) < 0.01 && styles.splitBalanced]}>
              <Text style={styles.splitRemainingLabel}>
                {splitRemaining > 0.01 ? "Remaining" : splitRemaining < -0.01 ? "Over" : "Balanced"}
              </Text>
              <Text style={[styles.splitRemainingValue, Math.abs(splitRemaining) < 0.01 && styles.splitBalancedText]}>
                {Math.abs(splitRemaining).toFixed(2)} SAR
              </Text>
            </View>
          </View>
        )}
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <Pressable
          style={[styles.payBtn, (!canPay || processing) && styles.payBtnDisabled]}
          onPress={handlePay}
          disabled={!canPay || processing}
        >
          {processing ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.payBtnText}>
              Complete Payment - {cart.total.toFixed(2)} SAR
            </Text>
          )}
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0a1628" },
  header: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 12, gap: 12 },
  backBtn: { width: 36, height: 36, borderRadius: 10, backgroundColor: "rgba(255,255,255,0.15)", alignItems: "center", justifyContent: "center" },
  backIcon: { color: "#fff", fontSize: 18, fontWeight: "700" },
  title: { flex: 1, fontSize: 20, fontWeight: "800", color: "#fff" },
  body: { flex: 1 },
  bodyContent: { padding: 20 },
  totalCard: { backgroundColor: "rgba(13,148,136,0.15)", borderRadius: 16, padding: 24, alignItems: "center", marginBottom: 24, borderWidth: 1, borderColor: "rgba(13,148,136,0.3)" },
  totalLabel: { fontSize: 14, color: "rgba(255,255,255,0.6)", marginBottom: 4 },
  totalAmount: { fontSize: 36, fontWeight: "800", color: "#0d9488" },
  totalItems: { fontSize: 12, color: "rgba(255,255,255,0.5)", marginTop: 4 },
  sectionTitle: { fontSize: 14, fontWeight: "700", color: "rgba(255,255,255,0.6)", marginBottom: 12 },
  methodRow: { flexDirection: "row", gap: 10, marginBottom: 24 },
  methodCard: { flex: 1, backgroundColor: "rgba(255,255,255,0.05)", borderRadius: 14, padding: 14, alignItems: "center", borderWidth: 1, borderColor: "rgba(255,255,255,0.1)" },
  methodActive: { backgroundColor: "rgba(13,148,136,0.15)", borderColor: "#0d9488" },
  methodIcon: { fontSize: 24, marginBottom: 4 },
  methodLabel: { fontSize: 11, fontWeight: "600", color: "rgba(255,255,255,0.6)" },
  methodLabelActive: { color: "#0d9488" },
  paymentDetail: { backgroundColor: "rgba(255,255,255,0.05)", borderRadius: 14, padding: 16, borderWidth: 1, borderColor: "rgba(255,255,255,0.1)" },
  detailLabel: { fontSize: 12, fontWeight: "600", color: "rgba(255,255,255,0.5)", marginBottom: 8 },
  cashInput: { backgroundColor: "rgba(255,255,255,0.1)", borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, fontSize: 24, color: "#fff", textAlign: "center", marginBottom: 12, borderWidth: 1, borderColor: "rgba(255,255,255,0.15)" },
  quickCashRow: { flexDirection: "row", gap: 8, marginBottom: 12 },
  quickCashBtn: { flex: 1, backgroundColor: "rgba(255,255,255,0.1)", paddingVertical: 10, borderRadius: 8, alignItems: "center" },
  quickCashText: { color: "#fff", fontWeight: "700", fontSize: 14 },
  changeBox: { backgroundColor: "rgba(13,148,136,0.2)", borderRadius: 10, padding: 12, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  changeLabel: { fontSize: 14, color: "rgba(255,255,255,0.6)" },
  changeAmount: { fontSize: 20, fontWeight: "800", color: "#0d9488" },
  cardSimBox: { backgroundColor: "rgba(255,255,255,0.1)", borderRadius: 12, padding: 24, alignItems: "center", marginBottom: 16 },
  cardSimIcon: { fontSize: 32, marginBottom: 8 },
  cardSimText: { fontSize: 14, color: "rgba(255,255,255,0.5)" },
  cardInput: { backgroundColor: "rgba(255,255,255,0.1)", borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, fontSize: 24, color: "#fff", textAlign: "center", letterSpacing: 8, borderWidth: 1, borderColor: "rgba(255,255,255,0.15)" },
  nfcSimBtn: { backgroundColor: "rgba(255,255,255,0.1)", borderRadius: 14, padding: 32, alignItems: "center", borderWidth: 2, borderColor: "rgba(255,255,255,0.15)", borderStyle: "dashed" },
  nfcSimDone: { borderColor: "#0d9488", borderStyle: "solid", backgroundColor: "rgba(13,148,136,0.15)" },
  nfcSimIcon: { fontSize: 40, marginBottom: 8 },
  nfcSimText: { fontSize: 14, fontWeight: "600", color: "rgba(255,255,255,0.6)" },
  splitRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 10 },
  splitMethodPicker: { flexDirection: "row", gap: 4 },
  splitMethodBtn: { width: 36, height: 36, borderRadius: 8, backgroundColor: "rgba(255,255,255,0.08)", alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "rgba(255,255,255,0.1)" },
  splitMethodActive: { backgroundColor: "rgba(13,148,136,0.2)", borderColor: "#0d9488" },
  splitMethodText: { fontSize: 16 },
  splitMethodTextActive: {},
  splitAmountInput: { flex: 1, backgroundColor: "rgba(255,255,255,0.1)", borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, fontSize: 16, color: "#fff", textAlign: "right", borderWidth: 1, borderColor: "rgba(255,255,255,0.15)" },
  splitCurrency: { fontSize: 12, color: "rgba(255,255,255,0.4)", width: 30 },
  splitRemoveBtn: { fontSize: 16, color: "rgba(255,255,255,0.4)", paddingHorizontal: 4 },
  addSplitBtn: { alignSelf: "flex-start", paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, backgroundColor: "rgba(255,255,255,0.08)", marginBottom: 12, borderWidth: 1, borderColor: "rgba(255,255,255,0.1)" },
  addSplitText: { fontSize: 12, color: "rgba(255,255,255,0.5)", fontWeight: "600" },
  splitRemainingBox: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", backgroundColor: "rgba(217,119,6,0.15)", borderRadius: 10, padding: 12, borderWidth: 1, borderColor: "rgba(217,119,6,0.3)" },
  splitBalanced: { backgroundColor: "rgba(13,148,136,0.15)", borderColor: "rgba(13,148,136,0.3)" },
  splitRemainingLabel: { fontSize: 13, color: "rgba(255,255,255,0.6)" },
  splitRemainingValue: { fontSize: 16, fontWeight: "700", color: "#d97706" },
  splitBalancedText: { color: "#0d9488" },
  footer: { paddingHorizontal: 20, paddingTop: 12 },
  payBtn: { backgroundColor: "#0d9488", paddingVertical: 16, borderRadius: 14, alignItems: "center" },
  payBtnDisabled: { opacity: 0.4 },
  payBtnText: { color: "#fff", fontWeight: "700", fontSize: 16 },
});
