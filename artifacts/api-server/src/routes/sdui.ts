import { Router } from "express";

const router = Router();

const BFF_PLATFORM_PORT = process.env.BFF_PLATFORM_PORT || 4006;

function buildDriverHomeSdui(status: string): Record<string, unknown> {
  if (status === "online") {
    return {
      type: "stack",
      direction: "vertical",
      spacing: "md",
      children: [
        {
          type: "card",
          title: "You're Online",
          subtitle: "Ready to receive delivery requests",
          badge: "Active",
          children: [
            {
              type: "stack",
              direction: "horizontal",
              spacing: "sm",
              children: [
                { type: "stat", label: "Today's Earnings", value: "285.50 SAR", icon: "💰" },
                { type: "stat", label: "Completed", value: "12", icon: "✅" },
                { type: "stat", label: "Rating", value: "4.9", icon: "⭐" },
              ],
            },
          ],
        },
        {
          type: "card",
          title: "Active Waypoints",
          subtitle: "Your current delivery routes",
          children: [
            {
              type: "button",
              label: "View Earnings",
              variant: "outline",
              action: { type: "callback", id: "view_earnings" },
            },
          ],
        },
        {
          type: "list",
          title: "Quick Actions",
          items: [
            { title: "Vehicle Inspection", subtitle: "Pre-trip safety checklist", icon: "🔧", action: { type: "callback", id: "start_inspection" } },
            { title: "View Earnings", subtitle: "Daily / weekly breakdown", icon: "💰", action: { type: "callback", id: "view_earnings" } },
          ],
        },
      ],
    };
  }

  if (status === "break") {
    return {
      type: "stack",
      direction: "vertical",
      spacing: "md",
      children: [
        {
          type: "card",
          title: "On Break",
          subtitle: "Take your time — go online when you're ready",
          badge: "Break",
          children: [
            {
              type: "stack",
              direction: "horizontal",
              spacing: "sm",
              children: [
                { type: "stat", label: "Today's Earnings", value: "285.50 SAR", icon: "💰" },
                { type: "stat", label: "Completed", value: "12", icon: "✅" },
                { type: "stat", label: "Break Time", value: "15 min", icon: "☕" },
              ],
            },
          ],
        },
      ],
    };
  }

  return {
    type: "stack",
    direction: "vertical",
    spacing: "md",
    children: [
      {
        type: "card",
        title: "Go Online",
        subtitle: "Start receiving delivery requests in your area",
        children: [
          {
            type: "stack",
            direction: "horizontal",
            spacing: "sm",
            children: [
              { type: "stat", label: "Yesterday", value: "285 SAR", icon: "💰" },
              { type: "stat", label: "This Week", value: "1,420 SAR", icon: "📊" },
              { type: "stat", label: "Rating", value: "4.9", icon: "⭐" },
            ],
          },
        ],
      },
      {
        type: "list",
        title: "Before You Start",
        items: [
          { title: "Vehicle Inspection", subtitle: "Complete your pre-trip checklist", icon: "🔧", action: { type: "callback", id: "start_inspection" } },
          { title: "View Earnings", subtitle: "Check your earnings history", icon: "💰", action: { type: "callback", id: "view_earnings" } },
        ],
      },
    ],
  };
}

