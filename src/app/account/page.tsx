import { redirect } from "next/navigation";
import { customerAccountFetch } from "@/lib/shopify/customer-account/client";
import { GET_CUSTOMER_QUERY } from "@/lib/shopify/customer-account/queries";
import { getAccessToken } from "@/lib/shopify/customer-account/tokens";
import type { CustomerProfile } from "@/types/customer-account";

export const dynamic = "force-dynamic";
export const metadata = { title: "我的账户" };

export default async function AccountPage() {
  const accessToken = await getAccessToken();
  if (!accessToken) redirect("/api/auth/login");

  let customer: CustomerProfile;
  try {
    const data = await customerAccountFetch<{ customer: CustomerProfile | null }>(accessToken, GET_CUSTOMER_QUERY);
    if (!data.customer) redirect("/api/auth/login");
    customer = data.customer;
  } catch {
    redirect("/api/auth/login");
  }

  const initials = customer.displayName
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  const orderCount = customer.orders?.nodes.length ?? 0;
  const orderCountLabel = customer.orders?.pageInfo.hasNextPage ? `${orderCount}+` : String(orderCount);

  return (
    <main>
      <div className="mb-6 flex items-center gap-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-900 text-xl font-bold text-white">
          {initials}
        </div>
        <div>
          <h1 className="text-2xl font-bold">{customer.displayName}</h1>
          <p className="text-sm text-gray-500">{orderCountLabel} 笔历史订单</p>
        </div>
      </div>
      <div className="space-y-2 text-sm">
        <p>
          <span className="text-gray-500">邮箱：</span>
          {customer.emailAddress?.emailAddress}
        </p>
      </div>
    </main>
  );
}
