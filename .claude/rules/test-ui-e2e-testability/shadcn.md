# testability / shadcn/ui 实现对照

> 本文档是 `rule.md` 的库特定补充，说明 shadcn/ui 场景下各原则的具体实现方式。

---

## 规则 2：表单 label 关联

shadcn 有两种使用场景，行为不同：

**场景 A：FormField（配合 react-hook-form）**

`FormLabel` 通过 `FormItem` context 自动关联 `Input`，无需手写 `htmlFor`。

```tsx
<FormField
  control={form.control}
  name="email"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Email</FormLabel> {/* 自动关联，无需 htmlFor */}
      <FormControl>
        <Input {...field} />
      </FormControl>
      <FormMessage />
    </FormItem>
  )}
/>
// ✅ page.getByLabel('Email') 正常工作
```

**场景 B：裸用 Label + Input（无 Form 组件）**

仍需手写 `htmlFor` 与 `id` 绑定：

```tsx
<Label htmlFor="username">用户名</Label>
<Input id="username" />
// ✅ page.getByLabel('用户名') 正常工作
```

---

## 规则 3 & 4：data-testid 透传

shadcn 的 `Button`、`Input`、`Textarea` 等基础组件均使用 `React.forwardRef` + `...props` 展开，`data-testid` 完全透传到底层 DOM。

```tsx
<Button data-testid="settings-save-btn">保存修改</Button>
// 渲染结果：<button data-testid="settings-save-btn" class="inline-flex ...">保存修改</button>
// ✅ page.getByTestId('settings-save-btn') 正常工作
```

---

## Dialog / Sheet 类组件的作用域隔离

shadcn 的 `Dialog`、`Sheet`、`Drawer` 中，触发按钮与内容是分离的，必须在 `DialogContent` 上加 `data-testid` 作为作用域容器：

```tsx
<Dialog>
  <DialogTrigger asChild>
    <Button data-testid="open-confirm-dialog-btn">删除</Button>
  </DialogTrigger>
  <DialogContent data-testid="confirm-dialog">
    {" "}
    {/* ← 容器隔离 */}
    <DialogTitle>确认删除？</DialogTitle>
    <Button data-testid="confirm-delete-btn">确认</Button>
    <Button data-testid="cancel-btn">取消</Button>
  </DialogContent>
</Dialog>
```

```typescript
// Playwright 测试写法
const dialog = page.getByTestId("confirm-dialog");
await dialog.getByTestId("confirm-delete-btn").click();
```

---

## Select / Combobox 组件

shadcn 的 `Select` 基于 Radix UI，下拉选项渲染在 Portal 中（body 末尾），需要通过 `page` 而非父容器定位选项：

```typescript
// 打开 Select
await page.getByRole("combobox", { name: "状态" }).click();

// 选项在 Portal 中，用 page 而非父容器定位
await page.getByRole("option", { name: "已激活" }).click();
```

---

## 可复用组件透传的 TypeScript 类型

shadcn 风格的可复用组件，透传 `data-testid` 的标准写法：

```typescript
// Button 组件
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline';
}

function Button({ children, ...props }: ButtonProps) {
  return <button {...props}>{children}</button>;
}

// 使用时
<Button data-testid="settings-save-btn">保存</Button>
```
