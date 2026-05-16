# 编码规范

## TypeScript

- **严格模式**：`tsconfig.json` 启用 `strict: true`，所有检查必须通过
- **禁止 `any`**：用 `unknown` + 类型守卫替代；第三方库类型缺失时用 `@types/` 包或局部 `as` 断言（需注释说明原因）
- **显式返回类型**：Server Functions（Server Actions、Route Handlers）必须标注返回类型；纯工具函数可依赖类型推断
- **接口 vs 类型别名**：`interface` 用于对象结构；`type` 用于联合类型、交叉类型、工具类型

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

## 命名约定

| 场景 | 格式 | 示例 |
| ---- | ---- | ---- |
| React 组件（文件 + 函数） | PascalCase | `ProductCard.tsx` / `function ProductCard` |
| 普通函数、变量、参数 | camelCase | `getProductByHandle`, `cartLineId` |
| 文件名（非组件） | kebab-case | `format-price.ts`, `parse-gid.ts` |
| 常量（模块级固定值） | SCREAMING_SNAKE_CASE | `MAX_PRODUCTS_PER_PAGE` |
| GraphQL Fragment 常量 | `<TYPE>_<CONTEXT>_FRAGMENT` | `PRODUCT_CARD_FRAGMENT` |
| GraphQL Query 常量 | `GET_<RESOURCE>_QUERY` | `GET_PRODUCT_QUERY` |
| GraphQL Mutation 常量 | `<ACTION>_<RESOURCE>_MUTATION` | `CART_CREATE_MUTATION` |

## 注释规则

默认**不写注释**。只在以下情况写一行简短注释：

- 存在隐藏约束（如外部 API 的特殊字段要求）
- 绕过某个 bug 或框架限制（注明是什么 bug/限制）
- 非显而易见的业务不变量

禁止多行注释块、JSDoc（除非是公共库 API）。

## Server Component / Client Component 边界

**默认写 Server Component**（不加 `'use client'`）。

只在以下情况加 `'use client'`：
- 使用 `useState` / `useReducer` / `useEffect`
- 使用浏览器 API（`window`、`document`、`localStorage` 等）
- 注册事件监听器
- 使用需要客户端上下文的第三方库

**组件拆分原则**：将交互部分提取为最小 Client Component，父组件保持 Server Component。

## 导出规则

- **工具函数、Server Actions**：具名导出
- **React 组件（页面除外）**：具名导出或默认导出均可，保持文件内一致
- **Next.js 页面、Layout、Route Handler**：默认导出（框架约定）

## 错误处理

- Server Actions 返回结构化结果，不向客户端抛出异常：`{ success: true, data } | { success: false, error: string }`
- GraphQL 错误：检查 `userErrors` 字段，不只看 HTTP 状态（GraphQL 永远返回 200）
- `notFound()` 和 `redirect()` 在 Server Component / Server Action 中直接调用
- 页面级错误：使用 `error.tsx` 边界捕获，不在页面内 try/catch 所有逻辑

## 提交规范

格式：`type(scope): description`（Conventional Commits，英文描述）

```
feat(collections): add collection list and detail pages
feat(seo): add generateMetadata and sitemap route
fix(graphql): remove multi-line comment in collection query
chore(tooling): install @shopify/cli and add env:check script
docs(conventions): update architecture layering rule
refactor(client): extract getCollectionHandles function
```

常用 type：

| type | 用途 |
| ---- | ---- |
| `feat` | 新功能 |
| `fix` | Bug 修复 |
| `refactor` | 重构（不改行为） |
| `chore` | 构建、依赖、工具 |
| `docs` | 文档、规范、ADR |
| `test` | 测试相关 |
| `ci` | CI/CD 配置 |
