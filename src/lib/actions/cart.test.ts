/**
 * @test-file   Cart Server Actions
 * @description addToCart, removeFromCart, updateCartQuantity, updateCartBuyerIdentity — CRUD, error paths, and silent failure
 * @ai-generated
 * @reviewed-by (!HUMAN EDIT ONLY): Shengtian Liao @ [2]
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { CART_BUYER_IDENTITY_UPDATE_MUTATION } from "@/lib/shopify/storefront/mutations/cart";
import type { Cart } from "@/lib/shopify/storefront/types";

vi.mock("next/headers", () => ({
  cookies: vi.fn(),
}));

vi.mock("@/lib/shopify/storefront/client", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/shopify/storefront/client")>();
  return {
    ...actual,
    shopifyFetch: vi.fn(),
    createCart: vi.fn(),
    addCartLines: vi.fn(),
    updateCartLines: vi.fn(),
    removeCartLines: vi.fn(),
  };
});

vi.mock("next/cache", () => ({ revalidateTag: vi.fn() }));

const { cookies } = await import("next/headers");
const { shopifyFetch, createCart, addCartLines, updateCartLines, removeCartLines } =
  await import("@/lib/shopify/storefront/client");
const { revalidateTag } = await import("next/cache");
const { updateCartBuyerIdentity, addToCart, removeFromCart, updateCartQuantity } = await import("@/lib/actions/cart");

const mockCookies = vi.mocked(cookies);
const mockShopifyFetch = vi.mocked(shopifyFetch);
const mockCreateCart = vi.mocked(createCart);
const mockAddCartLines = vi.mocked(addCartLines);
const mockUpdateCartLines = vi.mocked(updateCartLines);
const mockRemoveCartLines = vi.mocked(removeCartLines);
const mockRevalidateTag = vi.mocked(revalidateTag);

function makeCart(totalQuantity = 1): Cart {
  return {
    id: "gid://shopify/Cart/1",
    checkoutUrl: "https://mock.shop/checkout",
    totalQuantity,
    lines: { nodes: [] },
    cost: {
      subtotalAmount: { amount: "0.00", currencyCode: "USD" },
      totalAmount: { amount: "0.00", currencyCode: "USD" },
    },
  } as Cart;
}

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
   *   - [PASS] does not call shopifyFetch when cartId cookie is absent
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

/**
 * @test-suite  addToCart
 * @target      addToCart — create-or-reuse cart, add lines, revalidate, error handling
 * @strategy    unit — cookies, createCart, addCartLines mocked
 * @cases
 *   - [PASS] calls addCartLines with existing cartId and returns success
 *   - [PASS] creates a new cart, sets the cookie, and returns success
 *   - [PASS] returns failure result when addCartLines throws
 */
describe("addToCart", () => {
  beforeEach(() => vi.clearAllMocks());

  it("calls addCartLines with existing cartId and returns success", async () => {
    const cart = makeCart(1);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mockCookies.mockResolvedValue(makeCookieStore("cart-abc") as any);
    mockAddCartLines.mockResolvedValue(cart);

    const result = await addToCart("variant-1");

    expect(mockAddCartLines).toHaveBeenCalledWith("cart-abc", [{ merchandiseId: "variant-1", quantity: 1 }]);
    expect(mockRevalidateTag).toHaveBeenCalledWith("cart", {});
    expect(result).toEqual({ success: true, cart });
  });

  it("creates a new cart, sets the cookie, and returns success", async () => {
    const newCart = makeCart(0);
    const returnedCart = makeCart(1);
    const cookieStore = makeCookieStore();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mockCookies.mockResolvedValue(cookieStore as any);
    mockCreateCart.mockResolvedValue(newCart);
    mockAddCartLines.mockResolvedValue(returnedCart);

    const result = await addToCart("variant-1");

    expect(mockCreateCart).toHaveBeenCalledOnce();
    expect(cookieStore.set).toHaveBeenCalledWith("cartId", newCart.id, expect.any(Object));
    expect(result).toEqual({ success: true, cart: returnedCart });
  });

  it("returns failure result when addCartLines throws", async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mockCookies.mockResolvedValue(makeCookieStore("cart-abc") as any);
    mockAddCartLines.mockRejectedValue(new Error("Shopify error"));

    const result = await addToCart("variant-1");

    expect(result).toEqual({ success: false, error: "Shopify error" });
  });
});

