import React from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";
import { COLORS } from "../../constants/colors";

interface Props {
  data: {
    criteria: string[];
    items: { name: string; values: Record<string, string | number> }[];
  };
}

export function ComparisonTable({ data }: Props) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <View style={styles.table}>
        <View style={styles.headerRow}>
          <View style={styles.labelCell}>
            <Text style={styles.labelCellText}>Criteria</Text>
          </View>
          {data.items.map((item) => (
            <View key={item.name} style={styles.headerCell}>
              <Text style={styles.headerText} numberOfLines={2}>{item.name}</Text>
            </View>
          ))}
        </View>
        {data.criteria.map((criterion, i) => (
          <View key={criterion} style={[styles.row, i % 2 === 0 && styles.rowAlt]}>
            <View style={styles.labelCell}>
              <Text style={styles.criterionText}>{criterion}</Text>
            </View>
            {data.items.map((item) => (
              <View key={item.name} style={styles.valueCell}>
                <Text style={styles.valueText}>{item.values[criterion] ?? "-"}</Text>
              </View>
            ))}
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  table: { borderRadius: 12, overflow: "hidden", borderWidth: 1, borderColor: COLORS.border },
  headerRow: { flexDirection: "row", backgroundColor: COLORS.darkNavy },
  headerCell: { width: 100, padding: 10, alignItems: "center", justifyContent: "center" },
  headerText: { fontSize: 11, fontWeight: "700", color: "#fff", textAlign: "center" },
  labelCell: { width: 90, padding: 10, justifyContent: "center" },
  labelCellText: { fontSize: 11, fontWeight: "700", color: "#fff" },
  row: { flexDirection: "row", backgroundColor: COLORS.card },
  rowAlt: { backgroundColor: COLORS.borderLight },
  criterionText: { fontSize: 11, fontWeight: "600", color: COLORS.textSecondary },
  valueCell: { width: 100, padding: 10, alignItems: "center", justifyContent: "center" },
  valueText: { fontSize: 12, fontWeight: "600", color: COLORS.text },
});
