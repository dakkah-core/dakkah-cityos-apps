import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import jwksRsa from "jwks-rsa";

const KEYCLOAK_BASE_URL = process.env.KEYCLOAK_URL || "https://auth.dakkah.city";
const KEYCLOAK_REALM = process.env.KEYCLOAK_REALM || "cityos";
const KEYCLOAK_ISSUER = `${KEYCLOAK_BASE_URL}/realms/${KEYCLOAK_REALM}`;
const JWKS_URI = `${KEYCLOAK_ISSUER}/protocol/openid-connect/certs`;

const jwksClient = jwksRsa({
  jwksUri: JWKS_URI,
  cache: true,
  cacheMaxAge: 600000,
  rateLimit: true,
  jwksRequestsPerMinute: 10,
});

function getSigningKey(header: jwt.JwtHeader): Promise<string> {
  return new Promise((resolve, reject) => {
    jwksClient.getSigningKey(header.kid, (err: Error | null, key: jwksRsa.SigningKey | undefined) => {
      if (err) return reject(err);
      const signingKey = key?.getPublicKey();
      if (!signingKey) return reject(new Error("No signing key found"));
      resolve(signingKey);
    });
  });
}

export interface AuthenticatedRequest extends Request {
  userId: string;
  userRoles: string[];
  tenantId?: string;
}

async function verifyJwt(token: string): Promise<{ sub: string; realm_access?: { roles?: string[] }; tenant_id?: string }> {
  const decoded = jwt.decode(token, { complete: true });
  if (!decoded || !decoded.header) {
    throw new Error("Invalid token structure");
  }

  try {
    const signingKey = await getSigningKey(decoded.header);
    const verifyOptions: jwt.VerifyOptions = {
      issuer: KEYCLOAK_ISSUER,
      algorithms: ["RS256"],
    };
    if (process.env.KEYCLOAK_AUDIENCE) {
      verifyOptions.audience = process.env.KEYCLOAK_AUDIENCE;
    }
    return jwt.verify(token, signingKey, verifyOptions) as { sub: string; realm_access?: { roles?: string[] }; tenant_id?: string };
  } catch (verifyErr) {
    if (process.env.NODE_ENV === "development" || process.env.ALLOW_DEV_TOKENS === "true") {
      const payload = decoded.payload as { sub?: string; realm_access?: { roles?: string[] }; tenant_id?: string };
      if (payload.sub) {
        return payload as { sub: string; realm_access?: { roles?: string[] }; tenant_id?: string };
      }
    }
    throw verifyErr;
  }
}

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith("Bearer ")) {
    res.status(401).json({ success: false, error: { code: "UNAUTHORIZED", message: "Bearer token required" } });
    return;
  }

  const token = auth.slice(7);
  verifyJwt(token)
    .then((payload) => {
      (req as AuthenticatedRequest).userId = payload.sub;
      (req as AuthenticatedRequest).userRoles = payload.realm_access?.roles || [];
      (req as AuthenticatedRequest).tenantId = payload.tenant_id;
      next();
    })
    .catch(() => {
      res.status(401).json({ success: false, error: { code: "INVALID_TOKEN", message: "Token verification failed" } });
    });
}

export function optionalAuth(req: Request, _res: Response, next: NextFunction): void {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith("Bearer ")) {
    (req as AuthenticatedRequest).userId = "anonymous";
    (req as AuthenticatedRequest).userRoles = [];
    next();
    return;
  }

  const token = auth.slice(7);
  verifyJwt(token)
    .then((payload) => {
      (req as AuthenticatedRequest).userId = payload.sub;
      (req as AuthenticatedRequest).userRoles = payload.realm_access?.roles || [];
      (req as AuthenticatedRequest).tenantId = payload.tenant_id;
      next();
    })
    .catch(() => {
      (req as AuthenticatedRequest).userId = "anonymous";
      (req as AuthenticatedRequest).userRoles = [];
      next();
    });
}

export function requireRole(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const userRoles = (req as AuthenticatedRequest).userRoles || [];
    const hasRole = roles.some((r) => userRoles.includes(r));
    if (!hasRole) {
      res.status(403).json({ success: false, error: { code: "FORBIDDEN", message: "Insufficient permissions" } });
      return;
    }
    next();
  };
}

export function getUserIdFromReq(req: Request): string {
  return (req as AuthenticatedRequest).userId || "anonymous";
}
