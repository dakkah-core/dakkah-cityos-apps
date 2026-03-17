import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";
import { apiClient } from "@/lib/api-client";

interface NotificationContextValue {
  permission: NotificationPermission;
  isSubscribed: boolean;
  requestPermission: () => Promise<void>;
  unsubscribe: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextValue | null>(null);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [permission, setPermission] = useState<NotificationPermission>(
    typeof Notification !== "undefined" ? Notification.permission : "default"
  );
  const [isSubscribed, setIsSubscribed] = useState(false);

  useEffect(() => {
    checkSubscription();
  }, []);

  async function checkSubscription() {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) return;
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      setIsSubscribed(!!sub);
    } catch { /* ignore */ }
  }

  const requestPermission = useCallback(async () => {
    if (!("Notification" in window)) return;

    const result = await Notification.requestPermission();
    setPermission(result);

    if (result === "granted") {
      await subscribeToPush();
    }
  }, []);

  async function subscribeToPush() {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) return;

    try {
      const reg = await navigator.serviceWorker.ready;
      const existing = await reg.pushManager.getSubscription();
      if (existing) {
        setIsSubscribed(true);
        return;
      }

      const keyBytes = urlBase64ToUint8Array(
        import.meta.env.VITE_VAPID_PUBLIC_KEY || "BDummyKeyForDevelopment000000000000000000000000000000000000000000000000000000000000000000="
      );
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: keyBytes.buffer as ArrayBuffer,
      });

      await apiClient.post("/notifications/register", {
        token: sub.endpoint,
        platform: "web",
        subscription: sub.toJSON(),
      });

      setIsSubscribed(true);
    } catch (err) {
      console.warn("Push subscription failed:", err);
    }
  }

  const unsubscribe = useCallback(async () => {
    if (!("serviceWorker" in navigator)) return;

    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (sub) {
        const endpoint = sub.endpoint;
        await sub.unsubscribe();
        await apiClient.request("/notifications/unregister", {
          method: "DELETE",
          body: { token: endpoint },
        });
      }
      setIsSubscribed(false);
    } catch (err) {
      console.warn("Push unsubscribe failed:", err);
    }
  }, []);

  return (
    <NotificationContext.Provider value={{ permission, isSubscribed, requestPermission, unsubscribe }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error("useNotifications must be used within NotificationProvider");
  return ctx;
}

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}
