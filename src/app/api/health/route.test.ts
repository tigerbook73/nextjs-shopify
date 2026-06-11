/**
 * @test-file   Health Route
 * @description GET /api/health — Shopify liveness probe returning status ok or error
 * @ai-generated
 * @reviewed-by (!HUMAN EDIT ONLY): Shengtian Liao @ [1]
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/shopify/storefront/client", () => ({
  shopifyFetch: vi.fn(),
}));

vi.mock("@/lib/shopify/storefront/queries", () => ({
  GET_SHOP_QUERY: {},
}));

const { shopifyFetch } = await import("@/lib/shopify/storefront/client");
const { GET } = await import("@/app/api/health/route");

const mockShopifyFetch = vi.mocked(shopifyFetch);

describe("GET /api/health", () => {
  beforeEach(() => vi.clearAllMocks());

  /**
   * @test-suite  Shopify liveness
   * @target      response shape and HTTP status based on shopifyFetch outcome
   * @strategy    unit — shopifyFetch mocked
   * @cases
   *   - [PASS] returns status ok with HTTP 200 when Shopify responds successfully
   *   - [FAIL] returns status error with HTTP 503 when Shopify fetch throws
   *   - [FAIL] returns the error message in the error field when Shopify fetch throws
   */
  describe("Shopify liveness", () => {
    it("returns status ok with HTTP 200 when Shopify responds successfully", async () => {
      mockShopifyFetch.mockResolvedValue({ shop: { name: "Test Shop", description: "" } });

      const res = await GET();

      expect(res.status).toBe(200);
      expect(await res.json()).toEqual({ status: "ok" });
    });

    it("returns status error with HTTP 503 when Shopify fetch throws", async () => {
      mockShopifyFetch.mockRejectedValue(new Error("Shopify API error: 503 Service Unavailable"));

      const res = await GET();

      expect(res.status).toBe(503);
    });

    it("returns the error message in the error field when Shopify fetch throws", async () => {
      mockShopifyFetch.mockRejectedValue(new Error("store is down"));

      const res = await GET();

      expect(await res.json()).toEqual({ status: "error", error: "store is down" });
    });
  });
});
