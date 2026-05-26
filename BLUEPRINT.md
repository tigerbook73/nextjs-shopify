# Next.js × Shopify 学习项目蓝图

> 定位：学习型 + 产品化实践｜循序渐进｜每阶段独立可运行

---

## 项目概览

| 项目          | 说明                                                                      |
| ------------- | ------------------------------------------------------------------------- |
| 技术栈        | Next.js App Router · TypeScript · Tailwind CSS · shadcn/ui                |
| Shopify 接入  | Storefront API（GraphQL）                                                 |
| Checkout 策略 | Cart 完成后跳转 Shopify 原生结账页，不自建 Checkout UI                    |
| 目标          | 覆盖 Next.js 高级 SSR 能力 + 系统学习 GraphQL + 建立完整 Shopify 产品认知 |

---

## 阶段总览

```
Phase -1 → AI 工程脚手架（规范体系 + 多工具配置 + Git 初始化）✅ 已完成
Phase 0 → 基础搭建
Phase 1 → 商品浏览（RSC + 动态路由）
Phase 2 → Collection 导航（SEO + Metadata）
Phase 3 → 搜索与 Streaming
Phase 4 → 购物车（Server Actions + Session）
Phase 5 → 缓存策略（Data Cache + Webhook）
Phase 6 → 用户账户（Customer Auth + Middleware）
Phase 7 → 性能与收尾（Edge + 优化）
```

---

## GraphQL 渐进学习路径

> Shopify Storefront API 是纯 GraphQL API，本项目每个阶段都会自然引入新的 GraphQL 概念，无需单独学习 GraphQL 再上手。

| 阶段    | GraphQL 新概念                                     | 具体体现                                                                               |
| ------- | -------------------------------------------------- | -------------------------------------------------------------------------------------- |
| Phase 0 | Query · Schema · Type · Field · 变量（Variables）  | 写第一个 `query { shop { name } }`                                                     |
| Phase 1 | Connection 分页模式 · Cursor · `first/after`       | 商品列表分页，`products(first: 20, after: $cursor)`                                    |
| Phase 2 | Fragments · Alias                                  | 抽取 `ProductCardFragment`，多个查询复用字段                                           |
| Phase 3 | Input Types · 复合过滤 · Union Types               | `search(query: $q, types: [PRODUCT])`                                                  |
| Phase 4 | Mutations · Input Object · Payload 模式 · 错误处理 | `cartCreate` / `cartLinesAdd` + `userErrors`                                           |
| Phase 5 | GraphQL over HTTP 与缓存的关系 · POST vs GET       | 理解为什么 Next.js 需要额外包装 GraphQL 请求来实现缓存                                 |
| Phase 6 | 带鉴权 Header 的请求 · Token 传递                  | Customer API 需要在 Header 中携带 `X-Shopify-Storefront-Access-Token` + Customer Token |
| Phase 7 | （可选）Persisted Queries · 查询复杂度分析         | Shopify 的 query cost 机制，防止过度查询                                               |

### GraphQL 工具推荐

- **Shopify GraphiQL App**：在 Shopify 后台直接测试 Storefront API，有 schema 自动补全
- **VS Code 插件**：`GraphQL: Language Feature Support`，本地 `.graphql` 文件高亮与补全
- **类型策略**：Phase 0–2 手写 TypeScript 类型（建立肌肉记忆），Phase 5+ 按需引入 `@shopify/storefront-api-types`

---

## Phase 0 — 基础搭建

### 目标

搭建可运行的项目骨架，验证 Shopify Storefront API 连通性。

### 交付物

- Next.js App Router + TypeScript 项目初始化
- Tailwind CSS + shadcn/ui 集成
- Shopify Storefront API 客户端封装（基于 fetch + GraphQL）
- 基础 TypeScript 类型定义（Product、Collection、Cart 骨架）
- 首页展示一条 Shopify 商品数据（验证 API 通）
- `.env.local` 变量规范文档

### Next.js 能力

| 能力                                | 用途                       |
| ----------------------------------- | -------------------------- |
| App Router 目录结构                 | 建立 `app/` 布局与路由骨架 |
| 环境变量（`NEXT_PUBLIC_` / 服务端） | 安全存放 Shopify API Key   |
| Root Layout + Global CSS            | Tailwind 全局注入          |

