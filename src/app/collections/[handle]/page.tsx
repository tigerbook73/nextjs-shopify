import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import {
  getCollectionByHandle,
  getCollectionHandles,
} from '@/lib/shopify/client'
import ProductCard from '@/components/product/ProductCard'

type Props = {
  params: Promise<{ handle: string }>
  searchParams: Promise<{ after?: string }>
}

export async function generateStaticParams() {
  const collections = await getCollectionHandles()
  return collections.map((c) => ({ handle: c.handle }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { handle } = await params
  const collection = await getCollectionByHandle(handle)

  if (!collection) return {}

  return {
    title: collection.seo.title ?? collection.title,
    description: collection.seo.description ?? collection.description ?? undefined,
    openGraph: collection.image
      ? { images: [{ url: collection.image.url }] }
      : undefined,
  }
}

export default async function CollectionPage({ params, searchParams }: Props) {
  const { handle } = await params
  const { after } = await searchParams

  const collection = await getCollectionByHandle(handle, 12, after)

  if (!collection) notFound()

  const { products } = collection
  const { hasNextPage, endCursor } = products.pageInfo
  const hasPrevPage = !!after

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8">
        <nav className="mb-2 text-sm text-gray-500">
          <Link href="/collections" className="hover:underline">
            Collections
          </Link>
          {' / '}
          <span className="text-gray-900">{collection.title}</span>
        </nav>
        <h1 className="text-2xl font-bold text-gray-900">{collection.title}</h1>
        {collection.description && (
          <p className="mt-2 text-gray-600">{collection.description}</p>
        )}
      </div>

      {products.nodes.length === 0 ? (
        <p className="text-gray-500">No products in this collection.</p>
      ) : (
        <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:gap-x-6 lg:grid-cols-4">
          {products.nodes.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}

      {(hasPrevPage || hasNextPage) && (
        <div className="mt-12 flex items-center justify-between">
          {hasPrevPage ? (
            <Link
              href={`/collections/${handle}`}
              className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              ← Back to start
            </Link>
          ) : (
            <span />
          )}

          {hasNextPage && endCursor ? (
            <Link
              href={`/collections/${handle}?after=${endCursor}`}
              className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Next page →
            </Link>
          ) : (
            <span />
          )}
        </div>
      )}
    </main>
  )
}
