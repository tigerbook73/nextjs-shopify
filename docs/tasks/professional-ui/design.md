# Design: professional-ui

## 架构说明

### Server / Client 组件边界原则

| 情形                                | 决策             |
| ----------------------------------- | ---------------- |
| 需要 localStorage / 事件监听        | Client Component |
| 需要 URL 路由更新（router.push）    | Client Component |
| 纯数据展示                          | Server Component |
| 含交互状态（isOpen、selectedIndex） | Client Component |

`Header.tsx` 保持 Server Component，新建 `MobileMenu.tsx`（Client Component）承接汉堡菜单的 toggle 状态，由 Header 引入。

### SEO Metadata

`layout.tsx` 已配置 `title.template = '%s | ShopName'`，子页面只需返回 `{ title: entityTitle }`，会自动组合。`generateMetadata` 与 `page` 函数共用同一个 `getProductByHandle` / `getCollectionByHandle` 调用，Next.js fetch 自动去重，无额外请求。

### Collection 筛选参数映射

| URL 参数       | Shopify sortKey | reverse |
| -------------- | --------------- | ------- |
| `price-asc`    | `PRICE`         | false   |
| `price-desc`   | `PRICE`         | true    |
| `newest`       | `CREATED`       | true    |
| `best-selling` | `BEST_SELLING`  | false   |

筛选：`?available=true` → `filters: [{ available: true }]`

`CollectionFilters.tsx` 只负责 UI 交互并调用 `router.push`；排序/筛选逻辑在 Server Component（`collections/[handle]/page.tsx`）读取 `searchParams` 后传给 `getCollectionByHandle`。

### Cart Drawer 最小 Context

```ts
// src/context/CartContext.tsx
interface CartContextValue {
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
}
```

Provider 包裹 `layout.tsx` 全局；CartDrawer 渲染在 Provider 内部；`/cart` 页面保留不删除。

### Toast 模式

`AddToCartButton`（Client Component）在 `startTransition` 的 await 后直接调用 `toast.success`。
登录/注册 Server Action 返回 `{ error?: string }` 状态，对应 Form 组件 `useEffect` 监听状态变化触发 `toast.error`；Server Action redirect 仍用于成功路径。

---

## 验收协议

**测试门控**：每个 Step 完成前，必须满足以下两个条件才可标记 `done`：

1. **新增 E2E 测试用例**：每个 Step 的设计文档中列出的测试用例必须在对应 spec 文件中实现
2. **全量测试通过**：运行以下命令，所有测试（含本 Step 新增测试 + 历史测试）必须全部绿灯

```bash
pnpm test:e2e
```

> Playwright `webServer` 会自动执行 `pnpm build && pnpm start`，build 失败等同于测试失败。

人工验收项（标注 `[manual]`）不纳入自动门控，Step 完成后列出清单由用户确认。

---

## 步骤拆分

### Step 1 — Announcement Bar

**目标**：全宽促销条，dismiss 后不再显示。

**文件变更**：

- `src/components/layout/AnnouncementBar.tsx` — 新建（Client Component）
- `src/app/layout.tsx` — Body 内 Header 上方插入 `<AnnouncementBar />`

**关键实现**：

- `useSyncExternalStore` 读取 `localStorage`（SSR 安全，无 useEffect setState）
- 点击 `×` → 写 `localStorage` + 本地 state → 立即隐藏

**测试用例**（`tests/e2e/announcement-bar.spec.ts`，Step 完成后必须全部通过）：

| #   | 测试名称                           |
| --- | ---------------------------------- |
| 1   | 首次访问 / 时促销文案可见          |
| 2   | 点击 × 后促销条消失                |
| 3   | dismiss 后重新导航，促销条不再显示 |

**人工验收**：

- `[manual]` 无（本 Step 全部验收均由自动测试覆盖）

---

### Step 2 — Homepage Rewrite

**目标**：三区块首页，替换调试页。

**文件变更**：

- `src/app/page.tsx` — 完全重写（Server Component）
- `public/hero.jpg` — 新增占位图

**关键实现**：

- 顶层 `await Promise.all([getCollections(4), getProducts(8)])`
- Hero：`<Image src="/hero.jpg" priority fill alt="..." />` — `priority` 必须加，否则 LCP 警告
- Hero CTA：两个 `<Link>` 按钮，分别指向 `/products` 和 `/collections`
- 特色系列：`<CollectionCard>` 四列网格（`grid-cols-2 md:grid-cols-4`）
- 热门商品：`<ProductCard>` 四列网格（`grid-cols-2 md:grid-cols-4`）

