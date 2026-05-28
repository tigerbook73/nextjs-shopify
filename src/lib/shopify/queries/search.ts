import { PRODUCT_CARD_FRAGMENT } from "./product";

export const SEARCH_QUERY = /* GraphQL */ `
  query Search($query: String!, $first: Int, $last: Int, $after: String, $before: String) {
    search(query: $query, first: $first, last: $last, after: $after, before: $before, types: [PRODUCT]) {
      totalCount
      nodes {
        __typename
        ... on Product {
          ...ProductCard
        }
      }
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
    }
  }
  ${PRODUCT_CARD_FRAGMENT}
`;
