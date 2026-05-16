interface MoneyV2 {
  amount: string
  currencyCode: string
}

interface ProductImage {
  url: string
  altText: string | null
}

interface SEO {
  title: string | null
  description: string | null
}

export interface Shop {
  name: string
  description: string | null
}

export interface Product {
  id: string
  title: string
  handle: string
  priceRange: {
    minVariantPrice: MoneyV2
  }
  featuredImage: ProductImage | null
}

interface SelectedOption {
  name: string
  value: string
}

export interface ProductVariant {
  id: string
  title: string
  availableForSale: boolean
  selectedOptions: SelectedOption[]
  price: MoneyV2
  compareAtPrice: MoneyV2 | null
}

export interface ProductDetail extends Product {
  description: string
  descriptionHtml: string
  seo: SEO
  images: { nodes: ProductImage[] }
  variants: { nodes: ProductVariant[] }
  options: {
    name: string
    values: string[]
  }[]
}

export interface Collection {
  id: string
  title: string
  handle: string
  description: string
  image: ProductImage | null
  seo: SEO
}

export interface CollectionDetail extends Collection {
  products: {
    nodes: Product[]
    pageInfo: {
      hasNextPage: boolean
      endCursor: string | null
    }
  }
}

export interface Cart {
  id: string
  checkoutUrl: string
}

export type SearchResultItem = Product & { __typename: 'Product' }

export interface SearchResult {
  totalCount: number
  nodes: SearchResultItem[]
}
