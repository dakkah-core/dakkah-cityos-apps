import React, { useState } from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { COLORS } from "../../constants/colors";

interface Option {
  label: string;
  value: string;
  price?: string;
  description?: string;
}

interface Props {
  data: {
    title?: string;
    type: "radio" | "checkbox";
    options: Option[];
    confirmLabel?: string;
  };
  onAction?: (action: string) => void;
}

export function FormGroup({ data, onAction }: Props) {
  const [selected, setSelected] = useState<string[]>([]);

  const toggle = (value: string) => {
    if (data.type === "radio") {
      setSelected([value]);
    } else {
      setSelected((prev) => prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]);
    }
  };

  return (
    <View style={styles.container}>
      {data.title && <Text style={styles.title}>{data.title}</Text>}
      <View style={styles.options}>
        {data.options.map((opt) => {
          const isSelected = selected.includes(opt.value);
          return (
            <Pressable key={opt.value} style={[styles.option, isSelected && styles.optionSelected]} onPress={() => toggle(opt.value)}>
              <View style={[styles.indicator, data.type === "radio" ? styles.radio : styles.checkbox, isSelected && styles.indicatorSelected]}>
                {isSelected && <View style={data.type === "radio" ? styles.radioDot : styles.checkMark} />}
              </View>
              <View style={styles.optionContent}>
                <Text style={[styles.optionLabel, isSelected && styles.optionLabelSelected]}>{opt.label}</Text>
                {opt.description && <Text style={styles.optionDesc}>{opt.description}</Text>}
              </View>
              {opt.price && <Text style={styles.price}>{opt.price}</Text>}
            </Pressable>
          );
        })}
      </View>
      {selected.length > 0 && (
        <Pressable style={styles.confirmBtn} onPress={() => onAction?.(`form:${selected.join(",")}`)}>
          <Text style={styles.confirmText}>{data.confirmLabel || "Confirm"}</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: COLORS.card, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: COLORS.border },
  title: { fontSize: 15, fontWeight: "700", color: COLORS.text, marginBottom: 12 },
  options: { gap: 8, marginBottom: 12 },
  option: { flexDirection: "row", alignItems: "center", padding: 12, borderRadius: 12, borderWidth: 1, borderColor: COLORS.border, gap: 12 },
  optionSelected: { borderColor: COLORS.primary, backgroundColor: COLORS.primaryTint },
  indicator: { width: 22, height: 22, alignItems: "center", justifyContent: "center", borderWidth: 2, borderColor: COLORS.border },
  radio: { borderRadius: 11 },
  checkbox: { borderRadius: 6 },
  indicatorSelected: { borderColor: COLORS.primary },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: COLORS.primary },
  checkMark: { width: 10, height: 10, borderRadius: 3, backgroundColor: COLORS.primary },
  optionContent: { flex: 1 },
  optionLabel: { fontSize: 14, fontWeight: "600", color: COLORS.text },
  optionLabelSelected: { color: COLORS.primary },
  optionDesc: { fontSize: 12, color: COLORS.textSecondary, marginTop: 2 },
  price: { fontSize: 14, fontWeight: "700", color: COLORS.text },
  confirmBtn: { backgroundColor: COLORS.darkNavy, borderRadius: 10, paddingVertical: 12, alignItems: "center" },
  confirmText: { fontSize: 14, fontWeight: "700", color: "#fff" },
});
