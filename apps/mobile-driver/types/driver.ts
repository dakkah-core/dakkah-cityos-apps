export type DriverStatus = "online" | "offline" | "break";

export type JobStatus = "pending" | "accepted" | "in_transit" | "arrived" | "completed" | "cancelled";
export type JobType = "delivery" | "pickup" | "return";

export interface JobCustomer {
  name: string;
  phone: string;
  address: string;
  lat: number;
  lng: number;
}

export interface JobPickupLocation {
  name: string;
  address: string;
  lat: number;
  lng: number;
}

export interface JobItem {
  name: string;
  quantity: number;
  barcode: string;
}

export interface DriverJob {
  id: string;
  type: JobType;
  status: JobStatus;
  customer: JobCustomer;
  pickup: JobPickupLocation;
  items: JobItem[];
  estimatedDistance: string;
  estimatedDuration: string;
  payout: number;
  currency: string;
  createdAt: string;
  notes?: string;
}

export interface DriverEarnings {
  amount: number;
  trips: number;
  hours: number;
  currency: string;
  period: string;
  history: Array<{
    date: string;
    amount: number;
    trips: number;
    hours: number;
  }>;
}

export interface InspectionCheck {
  item: string;
  passed: boolean;
  notes?: string;
}

export interface InspectionResult {
  inspectionId: string;
  vehicleId: string;
  allPassed: boolean;
  checkedItems: number;
  failedItems: string[];
  completedAt: string;
  canDrive: boolean;
}

export interface SOSReport {
  type: "accident" | "breakdown" | "threat" | "medical" | "other";
  location?: { lat: number; lng: number };
  message?: string;
}

export interface OfflineAction {
  id: string;
  action: string;
  payload: Record<string, unknown>;
  timestamp: number;
}
