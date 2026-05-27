import { expect, test } from "@playwright/test";
import { waitForHydration } from "./utils";

const STORAGE_KEY = "ann-dismissed";

test.describe("Announcement Bar", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.evaluate((key) => localStorage.removeItem(key), STORAGE_KEY);
    await page.reload();
    // 等待 React 水合完成，否则生产构建下 onClick 尚未挂载
    await waitForHydration(page);
  });

  test("首次访问 / 时促销文案可见", async ({ page }) => {
    await expect(page.getByText("Free shipping on all orders")).toBeVisible();
  });

  test("点击 × 后促销条消失", async ({ page }) => {
    const closeBtn = page.getByRole("button", { name: "Close announcement" });
    await closeBtn.click();
    // 组件 return null 后按钮从 DOM 中移除
    await expect(closeBtn).not.toBeAttached({ timeout: 10_000 });
  });

  test("dismiss 后重新导航，促销条不再显示", async ({ page }) => {
    await page.getByRole("button", { name: "Close announcement" }).click();

    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // localStorage 中已记录 dismiss，水合后组件不渲染
    await expect(page.getByRole("button", { name: "Close announcement" })).not.toBeAttached({
      timeout: 10_000,
    });
  });
});
