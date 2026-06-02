import { redirect } from "next/navigation";
import { customerAccountFetch } from "@/lib/shopify/customer-account/client";
import { GET_CUSTOMER_QUERY } from "@/lib/shopify/customer-account/queries";
import { getAccessToken } from "@/lib/shopify/customer-account/tokens";
import type { CustomerProfile } from "@/lib/shopify/customer-account/types";
import CustomerAvatar from "@/components/account/CustomerAvatar";

export const dynamic = "force-dynamic";
export const metadata = { title: "My account" };

export default async function AccountPage() {
  const accessToken = await getAccessToken();
  if (!accessToken) redirect("/api/auth/login");

  let customer: CustomerProfile;
  try {
    const data = await customerAccountFetch(accessToken, GET_CUSTOMER_QUERY);
    if (!data.customer) redirect("/api/auth/login");
    customer = data.customer;
  } catch {
    redirect("/api/auth/login");
  }

  const orderCount = customer.orders?.nodes.length ?? 0;
  const orderCountLabel = customer.orders?.pageInfo.hasNextPage ? `${orderCount}+` : String(orderCount);

  return (
    <main>
      <div className="mb-6 flex items-center gap-4">
        <CustomerAvatar displayName={customer.displayName} />
        <div>
          <h1 className="text-2xl font-bold">{customer.displayName}</h1>
          <p className="text-sm text-gray-500">{orderCountLabel} orders</p>
        </div>
      </div>
      <div className="space-y-2 text-sm">
        <p>
          <span className="text-gray-500">Email: </span>
          {customer.emailAddress?.emailAddress}
        </p>
      </div>
    </main>
  );
}
