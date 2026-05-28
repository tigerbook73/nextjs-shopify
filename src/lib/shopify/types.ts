export interface MoneyV2 {
  amount: string;
  currencyCode: string;
}

export interface ProductImage {
  url: string;
  altText: string | null;
}

interface SEO {
  title: string | null;
  description: string | null;
}

export interface Shop {
  name: string;
  description: string | null;
}

export interface Product {
  id: string;
  title: string;
  handle: string;
  availableForSale: boolean;
  priceRange: {
    minVariantPrice: MoneyV2;
  };
  compareAtPriceRange: {
    minVariantPrice: MoneyV2;
  };
  featuredImage: ProductImage | null;
}

export interface SelectedOption {
  name: string;
  value: string;
}

export interface ProductVariant {
  id: string;
  title: string;
  availableForSale: boolean;
  selectedOptions: SelectedOption[];
  price: MoneyV2;
  compareAtPrice: MoneyV2 | null;
}

export interface ProductDetail extends Product {
  description: string;
  descriptionHtml: string;
  seo: SEO;
  images: { nodes: ProductImage[] };
  variants: { nodes: ProductVariant[] };
  options: {
    name: string;
    optionValues: { name: string }[];
  }[];
  collections: { nodes: { handle: string }[] };
}

export interface Collection {
  id: string;
  title: string;
  handle: string;
  description: string;
  image: ProductImage | null;
  seo: SEO;
}

export interface CollectionDetail extends Collection {
  products: {
    nodes: Product[];
    pageInfo: {
      hasNextPage: boolean;
      endCursor: string | null;
    };
  };
}

export interface CartLineMerchandise {
  id: string;
  title: string;
  selectedOptions: SelectedOption[];
  price: MoneyV2;
  product: {
    title: string;
    handle: string;
    featuredImage: ProductImage | null;
  };
}

export interface CartLine {
  id: string;
  quantity: number;
  merchandise: CartLineMerchandise;
}

export interface CartCost {
  subtotalAmount: MoneyV2;
  totalTaxAmount: MoneyV2 | null;
  totalAmount: MoneyV2;
}

export interface Cart {
  id: string;
  checkoutUrl: string;
  totalQuantity: number;
  lines: { nodes: CartLine[] };
  cost: CartCost;
}

export type CartActionResult = { success: true; cart?: Cart | null } | { success: false; error: string };

export type SearchResultItem = Product & { __typename: "Product" };

export interface SearchResult {
  totalCount: number;
  nodes: SearchResultItem[];
}

export interface CustomerAccessToken {
  accessToken: string;
  expiresAt: string;
}

export interface OrderLineItem {
  title: string;
  quantity: number;
  variant: {
    image: ProductImage | null;
    price: MoneyV2;
  } | null;
}

export interface Order {
  id: string;
  orderNumber: number;
  processedAt: string;
  financialStatus: string;
  fulfillmentStatus: string;
  currentTotalPrice: MoneyV2;
  lineItems: { nodes: OrderLineItem[] };
}

export interface Customer {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  displayName: string;
  orders: { nodes: Order[] };
}

export type CustomerActionResult = { success: true } | { success: false; error: string };
