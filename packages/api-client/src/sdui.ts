import type { SdPayload, SdAction } from "@cityos/sdui-protocol";
import type { CityOSClient, Surface } from "./client";

export class SduiClient {
  private client: CityOSClient;

  constructor(client: CityOSClient) {
    this.client = client;
  }

  async fetchScreen(
    screenId: string,
    surface?: Surface,
    tenantId?: string,
  ): Promise<SdPayload> {
    const params = new URLSearchParams();
    if (surface) params.set("surface", surface);
    if (tenantId) params.set("tenant", tenantId);
    const query = params.toString();
    const path = `/api/sdui/${screenId}${query ? `?${query}` : ""}`;
    return this.client.get<SdPayload>(path);
  }

  async dispatchAction(action: SdAction): Promise<unknown> {
    if (action.type === "api_mutation") {
      return this.client.request(action.endpoint, {
        method: action.method,
        body: action.payload,
      });
    }
    return null;
  }
}
