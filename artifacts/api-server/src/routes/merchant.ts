import { Router, type Request } from "express";
import { requireAuth, requireRole, type AuthenticatedRequest } from "../middleware/auth";

const MERCHANT_ROLES = ["merchant", "vendor", "store_manager", "store_staff"];

const router = Router();

interface MerchantOrder {
  id: string;
  orderNumber: string;
  status: string;
  items: Array<{ productId: string; name: string; quantity: number; price: number; variant?: string; notes?: string }>;
  subtotal: number;
  tax: number;
  deliveryFee: number;
  total: number;
  currency: string;
  customer: { name: string; phone: string; address: string };
  deliveryType: string;
  estimatedPrepTime: number;
  createdAt: string;
  acceptedAt?: string;
  readyAt?: string;
  notes?: string;
}

interface MerchantProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  category: string;
  image?: string;
  available: boolean;
  variants: Array<{ id: string; name: string; priceModifier: number }>;
  stockLevel: number;
  lowStockThreshold: number;
  sku: string;
  tags: string[];
  merchantId: string;
}

interface Booking {
  id: string;
  customerName: string;
  customerPhone: string;
  date: string;
  time: string;
  partySize: number;
  tableId?: string;
  status: string;
  notes?: string;
  createdAt: string;
  merchantId: string;
}

interface Campaign {
  id: string;
  name: string;
  type: string;
  status: string;
  discount: number;
  discountType: string;
  startDate: string;
  endDate: string;
  applicableProducts: string[];
  redemptions: number;
  merchantId: string;
}

const merchantProfiles = new Map<string, {
  storeId: string;
  storeName: string;
  category: string;
  rating: number;
  reviewCount: number;
  isOpen: boolean;
  operatingHours: { open: string; close: string };
  address: string;
  logo?: string;
}>();

const merchantOrders = new Map<string, MerchantOrder[]>();
const merchantProducts = new Map<string, MerchantProduct[]>();
const merchantBookings = new Map<string, Booking[]>();
const merchantCampaigns = new Map<string, Campaign[]>();

function getDefaultProfile(merchantId: string) {
  return {
    storeId: `store_${merchantId}`,
    storeName: "Al-Medina Fresh Market",
    category: "restaurant",
    rating: 4.7,
    reviewCount: 342,
    isOpen: true,
    operatingHours: { open: "08:00", close: "23:00" },
    address: "Olaya Street 15, Riyadh",
    logo: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=200",
  };
}

function generateMockOrders(): MerchantOrder[] {
  const now = Date.now();
  return [
    {
      id: "mord_" + now + "_1",
      orderNumber: "ORD-" + Math.floor(1000 + Math.random() * 9000),
      status: "pending",
      items: [
        { productId: "mp_1", name: "Chicken Shawarma Plate", quantity: 2, price: 35.0 },
        { productId: "mp_3", name: "Fresh Lemonade", quantity: 2, price: 12.0 },
      ],
      subtotal: 94.0,
      tax: 14.1,
      deliveryFee: 8.0,
      total: 116.1,
      currency: "SAR",
      customer: { name: "Ahmad Al-Rashid", phone: "+966501234567", address: "King Fahd Road, Building 42" },
      deliveryType: "delivery",
      estimatedPrepTime: 20,
      createdAt: new Date(now - 120000).toISOString(),
      notes: "Extra garlic sauce",
    },
    {
      id: "mord_" + now + "_2",
      orderNumber: "ORD-" + Math.floor(1000 + Math.random() * 9000),
      status: "pending",
      items: [
        { productId: "mp_2", name: "Grilled Lamb Kebab", quantity: 1, price: 48.0, variant: "Spicy" },
        { productId: "mp_4", name: "Hummus & Bread", quantity: 1, price: 18.0 },
      ],
      subtotal: 66.0,
      tax: 9.9,
      deliveryFee: 0,
      total: 75.9,
      currency: "SAR",
      customer: { name: "Fatima Khalid", phone: "+966509876543", address: "Dine-in - Table 5" },
      deliveryType: "dine_in",
      estimatedPrepTime: 15,
      createdAt: new Date(now - 60000).toISOString(),
    },
    {
      id: "mord_" + now + "_3",
      orderNumber: "ORD-" + Math.floor(1000 + Math.random() * 9000),
      status: "preparing",
      items: [
        { productId: "mp_5", name: "Mixed Grill Platter", quantity: 1, price: 89.0 },
        { productId: "mp_3", name: "Fresh Lemonade", quantity: 3, price: 12.0 },
      ],
      subtotal: 125.0,
      tax: 18.75,
      deliveryFee: 15.0,
      total: 158.75,
      currency: "SAR",
      customer: { name: "Mohammed Hassan", phone: "+966551112233", address: "Al-Malaz District, Villa 12" },
      deliveryType: "delivery",
      estimatedPrepTime: 30,
      createdAt: new Date(now - 600000).toISOString(),
      acceptedAt: new Date(now - 540000).toISOString(),
    },
  ];
}

