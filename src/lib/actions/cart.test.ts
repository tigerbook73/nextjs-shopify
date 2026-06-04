/**
 * @test-file   Cart Server Actions
 * @description updateCartBuyerIdentity — buyer identity linking, missing cart, and silent failure
 * @ai-generated
 * @reviewed-by Shengtian Liao @ [1]
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { CART_BUYER_IDENTITY_UPDATE_MUTATION } from "@/lib/shopify/storefront/mutations/cart";

vi.mock("next/headers", () => ({
  cookies: vi.fn(),
}));

vi.mock("@/lib/shopify/storefront/client", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/shopify/storefront/client")>();
  return { ...actual, shopifyFetch: vi.fn() };
});

vi.mock("next/cache", () => ({ revalidateTag: vi.fn() }));

const { cookies } = await import("next/headers");
const { shopifyFetch } = await import("@/lib/shopify/storefront/client");
const { updateCartBuyerIdentity } = await import("@/lib/actions/cart");

const mockCookies = vi.mocked(cookies);
const mockShopifyFetch = vi.mocked(shopifyFetch);

function makeCookieStore(cartId?: string) {
  return {
    get: vi.fn((name: string) => (name === "cartId" && cartId ? { value: cartId } : undefined)),
    set: vi.fn(),
    delete: vi.fn(),
  };
}

describe("updateCartBuyerIdentity", () => {
  beforeEach(() => vi.clearAllMocks());

  /**
   * @test-suite  Cart exists
   * @target      shopifyFetch called with correct cartId and customerAccessToken
   * @strategy    unit — cookies mocked to return cartId
   * @cases
   *   - [PASS] calls shopifyFetch with cartId and customerAccessToken when cart cookie exists
   */
  describe("Cart exists", () => {
    it("calls shopifyFetch with cartId and customerAccessToken when cart cookie exists", async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      mockCookies.mockResolvedValue(makeCookieStore("cart-123") as any);
      mockShopifyFetch.mockResolvedValue({});

      await updateCartBuyerIdentity("tok_abc");

      expect(mockShopifyFetch).toHaveBeenCalledWith({
        query: CART_BUYER_IDENTITY_UPDATE_MUTATION,
        variables: { cartId: "cart-123", buyerIdentity: { customerAccessToken: "tok_abc" } },
        cache: "no-store",
      });
    });
  });

  /**
   * @test-suite  No cart
   * @target      early return when cartId cookie is absent
   * @strategy    unit — cookies mocked to return no cartId
   * @cases
   *   - [SKIP] shopifyFetch not called when cartId cookie is absent
   */
  describe("No cart", () => {
    it("does not call shopifyFetch when cartId cookie is absent", async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      mockCookies.mockResolvedValue(makeCookieStore() as any);

      await updateCartBuyerIdentity("tok_abc");

      expect(mockShopifyFetch).not.toHaveBeenCalled();
    });
  });

  /**
   * @test-suite  shopifyFetch throws
   * @target      silent failure — no exception propagated to caller
   * @strategy    unit — shopifyFetch mocked to throw
   * @cases
   *   - [PASS] resolves without throwing when shopifyFetch throws
   */
  describe("shopifyFetch throws", () => {
    it("resolves without throwing when shopifyFetch throws", async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      mockCookies.mockResolvedValue(makeCookieStore("cart-123") as any);
      mockShopifyFetch.mockRejectedValue(new Error("Network error"));

      await expect(updateCartBuyerIdentity("tok_abc")).resolves.toBeUndefined();
    });
  });
});
