import { parse } from "graphql";
import type { TypedDocumentNode } from "@graphql-typed-document-node/core";
import type {
  GetCollectionsQuery,
  GetCollectionsQueryVariables,
  GetCollectionByHandleQuery,
  GetCollectionByHandleQueryVariables,
  GetCollectionHandlesQuery,
  GetCollectionHandlesQueryVariables,
} from "@/types/generated/storefront/storefront.generated";
import { PRODUCT_CARD_FRAGMENT } from "./product";

export const GET_COLLECTIONS_QUERY: TypedDocumentNode<GetCollectionsQuery, GetCollectionsQueryVariables> = parse(
  /* GraphQL */ `
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
  `,
);

export const GET_COLLECTION_BY_HANDLE_QUERY: TypedDocumentNode<
  GetCollectionByHandleQuery,
  GetCollectionByHandleQueryVariables
> = parse(/* GraphQL */ `
  query GetCollectionByHandle(
    $handle: String!
    $first: Int
    $last: Int
    $after: String
    $before: String
    $sortKey: ProductCollectionSortKeys
    $reverse: Boolean
    $filters: [ProductFilter!]
  ) {
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
      products(
        first: $first
        last: $last
        after: $after
        before: $before
        sortKey: $sortKey
        reverse: $reverse
        filters: $filters
      ) {
        nodes {
          ...ProductCard
        }
        pageInfo {
          hasNextPage
          hasPreviousPage
          startCursor
          endCursor
        }
      }
    }
  }
  ${PRODUCT_CARD_FRAGMENT}
`);

export const GET_COLLECTION_HANDLES_QUERY: TypedDocumentNode<
  GetCollectionHandlesQuery,
  GetCollectionHandlesQueryVariables
> = parse(/* GraphQL */ `
  query GetCollectionHandles($first: Int!) {
    collections(first: $first) {
      nodes {
        handle
      }
    }
  }
`);
