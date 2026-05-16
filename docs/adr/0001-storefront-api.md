# ADR-0001：使用 Shopify Storefront API 而非 Admin API

**状态**：已采纳
**日期**：2026-05

## 背景

项目需要连接 Shopify 获取商品、系列、购物车、用户账户等数据。
Shopify 提供两套主要 API：

- **Storefront API**：面向前端的公开 GraphQL API，使用 Storefront Access Token
- **Admin API**：面向后台管理的 GraphQL/REST API，使用私密 Admin Token

需要决定前端应用使用哪一套 API。

## 决策

使用 **Shopify Storefront API**，不使用 Admin API。

## 考虑过的替代方案

| 方案           | 优点                                                 | 缺点 / 排除原因                                                              |
| -------------- | ---------------------------------------------------- | ---------------------------------------------------------------------------- |
| Storefront API | 专为前端设计、Token 安全性更高、支持购物车和结账流程 | 功能范围限于「买家视角」，无法管理商品后台                                   |
| Admin API      | 功能完整，可读写所有 Shopify 数据                    | Admin Token 是私密凭证，绝不能暴露在前端；本项目是买家端应用，不需要管理功能 |

## 后果

### 正面影响

- Storefront Access Token 可以安全地存放在环境变量中供服务端使用
- API 设计完全面向「商品浏览 → 加入购物车 → 结账」的买家流程，与项目目标高度匹配
- 学习价值：Storefront API 是大多数 Shopify Headless 项目的标准选择

### 负面影响 / 约束

- 无法通过前端直接创建/修改商品、处理订单后台、访问财务数据
- 部分 Shopify 高级功能（如 Metafield 写入）需要 Admin API，本项目暂不涉及

### 相关规范

- 见 `docs/conventions/architecture.md` 的「明确禁止事项」：禁止调用 Shopify Admin API
