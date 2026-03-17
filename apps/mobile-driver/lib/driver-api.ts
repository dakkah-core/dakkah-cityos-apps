import type {
  DriverJob, DriverStatus, DriverEarnings, InspectionCheck, InspectionResult,
  SOSReport, OfflineAction, DriverProfile, ShiftSummary, InspectionHistoryEntry,
  Vehicle, JobOffer, TripEarning, EarningsDayBreakdown,
} from "@/types/driver";
import { apiClient } from "@cityos/mobile-core";

const IS_DEV = process.env.NODE_ENV !== "production";

interface DriverStatusResponse {
  driverId: string;
  status: DriverStatus;
  activeJobs: DriverJob[];
  completedToday: number;
  todayEarnings: number;
  todayTips: number;
  currency: string;
}

interface StatusUpdateResponse {
  driverId: string;
  status: DriverStatus;
  availableJobs: number;
}

interface PickupVerification {
  job: DriverJob;
  verification: { itemsVerified: number; totalItems: number; allVerified: boolean };
}

interface DeliveryCompletion {
  job: DriverJob;
  earnings: { amount: number; currency: string; paidAt: string };
}

interface SosResponse {
  sosId: string;
  status: string;
  estimatedResponse: string;
  emergencyContact: string;
}

const MOCK_JOBS: DriverJob[] = [
  {
    id: "job-001",
    type: "delivery",
    status: "pending",
    customer: { name: "Ahmed Al-Rashidi", phone: "+966 55 123 4567", address: "King Fahd Road, Tower 5, Apt 12B", lat: 24.7236, lng: 46.6853, avatar: undefined, notes: "Ring doorbell twice" },
    pickup: { name: "Nando's - Olaya", address: "Olaya Street 234, Riyadh", lat: 24.7136, lng: 46.6753, contactPhone: "+966 11 222 3333" },
    items: [
      { name: "Grilled Chicken Platter", quantity: 2, barcode: "NDO-2024-001", description: "Full chicken with 2 sides", weight: "1.2kg" },
      { name: "Peri-Peri Fries (L)", quantity: 1, barcode: "NDO-2024-002", description: "Large portion" },
      { name: "Sprite 330ml", quantity: 3, barcode: "NDO-2024-003" },
    ],
    estimatedDistance: "4.2 km",
    estimatedDuration: "12 min",
    payout: 18.50,
    tip: 5,
    currency: "SAR",
    createdAt: new Date(Date.now() - 120000).toISOString(),
    deliveryInstructions: "Leave at door if no answer. Building has gate code: 4521#",
    priority: "normal",
  },
  {
    id: "job-002",
    type: "delivery",
    status: "pending",
    customer: { name: "Sara Mohammed", phone: "+966 55 987 6543", address: "Al Malqa District, Villa 8", lat: 24.8012, lng: 46.6290 },
    pickup: { name: "Jarir Bookstore - Panorama", address: "Tahlia Street, Panorama Mall", lat: 24.6988, lng: 46.6851, contactPhone: "+966 11 460 0000" },
    items: [
      { name: "iPad Air Case", quantity: 1, barcode: "JAR-2024-101", description: "Black leather folio" },
      { name: "Apple Pencil Tips (4-pack)", quantity: 1, barcode: "JAR-2024-102" },
    ],
    estimatedDistance: "11.3 km",
    estimatedDuration: "22 min",
    payout: 32.00,
    currency: "SAR",
    createdAt: new Date(Date.now() - 60000).toISOString(),
    priority: "urgent",
  },
  {
    id: "job-003",
    type: "pickup",
    status: "pending",
    customer: { name: "Khalid bin Waleed", phone: "+966 50 111 2222", address: "Return Warehouse, Industrial City", lat: 24.6500, lng: 46.7100 },
    pickup: { name: "Customer Location", address: "Al Worood, Building 3, Floor 2", lat: 24.7350, lng: 46.6600 },
    items: [
      { name: "Defective Monitor", quantity: 1, barcode: "RET-2024-301", description: "23-inch LCD, warranty return" },
    ],
    estimatedDistance: "8.7 km",
    estimatedDuration: "18 min",
    payout: 15.00,
    currency: "SAR",
    createdAt: new Date(Date.now() - 300000).toISOString(),
    priority: "normal",
  },
];

