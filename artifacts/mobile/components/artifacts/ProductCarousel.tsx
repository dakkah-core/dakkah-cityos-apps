import React from "react";
import { View, Text, Image, ScrollView, StyleSheet, Pressable } from "react-native";
import { COLORS } from "../../constants/colors";
import type { Product } from "../../types/chat";
import type { DetailItem } from "../DetailsDrawer";

interface Props {
  data: { products: Product[] };
  onAction?: (action: string) => void;
  onShowDetails?: (item: DetailItem) => void;
}

export function ProductCarousel({ data, onAction, onShowDetails }: Props) {
  const handlePress = (p: Product) => {
    if (onShowDetails) {
      onShowDetails({ type: "product", data: p });
    } else {
      onAction?.(`Tell me more about ${p.name}`);
    }
  };

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scroll}>
      {data.products.map((p) => (
        <Pressable key={p.id} style={styles.card} onPress={() => handlePress(p)}>
          <Image source={{ uri: p.image }} style={styles.image} />
          <View style={styles.info}>
            <Text style={styles.brand}>{p.brand}</Text>
            <Text style={styles.name} numberOfLines={1}>{p.name}</Text>
            <Text style={styles.price}>{p.price}</Text>
            {p.tags && (
              <View style={styles.tags}>
                {p.tags.map((t) => (
                  <View key={t} style={styles.tag}>
                    <Text style={styles.tagText}>{t}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        </Pressable>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingHorizontal: 4, paddingVertical: 8, gap: 12 },
  card: { width: 160, borderRadius: 14, backgroundColor: COLORS.card, overflow: "hidden", borderWidth: 1, borderColor: COLORS.border },
  image: { width: "100%", height: 120, backgroundColor: COLORS.borderLight },
  info: { padding: 10 },
  brand: { fontSize: 10, fontWeight: "600", color: COLORS.textMuted, textTransform: "uppercase", letterSpacing: 0.5 },
  name: { fontSize: 13, fontWeight: "700", color: COLORS.text, marginTop: 2 },
  price: { fontSize: 14, fontWeight: "800", color: COLORS.primary, marginTop: 4 },
  tags: { flexDirection: "row", gap: 4, marginTop: 6 },
  tag: { backgroundColor: COLORS.chipBg, borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 },
  tagText: { fontSize: 9, fontWeight: "600", color: COLORS.textSecondary },
});
