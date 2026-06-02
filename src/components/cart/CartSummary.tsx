import type { Cart } from "@/lib/shopify/storefront/types";
import { formatPrice } from "@/lib/utils/format-price";
import { Button } from "@/components/ui/button";

interface CartSummaryProps {
  cart: Cart;
}

export default function CartSummary({ cart }: CartSummaryProps) {
  const { cost, checkoutUrl } = cart;

  return (
    <div className="rounded-lg border border-gray-200 bg-gray-50 p-6">
      <h2 className="mb-4 text-lg font-semibold text-gray-900">Order Summary</h2>

      <div className="space-y-2 text-sm">
        <div className="flex justify-between text-gray-600">
          <span>Subtotal</span>
          <span>{formatPrice(cost.subtotalAmount.amount, cost.subtotalAmount.currencyCode)}</span>
        </div>

        <div className="border-t border-gray-200 pt-2">
          <div className="flex justify-between font-semibold text-gray-900">
            <span>Total</span>
            <span>{formatPrice(cost.totalAmount.amount, cost.totalAmount.currencyCode)}</span>
          </div>
        </div>
      </div>

      <Button render={<a href={checkoutUrl} />} nativeButton={false} className="mt-6 w-full">
        Checkout
      </Button>
    </div>
  );
}
