/**
 * @test-file   CartContext
 * @description CartContext provider and useCart hook — state initialization, applyCart, refreshCart, open/close cart
 * @ai-generated
 * @reviewed-by
 */
import { vi, describe, it, expect, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { CartProvider, useCart } from "./CartContext";
import { getCartAction } from "@/lib/actions/cart";
import type { Cart } from "@/lib/shopify/types";

vi.mock("@/lib/actions/cart");

const mockGetCartAction = vi.mocked(getCartAction);

function makeCart(totalQuantity: number): Cart {
  return {
    id: "gid://shopify/Cart/1",
    checkoutUrl: "https://store.myshopify.com/checkout",
    totalQuantity,
    lines: { nodes: [] },
    cost: {
      subtotalAmount: { amount: "0.00", currencyCode: "USD" },
      totalTaxAmount: null,
      totalAmount: { amount: "0.00", currencyCode: "USD" },
    },
  };
}

function makeWrapper(initialCart?: Cart | null) {
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return <CartProvider initialCart={initialCart}>{children}</CartProvider>;
  };
}

describe("CartContext", () => {
  beforeEach(() => {
    mockGetCartAction.mockReset();
  });

  /**
   * @test-suite  useCart 在 Provider 外使用
   * @target      useCart hook — guard when used outside CartProvider
   * @strategy    unit; renders hook without provider wrapper
   * @cases
   *   - [FAIL] 在 CartProvider 外调用时 → 抛出错误
   */
  describe("useCart 在 Provider 外使用", () => {
    it("在 CartProvider 外调用时 → 抛出错误", () => {
      expect(() => renderHook(() => useCart())).toThrow("useCart must be used within CartProvider");
    });
  });

  /**
   * @test-suite  initialCart 初始化
   * @target      CartProvider — initial state from initialCart prop
   * @strategy    unit; no server calls
   * @cases
   *   - [PASS] initialCart 为 null 时 count 为 0、cart 为 null
   *   - [PASS] initialCart 有值时 count 来自 totalQuantity
   */
  describe("initialCart 初始化", () => {
    it("initialCart 为 null 时 count 为 0、cart 为 null", () => {
      const { result } = renderHook(() => useCart(), { wrapper: makeWrapper(null) });
      expect(result.current.count).toBe(0);
      expect(result.current.cart).toBeNull();
    });

    it("initialCart 有值时 count 来自 totalQuantity", () => {
      const { result } = renderHook(() => useCart(), { wrapper: makeWrapper(makeCart(3)) });
      expect(result.current.count).toBe(3);
      expect(result.current.cart?.id).toBe("gid://shopify/Cart/1");
    });
  });

  /**
   * @test-suite  applyCart
   * @target      applyCart action — synchronous cart state update
   * @strategy    unit; no server calls
   * @cases
   *   - [PASS] 传入 cart 时同步更新 count 和 cart
   *   - [PASS] 传入 null 时 count 归零、cart 为 null
   */
  describe("applyCart", () => {
    it("传入 cart 时同步更新 count 和 cart", () => {
      const { result } = renderHook(() => useCart(), { wrapper: makeWrapper() });
      act(() => {
        result.current.applyCart(makeCart(7));
      });
      expect(result.current.count).toBe(7);
      expect(result.current.cart?.totalQuantity).toBe(7);
    });

    it("传入 null 时 count 归零、cart 为 null", () => {
      const { result } = renderHook(() => useCart(), { wrapper: makeWrapper(makeCart(5)) });
      act(() => {
        result.current.applyCart(null);
      });
      expect(result.current.count).toBe(0);
      expect(result.current.cart).toBeNull();
    });
  });

  /**
   * @test-suite  refreshCart
   * @target      refreshCart action — async cart refresh via getCartAction
   * @strategy    unit; mocks getCartAction via vi.mock
   * @cases
   *   - [PASS] 成功时通过 getCartAction 更新 count 和 cart
   *   - [PASS] getCartAction 返回 null 时 count 归零
   *   - [PASS] 失败时保留上一次已知 count 和 cart
   *   - [PASS] refreshCart 调用完成后 → isRefreshing 恢复为 false
   *   - [PASS] refreshCart 并发调用时 → 只触发一次 getCartAction
   */
  describe("refreshCart", () => {
    it("成功时通过 getCartAction 更新 count 和 cart", async () => {
      mockGetCartAction.mockResolvedValue(makeCart(4));
      const { result } = renderHook(() => useCart(), { wrapper: makeWrapper() });

      await act(async () => {
        await result.current.refreshCart();
      });

      expect(result.current.count).toBe(4);
      expect(mockGetCartAction).toHaveBeenCalledTimes(1);
    });

    it("getCartAction 返回 null 时 count 归零", async () => {
      mockGetCartAction.mockResolvedValue(null);
      const { result } = renderHook(() => useCart(), { wrapper: makeWrapper(makeCart(3)) });

      await act(async () => {
        await result.current.refreshCart();
      });

      expect(result.current.count).toBe(0);
      expect(result.current.cart).toBeNull();
    });

    it("失败时保留上一次已知 count 和 cart", async () => {
      mockGetCartAction.mockRejectedValue(new Error("network error"));
      const { result } = renderHook(() => useCart(), { wrapper: makeWrapper(makeCart(2)) });

      await act(async () => {
        await result.current.refreshCart();
      });

      expect(result.current.count).toBe(2);
      expect(result.current.cart?.totalQuantity).toBe(2);
    });

    it("refreshCart 调用完成后 → isRefreshing 恢复为 false", async () => {
      mockGetCartAction.mockResolvedValue(makeCart(1));
      const { result } = renderHook(() => useCart(), { wrapper: makeWrapper() });

      await act(async () => {
        await result.current.refreshCart();
      });

      expect(result.current.isRefreshing).toBe(false);
    });

    it("refreshCart 并发调用时 → 只触发一次 getCartAction", async () => {
      let resolve!: (v: Cart | null) => void;
      mockGetCartAction.mockReturnValue(new Promise((r) => (resolve = r)));
      const { result } = renderHook(() => useCart(), { wrapper: makeWrapper() });

      await act(async () => {
        const p1 = result.current.refreshCart();
        const p2 = result.current.refreshCart();
        resolve(makeCart(1));
        await Promise.all([p1, p2]);
      });

      expect(mockGetCartAction).toHaveBeenCalledTimes(1);
    });
  });

  /**
   * @test-suite  isOpen / openCart / closeCart
   * @target      cart drawer open/close state
   * @strategy    unit; no server calls
   * @cases
   *   - [PASS] 初始状态 isOpen 为 false
   *   - [PASS] openCart 后 isOpen 为 true
   *   - [PASS] closeCart 后 isOpen 为 false
   */
  describe("isOpen / openCart / closeCart", () => {
    it("初始状态 isOpen 为 false", () => {
      const { result } = renderHook(() => useCart(), { wrapper: makeWrapper() });
      expect(result.current.isOpen).toBe(false);
    });

    it("openCart 后 isOpen 为 true", () => {
      const { result } = renderHook(() => useCart(), { wrapper: makeWrapper() });
      act(() => result.current.openCart());
      expect(result.current.isOpen).toBe(true);
    });

    it("closeCart 后 isOpen 为 false", () => {
      const { result } = renderHook(() => useCart(), { wrapper: makeWrapper() });
      act(() => result.current.openCart());
      act(() => result.current.closeCart());
      expect(result.current.isOpen).toBe(false);
    });
  });
});
