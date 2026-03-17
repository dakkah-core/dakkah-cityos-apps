import { Router } from "express";
import { requireAuth, optionalAuth, requireRole, getUserIdFromReq } from "../middleware/auth";

const router = Router();

type NotificationCategory = "order" | "delivery" | "city_alert" | "event" | "chat" | "health" | "transport" | "general";

interface PushRegistration {
  userId: string;
  token: string;
  platform: "ios" | "android" | "web";
  registeredAt: string;
  categories: NotificationCategory[];
}

const registrations = new Map<string, PushRegistration>();

const DEFAULT_CATEGORIES: NotificationCategory[] = ["order", "delivery", "city_alert", "event", "chat", "health", "transport", "general"];

router.post("/notifications/register", requireAuth, (req, res) => {
  const userId = getUserIdFromReq(req);
  const { token, platform, categories } = req.body;
  if (!token || !platform) {
    res.status(400).json({ success: false, error: { code: "INVALID_REQUEST", message: "token and platform required" } });
    return;
  }

  const registration: PushRegistration = {
    userId,
    token,
    platform,
    registeredAt: new Date().toISOString(),
    categories: categories || DEFAULT_CATEGORIES,
  };

  registrations.set(token, registration);

  res.json({
    success: true,
    data: {
      registered: true,
      token: token.slice(0, 12) + "...",
      platform,
      categories: registration.categories,
    },
  });
});

router.delete("/notifications/unregister", requireAuth, (req, res) => {
  const { token } = req.body;
  if (token) {
    registrations.delete(token);
  }
  res.json({ success: true, data: { unregistered: true } });
});

router.put("/notifications/categories", requireAuth, (req, res) => {
  const { token, categories } = req.body;
  if (!token || !categories || !Array.isArray(categories)) {
    res.status(400).json({ success: false, error: { code: "INVALID_REQUEST", message: "token and categories array required" } });
    return;
  }

  const registration = registrations.get(token);
  if (!registration) {
    res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Registration not found" } });
    return;
  }

  const validCategories = categories.filter((c: string) => DEFAULT_CATEGORIES.includes(c as NotificationCategory)) as NotificationCategory[];
  registration.categories = validCategories;

  res.json({
    success: true,
    data: { categories: validCategories },
  });
});

router.get("/notifications/categories", (_req, res) => {
  res.json({
    success: true,
    data: {
      available: DEFAULT_CATEGORIES.map((cat) => ({
        id: cat,
        label: cat.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
        description: getCategoryDescription(cat),
      })),
    },
  });
});

function getCategoryDescription(category: NotificationCategory): string {
  const descriptions: Record<NotificationCategory, string> = {
    order: "Order confirmations, updates, and delivery status",
    delivery: "Real-time delivery tracking and driver updates",
    city_alert: "Emergency alerts, weather warnings, and safety notices",
    event: "Event reminders, ticket updates, and recommendations",
    chat: "Messages from merchants, drivers, and support",
    health: "Appointment reminders and health metric alerts",
    transport: "Ride status, transit delays, and parking expiry",
    general: "General platform announcements and tips",
  };
  return descriptions[category];
}

router.post("/notifications/send", requireAuth, requireRole("admin", "platform-admin"), (req, res) => {
  const { userId, title, body, data, category } = req.body;
  if (!title || !body) {
    res.status(400).json({ success: false, error: { code: "INVALID_REQUEST", message: "title and body required" } });
    return;
  }

  const cat = (category || "general") as NotificationCategory;

  const targetTokens = Array.from(registrations.values())
    .filter((r) => {
      if (userId && r.userId !== userId) return false;
      return r.categories.includes(cat);
    })
    .map((r) => r.token);

  res.json({
    success: true,
    data: {
      sent: true,
      recipientCount: targetTokens.length,
      category: cat,
      notificationId: "notif_" + Date.now(),
    },
  });
});

export default router;
