import { ReactNode } from "react";
import { AICopilot } from "./AICopilot";
import { useAuth } from "@/hooks/use-auth";
import { Link } from "wouter";
import { TerminalSquare, LogOut, Code2, AppWindow, FileJson } from "lucide-react";

export function Layout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row overflow-hidden selection:bg-primary/30">
      
      {/* Mobile Header (Hidden on Desktop) */}
      <header className="md:hidden flex items-center justify-between p-4 border-b border-border bg-card z-20">
        <div className="flex items-center gap-2">
          <TerminalSquare className="w-6 h-6 text-primary" />
          <span className="font-bold font-mono">CityOS Dev</span>
        </div>
        <button onClick={logout} className="p-2 text-muted-foreground">
          <LogOut className="w-5 h-5" />
        </button>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-[calc(100vh-65px)] md:h-screen overflow-hidden">
        {/* Desktop Header */}
        <header className="hidden md:flex items-center justify-between px-8 py-4 border-b border-border bg-card/80 backdrop-blur z-10">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <TerminalSquare className="w-7 h-7 text-primary" />
              <span className="text-xl font-bold font-mono tracking-tight text-foreground">Dakkah CityOS <span className="text-primary">Dev</span></span>
            </Link>
            
            <nav className="flex items-center gap-4 ml-8">
              <Link href="/" className="text-sm font-medium text-foreground hover:text-primary transition-colors flex items-center gap-2">
                <AppWindow className="w-4 h-4" /> Dashboard
              </Link>
              <Link href="/docs" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors flex items-center gap-2">
                <FileJson className="w-4 h-4" /> API Ref
              </Link>
              <Link href="/apps" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors flex items-center gap-2">
                <Code2 className="w-4 h-4" /> My Apps
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 px-3 py-1.5 rounded-full bg-secondary border border-border">
              <img src={user?.avatar} alt="Avatar" className="w-6 h-6 rounded-full bg-background" />
              <span className="text-sm font-medium font-mono text-muted-foreground">{user?.name}</span>
            </div>
            <button 
              onClick={logout}
              className="text-muted-foreground hover:text-destructive transition-colors p-2 rounded-lg hover:bg-destructive/10"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Scrollable Main Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 w-full max-w-6xl mx-auto">
          {children}
        </main>
      </div>

      {/* Right Sidebar Copilot (Desktop) & Bottom Drawer (Mobile overlay conceptual) */}
      <aside className="w-full md:w-[400px] lg:w-[450px] shrink-0 border-t md:border-t-0 md:border-l border-border h-[60vh] md:h-screen z-30">
        <AICopilot />
      </aside>

    </div>
  );
}
