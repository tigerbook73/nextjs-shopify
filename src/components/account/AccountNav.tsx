"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, ShoppingBag, User, MapPin, LogOut } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface AccountNavProps {
  displayName: string;
  email: string;
}

const NAV_ITEMS = [
  { href: "/account", label: "Overview", Icon: LayoutDashboard, exact: true },
  { href: "/account/orders", label: "Orders", Icon: ShoppingBag, exact: false },
  { href: "/account/profile", label: "Profile", Icon: User, exact: false },
  { href: "/account/addresses", label: "Addresses", Icon: MapPin, exact: false },
] as const;

function getInitials(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  const first = words[0]?.[0]?.toUpperCase() ?? "";
  const second = words[1]?.[0]?.toUpperCase() ?? "";
  return first + second || "?";
}

export default function AccountNav({ displayName, email }: AccountNavProps) {
  const pathname = usePathname();

  function isActive(href: string, exact: boolean): boolean {
    return exact ? pathname === href : pathname.startsWith(href);
  }

  return (
    <nav aria-label="Account navigation">
      {/* Desktop sidebar */}
      <div data-testid="account-nav-desktop" className="hidden md:flex md:w-64 md:flex-shrink-0 md:flex-col md:gap-1">
        <div className="mb-4 flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarFallback>{getInitials(displayName)}</AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="truncate font-semibold">{displayName}</p>
            <p className="truncate text-sm text-gray-500">{email}</p>
          </div>
        </div>
        <hr className="mb-2" />
        <div className="flex flex-col gap-1">
          {NAV_ITEMS.map(({ href, label, Icon, exact }) => {
            const active = isActive(href, exact);
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? "page" : undefined}
                className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm ${
                  active ? "bg-gray-100 font-semibold" : "hover:bg-gray-50"
                }`}
              >
                <Icon className="size-4 shrink-0" />
                {label}
              </Link>
            );
          })}
        </div>
        <div className="mt-auto pt-4">
          <form action="/api/auth/logout" method="POST">
            <button
              type="submit"
              className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-red-600 hover:bg-gray-50"
            >
              <LogOut className="size-4 shrink-0" />
              Sign out
            </button>
          </form>
        </div>
      </div>

      {/* Mobile tab bar */}
      <div data-testid="account-nav-mobile" className="flex border-b md:hidden">
        {NAV_ITEMS.map(({ href, label, Icon, exact }) => {
          const active = isActive(href, exact);
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={`flex flex-1 flex-col items-center gap-1 py-3 text-xs ${
                active ? "border-b-2 border-gray-900 font-semibold" : "text-gray-500"
              }`}
            >
              <Icon className="size-4" />
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
