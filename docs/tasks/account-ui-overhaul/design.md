# Design: account-ui-overhaul

## Overview

5 个步骤，按依赖顺序实现 FR-1 ~ FR-7：

| Step | 内容                                     | FR         |
| ---- | ---------------------------------------- | ---------- |
| 1    | shadcn 安装 + Footer 粘底 + SignInButton | FR-1, FR-6 |
| 2    | Header 改版 + MobileMenu 登录感知        | FR-2, FR-3 |
| 3    | Account Layout 重构                      | FR-4       |
| 4    | Account Overview 卡片化 + Query 扩展     | FR-5       |
| 5    | Checkout Buyer Identity                  | FR-7       |

---

## Step 1: 基础设施 — shadcn 安装 + FR-1 Footer 粘底 + FR-6 SignInButton

**Step Type**: `final`

### 目标

- 安装后续步骤所需的 shadcn 组件
- 修复 Footer 浮空问题
- 提取 `SignInButton` Client Component（供 Step 2 使用）

### 关键变更

**安装组件**（手动执行，不在代码中体现）

```
pnpm dlx shadcn@latest add dropdown-menu card
```

**`src/app/layout.tsx`**

- 在 `<Header />` 和 `<Footer />` 之间为 `{children}` 包一层 `<main className="flex-1">`

**`src/components/layout/SignInButton.tsx`**（新建）

- `"use client"`
- 使用 `usePathname()` 获取当前路径
- 渲染 `<Link href={/api/auth/login?return_to=${pathname}}>Sign in</Link>`
- 样式与当前 Header Sign in 文字链接保持一致

**`src/components/layout/SignInButton.test.tsx`**（新建）

- 使用 `vi.mock("next/navigation", ...)` mock `usePathname`
- 断言 pathname = `/products` 时渲染的 href 为 `/api/auth/login?return_to=/products`
- 断言 pathname = `/` 时 href 为 `/api/auth/login?return_to=/`

### Auto Verification

- `(auto)` `pnpm lint`
- `(auto)` `pnpm vitest run src/components/layout/SignInButton.test.tsx`

### Manual Verification

- `(manual)` 访问任意内容较少的页面（如 `/account`），Footer 贴在视口底部

---

## Step 2: FR-2 Header 改版 + FR-3 MobileMenu 登录感知

**Step Type**: `final`

### 目标

- Header 登录后展示 Avatar + Dropdown，未登录展示 SignInButton
- MobileMenu 根据 `isLoggedIn` prop 渲染不同内容

### 组件设计

**`src/components/layout/UserDropdown.tsx`**（新建，`"use client"`）

接收 `displayName: string`；渲染 shadcn `DropdownMenu`：

- Trigger：shadcn `Avatar`（`AvatarFallback` 显示 initials，取 `displayName` 前两个词首字母大写）
- Items（带 Lucide 图标）：`LayoutDashboard` Overview、`ShoppingBag` Orders、`User` Profile、`MapPin` Addresses
- `Separator`
- Sign out：用 `<form action="/api/auth/logout" method="POST">` 包裹 `DropdownMenuItem`，保持与现有登出一致

**`src/components/layout/Header.tsx`**

- 现有 `getAccessToken()` 调用保留
- 若已登录：`try { customerAccountFetch(accessToken, GET_CUSTOMER_QUERY) }` 获取 `displayName`；异常时 `displayName` fallback 为空字符串（ Avatar 显示"?"）
- 桌面端（`sm:` 及以上）：登录渲染 `<UserDropdown />`，未登录渲染 `<SignInButton />`
- 向 `<MobileMenu>` 传入 `isLoggedIn` prop

**`src/components/layout/MobileMenu.tsx`**

- 新增 `interface MobileMenuProps { isLoggedIn: boolean }`
- 已登录：渲染 Overview、Orders 链接 + Sign out 表单；移除固定 Account 链接
- 未登录：渲染 Sign in 链接（指向 `/api/auth/login`，无 return_to）

### 测试变更

**`tests/e2e/customer-account.spec.ts`**

- 更新 "Header Auth State" suite：
  - "无 token 时 Sign in 链接" → 等待 hydration，断言 href 匹配 `/api/auth/login?return_to=/`（SignInButton 是 Client Component，需 hydration 后才携带 return_to）
  - 新增：注入 mock token，访问 `/`，断言 Avatar 按钮可见、Sign in 不可见
  - 新增：点击 Avatar，断言下拉菜单出现，含 Overview / Orders / Profile / Addresses / Sign out 条目
  - 新增：打开下拉菜单后按 Escape，断言菜单消失
  - 更新 "Header 已登录用户可直接跳转订单列表" → 改为通过展开 Avatar 下拉菜单，点击 Orders 项后验证跳转

**`tests/e2e/mobile-menu.spec.ts`**

