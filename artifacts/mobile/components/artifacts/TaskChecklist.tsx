import React, { useState } from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { COLORS } from "../../constants/colors";

interface TaskItem {
  label: string;
  done: boolean;
  priority?: "low" | "medium" | "high";
}

interface Props {
  data: {
    title?: string;
    tasks: TaskItem[];
  };
  onAction?: (action: string) => void;
}

const PRIORITY_COLORS: Record<string, string> = { low: COLORS.info, medium: COLORS.warning, high: COLORS.danger };

export function TaskChecklist({ data, onAction }: Props) {
  const [tasks, setTasks] = useState(data.tasks);
  const doneCount = tasks.filter((t) => t.done).length;

  const toggle = (idx: number) => {
    const updated = [...tasks];
    updated[idx] = { ...updated[idx], done: !updated[idx].done };
    setTasks(updated);
    onAction?.(`task:${updated[idx].label}:${updated[idx].done ? "done" : "undone"}`);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>✅ {data.title || "Tasks"}</Text>
        <Text style={styles.count}>{doneCount}/{tasks.length}</Text>
      </View>
      <View style={styles.progressBg}>
        <View style={[styles.progressFill, { width: `${tasks.length > 0 ? (doneCount / tasks.length) * 100 : 0}%` }]} />
      </View>
      <View style={styles.list}>
        {tasks.map((task, i) => (
          <Pressable key={i} style={styles.taskRow} onPress={() => toggle(i)}>
            <View style={[styles.checkbox, task.done && styles.checkboxDone]}>
              {task.done && <Text style={styles.checkmark}>✓</Text>}
            </View>
            <Text style={[styles.taskLabel, task.done && styles.taskDone]}>{task.label}</Text>
            {task.priority && <View style={[styles.priorityDot, { backgroundColor: PRIORITY_COLORS[task.priority] }]} />}
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: COLORS.card, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: COLORS.border },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  title: { fontSize: 15, fontWeight: "700", color: COLORS.text },
  count: { fontSize: 13, color: COLORS.textSecondary, fontWeight: "600" },
  progressBg: { height: 4, backgroundColor: COLORS.border, borderRadius: 2, marginBottom: 12, overflow: "hidden" },
  progressFill: { height: "100%", backgroundColor: COLORS.success, borderRadius: 2 },
  list: { gap: 8 },
  taskRow: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 4 },
  checkbox: { width: 22, height: 22, borderRadius: 6, borderWidth: 2, borderColor: COLORS.border, alignItems: "center", justifyContent: "center" },
  checkboxDone: { backgroundColor: COLORS.success, borderColor: COLORS.success },
  checkmark: { fontSize: 12, color: "#fff", fontWeight: "700" },
  taskLabel: { fontSize: 13, color: COLORS.text, flex: 1 },
  taskDone: { textDecorationLine: "line-through", color: COLORS.textMuted },
  priorityDot: { width: 8, height: 8, borderRadius: 4 },
});
