export type OrderStatus = "pending" | "accepted" | "preparing" | "ready" | "picked_up" | "delivered" | "cancelled" | "rejected";

export interface OrderItem {
  productId: string;
  name: string;
  quantity: number;
  price: number;
  variant?: string;
  notes?: string;
}

export interface MerchantOrder {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  deliveryFee: number;
  total: number;
  currency: string;
  customer: {
    name: string;
    phone: string;
    address: string;
  };
  deliveryType: "delivery" | "pickup" | "dine_in";
  estimatedPrepTime: number;
  createdAt: string;
  acceptedAt?: string;
  readyAt?: string;
  notes?: string;
}

export interface ProductVariant {
  id: string;
  name: string;
  priceModifier: number;
}

export interface MerchantProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  category: string;
  image?: string;
  available: boolean;
  variants: ProductVariant[];
  stockLevel: number;
  lowStockThreshold: number;
  sku: string;
  tags: string[];
}

export interface InventoryItem {
  productId: string;
  productName: string;
  sku: string;
  stockLevel: number;
  lowStockThreshold: number;
  lastRestocked: string;
  status: "in_stock" | "low_stock" | "out_of_stock";
}

export interface Booking {
  id: string;
  customerName: string;
  customerPhone: string;
  date: string;
  time: string;
  partySize: number;
  tableId?: string;
  status: "pending" | "confirmed" | "seated" | "completed" | "cancelled" | "no_show";
  notes?: string;
  createdAt: string;
}

export interface TableInfo {
  id: string;
  name: string;
  capacity: number;
  status: "available" | "occupied" | "reserved" | "maintenance";
}

export interface SalesAnalytics {
  period: string;
  revenue: number;
  orders: number;
  avgOrderValue: number;
  currency: string;
  topItems: Array<{ name: string; quantity: number; revenue: number }>;
  peakHours: Array<{ hour: number; orders: number }>;
  dailyRevenue: Array<{ date: string; revenue: number; orders: number }>;
  customerInsights: {
    newCustomers: number;
    returning: number;
    avgRating: number;
  };
}

export interface Campaign {
  id: string;
  name: string;
  type: "promotion" | "flash_sale" | "loyalty";
  status: "draft" | "active" | "paused" | "ended";
  discount: number;
  discountType: "percentage" | "fixed";
  startDate: string;
  endDate: string;
  applicableProducts: string[];
  redemptions: number;
}

export interface MerchantProfile {
  storeId: string;
  storeName: string;
  category: string;
  rating: number;
  reviewCount: number;
  isOpen: boolean;
  operatingHours: { open: string; close: string };
  address: string;
  logo?: string;
}
