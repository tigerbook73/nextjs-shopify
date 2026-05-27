"use client";

import { useEffect } from "react";

/** 水合完成后在 <html> 设置 data-hydrated="true"，供 E2E 测试等待 */
export default function HydrationMarker() {
  useEffect(() => {
    document.documentElement.dataset.hydrated = "true";
    window.__HYDRATED = true;
  }, []);
  return null;
}
