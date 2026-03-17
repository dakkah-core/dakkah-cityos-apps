import { useDevPortalSDUI } from "@/hooks/use-sdui";
import { SDUIRenderer } from "@/components/SDUIRenderer";
import { Loader2, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";

export function Dashboard() {
  const { data: sduiNode, isLoading, error } = useDevPortalSDUI();

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[400px]">
        <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
        <p className="text-muted-foreground font-mono animate-pulse">Compiling dashboard layout...</p>
      </div>
    );
  }

  if (error || !sduiNode) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center max-w-md mx-auto">
        <div className="w-16 h-16 bg-destructive/20 rounded-full flex items-center justify-center mb-6 border border-destructive/30">
          <AlertCircle className="w-8 h-8 text-destructive" />
        </div>
        <h2 className="text-xl font-bold text-foreground mb-2">Failed to load interface</h2>
        <p className="text-muted-foreground mb-6">
          Could not fetch SDUI layout from the API server.
        </p>
        <button 
          onClick={() => window.location.reload()}
          className="px-6 py-2 bg-secondary text-foreground rounded-lg border border-border hover:bg-secondary/80 font-mono"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      transition={{ duration: 0.5 }}
      className="pb-12"
    >
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-foreground font-mono mb-2">
          Environment Overview
        </h1>
        <p className="text-muted-foreground text-lg">
          Manage your API integrations and application credentials.
        </p>
      </div>
      
      {/* SDUI Content starts here */}
      <SDUIRenderer node={sduiNode} />
    </motion.div>
  );
}
