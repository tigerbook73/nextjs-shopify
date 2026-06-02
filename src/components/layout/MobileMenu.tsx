"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";

const NAV_LINKS = [
  { href: "/products", label: "Products" },
  { href: "/collections", label: "Collections" },
  { href: "/search", label: "Search" },
  { href: "/account", label: "Account" },
];

export default function MobileMenu() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button onClick={() => setIsOpen(true)} aria-label="Open menu" className="md:hidden">
        <Menu className="h-6 w-6 text-gray-700" />
      </button>

      <Sheet open={isOpen} onOpenChange={(open) => setIsOpen(open)}>
        <SheetContent side="left" className="w-full px-6 py-6 sm:max-w-full">
          <SheetTitle className="sr-only">Menu</SheetTitle>
          <div className="flex items-center pr-10">
            <Link href="/" className="text-lg font-bold text-gray-900" onClick={() => setIsOpen(false)}>
              Shopify
            </Link>
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
        </SheetContent>
      </Sheet>
    </>
  );
}
