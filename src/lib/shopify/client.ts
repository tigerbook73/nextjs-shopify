import type {
  ProductConnection,
  ProductDetail,
  Collection,
  CollectionDetail,
  Shop,
  SearchResult,
  Cart,
  Customer,
  CustomerAccessToken,
  Order,
} from "./types";
import { GET_PRODUCTS_QUERY, GET_PRODUCT_BY_HANDLE_QUERY } from "./queries/product";
import {
  GET_COLLECTIONS_QUERY,
  GET_COLLECTION_BY_HANDLE_QUERY,
  GET_COLLECTION_HANDLES_QUERY,
} from "./queries/collection";
import { GET_SHOP_QUERY } from "./queries/shop";
import { SEARCH_QUERY } from "./queries/search";
import { GET_CART_QUERY } from "./queries/cart";
import { GET_CUSTOMER_QUERY, GET_CUSTOMER_ORDERS_QUERY } from "./queries/customer";
import { TAGS } from "./cache-tags";
import {
  CART_CREATE_MUTATION,
  CART_LINES_ADD_MUTATION,
  CART_LINES_UPDATE_MUTATION,
  CART_LINES_REMOVE_MUTATION,
} from "./mutations/cart";
import {
  CUSTOMER_CREATE_MUTATION,
  CUSTOMER_ACCESS_TOKEN_CREATE_MUTATION,
  CUSTOMER_ACCESS_TOKEN_DELETE_MUTATION,
} from "./mutations/customer";

const SHOPIFY_STORE_DOMAIN = process.env.SHOPIFY_STORE_DOMAIN!;
const SHOPIFY_STOREFRONT_ACCESS_TOKEN = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN!;

const endpoint = `https://${SHOPIFY_STORE_DOMAIN}/api/2024-10/graphql.json`;

export async function getProducts(pageSize = 20, after?: string, before?: string): Promise<ProductConnection> {
  const variables = before
    ? { last: pageSize, before, first: null, after: null }
    : { first: pageSize, after: after ?? null, last: null, before: null };
  const data = await shopifyFetch<{ products: ProductConnection }>({
    query: GET_PRODUCTS_QUERY,
    variables,
    tags: [TAGS.products],
  });
  return data.products;
}

export async function getProductByHandle(handle: string): Promise<ProductDetail | null> {
  const data = await shopifyFetch<{ product: ProductDetail | null }>({
    query: GET_PRODUCT_BY_HANDLE_QUERY,
    variables: { handle },
    tags: [TAGS.products, TAGS.product(handle)],
  });
  return data.product;
}

export async function getProductHandles(): Promise<{ handle: string }[]> {
  const data = await shopifyFetch<{ products: { nodes: { handle: string }[] } }>({
    query: GET_PRODUCTS_QUERY,
    variables: { first: 250, last: null, after: null, before: null },
    tags: [TAGS.products],
  });
  return data.products.nodes;
}

export async function getCollections(first = 20): Promise<Collection[]> {
  const data = await shopifyFetch<{ collections: { nodes: Collection[] } }>({
    query: GET_COLLECTIONS_QUERY,
    variables: { first },
    tags: [TAGS.collections],
  });
  return data.collections.nodes;
}

export async function getCollectionByHandle(
  handle: string,
  pageSize = 20,
  after?: string,
  before?: string,
  sortKey?: string,
  reverse?: boolean,
  filters?: Record<string, unknown>[],
): Promise<CollectionDetail | null> {
  const pagination = before
    ? { last: pageSize, before, first: null, after: null }
    : { first: pageSize, after: after ?? null, last: null, before: null };
  const data = await shopifyFetch<{ collection: CollectionDetail | null }>({
    query: GET_COLLECTION_BY_HANDLE_QUERY,
    variables: {
      handle,
      ...pagination,
      sortKey: sortKey ?? null,
      reverse: reverse ?? null,
      filters: filters ?? null,
    },
    tags: [TAGS.collections, TAGS.collection(handle)],
  });
  return data.collection;
}

export async function getCollectionHandles(): Promise<{ handle: string }[]> {
  const data = await shopifyFetch<{ collections: { nodes: { handle: string }[] } }>({
    query: GET_COLLECTION_HANDLES_QUERY,
    variables: { first: 250 },
    tags: [TAGS.collections],
  });
  return data.collections.nodes;
}

export async function searchProducts(
  query: string,
  pageSize = 20,
  after?: string,
  before?: string,
): Promise<SearchResult> {
  const pagination = before
    ? { last: pageSize, before, first: null, after: null }
    : { first: pageSize, after: after ?? null, last: null, before: null };
  const data = await shopifyFetch<{ search: SearchResult }>({
    query: SEARCH_QUERY,
    variables: { query, ...pagination },
    cache: "no-store",
  });
  return data.search;
}

