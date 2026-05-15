# ADR-0003：跳转 Shopify 原生 Checkout 而非自建 Checkout UI

**状态**：已采纳
**日期**：2026-05

## 背景

电商项目的核心转化路径是「商品浏览 → 加入购物车 → 结账 → 支付」。
「结账」环节有两种实现方式：
1. 使用 Shopify 托管的原生 Checkout 页面（通过 `cart.checkoutUrl` 跳转）
2. 自建 Headless Checkout UI，接管支付流程

## 决策

**跳转 Shopify 原生 Checkout**，不自建 Checkout UI。
购物车完成后，通过 `cart.checkoutUrl` 将用户跳转至 Shopify 托管的结账页。

## 考虑过的替代方案

| 方案 | 优点 | 缺点 / 排除原因 |
|------|------|---------------|
| 跳转原生 Checkout | 零实现成本、Shopify 已处理支付/税率/物流/优惠码等复杂逻辑、合规性由 Shopify 保证 | 结账页样式不受控，品牌一致性较弱 |
| 自建 Checkout UI | 完整品牌控制、用户体验连贯 | 实现成本极高（支付集成、税率计算、物流接入、合规要求等），超出本项目学习目标 |

## 后果

### 正面影响
- **学习聚焦**：可以将精力集中在 Next.js 高级能力和 Shopify 前端生态，而不是支付系统
- **实际可用**：结账和支付真实可用，不只是 Demo
- **行业惯例**：99% 的 Shopify Headless 项目也使用原生 Checkout，这是行业最佳实践
- **风险为零**：支付安全、PCI 合规、税率计算全部由 Shopify 负责

### 负面影响 / 约束
- Checkout 页面的样式通过 Shopify Theme Editor 配置，不在代码库中管理
- 用户在结账时会离开自建前端，品牌体验有断点

### 补充说明
Shopify 的 Checkout Extensibility 功能允许通过 Shopify Functions 和 UI Extensions
在原生 Checkout 中添加自定义逻辑和 UI 块，是未来探索的方向，但不在本项目范围内。

### 相关规范
- 见 `docs/conventions/architecture.md`：禁止自建 Checkout UI
- 见 `BLUEPRINT.md` Phase 4：Cart 完成后通过 `cart.checkoutUrl` 跳转
