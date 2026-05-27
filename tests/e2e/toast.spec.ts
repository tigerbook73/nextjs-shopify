import { expect, test, type Page } from "@playwright/test";
import { waitForHydration } from "./utils";

async function gotoAvailableProduct(page: Page) {
  await page.goto("/products");
  const hrefs = await page
    .locator('a[href^="/products/"]')
    .evaluateAll((els) => els.map((el) => el.getAttribute("href")).filter(Boolean) as string[]);

  for (const href of hrefs.slice(0, 10)) {
    await page.goto(href);
    const addBtn = page.getByRole("button", { name: "Add to Cart" });
    if (await addBtn.isVisible({ timeout: 2_000 }).catch(() => false)) return;
  }
  throw new Error("No available product found in first 10 results");
}

test.describe("Toast Notifications", () => {
  test("商品详情页点击 Add to Cart 后页面出现 success Toast", async ({ page }) => {
    await gotoAvailableProduct(page);
    await waitForHydration(page);

    await page.getByRole("button", { name: "Add to Cart" }).click();

    await expect(page.locator("[data-sonner-toast]")).toBeVisible({ timeout: 10_000 });
    await expect(page.locator("[data-sonner-toast]")).toContainText("Added to cart");
  });

  test("登录页填写错误密码提交后出现 error Toast", async ({ page }) => {
    await page.goto("/account/login");
    await waitForHydration(page);

    await page.fill('input[name="email"]', "nonexistent-user@example.com");
    await page.fill('input[name="password"]', "wrongpassword123");
    await page.getByRole("button", { name: "登录" }).click();

    await expect(page.locator("[data-sonner-toast]")).toBeVisible({ timeout: 10_000 });
  });

  test("注册页填写已注册邮箱提交后出现 error Toast", async ({ page }) => {
    const testEmail = `playwright-test-${Date.now()}@example.com`;
    const testPassword = "testpassword123";

    // 先注册一个新账户
    await page.goto("/account/register");
    await waitForHydration(page);
    await page.fill('input[name="email"]', testEmail);
    await page.fill('input[name="password"]', testPassword);
    await page.getByRole("button", { name: "注册" }).click();
    await page.waitForURL("**/account", { timeout: 15_000 });

    // 清除 session cookie，模拟已登出状态
    await page.context().clearCookies();

    // 用同一邮箱再次注册，触发"已注册"错误
    await page.goto("/account/register");
    await waitForHydration(page);
    await page.fill('input[name="email"]', testEmail);
    await page.fill('input[name="password"]', testPassword);
    await page.getByRole("button", { name: "注册" }).click();

    await expect(page.locator("[data-sonner-toast]")).toBeVisible({ timeout: 10_000 });
  });

  test("Toast 约 4 秒后自动消失", async ({ page }) => {
    await gotoAvailableProduct(page);
    await waitForHydration(page);

    await page.getByRole("button", { name: "Add to Cart" }).click();

    const toast = page.locator("[data-sonner-toast]");
    await expect(toast).toBeVisible({ timeout: 10_000 });
    await expect(toast).not.toBeVisible({ timeout: 6_000 });
  });
});
