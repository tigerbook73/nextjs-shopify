# Design: Cart Count Refactor

## Overview

Move cart freshness into the existing `CartProvider` boundary so cart-related UI reads from one client-visible cart state. Shopify remains the authoritative cart source: cart mutations should return the updated Shopify cart from the Storefront API payload, and the client should apply that cart directly. A separate refresh path remains available as a fallback or for drawer open hydration, but should not be the default post-mutation path.

`CartIconButton`, `CartDrawer`, `AddToCartButton`, and `CartItem` should coordinate through `CartContext` instead of each component owning a partial view of cart state. The design keeps the cart ID in the existing httpOnly cookie and does not expose the Shopify cart ID secret to client code.

## Step 1: Centralize cart state in CartContext

Introduce shared cart state and refresh/apply actions in `src/context/CartContext.tsx`, seeded from an initial server-rendered count.

Key changes:

- Extend `CartContextValue` with `cart`, `count`, `isRefreshing`, `applyCart`, and `refreshCart`.
- Keep `isOpen`, `openCart`, and `closeCart` behavior unchanged.
- Let `CartProvider` accept an optional `initialCount` prop, defaulting to `0`, so the header can render a server-derived count immediately after hydration.
- Use an explicit client initializer under `CartProvider` if the initial count must still be read from the existing server `CartCount` boundary. Do not rely on a child component implicitly seeding parent provider state.
- Have `applyCart(cart)` update both the stored cart and count from Shopify `cart.totalQuantity`; when passed `null`, reset the cart and count to `0`.
- Have `refreshCart` call `getCartAction()` and then delegate to `applyCart`.
- Ensure refresh failures do not corrupt the last known count; error surfacing can stay minimal unless existing UI patterns require a toast.
- Keep `count` derived from the latest authoritative Shopify cart whenever a cart object is available; avoid independently incrementing/decrementing count as the primary state update.

**Step Type**: `final`

Tests for Step 1 are delegated to Step 2 because the behavior is only observable after UI consumers and mutation handlers are wired to the shared state.

## Auto Verification

- `(auto)` `pnpm typecheck`
- `(auto)` `pnpm lint`

## Manual Verification

- `(manual)` Confirm the app still loads with an empty cart and the header cart button accessible label starts at `Open cart (0 items)`.

## Step 2: Wire cart mutations and UI consumers to shared state

Update cart actions and UI consumers so successful mutations apply Shopify's returned cart directly and the header count follows all quantity changes.

Key changes:

- Extend the cart server action result contract to allow `cart?: Cart | null` in addition to `success` and `error`.
- Update `addToCart`, `removeFromCart`, and `updateCartQuantity` so they return the updated cart from `addCartLines`, `removeCartLines`, and `updateCartLines` / `removeCartLines`.
- Keep returning explicit `success: false` and `error` when Shopify user errors or runtime errors occur. Do not update client cart state from failed action results.
- Treat `warnings` as a follow-up concern only if the lower-level Shopify client exposes them; do not silently discard `userErrors`.
- Change `CartIconButton` to read `count` from `useCart()` instead of receiving a stale prop after hydration.
- Decide implementation placement for initial count explicitly:
  - Preferred: move initial cart count lookup to `RootLayout` and pass `initialCart` (full `Cart | null`) to `CartProvider` rather than just `initialCount`. RootLayout already fetches the cart to derive the count, so passing the full object allows `CartDrawer` to render immediately on first open without a `refreshCart` round-trip. If passing the full cart object forces unacceptable layout data dependencies, fall back to `initialCount` only.
  - Acceptable fallback: keep `CartCount` as a server boundary and add a tiny client initializer component that calls a context setter during hydration.
- Retain `revalidateTag(TAGS.cart)` in all mutation server actions. Its purpose is to invalidate the Next.js cache for the server-rendered `/cart` page; it is not the mechanism for updating client-side drawer or count state (that responsibility belongs to `applyCart`). Do not remove it when wiring up `applyCart`.
- Update `CartDrawer` to render from shared `cart` state. When opened, trigger a background silent refresh (`refreshCart` without showing a loading indicator) unconditionally — not only when `cart` is `null` — so that carts modified in another tab or session are reconciled without blocking the drawer open animation. The existing stale cart renders immediately while the refresh completes in the background.
- Update `AddToCartButton` so a successful `addToCart` result calls `applyCart(result.cart)` and then opens the drawer. If the action returns `success: false`, call `toast.error(result.error)` and do not open the drawer. If the successful result does not include a cart, call `refreshCart` as a fallback. Preserve the success toast and drawer opening behavior.
- Update `CartItem` quantity handlers so successful remove/update mutations call `applyCart(result.cart)`. Keep optimistic quantity UI behavior during the pending action, but on failure restore the previous rendered state by not committing the failed result and by reconciling through `refreshCart` when needed.
- Replace broad `router.refresh()` usage in cart item mutation handlers with targeted context updates unless a page-level refresh is still needed for server-rendered cart page content.
- Add focused Playwright coverage that verifies the header accessible label changes after add, increment/decrement, and remove flows when test Shopify data is available.

**Step Type**: `final`

## Auto Verification

- `(auto)` `pnpm typecheck`
- `(auto)` `pnpm lint`
- `(auto)` `pnpm test:e2e -- tests/e2e/cart-drawer.spec.ts`

E2E tests cover:

- No-cart session starts at `0 items`; first add updates to `1 items`
- Two consecutive adds result in `2 items` (matches Shopify `totalQuantity`)
- Drawer increment → header count increases; drawer decrement → header count decreases
- Add to Cart → drawer opens; backdrop click → drawer closes
- Remove line → header count reaches `0 items`

## Manual Verification

- `(manual)` Verify the cart page and cart drawer still render existing cart lines and totals correctly (price accuracy requires human review against Shopify data).

## Task Acceptance

- `(auto)` `pnpm typecheck`
- `(auto)` `pnpm lint`
- `(auto)` `pnpm test:e2e -- tests/e2e/cart-drawer.spec.ts`
- `(manual)` Verify the cart page and cart drawer still render existing cart lines and totals correctly (price accuracy requires human review against Shopify data).