### Shopify 知识点

- **Storefront API**：面向前端的公开 GraphQL API，与 Admin API 区别
- API Key 权限范围（`unauthenticated_read_product_listings` 等）

### GraphQL 知识点（Phase 0）

- **Query**：最基础的读操作，`query { shop { name } }`
- **Schema & Type System**：GraphQL 的所有字段都有类型约束，IDE 可静态校验
- **Variables**：将参数从 query 中抽离，`query GetProduct($handle: String!) { ... }`
- **客户端封装模式**：统一的 `shopifyFetch<T>(query, variables)` 函数，所有后续 API 调用复用此入口

### 学习价值评估

> Storefront API 是本项目所有 Shopify 能力的入口，搭好这一层后续所有阶段都可以复用。GraphQL 的类型系统与 TypeScript 天然互补，在这里打好基础收益持续整个项目。

---

## Phase 1 — 商品浏览

### 目标

实现商品列表页 + 商品详情页，掌握 RSC 数据获取与动态路由。

### 交付物

- `/products` — 商品列表（RSC，服务端直接 fetch）
- `/products/[handle]` — 商品详情页（动态路由 + 变体选择）
- `generateStaticParams` 预渲染已知商品
- `next/image` 展示商品主图
- 商品 Variant 选择（颜色 / 尺寸下拉，纯 UI 交互）

### Next.js 能力

| 能力                   | 用途                       | 为什么用                           |
| ---------------------- | -------------------------- | ---------------------------------- |
| React Server Component | 服务端直接调用 Shopify API | 无需客户端 fetch + 零 bundle 体积  |
| 动态路由 `[handle]`    | 每个商品独立 URL           | 利于 SEO 与直接分享                |
| `generateStaticParams` | 构建时预生成商品页         | 热门商品首屏秒开，ISR 兜底冷门商品 |
| `next/image`           | 自动 WebP 转换 + 懒加载    | Shopify CDN 图片体积优化           |

### Shopify 知识点

- **Product 体系**：`Product → ProductVariant → SelectedOptions`
- `handle`：Shopify 商品的 URL-friendly 唯一标识符
- `priceRange`、`compareAtPrice`：价格字段结构
- `images.nodes`：商品图片列表

### GraphQL 知识点（Phase 1）

- **Connection 分页模式**：Shopify 所有列表字段都是 Connection，`products { edges { node { ... } } pageInfo { hasNextPage endCursor } }`
- **Cursor-based 分页**：`first: 20, after: $cursor`，比 offset 分页更适合实时数据
- **`nodes` 简写**：新版 API 支持 `products { nodes { ... } }` 省略 `edges.node` 层级

### 注意

> `generateStaticParams` 只预生成"热门/已知"商品，`fallback: 'blocking'` 行为由 Next.js ISR 接管，适合商品数量大的场景。

---

## Phase 2 — Collection 导航与 SEO

### 目标

实现 Collection 分类体系，并为全站配置 SEO 元数据。

### 交付物

- `/collections` — 系列列表页
- `/collections/[handle]` — 系列商品页（分页）
- 全站 `generateMetadata`（title / description / og:image）
- 商品详情页 OG 标签（社交分享预览）
- `sitemap.ts` — 自动生成 sitemap
- 导航栏从 Shopify Menu 动态读取（可选）

### Next.js 能力

| 能力                                   | 用途                   | 为什么用                                |
| -------------------------------------- | ---------------------- | --------------------------------------- |
| `generateMetadata`                     | 每页动态注入 meta 标签 | SEO 与社交分享必需，App Router 原生支持 |
| `opengraph-image.tsx`                  | OG 图片动态生成        | 提升社交分享点击率                      |
| `sitemap.ts` Route                     | 输出 XML sitemap       | 帮助搜索引擎索引所有商品和系列页        |
| Parallel Routes / Intercepting（可选） | 弹窗展示商品详情       | 不强制，按兴趣探索                      |

### Shopify 知识点

