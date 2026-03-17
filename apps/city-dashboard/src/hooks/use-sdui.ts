import { useSduiScreen } from "@cityos/sdui-renderer-web";
export type { SduiNode } from "@cityos/sdui-renderer-web";

export function useDashboardSdui() {
  return useSduiScreen({
    screenId: "city_analytics",
    surface: "desktop_wide",
    basePath: import.meta.env.BASE_URL?.replace(/\/$/, "") ?? "",
    retry: 1,
  });
}
