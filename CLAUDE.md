# nextjs-shopify 项目规范（Claude Code）

> 本文件为项目级补充规则，与全局 `~/.claude/CLAUDE.md` 叠加生效。
> Plan Gate、文件删除保护、Git 操作限制等核心规则见全局配置，此处不重复。

## 当前开发阶段

**professional-ui 任务已完成 → BLUEPRINT.md Phase A / B / C 全部交付（11 个步骤）**

- Phase A（布局 & 首页）：Announcement Bar、首页重设计、Footer、移动菜单 ✅
- Phase B（商品 & 浏览）：商品徽章、图片画廊、相关商品、Collection 筛选/排序 ✅
- Phase C（交互 & 收尾）：Cart Drawer、Toast 通知、骨架屏、账户视觉 ✅

**已知待做项（下个任务）**

- CartCount 实时更新：当前 `CartCount` 是 Server Component，加购后数字不刷新；
  方案已规划（见 plan `recursive-finding-ocean`）：将 cartCount 提升至 CartContext，
  layout.tsx 服务端读取初始值，AddToCartButton/CartDrawer 负责客户端同步。

若继续扩展，需先在 `BLUEPRINT.md` 中新增阶段定义，再按任务流程开启新 Phase。

## 规范体系

所有规范的唯一权威来源：`docs/conventions/`

| 规范文件                           | 覆盖内容                                 |
| ---------------------------------- | ---------------------------------------- |
| `docs/conventions/architecture.md` | 技术选型、架构分层、禁止事项             |
| `docs/conventions/coding.md`       | 编码规范、命名、注释、组件边界、提交规范 |
| `docs/conventions/testing.md`      | 测试范围、工具、文件位置                 |
| `docs/conventions/directory.md`    | 目录结构、文件命名规则                   |
| `docs/conventions/graphql.md`      | 查询/变更/Fragment 规范                  |
| `docs/conventions/ai-workflow.md`  | AI 工具选择、开发流程、审查清单          |

实现任何功能前，先检查 `docs/conventions/` 中的相关规范。若发现冲突，必须先说明冲突点，等用户决定「调整实现」还是「更新规范」，不得擅自继续。

## 工作文档体系

`docs/features/` 用于为 AI 提供任务上下文。

进行中的功能：`docs/features/<feature-id>/`，完成后改为 `docs/features/-<feature-id>/`。

继续开发某功能时：先读 `PROGRESS.md` → `DESIGN.md` → `REQUIREMENTS.md`，从文档恢复状态，而不是扫描整个代码库。

## 可用 Claude Code Slash 命令

| 命令                 | 用途                     |
| -------------------- | ------------------------ |
| `/check-conventions` | 审查近期改动是否符合规范 |
| `/update-convention` | 规范冲突时的引导更新流程 |
| `/adr`               | 创建新的架构决策记录     |

## 提交规范

格式：`type(scope): description`（Conventional Commits，英文描述）

示例：

- `feat(collections): add collection list and detail pages`
- `fix(graphql): remove multi-line comment in collection query`
- `chore(tooling): install @shopify/cli and add env:check script`
- `docs(conventions): update architecture layering rule`

完整 type 列表见 `docs/conventions/coding.md`。
