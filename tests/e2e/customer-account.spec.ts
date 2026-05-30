/**
 * @test-file   CustomerAccount
 * @description E2E coverage for auth redirect flow, OAuth initiation, and header auth state
 * @ai-generated
 * @reviewed-by xxx [1]
 */

import { expect, test } from "@playwright/test";

/**
 * @test-suite  Protected Route Redirect
 * @target      Proxy middleware — unauthenticated access redirect behavior
 * @strategy    E2E; intercepts /api/auth/login to capture return_to param, aborts to stay local
 * @cases
 *   - [PASS] redirects to /api/auth/login with return_to=/account when visiting /account without token
 *   - [PASS] redirects to /api/auth/login with return_to=/account/orders when visiting /account/orders without token
 *   - [PASS] redirects to /api/auth/login with return_to=/account/profile when visiting /account/profile without token
 *   - [PASS] redirects to /api/auth/login with return_to=/account/addresses when visiting /account/addresses without token
 */
test.describe("Protected Route Redirect", () => {
  const protectedPaths = ["/account", "/account/orders", "/account/profile", "/account/addresses"];

  for (const path of protectedPaths) {
    test(`无 token 访问 ${path} → 跳转至 /api/auth/login 且 return_to=${path}`, async ({ page }) => {
      let capturedReturnTo: string | null = null;

      await page.route(
        (url) => url.pathname === "/api/auth/login",
        (route) => {
          capturedReturnTo = new URL(route.request().url()).searchParams.get("return_to");
          route.abort();
        },
      );

      await page.goto(path).catch(() => {});

      expect(capturedReturnTo).toBe(path);
    });
  }
});

/**
 * @test-suite  OAuth Flow Initiation
 * @target      /api/auth/login route — PKCE code challenge generation and Shopify OAuth redirect
 * @strategy    E2E; intercepts outbound request to shopify.com before external navigation occurs
 * @cases
 *   - [PASS] redirects to Shopify /oauth/authorize with response_type=code when GET /api/auth/login
 *   - [PASS] OAuth URL contains code_challenge and code_challenge_method=S256 for PKCE when GET /api/auth/login
 *   - [PASS] OAuth URL scope includes customer-account-api:full when GET /api/auth/login
 *   - [PASS] OAuth URL contains non-empty state parameter for CSRF protection when GET /api/auth/login
 */
test.describe("OAuth Flow Initiation", () => {
  async function captureOAuthUrl(page: import("@playwright/test").Page): Promise<URL | null> {
    let oauthUrl: URL | null = null;
    await page.route(
      (url) => url.hostname.includes("shopify.com"),
      (route) => {
        oauthUrl = new URL(route.request().url());
        route.abort();
      },
    );
    await page.goto("/api/auth/login").catch(() => {});
    return oauthUrl;
  }

  test("/api/auth/login 跳转至 Shopify /oauth/authorize 且 response_type=code", async ({ page }) => {
    const oauthUrl = await captureOAuthUrl(page);
    expect(oauthUrl).not.toBeNull();
    expect(oauthUrl!.pathname).toContain("/oauth/authorize");
    expect(oauthUrl!.searchParams.get("response_type")).toBe("code");
  });

  test("OAuth URL 包含 code_challenge 且 code_challenge_method=S256（PKCE）", async ({ page }) => {
    const oauthUrl = await captureOAuthUrl(page);
    expect(oauthUrl!.searchParams.get("code_challenge")).toBeTruthy();
    expect(oauthUrl!.searchParams.get("code_challenge_method")).toBe("S256");
  });

  test("OAuth URL scope 包含 customer-account-api:full", async ({ page }) => {
    const oauthUrl = await captureOAuthUrl(page);
    expect(oauthUrl!.searchParams.get("scope")).toContain("customer-account-api:full");
  });

  test("OAuth URL 含非空 state 参数（防 CSRF）", async ({ page }) => {
    const oauthUrl = await captureOAuthUrl(page);
    expect(oauthUrl!.searchParams.get("state")).toBeTruthy();
  });
});

/**
 * @test-suite  Header Auth State
 * @target      Header component — auth-conditional nav link rendering
 * @strategy    E2E; fresh browser context has no token cookies → unauthenticated state
 * @cases
 *   - [PASS] shows "Sign in" link pointing to /api/auth/login when no token cookie present
 *   - [PASS] does not show Account or Orders nav links when no token cookie present
 */
test.describe("Header Auth State", () => {
  test("无 token 时 Header 显示 Sign in 链接且 href=/api/auth/login", async ({ page }) => {
    await page.goto("/");
    const signIn = page.getByRole("link", { name: "Sign in" });
    await expect(signIn).toBeVisible();
    await expect(signIn).toHaveAttribute("href", "/api/auth/login");
  });

  test("无 token 时 Header 不显示 Account 和 Orders 导航链接", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("link", { name: "Account" })).not.toBeVisible();
    await expect(page.getByRole("link", { name: "Orders" })).not.toBeVisible();
  });
});
