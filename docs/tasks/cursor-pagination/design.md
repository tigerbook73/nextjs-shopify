# Design: cursor-pagination

## Overview

分 6 步实现三个页面的统一游标分页：

1. 数据层（types + GraphQL + client）
2. `PaginationBar` 组件
3. All Products 页面接入
4. Search 页面接入
5. Collection 页面重构
6. E2E 测试

步骤 1 为 intermediate（修改函数返回值，会短暂破坏 products 页面 build），步骤 2–6 均为 final。

---

## Step 1: 数据层 — types / GraphQL / client

**Step Type**: `intermediate`（步骤 3–5 完成后 build 恢复正常）

### 目标

扩展类型定义、GraphQL 查询、client 函数，支持双向游标分页。

### 关键改动

**`src/lib/shopify/types.ts`**

- 新增共用 `PageInfo` interface：`{ hasNextPage: boolean; hasPreviousPage: boolean; startCursor: string | null; endCursor: string | null }`
- `CollectionDetail.products.pageInfo` 改用 `PageInfo`（原只有 `hasNextPage` + `endCursor`）
- `SearchResult` 新增 `pageInfo: PageInfo`
- 新增 `ProductConnection` interface：`{ nodes: Product[]; pageInfo: PageInfo }`

**`src/lib/shopify/queries/product.ts`**

- `GET_PRODUCTS_QUERY` 加 `$first: Int!`、`$after: String`、`$before: String` 变量
- `products(first: $first, after: $after, before: $before)` 并补全 `pageInfo { hasNextPage hasPreviousPage startCursor endCursor }`
- 结构改为 `{ nodes { ...ProductCard } pageInfo { ... } }`

**`src/lib/shopify/queries/search.ts`**

- `SEARCH_QUERY` 加 `$after: String`、`$before: String` 变量，补全 `pageInfo`

**`src/lib/shopify/queries/collection.ts`**

- `GET_COLLECTION_BY_HANDLE_QUERY` 加 `$before: String`，`pageInfo` 补全 `hasPreviousPage` + `startCursor`

**`src/lib/shopify/client.ts`**

- `getProducts(first = 18, after?: string, before?: string): Promise<ProductConnection>`
  — 返回 `{ nodes, pageInfo }`（原返回 `Product[]`，此处为 breaking change）
- `getProductHandles` 保持独立，不受影响（仍用 `first: 250`，不传 `after/before`）
- `searchProducts(query, first = 18, after?: string, before?: string): Promise<SearchResult>`
  — 返回值新增 `pageInfo`
- `getCollectionByHandle(handle, first = 18, after?, before?, ...)` 补充 `before?` 参数

### Auto Verification

- `(auto)` `pnpm typecheck`

---

## Step 2: PaginationBar 组件

**Step Type**: `final`（测试委托至 Step 6 E2E）

### 目标

新建可复用的 `<PaginationBar>` 组件，三个页面共用。

### 文件

`src/components/ui/PaginationBar.tsx`

### Props

```ts
interface PaginationBarProps {
  pageInfo: PageInfo;
  baseUrl: string; // 例如 "/products"、"/search"、"/collections/t-shirts"
  searchParams: Record<string, string>; // 当前所有 URL 参数（不含游标）
}
```

### 行为

- 上一页链接：`baseUrl + queryString({ ...searchParams, before: startCursor })`，仅 `hasPreviousPage` 时渲染
- 下一页链接：`baseUrl + queryString({ ...searchParams, after: endCursor })`，仅 `hasNextPage` 时渲染
- 构建链接时移除 `after`/`before`（传入的 `searchParams` 已剥离游标），再追加新游标
- 两个按钮都不显示时，组件返回 `null`
- 样式与现有 Collection 页面分页按钮一致（`rounded-md border border-gray-300 ...`）

### Auto Verification

- `(auto)` `pnpm typecheck`

---

## Step 3: All Products 页面接入

**Step Type**: `final`（测试委托至 Step 6 E2E）

### 目标

`/products` 接入数据层和 `PaginationBar`，修复 Step 1 引入的 build break。

### 关键改动

**`src/app/products/page.tsx`**

- `searchParams` 类型加 `after?: string; before?: string`
- 读取 `after`、`before`，传入 `getProducts(18, after, before)`
- 从返回的 `{ nodes, pageInfo }` 解构
- 页面底部渲染 `<PaginationBar pageInfo={pageInfo} baseUrl="/products" searchParams={{}} />`

