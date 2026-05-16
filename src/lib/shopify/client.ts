import type { Product, ProductDetail } from './types'
import {
  GET_PRODUCTS_QUERY,
  GET_PRODUCT_BY_HANDLE_QUERY,
} from './queries/product'

const SHOPIFY_STORE_DOMAIN = process.env.SHOPIFY_STORE_DOMAIN!
const SHOPIFY_STOREFRONT_ACCESS_TOKEN =
  process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN!

const endpoint = `https://${SHOPIFY_STORE_DOMAIN}/api/2024-10/graphql.json`

export async function getProducts(first = 20): Promise<Product[]> {
  const data = await shopifyFetch<{ products: { nodes: Product[] } }>({
    query: GET_PRODUCTS_QUERY,
    variables: { first },
  })
  return data.products.nodes
}

export async function getProductByHandle(
  handle: string,
): Promise<ProductDetail | null> {
  const data = await shopifyFetch<{ product: ProductDetail | null }>({
    query: GET_PRODUCT_BY_HANDLE_QUERY,
    variables: { handle },
  })
  return data.product
}

export async function shopifyFetch<T>({
  query,
  variables,
  cache = 'force-cache',
  tags,
}: {
  query: string
  variables?: Record<string, unknown>
  cache?: RequestCache
  tags?: string[]
}): Promise<T> {
  const res = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Storefront-Access-Token': SHOPIFY_STOREFRONT_ACCESS_TOKEN,
    },
    body: JSON.stringify({ query, variables }),
    cache,
    next: tags ? { tags } : undefined,
  })

  if (!res.ok) {
    throw new Error(`Shopify API error: ${res.status} ${res.statusText}`)
  }

  const json = await res.json()

  if (json.errors) {
    throw new Error(json.errors[0].message)
  }

  return json.data as T
}
