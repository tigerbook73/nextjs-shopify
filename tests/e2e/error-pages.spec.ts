import { expect, test } from "@playwright/test";

test.describe("Error Pages", () => {
  test("未知路由展示自定义 404 页面", async ({ page }) => {
    await page.goto("/test-pages/page-missing");

    await expect(page.getByRole("heading", { name: "页面不存在" })).toBeVisible();
    await expect(page.getByRole("link", { name: "返回首页" })).toBeVisible();
    await expect(page.getByRole("link", { name: "浏览商品" })).toBeVisible();
  });

  test("错误边界测试页正确触发错误边界并展示恢复入口", async ({ page }) => {
    await page.goto("/test-pages/page-error");

    await expect(page.getByRole("heading", { name: "错误边界运行正常" })).toBeVisible();
    await expect(page.getByRole("button", { name: "重试" })).toBeVisible();
    await expect(page.getByRole("link", { name: "返回首页" })).toBeVisible();
  });
});
