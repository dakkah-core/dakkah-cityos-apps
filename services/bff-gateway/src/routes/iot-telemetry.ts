import { Router } from "express";
import { optionalAuth } from "../middleware/auth";

const router = Router();

const BFF_IOT_PORT = process.env.BFF_IOT_PORT || 4007;
const BFF_HOST = process.env.BFF_HOST || "localhost";

async function proxyToBff(path: string, method: string, body?: unknown) {
  try {
    const url = `http://${BFF_HOST}:${BFF_IOT_PORT}/api${path}`;
    const options: RequestInit = { method, headers: { "Content-Type": "application/json" }, signal: AbortSignal.timeout(5000) };
    if (body && method !== "GET") options.body = JSON.stringify(body);
    const res = await fetch(url, options);
    if (res.ok) return { ok: true, data: await res.json() };
    return { ok: false, data: null };
  } catch {
    return { ok: false, data: null };
  }
}

const FALLBACK_DEVICES = [
  { id: "dev_1", name: "Traffic Sensor A1", type: "traffic_camera", location: { lat: 24.7136, lng: 46.6753, address: "King Fahd Road & Olaya St" }, status: "online", lastSeen: new Date().toISOString(), batteryLevel: null, firmware: "3.2.1" },
  { id: "dev_2", name: "Air Quality Monitor B3", type: "air_quality", location: { lat: 24.7275, lng: 46.6893, address: "Al-Malaz Park" }, status: "online", lastSeen: new Date().toISOString(), batteryLevel: 87, firmware: "2.1.0" },
  { id: "dev_3", name: "Smart Waste Bin D7", type: "waste_sensor", location: { lat: 24.6588, lng: 46.7273, address: "Al-Batha District" }, status: "online", lastSeen: new Date().toISOString(), batteryLevel: 45, firmware: "1.4.2" },
  { id: "dev_4", name: "Water Flow Meter W12", type: "water_meter", location: { lat: 24.6958, lng: 46.7134, address: "King Abdullah Road" }, status: "online", lastSeen: new Date().toISOString(), batteryLevel: 92, firmware: "2.0.5" },
  { id: "dev_5", name: "Street Light Controller L8", type: "light_controller", location: { lat: 24.7349, lng: 46.5726, address: "Prince Mohammed Road" }, status: "offline", lastSeen: new Date(Date.now() - 3600000).toISOString(), batteryLevel: null, firmware: "3.0.0" },
  { id: "dev_6", name: "Noise Sensor N2", type: "noise_sensor", location: { lat: 24.7100, lng: 46.6800, address: "Entertainment District" }, status: "online", lastSeen: new Date().toISOString(), batteryLevel: 73, firmware: "1.2.0" },
];

function generateReadings(deviceId: string, type: string, count: number) {
  const readings = [];
  const now = Date.now();
  for (let i = 0; i < count; i++) {
    const ts = new Date(now - i * 300000).toISOString();
    let value: Record<string, unknown> = {};
    switch (type) {
      case "traffic_camera":
        value = { vehicleCount: Math.floor(50 + Math.random() * 200), avgSpeed: Math.round(40 + Math.random() * 40), congestionLevel: ["low", "moderate", "high"][Math.floor(Math.random() * 3)] };
        break;
      case "air_quality":
        value = { aqi: Math.floor(30 + Math.random() * 80), pm25: Math.round((5 + Math.random() * 30) * 10) / 10, pm10: Math.round((10 + Math.random() * 50) * 10) / 10, co2: Math.floor(350 + Math.random() * 150), temperature: Math.round((25 + Math.random() * 15) * 10) / 10, humidity: Math.floor(20 + Math.random() * 40) };
        break;
      case "waste_sensor":
        value = { fillLevel: Math.floor(20 + Math.random() * 80), temperature: Math.round((30 + Math.random() * 20) * 10) / 10, lastPickup: new Date(now - 86400000).toISOString() };
        break;
      case "water_meter":
        value = { flowRate: Math.round((10 + Math.random() * 50) * 10) / 10, totalVolume: Math.floor(10000 + Math.random() * 50000), pressure: Math.round((2 + Math.random() * 3) * 10) / 10, quality: ["excellent", "good", "acceptable"][Math.floor(Math.random() * 3)] };
        break;
      case "light_controller":
        value = { brightness: Math.floor(Math.random() * 100), powerConsumption: Math.round((50 + Math.random() * 150) * 10) / 10, isOn: Math.random() > 0.3 };
        break;
      case "noise_sensor":
        value = { decibels: Math.round((40 + Math.random() * 50) * 10) / 10, peakDb: Math.round((60 + Math.random() * 40) * 10) / 10, classification: ["ambient", "traffic", "construction", "event"][Math.floor(Math.random() * 4)] };
        break;
      default:
        value = { raw: Math.random() * 100 };
    }
    readings.push({ deviceId, timestamp: ts, value });
  }
  return readings;
}

