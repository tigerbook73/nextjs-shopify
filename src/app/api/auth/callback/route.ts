import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { CLIENT_ID, REDIRECT_URI, SHOP_ID } from "@/lib/shopify/customer-account/config";
import { COOKIE_NAMES, setTokenCookies } from "@/lib/shopify/customer-account/tokens";
import type { CustomerAccountToken } from "@/types/customer-account";

function getSafeReturnTo(value: string): string {
  if (!value.startsWith("/") || value.startsWith("//")) return "/account";
  return value;
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");

  if (error) {
    console.error("[auth/callback] OAuth error:", error, searchParams.get("error_description"));
    return NextResponse.redirect(new URL("/", request.url));
  }

  if (!code || !state) {
    return new NextResponse("Missing code or state", { status: 400 });
  }

  const cookieStore = await cookies();
  const savedState = cookieStore.get(COOKIE_NAMES.OAUTH_STATE)?.value;
  const codeVerifier = cookieStore.get(COOKIE_NAMES.PKCE_VERIFIER)?.value;
  const rawReturnTo = cookieStore.get(COOKIE_NAMES.RETURN_TO)?.value ?? "/account";
  const returnTo = getSafeReturnTo(rawReturnTo);

  if (!savedState || state !== savedState) {
    return new NextResponse("Invalid state", { status: 400 });
  }

  if (!codeVerifier) {
    return new NextResponse("Missing code verifier", { status: 400 });
  }

  const tokenRes = await fetch(`https://shopify.com/authentication/${SHOP_ID}/oauth/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      client_id: CLIENT_ID,
      redirect_uri: REDIRECT_URI,
      code,
      code_verifier: codeVerifier,
    }),
  });

  if (!tokenRes.ok) {
    console.error("[auth/callback] Token exchange failed:", tokenRes.status, await tokenRes.text());
    return new NextResponse("Token exchange failed", { status: 400 });
  }

  const tokens = (await tokenRes.json()) as CustomerAccountToken;

  cookieStore.delete(COOKIE_NAMES.OAUTH_STATE);
  cookieStore.delete(COOKIE_NAMES.PKCE_VERIFIER);
  cookieStore.delete(COOKIE_NAMES.RETURN_TO);

  await setTokenCookies(tokens);

  return NextResponse.redirect(new URL(returnTo, request.url));
}
