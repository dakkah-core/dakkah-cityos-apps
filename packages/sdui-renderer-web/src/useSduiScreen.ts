import { useQuery, type UseQueryOptions } from "@tanstack/react-query";

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

export interface UseSduiScreenOptions {
  screenId: string;
  surface?: string;
  basePath?: string;
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

export function useSduiScreen(options: UseSduiScreenOptions) {
  const {
    screenId,
    surface = "web",
    basePath,
    refetchInterval,
    staleTime,
    retry = 1,
    fallback,
    enabled = true,
  } = options;

  const resolvedBase = basePath ?? "";

  const queryOptions: UseQueryOptions<SduiNode, Error> = {
    queryKey: ["sdui", screenId, surface],
    queryFn: async () => {
      try {
        const res = await fetch(
          `${resolvedBase}/api/sdui/${screenId}?surface=${surface}`,
          { headers: { "Content-Type": "application/json" } },
        );
        if (!res.ok) throw new Error(`SDUI fetch failed: ${res.statusText}`);
        const json = await res.json();
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
