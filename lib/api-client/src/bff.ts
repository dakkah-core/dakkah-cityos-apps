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

export class BffClient {
  private client: CityOSClient;
  private service: BffService;
  private port: number;

  constructor(client: CityOSClient, service: BffService) {
    this.client = client;
    this.service = service;
    this.port = BFF_PORTS[service];
  }

  async get<T = unknown>(path: string): Promise<T> {
    return this.client.get<T>(path, this.port);
  }

  async post<T = unknown>(path: string, body?: unknown): Promise<T> {
    return this.client.post<T>(path, body, this.port);
  }

  async put<T = unknown>(path: string, body?: unknown): Promise<T> {
    return this.client.put<T>(path, body, this.port);
  }

  async patch<T = unknown>(path: string, body?: unknown): Promise<T> {
    return this.client.patch<T>(path, body, this.port);
  }

  async delete<T = unknown>(path: string): Promise<T> {
    return this.client.delete<T>(path, this.port);
  }
}

export function createBffClients(client: CityOSClient) {
  return {
    commerce: new BffClient(client, "commerce"),
    governance: new BffClient(client, "governance"),
    healthcare: new BffClient(client, "healthcare"),
    transport: new BffClient(client, "transport"),
    events: new BffClient(client, "events"),
    platform: new BffClient(client, "platform"),
    iot: new BffClient(client, "iot"),
    social: new BffClient(client, "social"),
  };
}