**测试用例**（`tests/e2e/homepage.spec.ts`，Step 完成后必须全部通过）：

| #   | 测试名称                                         |
| --- | ------------------------------------------------ |
| 1   | 首页不含调试内容，显示 Hero 标题                 |
| 2   | 点击 Shop All Products 跳转至 /products          |
| 3   | 点击 Browse Collections 跳转至 /collections      |
| 4   | 页面含至少一个 CollectionCard 和一个 ProductCard |

**人工验收**：

- `[manual]` 浏览器 DevTools Console 无 LCP image 警告

---

### Step 3 — Footer

**目标**：四列 Footer，接入 layout。

**文件变更**：

- `src/components/layout/Footer.tsx` — 新建（Server Component）
- `src/app/layout.tsx` — `<main>` 外尾部插入 `<Footer />`

**关键实现**：

- 四列：品牌 | 导购 | 账户 | 联系
- 底部版权行：`© {year} 品牌名`，`new Date().getFullYear()` 动态年份
- Newsletter 输入框：`<input type="email">` UI only，无提交逻辑

**测试用例**（`tests/e2e/footer.spec.ts`，Step 完成后必须全部通过）：

| #   | 测试名称                                     |
| --- | -------------------------------------------- |
| 1   | Footer 包含四个区块标题                      |
| 2   | 版权行包含当前年份                           |
| 3   | Newsletter 区域包含 Email 输入框和 Join 按钮 |

**人工验收**：

- `[manual]` 浏览器宽度 ≥ 768px 时四列并排，< 640px 时单列叠放

---

### Step 4 — Mobile Menu

**目标**：小屏导航可用，汉堡图标开关。

**文件变更**：

- `src/components/layout/MobileMenu.tsx` — 新建（Client Component）
- `src/components/layout/Header.tsx` — 引入 `<MobileMenu />`，汉堡按钮 `md:hidden`

**关键实现**：

- `MobileMenu` 接收导航链接配置（或内联），`useState(false)` 管理 `isOpen`
- 全屏覆盖层：`fixed inset-0 z-50 bg-white`
- `useEffect` 监听 `keydown` → ESC 关闭
- 遮罩 `onClick={closeMenu}`；`<Link onClick={closeMenu}>` 点击链接也关闭
- Header 中汉堡按钮：`<button className="md:hidden">` + `lucide-react` `Menu` / `X` 图标

**测试用例**（`tests/e2e/mobile-menu.spec.ts`，Step 完成后必须全部通过）：

| #   | 测试名称                                            |
| --- | --------------------------------------------------- |
| 1   | 移动端（375px）汉堡按钮可见，桌面端（1280px）不可见 |
| 2   | 移动端点击汉堡后全屏菜单出现并含导航链接            |
| 3   | 移动端菜单打开后按 ESC 关闭                         |
| 4   | 移动端点击遮罩关闭菜单                              |
| 5   | 桌面端 nav 链接直接可见，无汉堡按钮                 |

**人工验收**：

- `[manual]` 无（本 Step 全部验收均由自动测试覆盖）

---

### Step 5 — Product Badges

**目标**：ProductCard 展示 SALE / SOLD OUT 徽章。

**文件变更**：

- `src/lib/shopify/queries/product.ts` — `PRODUCT_CARD_FRAGMENT` 增加 `availableForSale` + `compareAtPriceRange`
- `src/lib/shopify/types.ts` — `Product` 类型增加对应字段
- `src/components/product/ProductCard.tsx` — 渲染徽章

**关键实现**：

Fragment 新增字段：

```graphql
availableForSale
compareAtPriceRange {
  minVariantPrice {
    amount
  }
}
```

Type 新增字段：

```ts
availableForSale: boolean;
compareAtPriceRange: {
  minVariantPrice: MoneyV2;
}
```

Badge 条件（绝对定位于图片左上角）：

- SALE（红）：`Number(compareAtPriceRange.minVariantPrice.amount) > Number(priceRange.minVariantPrice.amount)`
- SOLD OUT（灰）：`!availableForSale`；同时图片加 `opacity-50`

**测试用例**（`tests/e2e/product-badges.spec.ts`，Step 完成后必须全部通过）：

