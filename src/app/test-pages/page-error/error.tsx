"use client";

import Link from "next/link";

export default function ErrorBoundaryTestError({ reset }: { error: Error; reset: () => void }) {
  return (
    <main className="mx-auto flex min-h-[calc(100vh-73px)] max-w-3xl flex-col justify-center px-6 py-16">
      <p className="text-sm font-medium text-amber-600">产品完整性测试页面</p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight text-gray-950">错误边界运行正常</h1>
      <p className="mt-4 max-w-xl text-sm leading-6 text-gray-500">
        此页面会故意触发错误，用于验证应用的错误边界（Error Boundary）机制是否正常工作。
        看到此页面说明错误处理机制运行正常。这是一个产品完整性测试页面，非真实故障。
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
