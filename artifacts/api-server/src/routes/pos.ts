import { Router, type Request, type Response, type NextFunction } from "express";
import { requireAuth, requireRole, optionalAuth, type AuthenticatedRequest } from "../middleware/auth";

const POS_ROLES = ["cashier", "pos_operator", "store_manager", "merchant"];
const router = Router();

const isDev = process.env.NODE_ENV === "development";

function devOrAuth(req: Request, res: Response, next: NextFunction): void {
  if (isDev && (!req.headers.authorization || !req.headers.authorization.startsWith("Bearer "))) {
    (req as AuthenticatedRequest).userId = "dev-cashier";
    (req as AuthenticatedRequest).userRoles = ["cashier", "pos_operator", "store_manager"];
    (req as AuthenticatedRequest).tenantId = "dev-tenant";
    next();
    return;
  }
  requireAuth(req, res, next);
}

function devOrRole(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (isDev && (req as AuthenticatedRequest).userId === "dev-cashier") {
      next();
      return;
    }
    requireRole(...roles)(req, res, next);
  };
}

const MOCK_PRODUCTS = [
  { id: "pos-p1", name: "Latte", price: 18, currency: "SAR", category: "Hot Drinks", barcode: "8901234001", available: true, stockLevel: 50, variants: [{ id: "v-sm", name: "Small", priceModifier: -3 }, { id: "v-lg", name: "Large", priceModifier: 4 }], tax: 15, image: "" },
  { id: "pos-p2", name: "Cappuccino", price: 20, currency: "SAR", category: "Hot Drinks", barcode: "8901234002", available: true, stockLevel: 45, variants: [], tax: 15, image: "" },
  { id: "pos-p3", name: "Espresso", price: 12, currency: "SAR", category: "Hot Drinks", barcode: "8901234003", available: true, stockLevel: 60, variants: [], tax: 15, image: "" },
  { id: "pos-p4", name: "Iced Americano", price: 16, currency: "SAR", category: "Cold Drinks", barcode: "8901234004", available: true, stockLevel: 40, variants: [{ id: "v-lg2", name: "Large", priceModifier: 4 }], tax: 15, image: "" },
  { id: "pos-p5", name: "Fresh Orange Juice", price: 22, currency: "SAR", category: "Cold Drinks", barcode: "8901234005", available: true, stockLevel: 25, variants: [], tax: 15, image: "" },
  { id: "pos-p6", name: "Matcha Latte", price: 24, currency: "SAR", category: "Cold Drinks", barcode: "8901234006", available: true, stockLevel: 30, variants: [], tax: 15, image: "" },
  { id: "pos-p7", name: "Chicken Shawarma", price: 28, currency: "SAR", category: "Food", barcode: "8901234007", available: true, stockLevel: 20, variants: [{ id: "v-meal", name: "Meal", priceModifier: 12 }], tax: 15, image: "" },
  { id: "pos-p8", name: "Falafel Wrap", price: 18, currency: "SAR", category: "Food", barcode: "8901234008", available: true, stockLevel: 15, variants: [], tax: 15, image: "" },
  { id: "pos-p9", name: "Caesar Salad", price: 32, currency: "SAR", category: "Food", barcode: "8901234009", available: true, stockLevel: 12, variants: [], tax: 15, image: "" },
  { id: "pos-p10", name: "Chocolate Croissant", price: 14, currency: "SAR", category: "Pastries", barcode: "8901234010", available: true, stockLevel: 18, variants: [], tax: 15, image: "" },
  { id: "pos-p11", name: "Butter Croissant", price: 12, currency: "SAR", category: "Pastries", barcode: "8901234011", available: true, stockLevel: 22, variants: [], tax: 15, image: "" },
  { id: "pos-p12", name: "Kunafa", price: 35, currency: "SAR", category: "Desserts", barcode: "8901234012", available: true, stockLevel: 8, variants: [], tax: 15, image: "" },
  { id: "pos-p13", name: "Cheesecake Slice", price: 28, currency: "SAR", category: "Desserts", barcode: "8901234013", available: true, stockLevel: 10, variants: [], tax: 15, image: "" },
  { id: "pos-p14", name: "Water 500ml", price: 3, currency: "SAR", category: "Beverages", barcode: "8901234014", available: true, stockLevel: 100, variants: [], tax: 15, image: "" },
  { id: "pos-p15", name: "Sparkling Water", price: 6, currency: "SAR", category: "Beverages", barcode: "8901234015", available: true, stockLevel: 48, variants: [], tax: 15, image: "" },
];

const activeShifts = new Map<string, Record<string, unknown>>();
const transactions = new Map<string, Record<string, unknown>[]>();
const kitchenOrders = new Map<string, Record<string, unknown>>();

let orderCounter = 1000;

