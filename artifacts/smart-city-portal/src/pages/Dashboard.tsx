import React, { useEffect } from "react";
import { useLocation } from "wouter";
import { Loader2, RefreshCw, AlertCircle } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useDashboardSdui } from "@/hooks/use-sdui";
import { Header } from "@/components/layout/Header";
import { ChatPanel } from "@/components/chat/ChatPanel";
import { SduiRenderer } from "@/components/sdui/SduiRenderer";
import { Button } from "@/components/ui/button";

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const { isAuthenticated } = useAuth();
  const { data: sduiNode, isLoading, isError, refetch } = useDashboardSdui();

  // Protect route
  useEffect(() => {
    if (!isAuthenticated) {
      setLocation("/");
    }
  }, [isAuthenticated, setLocation]);

  if (!isAuthenticated) return null;

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden selection:bg-primary/20 text-foreground">
      
      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden min-w-0">
        <Header />
        
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 scroll-smooth">
          <div className="mx-auto max-w-5xl space-y-8 pb-24 md:pb-8">
            
            {/* Page Header */}
            <div>
              <h1 className="text-3xl font-display font-bold tracking-tight text-foreground">
                Good Morning, Citizen
              </h1>
              <p className="text-muted-foreground mt-1 text-lg">
                Here is your personalized city overview.
              </p>
            </div>

            {/* SDUI Content */}
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-4">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
                <p className="font-medium">Loading your city portal...</p>
              </div>
            ) : isError ? (
              <div className="flex flex-col items-center justify-center py-20 text-center gap-4 bg-destructive/5 rounded-2xl border border-destructive/20 p-8">
                <AlertCircle className="h-12 w-12 text-destructive" />
                <div>
                  <h3 className="text-lg font-semibold text-destructive">Failed to load portal data</h3>
                  <p className="text-muted-foreground max-w-md mx-auto mt-1">
                    We couldn't reach the city servers. Please ensure the backend API is running.
                  </p>
                </div>
                <Button onClick={() => refetch()} variant="outline" className="mt-2">
                  <RefreshCw className="mr-2 h-4 w-4" /> Try Again
                </Button>
              </div>
            ) : sduiNode ? (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out fill-mode-both">
                <SduiRenderer node={sduiNode} />
              </div>
            ) : null}

          </div>
        </main>
      </div>

      {/* AI Copilot Sidebar */}
      <ChatPanel className="flex-shrink-0 w-full sm:w-[400px] lg:w-[450px]" />
    </div>
  );
}
