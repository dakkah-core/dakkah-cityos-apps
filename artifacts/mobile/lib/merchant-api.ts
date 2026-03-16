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

const API_BASE = process.env.EXPO_PUBLIC_DOMAIN
  ? `https://${process.env.EXPO_PUBLIC_DOMAIN}/api`
  : "http://localhost:8080/api";

function authHeaders(accessToken?: string): Record<string, string> {
  const h: Record<string, string> = { "Content-Type": "application/json" };
  if (accessToken) h["Authorization"] = `Bearer ${accessToken}`;
  return h;
}

export async function getMerchantProfile(accessToken?: string): Promise<MerchantProfile | null> {
  try {
    const res = await fetch(`${API_BASE}/commerce/merchant/profile`, { headers: authHeaders(accessToken) });
    const data = await res.json();
    return data.success ? data.data : null;
  } catch {
    return null;
  }
}

export async function updateStoreStatus(isOpen: boolean, accessToken?: string): Promise<MerchantProfile | null> {
  try {
    const res = await fetch(`${API_BASE}/commerce/merchant/store-status`, {
      method: "POST",
      headers: authHeaders(accessToken),
      body: JSON.stringify({ isOpen }),
    });
    const data = await res.json();
    return data.success ? data.data : null;
  } catch {
    return null;
  }
}

export async function getMerchantOrders(status?: OrderStatus, accessToken?: string): Promise<MerchantOrder[]> {
  try {
    const url = new URL(`${API_BASE}/commerce/merchant/orders`);
    if (status) url.searchParams.set("status", status);
    const res = await fetch(url.toString(), { headers: authHeaders(accessToken) });
    const data = await res.json();
    return data.success ? data.data.orders : [];
  } catch {
    return [];
  }
}

export async function updateOrderStatus(
  orderId: string,
  status: OrderStatus,
  reason?: string,
  accessToken?: string
): Promise<MerchantOrder | null> {
  try {
    const res = await fetch(`${API_BASE}/commerce/merchant/orders/${orderId}/status`, {
      method: "POST",
      headers: authHeaders(accessToken),
      body: JSON.stringify({ status, reason }),
    });
    const data = await res.json();
    return data.success ? data.data.order : null;
  } catch {
    return null;
  }
}

export async function getMerchantProducts(accessToken?: string): Promise<MerchantProduct[]> {
  try {
    const res = await fetch(`${API_BASE}/commerce/merchant/products`, { headers: authHeaders(accessToken) });
    const data = await res.json();
    return data.success ? data.data.products : [];
  } catch {
    return [];
  }
}

export async function createProduct(
  product: Omit<MerchantProduct, "id">,
  accessToken?: string
): Promise<MerchantProduct | null> {
  try {
    const res = await fetch(`${API_BASE}/commerce/merchant/products`, {
      method: "POST",
      headers: authHeaders(accessToken),
      body: JSON.stringify(product),
    });
    const data = await res.json();
    return data.success ? data.data.product : null;
  } catch {
    return null;
  }
}

export async function updateProduct(
  productId: string,
  updates: Partial<MerchantProduct>,
  accessToken?: string
): Promise<MerchantProduct | null> {
  try {
    const res = await fetch(`${API_BASE}/commerce/merchant/products/${productId}`, {
      method: "PUT",
      headers: authHeaders(accessToken),
      body: JSON.stringify(updates),
    });
    const data = await res.json();
    return data.success ? data.data.product : null;
  } catch {
    return null;
  }
}

export async function deleteProduct(productId: string, accessToken?: string): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/commerce/merchant/products/${productId}`, {
      method: "DELETE",
      headers: authHeaders(accessToken),
    });
    const data = await res.json();
    return data.success;
  } catch {
    return false;
  }
}

export async function getInventory(accessToken?: string): Promise<InventoryItem[]> {
  try {
    const res = await fetch(`${API_BASE}/commerce/merchant/inventory`, { headers: authHeaders(accessToken) });
    const data = await res.json();
    return data.success ? data.data.items : [];
  } catch {
    return [];
  }
}

export async function updateStock(
  productId: string,
  stockLevel: number,
  accessToken?: string
): Promise<InventoryItem | null> {
  try {
    const res = await fetch(`${API_BASE}/commerce/merchant/inventory/${productId}`, {
      method: "POST",
      headers: authHeaders(accessToken),
      body: JSON.stringify({ stockLevel }),
    });
    const data = await res.json();
    return data.success ? data.data : null;
  } catch {
    return null;
  }
}

export async function getBookings(date?: string, accessToken?: string): Promise<Booking[]> {
  try {
    const url = new URL(`${API_BASE}/commerce/merchant/bookings`);
    if (date) url.searchParams.set("date", date);
    const res = await fetch(url.toString(), { headers: authHeaders(accessToken) });
    const data = await res.json();
    return data.success ? data.data.bookings : [];
  } catch {
    return [];
  }
}

export async function updateBookingStatus(
  bookingId: string,
  status: Booking["status"],
  accessToken?: string
): Promise<Booking | null> {
  try {
    const res = await fetch(`${API_BASE}/commerce/merchant/bookings/${bookingId}/status`, {
      method: "POST",
      headers: authHeaders(accessToken),
      body: JSON.stringify({ status }),
    });
    const data = await res.json();
    return data.success ? data.data.booking : null;
  } catch {
    return null;
  }
}

export async function getTables(accessToken?: string): Promise<TableInfo[]> {
  try {
    const res = await fetch(`${API_BASE}/commerce/merchant/tables`, { headers: authHeaders(accessToken) });
    const data = await res.json();
    return data.success ? data.data.tables : [];
  } catch {
    return [];
  }
}

export async function getSalesAnalytics(
  period: "today" | "week" | "month" = "week",
  accessToken?: string
): Promise<SalesAnalytics | null> {
  try {
    const res = await fetch(`${API_BASE}/commerce/merchant/analytics?period=${period}`, {
      headers: authHeaders(accessToken),
    });
    const data = await res.json();
    return data.success ? data.data : null;
  } catch {
    return null;
  }
}

export async function getCampaigns(accessToken?: string): Promise<Campaign[]> {
  try {
    const res = await fetch(`${API_BASE}/commerce/merchant/campaigns`, { headers: authHeaders(accessToken) });
    const data = await res.json();
    return data.success ? data.data.campaigns : [];
  } catch {
    return [];
  }
}

export async function createCampaign(
  campaign: Omit<Campaign, "id" | "redemptions">,
  accessToken?: string
): Promise<Campaign | null> {
  try {
    const res = await fetch(`${API_BASE}/commerce/merchant/campaigns`, {
      method: "POST",
      headers: authHeaders(accessToken),
      body: JSON.stringify(campaign),
    });
    const data = await res.json();
    return data.success ? data.data.campaign : null;
  } catch {
    return null;
  }
}

export async function updateCampaignStatus(
  campaignId: string,
  status: Campaign["status"],
  accessToken?: string
): Promise<Campaign | null> {
  try {
    const res = await fetch(`${API_BASE}/commerce/merchant/campaigns/${campaignId}/status`, {
      method: "POST",
      headers: authHeaders(accessToken),
      body: JSON.stringify({ status }),
    });
    const data = await res.json();
    return data.success ? data.data.campaign : null;
  } catch {
    return null;
  }
}
