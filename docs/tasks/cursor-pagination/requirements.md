# Requirements: cursor-pagination

## Goal

为 All Products（`/products`）、Search（`/search`）、Collection 详情（`/collections/[handle]`）
三个页面统一添加上一页 / 下一页分页功能，基于 Shopify Storefront API 的 cursor-based pagination。

## Background and Motivation

- All Products 和 Search 页面硬编码 `first: 20`，完全没有分页控件
- Collection 页面虽有部分实现，但「上一页」只能回到起点（非真正的上一页），且每页 12 条与目标不一致
- 三个页面共用同一套 `<PaginationBar>` 组件，确保 UI 和行为一致

## Functional Requirements

1. **All Products 页面** (`/products`)
   - 每页展示 18 条商品
   - 页面底部显示「上一页 / 下一页」分页按钮
   - 翻页通过 URL search param 传递游标：`?after=<cursor>`（下一页）或 `?before=<cursor>`（上一页）
   - `hasNextPage` 为 false 时隐藏「下一页」；`hasPreviousPage` 为 false 时隐藏「上一页」

2. **Search 页面** (`/search`)
   - 同上，每页 18 条，底部显示上一页 / 下一页
   - 游标参数与搜索词参数共存：`?q=shirt&after=<cursor>`
   - 翻页时保留当前搜索词

3. **Collection 详情页面** (`/collections/[handle]`)
   - 每页改为 18 条（原为 12）
   - 重构现有分页为标准上一页 / 下一页（原「上一页」仅返回起点，需改为真正的前一页）
   - 游标参数与筛选/排序参数共存：`?after=<cursor>&sort=price-asc`

4. **PaginationBar 组件**
   - 新建可复用组件，接收 `pageInfo`、当前 URL 参数（保留非游标参数），输出带正确链接的上一页 / 下一页按钮
   - 三个页面共用同一组件

5. **GraphQL 查询**
   - `GET_PRODUCTS_QUERY` 加入 `$after: String`、`$before: String` 变量和完整 `pageInfo` 字段
   - `SEARCH_QUERY` 同上
   - `GET_COLLECTION_BY_HANDLE_QUERY` 补充 `hasPreviousPage` 和 `startCursor`

6. **Client 函数**
   - `getProducts(first?, after?, before?)` 返回 `{ nodes, pageInfo }`
   - `searchProducts(query, first?, after?, before?)` 返回 `{ nodes, pageInfo, totalCount }`
   - `getCollectionByHandle` 补充 `before?` 参数，返回完整 `pageInfo`

## Non-Functional Requirements

- 分页状态保存在 URL，支持浏览器前进 / 后退、页面刷新、分享链接
- 翻页为完整 Server Component 渲染（无客户端状态）
- `getProductHandles`（用于 `generateStaticParams`）继续使用独立的 `first: 250` 调用，不受影响
- Collection 页面现有的筛选 / 排序 URL 参数在翻页时完整保留

## Testing Requirements

使用 Playwright（`pnpm test:e2e`）编写 E2E 自动化测试，新增 `tests/e2e/pagination.spec.ts`，覆盖以下场景：

1. **All Products 翻页**：点击「下一页」后 URL 含 `?after=`，页面商品更新
2. **All Products 上一页**：翻到第二页后点击「上一页」，URL 回到无游标状态，商品恢复第一页
3. **Search 翻页**：搜索有结果的关键词，点击「下一页」后 URL 同时含 `?q=` 和 `?after=`
4. **Collection 翻页**：进入有足够商品的 Collection，点击「下一页」后 URL 含 `?after=`；已有筛选参数时翻页后参数保留
5. **边界状态**：第一页不显示「上一页」按钮；商品总数 ≤ 18 时不显示任何分页按钮

## Out of Scope

- 数字页码导航（1、2、3…）
- 无限滚动 / Load More
- 每页数量选择器
- 分页专用骨架屏（现有骨架屏已足够）

## Acceptance Criteria

1. `/products` 页面底部显示分页按钮；点击「下一页」URL 变为 `?after=xxx`，商品正确翻页，每页 18 条
2. `/products?after=xxx` 刷新后仍显示正确页；点击「上一页」可正确返回前一页
3. 最后一页隐藏「下一页」按钮；第一页隐藏「上一页」按钮（三个页面均如此）
4. `/search?q=shirt` 搜索后底部显示分页；点击「下一页」URL 变为 `?q=shirt&after=xxx`，搜索词保留
5. `/collections/[handle]` 分页正常；翻页时 `sort`、`available` 等参数保留；每页 18 条
6. `getProductHandles` 仍正常工作（`generateStaticParams` 不受影响）
7. `pnpm lint` 通过
8. `pnpm test:e2e` 中 `pagination.spec.ts` 全部通过
