import React, { useState } from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { COLORS } from "../../constants/colors";

interface Props {
  data: {
    title?: string;
    duration: string;
    sender?: string;
    timestamp?: string;
    transcript?: string;
  };
  onAction?: (action: string) => void;
}

export function VoiceNote({ data, onAction }: Props) {
  const [playing, setPlaying] = useState(false);
  const [showTranscript, setShowTranscript] = useState(false);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable style={styles.playBtn} onPress={() => { setPlaying(!playing); onAction?.(playing ? "pause" : "play"); }}>
          <Text style={styles.playIcon}>{playing ? "⏸" : "▶️"}</Text>
        </Pressable>
        <View style={styles.waveform}>
          {Array.from({ length: 20 }).map((_, i) => (
            <View key={i} style={[styles.bar, { height: 6 + Math.random() * 18 }]} />
          ))}
        </View>
        <Text style={styles.duration}>{data.duration}</Text>
      </View>
      {data.sender && <Text style={styles.sender}>{data.sender}</Text>}
      {data.timestamp && <Text style={styles.time}>{data.timestamp}</Text>}
      {data.transcript && (
        <>
          <Pressable onPress={() => setShowTranscript(!showTranscript)}>
            <Text style={styles.transcriptToggle}>{showTranscript ? "Hide" : "Show"} transcript</Text>
          </Pressable>
          {showTranscript && <Text style={styles.transcript}>{data.transcript}</Text>}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: COLORS.card, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: COLORS.border },
  header: { flexDirection: "row", alignItems: "center", gap: 10 },
  playBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.darkNavy, alignItems: "center", justifyContent: "center" },
  playIcon: { fontSize: 16 },
  waveform: { flex: 1, flexDirection: "row", alignItems: "center", gap: 2, height: 30 },
  bar: { width: 3, backgroundColor: COLORS.primary, borderRadius: 2 },
  duration: { fontSize: 12, color: COLORS.textMuted, fontWeight: "600" },
  sender: { fontSize: 13, fontWeight: "600", color: COLORS.text, marginTop: 8 },
  time: { fontSize: 11, color: COLORS.textMuted, marginTop: 2 },
  transcriptToggle: { fontSize: 12, color: COLORS.primary, fontWeight: "600", marginTop: 8 },
  transcript: { fontSize: 12, color: COLORS.textSecondary, lineHeight: 18, marginTop: 6, backgroundColor: COLORS.surface, borderRadius: 8, padding: 10 },
});
