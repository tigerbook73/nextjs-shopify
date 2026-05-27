import { expect, test } from "@playwright/test";

test.describe("Product Badges", () => {
  test("/products 页面正常渲染，无 JS 错误", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (err) => errors.push(err.message));

    await page.goto("/products");

    await expect(page.locator("main")).toBeVisible();
    expect(errors).toHaveLength(0);
  });
});
