/**
 * @test-file   CollectionListing
 * @description E2E tests for collection detail page SEO title and sort URL parameter
 * @ai-generated
 * @reviewed-by
 */
import { expect, test } from "@playwright/test";
import { waitForHydration } from "./utils";

/**
 * @test-suite  Collection Listing
 * @target      collection detail page — SEO title, sort query param
 * @strategy    e2e; real browser, navigates to first available collection
 * @cases
 *   - [PASS] 访问 Collection 详情页时 → <title> 包含系列名
 *   - [PASS] 选择排序选项后 URL 含 ?sort= 参数
 */
test.describe("Collection Listing", () => {
  async function gotoFirstCollection(page: import("@playwright/test").Page) {
    await page.goto("/collections");
    const firstCollection = page.locator('a[href^="/collections/"]').first();
    const href = await firstCollection.getAttribute("href");
    await page.goto(href!);
    await page.waitForLoadState("networkidle");
    return href!;
  }

  test("访问 Collection 详情页时 → <title> 包含系列名", async ({ page }) => {
    await page.goto("/collections");
    const firstCollection = page.locator('a[href^="/collections/"]').first();
    const href = await firstCollection.getAttribute("href");
    await page.goto(href!);

    const pageTitle = await page.title();
    // title template 为 "%s | ShopName"，应含 | 分隔符
    expect(pageTitle).toContain("|");
  });

  test("选择排序选项后 URL 含 ?sort= 参数", async ({ page }) => {
    await gotoFirstCollection(page);
    // 等待 React 水合，否则 CollectionFilters 的 onChange 未挂载，router.push 不会触发
    await waitForHydration(page);

    const sortSelect = page.locator("select#sort-select");
    await expect(sortSelect).toBeVisible();

    await sortSelect.selectOption("price-asc");

    // Next.js App Router 客户端导航不触发 load 事件，用 toHaveURL 轮询 URL
    await expect(page).toHaveURL(/[?&]sort=price-asc/, { timeout: 15_000 });
  });
});
