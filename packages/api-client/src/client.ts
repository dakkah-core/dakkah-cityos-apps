export type Surface = "mobile" | "mobile_large" | "tablet" | "desktop" | "desktop_wide" | "kiosk" | "tv_1080p" | "carplay";

export interface CityOSClientConfig {
  baseUrl: string;
  getToken: () => Promise<string | null>;
  tenantId?: string;
  surface?: Surface;
}

function generateCorrelationId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

export class CityOSClient {
  private config: CityOSClientConfig;

  constructor(config: CityOSClientConfig) {
    this.config = config;
  }

  setSurface(surface: Surface) {
    this.config.surface = surface;
  }

  setTenantId(tenantId: string) {
    this.config.tenantId = tenantId;
  }

  private async buildHeaders(extra?: Record<string, string>): Promise<Record<string, string>> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "x-correlation-id": generateCorrelationId(),
    };

    const token = await this.config.getToken();
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    if (this.config.tenantId) {
      headers["x-tenant-id"] = this.config.tenantId;
    }

    if (this.config.surface) {
      headers["x-cityos-surface"] = this.config.surface;
    }

    if (extra) {
      Object.assign(headers, extra);
    }

    return headers;
  }

  async request<T = unknown>(
    path: string,
    options: {
      method?: string;
      body?: unknown;
      headers?: Record<string, string>;
      port?: number;
      retries?: number;
    } = {}
  ): Promise<T> {
    const { method = "GET", body, headers: extraHeaders, port, retries = 2 } = options;

    let baseUrl = this.config.baseUrl;
    if (port) {
      const url = new URL(baseUrl);
      url.port = String(port);
      baseUrl = url.toString().replace(/\/$/, "");
    }

    const url = `${baseUrl}${path}`;
    const headers = await this.buildHeaders(extraHeaders);

    let lastError: Error | null = null;
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const res = await fetch(url, {
          method,
          headers,
          body: body ? JSON.stringify(body) : undefined,
        });

        if (!res.ok) {
          const text = await res.text();
          throw new Error(`HTTP ${res.status}: ${text}`);
        }

        const contentType = res.headers.get("content-type") || "";
        if (contentType.includes("application/json")) {
          return await res.json() as T;
        }
        return await res.text() as T;
      } catch (err) {
        lastError = err instanceof Error ? err : new Error(String(err));
        if (attempt < retries && method === "GET") {
          await new Promise((r) => setTimeout(r, 1000 * (attempt + 1)));
          continue;
        }
        throw lastError;
      }
    }

    throw lastError;
  }

  async get<T = unknown>(path: string, port?: number): Promise<T> {
    return this.request<T>(path, { port });
  }

  async post<T = unknown>(path: string, body?: unknown, port?: number): Promise<T> {
    return this.request<T>(path, { method: "POST", body, port });
  }

  async put<T = unknown>(path: string, body?: unknown, port?: number): Promise<T> {
    return this.request<T>(path, { method: "PUT", body, port });
  }

  async patch<T = unknown>(path: string, body?: unknown, port?: number): Promise<T> {
    return this.request<T>(path, { method: "PATCH", body, port });
  }

  async delete<T = unknown>(path: string, port?: number): Promise<T> {
    return this.request<T>(path, { method: "DELETE", port });
  }
}
