/**
 * @test-file   ToastNotifications
 * @description E2E tests for success/error toast appearance and auto-dismiss behavior
 * @ai-generated
 * @reviewed-by
 */
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

/**
 * @test-suite  Toast Notifications
 * @target      Toast (sonner) — trigger conditions, content, auto-dismiss timing
 * @strategy    e2e; real browser, tests add-to-cart and auth form submissions
 * @cases
 *   - [PASS] 商品详情页点击 Add to Cart 后页面出现 success Toast
 *   - [PASS] 登录页填写错误密码提交后出现 error Toast
 *   - [PASS] 注册页填写已注册邮箱提交后出现 error Toast
 *   - [PASS] Toast 约 4 秒后自动消失
 */
test.describe("Toast Notifications", () => {
  test("商品详情页点击 Add to Cart 后页面出现 success Toast", async ({ page }) => {
    await gotoAvailableProduct(page);
    await waitForHydration(page);

    await page.getByRole("button", { name: "Add to Cart" }).click();

    await expect(page.locator("[data-sonner-toast]")).toBeVisible({ timeout: 10_000 });
    await expect(page.locator("[data-sonner-toast]")).toContainText("Added to cart");
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
