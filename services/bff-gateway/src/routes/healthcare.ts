import { Router } from "express";
import { optionalAuth, getUserIdFromReq } from "../middleware/auth";

const router = Router();

const BFF_HEALTHCARE_PORT = process.env.BFF_HEALTHCARE_PORT || 4003;
const BFF_HOST = process.env.BFF_HOST || "localhost";

async function proxyToBff(path: string, method: string, body?: unknown) {
  try {
    const url = `http://${BFF_HOST}:${BFF_HEALTHCARE_PORT}/api${path}`;
    const options: RequestInit = { method, headers: { "Content-Type": "application/json" }, signal: AbortSignal.timeout(5000) };
    if (body && method !== "GET") options.body = JSON.stringify(body);
    const res = await fetch(url, options);
    if (res.ok) return { ok: true, data: await res.json() };
    return { ok: false, data: null };
  } catch {
    return { ok: false, data: null };
  }
}

const FALLBACK_PRACTITIONERS = [
  { id: "doc_1", name: "Dr. Fatima Al-Zahrani", specialty: "General Medicine", facility: "King Fahd Medical City", rating: 4.9, availableSlots: 3, languages: ["ar", "en"], image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=300" },
  { id: "doc_2", name: "Dr. Omar Khalid", specialty: "Cardiology", facility: "Riyadh Heart Center", rating: 4.8, availableSlots: 1, languages: ["ar", "en", "fr"], image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=300" },
  { id: "doc_3", name: "Dr. Nora Mansour", specialty: "Dermatology", facility: "Al-Habib Medical Group", rating: 4.7, availableSlots: 5, languages: ["ar", "en"] },
  { id: "doc_4", name: "Dr. Abdullah Saeed", specialty: "Orthopedics", facility: "King Faisal Specialist Hospital", rating: 4.9, availableSlots: 2, languages: ["ar", "en"] },
  { id: "doc_5", name: "Dr. Layla Hassan", specialty: "Pediatrics", facility: "Riyadh Care Hospital", rating: 4.6, availableSlots: 4, languages: ["ar", "en"] },
];

const FALLBACK_FACILITIES = [
  { id: "fac_1", name: "King Fahd Medical City", type: "hospital", address: "Ar Rimal, Riyadh", lat: 24.6958, lng: 46.7134, phone: "+966114424444", rating: 4.8, services: ["emergency", "surgery", "pharmacy", "radiology"], openNow: true },
  { id: "fac_2", name: "Al-Habib Medical Group", type: "clinic", address: "Olaya District, Riyadh", lat: 24.7136, lng: 46.6753, phone: "+966112614444", rating: 4.7, services: ["general", "dental", "dermatology", "lab"], openNow: true },
  { id: "fac_3", name: "Riyadh Heart Center", type: "specialty", address: "King Fahd Road, Riyadh", lat: 24.7275, lng: 46.6893, phone: "+966114882000", rating: 4.9, services: ["cardiology", "cardiac_surgery", "rehabilitation"], openNow: true },
  { id: "fac_4", name: "Green Crescent Pharmacy", type: "pharmacy", address: "Al-Malaz, Riyadh", lat: 24.6588, lng: 46.7273, phone: "+966114777888", rating: 4.5, services: ["prescription", "otc", "vaccines"], openNow: true },
];

const appointmentStore = new Map<string, Array<{ id: string; practitionerId: string; practitionerName: string; specialty: string; facility: string; date: string; time: string; status: string; type: string; notes?: string; createdAt: string }>>();

router.get("/practitioners", optionalAuth, async (req, res) => {
  const { specialty, query, limit } = req.query;
  const bff = await proxyToBff(`/practitioners?specialty=${specialty || ""}&query=${query || ""}&limit=${limit || 20}`, "GET");
  if (bff.ok) { res.json({ success: true, data: bff.data }); return; }

  let filtered = FALLBACK_PRACTITIONERS;
  if (specialty) filtered = filtered.filter(p => p.specialty.toLowerCase().includes(String(specialty).toLowerCase()));
  if (query) { const q = String(query).toLowerCase(); filtered = filtered.filter(p => p.name.toLowerCase().includes(q) || p.specialty.toLowerCase().includes(q)); }
  res.json({ success: true, data: { practitioners: filtered.slice(0, Number(limit) || 20), total: filtered.length, source: "fallback" } });
});

router.get("/practitioners/:id", optionalAuth, async (req, res) => {
  const bff = await proxyToBff(`/practitioners/${req.params.id}`, "GET");
  if (bff.ok) { res.json({ success: true, data: bff.data }); return; }
  const doc = FALLBACK_PRACTITIONERS.find(p => p.id === req.params.id);
  if (doc) res.json({ success: true, data: { practitioner: doc, source: "fallback" } });
  else res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Practitioner not found" } });
});

router.get("/facilities", optionalAuth, async (req, res) => {
  const { type, query } = req.query;
  const bff = await proxyToBff(`/facilities?type=${type || ""}&query=${query || ""}`, "GET");
  if (bff.ok) { res.json({ success: true, data: bff.data }); return; }

  let filtered = FALLBACK_FACILITIES;
  if (type) filtered = filtered.filter(f => f.type === type);
  if (query) { const q = String(query).toLowerCase(); filtered = filtered.filter(f => f.name.toLowerCase().includes(q)); }
  res.json({ success: true, data: { facilities: filtered, total: filtered.length, source: "fallback" } });
});

router.get("/appointments", optionalAuth, (req, res) => {
  const uid = getUserIdFromReq(req);
  const appointments = appointmentStore.get(uid) || [];
  res.json({ success: true, data: { appointments, total: appointments.length } });
});

router.post("/appointments", optionalAuth, async (req, res) => {
  const uid = getUserIdFromReq(req);
  const { practitionerId, date, time, type, notes } = req.body;
  const doc = FALLBACK_PRACTITIONERS.find(p => p.id === practitionerId);
  if (!doc) { res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Practitioner not found" } }); return; }

  const bff = await proxyToBff("/appointments", "POST", req.body);
  if (bff.ok) { res.json({ success: true, data: bff.data }); return; }

  if (!appointmentStore.has(uid)) appointmentStore.set(uid, []);
  const apt = { id: "apt_" + Date.now(), practitionerId, practitionerName: doc.name, specialty: doc.specialty, facility: doc.facility, date, time, status: "confirmed", type: type || "in_person", notes, createdAt: new Date().toISOString() };
  appointmentStore.get(uid)!.unshift(apt);
  res.json({ success: true, data: { appointment: apt, source: "fallback" } });
});

router.post("/appointments/:id/cancel", optionalAuth, (req, res) => {
  const uid = getUserIdFromReq(req);
  const appointments = appointmentStore.get(uid) || [];
  const apt = appointments.find(a => a.id === req.params.id);
  if (!apt) { res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Appointment not found" } }); return; }
  apt.status = "cancelled";
  res.json({ success: true, data: { appointment: apt } });
});

export default router;
