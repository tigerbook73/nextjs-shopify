import Link from "next/link";
import { redirect } from "next/navigation";
import { LayoutDashboard, ShoppingBag, User } from "lucide-react";
import { customerAccountFetch } from "@/lib/shopify/customer-account/client";
import { GET_CUSTOMER_QUERY } from "@/lib/shopify/customer-account/queries";
import { getAccessToken } from "@/lib/shopify/customer-account/tokens";
import type { CustomerProfile } from "@/lib/shopify/customer-account/types";
import CustomerAvatar from "@/components/account/CustomerAvatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const dynamic = "force-dynamic";
export const metadata = { title: "My account" };

const OVERVIEW_CARDS = [
  { href: "/account/orders", label: "Orders", Icon: ShoppingBag },
  { href: "/account/addresses", label: "Addresses", Icon: LayoutDashboard },
  { href: "/account/profile", label: "Profile", Icon: User },
] as const;

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

  const addressCount = customer.addresses?.nodes.length ?? 0;
  const addressCountLabel = customer.addresses?.pageInfo.hasNextPage ? `${addressCount}+` : String(addressCount);

  const countByHref: Record<string, string> = {
    "/account/orders": orderCountLabel,
    "/account/addresses": addressCountLabel,
  };

  return (
    <div>
      <div data-testid="account-profile-hero" className="mb-8 flex items-center gap-4">
        <CustomerAvatar displayName={customer.displayName} />
        <div>
          <h1 className="text-2xl font-bold">{customer.displayName}</h1>
          <p className="text-sm text-gray-500">{customer.emailAddress?.emailAddress}</p>
        </div>
      </div>
      <section aria-label="Account overview" className="grid gap-4 sm:grid-cols-3">
        {OVERVIEW_CARDS.map(({ href, label, Icon }) => (
          <Link key={href} href={href}>
            <Card className="h-full transition-shadow hover:shadow-md">
              <CardHeader className="flex flex-row items-center gap-3 pb-2">
                <Icon className="size-5 text-gray-500" />
                <CardTitle className="text-base">{label}</CardTitle>
              </CardHeader>
              {countByHref[href] !== undefined && (
                <CardContent>
                  <p className="text-3xl font-bold">{countByHref[href]}</p>
                </CardContent>
              )}
            </Card>
          </Link>
        ))}
      </section>
    </div>
  );
}
