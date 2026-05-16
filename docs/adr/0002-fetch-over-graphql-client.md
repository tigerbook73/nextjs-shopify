# ADR-0002：使用原生 fetch 而非 GraphQL 客户端库

**状态**：已采纳
**日期**：2026-05

## 背景

项目使用 Shopify Storefront API（GraphQL），需要决定如何发送 GraphQL 请求。
可选方案包括：原生 `fetch`、Apollo Client、urql、graphql-request 等。

## 决策

使用**原生 `fetch` + 手写 GraphQL query 字符串**，封装为统一的 `shopifyFetch<T>()` 函数，
不引入第三方 GraphQL 客户端库。

## 考虑过的替代方案

| 方案            | 优点                                                            | 缺点 / 排除原因                                                                             |
| --------------- | --------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| 原生 fetch      | 零依赖、与 Next.js Data Cache 天然集成、学习 GraphQL 原理最直接 | 需要手写类型，无自动补全（可用 codegen 弥补）                                               |
| Apollo Client   | 功能完整、缓存强大、生态成熟                                    | 包体积大（~30KB+）、RSC 兼容性复杂、需要额外配置才能与 Next.js 缓存集成、隐藏了 HTTP 层细节 |
| urql            | 比 Apollo 轻量                                                  | 对 RSC 的支持仍在演进，增加不必要的复杂度                                                   |
| graphql-request | 轻量、简单                                                      | 额外依赖，原生 fetch 已足够满足需求                                                         |

## 后果

### 正面影响

- **学习价值最高**：手写 GraphQL 字符串能直观理解 Shopify API 的查询结构
- **与 Next.js Data Cache 无缝集成**：可以直接给 `fetch` 传 `{ next: { tags, revalidate } }` 选项
- **零客户端 bundle 影响**：所有请求在服务端发出，不影响前端包体积
- **依赖最小化**：减少第三方库带来的兼容性风险

### 负面影响 / 约束

- 没有自动类型生成，早期需要手写 TypeScript 类型
- 没有请求去重和客户端缓存（本项目全部在服务端获取数据，不需要）
- Phase 5 之后可引入 `@shopify/storefront-api-types` 改善类型体验

### 相关规范

- 见 `docs/conventions/graphql.md`：所有 Shopify API 调用必须通过 `shopifyFetch<T>()` 入口
- 见 `docs/conventions/architecture.md`：禁止引入 Apollo Client / urql
