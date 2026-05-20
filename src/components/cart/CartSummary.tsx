import type { Cart } from "@/lib/shopify/types";
import { formatPrice } from "@/lib/utils/format-price";

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

        {cost.totalTaxAmount && (
          <div className="flex justify-between text-gray-600">
            <span>Tax</span>
            <span>{formatPrice(cost.totalTaxAmount.amount, cost.totalTaxAmount.currencyCode)}</span>
          </div>
        )}

        <div className="border-t border-gray-200 pt-2">
          <div className="flex justify-between font-semibold text-gray-900">
            <span>Total</span>
            <span>{formatPrice(cost.totalAmount.amount, cost.totalAmount.currencyCode)}</span>
          </div>
        </div>
      </div>

      <a
        href={checkoutUrl}
        className="mt-6 block w-full rounded-md bg-gray-900 px-6 py-3 text-center text-sm font-medium text-white hover:bg-gray-700"
      >
        Checkout
      </a>
    </div>
  );
}
