import { useQuery } from "@tanstack/react-query";

export interface SduiAction {
  type: string;
  screen?: string;
  target?: string;
  id?: string;
}

export interface SduiNode {
  type: string;
  // Common
  children?: SduiNode[];
  // Stack
  direction?: "horizontal" | "vertical";
  spacing?: "sm" | "md" | "lg";
  // Card
  title?: string;
  subtitle?: string;
  badge?: string;
  image?: string;
  // Stat
  label?: string;
  value?: string | number;
  icon?: string;
  trend?: string;
  // Text
  content?: string;
  variant?: "body" | "label" | "heading";
  // Button
  variant_style?: "solid" | "outline" | "ghost"; // avoiding clash with variant
  action?: SduiAction;
  onPress?: SduiAction;
  // List
  items?: Array<{
    title: string;
    subtitle?: string;
    icon?: string;
    action?: SduiAction;
  }>;
  // Grid
  columns?: number;
}

export function useDashboardSdui() {
  return useQuery({
    queryKey: ["/api/sdui/city_analytics"],
    queryFn: async () => {
      try {
        const base = import.meta.env.BASE_URL.replace(/\/$/, "");
        const res = await fetch(`${base}/api/sdui/city_analytics?surface=desktop_wide`);
        if (!res.ok) throw new Error("Failed to fetch SDUI");
        const json = await res.json();
        // Handle various possible response shapes from the SDUI router
        const screen = json?.data?.screen || json?.screen || json?.data || json;
        return screen as SduiNode;
      } catch (err) {
        console.error("Failed to fetch SDUI, using fallback", err);
        // If API is down, fallback to empty state or mock so UI doesn't crash completely
        throw err; 
      }
    },
    retry: 1,
  });
}
