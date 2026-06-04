/**
 * @test-file   CustomerAccount
 * @description E2E coverage for auth redirect flow, OAuth initiation, and header auth state
 * @ai-generated
 * @reviewed-by Shengtian Liao @ [3]
 */

import { expect, test } from "@playwright/test";
import { COOKIE_NAMES } from "../../src/lib/shopify/customer-account/cookie-names";
import { waitForHydration } from "./utils";

const CUSTOMER_ACCOUNT_MOCK_URL = `http://127.0.0.1:${process.env.MOCK_SERVER_PORT ?? 4001}`;

const TOKEN_COOKIE_NAMES = new Set<string>([
  COOKIE_NAMES.ACCESS_TOKEN,
  COOKIE_NAMES.REFRESH_TOKEN,
  COOKIE_NAMES.TOKEN_EXPIRY,
]);

async function setCustomerAccountCookies(
  context: import("@playwright/test").BrowserContext,
  baseURL: string | undefined,
  options: { expired?: boolean } = {},
) {
  const url = baseURL ?? "http://127.0.0.1:3001";
  const expiry = options.expired ? Date.now() - 60_000 : Date.now() + 60 * 60 * 1000;

  await context.addCookies([
    { name: COOKIE_NAMES.ACCESS_TOKEN, value: "mock-access-token", url, httpOnly: true, sameSite: "Lax" },
    { name: COOKIE_NAMES.REFRESH_TOKEN, value: "mock-refresh-token", url, httpOnly: true, sameSite: "Lax" },
    { name: COOKIE_NAMES.TOKEN_EXPIRY, value: String(expiry), url, httpOnly: true, sameSite: "Lax" },
  ]);
}

async function tokenCookies(context: import("@playwright/test").BrowserContext) {
  const cookies = await context.cookies();
  return cookies.filter((cookie) => TOKEN_COOKIE_NAMES.has(cookie.name));
}

async function expectTokenCookies(context: import("@playwright/test").BrowserContext) {
  expect((await tokenCookies(context)).map((cookie) => cookie.name)).toEqual(
    expect.arrayContaining([COOKIE_NAMES.ACCESS_TOKEN, COOKIE_NAMES.REFRESH_TOKEN, COOKIE_NAMES.TOKEN_EXPIRY]),
  );
}

/**
 * @test-suite  Protected Route Redirect
 * @target      Proxy middleware — unauthenticated access redirect behavior
 * @strategy    E2E; completes mocked OAuth flow and verifies return_to lands back on the requested page
 * @cases
 *   - [PASS] completes mock OAuth and returns to /account when visiting /account without token
 *   - [PASS] completes mock OAuth and returns to /account/orders when visiting /account/orders without token
 *   - [PASS] completes mock OAuth and returns to /account/profile when visiting /account/profile without token
 *   - [PASS] completes mock OAuth and returns to /account/addresses when visiting /account/addresses without token
 */
test.describe("Protected Route Redirect", () => {
  const protectedRouteCases = [
    {
      path: "/account",
      assertPage: async (page: import("@playwright/test").Page) => {
        await expect(page.getByRole("heading", { name: "Ada Lovelace" })).toBeVisible();
      },
    },
    {
      path: "/account/orders",
      assertPage: async (page: import("@playwright/test").Page) => {
        await expect(page.getByRole("heading", { name: "Orders" })).toBeVisible();
      },
    },
    {
      path: "/account/profile",
      assertPage: async (page: import("@playwright/test").Page) => {
        await expect(page.getByRole("heading", { name: "Profile" })).toBeVisible();
        await expect(page.getByLabel("Email")).toHaveValue("ada@example.com");
      },
    },
    {
      path: "/account/addresses",
      assertPage: async (page: import("@playwright/test").Page) => {
        await expect(page.getByRole("heading", { name: "Addresses" })).toBeVisible();
        await expect(page.getByText("1 Algorithm Lane")).toBeVisible();
      },
    },
  ];

  for (const { path, assertPage } of protectedRouteCases) {
    test(`无 token 访问 ${path} → 完成 mock OAuth 后回到 ${path}`, async ({ page, context }) => {
      await page.goto(path);

      await expect(page).toHaveURL(new RegExp(`${path}$`));
      await assertPage(page);
      await expectTokenCookies(context);
    });
  }
});

