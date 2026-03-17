import React from "react";
import { View, Text, StyleSheet, Pressable, Linking, Platform } from "react-native";
import { COLORS } from "@/constants/colors";

let MapView: React.ComponentType<any> | null = null;
let Marker: React.ComponentType<any> | null = null;
let Polyline: React.ComponentType<any> | null = null;

try {
  if (Platform.OS !== "web") {
    const maps = require("react-native-maps");
    MapView = maps.default;
    Marker = maps.Marker;
    Polyline = maps.Polyline;
  }
} catch {}

interface MapLocation {
  name: string;
  address: string;
  lat: number;
  lng: number;
}

interface DeliveryMapProps {
  pickup: MapLocation;
  dropoff: MapLocation;
  driverLat?: number;
  driverLng?: number;
  eta?: string;
  distance?: string;
}

function WebMapFallback({ pickup, dropoff, driverLat, driverLng, eta, distance }: DeliveryMapProps) {
  return (
    <View style={styles.webFallback}>
      <View style={styles.routeVisual}>
        <View style={styles.pointRow}>
          <View style={styles.pickupDot} />
          <View style={{ flex: 1 }}>
            <Text style={styles.pointLabel}>{pickup.name}</Text>
            <Text style={styles.pointAddr} numberOfLines={1}>{pickup.address}</Text>
          </View>
        </View>
        <View style={styles.routeLineContainer}>
          <View style={styles.routeLineSegment} />
          {driverLat != null && driverLng != null && (
            <View style={styles.driverDot}><Text style={styles.driverDotText}>🚗</Text></View>
          )}
          <View style={styles.routeLineSegment} />
        </View>
        <View style={styles.pointRow}>
          <View style={styles.dropDot} />
          <View style={{ flex: 1 }}>
            <Text style={styles.pointLabel}>{dropoff.name}</Text>
            <Text style={styles.pointAddr} numberOfLines={1}>{dropoff.address}</Text>
          </View>
        </View>
      </View>
      {(eta || distance) && (
        <View style={styles.etaBar}>
          {distance && <Text style={styles.etaText}>📏 {distance}</Text>}
          {eta && <Text style={styles.etaText}>⏱ ETA: {eta}</Text>}
        </View>
      )}
    </View>
  );
}

export function DeliveryMap({ pickup, dropoff, driverLat, driverLng, eta, distance }: DeliveryMapProps) {
  const openNavigation = (lat: number, lng: number) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=driving`;
    Linking.openURL(url).catch(() => {});
  };

  const centerLat = (pickup.lat + dropoff.lat) / 2;
  const centerLng = (pickup.lng + dropoff.lng) / 2;
  const latDelta = Math.abs(pickup.lat - dropoff.lat) * 1.5 + 0.01;
  const lngDelta = Math.abs(pickup.lng - dropoff.lng) * 1.5 + 0.01;

  return (
    <View style={styles.container}>
      {MapView && Marker && Polyline ? (
        <View style={styles.nativeMapWrap}>
          <MapView
            style={styles.nativeMap}
            initialRegion={{
              latitude: centerLat,
              longitude: centerLng,
              latitudeDelta: latDelta,
              longitudeDelta: lngDelta,
            }}
          >
            <Marker
              coordinate={{ latitude: pickup.lat, longitude: pickup.lng }}
              title={pickup.name}
              description={pickup.address}
              pinColor="#3182ce"
            />
            <Marker
              coordinate={{ latitude: dropoff.lat, longitude: dropoff.lng }}
              title={dropoff.name}
              description={dropoff.address}
              pinColor="#e11d48"
            />
            {driverLat != null && driverLng != null && (
              <Marker
                coordinate={{ latitude: driverLat, longitude: driverLng }}
                title="Your Location"
                pinColor="#0d9488"
              />
            )}
            <Polyline
              coordinates={[
                { latitude: pickup.lat, longitude: pickup.lng },
                ...(driverLat != null && driverLng != null
                  ? [{ latitude: driverLat, longitude: driverLng }]
                  : []),
                { latitude: dropoff.lat, longitude: dropoff.lng },
              ]}
              strokeColor="#3182ce"
              strokeWidth={3}
            />
          </MapView>
          {(eta || distance) && (
            <View style={styles.etaOverlay}>
              {distance && <Text style={styles.etaOverlayText}>📏 {distance}</Text>}
              {eta && <Text style={styles.etaOverlayText}>⏱ {eta}</Text>}
            </View>
          )}
        </View>
      ) : (
        <WebMapFallback pickup={pickup} dropoff={dropoff} driverLat={driverLat} driverLng={driverLng} eta={eta} distance={distance} />
      )}

      <View style={styles.navRow}>
        <Pressable style={[styles.navBtn, styles.pickupNavBtn]} onPress={() => openNavigation(pickup.lat, pickup.lng)}>
          <Text style={styles.navBtnText}>Navigate to Pickup</Text>
        </Pressable>
        <Pressable style={[styles.navBtn, styles.dropNavBtn]} onPress={() => openNavigation(dropoff.lat, dropoff.lng)}>
          <Text style={styles.navBtnText}>Navigate to Drop</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginHorizontal: 16, marginBottom: 12 },
  nativeMapWrap: { borderRadius: 14, overflow: "hidden", height: 220, marginBottom: 4 },
  nativeMap: { flex: 1 },
  etaOverlay: { position: "absolute", bottom: 8, left: 8, right: 8, flexDirection: "row", justifyContent: "center", gap: 16, backgroundColor: "rgba(255,255,255,0.92)", borderRadius: 8, paddingVertical: 6, paddingHorizontal: 12 },
  etaOverlayText: { fontSize: 13, fontWeight: "600", color: "#0a1628" },
  webFallback: { backgroundColor: "#e8f4f8", borderRadius: 14, padding: 16, borderWidth: 1, borderColor: "#bae6fd" },
  routeVisual: { gap: 4 },
  pointRow: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 4 },
  pickupDot: { width: 14, height: 14, borderRadius: 7, backgroundColor: "#3182ce", borderWidth: 2, borderColor: "#fff" },
  dropDot: { width: 14, height: 14, borderRadius: 7, backgroundColor: "#e11d48", borderWidth: 2, borderColor: "#fff" },
  pointLabel: { fontSize: 13, fontWeight: "600", color: COLORS.text },
  pointAddr: { fontSize: 11, color: COLORS.textSecondary },
  routeLineContainer: { flexDirection: "row", alignItems: "center", paddingLeft: 6, gap: 4, marginVertical: 2 },
  routeLineSegment: { flex: 1, height: 3, backgroundColor: "#3182ce", borderRadius: 2, opacity: 0.4 },
  driverDot: { width: 28, height: 28, borderRadius: 14, backgroundColor: "#0d9488", alignItems: "center", justifyContent: "center", borderWidth: 2, borderColor: "#fff" },
  driverDotText: { fontSize: 14 },
  etaBar: { flexDirection: "row", justifyContent: "center", gap: 16, marginTop: 12, paddingTop: 10, borderTopWidth: 1, borderTopColor: "#bae6fd" },
  etaText: { fontSize: 13, fontWeight: "600", color: "#0a1628" },
  navRow: { flexDirection: "row", gap: 8, marginTop: 8 },
  navBtn: { flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: "center" },
  pickupNavBtn: { backgroundColor: "#3182ce" },
  dropNavBtn: { backgroundColor: "#e11d48" },
  navBtnText: { color: "#fff", fontSize: 13, fontWeight: "600" },
});
