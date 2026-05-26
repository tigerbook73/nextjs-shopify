# Next.js × Shopify 专业化蓝图

> 前置状态：Phase -1 ~ Phase 7 已全部完成，核心电商功能（商品/Collection/搜索/购物车/账户/缓存）均已交付。
> 本蓝图目标：将功能完整的 MVP 打磨为视觉专业、体验流畅的真实可用电商站点。

---

## 现状差距

| 问题                  | 具体表现                               |
| --------------------- | -------------------------------------- |
| 首页是调试页          | 仍显示"Phase 0 API 连通验证"，极其简陋 |
| Footer 完全缺失       | 无任何底部导航、版权信息               |
| 无移动端菜单          | 小屏幕导航无法使用                     |
| 购物车体验落后        | 加入购物车后跳转 /cart，打断浏览流     |
| 商品图片单一          | 数据支持 5 张，但只展示 1 张           |
| Collection 无发现能力 | 无筛选、无排序，浏览体验差             |
| 商品卡片无状态标识    | Sale / Sold Out 数据已有但未展示       |
| 操作无反馈            | 加入购物车、登录等操作无 Toast 提示    |

---

## 阶段总览

```
Phase A → 布局 & 首页    （最大视觉冲击，优先做）
Phase B → 商品 & 浏览    （数据驱动体验升级）
Phase C → 交互 & 收尾    （Cart Drawer + Toast + 账户完善）
```

---

## Phase A — 布局 & 首页

### 目标

消除"调试页"印象，建立完整的品牌框架（Header + 首页 + Footer）。

### 交付物

#### 1. 首页重设计 (`src/app/page.tsx` — 完全重写)

| 区块     | 内容来源                           | 说明                            |
| -------- | ---------------------------------- | ------------------------------- |
| Hero     | 静态（本地图片 + 固定文案）        | 全宽大图、大标题、2 个 CTA 按钮 |
| 特色系列 | Shopify `getCollections(first: 4)` | 横排 CollectionCard 网格        |
| 热门商品 | Shopify `getProducts(first: 8)`    | ProductCard 四列网格            |

Hero CTA：「探索全部商品 → /products」 + 「浏览系列 → /collections」

#### 2. Footer 组件（新建 `src/components/layout/Footer.tsx`）

- 四列布局：品牌简介 ｜ 导购链接 ｜ 账户链接 ｜ 联系 & 社交
- 底部版权行
- Newsletter 邮件输入框（UI only）
- 在 `src/app/layout.tsx` 末尾引入

#### 3. 移动端菜单（更新 `src/components/layout/Header.tsx`）

- `md:hidden` 汉堡图标（`lucide-react` Menu / X）
- 全屏覆盖导航层，含所有导航链接 + 搜索入口
- ESC / 点击遮罩关闭

#### 4. Announcement Bar（新建 `src/components/layout/AnnouncementBar.tsx`）

- 全宽细条，置于 Header 上方
- 静态促销文案（"全场包邮 · 满 299 立减 50"）
- `×` 关闭按钮，`localStorage` 记忆 dismiss（Client Component）

### 文件变更

| 文件                                        | 变更类型                      |
| ------------------------------------------- | ----------------------------- |
| `src/app/page.tsx`                          | 完全重写                      |
| `src/app/layout.tsx`                        | 引入 Footer + AnnouncementBar |
| `src/components/layout/Header.tsx`          | 添加移动菜单                  |
| `src/components/layout/Footer.tsx`          | 新建                          |
| `src/components/layout/AnnouncementBar.tsx` | 新建                          |
| `public/hero.jpg`                           | 新增静态资源                  |

### Next.js 知识点

- RSC 页面中混合静态内容与服务端 fetch（无 useEffect，直接顶层 await）
- Client / Server 组件边界：AnnouncementBar（localStorage）是 Client，首页主体是 Server
- 布局层组件的插入位置与 CSS 层叠顺序

---

## Phase B — 商品 & 浏览体验

### 目标

让商品详情页和 Collection 页具备真实电商站点的浏览深度。

### 交付物

#### 1. 商品图片画廊（新建 `src/components/product/ProductGallery.tsx`）

- 左侧缩略图纵列 + 右侧主图（或顶部缩略图横条，根据布局定）
- 点击缩略图切换主图（纯 Client Component UI 状态，`useState`）
- 数据来源：`ProductDetail.images`（已支持最多 5 张）
- 在 `src/app/products/[handle]/page.tsx` 中替换现有单张图片

