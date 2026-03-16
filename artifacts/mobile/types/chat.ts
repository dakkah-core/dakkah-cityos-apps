export interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: number;
  artifacts?: Artifact[];
  mode?: "suggest" | "propose" | "execute";
}

export type ArtifactType =
  | "poi-carousel"
  | "event-carousel"
  | "ambassador-carousel"
  | "itinerary-timeline"
  | "confirmation-card"
  | "comparison-table"
  | "progress-card"
  | "zone-heatmap"
  | "selection-chips"
  | "analytics-snapshot"
  | "ticket-pass"
  | "order-tracker"
  | "product-carousel"
  | "service-menu"
  | "agent-sync-card"
  | "calendar-selector"
  | "form-group"
  | "map-view"
  | "media-player"
  | "payment-request"
  | "ride-status"
  | "weather-card"
  | "poll-card"
  | "alert-card"
  | "document-card"
  | "receipt-card"
  | "health-snapshot"
  | "smart-home-control"
  | "parking-meter"
  | "parcel-locker"
  | "reservation-card"
  | "crypto-wallet"
  | "task-checklist"
  | "voice-note"
  | "profile-card";

export interface Artifact {
  type: ArtifactType;
  data: any;
}

export interface POI {
  id: string;
  name: string;
  category: string;
  image: string;
  rating: number;
  distance: string;
  vibe: string[];
  priceRange: string;
  openNow: boolean;
}

export interface CityEvent {
  id: string;
  name: string;
  date: string;
  time: string;
  location: string;
  image: string;
  category: string;
  attendees: number;
  price: string;
}

export interface Ambassador {
  id: string;
  name: string;
  specialty: string;
  avatar: string;
  fitScore: number;
  reviews: number;
  verified: boolean;
}

export interface ItineraryDay {
  day: number;
  title: string;
  items: ItineraryItem[];
}

export interface ItineraryItem {
  time: string;
  title: string;
  type: string;
  duration: string;
  cost?: string;
}

export interface ZoneData {
  id: string;
  name: string;
  score: number;
  trend: "up" | "down" | "stable";
  factors: {
    vibes: number;
    activity: number;
    safety: number;
    events: number;
  };
}

export interface ProgressData {
  level: number;
  xp: number;
  xpToNext: number;
  title: string;
  badges: { name: string; icon: string; earned: boolean }[];
  missions: { title: string; progress: number; reward: string }[];
}

export interface ComparisonItem {
  name: string;
  values: Record<string, string | number>;
}

export interface TicketData {
  id: string;
  eventName: string;
  date: string;
  time: string;
  seat: string;
  location: string;
}

export interface OrderData {
  id: string;
  orderNumber: string;
  status: "confirmed" | "preparing" | "on-the-way" | "delivered";
  items: string[];
  total: string;
  estimatedTime: string;
}

export interface AnalyticsMetric {
  label: string;
  value: string;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
}

export interface Product {
  id: string;
  name: string;
  brand: string;
  price: string;
  image: string;
  tags?: string[];
}

export interface ServiceItem {
  id: string;
  name: string;
  description: string;
  duration: string;
  price: string;
  rating?: number;
}

export interface ChatThread {
  id: string;
  title: string;
  lastMessage: string;
  timestamp: number;
}

export interface ActionCategory {
  id: string;
  label: string;
  icon: string;
  color: string;
}

export interface QuickAction {
  id: string;
  title: string;
  prompt: string;
  category: string;
  icon: string;
}
