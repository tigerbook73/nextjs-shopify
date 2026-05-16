import { notFound } from "next/navigation";
import Image from "next/image";
import type { Metadata } from "next";
import { getProductByHandle, getProducts } from "@/lib/shopify/client";
import VariantSelector from "@/components/product/VariantSelector";

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
  return products.map((p) => ({ handle: p.handle }));
}

export default async function ProductPage({ params }: Props) {
  const { handle } = await params;
  const product = await getProductByHandle(handle);

  if (!product) notFound();

  const hasVariantOptions = product.options.some((o) => o.values.length > 1);

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
        {/* 商品图片 */}
        <div className="aspect-square overflow-hidden rounded-xl bg-gray-100">
          {product.featuredImage ? (
            <Image
              src={product.featuredImage.url}
              alt={product.featuredImage.altText ?? product.title}
              width={800}
              height={800}
              className="h-full w-full object-cover"
              priority
            />
          ) : (
            <div className="flex h-full items-center justify-center text-gray-400">No image</div>
          )}
        </div>

        {/* 商品信息 */}
        <div className="flex flex-col gap-6">
          <h1 className="text-3xl font-bold text-gray-900">{product.title}</h1>

          {hasVariantOptions ? (
            <VariantSelector options={product.options} variants={product.variants.nodes} />
          ) : (
            <p className="text-2xl font-semibold text-gray-900">
              {new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: product.priceRange.minVariantPrice.currencyCode,
              }).format(parseFloat(product.priceRange.minVariantPrice.amount))}
            </p>
          )}

          {product.descriptionHtml && (
            <div
              className="prose prose-sm text-gray-600"
              dangerouslySetInnerHTML={{ __html: product.descriptionHtml }}
            />
          )}
        </div>
      </div>
    </main>
  );
}
