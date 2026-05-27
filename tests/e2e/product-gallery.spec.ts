import { expect, test } from "@playwright/test";

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
