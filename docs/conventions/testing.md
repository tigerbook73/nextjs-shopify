# 测试策略

## 定位原则

本项目定位「学习型 + 产品化实践」，不追求测试全覆盖。
测试的目的是**保护核心逻辑不被意外破坏**，而不是机械达到覆盖率指标。

---

## 什么要测试

| 类型 | 示例 | 原因 |
|------|------|------|
| 纯工具函数 | `formatPrice`, `parseGid`, `buildSearchParams` | 纯函数，边界情况多，容易验证 |
| GraphQL 客户端封装 | `shopifyFetch` 的错误处理逻辑 | 所有 API 调用的入口，出错影响全局 |
| 数据转换函数 | Shopify 响应 → 应用内部类型的映射函数 | 字段映射容易出错，需要回归保护 |
| Server Action 的业务逻辑 | Cart 数量计算、价格合计 | 涉及金钱计算，精度要求高 |

---

## 什么不测试

| 类型 | 原因 |
|------|------|
| Next.js 内部行为（路由、缓存、ISR） | 框架自身有测试，不重复 |
| Shopify API 的响应格式 | 外部服务，用 TypeScript 类型约束即可 |
| UI 渲染细节（组件快照） | 维护成本高，收益低 |
| Server Component 的数据获取流程 | 集成测试范畴，需要真实环境 |
| shadcn/ui 基础组件行为 | 第三方库，不需要测 |

---

## 工具选择

| 工具 | 用途 |
|------|------|
| Vitest | 单元测试运行器（与 Vite 生态兼容，比 Jest 更快） |
| @testing-library/react | 组件测试（如果需要） |

---

## 文件组织

- 测试文件与被测文件**共置**：`src/lib/utils/format-price.test.ts`
- 不使用独立的顶层 `__tests__/` 目录
- 测试文件命名：`<被测文件名>.test.ts`（或 `.test.tsx`）

```
src/
  lib/
    utils/
      format-price.ts
      format-price.test.ts        ← 与源文件共置
    shopify/
      client.ts
      client.test.ts
```

---

## 编写规范

- 每个 `describe` 块对应一个函数/模块
- 测试描述用中文，说明「在什么条件下，期望什么结果」
- 不 mock 不必要的依赖（能用真实函数就用真实函数）
- 不测试实现细节，只测试公开行为

```typescript
// ✅ 好的测试
describe('formatPrice', () => {
  it('将分转换为元并保留两位小数', () => {
    expect(formatPrice('1999', 'CNY')).toBe('¥19.99')
  })

  it('金额为零时显示 ¥0.00', () => {
    expect(formatPrice('0', 'CNY')).toBe('¥0.00')
  })
})
```
