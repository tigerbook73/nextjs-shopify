# /check-conventions — 规范符合性检查

执行以下步骤，对近期代码改动进行规范审查：

## 步骤 1：确定审查范围

询问用户要审查的范围（以下二选一）：

- **近期改动**：审查 `git diff HEAD~5..HEAD` 中涉及的文件
- **指定文件/目录**：用户提供具体路径

## 步骤 2：读取相关规范

根据改动文件的类型，读取对应的规范文件：

| 改动类型 | 需读取的规范 |
|---------|------------|
| `src/lib/shopify/` 下的文件 | `docs/conventions/graphql.md` + `docs/conventions/architecture.md` |
| `src/components/` 下的文件 | `docs/conventions/coding.md` + `docs/conventions/directory.md` |
| `src/lib/actions/` 下的文件 | `docs/conventions/coding.md`（错误处理部分） |
| `src/app/` 下的文件 | `docs/conventions/directory.md` + `docs/conventions/coding.md` |
| 测试文件 | `docs/conventions/testing.md` |
| 任意文件 | `docs/conventions/architecture.md`（禁止事项部分） |

## 步骤 3：逐项检查

按以下维度审查代码：

**架构合规**
- [ ] 是否有 Client Component 直接调用 Shopify API？
- [ ] 是否引入了禁止的依赖（Apollo、Zustand、urql 等）？
- [ ] 分层是否正确（API 调用是否在正确层次）？

**编码规范**
- [ ] 是否使用了 `any` 类型？
- [ ] Server Function 是否有明确的返回类型？
- [ ] 文件命名是否遵循 kebab-case？
- [ ] 组件导出是否遵循规范（页面用默认导出，其他用具名导出）？

**GraphQL 规范**（如有 GraphQL 相关改动）
- [ ] 是否通过 `shopifyFetch<T>()` 统一入口调用？
- [ ] Mutation 是否检查了 `userErrors`？
- [ ] Fragment 命名是否符合 `<TYPE>_<CONTEXT>_FRAGMENT` 格式？
- [ ] 是否有缓存标签（`tags`）配置？

**目录结构**
- [ ] 新文件是否放在正确的目录下？
- [ ] 测试文件是否与源文件共置？

## 步骤 4：输出审查报告

用以下格式输出结果：

```
## 规范审查报告

### ✅ 符合规范的部分
- ...

### ⚠️ 发现的偏离
| 文件 | 行号 | 问题描述 | 对应规范 |
|------|------|---------|---------|
| ... | ... | ... | ... |

### 建议
- 需要修正的问题：...
- 建议更新规范的场景：...（如有，建议运行 /update-convention）
```

如果没有发现问题，输出：`✅ 审查完成，未发现规范偏离`
