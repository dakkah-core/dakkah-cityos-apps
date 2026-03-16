import React, { useState } from "react";
import { View, Text, StyleSheet, Pressable, Image } from "react-native";
import { COLORS } from "../../constants/colors";

interface Props {
  data: {
    title: string;
    artist?: string;
    albumArt?: string;
    duration?: string;
    type?: "audio" | "video";
  };
  onAction?: (action: string) => void;
}

export function MediaPlayer({ data, onAction }: Props) {
  const [playing, setPlaying] = useState(false);
  const [progress] = useState(0.35);

  return (
    <View style={styles.container}>
      {data.albumArt && (
        <Image source={{ uri: data.albumArt }} style={styles.albumArt} resizeMode="cover" />
      )}
      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={1}>{data.title}</Text>
        {data.artist && <Text style={styles.artist}>{data.artist}</Text>}
      </View>
      <View style={styles.progressContainer}>
        <View style={styles.progressBg}>
          <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
        </View>
        <View style={styles.timeRow}>
          <Text style={styles.time}>1:24</Text>
          <Text style={styles.time}>{data.duration || "3:45"}</Text>
        </View>
      </View>
      <View style={styles.controls}>
        <Pressable onPress={() => onAction?.("prev")}>
          <Text style={styles.controlIcon}>⏮</Text>
        </Pressable>
        <Pressable style={styles.playBtn} onPress={() => { setPlaying(!playing); onAction?.(playing ? "pause" : "play"); }}>
          <Text style={styles.playIcon}>{playing ? "⏸" : "▶️"}</Text>
        </Pressable>
        <Pressable onPress={() => onAction?.("next")}>
          <Text style={styles.controlIcon}>⏭</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: COLORS.card, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: COLORS.border, alignItems: "center" },
  albumArt: { width: 200, height: 200, borderRadius: 12, marginBottom: 16 },
  info: { alignItems: "center", marginBottom: 12 },
  title: { fontSize: 16, fontWeight: "700", color: COLORS.text },
  artist: { fontSize: 13, color: COLORS.textSecondary, marginTop: 2 },
  progressContainer: { width: "100%", marginBottom: 16 },
  progressBg: { height: 4, backgroundColor: COLORS.border, borderRadius: 2, overflow: "hidden" },
  progressFill: { height: "100%", backgroundColor: COLORS.primary, borderRadius: 2 },
  timeRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 4 },
  time: { fontSize: 11, color: COLORS.textMuted },
  controls: { flexDirection: "row", alignItems: "center", gap: 32 },
  controlIcon: { fontSize: 22 },
  playBtn: { width: 52, height: 52, borderRadius: 26, backgroundColor: COLORS.darkNavy, alignItems: "center", justifyContent: "center" },
  playIcon: { fontSize: 22 },
});
