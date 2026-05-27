import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getCustomer, getCustomerOrders } from "@/lib/shopify/client";
import { logout } from "@/lib/actions/customer";

export const dynamic = "force-dynamic";
export const metadata = { title: "我的账户" };

export default async function AccountPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("customerAccessToken")?.value;

  if (!token) redirect("/account/login");

  const [customer, orders] = await Promise.all([getCustomer(token), getCustomerOrders(token)]);

  if (!customer) redirect("/account/login?expired=1");

  const initials = customer.displayName
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <main>
      <div className="mb-6 flex items-center gap-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-900 text-xl font-bold text-white">
          {initials}
        </div>
        <div>
          <h1 className="text-2xl font-bold">{customer.displayName}</h1>
          <p className="text-sm text-gray-500">{orders.length} 笔历史订单</p>
        </div>
      </div>
      <div className="space-y-2 text-sm">
        <p>
          <span className="text-gray-500">邮箱：</span>
          {customer.email}
        </p>
      </div>
      <form action={logout} className="mt-8">
        <button type="submit" className="rounded-md border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50">
          退出登录
        </button>
      </form>
    </main>
  );
}
