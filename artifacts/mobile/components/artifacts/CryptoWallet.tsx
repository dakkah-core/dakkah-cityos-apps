import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { COLORS } from "../../constants/colors";

interface Token {
  symbol: string;
  name: string;
  balance: string;
  value: string;
  change?: string;
  changeDir?: "up" | "down";
}

interface Props {
  data: {
    walletName?: string;
    totalBalance: string;
    tokens: Token[];
  };
  onAction?: (action: string) => void;
}

export function CryptoWallet({ data, onAction }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.walletName}>{data.walletName || "My Wallet"}</Text>
      <Text style={styles.totalBalance}>{data.totalBalance}</Text>
      <View style={styles.actions}>
        <Pressable style={styles.actionBtn} onPress={() => onAction?.("send")}>
          <Text style={styles.actionIcon}>↑</Text>
          <Text style={styles.actionLabel}>Send</Text>
        </Pressable>
        <Pressable style={styles.actionBtn} onPress={() => onAction?.("receive")}>
          <Text style={styles.actionIcon}>↓</Text>
          <Text style={styles.actionLabel}>Receive</Text>
        </Pressable>
        <Pressable style={styles.actionBtn} onPress={() => onAction?.("swap")}>
          <Text style={styles.actionIcon}>⇄</Text>
          <Text style={styles.actionLabel}>Swap</Text>
        </Pressable>
      </View>
      <View style={styles.tokens}>
        {data.tokens.map((t, i) => (
          <View key={i} style={styles.tokenRow}>
            <View style={styles.tokenIcon}>
              <Text style={styles.tokenSymbol}>{t.symbol.charAt(0)}</Text>
            </View>
            <View style={styles.tokenInfo}>
              <Text style={styles.tokenName}>{t.name}</Text>
              <Text style={styles.tokenBal}>{t.balance} {t.symbol}</Text>
            </View>
            <View style={styles.tokenValue}>
              <Text style={styles.tokenValText}>{t.value}</Text>
              {t.change && (
                <Text style={[styles.tokenChange, { color: t.changeDir === "up" ? COLORS.success : COLORS.danger }]}>
                  {t.changeDir === "up" ? "+" : ""}{t.change}
                </Text>
              )}
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: COLORS.card, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: COLORS.border },
  walletName: { fontSize: 13, color: COLORS.textSecondary, marginBottom: 4 },
  totalBalance: { fontSize: 28, fontWeight: "800", color: COLORS.text, marginBottom: 16 },
  actions: { flexDirection: "row", gap: 12, marginBottom: 16 },
  actionBtn: { flex: 1, alignItems: "center", backgroundColor: COLORS.surface, borderRadius: 12, paddingVertical: 10 },
  actionIcon: { fontSize: 18, color: COLORS.primary, fontWeight: "700" },
  actionLabel: { fontSize: 11, color: COLORS.textSecondary, marginTop: 2 },
  tokens: { gap: 10 },
  tokenRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  tokenIcon: { width: 36, height: 36, borderRadius: 18, backgroundColor: COLORS.primaryTint, alignItems: "center", justifyContent: "center" },
  tokenSymbol: { fontSize: 14, fontWeight: "700", color: COLORS.primary },
  tokenInfo: { flex: 1 },
  tokenName: { fontSize: 13, fontWeight: "600", color: COLORS.text },
  tokenBal: { fontSize: 11, color: COLORS.textMuted },
  tokenValue: { alignItems: "flex-end" },
  tokenValText: { fontSize: 13, fontWeight: "600", color: COLORS.text },
  tokenChange: { fontSize: 11 },
});
