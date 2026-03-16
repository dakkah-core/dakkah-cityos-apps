import React, { useState, useCallback, useMemo, useEffect } from "react";
import {
  View, Text, ScrollView, Pressable, TextInput, StyleSheet,
  FlatList, Alert, ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { COLORS } from "@/constants/colors";
import { usePos } from "@/context/PosContext";
import { SduiRenderer, configureActionHandler } from "@workspace/sdui-renderer-native";
import type { SdNode } from "@workspace/sdui-protocol";
import type { PosProduct } from "@/types/pos";
import { useAuth } from "@/context/AuthContext";

function isSdNode(data: unknown): data is SdNode {
  return typeof data === "object" && data !== null && "type" in data &&
    typeof (data as Record<string, unknown>).type === "string";
}

function useSduiSurface(surface: string): SdNode | null {
  const [sduiTree, setSduiTree] = useState<SdNode | null>(null);
  const { getAccessToken } = useAuth();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const token = await getAccessToken();
        const baseUrl = process.env.EXPO_PUBLIC_API_URL || "";
        const res = await fetch(`${baseUrl}/api/sdui/${surface}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (res.ok && !cancelled) {
          const data = await res.json();
          const node = data.screen || data;
          if (isSdNode(node)) {
            setSduiTree(node);
          }
        }
      } catch {}
    })();
    return () => { cancelled = true; };
  }, [surface, getAccessToken]);

  return sduiTree;
}

export default function PosTerminalScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const {
    products, categories, cart, activeShift, isOnline,
    isLoading, offlineQueueCount, addToCart, removeFromCart,
    updateQuantity, clearCart, openShift,
  } = usePos();
  const sduiTree = useSduiSurface("tablet_pos");

  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [search, setSearch] = useState("");
  const [showShiftDialog, setShowShiftDialog] = useState(false);
  const [openingCash, setOpeningCash] = useState("");

  useEffect(() => {
    configureActionHandler({
      onNavigate: (screen) => {
        if (screen.startsWith("pos/")) {
          router.push(`/${screen}` as never);
        }
      },
    });
  }, [router]);

  const filteredProducts = useMemo(() => {
    let filtered = products;
    if (selectedCategory !== "All") {
      filtered = filtered.filter((p) => p.category === selectedCategory);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      filtered = filtered.filter(
        (p) => p.name.toLowerCase().includes(q) || p.barcode?.includes(q)
      );
    }
    return filtered;
  }, [products, selectedCategory, search]);

  const handleOpenShift = useCallback(async () => {
    const amount = parseFloat(openingCash) || 0;
    try {
      await openShift(amount);
      setShowShiftDialog(false);
      setOpeningCash("");
    } catch {
      Alert.alert("Error", "Failed to open shift");
    }
  }, [openingCash, openShift]);

  const renderProduct = useCallback(
    ({ item }: { item: PosProduct }) => (
      <Pressable
        style={[styles.productCard, !item.available && styles.productUnavailable]}
        onPress={() => item.available && addToCart(item)}
        disabled={!item.available}
      >
        <View style={styles.productEmoji}>
          <Text style={styles.productEmojiText}>
            {item.category === "Hot Drinks" ? "☕" : item.category === "Cold Drinks" ? "🧊" : item.category === "Food" ? "🍽️" : item.category === "Pastries" ? "🥐" : item.category === "Desserts" ? "🍰" : "🥤"}
          </Text>
        </View>
        <Text style={styles.productName} numberOfLines={2}>{item.name}</Text>
        <Text style={styles.productPrice}>{item.price} SAR</Text>
        {item.stockLevel < 5 && (
          <View style={styles.lowStockBadge}>
            <Text style={styles.lowStockText}>Low</Text>
          </View>
        )}
      </Pressable>
    ),
    [addToCart]
  );

  if (isLoading) {
    return (
      <View style={[styles.loadingContainer, { paddingTop: insets.top }]}>
        <ActivityIndicator size="large" color="#3182ce" />
        <Text style={styles.loadingText}>Loading POS Terminal...</Text>
      </View>
    );
  }

  if (!activeShift) {
    return (
      <View style={[styles.shiftContainer, { paddingTop: insets.top }]}>
        <View style={styles.shiftHeader}>
          <Pressable style={styles.shiftBackBtn} onPress={() => router.back()}>
            <Text style={styles.shiftBackIcon}>{"<"}</Text>
          </Pressable>
          <Text style={styles.shiftTitle}>Open Shift</Text>
        </View>
        <View style={styles.shiftBody}>
          <Text style={styles.shiftIcon}>💰</Text>
          <Text style={styles.shiftHeading}>Start Your Shift</Text>
          <Text style={styles.shiftSubtext}>Count your opening cash drawer to begin</Text>
          <Text style={styles.fieldLabel}>Opening Cash (SAR)</Text>
          <TextInput
            style={styles.shiftInput}
            value={openingCash}
            onChangeText={setOpeningCash}
            placeholder="0.00"
            placeholderTextColor={COLORS.textMuted}
            keyboardType="decimal-pad"
          />
          <Pressable style={styles.shiftOpenBtn} onPress={handleOpenShift}>
            <Text style={styles.shiftOpenBtnText}>Open Register</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  const sduiStatusBar = sduiTree ? (
    <View style={styles.sduiBar}>
      <SduiRenderer node={sduiTree} theme="dark" />
    </View>
  ) : null;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backIcon}>{"<"}</Text>
        </Pressable>
        <Text style={styles.title}>POS Terminal</Text>
        {!isOnline && (
          <View style={styles.offlineBadge}>
            <Text style={styles.offlineText}>OFFLINE {offlineQueueCount > 0 ? `(${offlineQueueCount})` : ""}</Text>
          </View>
        )}
        <View style={styles.headerActions}>
          <Pressable style={styles.headerActionBtn} onPress={() => router.push("/pos/scanner" as never)}>
            <Text style={styles.headerActionIcon}>📷</Text>
          </Pressable>
          <Pressable style={styles.headerActionBtn} onPress={() => router.push("/pos/kitchen" as never)}>
            <Text style={styles.headerActionIcon}>🍳</Text>
          </Pressable>
          <Pressable style={styles.headerActionBtn} onPress={() => router.push("/pos/reports" as never)}>
            <Text style={styles.headerActionIcon}>📊</Text>
          </Pressable>
          <Pressable style={styles.headerActionBtn} onPress={() => router.push("/pos/returns" as never)}>
            <Text style={styles.headerActionIcon}>↩️</Text>
          </Pressable>
        </View>
      </View>

      {sduiStatusBar}
      <View style={styles.body}>
        <View style={styles.productSide}>
          <View style={styles.searchRow}>
            <TextInput
              style={styles.searchInput}
              value={search}
              onChangeText={setSearch}
              placeholder="Search products or scan barcode..."
              placeholderTextColor={COLORS.textMuted}
            />
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryBar} contentContainerStyle={styles.categoryBarContent}>
            <Pressable
              style={[styles.categoryChip, selectedCategory === "All" && styles.categoryActive]}
              onPress={() => setSelectedCategory("All")}
            >
              <Text style={[styles.categoryText, selectedCategory === "All" && styles.categoryTextActive]}>All</Text>
            </Pressable>
            {categories.map((cat) => (
              <Pressable
                key={cat}
                style={[styles.categoryChip, selectedCategory === cat && styles.categoryActive]}
                onPress={() => setSelectedCategory(cat)}
              >
                <Text style={[styles.categoryText, selectedCategory === cat && styles.categoryTextActive]}>{cat}</Text>
              </Pressable>
            ))}
          </ScrollView>

          <FlatList
            data={filteredProducts}
            renderItem={renderProduct}
            keyExtractor={(item) => item.id}
            numColumns={3}
            contentContainerStyle={styles.productGrid}
            columnWrapperStyle={styles.productRow}
          />
        </View>

        <View style={styles.cartSide}>
          <View style={styles.cartHeader}>
            <Text style={styles.cartTitle}>Cart ({cart.items.length})</Text>
            {cart.items.length > 0 && (
              <Pressable onPress={clearCart}>
                <Text style={styles.clearBtn}>Clear</Text>
              </Pressable>
            )}
          </View>

          <ScrollView style={styles.cartItems}>
            {cart.items.length === 0 ? (
              <View style={styles.emptyCart}>
                <Text style={styles.emptyCartIcon}>🛒</Text>
                <Text style={styles.emptyCartText}>Cart is empty</Text>
                <Text style={styles.emptyCartSub}>Tap products to add</Text>
              </View>
            ) : (
              cart.items.map((item, idx) => (
                <View key={`${item.product.id}-${item.variantId || ""}-${idx}`} style={styles.cartItem}>
                  <View style={styles.cartItemInfo}>
                    <Text style={styles.cartItemName} numberOfLines={1}>{item.product.name}</Text>
                    {item.variantId && (
                      <Text style={styles.cartItemVariant}>
                        {item.product.variants.find((v) => v.id === item.variantId)?.name}
                      </Text>
                    )}
                    <Text style={styles.cartItemPrice}>{item.product.price} SAR</Text>
                  </View>
                  <View style={styles.qtyControls}>
                    <Pressable style={styles.qtyBtn} onPress={() => updateQuantity(item.product.id, item.quantity - 1, item.variantId)}>
                      <Text style={styles.qtyBtnText}>-</Text>
                    </Pressable>
                    <Text style={styles.qtyText}>{item.quantity}</Text>
                    <Pressable style={styles.qtyBtn} onPress={() => updateQuantity(item.product.id, item.quantity + 1, item.variantId)}>
                      <Text style={styles.qtyBtnText}>+</Text>
                    </Pressable>
                  </View>
                  <Text style={styles.cartItemTotal}>
                    {(item.product.price * item.quantity).toFixed(2)}
                  </Text>
                  <Pressable onPress={() => removeFromCart(item.product.id, item.variantId)}>
                    <Text style={styles.removeBtn}>✕</Text>
                  </Pressable>
                </View>
              ))
            )}
          </ScrollView>

          {cart.items.length > 0 && (
            <View style={styles.cartSummary}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Subtotal</Text>
                <Text style={styles.summaryValue}>{cart.subtotal.toFixed(2)} SAR</Text>
              </View>
              {cart.discountTotal > 0 && (
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Discount</Text>
                  <Text style={[styles.summaryValue, styles.discountText]}>-{cart.discountTotal.toFixed(2)} SAR</Text>
                </View>
              )}
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Tax (15%)</Text>
                <Text style={styles.summaryValue}>{cart.taxTotal.toFixed(2)} SAR</Text>
              </View>
              <View style={[styles.summaryRow, styles.totalRow]}>
                <Text style={styles.totalLabel}>Total</Text>
                <Text style={styles.totalValue}>{cart.total.toFixed(2)} SAR</Text>
              </View>
              <Pressable
                style={styles.checkoutBtn}
                onPress={() => router.push("/pos/payment" as never)}
              >
                <Text style={styles.checkoutBtnText}>Charge {cart.total.toFixed(2)} SAR</Text>
              </Pressable>
            </View>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0a1628" },
  loadingContainer: { flex: 1, backgroundColor: "#0a1628", justifyContent: "center", alignItems: "center" },
  loadingText: { color: "rgba(255,255,255,0.6)", marginTop: 12, fontSize: 14 },
  header: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 10, gap: 10, backgroundColor: "#0a1628" },
  backBtn: { width: 36, height: 36, borderRadius: 10, backgroundColor: "rgba(255,255,255,0.15)", alignItems: "center", justifyContent: "center" },
  backIcon: { color: "#fff", fontSize: 18, fontWeight: "700" },
  title: { fontSize: 20, fontWeight: "800", color: "#fff", flex: 1 },
  offlineBadge: { backgroundColor: "#d97706", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  offlineText: { color: "#fff", fontSize: 10, fontWeight: "700" },
  headerActions: { flexDirection: "row", gap: 6 },
  headerActionBtn: { width: 36, height: 36, borderRadius: 10, backgroundColor: "rgba(255,255,255,0.1)", alignItems: "center", justifyContent: "center" },
  headerActionIcon: { fontSize: 16 },
  body: { flex: 1, flexDirection: "row" },
  productSide: { flex: 2, backgroundColor: COLORS.surface },
  searchRow: { paddingHorizontal: 12, paddingVertical: 8 },
  searchInput: { backgroundColor: COLORS.surfaceWhite, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10, fontSize: 14, color: COLORS.text, borderWidth: 1, borderColor: COLORS.border },
  categoryBar: { maxHeight: 44, paddingLeft: 12 },
  categoryBarContent: { gap: 6, paddingRight: 12, alignItems: "center" },
  categoryChip: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, backgroundColor: COLORS.surfaceWhite, borderWidth: 1, borderColor: COLORS.border },
  categoryActive: { backgroundColor: "#0a1628", borderColor: "#0a1628" },
  categoryText: { fontSize: 12, fontWeight: "600", color: COLORS.textSecondary },
  categoryTextActive: { color: "#fff" },
  productGrid: { padding: 8 },
  productRow: { gap: 8 },
  productCard: { flex: 1, backgroundColor: COLORS.surfaceWhite, borderRadius: 12, padding: 12, alignItems: "center", marginBottom: 8, borderWidth: 1, borderColor: COLORS.border, minHeight: 110 },
  productUnavailable: { opacity: 0.4 },
  productEmoji: { width: 40, height: 40, borderRadius: 10, backgroundColor: COLORS.surface, alignItems: "center", justifyContent: "center", marginBottom: 6 },
  productEmojiText: { fontSize: 20 },
  productName: { fontSize: 12, fontWeight: "600", color: COLORS.text, textAlign: "center", marginBottom: 4 },
  productPrice: { fontSize: 14, fontWeight: "800", color: "#0d9488" },
  lowStockBadge: { position: "absolute", top: 4, right: 4, backgroundColor: "#d97706", paddingHorizontal: 4, paddingVertical: 1, borderRadius: 4 },
  lowStockText: { fontSize: 8, color: "#fff", fontWeight: "700" },
  cartSide: { flex: 1, backgroundColor: COLORS.surfaceWhite, borderLeftWidth: 1, borderLeftColor: COLORS.border },
  cartHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  cartTitle: { fontSize: 16, fontWeight: "800", color: COLORS.text },
  clearBtn: { fontSize: 13, color: "#e11d48", fontWeight: "600" },
  cartItems: { flex: 1 },
  emptyCart: { alignItems: "center", justifyContent: "center", paddingTop: 60 },
  emptyCartIcon: { fontSize: 40, marginBottom: 8 },
  emptyCartText: { fontSize: 15, fontWeight: "700", color: COLORS.text },
  emptyCartSub: { fontSize: 12, color: COLORS.textMuted, marginTop: 4 },
  cartItem: { flexDirection: "row", alignItems: "center", paddingHorizontal: 12, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: COLORS.border, gap: 8 },
  cartItemInfo: { flex: 1 },
  cartItemName: { fontSize: 13, fontWeight: "600", color: COLORS.text },
  cartItemVariant: { fontSize: 10, color: COLORS.textMuted },
  cartItemPrice: { fontSize: 11, color: COLORS.textSecondary },
  qtyControls: { flexDirection: "row", alignItems: "center", gap: 6 },
  qtyBtn: { width: 26, height: 26, borderRadius: 6, backgroundColor: COLORS.surface, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: COLORS.border },
  qtyBtnText: { fontSize: 14, fontWeight: "700", color: COLORS.text },
  qtyText: { fontSize: 14, fontWeight: "700", color: COLORS.text, width: 24, textAlign: "center" },
  cartItemTotal: { fontSize: 13, fontWeight: "700", color: COLORS.text, width: 60, textAlign: "right" },
  removeBtn: { fontSize: 14, color: COLORS.textMuted, paddingLeft: 4 },
  cartSummary: { padding: 16, borderTopWidth: 1, borderTopColor: COLORS.border, backgroundColor: COLORS.surface },
  summaryRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 4 },
  summaryLabel: { fontSize: 13, color: COLORS.textSecondary },
  summaryValue: { fontSize: 13, fontWeight: "600", color: COLORS.text },
  discountText: { color: "#0d9488" },
  totalRow: { borderTopWidth: 1, borderTopColor: COLORS.border, paddingTop: 8, marginTop: 4, marginBottom: 12 },
  totalLabel: { fontSize: 16, fontWeight: "800", color: COLORS.text },
  totalValue: { fontSize: 16, fontWeight: "800", color: "#0a1628" },
  checkoutBtn: { backgroundColor: "#0d9488", paddingVertical: 14, borderRadius: 12, alignItems: "center" },
  checkoutBtnText: { color: "#fff", fontWeight: "700", fontSize: 16 },
  shiftContainer: { flex: 1, backgroundColor: "#0a1628" },
  shiftHeader: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 12, gap: 12 },
  shiftBackBtn: { width: 36, height: 36, borderRadius: 10, backgroundColor: "rgba(255,255,255,0.15)", alignItems: "center", justifyContent: "center" },
  shiftBackIcon: { color: "#fff", fontSize: 18, fontWeight: "700" },
  shiftTitle: { fontSize: 20, fontWeight: "800", color: "#fff" },
  shiftBody: { flex: 1, justifyContent: "center", alignItems: "center", padding: 32 },
  shiftIcon: { fontSize: 56, marginBottom: 16 },
  shiftHeading: { fontSize: 24, fontWeight: "800", color: "#fff", marginBottom: 8 },
  shiftSubtext: { fontSize: 14, color: "rgba(255,255,255,0.6)", marginBottom: 32 },
  fieldLabel: { fontSize: 12, fontWeight: "600", color: "rgba(255,255,255,0.6)", marginBottom: 8, alignSelf: "flex-start", width: 280 },
  shiftInput: { backgroundColor: "rgba(255,255,255,0.1)", borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, fontSize: 18, color: "#fff", width: 280, textAlign: "center", borderWidth: 1, borderColor: "rgba(255,255,255,0.2)", marginBottom: 24 },
  shiftOpenBtn: { backgroundColor: "#0d9488", paddingHorizontal: 40, paddingVertical: 14, borderRadius: 12 },
  shiftOpenBtnText: { color: "#fff", fontWeight: "700", fontSize: 16 },
  sduiBar: { paddingHorizontal: 12, paddingVertical: 6, backgroundColor: "rgba(255,255,255,0.03)", borderBottomWidth: 1, borderBottomColor: "rgba(255,255,255,0.06)" },
});
