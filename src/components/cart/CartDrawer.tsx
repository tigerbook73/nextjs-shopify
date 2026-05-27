"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { getCartAction } from "@/lib/actions/cart";
import type { Cart } from "@/lib/shopify/types";
import CartItem from "@/components/cart/CartItem";
import CartSummary from "@/components/cart/CartSummary";

export default function CartDrawer() {
  const { isOpen, closeCart } = useCart();
  const [cart, setCart] = useState<Cart | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    getCartAction().then(setCart);
  }, [isOpen]);

  const hasItems = cart && cart.lines.nodes.length > 0;

  return (
    <>
      {isOpen && <div className="fixed inset-0 z-40 bg-black/30" onClick={closeCart} aria-hidden="true" />}

      <div
        role="region"
        aria-label="Shopping cart"
        className={`fixed top-0 right-0 z-50 flex h-full w-80 flex-col bg-white shadow-xl transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "invisible translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-gray-200 px-4 py-4">
          <h2 className="text-lg font-semibold text-gray-900">Your Cart</h2>
          <button onClick={closeCart} className="text-gray-400 hover:text-gray-600" aria-label="Close cart">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex flex-1 flex-col overflow-y-auto px-4 py-4">
          {!hasItems ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-2 text-center">
              <p className="text-gray-500">Your cart is empty.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {cart.lines.nodes.map((line) => (
                <CartItem key={line.id} line={line} />
              ))}
            </div>
          )}
        </div>

        {hasItems && (
          <div className="border-t border-gray-200 px-4 py-4">
            <CartSummary cart={cart} />
          </div>
        )}
      </div>
    </>
  );
}
