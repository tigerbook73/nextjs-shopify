import { cookies } from "next/headers";
import Link from "next/link";
import { getCart } from "@/lib/shopify/client";
import CartItem from "@/components/cart/CartItem";
import CartSummary from "@/components/cart/CartSummary";

export const dynamic = "force-dynamic";

export default async function CartPage() {
  const cookieStore = await cookies();
  const cartId = cookieStore.get("cartId")?.value;
  const cart = cartId ? await getCart(cartId) : null;
  const hasItems = cart && cart.lines.nodes.length > 0;

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="mb-8 text-2xl font-bold text-gray-900">Shopping Cart</h1>

      {!hasItems ? (
        <div className="flex flex-col items-center gap-4 py-20 text-center">
          <p className="text-gray-500">Your cart is empty.</p>
          <Link
            href="/products"
            className="rounded-md bg-gray-900 px-6 py-2.5 text-sm font-medium text-white hover:bg-gray-700"
          >
            Continue Shopping
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <div className="divide-y divide-gray-200">
              {cart.lines.nodes.map((line) => (
                <CartItem key={line.id} line={line} />
              ))}
            </div>
          </div>
          <CartSummary cart={cart} />
        </div>
      )}
    </main>
  );
}
