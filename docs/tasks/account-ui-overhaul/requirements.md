# Requirements: account-ui-overhaul

## Goal

重构账户相关 UI，使其达到专业电商水准；同时修复两个 Auth 缺陷：guest 登录后无法回到原页面、已登录用户进入 checkout 仍被要求重新登录。

## Background and Motivation

当前账户 UI 存在以下明显问题：

- Header 登录后显示两个孤立文字链接（Orders + Account），没有用户身份感，不符合现代电商惯例
- Account Layout 侧边栏无 active 状态指示、无图标、内容聚集在窄列（max-w-4xl），大屏下两侧空白过多
- Account Layout 无用户信息概览（头像、姓名）
- 内容少时 Footer 浮在屏幕中间（`flex-1` 缺失）
- MobileMenu 不感知登录状态，无论是否登录都显示固定链接
- Account Overview 页仅显示头像 + 邮件两行，信息密度极低
- Guest 从任意页面点击 Sign in 后，登录完成固定跳到 `/account`，无法回到原来浏览的页面
- 已登录用户进入 checkout 时，Shopify checkout 页面仍要求重新登录（cart 未关联 buyer identity）

## Functional Requirements

### FR-1 全局 Layout：Footer 粘底

- `body` 已有 `flex min-h-full flex-col`，在 `<Header>` 和 `<Footer>` 之间的 `{children}` 外包一层 `<main className="flex-1">`
- 任何内容较少的页面（如 Account Overview），Footer 必须始终贴在视口底部

### FR-2 Header：用户状态展示

- **未登录**：显示 Sign in 按钮（文字链接样式），点击跳转到 `/api/auth/login?return_to={当前路径}`
- **已登录**：显示圆形 Avatar 按钮（显示 displayName 的 initials，如 "SL"），点击展开下拉菜单
- 下拉菜单包含带 Lucide 图标的导航项：Overview、Orders、Profile、Addresses，以及分隔线后的 Sign out（POST 到 `/api/auth/logout`）
- 点击菜单外部或按 Escape 关闭下拉菜单
- 桌面端（`sm:` 及以上）显示 Avatar/Sign in；移动端由 MobileMenu 承担

### FR-3 MobileMenu：登录状态感知

- MobileMenu 接受 `isLoggedIn: boolean` prop（由 Header Server Component 传入）
- **已登录**：菜单包含 Overview、Orders 导航链接，以及 Sign out 表单按钮
- **未登录**：菜单包含 Sign in 链接（指向 `/api/auth/login`，无需 return_to）

### FR-4 Account Layout：整体重构

#### 宽度和容器

- 容器宽度从 `max-w-4xl` 改为 `max-w-7xl`，与整站一致
- 桌面端侧边栏宽度从 `md:w-48` 增加到 `md:w-64`

#### 桌面端侧边栏

- 顶部展示用户信息块：圆形 initials 头像（`w-10 h-10`）、displayName、email（过长时截断）
- 分隔线
- 导航项（带 Lucide 图标）：
  - `LayoutDashboard` → Overview（`/account`）
  - `ShoppingBag` → Orders（`/account/orders`）
  - `User` → Profile（`/account/profile`）
  - `MapPin` → Addresses（`/account/addresses`）
- 当前路由高亮 active 状态（背景色 `bg-gray-100` + 字体 `font-semibold` + 圆角）
- 底部 Sign out 按钮（`LogOut` 图标，红色文字，POST 到 `/api/auth/logout`）

#### 移动端 Tab Bar（C1 方案）

- 移动端（`md:hidden`）在页面顶部显示图标 + 文字的 Tab Bar，替代原横向文字链接
- 四个标签：Overview / Orders / Profile / Addresses（各配对应图标）
- active 标签显示下划线或背景高亮

### FR-5 Account Overview：卡片化

- 顶部保留头像 + 姓名 + email（适当优化间距）
- 下方改为三张可点击卡片（grid 布局）：
  - 📦 **Orders**：显示最近订单数量，点击 → `/account/orders`
  - 📍 **Addresses**：显示地址数量，点击 → `/account/addresses`
  - 👤 **Profile**：固定入口，点击 → `/account/profile`
