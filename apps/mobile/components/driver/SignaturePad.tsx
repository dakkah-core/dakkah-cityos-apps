import React, { useRef, useState, useCallback } from "react";
import { View, Text, StyleSheet, Pressable, PanResponder, Platform, GestureResponderEvent, PanResponderGestureState } from "react-native";
import { COLORS, BRAND } from "@/constants/colors";

interface Point {
  x: number;
  y: number;
}

interface SignaturePadProps {
  onCapture: (svgPathData: string) => void;
  onClear: () => void;
  height?: number;
}

export function SignaturePad({ onCapture, onClear, height = 150 }: SignaturePadProps) {
  const [paths, setPaths] = useState<Point[][]>([]);
  const [currentPath, setCurrentPath] = useState<Point[]>([]);
  const [hasSigned, setHasSigned] = useState(false);
  const containerLayout = useRef({ width: 300 });

  const currentPathRef = useRef<Point[]>([]);
  const pathsRef = useRef<Point[][]>([]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt: GestureResponderEvent) => {
        const touch = evt.nativeEvent;
        const startPoint = [{ x: touch.locationX, y: touch.locationY }];
        currentPathRef.current = startPoint;
        setCurrentPath(startPoint);
      },
      onPanResponderMove: (evt: GestureResponderEvent) => {
        const touch = evt.nativeEvent;
        const point = { x: touch.locationX, y: touch.locationY };
        currentPathRef.current = [...currentPathRef.current, point];
        setCurrentPath([...currentPathRef.current]);
      },
      onPanResponderRelease: () => {
        const completedPath = currentPathRef.current;
        if (completedPath.length > 1) {
          const newPaths = [...pathsRef.current, completedPath];
          pathsRef.current = newPaths;
          setPaths(newPaths);
          setHasSigned(true);
        }
        currentPathRef.current = [];
        setCurrentPath([]);
      },
    })
  ).current;

  const pathsToSvg = useCallback((allPaths: Point[][]): string => {
    return allPaths
      .filter((p) => p.length > 1)
      .map((points) =>
        points.map((p, i) => (i === 0 ? `M${p.x.toFixed(1)},${p.y.toFixed(1)}` : `L${p.x.toFixed(1)},${p.y.toFixed(1)}`)).join(" ")
      )
      .join(" ");
  }, []);

  const handleConfirm = () => {
    const allPaths = currentPathRef.current.length > 1 ? [...pathsRef.current, currentPathRef.current] : pathsRef.current;
    const svgData = pathsToSvg(allPaths);
    if (svgData) {
      onCapture(svgData);
    }
  };

  const handleClear = () => {
    setPaths([]);
    setCurrentPath([]);
    pathsRef.current = [];
    currentPathRef.current = [];
    setHasSigned(false);
    onClear();
  };

  const allPoints = [...paths, ...(currentPath.length > 0 ? [currentPath] : [])];

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Sign below</Text>
      <View
        style={[styles.canvas, { height }]}
        onLayout={(e) => {
          containerLayout.current = { width: e.nativeEvent.layout.width };
        }}
        {...panResponder.panHandlers}
      >
        {allPoints.length === 0 && (
          <Text style={styles.placeholder}>Draw your signature here</Text>
        )}

        {Platform.OS === "web" ? (
          <WebSvgRenderer points={allPoints} width={containerLayout.current.width} height={height} />
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
                    backgroundColor: BRAND.navy,
                    transform: [{ rotate: `${angle}deg` }],
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

function WebSvgRenderer({ points, width, height }: { points: Point[][]; width: number; height: number }) {
  if (Platform.OS !== "web") return null;

  const svgStyle: Record<string, string | number> = {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
  };

  const svgPaths = points.map((pathPoints, pathIdx) => {
    if (pathPoints.length < 2) return null;
    const d = pathPoints.map((p, i) => (i === 0 ? `M${p.x},${p.y}` : `L${p.x},${p.y}`)).join(" ");
    return React.createElement("path", {
      key: pathIdx,
      d,
      stroke: BRAND.navy,
      strokeWidth: "2.5",
      fill: "none",
      strokeLinecap: "round",
      strokeLinejoin: "round",
    });
  });

  return React.createElement("svg", {
    style: svgStyle,
    viewBox: `0 0 ${width} ${height}`,
  }, ...svgPaths);
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