- 新增 suite "MobileMenu Auth State"：
  - 无 token：打开菜单，断言 Sign in 可见，Overview / Orders / Sign out 不可见
  - 注入 mock token：打开菜单，断言 Overview / Orders / Sign out 可见，Sign in 不可见

### Auto Verification

- `(auto)` `pnpm lint`
- `(auto)` `pnpm playwright test tests/e2e/customer-account.spec.ts`
- `(auto)` `pnpm playwright test tests/e2e/mobile-menu.spec.ts`

### Manual Verification

- `(manual)` 登录状态下点击 Avatar，下拉菜单样式正确（图标对齐、分隔线正常）
- `(manual)` 点击菜单外部区域，菜单关闭

---

## Step 3: FR-4 Account Layout 重构

**Step Type**: `final`

### 目标

扩大容器宽度，侧边栏增加用户信息块、图标和 active 状态，移动端改为图标 Tab Bar。

### 组件设计

**`src/components/account/AccountNav.tsx`**（新建，`"use client"`）

接收 `displayName: string`、`email: string`：

- 使用 `usePathname()` 判断 active 路由
- **桌面端**（`md:flex hidden flex-col`）：
  - 顶部：`Avatar`（`w-10 h-10` initials）+ displayName + email（`truncate`）
  - `<hr />`
  - 四个导航项（`LayoutDashboard` / `ShoppingBag` / `User` / `MapPin`）；active 时加 `bg-gray-100 font-semibold rounded-md`
  - 底部：Sign out 表单（`LogOut` 图标，`text-red-600`）
- **移动端**（`flex md:hidden`，页面顶部 Tab Bar）：
  - 四个 Tab，各含图标 + 文字；active 时 `border-b-2 border-gray-900`

**`src/app/account/layout.tsx`**

- 新增 customer 数据获取：`customerAccountFetch(accessToken, GET_CUSTOMER_QUERY)`
- 异常时 fallback（`displayName: "Account"`, `email: ""`），不中断渲染
- 容器改为 `max-w-7xl`，侧边栏宽度改为 `md:w-64`
- 渲染 `<AccountNav displayName={...} email={...} />`

### 测试变更

**`tests/e2e/customer-account.spec.ts`** — 新增 suite "Account Layout"：

- 注入 mock token，设置桌面视口（1280×800），访问 `/account`：
  - 断言侧边栏显示 "Ada Lovelace" 和 "ada@example.com"
  - 断言 Overview 导航项包含 active 样式（通过 `aria-current` 或 class）
- 访问 `/account/orders`：断言 Orders 导航项为 active，Overview 不为 active
- 设置移动视口（375×812），访问 `/account`：断言 Tab Bar 可见，点击 Orders Tab 跳转到 `/account/orders`

### Auto Verification

- `(auto)` `pnpm lint`
- `(auto)` `pnpm playwright test tests/e2e/customer-account.spec.ts`

### Manual Verification

- `(manual)` 桌面端：大屏（≥ 1280px）账户页两侧空白明显减少，内容填充宽屏
- `(manual)` 桌面端：Sign out 按钮呈红色，带 LogOut 图标
- `(manual)` 移动端：Tab Bar 图标 + 文字对齐，active 下划线清晰

---

## Step 4: FR-5 Account Overview 卡片化 + GET_CUSTOMER_QUERY 扩展

**Step Type**: `final`

### 目标

- 扩展 `GET_CUSTOMER_QUERY` 以返回地址数量
- Account Overview 改为三卡片布局

### 关键变更

**`src/lib/shopify/customer-account/queries/customer.ts`**

在现有 `orders(first: 100)` 字段后追加：

```graphql
addresses(first: 100) {
  nodes { id }
  pageInfo { hasNextPage }
}
```

**运行 codegen**（手动执行）

```
pnpm codegen
```

生成的 `customer.generated.d.ts` 会自动包含新的 `addresses` 字段。

**`tests/e2e/customer-account-mock-server.mjs`**

- `initialState()` 的 `customer` 对象新增：
  ```js
  addresses: {
    nodes: state.addresses.map(a => ({ id: a.id })),
    pageInfo: { hasNextPage: false }
  }
  ```
- `GetCustomer` case 改为动态读取 `state.addresses` 长度（注意 state 是 mutable，需在 handler 内计算）

**`src/app/account/page.tsx`**

重写页面：

- 顶部：Avatar（`size-16`）+ displayName + email，优化间距
- 下方：shadcn `Card` 三列 grid（`grid gap-4 sm:grid-cols-3`）
  - Orders 卡片：显示 `orderCountLabel` 订单数，点击 → `/account/orders`
  - Addresses 卡片：显示 `addressCountLabel`（同 orders 逻辑处理 hasNextPage），点击 → `/account/addresses`
  - Profile 卡片：固定入口，点击 → `/account/profile`
