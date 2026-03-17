import { Router } from "express";
import { optionalAuth, getUserIdFromReq } from "../middleware/auth";

const router = Router();

const BFF_EVENTS_PORT = process.env.BFF_EVENTS_PORT || 4005;
const BFF_HOST = process.env.BFF_HOST || "localhost";

async function proxyToBff(path: string, method: string, body?: unknown) {
  try {
    const url = `http://${BFF_HOST}:${BFF_EVENTS_PORT}/api${path}`;
    const options: RequestInit = { method, headers: { "Content-Type": "application/json" }, signal: AbortSignal.timeout(5000) };
    if (body && method !== "GET") options.body = JSON.stringify(body);
    const res = await fetch(url, options);
    if (res.ok) return { ok: true, data: await res.json() };
    return { ok: false, data: null };
  } catch {
    return { ok: false, data: null };
  }
}

const FALLBACK_EVENTS = [
  { id: "evt_1", title: "Riyadh Season Festival", category: "entertainment", venue: "Boulevard Riyadh City", date: "2026-03-20", time: "18:00", endDate: "2026-04-20", price: 0, currency: "SAR", image: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=400", capacity: 50000, registered: 32400, tags: ["festival", "outdoor", "family"] },
  { id: "evt_2", title: "Saudi Tech Summit 2026", category: "technology", venue: "Riyadh Convention Center", date: "2026-04-05", time: "09:00", endDate: "2026-04-07", price: 250, currency: "SAR", image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400", capacity: 5000, registered: 3800, tags: ["tech", "conference", "networking"] },
  { id: "evt_3", title: "Arabic Calligraphy Workshop", category: "arts", venue: "National Museum", date: "2026-03-25", time: "14:00", endDate: "2026-03-25", price: 75, currency: "SAR", capacity: 30, registered: 22, tags: ["workshop", "art", "culture"] },
  { id: "evt_4", title: "Riyadh Marathon 2026", category: "sports", venue: "King Fahd Road", date: "2026-04-12", time: "06:00", endDate: "2026-04-12", price: 150, currency: "SAR", image: "https://images.unsplash.com/photo-1513593771513-7b58b6c4af38?w=400", capacity: 15000, registered: 8900, tags: ["sports", "marathon", "outdoor"] },
  { id: "evt_5", title: "Friday Night Jazz", category: "music", venue: "Al-Bujairi Heritage Park", date: "2026-03-21", time: "20:00", endDate: "2026-03-21", price: 120, currency: "SAR", capacity: 500, registered: 340, tags: ["music", "jazz", "evening"] },
];

const FALLBACK_VENUES = [
  { id: "ven_1", name: "Boulevard Riyadh City", type: "entertainment_district", capacity: 50000, address: "Prince Mohammed bin Salman Road", lat: 24.7136, lng: 46.6753, amenities: ["parking", "food_court", "wheelchair_access"], rating: 4.6 },
  { id: "ven_2", name: "Riyadh Convention Center", type: "convention_center", capacity: 10000, address: "King Fahd District", lat: 24.7275, lng: 46.6893, amenities: ["parking", "wifi", "av_equipment", "catering"], rating: 4.8 },
  { id: "ven_3", name: "National Museum", type: "museum", capacity: 2000, address: "King Faisal Road", lat: 24.6588, lng: 46.7273, amenities: ["guided_tours", "gift_shop", "cafe"], rating: 4.9 },
  { id: "ven_4", name: "Al-Bujairi Heritage Park", type: "park", capacity: 5000, address: "Ad Diriyah", lat: 24.7349, lng: 46.5726, amenities: ["parking", "restaurants", "wheelchair_access"], rating: 4.7 },
];

const registrationStore = new Map<string, Array<{ id: string; eventId: string; eventTitle: string; date: string; tickets: number; status: string; createdAt: string }>>();

router.get("/events", optionalAuth, async (req, res) => {
  const { category, query, limit } = req.query;
  const bff = await proxyToBff(`/events?category=${category || ""}&query=${query || ""}&limit=${limit || 20}`, "GET");
  if (bff.ok) { res.json({ success: true, data: bff.data }); return; }

  let filtered = FALLBACK_EVENTS;
  if (category) filtered = filtered.filter(e => e.category === category);
  if (query) { const q = String(query).toLowerCase(); filtered = filtered.filter(e => e.title.toLowerCase().includes(q) || e.tags.some(t => t.includes(q))); }
  res.json({ success: true, data: { events: filtered.slice(0, Number(limit) || 20), total: filtered.length, source: "fallback" } });
});

router.get("/events/:id", optionalAuth, async (req, res) => {
  const bff = await proxyToBff(`/events/${req.params.id}`, "GET");
  if (bff.ok) { res.json({ success: true, data: bff.data }); return; }
  const event = FALLBACK_EVENTS.find(e => e.id === req.params.id);
  if (event) res.json({ success: true, data: { event, source: "fallback" } });
  else res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Event not found" } });
});

router.get("/venues", optionalAuth, async (req, res) => {
  const { type } = req.query;
  const bff = await proxyToBff(`/venues?type=${type || ""}`, "GET");
  if (bff.ok) { res.json({ success: true, data: bff.data }); return; }

  let filtered = FALLBACK_VENUES;
  if (type) filtered = filtered.filter(v => v.type === type);
  res.json({ success: true, data: { venues: filtered, total: filtered.length, source: "fallback" } });
});

router.post("/registrations", optionalAuth, (req, res) => {
  const uid = getUserIdFromReq(req);
  const { eventId, tickets } = req.body;
  const event = FALLBACK_EVENTS.find(e => e.id === eventId);
  if (!event) { res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Event not found" } }); return; }

  const numTickets = Math.min(Number(tickets) || 1, 10);
  if (event.registered + numTickets > event.capacity) { res.status(400).json({ success: false, error: { code: "SOLD_OUT", message: "Not enough capacity" } }); return; }

  event.registered += numTickets;
  if (!registrationStore.has(uid)) registrationStore.set(uid, []);
  const reg = { id: "reg_" + Date.now(), eventId, eventTitle: event.title, date: event.date, tickets: numTickets, status: "confirmed", createdAt: new Date().toISOString() };
  registrationStore.get(uid)!.unshift(reg);
  res.json({ success: true, data: { registration: reg, source: "fallback" } });
});

router.get("/registrations", optionalAuth, (req, res) => {
  const uid = getUserIdFromReq(req);
  const regs = registrationStore.get(uid) || [];
  res.json({ success: true, data: { registrations: regs, total: regs.length } });
});

router.post("/registrations/:id/cancel", optionalAuth, (req, res) => {
  const uid = getUserIdFromReq(req);
  const regs = registrationStore.get(uid) || [];
  const reg = regs.find(r => r.id === req.params.id);
  if (!reg) { res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Registration not found" } }); return; }
  reg.status = "cancelled";
  const event = FALLBACK_EVENTS.find(e => e.id === reg.eventId);
  if (event) event.registered -= reg.tickets;
  res.json({ success: true, data: { registration: reg } });
});

export default router;
