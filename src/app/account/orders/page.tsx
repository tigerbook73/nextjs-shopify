import { redirect } from "next/navigation";
import { customerAccountFetch } from "@/lib/shopify/customer-account/client";
import { GET_ORDERS_QUERY } from "@/lib/shopify/customer-account/queries";
import { getAccessToken } from "@/lib/shopify/customer-account/tokens";
import { formatPrice } from "@/lib/utils/format-price";
import type { CustomerOrder } from "@/types/customer-account";

export const dynamic = "force-dynamic";
export const metadata = { title: "历史订单" };

export default async function OrdersPage() {
  const accessToken = await getAccessToken();
  if (!accessToken) redirect("/api/auth/login");

  let orders: CustomerOrder[] = [];
  try {
    const data = await customerAccountFetch<{ customer: { orders: { nodes: CustomerOrder[] } } }>(
      accessToken,
      GET_ORDERS_QUERY,
      { first: 10 },
    );
    orders = data.customer?.orders.nodes ?? [];
  } catch {
    redirect("/api/auth/login");
  }

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
                  <p className="font-medium">订单 {order.name}</p>
                  <p className="mt-1 text-sm text-gray-500">
                    {new Date(order.processedAt).toLocaleDateString("zh-CN")}
                  </p>
                  <p className="mt-1 text-sm text-gray-500">
                    {order.financialStatus} · {order.fulfillmentStatus}
                  </p>
                </div>
                <p className="font-medium">{formatPrice(order.totalPrice.amount, order.totalPrice.currencyCode)}</p>
              </div>
              {order.lineItems.nodes.length > 0 && (
                <ul className="mt-3 space-y-1 border-t pt-3">
                  {order.lineItems.nodes.map((item, i) => (
                    <li key={i} className="flex justify-between text-sm text-gray-600">
                      <span>
                        {item.title} × {item.quantity}
                      </span>
                      <span>{formatPrice(item.price.amount, item.price.currencyCode)}</span>
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
