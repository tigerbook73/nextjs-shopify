import Link from "next/link";
import RegisterForm from "@/components/account/RegisterForm";

export const metadata = { title: "注册" };

export default function RegisterPage() {
  return (
    <main className="mx-auto max-w-sm px-4 py-16">
      <h1 className="mb-6 text-2xl font-bold">注册</h1>
      <RegisterForm />
      <p className="mt-4 text-center text-sm text-gray-600">
        已有账户？{" "}
        <Link href="/account/login" className="font-medium underline">
          登录
        </Link>
      </p>
    </main>
  );
}
