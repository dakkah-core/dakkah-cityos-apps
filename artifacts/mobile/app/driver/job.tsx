import React, { useCallback, useEffect, useState } from "react";
import { View, Text, StyleSheet, Pressable, ScrollView, TextInput, Alert, Linking, ActivityIndicator } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { COLORS } from "@/constants/colors";
import { useDriver } from "@/context/DriverContext";
import type { DriverJob } from "@/types/driver";

type DeliveryStep = "details" | "navigate_pickup" | "pickup_verify" | "navigate_deliver" | "arrived" | "proof_of_delivery" | "completed";

function getStepForJob(job: DriverJob): DeliveryStep {
  switch (job.status) {
    case "pending": return "details";
    case "accepted": return "navigate_pickup";
    case "in_transit": return "navigate_deliver";
    case "arrived": return "proof_of_delivery";
    case "completed": return "completed";
    default: return "details";
  }
}

export default function JobScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { jobId } = useLocalSearchParams<{ jobId: string }>();
  const { jobs, acceptJob, rejectJob, pickupJob, arriveAtCustomer, completeJob } = useDriver();

  const job = jobs.find((j) => j.id === jobId);
  const [step, setStep] = useState<DeliveryStep>("details");
  const [scannedBarcodes, setScannedBarcodes] = useState<string[]>([]);
  const [recipientName, setRecipientName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (job) setStep(getStepForJob(job));
  }, [job?.status]);

  const openMaps = useCallback((lat: number, lng: number, label: string) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=driving`;
    Linking.openURL(url).catch(() => {});
  }, []);

  const handleAccept = async () => {
    if (!jobId) return;
    setIsSubmitting(true);
    await acceptJob(jobId);
    setIsSubmitting(false);
  };

  const handleReject = async () => {
    if (!jobId) return;
    Alert.alert("Reject Job", "Are you sure you want to reject this delivery?", [
      { text: "Cancel", style: "cancel" },
      { text: "Reject", style: "destructive", onPress: async () => { await rejectJob(jobId); router.back(); } },
    ]);
  };

  const handleScanBarcode = (barcode: string) => {
    if (!scannedBarcodes.includes(barcode)) {
      setScannedBarcodes((prev) => [...prev, barcode]);
    }
  };

  const handleConfirmPickup = async () => {
    if (!jobId) return;
    setIsSubmitting(true);
    await pickupJob(jobId, scannedBarcodes);
    setIsSubmitting(false);
  };

  const handleArrived = async () => {
    if (!jobId) return;
    setIsSubmitting(true);
    await arriveAtCustomer(jobId);
    setIsSubmitting(false);
  };

  const handleComplete = async () => {
    if (!jobId) return;
    setIsSubmitting(true);
    await completeJob(jobId, {
      proofType: "signature",
      recipientName: recipientName || undefined,
    });
    setIsSubmitting(false);
  };

  if (!job) {
    return (
      <View style={[styles.container, styles.center]}>
        <Text style={styles.errorText}>Job not found</Text>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backBtnText}>Go Back</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <Pressable style={styles.headerBackBtn} onPress={() => router.back()}>
          <Text style={styles.headerBackText}>←</Text>
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>Delivery #{job.id.slice(-6)}</Text>
          <Text style={styles.headerSub}>{job.type.toUpperCase()} • {job.status.replace("_", " ").toUpperCase()}</Text>
        </View>
        <View style={[styles.payoutBadge]}>
          <Text style={styles.payoutText}>{job.payout} {job.currency}</Text>
        </View>
      </View>

      <View style={styles.progressBar}>
        {(["details", "navigate_pickup", "pickup_verify", "navigate_deliver", "arrived", "proof_of_delivery", "completed"] as DeliveryStep[]).map((s, i) => (
          <View key={s} style={[
            styles.progressDot,
            i <= (["details", "navigate_pickup", "pickup_verify", "navigate_deliver", "arrived", "proof_of_delivery", "completed"] as DeliveryStep[]).indexOf(step) && styles.progressDotActive,
          ]} />
        ))}
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.locationCard}>
          <View style={styles.locationRow}>
            <View style={styles.locationDot}>
              <Text style={styles.locationDotText}>P</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.locationName}>{job.pickup.name}</Text>
              <Text style={styles.locationAddress}>{job.pickup.address}</Text>
            </View>
            <Pressable style={styles.navBtn} onPress={() => openMaps(job.pickup.lat, job.pickup.lng, job.pickup.name)}>
              <Text style={styles.navBtnText}>📍</Text>
            </Pressable>
          </View>

          <View style={styles.routeLine} />

          <View style={styles.locationRow}>
            <View style={[styles.locationDot, styles.locationDotDrop]}>
              <Text style={styles.locationDotText}>D</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.locationName}>{job.customer.name}</Text>
              <Text style={styles.locationAddress}>{job.customer.address}</Text>
            </View>
            <Pressable style={styles.navBtn} onPress={() => openMaps(job.customer.lat, job.customer.lng, job.customer.name)}>
              <Text style={styles.navBtnText}>📍</Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.infoRow}>
          <View style={styles.infoChip}>
            <Text style={styles.infoLabel}>Distance</Text>
            <Text style={styles.infoValue}>{job.estimatedDistance}</Text>
          </View>
          <View style={styles.infoChip}>
            <Text style={styles.infoLabel}>ETA</Text>
            <Text style={styles.infoValue}>{job.estimatedDuration}</Text>
          </View>
          <View style={styles.infoChip}>
            <Text style={styles.infoLabel}>Items</Text>
            <Text style={styles.infoValue}>{job.items.length}</Text>
          </View>
        </View>

        {job.notes && (
          <View style={styles.notesCard}>
            <Text style={styles.notesLabel}>📝 Notes</Text>
            <Text style={styles.notesText}>{job.notes}</Text>
          </View>
        )}

        <View style={styles.itemsCard}>
          <Text style={styles.itemsTitle}>Items to Deliver</Text>
          {job.items.map((item, i) => (
            <View key={i} style={styles.itemRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemBarcode}>Barcode: {item.barcode}</Text>
              </View>
              <Text style={styles.itemQty}>x{item.quantity}</Text>
              {step === "navigate_pickup" && (
                <Pressable
                  style={[styles.scanBtn, scannedBarcodes.includes(item.barcode) && styles.scanBtnDone]}
                  onPress={() => handleScanBarcode(item.barcode)}
                >
                  <Text style={styles.scanBtnText}>{scannedBarcodes.includes(item.barcode) ? "✓" : "Scan"}</Text>
                </Pressable>
              )}
            </View>
          ))}
        </View>

        {step === "proof_of_delivery" && (
          <View style={styles.proofCard}>
            <Text style={styles.proofTitle}>Proof of Delivery</Text>
            <TextInput
              style={styles.proofInput}
              placeholder="Recipient name (optional)"
              placeholderTextColor={COLORS.textMuted}
              value={recipientName}
              onChangeText={setRecipientName}
            />
            <Text style={styles.proofHint}>Tap "Complete Delivery" to confirm handover</Text>
          </View>
        )}

        {step === "completed" && (
          <View style={styles.completedCard}>
            <Text style={styles.completedIcon}>✅</Text>
            <Text style={styles.completedTitle}>Delivery Complete!</Text>
            <Text style={styles.completedPayout}>+{job.payout} {job.currency}</Text>
          </View>
        )}

        <View style={{ height: 120 }} />
      </ScrollView>

      <View style={[styles.actionBar, { paddingBottom: Math.max(insets.bottom, 12) }]}>
        {isSubmitting ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : step === "details" ? (
          <View style={styles.actionRow}>
            <Pressable style={[styles.actionBtn, styles.rejectBtn]} onPress={handleReject}>
              <Text style={styles.rejectBtnText}>Reject</Text>
            </Pressable>
            <Pressable style={[styles.actionBtn, styles.acceptBtn]} onPress={handleAccept}>
              <Text style={styles.acceptBtnText}>Accept Job</Text>
            </Pressable>
          </View>
        ) : step === "navigate_pickup" ? (
          <View style={styles.actionRow}>
            <Pressable style={[styles.actionBtn, styles.navActionBtn]} onPress={() => openMaps(job.pickup.lat, job.pickup.lng, job.pickup.name)}>
              <Text style={styles.navActionBtnText}>Navigate to Pickup</Text>
            </Pressable>
            <Pressable style={[styles.actionBtn, styles.acceptBtn]} onPress={handleConfirmPickup}>
              <Text style={styles.acceptBtnText}>Confirm Pickup</Text>
            </Pressable>
          </View>
        ) : step === "navigate_deliver" ? (
          <View style={styles.actionRow}>
            <Pressable style={[styles.actionBtn, styles.navActionBtn]} onPress={() => openMaps(job.customer.lat, job.customer.lng, job.customer.name)}>
              <Text style={styles.navActionBtnText}>Navigate</Text>
            </Pressable>
            <Pressable style={[styles.actionBtn, styles.acceptBtn]} onPress={handleArrived}>
              <Text style={styles.acceptBtnText}>I've Arrived</Text>
            </Pressable>
          </View>
        ) : step === "proof_of_delivery" ? (
          <Pressable style={[styles.actionBtn, styles.completeBtn, { flex: 1 }]} onPress={handleComplete}>
            <Text style={styles.completeBtnText}>Complete Delivery</Text>
          </Pressable>
        ) : step === "completed" ? (
          <Pressable style={[styles.actionBtn, styles.acceptBtn, { flex: 1 }]} onPress={() => router.back()}>
            <Text style={styles.acceptBtnText}>Back to Dashboard</Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.surface },
  center: { justifyContent: "center", alignItems: "center" },
  errorText: { fontSize: 16, color: COLORS.textSecondary, marginBottom: 12 },
  backBtn: { paddingHorizontal: 20, paddingVertical: 10, backgroundColor: COLORS.primary, borderRadius: 8 },
  backBtnText: { color: "#fff", fontWeight: "600" },
  header: { backgroundColor: "#0a1628", paddingBottom: 12, paddingHorizontal: 16, flexDirection: "row", alignItems: "center", gap: 10 },
  headerBackBtn: { width: 36, height: 36, borderRadius: 10, backgroundColor: "rgba(255,255,255,0.1)", alignItems: "center", justifyContent: "center" },
  headerBackText: { color: "#fff", fontSize: 20 },
  headerTitle: { fontSize: 16, fontWeight: "700", color: "#fff" },
  headerSub: { fontSize: 11, color: "#94a3b8", fontWeight: "500" },
  payoutBadge: { backgroundColor: "#0d9488", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  payoutText: { color: "#fff", fontWeight: "700", fontSize: 14 },
  progressBar: { flexDirection: "row", gap: 4, paddingHorizontal: 16, paddingVertical: 8, backgroundColor: COLORS.surfaceWhite, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  progressDot: { flex: 1, height: 4, borderRadius: 2, backgroundColor: COLORS.border },
  progressDotActive: { backgroundColor: "#0d9488" },
  content: { flex: 1 },
  locationCard: { margin: 16, backgroundColor: COLORS.surfaceWhite, borderRadius: 14, padding: 16, borderWidth: 1, borderColor: COLORS.border },
  locationRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  locationDot: { width: 32, height: 32, borderRadius: 16, backgroundColor: "#3182ce", alignItems: "center", justifyContent: "center" },
  locationDotDrop: { backgroundColor: "#e11d48" },
  locationDotText: { color: "#fff", fontSize: 14, fontWeight: "700" },
  routeLine: { width: 2, height: 24, backgroundColor: COLORS.border, marginLeft: 15, marginVertical: 4 },
  locationName: { fontSize: 14, fontWeight: "600", color: COLORS.text },
  locationAddress: { fontSize: 12, color: COLORS.textSecondary, marginTop: 2 },
  navBtn: { width: 36, height: 36, borderRadius: 10, backgroundColor: COLORS.surface, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: COLORS.border },
  navBtnText: { fontSize: 16 },
  infoRow: { flexDirection: "row", gap: 10, paddingHorizontal: 16 },
  infoChip: { flex: 1, backgroundColor: COLORS.surfaceWhite, borderRadius: 10, padding: 12, alignItems: "center", borderWidth: 1, borderColor: COLORS.border },
  infoLabel: { fontSize: 10, color: COLORS.textSecondary, fontWeight: "500" },
  infoValue: { fontSize: 16, fontWeight: "700", color: COLORS.text, marginTop: 2 },
  notesCard: { margin: 16, backgroundColor: "#fef3c7", borderRadius: 12, padding: 14, borderWidth: 1, borderColor: "#fbbf24" },
  notesLabel: { fontSize: 12, fontWeight: "600", color: "#92400e", marginBottom: 4 },
  notesText: { fontSize: 13, color: "#78350f" },
  itemsCard: { marginHorizontal: 16, backgroundColor: COLORS.surfaceWhite, borderRadius: 14, padding: 16, borderWidth: 1, borderColor: COLORS.border },
  itemsTitle: { fontSize: 14, fontWeight: "700", color: COLORS.text, marginBottom: 12 },
  itemRow: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  itemName: { fontSize: 14, fontWeight: "600", color: COLORS.text },
  itemBarcode: { fontSize: 11, color: COLORS.textSecondary, marginTop: 2 },
  itemQty: { fontSize: 14, fontWeight: "600", color: COLORS.textSecondary },
  scanBtn: { paddingHorizontal: 12, paddingVertical: 6, backgroundColor: "#3182ce", borderRadius: 6 },
  scanBtnDone: { backgroundColor: "#0d9488" },
  scanBtnText: { color: "#fff", fontSize: 12, fontWeight: "600" },
  proofCard: { margin: 16, backgroundColor: COLORS.surfaceWhite, borderRadius: 14, padding: 16, borderWidth: 1, borderColor: COLORS.border },
  proofTitle: { fontSize: 14, fontWeight: "700", color: COLORS.text, marginBottom: 12 },
  proofInput: { backgroundColor: COLORS.surface, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10, fontSize: 14, color: COLORS.text, borderWidth: 1, borderColor: COLORS.border, marginBottom: 8 },
  proofHint: { fontSize: 12, color: COLORS.textSecondary, fontStyle: "italic" },
  completedCard: { margin: 16, padding: 32, backgroundColor: "#ecfdf5", borderRadius: 16, alignItems: "center", borderWidth: 1, borderColor: "#34d399" },
  completedIcon: { fontSize: 40, marginBottom: 8 },
  completedTitle: { fontSize: 20, fontWeight: "800", color: "#065f46" },
  completedPayout: { fontSize: 18, fontWeight: "700", color: "#0d9488", marginTop: 4 },
  actionBar: { paddingHorizontal: 16, paddingTop: 12, backgroundColor: COLORS.surfaceWhite, borderTopWidth: 1, borderTopColor: COLORS.border },
  actionRow: { flexDirection: "row", gap: 10 },
  actionBtn: { paddingVertical: 14, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  acceptBtn: { flex: 1, backgroundColor: "#0d9488" },
  acceptBtnText: { color: "#fff", fontSize: 15, fontWeight: "700" },
  rejectBtn: { flex: 0.6, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: "#e11d48" },
  rejectBtnText: { color: "#e11d48", fontSize: 15, fontWeight: "600" },
  navActionBtn: { flex: 0.5, backgroundColor: "#3182ce" },
  navActionBtnText: { color: "#fff", fontSize: 14, fontWeight: "600" },
  completeBtn: { backgroundColor: "#0d9488" },
  completeBtnText: { color: "#fff", fontSize: 16, fontWeight: "700" },
});
