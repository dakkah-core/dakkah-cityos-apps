import { useQuery } from "@tanstack/react-query";

// Define the shape of our SDUI nodes
export type SDUINode = {
  type: string;
  id?: string;
  title?: string;
  subtitle?: string;
  badge?: string;
  image?: string;
  content?: string;
  label?: string;
  value?: string;
  icon?: string;
  trend?: string;
  variant?: string;
  spacing?: "sm" | "md" | "lg";
  direction?: "vertical" | "horizontal";
  columns?: number;
  items?: SDUINode[];
  children?: SDUINode[];
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
};

export type SDUIResponse = {
  success: boolean;
  data: {
    screen: SDUINode;
    source?: string;
  };
};

export function useDevPortalSDUI() {
  return useQuery({
    queryKey: ["sdui", "dev_home"],
    queryFn: async (): Promise<SDUINode> => {
      try {
        const base = import.meta.env.BASE_URL.replace(/\/$/, "");
        const res = await fetch(`${base}/api/sdui/dev_home?surface=web`);
        if (!res.ok) throw new Error("Failed to fetch SDUI");
        
        const json = await res.json();
        // Parse SDUI response: json?.data?.screen || json?.screen || json?.data || json
        const screen = json?.data?.screen || json?.screen || json?.data || json;
        
        if (!screen) throw new Error("Invalid SDUI format");
        return screen;
      } catch (err) {
        console.error("SDUI fetch error:", err);
        // Fallback for development if backend isn't ready
        return {
          type: "stack",
          direction: "vertical",
          spacing: "md",
          children: [
            {
              type: "card",
              title: "Error Loading Dashboard",
              subtitle: "Could not connect to /api/sdui/dev_portal",
              children: [
                { type: "text", content: "Please ensure the backend is running.", variant: "body" }
              ]
            }
          ]
        };
      }
    },
    refetchInterval: 30000, // Refresh every 30s for live feel
  });
}
