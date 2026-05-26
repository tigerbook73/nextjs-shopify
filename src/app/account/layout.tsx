import Link from "next/link";

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <nav className="mb-8 flex gap-6 border-b pb-4 text-sm">
        <Link href="/account" className="font-medium hover:underline">
          账户信息
        </Link>
        <Link href="/account/orders" className="font-medium hover:underline">
          历史订单
        </Link>
      </nav>
      {children}
    </div>
  );
}