#### 2. 相关商品推荐（新建 `src/components/product/RelatedProducts.tsx`）

- 显示"同系列更多商品"（4 张 ProductCard）
- **GraphQL 扩展**：`GET_PRODUCT_BY_HANDLE_QUERY` 增加 `collections(first: 1) { nodes { handle } }`
- 服务端：取第一个 collection handle → `getCollectionByHandle(handle, 5)` → 过滤当前商品
- 用 `<Suspense>` 包裹，独立请求不阻塞页面渲染

#### 3. Collection 筛选 & 排序（更新 Collection 详情页）

**排序**（URL 参数 `?sort=`）

| 参数值         | Shopify sortKey | reverse |
| -------------- | --------------- | ------- |
| `price-asc`    | `PRICE`         | false   |
| `price-desc`   | `PRICE`         | true    |
| `newest`       | `CREATED`       | true    |
| `best-selling` | `BEST_SELLING`  | false   |

**筛选**：`?available=true` → Shopify `filters: [{ available: true }]`

- 新建 `src/components/collection/CollectionFilters.tsx`（Client Component，router.push 更新 URL）
- 更新 `src/lib/shopify/queries/collection.ts`（添加 sortKey / reverse / filters 变量）
- 更新 `src/lib/shopify/client.ts`（`getCollectionByHandle` 增加 sortKey / filters 参数）

#### 4. 商品徽章（更新 `src/components/product/ProductCard.tsx`）

| 条件                              | 徽章     | 样式             |
| --------------------------------- | -------- | ---------------- |
| `compareAtPrice` 存在且 > `price` | SALE     | 红色绝对定位     |
| `availableForSale === false`      | SOLD OUT | 灰色，图片半透明 |

数据已完全支持，纯 UI 改动。

### 文件变更

| 文件                                              | 变更类型                        |
| ------------------------------------------------- | ------------------------------- |
| `src/app/products/[handle]/page.tsx`              | 集成 Gallery + RelatedProducts  |
| `src/components/product/ProductGallery.tsx`       | 新建                            |
| `src/components/product/RelatedProducts.tsx`      | 新建                            |
| `src/components/product/ProductCard.tsx`          | 添加徽章                        |
| `src/app/collections/[handle]/page.tsx`           | 集成 Filters，传入 searchParams |
| `src/components/collection/CollectionFilters.tsx` | 新建                            |
| `src/lib/shopify/queries/product.ts`              | 添加 collections 字段           |
| `src/lib/shopify/queries/collection.ts`           | 添加 sortKey / filters 变量     |
| `src/lib/shopify/client.ts`                       | 更新函数签名                    |
| `src/lib/shopify/types.ts`                        | 扩展 ProductDetail 类型         |

### Next.js 知识点

- `searchParams` prop 在 Server Component 中读取 URL 参数（无需 useSearchParams）
- `<Suspense>` 细粒度拆分：RelatedProducts 独立 Suspense 边界，不影响主内容
- Client Component 只负责交互（下拉选择）→ URL 更新触发 Server 重渲染

---

## Phase C — 交互 & 收尾

### 目标

补齐操作反馈、购物车体验、账户视觉，让整站体验流畅完整。

### 交付物

#### 1. Cart Drawer（最核心改造）

**架构**：最小 React Context，只管理 `isOpen` 布尔值

```
src/context/CartContext.tsx       ← 新建，Provider + useCart hook
src/components/cart/CartDrawer.tsx ← 新建，右侧固定浮层
```

- CartDrawer：`position: fixed right-0`，覆盖遮罩，复用现有 `CartItem` + `CartSummary`
- `AddToCartButton`：成功后调用 `openCart()`
- Header 购物车 icon：点击调用 `openCart()`
- `/cart` 页面**保留**（直接访问 URL 仍可用）
- 在 `src/app/layout.tsx` 中：`<CartProvider>` 包裹全局，渲染 `<CartDrawer />`

#### 2. Toast 通知（安装 `sonner`）

- `src/app/layout.tsx` 引入 `<Toaster />`
- 触发点：
  - 加入购物车成功 → `toast.success("已加入购物车")`
  - 登录/注册成功 → `toast.success(...)`
  - 表单校验失败 → `toast.error(...)`
- Server Action 返回状态 → Client Component `useEffect` 监听 → 触发 toast

#### 3. 骨架屏补齐

- `src/app/products/loading.tsx` — 新建（ProductCard 骨架 4 列网格）
- `src/app/collections/loading.tsx` — 新建（CollectionCard 骨架）
- 与现有 `src/app/search/loading.tsx` 视觉风格保持一致

