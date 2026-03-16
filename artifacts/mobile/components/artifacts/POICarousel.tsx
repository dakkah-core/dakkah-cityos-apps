import React from "react";
import { View, Text, Image, ScrollView, StyleSheet, Pressable } from "react-native";
import { COLORS } from "../../constants/colors";
import type { POI } from "../../types/chat";

interface Props {
  data: { pois: POI[] };
  onAction?: (action: string) => void;
}

export function POICarousel({ data, onAction }: Props) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scroll}>
      {data.pois.map((poi) => (
        <Pressable key={poi.id} style={styles.card} onPress={() => onAction?.(`Tell me more about ${poi.name}`)}>
          <Image source={{ uri: poi.image }} style={styles.image} />
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{poi.openNow ? "Open" : "Closed"}</Text>
          </View>
          <View style={styles.info}>
            <Text style={styles.name} numberOfLines={1}>{poi.name}</Text>
            <Text style={styles.category}>{poi.category}</Text>
            <View style={styles.row}>
              <Text style={styles.rating}>★ {poi.rating}</Text>
              <Text style={styles.dot}>·</Text>
              <Text style={styles.distance}>{poi.distance}</Text>
              <Text style={styles.dot}>·</Text>
              <Text style={styles.price}>{poi.priceRange}</Text>
            </View>
            <View style={styles.vibes}>
              {poi.vibe.map((v) => (
                <View key={v} style={styles.vibePill}>
                  <Text style={styles.vibeText}>{v}</Text>
                </View>
              ))}
            </View>
          </View>
        </Pressable>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingHorizontal: 4, paddingVertical: 8, gap: 12 },
  card: { width: 200, borderRadius: 16, backgroundColor: COLORS.card, overflow: "hidden", borderWidth: 1, borderColor: COLORS.border },
  image: { width: "100%", height: 120, backgroundColor: COLORS.borderLight },
  badge: { position: "absolute", top: 8, right: 8, backgroundColor: "rgba(0,0,0,0.6)", borderRadius: 8, paddingHorizontal: 8, paddingVertical: 2 },
  badgeText: { color: "#fff", fontSize: 10, fontWeight: "600" },
  info: { padding: 12 },
  name: { fontSize: 14, fontWeight: "700", color: COLORS.text },
  category: { fontSize: 11, color: COLORS.textSecondary, marginTop: 2 },
  row: { flexDirection: "row", alignItems: "center", marginTop: 6, gap: 4 },
  rating: { fontSize: 12, fontWeight: "600", color: COLORS.warning },
  dot: { fontSize: 10, color: COLORS.textMuted },
  distance: { fontSize: 11, color: COLORS.textSecondary },
  price: { fontSize: 11, color: COLORS.textSecondary },
  vibes: { flexDirection: "row", flexWrap: "wrap", gap: 4, marginTop: 8 },
  vibePill: { backgroundColor: COLORS.primaryTint, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 2 },
  vibeText: { fontSize: 10, color: COLORS.primary, fontWeight: "600" },
});
