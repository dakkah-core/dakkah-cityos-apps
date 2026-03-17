import type { CityOSClient } from "./client";

export const BFF_PORTS = {
  commerce: 4001,
  governance: 4002,
  healthcare: 4003,
  transport: 4004,
  events: 4005,
  platform: 4006,
  iot: 4007,
  social: 4008,
} as const;

export type BffService = keyof typeof BFF_PORTS;

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

export interface PaginationParams {
  page?: number;
  pageSize?: number;
  sort?: string;
  order?: "asc" | "desc";
}

export interface CommerceProduct {
  id: string;
  name: string;
  description?: string;
  price: number;
  currency: string;
  images: string[];
  category: string;
  available: boolean;
}

export interface CommerceOrder {
  id: string;
  status: "pending" | "confirmed" | "preparing" | "ready" | "delivered" | "cancelled";
  items: Array<{ productId: string; quantity: number; unitPrice: number }>;
  total: number;
  currency: string;
  createdAt: string;
}

export interface TransportRide {
  id: string;
  status: "requested" | "accepted" | "arriving" | "in_progress" | "completed" | "cancelled";
  pickupLat: number;
  pickupLng: number;
  dropoffLat: number;
  dropoffLng: number;
  estimatedFare: number;
  currency: string;
  driverId?: string;
  eta?: number;
}

export interface TransportRoute {
  id: string;
  name: string;
  type: "bus" | "metro" | "tram" | "ferry";
  stops: Array<{ id: string; name: string; lat: number; lng: number }>;
}

export interface HealthcareAppointment {
  id: string;
  providerId: string;
  providerName: string;
  specialty: string;
  dateTime: string;
  status: "scheduled" | "confirmed" | "in_progress" | "completed" | "cancelled";
  location?: string;
}

export interface GovernanceService {
  id: string;
  name: string;
  category: string;
  description: string;
  requiredDocuments: string[];
  estimatedDays: number;
}

export interface GovernanceRequest {
  id: string;
  serviceId: string;
  status: "submitted" | "under_review" | "approved" | "rejected" | "completed";
  submittedAt: string;
  referenceNumber: string;
}

export interface EventListing {
  id: string;
  title: string;
  description: string;
  venue: string;
  startDate: string;
  endDate: string;
  category: string;
  price?: number;
  currency?: string;
  imageUrl?: string;
  capacity?: number;
  attendees?: number;
}

export interface EventBooking {
  id: string;
  eventId: string;
  status: "confirmed" | "pending" | "cancelled";
  tickets: number;
  totalPrice: number;
  currency: string;
}

export interface PlatformNotification {
  id: string;
  type: "info" | "warning" | "success" | "error";
  title: string;
  body: string;
  read: boolean;
  createdAt: string;
  action?: { type: string; target: string };
}

export interface PlatformUserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  preferredLanguage: string;
  tenantId: string;
}

export interface IotDevice {
  id: string;
  name: string;
  type: string;
  status: "online" | "offline" | "error";
  lastSeen: string;
  metrics: Record<string, number>;
}

export interface SocialPost {
  id: string;
  authorId: string;
  authorName: string;
  content: string;
  mediaUrls: string[];
  likes: number;
  comments: number;
  createdAt: string;
}

export class BffClient {
  private client: CityOSClient;
  private service: BffService;
  private port: number;

  constructor(client: CityOSClient, service: BffService) {
    this.client = client;
    this.service = service;
    this.port = BFF_PORTS[service];
  }

  async get<T>(path: string): Promise<T> {
    return this.client.get<T>(path, this.port);
  }

  async post<T>(path: string, body?: unknown): Promise<T> {
    return this.client.post<T>(path, body, this.port);
  }

  async put<T>(path: string, body?: unknown): Promise<T> {
    return this.client.put<T>(path, body, this.port);
  }

  async patch<T>(path: string, body?: unknown): Promise<T> {
    return this.client.patch<T>(path, body, this.port);
  }

  async delete<T>(path: string): Promise<T> {
    return this.client.delete<T>(path, this.port);
  }
}

export class CommerceClient extends BffClient {
  constructor(client: CityOSClient) { super(client, "commerce"); }

  listProducts(params?: PaginationParams) { return this.get<PaginatedResponse<CommerceProduct>>(`/api/products?${toQuery(params)}`); }
  getProduct(id: string) { return this.get<CommerceProduct>(`/api/products/${id}`); }
  createOrder(items: Array<{ productId: string; quantity: number }>) { return this.post<CommerceOrder>("/api/orders", { items }); }
  getOrder(id: string) { return this.get<CommerceOrder>(`/api/orders/${id}`); }
  listOrders(params?: PaginationParams) { return this.get<PaginatedResponse<CommerceOrder>>(`/api/orders?${toQuery(params)}`); }
}

export class TransportClient extends BffClient {
  constructor(client: CityOSClient) { super(client, "transport"); }

