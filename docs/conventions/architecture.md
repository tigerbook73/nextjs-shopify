# 架构约束

## 技术栈（固定，不得随意替换）

| 层次 | 技术 | 说明 |
|------|------|------|
| 框架 | Next.js App Router + TypeScript | 使用 `src/` 目录结构 |
| 样式 | Tailwind CSS + shadcn/ui | UI Token 在 `globals.css`，不新增 `tailwind.config.ts` 用于 token |
| Shopify | Storefront API（GraphQL） | 只用 Storefront API，不用 Admin API |
| 数据获取 | 原生 `fetch` + 手写 GraphQL query | 不引入 Apollo、urql、URQL |
| 状态管理 | 无客户端状态库 | Cart 和账户状态通过 Cookie + Server Actions 管理 |
| Checkout | 跳转 Shopify 原生结账页 | 不自建 Checkout UI |

决策背景见 `../adr/`。

---

## 架构分层

```
src/app/                    ← 路由层（页面、布局、API Routes）
  └── (route)/page.tsx       ← 只负责组合组件，不含业务逻辑
src/components/             ← UI 层（展示组件）
  ├── ui/                    ← shadcn/ui 基础组件（不修改）
  ├── layout/                ← 布局组件（Header、Footer、Nav）
  └── features/              ← 功能组件（ProductCard、CartItem 等）
src/lib/
  ├── shopify/               ← Shopify API 客户端层
  │   ├── client.ts          ← shopifyFetch<T>() 统一入口
  │   ├── queries/           ← GraphQL 查询字符串
  │   └── mutations/         ← GraphQL 变更字符串
  └── utils/                 ← 纯工具函数（格式化、计算等）
src/types/                  ← 全局 TypeScript 类型定义
docs/                       ← 项目文档（规范、ADR、功能文档）
```

### 分层规则

- `app/` 中的页面组件只组合 `components/` 中的组件，不直接调用 `lib/shopify/`
- `components/features/` 可以接收服务端数据作为 props，不直接发起 API 请求
- `lib/shopify/` 只被 Server Components、Server Actions、Route Handlers 调用
- `lib/utils/` 是纯函数，不依赖任何框架或外部 API

---

## 明确禁止事项

| 禁止 | 原因 |
|------|------|
| 引入 Apollo Client / urql / graphql-request | ADR-0002：原生 fetch 更轻量、更直观 |
| 引入 Zustand / Redux / Jotai | 无必要的客户端状态，增加复杂度 |
| 调用 Shopify Admin API | Admin API 需要私密凭证，面向后台管理，非前端场景 |
| 自建 Checkout UI | ADR-0003：成本极高，原生 Checkout 已覆盖所有复杂逻辑 |
| 在 Client Component 中直接调用 Shopify API | 会暴露 Storefront Access Token 到客户端 |
| 在 `app/` 页面文件中写业务逻辑 | 违反分层原则，导致页面难以测试和维护 |
| 使用 `any` 类型 | 见 `coding.md` |

---

## 引入新依赖的规则

引入任何新的 npm 包前，需确认：
1. 是否已有内置方案或现有依赖可以满足需求？
2. 该包是否与 App Router / RSC 兼容（部分老包不支持）？
3. 包的体积对 bundle 的影响（客户端包尤其注意）

需要引入重要新依赖时，创建 ADR 记录决策。
