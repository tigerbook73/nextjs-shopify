import Image from "next/image";
import { notFound, redirect } from "next/navigation";
import { customerAccountFetch } from "@/lib/shopify/customer-account/client";
import { GET_ORDER_DETAIL_QUERY } from "@/lib/shopify/customer-account/queries";
import { getAccessToken } from "@/lib/shopify/customer-account/tokens";
import { formatPrice } from "@/lib/utils/format-price";
import type { CustomerOrderDetail } from "@/types/customer-account";

export const dynamic = "force-dynamic";
export const metadata = { title: "Order detail" };

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const orderId = Buffer.from(id, "base64url").toString();

  const accessToken = await getAccessToken();
  if (!accessToken) redirect("/api/auth/login");

  let order: CustomerOrderDetail;
  try {
    const data = await customerAccountFetch<{ order: CustomerOrderDetail | null }>(
      accessToken,
      GET_ORDER_DETAIL_QUERY,
      { orderId },
    );
    if (!data.order) notFound();
    order = data.order;
  } catch {
    redirect("/api/auth/login");
  }

  const trackingLinks = order.fulfillments.nodes.flatMap((f) => f.trackingInformation.filter((t) => t.url || t.number));

  return (
    <main>
      <h1 className="mb-1 text-2xl font-bold">Order {order.name}</h1>
      <p className="mb-6 text-sm text-gray-500">
        {new Date(order.processedAt).toLocaleDateString("en-US", { dateStyle: "medium" })} · {order.financialStatus} ·{" "}
        {order.fulfillmentStatus}
      </p>

      {/* Items */}
      <section className="mb-6">
        <h2 className="mb-3 font-semibold">Items</h2>
        <ul className="space-y-3">
          {order.lineItems.nodes.map((item, i) => (
            <li key={i} className="flex items-center gap-4">
              {item.image ? (
                <Image
                  src={item.image.url}
                  alt={item.image.altText ?? item.title}
                  width={64}
                  height={64}
                  className="rounded object-cover"
                />
              ) : (
                <div className="h-16 w-16 rounded bg-gray-100" />
              )}
              <div className="flex-1 text-sm">
                <p className="font-medium">{item.title}</p>
                {item.variantTitle && <p className="text-gray-500">{item.variantTitle}</p>}
                <p className="text-gray-500">Qty: {item.quantity}</p>
              </div>
              <p className="text-sm font-medium">
                {formatPrice(String(parseFloat(item.price.amount) * item.quantity), item.price.currencyCode)}
              </p>
            </li>
          ))}
        </ul>
      </section>

      {/* Price summary */}
      <section className="mb-6 max-w-xs space-y-1 text-sm">
        {order.subtotalPrice && (
          <div className="flex justify-between">
            <span className="text-gray-500">Subtotal</span>
            <span>{formatPrice(order.subtotalPrice.amount, order.subtotalPrice.currencyCode)}</span>
          </div>
        )}
        <div className="flex justify-between">
          <span className="text-gray-500">Shipping</span>
          <span>{formatPrice(order.totalShippingPrice.amount, order.totalShippingPrice.currencyCode)}</span>
        </div>
        {order.totalTax && (
          <div className="flex justify-between">
            <span className="text-gray-500">Tax</span>
            <span>{formatPrice(order.totalTax.amount, order.totalTax.currencyCode)}</span>
          </div>
        )}
        <div className="flex justify-between border-t pt-1 font-semibold">
          <span>Total</span>
          <span>{formatPrice(order.totalPrice.amount, order.totalPrice.currencyCode)}</span>
        </div>
      </section>

      {/* Shipping address */}
      {order.shippingAddress && (
        <section className="mb-6 text-sm">
          <h2 className="mb-2 font-semibold">Shipping address</h2>
          <p>
            {order.shippingAddress.firstName} {order.shippingAddress.lastName}
          </p>
          <p className="text-gray-600">{order.shippingAddress.address1}</p>
          {order.shippingAddress.address2 && <p className="text-gray-600">{order.shippingAddress.address2}</p>}
          <p className="text-gray-600">
            {order.shippingAddress.city}
            {order.shippingAddress.province ? `, ${order.shippingAddress.province}` : ""} {order.shippingAddress.zip}
          </p>
          <p className="text-gray-600">{order.shippingAddress.country}</p>
        </section>
      )}

      {/* Tracking */}
      {trackingLinks.length > 0 && (
        <section className="text-sm">
          <h2 className="mb-2 font-semibold">Tracking</h2>
          <ul className="space-y-1">
            {trackingLinks.map((t, i) =>
              t.url ? (
                <li key={i}>
                  <a
                    href={t.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-900 underline hover:text-gray-600"
                  >
                    {t.number ?? "Track shipment"}
                  </a>
                </li>
              ) : (
                <li key={i} className="text-gray-600">
                  {t.number}
                </li>
              ),
            )}
          </ul>
        </section>
      )}
    </main>
  );
}
