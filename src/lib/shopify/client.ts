import type { Product, ProductDetail, Collection, CollectionDetail, Shop, SearchResult } from "./types";
import { GET_PRODUCTS_QUERY, GET_PRODUCT_BY_HANDLE_QUERY } from "./queries/product";
import {
  GET_COLLECTIONS_QUERY,
  GET_COLLECTION_BY_HANDLE_QUERY,
  GET_COLLECTION_HANDLES_QUERY,
} from "./queries/collection";
import { GET_SHOP_QUERY } from "./queries/shop";
import { SEARCH_QUERY } from "./queries/search";

const SHOPIFY_STORE_DOMAIN = process.env.SHOPIFY_STORE_DOMAIN!;
const SHOPIFY_STOREFRONT_ACCESS_TOKEN = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN!;

const endpoint = `https://${SHOPIFY_STORE_DOMAIN}/api/2024-10/graphql.json`;

export async function getProducts(first = 20): Promise<Product[]> {
  const data = await shopifyFetch<{ products: { nodes: Product[] } }>({
    query: GET_PRODUCTS_QUERY,
    variables: { first },
  });
  return data.products.nodes;
}

export async function getProductByHandle(handle: string): Promise<ProductDetail | null> {
  const data = await shopifyFetch<{ product: ProductDetail | null }>({
    query: GET_PRODUCT_BY_HANDLE_QUERY,
    variables: { handle },
  });
  return data.product;
}

export async function getProductHandles(): Promise<{ handle: string }[]> {
  const data = await shopifyFetch<{ products: { nodes: { handle: string }[] } }>({
    query: GET_PRODUCTS_QUERY,
    variables: { first: 250 },
  });
  return data.products.nodes;
}

export async function getCollections(first = 20): Promise<Collection[]> {
  const data = await shopifyFetch<{ collections: { nodes: Collection[] } }>({
    query: GET_COLLECTIONS_QUERY,
    variables: { first },
  });
  return data.collections.nodes;
}

export async function getCollectionByHandle(
  handle: string,
  first = 12,
  after?: string,
): Promise<CollectionDetail | null> {
  const data = await shopifyFetch<{ collection: CollectionDetail | null }>({
    query: GET_COLLECTION_BY_HANDLE_QUERY,
    variables: { handle, first, after: after ?? null },
  });
  return data.collection;
}

export async function getCollectionHandles(): Promise<{ handle: string }[]> {
  const data = await shopifyFetch<{ collections: { nodes: { handle: string }[] } }>({
    query: GET_COLLECTION_HANDLES_QUERY,
    variables: { first: 250 },
  });
  return data.collections.nodes;
}

export async function searchProducts(query: string, first = 20): Promise<SearchResult> {
  const data = await shopifyFetch<{ search: SearchResult }>({
    query: SEARCH_QUERY,
    variables: { query, first },
    cache: 'no-store',
  });
  return data.search;
}

export async function getShop(): Promise<Shop> {
  const data = await shopifyFetch<{ shop: Shop }>({
    query: GET_SHOP_QUERY,
  });
  return data.shop;
}

export async function shopifyFetch<T>({
  query,
  variables,
  cache = "force-cache",
  tags,
}: {
  query: string;
  variables?: Record<string, unknown>;
  cache?: RequestCache;
  tags?: string[];
}): Promise<T> {
  const res = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Storefront-Access-Token": SHOPIFY_STOREFRONT_ACCESS_TOKEN,
    },
    body: JSON.stringify({ query, variables }),
    cache,
    next: tags ? { tags } : undefined,
  });

  if (!res.ok) {
    throw new Error(`Shopify API error: ${res.status} ${res.statusText}`);
  }

  const json = await res.json();

  if (json.errors) {
    throw new Error(json.errors[0].message);
  }

  return json.data as T;
}