function makeMockEarnings(period: "today" | "week" | "month"): DriverEarnings {
  const days = period === "today" ? 1 : period === "week" ? 7 : 30;
  const baseAmount = period === "today" ? 145.50 : period === "week" ? 892.75 : 3420.00;
  const trips = period === "today" ? 8 : period === "week" ? 47 : 186;
  const hours = period === "today" ? 6.5 : period === "week" ? 38 : 152;
  const tips = period === "today" ? 32 : period === "week" ? 185 : 720;

  const history: EarningsDayBreakdown[] = [];
  for (let i = 0; i < Math.min(days, 14); i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dayAmount = 80 + Math.random() * 120;
    history.push({
      date: d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }),
      amount: Math.round(dayAmount * 100) / 100,
      trips: Math.floor(5 + Math.random() * 8),
      hours: Math.round((4 + Math.random() * 5) * 10) / 10,
      tips: Math.round(Math.random() * 50 * 100) / 100,
    });
  }

  const recentTrips: TripEarning[] = [];
  const types: Array<"delivery" | "pickup" | "return"> = ["delivery", "pickup", "return"];
  const names = ["Ahmed", "Sara", "Khalid", "Fatima", "Omar", "Layla", "Youssef", "Nora"];
  for (let i = 0; i < 10; i++) {
    const t = new Date();
    t.setMinutes(t.getMinutes() - i * 45);
    recentTrips.push({
      id: `trip-${i}`,
      jobId: `job-trip-${i}`,
      type: types[i % 3],
      customerName: names[i % names.length],
      amount: Math.round((12 + Math.random() * 30) * 100) / 100,
      tip: Math.random() > 0.4 ? Math.round(Math.random() * 15 * 100) / 100 : 0,
      distance: `${(2 + Math.random() * 15).toFixed(1)} km`,
      completedAt: t.toISOString(),
    });
  }

  return {
    amount: baseAmount,
    trips,
    hours,
    tips,
    currency: "SAR",
    period,
    dailyGoal: 200,
    goalProgress: period === "today" ? baseAmount / 200 : 1,
    history,
    recentTrips,
  };
}

const MOCK_PROFILE: DriverProfile = {
  id: "drv-001",
  name: "Mohammed Al-Fahad",
  phone: "+966 55 000 1234",
  email: "m.alfahad@dakkah.city",
  rating: 4.87,
  totalTrips: 1247,
  memberSince: "2024-03-15",
  vehicle: { id: "veh-001", name: "Toyota HiLux", plateNumber: "ABC 1234", type: "Pickup Truck", year: 2023 },
  preferences: { navigationApp: "google", notificationsEnabled: true, soundEnabled: true, language: "en" },
};

const MOCK_VEHICLES: Vehicle[] = [
  { id: "veh-001", name: "Toyota HiLux", plateNumber: "ABC 1234", type: "Pickup Truck", year: 2023 },
  { id: "veh-002", name: "Hyundai Staria", plateNumber: "XYZ 5678", type: "Van", year: 2024 },
];

const MOCK_INSPECTION_HISTORY: InspectionHistoryEntry[] = [
  { id: "insp-01", vehicleId: "veh-001", vehicleName: "Toyota HiLux", date: new Date(Date.now() - 86400000).toLocaleDateString(), allPassed: true, failedCount: 0, totalChecks: 12 },
  { id: "insp-02", vehicleId: "veh-001", vehicleName: "Toyota HiLux", date: new Date(Date.now() - 86400000 * 3).toLocaleDateString(), allPassed: false, failedCount: 2, totalChecks: 12 },
  { id: "insp-03", vehicleId: "veh-002", vehicleName: "Hyundai Staria", date: new Date(Date.now() - 86400000 * 5).toLocaleDateString(), allPassed: true, failedCount: 0, totalChecks: 12 },
];

const MOCK_SHIFTS: ShiftSummary[] = [
  { date: "Today", startTime: "08:00 AM", endTime: "—", hoursOnline: 6.5, trips: 8, earnings: 145.50 },
  { date: "Yesterday", startTime: "07:30 AM", endTime: "04:15 PM", hoursOnline: 7.2, trips: 11, earnings: 198.75 },
  { date: "Mar 15", startTime: "09:00 AM", endTime: "05:30 PM", hoursOnline: 6.8, trips: 9, earnings: 167.00 },
  { date: "Mar 14", startTime: "06:45 AM", endTime: "03:00 PM", hoursOnline: 7.5, trips: 12, earnings: 210.25 },
];

