import { Router } from "express";
import { optionalAuth, requireAuth, getUserIdFromReq } from "../middleware/auth";

const router = Router();

const BFF_COMMERCE_PORT = process.env.BFF_COMMERCE_PORT || 4001;
const BFF_HOST = process.env.BFF_HOST || "localhost";

async function proxyToBff(path: string, method: string, body?: unknown): Promise<{ ok: boolean; data: unknown }> {
  try {
    const url = `http://${BFF_HOST}:${BFF_COMMERCE_PORT}/api${path}`;
    const options: RequestInit = {
      method,
      headers: { "Content-Type": "application/json" },
      signal: AbortSignal.timeout(5000),
    };
    if (body && method !== "GET") {
      options.body = JSON.stringify(body);
    }
    const res = await fetch(url, options);
    if (res.ok) {
      const data = await res.json();
      return { ok: true, data };
    }
    return { ok: false, data: null };
  } catch {
    return { ok: false, data: null };
  }
}

const FALLBACK_PRODUCTS = [
  { id: "prod_1", name: "Artisan Coffee Blend", price: 24.99, currency: "SAR", category: "food", image: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400", rating: 4.8, inStock: true, tags: ["artisan", "local"] },
  { id: "prod_2", name: "Handwoven Basket", price: 89.0, currency: "SAR", category: "crafts", image: "https://images.unsplash.com/photo-1513519245088-0e12902e35ca?w=400", rating: 4.6, inStock: true, tags: ["handmade"] },
  { id: "prod_3", name: "Local Honey Jar", price: 35.0, currency: "SAR", category: "food", image: "https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=400", rating: 4.9, inStock: true, tags: ["organic"] },
  { id: "prod_4", name: "Oud Perfume", price: 150.0, currency: "SAR", category: "beauty", image: "https://images.unsplash.com/photo-1541643600914-78b084683601?w=400", rating: 4.7, inStock: true, tags: ["luxury", "fragrance"] },
  { id: "prod_5", name: "Arabic Coffee Set", price: 210.0, currency: "SAR", category: "home", image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400", rating: 4.5, inStock: true, tags: ["traditional"] },
];

router.get("/products", async (req, res) => {
  const { category, query, limit } = req.query;
  const bffResult = await proxyToBff(`/products?category=${category || ""}&query=${query || ""}&limit=${limit || 20}`, "GET");

  if (bffResult.ok) {
    res.json({ success: true, data: bffResult.data });
    return;
  }

  let filtered = FALLBACK_PRODUCTS;
  if (category) filtered = filtered.filter((p) => p.category === category);
  if (query) {
    const q = String(query).toLowerCase();
    filtered = filtered.filter((p) => p.name.toLowerCase().includes(q) || p.tags?.some((t) => t.includes(q)));
  }
  const lim = Math.min(Number(limit) || 20, 50);

  res.json({
    success: true,
    data: { products: filtered.slice(0, lim), total: filtered.length, source: "fallback" },
  });
});

router.get("/products/:productId", async (req, res) => {
  const bffResult = await proxyToBff(`/products/${req.params.productId}`, "GET");
  if (bffResult.ok) {
    res.json({ success: true, data: bffResult.data });
    return;
  }

  const product = FALLBACK_PRODUCTS.find((p) => p.id === req.params.productId);
  if (product) {
    res.json({ success: true, data: { product, source: "fallback" } });
  } else {
    res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Product not found" } });
  }
});

const cartStore = new Map<string, { items: { productId: string; quantity: number; price: number; name: string }[] }>();

router.get("/cart", optionalAuth, (req, res) => {
  const userId = getUserIdFromReq(req);
  const cart = cartStore.get(userId) || { items: [] };
  const total = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  res.json({ success: true, data: { ...cart, total: Math.round(total * 100) / 100, currency: "SAR" } });
});

router.post("/cart/add", optionalAuth, (req, res) => {
  const { productId, quantity } = req.body;
  const uid = getUserIdFromReq(req);
  const product = FALLBACK_PRODUCTS.find((p) => p.id === productId);
  if (!product) {
    res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Product not found" } });
    return;
  }

  if (!cartStore.has(uid)) cartStore.set(uid, { items: [] });
  const cart = cartStore.get(uid)!;
  const existing = cart.items.find((i) => i.productId === productId);
  if (existing) {
    existing.quantity += quantity || 1;
  } else {
    cart.items.push({ productId, quantity: quantity || 1, price: product.price, name: product.name });
  }

  const total = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  res.json({ success: true, data: { cart: { ...cart, total: Math.round(total * 100) / 100, currency: "SAR" } } });
});

router.post("/cart/remove", optionalAuth, (req, res) => {
  const { productId } = req.body;
  const uid = getUserIdFromReq(req);
  const cart = cartStore.get(uid);
  if (cart) {
    cart.items = cart.items.filter((i) => i.productId !== productId);
  }
  res.json({ success: true, data: { cart: cart || { items: [] } } });
});

router.post("/checkout/validate-address", optionalAuth, async (req, res) => {
  const { address } = req.body;
  if (!address || !address.street || !address.city) {
    res.status(400).json({ success: false, error: { code: "INVALID_ADDRESS", message: "street and city required" } });
    return;
  }

  const bffResult = await proxyToBff("/checkout/validate-address", "POST", req.body);
  if (bffResult.ok) {
    res.json({ success: true, data: bffResult.data });
    return;
  }

  res.json({
    success: true,
    data: {
      valid: true,
      normalized: {
        street: address.street,
        city: address.city,
        district: address.district || "Central",
        postalCode: address.postalCode || "12345",
        country: "SA",
      },
      deliveryZone: "zone_central",
      source: "fallback",
    },
  });
});

router.post("/checkout/delivery-options", optionalAuth, async (req, res) => {
  const { address } = req.body;
  const uid = getUserIdFromReq(req);
  const cart = cartStore.get(uid);
  if (!cart || cart.items.length === 0) {
    res.status(400).json({ success: false, error: { code: "EMPTY_CART", message: "Cart is empty" } });
    return;
  }

  const bffResult = await proxyToBff("/checkout/delivery-options", "POST", req.body);
  if (bffResult.ok) {
    res.json({ success: true, data: bffResult.data });
    return;
  }

  const total = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  res.json({
    success: true,
    data: {
      options: [
        { id: "express", label: "Express Delivery", eta: "30-45 min", fee: 15.0, currency: "SAR" },
        { id: "standard", label: "Standard Delivery", eta: "1-2 hours", fee: 8.0, currency: "SAR" },
        { id: "scheduled", label: "Scheduled Delivery", eta: "Pick a time slot", fee: 5.0, currency: "SAR" },
      ],
      cartTotal: Math.round(total * 100) / 100,
      currency: "SAR",
      source: "fallback",
    },
  });
});

router.post("/checkout/create-payment", optionalAuth, async (req, res) => {
  const { deliveryOptionId, address } = req.body;
  const uid = getUserIdFromReq(req);
  const cart = cartStore.get(uid);
  if (!cart || cart.items.length === 0) {
    res.status(400).json({ success: false, error: { code: "EMPTY_CART", message: "Cart is empty" } });
    return;
  }

  const bffResult = await proxyToBff("/checkout/create-payment", "POST", req.body);
  if (bffResult.ok) {
    res.json({ success: true, data: bffResult.data });
    return;
  }

  const deliveryFees: Record<string, number> = { express: 15.0, standard: 8.0, scheduled: 5.0 };
  const deliveryFee = deliveryFees[deliveryOptionId || "standard"] || 8.0;
  const subtotal = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = Math.round(subtotal * 0.15 * 100) / 100;
  const total = Math.round((subtotal + deliveryFee + tax) * 100) / 100;

  res.json({
    success: true,
    data: {
      paymentSessionId: "ps_" + Date.now(),
      subtotal: Math.round(subtotal * 100) / 100,
      deliveryFee,
      tax,
      total,
      currency: "SAR",
      methods: [
        { id: "card", label: "Credit/Debit Card", icon: "credit-card" },
        { id: "apple_pay", label: "Apple Pay", icon: "apple" },
        { id: "wallet", label: "Dakkah Wallet", icon: "wallet", balance: 1250.0 },
        { id: "cod", label: "Cash on Delivery", icon: "cash" },
      ],
      source: "fallback",
    },
  });
});

router.post("/checkout", optionalAuth, async (req, res) => {
  const { paymentMethodId, paymentSessionId, address, deliveryOptionId } = req.body;
  const uid = getUserIdFromReq(req);

  const bffResult = await proxyToBff("/checkout", "POST", req.body);
  if (bffResult.ok) {
    cartStore.delete(uid);
    res.json({ success: true, data: bffResult.data });
    return;
  }

  const cart = cartStore.get(uid);
  if (!cart || cart.items.length === 0) {
    res.status(400).json({ success: false, error: { code: "EMPTY_CART", message: "Cart is empty" } });
    return;
  }

  const deliveryFees: Record<string, number> = { express: 15.0, standard: 8.0, scheduled: 5.0 };
  const deliveryFee = deliveryFees[deliveryOptionId || "standard"] || 8.0;
  const subtotal = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = Math.round(subtotal * 0.15 * 100) / 100;
  const total = Math.round((subtotal + deliveryFee + tax) * 100) / 100;

  const order = {
    orderId: "ORD-" + Date.now(),
    status: "confirmed",
    items: cart.items,
    subtotal: Math.round(subtotal * 100) / 100,
    deliveryFee,
    tax,
    total,
    currency: "SAR",
    paymentMethod: paymentMethodId || "card",
    deliveryOption: deliveryOptionId || "standard",
    address: address || null,
    estimatedDelivery: deliveryOptionId === "express" ? "30-45 min" : "1-2 hours",
    createdAt: new Date().toISOString(),
  };

  cartStore.delete(uid);
  res.json({ success: true, data: { order, source: "fallback" } });
});

router.get("/orders", optionalAuth, async (req, res) => {
  const uid = getUserIdFromReq(req);
  const bffResult = await proxyToBff(`/orders?userId=${uid}`, "GET");
  if (bffResult.ok) {
    res.json({ success: true, data: bffResult.data });
    return;
  }

  res.json({
    success: true,
    data: {
      orders: [
        {
          orderId: "ORD-sample-1",
          status: "delivered",
          items: [{ name: "Artisan Coffee Blend", quantity: 2, price: 24.99 }],
          total: 49.98,
          currency: "SAR",
          createdAt: new Date(Date.now() - 86400000).toISOString(),
        },
      ],
      source: "fallback",
    },
  });
});

export default router;
