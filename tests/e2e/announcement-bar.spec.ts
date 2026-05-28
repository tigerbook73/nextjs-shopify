import { expect, test } from "@playwright/test";
import { waitForHydration } from "./utils";

test.describe("Announcement Bar", () => {
  test.beforeEach(async ({ page, context }) => {
    await context.clearCookies();
    await page.goto("/");
    await waitForHydration(page);
  });

  test("首次访问 / 时促销文案可见", async ({ page }) => {
    await expect(page.getByText("Free shipping on all orders")).toBeVisible();
  });

  test("点击 × 后促销条消失", async ({ page }) => {
    const closeBtn = page.getByRole("button", { name: "Close announcement" });
    await closeBtn.click();
    await expect(closeBtn).not.toBeAttached({ timeout: 10_000 });
  });

  test("dismiss 后刷新，促销条不再显示", async ({ page }) => {
    await page.getByRole("button", { name: "Close announcement" }).click();

    await page.reload();
    await page.waitForLoadState("networkidle");

    // cookie 已记录 dismiss，SSR 直接不渲染，无闪现
    await expect(page.getByRole("button", { name: "Close announcement" })).not.toBeAttached({
      timeout: 10_000,
    });
  });
});
