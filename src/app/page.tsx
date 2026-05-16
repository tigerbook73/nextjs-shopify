import { shopifyFetch } from "@/lib/shopify/client";
import { GET_PRODUCTS_QUERY } from "@/lib/shopify/queries/product";
import type { Product } from "@/lib/shopify/types";

interface GetProductsData {
  products: { nodes: Product[] };
}

export default async function HomePage() {
  let products: Product[] = [];
  let error: string | null = null;

  try {
    const data = await shopifyFetch<GetProductsData>({
      query: GET_PRODUCTS_QUERY,
      variables: { first: 3 },
      cache: "no-store",
    });
    products = data.products.nodes;
  } catch (e) {
    error = e instanceof Error ? e.message : "Unknown error";
  }

  return (
    <main className="mx-auto max-w-2xl p-8">
      <h1 className="mb-2 text-2xl font-semibold">Phase 0 — API 连通验证</h1>
      <p className="text-muted-foreground mb-8 text-sm">来自 Shopify Storefront API 的真实数据</p>

      {error ? (
        <div className="border-destructive/50 bg-destructive/10 text-destructive rounded-md border p-4 text-sm">
          <p className="font-medium">API 请求失败</p>
          <p className="mt-1 font-mono">{error}</p>
        </div>
      ) : products.length === 0 ? (
        <p className="text-muted-foreground">店铺中暂无商品</p>
      ) : (
        <ul className="space-y-3">
          {products.map((product) => (
            <li key={product.id} className="flex items-center justify-between rounded-lg border p-4">
              <span className="font-medium">{product.title}</span>
              <span className="text-muted-foreground text-sm">
                {product.priceRange.minVariantPrice.currencyCode}{" "}
                {parseFloat(product.priceRange.minVariantPrice.amount).toFixed(2)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
