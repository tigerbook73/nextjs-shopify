# AGENTS.md

本文件为 AI agent 提供本仓库的开发指南。

## 常用命令

```bash
pnpm dev          # HTTPS 开发服务器（需要 .certs/，见下方说明）
pnpm dev:http     # HTTP 开发服务器（无需证书）
pnpm build        # 生产构建
pnpm lint         # ESLint + tsc --noEmit
pnpm test:unit    # Vitest 单元测试（jsdom 环境）
pnpm test:e2e     # Playwright E2E 测试（自动构建并启动服务器）
pnpm codegen      # GraphQL 类型生成（需要 SHOPIFY_CUSTOMER_ACCOUNT_API_KEY）
pnpm env:check    # 检查必填环境变量是否齐全
```

运行单个测试文件：`pnpm vitest run src/path/to/file.test.ts`

### 开发环境配置

复制 `.env.example` 为 `.env.local` 并填写以下变量：

| 变量                                 | 用途                                              |
| ------------------------------------ | ------------------------------------------------- |
| `SHOPIFY_STORE_DOMAIN`               | 店铺域名，格式 `*.myshopify.com`（不含 https://） |
| `SHOPIFY_STOREFRONT_ACCESS_TOKEN`    | Storefront API 公开访问令牌                       |
| `SHOPIFY_CUSTOMER_ACCOUNT_API_KEY`   | 仅用于 codegen                                    |
| `SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_ID` | OAuth client ID（Headless channel）               |
| `SHOPIFY_SHOP_ID`                    | Shopify 店铺数字 ID                               |
| `NEXT_PUBLIC_APP_URL`                | 应用 URL，例如 `https://nextjs-shopify.local`     |

HTTPS 开发模式需要在 `.certs/` 目录放置自签名证书。`pnpm dev:http` 无需证书，但 Customer Account OAuth 必须在 HTTPS 下才能正常工作。

## 架构概览

**Next.js 16 App Router**，代码全部位于 `src/` 下：

```
src/
  app/           # 路由（默认为 RSC）
  components/    # UI 组件（cart/ collection/ layout/ product/ search/ ui/）
  context/       # 客户端状态（CartContext）
  lib/
    actions/     # Server Actions（cart.ts, address.ts, profile.ts）
    shopify/
      client.ts                # Storefront API 请求层
      queries/ mutations/      # GraphQL 字符串
      types.ts                 # 手写的 Storefront API 类型
      customer-account/        # Customer Account API（OAuth、令牌、查询）
  types/
    generated/   # 由 pnpm codegen 自动生成——禁止手动编辑
```

### 两套 Shopify API

**Storefront API**（`src/lib/shopify/client.ts`）：公开数据——商品、集合、购物车。`shopifyFetch()` 通过 Next.js `fetch` 的 cache tags 实现按需重验证。默认使用 `force-cache`，变更操作和搜索使用 `no-store`。

**Customer Account API**（`src/lib/shopify/customer-account/`）：已认证的客户数据——订单、地址、个人资料。采用 PKCE OAuth 2.0。令牌存储在 httpOnly cookie 中（`ca_access_token`、`ca_refresh_token`、`ca_token_expiry`）。`src/proxy.ts` 中的中间件保护 `/account/**` 路由——令牌过期时通过重定向刷新（而非 `NextResponse.next()`，因为后者会把过期的旧 cookie 转发给页面处理器，导致认证失败）。

### 购物车状态

购物车在 layout 层由服务端初始化（`src/app/layout.tsx` 读取 `cartId` cookie 并获取购物车数据），以 `initialCart` 传入 `CartProvider`。客户端变更调用 `src/lib/actions/cart.ts` 中的 Server Actions，Action 返回更新后的购物车；组件调用 `CartContext` 上的 `applyCart(updatedCart)` 同步状态，无需整页刷新。

### 认证流程

`GET /api/auth/login` → 生成 PKCE 挑战码 → 跳转 Shopify OAuth → `GET /api/auth/callback` → 写入 cookie → 重定向到 `return_to`。登出由 `GET /api/auth/logout` 清除令牌 cookie。

## 测试规范

### E2E 测试要求

对 `src/app/` 下的路由页面进行以下变更时，须补充或更新对应的 E2E 测试用例：

- 新增或删除影响用户操作路径的关键组件（如表单、导航入口、购物车交互）
- 修改页面结构（Layout / 页面级组件的层级或渲染逻辑）
- 新增完整的用户流程（如认证、结账、地址管理）

若已有 E2E 测试覆盖该功能，更新现有用例即可，无需强制新增。

**豁免情形**（需在 PR/commit 中注明原因）：仅样式微调、纯文案修改、或测试依赖真实第三方 OAuth 等无法在 CI 中稳定重现的场景。

### 提交前自检

每次准备执行 `git commit` 前，检查本次变更是否触发上述 E2E 补充条件。若触发但未补充或更新测试，须主动提示用户，并说明补充的建议方向或豁免理由，不得静默跳过。

## 提交规范

格式：`type(scope): description`（Conventional Commits，英文描述）

示例：`feat(cart): lift cartCount into CartContext`、`fix(auth): redirect after token refresh`

## GraphQL 代码生成

生成的类型文件位于 `src/types/generated/`——禁止手动编辑。修改任何 `.graphqlrc.yml` 或新增 GraphQL 操作后，运行 `pnpm codegen`。运行前需在 `.env.local` 中设置 `SHOPIFY_CUSTOMER_ACCOUNT_API_KEY`。

## Next.js 版本说明

本项目使用 **Next.js 16**，其 API 和行为可能与训练数据中的版本存在破坏性差异。编写任何 Next.js 相关代码前，请先查阅 `node_modules/next/dist/docs/` 中的对应文档，不得依赖旧版本的行为假设。
