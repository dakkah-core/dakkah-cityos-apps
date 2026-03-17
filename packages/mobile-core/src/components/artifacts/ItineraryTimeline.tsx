import React, { useState } from "react";
import { View, Text, StyleSheet, Pressable, ScrollView } from "react-native";
import { COLORS } from "../../constants/colors";
import { categoryColors, colors } from "@cityos/design-tokens/native";
import type { ItineraryDay } from "../../types/chat";

interface Props {
  data: { days: ItineraryDay[] };
  onAction?: (action: string) => void;
}

const TYPE_COLORS: Record<string, string> = {
  culture: categoryColors.culture.fg,
  food: categoryColors.food.fg,
  shopping: categoryColors.shopping.fg,
  nature: categoryColors.nature.fg,
  landmark: categoryColors.landmark.fg,
  arts: categoryColors.arts.fg,
  leisure: categoryColors.leisure.fg,
};

export function ItineraryTimeline({ data, onAction }: Props) {
  const [activeDay, setActiveDay] = useState(0);
  const day = data.days[activeDay];

  return (
    <View style={styles.container}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabs}>
        {data.days.map((d, i) => (
          <Pressable key={d.day} onPress={() => setActiveDay(i)} style={[styles.tab, activeDay === i && styles.tabActive]}>
            <Text style={[styles.tabText, activeDay === i && styles.tabTextActive]}>Day {d.day}</Text>
          </Pressable>
        ))}
      </ScrollView>
      <Text style={styles.dayTitle}>{day.title}</Text>
      <View style={styles.timeline}>
        {day.items.map((item, i) => (
          <Pressable key={i} style={styles.timelineItem} onPress={() => onAction?.(`Tell me more about ${item.title}`)}>
            <View style={styles.timeCol}>
              <Text style={styles.time}>{item.time}</Text>
              {i < day.items.length - 1 && <View style={styles.line} />}
            </View>
            <View style={styles.dot}>
              <View style={[styles.dotInner, { backgroundColor: TYPE_COLORS[item.type] || COLORS.primary }]} />
            </View>
            <View style={styles.content}>
              <Text style={styles.itemTitle}>{item.title}</Text>
              <View style={styles.meta}>
                <Text style={styles.metaText}>{item.duration}</Text>
                {item.cost && (
                  <>
                    <Text style={styles.metaDot}>·</Text>
                    <Text style={styles.metaText}>{item.cost}</Text>
                  </>
                )}
              </View>
            </View>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 12 },
  tabs: { gap: 8, marginBottom: 12 },
  tab: { paddingHorizontal: 16, paddingVertical: 6, borderRadius: 20, backgroundColor: COLORS.chipBg, borderWidth: 1, borderColor: COLORS.chipBorder },
  tabActive: { backgroundColor: COLORS.darkNavy, borderColor: COLORS.darkNavy },
  tabText: { fontSize: 12, fontWeight: "600", color: COLORS.textSecondary },
  tabTextActive: { color: colors.text.light.inverse },
  dayTitle: { fontSize: 16, fontWeight: "700", color: COLORS.text, marginBottom: 12 },
  timeline: { gap: 0 },
  timelineItem: { flexDirection: "row", gap: 12, minHeight: 60 },
  timeCol: { width: 44, alignItems: "center" },
  time: { fontSize: 11, fontWeight: "600", color: COLORS.textSecondary },
  line: { flex: 1, width: 1, backgroundColor: COLORS.border, marginTop: 4 },
  dot: { width: 20, height: 20, alignItems: "center", justifyContent: "center", marginTop: 2 },
  dotInner: { width: 10, height: 10, borderRadius: 5, backgroundColor: COLORS.primary },
  content: { flex: 1, paddingBottom: 16 },
  itemTitle: { fontSize: 14, fontWeight: "600", color: COLORS.text },
  meta: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 2 },
  metaText: { fontSize: 11, color: COLORS.textMuted },
  metaDot: { fontSize: 10, color: COLORS.textMuted },
});
