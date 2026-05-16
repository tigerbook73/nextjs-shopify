import { Suspense } from "react";
import type { Metadata } from "next";
import SearchResults from "@/components/search/SearchResults";
import SearchResultsSkeleton from "@/components/search/SearchResultsSkeleton";
import SearchBox from "@/components/search/SearchBox";

type Props = { searchParams: Promise<{ q?: string }> };

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { q } = await searchParams;
  return {
    title: q ? `Search: ${q}` : "Search",
  };
}

export default async function SearchPage({ searchParams }: Props) {
  const { q } = await searchParams;
  const query = q?.trim() ?? "";

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Search</h1>

      <div className="mb-8 sm:hidden">
        <SearchBox defaultValue={query} />
      </div>

      {query ? (
        <Suspense fallback={<SearchResultsSkeleton />}>
          <SearchResults query={query} />
        </Suspense>
      ) : (
        <p className="text-gray-500">Enter a keyword above to search products and collections.</p>
      )}
    </main>
  );
}