| #   | 测试名称                           |
| --- | ---------------------------------- |
| 1   | /products 页面正常渲染，无 JS 错误 |

**人工验收**：

- `[manual]` 在 Shopify Admin 将某商品设为缺货，刷新后该商品卡片显示 SOLD OUT 徽章且图片半透明
- `[manual]` 在 Shopify Admin 给某商品变体添加 Compare at price，刷新后对应卡片显示 SALE 徽章
- `[manual]` 正常在售商品无任何徽章

---

### Step 6 — Product Gallery

**目标**：商品详情页多图画廊，点击缩略图切换主图。

**文件变更**：

- `src/components/product/ProductGallery.tsx` — 新建（Client Component）
- `src/app/products/[handle]/page.tsx` — 替换单张图片为 `<ProductGallery>`

**关键实现**：

- Props：`images: ProductImage[]`
- `useState(0)` 管理 `selectedIndex`
- 布局：左侧缩略图纵列（`flex-col gap-2`）+ 右侧主图（固定高度，`object-contain`）
- 只有 1 张图时隐藏缩略图列
- 主图使用 `<Image fill>` 或固定尺寸；缩略图 `64×64`

**测试用例**（`tests/e2e/product-gallery.spec.ts`，Step 完成后必须全部通过）：

| #   | 测试名称                               |
| --- | -------------------------------------- |
| 1   | 商品详情页正常渲染，主图区域存在于 DOM |

**人工验收**：

- `[manual]` 多图商品：左侧显示缩略图列；点击第二张缩略图后，主图切换为对应图片
- `[manual]` 单图商品：无缩略图列，主图正常显示

---

### Step 7 — Related Products + Product Page SEO

**目标**：商品详情页底部推荐同系列商品，并添加 SEO title。

**文件变更**：

- `src/lib/shopify/queries/product.ts` — `GET_PRODUCT_BY_HANDLE_QUERY` 增加 `collections(first: 1) { nodes { handle } }`
- `src/lib/shopify/types.ts` — `ProductDetail` 增加 `collections: { nodes: { handle: string }[] }`
- `src/components/product/RelatedProducts.tsx` — 新建（async Server Component）
- `src/app/products/[handle]/page.tsx` — 集成 `<Suspense><RelatedProducts /></Suspense>`

> `generateMetadata` 已存在且完整（含 `seo` 字段和 `openGraph`），**保持现状不改动**。

**关键实现**：

`RelatedProducts` 接收 `currentHandle: string`，`collectionHandle: string`：

```ts
const collection = await getCollectionByHandle(collectionHandle, 5);
const related = collection?.products.nodes.filter((p) => p.handle !== currentHandle).slice(0, 4);
```

- 无 collection 或 related 为空时返回 `null`（不渲染区块）

**测试用例**（`tests/e2e/product-seo.spec.ts`，Step 完成后必须全部通过）：

| #   | 测试名称                                        |
| --- | ----------------------------------------------- |
| 1   | 商品详情页 \<title\> 包含商品名（非默认店铺名） |

**人工验收**：

- `[manual]` 属于某 Collection 的商品：页面底部显示"You may also like"区块，含最多 4 张其他商品卡片，不含当前商品
- `[manual]` 不属于任何 Collection 的商品：页面底部无相关商品区块

---

### Step 8 — Collection Filter/Sort + SEO + Empty State

**目标**：Collection 页可排序、可筛选；无结果时显示空状态；添加 SEO title。

**文件变更**：

- `src/lib/shopify/queries/collection.ts` — `GET_COLLECTION_BY_HANDLE_QUERY` 增加变量
- `src/lib/shopify/client.ts` — `getCollectionByHandle` 增加 `sortKey?`、`reverse?`、`filters?` 参数
- `src/components/collection/CollectionFilters.tsx` — 新建（Client Component）
- `src/app/collections/[handle]/page.tsx` — 读 `searchParams`，传参，添加空状态 + `generateMetadata`

**关键实现**：

Query 新增变量：

```graphql
query GetCollectionByHandle(
  $handle: String!
  $first: Int!
  $after: String
  $sortKey: ProductCollectionSortKeys
  $reverse: Boolean
  $filters: [ProductFilter!]
) {
  collection(handle: $handle) {
    ...
    products(first: $first, after: $after, sortKey: $sortKey, reverse: $reverse, filters: $filters) { ... }
  }
}
```

`CollectionFilters` 渲染排序下拉 + "In Stock Only"复选框，变更时：

