"use client";

import { useRouter, useSearchParams } from "next/navigation";

const SORT_OPTIONS = [
  { label: "Default", value: "" },
  { label: "Price: Low to High", value: "price-asc" },
  { label: "Price: High to Low", value: "price-desc" },
  { label: "Newest", value: "newest" },
  { label: "Best Selling", value: "best-selling" },
];

interface CollectionFiltersProps {
  initialSort?: string;
  initialAvailable?: boolean;
}

export default function CollectionFilters({ initialSort, initialAvailable }: CollectionFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function updateParam(key: string, value: string | null) {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("after");
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`?${params.toString()}`);
  }

  const currentSort = searchParams.get("sort") ?? initialSort ?? "";
  const currentAvailable = searchParams.get("available") === "true" || (initialAvailable ?? false);

  return (
    <div className="mb-6 flex flex-wrap items-center gap-4">
      <div className="flex items-center gap-2">
        <label htmlFor="sort-select" className="text-sm font-medium text-gray-700">
          Sort by
        </label>
        <select
          id="sort-select"
          value={currentSort}
          onChange={(e) => updateParam("sort", e.target.value || null)}
          className="rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-700 focus:ring-2 focus:ring-gray-900 focus:outline-none"
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-gray-700">
        <input
          type="checkbox"
          checked={currentAvailable}
          onChange={(e) => updateParam("available", e.target.checked ? "true" : null)}
          className="h-4 w-4 rounded border-gray-300 text-gray-900 focus:ring-gray-900"
        />
        In Stock Only
      </label>
    </div>
  );
}