function generateMockProducts(merchantId: string): MerchantProduct[] {
  return [
    { id: "mp_1", name: "Chicken Shawarma Plate", description: "Tender grilled chicken with garlic sauce", price: 35.0, currency: "SAR", category: "Main Course", image: "https://images.unsplash.com/photo-1529006557810-274b9b2fc783?w=400", available: true, variants: [{ id: "v1", name: "Regular", priceModifier: 0 }, { id: "v2", name: "Large", priceModifier: 10 }], stockLevel: 45, lowStockThreshold: 10, sku: "SHWR-001", tags: ["popular", "chicken"], merchantId },
    { id: "mp_2", name: "Grilled Lamb Kebab", description: "Premium lamb kebab with special spices", price: 48.0, currency: "SAR", category: "Main Course", image: "https://images.unsplash.com/photo-1603360946369-dc9bb6258143?w=400", available: true, variants: [{ id: "v3", name: "Mild", priceModifier: 0 }, { id: "v4", name: "Spicy", priceModifier: 0 }], stockLevel: 22, lowStockThreshold: 8, sku: "KEBAB-001", tags: ["premium", "lamb"], merchantId },
    { id: "mp_3", name: "Fresh Lemonade", description: "Freshly squeezed lemon with mint", price: 12.0, currency: "SAR", category: "Beverages", available: true, variants: [], stockLevel: 120, lowStockThreshold: 20, sku: "LMND-001", tags: ["drink", "fresh"], merchantId },
    { id: "mp_4", name: "Hummus & Bread", description: "Creamy hummus with warm pita bread", price: 18.0, currency: "SAR", category: "Appetizers", available: true, variants: [], stockLevel: 8, lowStockThreshold: 10, sku: "HMM-001", tags: ["appetizer", "vegetarian"], merchantId },
    { id: "mp_5", name: "Mixed Grill Platter", description: "Assorted grilled meats for sharing", price: 89.0, currency: "SAR", category: "Main Course", image: "https://images.unsplash.com/photo-1544025162-d76694265947?w=400", available: true, variants: [{ id: "v5", name: "For 2", priceModifier: 0 }, { id: "v6", name: "For 4", priceModifier: 60 }], stockLevel: 15, lowStockThreshold: 5, sku: "MXGRL-001", tags: ["sharing", "premium"], merchantId },
    { id: "mp_6", name: "Kunafa", description: "Traditional sweet cheese pastry", price: 28.0, currency: "SAR", category: "Desserts", image: "https://images.unsplash.com/photo-1579888944880-d98341245702?w=400", available: false, variants: [], stockLevel: 0, lowStockThreshold: 5, sku: "KNF-001", tags: ["dessert", "traditional"], merchantId },
  ];
}

function generateMockBookings(merchantId: string): Booking[] {
  const today = new Date().toISOString().split("T")[0];
  return [
    { id: "bk_1", customerName: "Khalid Omar", customerPhone: "+966501111111", date: today, time: "19:00", partySize: 4, tableId: "t_1", status: "confirmed", createdAt: new Date(Date.now() - 3600000).toISOString(), merchantId },
    { id: "bk_2", customerName: "Nora Abdulaziz", customerPhone: "+966502222222", date: today, time: "20:30", partySize: 2, status: "pending", notes: "Anniversary dinner", createdAt: new Date(Date.now() - 1800000).toISOString(), merchantId },
    { id: "bk_3", customerName: "Sultan Family", customerPhone: "+966503333333", date: today, time: "21:00", partySize: 8, tableId: "t_3", status: "confirmed", notes: "Birthday celebration", createdAt: new Date(Date.now() - 7200000).toISOString(), merchantId },
  ];
}