function buildMerchantHomeSdui(): Record<string, unknown> {
  return {
    type: "stack",
    direction: "vertical",
    spacing: "md",
    children: [
      {
        type: "card",
        title: "Store Dashboard",
        subtitle: "Real-time overview of your business",
        children: [
          {
            type: "stack",
            direction: "horizontal",
            spacing: "sm",
            children: [
              { type: "text", content: "💰 1,285 SAR", variant: "label" },
              { type: "text", content: "📦 34 Orders", variant: "label" },
              { type: "text", content: "⭐ 4.7 Rating", variant: "label" },
            ],
          },
        ],
      },
      {
        type: "card",
        title: "Pending Orders",
        subtitle: "2 orders awaiting your confirmation",
        badge: "Action Required",
        children: [
          {
            type: "button",
            label: "View Orders",
            variant: "solid",
            action: { type: "navigate", screen: "merchant/orders" },
          },
        ],
      },
      {
        type: "card",
        title: "Quick Actions",
        subtitle: "Manage your store",
        children: [
          {
            type: "stack",
            direction: "vertical",
            spacing: "sm",
            children: [
              { type: "button", label: "📋 Manage Catalog", variant: "outline", action: { type: "navigate", screen: "merchant/catalog" } },
              { type: "button", label: "📊 Inventory (2 low stock)", variant: "outline", action: { type: "navigate", screen: "merchant/inventory" } },
              { type: "button", label: "📅 Bookings (3 today)", variant: "outline", action: { type: "navigate", screen: "merchant/bookings" } },
              { type: "button", label: "📈 Analytics", variant: "outline", action: { type: "navigate", screen: "merchant/analytics" } },
              { type: "button", label: "🎯 Campaigns", variant: "outline", action: { type: "navigate", screen: "merchant/campaigns" } },
            ],
          },
        ],
      },
    ],
  };
}

