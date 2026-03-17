import { Router } from "express";
import { optionalAuth } from "../middleware/auth";

const router = Router();

const BFF_PLATFORM_PORT = process.env.BFF_PLATFORM_PORT || 4006;
const BFF_HOST = process.env.BFF_HOST || "localhost";

async function proxyToBff(path: string, method: string, body?: unknown) {
  try {
    const url = `http://${BFF_HOST}:${BFF_PLATFORM_PORT}/api${path}`;
    const options: RequestInit = { method, headers: { "Content-Type": "application/json" }, signal: AbortSignal.timeout(5000) };
    if (body && method !== "GET") options.body = JSON.stringify(body);
    const res = await fetch(url, options);
    if (res.ok) return { ok: true, data: await res.json() };
    return { ok: false, data: null };
  } catch {
    return { ok: false, data: null };
  }
}

const FALLBACK_TENANTS = [
  { id: "tenant_riyadh", name: "Riyadh Municipality", region: "central", timezone: "Asia/Riyadh", locale: "ar-SA", features: ["commerce", "transport", "healthcare", "governance", "events", "iot"], population: 7500000, status: "active" },
  { id: "tenant_jeddah", name: "Jeddah Municipality", region: "western", timezone: "Asia/Riyadh", locale: "ar-SA", features: ["commerce", "transport", "healthcare", "governance", "events"], population: 4600000, status: "active" },
  { id: "tenant_neom", name: "NEOM", region: "northwest", timezone: "Asia/Riyadh", locale: "en-US", features: ["commerce", "transport", "healthcare", "iot", "social"], population: 50000, status: "beta" },
];

const FALLBACK_FEATURE_FLAGS = [
  { id: "ff_1", key: "ai_copilot_v2", name: "AI Copilot V2", description: "Next-gen conversational AI", enabled: true, rolloutPercentage: 100, tenants: ["*"] },
  { id: "ff_2", key: "voice_commands", name: "Voice Commands", description: "Hands-free voice interaction", enabled: true, rolloutPercentage: 50, tenants: ["tenant_riyadh", "tenant_neom"] },
  { id: "ff_3", key: "ar_navigation", name: "AR Navigation", description: "Augmented reality wayfinding", enabled: false, rolloutPercentage: 0, tenants: [] },
  { id: "ff_4", key: "crypto_payments", name: "Crypto Payments", description: "Accept cryptocurrency for services", enabled: false, rolloutPercentage: 0, tenants: ["tenant_neom"] },
  { id: "ff_5", key: "dark_mode", name: "Dark Mode", description: "System-wide dark theme", enabled: true, rolloutPercentage: 100, tenants: ["*"] },
];

const FALLBACK_SYSTEM_STATUS = {
  overall: "operational",
  services: [
    { name: "API Gateway", status: "operational", latency: 12, uptime: 99.99 },
    { name: "Commerce BFF", status: "operational", latency: 45, uptime: 99.95 },
    { name: "Transport BFF", status: "operational", latency: 38, uptime: 99.97 },
    { name: "Healthcare BFF", status: "operational", latency: 52, uptime: 99.93 },
    { name: "Governance BFF", status: "degraded", latency: 120, uptime: 99.85 },
    { name: "IoT Telemetry", status: "operational", latency: 28, uptime: 99.98 },
    { name: "SDUI Engine", status: "operational", latency: 15, uptime: 99.99 },
    { name: "Auth Service", status: "operational", latency: 22, uptime: 99.99 },
  ],
  lastChecked: new Date().toISOString(),
};

router.get("/tenants", optionalAuth, async (req, res) => {
  const bff = await proxyToBff("/tenants", "GET");
  if (bff.ok) { res.json({ success: true, data: bff.data }); return; }
  res.json({ success: true, data: { tenants: FALLBACK_TENANTS, total: FALLBACK_TENANTS.length, source: "fallback" } });
});

router.get("/tenants/:id", optionalAuth, async (req, res) => {
  const bff = await proxyToBff(`/tenants/${req.params.id}`, "GET");
  if (bff.ok) { res.json({ success: true, data: bff.data }); return; }
  const tenant = FALLBACK_TENANTS.find(t => t.id === req.params.id);
  if (tenant) res.json({ success: true, data: { tenant, source: "fallback" } });
  else res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Tenant not found" } });
});

router.get("/feature-flags", optionalAuth, async (req, res) => {
  const { tenant } = req.query;
  const bff = await proxyToBff(`/feature-flags?tenant=${tenant || ""}`, "GET");
  if (bff.ok) { res.json({ success: true, data: bff.data }); return; }

  let filtered = FALLBACK_FEATURE_FLAGS;
  if (tenant) filtered = filtered.filter(f => f.tenants.includes("*") || f.tenants.includes(String(tenant)));
  res.json({ success: true, data: { flags: filtered, total: filtered.length, source: "fallback" } });
});

router.get("/system-status", optionalAuth, async (req, res) => {
  const bff = await proxyToBff("/system-status", "GET");
  if (bff.ok) { res.json({ success: true, data: bff.data }); return; }
  res.json({ success: true, data: { ...FALLBACK_SYSTEM_STATUS, lastChecked: new Date().toISOString(), source: "fallback" } });
});

router.get("/config", optionalAuth, async (req, res) => {
  const { tenant } = req.query;
  const bff = await proxyToBff(`/config?tenant=${tenant || ""}`, "GET");
  if (bff.ok) { res.json({ success: true, data: bff.data }); return; }

  res.json({
    success: true,
    data: {
      appName: "Dakkah CityOS",
      version: "2.0.0",
      defaultLocale: "ar-SA",
      supportedLocales: ["ar-SA", "en-US", "fr-FR", "ur-PK"],
      theme: { primary: "#0a1628", accent: "#3182ce", teal: "#0d9488", amber: "#d97706", rose: "#e11d48" },
      features: FALLBACK_FEATURE_FLAGS.filter(f => f.enabled).map(f => f.key),
      source: "fallback",
    },
  });
});

export default router;
