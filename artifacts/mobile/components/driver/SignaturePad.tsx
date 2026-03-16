import React, { useRef, useState } from "react";
import { View, Text, StyleSheet, Pressable, PanResponder, Platform, Dimensions } from "react-native";
import { COLORS } from "@/constants/colors";

interface Point {
  x: number;
  y: number;
}

interface SignaturePadProps {
  onCapture: (svgPathData: string) => void;
  onClear: () => void;
  width?: number;
  height?: number;
}

export function SignaturePad({ onCapture, onClear, width: propWidth, height = 150 }: SignaturePadProps) {
  const [paths, setPaths] = useState<Point[][]>([]);
  const [currentPath, setCurrentPath] = useState<Point[]>([]);
  const [hasSigned, setHasSigned] = useState(false);
  const containerRef = useRef<View>(null);
  const containerLayout = useRef({ x: 0, y: 0, width: propWidth || 300 });

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt) => {
        const touch = evt.nativeEvent;
        const x = touch.locationX;
        const y = touch.locationY;
        setCurrentPath([{ x, y }]);
      },
      onPanResponderMove: (evt) => {
        const touch = evt.nativeEvent;
        const x = touch.locationX;
        const y = touch.locationY;
        setCurrentPath((prev) => [...prev, { x, y }]);
      },
      onPanResponderRelease: () => {
        if (currentPath.length > 1) {
          setPaths((prev) => [...prev, currentPath]);
          setHasSigned(true);
        }
        setCurrentPath([]);
      },
    })
  ).current;

  const pathsToSvg = (allPaths: Point[][]): string => {
    return allPaths
      .filter((p) => p.length > 1)
      .map((points) => {
        const d = points.map((p, i) => (i === 0 ? `M${p.x.toFixed(1)},${p.y.toFixed(1)}` : `L${p.x.toFixed(1)},${p.y.toFixed(1)}`)).join(" ");
        return d;
      })
      .join(" ");
  };

  const handleConfirm = () => {
    const allPaths = currentPath.length > 1 ? [...paths, currentPath] : paths;
    const svgData = pathsToSvg(allPaths);
    onCapture(svgData);
  };

  const handleClear = () => {
    setPaths([]);
    setCurrentPath([]);
    setHasSigned(false);
    onClear();
  };

  const allPoints = [...paths, ...(currentPath.length > 0 ? [currentPath] : [])];

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Sign below</Text>
      <View
        ref={containerRef}
        style={[styles.canvas, { height }]}
        onLayout={(e) => {
          containerLayout.current = {
            x: e.nativeEvent.layout.x,
            y: e.nativeEvent.layout.y,
            width: e.nativeEvent.layout.width,
          };
        }}
        {...panResponder.panHandlers}
      >
        {allPoints.length === 0 && (
          <Text style={styles.placeholder}>Draw your signature here</Text>
        )}

        {Platform.OS === "web" ? (
          <svg
            style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%" } as any}
            viewBox={`0 0 ${containerLayout.current.width} ${height}`}
          >
            {allPoints.map((points, pathIdx) => {
              if (points.length < 2) return null;
              const d = points.map((p, i) => (i === 0 ? `M${p.x},${p.y}` : `L${p.x},${p.y}`)).join(" ");
              return <path key={pathIdx} d={d} stroke="#0a1628" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />;
            })}
          </svg>
        ) : (
          allPoints.map((points, pathIdx) =>
            points.slice(1).map((point, i) => {
              const prev = points[i];
              const length = Math.sqrt(Math.pow(point.x - prev.x, 2) + Math.pow(point.y - prev.y, 2));
              const angle = Math.atan2(point.y - prev.y, point.x - prev.x) * (180 / Math.PI);
              return (
                <View
                  key={`${pathIdx}-${i}`}
                  style={{
                    position: "absolute",
                    left: prev.x,
                    top: prev.y - 1,
                    width: length,
                    height: 2.5,
                    backgroundColor: "#0a1628",
                    transform: [{ rotate: `${angle}deg` }],
                    transformOrigin: "left center",
                    borderRadius: 1.25,
                  }}
                />
              );
            })
          )
        )}

        <View style={styles.signLine} />
      </View>

      <View style={styles.btnRow}>
        <Pressable style={styles.clearBtn} onPress={handleClear}>
          <Text style={styles.clearBtnText}>Clear</Text>
        </Pressable>
        <Pressable
          style={[styles.confirmBtn, !hasSigned && styles.confirmBtnDisabled]}
          onPress={handleConfirm}
          disabled={!hasSigned}
        >
          <Text style={styles.confirmBtnText}>Confirm Signature</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 8 },
  label: { fontSize: 13, fontWeight: "600", color: COLORS.textSecondary },
  canvas: { backgroundColor: "#fafbfc", borderRadius: 10, borderWidth: 2, borderColor: COLORS.border, borderStyle: "dashed", position: "relative", overflow: "hidden" },
  placeholder: { position: "absolute", top: "45%", left: 0, right: 0, textAlign: "center", color: "#cbd5e1", fontSize: 14 },
  signLine: { position: "absolute", bottom: 30, left: 20, right: 20, height: 1, backgroundColor: "#e2e8f0" },
  btnRow: { flexDirection: "row", gap: 8 },
  clearBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border },
  clearBtnText: { fontSize: 13, fontWeight: "600", color: COLORS.textSecondary },
  confirmBtn: { flex: 1, paddingVertical: 8, borderRadius: 8, backgroundColor: "#059669", alignItems: "center" },
  confirmBtnDisabled: { opacity: 0.4 },
  confirmBtnText: { color: "#fff", fontSize: 13, fontWeight: "600" },
});
