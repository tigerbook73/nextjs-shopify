# Design: customer-accounts

## Overview

将认证系统从 Classic Customer Accounts（Storefront API + `customerAccessToken`）迁移到
New Customer Accounts（Customer Account API + OAuth 2.0 / PKCE），并补全个人资料编辑、
地址管理、订单详情等自助服务功能。

共 5 个步骤，前 2 步为中间态（搭建基础），后 3 步为最终态（含测试）。

---

## Architecture Notes

### 新旧 API 对比

| 维度       | Classic（移除）                               | New（目标）                                                    |
| ---------- | --------------------------------------------- | -------------------------------------------------------------- |
| 认证协议   | 自定义 email/password → `customerAccessToken` | OAuth 2.0 + PKCE → `access_token` + `refresh_token`            |
| API 入口   | Storefront API（`/api/2024-10/graphql.json`） | Customer Account API discovery 返回的 `graphql_api`            |
| Token 存储 | 单个 httpOnly Cookie（30 天）                 | `access_token`（1 h）+ `refresh_token`（30 天）httpOnly Cookie |
| 密码重置   | 无自建入口                                    | Shopify 托管页内建                                             |

### OAuth 端点（需在 Shopify Admin 配置 Headless channel）

```
授权：  https://shopify.com/authentication/{SHOPIFY_SHOP_ID}/oauth/authorize
Token：  https://shopify.com/authentication/{SHOPIFY_SHOP_ID}/oauth/token
吊销：  https://shopify.com/authentication/{SHOPIFY_SHOP_ID}/oauth/revoke
API：   https://{SHOPIFY_STORE_DOMAIN}/.well-known/customer-account-api 返回的 graphql_api
```

### 新增环境变量

```
SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_ID   # Headless channel 的 client_id
SHOPIFY_SHOP_ID                       # e.g. 12345678
SHOPIFY_STORE_DOMAIN                 # e.g. your-store.myshopify.com
NEXT_PUBLIC_APP_URL                   # e.g. http://localhost:3000
```

### Token Cookie 命名

| Cookie             | 内容                               | 属性                               |
| ------------------ | ---------------------------------- | ---------------------------------- |
| `ca_access_token`  | JWT access token                   | httpOnly, sameSite=lax, path=/     |
| `ca_refresh_token` | refresh token                      | httpOnly, sameSite=lax, path=/     |
| `ca_token_expiry`  | access token 过期 Unix 时间戳 (ms) | httpOnly, sameSite=lax, path=/     |
| `ca_pkce_verifier` | OAuth 流程中临时存储 code_verifier | httpOnly, sameSite=lax, maxAge=600 |
| `ca_oauth_state`   | CSRF 防护 state 值                 | httpOnly, sameSite=lax, maxAge=600 |
| `ca_return_to`     | 登录成功后跳转的目标路径           | httpOnly, sameSite=lax, maxAge=600 |

### 目录结构变化

```
src/
  lib/shopify/
    customer-account/          ← 新建（Step 1）
      pkce.ts                  — PKCE code_verifier/challenge 工具
      tokens.ts                — Cookie 读写封装
      client.ts                — Customer Account API GraphQL client
      queries.ts               — 初始 GraphQL 查询
      mutations.ts             — Profile / Address / Token refresh 变更
  app/api/auth/                ← 新建（Step 2）
    login/route.ts             — 发起 OAuth
    callback/route.ts          — 处理回调
    logout/route.ts            — 登出 + 吊销
  proxy.ts                     ← 新建（Step 3，Next.js 16 中 middleware.ts 已改名为 proxy.ts）
  app/account/
    profile/page.tsx           ← 新建（Step 4）
    addresses/
      page.tsx                 ← 新建（Step 4）
      new/page.tsx             ← 新建（Step 4）
      [id]/edit/page.tsx       ← 新建（Step 4）
    orders/
      [id]/page.tsx            ← 新建（Step 4）
  lib/actions/
    profile.ts                 ← 新建（Step 4）
    address.ts                 ← 新建（Step 4）
```

---

## Step 1 — OAuth Utilities & Customer Account API Client

**Step Type**: `intermediate`

搭建所有后续步骤依赖的底层工具：PKCE 生成、Cookie 操作、Customer Account API GraphQL client，以及新的 TypeScript 类型定义。此步骤不改动任何 UI 或现有路由，Classic 认证逻辑继续运行。

### Key Changes

