"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { addToCart } from "@/lib/actions/cart";
import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/button";

interface AddToCartButtonProps {
  variantId: string;
  availableForSale: boolean;
}

export default function AddToCartButton({ variantId, availableForSale }: AddToCartButtonProps) {
  const { openCart, applyCart, refreshCart } = useCart();
  const [isPending, startTransition] = useTransition();

  if (!availableForSale) {
    return (
      <Button data-testid="add-to-cart-btn" variant="secondary" disabled className="w-full">
        Out of Stock
      </Button>
    );
  }

  return (
    <Button
      data-testid="add-to-cart-btn"
      onClick={() => {
        startTransition(async () => {
          const result = await addToCart(variantId);
          if (!result.success) {
            toast.error(result.error);
            return;
          }
          if (result.cart) {
            applyCart(result.cart);
          } else {
            refreshCart();
          }
          toast.success("Added to cart");
          openCart();
        });
      }}
      disabled={isPending}
      className="w-full"
    >
      {isPending ? "Adding..." : "Add to Cart"}
    </Button>
  );
}
