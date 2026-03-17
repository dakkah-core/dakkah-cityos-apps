import type { Request, Response } from "express";

interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

interface OrderItem {
  productId: string;
  quantity: number;
  price?: number;
}

interface WorkflowTriggerData {
  [key: string]: string | number | boolean | null;
}

type ServiceMethodParams = Record<string, unknown>;

interface ServiceMethod {
  (params: ServiceMethodParams): Promise<Record<string, unknown>>;
}

interface ServiceModule {
  [method: string]: ServiceMethod;
}

const AIService: ServiceModule = {
  async chat(params: ServiceMethodParams) {
    const p = params as { messages?: ChatMessage[]; model?: string };
    return {
      response: "I'd be happy to help you explore the city! What are you looking for?",
      model: p.model || "dakkah-copilot-v1",
      usage: { promptTokens: 120, completionTokens: 45 },
    };
  },
  async summarize(params: ServiceMethodParams) {
    const p = params as { text?: string };
    return { summary: (p.text || "").slice(0, 100) + "..." };
  },
};

const CommerceService: ServiceModule = {
  async getProducts(params: ServiceMethodParams) {
    const _p = params as { category?: string; limit?: number };
    return {
      products: [
        { id: "prod_1", name: "Artisan Coffee Blend", price: 24.99, currency: "SAR", category: "food", rating: 4.8, inStock: true },
        { id: "prod_2", name: "Handwoven Basket", price: 89.0, currency: "SAR", category: "crafts", rating: 4.6, inStock: true },
        { id: "prod_3", name: "Local Honey Jar", price: 35.0, currency: "SAR", category: "food", rating: 4.9, inStock: false },
      ],
      total: 3,
    };
  },
  async getVendors(params: ServiceMethodParams) {
    const _p = params as { query?: string };
    return {
      vendors: [
        { id: "v_1", name: "Al-Medina Crafts", rating: 4.7, products: 42, verified: true },
        { id: "v_2", name: "Heritage Spices", rating: 4.5, products: 28, verified: true },
      ],
    };
  },
  async createOrder(params: ServiceMethodParams) {
    const _p = params as { items?: OrderItem[] };
    return { orderId: "ORD-" + Date.now(), status: "confirmed", estimatedDelivery: "30 min" };
  },
};

const PaymentsService: ServiceModule = {
  async createInvoice(params: ServiceMethodParams) {
    const p = params as { amount: number; currency?: string };
    return { invoiceId: "INV-" + Date.now(), amount: p.amount, currency: p.currency || "SAR", status: "pending" };
  },
  async getBalance() {
    return { balance: 2450.0, currency: "SAR", lastUpdated: new Date().toISOString() };
  },
  async processPayment(params: ServiceMethodParams) {
    const p = params as { invoiceId: string; method: string };
    return { transactionId: "TXN-" + Date.now(), status: "completed", timestamp: new Date().toISOString(), invoiceId: p.invoiceId, method: p.method };
  },
};

const IdentityService: ServiceModule = {
  async getProfile(params: ServiceMethodParams) {
    const p = params as { userId?: string };
    return {
      id: p.userId || "user_default",
      name: "City Explorer",
      email: "explorer@dakkah.city",
      level: 12,
      xp: 2400,
      badges: ["early_adopter", "city_walker", "event_goer"],
    };
  },
  async verifyIdentity(params: ServiceMethodParams) {
    const p = params as { documentType: string };
    return { verified: true, documentType: p.documentType, verifiedAt: new Date().toISOString() };
  },
};

const LogisticsService: ServiceModule = {
  async trackDelivery(params: ServiceMethodParams) {
    const p = params as { orderId: string };
    return {
      orderId: p.orderId,
      status: "on-the-way",
      eta: "15 min",
      driver: { name: "Ahmed", vehicle: "Motorcycle", plate: "ABC 1234" },
      location: { lat: 24.7136, lng: 46.6753 },
    };
  },
  async estimateDelivery(params: ServiceMethodParams) {
    const _p = params as { from: string; to: string };
    return { estimatedTime: "25 min", distance: "8.2 km", cost: 15.0, currency: "SAR" };
  },
};

const HealthService: ServiceModule = {
  async getMetrics(params: ServiceMethodParams) {
    const _p = params as { userId?: string };
    return {
      steps: 8432,
      heartRate: 72,
      sleep: 7.2,
      water: 6,
      calories: 1850,
      lastSync: new Date().toISOString(),
    };
  },
  async getAirQuality(params: ServiceMethodParams) {
    const p = params as { zone?: string };
    return { aqi: 42, level: "Good", pm25: 12.3, zone: p.zone || "Downtown" };
  },
};

const ERPService: ServiceModule = {
  async getInventory(params: ServiceMethodParams) {
    const _p = params as { warehouseId?: string };
    return {
      items: [
        { sku: "SKU-001", name: "Event Tickets", quantity: 250, reorderAt: 50 },
        { sku: "SKU-002", name: "VIP Passes", quantity: 45, reorderAt: 10 },
      ],
    };
  },
  async getReport(params: ServiceMethodParams) {
    const p = params as { type: string; period?: string };
    return { type: p.type, period: p.period || "monthly", revenue: 125000, transactions: 3420 };
  },
};

