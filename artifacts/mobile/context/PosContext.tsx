import React, { createContext, useCallback, useContext, useEffect, useReducer, useRef, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuth } from "./AuthContext";
import { PosApi } from "@/lib/pos-api";
import type {
  PosProduct,
  CartItem,
  CartState,
  PosTransaction,
  KitchenOrder,
  PosShift,
  OfflineAction,
  PaymentDetails,
  DailySalesReport,
} from "@/types/pos";
import { generateId } from "@/lib/id";
import NetInfo from "@react-native-community/netinfo";

const OFFLINE_QUEUE_KEY = "dakkah_pos_offline_queue";
const PRODUCT_CACHE_KEY = "dakkah_pos_products_cache";

interface CartAction {
  type: "ADD_ITEM" | "REMOVE_ITEM" | "UPDATE_QUANTITY" | "SET_DISCOUNT" | "CLEAR_CART" | "SET_NOTES";
  payload?: Record<string, unknown>;
}

function calculateCart(items: CartItem[]): CartState {
  let subtotal = 0;
  let taxTotal = 0;
  let discountTotal = 0;
  for (const item of items) {
    const variantMod = item.variantId
      ? item.product.variants.find((v) => v.id === item.variantId)?.priceModifier || 0
      : 0;
    const unitPrice = item.product.price + variantMod;
    const lineSubtotal = unitPrice * item.quantity;
    const lineDiscount = lineSubtotal * (item.lineDiscount / 100);
    const lineAfterDiscount = lineSubtotal - lineDiscount;
    const lineTax = lineAfterDiscount * (item.product.tax / 100);
    subtotal += lineSubtotal;
    discountTotal += lineDiscount;
    taxTotal += lineTax;
  }
  return {
    items,
    subtotal: Math.round(subtotal * 100) / 100,
    taxTotal: Math.round(taxTotal * 100) / 100,
    discountTotal: Math.round(discountTotal * 100) / 100,
    total: Math.round((subtotal - discountTotal + taxTotal) * 100) / 100,
    currency: items[0]?.product.currency || "SAR",
  };
}

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "ADD_ITEM": {
      const product = action.payload?.product as PosProduct;
      const variantId = action.payload?.variantId as string | undefined;
      const existing = state.items.find(
        (i) => i.product.id === product.id && i.variantId === variantId
      );
      if (existing) {
        const items = state.items.map((i) =>
          i.product.id === product.id && i.variantId === variantId
            ? { ...i, quantity: i.quantity + 1 }
            : i
        );
        return calculateCart(items);
      }
      return calculateCart([
        ...state.items,
        { product, quantity: 1, variantId, lineDiscount: 0 },
      ]);
    }
    case "REMOVE_ITEM": {
      const id = action.payload?.productId as string;
      const varId = action.payload?.variantId as string | undefined;
      return calculateCart(
        state.items.filter((i) => !(i.product.id === id && i.variantId === varId))
      );
    }
    case "UPDATE_QUANTITY": {
      const id = action.payload?.productId as string;
      const varId = action.payload?.variantId as string | undefined;
      const qty = action.payload?.quantity as number;
      if (qty <= 0) {
        return calculateCart(
          state.items.filter((i) => !(i.product.id === id && i.variantId === varId))
        );
      }
      return calculateCart(
        state.items.map((i) =>
          i.product.id === id && i.variantId === varId ? { ...i, quantity: qty } : i
        )
      );
    }
    case "SET_DISCOUNT": {
      const id = action.payload?.productId as string;
      const varId = action.payload?.variantId as string | undefined;
      const discount = action.payload?.discount as number;
      return calculateCart(
        state.items.map((i) =>
          i.product.id === id && i.variantId === varId
            ? { ...i, lineDiscount: Math.min(Math.max(discount, 0), 100) }
            : i
        )
      );
    }
    case "SET_NOTES": {
      const id = action.payload?.productId as string;
      const varId = action.payload?.variantId as string | undefined;
      const notes = action.payload?.notes as string;
      return calculateCart(
        state.items.map((i) =>
          i.product.id === id && i.variantId === varId ? { ...i, notes } : i
        )
      );
    }
    case "CLEAR_CART":
      return calculateCart([]);
    default:
      return state;
  }
}