- **Collection 体系**：手动系列 vs 自动系列（Smart Collection）
- `collection.products`：系列内商品 GraphQL 查询
- Shopify Menu API：导航菜单的动态读取
- `seo.title` / `seo.description`：Shopify 商品的 SEO 字段

### GraphQL 知识点（Phase 2）

- **Fragments**：将重复的字段集合抽成可复用单元，`fragment ProductCard on Product { id title ... }`
- **Alias**：同一查询中多次调用同一字段时重命名，`featuredCollection: collection(handle: "featured") { ... }`

---

## Phase 3 — 搜索与 Streaming

### 目标

实现全站搜索，深度理解 Streaming 与 Suspense 边界设计。

### 交付物

- `/search?q=xxx` — 搜索结果页
- 搜索结果使用 Streaming 逐步渲染（骨架屏 → 真实内容）
- `loading.tsx` 展示全局加载态
- 搜索框（Client Component）+ 结果区（RSC + Suspense）
- URL 参数驱动搜索（`searchParams`）

### Next.js 能力

| 能力                        | 用途                          | 为什么用                   |
| --------------------------- | ----------------------------- | -------------------------- |
| Streaming + Suspense        | 先展示骨架，数据到达后替换    | 搜索延迟不阻塞整个页面渲染 |
| `loading.tsx`               | 路由切换时的全局 loading 状态 | App Router 内置约定文件    |
| `searchParams` prop         | 服务端读取 URL 查询参数       | 无需客户端 JS 解析参数     |
| RSC + Client Component 边界 | 搜索框是交互组件，结果是 RSC  | 最小化客户端 bundle        |

### Shopify 知识点

- `predictiveSearch` vs `search` query：两种搜索 API 的适用场景
- `SearchResultItemConnection`：搜索结果的类型结构
- 搜索可以跨 Product / Collection / Article 联合检索

### GraphQL 知识点（Phase 3）

- **Input Types**：复杂参数的结构化传递，`search(query: $q, types: [PRODUCT, COLLECTION])`
- **Union Types**：搜索结果可能是 `Product | Collection | Article`，需要用 `... on Product { }` inline fragment 处理
- **`__typename`**：查询返回的类型名，用于在 Union 场景中做类型区分

### 关键学习点

> Streaming 的核心是"让慢的不阻塞快的"，本阶段会明确感受到 Suspense 边界划分对用户体验的影响。

---

## Phase 4 — 购物车

### 目标

实现完整的购物车流程，掌握 Server Actions 与 Cookie Session。

### 交付物

- 商品详情页"加入购物车"按钮
- `/cart` — 购物车页面（数量增减、删除商品）
- Cart ID 存入 Cookie，跨页面保持
- 购物车 icon 显示商品数量（Layout 层共享状态）
- "结账"按钮跳转 Shopify 原生 Checkout URL（`cart.checkoutUrl`）
- Optimistic UI（操作后立即更新 UI，无需等待 API）

### Next.js 能力

| 能力             | 用途                                             | 为什么用                                        |
| ---------------- | ------------------------------------------------ | ----------------------------------------------- |
| Server Actions   | 处理 addToCart / removeFromCart / updateQuantity | 无需手写 API Route，表单/按钮直接调用服务端函数 |
| `cookies()` API  | 存取 Shopify Cart ID                             | Cart 状态跨请求持久化                           |
| `useOptimistic`  | 操作后立即更新 UI                                | 消除购物车操作的网络延迟感                      |
| `revalidatePath` | 购物车变更后刷新相关页面缓存                     | 保持服务端数据与 UI 同步                        |

### Shopify 知识点

- **Cart API**（Storefront）：`cartCreate` → `cartLinesAdd` → `cartLinesUpdate` → `cartLinesRemove`
- Cart 与 Checkout 的关系：Cart 是状态存储，`cart.checkoutUrl` 指向 Shopify 托管结账页
- `cart.cost.totalAmount`：购物车总价
- Shopify Cart 的生命周期（无过期配置 = 永久有效，有过期 = 按 policy）

### GraphQL 知识点（Phase 4）

