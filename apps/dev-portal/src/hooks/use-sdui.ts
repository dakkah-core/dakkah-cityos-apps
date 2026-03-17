import { useSduiScreen, type SduiNode } from "@cityos/sdui-renderer-web";

export type { SduiNode as SDUINode } from "@cityos/sdui-renderer-web";

function getFallbackSDUI(): SduiNode {
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
          { type: "text", content: "Please ensure the backend is running.", variant: "body" },
        ],
      },
    ],
  };
}

export function useDevPortalSDUI() {
  return useSduiScreen({
    screenId: "dev_home",
    surface: "web",
    basePath: import.meta.env.BASE_URL?.replace(/\/$/, "") ?? "",
    refetchInterval: 30000,
    fallback: getFallbackSDUI,
  });
}
