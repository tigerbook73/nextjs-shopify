"use client";

import { createContext, useCallback, useContext, useRef, useState } from "react";
import { getCartAction } from "@/lib/actions/cart";
import type { Cart } from "@/lib/shopify/types";

interface CartContextValue {
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  cart: Cart | null;
  count: number;
  isRefreshing: boolean;
  applyCart: (cart: Cart | null) => void;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextValue | null>(null);

interface CartProviderProps {
  children: React.ReactNode;
  initialCart?: Cart | null;
}

export function CartProvider({ children, initialCart = null }: CartProviderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [cart, setCart] = useState<Cart | null>(initialCart);
  const [count, setCount] = useState(initialCart?.totalQuantity ?? 0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const refreshingRef = useRef(false);

  const applyCart = useCallback((next: Cart | null) => {
    setCart(next);
    setCount(next?.totalQuantity ?? 0);
  }, []);

  const refreshCart = useCallback(async () => {
    if (refreshingRef.current) return;
    refreshingRef.current = true;
    setIsRefreshing(true);
    try {
      const next = await getCartAction();
      applyCart(next);
    } catch {
      // keep last known state on failure
    } finally {
      refreshingRef.current = false;
      setIsRefreshing(false);
    }
  }, [applyCart]);

  return (
    <CartContext.Provider
      value={{
        isOpen,
        openCart: () => setIsOpen(true),
        closeCart: () => setIsOpen(false),
        cart,
        count,
        isRefreshing,
        applyCart,
        refreshCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
