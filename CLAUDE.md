# CLAUDE.md — Bundle Builder (Next.js 15)

## Project

Frontend take-home: multi-step security system bundle builder.
Two-column layout — 4-step accordion builder (left) + live review panel (right).
Includes the bonus backend via Next.js Route Handlers.

Figma: https://www.figma.com/design/JYf61etQVqeseX7oY5alGz/Frontend-Test-Figma?node-id=68-8088

---

## Stack

- Next.js 15 (App Router)
- React 18 with 'use client' for all interactive components
- TypeScript (strict, no `any`)
- Zustand (client-side state — quantities, active step)
- Tailwind CSS v3 (utilities only, no custom CSS files)
- Vitest + React Testing Library (unit/component tests)
- Prettier + ESLint (Next.js default config)

---

## Project structure

```
bundle-builder/
├── app/
│   ├── layout.tsx                 ← root layout, Inter font, global styles
│   ├── page.tsx                   ← two-column shell, calls store.init()
│   ├── api/
│   │   ├── products/
│   │   │   └── route.ts           ← GET /api/products
│   │   └── configs/
│   │       └── route.ts           ← POST /api/configs, GET /api/configs/[id]
│   └── globals.css
├── components/
│   ├── Accordion/
│   ├── ProductCard/
│   ├── VariantSelector/
│   ├── QuantityStepper/
│   └── ReviewPanel/
├── store/
│   └── bundleStore.ts             ← Zustand store
├── hooks/
│   └── useBundleStore.ts          ← typed selector hooks
├── lib/
│   ├── types.ts                   ← ALL interfaces (shared by app + api)
│   ├── calculations.ts            ← pure functions (totals, selectors)
│   ├── api.ts                     ← fetch wrapper (only file that knows endpoint URLs)
│   └── data/
│       └── products.ts            ← mock seed data (imported by Route Handler only)
├── specs/                         ← read before building anything
└── public/images/                 ← product image placeholders
```

---

## Architecture rules

### 'use client' boundary

Every interactive component gets `'use client'` at the top.
`app/page.tsx` and `app/layout.tsx` are Server Components (no 'use client').
Route Handlers in `app/api/` are server-only — never import Zustand or browser APIs there.

### Data flow

```
Route Handler (app/api/products/route.ts)
  ↓ returns JSON
lib/api.ts (fetch wrapper)
  ↓ returns typed data
store/bundleStore.ts (Zustand, init action)
  ↓ state
hooks/useBundleStore.ts (selectors)
  ↓ values
Components (read-only, no data imports)
```

### Shared types

`lib/types.ts` is imported by BOTH components and Route Handlers.
This is the main advantage of Next.js here — one type definition, zero duplication.

### lib/api.ts is the only file that knows about URLs

Components and the store never call fetch() directly.
All network calls go through lib/api.ts.

---

## Git discipline — follow on every task, no exceptions

### Branching

- `main` is protected. Never commit directly.
- Format: `feat/<slug>` | `fix/<slug>` | `test/<slug>` | `chore/<slug>`
- One branch per spec.

### Commits (Conventional Commits, atomic)

```
feat: add GET /api/products Route Handler
feat: add Accordion with step navigation
fix: clamp QuantityStepper minimum to 0
test: cover variant qty sync between card and review panel
chore: scaffold Next.js 15 with Tailwind and Zustand
```

Run `npm run typecheck && npm run lint && npm run test` before every commit.
Never commit failing checks.

### Pull Requests

- Every branch → PR. Use `.github/PULL_REQUEST_TEMPLATE.md`.
- Title = main commit message.
- Fill every section: What / Why / How tested / Edge cases / Screenshots (UI PRs).
- Do not merge your own PR. Open and stop.

---

## Code rules

### TypeScript

- Strict. No `any`, no `@ts-ignore`.
- All interfaces in `lib/types.ts` only.
- Props interfaces in the component file, named `{Component}Props`.

### State

- Quantities live ONLY in Zustand. No `useState` for qty anywhere.
- `variantQty: Record<productId, Record<variantId, number>>`
- `singleQty: Record<productId, number>`
- `activeStep: number` (1–4)
- `selectedVariantId` per card IS allowed in local useState — it's UI state, not data.

### Components

- Folder per component: `ComponentName/ComponentName.tsx` + `index.ts` barrel.
- Every component: co-located `ComponentName.test.tsx`.
- No prop drilling for quantities — leaf components read directly from Zustand.

### Styling — Tailwind design tokens

- Primary blue: `#1A56DB` → `blue-600`
- Selected card border: `border-2 border-blue-600`
- Default card border: `border border-gray-200`
- Card bg: `bg-white`, `rounded-2xl`, `shadow-sm`
- Card layout: horizontal — `flex flex-row gap-3`, image left (~w-16 h-16), content right
- Step header bg: `bg-gray-50`
- Badge: `bg-indigo-900 text-white text-xs font-semibold` (dark navy — NOT green, corrected from Figma)
- Compare-at price: `text-orange-500 line-through` (NOT gray — corrected from Figma)
- Current price: `text-blue-700 font-semibold`
- Body text: `text-gray-900`, muted: `text-gray-500`
- Font: Inter (next/font/google)

### Route Handlers

- Always return `NextResponse.json()`
- Always validate request body with Zod before using it
- In-memory store for configs (module-level Map) — no database needed
- Return `{ data: T }` for success, `{ error: string }` for errors
- Status codes: 200 OK, 201 Created, 400 Bad Request, 404 Not Found

---

## When you finish a task

1. `npm run typecheck` — clean
2. `npm run lint` — clean
3. `npm run test` — all passing
4. Commit with proper message
5. Push branch
6. Open PR using the template
7. Report: "Done. Branch `feat/xxx`, PR opened. N tests passing."
