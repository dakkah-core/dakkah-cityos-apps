import { useSduiScreen } from "@cityos/sdui-renderer-web";

export function useDashboardSdui() {
  return useSduiScreen({
    screenId: "citizen_home",
    surface: "web",
    basePath: import.meta.env.BASE_URL?.replace(/\/$/, "") ?? "",
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });
}
