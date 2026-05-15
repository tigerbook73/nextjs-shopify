# 目录结构规范

## 顶层结构

```
nextjs-shoptify/
├── src/                        ← 所有源代码（使用 src/ 目录）
├── docs/                       ← 项目文档（规范、ADR、功能文档）
├── public/                     ← 静态资源
├── CLAUDE.md                   ← Claude Code 项目配置
├── AGENTS.md                   ← Codex/ChatGPT 项目配置
├── BLUEPRINT.md                ← 阶段规划文档
├── .github/
│   └── copilot-instructions.md ← GitHub Copilot 配置（仅补全）
├── .claude/
│   └── commands/               ← 项目级 slash 命令
└── .env.local                  ← 环境变量（不提交 git）
```

---

## src/ 源代码结构

```
src/
├── app/                        ← Next.js App Router 路由层
│   ├── layout.tsx              ← 根 Layout
│   ├── page.tsx                ← 首页
│   ├── globals.css             ← 全局样式（Tailwind + UI Token）
│   ├── products/
│   │   ├── page.tsx            ← 商品列表页
│   │   └── [handle]/
│   │       └── page.tsx        ← 商品详情页
│   ├── collections/
│   │   └── [handle]/
│   │       └── page.tsx
│   ├── search/
│   │   └── page.tsx
│   ├── cart/
│   │   └── page.tsx
│   ├── account/
│   │   ├── layout.tsx          ← 账户区 Layout（含权限检查）
│   │   ├── page.tsx
│   │   ├── login/page.tsx
│   │   ├── register/page.tsx
│   │   └── orders/page.tsx
│   └── api/
│       └── revalidate/
│           └── route.ts        ← Webhook 接收端点
├── components/
│   ├── ui/                     ← shadcn/ui 基础组件（不修改原文件）
│   ├── layout/                 ← 全局布局组件
│   │   ├── header.tsx
│   │   ├── footer.tsx
│   │   └── nav.tsx
│   └── features/               ← 功能组件（按领域分组）
│       ├── product/
│       │   ├── product-card.tsx
│       │   ├── product-gallery.tsx
│       │   └── variant-selector.tsx
│       ├── cart/
│       │   ├── cart-item.tsx
│       │   └── add-to-cart-button.tsx
│       └── account/
│           └── order-list.tsx
├── lib/
│   ├── shopify/                ← Shopify API 客户端层
│   │   ├── client.ts           ← shopifyFetch<T>() 统一入口
│   │   ├── types.ts            ← Shopify API TypeScript 类型
│   │   ├── queries/            ← GraphQL 查询字符串
│   │   │   ├── product.ts
│   │   │   ├── collection.ts
│   │   │   ├── cart.ts
│   │   │   └── customer.ts
│   │   └── mutations/          ← GraphQL 变更字符串
│   │       ├── cart.ts
│   │       └── customer.ts
│   ├── actions/                ← Server Actions
│   │   ├── cart.ts
│   │   └── account.ts
│   └── utils/                  ← 纯工具函数
│       ├── format-price.ts
│       └── parse-gid.ts
└── types/                      ← 应用内部 TypeScript 类型（非 Shopify 原始类型）
    └── index.ts
```

---

## 文件命名规则

| 场景 | 格式 | 示例 |
|------|------|------|
| Next.js 约定文件 | 小写 | `page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx`, `route.ts` |
| React 组件文件 | kebab-case | `product-card.tsx`, `add-to-cart-button.tsx` |
| 工具函数文件 | kebab-case | `format-price.ts`, `parse-gid.ts` |
| 测试文件 | `<源文件>.test.ts` | `format-price.test.ts` |
| GraphQL 查询文件 | kebab-case（按领域） | `product.ts`（在 `queries/` 下） |

---

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

---

## 新增文件决策树

```
新文件是什么？
├── Next.js 约定文件（page/layout/loading/error/route）→ 放在 src/app/ 对应路由下
├── React 组件
│   ├── shadcn/ui 基础组件 → src/components/ui/（运行 shadcn 命令生成，不手写）
│   ├── 全局布局 → src/components/layout/
│   └── 功能组件 → src/components/features/<领域>/
├── API 调用逻辑 → src/lib/shopify/queries/ 或 mutations/
├── Server Action → src/lib/actions/
├── 纯工具函数 → src/lib/utils/
└── TypeScript 类型
    ├── Shopify API 类型 → src/lib/shopify/types.ts
    └── 应用内部类型 → src/types/index.ts
```
