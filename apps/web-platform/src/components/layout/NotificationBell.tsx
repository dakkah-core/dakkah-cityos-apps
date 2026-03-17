import { Bell, BellOff } from "lucide-react";
import { useNotifications } from "@/hooks/use-notifications";

export function NotificationBell() {
  const { permission, isSubscribed, requestPermission } = useNotifications();

  const handleClick = async () => {
    if (permission === "default") {
      await requestPermission();
    } else if (permission === "denied") {
      alert("Notifications are blocked. Please enable them in your browser settings.");
    }
  };

  return (
    <button
      onClick={handleClick}
      className="p-2 rounded-lg hover:bg-muted transition-colors relative"
      title={
        permission === "denied"
          ? "Notifications blocked"
          : isSubscribed
          ? "Notifications enabled"
          : "Enable notifications"
      }
    >
      {permission === "denied" ? (
        <BellOff className="h-5 w-5 text-muted-foreground" />
      ) : (
        <Bell className="h-5 w-5 text-muted-foreground" />
      )}
      {isSubscribed && (
        <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-green-500 rounded-full" />
      )}
      {!isSubscribed && permission !== "denied" && (
        <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
      )}
    </button>
  );
}
