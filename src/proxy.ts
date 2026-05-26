import { NextRequest, NextResponse } from "next/server";

const AUTH_PAGES = ["/account/login", "/account/register"];

export function proxy(request: NextRequest): NextResponse {
  const token = request.cookies.get("customerAccessToken")?.value;
  const { pathname } = request.nextUrl;

  const isAuthPage = AUTH_PAGES.includes(pathname);

  if (!isAuthPage && !token) {
    return NextResponse.redirect(new URL("/account/login", request.url));
  }

  if (isAuthPage && token) {
    if (request.nextUrl.searchParams.get("expired") === "1") {
      const response = NextResponse.redirect(new URL("/account/login", request.url));
      response.cookies.delete("customerAccessToken");
      return response;
    }
    return NextResponse.redirect(new URL("/account", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/account/:path*"],
};
