import type { Page } from "@playwright/test";

/**
 * 等待 React 水合完成。
 * HydrationMarker 组件在 useEffect 里设置 html[data-hydrated="true"]，
 * 保证所有客户端组件的 onClick/onChange 均已挂载。
 */
export async function waitForHydration(page: Page, timeout = 10_000) {
  await page.waitForFunction(
    () => {
      return document.documentElement.dataset.hydrated === "true" || window.__HYDRATED === true;
    },
    { timeout },
  );
}
