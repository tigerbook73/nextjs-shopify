import Link from "next/link";
import LoginForm from "@/components/account/LoginForm";

export const metadata = { title: "登录" };

export default function LoginPage() {
  return (
    <main className="mx-auto max-w-sm px-4 py-16">
      <h1 className="mb-6 text-2xl font-bold">登录</h1>
      <LoginForm />
      <p className="mt-4 text-center text-sm text-gray-600">
        没有账户？{" "}
        <Link href="/account/register" className="font-medium underline">
          注册
        </Link>
      </p>
    </main>
  );
}
