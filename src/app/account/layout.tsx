import { getAccessToken } from "@/lib/shopify/customer-account/tokens";
import { customerAccountFetch } from "@/lib/shopify/customer-account/client";
import { GET_CUSTOMER_QUERY } from "@/lib/shopify/customer-account/queries/customer";
import AccountNav from "@/components/account/AccountNav";

export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  const accessToken = await getAccessToken();

  let displayName = "Account";
  let email = "";

  if (accessToken) {
    try {
      const data = await customerAccountFetch(accessToken, GET_CUSTOMER_QUERY);
      displayName = data.customer?.displayName ?? "Account";
      email = data.customer?.emailAddress?.emailAddress ?? "";
    } catch {
      // fallback values used
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-8 md:flex-row">
        <AccountNav displayName={displayName} email={email} />
        <div className="flex-1">{children}</div>
      </div>
    </div>
  );
}
