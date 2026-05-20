import { cookies } from "next/headers";
import Link from "next/link";
import { getCart } from "@/lib/shopify/client";

export default async function CartCount() {
  const cookieStore = await cookies();
  const cartId = cookieStore.get("cartId")?.value;
  const cart = cartId ? await getCart(cartId) : null;
  const count = cart?.totalQuantity ?? 0;

  return (
    <Link
      href="/cart"
      className="relative flex items-center text-gray-600 hover:text-gray-900"
      aria-label={`Cart (${count} items)`}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-6 w-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z"
        />
      </svg>
      {count > 0 && (
        <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-gray-900 text-xs font-medium text-white">
          {count > 99 ? "99+" : count}
        </span>
      )}
    </Link>
  );
}
