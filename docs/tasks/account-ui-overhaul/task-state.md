# Task State: account-ui-overhaul

## Metadata

- type: feature
- status: in_progress

## Document Index

- `requirements.md` — 功能需求、验收标准（FR-1 ~ FR-7，AC-1 ~ AC-7）
- `design.md` — 实现步骤（Step 1 ~ 5）、组件设计、测试计划、Task Acceptance

## Current Phase

implementation (in_progress)

## Current Step

Step 2 done

## Requirements Phase

- status: done
- notes:
  - FR-1 ~ FR-7 完整定义，AC-1 ~ AC-7 含自动化标注
  - 与 main 分支代码对齐后的修订点：avatar 已安装、GET_CUSTOMER_QUERY 需扩展 addresses、FR-7 需 codegen、两处现有 E2E 测试需同步更新

## Design Phase

- status: done
- notes:
  - 5 步骤，依赖顺序：基础设施 → Header/MobileMenu → AccountLayout → AccountOverview → BuyerIdentity

## Implementation Phase

- status: in_progress
- steps:
  - Step 1: shadcn 安装 + FR-1 Footer + FR-6 SignInButton — status: done
    - notes: footer.spec.ts 对齐至 3 区块（去除 Newsletter），product-badges.spec.ts 修复 strict mode violation
  - Step 2: FR-2 Header + FR-3 MobileMenu — status: done
    - notes: UserDropdown (Avatar + DropdownMenu)，Header 改用 SignInButton/UserDropdown，MobileMenu 增 isLoggedIn prop；E2E 更新 Header Auth State suite 和 MobileMenu Auth State suite
  - Step 3: FR-4 Account Layout 重构 — status: pending
  - Step 4: FR-5 Account Overview + Query 扩展 — status: pending
  - Step 5: FR-7 Checkout Buyer Identity — status: pending

## Task Acceptance

- auto-check: —
- manual-check: —
