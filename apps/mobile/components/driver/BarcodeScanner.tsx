import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Pressable, Platform, Modal, Alert } from "react-native";
import { COLORS, BRAND } from "@/constants/colors";

interface BarcodeScannerProps {
  expectedBarcodes: string[];
  scannedBarcodes: string[];
  onScan: (barcode: string) => void;
  onClose: () => void;
  visible: boolean;
}

export function BarcodeScanner({ expectedBarcodes, scannedBarcodes, onScan, onClose, visible }: BarcodeScannerProps) {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [CameraComponent, setCameraComponent] = useState<React.ComponentType<any> | null>(null);

  useEffect(() => {
    if (!visible) return;

    (async () => {
      if (Platform.OS === "web") {
        setHasPermission(false);
        return;
      }

      try {
        const cameraModule = await import("expo-camera");
        const { status } = await cameraModule.Camera.requestCameraPermissionsAsync();
        setHasPermission(status === "granted");
        if (status === "granted") {
          setCameraComponent(() => cameraModule.CameraView);
        }
      } catch {
        setHasPermission(false);
      }
    })();
  }, [visible]);

  const handleBarcodeScanned = ({ data }: { data: string }) => {
    if (expectedBarcodes.includes(data) && !scannedBarcodes.includes(data)) {
      onScan(data);
    }
  };

  const remaining = expectedBarcodes.filter((b) => !scannedBarcodes.includes(b));

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Scan Items</Text>
          <Pressable style={styles.closeBtn} onPress={onClose}>
            <Text style={styles.closeBtnText}>Done</Text>
          </Pressable>
        </View>

        <View style={styles.statusBar}>
          <Text style={styles.statusText}>
            {scannedBarcodes.length}/{expectedBarcodes.length} items scanned
          </Text>
          {remaining.length === 0 && (
            <Text style={styles.allDoneText}>All items verified ✓</Text>
          )}
        </View>

        {hasPermission && CameraComponent ? (
          <View style={styles.cameraWrap}>
            <CameraComponent
              style={styles.camera}
              facing="back"
              barcodeScannerSettings={{ barcodeTypes: ["qr", "ean13", "ean8", "code128", "code39"] }}
              onBarcodeScanned={handleBarcodeScanned}
            />
            <View style={styles.overlay}>
              <View style={styles.scanFrame} />
            </View>
          </View>
        ) : (
          <View style={styles.manualScanWrap}>
            <Text style={styles.manualTitle}>
              {Platform.OS === "web" ? "Camera not available in web preview" : "Camera permission required"}
            </Text>
            <Text style={styles.manualSubtitle}>Tap items below to verify manually</Text>
          </View>
        )}

        <View style={styles.itemList}>
          {expectedBarcodes.map((barcode) => {
            const isScanned = scannedBarcodes.includes(barcode);
            return (
              <Pressable
                key={barcode}
                style={[styles.itemRow, isScanned && styles.itemRowScanned]}
                onPress={() => {
                  if (!isScanned) {
                    onScan(barcode);
                  }
                }}
                disabled={isScanned}
              >
                <View style={[styles.itemDot, isScanned && styles.itemDotScanned]}>
                  <Text style={styles.itemDotText}>{isScanned ? "✓" : "•"}</Text>
                </View>
                <Text style={[styles.itemBarcode, isScanned && styles.itemBarcodeScanned]}>{barcode}</Text>
                {!isScanned && <Text style={styles.tapHint}>Tap to scan</Text>}
              </Pressable>
            );
          })}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.surface },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingTop: 56, paddingBottom: 12, backgroundColor: BRAND.navy },
  headerTitle: { fontSize: 18, fontWeight: "700", color: "#fff" },
  closeBtn: { paddingHorizontal: 16, paddingVertical: 8, backgroundColor: "rgba(255,255,255,0.15)", borderRadius: 8 },
  closeBtnText: { color: "#fff", fontWeight: "600", fontSize: 14 },
  statusBar: { backgroundColor: COLORS.surfaceWhite, paddingHorizontal: 16, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: COLORS.border, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  statusText: { fontSize: 14, fontWeight: "600", color: COLORS.text },
  allDoneText: { fontSize: 13, fontWeight: "600", color: "#059669" },
  cameraWrap: { height: 250, position: "relative" },
  camera: { flex: 1 },
  overlay: { ...StyleSheet.absoluteFillObject, alignItems: "center", justifyContent: "center" },
  scanFrame: { width: 200, height: 200, borderWidth: 2, borderColor: BRAND.blue, borderRadius: 12, opacity: 0.7 },
  manualScanWrap: { height: 150, backgroundColor: "#1e293b", alignItems: "center", justifyContent: "center", gap: 8 },
  manualTitle: { fontSize: 14, color: "#94a3b8", fontWeight: "600" },
  manualSubtitle: { fontSize: 12, color: "#64748b" },
  itemList: { flex: 1, padding: 16, gap: 8 },
  itemRow: { flexDirection: "row", alignItems: "center", gap: 12, padding: 14, backgroundColor: COLORS.surfaceWhite, borderRadius: 10, borderWidth: 1, borderColor: COLORS.border },
  itemRowScanned: { backgroundColor: "#ecfdf5", borderColor: "#34d399" },
  itemDot: { width: 28, height: 28, borderRadius: 14, backgroundColor: COLORS.border, alignItems: "center", justifyContent: "center" },
  itemDotScanned: { backgroundColor: "#059669" },
  itemDotText: { color: "#fff", fontWeight: "700", fontSize: 14 },
  itemBarcode: { flex: 1, fontSize: 13, fontWeight: "500", color: COLORS.text, fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace" },
  itemBarcodeScanned: { color: "#059669", textDecorationLine: "line-through" },
  tapHint: { fontSize: 11, color: BRAND.blue, fontWeight: "500" },
});
