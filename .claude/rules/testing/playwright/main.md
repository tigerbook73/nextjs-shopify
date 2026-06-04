---
paths: ["tests/e2e/**/*.spec.ts", "tests/e2e/**/*.ts"]
---

# Playwright E2E 测试规范

> 约束对象：E2E 测试代码。

---

## 定位器优先级

严格按以下优先级选择定位器：

```
第一优先级：语义定位
  page.getByRole()   — 有文本的按钮、链接、标题
  page.getByLabel()  — 表单控件（依赖 label 关联）
  page.getByText()   — 唯一性强的文本内容

第二优先级：专属测试属性
  page.getByTestId() — 容器隔离、多语言动态文本、列表行

禁止使用：
  ❌ page.locator('.flex .items-center')   样式选择器
  ❌ page.locator('//div/div/button')      绝对 DOM 路径
```

---

## 作用域链式定位

存在多个相同元素时，必须先定容器、再定元素：

```typescript
// ❌ 全局捕获，strict mode error 风险
await page.getByTestId("submit-btn").click();

// ✅ 作用域隔离
const loginCard = page.getByTestId("login-card");
await loginCard.getByTestId("submit-btn").click();
```
