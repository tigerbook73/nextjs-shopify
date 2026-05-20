import { Suspense } from "react";
import Link from "next/link";
import SearchBox from "@/components/search/SearchBox";
import CartCount from "@/components/cart/CartCount";

export default function Header() {
  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/" className="text-lg font-bold text-gray-900 hover:text-gray-700">
          Shopify
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
          <Suspense fallback={<div className="h-6 w-6" />}>
            <CartCount />
          </Suspense>
        </div>
      </div>
    </header>
  );
}
