import React, { useState, useCallback } from "react";
import { View, Text, Pressable, StyleSheet, TextInput, Alert, ActivityIndicator, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { COLORS } from "@/constants/colors";
import { usePos } from "@/context/PosContext";
import type { PaymentMethod } from "@/types/pos";

export default function PaymentScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { cart, checkout } = usePos();
  const [method, setMethod] = useState<PaymentMethod>("cash");
  const [cashTendered, setCashTendered] = useState("");
  const [processing, setProcessing] = useState(false);
  const [cardLast4, setCardLast4] = useState("");
  const [nfcSimulated, setNfcSimulated] = useState(false);

  const changeDue = method === "cash" && parseFloat(cashTendered) > cart.total
    ? Math.round((parseFloat(cashTendered) - cart.total) * 100) / 100
    : 0;

  const canPay = method === "cash"
    ? parseFloat(cashTendered) >= cart.total
    : method === "card"
    ? cardLast4.length === 4
    : method === "nfc"
    ? nfcSimulated
    : false;

  const handlePay = useCallback(async () => {
    if (processing) return;
    setProcessing(true);
    try {
      await checkout({
        method,
        ...(method === "cash" ? { amountTendered: parseFloat(cashTendered), changeDue } : {}),
        ...(method === "card" ? { cardLast4 } : {}),
        ...(method === "nfc" ? { nfcToken: `nfc-sim-${Date.now()}` } : {}),
      });
      router.replace("/pos/receipt" as never);
    } catch (err) {
      Alert.alert("Payment Failed", "Please try again");
    } finally {
      setProcessing(false);
    }
  }, [method, cashTendered, cardLast4, changeDue, checkout, processing, router, nfcSimulated]);

  const quickCashAmounts = [
    Math.ceil(cart.total / 5) * 5,
    Math.ceil(cart.total / 10) * 10,
    Math.ceil(cart.total / 50) * 50,
    Math.ceil(cart.total / 100) * 100,
  ].filter((v, i, a) => a.indexOf(v) === i && v >= cart.total).slice(0, 4);

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
  methodRow: { flexDirection: "row", gap: 12, marginBottom: 24 },
  methodCard: { flex: 1, backgroundColor: "rgba(255,255,255,0.05)", borderRadius: 14, padding: 16, alignItems: "center", borderWidth: 1, borderColor: "rgba(255,255,255,0.1)" },
  methodActive: { backgroundColor: "rgba(13,148,136,0.15)", borderColor: "#0d9488" },
  methodIcon: { fontSize: 28, marginBottom: 6 },
  methodLabel: { fontSize: 13, fontWeight: "600", color: "rgba(255,255,255,0.6)" },
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
  footer: { paddingHorizontal: 20, paddingTop: 12 },
  payBtn: { backgroundColor: "#0d9488", paddingVertical: 16, borderRadius: 14, alignItems: "center" },
  payBtnDisabled: { opacity: 0.4 },
  payBtnText: { color: "#fff", fontWeight: "700", fontSize: 16 },
});