export async function getDriverStatus(_accessToken?: string): Promise<{
  driverId: string;
  status: DriverStatus;
  activeJobs: DriverJob[];
  completedToday: number;
  todayEarnings: number;
  todayTips: number;
  currency: string;
} | null> {
  try {
    const data = await apiClient.get<{ success: boolean; data?: DriverStatusResponse }>("/transport/driver/status");
    return data.success ? data.data ?? null : null;
  } catch {
    return {
      driverId: "drv-001",
      status: "offline",
      activeJobs: MOCK_JOBS,
      completedToday: 5,
      todayEarnings: 145.50,
      todayTips: 32,
      currency: "SAR",
    };
  }
}

export async function setDriverStatus(status: DriverStatus, _accessToken?: string): Promise<{
  driverId: string;
  status: DriverStatus;
  availableJobs: number;
} | null> {
  try {
    const data = await apiClient.post<{ success: boolean; data?: StatusUpdateResponse }>("/transport/driver/status", { status });
    return data.success ? data.data ?? null : null;
  } catch {
    return { driverId: "drv-001", status, availableJobs: MOCK_JOBS.length };
  }
}

export async function getDriverJobs(statusFilter?: string, _accessToken?: string): Promise<DriverJob[]> {
  try {
    const query = statusFilter ? `?status=${statusFilter}` : "";
    const data = await apiClient.get<{ success: boolean; data?: { jobs: DriverJob[] } }>(`/transport/driver/jobs${query}`);
    return data.success ? data.data?.jobs ?? [] : [];
  } catch {
    if (statusFilter) return MOCK_JOBS.filter((j) => j.status === statusFilter);
    return MOCK_JOBS;
  }
}

export async function getJob(jobId: string, _accessToken?: string): Promise<DriverJob | null> {
  try {
    const data = await apiClient.get<{ success: boolean; data?: { job: DriverJob } }>(`/transport/driver/jobs/${jobId}`);
    return data.success ? data.data?.job ?? null : null;
  } catch {
    return MOCK_JOBS.find((j) => j.id === jobId) ?? null;
  }
}

export async function acceptJob(jobId: string, _accessToken?: string): Promise<DriverJob | null> {
  try {
    const data = await apiClient.post<{ success: boolean; data?: { job: DriverJob } }>(`/transport/driver/jobs/${jobId}/accept`);
    return data.success ? data.data?.job ?? null : null;
  } catch {
    const job = MOCK_JOBS.find((j) => j.id === jobId);
    if (job) return { ...job, status: "accepted", acceptedAt: new Date().toISOString() };
    return null;
  }
}

export async function rejectJob(jobId: string, _accessToken?: string): Promise<boolean> {
  try {
    const data = await apiClient.post<{ success: boolean }>(`/transport/driver/jobs/${jobId}/reject`);
    return data.success;
  } catch {
    if (IS_DEV) return true;
    return false;
  }
}

export async function confirmPickup(jobId: string, scannedBarcodes: string[], _accessToken?: string): Promise<{
  job: DriverJob;
  verification: { itemsVerified: number; totalItems: number; allVerified: boolean };
} | null> {
  try {
    const data = await apiClient.post<{ success: boolean; data?: PickupVerification }>(`/transport/driver/jobs/${jobId}/pickup`, { scannedBarcodes });
    return data.success ? data.data ?? null : null;
  } catch {
    const job = MOCK_JOBS.find((j) => j.id === jobId);
    if (job) return { job: { ...job, status: "in_transit", pickedUpAt: new Date().toISOString() }, verification: { itemsVerified: scannedBarcodes.length, totalItems: job.items.length, allVerified: true } };
    return null;
  }
}

export async function markArrived(jobId: string, _accessToken?: string): Promise<DriverJob | null> {
  try {
    const data = await apiClient.post<{ success: boolean; data?: { job: DriverJob } }>(`/transport/driver/jobs/${jobId}/arrive`);
    return data.success ? data.data?.job ?? null : null;
  } catch {
    const job = MOCK_JOBS.find((j) => j.id === jobId);
    if (job) return { ...job, status: "arrived" };
    return null;
  }
}

export async function completeDelivery(
  jobId: string,
  proof: { proofType: "signature" | "photo" | "both"; signatureData?: string; photoUri?: string; recipientName?: string },
  _accessToken?: string,
): Promise<{
  job: DriverJob;
  earnings: { amount: number; currency: string; paidAt: string };
} | null> {
  try {
    const data = await apiClient.post<{ success: boolean; data?: DeliveryCompletion }>(`/transport/driver/jobs/${jobId}/complete`, proof);
    return data.success ? data.data ?? null : null;
  } catch {
    const job = MOCK_JOBS.find((j) => j.id === jobId);
    if (job) return { job: { ...job, status: "completed", deliveredAt: new Date().toISOString() }, earnings: { amount: job.payout, currency: job.currency, paidAt: new Date().toISOString() } };
    return null;
  }
}

