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

## 步骤拆分

### Step 1 — Announcement Bar

**目标**：全宽促销条，dismiss 后不再显示。

**文件变更**：

- `src/components/layout/AnnouncementBar.tsx` — 新建（Client Component）
- `src/app/layout.tsx` — Body 内 Header 上方插入 `<AnnouncementBar />`

**关键实现**：

- `'use client'`，`useState` 管理 `visible`
- `useEffect` 初始化时读 `localStorage.getItem('ann-dismissed')`
- 点击 `×` → `setVisible(false)` + `localStorage.setItem('ann-dismissed', '1')`

**验收条件**：

- [ ] 首次访问显示促销文案
- [ ] 点击 `×` 后条消失
- [ ] 刷新页面后不再显示

---

### Step 2 — Homepage Rewrite

**目标**：三区块首页，替换调试页。

**文件变更**：

- `src/app/page.tsx` — 完全重写（Server Component）
- `public/hero.jpg` — 新增占位图

**关键实现**：

- 顶层 `await getCollections(4)` + `await getProducts(8)`（两个并发 `Promise.all`）
- Hero：`<Image src="/hero.jpg" priority fill alt="..." />` — `priority` 必须加，否则 LCP 警告
- Hero CTA：两个 `<Link>` 按钮，分别指向 `/products` 和 `/collections`
- 特色系列：`<CollectionCard>` 四列网格（`grid-cols-2 md:grid-cols-4`）
- 热门商品：`<ProductCard>` 四列网格（`grid-cols-2 md:grid-cols-4`）

**验收条件**：

- [ ] 三个区块正常渲染，无"Phase 0"字样
- [ ] Hero CTA 链接跳转正确
- [ ] 开发者工具 Network 面板无 LCP image 警告
- [ ] `pnpm build` 无警告

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

**验收条件**：

- [ ] 四列在 md 以上正常并排
- [ ] 移动端自动折叠为单列
- [ ] 底部版权行显示当前年份

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

**验收条件**：

- [ ] 小屏（< 768px）显示汉堡图标，桌面不显示
- [ ] 点击汉堡打开全屏菜单
- [ ] ESC / 遮罩点击 / 点链接均可关闭
- [ ] 桌面端导航不受影响

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

**验收条件**：

- [ ] 有折扣商品显示红色 SALE 徽章
- [ ] 缺货商品显示灰色 SOLD OUT 徽章，图片半透明
- [ ] 无折扣且有货商品不显示任何徽章

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

**验收条件**：

- [ ] 多图商品左侧显示缩略图列
- [ ] 点击缩略图，右侧主图切换为对应图片
- [ ] 单图商品无缩略图列，正常显示主图

---

### Step 7 — Related Products + Product Page SEO

**目标**：商品详情页底部推荐同系列商品，并添加 SEO title。

**文件变更**：

- `src/lib/shopify/queries/product.ts` — `GET_PRODUCT_BY_HANDLE_QUERY` 增加 `collections(first: 1) { nodes { handle } }`
- `src/lib/shopify/types.ts` — `ProductDetail` 增加 `collections: { nodes: { handle: string }[] }`
- `src/components/product/RelatedProducts.tsx` — 新建（async Server Component）
- `src/app/products/[handle]/page.tsx` — 集成 `<Suspense><RelatedProducts /></Suspense>` + `generateMetadata`

**关键实现**：

`RelatedProducts` 接收 `currentHandle: string`，`collectionHandle: string`：

```ts
const collection = await getCollectionByHandle(collectionHandle, 5);
const related = collection?.products.nodes.filter((p) => p.handle !== currentHandle).slice(0, 4);
```

- 无 collection 或 related 为空时返回 `null`（不渲染区块）

`generateMetadata`：

```ts
export async function generateMetadata({ params }) {
  const product = await getProductByHandle(params.handle);
  return { title: product?.title ?? "Product" };
}
```

**验收条件**：

- [ ] 商品详情页 `<title>` 标签显示商品名（浏览器 Tab 可见）
- [ ] 有所属 Collection 的商品底部显示最多 4 张相关商品卡片
- [ ] 相关商品不含当前商品自身
- [ ] 无 Collection 的商品不渲染相关商品区块

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

