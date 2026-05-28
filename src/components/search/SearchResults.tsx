import { searchProducts } from "@/lib/shopify/client";
import ProductCard from "@/components/product/ProductCard";
import PaginationBar from "@/components/layout/PaginationBar";

interface Props {
  query: string;
  after?: string;
  before?: string;
}

export default async function SearchResults({ query, after, before }: Props) {
  const result = await searchProducts(query, 18, after, before);

  if (result.totalCount === 0) {
    return (
      <p className="text-gray-500">
        No results for <span className="font-medium text-gray-900">&ldquo;{query}&rdquo;</span>. Try a different
        keyword.
      </p>
    );
  }

  return (
    <div>
      <p className="mb-6 text-sm text-gray-500">
        {result.totalCount} result{result.totalCount !== 1 ? "s" : ""} for{" "}
        <span className="font-medium text-gray-900">&ldquo;{query}&rdquo;</span>
      </p>
      <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:gap-x-6 lg:grid-cols-4">
        {result.nodes.map((item) => (
          <ProductCard key={item.id} product={item} />
        ))}
      </div>
      <PaginationBar pageInfo={result.pageInfo} baseUrl="/search" searchParams={{ q: query }} />
    </div>
  );
}
