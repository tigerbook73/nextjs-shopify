# 编码规范

## TypeScript

- **严格模式**：`tsconfig.json` 启用 `strict: true`，所有相关检查必须通过
- **禁止 `any`**：用 `unknown` + 类型守卫替代；第三方库类型缺失时用 `@types/` 包或局部 `as` 断言（需注释说明原因）
- **显式返回类型**：Server Functions（Server Actions、Route Handlers）必须标注返回类型；纯工具函数可依赖推断
- **接口 vs 类型别名**：`interface` 用于对象结构定义；`type` 用于联合类型、交叉类型、工具类型

```typescript
// ✅ 正确
interface Product {
  id: string
  title: string
  handle: string
}

type ProductStatus = 'active' | 'draft' | 'archived'

async function getProduct(handle: string): Promise<Product | null> { ... }

// ❌ 错误
const getProduct = async (handle: any) => { ... }
```

---

## 命名约定

| 场景 | 格式 | 示例 |
|------|------|------|
| React 组件（文件 + 函数） | PascalCase | `ProductCard.tsx` / `function ProductCard` |
| 普通函数、变量、参数 | camelCase | `getProductByHandle`, `cartLineId` |
| 文件名（非组件） | kebab-case | `shopify-client.ts`, `format-price.ts` |
| 常量（模块级固定值） | SCREAMING_SNAKE_CASE | `MAX_PRODUCTS_PER_PAGE` |
| GraphQL Fragment | `<Type>Fragment` | `ProductCardFragment` |
| GraphQL Query/Mutation | `Get<Resource>Query` / `<Action><Resource>Mutation` | `GetProductQuery`, `CartCreateMutation` |
| CSS 类（自定义） | kebab-case | `.product-grid` |

---

## 注释规则

默认**不写注释**。只在以下情况写一行简短注释：

- 存在隐藏约束（如"Shopify 要求此字段必须是字符串，即使语义上是数字"）
- 绕过某个 bug 或框架限制（注明是什么 bug/限制）
- 非显而易见的业务不变量

```typescript
// ✅ 有价值的注释 - 解释「为什么」
// Shopify Cart ID 以 "gid://" 开头，需要 base64 解码后才能用于 URL
const cartId = atob(rawCartId)

// ❌ 无价值的注释 - 解释「是什么」（代码已经说清楚了）
// 获取购物车 ID
const cartId = atob(rawCartId)
```

禁止多行注释块、JSDoc（除非是公共库 API）。

---

## Server Component / Client Component 边界

**默认写 Server Component**（不加 `'use client'`）。

只在以下情况加 `'use client'`：
- 使用 `useState` / `useReducer` / `useEffect`
- 使用浏览器 API（`window`, `document`, `localStorage` 等）
- 注册事件监听器（`onClick` 除外，Server Component 支持通过 Server Action 处理）
- 使用需要客户端上下文的第三方库

**组件拆分原则**：将交互部分提取为最小 Client Component，父组件保持 Server Component。

```
// ✅ 正确的拆分方式
// ProductPage.tsx (Server Component)
import AddToCartButton from './AddToCartButton'  // Client Component
export default async function ProductPage({ params }) {
  const product = await getProduct(params.handle)  // 服务端直接获取数据
  return <AddToCartButton variantId={product.variants[0].id} />
}
```

---

## 导出规则

- **工具函数、hooks、Server Actions**：使用具名导出（named export）
- **React 组件（页面除外）**：使用具名导出
- **Next.js 页面、Layout、Route Handler**：使用默认导出（框架要求）

```typescript
// ✅ 工具函数 - 具名导出
export function formatPrice(amount: string, currency: string): string { ... }

// ✅ 普通组件 - 具名导出
export function ProductCard({ product }: ProductCardProps) { ... }

// ✅ 页面组件 - 默认导出（Next.js 约定）
export default function ProductPage({ params }) { ... }
```

---

## 错误处理

- Server Actions 返回结构化结果，不抛出异常到客户端：`{ success: true, data } | { success: false, error: string }`
- GraphQL 错误：检查 `userErrors` 字段，不只看 HTTP 状态（GraphQL 永远返回 200）
- `notFound()` 和 `redirect()` 在 Server Component / Server Action 中直接调用
- 页面级错误：使用 `error.tsx` 错误边界捕获，不在页面内 try/catch 所有逻辑