#### 4. 账户页视觉完善

- `src/app/account/page.tsx`：顶部 Avatar（姓名首字母 + Tailwind 圆形背景）+ 订单数量统计
- `src/app/account/layout.tsx`：侧边导航从 Tab 改为竖排链接列表（桌面端）

### 文件变更

| 文件                                      | 变更类型                                 |
| ----------------------------------------- | ---------------------------------------- |
| `src/context/CartContext.tsx`             | 新建                                     |
| `src/components/cart/CartDrawer.tsx`      | 新建                                     |
| `src/components/cart/AddToCartButton.tsx` | 调用 openCart                            |
| `src/components/layout/Header.tsx`        | 购物车 icon 触发 Drawer                  |
| `src/app/layout.tsx`                      | 引入 CartProvider + CartDrawer + Toaster |
| `src/app/products/loading.tsx`            | 新建                                     |
| `src/app/collections/loading.tsx`         | 新建                                     |
| `src/app/account/page.tsx`                | 视觉升级                                 |
| `src/app/account/layout.tsx`              | 导航改竖排                               |
| `package.json`                            | 添加 sonner                              |

### Next.js 知识点

- Context Provider 在 `layout.tsx` 中插入（仅需在最外层一次）
- Server Action 返回值传递给 Client Component → 触发 toast 的模式
- `loading.tsx` 与 Suspense 的关系：路由级 loading 文件等价于 `<Suspense fallback>`

---

## 验收方式

每个 Phase 完成后执行：

```bash
pnpm lint    # 无错误
pnpm build   # 构建通过
```

手动验收重点：

| Phase | 验收项                                                                                                    |
| ----- | --------------------------------------------------------------------------------------------------------- |
| A     | 首页三个区块正常渲染、Footer 四列显示、移动菜单开关正常、Announcement Bar dismiss 后不再显示              |
| B     | 图片缩略图点击切换、相关商品显示（同 Collection）、排序 URL 参数生效、Sale 徽章在有 compareAtPrice 时出现 |
| C     | 加入购物车触发 Drawer 滑出、Toast 弹出、账户页 Avatar 显示、loading.tsx 在网速慢时可见骨架                |

---

## 测试账号管理

### Shopify 顾客测试账号

在 Shopify Admin → Customers 中手动创建，专用于本地开发验收，不使用真实个人账号。

| 用途         | Email                  | 密码         | 备注                       |
| ------------ | ---------------------- | ------------ | -------------------------- |
| 主测试账号   | `dev-main@test.local`  | `Test1234!`  | 预置历史订单，测试订单列表 |
| 空账号       | `dev-empty@test.local` | `Test1234!`  | 无订单记录，测试空状态展示 |
| 错误密码测试 | —                      | 任意错误密码 | 验证登录失败 Toast 提示    |

> **创建步骤**：Shopify Admin → Customers → Add customer → 填写 Email + First name → 保存后在顾客详情页点击 "Send account invite"（或直接在注册页用上表 Email 注册）

账号状态管理：

- 订单数据无法从 Storefront API 删除；若需"清空订单"效果，新建一个空账号即可
- Cookie 中的 `customerAccessToken` 有效期为 Shopify 默认（24 小时），测试登出流程时可直接清除 Cookie

---

### Shopify 测试支付方式

本项目结账跳转至 Shopify 原生 Checkout，支付环境需在 **开发商店（Development Store）** 中启用 Bogus Gateway。

#### 启用 Bogus Gateway

Shopify Admin → Settings → Payments → 选择 "Bogus Gateway"（仅开发商店可见）

#### Bogus Gateway 测试卡号

| 输入值           | 结果      |
| ---------------- | --------- |
| `1`              | 支付成功  |
| `2`              | 支付失败  |
| `3`              | 异常/例外 |
| 任意其他有效卡号 | 支付成功  |

- CVV / 有效期：任意填写（如 `123` / `12/34`）
- 姓名：任意填写

#### 验收重点

1. 点击 Checkout 跳转至 Shopify 结账页，URL 为 `*.myshopify.com/checkouts/...`
2. 填写测试地址（如：北京市朝阳区，邮编 100020）
3. 选择 Bogus Gateway → 输入 `1` → 确认支付 → 跳回成功页

---

## CLAUDE.md 同步

完成 Phase A 后同步更新 `CLAUDE.md` 的"当前开发阶段"字段：

```
**Phase A（布局 & 首页）进行中 → Phase B / C 待做**
```
