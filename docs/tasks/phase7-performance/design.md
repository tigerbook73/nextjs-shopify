# 设计：phase7-performance

## 总体方案

Phase 7 不新增核心电商业务能力，采用“小步验收 + 小步收尾 + 可验证审计”的实现方式。Playwright 只用于自动化验收 Phase 7 自身交付物，不作为全站长期 e2e 测试体系；代码改动集中在测试配置、App Router 约定文件、根布局字体配置、Next.js 配置和项目脚本；审计结论记录在任务文档中，避免把一次性分析结果混入运行时代码。

现有 `src/app/layout.tsx` 已使用 `next/font/google` 的 Geist 字体，因此字体步骤以“确认并收敛配置”为主：确保根布局应用稳定、无外部字体 CSS，必要时调整 `lang`、CSS token 或字体变量命名。若后续发现 `next/font/google` 在当前环境下不满足“本地字体优化”的学习目标，再改为 `next/font/local`，但不把字体文件引入作为默认设计。

`@next/bundle-analyzer` 是开发期分析工具，放入 `devDependencies`，通过环境变量或专用脚本启用，不影响普通用户路径。

Playwright 作为开发/测试依赖引入，测试范围限定为 Phase 7 自身验收：确认 404 页面、错误边界恢复入口、字体配置可见结果，以及本阶段实际新增的收尾行为。测试不覆盖 Phase 0-6 已有业务流程，不覆盖真实支付、Shopify 后台、真实用户注册登录或完整订单链路。由于 404 和错误边界在 Step 2 才会实现，Step 1 只建立 Playwright 工具链和测试约定，首批业务化验收测试随对应交付物一起落地。

Edge Runtime 和地区/货币提示只做适用性评估。当前项目的账户鉴权已使用 Middleware，理论上天然运行在边缘环境；如果要继续使用地区信息，必须避免引入完整 Shopify Markets 行为。

## 文件与模块规划

- `playwright.config.ts`：Playwright 配置，负责启动本地 Next.js 服务并运行 Phase 7 阶段验收测试。
- `tests/e2e/`：Phase 7 自身交付物验收测试。
- `src/app/not-found.tsx`：应用级 404 页面。
- `src/app/error.tsx`：应用级错误边界，作为最小 Client Component，仅用于 `reset()` 交互。
- `src/app/phase7-error-test/page.tsx`：测试专用错误触发页，仅在 Playwright 环境变量开启时抛出错误，用于验收错误边界。
- `src/app/layout.tsx`：复核 `next/font` 配置、语言属性和全局字体变量。
- `next.config.ts`：接入 bundle analyzer 包装配置。
- `package.json`：新增 bundle 分析脚本或约定环境变量。
- `docs/tasks/phase7-performance/design.md`：记录 bundle、Lighthouse、Edge Runtime 的审计结论。
- `docs/tasks/phase7-performance/task-state.md`：记录步骤状态、提交、自动检查和人工检查结果。

## 实现步骤

### Step 1：建立 Phase 7 Playwright 自动化验收

目标：为 Phase 7 自身交付物提供可重复运行的自动化验收工具链，不扩大为全站 e2e 测试体系。

改动：

- 安装 `@playwright/test` 到 `devDependencies`。
- 新增 `playwright.config.ts`，使用本地 Next.js 服务作为测试目标。
- 新增 `tests/e2e/` 目录和 Phase 7 测试命名约定；具体测试随对应 Phase 7 交付物在后续步骤加入。
- 在 `package.json` 增加 `test:e2e` 脚本。
- 记录本地首次运行需要安装浏览器，例如 `pnpm exec playwright install chromium`。

自动验收：

- `pnpm lint`
- `pnpm typecheck`
- `pnpm exec playwright --version`

人工验收：

- 确认 Playwright 配置、脚本和目录约定存在，且测试范围说明只覆盖 Phase 7 自身交付物，没有引入 Phase 0-6 业务链路、真实支付、后台管理或完整订单链路。

### Step 2：补齐错误与 404 页面

目标：为未知路由和运行时错误提供一致、克制的用户体验。

改动：

- 新增 `src/app/not-found.tsx`，包含返回首页、浏览商品等稳定入口。
- 新增 `src/app/error.tsx`，使用 `"use client"`，接收 `reset`，避免展示错误堆栈或内部细节。
- 新增首批 Phase 7 Playwright 测试，覆盖未知路由进入自定义 404 页面。
- 新增测试专用错误触发页，默认不可用；仅当 Playwright webServer 注入测试环境变量时抛出错误，用于自动化验证 `error.tsx` 渲染和 `reset()` 入口。
- 页面样式复用现有 Tailwind token，不引入新 UI 依赖。

