import { Router, type Request } from "express";
import { requireAuth, requireRole, type AuthenticatedRequest } from "../middleware/auth";

const DRIVER_ROLES = ["driver", "courier", "fleet_driver", "field_agent"];

const router = Router();

interface DriverJob {
  id: string;
  type: "delivery" | "pickup" | "return";
  status: "pending" | "accepted" | "in_transit" | "arrived" | "completed" | "cancelled";
  customer: { name: string; phone: string; address: string; lat: number; lng: number };
  pickup: { name: string; address: string; lat: number; lng: number };
  items: { name: string; quantity: number; barcode: string }[];
  estimatedDistance: string;
  estimatedDuration: string;
  payout: number;
  currency: string;
  createdAt: string;
  notes?: string;
}

interface DriverPosition {
  driverId: string;
  lat: number;
  lng: number;
  heading: number;
  speed: number;
  timestamp: number;
}

const driverStatuses = new Map<string, "online" | "offline" | "break">();
const driverPositions = new Map<string, DriverPosition>();
const activeJobs = new Map<string, DriverJob[]>();
const offlineQueue = new Map<string, Array<{ action: string; payload: Record<string, unknown>; timestamp: number }>>();

function generateMockJobs(): DriverJob[] {
  return [
    {
      id: "job_" + Date.now() + "_1",
      type: "delivery",
      status: "pending",
      customer: { name: "Ahmad Al-Rashid", phone: "+966501234567", address: "King Fahd Road, Building 42, Riyadh", lat: 24.7136, lng: 46.6753 },
      pickup: { name: "Al-Medina Fresh Market", address: "Olaya Street 15, Riyadh", lat: 24.7275, lng: 46.6893 },
      items: [
        { name: "Organic Produce Box", quantity: 1, barcode: "6281234567890" },
        { name: "Artisan Bread Basket", quantity: 2, barcode: "6281234567891" },
      ],
      estimatedDistance: "8.2 km",
      estimatedDuration: "18 min",
      payout: 28.50,
      currency: "SAR",
      createdAt: new Date().toISOString(),
      notes: "Leave at door, ring bell twice",
    },
    {
      id: "job_" + Date.now() + "_2",
      type: "delivery",
      status: "pending",
      customer: { name: "Sara Mohammed", phone: "+966509876543", address: "Al-Malaz District, Villa 8, Riyadh", lat: 24.6588, lng: 46.7273 },
      pickup: { name: "Heritage Spices", address: "Al-Batha Old Market, Riyadh", lat: 24.6286, lng: 46.7128 },
      items: [
        { name: "Premium Spice Set", quantity: 1, barcode: "6281234567892" },
      ],
      estimatedDistance: "5.4 km",
      estimatedDuration: "12 min",
      payout: 22.00,
      currency: "SAR",
      createdAt: new Date().toISOString(),
    },
  ];
}

router.get("/transport/driver/status", requireAuth, requireRole(...DRIVER_ROLES), (req, res) => {
  const driverId = (req as AuthenticatedRequest).userId!;
  const status = driverStatuses.get(driverId) || "offline";
  const jobs = activeJobs.get(driverId) || [];
  const position = driverPositions.get(driverId);

  res.json({
    success: true,
    data: {
      driverId,
      status,
      activeJobs: jobs.filter((j) => j.status !== "completed" && j.status !== "cancelled"),
      completedToday: jobs.filter((j) => j.status === "completed").length,
      position,
    },
  });
});

router.post("/transport/driver/status", requireAuth, requireRole(...DRIVER_ROLES), (req, res) => {
  const driverId = (req as AuthenticatedRequest).userId!;
  const { status } = req.body as { status: "online" | "offline" | "break" };

  if (!["online", "offline", "break"].includes(status)) {
    res.status(400).json({ success: false, error: { code: "INVALID_STATUS", message: "Status must be online, offline, or break" } });
    return;
  }

  driverStatuses.set(driverId, status);

  if (status === "online" && (!activeJobs.has(driverId) || activeJobs.get(driverId)!.length === 0)) {
    activeJobs.set(driverId, generateMockJobs());
  }

  res.json({
    success: true,
    data: {
      driverId,
      status,
      availableJobs: status === "online" ? (activeJobs.get(driverId) || []).filter((j) => j.status === "pending").length : 0,
    },
  });
});

