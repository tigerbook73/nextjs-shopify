"use client";

import { useRouter } from "next/navigation";
import { LayoutDashboard, ShoppingBag, User, MapPin, LogOut } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface UserDropdownProps {
  displayName: string;
}

function getInitials(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  const first = words[0]?.[0]?.toUpperCase() ?? "";
  const second = words[1]?.[0]?.toUpperCase() ?? "";
  return first + second || "?";
}

const NAV_ITEMS = [
  { href: "/account", label: "Overview", Icon: LayoutDashboard },
  { href: "/account/orders", label: "Orders", Icon: ShoppingBag },
  { href: "/account/profile", label: "Profile", Icon: User },
  { href: "/account/addresses", label: "Addresses", Icon: MapPin },
] as const;

export default function UserDropdown({ displayName }: UserDropdownProps) {
  const router = useRouter();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger aria-label="Account menu">
        <Avatar>
          <AvatarFallback>{getInitials(displayName)}</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {NAV_ITEMS.map(({ href, label, Icon }) => (
          <DropdownMenuItem key={href} onClick={() => router.push(href)}>
            <Icon />
            {label}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <form action="/api/auth/logout" method="POST">
          <button
            type="submit"
            className="hover:bg-accent flex w-full items-center gap-1.5 rounded-md px-1.5 py-1 text-sm text-red-600"
          >
            <LogOut className="size-4" />
            Sign out
          </button>
        </form>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
