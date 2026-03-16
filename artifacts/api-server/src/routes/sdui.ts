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
              { type: "stat", label: "Today's Revenue", value: "1,285 SAR", icon: "💰" },
              { type: "stat", label: "Orders", value: "34", icon: "📦" },
              { type: "stat", label: "Rating", value: "4.7", icon: "⭐" },
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
            action: { type: "callback", id: "view_orders" },
          },
        ],
      },
      {
        type: "list",
        title: "Quick Actions",
        items: [
          { title: "Manage Catalog", subtitle: "Add or edit products", icon: "📋", action: { type: "callback", id: "manage_catalog" } },
          { title: "Inventory", subtitle: "2 items low on stock", icon: "📊", action: { type: "callback", id: "view_inventory" } },
          { title: "Bookings", subtitle: "3 reservations today", icon: "📅", action: { type: "callback", id: "view_bookings" } },
          { title: "Analytics", subtitle: "Sales performance", icon: "📈", action: { type: "callback", id: "view_analytics" } },
          { title: "Campaigns", subtitle: "1 active promotion", icon: "🎯", action: { type: "callback", id: "view_campaigns" } },
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

export default router;
