# Design: refactor-ui-shadcn

## Overview

7 个步骤，按依赖关系排序：先安装组件包（Step 1），再按交互复杂度从高到低实现（Sheet → Select → Button → Input/Label → Checkbox/Avatar → Badge/Skeleton）。所有步骤均不改动 Server Action、数据获取逻辑或路由结构。

---

## Step 1: 安装所有缺失的 shadcn 组件

**Step Type**: `intermediate`

运行一次性安装命令，将所有后续步骤所需的 shadcn 组件写入 `src/components/ui/`。无业务代码变更。

```bash
pnpm dlx shadcn@latest add sheet select input label checkbox avatar badge skeleton
```

安装后 `src/components/ui/` 应新增：`sheet.tsx`、`select.tsx`、`input.tsx`、`label.tsx`、`checkbox.tsx`、`avatar.tsx`、`badge.tsx`、`skeleton.tsx`。

### Auto Verification

- `(auto)` `ls src/components/ui/` — 确认 8 个新文件均存在

### Manual Verification

- `(manual)` 无

---

## Step 2: Sheet — CartDrawer + MobileMenu

**Step Type**: `final`

### CartDrawer

将手写的 fixed 定位抽屉替换为 shadcn `Sheet`。

关键映射：

- `isOpen` → `<Sheet open={isOpen} onOpenChange={(o) => !o && closeCart()}>`
- `side="right"` — 保持右侧滑入行为
- 原 close 按钮 → `<SheetClose>` 或保留手写按钮（均可）
- backdrop 由 Sheet 内置处理，删除手写 `<div className="fixed inset-0 z-40 bg-black/30">`
- Escape 关闭由 Radix 内置处理，删除手写 `useEffect` keydown 监听（CartDrawer 原本没有，MobileMenu 有）
- `SheetTitle` 设为 "Your Cart"（满足 Radix 无障碍要求）

### MobileMenu

将手写全屏覆盖菜单替换为 shadcn `Sheet`。

关键映射：

- `isOpen` → `<Sheet open={isOpen} onOpenChange={setIsOpen}>`
- `side="left"` + `className="w-full"` — 覆盖默认宽度实现全屏效果
- Escape 关闭由 Radix 内置，删除手写 `useEffect` keydown 监听
- backdrop 由 Sheet 内置，删除手写 backdrop div
- `SheetTitle` 设为 "Menu"（满足无障碍要求，可用 `sr-only` 隐藏）

### Auto Verification

- `(auto)` `pnpm lint`
- `(auto)` `pnpm test:unit`

### Manual Verification

- `(manual)` [automation-candidate] CartDrawer 从右侧滑入，点击 backdrop 关闭，Escape 关闭
- `(manual)` [automation-candidate] MobileMenu 全屏展开，点击导航链接后关闭，Escape 关闭

---

## Step 3: Select — 变体选择器与集合筛选

**Step Type**: `final`

将 `ProductForm.tsx`、`VariantSelector.tsx`、`CollectionFilters.tsx` 中的原生 `<select>` 替换为 shadcn `Select`。

shadcn Select API 与原生 `<select>` 的差异：

- `onChange` → `onValueChange: (value: string) => void`
- 无需 `<option>` — 改用 `<SelectItem value={name}>{name}</SelectItem>`
- 需要 `<SelectTrigger>` + `<SelectContent>` 包裹

`CollectionFilters` 中 sort 为空字符串时表示"默认"；shadcn Select 不接受空字符串作为值，改用 `"default"` 作为内部值，读取时映射回空字符串传给 `updateParam`。

### Auto Verification

- `(auto)` `pnpm lint`
- `(auto)` `pnpm test:unit`

### Manual Verification

- `(manual)` [automation-candidate] 商品详情页选择变体后价格和库存状态正确更新
- `(manual)` 集合页排序切换后商品列表重新加载

---

## Step 4: Button — 统一使用 shadcn Button

**Step Type**: `final`

替换以下位置的原生 `<button>` 和样式化 `<a>`：

| 文件                                 | 替换内容                            | 注意事项                                                                |
| ------------------------------------ | ----------------------------------- | ----------------------------------------------------------------------- |
| `AddToCartButton.tsx`                | Add to Cart 按钮、Out of Stock 按钮 | 禁用态用 `disabled` prop；Out of Stock 用 `variant="secondary"`         |
| `CartItem.tsx`                       | 数量 `-`/`+` 按钮、Remove 按钮      | 数量按钮用 `variant="outline" size="icon"`；Remove 用 `variant="ghost"` |
| `CartSummary.tsx`                    | Checkout `<a>`                      | 用 `<Button asChild><a href={checkoutUrl}>Checkout</a></Button>`        |
| `AccountLayout.tsx`                  | Sign out `<button>`                 | 用 `variant="ghost"`                                                    |
| `ProfilePage`                        | Save changes                        | 默认 variant                                                            |
| `NewAddressPage` / `EditAddressPage` | Save address / Save changes         | 默认 variant                                                            |

### Auto Verification

- `(auto)` `pnpm lint`
- `(auto)` `pnpm test:unit`

### Manual Verification

- `(manual)` 加入购物车按钮在 pending 时禁用且显示 "Adding..."
- `(manual)` Checkout 按钮正确跳转到 Shopify 结账页
- `(manual)` CartItem 数量加减和 Remove 功能正常