router.get("/pos/products", devOrAuth, devOrRole(...POS_ROLES), (req, res) => {
  const { category } = req.query;
  let products = MOCK_PRODUCTS;
  if (category && typeof category === "string") {
    products = products.filter((p) => p.category === category);
  }
  res.json({ success: true, data: { products } });
});

router.get("/pos/products/barcode/:barcode", devOrAuth, devOrRole(...POS_ROLES), (req, res) => {
  const product = MOCK_PRODUCTS.find((p) => p.barcode === req.params.barcode);
  if (!product) {
    res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Product not found for barcode" } });
    return;
  }
  res.json({ success: true, data: { product } });
});

router.post("/pos/checkout", devOrAuth, devOrRole(...POS_ROLES), (req, res) => {
  const userId = (req as AuthenticatedRequest).userId;
  const { items, payment, shiftId } = req.body;

  if (!items || !Array.isArray(items) || items.length === 0) {
    res.status(400).json({ success: false, error: { code: "VALIDATION_ERROR", message: "Cart is empty" } });
    return;
  }

  let subtotal = 0;
  let taxTotal = 0;
  let discountTotal = 0;
  const resolvedItems: Record<string, unknown>[] = [];

  for (const item of items) {
    const product = MOCK_PRODUCTS.find((p) => p.id === item.productId);
    if (!product) continue;
    const variantMod = item.variantId ? (product.variants.find((v) => v.id === item.variantId)?.priceModifier || 0) : 0;
    const unitPrice = product.price + variantMod;
    const lineSub = unitPrice * item.quantity;
    const lineDisc = lineSub * ((item.lineDiscount || 0) / 100);
    const lineAfter = lineSub - lineDisc;
    const lineTax = lineAfter * (product.tax / 100);
    subtotal += lineSub;
    discountTotal += lineDisc;
    taxTotal += lineTax;
    resolvedItems.push({
      product,
      quantity: item.quantity,
      variantId: item.variantId,
      lineDiscount: item.lineDiscount || 0,
    });
  }

  const total = Math.round((subtotal - discountTotal + taxTotal) * 100) / 100;
  orderCounter++;
  const orderNumber = `POS-${orderCounter}`;

  const transaction = {
    id: `tx-${Date.now()}`,
    orderNumber,
    items: resolvedItems,
    subtotal: Math.round(subtotal * 100) / 100,
    taxTotal: Math.round(taxTotal * 100) / 100,
    discountTotal: Math.round(discountTotal * 100) / 100,
    total,
    currency: "SAR",
    payment: { ...payment, transactionId: `pay-${Date.now()}` },
    status: "completed",
    cashierId: userId,
    terminalId: "terminal-1",
    shiftId: shiftId || "no-shift",
    createdAt: new Date().toISOString(),
    receiptData: {
      storeName: "Dakkah Store",
      storeAddress: "King Fahd Rd, Riyadh",
      storeTaxId: "300123456700003",
      orderNumber,
      date: new Date().toISOString(),
      cashierName: "Staff",
      items: resolvedItems.map((ri: Record<string, unknown>) => {
        const prod = ri.product as { name: string; price: number };
        return {
          name: prod.name,
          quantity: ri.quantity,
          unitPrice: prod.price,
          lineTotal: (prod.price as number) * (ri.quantity as number),
          discount: ri.lineDiscount,
        };
      }),
      subtotal: Math.round(subtotal * 100) / 100,
      taxTotal: Math.round(taxTotal * 100) / 100,
      discountTotal: Math.round(discountTotal * 100) / 100,
      total,
      paymentMethod: payment.method,
      amountTendered: payment.amountTendered,
      changeDue: payment.amountTendered ? Math.round((payment.amountTendered - total) * 100) / 100 : undefined,
    },
  };

  if (!transactions.has(userId)) transactions.set(userId, []);
  transactions.get(userId)!.push(transaction);

  const ko = {
    id: `ko-${Date.now()}`,
    orderNumber,
    items: resolvedItems.map((ri: Record<string, unknown>) => ({
      name: (ri.product as { name: string }).name,
      quantity: ri.quantity,
    })),
    status: "pending",
    createdAt: new Date().toISOString(),
    estimatedPrepTime: 8,
  };
  kitchenOrders.set(ko.id as string, ko);

  if (activeShifts.has(userId)) {
    const shift = activeShifts.get(userId)!;
    shift.totalSales = (shift.totalSales as number) + total;
    shift.totalTransactions = (shift.totalTransactions as number) + 1;
  }

  res.json({ success: true, data: { transaction } });
});

router.get("/pos/kitchen", devOrAuth, devOrRole(...POS_ROLES), (_req, res) => {
  const orders = Array.from(kitchenOrders.values()).sort(
    (a, b) => new Date(b.createdAt as string).getTime() - new Date(a.createdAt as string).getTime()
  );
  res.json({ success: true, data: { orders } });
});

