# Requirements: professional-ui

## Goal

将功能完整的 MVP（Phase -1 ~ Phase 7 已交付）打磨为视觉专业、体验流畅的真实可用电商站点，覆盖布局框架、商品浏览体验、交互反馈三个层次。

## Background and Motivation

- 首页仍显示"Phase 0 API 连通验证"调试页，极其简陋
- Footer 完全缺失，无底部导航和版权信息
- 小屏幕无移动端菜单，导航无法使用
- 加入购物车后跳转 /cart，打断浏览流
- 商品数据支持 5 张图片，但只展示 1 张
- Collection 页无筛选、无排序，浏览体验差
- Sale / Sold Out 数据已有但未在商品卡片上展示
- 加入购物车、登录等操作无 Toast 反馈

## Functional Requirements

### Phase A — 布局 & 首页

1. **首页重设计** (`src/app/page.tsx` 完全重写)
   - Hero 区块：全宽大图（本地静态图片）+ 大标题 + 2 个 CTA 按钮（「探索全部商品 → /products」、「浏览系列 → /collections」）
   - 特色系列区块：服务端获取 `getCollections(first: 4)`，横排 CollectionCard 网格
   - 热门商品区块：服务端获取 `getProducts(first: 8)`，ProductCard 四列网格

2. **Footer 组件**（新建 `src/components/layout/Footer.tsx`）
   - 四列布局：品牌简介 ｜ 导购链接 ｜ 账户链接 ｜ 联系 & 社交
   - 底部版权行
   - Newsletter 邮件输入框（UI only，不接入后端）
   - 在 `src/app/layout.tsx` 末尾引入

3. **移动端菜单**（更新 `src/components/layout/Header.tsx`）
   - `md:hidden` 汉堡图标（`lucide-react` Menu / X）
   - 全屏覆盖导航层，含所有导航链接 + 搜索入口
   - ESC / 点击遮罩关闭

4. **Announcement Bar**（新建 `src/components/layout/AnnouncementBar.tsx`）
   - 全宽细条，置于 Header 上方
   - 静态促销文案（"全场包邮 · 满 299 立减 50"）
   - `×` 关闭按钮，`localStorage` 记忆 dismiss（Client Component）

### Phase B — 商品 & 浏览体验

5. **商品图片画廊**（新建 `src/components/product/ProductGallery.tsx`）
   - 左侧缩略图纵列 + 右侧主图
   - 点击缩略图切换主图（`useState`，纯 Client Component UI 状态）
   - 数据来源：`ProductDetail.images`（已支持最多 5 张）
   - 替换 `src/app/products/[handle]/page.tsx` 中现有单张图片

6. **相关商品推荐**（新建 `src/components/product/RelatedProducts.tsx`）
   - 显示"同系列更多商品"（4 张 ProductCard）
   - GraphQL 扩展：`GET_PRODUCT_BY_HANDLE_QUERY` 增加 `collections(first: 1) { nodes { handle } }`
   - 服务端：取第一个 collection handle → `getCollectionByHandle(handle, 5)` → 过滤当前商品
   - 用 `<Suspense>` 包裹，独立请求不阻塞页面渲染

7. **Collection 筛选 & 排序**（更新 Collection 详情页）
   - 排序（URL 参数 `?sort=`）：支持 `price-asc`、`price-desc`、`newest`、`best-selling`，映射到 Shopify sortKey + reverse
   - 筛选：`?available=true` → Shopify `filters: [{ available: true }]`
   - 新建 `src/components/collection/CollectionFilters.tsx`（Client Component，router.push 更新 URL）
   - 更新 collection GraphQL query 添加 sortKey / reverse / filters 变量
   - 更新 `getCollectionByHandle` 函数签名

8. **商品徽章**（更新 `src/components/product/ProductCard.tsx`）
   - `compareAtPrice` 存在且 > `price` → 显示红色 SALE 徽章
   - `availableForSale === false` → 显示灰色 SOLD OUT 徽章，图片半透明

