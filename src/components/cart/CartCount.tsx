import { cookies } from "next/headers";
import { getCart } from "@/lib/shopify/client";
import { TAGS } from "@/lib/shopify/cache-tags";
import CartIconButton from "@/components/layout/CartIconButton";

export default async function CartCount() {
  const cookieStore = await cookies();
  const cartId = cookieStore.get("cartId")?.value;
  const cart = cartId ? await getCart(cartId, [TAGS.cart]) : null;
  const count = cart?.totalQuantity ?? 0;

  return <CartIconButton count={count} />;
}