interface PosContextValue {
  products: PosProduct[];
  categories: string[];
  cart: CartState;
  kitchenOrders: KitchenOrder[];
  activeShift: PosShift | null;
  lastTransaction: PosTransaction | null;
  isOnline: boolean;
  isLoading: boolean;
  offlineQueueCount: number;
  addToCart: (product: PosProduct, variantId?: string) => void;
  removeFromCart: (productId: string, variantId?: string) => void;
  updateQuantity: (productId: string, quantity: number, variantId?: string) => void;
  setLineDiscount: (productId: string, discount: number, variantId?: string) => void;
  clearCart: () => void;
  checkout: (payment: Omit<PaymentDetails, "transactionId">) => Promise<PosTransaction>;
  lookupBarcode: (barcode: string) => Promise<PosProduct | null>;
  openShift: (openingCash: number) => Promise<void>;
  closeShift: (closingCash: number) => Promise<PosShift>;
  updateKitchenStatus: (orderId: string, status: KitchenOrder["status"]) => Promise<void>;
  syncOfflineActions: () => Promise<void>;
  getDailyReport: () => Promise<DailySalesReport>;
  refreshProducts: () => Promise<void>;
}

const PosContext = createContext<PosContextValue>({} as PosContextValue);

export function PosProvider({ children }: { children: React.ReactNode }) {
  const { getAccessToken } = useAuth();
  const [products, setProducts] = useState<PosProduct[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [cart, dispatch] = useReducer(cartReducer, calculateCart([]));
  const [kitchenOrders, setKitchenOrders] = useState<KitchenOrder[]>([]);
  const [activeShift, setActiveShift] = useState<PosShift | null>(null);
  const [lastTransaction, setLastTransaction] = useState<PosTransaction | null>(null);
  const [isOnline, setIsOnline] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [offlineQueue, setOfflineQueue] = useState<OfflineAction[]>([]);
  const kitchenPollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const unsub = NetInfo.addEventListener((state) => {
      setIsOnline(!!state.isConnected);
    });
    return () => unsub();
  }, []);

  const refreshProducts = useCallback(async () => {
    try {
      const token = await getAccessToken();
      const data = await PosApi.getProducts(token);
      setProducts(data.products);
      const cats = [...new Set(data.products.map((p) => p.category))];
      setCategories(cats);
      await AsyncStorage.setItem(PRODUCT_CACHE_KEY, JSON.stringify(data.products));
    } catch {
      const cached = await AsyncStorage.getItem(PRODUCT_CACHE_KEY);
      if (cached) {
        const prods: PosProduct[] = JSON.parse(cached);
        setProducts(prods);
        setCategories([...new Set(prods.map((p) => p.category))]);
      }
    }
  }, [getAccessToken]);

  useEffect(() => {
    (async () => {
      setIsLoading(true);
      await refreshProducts();
      try {
        const token = await getAccessToken();
        const shiftData = await PosApi.getActiveShift(token);
        setActiveShift(shiftData.shift);
      } catch {}
      const savedQueue = await AsyncStorage.getItem(OFFLINE_QUEUE_KEY);
      if (savedQueue) setOfflineQueue(JSON.parse(savedQueue));
      setIsLoading(false);
    })();
  }, [refreshProducts, getAccessToken]);

  useEffect(() => {
    if (activeShift) {
      kitchenPollRef.current = setInterval(async () => {
        try {
          const token = await getAccessToken();
          const data = await PosApi.getKitchenOrders(token);
          setKitchenOrders(data.orders);
        } catch {}
      }, 10000);
    }
    return () => {
      if (kitchenPollRef.current) clearInterval(kitchenPollRef.current);
    };
  }, [activeShift, getAccessToken]);

  const addOfflineAction = useCallback(async (action: OfflineAction) => {
    setOfflineQueue((prev) => {
      const next = [...prev, action];
      AsyncStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(next)).catch(() => {});
      return next;
    });
  }, []);

  const addToCart = useCallback((product: PosProduct, variantId?: string) => {
    dispatch({ type: "ADD_ITEM", payload: { product, variantId } });
  }, []);

  const removeFromCart = useCallback((productId: string, variantId?: string) => {
    dispatch({ type: "REMOVE_ITEM", payload: { productId, variantId } });
  }, []);

  const updateQuantity = useCallback((productId: string, quantity: number, variantId?: string) => {
    dispatch({ type: "UPDATE_QUANTITY", payload: { productId, quantity, variantId } });
  }, []);

  const setLineDiscount = useCallback((productId: string, discount: number, variantId?: string) => {
    dispatch({ type: "SET_DISCOUNT", payload: { productId, discount, variantId } });
  }, []);

  const clearCart = useCallback(() => {
    dispatch({ type: "CLEAR_CART" });
  }, []);

  const checkout = useCallback(
    async (payment: Omit<PaymentDetails, "transactionId">): Promise<PosTransaction> => {
      const payload = {
        items: cart.items.map((i) => ({
          productId: i.product.id,
          quantity: i.quantity,
          variantId: i.variantId,
          lineDiscount: i.lineDiscount,
        })),
        payment,
        shiftId: activeShift?.id || "no-shift",
      };

      if (!isOnline) {
        const offlineTx: PosTransaction = {
          id: generateId("tx"),
          orderNumber: `OFF-${Date.now().toString(36).toUpperCase()}`,
          items: cart.items,
          subtotal: cart.subtotal,
          taxTotal: cart.taxTotal,
          discountTotal: cart.discountTotal,
          total: cart.total,
          currency: cart.currency,
          payment: { ...payment, transactionId: generateId("pay") },
          status: "completed",
          cashierId: "offline",
          terminalId: "offline",
          shiftId: activeShift?.id || "no-shift",
          createdAt: new Date().toISOString(),
        };
        await addOfflineAction({
          id: generateId("offline"),
          type: "checkout",
          payload: payload as unknown as Record<string, unknown>,
          createdAt: new Date().toISOString(),
          synced: false,
        });
        setLastTransaction(offlineTx);
        dispatch({ type: "CLEAR_CART" });
        return offlineTx;
      }

      const token = await getAccessToken();
      const data = await PosApi.checkout(payload, token);
      setLastTransaction(data.transaction);
      dispatch({ type: "CLEAR_CART" });
      return data.transaction;
    },
    [cart, activeShift, isOnline, getAccessToken, addOfflineAction]
  );

  const lookupBarcode = useCallback(
    async (barcode: string): Promise<PosProduct | null> => {
      const local = products.find((p) => p.barcode === barcode);
      if (local) return local;
      try {
        const token = await getAccessToken();
        const data = await PosApi.lookupBarcode(barcode, token);
        return data.product;
      } catch {
        return null;
      }
    },
    [products, getAccessToken]
  );

  const openShift = useCallback(
    async (openingCash: number) => {
      const token = await getAccessToken();
      const data = await PosApi.openShift(openingCash, token);
      setActiveShift(data.shift);
    },
    [getAccessToken]
  );

  const closeShift = useCallback(
    async (closingCash: number): Promise<PosShift> => {
      if (!activeShift) throw new Error("No active shift");
      const token = await getAccessToken();
      const data = await PosApi.closeShift(activeShift.id, closingCash, token);
      setActiveShift(null);
      return data.shift;
    },
    [activeShift, getAccessToken]
  );

  const updateKitchenStatus = useCallback(
    async (orderId: string, status: KitchenOrder["status"]) => {
      const token = await getAccessToken();
      await PosApi.updateKitchenStatus(orderId, status, token);
      setKitchenOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status } : o))
      );
    },
    [getAccessToken]
  );

  const syncOfflineActions = useCallback(async () => {
    if (offlineQueue.length === 0) return;
    const token = await getAccessToken();
    const synced: string[] = [];
    for (const action of offlineQueue) {
      if (action.synced) continue;
      try {
        if (action.type === "checkout") {
          await PosApi.checkout(action.payload as Parameters<typeof PosApi.checkout>[0], token);
        }
        synced.push(action.id);
      } catch {}
    }
    const remaining = offlineQueue.filter((a) => !synced.includes(a.id));
    setOfflineQueue(remaining);
    await AsyncStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(remaining));
  }, [offlineQueue, getAccessToken]);

  useEffect(() => {
    if (isOnline && offlineQueue.length > 0) {
      syncOfflineActions();
    }
  }, [isOnline, offlineQueue.length, syncOfflineActions]);

  const getDailyReport = useCallback(async (): Promise<DailySalesReport> => {
    const token = await getAccessToken();
    const data = await PosApi.getDailyReport(undefined, token);
    return data.report;
  }, [getAccessToken]);

  return (
    <PosContext.Provider
      value={{
        products,
        categories,
        cart,
        kitchenOrders,
        activeShift,
        lastTransaction,
        isOnline,
        isLoading,
        offlineQueueCount: offlineQueue.length,
        addToCart,
        removeFromCart,
        updateQuantity,
        setLineDiscount,
        clearCart,
        checkout,
        lookupBarcode,
        openShift,
        closeShift,
        updateKitchenStatus,
        syncOfflineActions,
        getDailyReport,
        refreshProducts,
      }}
    >
      {children}
    </PosContext.Provider>
  );
}

export function usePos() {
  return useContext(PosContext);
}