**`src/lib/shopify/customer-account/pkce.ts`**

- `generateCodeVerifier()` — 返回 URL-safe 随机字符串（43-128 字符）
- `generateCodeChallenge(verifier)` — SHA-256 hash → base64url 编码

**`src/lib/shopify/customer-account/tokens.ts`**

- `setTokenCookies(tokens)` — 写入 `ca_access_token` / `ca_refresh_token` / `ca_token_expiry`（内部调用 `cookies()`，仅用于 Route Handler）
- `getAccessToken()` — 读取 access token（内部调用 `cookies()`）
- `isTokenExpired()` — 判断 `ca_token_expiry` 是否过期（内部调用 `cookies()`）
- `clearTokenCookies()` — 清除所有 `ca_*` cookie（内部调用 `cookies()`）
- `exchangeRefreshToken(refreshToken)` — 纯 HTTP 调用，换新 token，可用于 Route Handler 和 proxy
- `refreshAccessToken()` — Route Handler 专用封装：读 Cookie → 换 token → 写 Cookie

**`src/lib/shopify/customer-account/client.ts`**

- `customerAccountFetch<T>(accessToken, query, variables?)` — 向 Customer Account API 发 GraphQL 请求，Authorization header 直接传 access token（Shopify CA API 不需要 Bearer 前缀）

**`src/lib/shopify/customer-account/queries.ts`**

- `GET_CUSTOMER_QUERY` — 获取 id、email、firstName、lastName、displayName
- `GET_ORDERS_QUERY` — 获取订单列表（orderNumber、processedAt、financialStatus、fulfillmentStatus、totalPrice）
- `GET_ORDER_DETAIL_QUERY` — 获取订单详情（lineItems 含图片、fulfillments 含 trackingUrl、shippingAddress、金额明细）
- `GET_ADDRESSES_QUERY` — 获取地址列表

**`src/lib/shopify/customer-account/mutations.ts`**

- `UPDATE_CUSTOMER_MUTATION` — 更新 firstName / lastName / email
- `ADDRESS_CREATE_MUTATION` — 新增地址
- `ADDRESS_UPDATE_MUTATION` — 编辑地址
- `ADDRESS_DELETE_MUTATION` — 删除地址
- `ADDRESS_SET_DEFAULT_MUTATION` — 设默认地址

**`src/types/customer-account.ts`**

- `CustomerAccountToken` — access_token, refresh_token, expires_in
- `CustomerProfile` — id, email, firstName, lastName, displayName
- `CustomerAddress` — 完整地址字段 + id + isDefault
- `CustomerOrder` / `OrderDetail` — 订单类型

### Auto Verification

- `(auto)` `pnpm tsc --noEmit` — 新类型无编译错误

### Manual Verification

- `(manual)` 检查 `pkce.ts` 生成的 code_challenge 符合 S256 规范（base64url，无 `=` padding）

---

## Step 2 — OAuth Routes: Login, Callback, Logout

**Step Type**: `intermediate`

实现三个 Route Handler，完成 OAuth 2.0 + PKCE 完整流程。此步骤结束后，可在浏览器手动测试登录/登出流程，但 `/account` 页面尚未切换至新 API。

### Key Changes

**`src/app/api/auth/login/route.ts`** — GET

1. 生成 `code_verifier`（PKCE）、`code_challenge`、随机 `state`
2. 将 `code_verifier` + `state` 写入临时 httpOnly Cookie（10 分钟过期）
3. 构建授权 URL，redirect 302 至 Shopify 托管登录页
4. 支持 `?return_to=` 参数，回调后跳转原页面

**`src/app/api/auth/callback/route.ts`** — GET

1. 校验 `state`（防 CSRF）；不匹配 → 400
2. 读取 `code_verifier` Cookie
3. POST token 端点：`grant_type=authorization_code`，携带 `code_verifier`
4. 解析 `access_token` / `refresh_token` / `expires_in`，写入 httpOnly Cookie
5. 清除临时 Cookie，redirect 至 `return_to`（默认 `/account`）

**`src/app/api/auth/logout/route.ts`** — POST

1. 读取 access_token Cookie
2. POST 吊销端点（`token_type_hint=access_token`，忽略吊销失败）
3. 清除所有 `ca_*` Cookie
4. redirect 302 至 `/`

### Auto Verification

- `(auto)` `pnpm tsc --noEmit` — 三个 Route Handler 无类型错误

### Manual Verification

