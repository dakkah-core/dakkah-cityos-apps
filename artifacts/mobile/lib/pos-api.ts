import type {
  PosProduct,
  PosTransaction,
  KitchenOrder,
  PosShift,
  ReturnRequest,
  DailySalesReport,
  CartItem,
  PaymentDetails,
} from "@/types/pos";

const API_BASE = process.env.EXPO_PUBLIC_DOMAIN
  ? `https://${process.env.EXPO_PUBLIC_DOMAIN}/api`
  : "http://localhost:8080/api";

async function posRequest<T>(
  path: string,
  options: RequestInit = {},
  token?: string | null
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: { ...headers, ...(options.headers as Record<string, string>) },
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.error?.message || "POS API error");
  return data.data as T;
}

export const PosApi = {
  getProducts: (token?: string | null, category?: string) =>
    posRequest<{ products: PosProduct[] }>(
      `/commerce/pos/products${category ? `?category=${category}` : ""}`,
      {},
      token
    ),

  lookupBarcode: (barcode: string, token?: string | null) =>
    posRequest<{ product: PosProduct }>(
      `/commerce/pos/products/barcode/${barcode}`,
      {},
      token
    ),

  checkout: (
    payload: {
      items: Array<{
        productId: string;
        quantity: number;
        variantId?: string;
        lineDiscount: number;
      }>;
      payment: Omit<PaymentDetails, "transactionId">;
      shiftId: string;
    },
    token?: string | null
  ) =>
    posRequest<{ transaction: PosTransaction }>(
      "/commerce/pos/checkout",
      { method: "POST", body: JSON.stringify(payload) },
      token
    ),

  getKitchenOrders: (token?: string | null) =>
    posRequest<{ orders: KitchenOrder[] }>(
      "/commerce/pos/kitchen",
      {},
      token
    ),

  updateKitchenStatus: (
    orderId: string,
    status: KitchenOrder["status"],
    token?: string | null
  ) =>
    posRequest<{ order: KitchenOrder }>(
      `/commerce/pos/kitchen/${orderId}/status`,
      { method: "PATCH", body: JSON.stringify({ status }) },
      token
    ),

  openShift: (openingCash: number, token?: string | null) =>
    posRequest<{ shift: PosShift }>(
      "/commerce/pos/shift/open",
      { method: "POST", body: JSON.stringify({ openingCash }) },
      token
    ),

  closeShift: (shiftId: string, closingCash: number, token?: string | null) =>
    posRequest<{ shift: PosShift }>(
      `/commerce/pos/shift/${shiftId}/close`,
      { method: "POST", body: JSON.stringify({ closingCash }) },
      token
    ),

  getActiveShift: (token?: string | null) =>
    posRequest<{ shift: PosShift | null }>(
      "/commerce/pos/shift/active",
      {},
      token
    ),

  processReturn: (returnReq: ReturnRequest, token?: string | null) =>
    posRequest<{ transaction: PosTransaction; storeCreditId?: string }>(
      "/commerce/pos/returns",
      { method: "POST", body: JSON.stringify(returnReq) },
      token
    ),

  getDailyReport: (date?: string, token?: string | null) =>
    posRequest<{ report: DailySalesReport }>(
      `/commerce/pos/reports/daily${date ? `?date=${date}` : ""}`,
      {},
      token
    ),

  getTransactions: (shiftId?: string, token?: string | null) =>
    posRequest<{ transactions: PosTransaction[] }>(
      `/commerce/pos/transactions${shiftId ? `?shiftId=${shiftId}` : ""}`,
      {},
      token
    ),
};