/**
 * @test-suite  OAuth Flow Initiation
 * @target      /api/auth/login route — PKCE code challenge generation and Shopify OAuth redirect
 * @strategy    E2E/API; requests login without following redirects and inspects the OAuth Location header
 * @cases
 *   - [PASS] redirects to Shopify /oauth/authorize with response_type=code when GET /api/auth/login
 *   - [PASS] OAuth URL contains code_challenge and code_challenge_method=S256 for PKCE when GET /api/auth/login
 *   - [PASS] OAuth URL scope includes customer-account-api:full when GET /api/auth/login
 *   - [PASS] OAuth URL contains non-empty state parameter for CSRF protection when GET /api/auth/login
 */
test.describe("OAuth Flow Initiation", () => {
  async function getOAuthUrl(request: import("@playwright/test").APIRequestContext): Promise<URL> {
    const response = await request.get("/api/auth/login", { maxRedirects: 0 });
    const location = response.headers().location;

    expect(response.status()).toBe(307);
    expect(location).toBeTruthy();
    return new URL(location!);
  }

  test("/api/auth/login 跳转至 Shopify /oauth/authorize 且 response_type=code", async ({ request }) => {
    const oauthUrl = await getOAuthUrl(request);
    expect(oauthUrl.href).toContain(`${CUSTOMER_ACCOUNT_MOCK_URL}/authentication`);
    expect(oauthUrl.pathname).toContain("/oauth/authorize");
    expect(oauthUrl.searchParams.get("response_type")).toBe("code");
  });

  test("OAuth URL 包含 code_challenge 且 code_challenge_method=S256（PKCE）", async ({ request }) => {
    const oauthUrl = await getOAuthUrl(request);
    expect(oauthUrl.searchParams.get("code_challenge")).toBeTruthy();
    expect(oauthUrl.searchParams.get("code_challenge_method")).toBe("S256");
  });

  test("OAuth URL scope 包含 customer-account-api:full", async ({ request }) => {
    const oauthUrl = await getOAuthUrl(request);
    expect(oauthUrl.searchParams.get("scope")).toContain("customer-account-api:full");
  });

  test("OAuth URL 含非空 state 参数（防 CSRF）", async ({ request }) => {
    const oauthUrl = await getOAuthUrl(request);
    expect(oauthUrl.searchParams.get("state")).toBeTruthy();
  });
});

/**
 * @test-suite  Header Auth State
 * @target      Header component — auth-conditional nav link rendering
 * @strategy    E2E; fresh browser context has no token cookies → unauthenticated state
 * @cases
 *   - [PASS] shows "Sign in" link with return_to=/ when no token cookie present
 *   - [PASS] does not show Account or Orders nav links when no token cookie present
 *   - [PASS] shows Avatar button and hides Sign in when token cookie present
 *   - [PASS] clicking Avatar opens dropdown with Overview / Orders / Profile / Addresses / Sign out
 *   - [PASS] pressing Escape closes the dropdown
 */
