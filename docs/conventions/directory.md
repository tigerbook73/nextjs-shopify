# 目录结构规范

## 顶层结构

```
nextjs-shopify/
├── src/                        ← 所有源代码
├── docs/                       ← 项目文档（规范、ADR、功能文档）
├── public/                     ← 静态资源
├── scripts/                    ← 开发工具脚本（fetch-schema、check-env 等）
├── BLUEPRINT.md                ← 阶段规划文档
├── CLAUDE.md                   ← Claude Code 项目规范
├── schema.graphql              ← Shopify GraphQL schema（由 pnpm schema:fetch 生成）
├── .claude/
│   └── commands/               ← 项目级 Claude Code slash 命令
└── .env.local                  ← 环境变量（不提交 git）
```

## src/ 源代码结构

```
src/
├── app/                        ← Next.js App Router 路由层
│   ├── layout.tsx              ← 根 Layout
│   ├── page.tsx                ← 首页
│   ├── globals.css             ← 全局样式（Tailwind + UI Token）
│   ├── sitemap.ts              ← 自动生成 sitemap
│   ├── products/
│   │   ├── page.tsx            ← 商品列表页
│   │   └── [handle]/
│   │       └── page.tsx        ← 商品详情页
│   ├── collections/
│   │   ├── page.tsx            ← 系列列表页
│   │   └── [handle]/
│   │       └── page.tsx        ← 系列商品页
│   ├── search/
│   │   └── page.tsx            ← 搜索结果页（Phase 3）
│   ├── cart/
│   │   └── page.tsx            ← 购物车页面（Phase 4）
│   ├── account/
│   │   ├── layout.tsx          ← 账户区 Layout（含权限检查）
│   │   ├── page.tsx
│   │   ├── login/page.tsx
│   │   ├── register/page.tsx
│   │   └── orders/page.tsx
│   └── api/
│       └── revalidate/
│           └── route.ts        ← Webhook 接收端点（Phase 5）
├── components/
│   ├── ui/                     ← shadcn/ui 基础组件（不修改原文件）
│   ├── layout/                 ← 全局布局组件（Header、Footer、Nav）
│   ├── product/                ← 商品功能组件
│   │   ├── ProductCard.tsx
│   │   ├── ProductGallery.tsx
│   │   └── VariantSelector.tsx
│   ├── collection/             ← 系列功能组件
│   │   └── CollectionCard.tsx
│   └── cart/                   ← 购物车功能组件（Phase 4）
│       ├── CartItem.tsx
│       └── AddToCartButton.tsx
├── lib/
│   ├── shopify/                ← Shopify API 客户端层
│   │   ├── client.ts           ← shopifyFetch<T>() 统一入口 + 所有 API 函数
│   │   ├── types.ts            ← Shopify API TypeScript 类型
│   │   ├── queries/            ← GraphQL 查询字符串（按领域分文件）
│   │   │   ├── product.ts
│   │   │   ├── collection.ts
│   │   │   ├── shop.ts
│   │   │   ├── cart.ts         ← Phase 4
│   │   │   └── customer.ts     ← Phase 6
│   │   └── mutations/          ← GraphQL 变更字符串
│   │       ├── cart.ts         ← Phase 4
│   │       └── customer.ts     ← Phase 6
│   ├── actions/                ← Server Actions（Phase 4 起）
│   │   ├── cart.ts
│   │   └── account.ts
│   └── utils/                  ← 纯工具函数
│       ├── format-price.ts
│       └── parse-gid.ts
└── types/                      ← 应用内部 TypeScript 类型（非 Shopify 原始类型）
    └── index.ts
```

## 文件命名规则

| 场景             | 格式                 | 示例                                                             |
| ---------------- | -------------------- | ---------------------------------------------------------------- |
| Next.js 约定文件 | 小写                 | `page.tsx`、`layout.tsx`、`loading.tsx`、`error.tsx`、`route.ts` |
| React 组件文件   | PascalCase           | `ProductCard.tsx`、`CollectionCard.tsx`                          |
| 工具函数文件     | kebab-case           | `format-price.ts`、`parse-gid.ts`                                |
| 测试文件         | `<源文件>.test.ts`   | `format-price.test.ts`                                           |
| GraphQL 查询文件 | kebab-case（按领域） | `product.ts`、`collection.ts`                                    |

## docs/ 文档结构

```
docs/
├── conventions/                ← 规范文档（本目录）
├── adr/                        ← 架构决策记录
└── features/                   ← 功能开发文档
    ├── <feature-id>/           ← 进行中的功能
    │   ├── REQUIREMENTS.md
    │   ├── DESIGN.md
    │   └── PROGRESS.md
    └── -<feature-id>/          ← 已完成的功能（目录名前加 `-`）
```

## 新增文件决策树

```
新文件是什么？
├── Next.js 约定文件（page/layout/loading/error/route/sitemap）
│   └── 放在 src/app/ 对应路由下
├── React 组件
│   ├── shadcn/ui 基础组件 → src/components/ui/（运行 shadcn 命令生成）
│   ├── 全局布局 → src/components/layout/
│   ├── 商品相关 → src/components/product/
│   ├── 系列相关 → src/components/collection/
│   └── 其他功能 → src/components/<领域>/
├── API 调用逻辑 → src/lib/shopify/queries/ 或 mutations/
├── Server Action → src/lib/actions/
├── 纯工具函数 → src/lib/utils/
└── TypeScript 类型
    ├── Shopify API 类型 → src/lib/shopify/types.ts
    └── 应用内部类型 → src/types/index.ts
```
