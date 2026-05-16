# ADR-0005：采用 Next.js App Router 而非 Pages Router

**状态**：已采纳
**日期**：2026-05
**影响范围**：全局

## 背景

本项目以学习 Next.js 高级 SSR 能力为目标之一。Next.js 13 起引入 App Router，支持 React Server Components、Streaming、Server Actions 等现代能力，是 Next.js 官方推荐的新架构。Pages Router 为旧架构，仍受支持但不再主动演进。

## 决策

采用 App Router（`src/app/` 目录），不使用 Pages Router。

## 考虑过的替代方案

| 方案 | 优点 | 缺点 / 排除原因 |
| ---- | ---- | -------------- |
| Pages Router | 生态成熟，文档示例多 | 不支持 RSC 和 Server Actions，无法覆盖本项目的学习目标 |
| 混合使用 | 渐进迁移场景适用 | 新项目没有存量代码，混合只会增加心智负担 |

## 后果

### 正面影响
- 原生支持 React Server Components，数据获取在服务端完成，无客户端 fetch 泄漏
- Server Actions 简化表单和 Cart 操作，无需手写 API Route
- Streaming + Suspense 支持逐步渲染，改善感知性能
- `generateMetadata`、`generateStaticParams`、`sitemap.ts` 等 SEO 能力开箱即用

### 负面影响 / 约束
- App Router 生态中部分第三方库尚未完全兼容（引入新依赖时需验证）
- `'use client'` / Server Component 边界需要主动管理，见 `docs/conventions/coding.md`
- 调试体验相比 Pages Router 略复杂
