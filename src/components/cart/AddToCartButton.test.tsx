/**
 * @test-file   AddToCartButton
 * @description Out-of-stock branch, add-to-cart success/failure, toast and cart state side effects
 * @ai-generated
 * @reviewed-by (!HUMAN EDIT ONLY): Shengtian Liao @ [1]
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, act, fireEvent } from "@testing-library/react";
import AddToCartButton from "./AddToCartButton";

vi.mock("@/context/CartContext", () => ({
  useCart: vi.fn(() => ({
    openCart: vi.fn(),
    applyCart: vi.fn(),
    refreshCart: vi.fn(),
  })),
}));

vi.mock("@/lib/actions/cart", () => ({
  addToCart: vi.fn(),
}));

vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

const { useCart } = await import("@/context/CartContext");
const { addToCart } = await import("@/lib/actions/cart");
const { toast } = await import("sonner");

const mockUseCart = vi.mocked(useCart);
const mockAddToCart = vi.mocked(addToCart);
const mockToast = vi.mocked(toast);

function makeCartHook() {
  return {
    openCart: vi.fn(),
    applyCart: vi.fn(),
    refreshCart: vi.fn(),
  };
}

describe("AddToCartButton", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseCart.mockReturnValue(makeCartHook() as unknown as ReturnType<typeof useCart>);
  });

  /**
   * @test-suite  Out of Stock
   * @target      renders disabled "Out of Stock" button when availableForSale is false
   * @strategy    component — availableForSale=false prop
   * @cases
   *   - [PASS] renders a disabled Out of Stock button
   *   - [PASS] does not call addToCart when the out-of-stock button is clicked
   */
  describe("Out of Stock", () => {
    it("renders a disabled Out of Stock button", () => {
      render(<AddToCartButton variantId="v1" availableForSale={false} />);
      const btn = screen.getByRole("button", { name: /Out of Stock/i });
      expect(btn).toBeDisabled();
    });

    it("does not call addToCart when the out-of-stock button is clicked", async () => {
      render(<AddToCartButton variantId="v1" availableForSale={false} />);
      fireEvent.click(screen.getByRole("button", { name: /Out of Stock/i }));
      expect(mockAddToCart).not.toHaveBeenCalled();
    });
  });

  /**
   * @test-suite  Add to Cart — success
   * @target      clicking triggers addToCart, applies cart, shows toast, opens drawer
   * @strategy    component — addToCart mocked to resolve with success
   * @cases
   *   - [PASS] renders an enabled Add to Cart button
   *   - [PASS] calls addToCart with the correct variantId
   *   - [PASS] calls applyCart and openCart when addToCart returns a cart
   *   - [PASS] shows success toast after adding to cart
   */
  describe("Add to Cart — success", () => {
    it("renders an enabled Add to Cart button", () => {
      render(<AddToCartButton variantId="v1" availableForSale={true} />);
      expect(screen.getByRole("button", { name: /Add to Cart/i })).not.toBeDisabled();
    });

    it("calls addToCart with the correct variantId", async () => {
      mockAddToCart.mockResolvedValue({ success: true, cart: undefined });
      render(<AddToCartButton variantId="variant-42" availableForSale={true} />);

      await act(async () => {
        fireEvent.click(screen.getByRole("button", { name: /Add to Cart/i }));
      });

      expect(mockAddToCart).toHaveBeenCalledWith("variant-42");
    });

    it("calls applyCart and openCart when addToCart returns a cart", async () => {
      const cartHook = makeCartHook();
      mockUseCart.mockReturnValue(cartHook as unknown as ReturnType<typeof useCart>);
      const fakeCart = { id: "cart-1", totalQuantity: 1 } as Parameters<typeof cartHook.applyCart>[0];
      mockAddToCart.mockResolvedValue({ success: true, cart: fakeCart });

      render(<AddToCartButton variantId="v1" availableForSale={true} />);
      await act(async () => {
        fireEvent.click(screen.getByRole("button", { name: /Add to Cart/i }));
      });

      expect(cartHook.applyCart).toHaveBeenCalledWith(fakeCart);
      expect(cartHook.openCart).toHaveBeenCalledOnce();
    });

    it("shows success toast after adding to cart", async () => {
      mockAddToCart.mockResolvedValue({ success: true });
      render(<AddToCartButton variantId="v1" availableForSale={true} />);

      await act(async () => {
        fireEvent.click(screen.getByRole("button", { name: /Add to Cart/i }));
      });

      expect(mockToast.success).toHaveBeenCalledWith("Added to cart");
    });
  });

  /**
   * @test-suite  Add to Cart — failure
   * @target      shows error toast when addToCart returns an error
   * @strategy    component — addToCart mocked to resolve with failure
   * @cases
   *   - [PASS] shows error toast with the returned error message
   *   - [PASS] does not call openCart on failure
   */
  describe("Add to Cart — failure", () => {
    it("shows error toast with the returned error message", async () => {
      mockAddToCart.mockResolvedValue({ success: false, error: "Out of stock on server" });
      render(<AddToCartButton variantId="v1" availableForSale={true} />);

      await act(async () => {
        fireEvent.click(screen.getByRole("button", { name: /Add to Cart/i }));
      });

      expect(mockToast.error).toHaveBeenCalledWith("Out of stock on server");
    });

    it("does not call openCart on failure", async () => {
      const cartHook = makeCartHook();
      mockUseCart.mockReturnValue(cartHook as unknown as ReturnType<typeof useCart>);
      mockAddToCart.mockResolvedValue({ success: false, error: "Failed" });

      render(<AddToCartButton variantId="v1" availableForSale={true} />);
      await act(async () => {
        fireEvent.click(screen.getByRole("button", { name: /Add to Cart/i }));
      });

      expect(cartHook.openCart).not.toHaveBeenCalled();
    });
  });
});
