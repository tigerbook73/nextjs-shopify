# Requirements: Cart Count Refactor

## Goal

Refactor cart count state handling so the header cart count updates automatically whenever the cart quantity changes, including adding items, removing items, and updating line quantities, while preserving the existing cart drawer behavior and Shopify cart integration.

## Background and Motivation

The current `CartCount` component reads the cart quantity on the server from the `cartId` cookie and renders `CartIconButton` with that value. When cart mutations happen in the client session, such as adding a product, removing a line, or changing a line quantity, the underlying Shopify cart changes but the header cart count can remain stale until a reload or navigation refresh.

This creates stale UI after successful cart mutations. The refactor should align cart count updates with React/Next.js best practices by making the interactive cart UI derive from a single client-visible cart state or refresh path instead of relying only on the initial server-rendered count.

## Scope

- Header cart count rendering and refresh behavior.
- `CartCount` / `CartIconButton` composition.
- Cart client state owned by `CartContext` or a closely related cart state boundary.
- Add-to-cart success flow in `AddToCartButton`.
- Remove-from-cart and update-quantity success flows in cart item interactions.
- Existing cart drawer behavior where relevant to sharing or refreshing cart state after cart mutations.
- Focused automated coverage for cart count updates after add, remove, and quantity-change behavior where practical.

## Out of Scope

- Changing Shopify Storefront API mutations or GraphQL schema.
- Redesigning cart drawer UI, cart page UI, product page UI, or checkout flow.
- Introducing a global state library unless existing code constraints make local React state unsuitable.
- Changing cart cookie naming, checkout URL behavior, pricing calculations, or cart line rendering semantics.
- Broad performance optimization unrelated to cart count freshness.

## Constraints

- Preserve the existing public user behavior for cart mutations: successful add shows the existing toast and opens the cart drawer; remove and quantity update interactions continue to behave as they do today aside from keeping the count fresh.
- Preserve accessibility behavior of the cart icon button, including an accurate item count in the accessible label.
- Do not duplicate cart-fetching and cart-updating logic across unrelated components when a shared state boundary can own it.
- Prefer idiomatic Next.js App Router and React client/server boundaries.
- Server actions must continue to return explicit success/error information and should not hide Shopify user errors.
- The implementation must remain compatible with the existing `CartProvider` usage in `src/app/layout.tsx`.
- Keep the refactor focused; no unrelated visual, copy, or layout changes.

## Acceptance Criteria

- After any successful cart quantity mutation, the header cart count updates automatically in the same page session without requiring a manual page reload.
- Repeated add-to-cart actions increment or otherwise refresh the header count to match Shopify cart `totalQuantity`.
- Removing a cart line decrements or otherwise refreshes the header count to match Shopify cart `totalQuantity`.
- Updating a cart line quantity up or down refreshes the header count to match Shopify cart `totalQuantity`.
- When there is no existing cart, the initial header count remains `0`, and the first successful add updates the displayed count.
- The cart drawer still opens after a successful add-to-cart action.
- The cart icon accessible label reflects the current item count after updates.
- Existing cart page and cart drawer behavior are not regressed.
- Automated checks cover the add/remove/update count refresh paths or, if external Shopify dependencies prevent direct automation, the design documents the smallest reliable manual verification path.
- Type checking and existing lint/prettier checks pass.