router.get("/:screenId", async (req, res) => {
  const { screenId } = req.params;
  const { surface, tenant, driverStatus } = req.query;

  const bffHost = process.env.BFF_HOST || "localhost";
  try {
    const url = new URL(`http://${bffHost}:${BFF_PLATFORM_PORT}/api/sdui/${screenId}`);
    if (surface) url.searchParams.set("surface", String(surface));
    if (tenant) url.searchParams.set("tenant", String(tenant));

    const bffRes = await fetch(url.toString(), {
      signal: AbortSignal.timeout(5000),
    });

    if (bffRes.ok) {
      const raw = await bffRes.json();
      const screen = raw?.data?.screen || raw?.screen || raw?.data || raw;
      res.json({ success: true, data: { screen, source: "bff" } });
      return;
    }
  } catch {}

  const fallbackScreens: Record<string, unknown> = {
    "city_analytics": {
      type: "stack",
      direction: "vertical",
      spacing: "md",
      children: [
        {
          type: "card",
          title: "City Operations Center",
          subtitle: "Real-time municipal overview",
          badge: "Live",
          children: [
            {
              type: "stack",
              direction: "horizontal",
              spacing: "sm",
              children: [
                { type: "stat", label: "Active Incidents", value: "7", icon: "🚨", trend: "-12%" },
                { type: "stat", label: "Traffic Flow", value: "94%", icon: "🚗", trend: "+3%" },
                { type: "stat", label: "Air Quality", value: "Good", icon: "🌿", trend: "stable" },
                { type: "stat", label: "Energy Usage", value: "342 MW", icon: "⚡", trend: "-5%" },
              ],
            },
          ],
        },
        {
          type: "card",
          title: "Service Requests",
          subtitle: "24h rolling window",
          children: [
            {
              type: "stack",
              direction: "horizontal",
              spacing: "sm",
              children: [
                { type: "stat", label: "Open", value: "156", icon: "📋" },
                { type: "stat", label: "In Progress", value: "89", icon: "🔧" },
                { type: "stat", label: "Resolved Today", value: "234", icon: "✅" },
              ],
            },
          ],
        },
        {
          type: "card",
          title: "Infrastructure Health",
          subtitle: "IoT sensor network status",
          children: [
            {
              type: "stack",
              direction: "vertical",
              spacing: "sm",
              children: [
                { type: "text", content: "🟢 Water: Normal (98.7% sensors online)", variant: "body" },
                { type: "text", content: "🟢 Power Grid: Stable (99.1% uptime)", variant: "body" },
                { type: "text", content: "🟡 Waste: 3 bins at capacity in District 4", variant: "body" },
                { type: "text", content: "🟢 Street Lights: 99.8% operational", variant: "body" },
              ],
            },
          ],
        },
        {
          type: "list",
          title: "Quick Actions",
          items: [
            { title: "Emergency Response", subtitle: "View active emergency protocols", icon: "🚑", action: { type: "navigate", screen: "city/emergency" } },
            { title: "Traffic Management", subtitle: "Signal control & congestion maps", icon: "🚦", action: { type: "navigate", screen: "city/traffic" } },
            { title: "Citizen Reports", subtitle: "156 open reports pending review", icon: "📝", action: { type: "navigate", screen: "city/reports" } },
            { title: "Budget Overview", subtitle: "Q1 spending vs allocation", icon: "💰", action: { type: "navigate", screen: "city/budget" } },
          ],
        },
      ],
    },
    "merchant_overview": {
      type: "stack",
      direction: "vertical",
      spacing: "md",
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
              spacing: "sm",
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
          type: "card",
          title: "Location Performance",
          subtitle: "Top 3 stores by revenue",
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
        },
        {
          type: "list",
          title: "Quick Actions",
          items: [
            { title: "Staff Schedule", subtitle: "12 team members on shift today", icon: "👨‍💼", action: { type: "navigate", screen: "business/staff" } },
            { title: "Marketing Campaigns", subtitle: "2 active, 1 pending review", icon: "📣", action: { type: "navigate", screen: "business/campaigns" } },
            { title: "Financial Reports", subtitle: "P&L, cash flow, forecasts", icon: "📊", action: { type: "navigate", screen: "business/finance" } },
            { title: "Customer Insights", subtitle: "Retention & loyalty analytics", icon: "🎯", action: { type: "navigate", screen: "business/customers" } },
          ],
        },
      ],
    },
    "citizen_home": {
      type: "stack",
      direction: "vertical",
      spacing: "md",
      children: [
        {
          type: "card",
          title: "Smart City Portal",
          subtitle: "Citizen services & information",
          children: [
            {
              type: "stack",
              direction: "horizontal",
              spacing: "sm",
              children: [
                { type: "stat", label: "Active Services", value: "47", icon: "🏛️" },
                { type: "stat", label: "Avg Wait Time", value: "2.3 min", icon: "⏱️" },
                { type: "stat", label: "Satisfaction", value: "92%", icon: "😊" },
              ],
            },
          ],
        },
        {
          type: "card",
          title: "Popular Services",
          subtitle: "Most accessed by citizens",
          children: [
            {
              type: "stack",
              direction: "vertical",
              spacing: "sm",
              children: [
                { type: "button", label: "🏠 Property & Housing", variant: "outline", action: { type: "navigate", screen: "portal/property" } },
                { type: "button", label: "🚗 Transport & Parking", variant: "outline", action: { type: "navigate", screen: "portal/transport" } },
                { type: "button", label: "🏥 Health & Wellness", variant: "outline", action: { type: "navigate", screen: "portal/health" } },
                { type: "button", label: "📚 Education & Libraries", variant: "outline", action: { type: "navigate", screen: "portal/education" } },
                { type: "button", label: "♻️ Waste & Recycling", variant: "outline", action: { type: "navigate", screen: "portal/waste" } },
              ],
            },
          ],
        },
        {
          type: "card",
          title: "City Announcements",
          subtitle: "Latest updates",
          children: [
            {
              type: "stack",
              direction: "vertical",
              spacing: "sm",
              children: [
                { type: "text", content: "📢 New metro line Phase 2 construction begins March 20", variant: "body" },
                { type: "text", content: "🌳 City park renovation — temporary closures this weekend", variant: "body" },
                { type: "text", content: "💧 Water conservation advisory in effect until April 1", variant: "body" },
              ],
            },
          ],
        },
        {
          type: "list",
          title: "Report & Engage",
          items: [
            { title: "Report an Issue", subtitle: "Potholes, streetlights, graffiti", icon: "📝", action: { type: "navigate", screen: "portal/report" } },
            { title: "Community Events", subtitle: "18 events this week", icon: "🎉", action: { type: "navigate", screen: "portal/events" } },
            { title: "Public Consultations", subtitle: "3 active proposals for feedback", icon: "🗳️", action: { type: "navigate", screen: "portal/consult" } },
          ],
        },
      ],
    },
    "dev_home": {
      type: "stack",
      direction: "vertical",
      spacing: "md",
      children: [
        {
          type: "card",
          title: "Developer Portal",
          subtitle: "Dakkah CityOS API Platform",
          children: [
            {
              type: "stack",
              direction: "horizontal",
              spacing: "sm",
              children: [
                { type: "stat", label: "APIs Available", value: "24", icon: "🔌" },
                { type: "stat", label: "Your Apps", value: "3", icon: "📱" },
                { type: "stat", label: "API Calls (24h)", value: "12.4K", icon: "📊" },
                { type: "stat", label: "Health", value: "99.9%", icon: "🟢" },
              ],
            },
          ],
        },
        {
          type: "card",
          title: "API Catalog",
          subtitle: "Browse available APIs",
          children: [
            {
              type: "stack",
              direction: "vertical",
              spacing: "sm",
              children: [
                { type: "button", label: "🛒 Commerce API — Products, orders, payments", variant: "outline", action: { type: "navigate", screen: "dev/api/commerce" } },
                { type: "button", label: "🚗 Transport API — Routes, vehicles, bookings", variant: "outline", action: { type: "navigate", screen: "dev/api/transport" } },
                { type: "button", label: "🏥 Healthcare API — Providers, appointments", variant: "outline", action: { type: "navigate", screen: "dev/api/healthcare" } },
                { type: "button", label: "🏛️ Governance API — Services, permits, reports", variant: "outline", action: { type: "navigate", screen: "dev/api/governance" } },
                { type: "button", label: "📡 IoT API — Sensors, telemetry, alerts", variant: "outline", action: { type: "navigate", screen: "dev/api/iot" } },
              ],
            },
          ],
        },
        {
          type: "card",
          title: "Your Applications",
          subtitle: "Registered apps & credentials",
          children: [
            {
              type: "stack",
              direction: "vertical",
              spacing: "sm",
              children: [
                { type: "text", content: "🟢 MyCity App — 8,234 calls/day — Commerce, Transport", variant: "body" },
                { type: "text", content: "🟢 SmartHome Hub — 3,100 calls/day — IoT, Governance", variant: "body" },
                { type: "text", content: "🟡 TestApp — 12 calls/day — Sandbox mode", variant: "body" },
              ],
            },
            { type: "button", label: "Register New App", variant: "solid", action: { type: "navigate", screen: "dev/apps/new" } },
          ],
        },
        {
          type: "list",
          title: "Developer Resources",
          items: [
            { title: "Getting Started", subtitle: "Quick-start guide & tutorials", icon: "📖", action: { type: "navigate", screen: "dev/docs/start" } },
            { title: "API Playground", subtitle: "Interactive API testing sandbox", icon: "🧪", action: { type: "navigate", screen: "dev/playground" } },
            { title: "SDKs & Libraries", subtitle: "JavaScript, Python, Go, Swift", icon: "📦", action: { type: "navigate", screen: "dev/sdks" } },
            { title: "Webhooks & Events", subtitle: "Real-time event subscriptions", icon: "🔔", action: { type: "navigate", screen: "dev/webhooks" } },
          ],
        },
      ],
    },
    "home-hero": {
      type: "stack",
      direction: "vertical",
      spacing: "md",
      children: [
        {
          type: "card",
          title: "Welcome to Dakkah",
          subtitle: "Your AI-powered city companion",
          image: "https://images.unsplash.com/photo-1586724237569-f3d0c1dee8c6?w=800",
          children: [
            {
              type: "button",
              label: "Start Exploring",
              variant: "solid",
              action: { type: "navigate", target: "explore" },
            },
          ],
        },
      ],
    },
    "driver_home": buildDriverHomeSdui(String(driverStatus || "offline")),
    "merchant_home": buildMerchantHomeSdui(),
    "tablet_pos": {
      type: "stack",
      direction: "vertical",
      spacing: "md",
      children: [
        {
          type: "card",
          title: "POS Terminal",
          subtitle: "Point of Sale - Ready",
          children: [
            {
              type: "stack",
              direction: "horizontal",
              spacing: "sm",
              children: [
                { type: "text", content: "Terminal: T-001" },
                { type: "text", content: "Status: Online" },
              ],
            },
            {
              type: "stack",
              direction: "horizontal",
              spacing: "sm",
              children: [
                { type: "button", label: "New Sale", variant: "solid", action: { type: "navigate", screen: "pos" } },
                { type: "button", label: "Scan Barcode", variant: "outline", action: { type: "navigate", screen: "pos/scanner" } },
              ],
            },
          ],
        },
        {
          type: "card",
          title: "Quick Actions",
          children: [
            {
              type: "stack",
              direction: "vertical",
              spacing: "sm",
              children: [
                { type: "button", label: "🍳 Kitchen Display", variant: "outline", action: { type: "navigate", screen: "pos/kitchen" } },
                { type: "button", label: "↩️ Returns", variant: "outline", action: { type: "navigate", screen: "pos/returns" } },
                { type: "button", label: "📊 End of Day", variant: "outline", action: { type: "navigate", screen: "pos/reports" } },
              ],
            },
          ],
        },
      ],
    },
    "product-grid": {
      type: "grid",
      columns: 2,
      spacing: "md",
      children: [
        {
          type: "card",
          title: "Artisan Coffee",
          subtitle: "SAR 24.99",
          image: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400",
          badge: "Popular",
          onPress: { type: "navigate", target: "product/prod_1" },
        },
        {
          type: "card",
          title: "Local Honey",
          subtitle: "SAR 35.00",
          image: "https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=400",
          badge: "Organic",
          onPress: { type: "navigate", target: "product/prod_2" },
        },
      ],
    },
  };

  const screen = fallbackScreens[screenId];
  if (screen) {
    res.json({ success: true, data: { screen, source: "fallback" } });
  } else {
    res.status(404).json({
      success: false,
      error: { code: "SCREEN_NOT_FOUND", message: `SDUI screen '${screenId}' not found` },
    });
  }
});

