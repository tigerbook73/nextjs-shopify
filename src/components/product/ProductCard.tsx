import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/lib/shopify/types";
import { formatPrice } from "@/lib/utils/format-price";

export default function ProductCard({ product }: { product: Product }) {
  const { handle, title, featuredImage, priceRange, compareAtPriceRange, availableForSale } = product;
  const price = priceRange.minVariantPrice;

  const isOnSale = Number(compareAtPriceRange.minVariantPrice.amount) > Number(price.amount);
  const isSoldOut = !availableForSale;

  return (
    <Link href={`/products/${handle}`} className="group block">
      <div className="relative aspect-square overflow-hidden rounded-lg bg-gray-100">
        {featuredImage ? (
          <Image
            src={featuredImage.url}
            alt={featuredImage.altText ?? title}
            width={600}
            height={600}
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 50vw"
            className={`h-full w-full object-cover transition-transform duration-300 group-hover:scale-105 ${isSoldOut ? "opacity-50" : ""}`}
          />
        ) : (
          <div className="flex h-full items-center justify-center text-gray-400">No image</div>
        )}

        {isSoldOut && (
          <span className="absolute top-2 left-2 rounded bg-gray-500 px-2 py-0.5 text-xs font-semibold text-white">
            Sold Out
          </span>
        )}
        {!isSoldOut && isOnSale && (
          <span className="absolute top-2 left-2 rounded bg-red-500 px-2 py-0.5 text-xs font-semibold text-white">
            Sale
          </span>
        )}
      </div>
      <div className="mt-3 space-y-1">
        <h3 className="text-sm font-medium text-gray-900 group-hover:underline">{title}</h3>
        <p className="text-sm text-gray-600">From {formatPrice(price.amount, price.currencyCode)}</p>
      </div>
    </Link>
  );
}
