import { useQuery } from "@tanstack/react-query";

let apiBaseUrl = "";

export function setApiBaseUrl(url: string) {
  apiBaseUrl = url;
}

export function getApiBaseUrl() {
  return apiBaseUrl;
}

export function useHealthCheck() {
  return useQuery({
    queryKey: ["health-check"],
    queryFn: async () => ({ status: "ok", timestamp: Date.now() }),
    refetchInterval: 30000,
  });
}
