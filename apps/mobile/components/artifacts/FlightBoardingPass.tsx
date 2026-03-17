import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { COLORS } from "../../constants/colors";

interface FlightBoardingPassData {
  passengerName: string;
  flightNumber: string;
  airline: string;
  from: { code: string; city: string };
  to: { code: string; city: string };
  date: string;
  boardingTime: string;
  departureTime: string;
  gate: string;
  seat: string;
  class: string;
  status: "on-time" | "delayed" | "boarding" | "departed";
}

interface Props {
  data: FlightBoardingPassData;
}

export function FlightBoardingPass({ data }: Props) {
  const statusConfig = {
    "on-time": { color: COLORS.success, label: "On Time" },
    delayed: { color: COLORS.danger, label: "Delayed" },
    boarding: { color: COLORS.warning, label: "Boarding" },
    departed: { color: COLORS.textMuted, label: "Departed" },
  };

  const st = statusConfig[data.status];

  return (
    <View style={styles.container}>
      <View style={styles.airlineHeader}>
        <View style={styles.airlineLogo}>
          <Text style={styles.airlineLogoText}>✈</Text>
        </View>
        <View style={styles.airlineInfo}>
          <Text style={styles.airlineName}>{data.airline}</Text>
          <Text style={styles.flightNumber}>{data.flightNumber}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: st.color + "20" }]}>
          <Text style={[styles.statusText, { color: st.color }]}>{st.label}</Text>
        </View>
      </View>

      <View style={styles.routeSection}>
        <View style={styles.routePoint}>
          <Text style={styles.cityCode}>{data.from.code}</Text>
          <Text style={styles.cityName}>{data.from.city}</Text>
        </View>
        <View style={styles.routeLine}>
          <View style={styles.routeDash} />
          <Text style={styles.planeIcon}>✈️</Text>
          <View style={styles.routeDash} />
        </View>
        <View style={[styles.routePoint, { alignItems: "flex-end" }]}>
          <Text style={styles.cityCode}>{data.to.code}</Text>
          <Text style={styles.cityName}>{data.to.city}</Text>
        </View>
      </View>

      <View style={styles.passengerRow}>
        <Text style={styles.passengerLabel}>PASSENGER</Text>
        <Text style={styles.passengerName}>{data.passengerName}</Text>
      </View>

      <View style={styles.divider}>
        <View style={styles.notchLeft} />
        <View style={styles.dashes} />
        <View style={styles.notchRight} />
      </View>

      <View style={styles.detailsGrid}>
        <DetailBox label="DATE" value={data.date} />
        <DetailBox label="BOARDING" value={data.boardingTime} />
        <DetailBox label="DEPARTURE" value={data.departureTime} />
        <DetailBox label="GATE" value={data.gate} highlight />
        <DetailBox label="SEAT" value={data.seat} highlight />
        <DetailBox label="CLASS" value={data.class} />
      </View>

      <View style={styles.barcodePlaceholder}>
        <Text style={styles.barcodeText}>||||| |||| ||||| |||||| |||| |||||</Text>
        <Text style={styles.barcodeSub}>Scan at gate</Text>
      </View>
    </View>
  );
}

function DetailBox({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <View style={styles.detailBox}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={[styles.detailValue, highlight && { color: COLORS.primary, fontSize: 18 }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: COLORS.darkNavy, borderRadius: 16, overflow: "hidden" },
  airlineHeader: { flexDirection: "row", alignItems: "center", gap: 10, padding: 16, paddingBottom: 12 },
  airlineLogo: { width: 36, height: 36, borderRadius: 18, backgroundColor: "rgba(255,255,255,0.15)", alignItems: "center", justifyContent: "center" },
  airlineLogoText: { fontSize: 18, color: "#fff" },
  airlineInfo: { flex: 1 },
  airlineName: { fontSize: 14, fontWeight: "700", color: "#fff" },
  flightNumber: { fontSize: 11, color: "rgba(255,255,255,0.5)", marginTop: 1 },
  statusBadge: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5 },
  statusText: { fontSize: 11, fontWeight: "700" },
  routeSection: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, marginBottom: 16 },
  routePoint: { flex: 1 },
  cityCode: { fontSize: 28, fontWeight: "800", color: "#fff" },
  cityName: { fontSize: 11, color: "rgba(255,255,255,0.5)", marginTop: 2 },
  routeLine: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 8 },
  routeDash: { width: 20, height: 1, backgroundColor: "rgba(255,255,255,0.3)" },
  planeIcon: { fontSize: 16 },
  passengerRow: { paddingHorizontal: 16, marginBottom: 12 },
  passengerLabel: { fontSize: 9, color: "rgba(255,255,255,0.4)", letterSpacing: 1 },
  passengerName: { fontSize: 14, fontWeight: "700", color: "#fff", marginTop: 2 },
  divider: { flexDirection: "row", alignItems: "center" },
  notchLeft: { width: 14, height: 28, borderTopRightRadius: 14, borderBottomRightRadius: 14, backgroundColor: COLORS.surface },
  dashes: { flex: 1, height: 1, borderStyle: "dashed", borderWidth: 1, borderColor: "rgba(255,255,255,0.2)" },
  notchRight: { width: 14, height: 28, borderTopLeftRadius: 14, borderBottomLeftRadius: 14, backgroundColor: COLORS.surface },
  detailsGrid: { flexDirection: "row", flexWrap: "wrap", paddingHorizontal: 16, paddingTop: 12 },
  detailBox: { width: "33%", marginBottom: 12 },
  detailLabel: { fontSize: 9, color: "rgba(255,255,255,0.4)", letterSpacing: 1 },
  detailValue: { fontSize: 14, fontWeight: "700", color: "#fff", marginTop: 2 },
  barcodePlaceholder: { alignItems: "center", padding: 16, backgroundColor: "rgba(255,255,255,0.05)", borderTopWidth: 1, borderTopColor: "rgba(255,255,255,0.1)" },
  barcodeText: { fontSize: 18, color: "#fff", letterSpacing: 2, fontFamily: "monospace" },
  barcodeSub: { fontSize: 10, color: "rgba(255,255,255,0.4)", marginTop: 4 },
});
