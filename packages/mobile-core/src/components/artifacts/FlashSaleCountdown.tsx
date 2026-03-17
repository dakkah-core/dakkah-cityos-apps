import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { COLORS } from "../../constants/colors";

interface FlashSaleData {
  productName: string;
  originalPrice: string;
  salePrice: string;
  image: string;
  endsAt: string;
  soldCount: number;
  totalStock: number;
}

interface Props {
  data: FlashSaleData;
  onAction?: (action: string) => void;
}

export function FlashSaleCountdown({ data, onAction }: Props) {
  const [timeLeft, setTimeLeft] = useState(getTimeLeft(data.endsAt));

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(getTimeLeft(data.endsAt));
    }, 1000);
    return () => clearInterval(timer);
  }, [data.endsAt]);

  const stockPercent = (data.soldCount / data.totalStock) * 100;

  return (
    <View style={styles.container}>
      <View style={styles.badge}>
        <Text style={styles.badgeText}>FLASH SALE</Text>
      </View>
      <View style={styles.content}>
        <View style={styles.imagePlaceholder}>
          <Text style={styles.imageIcon}>🛍️</Text>
        </View>
        <View style={styles.info}>
          <Text style={styles.productName}>{data.productName}</Text>
          <View style={styles.priceRow}>
            <Text style={styles.salePrice}>{data.salePrice}</Text>
            <Text style={styles.originalPrice}>{data.originalPrice}</Text>
          </View>
        </View>
      </View>
      <View style={styles.timerRow}>
        <TimeBlock value={timeLeft.hours} label="HRS" />
        <Text style={styles.colon}>:</Text>
        <TimeBlock value={timeLeft.minutes} label="MIN" />
        <Text style={styles.colon}>:</Text>
        <TimeBlock value={timeLeft.seconds} label="SEC" />
      </View>
      <View style={styles.stockSection}>
        <View style={styles.stockBar}>
          <View style={[styles.stockFill, { width: `${Math.min(stockPercent, 100)}%` }]} />
        </View>
        <Text style={styles.stockText}>{data.soldCount}/{data.totalStock} sold</Text>
      </View>
      <TouchableOpacity style={styles.button} onPress={() => onAction?.("grab-deal")}>
        <Text style={styles.buttonText}>Grab This Deal</Text>
      </TouchableOpacity>
    </View>
  );
}

function TimeBlock({ value, label }: { value: number; label: string }) {
  return (
    <View style={styles.timeBlock}>
      <Text style={styles.timeValue}>{String(value).padStart(2, "0")}</Text>
      <Text style={styles.timeLabel}>{label}</Text>
    </View>
  );
}

function getTimeLeft(endsAt: string) {
  const diff = Math.max(0, new Date(endsAt).getTime() - Date.now());
  return {
    hours: Math.floor(diff / 3600000),
    minutes: Math.floor((diff % 3600000) / 60000),
    seconds: Math.floor((diff % 60000) / 1000),
  };
}

const styles = StyleSheet.create({
  container: { backgroundColor: COLORS.card, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: COLORS.border },
  badge: { backgroundColor: COLORS.danger, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3, alignSelf: "flex-start", marginBottom: 12 },
  badgeText: { fontSize: 10, fontWeight: "800", color: "#fff", letterSpacing: 1 },
  content: { flexDirection: "row", gap: 12, marginBottom: 16 },
  imagePlaceholder: { width: 72, height: 72, borderRadius: 12, backgroundColor: COLORS.borderLight, alignItems: "center", justifyContent: "center" },
  imageIcon: { fontSize: 32 },
  info: { flex: 1, justifyContent: "center" },
  productName: { fontSize: 16, fontWeight: "700", color: COLORS.text, marginBottom: 4 },
  priceRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  salePrice: { fontSize: 20, fontWeight: "800", color: COLORS.danger },
  originalPrice: { fontSize: 14, color: COLORS.textMuted, textDecorationLine: "line-through" },
  timerRow: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 4, marginBottom: 12 },
  colon: { fontSize: 20, fontWeight: "700", color: COLORS.text },
  timeBlock: { alignItems: "center", backgroundColor: COLORS.darkNavy, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6, minWidth: 52 },
  timeValue: { fontSize: 20, fontWeight: "800", color: "#fff" },
  timeLabel: { fontSize: 8, fontWeight: "600", color: "rgba(255,255,255,0.5)", marginTop: 2 },
  stockSection: { marginBottom: 12 },
  stockBar: { height: 6, borderRadius: 3, backgroundColor: COLORS.borderLight, overflow: "hidden", marginBottom: 4 },
  stockFill: { height: "100%", borderRadius: 3, backgroundColor: COLORS.warning },
  stockText: { fontSize: 11, color: COLORS.textSecondary, textAlign: "right" },
  button: { backgroundColor: COLORS.danger, borderRadius: 12, paddingVertical: 12, alignItems: "center" },
  buttonText: { fontSize: 14, fontWeight: "700", color: "#fff" },
});
