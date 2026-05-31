import { NextRequest, NextResponse } from "next/server";
import { COOKIE_NAMES, exchangeRefreshToken } from "@/lib/shopify/customer-account/tokens";

const AUTH_COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: "lax" as const,
  path: "/",
};

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const accessToken = request.cookies.get(COOKIE_NAMES.ACCESS_TOKEN)?.value;
  const tokenExpiry = request.cookies.get(COOKIE_NAMES.TOKEN_EXPIRY)?.value;
  const refreshToken = request.cookies.get(COOKIE_NAMES.REFRESH_TOKEN)?.value;

  const isExpired = !tokenExpiry || Date.now() >= parseInt(tokenExpiry, 10);

  if (accessToken && !isExpired) {
    return NextResponse.next();
  }

  if (refreshToken) {
    const tokens = await exchangeRefreshToken(refreshToken);
    if (tokens) {
      // Redirect to the same URL so the browser sends a fresh request with the
      // new cookies. NextResponse.next() would forward the old request cookies
      // to the page handler, causing customerAccountFetch to fail with an
      // expired token even though the refresh succeeded.
      const response = NextResponse.redirect(request.url);
      const expiryMs = Date.now() + tokens.expires_in * 1000;

      response.cookies.set(COOKIE_NAMES.ACCESS_TOKEN, tokens.access_token, {
        ...AUTH_COOKIE_OPTIONS,
        maxAge: tokens.expires_in,
      });
      response.cookies.set(COOKIE_NAMES.REFRESH_TOKEN, tokens.refresh_token, {
        ...AUTH_COOKIE_OPTIONS,
        maxAge: 60 * 60 * 24 * 30,
      });
      response.cookies.set(COOKIE_NAMES.TOKEN_EXPIRY, String(expiryMs), {
        ...AUTH_COOKIE_OPTIONS,
        maxAge: 60 * 60 * 24 * 30,
      });

      return response;
    }
  }

  const loginUrl = new URL("/api/auth/login", request.url);
  loginUrl.searchParams.set("return_to", pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/account/:path*"],
};
