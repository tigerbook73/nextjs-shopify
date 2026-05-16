import { PRODUCT_CARD_FRAGMENT } from './product'

export const SEARCH_QUERY = /* GraphQL */ `
  query Search($query: String!, $first: Int!) {
    search(query: $query, first: $first, types: [PRODUCT]) {
      totalCount
      nodes {
        __typename
        ... on Product {
          ...ProductCard
        }
      }
    }
  }
  ${PRODUCT_CARD_FRAGMENT}
`
