import { Menu, Search, Compass, LogOut, User, MapPin } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { NotificationBell } from "./NotificationBell";
import { useQuery } from "@tanstack/react-query";
import type { HealthStatus } from "@cityos/api-client-react";
import { apiClient } from "@/lib/api-client";

interface Props {
  onToggleThreads: () => void;
  onToggleDiscovery: () => void;
  onToggleSearch: () => void;
  onToggleCityContext: () => void;
}

export function Header({ onToggleThreads, onToggleDiscovery, onToggleSearch, onToggleCityContext }: Props) {
  const { user, logout } = useAuth();
  const { data: health } = useQuery<HealthStatus>({
    queryKey: ["/api/healthz"],
    queryFn: () => apiClient.get<HealthStatus>("/healthz"),
    refetchInterval: 30_000,
    retry: false,
  });
  const apiOnline = health?.status === "ok";

  return (
    <header className="h-14 border-b border-border bg-card flex items-center px-4 gap-3 flex-shrink-0">
      <button onClick={onToggleThreads} className="p-2 rounded-lg hover:bg-muted transition-colors lg:hidden" title="Conversations">
        <Menu className="h-5 w-5" />
      </button>

      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-[var(--navy)] flex items-center justify-center relative">
          <span className="text-[var(--primary)] text-sm font-bold">✦</span>
          <span className={`absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full border border-card ${apiOnline ? "bg-green-500" : "bg-muted-foreground"}`} title={apiOnline ? "API Online" : "API Status Unknown"} />
        </div>
        <div className="hidden sm:block">
          <div className="text-sm font-bold leading-none">Dakkah</div>
          <div className="text-[10px] text-muted-foreground leading-none mt-0.5">City Experience OS</div>
        </div>
      </div>

      <button
        onClick={onToggleSearch}
        className="hidden sm:flex items-center gap-2 flex-1 max-w-sm mx-4 px-3 py-1.5 rounded-lg border border-input bg-muted/50 text-muted-foreground text-sm hover:bg-muted transition-colors cursor-pointer"
      >
        <Search className="h-4 w-4" />
        <span className="flex-1 text-left">Ask Dakkah anything...</span>
        <kbd className="hidden md:inline-flex px-1.5 py-0.5 rounded border border-border bg-background text-[10px] font-mono">&#8984;K</kbd>
      </button>
      <button onClick={onToggleSearch} className="sm:hidden p-2 rounded-lg hover:bg-muted transition-colors" title="Search">
        <Search className="h-5 w-5 text-muted-foreground" />
      </button>

      <div className="flex-1 sm:hidden" />

      <button onClick={onToggleCityContext} className="p-2 rounded-lg hover:bg-muted transition-colors" title="City Context">
        <MapPin className="h-5 w-5 text-muted-foreground" />
      </button>
      <NotificationBell />
      <button onClick={onToggleDiscovery} className="p-2 rounded-lg bg-primary/10 hover:bg-primary/20 transition-colors" title="Discover Services">
        <Compass className="h-5 w-5 text-primary" />
      </button>

      {user && (
        <div className="flex items-center gap-2 ml-1">
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted border border-border">
            <User className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs font-medium text-muted-foreground">{user.name}</span>
          </div>
          <button onClick={logout} className="p-2 rounded-lg hover:bg-destructive/10 hover:text-destructive transition-colors" title="Logout">
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      )}
    </header>
  );
}
