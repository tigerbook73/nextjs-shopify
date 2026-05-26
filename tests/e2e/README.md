# Phase 7 Playwright 验收

本目录只存放 Phase 7 自身交付物的自动化验收测试。

范围包括：

- 404 页面
- 错误边界恢复入口
- 字体配置可见结果
- Phase 7 新增的收尾行为

不覆盖 Phase 0-6 已有业务链路、真实支付、Shopify 后台、真实用户注册登录或完整订单流程。

首次本地运行前如缺少浏览器，执行：

```bash
pnpm exec playwright install chromium
```
