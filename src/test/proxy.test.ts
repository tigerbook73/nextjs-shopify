/**
 * @test-file   Proxy (auth guard)
 * @description Auth guard for /account/* routes — redirect, pass-through, and token refresh scenarios
 * @ai-generated
 * @reviewed-by xxx [1]
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { COOKIE_NAMES } from "@/lib/shopify/customer-account/tokens";

vi.mock("@/lib/shopify/customer-account/config", () => ({
  SHOP_ID: "test-shop-id",
  CLIENT_ID: "test-client-id",
  APP_URL: "http://localhost:3000",
  REDIRECT_URI: "http://localhost:3000/api/auth/callback",
}));

vi.mock("@/lib/shopify/customer-account/tokens", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/shopify/customer-account/tokens")>();
  return { ...actual, exchangeRefreshToken: vi.fn() };
});

const { proxy: middleware } = await import("@/proxy");
const { exchangeRefreshToken } = await import("@/lib/shopify/customer-account/tokens");
const mockExchange = exchangeRefreshToken as ReturnType<typeof vi.fn>;

const VALID_EXPIRY = String(Date.now() + 60 * 60 * 1000); // 1 hour from now
const EXPIRED_EXPIRY = String(Date.now() - 1000); // 1 second ago

function makeRequest(path: string, cookies: Record<string, string> = {}): NextRequest {
  const cookieHeader = Object.entries(cookies)
    .map(([k, v]) => `${k}=${v}`)
    .join("; ");
  return new NextRequest(new URL(path, "http://localhost:3000"), {
    headers: cookieHeader ? { Cookie: cookieHeader } : {},
  });
}

describe("middleware", () => {
  beforeEach(() => vi.clearAllMocks());

  /**
   * @test-suite  Unauthenticated access
   * @target      redirect behavior when no valid session exists
   * @strategy    unit — exchangeRefreshToken mocked
   * @cases
   *   - [PASS] redirects to /api/auth/login with return_to when no cookies are present
   *   - [PASS] redirects to /api/auth/login with return_to when access token is expired and no refresh token
   *   - [PASS] redirects to /api/auth/login when refresh token exchange fails
   */
  describe("Unauthenticated access", () => {
    beforeEach(() => mockExchange.mockResolvedValue(null));

    it("redirects to /api/auth/login with return_to when no cookies are present", async () => {
      const res = await middleware(makeRequest("/account"));
      expect(res.status).toBe(307);
      const location = new URL(res.headers.get("location")!);
      expect(location.pathname).toBe("/api/auth/login");
      expect(location.searchParams.get("return_to")).toBe("/account");
    });

    it("redirects to /api/auth/login with return_to when access token is expired and no refresh token", async () => {
      const res = await middleware(
        makeRequest("/account/orders", {
          [COOKIE_NAMES.ACCESS_TOKEN]: "expired-token",
          [COOKIE_NAMES.TOKEN_EXPIRY]: EXPIRED_EXPIRY,
        }),
      );
      expect(res.status).toBe(307);
      const location = new URL(res.headers.get("location")!);
      expect(location.searchParams.get("return_to")).toBe("/account/orders");
    });

    it("redirects to /api/auth/login when refresh token exchange fails", async () => {
      mockExchange.mockResolvedValue(null);
      const res = await middleware(
        makeRequest("/account", {
          [COOKIE_NAMES.ACCESS_TOKEN]: "expired-token",
          [COOKIE_NAMES.TOKEN_EXPIRY]: EXPIRED_EXPIRY,
          [COOKIE_NAMES.REFRESH_TOKEN]: "bad-refresh-token",
        }),
      );
      expect(res.status).toBe(307);
      expect(new URL(res.headers.get("location")!).pathname).toBe("/api/auth/login");
    });
  });

  /**
   * @test-suite  Authenticated access
   * @target      pass-through behavior when a valid session exists
   * @strategy    unit — exchangeRefreshToken mocked (not called)
   * @cases
   *   - [PASS] passes through when access token is present and not expired
   */
  describe("Authenticated access", () => {
    it("passes through when access token is present and not expired", async () => {
      const res = await middleware(
        makeRequest("/account", {
          [COOKIE_NAMES.ACCESS_TOKEN]: "valid-token",
          [COOKIE_NAMES.TOKEN_EXPIRY]: VALID_EXPIRY,
        }),
      );
      expect(res.status).toBe(200);
      expect(mockExchange).not.toHaveBeenCalled();
    });
  });

  /**
   * @test-suite  Token refresh
   * @target      token refresh redirects to same URL so the page receives fresh cookies
   * @strategy    unit — exchangeRefreshToken mocked to return new tokens
   * @cases
   *   - [PASS] redirects to same URL and sets new cookies when refresh token exchange succeeds
   */
  describe("Token refresh", () => {
    it("redirects to same URL and sets new cookies when refresh token exchange succeeds", async () => {
      mockExchange.mockResolvedValue({
        access_token: "new-access-token",
        refresh_token: "new-refresh-token",
        expires_in: 3600,
      });

      const res = await middleware(
        makeRequest("/account", {
          [COOKIE_NAMES.ACCESS_TOKEN]: "expired-token",
          [COOKIE_NAMES.TOKEN_EXPIRY]: EXPIRED_EXPIRY,
          [COOKIE_NAMES.REFRESH_TOKEN]: "valid-refresh-token",
        }),
      );

      expect(res.status).toBe(307);
      expect(new URL(res.headers.get("location")!).pathname).toBe("/account");
      expect(mockExchange).toHaveBeenCalledWith("valid-refresh-token");

      const setCookies = res.headers.getSetCookie();
      expect(setCookies.some((c) => c.startsWith(`${COOKIE_NAMES.ACCESS_TOKEN}=new-access-token`))).toBe(true);
      expect(setCookies.some((c) => c.startsWith(`${COOKIE_NAMES.REFRESH_TOKEN}=new-refresh-token`))).toBe(true);
    });
  });
});
