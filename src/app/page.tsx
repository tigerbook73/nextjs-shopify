import Image from "next/image";
import Link from "next/link";
import { getCollections, getProducts } from "@/lib/shopify/client";
import CollectionCard from "@/components/collection/CollectionCard";
import ProductCard from "@/components/product/ProductCard";

export default async function HomePage() {
  const [collections, products] = await Promise.all([getCollections(4), getProducts(8)]);

  return (
    <main>
      {/* Hero */}
      <section className="relative h-[560px] overflow-hidden bg-gray-900">
        <Image src="/hero.jpg" alt="Store hero" fill priority className="object-cover opacity-60" />
        <div className="relative flex h-full flex-col items-center justify-center gap-6 px-4 text-center text-white">
          <h1 className="max-w-2xl text-4xl font-bold tracking-tight sm:text-5xl">Discover Our Collection</h1>
          <p className="max-w-md text-lg text-white/80">Explore handpicked products made for everyday life.</p>
          <div className="flex gap-4">
            <Link
              href="/products"
              className="rounded-md bg-white px-6 py-3 text-sm font-semibold text-gray-900 hover:bg-gray-100"
            >
              Shop All Products
            </Link>
            <Link
              href="/collections"
              className="rounded-md border border-white px-6 py-3 text-sm font-semibold text-white hover:bg-white/10"
            >
              Browse Collections
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Collections */}
      {collections.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <h2 className="mb-8 text-2xl font-bold text-gray-900">Featured Collections</h2>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {collections.map((collection) => (
              <CollectionCard key={collection.id} collection={collection} />
            ))}
          </div>
        </section>
      )}

      {/* Popular Products */}
      {products.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <h2 className="mb-8 text-2xl font-bold text-gray-900">Popular Products</h2>
          <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
