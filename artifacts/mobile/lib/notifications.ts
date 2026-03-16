import { Platform } from "react-native";

const API_BASE = process.env.EXPO_PUBLIC_DOMAIN
  ? `https://${process.env.EXPO_PUBLIC_DOMAIN}/api`
  : "http://localhost:8080/api";

let pushToken: string | null = null;

export async function registerForPushNotifications(userId?: string): Promise<string | null> {
  try {
    let Notifications: any;
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

    const tokenData = await Notifications.getExpoPushTokenAsync();
    pushToken = tokenData.data;

    await fetch(`${API_BASE}/notifications/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: userId || "anonymous",
        token: pushToken,
        platform: Platform.OS === "ios" ? "ios" : "android",
      }),
    }).catch(() => {});

    return pushToken;
  } catch {
    return null;
  }
}

export async function unregisterPushNotifications(): Promise<void> {
  if (!pushToken) return;
  try {
    await fetch(`${API_BASE}/notifications/unregister`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: pushToken }),
    });
    pushToken = null;
  } catch {}
}

export function getPushToken(): string | null {
  return pushToken;
}
