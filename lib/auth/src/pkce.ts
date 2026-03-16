function getRandomValues(length: number): Uint8Array {
  const values = new Uint8Array(length);
  if (typeof globalThis.crypto !== "undefined" && globalThis.crypto.getRandomValues) {
    globalThis.crypto.getRandomValues(values);
    return values;
  }
  throw new Error("Web Crypto API is required for secure PKCE generation");
}

function generateRandomString(length: number): string {
  const charset = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~";
  const values = getRandomValues(length);
  return Array.from(values, (v) => charset[v % charset.length]).join("");
}

async function sha256(plain: string): Promise<ArrayBuffer> {
  if (typeof globalThis.crypto !== "undefined" && globalThis.crypto.subtle) {
    const encoder = new TextEncoder();
    return globalThis.crypto.subtle.digest("SHA-256", encoder.encode(plain));
  }
  throw new Error("Web Crypto API (subtle) is required for PKCE code challenge generation");
}

function uint8ToBase64Url(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  if (typeof globalThis.btoa === "function") {
    return globalThis.btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  }
  const buf = typeof Buffer !== "undefined" ? Buffer.from(binary, "binary") : null;
  if (buf) {
    return buf.toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  }
  throw new Error("No base64 encoding available (neither btoa nor Buffer)");
}

export async function generatePKCE(): Promise<{ codeVerifier: string; codeChallenge: string }> {
  const codeVerifier = generateRandomString(64);
  const hash = await sha256(codeVerifier);
  const codeChallenge = uint8ToBase64Url(new Uint8Array(hash));
  return { codeVerifier, codeChallenge };
}

export function generateState(): string {
  return generateRandomString(32);
}
