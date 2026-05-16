interface MoneyV2 {
  amount: string
  currencyCode: string
}

interface ProductImage {
  url: string
  altText: string | null
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
}

export interface Cart {
  id: string
  checkoutUrl: string
}
