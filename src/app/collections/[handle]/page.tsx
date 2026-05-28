import { Suspense } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { getCollectionByHandle, getCollectionHandles } from "@/lib/shopify/client";
import ProductCard from "@/components/product/ProductCard";
import CollectionFilters from "@/components/collection/CollectionFilters";
import PaginationBar from "@/components/layout/PaginationBar";

const SORT_MAP: Record<string, { sortKey: string; reverse: boolean }> = {
  "price-asc": { sortKey: "PRICE", reverse: false },
  "price-desc": { sortKey: "PRICE", reverse: true },
  newest: { sortKey: "CREATED", reverse: true },
  "best-selling": { sortKey: "BEST_SELLING", reverse: false },
};

type Props = {
  params: Promise<{ handle: string }>;
  searchParams: Promise<{ after?: string; before?: string; sort?: string; available?: string }>;
};

export async function generateStaticParams() {
  const collections = await getCollectionHandles();
  return collections.map((c) => ({ handle: c.handle }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { handle } = await params;
  const collection = await getCollectionByHandle(handle);

  if (!collection) return {};

  return {
    title: collection.seo.title ?? collection.title,
    description: collection.seo.description ?? collection.description ?? undefined,
    openGraph: collection.image ? { images: [{ url: collection.image.url }] } : undefined,
  };
}

export default async function CollectionPage({ params, searchParams }: Props) {
  const { handle } = await params;
  const { after, before, sort, available } = await searchParams;

  const sortConfig = sort ? SORT_MAP[sort] : undefined;
  const filters = available === "true" ? [{ available: true }] : undefined;

  const collection = await getCollectionByHandle(
    handle,
    18,
    after,
    before,
    sortConfig?.sortKey,
    sortConfig?.reverse,
    filters,
  );

  if (!collection) notFound();

  const { products } = collection;
  const hasActiveFilters = !!(sort || available);

  const paginationParams: Record<string, string> = {};
  if (sort) paginationParams.sort = sort;
  if (available) paginationParams.available = available;

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8">
        <nav className="mb-2 text-sm text-gray-500">
          <Link href="/collections" className="hover:underline">
            Collections
          </Link>
          {" / "}
          <span className="text-gray-900">{collection.title}</span>
        </nav>
        <h1 className="text-2xl font-bold text-gray-900">{collection.title}</h1>
        {collection.description && <p className="mt-2 text-gray-600">{collection.description}</p>}
      </div>

      <Suspense>
        <CollectionFilters initialSort={sort} initialAvailable={available === "true"} />
      </Suspense>

      {products.nodes.length === 0 ? (
        hasActiveFilters ? (
          <div className="py-12 text-center">
            <p className="text-gray-500">No products match your filters.</p>
            <Link
              href={`/collections/${handle}`}
              className="mt-4 inline-block text-sm font-medium text-gray-900 underline hover:no-underline"
            >
              Clear filters
            </Link>
          </div>
        ) : (
          <p className="text-gray-500">No products in this collection.</p>
        )
      ) : (
        <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:gap-x-6 lg:grid-cols-4">
          {products.nodes.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}

      <PaginationBar pageInfo={products.pageInfo} baseUrl={`/collections/${handle}`} searchParams={paginationParams} />
    </main>
  );
}
