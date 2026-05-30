import { cookies } from "next/headers";

export const COOKIE_NAMES = {
  ACCESS_TOKEN: "ca_access_token",
  REFRESH_TOKEN: "ca_refresh_token",
  TOKEN_EXPIRY: "ca_token_expiry",
  PKCE_VERIFIER: "ca_pkce_verifier",
  OAUTH_STATE: "ca_oauth_state",
} as const;

const BASE_COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: "lax" as const,
  path: "/",
};

export async function setTokenCookies(tokens: {
  access_token: string;
  refresh_token: string;
  expires_in: number;
}): Promise<void> {
  const cookieStore = await cookies();
  const expiryMs = Date.now() + tokens.expires_in * 1000;

  cookieStore.set(COOKIE_NAMES.ACCESS_TOKEN, tokens.access_token, {
    ...BASE_COOKIE_OPTIONS,
    maxAge: tokens.expires_in,
  });
  cookieStore.set(COOKIE_NAMES.REFRESH_TOKEN, tokens.refresh_token, {
    ...BASE_COOKIE_OPTIONS,
    maxAge: 60 * 60 * 24 * 30,
  });
  cookieStore.set(COOKIE_NAMES.TOKEN_EXPIRY, String(expiryMs), {
    ...BASE_COOKIE_OPTIONS,
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function getAccessToken(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get(COOKIE_NAMES.ACCESS_TOKEN)?.value;
}

export async function isTokenExpired(): Promise<boolean> {
  const cookieStore = await cookies();
  const expiry = cookieStore.get(COOKIE_NAMES.TOKEN_EXPIRY)?.value;
  if (!expiry) return true;
  return Date.now() >= parseInt(expiry, 10);
}

export async function clearTokenCookies(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAMES.ACCESS_TOKEN);
  cookieStore.delete(COOKIE_NAMES.REFRESH_TOKEN);
  cookieStore.delete(COOKIE_NAMES.TOKEN_EXPIRY);
}

/** Pure HTTP call — safe to use in both Route Handlers and Middleware. */
export async function exchangeRefreshToken(refreshToken: string): Promise<{
  access_token: string;
  refresh_token: string;
  expires_in: number;
} | null> {
  const clientId = process.env.SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_ID!;
  const shopId = process.env.SHOPIFY_SHOP_ID!;

  const res = await fetch(`https://shopify.com/authentication/${shopId}/oauth/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
      client_id: clientId,
    }),
  });

  if (!res.ok) return null;

  const data = (await res.json()) as {
    access_token: string;
    refresh_token?: string;
    expires_in: number;
  };

  return {
    access_token: data.access_token,
    refresh_token: data.refresh_token ?? refreshToken,
    expires_in: data.expires_in,
  };
}

/** Convenience wrapper for Route Handlers: reads cookie, refreshes, writes new tokens. */
export async function refreshAccessToken(): Promise<boolean> {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get(COOKIE_NAMES.REFRESH_TOKEN)?.value;
  if (!refreshToken) return false;

  const tokens = await exchangeRefreshToken(refreshToken);
  if (!tokens) return false;

  await setTokenCookies(tokens);
  return true;
}
