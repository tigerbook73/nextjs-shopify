import { shopifyFetch } from '@/lib/shopify/client'
import { GET_PRODUCTS_QUERY } from '@/lib/shopify/queries/product'
import type { Product } from '@/lib/shopify/types'

interface GetProductsData {
  products: { nodes: Product[] }
}

export default async function HomePage() {
  let products: Product[] = []
  let error: string | null = null

  try {
    const data = await shopifyFetch<GetProductsData>({
      query: GET_PRODUCTS_QUERY,
      variables: { first: 3 },
      cache: 'no-store',
    })
    products = data.products.nodes
  } catch (e) {
    error = e instanceof Error ? e.message : 'Unknown error'
  }

  return (
    <main className="max-w-2xl mx-auto p-8">
      <h1 className="text-2xl font-semibold mb-2">Phase 0 — API 连通验证</h1>
      <p className="text-sm text-muted-foreground mb-8">
        来自 Shopify Storefront API 的真实数据
      </p>

      {error ? (
        <div className="rounded-md border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
          <p className="font-medium">API 请求失败</p>
          <p className="mt-1 font-mono">{error}</p>
        </div>
      ) : products.length === 0 ? (
        <p className="text-muted-foreground">店铺中暂无商品</p>
      ) : (
        <ul className="space-y-3">
          {products.map((product) => (
            <li
              key={product.id}
              className="rounded-lg border p-4 flex items-center justify-between"
            >
              <span className="font-medium">{product.title}</span>
              <span className="text-sm text-muted-foreground">
                {product.priceRange.minVariantPrice.currencyCode}{' '}
                {parseFloat(product.priceRange.minVariantPrice.amount).toFixed(2)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </main>
  )
}
