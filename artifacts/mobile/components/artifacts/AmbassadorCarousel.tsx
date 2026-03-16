import React from "react";
import { View, Text, Image, ScrollView, StyleSheet, Pressable } from "react-native";
import { COLORS } from "../../constants/colors";
import type { Ambassador } from "../../types/chat";

interface Props {
  data: { ambassadors: Ambassador[] };
  onAction?: (action: string) => void;
}

export function AmbassadorCarousel({ data, onAction }: Props) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scroll}>
      {data.ambassadors.map((amb) => (
        <Pressable key={amb.id} style={styles.card} onPress={() => onAction?.(`Connect me with ${amb.name}`)}>
          <View style={styles.header}>
            <Image source={{ uri: amb.avatar }} style={styles.avatar} />
            {amb.verified && (
              <View style={styles.verifiedBadge}>
                <Text style={styles.verifiedText}>✓</Text>
              </View>
            )}
          </View>
          <Text style={styles.name}>{amb.name}</Text>
          <Text style={styles.specialty}>{amb.specialty}</Text>
          <View style={styles.scoreRow}>
            <View style={styles.scoreBg}>
              <View style={[styles.scoreFill, { width: `${amb.fitScore}%` }]} />
            </View>
            <Text style={styles.scoreText}>{amb.fitScore}%</Text>
          </View>
          <Text style={styles.reviews}>{amb.reviews} reviews</Text>
        </Pressable>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingHorizontal: 4, paddingVertical: 8, gap: 12 },
  card: { width: 160, borderRadius: 16, backgroundColor: COLORS.card, padding: 16, alignItems: "center", borderWidth: 1, borderColor: COLORS.border },
  header: { position: "relative", marginBottom: 8 },
  avatar: { width: 64, height: 64, borderRadius: 32, backgroundColor: COLORS.borderLight },
  verifiedBadge: { position: "absolute", bottom: 0, right: -4, width: 20, height: 20, borderRadius: 10, backgroundColor: COLORS.primary, alignItems: "center", justifyContent: "center", borderWidth: 2, borderColor: "#fff" },
  verifiedText: { color: "#fff", fontSize: 10, fontWeight: "700" },
  name: { fontSize: 13, fontWeight: "700", color: COLORS.text, textAlign: "center" },
  specialty: { fontSize: 11, color: COLORS.textSecondary, textAlign: "center", marginTop: 2 },
  scoreRow: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 10, width: "100%" },
  scoreBg: { flex: 1, height: 4, borderRadius: 2, backgroundColor: COLORS.borderLight, overflow: "hidden" },
  scoreFill: { height: "100%", borderRadius: 2, backgroundColor: COLORS.primary },
  scoreText: { fontSize: 11, fontWeight: "700", color: COLORS.primary },
  reviews: { fontSize: 10, color: COLORS.textMuted, marginTop: 4 },
});
