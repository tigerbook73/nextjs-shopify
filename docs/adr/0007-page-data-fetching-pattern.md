# ADR-0007：页面组件可直接调用 lib/shopify/client.ts 封装函数

**状态**：已采纳
**日期**：2026-05
**影响范围**：全局（所有 `src/app/` 页面组件）

## 背景

`architecture.md` 初始规范写道："`app/` 中的页面组件只组合 `components/` 中的组件，不直接调用 `lib/shopify/`"。

从 Phase 1 开始，页面组件（如 `products/page.tsx`、`collections/[handle]/page.tsx`）实际上直接调用了 `lib/shopify/client.ts` 中的封装函数（`getProducts()`、`getCollectionByHandle()` 等）来获取数据，再将数据作为 props 传给子组件。

规范审查时发现这一矛盾：Blueprint 的 Phase 1 设计明确描述"React Server Component | 服务端直接调用 Shopify API"，与旧规范措辞不符。

## 决策

允许 `app/` 页面组件调用 `lib/shopify/client.ts` 中的封装函数获取数据。

禁止范围收窄为：页面内不得出现原始 `fetch` 调用、内联 GraphQL 字符串或业务逻辑。

## 考虑过的替代方案

| 方案 | 优点 | 缺点 / 排除原因 |
| ---- | ---- | -------------- |
| 恢复旧规范，在页面与 lib/shopify/ 之间加 service 层 | 更严格的分层 | 对学习型项目规模属于过度设计；lib/shopify/client.ts 本身已是封装层 |
| 保持当前模式，更新规范 | 与 Blueprint 一致；符合 Next.js App Router 惯例 | 无明显缺点 |

## 后果

### 正面影响
- 规范与 Blueprint 及实际代码对齐，消除歧义
- 符合 Next.js App Router 的惯用模式（RSC 页面是数据入口）
- `lib/shopify/client.ts` 作为抽象层的意义得以保留，页面不接触原始 fetch

### 负面影响 / 约束
- 页面文件承担了数据获取职责，测试时需要 mock `lib/shopify/client.ts` 的函数
- 须严格遵守"不在页面内写业务逻辑"的配套禁止条目，防止职责进一步扩散
