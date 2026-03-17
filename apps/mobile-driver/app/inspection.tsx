import React, { useCallback, useEffect, useState } from "react";
import { View, Text, StyleSheet, Pressable, ScrollView, Alert, ActivityIndicator, Image, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { COLORS, BRAND } from "@cityos/mobile-core";
import { useDriver } from "@/context/DriverContext";
import { hapticLight, hapticSuccess, hapticError, hapticWarning } from "@/lib/haptics";
import type { InspectionCheck, InspectionResult, InspectionHistoryEntry, Vehicle } from "@/types/driver";

const INSPECTION_ITEMS = [
  { id: "tires", label: "Tires — pressure and tread", icon: "🛞" },
  { id: "brakes", label: "Brakes — responsive, no noise", icon: "🛑" },
  { id: "lights", label: "Lights — headlights, indicators, brake lights", icon: "💡" },
  { id: "mirrors", label: "Mirrors — clean and adjusted", icon: "🪞" },
  { id: "seatbelt", label: "Seatbelt — functional", icon: "🪢" },
  { id: "horn", label: "Horn — working", icon: "📢" },
  { id: "fuel", label: "Fuel — sufficient level", icon: "⛽" },
  { id: "oil", label: "Oil — no leaks, normal level", icon: "🛢️" },
  { id: "coolant", label: "Coolant — normal level", icon: "🧊" },
  { id: "wipers", label: "Wipers — operational, fluid filled", icon: "🧹" },
  { id: "cargo_area", label: "Cargo area — clean and secure", icon: "📦" },
  { id: "fire_extinguisher", label: "Fire extinguisher — present and charged", icon: "🧯" },
];

type Tab = "inspect" | "history";

export default function InspectionScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { submitInspection, getVehicles, getInspectionHistory } = useDriver();
  const [checks, setChecks] = useState<Record<string, boolean | null>>({});
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [photos, setPhotos] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<InspectionResult | null>(null);
  const [tab, setTab] = useState<Tab>("inspect");
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<string>("veh-001");
  const [history, setHistory] = useState<InspectionHistoryEntry[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  useEffect(() => {
    (async () => {
      const [v, h] = await Promise.all([getVehicles(), getInspectionHistory()]);
      setVehicles(v);
      setHistory(h);
      if (v.length > 0) setSelectedVehicle(v[0].id);
    })();
  }, [getVehicles, getInspectionHistory]);

  const loadHistory = useCallback(async () => {
    setHistoryLoading(true);
    const h = await getInspectionHistory();
    setHistory(h);
    setHistoryLoading(false);
  }, [getInspectionHistory]);

  const toggleCheck = (id: string, passed: boolean) => {
    hapticLight();
    setChecks((prev) => ({ ...prev, [id]: passed }));
  };

  const takePhoto = useCallback(async (itemId: string) => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission Required", "Camera access is needed to take inspection photos.");
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: "images",
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.7,
      });

      if (!result.canceled && result.assets[0]) {
        hapticSuccess();
        setPhotos((prev) => ({ ...prev, [itemId]: result.assets[0].uri }));
      }
    } catch {
      if (Platform.OS === "web") {
        const pickerResult = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: "images",
          allowsEditing: true,
          aspect: [4, 3],
          quality: 0.7,
        });
        if (!pickerResult.canceled && pickerResult.assets[0]) {
          hapticSuccess();
          setPhotos((prev) => ({ ...prev, [itemId]: pickerResult.assets[0].uri }));
        }
      }
    }
  }, []);

  const removePhoto = (itemId: string) => {
    hapticLight();
    setPhotos((prev) => {
      const next = { ...prev };
      delete next[itemId];
      return next;
    });
  };

  const passedCount = INSPECTION_ITEMS.filter((item) => checks[item.id] === true).length;
  const failedCount = INSPECTION_ITEMS.filter((item) => checks[item.id] === false).length;
  const photosCount = Object.keys(photos).length;
  const allChecked = INSPECTION_ITEMS.every((item) => checks[item.id] !== undefined && checks[item.id] !== null);

  const handleSubmit = async () => {
    if (!allChecked) {
      hapticWarning();
      Alert.alert("Incomplete", "Please check all items before submitting.");
      return;
    }

    const failedWithoutPhoto = INSPECTION_ITEMS.filter(
      (item) => checks[item.id] === false && !photos[item.id]
    );
    if (failedWithoutPhoto.length > 0) {
      hapticWarning();
      Alert.alert(
        "Photos Required",
        `Please take a photo of failed items: ${failedWithoutPhoto.map((i) => i.label.split(" —")[0]).join(", ")}`,
        [
          { text: "Skip Photos", style: "destructive", onPress: () => doSubmit() },
          { text: "Add Photos", style: "cancel" },
        ]
      );
      return;
    }

    await doSubmit();
  };

  const doSubmit = async () => {
    setIsSubmitting(true);
    hapticMedium();
    const inspectionChecks: InspectionCheck[] = INSPECTION_ITEMS.map((item) => ({
      item: item.label,
      passed: checks[item.id] === true,
      notes: notes[item.id],
      photoUri: photos[item.id],
    }));

    const inspResult = await submitInspection(selectedVehicle, inspectionChecks);
    if (inspResult?.allPassed) {
      hapticSuccess();
    } else {
      hapticError();
    }
    setResult(inspResult);
    setIsSubmitting(false);
  };

  const handleReset = () => {
    hapticLight();
    setChecks({});
    setNotes({});
    setPhotos({});
    setResult(null);
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
        <ScrollView contentContainerStyle={styles.resultContent}>
          <View style={[styles.resultCard, result.allPassed ? styles.resultPass : styles.resultFail]}>
            <Text style={styles.resultIcon}>{result.allPassed ? "✅" : "⚠️"}</Text>
            <Text style={styles.resultTitle}>{result.allPassed ? "Vehicle Ready" : "Issues Found"}</Text>
            <Text style={styles.resultSubtitle}>
              {result.allPassed
                ? "All checks passed. You're good to drive!"
                : `${result.failedItems.length} item(s) need attention`}
            </Text>

            <View style={styles.resultStatsRow}>
              <View style={styles.resultStat}>
                <Text style={[styles.resultStatValue, { color: "#059669" }]}>{passedCount}</Text>
                <Text style={styles.resultStatLabel}>Passed</Text>
              </View>
              <View style={styles.resultStat}>
                <Text style={[styles.resultStatValue, { color: "#dc2626" }]}>{failedCount}</Text>
                <Text style={styles.resultStatLabel}>Failed</Text>
              </View>
              <View style={styles.resultStat}>
                <Text style={styles.resultStatValue}>{photosCount}</Text>
                <Text style={styles.resultStatLabel}>Photos</Text>
              </View>
            </View>

            {result.failedItems.length > 0 && (
              <View style={styles.failedList}>
                <Text style={styles.failedListTitle}>Items Needing Attention:</Text>
                {result.failedItems.map((item, i) => (
                  <View key={i} style={styles.failedItemRow}>
                    <Text style={styles.failedDot}>•</Text>
                    <Text style={styles.failedItem}>{item}</Text>
                  </View>
                ))}
              </View>
            )}

            {!result.canDrive && (
              <View style={styles.warningBanner}>
                <Text style={styles.warningText}>⚠️ Vehicle not cleared for driving. Please address the issues above.</Text>
              </View>
            )}
          </View>

          <View style={styles.resultActions}>
            <Pressable style={styles.newInspectionBtn} onPress={handleReset}>
              <Text style={styles.newInspectionBtnText}>New Inspection</Text>
            </Pressable>
            <Pressable style={styles.doneBtn} onPress={() => router.back()}>
              <Text style={styles.doneBtnText}>Done</Text>
            </Pressable>
          </View>
        </ScrollView>
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

      <View style={styles.tabRow}>
        <Pressable style={[styles.tabBtn, tab === "inspect" && styles.tabBtnActive]} onPress={() => setTab("inspect")}>
          <Text style={[styles.tabText, tab === "inspect" && styles.tabTextActive]}>Inspect</Text>
        </Pressable>
        <Pressable style={[styles.tabBtn, tab === "history" && styles.tabBtnActive]} onPress={() => { setTab("history"); loadHistory(); }}>
          <Text style={[styles.tabText, tab === "history" && styles.tabTextActive]}>History</Text>
        </Pressable>
      </View>

      {tab === "inspect" ? (
        <>
          {vehicles.length > 1 && (
            <View style={styles.vehicleSelector}>
              <Text style={styles.vehicleSelectorLabel}>Vehicle:</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.vehicleScrollContent}>
                {vehicles.map((v) => (
                  <Pressable
                    key={v.id}
                    style={[styles.vehicleChip, selectedVehicle === v.id && styles.vehicleChipActive]}
                    onPress={() => setSelectedVehicle(v.id)}
                  >
                    <Text style={[styles.vehicleChipText, selectedVehicle === v.id && styles.vehicleChipTextActive]}>
                      {v.name} ({v.plateNumber})
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>
            </View>
          )}

          {vehicles.length === 1 && (
            <View style={styles.vehicleBanner}>
              <Text style={styles.vehicleBannerIcon}>🚗</Text>
              <Text style={styles.vehicleBannerText}>{vehicles[0].name} • {vehicles[0].plateNumber}</Text>
            </View>
          )}

          <View style={styles.progressSummary}>
            <Text style={styles.progressText}>
              {Object.keys(checks).length}/{INSPECTION_ITEMS.length} checked • {photosCount} photos
            </Text>
            <View style={styles.progressBarBg}>
              <View style={[styles.progressBarFill, { width: `${(Object.keys(checks).length / INSPECTION_ITEMS.length) * 100}%` }]} />
            </View>
          </View>

          <ScrollView style={styles.content}>
            {INSPECTION_ITEMS.map((item) => (
              <View key={item.id} style={styles.checkRow}>
                <View style={styles.checkRowTop}>
                  <Text style={styles.checkIcon}>{item.icon}</Text>
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

                <View style={styles.checkRowBottom}>
                  {photos[item.id] ? (
                    <View style={styles.photoPreviewRow}>
                      <Image source={{ uri: photos[item.id] }} style={styles.photoThumb} />
                      <View style={styles.photoActions}>
                        <Pressable style={styles.photoActionBtn} onPress={() => takePhoto(item.id)}>
                          <Text style={styles.photoActionText}>📷 Retake</Text>
                        </Pressable>
                        <Pressable style={styles.photoRemoveBtn} onPress={() => removePhoto(item.id)}>
                          <Text style={styles.photoRemoveText}>✕</Text>
                        </Pressable>
                      </View>
                    </View>
                  ) : (
                    <Pressable style={styles.addPhotoBtn} onPress={() => takePhoto(item.id)}>
                      <Text style={styles.addPhotoBtnText}>📷 Add Photo</Text>
                    </Pressable>
                  )}
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
        </>
      ) : (
        <ScrollView style={styles.content}>
          {historyLoading ? (
            <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 40 }} />
          ) : history.length === 0 ? (
            <View style={styles.emptyHistory}>
              <Text style={styles.emptyHistoryIcon}>📋</Text>
              <Text style={styles.emptyHistoryTitle}>No Inspection History</Text>
              <Text style={styles.emptyHistorySubtitle}>Your past inspections will appear here</Text>
            </View>
          ) : (
            history.map((entry) => (
              <View key={entry.id} style={styles.historyRow}>
                <View style={[styles.historyDot, { backgroundColor: entry.allPassed ? "#059669" : "#dc2626" }]}>
                  <Text style={styles.historyDotText}>{entry.allPassed ? "✓" : "!"}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.historyVehicle}>{entry.vehicleName}</Text>
                  <Text style={styles.historyDate}>{entry.date}</Text>
                </View>
                <View style={styles.historyResult}>
                  <Text style={[styles.historyResultText, { color: entry.allPassed ? "#059669" : "#dc2626" }]}>
                    {entry.allPassed ? "All Passed" : `${entry.failedCount} Failed`}
                  </Text>
                  <Text style={styles.historyChecks}>{entry.totalChecks} checks</Text>
                </View>
              </View>
            ))
          )}
          <View style={{ height: 40 }} />
        </ScrollView>
      )}
    </View>
  );
}

function hapticMedium() {
  if (Platform.OS !== "web") {
    import("expo-haptics").then((H) => H.impactAsync(H.ImpactFeedbackStyle.Medium)).catch(() => {});
  }
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.surface },
  header: { backgroundColor: BRAND.navy, paddingBottom: 12, paddingHorizontal: 16, flexDirection: "row", alignItems: "center" },
  headerBackBtn: { width: 36, height: 36, borderRadius: 10, backgroundColor: "rgba(255,255,255,0.1)", alignItems: "center", justifyContent: "center" },
  headerBackText: { color: "#fff", fontSize: 20 },
  headerTitle: { flex: 1, fontSize: 18, fontWeight: "700", color: "#fff", textAlign: "center" },
  tabRow: { flexDirection: "row", gap: 8, paddingHorizontal: 16, paddingVertical: 10, backgroundColor: COLORS.surfaceWhite, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  tabBtn: { flex: 1, paddingVertical: 8, borderRadius: 8, alignItems: "center", backgroundColor: COLORS.surface },
  tabBtnActive: { backgroundColor: BRAND.navy },
  tabText: { fontSize: 14, fontWeight: "600", color: COLORS.textSecondary },
  tabTextActive: { color: "#fff" },
  vehicleSelector: { paddingHorizontal: 16, paddingVertical: 10, backgroundColor: COLORS.surfaceWhite, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  vehicleSelectorLabel: { fontSize: 12, fontWeight: "600", color: COLORS.textSecondary, marginBottom: 6 },
  vehicleScrollContent: { gap: 8 },
  vehicleChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border },
  vehicleChipActive: { backgroundColor: BRAND.blue, borderColor: BRAND.blue },
  vehicleChipText: { fontSize: 13, fontWeight: "500", color: COLORS.text },
  vehicleChipTextActive: { color: "#fff" },
  vehicleBanner: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 16, paddingVertical: 10, backgroundColor: BRAND.blue + "10", borderBottomWidth: 1, borderBottomColor: COLORS.border },
  vehicleBannerIcon: { fontSize: 18 },
  vehicleBannerText: { fontSize: 14, fontWeight: "600", color: BRAND.blue },
  progressSummary: { paddingHorizontal: 16, paddingVertical: 10, backgroundColor: COLORS.surfaceWhite, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  progressText: { fontSize: 12, fontWeight: "600", color: COLORS.textSecondary, marginBottom: 6 },
  progressBarBg: { height: 6, borderRadius: 3, backgroundColor: COLORS.border },
  progressBarFill: { height: 6, borderRadius: 3, backgroundColor: BRAND.teal },
  content: { flex: 1 },
  checkRow: { paddingHorizontal: 16, paddingVertical: 12, backgroundColor: COLORS.surfaceWhite, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  checkRowTop: { flexDirection: "row", alignItems: "center", gap: 10 },
  checkIcon: { fontSize: 18, width: 28 },
  checkLabel: { flex: 1, fontSize: 14, color: COLORS.text },
  checkButtons: { flexDirection: "row", gap: 8 },
  checkBtn: { width: 36, height: 36, borderRadius: 8, backgroundColor: COLORS.surface, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: COLORS.border },
  checkBtnPass: { backgroundColor: BRAND.teal, borderColor: BRAND.teal },
  checkBtnFail: { backgroundColor: BRAND.rose, borderColor: BRAND.rose },
  checkBtnText: { fontSize: 16, fontWeight: "700", color: COLORS.textSecondary },
  checkBtnTextActive: { color: "#fff" },
  checkRowBottom: { marginTop: 8, marginLeft: 38 },
  addPhotoBtn: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border, borderStyle: "dashed", alignSelf: "flex-start" },
  addPhotoBtnText: { fontSize: 12, fontWeight: "500", color: COLORS.textSecondary },
  photoPreviewRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  photoThumb: { width: 56, height: 42, borderRadius: 6, backgroundColor: COLORS.border },
  photoActions: { flexDirection: "row", gap: 6 },
  photoActionBtn: { paddingVertical: 4, paddingHorizontal: 10, borderRadius: 6, backgroundColor: BRAND.blue + "15" },
  photoActionText: { fontSize: 12, fontWeight: "500", color: BRAND.blue },
  photoRemoveBtn: { width: 28, height: 28, borderRadius: 14, backgroundColor: BRAND.rose + "15", alignItems: "center", justifyContent: "center" },
  photoRemoveText: { fontSize: 14, fontWeight: "700", color: BRAND.rose },
  actionBar: { paddingHorizontal: 16, paddingTop: 12, backgroundColor: COLORS.surfaceWhite, borderTopWidth: 1, borderTopColor: COLORS.border },
  submitBtn: { backgroundColor: BRAND.teal, paddingVertical: 14, borderRadius: 12, alignItems: "center" },
  submitBtnDisabled: { opacity: 0.4 },
  submitBtnText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  resultContent: { padding: 16 },
  resultCard: { padding: 28, borderRadius: 16, alignItems: "center" },
  resultPass: { backgroundColor: "#ecfdf5", borderWidth: 1, borderColor: "#34d399" },
  resultFail: { backgroundColor: "#fef2f2", borderWidth: 1, borderColor: "#fca5a5" },
  resultIcon: { fontSize: 48, marginBottom: 12 },
  resultTitle: { fontSize: 22, fontWeight: "800", color: COLORS.text },
  resultSubtitle: { fontSize: 14, color: COLORS.textSecondary, marginTop: 4, textAlign: "center" },
  resultStatsRow: { flexDirection: "row", marginTop: 20, gap: 16 },
  resultStat: { alignItems: "center", flex: 1 },
  resultStatValue: { fontSize: 22, fontWeight: "800", color: COLORS.text },
  resultStatLabel: { fontSize: 12, color: COLORS.textSecondary, marginTop: 2 },
  failedList: { marginTop: 20, alignSelf: "stretch", backgroundColor: "#fff5f5", borderRadius: 10, padding: 14 },
  failedListTitle: { fontSize: 13, fontWeight: "700", color: "#dc2626", marginBottom: 8 },
  failedItemRow: { flexDirection: "row", gap: 6, paddingVertical: 3 },
  failedDot: { color: "#dc2626", fontWeight: "700" },
  failedItem: { fontSize: 13, color: "#dc2626" },
  warningBanner: { marginTop: 16, backgroundColor: "#fef3c7", borderRadius: 10, padding: 12, alignSelf: "stretch" },
  warningText: { fontSize: 13, color: "#92400e", fontWeight: "600", textAlign: "center" },
  resultActions: { flexDirection: "row", gap: 10, marginTop: 16 },
  newInspectionBtn: { flex: 1, paddingVertical: 14, borderRadius: 12, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border, alignItems: "center" },
  newInspectionBtnText: { fontSize: 15, fontWeight: "600", color: COLORS.text },
  doneBtn: { flex: 1, paddingVertical: 14, borderRadius: 12, backgroundColor: BRAND.navy, alignItems: "center" },
  doneBtnText: { color: "#fff", fontWeight: "700", fontSize: 15 },
  historyRow: { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 16, paddingVertical: 14, backgroundColor: COLORS.surfaceWhite, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  historyDot: { width: 32, height: 32, borderRadius: 16, alignItems: "center", justifyContent: "center" },
  historyDotText: { color: "#fff", fontSize: 14, fontWeight: "700" },
  historyVehicle: { fontSize: 14, fontWeight: "600", color: COLORS.text },
  historyDate: { fontSize: 12, color: COLORS.textSecondary, marginTop: 1 },
  historyResult: { alignItems: "flex-end" },
  historyResultText: { fontSize: 13, fontWeight: "700" },
  historyChecks: { fontSize: 11, color: COLORS.textSecondary, marginTop: 1 },
  emptyHistory: { alignItems: "center", paddingVertical: 48 },
  emptyHistoryIcon: { fontSize: 48, marginBottom: 12 },
  emptyHistoryTitle: { fontSize: 18, fontWeight: "700", color: COLORS.text },
  emptyHistorySubtitle: { fontSize: 14, color: COLORS.textSecondary, marginTop: 4 },
});
