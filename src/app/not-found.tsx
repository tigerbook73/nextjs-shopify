import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-[calc(100vh-73px)] max-w-3xl flex-col justify-center px-6 py-16">
      <p className="text-muted-foreground text-sm font-medium">404</p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight text-gray-950">页面不存在</h1>
      <p className="text-muted-foreground mt-4 max-w-xl text-sm leading-6">
        这个页面可能已经被移除，或者链接地址有误。可以回到首页，或继续浏览商品。
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Link href="/" className="rounded-md bg-gray-950 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800">
          返回首页
        </Link>
        <Link
          href="/products"
          className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-50"
        >
          浏览商品
        </Link>
      </div>
    </main>
  );
}
