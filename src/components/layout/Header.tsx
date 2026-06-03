import Link from "next/link";
import CartIconButton from "@/components/layout/CartIconButton";
import MobileMenu from "@/components/layout/MobileMenu";
import SignInButton from "@/components/layout/SignInButton";
import UserDropdown from "@/components/layout/UserDropdown";
import SearchBox from "@/components/search/SearchBox";
import { getAccessToken } from "@/lib/shopify/customer-account/tokens";
import { customerAccountFetch } from "@/lib/shopify/customer-account/client";
import { GET_CUSTOMER_QUERY } from "@/lib/shopify/customer-account/queries/customer";

export default async function Header() {
  const accessToken = await getAccessToken();
  const isLoggedIn = !!accessToken;

  let displayName = "";
  if (accessToken) {
    try {
      const data = await customerAccountFetch(accessToken, GET_CUSTOMER_QUERY);
      displayName = data.customer?.displayName ?? "";
    } catch {
      // fallback: Avatar shows "?"
    }
  }

  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/" className="text-lg font-bold text-gray-900 hover:text-gray-700">
          Tigerbook Studio
        </Link>

        <nav className="hidden gap-6 sm:flex">
          <Link href="/products" className="text-sm font-medium text-gray-600 hover:text-gray-900">
            Products
          </Link>
          <Link href="/collections" className="text-sm font-medium text-gray-600 hover:text-gray-900">
            Collections
          </Link>
        </nav>

        <div className="flex items-center gap-4">
          <SearchBox />
          <CartIconButton />
          <div className="hidden sm:block">
            {isLoggedIn ? <UserDropdown displayName={displayName} /> : <SignInButton />}
          </div>
          <MobileMenu isLoggedIn={isLoggedIn} />
        </div>
      </div>
    </header>
  );
}
