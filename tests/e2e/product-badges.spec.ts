/**
 * @test-file   ProductBadges
 * @description E2E smoke test verifying /products page renders without JavaScript errors
 * @ai-generated
 * @reviewed-by
 */
import { expect, test } from "@playwright/test";

/**
 * @test-suite  Product Badges
 * @target      /products page — basic render and absence of JS errors
 * @strategy    e2e; real browser, listens for page errors
 * @cases
 *   - [PASS] /products 页面正常渲染，无 JS 错误
 */
test.describe("Product Badges", () => {
  test("/products 页面正常渲染，无 JS 错误", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (err) => errors.push(err.message));

    await page.goto("/products");

    await expect(page.locator("main")).toBeVisible();
    expect(errors).toHaveLength(0);
  });
});
