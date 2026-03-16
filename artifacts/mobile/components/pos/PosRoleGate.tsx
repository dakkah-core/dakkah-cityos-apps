import React, { useState, useCallback } from "react";
import { View, Text, StyleSheet, Pressable, TextInput } from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "@/context/AuthContext";
import AsyncStorage from "@react-native-async-storage/async-storage";

const POS_ROLES = ["cashier", "pos_operator", "store_manager", "merchant"];
const PIN_STORAGE_KEY = "dakkah_pos_pin";

interface PosRoleGateProps {
  children: React.ReactNode;
}

export function PosRoleGate({ children }: PosRoleGateProps) {
  const { user, isAuthenticated, signInWithKeycloak } = useAuth();
  const router = useRouter();
  const [showPinSetup, setShowPinSetup] = useState(false);
  const [showPinEntry, setShowPinEntry] = useState(false);
  const [pin, setPin] = useState("");
  const [newPin, setNewPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [pinError, setPinError] = useState("");
  const [pinUnlocked, setPinUnlocked] = useState(false);

  const hasPosRole = user?.roles?.some((r: string) => POS_ROLES.includes(r));
  const isDev = process.env.NODE_ENV === "development" || process.env.EXPO_PUBLIC_ALLOW_DEV_POS === "true";

  const handleSetPin = useCallback(async () => {
    if (newPin.length < 4) {
      setPinError("PIN must be at least 4 digits");
      return;
    }
    if (newPin !== confirmPin) {
      setPinError("PINs do not match");
      return;
    }
    await AsyncStorage.setItem(PIN_STORAGE_KEY, newPin);
    setShowPinSetup(false);
    setPinUnlocked(true);
    setPinError("");
  }, [newPin, confirmPin]);

  const handlePinLogin = useCallback(async () => {
    const savedPin = await AsyncStorage.getItem(PIN_STORAGE_KEY);
    if (pin === savedPin) {
      setPinUnlocked(true);
      setShowPinEntry(false);
      setPinError("");
    } else {
      setPinError("Incorrect PIN");
    }
  }, [pin]);

  const handleShowPinEntry = useCallback(async () => {
    const savedPin = await AsyncStorage.getItem(PIN_STORAGE_KEY);
    if (savedPin) {
      setShowPinEntry(true);
    } else {
      setShowPinSetup(true);
    }
  }, []);

  if (isDev) {
    return <>{children}</>;
  }

  if (!isAuthenticated) {
    return (
      <View style={styles.container}>
        <Text style={styles.icon}>🔐</Text>
        <Text style={styles.title}>POS Terminal Login</Text>
        <Text style={styles.subtitle}>Sign in with your cashier account to access the point-of-sale terminal</Text>
        <Pressable style={styles.signInBtn} onPress={() => signInWithKeycloak()}>
          <Text style={styles.signInBtnText}>Sign in with Keycloak</Text>
        </Pressable>
        <Pressable style={styles.backBtn} onPress={() => router.replace("/")}>
          <Text style={styles.backBtnText}>Go to Home</Text>
        </Pressable>
      </View>
    );
  }

  if (!hasPosRole) {
    return (
      <View style={styles.container}>
        <Text style={styles.icon}>🏪</Text>
        <Text style={styles.title}>POS Access Restricted</Text>
        <Text style={styles.subtitle}>This terminal is restricted to authorized cashiers and POS operators</Text>
        <Pressable style={styles.backBtn} onPress={() => router.replace("/")}>
          <Text style={styles.backBtnText}>Go to Home</Text>
        </Pressable>
      </View>
    );
  }

  if (pinUnlocked) {
    return <>{children}</>;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.icon}>🔑</Text>
      <Text style={styles.title}>Quick PIN Verification</Text>
      <Text style={styles.subtitle}>Enter your PIN to unlock the POS terminal</Text>

      {showPinEntry ? (
        <View style={styles.pinSection}>
          <Text style={styles.pinTitle}>Enter PIN</Text>
          <TextInput
            style={styles.pinInput}
            value={pin}
            onChangeText={setPin}
            placeholder="Enter 4+ digit PIN"
            placeholderTextColor="rgba(255,255,255,0.3)"
            keyboardType="number-pad"
            secureTextEntry
            maxLength={8}
            onSubmitEditing={handlePinLogin}
          />
          {pinError ? <Text style={styles.pinError}>{pinError}</Text> : null}
          <Pressable style={styles.pinSubmitBtn} onPress={handlePinLogin}>
            <Text style={styles.pinSubmitText}>Unlock</Text>
          </Pressable>
        </View>
      ) : showPinSetup ? (
        <View style={styles.pinSection}>
          <Text style={styles.pinTitle}>Set Up Quick PIN</Text>
          <TextInput
            style={styles.pinInput}
            value={newPin}
            onChangeText={setNewPin}
            placeholder="New PIN (4+ digits)"
            placeholderTextColor="rgba(255,255,255,0.3)"
            keyboardType="number-pad"
            secureTextEntry
            maxLength={8}
          />
          <TextInput
            style={[styles.pinInput, { marginTop: 8 }]}
            value={confirmPin}
            onChangeText={setConfirmPin}
            placeholder="Confirm PIN"
            placeholderTextColor="rgba(255,255,255,0.3)"
            keyboardType="number-pad"
            secureTextEntry
            maxLength={8}
          />
          {pinError ? <Text style={styles.pinError}>{pinError}</Text> : null}
          <Pressable style={styles.pinSubmitBtn} onPress={handleSetPin}>
            <Text style={styles.pinSubmitText}>Save PIN</Text>
          </Pressable>
        </View>
      ) : (
        <View style={styles.pinActions}>
          <Pressable style={styles.pinBtn} onPress={handleShowPinEntry}>
            <Text style={styles.pinBtnText}>Enter PIN</Text>
          </Pressable>
          <Pressable style={styles.skipBtn} onPress={() => setPinUnlocked(true)}>
            <Text style={styles.skipBtnText}>Skip (Continue without PIN)</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0a1628", justifyContent: "center", alignItems: "center", padding: 32 },
  icon: { fontSize: 48, marginBottom: 16 },
  title: { fontSize: 22, fontWeight: "800", color: "#fff", marginBottom: 8, textAlign: "center" },
  subtitle: { fontSize: 14, color: "rgba(255,255,255,0.6)", textAlign: "center", marginBottom: 24, lineHeight: 20 },
  signInBtn: { backgroundColor: "#3182ce", paddingHorizontal: 24, paddingVertical: 14, borderRadius: 12, marginBottom: 12, width: 280, alignItems: "center" },
  signInBtnText: { color: "#fff", fontWeight: "700", fontSize: 15 },
  pinBtn: { backgroundColor: "rgba(13,148,136,0.2)", paddingHorizontal: 24, paddingVertical: 14, borderRadius: 12, marginBottom: 12, width: 280, alignItems: "center", borderWidth: 1, borderColor: "#0d9488" },
  pinBtnText: { color: "#0d9488", fontWeight: "700", fontSize: 15 },
  backBtn: { backgroundColor: "rgba(255,255,255,0.15)", paddingHorizontal: 24, paddingVertical: 14, borderRadius: 12, width: 280, alignItems: "center", marginTop: 8 },
  backBtnText: { color: "#fff", fontWeight: "700", fontSize: 15 },
  skipBtn: { backgroundColor: "rgba(255,255,255,0.08)", paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12, width: 280, alignItems: "center" },
  skipBtnText: { color: "rgba(255,255,255,0.4)", fontSize: 13 },
  pinActions: { gap: 12, alignItems: "center" },
  pinSection: { width: 280, marginTop: 8, backgroundColor: "rgba(255,255,255,0.05)", borderRadius: 14, padding: 16, borderWidth: 1, borderColor: "rgba(255,255,255,0.1)" },
  pinTitle: { fontSize: 14, fontWeight: "700", color: "#fff", marginBottom: 12, textAlign: "center" },
  pinInput: { backgroundColor: "rgba(255,255,255,0.1)", borderRadius: 10, paddingHorizontal: 16, paddingVertical: 12, fontSize: 20, color: "#fff", textAlign: "center", letterSpacing: 6, borderWidth: 1, borderColor: "rgba(255,255,255,0.2)" },
  pinError: { fontSize: 12, color: "#e11d48", textAlign: "center", marginTop: 6 },
  pinSubmitBtn: { backgroundColor: "#0d9488", paddingVertical: 12, borderRadius: 10, alignItems: "center", marginTop: 12 },
  pinSubmitText: { color: "#fff", fontWeight: "700", fontSize: 14 },
});
