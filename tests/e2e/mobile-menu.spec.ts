/**
 * @test-file   MobileMenu
 * @description E2E tests for mobile hamburger menu visibility and open/close behaviors
 * @ai-generated
 * @reviewed-by Shengtian Liao @ [1]
 */
import { expect, test } from "@playwright/test";
import { waitForHydration } from "./utils";

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

    // 通过 dialog 角色和标题定位菜单面板，不依赖 CSS 实现细节
    const panel = page.getByRole("dialog", { name: "Menu" });
    await expect(panel.getByRole("link", { name: "Products" })).toBeVisible();
    await expect(panel.getByRole("link", { name: "Collections" })).toBeVisible();
  });

  test("移动端菜单打开后按 ESC 关闭", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/");
    await waitForHydration(page);

    await page.getByRole("button", { name: "Open menu" }).click();

    const panel = page.getByRole("dialog", { name: "Menu" });
    await expect(panel.getByRole("link", { name: "Products" })).toBeVisible();

    await page.keyboard.press("Escape");

    await expect(panel.getByRole("link", { name: "Products" })).not.toBeVisible();
  });

  test("移动端点击遮罩关闭菜单", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/");
    await waitForHydration(page);

    await page.getByRole("button", { name: "Open menu" }).click();

    const panel = page.getByRole("dialog", { name: "Menu" });
    await expect(panel.getByRole("link", { name: "Products" })).toBeVisible();

    // SheetOverlay 由 Base UI 渲染，通过 data-slot 定位并 dispatchEvent 触发关闭
    await page.locator("[data-slot='sheet-overlay']").dispatchEvent("click");

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
