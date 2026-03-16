import React, { useState } from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { COLORS } from "../../constants/colors";

interface PollOption {
  label: string;
  votes: number;
}

interface Props {
  data: {
    question: string;
    options: PollOption[];
    totalVotes?: number;
  };
  onAction?: (action: string) => void;
}

export function PollCard({ data, onAction }: Props) {
  const [voted, setVoted] = useState<number | null>(null);
  const total = data.totalVotes || data.options.reduce((s, o) => s + o.votes, 0);

  return (
    <View style={styles.container}>
      <Text style={styles.question}>📊 {data.question}</Text>
      <View style={styles.options}>
        {data.options.map((opt, i) => {
          const pct = total > 0 ? Math.round((opt.votes / total) * 100) : 0;
          const isVoted = voted === i;
          return (
            <Pressable key={i} style={[styles.option, isVoted && styles.optionVoted]} onPress={() => { setVoted(i); onAction?.(`vote:${opt.label}`); }}>
              {voted !== null && <View style={[styles.bar, { width: `${pct}%` }]} />}
              <Text style={styles.optionLabel}>{opt.label}</Text>
              {voted !== null && <Text style={styles.pct}>{pct}%</Text>}
            </Pressable>
          );
        })}
      </View>
      <Text style={styles.total}>{total} votes</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: COLORS.card, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: COLORS.border },
  question: { fontSize: 15, fontWeight: "700", color: COLORS.text, marginBottom: 12 },
  options: { gap: 8, marginBottom: 8 },
  option: { borderRadius: 10, borderWidth: 1, borderColor: COLORS.border, paddingVertical: 10, paddingHorizontal: 14, flexDirection: "row", alignItems: "center", overflow: "hidden", position: "relative" },
  optionVoted: { borderColor: COLORS.primary },
  bar: { position: "absolute", left: 0, top: 0, bottom: 0, backgroundColor: COLORS.primaryTint, borderRadius: 10 },
  optionLabel: { fontSize: 13, fontWeight: "600", color: COLORS.text, flex: 1, zIndex: 1 },
  pct: { fontSize: 13, fontWeight: "700", color: COLORS.primary, zIndex: 1 },
  total: { fontSize: 11, color: COLORS.textMuted, textAlign: "center" },
});
