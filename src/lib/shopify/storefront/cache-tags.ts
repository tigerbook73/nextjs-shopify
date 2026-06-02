export const TAGS = {
  products: "products",
  product: (handle: string) => `product-${handle}`,
  collections: "collections",
  collection: (handle: string) => `collection-${handle}`,
  cart: "cart",
} as const;
