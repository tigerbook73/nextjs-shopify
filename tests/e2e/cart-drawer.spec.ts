/**
 * @test-file   CartDrawer
 * @description E2E tests for cart drawer open/close, add-to-cart flow, and cart count sync
 * @ai-generated
 * @reviewed-by Shengtian Liao @ [2]
 */
import { expect, test, type Page } from "@playwright/test";
import { waitForHydration } from "./utils";

/**
 * 遍历 /products，找到第一个可加购商品（跳过下架商品）
 * 先批量收集 href 再逐一导航，避免跨页后 locator 失效
 */
async function gotoAvailableProduct(page: Page) {
  await page.goto("/products");
  const hrefs = await page
    .locator('a[href^="/products/"]')
    .evaluateAll((els) => els.map((el) => el.getAttribute("href")).filter(Boolean) as string[]);

  for (const href of hrefs.slice(0, 10)) {
    await page.goto(href);
    await page.waitForLoadState("networkidle");
    const addBtn = page.getByRole("button", { name: "Add to Cart" });
    const visible = await expect(addBtn)
      .toBeVisible({ timeout: 5_000 })
      .then(() => true)
      .catch(() => false);
    if (visible) return;
  }
  throw new Error("No available product found in first 10 results");
}

function cartButton(page: Page) {
  // Base UI Dialog sets aria-hidden on non-dialog elements when open,
  // so getByRole() can't find the button. Use a CSS selector instead.
  return page.locator('button[aria-label^="Open cart"]');
}

/**
 * @test-suite  Cart Drawer
 * @target      CartDrawer component — open/close triggers, cart count updates, /cart page
 * @strategy    e2e; real browser, navigates to first available product before cart tests
 * @cases
 *   - [PASS] 商品详情页点击 Add to Cart 后 Drawer 面板出现且可见
 *   - [PASS] Drawer 打开后点击遮罩，Drawer 消失
 *   - [PASS] 直接访问 /cart 页面正常渲染不报错
 *   - [PASS] 无购物车 cookie 时 header 显示 0 items，首次加购后计数更新
 *   - [PASS] 连续两次 Add to Cart 后 header 计数精确匹配 totalQuantity
 *   - [PASS] Drawer 中减少商品数量后 header 计数随之更新
 *   - [PASS] Add to Cart 后 header 购物车 accessible label 计数更新
 *   - [PASS] Drawer 中增加商品数量后 header 计数随之更新
 *   - [PASS] Drawer 中移除商品后 header 计数减少
 */