function generateMockCampaigns(merchantId: string): Campaign[] {
  return [
    { id: "cmp_1", name: "Weekend Special", type: "promotion", status: "active", discount: 20, discountType: "percentage", startDate: new Date().toISOString(), endDate: new Date(Date.now() + 172800000).toISOString(), applicableProducts: ["mp_1", "mp_2"], redemptions: 45, merchantId },
    { id: "cmp_2", name: "Lunch Flash Sale", type: "flash_sale", status: "draft", discount: 15, discountType: "fixed", startDate: new Date().toISOString(), endDate: new Date(Date.now() + 86400000).toISOString(), applicableProducts: [], redemptions: 0, merchantId },
    { id: "cmp_3", name: "Loyalty Points x2", type: "loyalty", status: "active", discount: 0, discountType: "percentage", startDate: new Date(Date.now() - 604800000).toISOString(), endDate: new Date(Date.now() + 2592000000).toISOString(), applicableProducts: [], redemptions: 128, merchantId },
  ];
}

router.get("/merchant/profile", requireAuth, requireRole(...MERCHANT_ROLES), (req, res) => {
  const merchantId = (req as AuthenticatedRequest).userId;
  if (!merchantProfiles.has(merchantId)) {
    merchantProfiles.set(merchantId, getDefaultProfile(merchantId));
  }
  res.json({ success: true, data: merchantProfiles.get(merchantId) });
});

router.post("/merchant/store-status", requireAuth, requireRole(...MERCHANT_ROLES), (req, res) => {
  const merchantId = (req as AuthenticatedRequest).userId;
  const { isOpen } = req.body;
  if (!merchantProfiles.has(merchantId)) {
    merchantProfiles.set(merchantId, getDefaultProfile(merchantId));
  }
  const profile = merchantProfiles.get(merchantId)!;
  profile.isOpen = Boolean(isOpen);
  res.json({ success: true, data: profile });
});

router.get("/merchant/orders", requireAuth, requireRole(...MERCHANT_ROLES), (req, res) => {
  const merchantId = (req as AuthenticatedRequest).userId;
  const { status } = req.query;
  if (!merchantOrders.has(merchantId)) {
    merchantOrders.set(merchantId, generateMockOrders());
  }
  let orders = merchantOrders.get(merchantId)!;
  if (status) orders = orders.filter((o) => o.status === status);
  res.json({ success: true, data: { orders, total: orders.length } });
});

router.post("/merchant/orders/:orderId/status", requireAuth, requireRole(...MERCHANT_ROLES), (req, res) => {
  const merchantId = (req as AuthenticatedRequest).userId;
  const { orderId } = req.params;
  const { status, reason } = req.body;
  if (!merchantOrders.has(merchantId)) {
    merchantOrders.set(merchantId, generateMockOrders());
  }
  const orders = merchantOrders.get(merchantId)!;
  const order = orders.find((o) => o.id === orderId);
  if (!order) {
    res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Order not found" } });
    return;
  }
  order.status = status;
  if (status === "accepted") order.acceptedAt = new Date().toISOString();
  if (status === "ready") order.readyAt = new Date().toISOString();
  res.json({ success: true, data: { order } });
});

router.get("/merchant/products", requireAuth, requireRole(...MERCHANT_ROLES), (req, res) => {
  const merchantId = (req as AuthenticatedRequest).userId;
  if (!merchantProducts.has(merchantId)) {
    merchantProducts.set(merchantId, generateMockProducts(merchantId));
  }
  res.json({ success: true, data: { products: merchantProducts.get(merchantId) } });
});

router.post("/merchant/products", requireAuth, requireRole(...MERCHANT_ROLES), (req, res) => {
  const merchantId = (req as AuthenticatedRequest).userId;
  if (!merchantProducts.has(merchantId)) {
    merchantProducts.set(merchantId, generateMockProducts(merchantId));
  }
  const products = merchantProducts.get(merchantId)!;
  const product: MerchantProduct = {
    ...req.body,
    id: "mp_" + Date.now(),
    merchantId,
  };
  products.unshift(product);
  res.json({ success: true, data: { product } });
});

router.put("/merchant/products/:productId", requireAuth, requireRole(...MERCHANT_ROLES), (req, res) => {
  const merchantId = (req as AuthenticatedRequest).userId;
  const { productId } = req.params;
  if (!merchantProducts.has(merchantId)) {
    merchantProducts.set(merchantId, generateMockProducts(merchantId));
  }
  const products = merchantProducts.get(merchantId)!;
  const idx = products.findIndex((p) => p.id === productId);
  if (idx === -1) {
    res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Product not found" } });
    return;
  }
  products[idx] = { ...products[idx], ...req.body, id: productId, merchantId };
  res.json({ success: true, data: { product: products[idx] } });
});

