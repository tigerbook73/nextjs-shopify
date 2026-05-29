/**
 * @test-file   Footer
 * @description E2E tests for footer section headings, copyright year, and newsletter area
 * @ai-generated
 * @reviewed-by
 */
import { expect, test } from "@playwright/test";

/**
 * @test-suite  Footer
 * @target      Footer component — section headings, copyright year, newsletter form
 * @strategy    e2e; real browser, navigates to homepage before each test
 * @cases
 *   - [PASS] 访问首页时 → Footer 包含四个区块标题
 *   - [PASS] 访问首页时 → 版权行包含当前年份
 *   - [PASS] 访问首页时 → Newsletter 区域包含 Email 输入框和 Join 按钮
 */
test.describe("Footer", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("访问首页时 → Footer 包含四个区块标题", async ({ page }) => {
    const footer = page.locator("footer");
    await expect(footer.getByRole("heading", { name: "About Us" })).toBeVisible();
    await expect(footer.getByRole("heading", { name: "Shop" })).toBeVisible();
    await expect(footer.getByRole("heading", { name: "Account" })).toBeVisible();
    await expect(footer.getByRole("heading", { name: "Stay in Touch" })).toBeVisible();
  });

  test("访问首页时 → 版权行包含当前年份", async ({ page }) => {
    const year = new Date().getFullYear().toString();
    await expect(page.locator("footer")).toContainText(year);
  });

  test("访问首页时 → Newsletter 区域包含 Email 输入框和 Join 按钮", async ({ page }) => {
    const footer = page.locator("footer");
    await expect(footer.locator('input[type="email"]')).toBeVisible();
    await expect(footer.getByRole("button", { name: "Join" })).toBeVisible();
  });
});
