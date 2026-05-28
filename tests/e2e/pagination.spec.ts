import { expect, test } from "@playwright/test";
import { waitForHydration } from "./utils";

test.describe("Pagination", () => {
  // ─── All Products ───────────────────────────────────────────────────────────

  test("All Products — 第一页不显示「Prev page」按钮", async ({ page }) => {
    await page.goto("/products");
    await page.waitForLoadState("networkidle");

    await expect(page.getByRole("link", { name: /← Prev page/i })).not.toBeVisible();
  });

  test("All Products — 下一页：URL 含 after=，商品列表更新", async ({ page }) => {
    await page.goto("/products");
    await page.waitForLoadState("networkidle");

    const nextLink = page.getByRole("link", { name: /Next page →/i });
    if (!(await nextLink.isVisible())) {
      test.skip(true, "商品数量 ≤ 18，无分页按钮");
      return;
    }

    const firstProductText = await page.locator(".grid > a, .grid > div").first().textContent();
    await nextLink.click();
    await page.waitForLoadState("networkidle");

    await expect(page).toHaveURL(/[?&]after=/, { timeout: 10_000 });

    const newFirstProductText = await page.locator(".grid > a, .grid > div").first().textContent();
    expect(newFirstProductText).not.toBe(firstProductText);
  });

  test("All Products — 上一页：内容回到第一页，不再有「Prev page」按钮", async ({ page }) => {
    await page.goto("/products");
    await page.waitForLoadState("networkidle");

    const nextLink = page.getByRole("link", { name: /Next page →/i });
    if (!(await nextLink.isVisible())) {
      test.skip(true, "商品数量 ≤ 20，无分页按钮");
      return;
    }

    // 记录第一页的第一个商品标题
    const firstPageTitle = await page.locator(".grid a, .grid article").first().textContent();

    await nextLink.click();
    await page.waitForLoadState("networkidle");
    await expect(page).toHaveURL(/[?&]after=/, { timeout: 10_000 });

    await page.getByRole("link", { name: /← Prev page/i }).click();
    await page.waitForLoadState("networkidle");

    // cursor-based pagination：回到第一页的 URL 可能含 ?before=xxx，但内容应与第一页一致
    await expect(page).not.toHaveURL(/[?&]after=/, { timeout: 10_000 });
    const backTitle = await page.locator(".grid a, .grid article").first().textContent();
    expect(backTitle).toBe(firstPageTitle);
    // 第一页无「上一页」按钮
    await expect(page.getByRole("link", { name: /← Prev page/i })).not.toBeVisible();
  });

  // ─── Search ──────────────────────────────────────────────────────────────────

  test("Search — 翻页时保留搜索词（URL 同时含 q= 和 after=）", async ({ page }) => {
    await page.goto("/search?q=shirt");
    await page.waitForLoadState("networkidle");

    const nextLink = page.getByRole("link", { name: /Next page →/i });
    if (!(await nextLink.isVisible())) {
      test.skip(true, "搜索结果 ≤ 18，无分页按钮");
      return;
    }

    await nextLink.click();
    await page.waitForLoadState("networkidle");

    await expect(page).toHaveURL(/[?&]q=shirt/, { timeout: 10_000 });
    await expect(page).toHaveURL(/[?&]after=/, { timeout: 10_000 });
  });

  // ─── Collection ──────────────────────────────────────────────────────────────

  test("Collection — 翻页时保留排序参数（URL 同时含 after= 和 sort=）", async ({ page }) => {
    await page.goto("/collections");
    const firstCollection = page.locator('a[href^="/collections/"]').first();
    const href = await firstCollection.getAttribute("href");
    await page.goto(href!);
    await page.waitForLoadState("networkidle");
    await waitForHydration(page);

    await page.locator("select#sort-select").selectOption("price-asc");
    await expect(page).toHaveURL(/[?&]sort=price-asc/, { timeout: 15_000 });
    await page.waitForLoadState("networkidle");

    const nextLink = page.getByRole("link", { name: /Next page →/i });
    if (!(await nextLink.isVisible())) {
      test.skip(true, "该 Collection 商品数量 ≤ 18，无分页按钮");
      return;
    }

    await nextLink.click();
    await page.waitForLoadState("networkidle");

    await expect(page).toHaveURL(/[?&]after=/, { timeout: 10_000 });
    await expect(page).toHaveURL(/[?&]sort=price-asc/, { timeout: 10_000 });
  });

  test("Collection — 商品数量 ≤ 18 时不显示分页按钮", async ({ page }) => {
    await page.goto("/collections");
    await page.waitForLoadState("networkidle");

    const collectionLinks = page.locator('a[href^="/collections/"]');
    const count = await collectionLinks.count();

    for (let i = 0; i < count; i++) {
      const href = await collectionLinks.nth(i).getAttribute("href");
      if (!href) continue;

      await page.goto(href);
      await page.waitForLoadState("networkidle");

      const hasNext = await page.getByRole("link", { name: /Next page →/i }).isVisible();
      if (!hasNext) {
        await expect(page.getByRole("link", { name: /← Prev page/i })).not.toBeVisible();
        return;
      }
    }

    test.skip(true, "所有 Collection 商品数量均 > 18，无法验证该边界场景");
  });
});
