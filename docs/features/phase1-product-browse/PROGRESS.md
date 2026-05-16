# Phase 1 — 商品浏览 进度追踪

## 当前阶段

**未开始** — 2026-05-16

---

## 上次确认提交

（尚未开始）

---

## 已完成事项

- [x] REQUIREMENTS.md 起草完成
- [x] DESIGN.md 起草完成
- [ ] 阶段 1：扩展类型定义（`ProductVariant`、`ProductDetail`）
- [ ] 阶段 2：新增 GraphQL 查询 + API 函数
- [ ] 阶段 3：配置 next.config.ts 图片域名
- [ ] 阶段 4：实现 `ProductCard` 组件
- [ ] 阶段 5：实现 `/products` 列表页
- [ ] 阶段 6：实现 `VariantSelector` 组件
- [ ] 阶段 7：实现 `/products/[handle]` 详情页
- [ ] 阶段 8：验收（lint + typecheck + build + 浏览器测试）

---

## 验收标准完成情况

| ID | 标准 | 状态 |
|----|------|------|
| AC-1 | `/products` 展示商品卡片网格 | ⬜ |
| AC-2 | 商品卡片可导航至详情页 | ⬜ |
| AC-3 | 详情页展示主图、标题、价格 | ⬜ |
| AC-4 | Variant 选择器切换后价格更新 | ⬜ |
| AC-5 | 无效 handle 返回 404 | ⬜ |
| AC-6 | `pnpm build` 预生成商品路由 | ⬜ |
| AC-7 | lint + typecheck 通过 | ⬜ |

---

## 已知偏差

（暂无）

---

## 下一步入口

按 DESIGN.md 的实施阶段顺序执行，从**阶段 1（扩展类型定义）**开始。
