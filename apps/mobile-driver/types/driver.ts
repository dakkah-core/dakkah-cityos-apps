export type DriverStatus = "online" | "offline" | "break";

export type JobStatus = "pending" | "accepted" | "in_transit" | "arrived" | "completed" | "cancelled";
export type JobType = "delivery" | "pickup" | "return";

export interface JobCustomer {
  name: string;
  phone: string;
  address: string;
  lat: number;
  lng: number;
  avatar?: string;
  notes?: string;
}

export interface JobPickupLocation {
  name: string;
  address: string;
  lat: number;
  lng: number;
  contactPhone?: string;
}

export interface JobItem {
  name: string;
  quantity: number;
  barcode: string;
  imageUrl?: string;
  description?: string;
  weight?: string;
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
  tip?: number;
  currency: string;
  createdAt: string;
  acceptedAt?: string;
  pickedUpAt?: string;
  deliveredAt?: string;
  notes?: string;
  deliveryInstructions?: string;
  priority?: "normal" | "urgent" | "scheduled";
  scheduledFor?: string;
}

export interface EarningsDayBreakdown {
  date: string;
  amount: number;
  trips: number;
  hours: number;
  tips: number;
}

export interface TripEarning {
  id: string;
  jobId: string;
  type: JobType;
  customerName: string;
  amount: number;
  tip: number;
  distance: string;
  completedAt: string;
}

export interface DriverEarnings {
  amount: number;
  trips: number;
  hours: number;
  tips: number;
  currency: string;
  period: string;
  dailyGoal: number;
  goalProgress: number;
  history: EarningsDayBreakdown[];
  recentTrips: TripEarning[];
}

export interface InspectionCheck {
  item: string;
  passed: boolean;
  notes?: string;
  photoUri?: string;
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

export interface InspectionHistoryEntry {
  id: string;
  vehicleId: string;
  vehicleName: string;
  date: string;
  allPassed: boolean;
  failedCount: number;
  totalChecks: number;
}

export interface Vehicle {
  id: string;
  name: string;
  plateNumber: string;
  type: string;
  year: number;
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

export interface DriverProfile {
  id: string;
  name: string;
  phone: string;
  email: string;
  avatar?: string;
  rating: number;
  totalTrips: number;
  memberSince: string;
  vehicle: Vehicle;
  preferences: DriverPreferences;
}

export interface DriverPreferences {
  navigationApp: "google" | "apple" | "waze";
  notificationsEnabled: boolean;
  soundEnabled: boolean;
  language: "en" | "ar";
}

export interface ShiftSummary {
  date: string;
  startTime: string;
  endTime: string;
  hoursOnline: number;
  trips: number;
  earnings: number;
}

export interface JobOffer {
  job: DriverJob;
  expiresAt: number;
  bonusMultiplier?: number;
}

export type DeliveryStep =
  | "pending"
  | "accepted"
  | "en_route_pickup"
  | "at_pickup"
  | "scanning"
  | "en_route_customer"
  | "arrived"
  | "proof_of_delivery"
  | "completed";

export interface TimelineEntry {
  step: DeliveryStep;
  label: string;
  timestamp?: string;
  status: "done" | "active" | "pending";
}
