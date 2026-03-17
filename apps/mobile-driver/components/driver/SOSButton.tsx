import React, { useState } from "react";
import { View, Text, StyleSheet, Pressable, Modal, Alert } from "react-native";
import { useDriver } from "@/context/DriverContext";
import { hapticHeavy, hapticError } from "@/lib/haptics";
import type { SOSReport } from "@/types/driver";
import { BRAND } from "@cityos/mobile-core";

const SOS_TYPES: Array<{ type: SOSReport["type"]; label: string; icon: string }> = [
  { type: "accident", label: "Accident", icon: "🚗" },
  { type: "breakdown", label: "Breakdown", icon: "🔧" },
  { type: "threat", label: "Threat", icon: "⚠️" },
  { type: "medical", label: "Medical", icon: "🏥" },
  { type: "other", label: "Other", icon: "📞" },
];

export function SOSButton() {
  const { triggerSOS } = useDriver();
  const [showModal, setShowModal] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const handleSOS = async (type: SOSReport["type"]) => {
    hapticError();
    setIsSending(true);
    const result = await triggerSOS({ type });
    setIsSending(false);
    setShowModal(false);

    if (result) {
      Alert.alert(
        "SOS Sent",
        `Emergency alert dispatched (ID: ${result.sosId}). Estimated response: ${result.estimatedResponse}`,
        [{ text: "OK" }]
      );
    }
  };

  return (
    <>
      <Pressable
        style={styles.sosButton}
        onPress={() => { hapticHeavy(); setShowModal(true); }}
        onLongPress={() => handleSOS("accident")}
      >
        <Text style={styles.sosText}>SOS</Text>
      </Pressable>

      <Modal visible={showModal} transparent animationType="slide">
        <View style={styles.overlay}>
          <View style={styles.sheet}>
            <Text style={styles.sheetTitle}>Emergency Assistance</Text>
            <Text style={styles.sheetSubtitle}>Select the type of emergency</Text>

            {SOS_TYPES.map((item) => (
              <Pressable
                key={item.type}
                style={styles.sosOption}
                onPress={() => handleSOS(item.type)}
                disabled={isSending}
              >
                <Text style={styles.sosOptionIcon}>{item.icon}</Text>
                <Text style={styles.sosOptionLabel}>{item.label}</Text>
              </Pressable>
            ))}

            <Pressable style={styles.cancelBtn} onPress={() => setShowModal(false)}>
              <Text style={styles.cancelText}>Cancel</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  sosButton: { position: "absolute", bottom: 24, right: 16, width: 56, height: 56, borderRadius: 28, backgroundColor: "#dc2626", alignItems: "center", justifyContent: "center", elevation: 8, shadowColor: "#dc2626", shadowOpacity: 0.4, shadowRadius: 12, shadowOffset: { width: 0, height: 4 } },
  sosText: { color: "#fff", fontSize: 14, fontWeight: "900" },
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
  sheet: { backgroundColor: "#fff", borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, paddingBottom: 36 },
  sheetTitle: { fontSize: 20, fontWeight: "800", color: BRAND.navy, textAlign: "center", marginBottom: 4 },
  sheetSubtitle: { fontSize: 13, color: "#64748b", textAlign: "center", marginBottom: 20 },
  sosOption: { flexDirection: "row", alignItems: "center", gap: 14, paddingVertical: 14, paddingHorizontal: 16, backgroundColor: "#fef2f2", borderRadius: 12, marginBottom: 8, borderWidth: 1, borderColor: "#fecaca" },
  sosOptionIcon: { fontSize: 24 },
  sosOptionLabel: { fontSize: 16, fontWeight: "600", color: BRAND.navy },
  cancelBtn: { marginTop: 8, paddingVertical: 14, borderRadius: 12, backgroundColor: "#f1f5f9", alignItems: "center" },
  cancelText: { fontSize: 15, fontWeight: "600", color: "#64748b" },
});
