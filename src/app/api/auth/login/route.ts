import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { CLIENT_ID, REDIRECT_URI, SHOP_ID } from "@/lib/shopify/customer-account/config";
import { generateCodeChallenge, generateCodeVerifier, generateState } from "@/lib/shopify/customer-account/pkce";
import { COOKIE_NAMES } from "@/lib/shopify/customer-account/tokens";

const TEMP_COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: "lax" as const,
  path: "/",
  maxAge: 600,
};

function getSafeReturnTo(value: string): string {
  // Reject non-relative paths and protocol-relative URLs (e.g. //evil.com)
  if (!value.startsWith("/") || value.startsWith("//")) return "/account";
  return value;
}

export async function GET(request: NextRequest) {
  const returnTo = request.nextUrl.searchParams.get("return_to") ?? "/account";

  const codeVerifier = generateCodeVerifier();
  const codeChallenge = await generateCodeChallenge(codeVerifier);
  const state = generateState();

  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAMES.PKCE_VERIFIER, codeVerifier, TEMP_COOKIE_OPTIONS);
  cookieStore.set(COOKIE_NAMES.OAUTH_STATE, state, TEMP_COOKIE_OPTIONS);
  cookieStore.set(COOKIE_NAMES.RETURN_TO, getSafeReturnTo(returnTo), TEMP_COOKIE_OPTIONS);

  const authUrl = new URL(`https://shopify.com/authentication/${SHOP_ID}/oauth/authorize`);
  authUrl.searchParams.set("client_id", CLIENT_ID);
  authUrl.searchParams.set("response_type", "code");
  authUrl.searchParams.set("redirect_uri", REDIRECT_URI);
  authUrl.searchParams.set("scope", "openid email customer-account-api:full");
  authUrl.searchParams.set("state", state);
  authUrl.searchParams.set("code_challenge", codeChallenge);
  authUrl.searchParams.set("code_challenge_method", "S256");

  return NextResponse.redirect(authUrl.toString());
}