test.describe("Header Auth State", () => {
  test("无 token 时 Header 显示 Sign in 链接且 href 含 return_to=/", async ({ page }) => {
    await page.goto("/");
    await waitForHydration(page);
    const signIn = page.getByRole("link", { name: "Sign in" });
    await expect(signIn).toBeVisible();
    await expect(signIn).toHaveAttribute("href", "/api/auth/login?return_to=/");
  });

  test("无 token 时 Header 不显示 Account 和 Orders 导航链接", async ({ page }) => {
    await page.goto("/");
    const header = page.locator("header");
    await expect(header.getByRole("link", { name: "Account", exact: true })).not.toBeVisible();
    await expect(header.getByRole("link", { name: "Orders", exact: true })).not.toBeVisible();
  });

  test("有 token 时 Header 显示 Avatar 按钮，不显示 Sign in", async ({ page, context, baseURL }) => {
    await setCustomerAccountCookies(context, baseURL);
    await page.goto("/");
    const header = page.locator("header");
    await expect(header.getByRole("button", { name: "Account menu" })).toBeVisible();
    await expect(header.getByRole("link", { name: "Sign in" })).not.toBeVisible();
  });

  test("点击 Avatar 展开下拉菜单，含 Overview / Orders / Profile / Addresses / Sign out", async ({
    page,
    context,
    baseURL,
  }) => {
    await setCustomerAccountCookies(context, baseURL);
    await page.goto("/");
    await waitForHydration(page);
    await page.getByRole("button", { name: "Account menu" }).click();
    await expect(page.getByRole("menuitem", { name: "Overview" })).toBeVisible();
    await expect(page.getByRole("menuitem", { name: "Orders" })).toBeVisible();
    await expect(page.getByRole("menuitem", { name: "Profile" })).toBeVisible();
    await expect(page.getByRole("menuitem", { name: "Addresses" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Sign out" })).toBeVisible();
  });

  test("下拉菜单展开后按 Escape 关闭", async ({ page, context, baseURL }) => {
    await setCustomerAccountCookies(context, baseURL);
    await page.goto("/");
    await waitForHydration(page);
    await page.getByRole("button", { name: "Account menu" }).click();
    await expect(page.getByRole("menuitem", { name: "Overview" })).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.getByRole("menuitem", { name: "Overview" })).not.toBeVisible();
  });
});

/**
 * @test-suite  Customer Account Task Acceptance
 * @target      customer-accounts task acceptance commands in docs/tasks/customer-accounts/design.md
 * @strategy    E2E with Customer Account API mocked in the Next.js server process
 * @cases
 *   - [PASS] unauthenticated /account access redirects to login
 *   - [PASS] logout clears all token cookies and lands on home
 *   - [PASS] expired access token refreshes without showing login
 *   - [PASS] profile form updates firstName / lastName
 *   - [PASS] address create, edit, delete, and default actions render and submit successfully
 *   - [PASS] order details show image-backed items and fulfillment tracking
 *   - [PASS] logged-in header exposes an orders shortcut
 */
test.describe("Customer Account Task Acceptance", () => {
  test.describe.configure({ mode: "serial" });

  test.beforeEach(async ({ request }) => {
    await request.post(`${CUSTOMER_ACCOUNT_MOCK_URL}/reset`);
  });

  test("未登录访问 /account 完成 mock OAuth 后回到账户页", async ({ page, context }) => {
    await page.goto("/account");

    await expect(page).toHaveURL(/\/account$/);
    await expect(page.getByRole("heading", { name: "Ada Lovelace" })).toBeVisible();
    await expectTokenCookies(context);
  });

  test("登出后跳转首页，所有 token Cookie 清除", async ({ page, context, baseURL }) => {
    await setCustomerAccountCookies(context, baseURL);
    await page.goto("/");

    await page.request.post("/api/auth/logout", { maxRedirects: 0 });

    await page.reload();
    await expect(page).toHaveURL("/");
    await expect(page.getByRole("link", { name: "Sign in" })).toBeVisible();
    expect(await tokenCookies(context)).toHaveLength(0);
  });

  test("access token 过期后自动续期，用户不跳转登录页", async ({ page, context, baseURL }) => {
    await setCustomerAccountCookies(context, baseURL, { expired: true });

    await page.goto("/account");

    await expect(page.getByRole("heading", { name: "Ada Lovelace" })).toBeVisible();
    await expect(page.getByTestId("account-profile-hero").getByText("ada@example.com")).toBeVisible();
    await expect(page.getByRole("link", { name: "Sign in" })).not.toBeVisible();

    const refreshedAccessToken = (await tokenCookies(context)).find(
      (cookie) => cookie.name === COOKIE_NAMES.ACCESS_TOKEN,
    );
    expect(refreshedAccessToken?.value).toBe("mock-refreshed-access-token");
  });

  test("账户页可修改 firstName / lastName 并即时反映", async ({ page, context, baseURL }) => {
    await setCustomerAccountCookies(context, baseURL);

    await page.goto("/account/profile");
    await page.getByLabel("First name").fill("Katherine");
    await page.getByLabel("Last name").fill("Johnson");
    await page.getByRole("button", { name: "Save changes" }).click();

    await expect(page).toHaveURL(/\/account\/profile$/);
    await expect(page.getByLabel("First name")).toHaveValue("Katherine");
    await expect(page.getByLabel("Last name")).toHaveValue("Johnson");
  });

  test("地址 CRUD：可新增、编辑、删除收货地址，并设定默认地址", async ({ page, context, baseURL }) => {
    await setCustomerAccountCookies(context, baseURL);

    await page.goto("/account/addresses");
    await page.getByRole("button", { name: "Set as default" }).click();
    await expect(page.getByText("2 Compiler Road")).toBeVisible();

    await page.getByRole("link", { name: "Add address" }).click();
    await page.getByLabel("First name").fill("Dorothy");
    await page.getByLabel("Last name").fill("Vaughan");
    await page.getByLabel("Address line 1").fill("3 Hidden Figures Way");
    await page.getByLabel("City").fill("Hampton");
    await page.getByLabel("State / Province code").fill("VA");
    await page.getByLabel("ZIP / Postal code").fill("23666");
    await page.getByLabel("Country code").fill("US");
    await page.getByRole("button", { name: "Save address" }).click();

    await expect(page).toHaveURL(/\/account\/addresses$/);
    await expect(page.getByText("3 Hidden Figures Way")).toBeVisible();

    const newAddress = page.locator("li", { hasText: "3 Hidden Figures Way" });
    await newAddress.getByRole("link", { name: "Edit" }).click();
    await page.getByLabel("Address line 1").fill("4 Calculation Court");
    await page.getByRole("button", { name: "Save changes" }).click();

    await expect(page).toHaveURL(/\/account\/addresses$/);
    await expect(page.getByText("4 Calculation Court")).toBeVisible();

    await page.locator("li", { hasText: "4 Calculation Court" }).getByRole("button", { name: "Delete" }).click();
    await expect(page.getByText("4 Calculation Court")).not.toBeVisible();
  });

  test("订单详情展示商品图片和物流状态", async ({ page, context, baseURL }) => {
    await setCustomerAccountCookies(context, baseURL);

    await page.goto("/account/orders");
    await page.getByRole("link", { name: /Order #1001/ }).click();

    await expect(page.getByRole("heading", { name: "Order #1001" })).toBeVisible();
    await expect(page.getByRole("img", { name: "Test Cotton Tee" })).toBeVisible();
    await expect(page.getByText("FULFILLED")).toBeVisible();
    await expect(page.getByRole("link", { name: "ZX1001" })).toBeVisible();
  });

  test("Header 已登录用户通过 Avatar 下拉菜单跳转订单列表", async ({ page, context, baseURL }) => {
    await setCustomerAccountCookies(context, baseURL);

    await page.goto("/");
    await waitForHydration(page);
    await page.getByRole("button", { name: "Account menu" }).click();
    await page.getByRole("menuitem", { name: "Orders" }).click();

    await expect(page).toHaveURL(/\/account\/orders$/);
    await expect(page.getByRole("heading", { name: "Orders" })).toBeVisible();
  });
});

/**
 * @test-suite  Account Overview
 * @target      AccountPage — three-card layout, order/address counts, navigation
 * @strategy    E2E; injects mock token, verifies card visibility and navigation
 * @cases
 *   - [PASS] 三张卡片（Orders / Addresses / Profile）均可见
 *   - [PASS] Orders 卡片显示数字 "1"（mock 数据有 1 笔订单）
 *   - [PASS] Addresses 卡片显示数字 "2"（mock 数据有 2 个地址）
 *   - [PASS] 点击 Orders 卡片跳转至 /account/orders
 *   - [PASS] 点击 Addresses 卡片跳转至 /account/addresses
 *   - [PASS] 点击 Profile 卡片跳转至 /account/profile
 */
test.describe("Account Overview", () => {
  test.beforeEach(async ({ request }) => {
    await request.post(`${CUSTOMER_ACCOUNT_MOCK_URL}/reset`);
  });

  test("三张卡片（Orders / Addresses / Profile）均可见", async ({ page, context, baseURL }) => {
    await setCustomerAccountCookies(context, baseURL);
    await page.goto("/account");

    const overview = page.getByRole("region", { name: "Account overview" });
    await expect(overview.getByText("Orders")).toBeVisible();
    await expect(overview.getByText("Addresses")).toBeVisible();
    await expect(overview.getByText("Profile")).toBeVisible();
  });

  test("Orders 卡片显示数字 1，Addresses 卡片显示数字 2", async ({ page, context, baseURL }) => {
    await setCustomerAccountCookies(context, baseURL);
    await page.goto("/account");

    const overview = page.getByRole("region", { name: "Account overview" });
    await expect(overview.getByRole("link", { name: /Orders/ }).getByText("1")).toBeVisible();
    await expect(overview.getByRole("link", { name: /Addresses/ }).getByText("2")).toBeVisible();
  });

  test("点击 Orders 卡片跳转至 /account/orders", async ({ page, context, baseURL }) => {
    await setCustomerAccountCookies(context, baseURL);
    await page.goto("/account");
    await page
      .getByRole("region", { name: "Account overview" })
      .getByRole("link", { name: /Orders/ })
      .click();
    await expect(page).toHaveURL(/\/account\/orders$/);
  });

  test("点击 Addresses 卡片跳转至 /account/addresses", async ({ page, context, baseURL }) => {
    await setCustomerAccountCookies(context, baseURL);
    await page.goto("/account");
    await page
      .getByRole("region", { name: "Account overview" })
      .getByRole("link", { name: /Addresses/ })
      .click();
    await expect(page).toHaveURL(/\/account\/addresses$/);
  });

  test("点击 Profile 卡片跳转至 /account/profile", async ({ page, context, baseURL }) => {
    await setCustomerAccountCookies(context, baseURL);
    await page.goto("/account");
    await page
      .getByRole("region", { name: "Account overview" })
      .getByRole("link", { name: /Profile/ })
      .click();
    await expect(page).toHaveURL(/\/account\/profile$/);
  });
});

/**
 * @test-suite  Account Layout
 * @target      AccountNav component — sidebar user info, active state, mobile tab bar
 * @strategy    E2E; injects mock token, tests desktop and mobile viewports
 * @cases
 *   - [PASS] 桌面端侧边栏显示用户名和邮箱
 *   - [PASS] 访问 /account 时 Overview 为 active
 *   - [PASS] 访问 /account/orders 时 Orders 为 active，Overview 不为 active
 *   - [PASS] 移动端 Tab Bar 可见，点击 Orders Tab 跳转至 /account/orders
 */
test.describe("Account Layout", () => {
  test("桌面端侧边栏显示用户名和邮箱", async ({ page, context, baseURL }) => {
    await setCustomerAccountCookies(context, baseURL);
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto("/account");

    const nav = page.getByRole("navigation", { name: "Account navigation" });
    await expect(nav.getByText("Ada Lovelace")).toBeVisible();
    await expect(nav.getByText("ada@example.com")).toBeVisible();
  });

  test("访问 /account 时 Overview 导航项为 active", async ({ page, context, baseURL }) => {
    await setCustomerAccountCookies(context, baseURL);
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto("/account");

    const desktopNav = page.getByTestId("account-nav-desktop");
    await expect(desktopNav.getByRole("link", { name: "Overview" })).toHaveAttribute("aria-current", "page");
    await expect(desktopNav.getByRole("link", { name: "Orders" })).not.toHaveAttribute("aria-current", "page");
  });

  test("访问 /account/orders 时 Orders 为 active，Overview 不为 active", async ({ page, context, baseURL }) => {
    await setCustomerAccountCookies(context, baseURL);
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto("/account/orders");

    const desktopNav = page.getByTestId("account-nav-desktop");
    await expect(desktopNav.getByRole("link", { name: "Orders" })).toHaveAttribute("aria-current", "page");
    await expect(desktopNav.getByRole("link", { name: "Overview" })).not.toHaveAttribute("aria-current", "page");
  });

  test("移动端 Tab Bar 可见，点击 Orders Tab 跳转至 /account/orders", async ({ page, context, baseURL }) => {
    await setCustomerAccountCookies(context, baseURL);
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/account");

    const tabBar = page.getByRole("navigation", { name: "Account navigation" });
    await expect(tabBar).toBeVisible();

    await tabBar.getByRole("link", { name: "Orders" }).click();
    await expect(page).toHaveURL(/\/account\/orders$/);
  });
});