- 数据来源：扩展 `GET_CUSTOMER_QUERY`，在现有 `orders` 字段旁增加 `addresses(first: 100) { nodes { id } pageInfo { hasNextPage } }`；同步更新 `customer-account-mock-server.mjs` 的 `GetCustomer` case 以返回 addresses 数量

### FR-6 Auth：Guest 登录后回到原页面（return_to）

- 提取 `SignInButton` 为独立 Client Component，使用 `usePathname()` 获取当前路径
- 构造登录链接为 `/api/auth/login?return_to={currentPathname}`
- 登录流程（`login/route.ts` + `callback/route.ts`）已正确实现 return_to，**无需修改**
- 覆盖范围：Header 中的 Sign in 入口；MobileMenu 中的 Sign in 无需带 return_to（关闭菜单后路径不变，功能可接受）

### FR-7 Auth：Checkout 关联 Buyer Identity

- 在 Storefront API mutations 中添加 `cartBuyerIdentityUpdate` mutation，并运行 `pnpm codegen` 生成对应类型
- 添加 Server Action `updateCartBuyerIdentity(customerAccessToken: string)`：
  - 读取 `cartId` cookie；若无 cartId 则直接返回
  - 调用 mutation，`buyerIdentity: { customerAccessToken }`
  - 静默失败，不影响主登录流程
- 在 `auth/callback/route.ts` 登录成功写入 token cookie 后，若存在 `cartId` cookie，调用此 Action
- 预期效果：已登录用户进入 Shopify checkout 时，Shopify 自动识别买家身份，无需在 checkout 页面再次登录

## UI Component Strategy

项目已初始化 shadcn（style: `base-nova`，CSS 变量，Lucide 图标库）。本 task 按复杂度混合使用：

| 组件                        | 方案                                                   |
| --------------------------- | ------------------------------------------------------ |
| UserDropdown                | shadcn `DropdownMenu`（键盘导航、焦点管理、aria 内置） |
| Avatar（initials 圆形）     | shadcn `Avatar`（fallback 逻辑内置，**已安装**）       |
| Account Overview 卡片       | shadcn `Card`                                          |
| AccountNav 侧边栏 / Tab Bar | 原生 Tailwind + Lucide（纯导航链接，无需 shadcn）      |
| SignInButton、Layout 容器   | 原生 Tailwind                                          |

需提前安装：`pnpm dlx shadcn@latest add dropdown-menu card`（`avatar` 已安装，无需重复）

## Non-Functional Requirements

- **性能**：Header 获取 customer displayName 为额外的 Customer Account API 调用，需确保不阻塞页面渲染（RSC 并发执行，可接受）
- **安全**：`SignInButton` 中的 return_to 路径仅允许相对路径（`/` 开头且不以 `//` 开头），防止开放重定向攻击；`login/route.ts` 中的 `getSafeReturnTo()` 已实现此校验，无需重复处理
- **兼容性**：`cartBuyerIdentityUpdate` 中传入的 Customer Account API access token 在 Shopify Storefront API 2024-01+ 版本中受支持；若 API 版本不支持则静默失败，不影响其他功能

## Out of Scope

- Shopify 后台配置变更（如切换 Classic → New Customer Accounts，这是 checkout 登录问题的另一种根因）
- 用户头像图片上传（initials 圆形为唯一方案）
- 订单搜索 / 筛选功能
- 地址管理页面的 UI 改进（仅 Layout 层的容器宽度受益，页面内部 UI 不在此次范围内）
- Dark mode 支持
- 邮件订阅 / Newsletter 功能（Footer 中的订阅 input 不在此次范围内）

## Acceptance Criteria

> **自动化说明**：标注 ✅ 的条目使用 Playwright E2E + Customer Account mock server 实现；标注 ⚠️ 的条目技术上可行但存在脆弱性，需在实现时酌情取舍；标注 ❌ 的条目依赖真实第三方环境，只能人工验收。

> **现有测试影响**：FR-2 / FR-6 完成后，`customer-account.spec.ts` 中以下两条测试需同步更新：
>
> - "Header Auth State" — 当前检查 `href="/api/auth/login"`，改后需改为检查 href 包含 `/api/auth/login?return_to=`
> - "Customer Account Task Acceptance" 最后一条 — 当前通过直接 Orders 链接验证，改后需通过展开 Avatar 下拉菜单验证