router.patch("/pos/kitchen/:orderId/status", devOrAuth, devOrRole(...POS_ROLES), (req, res) => {
  const { orderId } = req.params;
  const { status } = req.body;
  const order = kitchenOrders.get(orderId);
  if (!order) {
    res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Kitchen order not found" } });
    return;
  }
  order.status = status;
  if (status === "preparing") order.prepStartedAt = new Date().toISOString();
  if (status === "ready") order.readyAt = new Date().toISOString();
  res.json({ success: true, data: { order } });
});

router.post("/pos/shift/open", devOrAuth, devOrRole(...POS_ROLES), (req, res) => {
  const userId = (req as AuthenticatedRequest).userId;
  const { openingCash } = req.body;
  const shift = {
    id: `shift-${Date.now()}`,
    cashierId: userId,
    cashierName: "Staff",
    terminalId: "terminal-1",
    openedAt: new Date().toISOString(),
    openingCash: openingCash || 0,
    totalSales: 0,
    totalTransactions: 0,
    totalReturns: 0,
    currency: "SAR",
    status: "open",
  };
  activeShifts.set(userId, shift);
  res.json({ success: true, data: { shift } });
});

router.get("/pos/shift/active", devOrAuth, devOrRole(...POS_ROLES), (req, res) => {
  const userId = (req as AuthenticatedRequest).userId;
  const shift = activeShifts.get(userId);
  res.json({ success: true, data: { shift: shift && shift.status === "open" ? shift : null } });
});

router.post("/pos/shift/:shiftId/close", devOrAuth, devOrRole(...POS_ROLES), (req, res) => {
  const userId = (req as AuthenticatedRequest).userId;
  const { closingCash } = req.body;
  const shift = activeShifts.get(userId);
  if (!shift || shift.id !== req.params.shiftId) {
    res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Shift not found" } });
    return;
  }
  shift.closedAt = new Date().toISOString();
  shift.closingCash = closingCash;
  shift.expectedCash = (shift.openingCash as number) + (shift.totalSales as number);
  shift.variance = closingCash - (shift.expectedCash as number);
  shift.status = "closed";
  res.json({ success: true, data: { shift } });
});

router.post("/pos/returns", devOrAuth, devOrRole(...POS_ROLES), (req, res) => {
  const userId = (req as AuthenticatedRequest).userId;
  const { transactionId, items, refundMethod, refundAmount } = req.body;
  const refundTx = {
    id: `tx-ref-${Date.now()}`,
    orderNumber: `RET-${++orderCounter}`,
    items: items.map((i: Record<string, unknown>) => ({
      product: MOCK_PRODUCTS.find((p) => p.id === i.productId) || { id: i.productId, name: "Unknown" },
      quantity: i.quantity,
      lineDiscount: 0,
    })),
    subtotal: -refundAmount,
    taxTotal: 0,
    discountTotal: 0,
    total: -refundAmount,
    currency: "SAR",
    payment: { method: refundMethod, transactionId: `ref-${Date.now()}` },
    status: "refunded",
    cashierId: userId,
    terminalId: "terminal-1",
    shiftId: "current",
    createdAt: new Date().toISOString(),
    originalTransactionId: transactionId,
  };
  if (!transactions.has(userId)) transactions.set(userId, []);
  transactions.get(userId)!.push(refundTx);
  if (activeShifts.has(userId)) {
    const shift = activeShifts.get(userId)!;
    shift.totalReturns = (shift.totalReturns as number) + refundAmount;
  }
  const storeCreditId = refundMethod === "store_credit" ? `sc-${Date.now()}` : undefined;
  res.json({ success: true, data: { transaction: refundTx, storeCreditId } });
});

router.get("/pos/reports/daily", devOrAuth, devOrRole(...POS_ROLES), (_req, res) => {
  const report = {
    date: new Date().toISOString().split("T")[0],
    totalSales: 4280.50,
    totalTransactions: 87,
    totalReturns: 156.00,
    netSales: 4124.50,
    cashTotal: 1890.00,
    cardTotal: 1845.50,
    nfcTotal: 545.00,
    topProducts: [
      { name: "Latte", quantity: 42, revenue: 756 },
      { name: "Chicken Shawarma", quantity: 28, revenue: 784 },
      { name: "Cappuccino", quantity: 25, revenue: 500 },
      { name: "Iced Americano", quantity: 22, revenue: 352 },
      { name: "Kunafa", quantity: 15, revenue: 525 },
    ],
    hourlySales: Array.from({ length: 16 }, (_, i) => ({
      hour: i + 7,
      total: Math.round((Math.random() * 400 + 100) * 100) / 100,
      count: Math.floor(Math.random() * 12 + 2),
    })),
    currency: "SAR",
  };
  res.json({ success: true, data: { report } });
});

router.get("/pos/transactions", devOrAuth, devOrRole(...POS_ROLES), (req, res) => {
  const userId = (req as AuthenticatedRequest).userId;
  const txs = transactions.get(userId) || [];
  res.json({ success: true, data: { transactions: txs } });
});

export default router;
