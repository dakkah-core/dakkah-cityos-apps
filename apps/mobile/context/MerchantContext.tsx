import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";
import { useAuth } from "./AuthContext";
import type {
  MerchantOrder,
  OrderStatus,
  MerchantProduct,
  InventoryItem,
  Booking,
  TableInfo,
  SalesAnalytics,
  Campaign,
  MerchantProfile,
} from "@/types/merchant";
import {
  getMerchantProfile as apiGetProfile,
  updateStoreStatus as apiUpdateStoreStatus,
  getMerchantOrders as apiGetOrders,
  updateOrderStatus as apiUpdateOrderStatus,
  getMerchantProducts as apiGetProducts,
  createProduct as apiCreateProduct,
  updateProduct as apiUpdateProduct,
  deleteProduct as apiDeleteProduct,
  getInventory as apiGetInventory,
  updateStock as apiUpdateStock,
  getBookings as apiGetBookings,
  updateBookingStatus as apiUpdateBookingStatus,
  getTables as apiGetTables,
  getSalesAnalytics as apiGetAnalytics,
  getCampaigns as apiGetCampaigns,
  createCampaign as apiCreateCampaign,
  updateCampaignStatus as apiUpdateCampaignStatus,
} from "@/lib/merchant-api";

const CACHED_ORDERS_KEY = "dakkah_merchant_cached_orders";
const POLL_INTERVAL = 15000;

interface MerchantContextValue {
  profile: MerchantProfile | null;
  orders: MerchantOrder[];
  products: MerchantProduct[];
  inventory: InventoryItem[];
  bookings: Booking[];
  tables: TableInfo[];
  campaigns: Campaign[];
  pendingCount: number;
  lowStockCount: number;
  isLoading: boolean;
  toggleStoreOpen: () => Promise<void>;
  refreshOrders: () => Promise<void>;
  acceptOrder: (orderId: string) => Promise<boolean>;
  rejectOrder: (orderId: string, reason: string) => Promise<boolean>;
  markPreparing: (orderId: string) => Promise<boolean>;
  markReady: (orderId: string) => Promise<boolean>;
  refreshProducts: () => Promise<void>;
  addProduct: (product: Omit<MerchantProduct, "id">) => Promise<MerchantProduct | null>;
  editProduct: (productId: string, updates: Partial<MerchantProduct>) => Promise<boolean>;
  removeProduct: (productId: string) => Promise<boolean>;
  refreshInventory: () => Promise<void>;
  setStock: (productId: string, level: number) => Promise<boolean>;
  refreshBookings: (date?: string) => Promise<void>;
  confirmBooking: (bookingId: string) => Promise<boolean>;
  cancelBooking: (bookingId: string) => Promise<boolean>;
  seatBooking: (bookingId: string) => Promise<boolean>;
  completeBooking: (bookingId: string) => Promise<boolean>;
  refreshTables: () => Promise<void>;
  getAnalytics: (period: "today" | "week" | "month") => Promise<SalesAnalytics | null>;
  refreshCampaigns: () => Promise<void>;
  addCampaign: (campaign: Omit<Campaign, "id" | "redemptions">) => Promise<Campaign | null>;
  toggleCampaign: (campaignId: string, active: boolean) => Promise<boolean>;
}

const MerchantContext = createContext<MerchantContextValue>({
  profile: null,
  orders: [],
  products: [],
  inventory: [],
  bookings: [],
  tables: [],
  campaigns: [],
  pendingCount: 0,
  lowStockCount: 0,
  isLoading: true,
  toggleStoreOpen: async () => {},
  refreshOrders: async () => {},
  acceptOrder: async () => false,
  rejectOrder: async () => false,
  markPreparing: async () => false,
  markReady: async () => false,
  refreshProducts: async () => {},
  addProduct: async () => null,
  editProduct: async () => false,
  removeProduct: async () => false,
  refreshInventory: async () => {},
  setStock: async () => false,
  refreshBookings: async () => {},
  confirmBooking: async () => false,
  cancelBooking: async () => false,
  seatBooking: async () => false,
  completeBooking: async () => false,
  refreshTables: async () => {},
  getAnalytics: async () => null,
  refreshCampaigns: async () => {},
  addCampaign: async () => null,
  toggleCampaign: async () => false,
});