9. **SEO Metadata**（更新商品详情页与 Collection 详情页）
   - `src/app/products/[handle]/page.tsx`：添加 `generateMetadata`，`title` 使用商品名，`description` 使用商品 `description` 字段
   - `src/app/collections/[handle]/page.tsx`：添加 `generateMetadata`，`title` 使用 Collection 名，`description` 使用 Collection `description` 字段
   - 数据已在页面服务端 fetch 时获取，`generateMetadata` 复用同一 fetch（Next.js 自动去重）

10. **Collection 筛选空状态**（更新 Collection 详情页）
    - 当筛选结果为空时，显示"暂无符合条件的商品"提示文案
    - 提供"重置筛选"链接，点击跳转至无参数的当前 Collection 页（`/collections/[handle]`）

### Phase C — 交互 & 收尾

11. **Cart Drawer**

- 新建 `src/context/CartContext.tsx`：最小 React Context，只管理 `isOpen` 布尔值，导出 `useCart` hook
- 新建 `src/components/cart/CartDrawer.tsx`：`position: fixed right-0`，覆盖遮罩，复用现有 `CartItem` + `CartSummary`
- `AddToCartButton` 成功后调用 `openCart()`
- Header 购物车 icon 点击调用 `openCart()`
- `/cart` 页面保留（直接访问 URL 仍可用）
- `src/app/layout.tsx` 用 `<CartProvider>` 包裹全局，渲染 `<CartDrawer />`

12. **Toast 通知**（安装 `sonner`）
    - `src/app/layout.tsx` 引入 `<Toaster />`
    - 触发点：加入购物车成功、登录/注册成功、表单校验失败
    - Server Action 返回状态 → Client Component `useEffect` 监听 → 触发 toast

13. **骨架屏补齐**
    - 新建 `src/app/products/loading.tsx`（ProductCard 骨架 4 列网格）
    - 新建 `src/app/collections/loading.tsx`（CollectionCard 骨架）
    - 与现有 `src/app/search/loading.tsx` 视觉风格保持一致

14. **账户页视觉完善**
    - `src/app/account/page.tsx`：顶部 Avatar（姓名首字母 + Tailwind 圆形背景）+ 订单数量统计
    - `src/app/account/layout.tsx`：侧边导航从 Tab 改为竖排链接列表（桌面端）

## Non-Functional Requirements

- 所有新增 Server Component 直接顶层 `await`，不使用 `useEffect` 做数据获取
- Client Component 只负责交互状态，不承担数据获取职责
- Hero 图片使用 `<Image priority>` 避免 LCP 警告
- `pnpm lint` 无错误，`pnpm build` 构建通过

## Out of Scope

- Newsletter 邮件输入框的后端接入（UI only）
- `/cart` 页面删除（保留作为备用直接访问路径）
- 支付流程改造（仍使用 Shopify 原生 Checkout 跳转）
- 新增商品数据或 Shopify Admin 配置

## Acceptance Criteria

### Phase A

- 首页 Hero / 特色系列 / 热门商品三个区块正常渲染，无调试内容
- Footer 四列在桌面端正常显示
- 移动端汉堡菜单可正常开关，ESC 和遮罩点击均可关闭
- Announcement Bar dismiss 后刷新页面不再显示（localStorage 生效）

### Phase B

- 商品详情页缩略图点击后主图正确切换
- 相关商品区块显示同 Collection 的其他商品（已过滤当前商品）
- Collection 页切换排序后 URL 参数更新，商品列表重新排序
- 有 `compareAtPrice` 的商品卡片显示 SALE 徽章；`availableForSale=false` 显示 SOLD OUT 徽章
- 商品详情页 `<title>` 显示商品名；Collection 页 `<title>` 显示系列名
- Collection 筛选无结果时显示提示文案和重置链接

### Phase C

- 加入购物车后右侧 Drawer 滑出，不跳转页面
- Toast 在加入购物车成功、登录成功、表单失败时弹出
- 网速慢时 `/products` 和 `/collections` 路由显示骨架屏
- 账户页顶部 Avatar 显示姓名首字母，订单数量正确统计