自动验收：

- `pnpm lint`
- `pnpm typecheck`
- `pnpm test:e2e`

人工验收：

- 访问不存在路径，确认展示 404 页面。
- `pnpm test:e2e` 中的 404 和错误边界测试通过。

### Step 3：收敛字体与根布局配置

目标：确认字体加载由 `next/font` 管理，并减少布局偏移风险。

改动：

- 复核 `src/app/layout.tsx` 中 Geist 字体配置和 `className` 应用方式。
- 复核 `src/app/globals.css` 中字体 token 是否正确指向 `next/font` 变量。
- 视情况将 `html lang` 从默认英文调整为更符合当前中文学习项目的值，但不影响路由和数据层。
- 增加 Phase 7 Playwright 测试，验证根元素包含 `next/font` 注入的字体变量类，避免字体配置在后续修改中丢失。

自动验收：

- `pnpm lint`
- `pnpm typecheck`
- `pnpm build`
- `pnpm test:e2e`

人工验收：

- 构建输出无外部字体 CSS 依赖警告。
- 首屏字体样式稳定，无明显布局跳动。
- `pnpm test:e2e` 中的字体配置测试通过。

### Step 4：添加 bundle analyzer 能力

目标：建立客户端 bundle 可视化分析入口，不影响默认构建。

改动：

- 安装 `@next/bundle-analyzer` 到 `devDependencies`。
- 在 `next.config.ts` 中按环境变量启用 analyzer。
- 在 `package.json` 增加 `analyze` 脚本，例如通过 `ANALYZE=true next build` 触发。

自动验收：

- `pnpm lint`
- `pnpm typecheck`
- `pnpm build`
- `pnpm analyze` 能启动分析构建。

人工验收：

- 记录主要客户端 bundle 来源。
- 判断是否存在本阶段应处理的明显异常依赖或过大 Client Component。

### Step 5：执行性能审计并记录结论

目标：完成一次有记录的 Lighthouse 导向审计，并应用低风险优化。

改动：

- 在设计文档追加“审计记录”章节，记录被审计页面、bundle 观察、Lighthouse 观察、处理结论。
- 对低风险问题做定向修复，例如图片尺寸、无障碍标签、metadata、过大的客户端边界等。
- 不为追分做大范围 UI 重写。

自动验收：

- `pnpm lint`
- `pnpm typecheck`
- `pnpm build`

人工验收：

- 至少审计首页、商品列表页、商品详情页、购物车页。
- 文档中记录每个页面的主要结论和已处理项。

### Step 6：评估 Edge Runtime 与地区提示

目标：明确 Phase 7 中 Edge 和地区/货币提示的边界，避免过度实现 Shopify Markets。

改动：

- 评估现有 `src/middleware.ts` 的运行位置、能力边界和当前账户鉴权逻辑。
- 判断是否需要在 Middleware 中读取请求地区信息并设置轻量提示。
- 若实现地区提示，只展示“可能适用的地区/货币提示”，不改变商品价格、税费、Cart buyer identity 或 checkout 行为。
- 若暂缓实现，在设计文档记录原因。

自动验收：

- `pnpm lint`
- `pnpm typecheck`
- `pnpm build`

人工验收：

- 文档明确记录 Edge Runtime 采用或暂缓的结论。
- 如实现提示，确认不会影响登录、购物车和 checkout 跳转。

## 审计记录

待实现阶段补充：

- Bundle 分析结论：待记录。
- Lighthouse 审计页面：首页、商品列表页、商品详情页、购物车页。
- Playwright 阶段验收结论：待记录。
- Edge Runtime 结论：待记录。

## 风险与取舍

- Playwright 会新增开发依赖和浏览器运行环境要求；本任务只用于 Phase 7 自身验收，避免把学习项目变成高维护成本的全站 e2e 测试矩阵。
- 测试专用错误触发页必须由 Playwright 环境变量保护，避免普通用户在生产环境访问到可触发错误的入口。
- `@next/bundle-analyzer` 会新增开发依赖，但只在分析构建时启用，正常用户 bundle 不应受影响。
- `error.tsx` 必须是 Client Component，这是 Next.js 错误边界约定带来的必要客户端边界。
- 地区/货币提示容易滑向完整多市场能力，本任务只允许轻量提示，不改变 Shopify 数据语义。
- 当前已有 `next/font/google`，如果强行切换为本地字体文件，学习价值有限且会增加静态资源维护成本；默认保持 Next.js 管理字体加载。

## 最终验收命令

- `pnpm lint`
- `pnpm typecheck`
- `pnpm build`
- `pnpm test:e2e`
- `pnpm analyze`
