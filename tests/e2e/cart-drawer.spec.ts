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
    const addBtn = page.getByRole("button", { name: "Add to Cart" });
    if (await addBtn.isVisible({ timeout: 2_000 }).catch(() => false)) return;
  }
  throw new Error("No available product found in first 10 results");
}

test.describe("Cart Drawer", () => {
  test("商品详情页点击 Add to Cart 后 Drawer 面板出现且可见", async ({ page }) => {
    await gotoAvailableProduct(page);
    // 等待 React 水合，确保 AddToCartButton 的 onClick 已挂载
    await waitForHydration(page);

    await page.getByRole("button", { name: "Add to Cart" }).click();

    await expect(page.getByRole("region", { name: "Shopping cart" })).toBeVisible({
      timeout: 10_000,
    });
  });

  test("Drawer 打开后点击遮罩，Drawer 消失", async ({ page }) => {
    await gotoAvailableProduct(page);
    await waitForHydration(page);
    await page.getByRole("button", { name: "Add to Cart" }).click();

    const drawer = page.getByRole("region", { name: "Shopping cart" });
    await expect(drawer).toBeVisible({ timeout: 10_000 });

    // 遮罩（fixed inset-0 z-40）被 Drawer 面板遮挡，dispatchEvent 直接触发元素事件绕过 z-index
    await page.locator("div.fixed.inset-0.z-40").dispatchEvent("click");

    await expect(drawer).not.toBeVisible({ timeout: 5_000 });
  });

  test("直接访问 /cart 页面正常渲染不报错", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (err) => errors.push(err.message));

    await page.goto("/cart");

    // 使用 heading 避免 strict mode violation（两个 <main> 匹配）
    await expect(page.getByRole("heading", { name: "Shopping Cart" })).toBeVisible();
    expect(errors).toHaveLength(0);
  });
});
