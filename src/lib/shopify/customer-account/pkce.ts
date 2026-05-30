function base64url(buffer: Uint8Array): string {
  return btoa(String.fromCharCode(...buffer))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");
}

export function generateCodeVerifier(): string {
  const array = new Uint8Array(32);
  globalThis.crypto.getRandomValues(array);
  return base64url(array);
}

export async function generateCodeChallenge(verifier: string): Promise<string> {
  const data = new TextEncoder().encode(verifier);
  const digest = await globalThis.crypto.subtle.digest("SHA-256", data);
  return base64url(new Uint8Array(digest));
}

export function generateState(): string {
  const array = new Uint8Array(16);
  globalThis.crypto.getRandomValues(array);
  return base64url(array);
}
