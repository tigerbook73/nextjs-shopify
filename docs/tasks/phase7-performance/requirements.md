# 需求：phase7-performance

## 目标

完成 Phase 7 的性能优化与收尾工作，让当前 Shopify 店铺从“功能可用”推进到“更接近产品化交付”：补齐错误与 404 体验，优化字体加载，建立 bundle 可视化分析入口，并完成一次有记录的 Lighthouse 审计与针对性优化。

## 背景与动机

- Phase 0-6 已经完成核心 Shopify 店铺链路：商品浏览、系列导航、搜索、购物车、缓存策略和用户账户。
- `BLUEPRINT.md` 中 Phase 7 的定位是“性能优化与收尾”，重点不是新增业务能力，而是提高整体体验、可观测性和交付完整度。
- 本任务必须继续遵守项目既有架构：Next.js App Router、仅使用 Shopify Storefront API、原生 `fetch`、不引入客户端状态库、不自建 Checkout UI。

## 功能需求

- 添加应用级 `not-found.tsx`，让未知路由和缺失内容进入统一、清晰的 404 体验。
- 添加应用级 `error.tsx`，让运行时错误进入统一错误边界，并提供明确的恢复路径，不暴露实现细节。
- 接入 `next/font`，通过 Next.js 管理字体加载，降低布局偏移风险，避免依赖外部字体 CSS。
- 添加 bundle 分析能力，优先使用 `@next/bundle-analyzer` 或 Next.js 生态内等价方案。
- 产出 bundle 分析记录，说明主要客户端 bundle 来源，并记录是否需要进一步优化。
- 对关键页面执行 Lighthouse 导向的审计，记录结果、问题和已完成的低风险修复。
- 评估 Edge Runtime 对当前项目的适用性，明确记录是否采用，以及采用或暂缓的原因。
- 可选：在不引入完整 Shopify Markets 复杂度的前提下，基于请求地区信息提供轻量的地区/货币提示。

## 非功能需求

- 保持现有 App Router 与服务端优先架构，不把 Shopify 数据获取移动到 Client Component。
- 不引入 Apollo、urql、graphql-request、Zustand、Redux、Jotai，不调用 Shopify Admin API，不自建 Checkout UI。
- 新增依赖必须有明确 Phase 7 价值，并且不能显著增加正常用户路径的客户端 bundle。
- 错误页不得泄露 stack trace、token、Shopify API 细节或内部环境信息。
- 性能优化必须能通过项目命令或记录下来的人工审计结果验证。
- 现有用户链路必须继续通过 `pnpm lint`、`pnpm typecheck` 和 `pnpm build`。

## 非目标

- 不实现完整 Shopify Markets，包括持久化 buyer identity、本地化商品定价、税费行为或市场专属路由。
- 不从 Storefront Customer API 迁移到新版 Customer Account API。
- 不做 Persisted GraphQL Queries、GraphQL Codegen 或大范围 query cost 重构；除非 Phase 7 审计发现必须做小范围定向修复。
- 不重设计店铺 UI，不重建已有商品、系列、购物车、搜索或账户流程。
- 不实现自定义 Checkout、支付、折扣、物流或订单管理能力。
- 不为了 Phase 7 单独引入大规模端到端测试基础设施。

## 验收标准

- 未知路由会渲染新的 404 页面。
- App 路由树内的运行时错误会渲染新的错误边界页面，并提供返回稳定页面的入口。
- 字体加载通过 `next/font` 配置，根布局应用该字体，不依赖外部字体 CSS。
- bundle analyzer 可以通过已记录的 pnpm 脚本或环境变量方式运行。
- 任务或功能文档中记录 bundle 分析结论，至少说明是否需要继续优化。
- 任务或功能文档中记录关键页面 Lighthouse 审计结论，并完成可低风险落地的修复。
- 任务或功能文档中记录 Edge Runtime 评估结论：明确采用目标，或说明暂缓原因。
- `pnpm lint`、`pnpm typecheck`、`pnpm build` 全部通过。