router.get("/transport/driver/jobs", requireAuth, requireRole(...DRIVER_ROLES), (req, res) => {
  const driverId = (req as AuthenticatedRequest).userId!;
  let jobs = activeJobs.get(driverId);

  if (!jobs || jobs.length === 0) {
    jobs = generateMockJobs();
    activeJobs.set(driverId, jobs);
  }

  const statusFilter = req.query.status as string | undefined;
  const filtered = statusFilter ? jobs.filter((j) => j.status === statusFilter) : jobs;

  res.json({ success: true, data: { jobs: filtered, total: filtered.length } });
});

router.get("/transport/driver/jobs/:jobId", requireAuth, requireRole(...DRIVER_ROLES), (req, res) => {
  const driverId = (req as AuthenticatedRequest).userId!;
  const jobs = activeJobs.get(driverId) || [];
  const job = jobs.find((j) => j.id === req.params.jobId);

  if (!job) {
    res.status(404).json({ success: false, error: { code: "JOB_NOT_FOUND", message: "Job not found" } });
    return;
  }

  res.json({ success: true, data: { job } });
});

router.post("/transport/driver/jobs/:jobId/accept", requireAuth, requireRole(...DRIVER_ROLES), (req, res) => {
  const driverId = (req as AuthenticatedRequest).userId!;
  const jobs = activeJobs.get(driverId) || [];
  const job = jobs.find((j) => j.id === req.params.jobId);

  if (!job) {
    res.status(404).json({ success: false, error: { code: "JOB_NOT_FOUND", message: "Job not found" } });
    return;
  }

  if (job.status !== "pending") {
    res.status(400).json({ success: false, error: { code: "INVALID_STATE", message: `Cannot accept job in ${job.status} status` } });
    return;
  }

  job.status = "accepted";
  res.json({ success: true, data: { job } });
});

router.post("/transport/driver/jobs/:jobId/reject", requireAuth, requireRole(...DRIVER_ROLES), (req, res) => {
  const driverId = (req as AuthenticatedRequest).userId!;
  const jobs = activeJobs.get(driverId) || [];
  const job = jobs.find((j) => j.id === req.params.jobId);

  if (!job) {
    res.status(404).json({ success: false, error: { code: "JOB_NOT_FOUND", message: "Job not found" } });
    return;
  }

  job.status = "cancelled";
  res.json({ success: true, data: { job } });
});

router.post("/transport/driver/jobs/:jobId/pickup", requireAuth, requireRole(...DRIVER_ROLES), (req, res) => {
  const driverId = (req as AuthenticatedRequest).userId!;
  const jobs = activeJobs.get(driverId) || [];
  const job = jobs.find((j) => j.id === req.params.jobId);

  if (!job) {
    res.status(404).json({ success: false, error: { code: "JOB_NOT_FOUND", message: "Job not found" } });
    return;
  }

  if (job.status !== "accepted") {
    res.status(400).json({ success: false, error: { code: "INVALID_STATE", message: `Cannot mark pickup for job in ${job.status} status` } });
    return;
  }

  const { scannedBarcodes } = req.body as { scannedBarcodes?: string[] };
  job.status = "in_transit";

  res.json({
    success: true,
    data: {
      job,
      verification: {
        itemsVerified: scannedBarcodes?.length || 0,
        totalItems: job.items.length,
        allVerified: (scannedBarcodes?.length || 0) >= job.items.length,
      },
    },
  });
});

router.post("/transport/driver/jobs/:jobId/arrive", requireAuth, requireRole(...DRIVER_ROLES), (req, res) => {
  const driverId = (req as AuthenticatedRequest).userId!;
  const jobs = activeJobs.get(driverId) || [];
  const job = jobs.find((j) => j.id === req.params.jobId);

  if (!job) {
    res.status(404).json({ success: false, error: { code: "JOB_NOT_FOUND", message: "Job not found" } });
    return;
  }

  job.status = "arrived";
  res.json({ success: true, data: { job } });
});