router.delete("/merchant/products/:productId", requireAuth, requireRole(...MERCHANT_ROLES), (req, res) => {
  const merchantId = (req as AuthenticatedRequest).userId;
  const { productId } = req.params;
  if (!merchantProducts.has(merchantId)) {
    merchantProducts.set(merchantId, generateMockProducts(merchantId));
  }
  const products = merchantProducts.get(merchantId)!;
  const idx = products.findIndex((p) => p.id === productId);
  if (idx === -1) {
    res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Product not found" } });
    return;
  }
  products.splice(idx, 1);
  res.json({ success: true, data: { deleted: productId } });
});

router.get("/merchant/inventory", requireAuth, requireRole(...MERCHANT_ROLES), (req, res) => {
  const merchantId = (req as AuthenticatedRequest).userId;
  if (!merchantProducts.has(merchantId)) {
    merchantProducts.set(merchantId, generateMockProducts(merchantId));
  }
  const products = merchantProducts.get(merchantId)!;
  const items = products.map((p) => ({
    productId: p.id,
    productName: p.name,
    sku: p.sku,
    stockLevel: p.stockLevel,
    lowStockThreshold: p.lowStockThreshold,
    lastRestocked: new Date(Date.now() - Math.random() * 604800000).toISOString(),
    status: p.stockLevel === 0 ? "out_of_stock" : p.stockLevel <= p.lowStockThreshold ? "low_stock" : "in_stock",
  }));
  res.json({ success: true, data: { items } });
});

router.post("/merchant/inventory/:productId", requireAuth, requireRole(...MERCHANT_ROLES), (req, res) => {
  const merchantId = (req as AuthenticatedRequest).userId;
  const { productId } = req.params;
  const { stockLevel } = req.body;
  if (!merchantProducts.has(merchantId)) {
    merchantProducts.set(merchantId, generateMockProducts(merchantId));
  }
  const products = merchantProducts.get(merchantId)!;
  const product = products.find((p) => p.id === productId);
  if (!product) {
    res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Product not found" } });
    return;
  }
  product.stockLevel = stockLevel;
  if (stockLevel > 0) product.available = true;
  res.json({
    success: true,
    data: {
      productId: product.id,
      productName: product.name,
      sku: product.sku,
      stockLevel: product.stockLevel,
      lowStockThreshold: product.lowStockThreshold,
      lastRestocked: new Date().toISOString(),
      status: product.stockLevel === 0 ? "out_of_stock" : product.stockLevel <= product.lowStockThreshold ? "low_stock" : "in_stock",
    },
  });
});

router.get("/merchant/bookings", requireAuth, requireRole(...MERCHANT_ROLES), (req, res) => {
  const merchantId = (req as AuthenticatedRequest).userId;
  const { date } = req.query;
  if (!merchantBookings.has(merchantId)) {
    merchantBookings.set(merchantId, generateMockBookings(merchantId));
  }
  let bookings = merchantBookings.get(merchantId)!;
  if (date) bookings = bookings.filter((b) => b.date === date);
  res.json({ success: true, data: { bookings } });
});

router.post("/merchant/bookings/:bookingId/status", requireAuth, requireRole(...MERCHANT_ROLES), (req, res) => {
  const merchantId = (req as AuthenticatedRequest).userId;
  const { bookingId } = req.params;
  const { status } = req.body;
  if (!merchantBookings.has(merchantId)) {
    merchantBookings.set(merchantId, generateMockBookings(merchantId));
  }
  const bookings = merchantBookings.get(merchantId)!;
  const booking = bookings.find((b) => b.id === bookingId);
  if (!booking) {
    res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Booking not found" } });
    return;
  }
  booking.status = status;
  res.json({ success: true, data: { booking } });
});

router.get("/merchant/tables", requireAuth, requireRole(...MERCHANT_ROLES), (_req, res) => {
  res.json({
    success: true,
    data: {
      tables: [
        { id: "t_1", name: "Table 1", capacity: 4, status: "occupied" },
        { id: "t_2", name: "Table 2", capacity: 2, status: "available" },
        { id: "t_3", name: "Table 3", capacity: 8, status: "reserved" },
        { id: "t_4", name: "Table 4", capacity: 4, status: "available" },
        { id: "t_5", name: "Table 5", capacity: 6, status: "occupied" },
        { id: "t_6", name: "VIP Room", capacity: 12, status: "available" },
        { id: "t_7", name: "Patio 1", capacity: 4, status: "maintenance" },
        { id: "t_8", name: "Patio 2", capacity: 4, status: "available" },
      ],
    },
  });
});