const ContentService: ServiceModule = {
  async getArticles(params: ServiceMethodParams) {
    const _p = params as { category?: string; limit?: number };
    return {
      articles: [
        { id: "art_1", title: "Hidden Gems of Al-Balad", author: "Sarah Al-Rashid", readTime: "5 min", category: "explore" },
        { id: "art_2", title: "Best Street Food Spots", author: "Omar Khalid", readTime: "3 min", category: "food" },
      ],
    };
  },
  async getEvents(params: ServiceMethodParams) {
    const _p = params as { date?: string };
    return {
      events: [
        { id: "evt_1", name: "Jazz at the Park", date: "Tonight", time: "8:00 PM", venue: "City Park", tickets: 120 },
        { id: "evt_2", name: "Art Walk", date: "Tomorrow", time: "5:00 PM", venue: "Heritage District", tickets: 0 },
      ],
    };
  },
};

const CommsService: ServiceModule = {
  async sendNotification(params: ServiceMethodParams) {
    const _p = params as { userId: string; title: string; body: string };
    return { sent: true, notificationId: "notif_" + Date.now() };
  },
  async getNotifications(params: ServiceMethodParams) {
    const _p = params as { userId?: string; limit?: number };
    return {
      notifications: [
        { id: "n_1", title: "Quest Complete!", body: "You earned 50 XP", read: false, timestamp: Date.now() - 3600000 },
        { id: "n_2", title: "Event Reminder", body: "Jazz at the Park starts in 1 hour", read: true, timestamp: Date.now() - 7200000 },
      ],
    };
  },
};

const WorkflowsService: ServiceModule = {
  async getActiveWorkflows(params: ServiceMethodParams) {
    const _p = params as { userId?: string };
    return {
      workflows: [
        { id: "wf_1", name: "Trip Planning", status: "active", progress: 60, steps: ["Search", "Compare", "Book", "Confirm"] },
        { id: "wf_2", name: "Issue Report", status: "pending_review", progress: 80, steps: ["Report", "Photo", "Submit", "Track"] },
      ],
    };
  },
  async triggerWorkflow(params: ServiceMethodParams) {
    const p = params as { name: string; data?: WorkflowTriggerData };
    return { workflowId: "wf_" + Date.now(), name: p.name, status: "started" };
  },
};

const StorageService: ServiceModule = {
  async upload(params: ServiceMethodParams) {
    const p = params as { fileName: string; mimeType: string };
    return { fileId: "file_" + Date.now(), url: "https://storage.dakkah.city/" + p.fileName, size: 0 };
  },
  async listFiles(params: ServiceMethodParams) {
    const _p = params as { folder?: string };
    return {
      files: [
        { id: "f_1", name: "city_photo.jpg", size: 2400000, mimeType: "image/jpeg", uploadedAt: new Date().toISOString() },
        { id: "f_2", name: "receipt.pdf", size: 145000, mimeType: "application/pdf", uploadedAt: new Date().toISOString() },
      ],
    };
  },
};

const services: Record<string, ServiceModule> = {
  ai: AIService,
  commerce: CommerceService,
  payments: PaymentsService,
  identity: IdentityService,
  logistics: LogisticsService,
  health: HealthService,
  erp: ERPService,
  content: ContentService,
  comms: CommsService,
  workflows: WorkflowsService,
  storage: StorageService,
};

export async function handleGatewayRequest(req: Request, res: Response) {
  const { service, method, params } = req.body as {
    service?: string;
    method?: string;
    params?: ServiceMethodParams;
  };

  if (!service || !method) {
    return res.status(400).json({ success: false, error: { code: "INVALID_REQUEST", message: "service and method are required" } });
  }

  const svc = services[service];
  if (!svc) {
    return res.status(404).json({ success: false, error: { code: "SERVICE_NOT_FOUND", message: `Unknown service: ${service}` } });
  }

  const fn = svc[method];
  if (!fn) {
    return res.status(404).json({ success: false, error: { code: "METHOD_NOT_FOUND", message: `Unknown method: ${service}.${method}` } });
  }

  try {
    const data = await fn(params || {});
    return res.json({
      success: true,
      data,
      meta: { source: service, timestamp: new Date().toISOString(), requestId: "req_" + Date.now() },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal error";
    return res.status(500).json({ success: false, error: { code: "INTERNAL_ERROR", message } });
  }
}

export async function handleHealthDashboard(_req: Request, res: Response) {
  const serviceNames = Object.keys(services);
  const statuses = await Promise.all(
    serviceNames.map(async (name) => {
      const start = Date.now();
      try {
        const svc = services[name];
        const firstMethod = Object.keys(svc)[0];
        if (firstMethod) await svc[firstMethod]({});
        return { name, status: "healthy" as const, latency: Date.now() - start, lastChecked: new Date().toISOString() };
      } catch {
        return { name, status: "unhealthy" as const, latency: Date.now() - start, lastChecked: new Date().toISOString() };
      }
    })
  );

  const allHealthy = statuses.every((s) => s.status === "healthy");
  res.json({
    overall: allHealthy ? "healthy" : "degraded",
    services: statuses,
    timestamp: new Date().toISOString(),
  });
}
