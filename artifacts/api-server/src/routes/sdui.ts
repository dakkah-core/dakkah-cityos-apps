import { Router } from "express";

const router = Router();

const BFF_PLATFORM_PORT = process.env.BFF_PLATFORM_PORT || 4006;

router.get("/:screenId", async (req, res) => {
  const { screenId } = req.params;
  const { surface, tenant } = req.query;

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
    "driver_home": {
      type: "stack",
      direction: "vertical",
      spacing: "md",
      children: [
        {
          type: "card",
          title: "Driver Dashboard",
          subtitle: "Manage your deliveries and earnings",
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
          title: "Active Delivery",
          subtitle: "Al-Medina Fresh Market → Ahmad Al-Rashid",
          badge: "In Transit",
          children: [
            {
              type: "button",
              label: "View Details",
              variant: "solid",
              action: { type: "navigate", target: "job/active" },
            },
          ],
        },
        {
          type: "list",
          title: "Available Jobs",
          items: [
            { title: "Delivery — Heritage Spices", subtitle: "5.4 km • 12 min • 22 SAR", icon: "📦" },
            { title: "Pickup — Al-Batha Market", subtitle: "3.2 km • 8 min • 18 SAR", icon: "📦" },
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

export default router;
