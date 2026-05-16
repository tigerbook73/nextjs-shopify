# ADR-0006：Cart 与账户状态通过 Cookie + Server Actions 管理，不引入客户端状态库

**状态**：已采纳
**日期**：2026-05
**影响范围**：全局

## 背景

电商应用需要跨页面持久化 Cart 状态（Cart ID）和用户登录状态（Customer Access Token）。传统 React 应用通常使用 Zustand / Redux 等客户端状态库管理全局状态。但 App Router 提供了服务端原生的状态管理能力。

## 决策

Cart ID 和 Customer Access Token 存入 httpOnly Cookie，通过 Next.js Server Actions 读写，不引入任何客户端状态管理库。

## 考虑过的替代方案

| 方案            | 优点                   | 缺点 / 排除原因                                                       |
| --------------- | ---------------------- | --------------------------------------------------------------------- |
| Zustand / Redux | 生态成熟，调试工具完善 | 增加客户端 bundle；Cookie 方案已可完全覆盖需求，引入无必要复杂度      |
| React Context   | 无额外依赖             | 无法跨页面持久化；与 RSC 不兼容（Context 需要 Client Component 包裹） |
| localStorage    | 简单直接               | 无法在服务端读取；存在 XSS 风险（Token 不应存 localStorage）          |

## 后果

### 正面影响

- 零客户端状态库，bundle 更小
- httpOnly Cookie 防止 XSS 读取敏感 Token
- Server Actions 直接操作 Cookie，无需额外 API Route
- Cart 状态在服务端渲染时即可读取，无 hydration 闪烁问题

### 负面影响 / 约束

- 状态变更需通过 Server Action，不能在纯 Client Component 中直接修改
- Optimistic UI（乐观更新）需配合 `useOptimistic` hook 实现，见 Phase 4 设计
- Cookie 有大小限制（4KB），只存 ID，不存完整数据
- 相关规范：见 `docs/conventions/architecture.md` 明确禁止事项
