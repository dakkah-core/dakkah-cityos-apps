import type {
  PosProduct,
  PosTransaction,
  KitchenOrder,
  PosShift,
  ReturnRequest,
  DailySalesReport,
  PaymentDetails,
} from "@/types/pos";
import { apiClient } from "@cityos/mobile-core";

async function posRequest<T>(
  path: string,
  method: string = "GET",
  body?: unknown,
): Promise<T> {
  const data = await apiClient.request<{ success: boolean; data?: T; error?: { message: string } }>(path, {
    method,
    body: body,
  });
  if (!data.success) throw new Error(data.error?.message || "POS API error");
  return data.data as T;
}

export const PosApi = {
  getProducts: (token?: string | null, category?: string) =>
    posRequest<{ products: PosProduct[] }>(
      `/commerce/pos/products${category ? `?category=${category}` : ""}`,
    ),

  lookupBarcode: (barcode: string, token?: string | null) =>
    posRequest<{ product: PosProduct }>(
      `/commerce/pos/products/barcode/${barcode}`,
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
      "POST",
      payload,
    ),

  getKitchenOrders: (token?: string | null) =>
    posRequest<{ orders: KitchenOrder[] }>(
      "/commerce/pos/kitchen",
    ),

  updateKitchenStatus: (
    orderId: string,
    status: KitchenOrder["status"],
    token?: string | null
  ) =>
    posRequest<{ order: KitchenOrder }>(
      `/commerce/pos/kitchen/${orderId}/status`,
      "PATCH",
      { status },
    ),

  openShift: (openingCash: number, token?: string | null) =>
    posRequest<{ shift: PosShift }>(
      "/commerce/pos/shift/open",
      "POST",
      { openingCash },
    ),

  closeShift: (shiftId: string, closingCash: number, token?: string | null) =>
    posRequest<{ shift: PosShift }>(
      `/commerce/pos/shift/${shiftId}/close`,
      "POST",
      { closingCash },
    ),

  getActiveShift: (token?: string | null) =>
    posRequest<{ shift: PosShift | null }>(
      "/commerce/pos/shift/active",
    ),

  processReturn: (returnReq: ReturnRequest, token?: string | null) =>
    posRequest<{ transaction: PosTransaction; storeCreditId?: string }>(
      "/commerce/pos/returns",
      "POST",
      returnReq,
    ),

  getDailyReport: (date?: string, token?: string | null) =>
    posRequest<{ report: DailySalesReport }>(
      `/commerce/pos/reports/daily${date ? `?date=${date}` : ""}`,
    ),

  getTransactions: (shiftId?: string, token?: string | null) =>
    posRequest<{ transactions: PosTransaction[] }>(
      `/commerce/pos/transactions${shiftId ? `?shiftId=${shiftId}` : ""}`,
    ),
};
