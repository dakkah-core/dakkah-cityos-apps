import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { COLORS } from "../../constants/colors";

interface Props {
  data: {
    label: string;
    address?: string;
    latitude?: number;
    longitude?: number;
    imageUrl?: string;
  };
  onAction?: (action: string) => void;
}

export function MapView({ data, onAction }: Props) {
  const lat = data.latitude || 24.7136;
  const lng = data.longitude || 46.6753;

  return (
    <View style={styles.container}>
      <View style={styles.mapContainer}>
        <View style={styles.gridOverlay}>
          {Array.from({ length: 5 }).map((_, row) => (
            <View key={row} style={styles.gridRow}>
              {Array.from({ length: 7 }).map((_, col) => (
                <View key={col} style={[styles.gridCell, (row + col) % 2 === 0 ? styles.gridCellA : styles.gridCellB]} />
              ))}
            </View>
          ))}
        </View>
        <View style={styles.streetH} />
        <View style={styles.streetV} />
        <View style={styles.pinOverlay}>
          <Text style={styles.pin}>📍</Text>
        </View>
        <View style={styles.coordsOverlay}>
          <Text style={styles.coordsText}>{lat.toFixed(4)}, {lng.toFixed(4)}</Text>
        </View>
      </View>
      <View style={styles.footer}>
        <View style={styles.locationInfo}>
          <Text style={styles.label}>{data.label}</Text>
          {data.address && <Text style={styles.address}>{data.address}</Text>}
        </View>
        <Pressable style={styles.navBtn} onPress={() => onAction?.(`navigate:${lat},${lng}`)}>
          <Text style={styles.navText}>Navigate</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: COLORS.card, borderRadius: 16, overflow: "hidden", borderWidth: 1, borderColor: COLORS.border },
  mapContainer: { height: 160, backgroundColor: "#E8F5E9", position: "relative", overflow: "hidden" },
  gridOverlay: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0 },
  gridRow: { flexDirection: "row", flex: 1 },
  gridCell: { flex: 1 },
  gridCellA: { backgroundColor: "#E8F5E9" },
  gridCellB: { backgroundColor: "#C8E6C9" },
  streetH: { position: "absolute", top: "48%", left: 0, right: 0, height: 6, backgroundColor: "#BDBDBD" },
  streetV: { position: "absolute", left: "52%", top: 0, bottom: 0, width: 6, backgroundColor: "#BDBDBD" },
  pinOverlay: { position: "absolute", top: "35%", left: "48%", zIndex: 10 },
  pin: { fontSize: 32 },
  coordsOverlay: { position: "absolute", bottom: 6, right: 8, backgroundColor: "rgba(0,0,0,0.5)", borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2 },
  coordsText: { fontSize: 10, color: "#fff", fontFamily: "monospace" },
  footer: { flexDirection: "row", alignItems: "center", padding: 14, gap: 12 },
  locationInfo: { flex: 1 },
  label: { fontSize: 14, fontWeight: "700", color: COLORS.text },
  address: { fontSize: 12, color: COLORS.textSecondary, marginTop: 2 },
  navBtn: { backgroundColor: COLORS.primary, borderRadius: 10, paddingVertical: 8, paddingHorizontal: 16 },
  navText: { fontSize: 13, fontWeight: "700", color: "#fff" },
});