- **Mutations**：写操作的标准形式，`mutation CartCreate($input: CartInput!) { cartCreate(input: $input) { cart { ... } } }`
- **Payload 模式**：每个 Mutation 返回一个 Payload 对象，包含操作结果（`cart`）和错误列表（`userErrors`）
- **`userErrors` vs HTTP 错误**：GraphQL 始终返回 200，业务错误通过 `userErrors` 字段传递，需主动检查
- **乐观更新与 Mutation**：Server Action 触发 Mutation，`useOptimistic` 在等待响应期间先更新 UI

### 重要取舍

> **不自建 Checkout UI**。Shopify 原生 Checkout 已处理支付、税率、优惠码、物流等复杂逻辑，自建成本极高，实际产品中 99% 的 Headless 项目也跳转原生 Checkout。

---

## Phase 5 — 缓存策略

### 目标

为商品数据设计合理缓存层，实现 Webhook 触发的按需更新。

### 交付物

- 为 Shopify 查询添加 `fetch` 缓存标签（`next: { tags: [...] }`）
- `/api/revalidate` Route Handler — 接收 Shopify Webhook 并触发 `revalidateTag`
- 梳理全站各页面的缓存策略（静态 / ISR / 动态）
- 在 Shopify 后台配置 `product/update` Webhook
- 验证：修改 Shopify 商品后，页面在 N 秒内自动更新

### Next.js 能力

| 能力                   | 用途                        | 为什么用                         |
| ---------------------- | --------------------------- | -------------------------------- |
| `fetch` cache + `tags` | 细粒度标记缓存条目          | 按 tag 精准失效，不必全量重建    |
| `revalidateTag`        | 服务端按需清除缓存          | 配合 Webhook 实现近实时更新      |
| `revalidatePath`       | 清除指定路由缓存            | 适合购物车、账户等频繁变更的页面 |
| Route Handlers         | 暴露 `/api/revalidate` 端点 | 接收外部 Webhook 请求            |

### Shopify 知识点

- **Webhook**：Shopify 事件驱动通知机制（`product/update`、`orders/create` 等）
- HMAC 验证：验证 Webhook 来源合法性（安全关键）
- Webhook delivery 失败重试机制

### GraphQL 知识点（Phase 5）

- **GraphQL over HTTP 与缓存**：GraphQL 默认用 POST，HTTP 缓存层（CDN / 浏览器）不缓存 POST；Next.js 通过在 `fetch` 层拦截实现服务端缓存，需理解这一层包装
- **Shopify Query Cost**：每个 GraphQL 查询有成本上限（throttling），可通过 `extensions.cost` 字段查看消耗，指导查询优化

### 学习价值评估

> 这个阶段是理解 Next.js Data Cache 最直观的实践场景，"触发 Webhook → 页面自动更新"的闭环很有成就感。

---

## Phase 6 — 用户账户

### 目标

实现 Customer 登录 / 注册，以及受保护的账户页面。

### 交付物

- `/account/login` — 登录页（Server Action 提交）
- `/account/register` — 注册页
- `/account` — 账户主页（显示姓名 / 邮箱）
- `/account/orders` — 历史订单列表
- Middleware 拦截未登录访问 `/account/*`
- Customer Access Token 存入 httpOnly Cookie

### Next.js 能力

| 能力                   | 用途                       | 为什么用                            |
| ---------------------- | -------------------------- | ----------------------------------- |
| Middleware             | 路由级权限拦截             | 统一处理 `/account/*` 的未登录跳转  |
| Server Actions         | 登录 / 注册表单提交        | 无需额外 API Route，直接操作 Cookie |
| `cookies()` (httpOnly) | 存储 Customer Access Token | httpOnly 防止 XSS 读取 token        |
| `redirect()`           | 登录后跳转                 | Server Action 内直接调用            |

### Shopify 知识点

- **Customer API**（Storefront）：`customerCreate`、`customerAccessTokenCreate`
- Customer Access Token：有时效（默认 2 小时 / 最长 30 天）
- `customer.orders`：订单历史 GraphQL 查询
- 注意：Storefront Customer API 与 Customer Account API（新版 OAuth）的区别
  - 本阶段使用旧版 Storefront Customer API，足够学习；新版 OAuth 复杂度显著更高

