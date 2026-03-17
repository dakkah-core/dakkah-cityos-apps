import React, { useState, useCallback, useRef } from "react";
import { View, Text, StyleSheet, Pressable, ActivityIndicator, Modal, Animated } from "react-native";
import { COLORS } from "../constants/colors";
import { transcribeAudio } from "../lib/ai-client";

interface Props {
  onTranscript: (text: string) => void;
  disabled?: boolean;
}

export function VoiceInputButton({ onTranscript, disabled }: Props) {
  const [recording, setRecording] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const pulseAnim = React.useRef(new Animated.Value(1)).current;

  const startPulse = useCallback(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.3, duration: 600, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      ])
    ).start();
  }, [pulseAnim]);

  const stopPulse = useCallback(() => {
    pulseAnim.stopAnimation();
    pulseAnim.setValue(1);
  }, [pulseAnim]);

  const handlePress = useCallback(() => {
    if (recording) {
      setRecording(false);
      stopPulse();
      setProcessing(true);
      setShowModal(false);

      setTimeout(() => {
        setProcessing(false);
        const sampleTranscripts = [
          "Show me quiet cafes nearby",
          "What's the weather like today?",
          "Find me a restaurant for dinner",
          "Book a ride to the airport",
          "What events are happening this weekend?",
        ];
        const transcript = sampleTranscripts[Math.floor(Math.random() * sampleTranscripts.length)];
        onTranscript(transcript);
      }, 1500);
    } else {
      setRecording(true);
      setShowModal(true);
      startPulse();

      setTimeout(() => {
        setRecording(false);
        stopPulse();
        setProcessing(true);
        setShowModal(false);

        setTimeout(() => {
          setProcessing(false);
          const sampleTranscripts = [
            "Show me quiet cafes nearby",
            "What's the weather like today?",
            "Find me a restaurant for dinner",
          ];
          const transcript = sampleTranscripts[Math.floor(Math.random() * sampleTranscripts.length)];
          onTranscript(transcript);
        }, 1500);
      }, 4000);
    }
  }, [recording, onTranscript, startPulse, stopPulse]);

  if (processing) {
    return (
      <View style={styles.btn}>
        <ActivityIndicator size="small" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <>
      <Pressable style={[styles.btn, disabled && styles.disabled]} onPress={handlePress} disabled={disabled}>
        <Text style={[styles.icon, recording && styles.recordingIcon]}>🎤</Text>
      </Pressable>

      <Modal visible={showModal} transparent animationType="fade" onRequestClose={handlePress}>
        <Pressable style={styles.overlay} onPress={handlePress}>
          <View style={styles.recordingModal}>
            <Animated.View style={[styles.pulseCircle, { transform: [{ scale: pulseAnim }] }]}>
              <View style={styles.micCircle}>
                <Text style={styles.micLargeIcon}>🎤</Text>
              </View>
            </Animated.View>
            <Text style={styles.recordingText}>Listening...</Text>
            <Text style={styles.recordingHint}>Tap to stop</Text>

            <View style={styles.waveform}>
              {Array.from({ length: 20 }).map((_, i) => (
                <View
                  key={i}
                  style={[styles.waveBar, { height: 8 + Math.random() * 24 }]}
                />
              ))}
            </View>
          </View>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  btn: { width: 36, height: 36, borderRadius: 18, backgroundColor: COLORS.chipBg, alignItems: "center", justifyContent: "center" },
  disabled: { opacity: 0.3 },
  icon: { fontSize: 16 },
  recordingIcon: { fontSize: 18 },
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.7)", alignItems: "center", justifyContent: "center" },
  recordingModal: { alignItems: "center", gap: 20 },
  pulseCircle: { width: 120, height: 120, borderRadius: 60, backgroundColor: "rgba(10,147,150,0.2)", alignItems: "center", justifyContent: "center" },
  micCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: COLORS.primary, alignItems: "center", justifyContent: "center" },
  micLargeIcon: { fontSize: 32 },
  recordingText: { color: "#fff", fontSize: 20, fontWeight: "700" },
  recordingHint: { color: "rgba(255,255,255,0.6)", fontSize: 14 },
  waveform: { flexDirection: "row", alignItems: "center", gap: 3, marginTop: 10 },
  waveBar: { width: 3, borderRadius: 1.5, backgroundColor: COLORS.primary },
});
