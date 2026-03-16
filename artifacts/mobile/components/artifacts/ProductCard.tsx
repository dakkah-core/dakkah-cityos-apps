import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { COLORS } from "../../constants/colors";

interface ProductCardData {
  name: string;
  brand: string;
  price: string;
  rating: number;
  reviews: number;
  description: string;
  features: string[];
  inStock: boolean;
}

interface Props {
  data: ProductCardData;
  onAction?: (action: string) => void;
}

export function ProductCard({ data, onAction }: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.imagePlaceholder}>
        <Text style={styles.imageIcon}>📦</Text>
        {!data.inStock && (
          <View style={styles.outOfStock}>
            <Text style={styles.outOfStockText}>Out of Stock</Text>
          </View>
        )}
      </View>
      <View style={styles.content}>
        <Text style={styles.brand}>{data.brand}</Text>
        <Text style={styles.name}>{data.name}</Text>
        <View style={styles.ratingRow}>
          <Text style={styles.stars}>{"★".repeat(Math.floor(data.rating))}{"☆".repeat(5 - Math.floor(data.rating))}</Text>
          <Text style={styles.ratingText}>{data.rating}</Text>
          <Text style={styles.reviewCount}>({data.reviews} reviews)</Text>
        </View>
        <Text style={styles.description}>{data.description}</Text>
        <View style={styles.features}>
          {data.features.map((f, i) => (
            <View key={i} style={styles.featureChip}>
              <Text style={styles.featureText}>✓ {f}</Text>
            </View>
          ))}
        </View>
        <View style={styles.footer}>
          <Text style={styles.price}>{data.price}</Text>
          <TouchableOpacity
            style={[styles.cartButton, !data.inStock && styles.cartButtonDisabled]}
            onPress={() => data.inStock && onAction?.("add-to-cart")}
            disabled={!data.inStock}
          >
            <Text style={styles.cartButtonText}>{data.inStock ? "Add to Cart" : "Notify Me"}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: COLORS.card, borderRadius: 16, overflow: "hidden", borderWidth: 1, borderColor: COLORS.border },
  imagePlaceholder: { height: 160, backgroundColor: COLORS.borderLight, alignItems: "center", justifyContent: "center" },
  imageIcon: { fontSize: 56 },
  outOfStock: { position: "absolute", top: 12, right: 12, backgroundColor: COLORS.textMuted, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  outOfStockText: { fontSize: 10, fontWeight: "700", color: "#fff" },
  content: { padding: 16 },
  brand: { fontSize: 11, fontWeight: "600", color: COLORS.primary, textTransform: "uppercase", letterSpacing: 1, marginBottom: 2 },
  name: { fontSize: 18, fontWeight: "700", color: COLORS.text, marginBottom: 6 },
  ratingRow: { flexDirection: "row", alignItems: "center", gap: 4, marginBottom: 8 },
  stars: { fontSize: 14, color: COLORS.warning },
  ratingText: { fontSize: 13, fontWeight: "700", color: COLORS.text },
  reviewCount: { fontSize: 12, color: COLORS.textMuted },
  description: { fontSize: 13, color: COLORS.textSecondary, lineHeight: 18, marginBottom: 12 },
  features: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginBottom: 16 },
  featureChip: { backgroundColor: COLORS.primaryTint, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 },
  featureText: { fontSize: 11, fontWeight: "600", color: COLORS.primary },
  footer: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  price: { fontSize: 22, fontWeight: "800", color: COLORS.text },
  cartButton: { backgroundColor: COLORS.primary, borderRadius: 12, paddingHorizontal: 20, paddingVertical: 10 },
  cartButtonDisabled: { backgroundColor: COLORS.textMuted },
  cartButtonText: { fontSize: 13, fontWeight: "700", color: "#fff" },
});