```ts
// searchParams prop 是 Server Component 传入的初始值（用于初始化 UI 状态）
// 客户端更新 URL 用 useSearchParams() hook 读取当前参数
const currentParams = useSearchParams();
const params = new URLSearchParams(currentParams.toString());
params.set("sort", value);
router.push(`?${params.toString()}`);
```

空状态（`products.nodes.length === 0`）：

```tsx
<p>No products match your filters.</p>
<Link href={`/collections/${handle}`}>Clear filters</Link>
```

`generateMetadata`：

```ts
return { title: collection?.title ?? "Collection" };
```

**测试用例**（`tests/e2e/collection-listing.spec.ts`，Step 完成后必须全部通过）：

| #   | 测试名称                               |
| --- | -------------------------------------- |
| 1   | Collection 详情页 \<title\> 包含系列名 |
| 2   | 选择排序选项后 URL 含 ?sort= 参数      |

**人工验收**：

- `[manual]` 排序切换后商品列表顺序与所选规则一致（需人工比对价格/日期）
- `[manual]` 勾选"In Stock Only"后，缺货商品从列表消失
- `[manual]` 手动在 URL 加入不可能匹配的 filter 参数后，页面显示"No products match"提示和"Clear filters"链接

---

### Step 9 — Cart Drawer

**目标**：加入购物车后右侧 Drawer 滑出，不跳转 /cart 页面。

**文件变更**：

- `src/context/CartContext.tsx` — 新建
- `src/components/cart/CartDrawer.tsx` — 新建（Client Component）
- `src/components/cart/AddToCartButton.tsx` — 成功后调用 `openCart()`，移除 `router.refresh()`
- `src/components/layout/Header.tsx` — 购物车 icon 改为调用 `openCart()`（抽出 Client 子组件 `CartIconButton.tsx`）
- `src/app/layout.tsx` — `<CartProvider>` 包裹 body，插入 `<CartDrawer />`

**关键实现**：

CartContext：

```ts
"use client";
const CartContext = createContext<CartContextValue | null>(null);
export function CartProvider({ children }) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <CartContext.Provider value={{ isOpen, openCart: () => setIsOpen(true), closeCart: () => setIsOpen(false) }}>
      {children}
    </CartContext.Provider>
  );
}
```

CartDrawer：`fixed right-0 top-0 h-full w-80 bg-white shadow-xl transform transition-transform`，`isOpen ? 'translate-x-0' : 'translate-x-full'`

- 遮罩：`fixed inset-0 bg-black/30 z-40`
- 内부复用 `<CartItem>` + `<CartSummary>`

**购物车数据获取（Client Component 方案）**：

CartDrawer 是 Client Component，无法直接使用 Server Component 方式。采用 Server Action 获取数据：

```ts
// Drawer 打开时（isOpen 变为 true），调用 Server Action 获取购物车
const [cart, setCart] = useState<Cart | null>(null);
useEffect(() => {
  if (isOpen) getCartAction().then(setCart);
}, [isOpen]);
```

`getCartAction`：从 cookie 读取 `cartId` → 调用 `getCart(cartId)` → 返回 `Cart | null`。

**测试用例**（`tests/e2e/cart-drawer.spec.ts`，Step 完成后必须全部通过）：

| #   | 测试名称                                            |
| --- | --------------------------------------------------- |
| 1   | 商品详情页点击 Add to Cart 后 Drawer 面板出现且可见 |
| 2   | Drawer 打开后点击遮罩，Drawer 消失                  |
| 3   | 直接访问 /cart 页面正常渲染不报错                   |

**人工验收**：

- `[manual]` 检查 `layout.tsx`，`<CartProvider>` 仅包裹一次

---

### Step 10 — Toast Notifications

**目标**：关键操作（加购、登录、注册、表单错误）有 Toast 反馈。

**文件变更**：

- `package.json` — 添加 `sonner`
- `src/app/layout.tsx` — 引入 `<Toaster />`
- `src/components/cart/AddToCartButton.tsx` — 加入 `toast.success("Added to cart")`
- `src/lib/actions/customer.ts` — login/register action 失败时 return `{ error: string }` 而非 throw
- `src/components/account/LoginForm.tsx` — `useEffect` 监听 action state → `toast.error`
- `src/components/account/RegisterForm.tsx` — 同上

**关键实现**：

`AddToCartButton` 改动最小：

