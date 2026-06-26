# SESSIONS.md — Exact Claude Code commands

Run these in order. Each = one branch + one PR.
Copy-paste the entire prompt block into your Claude Code session.
Sessions 1 and 2 can run in parallel (separate terminals).

---

## Session 0 — Scaffold

**Branch:** `chore/scaffold`
**Status:** ✅ DONE — PR #1 open

> This session is complete. Notes below reflect what was actually built.

### What was built

- Next.js 15 + React 18 (stable)
- Tailwind v4 — no `tailwind.config.ts`; content sources declared in `app/globals.css` via `@source` directives
- Zustand, clsx, tailwind-merge, lucide-react, zod
- Vitest 2 + React Testing Library + jsdom (`vitest.config.ts` + `vitest.setup.ts`)
- `lib/cn.ts` utility
- Pre-written `lib/` files already in place (types.ts, calculations.ts, api.ts, data/products.ts)
- Inter font configured in `app/layout.tsx`
- Prettier (`.prettierrc`) enforced as ESLint errors via `eslint-plugin-prettier`
- ESLint flat config (`eslint.config.mjs`) using `FlatCompat` bridge (required because `eslint-config-next@15` ships a legacy config, not a flat array)
- Husky pre-commit → `lint-staged` (ESLint + Prettier on staged `.ts/.tsx` files only)
- Husky pre-push → `typecheck` + full test suite
- GitHub Actions CI (`.github/workflows/ci.yml`): format-check → lint → typecheck → test on every push/PR
- VS Code workspace settings for format-on-save + ESLint auto-fix (`.vscode/settings.json`)

### Key deviations from original spec

1. **Tailwind v4 instead of v3** — `create-next-app` now scaffolds with v4. Step 8 ("Update tailwind.config.ts") does not apply; configuration is in `globals.css` instead.
2. **Extra dev dependencies** beyond the spec: `prettier`, `eslint-config-prettier`, `eslint-plugin-prettier`, `husky`, `lint-staged`, `@eslint/eslintrc`
3. **Extra scripts**: `"lint:fix"`, `"format"`, `"format:check"`, `"prepare": "husky"`
4. **`passWithNoTests: true`** in `vitest.config.ts` — prevents pre-push hook failing before any test files exist
5. **Vitest pinned to v2** — v4 (latest) had a CJS/ESM startup bug on Node 20.17

---

## Session 1 — API Route Handlers

**Branch:** `feat/api-routes`
**Can run in parallel with Session 2**

```
Read CLAUDE.md and specs/01-api-routes.md.

Build:
1. app/api/products/route.ts — GET handler
2. app/api/configs/route.ts — POST handler with in-memory Map + Zod validation
3. app/api/configs/[id]/route.ts — GET by id handler
4. app/api/__tests__/routes.test.ts — all 6 tests from the spec

Important:
- Use NextResponse.json() for all responses
- The configs Map must be exported from route.ts so [id]/route.ts can import it
- Add export const dynamic = 'force-dynamic' to products/route.ts
- Validate POST body with Zod before using it

Run: npm run typecheck && npm run lint && npm run test
Commit: feat: add Route Handlers for products and config persistence
Push feat/api-routes. Open PR.
```

---

## Session 2 — Zustand store + hooks

**Branch:** `feat/store`
**Can run in parallel with Session 1**

```
Read CLAUDE.md and specs/02-store.md.

Build:
1. store/bundleStore.ts — full Zustand store per spec
2. hooks/useBundleStore.ts — four selector hooks:
   useReviewItems(), useTotals(), useSelectedCount(stepIndex), useActiveStepCategory()
   Each calls the corresponding pure function from lib/calculations.ts
3. store/bundleStore.test.ts — all 8 tests from the spec

Run: npm run typecheck && npm run lint && npm run test
Commit: feat: add Zustand store with qty actions and localStorage persistence
Push feat/store. Open PR.
```

---

## Session 3 — QuantityStepper + VariantSelector

**Branch:** `feat/steppers`
**Depends on:** Session 2 merged (needs the store types)

