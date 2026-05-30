import Link from "next/link";

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-8 md:flex-row">
        <nav className="flex gap-4 border-b pb-4 text-sm font-medium md:w-48 md:flex-col md:gap-2 md:border-r md:border-b-0 md:pr-8 md:pb-0">
          <Link href="/account" className="hover:underline">
            账户信息
          </Link>
          <Link href="/account/orders" className="hover:underline">
            历史订单
          </Link>
          <Link href="/account/profile" className="hover:underline">
            个人资料
          </Link>
          <Link href="/account/addresses" className="hover:underline">
            收货地址
          </Link>
          <form action="/api/auth/logout" method="POST" className="mt-auto pt-4 md:pt-0">
            <button type="submit" className="text-gray-500 hover:underline">
              退出登录
            </button>
          </form>
        </nav>
        <div className="flex-1">{children}</div>
      </div>
    </div>
  );
}
