import Link from "next/link";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-gray-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-4">
          {/* Brand */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-900">About Us</h3>
            <p className="text-sm text-gray-600">
              A curated store built with Next.js and Shopify, delivering quality products to your door.
            </p>
          </div>

          {/* Shop */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-900">Shop</h3>
            <ul className="space-y-2 text-sm text-gray-600">
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
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-900">Account</h3>
            <ul className="space-y-2 text-sm text-gray-600">
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

          {/* Contact & Newsletter */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-900">Stay in Touch</h3>
            <p className="text-sm text-gray-600">Get updates on new arrivals and exclusive deals.</p>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="your@email.com"
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-gray-900 focus:outline-none"
              />
              <button className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700">
                Join
              </button>
            </div>
          </div>
        </div>

        <div className="mt-10 border-t border-gray-200 pt-6 text-center text-sm text-gray-500">
          © {year} Shopify Store. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
