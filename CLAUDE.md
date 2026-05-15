# nextjs-shoptify 项目规范（Claude Code）

> 本文件为项目级补充规则，与全局 `~/.claude/CLAUDE.md` 叠加生效。
> Plan Gate、文件删除保护、Git 操作限制等核心规则见全局配置，此处不重复。

---

## 当前开发阶段

**Phase 0（基础搭建）已完成 → Phase 1（商品浏览）即将开始**

完整阶段规划见 `BLUEPRINT.md`。开始某个 Phase 前，先确认当前阶段状态。

---

## 规范体系

所有规范的唯一权威来源：`docs/conventions/`

| 规范文件 | 覆盖内容 |
|---------|---------|
| `docs/conventions/architecture.md` | 技术选型、架构分层、禁止事项 |
| `docs/conventions/coding.md` | TypeScript 规范、命名、注释、组件边界 |
| `docs/conventions/testing.md` | 测试范围、工具、文件位置 |
| `docs/conventions/directory.md` | 目录结构、文件命名规则 |
| `docs/conventions/graphql.md` | 查询/变更/Fragment 规范 |
| `docs/conventions/ai-workflow.md` | AI 工具选择、开发流程、审查清单 |

架构决策记录（为什么做某个决定）：`docs/adr/`

### 规范冲突处理规则

实现任何功能前，先检查 `docs/conventions/` 中的相关规范。若发现：

- **实现方案与现有规范冲突**：必须先说明冲突点，等用户决定「调整实现」还是「更新规范」，不得擅自继续
- **现有规范无法覆盖新场景**：说明缺口，建议通过 `/update-convention` 补充规范后再实现
- **规范本身存在歧义**：提出歧义，等待澄清

---

## 功能文档体系

进行中的功能：`docs/features/<feature-id>/`
已完成的功能：`docs/features/-<feature-id>/`（目录名前加 `-`）

每个功能目录需包含三个文件：

| 文件 | 内容 |
|------|------|
| `REQUIREMENTS.md` | 产品目标、用例、业务规则、验收标准 |
| `DESIGN.md` | 技术设计、数据模型、API 契约、实现阶段、测试计划 |
| `PROGRESS.md` | 当前阶段、上次确认提交、已完成事项、已知偏差、下一步入口 |

**继续开发某功能时**：先读 `PROGRESS.md` → `DESIGN.md` → `REQUIREMENTS.md`，从文档恢复状态，而不是扫描整个代码库。

---

## 可用的项目级 Slash 命令

| 命令 | 用途 |
|------|------|
| `/check-conventions` | 审查近期改动是否符合 `docs/conventions/` 规范 |
| `/update-convention` | 当实现与规范冲突时，引导完成规范更新全流程 |
| `/adr` | 创建新的架构决策记录（ADR） |

---

## 提交规范

提交信息格式：`<phase>/<scope>: <描述>`

示例：
- `phase0/setup: 初始化 Next.js App Router 项目`
- `phase1/products: 添加商品列表 RSC 数据获取`
- `phase4/cart: 实现 Server Action addToCart`

功能类提交附带 feature-id：`phase1/products(feat-product-list): 完成商品分页`
