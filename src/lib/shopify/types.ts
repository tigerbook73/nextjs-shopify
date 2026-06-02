import type * as StorefrontTypes from "@/types/generated/storefront/storefront.types";
import type {
  GetShopQuery,
  GetProductsQuery,
  GetProductByHandleQuery,
  GetCollectionsQuery,
  GetCollectionByHandleQuery,
  GetCartQuery,
  SearchQuery,
  ProductCardFragment,
} from "@/types/generated/storefront/storefront.generated";

export type MoneyV2 = Pick<StorefrontTypes.MoneyV2, "amount" | "currencyCode">;
export type SelectedOption = Pick<StorefrontTypes.SelectedOption, "name" | "value">;
export type PageInfo = Pick<StorefrontTypes.PageInfo, "hasNextPage" | "hasPreviousPage" | "startCursor" | "endCursor">;

export type Shop = GetShopQuery["shop"];

export type Product = ProductCardFragment;
export type ProductImage = NonNullable<ProductCardFragment["featuredImage"]>;
export type ProductVariant = NonNullable<GetProductByHandleQuery["product"]>["variants"]["nodes"][number];
export type ProductDetail = NonNullable<GetProductByHandleQuery["product"]>;
export type ProductConnection = GetProductsQuery["products"];

export type Collection = GetCollectionsQuery["collections"]["nodes"][number];
export type CollectionDetail = NonNullable<GetCollectionByHandleQuery["collection"]>;

export type Cart = NonNullable<GetCartQuery["cart"]>;
export type CartLine = Cart["lines"]["nodes"][number];
export type CartLineMerchandise = CartLine["merchandise"];
export type CartCost = Cart["cost"];

export type SearchResultItem = Extract<SearchQuery["search"]["nodes"][number], { __typename: "Product" }>;
export type SearchResult = Omit<SearchQuery["search"], "nodes"> & { nodes: SearchResultItem[] };

export type CartActionResult = { success: true; cart?: Cart | null } | { success: false; error: string };