```ts
await addToCart(variantId);
toast.success("Added to cart");
openCart(); // Step 9
```

Server Action 返回模式（login 为例）：

```ts
// 已有：redirect('/account') on success
// 新增：失败时 return { error: 'Invalid email or password' }
```

Form 组件：

```ts
const [state, formAction] = useActionState(login, null);
useEffect(() => {
  if (state?.error) toast.error(state.error);
}, [state]);
```

**测试用例**（`tests/e2e/toast.spec.ts`，需在本 Step 中新建，完成后必须全部通过）：

| #   | 测试名称                                            |
| --- | --------------------------------------------------- |
| 1   | 商品详情页点击 Add to Cart 后页面出现 success Toast |
| 2   | 登录页填写错误密码提交后出现 error Toast            |
| 3   | 注册页填写已注册邮箱提交后出现 error Toast          |
| 4   | Toast 约 4 秒后自动消失                             |

**人工验收**：

- `[manual]` 无（本 Step 全部验收均由自动测试覆盖）

---

### Step 11 — Skeleton Screens + Account Visual

**目标**：路由切换时有骨架屏；账户页有 Avatar 和订单统计。

**文件变更**：

- `src/app/products/loading.tsx` — 新建
- `src/app/collections/loading.tsx` — 新建
- `src/app/account/page.tsx` — 添加 Avatar + 订单数
- `src/app/account/layout.tsx` — Tab 导航改竖排链接列表（桌面）

**关键实现**：

骨架屏参考 `src/app/search/loading.tsx` 风格（灰色 `animate-pulse` 块），与商品/系列网格布局对齐。

账户页 Avatar（姓名首字母）：

```ts
const initials = customer.displayName
  .split(" ")
  .map((w) => w[0])
  .slice(0, 2)
  .join("")
  .toUpperCase();
```

订单数：并行 `Promise.all([getCustomer(token), getCustomerOrders(token)])` 获取。

账户布局（桌面侧边栏）：

```tsx
<nav className="flex flex-col gap-2 border-r pr-8 md:w-48">
  <Link ...>My Account</Link>
  <Link ...>Order History</Link>
</nav>
```

**测试用例**（`tests/e2e/skeleton-screens.spec.ts`，需在本 Step 中新建，完成后必须全部通过）：

| #   | 测试名称                                                  |
| --- | --------------------------------------------------------- |
| 1   | products/loading.tsx 存在且包含 animate-pulse 骨架元素    |
| 2   | collections/loading.tsx 存在且包含 animate-pulse 骨架元素 |

> 骨架屏 E2E 通过网络拦截（`page.route` + 延迟响应）触发 loading 状态，验证 `animate-pulse` 元素可见。

**人工验收**：

- `[manual]` 浏览器 DevTools Network → 调低网速至 Slow 3G，切换至 `/products`，可见骨架屏闪过
- `[manual]` 同上，切换至 `/collections`，可见骨架屏闪过
- `[manual]` 以测试账号登录后，账户页顶部显示姓名首字母 Avatar 圆圈
- `[manual]` 账户页显示历史订单数量
- `[manual]` 桌面端（≥ 768px）账户页导航为竖排侧边栏

---

## 整体任务验收

所有 11 个步骤完成后执行：

### 自动验收

```bash
# 1. 代码质量
pnpm lint

# 2. 类型检查
pnpm typecheck

# 3. 全部 E2E 测试（含历史回归，webServer 自动执行 build）
pnpm test:e2e
```

**`pnpm test:e2e` 全部通过，方可合并。**

### 人工验收重点

| Phase | 核心验收项                                                                          |
| ----- | ----------------------------------------------------------------------------------- |
| A     | Announcement Bar dismiss 持久化；首页三区块正确；Footer 四列；移动菜单 ESC/遮罩关闭 |
| B     | 多图画廊缩略图切换；相关商品过滤自身；排序结果符合规则；SALE/SOLD OUT 徽章正确      |
| C     | Cart Drawer 滑出不跳转；Toast 各触发点正常；骨架屏可见；账户页 Avatar 显示          |

---

## 实现顺序建议

```
Phase A: Step 1 → 2 → 3 → 4
Phase B: Step 5 → 6 → 7 → 8
Phase C: Step 9 → 10 → 11
```

Phase 间无强依赖，可按 Phase 分批验收。Step 10（Toast）依赖 Step 9（Cart Drawer openCart 接口），需在 Step 9 后实现。
