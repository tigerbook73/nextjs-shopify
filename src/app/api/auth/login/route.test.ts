/**
 * @test-file   Auth Login Route
 * @description GET /api/auth/login — PKCE cookie setup and open-redirect protection via getSafeReturnTo
 * @ai-generated
 * @reviewed-by
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

vi.mock("@/lib/shopify/customer-account/pkce", () => ({
  generateCodeVerifier: vi.fn().mockReturnValue("mock-verifier"),
  generateCodeChallenge: vi.fn().mockResolvedValue("mock-challenge"),
  generateState: vi.fn().mockReturnValue("mock-state"),
}));

vi.mock("@/lib/shopify/customer-account/config", () => ({
  CLIENT_ID: "test-client-id",
  CUSTOMER_ACCOUNT_AUTH_BASE_URL: "https://auth.example.com",
  REDIRECT_URI: "http://localhost:3000/api/auth/callback",
  SHOP_ID: "test-shop-id",
}));

vi.mock("@/lib/shopify/customer-account/tokens", () => ({
  COOKIE_NAMES: {
    PKCE_VERIFIER: "ca_pkce_verifier",
    OAUTH_STATE: "ca_oauth_state",
    RETURN_TO: "ca_return_to",
  },
}));

vi.mock("next/headers", () => ({
  cookies: vi.fn(),
}));

const { cookies } = await import("next/headers");
const { GET } = await import("@/app/api/auth/login/route");

const mockCookies = vi.mocked(cookies);

function makeCookieStore() {
  return { set: vi.fn(), get: vi.fn(), delete: vi.fn() };
}

function makeRequest(returnTo?: string): NextRequest {
  const url = new URL("http://localhost:3000/api/auth/login");
  if (returnTo != null) url.searchParams.set("return_to", returnTo);
  return new NextRequest(url.toString());
}

describe("GET /api/auth/login", () => {
  beforeEach(() => vi.clearAllMocks());

  /**
   * @test-suite  PKCE cookies
   * @target      verifier, state, and return_to cookies are set on every request
   * @strategy    unit — cookies mocked, pkce functions mocked to fixed values
   * @cases
   *   - [PASS] sets PKCE verifier, OAuth state, and return_to cookies
   *   - [PASS] redirects to Shopify OAuth URL with correct params
   */
  describe("PKCE cookies", () => {
    it("sets verifier, state, and return_to cookies", async () => {
      const cookieStore = makeCookieStore();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      mockCookies.mockResolvedValue(cookieStore as any);

      await GET(makeRequest("/account/orders"));

      expect(cookieStore.set).toHaveBeenCalledWith("ca_pkce_verifier", "mock-verifier", expect.any(Object));
      expect(cookieStore.set).toHaveBeenCalledWith("ca_oauth_state", "mock-state", expect.any(Object));
      expect(cookieStore.set).toHaveBeenCalledWith("ca_return_to", "/account/orders", expect.any(Object));
    });

    it("redirects to Shopify OAuth URL with code_challenge and state", async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      mockCookies.mockResolvedValue(makeCookieStore() as any);

      const res = await GET(makeRequest());

      expect(res.status).toBe(307);
      const location = new URL(res.headers.get("location")!);
      expect(location.searchParams.get("code_challenge")).toBe("mock-challenge");
      expect(location.searchParams.get("state")).toBe("mock-state");
      expect(location.searchParams.get("client_id")).toBe("test-client-id");
    });
  });

  /**
   * @test-suite  getSafeReturnTo — open-redirect protection
   * @target      return_to cookie value is sanitised before being stored
   * @strategy    unit — verify cookie value set by GET handler
   * @cases
   *   - [PASS] accepts a relative path starting with /
   *   - [PASS] rejects protocol-relative URL (//evil.com) → falls back to /account
   *   - [PASS] rejects absolute URL (https://evil.com) → falls back to /account
   *   - [PASS] defaults to /account when return_to param is absent
   */
  describe("getSafeReturnTo", () => {
    async function getReturnToCookieValue(returnTo?: string): Promise<string> {
      const cookieStore = makeCookieStore();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      mockCookies.mockResolvedValue(cookieStore as any);
      await GET(makeRequest(returnTo));
      const call = cookieStore.set.mock.calls.find((c) => c[0] === "ca_return_to");
      return call?.[1] as string;
    }

    it("accepts a relative path starting with /", async () => {
      expect(await getReturnToCookieValue("/products")).toBe("/products");
    });

    it("rejects protocol-relative URL and falls back to /account", async () => {
      expect(await getReturnToCookieValue("//evil.com")).toBe("/account");
    });

    it("rejects absolute URL and falls back to /account", async () => {
      expect(await getReturnToCookieValue("https://evil.com/steal")).toBe("/account");
    });

    it("defaults to /account when return_to param is absent", async () => {
      expect(await getReturnToCookieValue()).toBe("/account");
    });
  });
});