router.post("/transport/driver/jobs/:jobId/complete", requireAuth, requireRole(...DRIVER_ROLES), (req, res) => {
  const driverId = (req as AuthenticatedRequest).userId!;
  const jobs = activeJobs.get(driverId) || [];
  const job = jobs.find((j) => j.id === req.params.jobId);

  if (!job) {
    res.status(404).json({ success: false, error: { code: "JOB_NOT_FOUND", message: "Job not found" } });
    return;
  }

  const { proofType, signatureData, photoUri, recipientName } = req.body as {
    proofType: "signature" | "photo" | "both";
    signatureData?: string;
    photoUri?: string;
    recipientName?: string;
  };

  job.status = "completed";

  res.json({
    success: true,
    data: {
      job,
      proof: { proofType, hasSignature: !!signatureData, hasPhoto: !!photoUri, recipientName },
      earnings: { amount: job.payout, currency: job.currency, paidAt: new Date().toISOString() },
    },
  });
});

router.post("/transport/driver/position", requireAuth, requireRole(...DRIVER_ROLES), (req, res) => {
  const driverId = (req as AuthenticatedRequest).userId!;
  const { lat, lng, heading, speed } = req.body as { lat: number; lng: number; heading: number; speed: number };

  driverPositions.set(driverId, { driverId, lat, lng, heading, speed, timestamp: Date.now() });

  res.json({ success: true, data: { received: true } });
});

router.get("/transport/driver/earnings", requireAuth, requireRole(...DRIVER_ROLES), (req, res) => {
  const driverId = (req as AuthenticatedRequest).userId!;
  const period = (req.query.period as string) || "today";

  const earnings = {
    today: { amount: 285.50, trips: 12, hours: 6.5, currency: "SAR" },
    week: { amount: 1842.00, trips: 78, hours: 38.5, currency: "SAR" },
    month: { amount: 7250.00, trips: 312, hours: 156, currency: "SAR" },
  };

  const data = earnings[period as keyof typeof earnings] || earnings.today;

  res.json({
    success: true,
    data: {
      ...data,
      period,
      driverId,
      history: [
        { date: "2026-03-16", amount: 285.50, trips: 12, hours: 6.5 },
        { date: "2026-03-15", amount: 312.00, trips: 14, hours: 7.2 },
        { date: "2026-03-14", amount: 198.50, trips: 9, hours: 5.0 },
        { date: "2026-03-13", amount: 345.00, trips: 15, hours: 8.0 },
        { date: "2026-03-12", amount: 267.00, trips: 11, hours: 6.0 },
        { date: "2026-03-11", amount: 224.00, trips: 10, hours: 5.5 },
        { date: "2026-03-10", amount: 210.00, trips: 7, hours: 5.3 },
      ],
    },
  });
});

router.post("/transport/driver/inspection", requireAuth, requireRole(...DRIVER_ROLES), (req, res) => {
  const driverId = (req as AuthenticatedRequest).userId!;
  const { vehicleId, checks } = req.body as {
    vehicleId: string;
    checks: Array<{ item: string; passed: boolean; notes?: string }>;
  };

  const allPassed = checks.every((c) => c.passed);

  res.json({
    success: true,
    data: {
      inspectionId: "insp_" + Date.now(),
      vehicleId,
      driverId,
      allPassed,
      checkedItems: checks.length,
      failedItems: checks.filter((c) => !c.passed).map((c) => c.item),
      completedAt: new Date().toISOString(),
      canDrive: allPassed,
    },
  });
});

router.post("/transport/driver/sos", requireAuth, requireRole(...DRIVER_ROLES), (req, res) => {
  const driverId = (req as AuthenticatedRequest).userId!;
  const { type, location, message } = req.body as {
    type: "accident" | "breakdown" | "threat" | "medical" | "other";
    location?: { lat: number; lng: number };
    message?: string;
  };

  res.json({
    success: true,
    data: {
      sosId: "sos_" + Date.now(),
      driverId,
      type,
      location,
      message,
      status: "dispatched",
      respondedAt: new Date().toISOString(),
      estimatedResponse: "5 min",
      emergencyContact: "+966911",
    },
  });
});

router.post("/transport/driver/sync", requireAuth, requireRole(...DRIVER_ROLES), (req, res) => {
  const driverId = (req as AuthenticatedRequest).userId!;
  const { actions } = req.body as { actions: Array<{ action: string; payload: Record<string, unknown>; timestamp: number }> };

  const results = (actions || []).map((a) => ({
    action: a.action,
    timestamp: a.timestamp,
    synced: true,
  }));

  offlineQueue.delete(driverId);

  res.json({
    success: true,
    data: {
      synced: results.length,
      results,
      serverTime: Date.now(),
    },
  });
});

export default router;