export function MerchantProvider({ children }: { children: React.ReactNode }) {
  const { getAccessToken } = useAuth();
  const [profile, setProfile] = useState<MerchantProfile | null>(null);
  const [orders, setOrders] = useState<MerchantOrder[]>([]);
  const [products, setProducts] = useState<MerchantProduct[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [tables, setTables] = useState<TableInfo[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const pendingCount = orders.filter((o) => o.status === "pending").length;
  const lowStockCount = inventory.filter((i) => i.status === "low_stock" || i.status === "out_of_stock").length;

  const refreshOrders = useCallback(async () => {
    const token = await getAccessToken();
    const fetched = await apiGetOrders(undefined, token || undefined);
    setOrders(fetched);
    await AsyncStorage.setItem(CACHED_ORDERS_KEY, JSON.stringify(fetched)).catch(() => {});
  }, [getAccessToken]);

  const refreshProducts = useCallback(async () => {
    const token = await getAccessToken();
    const fetched = await apiGetProducts(token || undefined);
    setProducts(fetched);
  }, [getAccessToken]);

  const refreshInventory = useCallback(async () => {
    const token = await getAccessToken();
    const fetched = await apiGetInventory(token || undefined);
    setInventory(fetched);
  }, [getAccessToken]);

  const refreshBookings = useCallback(async (date?: string) => {
    const token = await getAccessToken();
    const fetched = await apiGetBookings(date, token || undefined);
    setBookings(fetched);
  }, [getAccessToken]);

  const refreshTables = useCallback(async () => {
    const token = await getAccessToken();
    const fetched = await apiGetTables(token || undefined);
    setTables(fetched);
  }, [getAccessToken]);

  const refreshCampaigns = useCallback(async () => {
    const token = await getAccessToken();
    const fetched = await apiGetCampaigns(token || undefined);
    setCampaigns(fetched);
  }, [getAccessToken]);

  useEffect(() => {
    (async () => {
      try {
        const token = await getAccessToken();
        const p = await apiGetProfile(token || undefined);
        setProfile(p);

        const cached = await AsyncStorage.getItem(CACHED_ORDERS_KEY);
        if (cached) setOrders(JSON.parse(cached));

        await Promise.all([
          refreshOrders(),
          refreshProducts(),
          refreshInventory(),
          refreshBookings(),
          refreshTables(),
          refreshCampaigns(),
        ]);
      } catch {} finally {
        setIsLoading(false);
      }
    })();

    pollRef.current = setInterval(() => {
      refreshOrders();
    }, POLL_INTERVAL);

    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [getAccessToken, refreshOrders, refreshProducts, refreshInventory, refreshBookings, refreshTables, refreshCampaigns]);

  useEffect(() => {
    const sub = Notifications.addNotificationReceivedListener((notification) => {
      const cat = notification.request.content.categoryIdentifier;
      if (cat === "new_order" || cat === "order_updated" || cat === "booking_request") {
        refreshOrders();
        refreshBookings();
      }
    });
    return () => sub.remove();
  }, [refreshOrders, refreshBookings]);

  const toggleStoreOpen = useCallback(async () => {
    const token = await getAccessToken();
    const newStatus = !(profile?.isOpen ?? false);
    const updated = await apiUpdateStoreStatus(newStatus, token || undefined);
    if (updated) setProfile(updated);
  }, [getAccessToken, profile]);

  const acceptOrder = useCallback(async (orderId: string) => {
    const token = await getAccessToken();
    const updated = await apiUpdateOrderStatus(orderId, "accepted", undefined, token || undefined);
    if (updated) {
      setOrders((prev) => prev.map((o) => (o.id === orderId ? updated : o)));
      return true;
    }
    return false;
  }, [getAccessToken]);

  const rejectOrder = useCallback(async (orderId: string, reason: string) => {
    const token = await getAccessToken();
    const updated = await apiUpdateOrderStatus(orderId, "rejected", reason, token || undefined);
    if (updated) {
      setOrders((prev) => prev.map((o) => (o.id === orderId ? updated : o)));
      return true;
    }
    return false;
  }, [getAccessToken]);

  const markPreparing = useCallback(async (orderId: string) => {
    const token = await getAccessToken();
    const updated = await apiUpdateOrderStatus(orderId, "preparing", undefined, token || undefined);
    if (updated) {
      setOrders((prev) => prev.map((o) => (o.id === orderId ? updated : o)));
      return true;
    }
    return false;
  }, [getAccessToken]);

  const markReady = useCallback(async (orderId: string) => {
    const token = await getAccessToken();
    const updated = await apiUpdateOrderStatus(orderId, "ready", undefined, token || undefined);
    if (updated) {
      setOrders((prev) => prev.map((o) => (o.id === orderId ? updated : o)));
      return true;
    }
    return false;
  }, [getAccessToken]);

  const addProduct = useCallback(async (product: Omit<MerchantProduct, "id">) => {
    const token = await getAccessToken();
    const created = await apiCreateProduct(product, token || undefined);
    if (created) {
      setProducts((prev) => [created, ...prev]);
      return created;
    }
    return null;
  }, [getAccessToken]);

  const editProduct = useCallback(async (productId: string, updates: Partial<MerchantProduct>) => {
    const token = await getAccessToken();
    const updated = await apiUpdateProduct(productId, updates, token || undefined);
    if (updated) {
      setProducts((prev) => prev.map((p) => (p.id === productId ? updated : p)));
      return true;
    }
    return false;
  }, [getAccessToken]);

  const removeProduct = useCallback(async (productId: string) => {
    const token = await getAccessToken();
    const ok = await apiDeleteProduct(productId, token || undefined);
    if (ok) {
      setProducts((prev) => prev.filter((p) => p.id !== productId));
      return true;
    }
    return false;
  }, [getAccessToken]);

  const setStock = useCallback(async (productId: string, level: number) => {
    const token = await getAccessToken();
    const updated = await apiUpdateStock(productId, level, token || undefined);
    if (updated) {
      setInventory((prev) => prev.map((i) => (i.productId === productId ? updated : i)));
      return true;
    }
    return false;
  }, [getAccessToken]);

  const confirmBooking = useCallback(async (bookingId: string) => {
    const token = await getAccessToken();
    const updated = await apiUpdateBookingStatus(bookingId, "confirmed", token || undefined);
    if (updated) {
      setBookings((prev) => prev.map((b) => (b.id === bookingId ? updated : b)));
      return true;
    }
    return false;
  }, [getAccessToken]);

  const cancelBooking = useCallback(async (bookingId: string) => {
    const token = await getAccessToken();
    const updated = await apiUpdateBookingStatus(bookingId, "cancelled", token || undefined);
    if (updated) {
      setBookings((prev) => prev.map((b) => (b.id === bookingId ? updated : b)));
      return true;
    }
    return false;
  }, [getAccessToken]);

  const seatBooking = useCallback(async (bookingId: string) => {
    const token = await getAccessToken();
    const updated = await apiUpdateBookingStatus(bookingId, "seated", token || undefined);
    if (updated) {
      setBookings((prev) => prev.map((b) => (b.id === bookingId ? updated : b)));
      return true;
    }
    return false;
  }, [getAccessToken]);

  const completeBooking = useCallback(async (bookingId: string) => {
    const token = await getAccessToken();
    const updated = await apiUpdateBookingStatus(bookingId, "completed", token || undefined);
    if (updated) {
      setBookings((prev) => prev.map((b) => (b.id === bookingId ? updated : b)));
      return true;
    }
    return false;
  }, [getAccessToken]);

  const getAnalytics = useCallback(async (period: "today" | "week" | "month") => {
    const token = await getAccessToken();
    return apiGetAnalytics(period, token || undefined);
  }, [getAccessToken]);

  const addCampaign = useCallback(async (campaign: Omit<Campaign, "id" | "redemptions">) => {
    const token = await getAccessToken();
    const created = await apiCreateCampaign(campaign, token || undefined);
    if (created) {
      setCampaigns((prev) => [created, ...prev]);
      return created;
    }
    return null;
  }, [getAccessToken]);

  const toggleCampaign = useCallback(async (campaignId: string, active: boolean) => {
    const token = await getAccessToken();
    const updated = await apiUpdateCampaignStatus(campaignId, active ? "active" : "paused", token || undefined);
    if (updated) {
      setCampaigns((prev) => prev.map((c) => (c.id === campaignId ? updated : c)));
      return true;
    }
    return false;
  }, [getAccessToken]);

  return (
    <MerchantContext.Provider value={{
      profile,
      orders,
      products,
      inventory,
      bookings,
      tables,
      campaigns,
      pendingCount,
      lowStockCount,
      isLoading,
      toggleStoreOpen,
      refreshOrders,
      acceptOrder,
      rejectOrder,
      markPreparing,
      markReady,
      refreshProducts,
      addProduct,
      editProduct,
      removeProduct,
      refreshInventory,
      setStock,
      refreshBookings,
      confirmBooking,
      cancelBooking,
      seatBooking,
      completeBooking,
      refreshTables,
      getAnalytics,
      refreshCampaigns,
      addCampaign,
      toggleCampaign,
    }}>
      {children}
    </MerchantContext.Provider>
  );
}

export function useMerchant() {
  return useContext(MerchantContext);
}