  requestRide(pickup: { lat: number; lng: number }, dropoff: { lat: number; lng: number }) {
    return this.post<TransportRide>("/api/rides", { pickupLat: pickup.lat, pickupLng: pickup.lng, dropoffLat: dropoff.lat, dropoffLng: dropoff.lng });
  }
  getRide(id: string) { return this.get<TransportRide>(`/api/rides/${id}`); }
  cancelRide(id: string) { return this.post<TransportRide>(`/api/rides/${id}/cancel`); }
  listRoutes() { return this.get<TransportRoute[]>("/api/routes"); }
  getRoute(id: string) { return this.get<TransportRoute>(`/api/routes/${id}`); }
}

export class HealthcareClient extends BffClient {
  constructor(client: CityOSClient) { super(client, "healthcare"); }

  listAppointments(params?: PaginationParams) { return this.get<PaginatedResponse<HealthcareAppointment>>(`/api/appointments?${toQuery(params)}`); }
  bookAppointment(data: { providerId: string; dateTime: string; specialty: string }) { return this.post<HealthcareAppointment>("/api/appointments", data); }
  cancelAppointment(id: string) { return this.post<HealthcareAppointment>(`/api/appointments/${id}/cancel`); }
}

export class GovernanceClient extends BffClient {
  constructor(client: CityOSClient) { super(client, "governance"); }

  listServices(category?: string) { return this.get<GovernanceService[]>(`/api/services${category ? `?category=${category}` : ""}`); }
  submitRequest(serviceId: string, documents: Record<string, string>) { return this.post<GovernanceRequest>("/api/requests", { serviceId, documents }); }
  getRequest(id: string) { return this.get<GovernanceRequest>(`/api/requests/${id}`); }
  listRequests(params?: PaginationParams) { return this.get<PaginatedResponse<GovernanceRequest>>(`/api/requests?${toQuery(params)}`); }
}

export class EventsClient extends BffClient {
  constructor(client: CityOSClient) { super(client, "events"); }

  listEvents(params?: PaginationParams & { category?: string }) { return this.get<PaginatedResponse<EventListing>>(`/api/events?${toQuery(params)}`); }
  getEvent(id: string) { return this.get<EventListing>(`/api/events/${id}`); }
  bookEvent(eventId: string, tickets: number) { return this.post<EventBooking>("/api/bookings", { eventId, tickets }); }
  listBookings(params?: PaginationParams) { return this.get<PaginatedResponse<EventBooking>>(`/api/bookings?${toQuery(params)}`); }
}

export class PlatformClient extends BffClient {
  constructor(client: CityOSClient) { super(client, "platform"); }

  getProfile() { return this.get<PlatformUserProfile>("/api/profile"); }
  updateProfile(data: Partial<Pick<PlatformUserProfile, "name" | "phone" | "avatar" | "preferredLanguage">>) { return this.patch<PlatformUserProfile>("/api/profile", data); }
  listNotifications(params?: PaginationParams) { return this.get<PaginatedResponse<PlatformNotification>>(`/api/notifications?${toQuery(params)}`); }
  markNotificationRead(id: string) { return this.patch<PlatformNotification>(`/api/notifications/${id}`, { read: true }); }
}

export class IotClient extends BffClient {
  constructor(client: CityOSClient) { super(client, "iot"); }

  listDevices(params?: PaginationParams) { return this.get<PaginatedResponse<IotDevice>>(`/api/devices?${toQuery(params)}`); }
  getDevice(id: string) { return this.get<IotDevice>(`/api/devices/${id}`); }
  sendCommand(deviceId: string, command: string, payload?: Record<string, unknown>) { return this.post<{ success: boolean }>(`/api/devices/${deviceId}/commands`, { command, payload }); }
}

export class SocialClient extends BffClient {
  constructor(client: CityOSClient) { super(client, "social"); }

  listPosts(params?: PaginationParams) { return this.get<PaginatedResponse<SocialPost>>(`/api/posts?${toQuery(params)}`); }
  createPost(content: string, mediaUrls?: string[]) { return this.post<SocialPost>("/api/posts", { content, mediaUrls }); }
  likePost(id: string) { return this.post<{ likes: number }>(`/api/posts/${id}/like`); }
}

function toQuery(params?: object): string {
  if (!params) return "";
  const entries = Object.entries(params).filter(([, v]) => v !== undefined && v !== null);
  if (entries.length === 0) return "";
  return new URLSearchParams(entries.map(([k, v]) => [k, String(v)])).toString();
}

export interface TypedBffClients {
  commerce: CommerceClient;
  governance: GovernanceClient;
  healthcare: HealthcareClient;
  transport: TransportClient;
  events: EventsClient;
  platform: PlatformClient;
  iot: IotClient;
  social: SocialClient;
}

export function createBffClients(client: CityOSClient): TypedBffClients {
  return {
    commerce: new CommerceClient(client),
    governance: new GovernanceClient(client),
    healthcare: new HealthcareClient(client),
    transport: new TransportClient(client),
    events: new EventsClient(client),
    platform: new PlatformClient(client),
    iot: new IotClient(client),
    social: new SocialClient(client),
  };
}
