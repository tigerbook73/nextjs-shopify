/**
 * @test-file   SkeletonScreens
 * @description Static file checks verifying loading skeleton files exist and use animate-pulse
 * @ai-generated
 * @reviewed-by
 */
import { test, expect } from "@playwright/test";
import { readFileSync } from "fs";
import { join } from "path";

/**
 * @test-suite  Skeleton Screens
 * @target      loading.tsx files — presence of animate-pulse Tailwind class
 * @strategy    static; reads source file contents directly, no browser
 * @cases
 *   - [PASS] products/loading.tsx 存在且包含 animate-pulse 骨架元素
 *   - [PASS] collections/loading.tsx 存在且包含 animate-pulse 骨架元素
 */
test.describe("Skeleton Screens", () => {
  test("products/loading.tsx 存在且包含 animate-pulse 骨架元素", () => {
    const content = readFileSync(join(process.cwd(), "src/app/products/loading.tsx"), "utf-8");
    expect(content).toContain("animate-pulse");
  });

  test("collections/loading.tsx 存在且包含 animate-pulse 骨架元素", () => {
    const content = readFileSync(join(process.cwd(), "src/app/collections/loading.tsx"), "utf-8");
    expect(content).toContain("animate-pulse");
  });
});
