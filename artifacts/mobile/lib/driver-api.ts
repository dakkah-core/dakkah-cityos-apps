import type { DriverJob, DriverStatus, DriverEarnings, InspectionCheck, InspectionResult, SOSReport, OfflineAction } from "@/types/driver";

const API_BASE = process.env.EXPO_PUBLIC_DOMAIN
  ? `https://${process.env.EXPO_PUBLIC_DOMAIN}/api`
  : "http://localhost:8080/api";

function authHeaders(accessToken?: string): Record<string, string> {
  const h: Record<string, string> = { "Content-Type": "application/json" };
  if (accessToken) h["Authorization"] = `Bearer ${accessToken}`;
  return h;
}

export async function getDriverStatus(accessToken?: string): Promise<{
  driverId: string;
  status: DriverStatus;
  activeJobs: DriverJob[];
  completedToday: number;
} | null> {
  try {
    const res = await fetch(`${API_BASE}/transport/driver/status`, { headers: authHeaders(accessToken) });
    const data = await res.json();
    return data.success ? data.data : null;
  } catch {
    return null;
  }
}

export async function setDriverStatus(status: DriverStatus, accessToken?: string): Promise<{
  driverId: string;
  status: DriverStatus;
  availableJobs: number;
} | null> {
  try {
    const res = await fetch(`${API_BASE}/transport/driver/status`, {
      method: "POST",
      headers: authHeaders(accessToken),
      body: JSON.stringify({ status }),
    });
    const data = await res.json();
    return data.success ? data.data : null;
  } catch {
    return null;
  }
}

export async function getDriverJobs(statusFilter?: string, accessToken?: string): Promise<DriverJob[]> {
  try {
    const url = new URL(`${API_BASE}/transport/driver/jobs`);
    if (statusFilter) url.searchParams.set("status", statusFilter);
    const res = await fetch(url.toString(), { headers: authHeaders(accessToken) });
    const data = await res.json();
    return data.success ? data.data.jobs : [];
  } catch {
    return [];
  }
}

export async function getJob(jobId: string, accessToken?: string): Promise<DriverJob | null> {
  try {
    const res = await fetch(`${API_BASE}/transport/driver/jobs/${jobId}`, { headers: authHeaders(accessToken) });
    const data = await res.json();
    return data.success ? data.data.job : null;
  } catch {
    return null;
  }
}

export async function acceptJob(jobId: string, accessToken?: string): Promise<DriverJob | null> {
  try {
    const res = await fetch(`${API_BASE}/transport/driver/jobs/${jobId}/accept`, {
      method: "POST",
      headers: authHeaders(accessToken),
    });
    const data = await res.json();
    return data.success ? data.data.job : null;
  } catch {
    return null;
  }
}

export async function rejectJob(jobId: string, accessToken?: string): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/transport/driver/jobs/${jobId}/reject`, {
      method: "POST",
      headers: authHeaders(accessToken),
    });
    const data = await res.json();
    return data.success;
  } catch {
    return false;
  }
}

export async function confirmPickup(jobId: string, scannedBarcodes: string[], accessToken?: string): Promise<{
  job: DriverJob;
  verification: { itemsVerified: number; totalItems: number; allVerified: boolean };
} | null> {
  try {
    const res = await fetch(`${API_BASE}/transport/driver/jobs/${jobId}/pickup`, {
      method: "POST",
      headers: authHeaders(accessToken),
      body: JSON.stringify({ scannedBarcodes }),
    });
    const data = await res.json();
    return data.success ? data.data : null;
  } catch {
    return null;
  }
}

export async function markArrived(jobId: string, accessToken?: string): Promise<DriverJob | null> {
  try {
    const res = await fetch(`${API_BASE}/transport/driver/jobs/${jobId}/arrive`, {
      method: "POST",
      headers: authHeaders(accessToken),
    });
    const data = await res.json();
    return data.success ? data.data.job : null;
  } catch {
    return null;
  }
}

export async function completeDelivery(
  jobId: string,
  proof: { proofType: "signature" | "photo" | "both"; signatureData?: string; photoUri?: string; recipientName?: string },
  accessToken?: string
): Promise<{
  job: DriverJob;
  earnings: { amount: number; currency: string; paidAt: string };
} | null> {
  try {
    const res = await fetch(`${API_BASE}/transport/driver/jobs/${jobId}/complete`, {
      method: "POST",
      headers: authHeaders(accessToken),
      body: JSON.stringify(proof),
    });
    const data = await res.json();
    return data.success ? data.data : null;
  } catch {
    return null;
  }
}

export async function reportPosition(
  position: { lat: number; lng: number; heading: number; speed: number },
  accessToken?: string
): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/transport/driver/position`, {
      method: "POST",
      headers: authHeaders(accessToken),
      body: JSON.stringify(position),
    });
    const data = await res.json();
    return data.success;
  } catch {
    return false;
  }
}

export async function getEarnings(period: "today" | "week" | "month" = "today", accessToken?: string): Promise<DriverEarnings | null> {
  try {
    const res = await fetch(`${API_BASE}/transport/driver/earnings?period=${period}`, { headers: authHeaders(accessToken) });
    const data = await res.json();
    return data.success ? data.data : null;
  } catch {
    return null;
  }
}

export async function submitInspection(vehicleId: string, checks: InspectionCheck[], accessToken?: string): Promise<InspectionResult | null> {
  try {
    const res = await fetch(`${API_BASE}/transport/driver/inspection`, {
      method: "POST",
      headers: authHeaders(accessToken),
      body: JSON.stringify({ vehicleId, checks }),
    });
    const data = await res.json();
    return data.success ? data.data : null;
  } catch {
    return null;
  }
}

export async function sendSOS(report: SOSReport, accessToken?: string): Promise<{
  sosId: string;
  status: string;
  estimatedResponse: string;
  emergencyContact: string;
} | null> {
  try {
    const res = await fetch(`${API_BASE}/transport/driver/sos`, {
      method: "POST",
      headers: authHeaders(accessToken),
      body: JSON.stringify(report),
    });
    const data = await res.json();
    return data.success ? data.data : null;
  } catch {
    return null;
  }
}

export async function syncOfflineActions(actions: OfflineAction[], accessToken?: string): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/transport/driver/sync`, {
      method: "POST",
      headers: authHeaders(accessToken),
      body: JSON.stringify({ actions }),
    });
    const data = await res.json();
    return data.success;
  } catch {
    return false;
  }
}
