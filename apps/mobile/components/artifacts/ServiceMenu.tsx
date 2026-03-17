import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { COLORS } from "../../constants/colors";
import type { ServiceItem } from "../../types/chat";

interface Props {
  data: { services: ServiceItem[] };
  onAction?: (action: string) => void;
}

export function ServiceMenu({ data, onAction }: Props) {
  return (
    <View style={styles.container}>
      {data.services.map((s) => (
        <Pressable key={s.id} style={styles.item} onPress={() => onAction?.(`Book ${s.name}`)}>
          <View style={styles.left}>
            <Text style={styles.name}>{s.name}</Text>
            <Text style={styles.desc}>{s.description}</Text>
            <View style={styles.meta}>
              <Text style={styles.metaText}>{s.duration}</Text>
              {s.rating && (
                <>
                  <Text style={styles.dot}>·</Text>
                  <Text style={styles.metaText}>★ {s.rating}</Text>
                </>
              )}
            </View>
          </View>
          <View style={styles.priceCol}>
            <Text style={styles.price}>{s.price}</Text>
            <View style={styles.bookBtn}>
              <Text style={styles.bookText}>Book</Text>
            </View>
          </View>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: COLORS.card, borderRadius: 16, overflow: "hidden", borderWidth: 1, borderColor: COLORS.border },
  item: { flexDirection: "row", padding: 14, borderBottomWidth: 1, borderBottomColor: COLORS.borderLight },
  left: { flex: 1, marginRight: 12 },
  name: { fontSize: 14, fontWeight: "700", color: COLORS.text },
  desc: { fontSize: 11, color: COLORS.textSecondary, marginTop: 2 },
  meta: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 6 },
  metaText: { fontSize: 11, color: COLORS.textMuted },
  dot: { fontSize: 10, color: COLORS.textMuted },
  priceCol: { alignItems: "flex-end", justifyContent: "center", gap: 6 },
  price: { fontSize: 15, fontWeight: "800", color: COLORS.text },
  bookBtn: { backgroundColor: COLORS.primary, borderRadius: 8, paddingHorizontal: 14, paddingVertical: 5 },
  bookText: { fontSize: 11, fontWeight: "700", color: "#fff" },
});
