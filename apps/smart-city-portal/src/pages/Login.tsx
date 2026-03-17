import React, { useState } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { User, Shield, ArrowRight, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

export default function Login() {
  const [, setLocation] = useLocation();
  const { loginAsGuest, signInWithKeycloak, isAuthenticated } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  // Redirect if already logged in
  React.useEffect(() => {
    if (isAuthenticated) {
      setLocation("/dashboard");
    }
  }, [isAuthenticated, setLocation]);

  const handleGuestLogin = () => {
    setIsLoading(true);
    // Fake delay for effect
    setTimeout(() => {
      loginAsGuest();
      setLocation("/dashboard");
    }, 800);
  };

  return (
    <div className="flex min-h-screen bg-background text-foreground selection:bg-primary/20">
      {/* Left side - Visual/Branding */}
      <div className="relative hidden w-1/2 lg:flex flex-col justify-between overflow-hidden bg-slate-900">
        <div className="absolute inset-0 bg-primary/20 mix-blend-multiply z-10" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/60 to-transparent z-10" />
        
        <img
          src={`${import.meta.env.BASE_URL}images/civic-hero.png`}
          alt="Smart City Hero"
          className="absolute inset-0 h-full w-full object-cover object-center"
        />

        <div className="relative z-20 p-12 mt-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
          >
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-2xl mb-8">
              <img src={`${import.meta.env.BASE_URL}images/logo-mark.png`} alt="Logo" className="h-10 w-10 object-contain" />
            </div>
            <h1 className="text-5xl font-display font-bold text-white mb-6 leading-tight">
              Your City.<br/>
              Your Services.<br/>
              One Portal.
            </h1>
            <p className="text-lg text-slate-300 max-w-md">
              Dakkah CityOS brings municipal services directly to you. Powered by an intelligent Copilot to make city living effortless.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Right side - Login Form */}
      <div className="flex w-full lg:w-1/2 flex-col items-center justify-center p-8 sm:p-12 md:p-16">
        <div className="w-full max-w-[420px] mx-auto space-y-10">
          
          <div className="text-center lg:text-left space-y-3">
            <h2 className="text-3xl font-display font-bold tracking-tight">Welcome back</h2>
            <p className="text-muted-foreground text-lg">Sign in to your citizen account</p>
          </div>

          <Card className="border-border/60 shadow-xl shadow-black/5 bg-card/50 backdrop-blur-sm">
            <CardContent className="p-8 space-y-6">
              <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-foreground">National ID / Email</label>
                  <Input placeholder="Enter your ID or Email" className="bg-background/80" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-foreground">Password</label>
                  <Input type="password" placeholder="••••••••" className="bg-background/80" />
                </div>
                
                <Button className="w-full h-12 text-base mt-2" variant="civic" onClick={() => signInWithKeycloak()}>
                  Sign In with Keycloak <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </form>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border/80"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="bg-card px-4 text-muted-foreground font-medium">Or continue as</span>
                </div>
              </div>

              <Button 
                variant="secondary" 
                className="w-full h-12 text-base" 
                onClick={handleGuestLogin}
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                ) : (
                  <User className="mr-2 h-5 w-5 text-primary" />
                )}
                Guest / Demo Access
              </Button>
            </CardContent>
          </Card>

          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Shield className="h-4 w-4" />
            <span>Secure municipal portal</span>
          </div>
        </div>
      </div>
    </div>
  );
}