### 重要提示

> Customer 密码在 Shopify 端管理，前端只处理 Token，不接触明文密码存储。

---

## Phase 7 — 验收能力、性能优化与收尾

### 目标

补齐 Playwright 阶段验收能力，提升整体性能体验，探索 Edge 能力，完善产品化细节。

### 交付物

- Playwright 自动化验收 Phase 7 自身交付物
- Proxy 评估地区检测（`geo` 对象）+ 货币提示（可选）
- 关键页面切换到 Edge Runtime（探索成本与收益）
- `next/font` 本地字体优化（消除 CLS）
- 构建输出与客户端 bundle 风险检查
- Lighthouse 评分审计 + 针对性优化
- 404 / Error 页面完善（`not-found.tsx` / `error.tsx`）

### Next.js 能力

| 能力                          | 用途                              |
| ----------------------------- | --------------------------------- |
| Edge Runtime                  | Proxy / 特定 Route 在请求边界执行 |
| `next/font`                   | 字体预加载 + 消除布局偏移         |
| `error.tsx` / `not-found.tsx` | 统一错误边界处理                  |
| Playwright                    | 自动化验收 Phase 7 自身交付物     |

### Shopify 知识点

- Shopify Markets：多地区 / 多货币的产品级支持（了解即可，不深入实现）
- `context.buyerIdentity`：Cart 中传入地区信息影响税率和货币

---

## Shopify 能力取舍建议

| 能力                             | 建议            | 原因                                 |
| -------------------------------- | --------------- | ------------------------------------ |
| Storefront API + Cart            | ✅ 重点学习     | 核心链路，覆盖 80% 的场景            |
| Collections + Search             | ✅ 重点学习     | 基础商品浏览体验                     |
| Customer（旧版 Storefront）      | ✅ 学习         | 账户体系入门，复杂度适中             |
| Webhooks                         | ✅ 学习         | 理解事件驱动 + 缓存失效              |
| Checkout UI 自建                 | ⚠️ 暂不投入     | 复杂度极高，真实产品也不推荐         |
| Customer Account API（新 OAuth） | ⚠️ 了解即可     | 方向正确但配置复杂，后续再探索       |
| Shopify Markets（多货币/多地区） | ⚠️ 浅尝         | Phase 7 可简单触碰，不深入           |
| Metafields                       | ⚠️ 按需         | 商品扩展字段，用到时再学             |
| Admin API                        | ❌ 本项目不涉及 | 面向后台管理，与 Storefront 完全分离 |
| Shopify Functions / App Proxy    | ❌ 超出范围     | 面向 Shopify App 开发，非本项目目标  |

---

## 推荐开发顺序与节奏

```
Week 1:  Phase 0 + Phase 1    → 项目跑起来，看到真实商品数据
Week 2:  Phase 2 + Phase 3    → Collection 分类 + 搜索体验
Week 3:  Phase 4              → 购物车完整流程（本阶段最复杂）
Week 4:  Phase 5              → 缓存策略（偏"理解型"）
Week 5:  Phase 6              → 用户账户
Week 6:  Phase 7 + 收尾       → 性能优化 + 整体打磨
```

> 每个 Phase 完成后建议做一次"完整回顾"：这个阶段用了什么 Next.js 能力、解决了什么问题、Shopify 的哪个 API 对应了哪个业务场景。这种自我总结比代码本身更有长期价值。

---

## 关于架构建议

**GraphQL 客户端**：不推荐引入 Apollo / urql，直接用 `fetch` + 手写 GraphQL query，保持依赖轻量，也更直观理解 Storefront API 的查询结构。

**类型生成**：可选择手写 TypeScript 类型（前期学习价值高），或在 Phase 5 后引入 `@shopify/storefront-api-types` / GraphQL codegen（工程化提效）。

**状态管理**：Cart 状态通过 Cookie + Server Actions 管理，不需要引入 Zustand / Redux。账户状态同理。整个项目可以零客户端状态管理库。

**测试策略**：本项目定位学习型，建议只在关键 utility 函数（价格格式化、GraphQL 客户端封装）写单元测试，不强求全覆盖。
