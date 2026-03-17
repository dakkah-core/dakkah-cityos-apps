import React, { useState, useCallback } from "react";
import { View, Text, ScrollView, Pressable, TextInput, StyleSheet, ActivityIndicator, Alert, KeyboardAvoidingView, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { COLORS, BRAND } from "@/constants/colors";
import { useAuth } from "@/context/AuthContext";

const API_BASE = process.env.EXPO_PUBLIC_DOMAIN
  ? `https://${process.env.EXPO_PUBLIC_DOMAIN}/api`
  : "http://localhost:8080/api";

const CATEGORIES = [
  "Restaurant",
  "Cafe",
  "Grocery",
  "Pharmacy",
  "Electronics",
  "Fashion",
  "Home & Garden",
  "Beauty & Wellness",
  "Services",
  "Other",
];

export default function MerchantRegisterScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { isAuthenticated, signInWithKeycloak, getAccessToken } = useAuth();
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const [storeName, setStoreName] = useState("");
  const [category, setCategory] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [crNumber, setCrNumber] = useState("");
  const [openTime, setOpenTime] = useState("08:00");
  const [closeTime, setCloseTime] = useState("23:00");
  const [description, setDescription] = useState("");

  const canProceedStep0 = storeName.trim() && category;
  const canProceedStep1 = ownerName.trim() && phone.trim() && email.trim();
  const canSubmit = address.trim() && city.trim();

  const handleSubmit = useCallback(async () => {
    setSubmitting(true);
    try {
      const token = await getAccessToken();
      const res = await fetch(`${API_BASE}/commerce/merchant/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          storeName,
          category,
          ownerName,
          phone,
          email,
          address,
          city,
          crNumber,
          operatingHours: { open: openTime, close: closeTime },
          description,
        }),
      });

      const data = await res.json();
      if (data.success) {
        Alert.alert(
          "Application Submitted",
          "Your vendor application is under review. You will be notified once approved.",
          [{ text: "OK", onPress: () => router.replace("/" as never) }]
        );
      } else {
        Alert.alert("Registration Failed", data.error?.message || "Please try again.");
      }
    } catch {
      Alert.alert("Error", "Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }, [getAccessToken, storeName, category, ownerName, phone, email, address, city, crNumber, openTime, closeTime, description, router]);

  if (!isAuthenticated) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <Pressable style={styles.backBtn} onPress={() => router.back()}>
            <Text style={styles.backIcon}>{"<"}</Text>
          </Pressable>
          <Text style={styles.title}>Vendor Registration</Text>
        </View>
        <View style={styles.authGate}>
          <Text style={styles.authGateIcon}>🔐</Text>
          <Text style={styles.authGateTitle}>Sign In Required</Text>
          <Text style={styles.authGateSubtitle}>Please sign in before registering as a vendor</Text>
          <Pressable style={styles.authSignInBtn} onPress={() => signInWithKeycloak()}>
            <Text style={styles.authSignInBtnText}>Sign in with Keycloak</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backIcon}>{"<"}</Text>
        </Pressable>
        <Text style={styles.title}>Vendor Registration</Text>
      </View>

      <View style={styles.stepper}>
        {["Business Info", "Owner Details", "Location & Hours"].map((label, i) => (
          <View key={i} style={styles.stepItem}>
            <View style={[styles.stepDot, i <= step && styles.stepDotActive]}>
              <Text style={[styles.stepNum, i <= step && styles.stepNumActive]}>{i + 1}</Text>
            </View>
            <Text style={[styles.stepLabel, i === step && styles.stepLabelActive]}>{label}</Text>
          </View>
        ))}
      </View>

      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === "ios" ? "padding" : "height"}>
        <ScrollView style={styles.form} contentContainerStyle={styles.formContent}>
          {step === 0 && (
            <>
              <Text style={styles.sectionTitle}>Business Information</Text>
              <Text style={styles.fieldLabel}>Store Name *</Text>
              <TextInput style={styles.fieldInput} value={storeName} onChangeText={setStoreName} placeholder="Your store name" placeholderTextColor={COLORS.textMuted} />

              <Text style={styles.fieldLabel}>Category *</Text>
              <View style={styles.categoryGrid}>
                {CATEGORIES.map((cat) => (
                  <Pressable key={cat} style={[styles.categoryChip, category === cat && styles.categoryActive]} onPress={() => setCategory(cat)}>
                    <Text style={[styles.categoryText, category === cat && styles.categoryTextActive]}>{cat}</Text>
                  </Pressable>
                ))}
              </View>

              <Text style={styles.fieldLabel}>Description</Text>
              <TextInput
                style={[styles.fieldInput, styles.multiline]}
                value={description}
                onChangeText={setDescription}
                placeholder="Tell customers about your business"
                placeholderTextColor={COLORS.textMuted}
                multiline
              />
            </>
          )}

          {step === 1 && (
            <>
              <Text style={styles.sectionTitle}>Owner Details</Text>
              <Text style={styles.fieldLabel}>Full Name *</Text>
              <TextInput style={styles.fieldInput} value={ownerName} onChangeText={setOwnerName} placeholder="Owner full name" placeholderTextColor={COLORS.textMuted} />

              <Text style={styles.fieldLabel}>Phone *</Text>
              <TextInput style={styles.fieldInput} value={phone} onChangeText={setPhone} placeholder="+966XXXXXXXXX" placeholderTextColor={COLORS.textMuted} keyboardType="phone-pad" />

              <Text style={styles.fieldLabel}>Email *</Text>
              <TextInput style={styles.fieldInput} value={email} onChangeText={setEmail} placeholder="email@example.com" placeholderTextColor={COLORS.textMuted} keyboardType="email-address" autoCapitalize="none" />

              <Text style={styles.fieldLabel}>Commercial Registration (CR) Number</Text>
              <TextInput style={styles.fieldInput} value={crNumber} onChangeText={setCrNumber} placeholder="CR Number (optional)" placeholderTextColor={COLORS.textMuted} />
            </>
          )}

          {step === 2 && (
            <>
              <Text style={styles.sectionTitle}>Location & Operating Hours</Text>
              <Text style={styles.fieldLabel}>Address *</Text>
              <TextInput style={styles.fieldInput} value={address} onChangeText={setAddress} placeholder="Street address" placeholderTextColor={COLORS.textMuted} />

              <Text style={styles.fieldLabel}>City *</Text>
              <TextInput style={styles.fieldInput} value={city} onChangeText={setCity} placeholder="City" placeholderTextColor={COLORS.textMuted} />

              <View style={styles.hoursRow}>
                <View style={styles.hourField}>
                  <Text style={styles.fieldLabel}>Opening Time</Text>
                  <TextInput style={styles.fieldInput} value={openTime} onChangeText={setOpenTime} placeholder="08:00" placeholderTextColor={COLORS.textMuted} />
                </View>
                <View style={styles.hourField}>
                  <Text style={styles.fieldLabel}>Closing Time</Text>
                  <TextInput style={styles.fieldInput} value={closeTime} onChangeText={setCloseTime} placeholder="23:00" placeholderTextColor={COLORS.textMuted} />
                </View>
              </View>
            </>
          )}
        </ScrollView>

        <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 16) }]}>
          {step > 0 && (
            <Pressable style={styles.prevBtn} onPress={() => setStep((s) => s - 1)}>
              <Text style={styles.prevBtnText}>Back</Text>
            </Pressable>
          )}
          {step < 2 ? (
            <Pressable
              style={[styles.nextBtn, !(step === 0 ? canProceedStep0 : canProceedStep1) && styles.btnDisabled]}
              onPress={() => setStep((s) => s + 1)}
              disabled={!(step === 0 ? canProceedStep0 : canProceedStep1)}
            >
              <Text style={styles.nextBtnText}>Next</Text>
            </Pressable>
          ) : (
            <Pressable
              style={[styles.submitBtn, (!canSubmit || submitting) && styles.btnDisabled]}
              onPress={handleSubmit}
              disabled={!canSubmit || submitting}
            >
              {submitting ? <ActivityIndicator size="small" color="#fff" /> : <Text style={styles.submitBtnText}>Submit Application</Text>}
            </Pressable>
          )}
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.surface },
  flex: { flex: 1 },
  header: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 12, backgroundColor: BRAND.navy, gap: 12 },
  backBtn: { width: 36, height: 36, borderRadius: 10, backgroundColor: "rgba(255,255,255,0.15)", alignItems: "center", justifyContent: "center" },
  backIcon: { color: "#fff", fontSize: 18, fontWeight: "700" },
  title: { flex: 1, fontSize: 20, fontWeight: "800", color: "#fff" },
  stepper: { flexDirection: "row", justifyContent: "space-around", paddingVertical: 16, paddingHorizontal: 20, backgroundColor: COLORS.surfaceWhite, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  stepItem: { alignItems: "center", gap: 4 },
  stepDot: { width: 28, height: 28, borderRadius: 14, backgroundColor: COLORS.surface, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: COLORS.border },
  stepDotActive: { backgroundColor: BRAND.navy, borderColor: BRAND.navy },
  stepNum: { fontSize: 12, fontWeight: "700", color: COLORS.textMuted },
  stepNumActive: { color: "#fff" },
  stepLabel: { fontSize: 10, color: COLORS.textMuted, fontWeight: "600" },
  stepLabelActive: { color: BRAND.navy },
  form: { flex: 1 },
  formContent: { padding: 20, gap: 4, paddingBottom: 40 },
  sectionTitle: { fontSize: 18, fontWeight: "800", color: COLORS.text, marginBottom: 12 },
  fieldLabel: { fontSize: 12, fontWeight: "600", color: COLORS.textSecondary, marginTop: 12 },
  fieldInput: { backgroundColor: COLORS.surfaceWhite, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, color: COLORS.text, borderWidth: 1, borderColor: COLORS.border },
  multiline: { minHeight: 80, textAlignVertical: "top" },
  categoryGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 4 },
  categoryChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: COLORS.surfaceWhite, borderWidth: 1, borderColor: COLORS.border },
  categoryActive: { backgroundColor: BRAND.navy, borderColor: BRAND.navy },
  categoryText: { fontSize: 12, fontWeight: "600", color: COLORS.textSecondary },
  categoryTextActive: { color: "#fff" },
  hoursRow: { flexDirection: "row", gap: 12, marginTop: 4 },
  hourField: { flex: 1 },
  footer: { flexDirection: "row", gap: 12, paddingHorizontal: 20, paddingTop: 12, backgroundColor: COLORS.surfaceWhite, borderTopWidth: 1, borderTopColor: COLORS.border },
  prevBtn: { flex: 1, paddingVertical: 14, borderRadius: 12, borderWidth: 1, borderColor: COLORS.border, alignItems: "center" },
  prevBtnText: { color: COLORS.text, fontWeight: "700", fontSize: 15 },
  nextBtn: { flex: 2, paddingVertical: 14, borderRadius: 12, backgroundColor: BRAND.blue, alignItems: "center" },
  nextBtnText: { color: "#fff", fontWeight: "700", fontSize: 15 },
  submitBtn: { flex: 2, paddingVertical: 14, borderRadius: 12, backgroundColor: BRAND.teal, alignItems: "center" },
  submitBtnText: { color: "#fff", fontWeight: "700", fontSize: 15 },
  btnDisabled: { opacity: 0.4 },
  authGate: { flex: 1, justifyContent: "center", alignItems: "center", padding: 32 },
  authGateIcon: { fontSize: 48, marginBottom: 16 },
  authGateTitle: { fontSize: 20, fontWeight: "800", color: COLORS.text, marginBottom: 8 },
  authGateSubtitle: { fontSize: 14, color: COLORS.textSecondary, textAlign: "center", marginBottom: 24 },
  authSignInBtn: { backgroundColor: BRAND.blue, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 10 },
  authSignInBtnText: { color: "#fff", fontWeight: "700", fontSize: 15 },
});
