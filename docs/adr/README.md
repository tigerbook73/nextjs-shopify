# 架构决策记录（ADR）

架构决策记录（Architecture Decision Record）用于记录项目中重要的技术决策：
**决定了什么、为什么这样决定、这个决定带来了什么约束**。

AI 工具读到 ADR 后，能理解「为什么」而不仅仅是「是什么」，
在遇到边界情况时做出更合理的判断。

## 决策索引

| 编号                                            | 标题                                              | 状态   | 日期    |
| ----------------------------------------------- | ------------------------------------------------- | ------ | ------- |
| [ADR-0001](0001-storefront-api.md)              | 使用 Shopify Storefront API 而非 Admin API        | 已采纳 | 2026-05 |
| [ADR-0002](0002-fetch-over-graphql-client.md)   | 使用原生 fetch 而非 GraphQL 客户端库              | 已采纳 | 2026-05 |
| [ADR-0003](0003-native-checkout.md)             | 跳转 Shopify 原生 Checkout 而非自建               | 已采纳 | 2026-05 |
| [ADR-0004](0004-shadcn-ui.md)                   | 使用 shadcn/ui（@base-ui/react）作为 UI 组件库    | 已采纳 | 2026-05 |
| [ADR-0005](0005-app-router.md)                  | 采用 Next.js App Router 而非 Pages Router         | 已采纳 | 2026-05 |
| [ADR-0006](0006-cookie-server-actions-state.md) | Cart 与账户状态通过 Cookie + Server Actions 管理  | 已采纳 | 2026-05 |
| [ADR-0007](0007-page-data-fetching-pattern.md)  | 页面组件可直接调用 lib/shopify/client.ts 封装函数 | 已采纳 | 2026-05 |

## 何时创建 ADR

以下情况应创建 ADR：

- 在多个可行方案中选择了某一个（如技术选型）
- 明确排除了某种常见做法（如不用 Apollo）
- 做了一个将来可能需要回溯的决定
- 规范更新时记录为什么要改（用 `/update-convention` 会自动创建）

**不需要** ADR：

- 纯代码实现细节（如变量命名）
- 只影响单个文件的局部决策
- 已有规范明确覆盖的情况

## ADR 文件格式

新建 ADR 时，文件名格式：`<四位编号>-<kebab-case-标题>.md`

```markdown
# ADR-XXXX：<标题>

**状态**：提议中 / 已采纳 / 已废弃 / 已取代（由 ADR-YYYY 取代）
**日期**：YYYY-MM
**影响范围**：全局

## 背景

为什么需要做这个决策？描述触发决策的上下文、约束条件、需要解决的问题。

## 决策

选择了什么？一句话说清楚。

## 考虑过的替代方案

| 方案   | 优点 | 缺点 / 排除原因 |
| ------ | ---- | --------------- |
| 方案 A | ...  | ...             |

## 后果

### 正面影响

- ...

### 负面影响 / 约束

- ...
```

> 使用 Claude Code 的 `/adr` 命令可以引导创建符合以上格式的 ADR 文件。