- `(manual)` 启动 dev server，访问 `/api/auth/login`，确认跳转至 Shopify 托管登录页
- `(manual)` 完成登录后，确认 Cookie 中存在 `ca_access_token` + `ca_refresh_token`
- `(manual)` 点击登出，确认 Cookie 清除并跳转首页

---

## Step 3 — Middleware + Account Pages Migration

**Step Type**: `final`

创建 Next.js Middleware 保护 `/account/*` 路由（含透明 token 续期），并将账户概览、历史订单页切换至 Customer Account API。此步骤完成后，Classic 认证流程已不再被账户页面使用。

### Key Changes

**`src/proxy.ts`**（Next.js 16 中 `middleware.ts` 已改名为 `proxy.ts`，导出函数名从 `middleware` 改为 `proxy`）

- Matcher：`/account/:path*`
- 逻辑：
  1. 无 access_token → redirect 至 `/api/auth/login?return_to={pathname}`
  2. access_token 未过期 → `NextResponse.next()`（透传请求）
  3. access_token 已过期且有 refresh_token → 调用 `exchangeRefreshToken(refreshToken)`（不用 `refreshAccessToken()`，proxy 中需手动写 response cookies）→ 若成功，设置新 Cookie 后 `NextResponse.next()`；若失败，redirect 至 `/api/auth/login`

**`src/app/account/layout.tsx`**

- 侧边导航新增"个人资料"和"收货地址"链接
- 移除手动 redirect（由 Middleware 接管）
- 登出按钮改为 `<a href="/api/auth/logout">` 或触发 POST 的 form

**`src/app/account/page.tsx`**

- 从 Cookie 读取 access_token（通过 `getAccessToken`）
- 调用 `customerAccountFetch` + `GET_CUSTOMER_QUERY` 获取用户资料（含 `orders(first: 100)` 连接用于计数）
- 订单数取自 `GET_CUSTOMER_QUERY` 返回的 `orders.nodes.length`，超过 100 笔显示"100+"
- 保留 initials 头像逻辑

**`src/app/account/orders/page.tsx`**

- 改用 `GET_ORDERS_QUERY`（Customer Account API）
- 订单列表展示与现有一致

**测试文件**

`src/test/proxy.test.ts`：

- 无 token → 应 redirect 至 login
- token 有效 → 应 `next()`
- token 过期 + 有 refresh token → 应调用 refreshAccessToken → next
- token 过期 + 无 refresh token → 应 redirect 至 login
- refresh 失败 → 应清除 Cookie + redirect

### Auto Verification

- `(auto)` `pnpm vitest run src/test/proxy.test.ts`
- `(auto)` `pnpm tsc --noEmit`

### Manual Verification

- `(manual)` 登录后访问 `/account`，确认显示正确的姓名、邮箱、订单笔数
- `(manual)` 访问 `/account/orders`，确认订单列表正常展示
- `(manual)` 未登录访问 `/account`，确认被重定向至 Shopify 登录页，登录成功后返回 `/account`

---

## Step 4 — Self-Service Features

**Step Type**: `final`

实现 FR-3（资料编辑）、FR-4（地址管理）、FR-5（订单详情）、FR-6（Header 差异化）。

### Key Changes

**FR-3 — 个人资料编辑**

`src/app/account/profile/page.tsx`：

- 展示当前 firstName / lastName / email（从 Customer Account API 读取）
- 表单：修改姓名 + 邮箱，提交调用 Server Action

`src/lib/actions/profile.ts`：

- `updateProfile(formData)` — 调用 `UPDATE_CUSTOMER_MUTATION`，成功后 revalidate 路径

**FR-4 — 收货地址管理**

`src/app/account/addresses/page.tsx`：

- 列出所有地址（高亮默认地址）
- 每条地址有"编辑"/"删除"/"设为默认"操作

`src/app/account/addresses/new/page.tsx`：

- 新增地址表单（firstName、lastName、address1、address2、city、province、zip、country、phone）

`src/app/account/addresses/[id]/edit/page.tsx`：

- 预填已有地址数据的编辑表单

`src/lib/actions/address.ts`：

- `createAddress(formData)` / `updateAddress(id, formData)` / `deleteAddress(id)` / `setDefaultAddress(id)`

**FR-5 — 订单详情**

`src/app/account/orders/[id]/page.tsx`：

- 从 URL 取订单 ID（base64 解码为 GID）
- 展示：商品列表（含图片、数量、单价）、配送地址、物流状态、物流追踪链接（如有）、金额明细

