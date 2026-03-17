import { useAuth } from "@/hooks/use-auth";
import { Shield, Fingerprint } from "lucide-react";

export default function Login() {
  const { signInWithKeycloak, signInAsGuest } = useAuth();

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-[var(--navy)] flex items-center justify-center mx-auto mb-4">
            <span className="text-[var(--primary)] text-2xl font-bold">✦</span>
          </div>
          <h1 className="text-2xl font-bold">Dakkah CityOS</h1>
          <p className="text-muted-foreground mt-1">Your city. One conversation.</p>
        </div>

        <div className="space-y-3">
          <button
            onClick={signInWithKeycloak}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[var(--navy)] text-white font-medium hover:opacity-90 transition-opacity"
          >
            <Shield className="h-5 w-5" />
            Sign in with Keycloak
          </button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border" /></div>
            <div className="relative flex justify-center text-xs"><span className="bg-background px-2 text-muted-foreground">or</span></div>
          </div>

          <button
            onClick={signInAsGuest}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-border text-foreground font-medium hover:bg-muted transition-colors"
          >
            <Fingerprint className="h-5 w-5" />
            Continue as Guest
          </button>
        </div>

        <p className="text-xs text-muted-foreground text-center">
          By signing in, you agree to our{" "}
          <a href={`${import.meta.env.BASE_URL}terms`} className="text-primary hover:underline">Terms</a> and{" "}
          <a href={`${import.meta.env.BASE_URL}privacy`} className="text-primary hover:underline">Privacy Policy</a>.
        </p>
      </div>
    </div>
  );
}
