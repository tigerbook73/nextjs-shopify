import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getCustomer } from "@/lib/shopify/client";
import { logout } from "@/lib/actions/customer";

export const dynamic = "force-dynamic";
export const metadata = { title: "我的账户" };

export default async function AccountPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("customerAccessToken")?.value;

  if (!token) redirect("/account/login");

  const customer = await getCustomer(token);

  if (!customer) redirect("/account/login?expired=1");

  return (
    <main>
      <h1 className="mb-6 text-2xl font-bold">我的账户</h1>
      <div className="space-y-2 text-sm">
        <p>
          <span className="text-gray-500">姓名：</span>
          {customer.displayName}
        </p>
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