/**
 * @test-suite  removeFromCart
 * @target      removeFromCart — missing cart early return, remove lines, error handling
 * @strategy    unit — cookies, removeCartLines mocked
 * @cases
 *   - [PASS] returns failure when cartId cookie is absent
 *   - [PASS] calls removeCartLines with lineId and returns success
 *   - [PASS] returns failure result when removeCartLines throws
 */
describe("removeFromCart", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns failure when cartId cookie is absent", async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mockCookies.mockResolvedValue(makeCookieStore() as any);

    const result = await removeFromCart("line-1");

    expect(result).toEqual({ success: false, error: "Cart not found" });
    expect(mockRemoveCartLines).not.toHaveBeenCalled();
  });

  it("calls removeCartLines with lineId and returns success", async () => {
    const cart = makeCart(0);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mockCookies.mockResolvedValue(makeCookieStore("cart-abc") as any);
    mockRemoveCartLines.mockResolvedValue(cart);

    const result = await removeFromCart("line-1");

    expect(mockRemoveCartLines).toHaveBeenCalledWith("cart-abc", ["line-1"]);
    expect(mockRevalidateTag).toHaveBeenCalledWith("cart", {});
    expect(result).toEqual({ success: true, cart });
  });

  it("returns failure result when removeCartLines throws", async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mockCookies.mockResolvedValue(makeCookieStore("cart-abc") as any);
    mockRemoveCartLines.mockRejectedValue(new Error("Network error"));

    const result = await removeFromCart("line-1");

    expect(result).toEqual({ success: false, error: "Network error" });
  });
});

/**
 * @test-suite  updateCartQuantity
 * @target      updateCartQuantity — quantity=0 removes line, quantity>0 updates, missing cart error
 * @strategy    unit — cookies, removeCartLines, updateCartLines mocked
 * @cases
 *   - [PASS] returns failure when cartId cookie is absent
 *   - [PASS] calls removeCartLines when quantity is 0
 *   - [PASS] calls updateCartLines when quantity > 0
 *   - [PASS] returns failure result when updateCartLines throws
 */
describe("updateCartQuantity", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns failure when cartId cookie is absent", async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mockCookies.mockResolvedValue(makeCookieStore() as any);

    const result = await updateCartQuantity("line-1", 2);

    expect(result).toEqual({ success: false, error: "Cart not found" });
  });

  it("calls removeCartLines when quantity is 0", async () => {
    const cart = makeCart(0);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mockCookies.mockResolvedValue(makeCookieStore("cart-abc") as any);
    mockRemoveCartLines.mockResolvedValue(cart);

    const result = await updateCartQuantity("line-1", 0);

    expect(mockRemoveCartLines).toHaveBeenCalledWith("cart-abc", ["line-1"]);
    expect(mockUpdateCartLines).not.toHaveBeenCalled();
    expect(result).toEqual({ success: true, cart });
  });

  it("calls updateCartLines when quantity > 0", async () => {
    const cart = makeCart(3);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mockCookies.mockResolvedValue(makeCookieStore("cart-abc") as any);
    mockUpdateCartLines.mockResolvedValue(cart);

    const result = await updateCartQuantity("line-1", 3);

    expect(mockUpdateCartLines).toHaveBeenCalledWith("cart-abc", [{ id: "line-1", quantity: 3 }]);
    expect(mockRemoveCartLines).not.toHaveBeenCalled();
    expect(result).toEqual({ success: true, cart });
  });

  it("returns failure result when updateCartLines throws", async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mockCookies.mockResolvedValue(makeCookieStore("cart-abc") as any);
    mockUpdateCartLines.mockRejectedValue(new Error("Timeout"));

    const result = await updateCartQuantity("line-1", 2);

    expect(result).toEqual({ success: false, error: "Timeout" });
  });
});
