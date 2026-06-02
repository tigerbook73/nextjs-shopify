/**
 * @test-file   AnnouncementBar
 * @description E2E tests for announcement bar visibility and cookie-based dismiss behavior
 * @ai-generated
 * @reviewed-by
 */
import { expect, test } from "@playwright/test";
import { waitForHydration } from "./utils";

/**
 * @test-suite  Announcement Bar
 * @target      AnnouncementBar component — visibility and cookie-based dismiss
 * @strategy    e2e; real browser, real server, cookies cleared before each test
 * @cases
 *   - [PASS] 首次访问 / 时促销文案可见
 *   - [PASS] 点击 × 后促销条消失
 *   - [PASS] dismiss 后刷新，促销条不再显示
 */
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
