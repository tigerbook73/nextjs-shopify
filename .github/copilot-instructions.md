# GitHub Copilot 自动补全规则

> 本文件仅用于 IDE 自动补全辅助。
> 特性开发、代码重构、架构决策请使用 Claude Code 或 Codex，不要依赖 Copilot 完成。

---

## TypeScript 规范

- 使用严格模式（`strict: true`）
- 禁止使用 `any`，用 `unknown` + 类型守卫替代
- 函数参数和返回值必须有明确类型，async 函数返回 `Promise<T>`
- 优先使用 `interface` 定义对象类型，`type` 用于联合类型和工具类型

## 命名约定

| 场景             | 格式                 | 示例                    |
| ---------------- | -------------------- | ----------------------- |
| React 组件       | PascalCase           | `ProductCard`           |
| 普通函数 / 变量  | camelCase            | `getProductByHandle`    |
| 文件名           | kebab-case           | `product-card.tsx`      |
| 常量             | SCREAMING_SNAKE_CASE | `MAX_PRODUCTS_PER_PAGE` |
| GraphQL Fragment | `<Type>Fragment`     | `ProductCardFragment`   |

## 注释规则

- 默认不写注释
- 只在「为什么」不明显时写一行简短注释
- 禁止写解释「做什么」的注释（代码本身就是说明）

## React 组件规则

- 默认写 Server Component（无 `'use client'`）
- 只有需要浏览器 API、事件监听、useState/useEffect 的组件才加 `'use client'`
- 使用具名导出（named export），不用默认导出工具函数和 hooks
