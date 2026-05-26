import { expect, test } from "@playwright/test";

test.describe("Phase 7 错误页面验收", () => {
  test("未知路由展示自定义 404 页面", async ({ page }) => {
    await page.goto("/__phase7-missing");

    await expect(page.getByRole("heading", { name: "页面不存在" })).toBeVisible();
    await expect(page.getByRole("link", { name: "返回首页" })).toBeVisible();
    await expect(page.getByRole("link", { name: "浏览商品" })).toBeVisible();
  });

  test("测试专用错误页展示错误边界和恢复入口", async ({ page }) => {
    await page.goto("/phase7-error-test");

    await expect(page.getByRole("heading", { name: "页面暂时无法显示" })).toBeVisible();
    await expect(page.getByRole("button", { name: "重试" })).toBeVisible();
    await expect(page.getByRole("link", { name: "返回首页" })).toBeVisible();
  });
});
