function generateRandomString(length: number): string {
  const charset = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~";
  const values = new Uint8Array(length);
  if (typeof crypto === "undefined" || !crypto.getRandomValues) {
    throw new Error("Web Crypto API is required for secure PKCE generation");
  }
  crypto.getRandomValues(values);
  return Array.from(values, (v) => charset[v % charset.length]).join("");
}

async function sha256(plain: string): Promise<ArrayBuffer> {
  if (typeof crypto !== "undefined" && crypto.subtle) {
    const encoder = new TextEncoder();
    return crypto.subtle.digest("SHA-256", encoder.encode(plain));
  }
  throw new Error("Web Crypto API not available");
}

function base64UrlEncode(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export async function generatePKCE(): Promise<{ codeVerifier: string; codeChallenge: string }> {
  const codeVerifier = generateRandomString(64);
  const hash = await sha256(codeVerifier);
  const codeChallenge = base64UrlEncode(hash);
  return { codeVerifier, codeChallenge };
}

export function generateState(): string {
  return generateRandomString(32);
}
