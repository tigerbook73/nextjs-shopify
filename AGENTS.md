# nextjs-shoptify 项目规范（Codex / ChatGPT）

> 本文件适用于 OpenAI Codex 及 ChatGPT 辅助开发场景。
> 所有规范以 `docs/conventions/` 为权威来源，本文件只说明使用协议，不重复规范内容。

---

## 开始前必读

在开始任何实现任务前，先阅读以下规范文件中的相关部分：

- **架构约束**：`docs/conventions/architecture.md`（技术选型、禁止事项、分层规则）
- **编码规范**：`docs/conventions/coding.md`（TypeScript、命名、注释）
- **目录结构**：`docs/conventions/directory.md`（文件放在哪里）
- **GraphQL 规范**：`docs/conventions/graphql.md`（查询、变更、Fragment 格式）
- **测试策略**：`docs/conventions/testing.md`（什么要测、什么不测）

架构决策背景见 `docs/adr/`，理解「为什么」才能在边界情况做出正确判断。

---

## 规范冲突处理

若实现方案与 `docs/conventions/` 中的规范冲突，必须先说明冲突点，
等用户决定「调整实现」还是「更新规范」，不得擅自继续。

---

## 功能文档体系

进行中的功能：`docs/features/<feature-id>/`
已完成的功能：`docs/features/-<feature-id>/`（目录名前加 `-`）

每个功能目录包含：

| 文件 | 内容 |
|------|------|
| `REQUIREMENTS.md` | 产品目标、用例、业务规则、验收标准 |
| `DESIGN.md` | 技术设计、数据模型、API 契约、实现阶段、测试计划 |
| `PROGRESS.md` | 当前阶段、上次确认提交、已完成事项、已知偏差、下一步入口 |

### 继续开发协议

当用户说「继续 `<feature-id>` 的开发」时：

1. 打开 `docs/features/<feature-id>/PROGRESS.md`
2. 打开 `DESIGN.md`
3. 打开 `REQUIREMENTS.md`
4. 如果三个文件有任何一个缺失，停止并报告缺失文件

从文档恢复状态，不要扫描整个代码库。只在文档与代码存在矛盾时才检查代码。

### 文档一致性检查（继续开发前执行）

- 检查 `git status`
- 检查 `PROGRESS.md` 中「上次确认提交」之后的新提交
- 若 `REQUIREMENTS.md`、`DESIGN.md`、`PROGRESS.md` 在上次进度点后有改动：
  - 简单的机械性不一致（如进度描述过时）：自动刷新文档再继续
  - 影响需求、设计范围、阶段顺序的不一致：停止并向用户说明，等待决策

### 阶段提交前更新文档

每个实现阶段完成后提交前，更新 `PROGRESS.md` 中的进度、下一步、已知偏差。
不要为无关改动更新功能文档。只在设计真正改变时才更新 `DESIGN.md`。

---

## 当前开发阶段

**Phase -1（AI 工程脚手架）已完成 → Phase 0（基础搭建）即将开始**

完整阶段规划见 `BLUEPRINT.md`。

---

## 提交信息规范

格式：`<phase>/<scope>: <中文描述>`

示例：`phase1/products: 添加商品列表 RSC 数据获取`
