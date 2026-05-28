import type { Metadata } from "next";
import { getProducts } from "@/lib/shopify/client";
import ProductCard from "@/components/product/ProductCard";

export const metadata: Metadata = {
  title: "All Products",
  description: "Browse our full catalog of products.",
};

export default async function ProductsPage() {
  const products = await getProducts(20);

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="mb-8 text-2xl font-bold text-gray-900">All Products</h1>
      <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:gap-x-6 lg:grid-cols-4">
        {products.nodes.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </main>
  );
}
