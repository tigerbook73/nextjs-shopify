/**
 * @test-file   Footer
 * @description E2E tests for footer section headings and copyright year
 * @ai-generated
 * @reviewed-by Shengtian Liao @ [1]
 */
import { expect, test } from "@playwright/test";

/**
 * @test-suite  Footer
 * @target      Footer component — section headings, copyright year
 * @strategy    e2e; real browser, navigates to homepage before each test
 * @cases
 *   - [PASS] 访问首页时 → Footer 包含三个区块标题
 *   - [PASS] 访问首页时 → 版权行包含当前年份
 */
test.describe("Footer", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("访问首页时 → Footer 包含三个区块标题", async ({ page }) => {
    const footer = page.locator("footer");
    await expect(footer.getByRole("heading", { name: "About Us" })).toBeVisible();
    await expect(footer.getByRole("heading", { name: "Shop" })).toBeVisible();
    await expect(footer.getByRole("heading", { name: "Account" })).toBeVisible();
  });

  test("访问首页时 → 版权行包含当前年份", async ({ page }) => {
    const year = new Date().getFullYear().toString();
    await expect(page.locator("footer")).toContainText(year);
  });
});