`CollectionFilters` 渲染排序下拉 + "仅显示有货"复选框，变更时：

```ts
const params = new URLSearchParams(searchParams);
params.set("sort", value);
router.push(`?${params.toString()}`);
```

空状态（`products.nodes.length === 0`）：

```tsx
<p>暂无符合条件的商品</p>
<Link href={`/collections/${handle}`}>重置筛选</Link>
```

`generateMetadata`：

```ts
return { title: collection?.title ?? "Collection" };
```

**验收条件**：

- [ ] Collection 页 `<title>` 显示系列名
- [ ] 排序下拉切换后商品列表重新排序（URL 更新）
- [ ] 勾选"仅显示有货"后缺货商品消失
- [ ] 筛选结果为空时显示提示文案和重置链接

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
'use client';
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
- 内部复用 `<CartItem>` + `<CartSummary>`
- 数据：`useCart()` 只得 `isOpen`；购物车内容仍从 cookie cartId 服务端拿，或复用现有 cart server actions

> **注意**：CartDrawer 内显示购物车内容需要客户端读取 cartId，参考 `CartCount` 的实现方式（cookie → server fetch）

**验收条件**：

- [ ] 加入购物车后 Drawer 从右侧滑入
- [ ] 点击遮罩关闭 Drawer
- [ ] `/cart` 页面直接访问仍正常
- [ ] `CartProvider` 在 layout 中只包裹一次

---

### Step 10 — Toast Notifications

**目标**：关键操作（加购、登录、注册、表单错误）有 Toast 反馈。

**文件变更**：

- `package.json` — 添加 `sonner`
- `src/app/layout.tsx` — 引入 `<Toaster />`
- `src/components/cart/AddToCartButton.tsx` — 加入 `toast.success("已加入购物车")`
- `src/lib/actions/customer.ts` — login/register action 失败时 return `{ error: string }` 而非 throw
- `src/components/account/LoginForm.tsx` — `useEffect` 监听 action state → `toast.error`
- `src/components/account/RegisterForm.tsx` — 同上

**关键实现**：

`AddToCartButton` 改动最小：

```ts
await addToCart(variantId);
toast.success("已加入购物车");
openCart(); // Step 9
```

Server Action 返回模式（login 为例）：

```ts
// 已有：redirect('/account') on success
// 新增：失败时 return { error: '邮箱或密码错误' }
```

Form 组件：

```ts
const [state, formAction] = useActionState(login, null);
useEffect(() => {
  if (state?.error) toast.error(state.error);
}, [state]);
```

**验收条件**：

- [ ] 加入购物车后出现成功 Toast
- [ ] 登录失败后出现错误 Toast（不是 alert）
- [ ] 注册失败后出现错误 Toast
- [ ] Toast 自动消失（sonner 默认 4s）

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

```tsx
<div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-900 text-xl font-bold text-white">
  {initials}
</div>
```

订单数：并行 `Promise.all([getCustomer(token), getCustomerOrders(token)])` 获取。

账户布局（桌面侧边栏）：

```tsx
<nav className="flex flex-col gap-2 border-r pr-8 md:w-48">
  <Link ...>账户信息</Link>
  <Link ...>历史订单</Link>
</nav>
```

**验收条件**：

- [ ] 切换到 `/products` 时出现骨架屏（可通过 DevTools 降速网络复现）
- [ ] 切换到 `/collections` 时出现骨架屏
- [ ] 账户页顶部显示 Avatar 圆圈 + 姓名首字母
- [ ] 账户页显示历史订单数量
- [ ] 桌面端账户布局为侧边栏，移动端退化为横排

---

## 实现顺序建议

```
Phase A: Step 1 → 2 → 3 → 4
Phase B: Step 5 → 6 → 7 → 8
Phase C: Step 9 → 10 → 11
```

Phase 间无强依赖，可按 Phase 分批验收。Step 10（Toast）依赖 Step 9（Cart Drawer openCart 接口），需在 Step 9 后实现。
