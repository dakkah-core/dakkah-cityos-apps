import React, { useState } from "react";
import { View, Text, StyleSheet, Pressable, ScrollView, Alert, ActivityIndicator } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { COLORS } from "@/constants/colors";
import { useDriver } from "@/context/DriverContext";
import type { InspectionCheck, InspectionResult } from "@/types/driver";

const INSPECTION_ITEMS = [
  { id: "tires", label: "Tires — pressure and tread" },
  { id: "brakes", label: "Brakes — responsive, no noise" },
  { id: "lights", label: "Lights — headlights, indicators, brake lights" },
  { id: "mirrors", label: "Mirrors — clean and adjusted" },
  { id: "seatbelt", label: "Seatbelt — functional" },
  { id: "horn", label: "Horn — working" },
  { id: "fuel", label: "Fuel — sufficient level" },
  { id: "oil", label: "Oil — no leaks, normal level" },
  { id: "coolant", label: "Coolant — normal level" },
  { id: "wipers", label: "Wipers — operational, fluid filled" },
  { id: "cargo_area", label: "Cargo area — clean and secure" },
  { id: "fire_extinguisher", label: "Fire extinguisher — present and charged" },
];

export default function InspectionScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { submitInspection } = useDriver();
  const [checks, setChecks] = useState<Record<string, boolean | null>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<InspectionResult | null>(null);

  const toggleCheck = (id: string, passed: boolean) => {
    setChecks((prev) => ({ ...prev, [id]: passed }));
  };

  const allChecked = INSPECTION_ITEMS.every((item) => checks[item.id] !== undefined && checks[item.id] !== null);

  const handleSubmit = async () => {
    if (!allChecked) {
      Alert.alert("Incomplete", "Please check all items before submitting.");
      return;
    }

    setIsSubmitting(true);
    const inspectionChecks: InspectionCheck[] = INSPECTION_ITEMS.map((item) => ({
      item: item.label,
      passed: checks[item.id] === true,
    }));

    const inspResult = await submitInspection("VEH-001", inspectionChecks);
    setResult(inspResult);
    setIsSubmitting(false);
  };

  if (result) {
    return (
      <View style={styles.container}>
        <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
          <Pressable style={styles.headerBackBtn} onPress={() => router.back()}>
            <Text style={styles.headerBackText}>←</Text>
          </Pressable>
          <Text style={styles.headerTitle}>Inspection Result</Text>
          <View style={{ width: 36 }} />
        </View>
        <View style={[styles.resultCard, result.allPassed ? styles.resultPass : styles.resultFail]}>
          <Text style={styles.resultIcon}>{result.allPassed ? "✅" : "⚠️"}</Text>
          <Text style={styles.resultTitle}>{result.allPassed ? "Vehicle Ready" : "Issues Found"}</Text>
          <Text style={styles.resultSubtitle}>
            {result.allPassed
              ? "All checks passed. You're good to drive!"
              : `${result.failedItems.length} item(s) need attention`}
          </Text>
          {result.failedItems.length > 0 && (
            <View style={styles.failedList}>
              {result.failedItems.map((item, i) => (
                <Text key={i} style={styles.failedItem}>• {item}</Text>
              ))}
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
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <Pressable style={styles.headerBackBtn} onPress={() => router.back()}>
          <Text style={styles.headerBackText}>←</Text>
        </Pressable>
        <Text style={styles.headerTitle}>Vehicle Inspection</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView style={styles.content}>
        <Text style={styles.subtitle}>Check each item and mark as pass or fail</Text>

        {INSPECTION_ITEMS.map((item) => (
          <View key={item.id} style={styles.checkRow}>
            <Text style={styles.checkLabel}>{item.label}</Text>
            <View style={styles.checkButtons}>
              <Pressable
                style={[styles.checkBtn, checks[item.id] === true && styles.checkBtnPass]}
                onPress={() => toggleCheck(item.id, true)}
              >
                <Text style={[styles.checkBtnText, checks[item.id] === true && styles.checkBtnTextActive]}>✓</Text>
              </Pressable>
              <Pressable
                style={[styles.checkBtn, checks[item.id] === false && styles.checkBtnFail]}
                onPress={() => toggleCheck(item.id, false)}
              >
                <Text style={[styles.checkBtnText, checks[item.id] === false && styles.checkBtnTextActive]}>✗</Text>
              </Pressable>
            </View>
          </View>
        ))}

        <View style={{ height: 80 }} />
      </ScrollView>

      <View style={[styles.actionBar, { paddingBottom: Math.max(insets.bottom, 12) }]}>
        {isSubmitting ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <Pressable style={[styles.submitBtn, !allChecked && styles.submitBtnDisabled]} onPress={handleSubmit} disabled={!allChecked}>
            <Text style={styles.submitBtnText}>Submit Inspection</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.surface },
  header: { backgroundColor: "#0a1628", paddingBottom: 12, paddingHorizontal: 16, flexDirection: "row", alignItems: "center" },
  headerBackBtn: { width: 36, height: 36, borderRadius: 10, backgroundColor: "rgba(255,255,255,0.1)", alignItems: "center", justifyContent: "center" },
  headerBackText: { color: "#fff", fontSize: 20 },
  headerTitle: { flex: 1, fontSize: 18, fontWeight: "700", color: "#fff", textAlign: "center" },
  subtitle: { fontSize: 13, color: COLORS.textSecondary, paddingHorizontal: 16, paddingVertical: 12 },
  content: { flex: 1 },
  checkRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 14, backgroundColor: COLORS.surfaceWhite, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  checkLabel: { flex: 1, fontSize: 14, color: COLORS.text, marginRight: 10 },
  checkButtons: { flexDirection: "row", gap: 8 },
  checkBtn: { width: 36, height: 36, borderRadius: 8, backgroundColor: COLORS.surface, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: COLORS.border },
  checkBtnPass: { backgroundColor: "#0d9488", borderColor: "#0d9488" },
  checkBtnFail: { backgroundColor: "#e11d48", borderColor: "#e11d48" },
  checkBtnText: { fontSize: 16, fontWeight: "700", color: COLORS.textSecondary },
  checkBtnTextActive: { color: "#fff" },
  actionBar: { paddingHorizontal: 16, paddingTop: 12, backgroundColor: COLORS.surfaceWhite, borderTopWidth: 1, borderTopColor: COLORS.border },
  submitBtn: { backgroundColor: "#0d9488", paddingVertical: 14, borderRadius: 12, alignItems: "center" },
  submitBtnDisabled: { opacity: 0.4 },
  submitBtnText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  resultCard: { margin: 16, padding: 32, borderRadius: 16, alignItems: "center" },
  resultPass: { backgroundColor: "#ecfdf5", borderWidth: 1, borderColor: "#34d399" },
  resultFail: { backgroundColor: "#fef2f2", borderWidth: 1, borderColor: "#fca5a5" },
  resultIcon: { fontSize: 48, marginBottom: 12 },
  resultTitle: { fontSize: 22, fontWeight: "800", color: COLORS.text },
  resultSubtitle: { fontSize: 14, color: COLORS.textSecondary, marginTop: 4, textAlign: "center" },
  failedList: { marginTop: 16, alignSelf: "stretch" },
  failedItem: { fontSize: 13, color: "#dc2626", paddingVertical: 4 },
  doneBtn: { marginTop: 24, backgroundColor: "#0a1628", paddingHorizontal: 32, paddingVertical: 12, borderRadius: 10 },
  doneBtnText: { color: "#fff", fontWeight: "700", fontSize: 15 },
});
