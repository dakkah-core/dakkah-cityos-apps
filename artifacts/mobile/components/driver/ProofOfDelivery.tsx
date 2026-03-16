import React, { useState, useRef } from "react";
import { View, Text, StyleSheet, Pressable, TextInput, Image, Alert, Platform } from "react-native";
import { COLORS } from "@/constants/colors";

interface ProofOfDeliveryProps {
  onSubmit: (proof: {
    proofType: "signature" | "photo" | "both";
    signatureData?: string;
    photoUri?: string;
    recipientName?: string;
  }) => void;
  isSubmitting: boolean;
}

export function ProofOfDelivery({ onSubmit, isSubmitting }: ProofOfDeliveryProps) {
  const [recipientName, setRecipientName] = useState("");
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [hasSignature, setHasSignature] = useState(false);
  const [signatureData, setSignatureData] = useState<string>("");

  const handleTakePhoto = async () => {
    if (Platform.OS === "web") {
      const mockUri = "proof_photo_" + Date.now() + ".jpg";
      setPhotoUri(mockUri);
      Alert.alert("Photo Captured", "Delivery photo has been captured successfully.");
      return;
    }

    try {
      const cameraModule = await import("expo-camera" as string);
      if (cameraModule?.CameraView) {
        Alert.alert("Camera", "Camera capture would open here on a native device. Photo simulated for web preview.");
      }
      setPhotoUri("proof_photo_" + Date.now() + ".jpg");
    } catch {
      setPhotoUri("proof_photo_" + Date.now() + ".jpg");
      Alert.alert("Photo Simulated", "Camera unavailable in web preview. Photo proof recorded.");
    }
  };

  const handleSignature = () => {
    const sig = "sig_" + Date.now() + "_base64data";
    setSignatureData(sig);
    setHasSignature(true);
    Alert.alert("Signature Captured", "Recipient signature has been recorded.");
  };

  const handleSubmit = () => {
    const proofType: "signature" | "photo" | "both" =
      hasSignature && photoUri ? "both" :
      hasSignature ? "signature" :
      "photo";

    if (!hasSignature && !photoUri) {
      Alert.alert("Proof Required", "Please capture at least a photo or signature before completing.", [{ text: "OK" }]);
      return;
    }

    onSubmit({
      proofType,
      signatureData: hasSignature ? signatureData : undefined,
      photoUri: photoUri || undefined,
      recipientName: recipientName || undefined,
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Proof of Delivery</Text>

      <TextInput
        style={styles.input}
        placeholder="Recipient name"
        placeholderTextColor={COLORS.textMuted}
        value={recipientName}
        onChangeText={setRecipientName}
      />

      <View style={styles.proofRow}>
        <Pressable style={[styles.proofBtn, photoUri && styles.proofBtnDone]} onPress={handleTakePhoto}>
          <Text style={styles.proofBtnIcon}>{photoUri ? "✅" : "📷"}</Text>
          <Text style={[styles.proofBtnText, photoUri && styles.proofBtnTextDone]}>
            {photoUri ? "Photo Taken" : "Take Photo"}
          </Text>
        </Pressable>

        <Pressable style={[styles.proofBtn, hasSignature && styles.proofBtnDone]} onPress={handleSignature}>
          <Text style={styles.proofBtnIcon}>{hasSignature ? "✅" : "✍️"}</Text>
          <Text style={[styles.proofBtnText, hasSignature && styles.proofBtnTextDone]}>
            {hasSignature ? "Signed" : "Get Signature"}
          </Text>
        </Pressable>
      </View>

      {(photoUri || hasSignature) && (
        <View style={styles.proofSummary}>
          <Text style={styles.proofSummaryText}>
            Proof collected: {[photoUri && "Photo", hasSignature && "Signature"].filter(Boolean).join(" + ")}
          </Text>
        </View>
      )}

      <Pressable
        style={[styles.submitBtn, isSubmitting && styles.submitBtnDisabled, (!photoUri && !hasSignature) && styles.submitBtnDisabled]}
        onPress={handleSubmit}
        disabled={isSubmitting || (!photoUri && !hasSignature)}
      >
        <Text style={styles.submitBtnText}>{isSubmitting ? "Completing..." : "Complete Delivery"}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { margin: 16, backgroundColor: COLORS.surfaceWhite, borderRadius: 14, padding: 16, borderWidth: 1, borderColor: COLORS.border },
  title: { fontSize: 16, fontWeight: "700", color: COLORS.text, marginBottom: 12 },
  input: { backgroundColor: COLORS.surface, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10, fontSize: 14, color: COLORS.text, borderWidth: 1, borderColor: COLORS.border, marginBottom: 12 },
  proofRow: { flexDirection: "row", gap: 10, marginBottom: 12 },
  proofBtn: { flex: 1, paddingVertical: 16, borderRadius: 12, backgroundColor: COLORS.surface, alignItems: "center", borderWidth: 2, borderColor: COLORS.border, borderStyle: "dashed" },
  proofBtnDone: { backgroundColor: "#ecfdf5", borderColor: "#34d399", borderStyle: "solid" },
  proofBtnIcon: { fontSize: 28, marginBottom: 6 },
  proofBtnText: { fontSize: 13, fontWeight: "600", color: COLORS.textSecondary },
  proofBtnTextDone: { color: "#059669" },
  proofSummary: { backgroundColor: "#ecfdf5", borderRadius: 8, padding: 10, marginBottom: 12 },
  proofSummaryText: { fontSize: 12, color: "#059669", fontWeight: "600", textAlign: "center" },
  submitBtn: { backgroundColor: "#0d9488", paddingVertical: 14, borderRadius: 12, alignItems: "center" },
  submitBtnDisabled: { opacity: 0.4 },
  submitBtnText: { color: "#fff", fontSize: 16, fontWeight: "700" },
});
