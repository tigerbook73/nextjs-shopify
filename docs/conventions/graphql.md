# GraphQL 规范

## 客户端入口

所有 Shopify Storefront API 调用必须通过统一入口函数：

```typescript
// src/lib/shopify/client.ts
export async function shopifyFetch<T>({
  query,
  variables,
  cache,
  tags,
}: {
  query: string
  variables?: Record<string, unknown>
  cache?: RequestCache
  tags?: string[]
}): Promise<T>
```

禁止在组件或页面中直接调用 `fetch` 访问 Shopify API。

## 查询和变更文件组织

```
src/lib/shopify/
├── queries/
│   ├── product.ts      ← 商品相关查询（导出 PRODUCT_CARD_FRAGMENT）
│   ├── collection.ts   ← 系列相关查询（引用 PRODUCT_CARD_FRAGMENT）
│   ├── shop.ts         ← 店铺信息查询
│   ├── cart.ts         ← 购物车查询
│   ├── customer.ts     ← 账户相关查询
│   └── search.ts       ← 搜索查询
└── mutations/
    ├── cart.ts         ← CartCreate, CartLinesAdd, CartLinesUpdate, CartLinesRemove
    └── customer.ts     ← CustomerCreate, CustomerAccessTokenCreate
```

每个文件导出字符串常量，不导出函数。

## 命名规范

| 类型 | 格式 | 示例 |
| ---- | ---- | ---- |
| Query 常量 | `GET_<RESOURCE>_QUERY` | `GET_PRODUCT_QUERY`、`GET_PRODUCTS_QUERY` |
| Mutation 常量 | `<ACTION>_<RESOURCE>_MUTATION` | `CART_CREATE_MUTATION`、`CART_LINES_ADD_MUTATION` |
| Fragment 常量 | `<TYPE>_<CONTEXT>_FRAGMENT` | `PRODUCT_CARD_FRAGMENT`、`PRODUCT_DETAIL_FRAGMENT` |
| GraphQL 操作名 | PascalCase | `query GetProduct`、`mutation CartCreate` |

## Fragment 规范

Fragment 的放置规则：

- **仅单个查询文件使用**：定义在该文件顶部，无需导出
- **多个查询文件共享**：定义在最主要的文件中并 `export`，其他文件 `import` 后拼接

```typescript
// src/lib/shopify/queries/product.ts
// PRODUCT_CARD_FRAGMENT 被 product.ts 和 collection.ts 共用，因此导出
export const PRODUCT_CARD_FRAGMENT = /* GraphQL */ `
  fragment ProductCard on Product {
    id
    title
    handle
    priceRange {
      minVariantPrice { amount currencyCode }
    }
    featuredImage { url altText }
  }
`

// src/lib/shopify/queries/collection.ts
import { PRODUCT_CARD_FRAGMENT } from './product'

export const GET_COLLECTION_BY_HANDLE_QUERY = /* GraphQL */ `
  query GetCollectionByHandle($handle: String!, $first: Int!, $after: String) {
    collection(handle: $handle) {
      ...
      products(first: $first, after: $after) {
        nodes { ...ProductCard }
        pageInfo { hasNextPage endCursor }
      }
    }
  }
  ${PRODUCT_CARD_FRAGMENT}
`
```

## 错误处理规范

GraphQL 永远返回 HTTP 200，业务错误通过响应体传递，必须主动检查：

```typescript
// ✅ 正确的错误处理
const result = await shopifyFetch<CartCreateMutation>({
  query: CART_CREATE_MUTATION,
  variables: { input },
})

if (result.errors) {
  throw new Error(result.errors[0].message)
}

if (result.data.cartCreate.userErrors.length > 0) {
  return { success: false, error: result.data.cartCreate.userErrors[0].message }
}

return { success: true, cart: result.data.cartCreate.cart }
```

## 分页规范

使用 Shopify Connection 分页模式（Cursor-based），不用 offset 分页：

```typescript
query GetProducts($first: Int!, $after: String) {
  products(first: $first, after: $after) {
    nodes { ... }
    pageInfo {
      hasNextPage
      endCursor
    }
  }
}
```

- 用 `nodes` 代替 `edges { node }`（更简洁）
- 每页默认条数：商品列表 `20`，系列商品页 `12`
- 分页参数通过 `searchParams.after`（URL 参数）传递，完全在 RSC 中处理

## 缓存标签规范

为 Shopify 查询添加缓存标签，支持按需失效（Phase 5 起生效）：

| 标签 | 对应数据 |
| ---- | -------- |
| `'products'` | 所有商品数据 |
| `'collections'` | 所有系列数据 |
| `'cart'` | 购物车数据（通常不缓存） |
| `'customers'` | 用户数据（不缓存） |
| `` `product-${handle}` `` | 单个商品 |
| `` `collection-${handle}` `` | 单个系列 |
