import { Suspense } from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getProductByHandle, getProducts } from "@/lib/shopify/client";
import ProductForm from "@/components/product/ProductForm";
import ProductGallery from "@/components/product/ProductGallery";
import RelatedProducts from "@/components/product/RelatedProducts";

type Props = { params: Promise<{ handle: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { handle } = await params;
  const product = await getProductByHandle(handle);

  if (!product) return {};

  return {
    title: product.seo.title ?? product.title,
    description: product.seo.description ?? product.description ?? undefined,
    openGraph: product.featuredImage ? { images: [{ url: product.featuredImage.url }] } : undefined,
  };
}

export async function generateStaticParams() {
  const products = await getProducts(20);
  return products.nodes.map((p) => ({ handle: p.handle }));
}

export default async function ProductPage({ params }: Props) {
  const { handle } = await params;
  const product = await getProductByHandle(handle);

  if (!product) notFound();

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
        {/* Product images */}
        <ProductGallery images={product.images.nodes} />

        {/* Product info */}
        <div className="flex flex-col gap-6">
          <h1 className="text-3xl font-bold text-gray-900">{product.title}</h1>

          <ProductForm options={product.options} variants={product.variants.nodes} />

          {product.descriptionHtml && (
            <div
              className="prose prose-sm text-gray-600"
              dangerouslySetInnerHTML={{ __html: product.descriptionHtml }}
            />
          )}
        </div>
      </div>

      {product.collections.nodes[0] && (
        <Suspense fallback={null}>
          <RelatedProducts currentHandle={handle} collectionHandle={product.collections.nodes[0].handle} />
        </Suspense>
      )}
    </main>
  );
}
