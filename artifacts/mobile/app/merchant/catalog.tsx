import React, { useState, useCallback } from "react";
import { View, Text, FlatList, Pressable, StyleSheet, TextInput, Alert, Modal, ScrollView, Switch, ActivityIndicator } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { COLORS } from "@/constants/colors";
import { useMerchant } from "@/context/MerchantContext";
import type { MerchantProduct } from "@/types/merchant";

export default function CatalogScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { products, refreshProducts, addProduct, editProduct, removeProduct } = useMerchant();
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [editorVisible, setEditorVisible] = useState(false);
  const [editingProduct, setEditingProduct] = useState<MerchantProduct | null>(null);
  const [formName, setFormName] = useState("");
  const [formDesc, setFormDesc] = useState("");
  const [formPrice, setFormPrice] = useState("");
  const [formCategory, setFormCategory] = useState("");
  const [formSku, setFormSku] = useState("");
  const [formAvailable, setFormAvailable] = useState(true);
  const [formStock, setFormStock] = useState("");
  const [formLowThreshold, setFormLowThreshold] = useState("");
  const [saving, setSaving] = useState(false);

  const categories = ["All", ...Array.from(new Set(products.map((p) => p.category)))];

  const filtered = products.filter((p) => {
    const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase());
    const matchCategory = categoryFilter === "All" || p.category === categoryFilter;
    return matchSearch && matchCategory;
  });

  const openEditor = useCallback((product?: MerchantProduct) => {
    if (product) {
      setEditingProduct(product);
      setFormName(product.name);
      setFormDesc(product.description);
      setFormPrice(String(product.price));
      setFormCategory(product.category);
      setFormSku(product.sku);
      setFormAvailable(product.available);
      setFormStock(String(product.stockLevel));
      setFormLowThreshold(String(product.lowStockThreshold));
    } else {
      setEditingProduct(null);
      setFormName("");
      setFormDesc("");
      setFormPrice("");
      setFormCategory("");
      setFormSku("");
      setFormAvailable(true);
      setFormStock("0");
      setFormLowThreshold("10");
    }
    setEditorVisible(true);
  }, []);

  const handleSave = useCallback(async () => {
    if (!formName.trim() || !formPrice.trim()) {
      Alert.alert("Required Fields", "Product name and price are required.");
      return;
    }
    setSaving(true);
    if (editingProduct) {
      await editProduct(editingProduct.id, {
        name: formName,
        description: formDesc,
        price: parseFloat(formPrice),
        category: formCategory,
        sku: formSku,
        available: formAvailable,
        stockLevel: parseInt(formStock) || 0,
        lowStockThreshold: parseInt(formLowThreshold) || 10,
      });
    } else {
      await addProduct({
        name: formName,
        description: formDesc,
        price: parseFloat(formPrice),
        currency: "SAR",
        category: formCategory || "Uncategorized",
        available: formAvailable,
        variants: [],
        stockLevel: parseInt(formStock) || 0,
        lowStockThreshold: parseInt(formLowThreshold) || 10,
        sku: formSku || `SKU-${Date.now()}`,
        tags: [],
      });
    }
    setSaving(false);
    setEditorVisible(false);
  }, [editingProduct, formName, formDesc, formPrice, formCategory, formSku, formAvailable, formStock, formLowThreshold, editProduct, addProduct]);

  const handleDelete = useCallback((product: MerchantProduct) => {
    Alert.alert(
      "Delete Product",
      `Are you sure you want to delete "${product.name}"?`,
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", style: "destructive", onPress: () => removeProduct(product.id) },
      ]
    );
  }, [removeProduct]);

  const renderProduct = useCallback(({ item }: { item: MerchantProduct }) => (
    <Pressable style={styles.productCard} onPress={() => openEditor(item)}>
      <View style={styles.productHeader}>
        <View style={styles.productInfo}>
          <Text style={styles.productName}>{item.name}</Text>
          <Text style={styles.productCategory}>{item.category}</Text>
        </View>
        <View style={{ alignItems: "flex-end" }}>
          <Text style={styles.productPrice}>{item.price.toFixed(2)} {item.currency}</Text>
          <View style={[styles.availBadge, !item.available && styles.unavailBadge]}>
            <Text style={[styles.availText, !item.available && styles.unavailText]}>
              {item.available ? "Available" : "Unavailable"}
            </Text>
          </View>
        </View>
      </View>
      <Text style={styles.productDesc} numberOfLines={1}>{item.description}</Text>
      <View style={styles.productFooter}>
        <Text style={styles.sku}>SKU: {item.sku}</Text>
        <Text style={[styles.stockLabel, item.stockLevel <= item.lowStockThreshold && styles.lowStock]}>
          Stock: {item.stockLevel}
        </Text>
        <Pressable style={styles.deleteBtn} onPress={() => handleDelete(item)}>
          <Text style={styles.deleteBtnText}>Delete</Text>
        </Pressable>
      </View>
    </Pressable>
  ), [openEditor, handleDelete]);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backIcon}>{"<"}</Text>
        </Pressable>
        <Text style={styles.title}>Catalog</Text>
        <Pressable style={styles.addBtn} onPress={() => openEditor()}>
          <Text style={styles.addBtnText}>+ Add</Text>
        </Pressable>
      </View>

      <View style={styles.searchRow}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search products..."
          placeholderTextColor={COLORS.textMuted}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      <View style={styles.categories}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.catScroll}>
          {categories.map((cat) => (
            <Pressable key={cat} style={[styles.catChip, categoryFilter === cat && styles.catActive]} onPress={() => setCategoryFilter(cat)}>
              <Text style={[styles.catText, categoryFilter === cat && styles.catTextActive]}>{cat}</Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      <FlatList
        data={filtered}
        renderItem={renderProduct}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>📋</Text>
            <Text style={styles.emptyText}>No products found</Text>
          </View>
        }
      />

      <Modal visible={editorVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { paddingTop: insets.top + 16 }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{editingProduct ? "Edit Product" : "New Product"}</Text>
              <Pressable onPress={() => setEditorVisible(false)}>
                <Text style={styles.modalClose}>X</Text>
              </Pressable>
            </View>
            <ScrollView style={styles.form} contentContainerStyle={styles.formContent}>
              <Text style={styles.fieldLabel}>Name *</Text>
              <TextInput style={styles.fieldInput} value={formName} onChangeText={setFormName} placeholder="Product name" placeholderTextColor={COLORS.textMuted} />

              <Text style={styles.fieldLabel}>Description</Text>
              <TextInput style={[styles.fieldInput, styles.multiline]} value={formDesc} onChangeText={setFormDesc} placeholder="Description" placeholderTextColor={COLORS.textMuted} multiline />

              <Text style={styles.fieldLabel}>Price (SAR) *</Text>
              <TextInput style={styles.fieldInput} value={formPrice} onChangeText={setFormPrice} placeholder="0.00" placeholderTextColor={COLORS.textMuted} keyboardType="decimal-pad" />

              <Text style={styles.fieldLabel}>Category</Text>
              <TextInput style={styles.fieldInput} value={formCategory} onChangeText={setFormCategory} placeholder="Category" placeholderTextColor={COLORS.textMuted} />

              <Text style={styles.fieldLabel}>SKU</Text>
              <TextInput style={styles.fieldInput} value={formSku} onChangeText={setFormSku} placeholder="SKU-001" placeholderTextColor={COLORS.textMuted} />

              <View style={styles.switchRow}>
                <Text style={styles.fieldLabel}>Available</Text>
                <Switch value={formAvailable} onValueChange={setFormAvailable} trackColor={{ false: "#ccc", true: "#0d9488" }} thumbColor="#fff" />
              </View>

              <Text style={styles.fieldLabel}>Stock Level</Text>
              <TextInput style={styles.fieldInput} value={formStock} onChangeText={setFormStock} placeholder="0" placeholderTextColor={COLORS.textMuted} keyboardType="number-pad" />

              <Text style={styles.fieldLabel}>Low Stock Threshold</Text>
              <TextInput style={styles.fieldInput} value={formLowThreshold} onChangeText={setFormLowThreshold} placeholder="10" placeholderTextColor={COLORS.textMuted} keyboardType="number-pad" />
            </ScrollView>
            <Pressable style={[styles.saveBtn, saving && styles.saveBtnDisabled]} onPress={handleSave} disabled={saving}>
              {saving ? <ActivityIndicator size="small" color="#fff" /> : <Text style={styles.saveBtnText}>{editingProduct ? "Update Product" : "Create Product"}</Text>}
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.surface },
  header: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 12, backgroundColor: "#0a1628", gap: 12 },
  backBtn: { width: 36, height: 36, borderRadius: 10, backgroundColor: "rgba(255,255,255,0.15)", alignItems: "center", justifyContent: "center" },
  backIcon: { color: "#fff", fontSize: 18, fontWeight: "700" },
  title: { flex: 1, fontSize: 20, fontWeight: "800", color: "#fff" },
  addBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10, backgroundColor: "#0d9488" },
  addBtnText: { color: "#fff", fontWeight: "700", fontSize: 13 },
  searchRow: { paddingHorizontal: 16, paddingVertical: 10, backgroundColor: COLORS.surfaceWhite, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  searchInput: { backgroundColor: COLORS.surface, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10, fontSize: 14, color: COLORS.text, borderWidth: 1, borderColor: COLORS.border },
  categories: { backgroundColor: COLORS.surfaceWhite, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  catScroll: { paddingHorizontal: 16, paddingVertical: 8, gap: 8 },
  catChip: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border },
  catActive: { backgroundColor: "#0a1628", borderColor: "#0a1628" },
  catText: { fontSize: 12, fontWeight: "600", color: COLORS.textSecondary },
  catTextActive: { color: "#fff" },
  list: { padding: 16, gap: 10, paddingBottom: 40 },
  productCard: { backgroundColor: COLORS.surfaceWhite, borderRadius: 12, padding: 14, borderWidth: 1, borderColor: COLORS.border, gap: 6 },
  productHeader: { flexDirection: "row", justifyContent: "space-between" },
  productInfo: { flex: 1 },
  productName: { fontSize: 15, fontWeight: "700", color: COLORS.text },
  productCategory: { fontSize: 11, color: COLORS.textSecondary },
  productPrice: { fontSize: 15, fontWeight: "800", color: COLORS.text },
  availBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8, backgroundColor: "#d1fae5", marginTop: 2 },
  unavailBadge: { backgroundColor: "#fee2e2" },
  availText: { fontSize: 10, fontWeight: "600", color: "#065f46" },
  unavailText: { color: "#991b1b" },
  productDesc: { fontSize: 12, color: COLORS.textSecondary },
  productFooter: { flexDirection: "row", alignItems: "center", gap: 12, borderTopWidth: 1, borderTopColor: COLORS.border, paddingTop: 6 },
  sku: { fontSize: 11, color: COLORS.textMuted },
  stockLabel: { fontSize: 11, color: COLORS.textSecondary, flex: 1 },
  lowStock: { color: "#d97706", fontWeight: "700" },
  deleteBtn: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6, borderWidth: 1, borderColor: "#e11d48" },
  deleteBtnText: { color: "#e11d48", fontSize: 11, fontWeight: "600" },
  empty: { alignItems: "center", paddingTop: 80, gap: 8 },
  emptyIcon: { fontSize: 48 },
  emptyText: { fontSize: 16, color: COLORS.textSecondary },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)" },
  modalContent: { flex: 1, backgroundColor: COLORS.surfaceWhite, borderTopLeftRadius: 20, borderTopRightRadius: 20, marginTop: 60, padding: 20 },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  modalTitle: { fontSize: 20, fontWeight: "800", color: COLORS.text },
  modalClose: { fontSize: 18, color: COLORS.textSecondary, fontWeight: "700", padding: 4 },
  form: { flex: 1 },
  formContent: { gap: 4, paddingBottom: 20 },
  fieldLabel: { fontSize: 12, fontWeight: "600", color: COLORS.textSecondary, marginTop: 8 },
  fieldInput: { backgroundColor: COLORS.surface, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, color: COLORS.text, borderWidth: 1, borderColor: COLORS.border },
  multiline: { minHeight: 60, textAlignVertical: "top" },
  switchRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 8 },
  saveBtn: { backgroundColor: "#0a1628", paddingVertical: 14, borderRadius: 12, alignItems: "center", marginTop: 12 },
  saveBtnDisabled: { opacity: 0.5 },
  saveBtnText: { color: "#fff", fontWeight: "700", fontSize: 15 },
});
