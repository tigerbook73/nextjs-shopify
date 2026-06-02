"use client";

import { X } from "lucide-react";
import { useCart } from "@/context/CartContext";
import CartItem from "@/components/cart/CartItem";
import CartSummary from "@/components/cart/CartSummary";
import { Sheet, SheetClose, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";

export default function CartDrawer() {
  const { isOpen, closeCart, cart } = useCart();

  const hasItems = cart && cart.lines.nodes.length > 0;

  return (
    <Sheet
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) closeCart();
      }}
    >
      <SheetContent side="right" showCloseButton={false} className="flex w-80 flex-col gap-0 p-0 sm:max-w-80">
        <SheetHeader className="flex-row items-center justify-between border-b border-gray-200 px-4 py-4">
          <SheetTitle>Your Cart</SheetTitle>
          <SheetClose aria-label="Close cart" className="text-gray-400 hover:text-gray-600">
            <X className="h-5 w-5" />
          </SheetClose>
        </SheetHeader>

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
      </SheetContent>
    </Sheet>
  );
}
