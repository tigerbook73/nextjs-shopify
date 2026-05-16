import { PRODUCT_CARD_FRAGMENT } from './product'

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
`

/*
 * GraphQL Alias 说明（Phase 2 学习点）：
 * 当需要在同一查询中多次调用同名字段时，可以用 Alias 重命名：
 *
 * query {
 *   featured: collection(handle: "featured") { title }
 *   sale: collection(handle: "sale") { title }
 * }
 *
 * 本查询暂不使用 Alias，但这是 Phase 2 引入的新概念。
 */

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
`

export const GET_COLLECTION_HANDLES_QUERY = /* GraphQL */ `
  query GetCollectionHandles($first: Int!) {
    collections(first: $first) {
      nodes {
        handle
      }
    }
  }
`
