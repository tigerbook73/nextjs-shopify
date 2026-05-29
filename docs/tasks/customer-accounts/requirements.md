# Requirements: customer-accounts

## Goal

将用户账户系统从 Shopify Classic Customer Accounts（Storefront API `customerAccessToken`）
迁移到 **New Customer Accounts**（Customer Account API，OAuth 2.0 + PKCE），
并在此基础上补全自助服务功能（资料编辑、地址管理、订单详情），
同时为登录用户提供明确的差异化价值。

## Background and Motivation

**技术动机：**

| 维度         | Classic（当前）           | New（目标）                      |
| ------------ | ------------------------- | -------------------------------- |
| 认证协议     | 自定义 token              | OAuth 2.0 / OIDC                 |
| 密码重置     | 需自行发送邮件            | Shopify 托管，无需实现           |
| 邮件验证     | 无内建支持                | Shopify 托管                     |
| Session 安全 | 单一 accessToken（30 天） | access + refresh token，自动续期 |
| 长期支持     | Shopify 已标记为旧版      | 官方推荐路径                     |

**功能缺口：**

当前实现仅有登录/注册/登出和历史订单列表，缺少：

- 密码重置入口（最大缺口，用户忘记密码时无路可走）
- 个人资料编辑
- 收货地址管理
- 订单详情页
- 登录用户的差异化体验

## Functional Requirements

### FR-1 OAuth 认证流程

- 登录：点击登录跳转 Shopify 托管登录页，完成后回调 `/api/auth/callback`，写入 token Cookie
- 注册：同一托管页处理，无需自建注册表单
- 密码重置：Shopify 登录页内建，无需自行实现
- 登出：清除本地 token Cookie，调用 Shopify 吊销端点
- Token 续期：access token 过期时，Middleware 用 refresh token 无感续期
- Session 存储：`access_token` + `refresh_token` 均存 httpOnly Cookie

### FR-2 账户概览

- 展示用户姓名（displayName）、邮箱
- 展示历史订单笔数
- 头像 initials（已有，保留）

### FR-3 个人资料编辑

- 修改 firstName / lastName
- 修改邮箱

### FR-4 收货地址管理

- 查看地址列表
- 新增地址
- 编辑已有地址
- 删除地址
- 设为默认地址

### FR-5 订单列表与详情

- 订单列表：订单号、日期、金额、状态（已有，迁移至新 API）
- 订单详情页：商品列表（含图片）、物流状态、配送地址、金额明细
- 物流追踪链接（如有）

### FR-6 登录差异化价值

- Header 中已登录用户显示订单快速入口
- 账户页个性化欢迎语

### FR-7 旧代码清理

- 移除 Classic API 的 mutations、queries、actions、表单组件、login/register 页面
- 移除 Classic 专用 TypeScript 类型

## Non-Functional Requirements

- **安全**：PKCE 防止授权码截获；`state` 参数防 CSRF；所有 token 仅存 httpOnly Cookie，不暴露给 JS
- **兼容性**：Next.js App Router + Middleware；不引入新的状态管理库
- **环境变量**：新增 `SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_ID`、`SHOPIFY_SHOP_ID`、`NEXT_PUBLIC_APP_URL`
- **前置条件**：Shopify Admin 需开启 New Customer Accounts 并配置 Headless channel

## Out of Scope

- Wishlist / 收藏夹（需独立 Phase）
- 结账 UI 改造（项目策略：跳转原生 Shopify Checkout）
- 多语言 / 多币种账户设置
- B2B / 批发账户
- 访客结账后账户激活邮件流程

## Acceptance Criteria

使用 Playwright 进行 E2E 自动化测试，测试账号通过环境变量注入（`TEST_CUSTOMER_EMAIL` / `TEST_CUSTOMER_PASSWORD`）。每条验收项标注验证方式；详细测试场景在 Design 阶段补充。

- [ ] 未登录访问 `/account` 被重定向至登录入口 — **E2E 自动**
- [ ] 登出后跳转首页，所有 token Cookie 清除 — **E2E 自动**
- [ ] Access token 过期后自动续期，用户不跳转登录页 — **E2E 自动**（Mock token 端点）
- [ ] 账户页可修改 firstName / lastName 并即时反映 — **E2E 自动**
- [ ] 可新增、编辑、删除收货地址，并设定默认地址 — **E2E 自动**
- [ ] 订单列表可进入订单详情，展示商品图片和物流状态 — **E2E 自动**
- [ ] Header 中已登录用户可直接跳转订单列表 — **E2E 自动**
- [ ] 旧版 Classic API 相关代码全部移除，无残留引用 — **E2E 自动**（`grep` 断言）
- [ ] 通过 Shopify 托管页完成完整登录流程 — **手动**（Shopify 托管页跨域，Playwright 无法操作）
- [ ] 通过 Shopify 托管页完成注册和密码重置 — **手动**（同上，且涉及真实邮件收发）