**`src/app/products/loading.tsx`**

- 无需改动（骨架屏不含分页区域）

### Auto Verification

- `(auto)` `pnpm build`（验证 Step 1 break 已修复）
- `(auto)` `pnpm typecheck`

---

## Step 4: Search 页面接入

**Step Type**: `final`（测试委托至 Step 6 E2E）

### 目标

`/search` 接入游标分页，搜索词在翻页时保留。

### 关键改动

**`src/app/search/page.tsx`**

- `searchParams` 类型加 `after?: string; before?: string`
- 解构 `after`、`before`，传入 `<SearchResults query={query} after={after} before={before} />`

**`src/components/search/SearchResults.tsx`**

- 新增 props：`after?: string`、`before?: string`
- 调用 `searchProducts(query, 18, after, before)`
- 底部渲染 `<PaginationBar pageInfo={result.pageInfo} baseUrl="/search" searchParams={{ q: query }} />`

### Auto Verification

- `(auto)` `pnpm typecheck`

---

## Step 5: Collection 页面重构

**Step Type**: `final`（测试委托至 Step 6 E2E）

### 目标

用 `<PaginationBar>` 替换现有内联分页，支持真正的上一页，每页改为 18 条。

### 关键改动

**`src/app/collections/[handle]/page.tsx`**

- `searchParams` 类型加 `before?: string`
- 读取 `before`，传入 `getCollectionByHandle(handle, 18, after, before, ...)`
- 删除现有 `hasPrevPage`、`hasNextPage`、`endCursor` 内联逻辑和分页 JSX
- 渲染 `<PaginationBar pageInfo={products.pageInfo} baseUrl={"/collections/" + handle} searchParams={存量非游标参数} />`
  - `searchParams` 传入：`sort` 和 `available` 参数（若存在）

### Auto Verification

- `(auto)` `pnpm typecheck`

---

## Step 6: E2E 测试

**Step Type**: `final`

### 目标

新建 `tests/e2e/pagination.spec.ts`，覆盖 requirements 中全部 5 个测试场景。

### 测试场景

1. **All Products 下一页**：访问 `/products`，若存在「Next page」按钮则点击，断言 URL 含 `after=`，断言商品列表更新
2. **All Products 上一页**：翻到第二页后点击「Prev page」，断言 URL 不含游标，断言回到第一页
3. **Search 翻页保留搜索词**：搜索有足够结果的词，点击「Next page」，断言 URL 同时含 `q=` 和 `after=`
4. **Collection 翻页保留筛选参数**：进入有足够商品的 Collection，选择排序后点击「Next page」，断言 URL 含 `after=` 且 `sort=` 保留
5. **边界状态**：
   - 第一页不显示「Prev page」按钮
   - 商品总数 ≤ 18 时不显示任何分页按钮（用商品数量少的 Collection 验证）

### 注意

- 测试依赖真实 Shopify store 数据（与现有 E2E 一致，使用 `playwright.config.ts` 中配置的 baseURL）
- 若某页面商品数 ≤ 18，跳过对应翻页测试（用 `test.skip` + 条件判断）

### Auto Verification

- `(auto)` `pnpm test:e2e -- --grep "Pagination"`
- `(auto)` `pnpm typecheck`

---

## Task Acceptance

对应 requirements.md 中 8 条验收标准：

1. `(manual)` `/products` 点击「下一页」URL 变为 `?after=xxx`，商品正确翻页，每页 18 条
2. `(manual)` `/products?after=xxx` 刷新后仍显示正确页；点击「上一页」可正确返回前一页
3. `(auto)` `pnpm test:e2e -- --grep "边界状态"` — 第一页无「上一页」；商品数 ≤ 18 时无分页按钮
4. `(manual)` `/search?q=shirt` 翻页后 URL 含 `?q=shirt&after=xxx`，搜索词保留
5. `(manual)` `/collections/[handle]` 分页正常；筛选/排序参数翻页后保留；每页 18 条
6. `(auto)` `pnpm build` — `generateStaticParams` 正常完成（`getProductHandles` 不受影响）
7. `(auto)` `pnpm lint`
8. `(auto)` `pnpm test:e2e -- --grep "Pagination"`