---

## Step 5: Input + Label — 表单字段

**Step Type**: `final`

替换以下位置的原生 `<input>` 和 `<label>`：

| 文件                              | 字段                                                               |
| --------------------------------- | ------------------------------------------------------------------ |
| `SearchBox.tsx`                   | 搜索输入框 + Search 按钮（按钮已在 Step 4 处理，此处仅替换 input） |
| `ProfilePage`                     | firstName、lastName、email                                         |
| `NewAddressPage` 的 `Field` 函数  | 所有地址字段（通过替换 `Field` 内部实现即可批量覆盖）              |
| `EditAddressPage` 的 `Field` 函数 | 同上                                                               |

所有页面均为 RSC，shadcn `Input` 和 `Label` 是纯展示组件，直接 import 使用，无需改动组件类型。

两个地址页面（new / edit）中的 `Field` 函数结构相同，可抽取为共享的 `AddressField` 服务端组件（`src/components/account/AddressField.tsx`）以消除重复，但不强制要求——如果抽取，需在两处 page 中 import。

### Auto Verification

- `(auto)` `pnpm lint`
- `(auto)` `pnpm test:unit`

### Manual Verification

- `(manual)` [automation-candidate] 搜索框输入后提交，跳转到搜索结果页
- `(manual)` 个人资料表单填写后提交成功
- `(manual)` 新增/编辑地址表单字段均可正常输入和提交

---

## Step 6: Checkbox + Avatar — 客户端组件拆分

**Step Type**: `final`

### Checkbox（B2）

**CollectionFilters.tsx**（已是 `"use client"`）：直接将原生 `<input type="checkbox">` 替换为 shadcn `Checkbox`。

shadcn Checkbox API 差异：

- 无 `checked` + `onChange`，改用 `checked` + `onCheckedChange: (checked: boolean | "indeterminate") => void`
- Checkbox 渲染一个隐藏 `<input type="hidden" name=... value=...>` 供表单提交使用（此处不涉及表单，仅 URL 参数，无影响）

**地址表单**（RSC）：

1. 新建 `src/components/account/DefaultAddressCheckbox.tsx`（`"use client"`）
2. 组件内部用 shadcn `Checkbox` + `Label` 展示"Set as default address"
3. 用隐藏的 `<input type="hidden" name="defaultAddress" value={checked ? "true" : ""}>` 确保 Server Action 能读取到表单值
4. 在 `NewAddressPage` 和 `EditAddressPage` 中 import 并替换原 `<input type="checkbox">` 行

### Avatar（B3）

1. 新建 `src/components/account/CustomerAvatar.tsx`（`"use client"`）
2. 组件接收 `displayName: string`，内部用 shadcn `Avatar` + `AvatarFallback` 展示 initials
3. 在 `app/account/page.tsx`（RSC）中 import `CustomerAvatar`，替换手写 initials div

### Auto Verification

- `(auto)` `pnpm lint`
- `(auto)` `pnpm test:unit`

### Manual Verification

- `(manual)` CollectionFilters "In Stock Only" 勾选/取消后 URL 参数正确更新
- `(manual)` 新增地址时勾选"Set as default"，Server Action 正确接收到该值
- `(manual)` 账户概览页 Avatar 显示姓名 initials

---

## Step 7: Badge + Skeleton — 纯展示组件

**Step Type**: `final`

### Badge（B4）

在 `src/components/product/ProductCard.tsx` 中：

- Sale `<span>` → `<Badge variant="destructive">Sale</Badge>`
- Sold Out `<span>` → `<Badge variant="secondary">Sold Out</Badge>`

`ProductCard` 为 RSC，`Badge` 是纯展示组件，直接 import，无需任何额外处理。

### Skeleton（B5）

在 `src/components/search/SearchResultsSkeleton.tsx` 中：

- 将每个商品占位的 `<div className="animate-pulse">` 内部结构改用 shadcn `Skeleton` 替换手写的 `bg-gray-200` div

`SearchResultsSkeleton` 为 RSC，直接使用。

### Auto Verification

- `(auto)` `pnpm lint`
- `(auto)` `pnpm test:unit`

### Manual Verification

- `(manual)` [automation-candidate] 商品列表页 Sale / Sold Out 标签正常显示
- `(manual)` 搜索页加载时骨架屏正常渲染

---

## Task Acceptance

对应 requirements.md 中的 6 条验收标准：

- `(auto)` `ls src/components/ui/ | grep -E "sheet|select|input|label|checkbox|avatar|badge|skeleton"` — 8 个组件文件均存在（AC1）
- `(auto)` `pnpm lint` — 无 ESLint 错误，无 TypeScript 类型错误（AC3）
- `(auto)` `pnpm test:unit` — 所有单元测试通过（AC4）
- `(manual)` CartDrawer 和 MobileMenu 开关交互正常，无视觉回归（AC5）
- `(manual)` 变体选择、加入购物车、表单提交流程功能正常（AC5）
- `(manual)` 检查 `AccountPage`、`NewAddressPage`、`EditAddressPage` 的组件类型：父页面无 `"use client"`，`CustomerAvatar` 和 `DefaultAddressCheckbox` 有 `"use client"`（AC6）
- `(manual)` 全局搜索 `className=".*rounded-md bg-gray-900.*"` 等手写 button 样式不再出现在非 ui/ 目录下（AC2）
