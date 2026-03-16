import type { User, AuthTokens } from "./types";

export function decodeJwt(token: string): Record<string, unknown> {
  const parts = token.split(".");
  if (parts.length !== 3) throw new Error("Invalid JWT format");
  const payload = parts[1];
  const padded = payload + "=".repeat((4 - (payload.length % 4)) % 4);
  const decoded = atob(padded.replace(/-/g, "+").replace(/_/g, "/"));
  return JSON.parse(decoded);
}

export function extractUser(accessToken: string): User {
  const claims = decodeJwt(accessToken);
  const realmRoles = ((claims.realm_access as any)?.roles as string[]) || [];
  const clientRoles = Object.values((claims.resource_access as Record<string, any>) || {})
    .flatMap((r: any) => (r.roles as string[]) || []);

  return {
    id: (claims.sub as string) || "",
    email: (claims.email as string) || "",
    name: (claims.name as string) || (claims.preferred_username as string) || "",
    givenName: claims.given_name as string | undefined,
    familyName: claims.family_name as string | undefined,
    roles: [...new Set([...realmRoles, ...clientRoles])],
    tenantId: claims.tenant_id as string | undefined,
    avatar: claims.picture as string | undefined,
  };
}

export function isTokenExpired(tokens: AuthTokens, bufferMs = 30000): boolean {
  return Date.now() >= tokens.expiresAt - bufferMs;
}

export function buildAuthorizationUrl(config: {
  baseUrl: string;
  realm: string;
  clientId: string;
  redirectUri: string;
  codeChallenge: string;
  state: string;
  scopes?: string[];
}): string {
  const params = new URLSearchParams({
    response_type: "code",
    client_id: config.clientId,
    redirect_uri: config.redirectUri,
    code_challenge: config.codeChallenge,
    code_challenge_method: "S256",
    state: config.state,
    scope: (config.scopes || ["openid", "profile", "email"]).join(" "),
  });
  return `${config.baseUrl}/realms/${config.realm}/protocol/openid-connect/auth?${params}`;
}

export function buildTokenUrl(config: { baseUrl: string; realm: string }): string {
  return `${config.baseUrl}/realms/${config.realm}/protocol/openid-connect/token`;
}

export function buildLogoutUrl(config: {
  baseUrl: string;
  realm: string;
  idToken?: string;
  redirectUri?: string;
}): string {
  const params = new URLSearchParams();
  if (config.idToken) params.set("id_token_hint", config.idToken);
  if (config.redirectUri) params.set("post_logout_redirect_uri", config.redirectUri);
  return `${config.baseUrl}/realms/${config.realm}/protocol/openid-connect/logout?${params}`;
}

export async function exchangeCodeForTokens(config: {
  baseUrl: string;
  realm: string;
  clientId: string;
  redirectUri: string;
  code: string;
  codeVerifier: string;
}): Promise<AuthTokens> {
  const tokenUrl = buildTokenUrl(config);
  const body = new URLSearchParams({
    grant_type: "authorization_code",
    client_id: config.clientId,
    redirect_uri: config.redirectUri,
    code: config.code,
    code_verifier: config.codeVerifier,
  });

  const res = await fetch(tokenUrl, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Token exchange failed: ${res.status} ${text}`);
  }

  const data = await res.json();
  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    idToken: data.id_token,
    expiresAt: Date.now() + (data.expires_in as number) * 1000,
  };
}

export async function refreshTokens(config: {
  baseUrl: string;
  realm: string;
  clientId: string;
  refreshToken: string;
}): Promise<AuthTokens> {
  const tokenUrl = buildTokenUrl(config);
  const body = new URLSearchParams({
    grant_type: "refresh_token",
    client_id: config.clientId,
    refresh_token: config.refreshToken,
  });

  const res = await fetch(tokenUrl, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  });

  if (!res.ok) {
    throw new Error(`Token refresh failed: ${res.status}`);
  }

  const data = await res.json();
  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    idToken: data.id_token,
    expiresAt: Date.now() + (data.expires_in as number) * 1000,
  };
}
