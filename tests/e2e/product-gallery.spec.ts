/**
 * @test-file   ProductGallery
 * @description E2E test verifying product detail page renders with a visible main image
 * @ai-generated
 * @reviewed-by
 */
import { expect, test } from "@playwright/test";

/**
 * @test-suite  Product Gallery
 * @target      ProductGallery component — main image visibility on product detail page
 * @strategy    e2e; real browser, navigates to first product in listing
 * @cases
 *   - [PASS] 商品详情页正常渲染，主图区域存在于 DOM
 */
test.describe("Product Gallery", () => {
  test("商品详情页正常渲染，主图区域存在于 DOM", async ({ page }) => {
    await page.goto("/products");

    const firstProduct = page.locator('a[href^="/products/"]').first();
    await expect(firstProduct).toBeVisible();
    const href = await firstProduct.getAttribute("href");
    await page.goto(href!);

    // 主图区域：ProductGallery 中的 img 元素
    await expect(page.locator("main img").first()).toBeVisible();
  });
});
