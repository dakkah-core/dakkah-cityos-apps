import React from "react";
import { View, Text, Image, ScrollView, StyleSheet, Pressable } from "react-native";
import { COLORS } from "../../constants/colors";
import type { CityEvent } from "../../types/chat";
import type { DetailItem } from "../DetailsDrawer";

interface Props {
  data: { events: CityEvent[] };
  onAction?: (action: string) => void;
  onShowDetails?: (item: DetailItem) => void;
}

export function EventCarousel({ data, onAction, onShowDetails }: Props) {
  const handlePress = (evt: CityEvent) => {
    if (onShowDetails) {
      onShowDetails({ type: "event", data: evt });
    } else {
      onAction?.(`Tell me more about ${evt.name}`);
    }
  };

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scroll}>
      {data.events.map((evt) => (
        <Pressable key={evt.id} style={styles.card} onPress={() => handlePress(evt)}>
          <Image source={{ uri: evt.image }} style={styles.image} />
          <View style={styles.dateBadge}>
            <Text style={styles.dateBadgeText}>{evt.date}</Text>
          </View>
          <View style={styles.info}>
            <View style={styles.catRow}>
              <View style={styles.catPill}>
                <Text style={styles.catText}>{evt.category}</Text>
              </View>
              <Text style={styles.price}>{evt.price}</Text>
            </View>
            <Text style={styles.name} numberOfLines={2}>{evt.name}</Text>
            <Text style={styles.detail}>{evt.time} · {evt.location}</Text>
            <View style={styles.footer}>
              <Text style={styles.attendees}>{evt.attendees} attending</Text>
            </View>
          </View>
        </Pressable>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingHorizontal: 4, paddingVertical: 8, gap: 12 },
  card: { width: 220, borderRadius: 16, backgroundColor: COLORS.card, overflow: "hidden", borderWidth: 1, borderColor: COLORS.border },
  image: { width: "100%", height: 130, backgroundColor: COLORS.borderLight },
  dateBadge: { position: "absolute", top: 8, left: 8, backgroundColor: COLORS.primary, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 3 },
  dateBadgeText: { color: "#fff", fontSize: 11, fontWeight: "700" },
  info: { padding: 12 },
  catRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 4 },
  catPill: { backgroundColor: COLORS.primaryTint, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 2 },
  catText: { fontSize: 10, color: COLORS.primary, fontWeight: "600" },
  price: { fontSize: 12, fontWeight: "700", color: COLORS.text },
  name: { fontSize: 14, fontWeight: "700", color: COLORS.text, marginTop: 2 },
  detail: { fontSize: 11, color: COLORS.textSecondary, marginTop: 4 },
  footer: { marginTop: 8, flexDirection: "row", alignItems: "center" },
  attendees: { fontSize: 11, color: COLORS.textMuted },
});
