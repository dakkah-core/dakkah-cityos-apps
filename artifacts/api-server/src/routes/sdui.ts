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
      const data = await bffRes.json();
      res.json({ success: true, data });
      return;
    }
  } catch {}

  const fallbackScreens: Record<string, unknown> = {
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
      const data = await bffRes.json();
      res.json({ success: true, data });
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
