import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/hooks/use-auth";
import { useDashboardSDUI } from "@/hooks/use-sdui";
import { SDUIRenderer } from "@/components/sdui/SDUIRenderer";
import { ChatPanel } from "@/components/ChatPanel";
import { Loader2, LogOut, Menu, X, LayoutDashboard, Bell, Settings } from "lucide-react";

export default function Dashboard() {
  const { user, logout } = useAuth();
  const { data: sduiScreen, isLoading, error } = useDashboardSDUI();
  const [mobileChatOpen, setMobileChatOpen] = useState(false);

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden selection:bg-accent/30 selection:text-foreground">
      
      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col h-full relative overflow-hidden">
        
        {/* Top Navigation */}
        <header className="h-16 border-b border-border/50 bg-background/80 backdrop-blur-md flex items-center justify-between px-4 sm:px-6 z-20">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center text-accent-foreground shadow-md">
              <LayoutDashboard className="w-5 h-5" />
            </div>
            <h1 className="font-display font-bold text-xl hidden sm:block">Dakkah Business</h1>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            <button className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-secondary transition-colors relative">
              <Bell className="w-5 h-5 text-muted-foreground" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-destructive rounded-full border border-background"></span>
            </button>
            <div className="h-6 w-px bg-border/50 hidden sm:block"></div>
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <div className="font-bold text-sm">{user?.name}</div>
                <div className="text-xs text-muted-foreground uppercase tracking-wider">{user?.roles?.[0]?.replace('_', ' ') ?? 'merchant'}</div>
              </div>
              <div className="w-9 h-9 rounded-full bg-secondary overflow-hidden border border-border">
                <img src={`https://api.dicebear.com/7.x/initials/svg?seed=${user?.name}`} alt="Avatar" />
              </div>
            </div>
            <button onClick={logout} className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-destructive/10 hover:text-destructive transition-colors ml-1" title="Logout">
              <LogOut className="w-5 h-5" />
            </button>
            
            {/* Mobile Chat Toggle */}
            <button 
              className="w-10 h-10 rounded-full flex items-center justify-center bg-primary text-primary-foreground lg:hidden ml-1 shadow-md shadow-primary/20"
              onClick={() => setMobileChatOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Dashboard Content (SDUI) */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 relative">
          <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />
          
          <div className="max-w-6xl mx-auto relative z-10">
            <div className="mb-8">
              <h2 className="text-3xl font-display font-bold text-foreground">Welcome back, {user?.name.split(' ')[0]}</h2>
              <p className="text-muted-foreground mt-1 text-lg">Here's what's happening across your locations today.</p>
            </div>

            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
                <Loader2 className="w-10 h-10 animate-spin mb-4 text-accent" />
                <p className="font-medium animate-pulse">Loading operations data...</p>
              </div>
            ) : error ? (
              <div className="p-6 bg-destructive/10 border border-destructive/20 text-destructive rounded-2xl max-w-lg">
                <h3 className="font-bold text-lg mb-2">Connection Error</h3>
                <p>Unable to connect to Dakkah API. Please ensure the backend services are running.</p>
              </div>
            ) : (
              <motion.div 
                initial="hidden"
                animate="visible"
                variants={{
                  visible: { transition: { staggerChildren: 0.1 } }
                }}
              >
                <SDUIRenderer component={sduiScreen} />
              </motion.div>
            )}
          </div>
        </main>
      </div>

      {/* DESKTOP CHAT PANEL (Sidebar) */}
      <div className="hidden lg:block w-[400px] xl:w-[450px] flex-shrink-0 z-30 shadow-[-10px_0_30px_-15px_rgba(0,0,0,0.1)]">
        <ChatPanel />
      </div>

      {/* MOBILE CHAT PANEL (Slide-over) */}
      <AnimatePresence>
        {mobileChatOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileChatOpen(false)}
              className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 lg:hidden"
            />
            <motion.div 
              initial={{ x: "100%", boxShadow: "none" }}
              animate={{ x: 0, boxShadow: "-20px 0 50px -20px rgba(0,0,0,0.3)" }}
              exit={{ x: "100%", boxShadow: "none" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 right-0 w-full sm:w-[400px] bg-background z-50 lg:hidden flex flex-col"
            >
              <div className="absolute top-4 right-4 z-50">
                <button 
                  onClick={() => setMobileChatOpen(false)}
                  className="w-10 h-10 bg-background/50 backdrop-blur border border-border rounded-full flex items-center justify-center hover:bg-secondary text-foreground"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <ChatPanel />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
