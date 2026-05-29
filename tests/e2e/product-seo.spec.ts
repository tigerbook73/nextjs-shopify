/**
 * @test-file   ProductSEO
 * @description E2E test verifying product detail page title contains the product name
 * @ai-generated
 * @reviewed-by
 */
import { expect, test } from "@playwright/test";

/**
 * @test-suite  Product SEO & Related Products
 * @target      product detail page — <title> tag SEO content
 * @strategy    e2e; real browser, navigates to first product in listing
 * @cases
 *   - [PASS] 商品详情页 <title> 包含商品名（非默认店铺名）
 */
test.describe("Product SEO & Related Products", () => {
  test("商品详情页 <title> 包含商品名（非默认店铺名）", async ({ page }) => {
    await page.goto("/products");

    const firstProduct = page.locator('a[href^="/products/"]').first();
    const productTitle = await firstProduct.locator("p, h2, h3").first().textContent();
    const href = await firstProduct.getAttribute("href");
    await page.goto(href!);

    const pageTitle = await page.title();
    // title 应包含商品名，而不只是默认的店铺名
    expect(pageTitle).not.toMatch(/^[^|]+$/); // 应含 | 分隔符（template: '%s | ShopName'）
    if (productTitle) {
      expect(pageTitle).toContain(productTitle.trim());
    }
  });
});
