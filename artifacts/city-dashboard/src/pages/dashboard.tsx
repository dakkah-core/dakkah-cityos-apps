import React from "react";
import { useAuth } from "@/hooks/use-auth";
import { useDashboardSdui } from "@/hooks/use-sdui";
import { CopilotPanel } from "@/components/copilot/CopilotPanel";
import { SduiRenderer } from "@/components/sdui/SduiRenderer";
import { Building2, LogOut, Menu, Bell, Loader2, AlertCircle } from "lucide-react";
import { useLocation } from "wouter";

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [, setLocation] = useLocation();
  const { data: sduiNode, isLoading, error } = useDashboardSdui();

  const handleLogout = () => {
    logout();
    setLocation("/login");
  };

  return (
    <div className="h-screen w-full flex flex-col md:flex-row bg-background overflow-hidden">
      
      {/* Main Content Area (Left) */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Top App Bar */}
        <header className="h-16 shrink-0 border-b border-border bg-card/50 backdrop-blur-md flex items-center justify-between px-4 lg:px-6 z-10">
          <div className="flex items-center gap-3">
            <button className="md:hidden p-2 -ml-2 text-muted-foreground hover:text-foreground">
              <Menu className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-2 text-primary">
              <Building2 className="h-5 w-5" />
              <span className="font-bold tracking-tight hidden sm:inline-block">Dakkah CityOS</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button className="relative p-2 text-muted-foreground hover:text-foreground transition-colors rounded-full hover:bg-secondary">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-destructive border-2 border-card"></span>
            </button>
            
            <div className="h-8 w-px bg-border mx-2 hidden sm:block"></div>
            
            <div className="hidden sm:flex items-center gap-3">
              <div className="text-right">
                <p className="text-sm font-medium text-foreground leading-none">{user?.name}</p>
                <p className="text-xs text-muted-foreground mt-1 font-mono">ID: {user?.id}</p>
              </div>
              <div className="h-9 w-9 rounded-lg bg-secondary border border-border flex items-center justify-center font-bold text-sm text-foreground">
                {user?.name.charAt(0)}
              </div>
            </div>

            <button 
              onClick={handleLogout}
              className="p-2 text-muted-foreground hover:text-destructive transition-colors rounded-lg hover:bg-destructive/10 ml-2"
              title="Sign out"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </header>

        {/* Dashboard Content - Scrollable */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          <div className="max-w-5xl mx-auto space-y-6">
            <div className="flex items-end justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-foreground">Operations Center</h1>
                <p className="text-muted-foreground mt-1">Real-time telemetry and management.</p>
              </div>
              <div className="hidden md:flex items-center gap-2 text-xs font-mono text-muted-foreground bg-secondary px-3 py-1.5 rounded-full border border-border">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                SYSTEM LIVE
              </div>
            </div>

            {isLoading ? (
              <div className="flex flex-col items-center justify-center h-[50vh] text-muted-foreground gap-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="font-mono text-sm">Initializing command center modules...</p>
              </div>
            ) : error ? (
              <div className="p-6 rounded-xl border border-destructive/50 bg-destructive/10 text-destructive flex flex-col items-center text-center gap-3">
                <AlertCircle className="h-10 w-10" />
                <div>
                  <h3 className="font-bold text-lg">System Unavailable</h3>
                  <p className="text-sm opacity-80 mt-1">Failed to connect to the SDUI rendering engine.</p>
                </div>
              </div>
            ) : sduiNode ? (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <SduiRenderer node={sduiNode} />
              </div>
            ) : null}
          </div>
        </main>
      </div>

      {/* Copilot Panel (Right) */}
      <CopilotPanel />
      
    </div>
  );
}
