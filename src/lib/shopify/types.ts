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

export interface Collection {
  id: string
  title: string
  handle: string
}

export interface Cart {
  id: string
  checkoutUrl: string
}
