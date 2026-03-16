import { Router } from "express";

const router = Router();

interface PushRegistration {
  userId: string;
  token: string;
  platform: "ios" | "android" | "web";
  registeredAt: string;
}

const registrations = new Map<string, PushRegistration>();

router.post("/notifications/register", (req, res) => {
  const { userId, token, platform } = req.body;
  if (!token || !platform) {
    res.status(400).json({ success: false, error: { code: "INVALID_REQUEST", message: "token and platform required" } });
    return;
  }

  const registration: PushRegistration = {
    userId: userId || "anonymous",
    token,
    platform,
    registeredAt: new Date().toISOString(),
  };

  registrations.set(token, registration);

  res.json({
    success: true,
    data: {
      registered: true,
      token: token.slice(0, 12) + "...",
      platform,
    },
  });
});

router.delete("/notifications/unregister", (req, res) => {
  const { token } = req.body;
  if (token) {
    registrations.delete(token);
  }
  res.json({ success: true, data: { unregistered: true } });
});

router.post("/notifications/send", (req, res) => {
  const { userId, title, body, data } = req.body;
  if (!title || !body) {
    res.status(400).json({ success: false, error: { code: "INVALID_REQUEST", message: "title and body required" } });
    return;
  }

  const targetTokens = userId
    ? Array.from(registrations.values()).filter((r) => r.userId === userId).map((r) => r.token)
    : Array.from(registrations.values()).map((r) => r.token);

  res.json({
    success: true,
    data: {
      sent: true,
      recipientCount: targetTokens.length,
      notificationId: "notif_" + Date.now(),
    },
  });
});

export default router;