export async function reportPosition(
  position: { lat: number; lng: number; heading: number; speed: number },
  _accessToken?: string,
): Promise<boolean> {
  try {
    const data = await apiClient.post<{ success: boolean }>("/transport/driver/position", position);
    return data.success;
  } catch {
    if (IS_DEV) return true;
    return false;
  }
}

export async function getEarnings(period: "today" | "week" | "month" = "today", _accessToken?: string): Promise<DriverEarnings | null> {
  try {
    const data = await apiClient.get<{ success: boolean; data?: DriverEarnings }>(`/transport/driver/earnings?period=${period}`);
    if (data.success && data.data) {
      return {
        ...data.data,
        tips: data.data.tips ?? 0,
        dailyGoal: data.data.dailyGoal ?? 200,
        goalProgress: data.data.goalProgress ?? 0,
        recentTrips: data.data.recentTrips ?? [],
      };
    }
    return makeMockEarnings(period);
  } catch {
    return makeMockEarnings(period);
  }
}

export async function submitInspection(vehicleId: string, checks: InspectionCheck[], _accessToken?: string): Promise<InspectionResult | null> {
  try {
    const data = await apiClient.post<{ success: boolean; data?: InspectionResult }>("/transport/driver/inspection", { vehicleId, checks });
    return data.success ? data.data ?? null : null;
  } catch {
    const failed = checks.filter((c) => !c.passed).map((c) => c.item);
    return {
      inspectionId: `insp-${Date.now()}`,
      vehicleId,
      allPassed: failed.length === 0,
      checkedItems: checks.length,
      failedItems: failed,
      completedAt: new Date().toISOString(),
      canDrive: failed.length <= 1,
    };
  }
}

export async function sendSOS(report: SOSReport, _accessToken?: string): Promise<{
  sosId: string;
  status: string;
  estimatedResponse: string;
  emergencyContact: string;
} | null> {
  try {
    const data = await apiClient.post<{ success: boolean; data?: SosResponse }>("/transport/driver/sos", report);
    return data.success ? data.data ?? null : null;
  } catch {
    return { sosId: `sos-${Date.now()}`, status: "dispatched", estimatedResponse: "3-5 minutes", emergencyContact: "911" };
  }
}

export async function syncOfflineActions(actions: OfflineAction[], _accessToken?: string): Promise<boolean> {
  try {
    const data = await apiClient.post<{ success: boolean }>("/transport/driver/sync", { actions });
    return data.success;
  } catch {
    return false;
  }
}

export async function getDriverProfile(_accessToken?: string): Promise<DriverProfile | null> {
  try {
    const data = await apiClient.get<{ success: boolean; data?: DriverProfile }>("/transport/driver/profile");
    return data.success ? data.data ?? null : null;
  } catch {
    return MOCK_PROFILE;
  }
}

export async function getVehicles(_accessToken?: string): Promise<Vehicle[]> {
  try {
    const data = await apiClient.get<{ success: boolean; data?: { vehicles: Vehicle[] } }>("/transport/driver/vehicles");
    return data.success ? data.data?.vehicles ?? [] : [];
  } catch {
    return MOCK_VEHICLES;
  }
}

export async function getInspectionHistory(_accessToken?: string): Promise<InspectionHistoryEntry[]> {
  try {
    const data = await apiClient.get<{ success: boolean; data?: { inspections: InspectionHistoryEntry[] } }>("/transport/driver/inspections");
    return data.success ? data.data?.inspections ?? [] : [];
  } catch {
    return MOCK_INSPECTION_HISTORY;
  }
}

export async function getShiftHistory(_accessToken?: string): Promise<ShiftSummary[]> {
  try {
    const data = await apiClient.get<{ success: boolean; data?: { shifts: ShiftSummary[] } }>("/transport/driver/shifts");
    return data.success ? data.data?.shifts ?? [] : [];
  } catch {
    return MOCK_SHIFTS;
  }
}

export async function updatePreferences(
  prefs: Partial<{ navigationApp: string; notificationsEnabled: boolean; soundEnabled: boolean; language: string }>,
  _accessToken?: string,
): Promise<boolean> {
  try {
    const data = await apiClient.post<{ success: boolean }>("/transport/driver/preferences", prefs);
    return data.success;
  } catch {
    if (IS_DEV) return true;
    return false;
  }
}