router.post("/:screenId", async (req, res) => {
  const { screenId } = req.params;
  const { surface } = req.query;
  const { action, payload } = req.body || {};

  const bffHost = process.env.BFF_HOST || "localhost";
  try {
    const url = new URL(`http://${bffHost}:${BFF_PLATFORM_PORT}/api/sdui/${screenId}/action`);
    if (surface) url.searchParams.set("surface", String(surface));
    const bffRes = await fetch(url.toString(), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, payload }),
      signal: AbortSignal.timeout(5000),
    });
    if (bffRes.ok) {
      const raw = await bffRes.json();
      const screen = raw?.data?.screen || raw?.screen || raw?.data || raw;
      res.json({ success: true, data: { screen, source: "bff" } });
      return;
    }
  } catch {}

  if (screenId === "tablet_pos" && action === "cart_update") {
    const itemCount = payload?.itemCount || 0;
    const total = payload?.total || 0;
    const patchedScreen = {
      type: "stack",
      direction: "vertical",
      spacing: "md",
      children: [
        {
          type: "card",
          title: "POS Terminal",
          subtitle: itemCount > 0 ? `${itemCount} item(s) - ${total.toFixed ? total.toFixed(2) : total} SAR` : "Point of Sale - Ready",
          children: [
            {
              type: "stack",
              direction: "horizontal",
              spacing: "sm",
              children: [
                { type: "text", content: "Terminal: T-001" },
                { type: "text", content: itemCount > 0 ? `Cart: ${itemCount} items` : "Status: Online" },
              ],
            },
          ],
        },
      ],
    };
    res.json({ success: true, data: { screen: patchedScreen, source: "optimistic" } });
    return;
  }

  res.json({ success: true, data: { acknowledged: true, action, screenId } });
});

export default router;
