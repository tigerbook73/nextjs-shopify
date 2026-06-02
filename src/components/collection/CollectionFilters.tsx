"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

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
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function updateParam(key: string, value: string | null) {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("after");
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`${pathname}?${params.toString()}`);
  }

  const currentSort = searchParams.get("sort") ?? initialSort ?? "";
  const currentAvailable = searchParams.get("available") === "true" || (initialAvailable ?? false);

  return (
    <div className="mb-6 flex flex-wrap items-center gap-4">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-gray-700">Sort by</span>
        <Select
          value={currentSort || "default"}
          onValueChange={(value) => updateParam("sort", value === "default" ? null : value)}
        >
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SORT_OPTIONS.map((opt) => (
              <SelectItem key={opt.value || "default"} value={opt.value || "default"}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-2">
        <Checkbox
          id="available"
          checked={currentAvailable}
          onCheckedChange={(checked) => updateParam("available", checked === true ? "true" : null)}
        />
        <Label htmlFor="available" className="cursor-pointer">
          In Stock Only
        </Label>
      </div>
    </div>
  );
}