**FR-6 — Header 差异化**

`src/components/layout/Navbar.tsx`（或现有 Header 组件）：

- Server Component 从 Cookie 判断是否已登录（`getAccessToken`）
- 已登录 → 显示"订单"快速入口图标（跳转 `/account/orders`）+ 账户图标
- 未登录 → 显示登录链接（跳转 `/api/auth/login`）

**测试文件**

`src/test/actions/profile.test.ts` — updateProfile 调用正确 mutation、成功/失败路径
`src/test/actions/address.test.ts` — CRUD 各 action 正确调用 mutation

### Auto Verification

- `(auto)` `pnpm vitest run src/test/actions/profile.test.ts src/test/actions/address.test.ts`
- `(auto)` `pnpm tsc --noEmit`

### Manual Verification

- `(manual)` 账户资料页修改姓名 → 刷新确认持久化
- `(manual)` 新增地址 → 列表显示 → 编辑 → 删除 → 设默认，全流程验证
- `(manual)` 订单列表点击订单 → 详情页展示商品图片和物流信息
- `(manual)` Header 已登录状态显示订单快速入口，未登录显示登录链接

---

## Step 5 — Classic API Cleanup

**Step Type**: `final`

移除所有 Classic Customer Accounts 相关代码（FR-7），确保无残留引用。

### Files to Delete

| 文件                                      | 原因                   |
| ----------------------------------------- | ---------------------- |
| `src/app/account/login/page.tsx`          | 替换为 OAuth 托管登录  |
| `src/app/account/register/page.tsx`       | 替换为 OAuth 托管注册  |
| `src/components/account/LoginForm.tsx`    | 不再使用               |
| `src/components/account/RegisterForm.tsx` | 不再使用               |
| `src/lib/shopify/mutations/customer.ts`   | Classic mutations      |
| `src/lib/shopify/queries/customer.ts`     | Classic queries        |
| `src/lib/actions/customer.ts`             | Classic Server Actions |

### Code to Remove from Existing Files

`src/lib/shopify/client.ts`：

- `createCustomer()` / `createCustomerAccessToken()` / `deleteCustomerAccessToken()` / `getCustomer()` / `getCustomerOrders()` 函数
- 对应 import：Classic mutations + queries

`src/lib/shopify/types.ts`（或同位置类型文件）：

- `CustomerAccessToken` 类型
- `Customer`（旧版，若与新类型不同）

### Auto Verification

- `(auto)` `pnpm tsc --noEmit`
- `(auto)` `pnpm lint`
- `(auto)` `! grep -r "customerAccessToken" src/ --include="*.ts" --include="*.tsx" -l` — 确认无残留
- `(auto)` `! grep -r "customerCreate\|CustomerAccessTokenCreate" src/ --include="*.ts" --include="*.tsx" -l` — 确认 Classic mutation 无残留
- `(auto)` `pnpm vitest run` — 全量测试通过

### Manual Verification

- `(manual)` 访问 `/account/login`，确认 404 或重定向（不应再有 Classic 登录表单）
- `(manual)` 访问 `/account/register`，确认 404 或重定向

---

## Task Acceptance

对应 `requirements.md` 中的 8 条自动验收 + 2 条手动验收：

- `(auto)` `pnpm exec playwright test --grep "未登录访问 /account"` — 未登录跳转登录入口
- `(auto)` `pnpm exec playwright test --grep "登出后跳转首页"` — 登出清除 Cookie + 跳首页
- `(auto)` `pnpm exec playwright test --grep "access token 过期.*续期"` — Mock token 端点，验证无感续期
- `(auto)` `pnpm exec playwright test --grep "修改 firstName.*lastName"` — 账户资料编辑
- `(auto)` `pnpm exec playwright test --grep "地址"` — 地址 CRUD + 默认地址
- `(auto)` `pnpm exec playwright test --grep "订单详情"` — 订单列表 → 详情，含图片和物流
- `(auto)` `pnpm exec playwright test --grep "Header.*订单"` — 已登录 Header 快速入口
- `(auto)` `! grep -r "customerAccessToken" src/ --include="*.ts" --include="*.tsx" -l` — Classic 代码清理
- `(manual)` 通过 Shopify 托管页完成完整登录流程（跨域，Playwright 无法自动化）
- `(manual)` 通过 Shopify 托管页完成注册和密码重置（涉及真实邮件）