### AC-1 Footer 粘底

- [ ] 在 Account Overview 页面，内容少时 Footer 贴在视口底部，不浮在屏幕中间
  - ✅ E2E：注入 mock token，访问 `/account`，断言 `footer` 的 `boundingBox().bottom` ≈ viewport height

### AC-2 Header 状态展示

- [ ] 未登录时，Header 显示 Sign in 文字链接
  - ✅ E2E：无 token，访问 `/`，断言 Sign in 可见
- [ ] 登录后，Header 显示 initials 圆形 Avatar 按钮
  - ✅ E2E：注入 mock token，访问 `/`，断言 Avatar 按钮可见
- [ ] 点击 Avatar 展开下拉菜单，含 4 个导航项 + Sign out
  - ✅ E2E：点击 Avatar，断言菜单中各选项可见
- [ ] 点击菜单外部或按 Escape 关闭下拉菜单
  - ✅ E2E：打开菜单后按 Escape / 点击外部，断言菜单不可见
- [ ] 点击 Sign out 成功登出并跳回首页
  - ✅ E2E：已有类似测试用例，复用 mock server

### AC-3 return_to

- [ ] 在 `/products` 页面点击 Sign in，完成登录后回到 `/products`
  - ✅ E2E：mock server 已支持完整 OAuth 流程，访问 `/products` → 点 Sign in → 断言回到 `/products`
- [ ] 在 `/collections` 页面点击 Sign in，完成登录后回到 `/collections`
  - ✅ E2E：同上

### AC-4 MobileMenu

- [ ] 未登录时，Mobile 菜单显示 Sign in，不显示 Overview / Orders / Sign out
  - ✅ E2E：设置移动端视口，无 token，打开菜单，断言菜单内容
- [ ] 已登录时，Mobile 菜单显示 Overview / Orders / Sign out，不显示 Sign in
  - ✅ E2E：注入 mock token，打开菜单，断言菜单内容

### AC-5 Account Layout

- [ ] 桌面端：侧边栏显示用户 initials + 姓名 + email，各导航项有图标
  - ✅ E2E：注入 mock token，设置桌面视口，断言侧边栏内容
- [ ] 桌面端：当前页面对应的导航项有高亮 active 状态
  - ✅ E2E：访问各 account 子路由，断言对应导航项包含 active class 或可视样式
- [ ] 桌面端：Sign out 显示为红色带图标按钮
  - ⚠️ E2E：可断言按钮可见，但颜色值断言依赖 CSS 计算，脆弱；建议只验证元素存在
- [ ] 移动端：显示图标 Tab Bar，点击跳转正确，active 状态正确
  - ✅ E2E：设置移动端视口，断言 Tab Bar 可见，点击各 Tab 验证跳转和 active 状态
- [ ] 大屏（≥ 1280px）下账户页内容不再聚集在窄列中间
  - ⚠️ E2E：可通过断言内容容器 `offsetWidth` 大于阈值来验证；但宽度断言与 Tailwind 类耦合，脆弱

### AC-6 Account Overview

- [ ] 显示三张卡片（Orders / Addresses / Profile），各卡片点击跳转到对应子页面
  - ✅ E2E：注入 mock token，访问 `/account`，断言三张卡片可见并验证点击跳转
- [ ] Orders 卡片显示订单数量，Addresses 卡片显示地址数量
  - ✅ E2E：mock server `GetCustomer` 需同步扩展以返回 addresses 数量（见 FR-5）

### AC-7 Checkout Buyer Identity

- [ ] 已登录状态下添加商品到购物车后点击 Checkout，进入 Shopify checkout 页面时无需重新登录（或登录框显示已绑定账户信息）
  - ❌ 人工验收：依赖真实 Shopify checkout 环境，E2E 无法进入第三方页面
  - ✅ 可补充单元测试：mock `shopifyFetch`，验证 `updateCartBuyerIdentity` Server Action 在有 `cartId` cookie 时正确调用 `cartBuyerIdentityUpdate` mutation
