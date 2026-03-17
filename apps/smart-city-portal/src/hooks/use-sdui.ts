import { useQuery } from "@tanstack/react-query";
import { z } from "zod";

// Flexible schema since SDUI response structures can vary
const sduiResponseSchema = z.any();

export function useDashboardSdui() {
  return useQuery({
    queryKey: ["/api/sdui/citizen_home"],
    queryFn: async () => {
      const base = import.meta.env.BASE_URL.replace(/\/$/, "");
      const res = await fetch(`${base}/api/sdui/citizen_home?surface=web`, {
        headers: { "Content-Type": "application/json" },
      });
      
      if (!res.ok) {
        throw new Error(`Failed to fetch SDUI: ${res.statusText}`);
      }
      
      const raw = await res.json();
      const parsed = sduiResponseSchema.parse(raw);
      
      // Handle the nested structure described in notes
      return parsed?.data?.screen || parsed?.screen || parsed?.data || parsed;
    },
    // Keep data fresh but don't over-poll
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 1,
  });
}
