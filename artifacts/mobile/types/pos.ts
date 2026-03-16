export interface PosProduct {
  id: string;
  name: string;
  price: number;
  currency: string;
  category: string;
  barcode?: string;
  image?: string;
  available: boolean;
  stockLevel: number;
  variants: Array<{ id: string; name: string; priceModifier: number }>;
  tax: number;
}

export interface CartItem {
  product: PosProduct;
  quantity: number;
  variantId?: string;
  lineDiscount: number;
  notes?: string;
}

export interface CartState {
  items: CartItem[];
  subtotal: number;
  taxTotal: number;
  discountTotal: number;
  total: number;
  currency: string;
}

export type PaymentMethod = "cash" | "card" | "nfc" | "split";

export interface PaymentDetails {
  method: PaymentMethod;
  amountTendered?: number;
  changeDue?: number;
  cardLast4?: string;
  nfcToken?: string;
  splitPayments?: Array<{
    method: "cash" | "card" | "nfc";
    amount: number;
  }>;
  transactionId: string;
}

export interface PosTransaction {
  id: string;
  orderNumber: string;
  items: CartItem[];
  subtotal: number;
  taxTotal: number;
  discountTotal: number;
  total: number;
  currency: string;
  payment: PaymentDetails;
  status: "completed" | "refunded" | "partial_refund" | "voided";
  cashierId: string;
  terminalId: string;
  shiftId: string;
  createdAt: string;
  receiptData?: ReceiptData;
}

export interface ReceiptData {
  storeName: string;
  storeAddress: string;
  storeTaxId: string;
  orderNumber: string;
  date: string;
  cashierName: string;
  items: Array<{
    name: string;
    quantity: number;
    unitPrice: number;
    lineTotal: number;
    discount?: number;
  }>;
  subtotal: number;
  taxTotal: number;
  discountTotal: number;
  total: number;
  paymentMethod: string;
  amountTendered?: number;
  changeDue?: number;
  qrCode?: string;
}

export interface KitchenOrder {
  id: string;
  orderNumber: string;
  items: Array<{
    name: string;
    quantity: number;
    notes?: string;
    variant?: string;
  }>;
  status: "pending" | "preparing" | "ready" | "served";
  createdAt: string;
  prepStartedAt?: string;
  readyAt?: string;
  estimatedPrepTime: number;
}

export interface PosShift {
  id: string;
  cashierId: string;
  cashierName: string;
  terminalId: string;
  openedAt: string;
  closedAt?: string;
  openingCash: number;
  closingCash?: number;
  expectedCash?: number;
  variance?: number;
  totalSales: number;
  totalTransactions: number;
  totalReturns: number;
  currency: string;
  status: "open" | "closed";
}

export interface ReturnRequest {
  transactionId: string;
  items: Array<{
    productId: string;
    quantity: number;
    reason: string;
  }>;
  refundMethod: "cash" | "store_credit" | "original_payment";
  refundAmount: number;
}

export interface DailySalesReport {
  date: string;
  totalSales: number;
  totalTransactions: number;
  totalReturns: number;
  netSales: number;
  cashTotal: number;
  cardTotal: number;
  nfcTotal: number;
  topProducts: Array<{ name: string; quantity: number; revenue: number }>;
  hourlySales: Array<{ hour: number; total: number; count: number }>;
  currency: string;
}

export interface OfflineAction {
  id: string;
  type: "checkout" | "return" | "status_update";
  payload: Record<string, unknown>;
  createdAt: string;
  synced: boolean;
}
