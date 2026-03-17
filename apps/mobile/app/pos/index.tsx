import React, { useState, useCallback, useMemo, useEffect } from "react";
import {
  View, Text, ScrollView, Pressable, TextInput, StyleSheet,
  FlatList, Alert, ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { COLORS, BRAND } from "@/constants/colors";
import { usePos } from "@/context/PosContext";
import { SduiRenderer, configureActionHandler } from "@cityos/sdui-renderer-native";
import type { SdNode } from "@cityos/sdui-protocol";
import type { PosProduct } from "@/types/pos";
import { useAuth } from "@/context/AuthContext";

function isSdNode(data: unknown): data is SdNode {
  return typeof data === "object" && data !== null && "type" in data &&
    typeof (data as Record<string, unknown>).type === "string";
}

function useSduiSurface(surface: string) {
  const [sduiTree, setSduiTree] = useState<SdNode | null>(null);
  const { getAccessToken } = useAuth();

  const fetchSdui = useCallback(async (action?: string, payload?: Record<string, unknown>) => {
    try {
      const token = await getAccessToken();
      const baseUrl = process.env.EXPO_PUBLIC_DOMAIN
        ? `https://${process.env.EXPO_PUBLIC_DOMAIN}`
        : (process.env.EXPO_PUBLIC_API_URL || "");
      const url = `${baseUrl}/api/sdui/${surface}?surface=tablet`;
      const isPost = !!action;
      const res = await fetch(url, {
        method: isPost ? "POST" : "GET",
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          ...(isPost ? { "Content-Type": "application/json" } : {}),
        },
        ...(isPost ? { body: JSON.stringify({ action, payload }) } : {}),
      });
      if (res.ok) {
        const json = await res.json();
        const node = json?.data?.screen || json?.screen || json?.data || json;
        if (isSdNode(node)) {
          setSduiTree(node);
        }
      }
    } catch {}
  }, [surface, getAccessToken]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!cancelled) await fetchSdui();
    })();
    return () => { cancelled = true; };
  }, [fetchSdui]);

  const dispatchSduiAction = useCallback((action: string, payload?: Record<string, unknown>) => {
    fetchSdui(action, payload);
  }, [fetchSdui]);

  return { sduiTree, dispatchSduiAction };
}

