# UI 可测试性规范（通用原则）

> 原则层文档，不依赖具体 UI 组件库。库特定实现见 `test-ui-e2e-testability/` 目录。

---

## 核心原则

UI 结构的设计必须面向**可测试性（Testability）**。所有生成的 UI 代码必须为 E2E 测试提供确定性的、稳定的、不依赖 DOM 层级和样式类名的定位锚点。

---

## 1. 图标及无显式文本的交互组件

**原则：** 纯图标按钮、无文字的表单控件，必须配置具备业务语义的 `aria-label`。

```tsx
// ❌ 错误
<button className="p-2"><TrashIcon /></button>

// ✅ 正确
<button aria-label="Delete product" className="p-2"><TrashIcon /></button>
```

---

## 2. 带显式文本的表单组件

**原则：** label 与 input 之间必须存在无障碍关联（aria 或 HTML5 标准关联），具体实现方式由使用的 UI 库决定。

Playwright 的 `page.getByLabel()` 依赖此关联工作，与实现方式无关。

---

## 3. 多语言环境下的按钮

**原则：** 项目启用 i18n 或文案高频变动时，即使按钮有显示文本，也必须注入 `data-testid`。

```tsx
// ❌ 错误（文案变更后测试崩溃）
<button>保存修改</button>

// ✅ 正确
<button data-testid="settings-save-btn">保存修改</button>
```

---

## 4. 布局容器与页面区块

**原则：** 复杂的页面区块（侧边栏、卡片区域、弹窗）必须配置 `data-testid` 作为测试作用域隔离边界。

```tsx
<aside data-testid="product-sidebar">...</aside>
<div data-testid="order-list">...</div>
```

---

## 5. 动态列表渲染

**原则：** `map` 循环渲染的列表项，严禁使用数组 `index` 作为 `data-testid` 的一部分，必须使用业务唯一标识。

```tsx
// ❌ 错误（顺序变化后定位失效）
items.map((item, index) => <div data-testid={`user-row-${index}`}>...</div>);

// ✅ 正确
items.map((item) => <div data-testid={`user-row-${item.userId}`}>...</div>);
```

---

## 6. data-testid 命名规范

**原则 A（页面前缀）：** 页面级非复用组件的 `data-testid` 必须带路由/页面名称前缀，格式：`[page-name]-[element-name]`。

```
settings-save-btn
product-list-filter-panel
order-detail-cancel-btn
```

**原则 B（可复用组件）：** 封装的原子组件（Button、Modal 等）严禁在内部硬编码 `data-testid`，必须通过 Props 透传。

```tsx
// ❌ 错误
function Button({ children }) {
  return <button data-testid="button">{children}</button>;
}

// ✅ 正确（透传所有 HTML 属性）
function Button({ children, ...props }) {
  return <button {...props}>{children}</button>;
}
```

---

## 7. Playwright 定位器优先级

生成 Playwright 测试代码时，严格按以下优先级选择定位器：

```
第一优先级：语义定位
  page.getByRole()   — 有文本的按钮、链接、标题
  page.getByLabel()  — 表单控件（依赖 label 关联）
  page.getByText()   — 唯一性强的文本内容

第二优先级：专属测试属性
  page.getByTestId() — 容器隔离、多语言动态文本、列表行

禁止使用：
  ❌ page.locator('.flex .items-center')    样式选择器
  ❌ page.locator('//div/div/button')       绝对 DOM 路径
```

---

## 8. 作用域链式定位

存在多个相同元素时，必须先定容器、再定元素：

```typescript
// ❌ 错误（全局捕获，strict mode error 风险）
await page.getByTestId("submit-btn").click();

// ✅ 正确（作用域隔离）
const loginCard = page.getByTestId("login-card");
await loginCard.getByTestId("submit-btn").click();
```

---

## 9. AI 自动化工作流触发规则

**生成 UI 代码时：**
检查并确保生成的代码符合本文档第 1–6 条规范，不符合时主动修正。

**UI 变更导致 data-testid 或 aria-label 修改时：**
主动扫描对应的 `.spec.ts` 文件，提出同步修正建议。

**生成 Playwright 测试代码时：**
严格按照第 7–8 条定位器优先级编写，禁止使用样式或 DOM 路径选择器。

---

## 库特定实现

根据项目实际使用的 UI 库，读取对应的实现说明：

- `shadcn/ui` → 读取 `test-ui-e2e-testability/shadcn.md`
- 未声明 → 忽略，仅遵循本文档原则
