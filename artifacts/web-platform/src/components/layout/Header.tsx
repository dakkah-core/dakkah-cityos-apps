import { Menu, Search, Bell, Compass, LogOut, User } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";

interface Props {
  onToggleThreads: () => void;
  onToggleDiscovery: () => void;
  onToggleSearch: () => void;
}

export function Header({ onToggleThreads, onToggleDiscovery, onToggleSearch }: Props) {
  const { user, logout } = useAuth();

  return (
    <header className="h-14 border-b border-border bg-card flex items-center px-4 gap-3 flex-shrink-0">
      <button onClick={onToggleThreads} className="p-2 rounded-lg hover:bg-muted transition-colors lg:hidden" title="Conversations">
        <Menu className="h-5 w-5" />
      </button>

      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-[var(--navy)] flex items-center justify-center">
          <span className="text-[var(--primary)] text-sm font-bold">✦</span>
        </div>
        <div className="hidden sm:block">
          <div className="text-sm font-bold leading-none">Dakkah</div>
          <div className="text-[10px] text-muted-foreground leading-none mt-0.5">City Experience OS</div>
        </div>
      </div>

      <div className="flex-1" />

      <button onClick={onToggleSearch} className="p-2 rounded-lg hover:bg-muted transition-colors" title="Search">
        <Search className="h-5 w-5 text-muted-foreground" />
      </button>
      <button className="p-2 rounded-lg hover:bg-muted transition-colors relative" title="Notifications">
        <Bell className="h-5 w-5 text-muted-foreground" />
        <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
      </button>
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
