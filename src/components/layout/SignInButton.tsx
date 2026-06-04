"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function SignInButton() {
  const pathname = usePathname();

  return (
    <Link
      href={`/api/auth/login?return_to=${pathname}`}
      className="text-sm font-medium whitespace-nowrap text-gray-600 hover:text-gray-900"
    >
      Sign in
    </Link>
  );
}
