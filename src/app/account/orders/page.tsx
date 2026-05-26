import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getCustomerOrders } from "@/lib/shopify/client";
import { formatPrice } from "@/lib/utils/format-price";

export const dynamic = "force-dynamic";
export const metadata = { title: "历史订单" };

export default async function OrdersPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("customerAccessToken")?.value;

  if (!token) redirect("/account/login");

  const orders = await getCustomerOrders(token);

  return (
    <main>
      <h1 className="mb-6 text-2xl font-bold">历史订单</h1>
      {orders.length === 0 ? (
        <p className="text-sm text-gray-500">暂无订单记录。</p>
      ) : (
        <ul className="space-y-4">
          {orders.map((order) => (
            <li key={order.id} className="rounded-lg border p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-medium">订单 #{order.orderNumber}</p>
                  <p className="mt-1 text-sm text-gray-500">
                    {new Date(order.processedAt).toLocaleDateString("zh-CN")}
                  </p>
                  <p className="mt-1 text-sm text-gray-500">
                    {order.financialStatus} · {order.fulfillmentStatus}
                  </p>
                </div>
                <p className="font-medium">
                  {formatPrice(order.currentTotalPrice.amount, order.currentTotalPrice.currencyCode)}
                </p>
              </div>
              {order.lineItems.nodes.length > 0 && (
                <ul className="mt-3 space-y-1 border-t pt-3">
                  {order.lineItems.nodes.map((item, i) => (
                    <li key={i} className="flex justify-between text-sm text-gray-600">
                      <span>
                        {item.title} × {item.quantity}
                      </span>
                      {item.variant && (
                        <span>{formatPrice(item.variant.price.amount, item.variant.price.currencyCode)}</span>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
