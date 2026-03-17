import React from "react";
import { View, Text, StyleSheet, Pressable, ScrollView } from "react-native";
import { COLORS } from "../../constants/colors";

interface Props {
  data: { question?: string; options: string[] };
  onAction?: (action: string) => void;
}

export function SelectionChips({ data, onAction }: Props) {
  return (
    <View style={styles.container}>
      {data.question && <Text style={styles.question}>{data.question}</Text>}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
        {data.options.map((opt) => (
          <Pressable key={opt} style={styles.chip} onPress={() => onAction?.(opt)}>
            <Text style={styles.chipText}>{opt}</Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingVertical: 4 },
  question: { fontSize: 11, fontWeight: "600", color: COLORS.textMuted, marginBottom: 6, paddingHorizontal: 4 },
  chips: { gap: 8, paddingHorizontal: 4 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: COLORS.card, borderWidth: 1, borderColor: COLORS.border },
  chipText: { fontSize: 12, fontWeight: "600", color: COLORS.text },
});
