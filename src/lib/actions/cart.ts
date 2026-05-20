"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { createCart, addCartLines, updateCartLines, removeCartLines } from "@/lib/shopify/client";
import type { CartActionResult } from "@/lib/shopify/types";

const CART_COOKIE = "cartId";
const COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: "lax" as const,
  maxAge: 60 * 3, // 3 minutes for test
};

async function getExistingCartId(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(CART_COOKIE)?.value ?? null;
}

async function getOrCreateCartId(): Promise<string> {
  const cookieStore = await cookies();
  const existing = cookieStore.get(CART_COOKIE)?.value;
  if (existing) return existing;

  const cart = await createCart();
  cookieStore.set(CART_COOKIE, cart.id, COOKIE_OPTIONS);
  return cart.id;
}

export async function addToCart(variantId: string, quantity = 1): Promise<CartActionResult> {
  try {
    const cartId = await getOrCreateCartId();
    await addCartLines(cartId, [{ merchandiseId: variantId, quantity }]);
    revalidatePath("/", "layout");
    return { success: true };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "Failed to add to cart" };
  }
}

export async function removeFromCart(lineId: string): Promise<CartActionResult> {
  try {
    const cartId = await getExistingCartId();
    if (!cartId) return { success: false, error: "Cart not found" };

    await removeCartLines(cartId, [lineId]);
    revalidatePath("/", "layout");
    return { success: true };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "Failed to remove from cart" };
  }
}

export async function updateCartQuantity(lineId: string, quantity: number): Promise<CartActionResult> {
  try {
    const cartId = await getExistingCartId();
    if (!cartId) return { success: false, error: "Cart not found" };

    if (quantity === 0) {
      await removeCartLines(cartId, [lineId]);
    } else {
      await updateCartLines(cartId, [{ id: lineId, quantity }]);
    }
    revalidatePath("/", "layout");
    return { success: true };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "Failed to update cart" };
  }
}
