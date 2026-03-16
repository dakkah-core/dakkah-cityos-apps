import { useAuth } from "@/hooks/use-auth";
import { TerminalSquare, Code, Webhook, Zap } from "lucide-react";

export function Login() {
  const { signInProduction, signInAsGuest } = useAuth();

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row relative">
      
      {/* Decorative Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent/20 blur-[120px] rounded-full pointer-events-none" />

      {/* Left side - Branding */}
      <div className="flex-1 p-8 md:p-16 flex flex-col justify-center relative z-10">
        <div className="max-w-xl mx-auto md:mx-0">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center border border-primary/30 shadow-[0_0_15px_var(--color-primary)]">
              <TerminalSquare className="w-6 h-6 text-primary" />
            </div>
            <h1 className="text-3xl font-bold font-mono tracking-tight text-foreground">
              Dakkah CityOS <span className="text-primary">Developer Portal</span>
            </h1>
          </div>
          
          <h2 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6 leading-tight">
            Build the future of <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-blue-400 to-accent">
              urban experiences.
            </span>
          </h2>
          
          <p className="text-lg md:text-xl text-muted-foreground mb-12 max-w-lg leading-relaxed">
            Access unified municipal APIs, deploy integrations, and converse with our developer copilot to write code faster.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="bg-card/50 border border-border p-5 rounded-2xl backdrop-blur-sm">
              <Webhook className="w-6 h-6 text-primary mb-3" />
              <h3 className="font-semibold text-foreground mb-1">Unified API Gateway</h3>
              <p className="text-sm text-muted-foreground">One token. Access Commerce, Transport, Healthcare and IoT.</p>
            </div>
            <div className="bg-card/50 border border-border p-5 rounded-2xl backdrop-blur-sm">
              <Zap className="w-6 h-6 text-accent mb-3" />
              <h3 className="font-semibold text-foreground mb-1">AI Copilot Powered</h3>
              <p className="text-sm text-muted-foreground">Skip the docs. Ask the AI to write your integration code instantly.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Login Box */}
      <div className="w-full md:w-[480px] bg-card border-l border-border p-8 md:p-12 flex flex-col justify-center relative z-10 shadow-2xl">
        <div className="bg-background border border-border p-8 rounded-2xl shadow-xl">
          <div className="text-center mb-8">
            <Code className="w-10 h-10 text-primary mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-foreground">Authenticate</h3>
            <p className="text-sm text-muted-foreground mt-2">Choose an environment to proceed</p>
          </div>

          <div className="space-y-4">
            <button
              onClick={signInProduction}
              className="w-full flex items-center justify-between p-4 rounded-xl border-2 border-primary/20 bg-primary/10 hover:bg-primary/20 hover:border-primary/50 transition-all group"
            >
              <div className="text-left">
                <span className="block font-semibold text-primary font-mono text-lg group-hover:translate-x-1 transition-transform">Production Dev</span>
                <span className="text-xs text-primary/70 font-mono mt-1 block">Full API Access & Registry</span>
              </div>
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                →
              </div>
            </button>

            <button
              onClick={signInAsGuest}
              className="w-full flex items-center justify-between p-4 rounded-xl border border-border bg-secondary hover:bg-secondary/80 hover:border-border/80 transition-all group"
            >
              <div className="text-left">
                <span className="block font-semibold text-foreground">Guest Sandbox</span>
                <span className="text-xs text-muted-foreground mt-1">Read-only exploration</span>
              </div>
              <div className="w-8 h-8 rounded-full bg-background flex items-center justify-center text-muted-foreground">
                →
              </div>
            </button>
          </div>

          <div className="mt-8 pt-6 border-t border-border text-center">
            <p className="text-xs text-muted-foreground">
              By authenticating, you agree to the CityOS <a href="#" className="text-primary hover:underline">API Terms of Service</a>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
