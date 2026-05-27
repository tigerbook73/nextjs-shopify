"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";

const NAV_LINKS = [
  { href: "/products", label: "Products" },
  { href: "/collections", label: "Collections" },
  { href: "/search", label: "Search" },
  { href: "/account", label: "Account" },
];

export default function MobileMenu() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setIsOpen(false);
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <>
      <button onClick={() => setIsOpen(true)} aria-label="Open menu" className="md:hidden">
        <Menu className="h-6 w-6 text-gray-700" />
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 z-40 bg-black/20" onClick={() => setIsOpen(false)} />

          {/* Menu panel */}
          <div className="fixed inset-0 z-50 flex flex-col bg-white px-6 py-6">
            <div className="flex items-center justify-between">
              <Link href="/" className="text-lg font-bold text-gray-900" onClick={() => setIsOpen(false)}>
                Shopify
              </Link>
              <button onClick={() => setIsOpen(false)} aria-label="Close menu">
                <X className="h-6 w-6 text-gray-700" />
              </button>
            </div>

            <nav className="mt-10 flex flex-col gap-6">
              {NAV_LINKS.map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setIsOpen(false)}
                  className="text-xl font-medium text-gray-900 hover:text-gray-600"
                >
                  {label}
                </Link>
              ))}
            </nav>
          </div>
        </>
      )}
    </>
  );
}