export default function PosTerminalScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const {
    products, categories, cart, activeShift, isOnline,
    isLoading, offlineQueueCount, addToCart, removeFromCart,
    updateQuantity, setLineDiscount, clearCart, openShift,
  } = usePos();
  const { sduiTree, dispatchSduiAction } = useSduiSurface("tablet_pos");

  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [search, setSearch] = useState("");
  const [discountEditId, setDiscountEditId] = useState<string | null>(null);
  const [discountInput, setDiscountInput] = useState("");
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

  useEffect(() => {
    configureActionHandler({
      onNavigate: (screen: string) => {
        router.push(`/${screen}` as never);
      },
      onMutation: async (endpoint: string, method: string, payload?: Record<string, unknown>) => {
        dispatchSduiAction(method, { endpoint, ...payload });
      },
    });
  }, [dispatchSduiAction, router]);

  useEffect(() => {
    if (cart.items.length > 0) {
      dispatchSduiAction("cart_update", {
        itemCount: cart.items.length,
        subtotal: cart.subtotal,
        total: cart.total,
      });
    }
  }, [cart.items.length, cart.total, dispatchSduiAction]);

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
        <ActivityIndicator size="large" color={BRAND.blue} />
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
              cart.items.map((item, idx) => {
                const itemKey = `${item.product.id}-${item.variantId || ""}`;
                const lineTotal = item.product.price * item.quantity;
                const discountAmt = lineTotal * (item.lineDiscount / 100);
                const discounted = lineTotal - discountAmt;
                const isEditingDiscount = discountEditId === itemKey;
                return (
                  <View key={`${itemKey}-${idx}`} style={styles.cartItem}>
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
                    <View style={styles.cartItemRight}>
                      {item.lineDiscount > 0 ? (
                        <>
                          <Text style={styles.cartItemTotalStrike}>{lineTotal.toFixed(2)}</Text>
                          <Text style={styles.cartItemTotal}>{discounted.toFixed(2)}</Text>
                        </>
                      ) : (
                        <Text style={styles.cartItemTotal}>{lineTotal.toFixed(2)}</Text>
                      )}
                      <Pressable onPress={() => {
                        if (isEditingDiscount) {
                          setDiscountEditId(null);
                        } else {
                          setDiscountEditId(itemKey);
                          setDiscountInput(item.lineDiscount > 0 ? String(Math.round(item.lineDiscount)) : "");
                        }
                      }}>
                        <Text style={styles.discountToggle}>{item.lineDiscount > 0 ? "✏️" : "🏷️"}</Text>
                      </Pressable>
                    </View>
                    <Pressable onPress={() => removeFromCart(item.product.id, item.variantId)}>
                      <Text style={styles.removeBtn}>✕</Text>
                    </Pressable>
                    {isEditingDiscount && (
                      <View style={styles.discountRow}>
                        <Text style={styles.discountLabel}>Discount %:</Text>
                        <TextInput
                          style={styles.discountInput}
                          value={discountInput}
                          onChangeText={setDiscountInput}
                          placeholder="0"
                          placeholderTextColor="rgba(255,255,255,0.3)"
                          keyboardType="decimal-pad"
                        />
                        <Pressable style={styles.discountApplyBtn} onPress={() => {
                          const pct = Math.min(Math.max(parseFloat(discountInput) || 0, 0), 100);
                          setLineDiscount(item.product.id, pct, item.variantId);
                          setDiscountEditId(null);
                        }}>
                          <Text style={styles.discountApplyText}>Apply</Text>
                        </Pressable>
                        {item.lineDiscount > 0 ? (
                          <Pressable style={styles.discountClearBtn} onPress={() => {
                            setLineDiscount(item.product.id, 0, item.variantId);
                            setDiscountEditId(null);
                          }}>
                            <Text style={styles.discountClearText}>Clear</Text>
                          </Pressable>
                        ) : null}
                      </View>
                    )}
                  </View>
                );
              })
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
  container: { flex: 1, backgroundColor: BRAND.navy },
  loadingContainer: { flex: 1, backgroundColor: BRAND.navy, justifyContent: "center", alignItems: "center" },
  loadingText: { color: "rgba(255,255,255,0.6)", marginTop: 12, fontSize: 14 },
  header: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 10, gap: 10, backgroundColor: BRAND.navy },
  backBtn: { width: 36, height: 36, borderRadius: 10, backgroundColor: "rgba(255,255,255,0.15)", alignItems: "center", justifyContent: "center" },
  backIcon: { color: "#fff", fontSize: 18, fontWeight: "700" },
  title: { fontSize: 20, fontWeight: "800", color: "#fff", flex: 1 },
  offlineBadge: { backgroundColor: BRAND.amber, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
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
  categoryActive: { backgroundColor: BRAND.navy, borderColor: BRAND.navy },
  categoryText: { fontSize: 12, fontWeight: "600", color: COLORS.textSecondary },
  categoryTextActive: { color: "#fff" },
  productGrid: { padding: 8 },
  productRow: { gap: 8 },
  productCard: { flex: 1, backgroundColor: COLORS.surfaceWhite, borderRadius: 12, padding: 12, alignItems: "center", marginBottom: 8, borderWidth: 1, borderColor: COLORS.border, minHeight: 110 },
  productUnavailable: { opacity: 0.4 },
  productEmoji: { width: 40, height: 40, borderRadius: 10, backgroundColor: COLORS.surface, alignItems: "center", justifyContent: "center", marginBottom: 6 },
  productEmojiText: { fontSize: 20 },
  productName: { fontSize: 12, fontWeight: "600", color: COLORS.text, textAlign: "center", marginBottom: 4 },
  productPrice: { fontSize: 14, fontWeight: "800", color: BRAND.teal },
  lowStockBadge: { position: "absolute", top: 4, right: 4, backgroundColor: BRAND.amber, paddingHorizontal: 4, paddingVertical: 1, borderRadius: 4 },
  lowStockText: { fontSize: 8, color: "#fff", fontWeight: "700" },
  cartSide: { flex: 1, backgroundColor: COLORS.surfaceWhite, borderLeftWidth: 1, borderLeftColor: COLORS.border },
  cartHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  cartTitle: { fontSize: 16, fontWeight: "800", color: COLORS.text },
  clearBtn: { fontSize: 13, color: BRAND.rose, fontWeight: "600" },
  cartItems: { flex: 1 },
  emptyCart: { alignItems: "center", justifyContent: "center", paddingTop: 60 },
  emptyCartIcon: { fontSize: 40, marginBottom: 8 },
  emptyCartText: { fontSize: 15, fontWeight: "700", color: COLORS.text },
  emptyCartSub: { fontSize: 12, color: COLORS.textMuted, marginTop: 4 },
  cartItem: { flexDirection: "row", alignItems: "center", paddingHorizontal: 12, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: COLORS.border, gap: 8, flexWrap: "wrap" },
  cartItemInfo: { flex: 1 },
  cartItemName: { fontSize: 13, fontWeight: "600", color: COLORS.text },
  cartItemVariant: { fontSize: 10, color: COLORS.textMuted },
  cartItemPrice: { fontSize: 11, color: COLORS.textSecondary },
  qtyControls: { flexDirection: "row", alignItems: "center", gap: 6 },
  qtyBtn: { width: 26, height: 26, borderRadius: 6, backgroundColor: COLORS.surface, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: COLORS.border },
  qtyBtnText: { fontSize: 14, fontWeight: "700", color: COLORS.text },
  qtyText: { fontSize: 14, fontWeight: "700", color: COLORS.text, width: 24, textAlign: "center" },
  cartItemRight: { alignItems: "flex-end", gap: 2 },
  cartItemTotal: { fontSize: 13, fontWeight: "700", color: COLORS.text },
  cartItemTotalStrike: { fontSize: 11, color: COLORS.textMuted, textDecorationLine: "line-through" },
  discountToggle: { fontSize: 12 },
  removeBtn: { fontSize: 14, color: COLORS.textMuted, paddingLeft: 4 },
  discountRow: { flexDirection: "row", alignItems: "center", gap: 8, width: "100%", paddingTop: 6 },
  discountLabel: { fontSize: 11, color: COLORS.textSecondary },
  discountInput: { flex: 1, backgroundColor: COLORS.surface, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 4, fontSize: 13, color: COLORS.text, borderWidth: 1, borderColor: COLORS.border },
  discountApplyBtn: { backgroundColor: BRAND.teal, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
  discountApplyText: { color: "#fff", fontSize: 11, fontWeight: "700" },
  discountClearBtn: { paddingHorizontal: 6, paddingVertical: 4 },
  discountClearText: { color: BRAND.rose, fontSize: 11, fontWeight: "600" },
  cartSummary: { padding: 16, borderTopWidth: 1, borderTopColor: COLORS.border, backgroundColor: COLORS.surface },
  summaryRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 4 },
  summaryLabel: { fontSize: 13, color: COLORS.textSecondary },
  summaryValue: { fontSize: 13, fontWeight: "600", color: COLORS.text },
  discountText: { color: BRAND.teal },
  totalRow: { borderTopWidth: 1, borderTopColor: COLORS.border, paddingTop: 8, marginTop: 4, marginBottom: 12 },
  totalLabel: { fontSize: 16, fontWeight: "800", color: COLORS.text },
  totalValue: { fontSize: 16, fontWeight: "800", color: BRAND.navy },
  checkoutBtn: { backgroundColor: BRAND.teal, paddingVertical: 14, borderRadius: 12, alignItems: "center" },
  checkoutBtnText: { color: "#fff", fontWeight: "700", fontSize: 16 },
  shiftContainer: { flex: 1, backgroundColor: BRAND.navy },
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
  shiftOpenBtn: { backgroundColor: BRAND.teal, paddingHorizontal: 40, paddingVertical: 14, borderRadius: 12 },
  shiftOpenBtnText: { color: "#fff", fontWeight: "700", fontSize: 16 },
  sduiBar: { paddingHorizontal: 12, paddingVertical: 6, backgroundColor: "rgba(255,255,255,0.03)", borderBottomWidth: 1, borderBottomColor: "rgba(255,255,255,0.06)" },
});
