/**
 * @test-file   Homepage
 * @description E2E tests for homepage content, navigation links, and layout attributes
 * @ai-generated
 * @reviewed-by
 */
import { expect, test } from "@playwright/test";

/**
 * @test-suite  Homepage
 * @target      homepage layout — hero section, nav links, font, lang attribute
 * @strategy    e2e; real browser, navigates to / before each test
 * @cases
 *   - [PASS] 访问首页时 → 不含调试内容且显示 Hero 标题
 *   - [PASS] 点击 Shop All Products 跳转至 /products
 *   - [PASS] 点击 Browse Collections 跳转至 /collections
 *   - [PASS] 访问首页时 → 含至少一个 CollectionCard 和一个 ProductCard
 *   - [PASS] 访问首页时 → 根布局 lang 属性为 en 且使用 Geist 字体
 */
test.describe("Homepage", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("访问首页时 → 不含调试内容且显示 Hero 标题", async ({ page }) => {
    await expect(page.getByText("Phase 0")).not.toBeVisible();
    await expect(page.getByRole("heading", { name: "Discover Our Collection" })).toBeVisible();
  });

  test("点击 Shop All Products 跳转至 /products", async ({ page }) => {
    await page.getByRole("link", { name: "Shop All Products" }).click();
    await expect(page).toHaveURL(/\/products/);
  });

  test("点击 Browse Collections 跳转至 /collections", async ({ page }) => {
    await page.getByRole("link", { name: "Browse Collections" }).click();
    await expect(page).toHaveURL(/\/collections/);
  });

  test("访问首页时 → 含至少一个 CollectionCard 和一个 ProductCard", async ({ page }) => {
    // CollectionCard 指向 /collections/*
    const collectionLinks = page.locator('a[href^="/collections/"]');
    await expect(collectionLinks.first()).toBeVisible();

    // ProductCard 指向 /products/*
    const productLinks = page.locator('a[href^="/products/"]');
    await expect(productLinks.first()).toBeVisible();
  });

  test("访问首页时 → 根布局 lang 属性为 en 且使用 Geist 字体", async ({ page }) => {
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
    const fontFamily = await page.locator("html").evaluate((el) => getComputedStyle(el).fontFamily);
    expect(fontFamily).toContain("Geist");
  });
});
