"use client";

import Link from "next/link";

export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="mx-auto flex min-h-[calc(100vh-73px)] max-w-3xl flex-col justify-center px-6 py-16">
      <p className="text-muted-foreground text-sm font-medium">Error</p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight text-gray-950">页面暂时无法显示</h1>
      <p className="text-muted-foreground mt-4 max-w-xl text-sm leading-6">
        请求处理时出现问题。你可以重试当前页面，或返回首页继续浏览。
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={reset}
          className="rounded-md bg-gray-950 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
        >
          重试
        </button>
        <Link
          href="/"
          className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-50"
        >
          返回首页
        </Link>
      </div>
    </main>
  );
}
