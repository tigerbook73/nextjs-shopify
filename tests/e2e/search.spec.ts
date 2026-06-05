/**
 * @test-file   Search
 * @description E2E tests for the /search page — empty state, results rendering, title metadata, and pagination
 * @ai-generated
 * @reviewed-by
 */
import { expect, test } from "@playwright/test";

/**
 * @test-suite  Search
 * @target      /search page — empty state, result display, SEO title, pagination
 * @strategy    e2e; mock server handles Search operation (21 "shirt" results trigger pagination)
 * @cases
 *   - [PASS] 无 q 参数时显示提示文字，不显示结果列表
 *   - [PASS] ?q=shirt 时显示搜索结果区域和结果计数
 *   - [PASS] ?q=shirt 时页面 title 包含搜索词
 *   - [PASS] 搜索结果超过一页时显示 Next page 分页按钮
 *   - [PASS] 搜索无结果时显示 "No results" 提示
 */
test.describe("Search", () => {
  test("无 q 参数时显示提示文字且不显示结果", async ({ page }) => {
    await page.goto("/search");
    await page.waitForLoadState("networkidle");

    await expect(page.getByRole("heading", { name: "Search" })).toBeVisible();
    await expect(page.getByText("Enter a keyword above to search products and collections.")).toBeVisible();
    await expect(page.getByTestId("search-results")).not.toBeVisible();
  });

  test("?q=shirt 时显示搜索结果区域", { tag: ["@smoke"] }, async ({ page }) => {
    await page.goto("/search?q=shirt");
    await page.waitForLoadState("networkidle");

    await expect(page.getByTestId("search-results")).toBeVisible();
    // Mock server has 21 shirts — result count text should be visible
    await expect(page.getByText(/results for/i)).toBeVisible();
  });

  test("?q=shirt 时页面 title 包含搜索词", async ({ page }) => {
    await page.goto("/search?q=shirt");
    await expect(page).toHaveTitle(/shirt/i);
  });

  test("搜索结果超过一页时显示 Next page 分页按钮", async ({ page }) => {
    // Mock server has 21 shirts with pageSize=20, so there is a second page
    await page.goto("/search?q=shirt");
    await page.waitForLoadState("networkidle");

    await expect(page.getByRole("link", { name: /Next page/i })).toBeVisible();
  });

  test("翻页时 URL 同时保留搜索词和游标", async ({ page }) => {
    await page.goto("/search?q=shirt");
    await page.waitForLoadState("networkidle");

    await page.getByRole("link", { name: /Next page/i }).click();
    await page.waitForLoadState("networkidle");

    const url = new URL(page.url());
    expect(url.searchParams.get("q")).toBe("shirt");
    expect(url.searchParams.has("after")).toBe(true);
  });

  test("搜索无匹配结果时显示 No results 提示", async ({ page }) => {
    await page.goto("/search?q=zzznomatchproduct");
    await page.waitForLoadState("networkidle");

    await expect(page.getByText(/No results for/i)).toBeVisible();
  });
});
