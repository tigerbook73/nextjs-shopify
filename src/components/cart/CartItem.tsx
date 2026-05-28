"use client";

import { useOptimistic, useTransition } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { updateCartQuantity, removeFromCart } from "@/lib/actions/cart";
import { useCart } from "@/context/CartContext";
import type { CartLine } from "@/lib/shopify/types";
import { formatPrice } from "@/lib/utils/format-price";

interface CartItemProps {
  line: CartLine;
}

export default function CartItem({ line }: CartItemProps) {
  const router = useRouter();
  const { applyCart, refreshCart } = useCart();
  const [optimisticQuantity, updateOptimisticQuantity] = useOptimistic(
    line.quantity,
    (_current: number, next: number) => next,
  );
  const [isPending, startTransition] = useTransition();

  const { merchandise } = line;

  const handleQuantityChange = (newQuantity: number) => {
    startTransition(async () => {
      updateOptimisticQuantity(newQuantity);
      const result = newQuantity === 0 ? await removeFromCart(line.id) : await updateCartQuantity(line.id, newQuantity);

      if (result.success) {
        applyCart(result.cart ?? null);
      } else {
        refreshCart();
      }
      // still needed to re-render the server-rendered /cart page
      router.refresh();
    });
  };

  if (optimisticQuantity === 0) return null;

  return (
    <div className={`flex gap-4 py-4 ${isPending ? "opacity-60" : ""}`}>
      <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-md bg-gray-100">
        {merchandise.product.featuredImage ? (
          <Image
            src={merchandise.product.featuredImage.url}
            alt={merchandise.product.featuredImage.altText ?? merchandise.product.title}
            width={80}
            height={80}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="h-full w-full bg-gray-200" />
        )}
      </div>

      <div className="flex flex-1 flex-col justify-between">
        <div className="flex justify-between gap-2">
          <div>
            <p className="text-sm font-medium text-gray-900">{merchandise.product.title}</p>
            {merchandise.title !== "Default Title" && <p className="text-sm text-gray-500">{merchandise.title}</p>}
          </div>
          <p className="text-sm font-medium text-gray-900">
            {formatPrice(
              (parseFloat(merchandise.price.amount) * optimisticQuantity).toFixed(2),
              merchandise.price.currencyCode,
            )}
          </p>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleQuantityChange(optimisticQuantity - 1)}
              disabled={isPending}
              className="flex h-7 w-7 items-center justify-center rounded border border-gray-300 text-sm hover:bg-gray-50 disabled:opacity-50"
              aria-label="Decrease quantity"
            >
              -
            </button>
            <span className="w-6 text-center text-sm">{optimisticQuantity}</span>
            <button
              onClick={() => handleQuantityChange(optimisticQuantity + 1)}
              disabled={isPending}
              className="flex h-7 w-7 items-center justify-center rounded border border-gray-300 text-sm hover:bg-gray-50 disabled:opacity-50"
              aria-label="Increase quantity"
            >
              +
            </button>
          </div>

          <button
            onClick={() => handleQuantityChange(0)}
            disabled={isPending}
            className="text-sm text-gray-500 hover:text-red-500 disabled:opacity-50"
          >
            Remove
          </button>
        </div>
      </div>
    </div>
  );
}
