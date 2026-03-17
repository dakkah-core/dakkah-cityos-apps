import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { extractUser, isTokenExpired } from "@cityos/auth";
import { SESSION_KEY } from "@/hooks/use-auth";

export default function AuthCallback() {
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    const state = params.get("state");
    const savedState = sessionStorage.getItem("pkce_state");
    const codeVerifier = sessionStorage.getItem("pkce_code_verifier");

    if (!code) { setError("No authorization code received"); return; }
    if (!state || !savedState || state !== savedState) { setError("State mismatch — possible CSRF attack"); return; }
    if (!codeVerifier) { setError("Missing PKCE code verifier"); return; }

    const realm = import.meta.env.VITE_KC_REALM || "dakkah";
    const clientId = import.meta.env.VITE_KC_CLIENT_ID || "web-platform";
    const baseUrl = import.meta.env.VITE_KC_BASE_URL || "";
    const redirectUri = `${window.location.origin}${import.meta.env.BASE_URL}callback`;

    if (!baseUrl) { setError("Keycloak base URL not configured"); return; }

    const tokenUrl = `${baseUrl}/realms/${realm}/protocol/openid-connect/token`;
    const body = new URLSearchParams({ grant_type: "authorization_code", client_id: clientId, code, redirect_uri: redirectUri, code_verifier: codeVerifier });

    fetch(tokenUrl, { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: body.toString() })
      .then((res) => res.json())
      .then((tokens) => {
        if (tokens.error) { setError(tokens.error_description || tokens.error); return; }
        const authTokens = { accessToken: tokens.access_token, refreshToken: tokens.refresh_token, idToken: tokens.id_token, expiresAt: Date.now() + tokens.expires_in * 1000 };
        localStorage.setItem("cityos_tokens", JSON.stringify(authTokens));

        if (!isTokenExpired(authTokens)) {
          const authUser = extractUser(authTokens.accessToken);
          const sessionUser = {
            id: authUser.id,
            name: authUser.name,
            email: authUser.email,
            roles: authUser.roles,
            isAuthenticated: true,
          };
          sessionStorage.setItem(SESSION_KEY, JSON.stringify(sessionUser));
        }

        sessionStorage.removeItem("pkce_state");
        sessionStorage.removeItem("pkce_code_verifier");
        window.location.assign(import.meta.env.BASE_URL || "/");
      })
      .catch((err) => setError(err.message));
  }, []);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <h2 className="text-xl font-bold text-red-500">Authentication Error</h2>
          <p className="text-muted-foreground">{error}</p>
          <a href={`${import.meta.env.BASE_URL}login`} className="inline-block px-4 py-2 bg-[var(--dt-primary-navy)] text-white rounded-lg">Back to Login</a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex items-center gap-3"><Loader2 className="h-6 w-6 animate-spin text-primary" /><span className="text-lg">Authenticating...</span></div>
    </div>
  );
}
