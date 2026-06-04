import Link from "next/link";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-gray-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          {/* Brand */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-gray-900">About Us</h3>
            <p className="text-sm text-gray-600">
              A curated store built with Next.js and Shopify, delivering quality products to your door.
            </p>
          </div>

          {/* Shop */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-gray-900">Shop</h3>
            <ul className="space-y-1 text-sm text-gray-600">
              <li>
                <Link href="/products" className="hover:text-gray-900">
                  All Products
                </Link>
              </li>
              <li>
                <Link href="/collections" className="hover:text-gray-900">
                  Collections
                </Link>
              </li>
              <li>
                <Link href="/search" className="hover:text-gray-900">
                  Search
                </Link>
              </li>
            </ul>
          </div>

          {/* Account */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-gray-900">Account</h3>
            <ul className="space-y-1 text-sm text-gray-600">
              <li>
                <Link href="/account" className="hover:text-gray-900">
                  My Account
                </Link>
              </li>
              <li>
                <Link href="/account/orders" className="hover:text-gray-900">
                  Order History
                </Link>
              </li>
              <li>
                <Link href="/cart" className="hover:text-gray-900">
                  Cart
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-6 border-t border-gray-200 pt-4 text-center text-sm text-gray-500">
          © {year} Shopify Store. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
