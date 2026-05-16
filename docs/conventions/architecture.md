# 架构约束

## 技术栈（固定，不得随意替换）

| 层次 | 技术 | 说明 |
| ---- | ---- | ---- |
| 框架 | Next.js 16 App Router + TypeScript 5 | 使用 `src/` 目录结构 |
| 样式 | Tailwind CSS v4 + shadcn/ui（@base-ui/react） | UI Token 在 `globals.css`，不新增 `tailwind.config.ts` 用于 token |
| Shopify | Storefront API（GraphQL） | 只用 Storefront API，不用 Admin API |
| 数据获取 | 原生 `fetch` + 手写 GraphQL query | 不引入 Apollo、urql、graphql-request |
| 状态管理 | 无客户端状态库 | Cart 和账户状态通过 Cookie + Server Actions 管理 |
| Checkout | 跳转 Shopify 原生结账页 | 不自建 Checkout UI |
| 包管理器 | pnpm | 不混用 npm / yarn |

决策背景见 `../adr/`。

## 架构分层

```
src/app/                    ← 路由层（页面、布局、Route Handlers）
  └── page.tsx              ← 只负责组合组件，不含业务逻辑
src/components/             ← UI 层（展示组件）
  ├── ui/                   ← shadcn/ui 基础组件（不修改原文件）
  ├── layout/               ← 全局布局组件（Header、Footer、Nav）
  ├── product/              ← 商品功能组件
  ├── collection/           ← 系列功能组件
  └── cart/                 ← 购物车功能组件（Phase 4 起）
src/lib/
  ├── shopify/              ← Shopify API 客户端层
  │   ├── client.ts         ← shopifyFetch<T>() 统一入口 + 所有 API 函数
  │   ├── types.ts          ← Shopify API TypeScript 类型定义
  │   ├── queries/          ← GraphQL 查询字符串（按领域分文件）
  │   └── mutations/        ← GraphQL 变更字符串（Phase 4 起）
  ├── actions/              ← Server Actions（Phase 4 起）
  └── utils/                ← 纯工具函数（格式化、计算等）
src/types/                  ← 应用内部 TypeScript 类型（非 Shopify 原始类型）
```

### 分层规则

- `app/` 中的页面组件通过 `lib/shopify/client.ts` 中的封装函数获取数据，不在页面内写原始 `fetch` 调用或业务逻辑
- `components/` 组件接收服务端数据作为 props，不直接发起 API 请求
- `lib/shopify/` 只被 Server Components、Server Actions、Route Handlers 调用
- `lib/utils/` 是纯函数，不依赖任何框架或外部 API

## 明确禁止事项

| 禁止 | 原因 |
| ---- | ---- |
| 引入 Apollo Client / urql / graphql-request | ADR-0002：原生 fetch 更轻量、更直观 |
| 引入 Zustand / Redux / Jotai 等客户端状态库 | ADR-0006：Cookie + Server Actions 已覆盖所有状态需求 |
| 调用 Shopify Admin API | Admin API 需要私密凭证，面向后台管理，非前端场景 |
| 自建 Checkout UI | ADR-0003：成本极高，Shopify 原生 Checkout 已覆盖所有复杂逻辑 |
| 在 Client Component 中直接调用 Shopify API | 会将 Storefront Access Token 暴露到客户端 |
| 在 `app/` 页面文件中写业务逻辑 | 违反分层规则，导致页面难以测试和维护 |
| 使用 `any` 类型 | 见 `coding.md` |

## 引入新依赖的规则

引入任何新的 npm 包前，需确认：

1. 是否已有内置方案或现有依赖可满足需求？
2. 该包是否与 App Router / RSC 兼容？
3. 包体积对客户端 bundle 的影响

需要引入重要新依赖时，创建 ADR（运行 `/adr`）记录决策。
