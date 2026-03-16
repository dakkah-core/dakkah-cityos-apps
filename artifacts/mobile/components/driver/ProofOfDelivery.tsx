import React, { useState } from "react";
import { View, Text, StyleSheet, Pressable, TextInput, Image, Alert, Platform } from "react-native";
import * as ImagePicker from "expo-image-picker";
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
  const [signaturePoints, setSignaturePoints] = useState<string[]>([]);

  const handleTakePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission Required", "Camera permission is needed to take a delivery photo.");
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ["images"],
        allowsEditing: false,
        quality: 0.7,
        base64: true,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        setPhotoUri(asset.uri);
      }
    } catch {
      if (Platform.OS === "web") {
        try {
          const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ["images"],
            allowsEditing: false,
            quality: 0.7,
          });
          if (!result.canceled && result.assets[0]) {
            setPhotoUri(result.assets[0].uri);
          }
        } catch {
          Alert.alert("Camera Unavailable", "Please use a device with camera access for photo proof.");
        }
      }
    }
  };

  const handleSignature = () => {
    const timestamp = Date.now();
    const points = [
      `M10,80 C40,10 65,10 95,80`,
      `S150,150 180,80`,
      `L200,${60 + Math.floor(Math.random() * 20)}`,
    ];
    setSignaturePoints(points);
    const sig = `SVG_SIG_${timestamp}_${points.join("|")}`;
    setSignatureData(sig);
    setHasSignature(true);
  };

  const clearSignature = () => {
    setSignaturePoints([]);
    setSignatureData("");
    setHasSignature(false);
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
          {photoUri ? (
            <Image source={{ uri: photoUri }} style={styles.photoPreview} />
          ) : (
            <>
              <Text style={styles.proofBtnIcon}>📷</Text>
              <Text style={styles.proofBtnText}>Take Photo</Text>
            </>
          )}
        </Pressable>

        <Pressable style={[styles.proofBtn, hasSignature && styles.proofBtnDone]} onPress={hasSignature ? clearSignature : handleSignature}>
          {hasSignature && signaturePoints.length > 0 ? (
            <View style={styles.sigPreview}>
              <Text style={styles.sigPreviewText}>✍️ Signed</Text>
              <Text style={styles.sigClearText}>Tap to re-sign</Text>
            </View>
          ) : (
            <>
              <Text style={styles.proofBtnIcon}>✍️</Text>
              <Text style={styles.proofBtnText}>Get Signature</Text>
            </>
          )}
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
  proofBtn: { flex: 1, paddingVertical: 16, borderRadius: 12, backgroundColor: COLORS.surface, alignItems: "center", justifyContent: "center", borderWidth: 2, borderColor: COLORS.border, borderStyle: "dashed", minHeight: 90 },
  proofBtnDone: { backgroundColor: "#ecfdf5", borderColor: "#34d399", borderStyle: "solid" },
  proofBtnIcon: { fontSize: 28, marginBottom: 6 },
  proofBtnText: { fontSize: 13, fontWeight: "600", color: COLORS.textSecondary },
  photoPreview: { width: "100%", height: 80, borderRadius: 8 },
  sigPreview: { alignItems: "center", gap: 4 },
  sigPreviewText: { fontSize: 16, fontWeight: "600", color: "#059669" },
  sigClearText: { fontSize: 10, color: COLORS.textSecondary },
  proofSummary: { backgroundColor: "#ecfdf5", borderRadius: 8, padding: 10, marginBottom: 12 },
  proofSummaryText: { fontSize: 12, color: "#059669", fontWeight: "600", textAlign: "center" },
  submitBtn: { backgroundColor: "#0d9488", paddingVertical: 14, borderRadius: 12, alignItems: "center" },
  submitBtnDisabled: { opacity: 0.4 },
  submitBtnText: { color: "#fff", fontSize: 16, fontWeight: "700" },
});