- 数量数据直接从已获取的 `data.customer` 中读取（`customer.orders` + `customer.addresses`）

### 测试变更

**`tests/e2e/customer-account.spec.ts`** — 新增 suite "Account Overview"：

- 注入 mock token，访问 `/account`：
  - 断言三张卡片可见（通过 card 内的链接/标题文字）
  - 点击 Orders 卡片跳转到 `/account/orders`
  - 点击 Addresses 卡片跳转到 `/account/addresses`
  - 点击 Profile 卡片跳转到 `/account/profile`
  - 断言 Orders 卡片显示数字 "1"（mock 数据有 1 笔订单）
  - 断言 Addresses 卡片显示数字 "2"（mock 数据有 2 个地址）

### Auto Verification

- `(auto)` `pnpm lint`
- `(auto)` `pnpm playwright test tests/e2e/customer-account.spec.ts`

### Manual Verification

- `(manual)` 三张卡片在桌面端、移动端各视口下排列正常，间距美观

---

## Step 5: FR-7 Checkout Buyer Identity

**Step Type**: `final`

### 目标

在 OAuth 回调成功后，将 customer access token 关联到当前购物车，使已登录用户进入 Shopify checkout 时自动识别身份。

### 关键变更

**`src/lib/shopify/storefront/mutations/cart.ts`**

追加 `CART_BUYER_IDENTITY_UPDATE_MUTATION`：

```graphql
mutation CartBuyerIdentityUpdate($cartId: ID!, $buyerIdentity: CartBuyerIdentityInput!) {
  cartBuyerIdentityUpdate(cartId: $cartId, buyerIdentity: $buyerIdentity) {
    cart {
      id
    }
    userErrors {
      field
      message
    }
  }
}
```

**运行 codegen**（手动执行）

```
pnpm codegen
```

**`src/lib/actions/cart.ts`**

新增 Server Action `updateCartBuyerIdentity`：

- 读取 `cartId` cookie；若无则直接 return（不抛出）
- 调用 `shopifyFetch({ document: CART_BUYER_IDENTITY_UPDATE_MUTATION, variables: { cartId, buyerIdentity: { customerAccessToken } } })`
- 整个函数用 try/catch 包裹，静默失败，不影响调用方

**`src/app/api/auth/callback/route.ts`**

在 `await setTokenCookies(tokens)` 之后追加：

```ts
const cartId = cookieStore.get("cartId")?.value;
if (cartId) {
  await updateCartBuyerIdentity(tokens.access_token).catch(() => {});
}
```

**`src/lib/actions/cart.test.ts`**（若已存在则追加，否则新建）

单元测试 `updateCartBuyerIdentity`：

- mock `next/headers` 的 `cookies()`，mock `@/lib/shopify/storefront/client` 的 `shopifyFetch`
- Case 1：`cartId` cookie 存在 → `shopifyFetch` 被调用，参数含 `cartId` 和 `customerAccessToken`
- Case 2：`cartId` cookie 不存在 → `shopifyFetch` 未被调用
- Case 3：`shopifyFetch` 抛出异常 → 函数静默返回，不抛出

### Auto Verification

- `(auto)` `pnpm lint`
- `(auto)` `pnpm vitest run src/lib/actions/cart.test.ts`

### Manual Verification

- `(manual)` 已登录状态下，将商品加入购物车，点击 Checkout，进入 Shopify checkout 页面时账户已关联（无需重新登录）

---

## Task Acceptance

> 由 `verify-task` 检查，对应 `requirements.md` 中的 AC-1 ~ AC-7。

### AC-1 Footer 粘底

- `(manual)` 访问 `/account`（内容较少），Footer 贴在视口底部

### AC-2 Header 状态展示

- `(auto)` `pnpm playwright test tests/e2e/customer-account.spec.ts --grep "Header Auth State"`
- `(auto)` `pnpm playwright test tests/e2e/customer-account.spec.ts --grep "Avatar"`

### AC-3 return_to

- `(auto)` `pnpm playwright test tests/e2e/customer-account.spec.ts --grep "return_to"`

### AC-4 MobileMenu

- `(auto)` `pnpm playwright test tests/e2e/mobile-menu.spec.ts --grep "Auth State"`

### AC-5 Account Layout

- `(auto)` `pnpm playwright test tests/e2e/customer-account.spec.ts --grep "Account Layout"`
- `(manual)` 桌面端（≥ 1280px）账户页宽屏展示正常，不聚集在窄列中间

### AC-6 Account Overview

- `(auto)` `pnpm playwright test tests/e2e/customer-account.spec.ts --grep "Account Overview"`

### AC-7 Checkout Buyer Identity

- `(auto)` `pnpm vitest run src/lib/actions/cart.test.ts`
- `(manual)` 已登录 + 有商品的购物车，进入 Shopify checkout 无需重新登录
