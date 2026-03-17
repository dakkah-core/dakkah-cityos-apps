import { Platform } from "react-native";
import { apiClient } from "./gateway";

export type NotificationCategory = "order" | "delivery" | "city_alert" | "event" | "chat" | "health" | "transport" | "general";

let pushToken: string | null = null;

export async function registerForPushNotifications(
  userId?: string,
  categories?: NotificationCategory[],
  _accessToken?: string
): Promise<string | null> {
  try {
    let Notifications: { getPermissionsAsync: () => Promise<{ status: string }>; requestPermissionsAsync: () => Promise<{ status: string }>; getExpoPushTokenAsync: () => Promise<{ data: string }>; setNotificationCategoryAsync?: (id: string, actions: unknown[]) => Promise<void> };
    try {
      Notifications = require("expo-notifications");
    } catch {
      return null;
    }
    if (!Notifications) return null;

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== "granted") {
      return null;
    }

    if (Notifications.setNotificationCategoryAsync) {
      await setupNotificationCategories(Notifications as { setNotificationCategoryAsync: (id: string, actions: unknown[]) => Promise<void> }).catch(() => {});
    }

    const tokenData = await Notifications.getExpoPushTokenAsync();
    pushToken = tokenData.data;

    await apiClient.post("/notifications/register", {
      token: pushToken,
      platform: Platform.OS === "ios" ? "ios" : Platform.OS === "android" ? "android" : "web",
      categories: categories || ["order", "delivery", "city_alert", "event", "chat", "health", "transport", "general"],
    }).catch(() => {});

    return pushToken;
  } catch {
    return null;
  }
}

async function setupNotificationCategories(
  Notifications: { setNotificationCategoryAsync: (id: string, actions: unknown[]) => Promise<void> }
): Promise<void> {
  await Notifications.setNotificationCategoryAsync("order", [
    { identifier: "VIEW_ORDER", buttonTitle: "View Order" },
    { identifier: "TRACK", buttonTitle: "Track" },
  ]);

  await Notifications.setNotificationCategoryAsync("delivery", [
    { identifier: "TRACK_DELIVERY", buttonTitle: "Track" },
    { identifier: "CONTACT_DRIVER", buttonTitle: "Contact Driver" },
  ]);

  await Notifications.setNotificationCategoryAsync("city_alert", [
    { identifier: "VIEW_DETAILS", buttonTitle: "View Details" },
    { identifier: "DISMISS", buttonTitle: "Dismiss", options: { isDestructive: true } },
  ]);

  await Notifications.setNotificationCategoryAsync("event", [
    { identifier: "VIEW_EVENT", buttonTitle: "View Event" },
    { identifier: "ADD_CALENDAR", buttonTitle: "Add to Calendar" },
  ]);

  await Notifications.setNotificationCategoryAsync("chat", [
    { identifier: "REPLY", buttonTitle: "Reply", textInput: { submitButtonTitle: "Send", placeholder: "Type a reply..." } },
  ]);
}

export async function updateNotificationCategories(categories: NotificationCategory[], _accessToken?: string): Promise<boolean> {
  if (!pushToken) return false;
  try {
    const data = await apiClient.put<{ success: boolean }>("/notifications/categories", { token: pushToken, categories });
    return data.success;
  } catch {
    return false;
  }
}

export async function unregisterPushNotifications(_accessToken?: string): Promise<void> {
  if (!pushToken) return;
  try {
    await apiClient.request("/notifications/unregister", {
      method: "DELETE",
      body: { token: pushToken },
    });
    pushToken = null;
  } catch {}
}

export function getPushToken(): string | null {
  return pushToken;
}