router.get("/merchant/analytics", requireAuth, requireRole(...MERCHANT_ROLES), (req, res) => {
  const { period } = req.query;
  const p = String(period || "week");
  const multiplier = p === "today" ? 1 : p === "week" ? 7 : 30;

  const dailyRevenue = Array.from({ length: multiplier }, (_, i) => {
    const d = new Date(Date.now() - (multiplier - 1 - i) * 86400000);
    return {
      date: d.toISOString().split("T")[0],
      revenue: Math.round((800 + Math.random() * 1200) * 100) / 100,
      orders: Math.floor(15 + Math.random() * 25),
    };
  });

  const totalRevenue = dailyRevenue.reduce((s, d) => s + d.revenue, 0);
  const totalOrders = dailyRevenue.reduce((s, d) => s + d.orders, 0);

  res.json({
    success: true,
    data: {
      period: p,
      revenue: Math.round(totalRevenue * 100) / 100,
      orders: totalOrders,
      avgOrderValue: Math.round((totalRevenue / totalOrders) * 100) / 100,
      currency: "SAR",
      topItems: [
        { name: "Chicken Shawarma Plate", quantity: Math.floor(80 * multiplier / 7), revenue: Math.round(35 * 80 * multiplier / 7) },
        { name: "Mixed Grill Platter", quantity: Math.floor(45 * multiplier / 7), revenue: Math.round(89 * 45 * multiplier / 7) },
        { name: "Fresh Lemonade", quantity: Math.floor(120 * multiplier / 7), revenue: Math.round(12 * 120 * multiplier / 7) },
        { name: "Grilled Lamb Kebab", quantity: Math.floor(60 * multiplier / 7), revenue: Math.round(48 * 60 * multiplier / 7) },
        { name: "Kunafa", quantity: Math.floor(35 * multiplier / 7), revenue: Math.round(28 * 35 * multiplier / 7) },
      ],
      peakHours: [
        { hour: 12, orders: Math.floor(18 * multiplier / 7) },
        { hour: 13, orders: Math.floor(22 * multiplier / 7) },
        { hour: 18, orders: Math.floor(15 * multiplier / 7) },
        { hour: 19, orders: Math.floor(28 * multiplier / 7) },
        { hour: 20, orders: Math.floor(35 * multiplier / 7) },
        { hour: 21, orders: Math.floor(30 * multiplier / 7) },
        { hour: 22, orders: Math.floor(12 * multiplier / 7) },
      ],
      dailyRevenue,
      customerInsights: {
        newCustomers: Math.floor(25 * multiplier / 7),
        returning: Math.floor(65 * multiplier / 7),
        avgRating: 4.7,
      },
    },
  });
});

router.get("/merchant/campaigns", requireAuth, requireRole(...MERCHANT_ROLES), (req, res) => {
  const merchantId = (req as AuthenticatedRequest).userId;
  if (!merchantCampaigns.has(merchantId)) {
    merchantCampaigns.set(merchantId, generateMockCampaigns(merchantId));
  }
  res.json({ success: true, data: { campaigns: merchantCampaigns.get(merchantId) } });
});

router.post("/merchant/campaigns", requireAuth, requireRole(...MERCHANT_ROLES), (req, res) => {
  const merchantId = (req as AuthenticatedRequest).userId;
  if (!merchantCampaigns.has(merchantId)) {
    merchantCampaigns.set(merchantId, generateMockCampaigns(merchantId));
  }
  const campaigns = merchantCampaigns.get(merchantId)!;
  const campaign: Campaign = {
    ...req.body,
    id: "cmp_" + Date.now(),
    redemptions: 0,
    merchantId,
  };
  campaigns.unshift(campaign);
  res.json({ success: true, data: { campaign } });
});

router.post("/merchant/campaigns/:campaignId/status", requireAuth, requireRole(...MERCHANT_ROLES), (req, res) => {
  const merchantId = (req as AuthenticatedRequest).userId;
  const { campaignId } = req.params;
  const { status } = req.body;
  if (!merchantCampaigns.has(merchantId)) {
    merchantCampaigns.set(merchantId, generateMockCampaigns(merchantId));
  }
  const campaigns = merchantCampaigns.get(merchantId)!;
  const campaign = campaigns.find((c) => c.id === campaignId);
  if (!campaign) {
    res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Campaign not found" } });
    return;
  }
  campaign.status = status;
  res.json({ success: true, data: { campaign } });
});

export default router;
