import React, { useState, useCallback } from "react";
import { View, Text, Pressable, StyleSheet, TextInput, Alert, ActivityIndicator } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { COLORS } from "@/constants/colors";
import { usePos } from "@/context/PosContext";

export default function ScannerScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { lookupBarcode, addToCart } = usePos();
  const [manualCode, setManualCode] = useState("");
  const [scanning, setScanning] = useState(false);
  const [lastScanned, setLastScanned] = useState<string | null>(null);

  const handleLookup = useCallback(async (code: string) => {
    if (!code.trim()) return;
    setScanning(true);
    try {
      const product = await lookupBarcode(code.trim());
      if (product) {
        addToCart(product);
        setLastScanned(product.name);
        setManualCode("");
        Alert.alert("Product Added", `${product.name} added to cart`, [{ text: "OK" }]);
      } else {
        Alert.alert("Not Found", `No product found for barcode: ${code}`);
      }
    } catch {
      Alert.alert("Error", "Failed to look up barcode");
    } finally {
      setScanning(false);
    }
  }, [lookupBarcode, addToCart]);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backIcon}>{"<"}</Text>
        </Pressable>
        <Text style={styles.title}>Barcode Scanner</Text>
      </View>

      <View style={styles.body}>
        <View style={styles.cameraPlaceholder}>
          <View style={styles.scanFrame}>
            <View style={[styles.corner, styles.topLeft]} />
            <View style={[styles.corner, styles.topRight]} />
            <View style={[styles.corner, styles.bottomLeft]} />
            <View style={[styles.corner, styles.bottomRight]} />
          </View>
          <Text style={styles.scanText}>Camera scanner preview</Text>
          <Text style={styles.scanSubtext}>Point at barcode to scan automatically</Text>
          <Text style={styles.scanNote}>Camera access requires device permissions</Text>
        </View>

        <View style={styles.manualSection}>
          <Text style={styles.manualTitle}>Manual Entry</Text>
          <View style={styles.manualRow}>
            <TextInput
              style={styles.manualInput}
              value={manualCode}
              onChangeText={setManualCode}
              placeholder="Enter barcode number..."
              placeholderTextColor={COLORS.textMuted}
              keyboardType="number-pad"
              onSubmitEditing={() => handleLookup(manualCode)}
            />
            <Pressable
              style={[styles.lookupBtn, scanning && styles.btnDisabled]}
              onPress={() => handleLookup(manualCode)}
              disabled={scanning}
            >
              {scanning ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.lookupBtnText}>Look Up</Text>
              )}
            </Pressable>
          </View>

          <Text style={styles.quickTitle}>Quick Scan (Sample Barcodes)</Text>
          <View style={styles.quickGrid}>
            {["8901234001", "8901234007", "8901234010", "8901234012", "8901234004", "8901234014"].map((code) => (
              <Pressable key={code} style={styles.quickBtn} onPress={() => handleLookup(code)}>
                <Text style={styles.quickBtnText}>{code}</Text>
              </Pressable>
            ))}
          </View>

          {lastScanned && (
            <View style={styles.lastScanned}>
              <Text style={styles.lastScannedLabel}>Last scanned:</Text>
              <Text style={styles.lastScannedValue}>{lastScanned}</Text>
            </View>
          )}
        </View>
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
  body: { flex: 1, padding: 16 },
  cameraPlaceholder: { height: 260, backgroundColor: "rgba(255,255,255,0.05)", borderRadius: 16, alignItems: "center", justifyContent: "center", marginBottom: 24, borderWidth: 1, borderColor: "rgba(255,255,255,0.1)" },
  scanFrame: { width: 200, height: 150, position: "relative", marginBottom: 16 },
  corner: { position: "absolute", width: 24, height: 24, borderColor: "#0d9488" },
  topLeft: { top: 0, left: 0, borderTopWidth: 3, borderLeftWidth: 3 },
  topRight: { top: 0, right: 0, borderTopWidth: 3, borderRightWidth: 3 },
  bottomLeft: { bottom: 0, left: 0, borderBottomWidth: 3, borderLeftWidth: 3 },
  bottomRight: { bottom: 0, right: 0, borderBottomWidth: 3, borderRightWidth: 3 },
  scanText: { fontSize: 14, fontWeight: "600", color: "rgba(255,255,255,0.6)" },
  scanSubtext: { fontSize: 12, color: "rgba(255,255,255,0.4)", marginTop: 4 },
  scanNote: { fontSize: 10, color: "rgba(255,255,255,0.3)", marginTop: 8, fontStyle: "italic" },
  manualSection: { backgroundColor: "rgba(255,255,255,0.05)", borderRadius: 16, padding: 16, borderWidth: 1, borderColor: "rgba(255,255,255,0.1)" },
  manualTitle: { fontSize: 16, fontWeight: "700", color: "#fff", marginBottom: 12 },
  manualRow: { flexDirection: "row", gap: 8, marginBottom: 20 },
  manualInput: { flex: 1, backgroundColor: "rgba(255,255,255,0.1)", borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, color: "#fff", borderWidth: 1, borderColor: "rgba(255,255,255,0.2)" },
  lookupBtn: { backgroundColor: "#0d9488", paddingHorizontal: 20, borderRadius: 10, justifyContent: "center" },
  lookupBtnText: { color: "#fff", fontWeight: "700", fontSize: 14 },
  btnDisabled: { opacity: 0.5 },
  quickTitle: { fontSize: 13, fontWeight: "600", color: "rgba(255,255,255,0.5)", marginBottom: 8 },
  quickGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  quickBtn: { paddingHorizontal: 12, paddingVertical: 8, backgroundColor: "rgba(255,255,255,0.1)", borderRadius: 8, borderWidth: 1, borderColor: "rgba(255,255,255,0.15)" },
  quickBtnText: { fontSize: 12, fontWeight: "600", color: "rgba(255,255,255,0.7)", fontFamily: "monospace" },
  lastScanned: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 16, paddingTop: 12, borderTopWidth: 1, borderTopColor: "rgba(255,255,255,0.1)" },
  lastScannedLabel: { fontSize: 12, color: "rgba(255,255,255,0.5)" },
  lastScannedValue: { fontSize: 14, fontWeight: "700", color: "#0d9488" },
});
