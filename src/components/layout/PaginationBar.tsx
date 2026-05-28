import Link from "next/link";
import type { PageInfo } from "@/lib/shopify/types";

interface PaginationBarProps {
  pageInfo: PageInfo;
  baseUrl: string;
  searchParams: Record<string, string>;
}

function buildUrl(
  baseUrl: string,
  params: Record<string, string>,
  cursor: { after?: string; before?: string },
): string {
  const sp = new URLSearchParams(params);
  sp.delete("after");
  sp.delete("before");
  if (cursor.after) sp.set("after", cursor.after);
  if (cursor.before) sp.set("before", cursor.before);
  const qs = sp.toString();
  return qs ? `${baseUrl}?${qs}` : baseUrl;
}

export default function PaginationBar({ pageInfo, baseUrl, searchParams }: PaginationBarProps) {
  const { hasPreviousPage, hasNextPage, startCursor, endCursor } = pageInfo;

  if (!hasPreviousPage && !hasNextPage) return null;

  const btnClass = "rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50";

  return (
    <div className="mt-12 flex items-center justify-between">
      {hasPreviousPage && startCursor ? (
        <Link href={buildUrl(baseUrl, searchParams, { before: startCursor })} className={btnClass}>
          ← Prev page
        </Link>
      ) : (
        <span />
      )}
      {hasNextPage && endCursor ? (
        <Link href={buildUrl(baseUrl, searchParams, { after: endCursor })} className={btnClass}>
          Next page →
        </Link>
      ) : (
        <span />
      )}
    </div>
  );
}
