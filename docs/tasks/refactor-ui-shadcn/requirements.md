# Requirements: refactor-ui-shadcn

## Goal

将项目中手写的原生 HTML 元素（button、select、input、checkbox 等）和自定义交互组件（抽屉、移动菜单）替换为 shadcn/ui 提供的对应组件，统一 UI 风格与交互规范，减少重复的 className 维护成本。

## Background and Motivation

项目已引入 shadcn/ui，但仅安装了 `button` 和 `sonner`，其余组件均未使用。当前代码中存在大量手写样式的原生元素（`<button>`、`<select>`、`<input>`），focus ring、圆角、边框颜色等细节分散在各组件中，不一致且难以统一维护。CartDrawer 和 MobileMenu 完全手写了 Drawer/Sheet 交互逻辑（portal、动画、Escape 键、backdrop），有现成的 shadcn Sheet 可以替代。

## Functional Requirements

### A1 — Sheet：CartDrawer

- 使用 shadcn `Sheet` 组件替换 `src/components/cart/CartDrawer.tsx` 中手写的抽屉实现
- 保留现有功能：右侧滑入、点击 backdrop 关闭、Escape 关闭、购物车列表与汇总渲染
- 组件仍为 `"use client"`，外部接口（props/context 用法）不变

### A2 — Sheet：MobileMenu

- 使用 shadcn `Sheet` 组件替换 `src/components/layout/MobileMenu.tsx` 中手写的全屏覆盖菜单
- 保留现有功能：汉堡按钮触发、导航链接列表、点击链接后关闭、Escape 关闭
- 组件仍为 `"use client"`

### A3 — Select：变体选择器与集合筛选

- 使用 shadcn `Select` 组件替换以下三处原生 `<select>`：
  - `src/components/product/ProductForm.tsx`（商品变体选择）
  - `src/components/product/VariantSelector.tsx`（变体选择器）
  - `src/components/collection/CollectionFilters.tsx`（排序筛选）
- 保留现有的 onChange 逻辑，值传递行为不变

### A4 — Button：统一使用 shadcn Button

- 将以下位置的原生 `<button>` 和样式化 `<a>` 替换为 shadcn `Button`：
  - `AddToCartButton.tsx`（Add to Cart、Out of Stock 禁用态）
  - `CartItem.tsx`（数量加减、Remove 按钮）
  - `CartSummary.tsx`（Checkout 链接）
  - `AccountLayout.tsx`（Sign out 按钮）
  - 账户表单页（Save changes、Save address 提交按钮）
- `CartIconButton.tsx`（图标按钮）不在此次范围内

### B1 — Input + Label：表单字段

- 使用 shadcn `Input` 和 `Label` 替换以下位置的原生元素：
  - `app/account/profile/page.tsx`（firstName、lastName、email）
  - `app/account/addresses/new/page.tsx` 及 `/[id]/edit/page.tsx`（所有地址字段）
  - `src/components/search/SearchBox.tsx`（搜索输入框）
- 页面保持 RSC，`Input`/`Label` 作为纯展示组件直接使用

### B2 — Checkbox：筛选与地址表单

- 使用 shadcn `Checkbox` 替换以下位置的原生 checkbox：
  - `CollectionFilters.tsx`（In Stock Only）— 已是客户端组件，直接替换
  - 地址表单（Set as default address）— 提取为 `"use client"` 子组件 `<DefaultAddressCheckbox />`，父页面保持 RSC
- Checkbox 的 `name` 属性保留，确保 Server Action 表单提交时值正常传递

### B3 — Avatar：账户概览

- 在 `app/account/page.tsx` 中，将手写 initials 圆形 div 替换为 shadcn `Avatar`（含 `AvatarFallback`）
- 由于 Avatar 依赖 Radix hooks，提取为 `"use client"` 子组件 `<CustomerAvatar name={displayName} />`
- 父页面 `AccountPage` 保持 RSC

### B4 — Badge：商品卡片标签

- 使用 shadcn `Badge` 替换 `src/components/product/ProductCard.tsx` 中的 Sale / Sold Out `<span>`
- `ProductCard` 为 RSC，`Badge` 是纯展示组件，直接使用，无需改动组件类型

### B5 — Skeleton：搜索结果占位

- 使用 shadcn `Skeleton` 替换 `src/components/search/SearchResultsSkeleton.tsx` 中手写的 `animate-pulse` div
- 组件为 RSC，替换后保持结构不变

## Non-Functional Requirements

- 替换后所有页面不引入新的 `"use client"` 边界，Avatar 和 Checkbox 的客户端拆分须最小化（仅拆分必要部分）
- 不修改任何 Server Action、数据获取逻辑、路由结构
- 不修改 Tailwind 主题配置或 shadcn 的 CSS 变量

## Out of Scope

- 优先级 C 组件（Card、Separator、Pagination）
- `CartIconButton.tsx`（图标 + 计数徽章，自定义逻辑强）
- `AnnouncementBar.tsx`（业务逻辑特殊）
- 账户页面整体 UI 改版（仅替换组件原语，不改版面结构）
- 深色模式适配

## Acceptance Criteria

1. 所有 A 组和 B 组中列出的 shadcn 组件已安装（`pnpm dlx shadcn@latest add <component>`）
2. 对应原生元素已被 shadcn 组件替换，不存在遗漏的手写 `<button className="rounded-md bg-gray-900 ...">` 等重复样式
3. `pnpm lint` 通过，无类型错误
4. `pnpm test:unit` 通过，无 snapshot 或逻辑回归
5. CartDrawer 开关、MobileMenu 开关、变体选择、加入购物车、表单提交流程功能正常
6. Avatar 和 DefaultAddressCheckbox 已正确拆分为 `"use client"` 子组件，父页面仍为 RSC