export async function getShop(): Promise<Shop> {
  const data = await shopifyFetch<{ shop: Shop }>({
    query: GET_SHOP_QUERY,
  });
  return data.shop;
}

interface UserError {
  field: string[] | null;
  message: string;
}

function throwOnUserErrors(userErrors: UserError[]): void {
  if (userErrors.length > 0) {
    throw new Error(userErrors[0].message);
  }
}

export async function getCart(cartId: string, tags?: string[]): Promise<Cart | null> {
  const data = await shopifyFetch<{ cart: Cart | null }>({
    query: GET_CART_QUERY,
    variables: { cartId },
    cache: tags ? "force-cache" : "no-store",
    tags,
  });
  return data.cart;
}

export async function createCart(): Promise<Cart> {
  const data = await shopifyFetch<{ cartCreate: { cart: Cart; userErrors: UserError[] } }>({
    query: CART_CREATE_MUTATION,
    variables: { input: {} },
    cache: "no-store",
  });
  throwOnUserErrors(data.cartCreate.userErrors);
  return data.cartCreate.cart;
}

export async function addCartLines(
  cartId: string,
  lines: { merchandiseId: string; quantity: number }[],
): Promise<Cart> {
  const data = await shopifyFetch<{ cartLinesAdd: { cart: Cart; userErrors: UserError[] } }>({
    query: CART_LINES_ADD_MUTATION,
    variables: { cartId, lines },
    cache: "no-store",
  });
  throwOnUserErrors(data.cartLinesAdd.userErrors);
  return data.cartLinesAdd.cart;
}

export async function updateCartLines(cartId: string, lines: { id: string; quantity: number }[]): Promise<Cart> {
  const data = await shopifyFetch<{ cartLinesUpdate: { cart: Cart; userErrors: UserError[] } }>({
    query: CART_LINES_UPDATE_MUTATION,
    variables: { cartId, lines },
    cache: "no-store",
  });
  throwOnUserErrors(data.cartLinesUpdate.userErrors);
  return data.cartLinesUpdate.cart;
}

export async function removeCartLines(cartId: string, lineIds: string[]): Promise<Cart> {
  const data = await shopifyFetch<{ cartLinesRemove: { cart: Cart; userErrors: UserError[] } }>({
    query: CART_LINES_REMOVE_MUTATION,
    variables: { cartId, lineIds },
    cache: "no-store",
  });
  throwOnUserErrors(data.cartLinesRemove.userErrors);
  return data.cartLinesRemove.cart;
}

interface CustomerUserError {
  field: string[] | null;
  message: string;
  code: string;
}

export async function createCustomer(
  email: string,
  password: string,
  firstName?: string,
  lastName?: string,
): Promise<Customer> {
  const data = await shopifyFetch<{
    customerCreate: { customer: Customer | null; customerUserErrors: CustomerUserError[] };
  }>({
    query: CUSTOMER_CREATE_MUTATION,
    variables: { input: { email, password, firstName, lastName } },
    cache: "no-store",
  });
  if (data.customerCreate.customerUserErrors.length > 0) {
    throw new Error(data.customerCreate.customerUserErrors[0].message);
  }
  return data.customerCreate.customer!;
}

export async function createCustomerAccessToken(email: string, password: string): Promise<CustomerAccessToken> {
  const data = await shopifyFetch<{
    customerAccessTokenCreate: {
      customerAccessToken: CustomerAccessToken | null;
      customerUserErrors: CustomerUserError[];
    };
  }>({
    query: CUSTOMER_ACCESS_TOKEN_CREATE_MUTATION,
    variables: { input: { email, password } },
    cache: "no-store",
  });
  if (data.customerAccessTokenCreate.customerUserErrors.length > 0) {
    throw new Error(data.customerAccessTokenCreate.customerUserErrors[0].message);
  }
  return data.customerAccessTokenCreate.customerAccessToken!;
}

export async function deleteCustomerAccessToken(token: string): Promise<void> {
  await shopifyFetch<unknown>({
    query: CUSTOMER_ACCESS_TOKEN_DELETE_MUTATION,
    variables: { customerAccessToken: token },
    cache: "no-store",
  });
}

export async function getCustomer(accessToken: string): Promise<Customer | null> {
  const data = await shopifyFetch<{ customer: Customer | null }>({
    query: GET_CUSTOMER_QUERY,
    variables: { token: accessToken },
    cache: "no-store",
  });
  return data.customer;
}

export async function getCustomerOrders(accessToken: string, first = 10): Promise<Order[]> {
  const data = await shopifyFetch<{ customer: { orders: { nodes: Order[] } } | null }>({
    query: GET_CUSTOMER_ORDERS_QUERY,
    variables: { token: accessToken, first },
    cache: "no-store",
  });
  return data.customer?.orders.nodes ?? [];
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
