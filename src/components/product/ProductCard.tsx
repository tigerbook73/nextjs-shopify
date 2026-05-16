import Image from 'next/image'
import Link from 'next/link'
import type { Product } from '@/lib/shopify/types'

function formatPrice(amount: string, currencyCode: string) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currencyCode,
  }).format(parseFloat(amount))
}

export default function ProductCard({ product }: { product: Product }) {
  const { handle, title, featuredImage, priceRange } = product
  const price = priceRange.minVariantPrice

  return (
    <Link href={`/products/${handle}`} className="group block">
      <div className="aspect-square overflow-hidden rounded-lg bg-gray-100">
        {featuredImage ? (
          <Image
            src={featuredImage.url}
            alt={featuredImage.altText ?? title}
            width={600}
            height={600}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-gray-400">
            No image
          </div>
        )}
      </div>
      <div className="mt-3 space-y-1">
        <h3 className="text-sm font-medium text-gray-900 group-hover:underline">
          {title}
        </h3>
        <p className="text-sm text-gray-600">
          From {formatPrice(price.amount, price.currencyCode)}
        </p>
      </div>
    </Link>
  )
}
