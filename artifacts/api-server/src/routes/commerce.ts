import { Router } from "express";

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

router.get("/cart", (req, res) => {
  const userId = String(req.query.userId || "anonymous");
  const cart = cartStore.get(userId) || { items: [] };
  const total = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  res.json({ success: true, data: { ...cart, total: Math.round(total * 100) / 100, currency: "SAR" } });
});

router.post("/cart/add", (req, res) => {
  const { userId, productId, quantity } = req.body;
  const uid = userId || "anonymous";
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

router.post("/cart/remove", (req, res) => {
  const { userId, productId } = req.body;
  const uid = userId || "anonymous";
  const cart = cartStore.get(uid);
  if (cart) {
    cart.items = cart.items.filter((i) => i.productId !== productId);
  }
  res.json({ success: true, data: { cart: cart || { items: [] } } });
});

router.post("/checkout", async (req, res) => {
  const { userId } = req.body;
  const uid = userId || "anonymous";

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

  const total = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const order = {
    orderId: "ORD-" + Date.now(),
    status: "confirmed",
    items: cart.items,
    total: Math.round(total * 100) / 100,
    currency: "SAR",
    estimatedDelivery: "30-45 min",
    createdAt: new Date().toISOString(),
  };

  cartStore.delete(uid);
  res.json({ success: true, data: { order, source: "fallback" } });
});

router.get("/orders", async (req, res) => {
  const bffResult = await proxyToBff(`/orders?userId=${req.query.userId || ""}`, "GET");
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
