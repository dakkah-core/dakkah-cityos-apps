import { Router } from "express";
import { optionalAuth, getUserIdFromReq } from "../middleware/auth";

const router = Router();

const BFF_GOVERNANCE_PORT = process.env.BFF_GOVERNANCE_PORT || 4004;
const BFF_HOST = process.env.BFF_HOST || "localhost";

async function proxyToBff(path: string, method: string, body?: unknown) {
  try {
    const url = `http://${BFF_HOST}:${BFF_GOVERNANCE_PORT}/api${path}`;
    const options: RequestInit = { method, headers: { "Content-Type": "application/json" }, signal: AbortSignal.timeout(5000) };
    if (body && method !== "GET") options.body = JSON.stringify(body);
    const res = await fetch(url, options);
    if (res.ok) return { ok: true, data: await res.json() };
    return { ok: false, data: null };
  } catch {
    return { ok: false, data: null };
  }
}

const FALLBACK_SERVICES = [
  { id: "svc_1", name: "Building Permit Application", category: "permits", description: "Apply for construction or renovation permits", avgProcessingDays: 14, fee: 500, currency: "SAR", onlineAvailable: true },
  { id: "svc_2", name: "Business License Renewal", category: "licenses", description: "Renew your commercial activity license", avgProcessingDays: 3, fee: 200, currency: "SAR", onlineAvailable: true },
  { id: "svc_3", name: "Birth Certificate", category: "civil_registry", description: "Request a birth certificate copy", avgProcessingDays: 1, fee: 50, currency: "SAR", onlineAvailable: true },
  { id: "svc_4", name: "Property Tax Assessment", category: "taxes", description: "Request property value assessment", avgProcessingDays: 21, fee: 0, currency: "SAR", onlineAvailable: false },
  { id: "svc_5", name: "Waste Collection Schedule", category: "utilities", description: "View or modify your waste collection schedule", avgProcessingDays: 0, fee: 0, currency: "SAR", onlineAvailable: true },
];

const FALLBACK_PROPOSALS = [
  { id: "prop_1", title: "Downtown Pedestrian Zone Expansion", status: "open", category: "urban_planning", description: "Proposal to extend the pedestrian-only zone in the downtown area", votesFor: 1245, votesAgainst: 342, comments: 89, deadline: "2026-04-15", author: "City Planning Commission" },
  { id: "prop_2", title: "Public WiFi in Parks", status: "open", category: "technology", description: "Install free public WiFi in all city parks and public spaces", votesFor: 2100, votesAgainst: 150, comments: 156, deadline: "2026-04-01", author: "Digital Services Dept" },
  { id: "prop_3", title: "Green Roof Mandate", status: "closed", category: "environment", description: "Require green roofs on all new commercial buildings over 5 stories", votesFor: 890, votesAgainst: 560, comments: 234, deadline: "2026-03-01", author: "Environment Committee" },
];

const FALLBACK_PERMITS = [
  { id: "pmt_1", type: "building", referenceNumber: "BLD-2026-0341", status: "approved", applicant: "Al-Rashid Construction", property: "Plot 42, King Fahd Road", submittedAt: "2026-02-15", approvedAt: "2026-03-01", expiresAt: "2027-03-01" },
  { id: "pmt_2", type: "event", referenceNumber: "EVT-2026-0128", status: "pending", applicant: "Riyadh Events Co", property: "King Abdullah Park", submittedAt: "2026-03-10", approvedAt: null, expiresAt: null },
  { id: "pmt_3", type: "commercial", referenceNumber: "COM-2026-0892", status: "under_review", applicant: "Startup Hub LLC", property: "Tech District, Block C", submittedAt: "2026-03-05", approvedAt: null, expiresAt: null },
];

const reportStore = new Map<string, Array<{ id: string; type: string; description: string; location: string; status: string; createdAt: string }>>();

router.get("/services", optionalAuth, async (req, res) => {
  const { category } = req.query;
  const bff = await proxyToBff(`/services?category=${category || ""}`, "GET");
  if (bff.ok) { res.json({ success: true, data: bff.data }); return; }

  let filtered = FALLBACK_SERVICES;
  if (category) filtered = filtered.filter(s => s.category === category);
  res.json({ success: true, data: { services: filtered, total: filtered.length, source: "fallback" } });
});

router.get("/proposals", optionalAuth, async (req, res) => {
  const { status } = req.query;
  const bff = await proxyToBff(`/proposals?status=${status || ""}`, "GET");
  if (bff.ok) { res.json({ success: true, data: bff.data }); return; }

  let filtered = FALLBACK_PROPOSALS;
  if (status) filtered = filtered.filter(p => p.status === status);
  res.json({ success: true, data: { proposals: filtered, total: filtered.length, source: "fallback" } });
});

router.post("/proposals/:id/vote", optionalAuth, (req, res) => {
  const { vote } = req.body;
  const proposal = FALLBACK_PROPOSALS.find(p => p.id === req.params.id);
  if (!proposal) { res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Proposal not found" } }); return; }
  if (vote === "for") proposal.votesFor++;
  else proposal.votesAgainst++;
  res.json({ success: true, data: { proposal } });
});

router.get("/permits", optionalAuth, async (req, res) => {
  const { status, type } = req.query;
  const bff = await proxyToBff(`/permits?status=${status || ""}&type=${type || ""}`, "GET");
  if (bff.ok) { res.json({ success: true, data: bff.data }); return; }

  let filtered = FALLBACK_PERMITS;
  if (status) filtered = filtered.filter(p => p.status === status);
  if (type) filtered = filtered.filter(p => p.type === type);
  res.json({ success: true, data: { permits: filtered, total: filtered.length, source: "fallback" } });
});

router.post("/reports", optionalAuth, (req, res) => {
  const uid = getUserIdFromReq(req);
  const { type, description, location } = req.body;
  if (!type || !description) { res.status(400).json({ success: false, error: { code: "VALIDATION_ERROR", message: "type and description required" } }); return; }

  if (!reportStore.has(uid)) reportStore.set(uid, []);
  const report = { id: "rpt_" + Date.now(), type, description, location: location || "Not specified", status: "submitted", createdAt: new Date().toISOString() };
  reportStore.get(uid)!.unshift(report);
  res.json({ success: true, data: { report, source: "fallback" } });
});

router.get("/reports", optionalAuth, (req, res) => {
  const uid = getUserIdFromReq(req);
  const reports = reportStore.get(uid) || [];
  res.json({ success: true, data: { reports, total: reports.length } });
});

export default router;
