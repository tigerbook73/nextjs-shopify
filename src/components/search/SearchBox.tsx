"use client";

export default function SearchBox({ defaultValue = "" }: { defaultValue?: string }) {
  return (
    <form method="get" action="/search" className="flex w-full max-w-sm items-center gap-2">
      <input
        type="search"
        name="q"
        defaultValue={defaultValue}
        placeholder="Search products..."
        className="w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:ring-2 focus:ring-gray-900 focus:outline-none"
      />
      <button
        type="submit"
        className="rounded-md bg-gray-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-gray-700"
      >
        Search
      </button>
    </form>
  );
}
