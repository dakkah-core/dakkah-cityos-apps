import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import type { CityOSClient } from "@cityos/api-client";

export interface SduiNode {
  type: string;
  id?: string;
  title?: string;
  subtitle?: string;
  badge?: string;
  image?: string;
  content?: string;
  label?: string;
  value?: string | number;
  icon?: string;
  trend?: string;
  variant?: string;
  spacing?: "sm" | "md" | "lg";
  direction?: "vertical" | "horizontal";
  columns?: number;
  children?: SduiNode[];
  items?: SduiNode[];
  action?: {
    type: string;
    screen?: string;
    target?: string;
    id?: string;
  };
  onPress?: {
    type: string;
    target?: string;
  };
  [key: string]: unknown;
}

export type SduiFetcher = (url: string) => Promise<Record<string, unknown>>;

export interface UseSduiScreenOptions {
  screenId: string;
  surface?: string;
  basePath?: string;
  apiClient?: Pick<CityOSClient, "get">;
  fetcher?: SduiFetcher;
  refetchInterval?: number;
  staleTime?: number;
  retry?: number | boolean;
  fallback?: SduiNode | (() => SduiNode);
  enabled?: boolean;
}

function parseSduiResponse(json: Record<string, unknown>): SduiNode {
  const screen =
    (json?.data as Record<string, unknown>)?.screen ||
    json?.screen ||
    json?.data ||
    json;
  if (!screen) throw new Error("Invalid SDUI response format");
  return screen as SduiNode;
}

async function defaultFetcher(url: string): Promise<Record<string, unknown>> {
  const res = await fetch(url, { headers: { "Content-Type": "application/json" } });
  if (!res.ok) throw new Error(`SDUI fetch failed: ${res.statusText}`);
  return res.json();
}

export function useSduiScreen(options: UseSduiScreenOptions) {
  const {
    screenId,
    surface = "web",
    basePath,
    apiClient,
    fetcher,
    refetchInterval,
    staleTime,
    retry = 1,
    fallback,
    enabled = true,
  } = options;

  const resolvedBase = basePath ?? "";

  const doFetch = async (): Promise<Record<string, unknown>> => {
    const path = `/sdui/${screenId}?surface=${surface}`;
    if (apiClient) {
      return apiClient.get<Record<string, unknown>>(path);
    }
    if (fetcher) {
      return fetcher(`${resolvedBase}/api${path}`);
    }
    return defaultFetcher(`${resolvedBase}/api${path}`);
  };

  const queryOptions: UseQueryOptions<SduiNode, Error> = {
    queryKey: ["sdui", screenId, surface],
    queryFn: async () => {
      try {
        const json = await doFetch();
        return parseSduiResponse(json);
      } catch (err) {
        console.error(`SDUI fetch error for ${screenId}:`, err);
        if (fallback) {
          return typeof fallback === "function" ? fallback() : fallback;
        }
        throw err;
      }
    },
    retry,
    enabled,
  };

  if (refetchInterval) queryOptions.refetchInterval = refetchInterval;
  if (staleTime) queryOptions.staleTime = staleTime;

  return useQuery(queryOptions);
}
