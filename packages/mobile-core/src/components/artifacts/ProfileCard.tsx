import React from "react";
import { View, Text, StyleSheet, Pressable, Image } from "react-native";
import { COLORS } from "../../constants/colors";

interface Props {
  data: {
    name: string;
    title?: string;
    avatar?: string;
    bio?: string;
    stats?: { label: string; value: string }[];
    tags?: string[];
    verified?: boolean;
  };
  onAction?: (action: string) => void;
}

export function ProfileCard({ data, onAction }: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        {data.avatar ? (
          <Image source={{ uri: data.avatar }} style={styles.avatar} />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarText}>{data.name.charAt(0)}</Text>
          </View>
        )}
        <View style={styles.info}>
          <View style={styles.nameRow}>
            <Text style={styles.name}>{data.name}</Text>
            {data.verified && <Text style={styles.verified}>✓</Text>}
          </View>
          {data.title && <Text style={styles.title}>{data.title}</Text>}
        </View>
      </View>
      {data.bio && <Text style={styles.bio}>{data.bio}</Text>}
      {data.stats && data.stats.length > 0 && (
        <View style={styles.stats}>
          {data.stats.map((s, i) => (
            <View key={i} style={styles.stat}>
              <Text style={styles.statValue}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>
      )}
      {data.tags && data.tags.length > 0 && (
        <View style={styles.tags}>
          {data.tags.map((tag, i) => (
            <View key={i} style={styles.tag}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
        </View>
      )}
      <View style={styles.actions}>
        <Pressable style={styles.followBtn} onPress={() => onAction?.("follow")}>
          <Text style={styles.followText}>Follow</Text>
        </Pressable>
        <Pressable style={styles.messageBtn} onPress={() => onAction?.("message")}>
          <Text style={styles.messageText}>Message</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: COLORS.card, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: COLORS.border },
  header: { flexDirection: "row", gap: 12, marginBottom: 12 },
  avatar: { width: 52, height: 52, borderRadius: 26 },
  avatarPlaceholder: { width: 52, height: 52, borderRadius: 26, backgroundColor: COLORS.primaryTint, alignItems: "center", justifyContent: "center" },
  avatarText: { fontSize: 22, fontWeight: "700", color: COLORS.primary },
  info: { flex: 1, justifyContent: "center" },
  nameRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  name: { fontSize: 16, fontWeight: "700", color: COLORS.text },
  verified: { fontSize: 12, fontWeight: "700", color: COLORS.primary, backgroundColor: COLORS.primaryTint, width: 18, height: 18, borderRadius: 9, textAlign: "center", lineHeight: 18 },
  title: { fontSize: 13, color: COLORS.textSecondary, marginTop: 2 },
  bio: { fontSize: 13, color: COLORS.textSecondary, lineHeight: 18, marginBottom: 12 },
  stats: { flexDirection: "row", gap: 20, marginBottom: 12 },
  stat: { alignItems: "center" },
  statValue: { fontSize: 16, fontWeight: "700", color: COLORS.text },
  statLabel: { fontSize: 11, color: COLORS.textMuted },
  tags: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginBottom: 12 },
  tag: { backgroundColor: COLORS.surface, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  tagText: { fontSize: 11, fontWeight: "600", color: COLORS.textSecondary },
  actions: { flexDirection: "row", gap: 8 },
  followBtn: { flex: 1, backgroundColor: COLORS.darkNavy, borderRadius: 10, paddingVertical: 10, alignItems: "center" },
  followText: { fontSize: 13, fontWeight: "700", color: "#fff" },
  messageBtn: { flex: 1, borderRadius: 10, paddingVertical: 10, alignItems: "center", borderWidth: 1, borderColor: COLORS.border },
  messageText: { fontSize: 13, fontWeight: "600", color: COLORS.text },
});
