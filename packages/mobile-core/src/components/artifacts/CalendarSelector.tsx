import React, { useState } from "react";
import { View, Text, StyleSheet, Pressable, ScrollView } from "react-native";
import { COLORS } from "../../constants/colors";

interface TimeSlot {
  time: string;
  available: boolean;
}

interface DateOption {
  date: string;
  day: string;
  dayNum: number;
  available: boolean;
}

interface Props {
  data: {
    title?: string;
    dates: DateOption[];
    timeSlots: TimeSlot[];
  };
  onAction?: (action: string) => void;
}

export function CalendarSelector({ data, onAction }: Props) {
  const [selectedDate, setSelectedDate] = useState<number | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  return (
    <View style={styles.container}>
      {data.title && <Text style={styles.title}>{data.title}</Text>}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.dateStrip}>
        {data.dates.map((d, i) => (
          <Pressable
            key={i}
            style={[styles.dateCard, selectedDate === i && styles.dateSelected, !d.available && styles.dateUnavailable]}
            onPress={() => d.available && setSelectedDate(i)}
          >
            <Text style={[styles.dayLabel, selectedDate === i && styles.dayLabelSelected]}>{d.day}</Text>
            <Text style={[styles.dayNum, selectedDate === i && styles.dayNumSelected]}>{d.dayNum}</Text>
          </Pressable>
        ))}
      </ScrollView>
      <View style={styles.timeGrid}>
        {data.timeSlots.map((slot, i) => (
          <Pressable
            key={i}
            style={[styles.timeSlot, selectedTime === slot.time && styles.timeSelected, !slot.available && styles.timeUnavailable]}
            onPress={() => {
              if (slot.available) {
                setSelectedTime(slot.time);
                onAction?.(`book:${selectedDate !== null ? data.dates[selectedDate].date : ""}:${slot.time}`);
              }
            }}
          >
            <Text style={[styles.timeText, selectedTime === slot.time && styles.timeTextSelected, !slot.available && styles.timeTextUnavailable]}>{slot.time}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: COLORS.card, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: COLORS.border },
  title: { fontSize: 15, fontWeight: "700", color: COLORS.text, marginBottom: 12 },
  dateStrip: { marginBottom: 16 },
  dateCard: { alignItems: "center", paddingVertical: 10, paddingHorizontal: 14, borderRadius: 12, borderWidth: 1, borderColor: COLORS.border, marginRight: 8, minWidth: 52 },
  dateSelected: { backgroundColor: COLORS.darkNavy, borderColor: COLORS.darkNavy },
  dateUnavailable: { opacity: 0.35 },
  dayLabel: { fontSize: 11, color: COLORS.textSecondary, fontWeight: "600", marginBottom: 2 },
  dayLabelSelected: { color: "#fff" },
  dayNum: { fontSize: 18, fontWeight: "700", color: COLORS.text },
  dayNumSelected: { color: "#fff" },
  timeGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  timeSlot: { paddingVertical: 8, paddingHorizontal: 14, borderRadius: 10, borderWidth: 1, borderColor: COLORS.border },
  timeSelected: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  timeUnavailable: { opacity: 0.3 },
  timeText: { fontSize: 13, fontWeight: "600", color: COLORS.text },
  timeTextSelected: { color: "#fff" },
  timeTextUnavailable: { color: COLORS.textMuted },
});
