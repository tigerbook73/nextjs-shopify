/**
 * @test-file   MobileMenu
 * @description E2E tests for mobile hamburger menu visibility and open/close behaviors
 * @ai-generated
 * @reviewed-by
 */
import { expect, test } from "@playwright/test";
import { waitForHydration } from "./utils";

// 移动菜单面板：fixed inset-0 z-50（CartDrawer 用 right-0 top-0，无 inset-0，不会误匹配）
const MENU_PANEL = "div.fixed.inset-0.z-50.bg-white";

/**
 * @test-suite  Mobile Menu
 * @target      MobileMenu component — responsive visibility, open/close triggers
 * @strategy    e2e; real browser, sets viewport per test
 * @cases
 *   - [PASS] 移动端（375px）汉堡按钮可见，桌面端（1280px）不可见
 *   - [PASS] 移动端点击汉堡后全屏菜单出现并含导航链接
 *   - [PASS] 移动端菜单打开后按 ESC 关闭
 *   - [PASS] 移动端点击遮罩关闭菜单
 *   - [PASS] 桌面端 nav 链接直接可见，无汉堡按钮
 */
test.describe("Mobile Menu", () => {
  test("移动端（375px）汉堡按钮可见，桌面端（1280px）不可见", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/");
    await expect(page.getByRole("button", { name: "Open menu" })).toBeVisible();

    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto("/");
    await expect(page.getByRole("button", { name: "Open menu" })).not.toBeVisible();
  });

  test("移动端点击汉堡后全屏菜单出现并含导航链接", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/");
    await waitForHydration(page);

    await page.getByRole("button", { name: "Open menu" }).click();

    // 作用域限定在移动菜单面板内，避免匹配桌面端隐藏的 nav 链接
    const panel = page.locator(MENU_PANEL);
    await expect(panel.getByRole("link", { name: "Products" })).toBeVisible();
    await expect(panel.getByRole("link", { name: "Collections" })).toBeVisible();
  });

  test("移动端菜单打开后按 ESC 关闭", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/");
    await waitForHydration(page);

    await page.getByRole("button", { name: "Open menu" }).click();

    const panel = page.locator(MENU_PANEL);
    await expect(panel.getByRole("link", { name: "Products" })).toBeVisible();

    await page.keyboard.press("Escape");

    await expect(panel.getByRole("link", { name: "Products" })).not.toBeVisible();
  });

  test("移动端点击遮罩关闭菜单", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/");
    await waitForHydration(page);

    await page.getByRole("button", { name: "Open menu" }).click();

    const panel = page.locator(MENU_PANEL);
    await expect(panel.getByRole("link", { name: "Products" })).toBeVisible();

    // 遮罩（fixed inset-0 z-40）被菜单面板遮挡，使用 force:true 直接触发其 onClick
    await page.locator("div.fixed.inset-0.z-40").dispatchEvent("click");

    await expect(panel.getByRole("link", { name: "Products" })).not.toBeVisible();
  });

  test("桌面端 nav 链接直接可见，无汉堡按钮", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto("/");

    await expect(page.locator("header nav").getByRole("link", { name: "Products" })).toBeVisible();
    await expect(page.locator("header nav").getByRole("link", { name: "Collections" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Open menu" })).not.toBeVisible();
  });
});
