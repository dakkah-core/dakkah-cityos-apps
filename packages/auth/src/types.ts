export interface KeycloakConfig {
  realm: string;
  clientId: string;
  baseUrl: string;
  redirectUri: string;
  scopes?: string[];
}

export interface User {
  id: string;
  email: string;
  name: string;
  givenName?: string;
  familyName?: string;
  roles: string[];
  tenantId?: string;
  avatar?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  idToken?: string;
  expiresAt: number;
}

export type AuthState =
  | { status: "loading" }
  | { status: "unauthenticated" }
  | { status: "authenticated"; user: User; tokens: AuthTokens };
