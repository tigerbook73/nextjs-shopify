# Phase 3 进度记录 — 搜索与 Streaming

## 状态：🚧 进行中

## 交付物清单

### 数据层
- [ ] `src/lib/shopify/queries/search.ts` — SEARCH_QUERY
- [ ] `src/lib/shopify/types.ts` — SearchResultItem / SearchResult 类型
- [ ] `src/lib/shopify/client.ts` — searchProducts() 函数

### 组件层
- [ ] `src/components/layout/Header.tsx` — 全局 Header
- [ ] `src/components/search/SearchBox.tsx` — 搜索框（Client Component）
- [ ] `src/components/search/SearchResults.tsx` — 结果列表（async RSC）
- [ ] `src/components/search/SearchResultsSkeleton.tsx` — 骨架屏

### 路由层
- [ ] `src/app/layout.tsx` — 插入 Header
- [ ] `src/app/search/page.tsx` — 搜索页（Suspense 边界）
- [ ] `src/app/search/loading.tsx` — 路由级 loading

## 验收标准

- [ ] Header 在所有页面显示，导航链接可用
- [ ] 搜索框提交后跳转 `/search?q=xxx`，关键词回显
- [ ] 搜索结果页先显示骨架屏，再流式替换为真实内容
- [ ] 空查询显示引导文案，无结果显示提示
- [ ] `pnpm lint` 无报错
- [ ] TypeScript 编译无错误

## 已知约束

- 搜索结果限 20 条，无分页（Phase 3 范围）
- 仅支持 Product + Collection，不包含 Article
- 无预测搜索（predictiveSearch 留作后续扩展）
