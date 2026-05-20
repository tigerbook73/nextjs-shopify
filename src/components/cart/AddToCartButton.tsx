"use client";

import { useTransition } from "react";
import { addToCart } from "@/lib/actions/cart";

interface AddToCartButtonProps {
  variantId: string;
  availableForSale: boolean;
}

export default function AddToCartButton({ variantId, availableForSale }: AddToCartButtonProps) {
  const [isPending, startTransition] = useTransition();

  if (!availableForSale) {
    return (
      <button
        disabled
        className="w-full cursor-not-allowed rounded-md bg-gray-200 px-6 py-3 text-sm font-medium text-gray-500"
      >
        Out of Stock
      </button>
    );
  }

  return (
    <button
      onClick={() => {
        startTransition(async () => {
          await addToCart(variantId);
        });
      }}
      disabled={isPending}
      className="w-full rounded-md bg-gray-900 px-6 py-3 text-sm font-medium text-white hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {isPending ? "Adding..." : "Add to Cart"}
    </button>
  );
}
