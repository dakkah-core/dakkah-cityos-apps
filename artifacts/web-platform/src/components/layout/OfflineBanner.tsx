import { useState, useEffect } from "react";
import { WifiOff, RefreshCw } from "lucide-react";

export function OfflineBanner() {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [updateAvailable, setUpdateAvailable] = useState(false);

  useEffect(() => {
    const goOffline = () => setIsOffline(true);
    const goOnline = () => setIsOffline(false);
    const onUpdate = () => setUpdateAvailable(true);

    window.addEventListener("offline", goOffline);
    window.addEventListener("online", goOnline);
    window.addEventListener("sw-update-available", onUpdate);

    return () => {
      window.removeEventListener("offline", goOffline);
      window.removeEventListener("online", goOnline);
      window.removeEventListener("sw-update-available", onUpdate);
    };
  }, []);

  if (!isOffline && !updateAvailable) return null;

  return (
    <div className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium">
      {isOffline && (
        <div className="flex items-center gap-2 text-amber-600 bg-amber-50 px-3 py-1.5 rounded-full border border-amber-200">
          <WifiOff className="h-4 w-4" />
          <span>You're offline — cached content available</span>
        </div>
      )}
      {updateAvailable && !isOffline && (
        <button
          onClick={() => window.location.reload()}
          className="flex items-center gap-2 text-primary bg-primary/10 px-3 py-1.5 rounded-full border border-primary/20 hover:bg-primary/20 transition-colors"
        >
          <RefreshCw className="h-4 w-4" />
          <span>Update available — click to refresh</span>
        </button>
      )}
    </div>
  );
}
