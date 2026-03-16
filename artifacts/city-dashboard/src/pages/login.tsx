import React from "react";
import { useAuth } from "@/hooks/use-auth";
import { Building2, ArrowRight } from "lucide-react";
import { useLocation } from "wouter";

export default function Login() {
  const { loginAsGuest } = useAuth();
  const [, setLocation] = useLocation();

  const handleLogin = () => {
    loginAsGuest();
    setLocation("/");
  };

  return (
    <div className="min-h-screen w-full flex bg-background">
      {/* Left panel - Image */}
      <div className="hidden lg:flex w-1/2 relative flex-col justify-between p-12 border-r border-border overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-background/80 z-10 backdrop-blur-[2px]"></div>
          {/* using the generated image */}
          <img 
            src={`${import.meta.env.BASE_URL}images/login-bg.png`} 
            alt="City Operations Network" 
            className="w-full h-full object-cover"
          />
        </div>
        
        <div className="relative z-20 flex items-center gap-3 text-primary">
          <div className="p-2 bg-primary/10 rounded-lg border border-primary/20">
            <Building2 className="h-6 w-6" />
          </div>
          <span className="font-bold text-xl tracking-tight text-white">Dakkah CityOS</span>
        </div>

        <div className="relative z-20 max-w-md">
          <h1 className="text-4xl font-bold text-white mb-4 leading-tight">
            Universal Municipal Command Center
          </h1>
          <p className="text-lg text-slate-300">
            AI-powered operations, real-time telemetry, and automated incident response for the modern smart city.
          </p>
        </div>
      </div>

      {/* Right panel - Login form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8">
          <div className="lg:hidden flex items-center gap-3 text-primary mb-8">
            <div className="p-2 bg-primary/10 rounded-lg border border-primary/20">
              <Building2 className="h-6 w-6" />
            </div>
            <span className="font-bold text-xl tracking-tight text-white">Dakkah CityOS</span>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-foreground tracking-tight">Admin Portal Access</h2>
            <p className="text-muted-foreground mt-2">Sign in to access the city operations dashboard.</p>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Email or ID</label>
              <input 
                type="text" 
                placeholder="admin@city.gov" 
                className="w-full px-4 py-3 rounded-xl bg-secondary/50 border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                disabled
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Password</label>
              <input 
                type="password" 
                placeholder="••••••••" 
                className="w-full px-4 py-3 rounded-xl bg-secondary/50 border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                disabled
              />
            </div>

            <div className="pt-4 space-y-4">
              <button 
                disabled
                className="w-full px-4 py-3 rounded-xl bg-secondary text-muted-foreground border border-border font-medium cursor-not-allowed"
              >
                Sign In (SSO Required)
              </button>
              
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">Demo Access</span>
                </div>
              </div>

              <button 
                onClick={handleLogin}
                className="group w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 hover:shadow-primary/30"
              >
                Continue as Guest Admin
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
