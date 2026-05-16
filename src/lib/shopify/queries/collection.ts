import { PRODUCT_CARD_FRAGMENT } from "./product";

export const GET_COLLECTIONS_QUERY = /* GraphQL */ `
  query GetCollections($first: Int!) {
    collections(first: $first) {
      nodes {
        id
        title
        handle
        description
        image {
          url
          altText
        }
        seo {
          title
          description
        }
      }
    }
  }
`;

export const GET_COLLECTION_BY_HANDLE_QUERY = /* GraphQL */ `
  query GetCollectionByHandle($handle: String!, $first: Int!, $after: String) {
    collection(handle: $handle) {
      id
      title
      handle
      description
      image {
        url
        altText
      }
      seo {
        title
        description
      }
      products(first: $first, after: $after) {
        nodes {
          ...ProductCard
        }
        pageInfo {
          hasNextPage
          endCursor
        }
      }
    }
  }
  ${PRODUCT_CARD_FRAGMENT}
`;

export const GET_COLLECTION_HANDLES_QUERY = /* GraphQL */ `
  query GetCollectionHandles($first: Int!) {
    collections(first: $first) {
      nodes {
        handle
      }
    }
  }
`;
