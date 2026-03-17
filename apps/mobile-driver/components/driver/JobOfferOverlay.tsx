import React, { useEffect, useState, useRef } from "react";
import { View, Text, StyleSheet, Pressable, Animated, Modal } from "react-native";
import { BRAND, COLORS } from "@cityos/mobile-core";
import { hapticHeavy, hapticSuccess, hapticWarning } from "@/lib/haptics";
import type { JobOffer } from "@/types/driver";

interface JobOfferOverlayProps {
  offer: JobOffer | null;
  onAccept: () => void;
  onDecline: () => void;
}

export function JobOfferOverlay({ offer, onAccept, onDecline }: JobOfferOverlayProps) {
  const [timeLeft, setTimeLeft] = useState(30);
  const slideAnim = useRef(new Animated.Value(400)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!offer) {
      Animated.timing(slideAnim, { toValue: 400, duration: 300, useNativeDriver: true }).start();
      return;
    }

    const remaining = Math.max(0, Math.ceil((offer.expiresAt - Date.now()) / 1000));
    setTimeLeft(remaining);

    Animated.spring(slideAnim, { toValue: 0, friction: 8, tension: 40, useNativeDriver: true }).start();
    hapticHeavy();

    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.05, duration: 500, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
      ])
    );
    pulse.start();

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onDecline();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearInterval(timer);
      pulse.stop();
    };
  }, [offer, onDecline, slideAnim, pulseAnim]);

  if (!offer) return null;

  const { job, bonusMultiplier } = offer;
  const timerColor = timeLeft <= 10 ? BRAND.rose : timeLeft <= 20 ? BRAND.amber : BRAND.teal;
  const timerProgress = timeLeft / 30;

  return (
    <Modal visible transparent animationType="none">
      <View style={styles.backdrop}>
        <Animated.View style={[styles.card, { transform: [{ translateY: slideAnim }] }]}>
          <View style={styles.timerRow}>
            <View style={styles.timerBarBg}>
              <View style={[styles.timerBarFill, { width: `${timerProgress * 100}%`, backgroundColor: timerColor }]} />
            </View>
            <Text style={[styles.timerText, { color: timerColor }]}>{timeLeft}s</Text>
          </View>

          <View style={styles.headerRow}>
            <Text style={styles.newJobLabel}>New Job Available</Text>
            {bonusMultiplier && (
              <View style={styles.bonusBadge}>
                <Text style={styles.bonusText}>{bonusMultiplier}x Bonus</Text>
              </View>
            )}
          </View>

          <View style={styles.routeSection}>
            <View style={styles.locationRow}>
              <View style={styles.pickupDot} />
              <View style={{ flex: 1 }}>
                <Text style={styles.locationName}>{job.pickup.name}</Text>
                <Text style={styles.locationAddr} numberOfLines={1}>{job.pickup.address}</Text>
              </View>
            </View>
            <View style={styles.routeLine} />
            <View style={styles.locationRow}>
              <View style={styles.dropDot} />
              <View style={{ flex: 1 }}>
                <Text style={styles.locationName}>{job.customer.name}</Text>
                <Text style={styles.locationAddr} numberOfLines={1}>{job.customer.address}</Text>
              </View>
            </View>
          </View>

          <View style={styles.detailsRow}>
            <View style={styles.detailChip}>
              <Text style={styles.detailLabel}>Distance</Text>
              <Text style={styles.detailValue}>{job.estimatedDistance}</Text>
            </View>
            <View style={styles.detailChip}>
              <Text style={styles.detailLabel}>ETA</Text>
              <Text style={styles.detailValue}>{job.estimatedDuration}</Text>
            </View>
            <View style={styles.detailChip}>
              <Text style={styles.detailLabel}>Items</Text>
              <Text style={styles.detailValue}>{job.items.length}</Text>
            </View>
          </View>

          <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
            <View style={styles.payoutRow}>
              <Text style={styles.payoutAmount}>{job.payout.toFixed(2)} {job.currency}</Text>
              {job.tip ? <Text style={styles.tipText}>+ {job.tip} tip</Text> : null}
            </View>
          </Animated.View>

          <View style={styles.actionRow}>
            <Pressable style={styles.declineBtn} onPress={() => { hapticWarning(); onDecline(); }}>
              <Text style={styles.declineBtnText}>Decline</Text>
            </Pressable>
            <Pressable style={styles.acceptBtn} onPress={() => { hapticSuccess(); onAccept(); }}>
              <Text style={styles.acceptBtnText}>Accept Job</Text>
            </Pressable>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
  card: { backgroundColor: "#fff", borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, paddingBottom: 36 },
  timerRow: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 14 },
  timerBarBg: { flex: 1, height: 6, borderRadius: 3, backgroundColor: COLORS.border },
  timerBarFill: { height: 6, borderRadius: 3 },
  timerText: { fontSize: 16, fontWeight: "800", minWidth: 32, textAlign: "right" },
  headerRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 14 },
  newJobLabel: { fontSize: 20, fontWeight: "800", color: BRAND.navy },
  bonusBadge: { backgroundColor: BRAND.amber + "20", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
  bonusText: { fontSize: 13, fontWeight: "700", color: BRAND.amber },
  routeSection: { marginBottom: 14 },
  locationRow: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 4 },
  pickupDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: BRAND.blue },
  dropDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: BRAND.rose },
  routeLine: { width: 2, height: 16, backgroundColor: COLORS.border, marginLeft: 5, marginVertical: 2 },
  locationName: { fontSize: 14, fontWeight: "600", color: COLORS.text },
  locationAddr: { fontSize: 12, color: COLORS.textSecondary },
  detailsRow: { flexDirection: "row", gap: 8, marginBottom: 14 },
  detailChip: { flex: 1, backgroundColor: COLORS.surface, borderRadius: 10, padding: 10, alignItems: "center" },
  detailLabel: { fontSize: 10, color: COLORS.textSecondary, fontWeight: "500" },
  detailValue: { fontSize: 15, fontWeight: "700", color: COLORS.text, marginTop: 2 },
  payoutRow: { alignItems: "center", marginBottom: 16 },
  payoutAmount: { fontSize: 28, fontWeight: "900", color: BRAND.teal },
  tipText: { fontSize: 14, fontWeight: "600", color: BRAND.amber, marginTop: 2 },
  actionRow: { flexDirection: "row", gap: 10 },
  declineBtn: { flex: 0.5, paddingVertical: 16, borderRadius: 14, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: BRAND.rose, alignItems: "center" },
  declineBtnText: { color: BRAND.rose, fontSize: 16, fontWeight: "700" },
  acceptBtn: { flex: 1, paddingVertical: 16, borderRadius: 14, backgroundColor: BRAND.teal, alignItems: "center" },
  acceptBtnText: { color: "#fff", fontSize: 16, fontWeight: "700" },
});
