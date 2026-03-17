import React, { useCallback, useState } from "react";
import { View, Text, StyleSheet, Pressable, Modal, Image } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { COLORS } from "../constants/colors";
import type { MessageAttachment } from "../types/chat";

interface Props {
  onAttach: (attachment: MessageAttachment) => void;
  disabled?: boolean;
}

export function MediaPickerButton({ onAttach, disabled }: Props) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  const pickImage = useCallback(async (source: "library" | "camera") => {
    setMenuOpen(false);

    let result: ImagePicker.ImagePickerResult;
    if (source === "camera") {
      const perm = await ImagePicker.requestCameraPermissionsAsync();
      if (!perm.granted) return;
      result = await ImagePicker.launchCameraAsync({
        mediaTypes: ["images"],
        quality: 0.8,
        allowsEditing: true,
      });
    } else {
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!perm.granted) return;
      result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        quality: 0.8,
        allowsEditing: true,
      });
    }

    if (!result.canceled && result.assets?.[0]) {
      const asset = result.assets[0];
      const attachment: MessageAttachment = {
        uri: asset.uri,
        type: "image",
        name: asset.fileName || "photo.jpg",
        size: asset.fileSize,
        mimeType: asset.mimeType || "image/jpeg",
      };
      setPreview(asset.uri);
      setTimeout(() => setPreview(null), 2000);
      onAttach(attachment);
    }
  }, [onAttach]);

  return (
    <>
      <Pressable style={[styles.btn, disabled && styles.disabled]} onPress={() => setMenuOpen(true)} disabled={disabled}>
        <Text style={styles.icon}>📎</Text>
      </Pressable>

      <Modal visible={menuOpen} transparent animationType="fade" onRequestClose={() => setMenuOpen(false)}>
        <Pressable style={styles.overlay} onPress={() => setMenuOpen(false)}>
          <View style={styles.menu}>
            <Text style={styles.menuTitle}>Attach</Text>
            <Pressable style={styles.menuItem} onPress={() => pickImage("library")}>
              <Text style={styles.menuIcon}>🖼️</Text>
              <Text style={styles.menuText}>Photo Library</Text>
            </Pressable>
            <Pressable style={styles.menuItem} onPress={() => pickImage("camera")}>
              <Text style={styles.menuIcon}>📷</Text>
              <Text style={styles.menuText}>Take Photo</Text>
            </Pressable>
            <Pressable style={[styles.menuItem, styles.cancelItem]} onPress={() => setMenuOpen(false)}>
              <Text style={styles.cancelText}>Cancel</Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>

      {preview && (
        <View style={styles.previewBadge}>
          <Image source={{ uri: preview }} style={styles.previewImg} />
          <Text style={styles.previewText}>Attached</Text>
        </View>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  btn: { width: 36, height: 36, borderRadius: 18, backgroundColor: COLORS.chipBg, alignItems: "center", justifyContent: "center" },
  disabled: { opacity: 0.3 },
  icon: { fontSize: 16 },
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
  menu: { backgroundColor: "#fff", borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, gap: 4 },
  menuTitle: { fontSize: 18, fontWeight: "700", color: COLORS.text, marginBottom: 12 },
  menuItem: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 14, paddingHorizontal: 8, borderRadius: 12 },
  menuIcon: { fontSize: 20 },
  menuText: { fontSize: 16, color: COLORS.text, fontWeight: "500" },
  cancelItem: { justifyContent: "center", marginTop: 8, borderTopWidth: 1, borderTopColor: COLORS.border },
  cancelText: { fontSize: 16, color: COLORS.danger, fontWeight: "600", textAlign: "center" },
  previewBadge: { position: "absolute", bottom: 60, right: 12, flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: COLORS.primaryTint, borderRadius: 8, padding: 4 },
  previewImg: { width: 24, height: 24, borderRadius: 4 },
  previewText: { fontSize: 10, color: COLORS.primary, fontWeight: "600" },
});
