import type { DriverJob, DriverStatus, DriverEarnings, InspectionCheck, InspectionResult, SOSReport, OfflineAction } from "@/types/driver";
import { apiClient } from "@cityos/mobile-core";

export async function getDriverStatus(_accessToken?: string): Promise<{
  driverId: string;
  status: DriverStatus;
  activeJobs: DriverJob[];
  completedToday: number;
} | null> {
  try {
    const data = await apiClient.get<{ success: boolean; data?: any }>("/transport/driver/status");
    return data.success ? data.data : null;
  } catch {
    return null;
  }
}

export async function setDriverStatus(status: DriverStatus, _accessToken?: string): Promise<{
  driverId: string;
  status: DriverStatus;
  availableJobs: number;
} | null> {
  try {
    const data = await apiClient.post<{ success: boolean; data?: any }>("/transport/driver/status", { status });
    return data.success ? data.data : null;
  } catch {
    return null;
  }
}

export async function getDriverJobs(statusFilter?: string, _accessToken?: string): Promise<DriverJob[]> {
  try {
    const query = statusFilter ? `?status=${statusFilter}` : "";
    const data = await apiClient.get<{ success: boolean; data?: { jobs: DriverJob[] } }>(`/transport/driver/jobs${query}`);
    return data.success ? data.data?.jobs ?? [] : [];
  } catch {
    return [];
  }
}

export async function getJob(jobId: string, _accessToken?: string): Promise<DriverJob | null> {
  try {
    const data = await apiClient.get<{ success: boolean; data?: { job: DriverJob } }>(`/transport/driver/jobs/${jobId}`);
    return data.success ? data.data?.job ?? null : null;
  } catch {
    return null;
  }
}

export async function acceptJob(jobId: string, _accessToken?: string): Promise<DriverJob | null> {
  try {
    const data = await apiClient.post<{ success: boolean; data?: { job: DriverJob } }>(`/transport/driver/jobs/${jobId}/accept`);
    return data.success ? data.data?.job ?? null : null;
  } catch {
    return null;
  }
}

export async function rejectJob(jobId: string, _accessToken?: string): Promise<boolean> {
  try {
    const data = await apiClient.post<{ success: boolean }>(`/transport/driver/jobs/${jobId}/reject`);
    return data.success;
  } catch {
    return false;
  }
}

export async function confirmPickup(jobId: string, scannedBarcodes: string[], _accessToken?: string): Promise<{
  job: DriverJob;
  verification: { itemsVerified: number; totalItems: number; allVerified: boolean };
} | null> {
  try {
    const data = await apiClient.post<{ success: boolean; data?: any }>(`/transport/driver/jobs/${jobId}/pickup`, { scannedBarcodes });
    return data.success ? data.data : null;
  } catch {
    return null;
  }
}

export async function markArrived(jobId: string, _accessToken?: string): Promise<DriverJob | null> {
  try {
    const data = await apiClient.post<{ success: boolean; data?: { job: DriverJob } }>(`/transport/driver/jobs/${jobId}/arrive`);
    return data.success ? data.data?.job ?? null : null;
  } catch {
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
    const data = await apiClient.post<{ success: boolean; data?: any }>(`/transport/driver/jobs/${jobId}/complete`, proof);
    return data.success ? data.data : null;
  } catch {
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
    return false;
  }
}

export async function getEarnings(period: "today" | "week" | "month" = "today", _accessToken?: string): Promise<DriverEarnings | null> {
  try {
    const data = await apiClient.get<{ success: boolean; data?: DriverEarnings }>(`/transport/driver/earnings?period=${period}`);
    return data.success ? data.data ?? null : null;
  } catch {
    return null;
  }
}

export async function submitInspection(vehicleId: string, checks: InspectionCheck[], _accessToken?: string): Promise<InspectionResult | null> {
  try {
    const data = await apiClient.post<{ success: boolean; data?: InspectionResult }>("/transport/driver/inspection", { vehicleId, checks });
    return data.success ? data.data ?? null : null;
  } catch {
    return null;
  }
}

export async function sendSOS(report: SOSReport, _accessToken?: string): Promise<{
  sosId: string;
  status: string;
  estimatedResponse: string;
  emergencyContact: string;
} | null> {
  try {
    const data = await apiClient.post<{ success: boolean; data?: any }>("/transport/driver/sos", report);
    return data.success ? data.data : null;
  } catch {
    return null;
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
