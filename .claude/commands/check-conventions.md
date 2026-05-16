# /check-conventions — 规范符合性审查

执行以下步骤，对近期代码改动进行规范审查。

## 步骤 1：确定审查范围

询问用户要审查的范围（二选一）：

- **近期改动**：审查 `git diff HEAD~5..HEAD` 中涉及的文件
- **指定文件/目录**：用户提供具体路径

## 步骤 2：读取相关规范

根据改动文件类型，读取对应规范文件：

| 改动类型 | 需读取的规范 |
| -------- | ---------- |
| `src/lib/shopify/` | `docs/conventions/graphql.md` + `docs/conventions/architecture.md` |
| `src/components/` | `docs/conventions/coding.md` + `docs/conventions/directory.md` |
| `src/lib/actions/` | `docs/conventions/coding.md`（错误处理部分） |
| `src/app/` | `docs/conventions/directory.md` + `docs/conventions/coding.md` |
| 测试文件 | `docs/conventions/testing.md` |
| 任意文件 | `docs/conventions/architecture.md`（禁止事项部分） |

## 步骤 3：逐项检查

**架构合规**
- [ ] 是否有 Client Component 直接调用 Shopify API？
- [ ] 是否引入了禁止的依赖（Apollo、Zustand、urql 等）？
- [ ] 分层是否正确（API 调用在正确层次）？

**编码规范**
- [ ] 是否使用了 `any` 类型？
- [ ] Server Function 是否有明确的返回类型？
- [ ] 文件命名是否遵循规范（组件 PascalCase，工具函数 kebab-case）？

**GraphQL 规范**（如有相关改动）
- [ ] 是否通过 `shopifyFetch<T>()` 统一入口调用？
- [ ] Mutation 是否检查了 `userErrors`？
- [ ] Fragment 命名是否符合 `<TYPE>_<CONTEXT>_FRAGMENT` 格式？
- [ ] 跨文件共享的 Fragment 是否已导出和导入？

**目录结构**
- [ ] 新文件是否放在正确目录下？
- [ ] 测试文件是否与源文件共置？

## 步骤 4：输出审查报告

```
## 规范审查报告

审查范围：<文件/目录>
适用规范：<规范文件列表>

### 符合规范
- <具体说明>

### 需要关注
- <问题描述> → 建议：<改进方式>

### 违反规范
- <规范文件名 + 章节> — <具体违反点> → 必须修改：<修改方向>
```

如果没有发现问题，输出：`✅ 审查完成，未发现规范偏离`