test.describe("Cart Drawer", () => {
  test("商品详情页点击 Add to Cart 后 Drawer 面板出现且可见", async ({ page }) => {
    await gotoAvailableProduct(page);
    // 等待 React 水合，确保 AddToCartButton 的 onClick 已挂载
    await waitForHydration(page);

    await page.getByRole("button", { name: "Add to Cart" }).click();

    await expect(page.getByRole("dialog", { name: "Your Cart" })).toBeVisible({
      timeout: 10_000,
    });
  });

  test("Drawer 打开后点击遮罩，Drawer 消失", async ({ page }) => {
    await gotoAvailableProduct(page);
    await waitForHydration(page);
    await page.getByRole("button", { name: "Add to Cart" }).click();

    const drawer = page.getByRole("dialog", { name: "Your Cart" });
    await expect(drawer).toBeVisible({ timeout: 10_000 });

    // SheetOverlay 由 Base UI 渲染，通过 data-slot 定位并 dispatchEvent 触发关闭
    await page.locator("[data-slot='sheet-overlay']").dispatchEvent("click");

    await expect(drawer).not.toBeVisible({ timeout: 5_000 });
  });

  test("直接访问 /cart 页面正常渲染不报错", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (err) => errors.push(err.message));

    await page.goto("/cart");

    await expect(page.getByRole("heading", { name: "Shopping Cart" })).toBeVisible();
    expect(errors).toHaveLength(0);
  });

  test("无购物车 cookie 时 header 显示 0 items，首次加购后计数更新", async ({ page }) => {
    await page.goto("/");
    await waitForHydration(page);
    await expect(cartButton(page)).toHaveAttribute("aria-label", "Open cart (0 items)");

    await gotoAvailableProduct(page);
    await waitForHydration(page);
    await page.getByRole("button", { name: "Add to Cart" }).click();

    await expect(cartButton(page)).toHaveAttribute("aria-label", "Open cart (1 items)", {
      timeout: 10_000,
    });
  });

  test("连续两次 Add to Cart 后 header 计数精确匹配 totalQuantity", async ({ page }) => {
    await gotoAvailableProduct(page);
    await waitForHydration(page);

    await page.getByRole("button", { name: "Add to Cart" }).click();
    await expect(page.getByRole("dialog", { name: "Your Cart" })).toBeVisible({ timeout: 10_000 });
    await page.getByRole("button", { name: "Close cart" }).click();
    // Wait for dialog to fully unmount before the next click — with a fast mock server the
    // Radix close animation hasn't finished yet when the next line runs, leaving aria-hidden
    // on the product page and making getByRole unable to find "Add to Cart".
    await expect(page.getByRole("dialog", { name: "Your Cart" })).not.toBeVisible({ timeout: 5_000 });

    await page.getByRole("button", { name: "Add to Cart" }).click();
    await expect(page.getByRole("dialog", { name: "Your Cart" })).toBeVisible({ timeout: 10_000 });

    await expect(cartButton(page)).toHaveAttribute("aria-label", "Open cart (2 items)", {
      timeout: 10_000,
    });
  });

  test("Drawer 中减少商品数量后 header 计数随之更新", async ({ page }) => {
    await gotoAvailableProduct(page);
    await waitForHydration(page);

    await page.getByRole("button", { name: "Add to Cart" }).click();
    const drawer = page.getByRole("dialog", { name: "Your Cart" });
    await expect(drawer).toBeVisible({ timeout: 10_000 });

    await drawer.getByRole("button", { name: "Increase quantity" }).first().click();
    await expect(cartButton(page)).toHaveAttribute("aria-label", "Open cart (2 items)", {
      timeout: 10_000,
    });

    await drawer.getByRole("button", { name: "Decrease quantity" }).first().click();
    await expect(cartButton(page)).toHaveAttribute("aria-label", "Open cart (1 items)", {
      timeout: 10_000,
    });
  });

  test("Add to Cart 后 header 购物车 accessible label 计数更新", async ({ page }) => {
    await gotoAvailableProduct(page);
    await waitForHydration(page);

    await expect(cartButton(page)).toHaveAttribute("aria-label", "Open cart (0 items)");

    await page.getByRole("button", { name: "Add to Cart" }).click();
    await expect(page.getByRole("dialog", { name: "Your Cart" })).toBeVisible({
      timeout: 10_000,
    });

    await expect(cartButton(page)).not.toHaveAttribute("aria-label", "Open cart (0 items)");
  });

  test("Drawer 中增加商品数量后 header 计数随之更新", async ({ page }) => {
    await gotoAvailableProduct(page);
    await waitForHydration(page);

    await page.getByRole("button", { name: "Add to Cart" }).click();
    const drawer = page.getByRole("dialog", { name: "Your Cart" });
    await expect(drawer).toBeVisible({ timeout: 10_000 });

    const labelBefore = await cartButton(page).getAttribute("aria-label");

    await drawer.getByRole("button", { name: "Increase quantity" }).first().click();

    await expect(cartButton(page)).not.toHaveAttribute("aria-label", labelBefore!, {
      timeout: 10_000,
    });
  });

  test("Drawer 中移除商品后 header 计数减少", async ({ page }) => {
    await gotoAvailableProduct(page);
    await waitForHydration(page);

    await page.getByRole("button", { name: "Add to Cart" }).click();
    const drawer = page.getByRole("dialog", { name: "Your Cart" });
    await expect(drawer).toBeVisible({ timeout: 10_000 });

    await drawer.getByRole("button", { name: "Remove" }).first().click();

    await expect(cartButton(page)).toHaveAttribute("aria-label", "Open cart (0 items)", {
      timeout: 10_000,
    });
  });
});
