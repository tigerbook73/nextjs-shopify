import { expect, test } from "@playwright/test";

test.describe("Phase 7 字体配置验收", () => {
  test("根布局通过 next/font 应用字体变量", async ({ page }) => {
    await page.goto("/__phase7-missing");

    const html = page.locator("html");
    await expect(html).toHaveAttribute("lang", "zh-CN");

    const fontFamily = await html.evaluate((element) => getComputedStyle(element).fontFamily);
    expect(fontFamily).toContain("Geist");
  });
});
