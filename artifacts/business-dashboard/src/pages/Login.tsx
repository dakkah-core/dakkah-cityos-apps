import React from "react";
import { useAuth } from "@/hooks/use-auth";
import { Loader2, LayoutDashboard, ArrowRight, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

export default function Login() {
  const { loginAsGuest, isLoading } = useAuth();
  
  const bgUrl = `${import.meta.env.BASE_URL}images/login-bg.png`;

  return (
    <div className="min-h-screen w-full flex bg-background">
      
      {/* Left Column - Form */}
      <div className="w-full lg:w-[45%] flex flex-col justify-center px-8 sm:px-16 lg:px-24 relative z-10">
        
        <div className="w-12 h-12 rounded-xl bg-accent text-accent-foreground flex items-center justify-center shadow-lg shadow-accent/20 mb-10">
          <LayoutDashboard className="w-6 h-6" />
        </div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl sm:text-5xl font-display font-bold text-foreground tracking-tight mb-4">
            Dakkah Business
          </h1>
          <p className="text-lg text-muted-foreground mb-10 max-w-md">
            The intelligent command center for modern multi-location enterprises. Access real-time insights via conversational AI.
          </p>
          
          <div className="bg-card border border-border/50 p-6 sm:p-8 rounded-2xl shadow-xl shadow-black/5 max-w-md">
            <h2 className="text-xl font-bold text-foreground mb-6">Sign In</h2>
            
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Email address</label>
                <input 
                  type="email" 
                  disabled
                  placeholder="name@company.com" 
                  className="w-full px-4 py-3 bg-secondary/50 border border-border rounded-xl text-foreground opacity-50 cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Password</label>
                <input 
                  type="password" 
                  disabled
                  placeholder="••••••••" 
                  className="w-full px-4 py-3 bg-secondary/50 border border-border rounded-xl text-foreground opacity-50 cursor-not-allowed"
                />
              </div>
            </div>

            <button 
              disabled
              className="w-full py-3.5 rounded-xl font-bold bg-muted text-muted-foreground cursor-not-allowed mb-4 flex items-center justify-center"
            >
              Sign In with Credentials
            </button>
            
            <div className="relative flex items-center py-2">
              <div className="flex-grow border-t border-border"></div>
              <span className="flex-shrink-0 mx-4 text-muted-foreground text-sm font-medium">Or</span>
              <div className="flex-grow border-t border-border"></div>
            </div>

            <button
              onClick={loginAsGuest}
              disabled={isLoading}
              className="w-full mt-4 py-3.5 rounded-xl font-bold bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2 group"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Authenticating...
                </>
              ) : (
                <>
                  Continue as Demo Merchant
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
            <p className="text-center text-xs text-muted-foreground mt-4">
              Bypasses standard SSO for demonstration purposes
            </p>
          </div>
        </motion.div>
        
        <div className="mt-auto pt-20 text-sm text-muted-foreground font-medium">
          &copy; {new Date().getFullYear()} Dakkah CityOS. All rights reserved.
        </div>
      </div>

      {/* Right Column - Image */}
      <div className="hidden lg:block lg:w-[55%] relative overflow-hidden bg-primary p-4">
        <div className="absolute inset-0 bg-primary/20 z-10 mix-blend-multiply"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent z-10"></div>
        <div className="absolute inset-0 bg-gradient-to-l from-transparent via-transparent to-background z-10"></div>
        <img 
          src={bgUrl} 
          alt="Luxury Architecture" 
          className="w-full h-full object-cover rounded-3xl"
        />
        
        {/* Floating elements overlay */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="absolute bottom-20 left-16 z-20 glass-panel p-6 rounded-2xl border border-white/10 max-w-sm"
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center text-accent">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-white text-lg">AI-Powered Insights</h3>
              <p className="text-white/70 text-sm">Ask your copilot anything</p>
            </div>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-white/90 text-sm italic">
            "Your highest performing location today is Downtown, driven by an 18% increase in morning coffee orders."
          </div>
        </motion.div>
      </div>
    </div>
  );
}
