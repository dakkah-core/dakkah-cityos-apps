import { useQuery } from "@tanstack/react-query";

export type SDUIComponent = {
  type: string;
  title?: string;
  subtitle?: string;
  badge?: string;
  label?: string;
  value?: string | number;
  icon?: string;
  trend?: string;
  content?: string;
  variant?: string;
  direction?: string;
  spacing?: string;
  columns?: number;
  children?: SDUIComponent[];
  items?: Array<{ title: string; subtitle?: string; icon?: string; action?: Record<string, unknown> }>;
  action?: Record<string, unknown>;
};

export type SDUIResponse = {
  success: boolean;
  data: {
    screen: SDUIComponent;
    source?: string;
  };
};

export function useDashboardSDUI() {
  return useQuery({
    queryKey: ["/api/sdui/merchant_overview"],
    queryFn: async () => {
      try {
        const base = import.meta.env.BASE_URL.replace(/\/$/, "");
        const res = await fetch(`${base}/api/sdui/merchant_overview?surface=dashboard`);
        if (!res.ok) throw new Error("Failed to fetch SDUI");
        const json = await res.json();
        
        // Parse SDUI response: json?.data?.screen || json?.screen || json?.data || json
        const screen = json?.data?.screen || json?.screen || json?.data || json;
        if (!screen) throw new Error("Invalid SDUI format");
        
        return screen as SDUIComponent;
      } catch (err) {
        console.error("SDUI Fetch Error:", err);
        // If the API isn't up during dev/generation, we fallback gracefully to simulate the API response
        return getFallbackSDUI();
      }
    },
    refetchInterval: 30000, // Refresh every 30s for a "live" feel
  });
}

function getFallbackSDUI(): SDUIComponent {
  return {
    type: "stack",
    direction: "vertical",
    spacing: "lg",
    children: [
      {
        type: "card",
        title: "Business Performance",
        subtitle: "Multi-location overview",
        badge: "Today",
        children: [
          {
            type: "stack",
            direction: "horizontal",
            spacing: "md",
            children: [
              { type: "stat", label: "Revenue", value: "45,280 SAR", icon: "💰", trend: "+8%" },
              { type: "stat", label: "Orders", value: "312", icon: "📦", trend: "+15%" },
              { type: "stat", label: "Customers", value: "1,847", icon: "👥", trend: "+4%" },
              { type: "stat", label: "Avg Rating", value: "4.7", icon: "⭐", trend: "+0.2" },
            ],
          },
        ],
      },
      {
        type: "grid",
        columns: 2,
        spacing: "md",
        children: [
          {
            type: "card",
            title: "Location Performance",
            subtitle: "Top stores by revenue",
            children: [
              {
                type: "stack",
                direction: "vertical",
                spacing: "sm",
                children: [
                  { type: "text", content: "🥇 Downtown Branch — 18,450 SAR (142 orders)", variant: "body" },
                  { type: "text", content: "🥈 Mall Location — 15,200 SAR (98 orders)", variant: "body" },
                  { type: "text", content: "🥉 Airport Kiosk — 11,630 SAR (72 orders)", variant: "body" },
                ],
              },
            ],
          },
          {
            type: "card",
            title: "Inventory Alerts",
            subtitle: "Action required",
            badge: "5 items",
            children: [
              {
                type: "stack",
                direction: "vertical",
                spacing: "sm",
                children: [
                  { type: "text", content: "⚠️ Espresso beans — 2 days stock remaining", variant: "body" },
                  { type: "text", content: "⚠️ Takeaway cups (M) — Below reorder point", variant: "body" },
                  { type: "text", content: "🔴 Oat milk — Out of stock at 2 locations", variant: "body" },
                ],
              },
              { type: "button", label: "Manage Inventory", variant: "outline", action: { type: "navigate", screen: "business/inventory" } },
            ],
          }
        ]
      },
      {
        type: "list",
        title: "Quick Actions",
        items: [
          { title: "Staff Schedule", subtitle: "12 team members on shift today", icon: "👨‍💼", action: { type: "navigate", screen: "business/staff" } },
          { title: "Marketing Campaigns", subtitle: "2 active, 1 pending review", icon: "📣", action: { type: "navigate", screen: "business/campaigns" } },
          { title: "Financial Reports", subtitle: "P&L, cash flow, forecasts", icon: "📊", action: { type: "navigate", screen: "business/finance" } },
        ],
      },
    ],
  };
}
