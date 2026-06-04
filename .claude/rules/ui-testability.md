---
globs: ["src/components/**/*.tsx", "src/app/**/*.tsx", "src/context/**/*.tsx"]
---

# UI 可测试性规范

> 约束对象：UI 源码。测试写法见 `playwright.md`。
> 库特定实现细节见文末「库特定实现」章节。

---

## 核心原则

UI 结构的设计必须面向**可测试性**。所有 UI 代码必须为测试提供确定性的、稳定的、不依赖 DOM 层级和样式类名的定位锚点。

---

## 1. 图标及无显式文本的交互组件

纯图标按钮、无文字的表单控件，必须配置具备业务语义的 `aria-label`。

```tsx
// ❌
<button className="p-2"><TrashIcon /></button>

// ✅
<button aria-label="Delete product" className="p-2"><TrashIcon /></button>
```

---

## 2. 带显式文本的表单组件

label 与 input 之间必须存在无障碍关联（aria 或 HTML5 标准关联）。

`page.getByLabel()` 和 `getByLabelText()` 均依赖此关联。具体实现方式由使用的 UI 库决定，见文末「库特定实现」章节。

---

## 3. 多语言环境下的按钮

项目启用 i18n 或文案高频变动时，即使按钮有显示文本，也必须注入 `data-testid`。

```tsx
// ❌ 文案变更后测试崩溃
<button>保存修改</button>

// ✅
<button data-testid="settings-save-btn">保存修改</button>
```

---

## 4. 布局容器与页面区块

复杂的页面区块（侧边栏、卡片区域、弹窗）必须配置 `data-testid` 作为测试作用域隔离边界。

```tsx
<aside data-testid="product-sidebar">...</aside>
<div data-testid="order-list">...</div>
```

---

## 5. 动态列表渲染

`map` 渲染的列表项，严禁用数组 `index` 作为 `data-testid` 的一部分，必须使用业务唯一标识。

```tsx
// ❌ 顺序变化后定位失效
items.map((item, index) => <div data-testid={`item-${index}`}>...</div>);

// ✅
items.map((item) => <div data-testid={`item-${item.id}`}>...</div>);
```

---

## 6. data-testid 命名规范

**页面级组件（非复用）：** 格式 `[page-name]-[element-name]`

```
settings-save-btn
product-list-filter-panel
order-detail-cancel-btn
```

**可复用原子组件：** 严禁内部硬编码 `data-testid`，必须通过 Props 透传。

```tsx
// ❌
function Button({ children }) {
  return <button data-testid="button">{children}</button>;
}

// ✅
function Button({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button {...props}>{children}</button>;
}
```

---

## 库特定实现

根据项目实际使用的 UI 库，读取对应的实现说明：

- `shadcn/ui` → 读取 `.claude/rules/ui/shadcn.md`
- 未声明 → 忽略，仅遵循本文档原则

---

## 检查义务

生成或修改 UI 代码时，自动检查第 1–6 条规范，不符合时主动修正。

若本次变更涉及 `data-testid` 或 `aria-label` 的增删改，主动扫描对应测试文件，提出同步建议。
