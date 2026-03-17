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
import { apiClient } from "./gateway";

export async function getMerchantProfile(_accessToken?: string): Promise<MerchantProfile | null> {
  try {
    const data = await apiClient.get<{ success: boolean; data?: MerchantProfile }>("/commerce/merchant/profile");
    return data.success ? data.data ?? null : null;
  } catch {
    return null;
  }
}

export async function updateStoreStatus(isOpen: boolean, _accessToken?: string): Promise<MerchantProfile | null> {
  try {
    const data = await apiClient.post<{ success: boolean; data?: MerchantProfile }>("/commerce/merchant/store-status", { isOpen });
    return data.success ? data.data ?? null : null;
  } catch {
    return null;
  }
}

export async function getMerchantOrders(status?: OrderStatus, _accessToken?: string): Promise<MerchantOrder[]> {
  try {
    const query = status ? `?status=${status}` : "";
    const data = await apiClient.get<{ success: boolean; data?: { orders: MerchantOrder[] } }>(`/commerce/merchant/orders${query}`);
    return data.success ? data.data?.orders ?? [] : [];
  } catch {
    return [];
  }
}

export async function updateOrderStatus(
  orderId: string,
  status: OrderStatus,
  reason?: string,
  _accessToken?: string,
): Promise<MerchantOrder | null> {
  try {
    const data = await apiClient.post<{ success: boolean; data?: { order: MerchantOrder } }>(`/commerce/merchant/orders/${orderId}/status`, { status, reason });
    return data.success ? data.data?.order ?? null : null;
  } catch {
    return null;
  }
}

export async function getMerchantProducts(_accessToken?: string): Promise<MerchantProduct[]> {
  try {
    const data = await apiClient.get<{ success: boolean; data?: { products: MerchantProduct[] } }>("/commerce/merchant/products");
    return data.success ? data.data?.products ?? [] : [];
  } catch {
    return [];
  }
}

export async function createProduct(
  product: Omit<MerchantProduct, "id">,
  _accessToken?: string,
): Promise<MerchantProduct | null> {
  try {
    const data = await apiClient.post<{ success: boolean; data?: { product: MerchantProduct } }>("/commerce/merchant/products", product);
    return data.success ? data.data?.product ?? null : null;
  } catch {
    return null;
  }
}

export async function updateProduct(
  productId: string,
  updates: Partial<MerchantProduct>,
  _accessToken?: string,
): Promise<MerchantProduct | null> {
  try {
    const data = await apiClient.put<{ success: boolean; data?: { product: MerchantProduct } }>(`/commerce/merchant/products/${productId}`, updates);
    return data.success ? data.data?.product ?? null : null;
  } catch {
    return null;
  }
}

export async function deleteProduct(productId: string, _accessToken?: string): Promise<boolean> {
  try {
    const data = await apiClient.delete<{ success: boolean }>(`/commerce/merchant/products/${productId}`);
    return data.success;
  } catch {
    return false;
  }
}

export async function getInventory(_accessToken?: string): Promise<InventoryItem[]> {
  try {
    const data = await apiClient.get<{ success: boolean; data?: { items: InventoryItem[] } }>("/commerce/merchant/inventory");
    return data.success ? data.data?.items ?? [] : [];
  } catch {
    return [];
  }
}

export async function updateStock(
  productId: string,
  stockLevel: number,
  _accessToken?: string,
): Promise<InventoryItem | null> {
  try {
    const data = await apiClient.post<{ success: boolean; data?: InventoryItem }>(`/commerce/merchant/inventory/${productId}`, { stockLevel });
    return data.success ? data.data ?? null : null;
  } catch {
    return null;
  }
}

export async function getBookings(date?: string, _accessToken?: string): Promise<Booking[]> {
  try {
    const query = date ? `?date=${date}` : "";
    const data = await apiClient.get<{ success: boolean; data?: { bookings: Booking[] } }>(`/commerce/merchant/bookings${query}`);
    return data.success ? data.data?.bookings ?? [] : [];
  } catch {
    return [];
  }
}

export async function updateBookingStatus(
  bookingId: string,
  status: Booking["status"],
  _accessToken?: string,
): Promise<Booking | null> {
  try {
    const data = await apiClient.post<{ success: boolean; data?: { booking: Booking } }>(`/commerce/merchant/bookings/${bookingId}/status`, { status });
    return data.success ? data.data?.booking ?? null : null;
  } catch {
    return null;
  }
}

export async function getTables(_accessToken?: string): Promise<TableInfo[]> {
  try {
    const data = await apiClient.get<{ success: boolean; data?: { tables: TableInfo[] } }>("/commerce/merchant/tables");
    return data.success ? data.data?.tables ?? [] : [];
  } catch {
    return [];
  }
}

export async function getSalesAnalytics(
  period: "today" | "week" | "month" = "week",
  _accessToken?: string,
): Promise<SalesAnalytics | null> {
  try {
    const data = await apiClient.get<{ success: boolean; data?: SalesAnalytics }>(`/commerce/merchant/analytics?period=${period}`);
    return data.success ? data.data ?? null : null;
  } catch {
    return null;
  }
}

export async function getCampaigns(_accessToken?: string): Promise<Campaign[]> {
  try {
    const data = await apiClient.get<{ success: boolean; data?: { campaigns: Campaign[] } }>("/commerce/merchant/campaigns");
    return data.success ? data.data?.campaigns ?? [] : [];
  } catch {
    return [];
  }
}

export async function createCampaign(
  campaign: Omit<Campaign, "id" | "redemptions">,
  _accessToken?: string,
): Promise<Campaign | null> {
  try {
    const data = await apiClient.post<{ success: boolean; data?: { campaign: Campaign } }>("/commerce/merchant/campaigns", campaign);
    return data.success ? data.data?.campaign ?? null : null;
  } catch {
    return null;
  }
}

export async function updateCampaignStatus(
  campaignId: string,
  status: Campaign["status"],
  _accessToken?: string,
): Promise<Campaign | null> {
  try {
    const data = await apiClient.post<{ success: boolean; data?: { campaign: Campaign } }>(`/commerce/merchant/campaigns/${campaignId}/status`, { status });
    return data.success ? data.data?.campaign ?? null : null;
  } catch {
    return null;
  }
}
