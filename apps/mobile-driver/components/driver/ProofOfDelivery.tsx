import React, { useState } from "react";
import { View, Text, StyleSheet, Pressable, TextInput, Image, Alert, Platform } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { SignaturePad } from "./SignaturePad";
import { COLORS, BRAND } from "@cityos/mobile-core";

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
  const [signatureData, setSignatureData] = useState<string | null>(null);
  const [showSignaturePad, setShowSignaturePad] = useState(false);

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
        setPhotoUri(result.assets[0].uri);
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

  const handleSignatureCapture = (svgPathData: string) => {
    setSignatureData(svgPathData);
    setShowSignaturePad(false);
  };

  const handleSignatureClear = () => {
    setSignatureData(null);
  };

  const handleSubmit = () => {
    if (!signatureData && !photoUri) {
      Alert.alert("Proof Required", "Please capture at least a photo or signature before completing.", [{ text: "OK" }]);
      return;
    }

    const proofType: "signature" | "photo" | "both" =
      signatureData && photoUri ? "both" :
      signatureData ? "signature" :
      "photo";

    onSubmit({
      proofType,
      signatureData: signatureData || undefined,
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

      <Pressable style={[styles.photoBtn, photoUri && styles.photoBtnDone]} onPress={handleTakePhoto}>
        {photoUri ? (
          <View style={styles.photoPreviewWrap}>
            <Image source={{ uri: photoUri }} style={styles.photoPreview} />
            <Text style={styles.photoRetakeText}>Tap to retake</Text>
          </View>
        ) : (
          <>
            <Text style={styles.photoBtnIcon}>📷</Text>
            <Text style={styles.photoBtnText}>Take Delivery Photo</Text>
          </>
        )}
      </Pressable>

      {!showSignaturePad && !signatureData && (
        <Pressable style={styles.sigOpenBtn} onPress={() => setShowSignaturePad(true)}>
          <Text style={styles.sigOpenBtnIcon}>✍️</Text>
          <Text style={styles.sigOpenBtnText}>Capture Signature</Text>
        </Pressable>
      )}

      {showSignaturePad && (
        <SignaturePad
          onCapture={handleSignatureCapture}
          onClear={handleSignatureClear}
          height={150}
        />
      )}

      {signatureData && !showSignaturePad && (
        <View style={styles.sigDoneRow}>
          <Text style={styles.sigDoneText}>✅ Signature captured</Text>
          <Pressable onPress={() => { setSignatureData(null); setShowSignaturePad(true); }}>
            <Text style={styles.sigRedoText}>Re-sign</Text>
          </Pressable>
        </View>
      )}

      {(photoUri || signatureData) && (
        <View style={styles.proofSummary}>
          <Text style={styles.proofSummaryText}>
            Proof collected: {[photoUri && "Photo", signatureData && "Signature"].filter(Boolean).join(" + ")}
          </Text>
        </View>
      )}

      <Pressable
        style={[styles.submitBtn, isSubmitting && styles.submitBtnDisabled, (!photoUri && !signatureData) && styles.submitBtnDisabled]}
        onPress={handleSubmit}
        disabled={isSubmitting || (!photoUri && !signatureData)}
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
  photoBtn: { paddingVertical: 20, borderRadius: 12, backgroundColor: COLORS.surface, alignItems: "center", justifyContent: "center", borderWidth: 2, borderColor: COLORS.border, borderStyle: "dashed", marginBottom: 12 },
  photoBtnDone: { backgroundColor: "#ecfdf5", borderColor: "#34d399", borderStyle: "solid", paddingVertical: 8 },
  photoBtnIcon: { fontSize: 32, marginBottom: 6 },
  photoBtnText: { fontSize: 14, fontWeight: "600", color: COLORS.textSecondary },
  photoPreviewWrap: { alignItems: "center", gap: 4 },
  photoPreview: { width: 120, height: 90, borderRadius: 8 },
  photoRetakeText: { fontSize: 11, color: "#059669" },
  sigOpenBtn: { paddingVertical: 16, borderRadius: 12, backgroundColor: COLORS.surface, alignItems: "center", justifyContent: "center", borderWidth: 2, borderColor: COLORS.border, borderStyle: "dashed", marginBottom: 12, flexDirection: "row", gap: 8 },
  sigOpenBtnIcon: { fontSize: 22 },
  sigOpenBtnText: { fontSize: 14, fontWeight: "600", color: COLORS.textSecondary },
  sigDoneRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", backgroundColor: "#ecfdf5", borderRadius: 10, padding: 12, marginBottom: 12 },
  sigDoneText: { fontSize: 14, fontWeight: "600", color: "#059669" },
  sigRedoText: { fontSize: 13, fontWeight: "600", color: BRAND.blue },
  proofSummary: { backgroundColor: "#ecfdf5", borderRadius: 8, padding: 10, marginBottom: 12 },
  proofSummaryText: { fontSize: 12, color: "#059669", fontWeight: "600", textAlign: "center" },
  submitBtn: { backgroundColor: BRAND.teal, paddingVertical: 14, borderRadius: 12, alignItems: "center" },
  submitBtnDisabled: { opacity: 0.4 },
  submitBtnText: { color: "#fff", fontSize: 16, fontWeight: "700" },
});
