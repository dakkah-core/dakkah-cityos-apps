import React, { useState } from "react";
import { View, Text, TextInput, Pressable, Modal, StyleSheet, ScrollView, Alert } from "react-native";
import { COLORS } from "@/constants/colors";

interface Props {
  visible: boolean;
  onClose: () => void;
}

const CATEGORIES = ["General", "Bug Report", "Feature Request", "Billing", "Account", "Other"];

export function SupportDialog({ visible, onClose }: Props) {
  const [category, setCategory] = useState("General");
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");

  const handleSubmit = () => {
    if (!subject.trim() || !description.trim()) {
      Alert.alert("Required", "Please fill in both subject and description.");
      return;
    }
    Alert.alert("Submitted", "Your support request has been submitted. We'll get back to you soon!");
    setSubject("");
    setDescription("");
    setCategory("General");
    onClose();
  };

  return (
    <Modal transparent animationType="slide" visible={visible} onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <View style={styles.handle} />
          <Text style={styles.title}>Help & Support</Text>
          <ScrollView keyboardShouldPersistTaps="handled">
            <Text style={styles.label}>Category</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catRow}>
              {CATEGORIES.map((cat) => (
                <Pressable key={cat} style={[styles.catChip, category === cat && styles.catChipActive]} onPress={() => setCategory(cat)}>
                  <Text style={[styles.catText, category === cat && styles.catTextActive]}>{cat}</Text>
                </Pressable>
              ))}
            </ScrollView>
            <Text style={styles.label}>Subject</Text>
            <TextInput
              style={styles.input}
              placeholder="Brief description of your issue"
              placeholderTextColor={COLORS.textMuted}
              value={subject}
              onChangeText={setSubject}
            />
            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[styles.input, styles.textarea]}
              placeholder="Please describe your issue in detail..."
              placeholderTextColor={COLORS.textMuted}
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </ScrollView>
          <View style={styles.footer}>
            <Pressable style={styles.cancelBtn} onPress={onClose}>
              <Text style={styles.cancelText}>Cancel</Text>
            </Pressable>
            <Pressable style={styles.submitBtn} onPress={handleSubmit}>
              <Text style={styles.submitText}>Submit</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: COLORS.overlay, justifyContent: "flex-end" },
  sheet: { backgroundColor: COLORS.surfaceWhite, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, maxHeight: "80%", paddingBottom: 40 },
  handle: { width: 40, height: 4, borderRadius: 2, backgroundColor: COLORS.border, alignSelf: "center", marginBottom: 16 },
  title: { fontSize: 18, fontWeight: "700", color: COLORS.text, textAlign: "center", marginBottom: 16 },
  label: { fontSize: 13, fontWeight: "600", color: COLORS.textSecondary, marginBottom: 6, marginTop: 12 },
  catRow: { flexDirection: "row", marginBottom: 4 },
  catChip: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 16, backgroundColor: COLORS.surface, marginRight: 8, borderWidth: 1, borderColor: COLORS.border },
  catChipActive: { backgroundColor: COLORS.primaryTint, borderColor: COLORS.primary },
  catText: { fontSize: 12, color: COLORS.textSecondary },
  catTextActive: { color: COLORS.primary, fontWeight: "600" },
  input: { backgroundColor: COLORS.surface, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10, fontSize: 14, color: COLORS.text, borderWidth: 1, borderColor: COLORS.border },
  textarea: { minHeight: 100 },
  footer: { flexDirection: "row", gap: 12, marginTop: 20 },
  cancelBtn: { flex: 1, paddingVertical: 12, borderRadius: 12, backgroundColor: COLORS.surface, alignItems: "center" },
  cancelText: { fontSize: 14, fontWeight: "600", color: COLORS.textSecondary },
  submitBtn: { flex: 1, paddingVertical: 12, borderRadius: 12, backgroundColor: COLORS.primary, alignItems: "center" },
  submitText: { fontSize: 14, fontWeight: "600", color: "#fff" },
});
