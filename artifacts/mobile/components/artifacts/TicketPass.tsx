import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { COLORS } from "../../constants/colors";
import type { TicketData } from "../../types/chat";

interface Props {
  data: TicketData;
}

export function TicketPass({ data }: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.eventName}>{data.eventName}</Text>
        <View style={styles.seatBadge}>
          <Text style={styles.seatText}>{data.seat}</Text>
        </View>
      </View>
      <View style={styles.divider}>
        <View style={styles.notchLeft} />
        <View style={styles.dashes} />
        <View style={styles.notchRight} />
      </View>
      <View style={styles.details}>
        <DetailItem label="Date" value={data.date} />
        <DetailItem label="Time" value={data.time} />
        <DetailItem label="Location" value={data.location} />
      </View>
      <View style={styles.qrPlaceholder}>
        <Text style={styles.qrText}>▣ QR Code</Text>
        <Text style={styles.qrSub}>Show at entrance</Text>
      </View>
    </View>
  );
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.detailItem}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: COLORS.darkNavy, borderRadius: 16, overflow: "hidden" },
  header: { padding: 16, flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  eventName: { fontSize: 18, fontWeight: "800", color: "#fff", flex: 1, marginRight: 8 },
  seatBadge: { backgroundColor: COLORS.primary, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  seatText: { fontSize: 12, fontWeight: "700", color: "#fff" },
  divider: { flexDirection: "row", alignItems: "center" },
  notchLeft: { width: 14, height: 28, borderTopRightRadius: 14, borderBottomRightRadius: 14, backgroundColor: COLORS.surface },
  dashes: { flex: 1, height: 1, borderStyle: "dashed", borderWidth: 1, borderColor: "rgba(255,255,255,0.2)" },
  notchRight: { width: 14, height: 28, borderTopLeftRadius: 14, borderBottomLeftRadius: 14, backgroundColor: COLORS.surface },
  details: { paddingHorizontal: 16, paddingVertical: 12, gap: 8 },
  detailItem: { flexDirection: "row", justifyContent: "space-between" },
  detailLabel: { fontSize: 11, color: "rgba(255,255,255,0.5)" },
  detailValue: { fontSize: 12, fontWeight: "600", color: "#fff" },
  qrPlaceholder: { alignItems: "center", padding: 16, backgroundColor: "rgba(255,255,255,0.05)", borderTopWidth: 1, borderTopColor: "rgba(255,255,255,0.1)" },
  qrText: { fontSize: 24, color: "#fff" },
  qrSub: { fontSize: 10, color: "rgba(255,255,255,0.4)", marginTop: 4 },
});
