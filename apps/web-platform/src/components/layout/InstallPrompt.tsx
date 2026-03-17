import { useState, useEffect } from "react";
import { Download, X } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [dismissed, setDismissed] = useState(() => sessionStorage.getItem("pwa_install_dismissed") === "true");

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  if (!deferredPrompt || dismissed) return null;

  const handleInstall = async () => {
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setDeferredPrompt(null);
    }
  };

  const handleDismiss = () => {
    setDismissed(true);
    sessionStorage.setItem("pwa_install_dismissed", "true");
  };

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-card border border-border rounded-xl shadow-lg p-4 z-50 animate-in slide-in-from-bottom-4">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-lg bg-[var(--navy)] flex items-center justify-center flex-shrink-0">
          <span className="text-[var(--primary)] font-bold">✦</span>
        </div>
        <div className="flex-1">
          <div className="text-sm font-bold">Install Dakkah CityOS</div>
          <div className="text-xs text-muted-foreground mt-0.5">Get offline access, push notifications, and a native app experience.</div>
          <div className="flex gap-2 mt-3">
            <button onClick={handleInstall} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--navy)] text-white text-xs font-medium hover:opacity-90 transition-opacity">
              <Download className="h-3.5 w-3.5" /> Install
            </button>
            <button onClick={handleDismiss} className="px-3 py-1.5 rounded-lg text-xs text-muted-foreground hover:bg-muted transition-colors">
              Not now
            </button>
          </div>
        </div>
        <button onClick={handleDismiss} className="p-1 rounded hover:bg-muted">
          <X className="h-4 w-4 text-muted-foreground" />
        </button>
      </div>
    </div>
  );
}