const FALLBACK_ALERTS = [
  { id: "alert_1", deviceId: "dev_3", type: "threshold", severity: "warning", message: "Waste bin D7 at 92% capacity", createdAt: new Date(Date.now() - 1800000).toISOString(), acknowledged: false },
  { id: "alert_2", deviceId: "dev_5", type: "offline", severity: "critical", message: "Street light controller L8 offline for 1 hour", createdAt: new Date(Date.now() - 3600000).toISOString(), acknowledged: false },
  { id: "alert_3", deviceId: "dev_2", type: "threshold", severity: "info", message: "Air quality moderate — AQI above 80 at Al-Malaz Park", createdAt: new Date(Date.now() - 7200000).toISOString(), acknowledged: true },
];

router.get("/devices", optionalAuth, async (req, res) => {
  const { type, status } = req.query;
  const bff = await proxyToBff(`/devices?type=${type || ""}&status=${status || ""}`, "GET");
  if (bff.ok) { res.json({ success: true, data: bff.data }); return; }

  let filtered = FALLBACK_DEVICES;
  if (type) filtered = filtered.filter(d => d.type === type);
  if (status) filtered = filtered.filter(d => d.status === status);
  res.json({ success: true, data: { devices: filtered, total: filtered.length, online: filtered.filter(d => d.status === "online").length, source: "fallback" } });
});

router.get("/devices/:id", optionalAuth, async (req, res) => {
  const bff = await proxyToBff(`/devices/${req.params.id}`, "GET");
  if (bff.ok) { res.json({ success: true, data: bff.data }); return; }
  const device = FALLBACK_DEVICES.find(d => d.id === req.params.id);
  if (device) res.json({ success: true, data: { device, source: "fallback" } });
  else res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Device not found" } });
});

router.get("/devices/:id/readings", optionalAuth, async (req, res) => {
  const { limit } = req.query;
  const bff = await proxyToBff(`/devices/${req.params.id}/readings?limit=${limit || 12}`, "GET");
  if (bff.ok) { res.json({ success: true, data: bff.data }); return; }

  const device = FALLBACK_DEVICES.find(d => d.id === req.params.id);
  if (!device) { res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Device not found" } }); return; }

  const readings = generateReadings(device.id, device.type, Math.min(Number(limit) || 12, 100));
  res.json({ success: true, data: { readings, device: { id: device.id, type: device.type }, source: "fallback" } });
});

router.get("/alerts", optionalAuth, async (req, res) => {
  const { severity, acknowledged } = req.query;
  const bff = await proxyToBff(`/alerts?severity=${severity || ""}&acknowledged=${acknowledged || ""}`, "GET");
  if (bff.ok) { res.json({ success: true, data: bff.data }); return; }

  let filtered = FALLBACK_ALERTS;
  if (severity) filtered = filtered.filter(a => a.severity === severity);
  if (acknowledged !== undefined) filtered = filtered.filter(a => a.acknowledged === (acknowledged === "true"));
  res.json({ success: true, data: { alerts: filtered, total: filtered.length, source: "fallback" } });
});

router.post("/alerts/:id/acknowledge", optionalAuth, (req, res) => {
  const alert = FALLBACK_ALERTS.find(a => a.id === req.params.id);
  if (!alert) { res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Alert not found" } }); return; }
  alert.acknowledged = true;
  res.json({ success: true, data: { alert } });
});

router.get("/dashboard", optionalAuth, async (req, res) => {
  const bff = await proxyToBff("/dashboard", "GET");
  if (bff.ok) { res.json({ success: true, data: bff.data }); return; }

  res.json({
    success: true,
    data: {
      summary: {
        totalDevices: FALLBACK_DEVICES.length,
        online: FALLBACK_DEVICES.filter(d => d.status === "online").length,
        offline: FALLBACK_DEVICES.filter(d => d.status === "offline").length,
        activeAlerts: FALLBACK_ALERTS.filter(a => !a.acknowledged).length,
      },
      airQuality: { aqi: 52, status: "moderate", pm25: 18.5, lastUpdated: new Date().toISOString() },
      traffic: { avgCongestion: "moderate", vehiclesPerHour: 1250, incidents: 2 },
      energy: { consumption: 342, unit: "MW", trend: -5, renewableShare: 18 },
      water: { flowRate: 28.5, quality: "good", pressure: 3.2 },
      source: "fallback",
    },
  });
});

export default router;