```
Read CLAUDE.md and specs/03-steppers.md.

Build:
1. components/QuantityStepper/QuantityStepper.tsx
2. components/QuantityStepper/index.ts
3. components/QuantityStepper/QuantityStepper.test.tsx — all 6 tests
4. components/VariantSelector/VariantSelector.tsx
5. components/VariantSelector/index.ts

Both components get 'use client' at the top.

Run: npm run typecheck && npm run lint && npm run test
Commit: feat: add QuantityStepper and VariantSelector components
Push feat/steppers. Open PR.
```

---

## Session 4 — ProductCard

**Branch:** `feat/product-card`
**Depends on:** feat/steppers merged

```
Read CLAUDE.md and specs/04-product-card.md.

Build:
1. components/ProductCard/ProductCard.tsx — full implementation
2. components/ProductCard/index.ts
3. components/ProductCard/ProductCard.test.tsx — all 9 tests

Critical rules:
- 'use client' at top
- selectedVariantId in local useState ONLY — not in Zustand
- isSelected computed across ALL variants of the product
- Qty reads from variantQty[productId][selectedVariantId] or singleQty[productId]
- No useState for qty — Zustand only

Run: npm run typecheck && npm run lint && npm run test
Commit: feat: add ProductCard with variant-aware qty binding
Push feat/product-card. Open PR.
```

---

## Session 5 — Accordion

**Branch:** `feat/accordion`
**Depends on:** feat/product-card merged

```
Read CLAUDE.md and specs/05-accordion.md.

Build:
1. components/Accordion/AccordionStep.tsx
2. components/Accordion/Accordion.tsx
3. components/Accordion/index.ts
4. components/Accordion/Accordion.test.tsx — all 5 tests

Both get 'use client'.
Accordion reads categories + activeStep from store.
AccordionStep uses useSelectedCount(stepIndex) from hooks/useBundleStore.ts.
Use lucide-react icons: Camera, Shield, Wifi, Plus, ChevronUp, ChevronDown.

Run: npm run typecheck && npm run lint && npm run test
Commit: feat: add Accordion with step navigation and selected counter
Push feat/accordion. Open PR.
```

---

## Session 6 — ReviewPanel

**Branch:** `feat/review-panel`
**Depends on:** feat/accordion merged

```
Read CLAUDE.md and specs/06-review-panel.md.

Build:
1. components/ReviewPanel/ReviewLineItem.tsx
2. components/ReviewPanel/ReviewPanel.tsx
3. components/ReviewPanel/index.ts
4. components/ReviewPanel/ReviewPanel.test.tsx — all 6 tests

Both get 'use client'.
ReviewPanel uses useReviewItems() and useTotals() from hooks/useBundleStore.ts.
ReviewLineItem steppers call the same store actions as ProductCard steppers.
Import saveConfig from lib/api.ts for the "Save my system" button.
Import formatPrice from lib/calculations.ts.
Use lucide-react: Truck, CheckCircle, CreditCard, ShoppingCart.

Run: npm run typecheck && npm run lint && npm run test
Commit: feat: add ReviewPanel with live totals and synced steppers
Push feat/review-panel. Open PR.
```

---

## Session 7 — Layout + wiring

**Branch:** `feat/layout`
**Depends on:** feat/review-panel merged

```
Read CLAUDE.md and specs/07-layout.md.

Build:
1. components/BundleBuilder/BundleBuilder.tsx — client component shell
2. Update app/page.tsx to render <BundleBuilder />
3. Update app/layout.tsx with Inter font + metadata
4. Update app/globals.css — Tailwind directives only
5. components/BundleBuilder/BundleBuilder.test.tsx — 4 tests

After building, run `npm run dev` and manually verify:
□ Products load (spinner shows briefly, then cards appear)
□ Step 1 is open by default
□ Adding a camera: appears in review panel, total updates
□ Add 2 White cameras, switch to Black: stepper shows 0, White still in panel (×2)
□ Change qty in review panel stepper: card stepper updates instantly
□ Narrow to 375px: single column, panel below accordion
□ Refresh: pre-seeded plan + sensors + keypad are in review panel

Run: npm run typecheck && npm run lint && npm run test && npm run build
Commit: feat: wire layout with responsive design and loading states
Push feat/layout. Open PR.
```

---
